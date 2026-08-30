"""OpenMS FLASHDeconv command-line adapter for BioCompare mass jobs."""

from __future__ import annotations

import argparse
import csv
import json
import subprocess
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.external_engines import engine_status, resolve_executable
from worker.analyze import compare_peaks, sha256_file


def read_spectrum_tsv(path: Path, lower: float, upper: float) -> list[dict[str, float]]:
    aggregate: dict[float, float] = {}
    with path.open("r", encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream, delimiter="\t")
        if not reader.fieldnames:
            raise RuntimeError(f"FLASHDeconv 输出缺少表头：{path.name}")
        lookup = {name.lower().replace("_", ""): name for name in reader.fieldnames}
        mass_key = next((lookup[key] for key in ("monoisotopicmass", "averagemass", "mass") if key in lookup), None)
        intensity_key = next((lookup[key] for key in ("sumintensity", "intensity", "abundance") if key in lookup), None)
        if not mass_key or not intensity_key:
            raise RuntimeError(f"FLASHDeconv 输出字段无法解析：{', '.join(reader.fieldnames)}")
        for row in reader:
            try:
                mass = float(row[mass_key]); intensity = float(row[intensity_key])
            except (TypeError, ValueError):
                continue
            if lower <= mass <= upper and intensity > 0:
                bucket = round(mass, 3)
                aggregate[bucket] = aggregate.get(bucket, 0.0) + intensity
    return [{"mass": mass, "intensity": intensity} for mass, intensity in sorted(aggregate.items())]


def run_one(binary: str, source: Path, output: Path, threads: int) -> list[str]:
    command = [binary, "-in", str(source), "-out", str(output.with_suffix(".features.tsv")),
               "-out_spec1", str(output), "-threads", str(threads), "-no_progress"]
    run = subprocess.run(command, cwd=str(output.parent), capture_output=True, text=True, check=False)
    if run.returncode != 0:
        raise RuntimeError(f"FLASHDeconv退出码{run.returncode}：{(run.stderr or run.stdout)[-1800:]}")
    if not output.is_file() or output.stat().st_size == 0:
        raise RuntimeError("FLASHDeconv未生成MS1去卷积TSV")
    return command


def main() -> int:
    parser = argparse.ArgumentParser(description="Run FLASHDeconv for a BioCompare A/B mass comparison")
    parser.add_argument("--candidate", required=True); parser.add_argument("--reference", required=True)
    parser.add_argument("--output", required=True); parser.add_argument("--method", required=True)
    parser.add_argument("--tolerance-da", type=float, default=2.0)
    parser.add_argument("--mass-lower", type=float, default=10000.0); parser.add_argument("--mass-upper", type=float, default=250000.0)
    parser.add_argument("--threads", type=int, default=1)
    args = parser.parse_args()
    binary = resolve_executable("flashdeconv")
    if not binary:
        parser.error("FLASHDeconv executable not found; set FLASHDECONV_BIN or OPENMS_BIN_DIR")
    candidate_path = Path(args.candidate).resolve(); reference_path = Path(args.reference).resolve()
    output_path = Path(args.output).resolve(); output_path.parent.mkdir(parents=True, exist_ok=True)
    candidate_tsv = output_path.parent / "candidate-flashdeconv-ms1.tsv"
    reference_tsv = output_path.parent / "reference-flashdeconv-ms1.tsv"
    c_command = run_one(binary, candidate_path, candidate_tsv, max(1, args.threads))
    r_command = run_one(binary, reference_path, reference_tsv, max(1, args.threads))
    candidate = read_spectrum_tsv(candidate_tsv, args.mass_lower, args.mass_upper)
    reference = read_spectrum_tsv(reference_tsv, args.mass_lower, args.mass_upper)
    if not candidate or not reference:
        raise RuntimeError("FLASHDeconv未在指定质量范围内产生可比较峰")
    result = compare_peaks(candidate, reference, args.tolerance_da)
    status = engine_status("flashdeconv")
    result.update({
        "runId": uuid.uuid4().hex[:12], "status": "completed",
        "engine": {"name": "OpenMS FLASHDeconv", "version": status["version"] or "unknown"},
        "methodKey": args.method, "generatedAt": datetime.now(timezone.utc).isoformat(), "warnings": [],
        "trace": {"mode": "flashdeconv-cli", "binary": binary,
                  "candidateInputSha256": sha256_file(candidate_path), "referenceInputSha256": sha256_file(reference_path),
                  "candidateCommand": c_command, "referenceCommand": r_command,
                  "candidateOutput": candidate_tsv.name, "referenceOutput": reference_tsv.name},
        "disclaimer": "本结果仅客观呈现专业引擎输出和候选药/参照药差异，不自动形成生物类似性结论。",
    })
    output_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
