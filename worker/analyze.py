"""Deterministic A/B peak comparison and optional UniDec adapter.

This worker never makes a regulatory conclusion. It emits a traceable,
structured screening result for human review.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import math
import shutil
import sys
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def normalize(peaks: list[dict[str, float]]) -> list[dict[str, float]]:
    cleaned = [
        {"mass": float(p["mass"]), "intensity": max(0.0, float(p["intensity"]))}
        for p in peaks
        if math.isfinite(float(p["mass"])) and math.isfinite(float(p["intensity"]))
    ]
    cleaned.sort(key=lambda p: p["mass"])
    return cleaned


def compare_peaks(candidate: list[dict[str, float]], reference: list[dict[str, float]], tolerance_da: float) -> dict[str, Any]:
    candidate = normalize(candidate)
    reference = normalize(reference)
    candidate_max = max((p["intensity"] for p in candidate), default=1.0)
    reference_max = max((p["intensity"] for p in reference), default=1.0)
    unused = set(range(len(reference)))
    matches: list[dict[str, float]] = []

    for c_peak in candidate:
        options = [i for i in unused if abs(reference[i]["mass"] - c_peak["mass"]) <= tolerance_da]
        if not options:
            continue
        best = min(options, key=lambda i: abs(reference[i]["mass"] - c_peak["mass"]))
        unused.remove(best)
        r_peak = reference[best]
        delta_da = c_peak["mass"] - r_peak["mass"]
        c_rel = 100.0 * c_peak["intensity"] / candidate_max
        r_rel = 100.0 * r_peak["intensity"] / reference_max
        matches.append({
            "candidateMass": round(c_peak["mass"], 4),
            "referenceMass": round(r_peak["mass"], 4),
            "deltaDa": round(delta_da, 4),
            "deltaPpm": round(delta_da / r_peak["mass"] * 1_000_000, 3),
            "candidateRelative": round(c_rel, 2),
            "referenceRelative": round(r_rel, 2),
            "abundanceDelta": round(c_rel - r_rel, 2),
        })

    coverage = len(matches) / max(len(candidate), len(reference), 1)
    mean_abundance_difference = (
        sum(abs(m["abundanceDelta"]) for m in matches) / len(matches) if matches else 100.0
    )
    abundance_component = max(0.0, 1.0 - mean_abundance_difference / 100.0)
    screening_score = 100.0 * (0.7 * coverage + 0.3 * abundance_component)
    deltas = [abs(m["deltaDa"]) for m in matches]
    ppms = [abs(m["deltaPpm"]) for m in matches]

    return {
        "score": round(screening_score, 1),
        "summary": {
            "matchedCount": len(matches),
            "candidatePeakCount": len(candidate),
            "referencePeakCount": len(reference),
            "unmatchedCandidateCount": len(candidate) - len(matches),
            "meanAbsDeltaDa": round(sum(deltas) / len(deltas), 4) if deltas else 0,
            "maxAbsDeltaPpm": round(max(ppms), 3) if ppms else 0,
        },
        "matches": matches,
        "candidatePeaks": candidate,
        "referencePeaks": reference,
    }


def run_unidec(path: Path, mass_lower: float, mass_upper: float) -> tuple[list[dict[str, float]], dict[str, Any]]:
    from unidec.engine import UniDec

    ascii_dir = Path(tempfile.gettempdir()) / "biocompare-unidec" / uuid.uuid4().hex
    ascii_dir.mkdir(parents=True, exist_ok=True)
    local_path = ascii_dir / ("spectrum" + path.suffix.lower())
    shutil.copy2(path, local_path)

    original_argv = sys.argv[:]
    try:
        # UniDec inspects global argv during construction. Hide BioCompare CLI
        # arguments so they are not misinterpreted as native UniDec options.
        sys.argv = [original_argv[0]]
        engine = UniDec()
        engine.open_file(local_path.name, str(ascii_dir))
        engine.config.masslb = mass_lower
        engine.config.massub = mass_upper
        engine.process_data()
        engine.run_unidec(silent=True)
        engine.pick_peaks()
        raw_peaks = sorted(engine.pks.peaks, key=lambda peak: float(peak.mass))
        peaks = [{"mass": float(p.mass), "intensity": float(p.height)} for p in raw_peaks]
        trace = {"inputSha256": sha256_file(path), "rSquared": float(engine.config.error)}
        return peaks, trace
    finally:
        sys.argv = original_argv
        shutil.rmtree(ascii_dir, ignore_errors=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    input_path = Path(args.input).resolve()
    output_path = Path(args.output).resolve()
    request = json.loads(input_path.read_text(encoding="utf-8"))
    mode = request.get("mode", "peak-list")
    warnings: list[str] = []
    trace: dict[str, Any] = {"requestSha256": sha256_file(input_path), "mode": mode}

    if mode == "unidec":
        candidate, c_trace = run_unidec(Path(request["candidatePath"]), float(request["massLower"]), float(request["massUpper"]))
        reference, r_trace = run_unidec(Path(request["referencePath"]), float(request["massLower"]), float(request["massUpper"]))
        engine_name = "UniDec"
        engine_version = importlib.metadata.version("unidec")
        trace.update({"candidate": c_trace, "reference": r_trace})
    else:
        candidate = request["candidatePeaks"]
        reference = request["referencePeaks"]
        engine_name = "BioCompare deterministic peak matcher"
        engine_version = "0.1.0"
        warnings.append("当前运行使用已去卷积峰表；上传原始m/z谱时请选择UniDec模式。")

    result = compare_peaks(candidate, reference, float(request.get("toleranceDa", 2.0)))
    result.update({
        "runId": uuid.uuid4().hex[:12],
        "status": "completed",
        "engine": {"name": engine_name, "version": engine_version},
        "methodKey": request.get("methodKey", "intact-mass"),
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "warnings": warnings,
        "trace": trace,
        "disclaimer": "本结果仅用于研发阶段初筛，不构成药学相似性或监管结论；必须结合方法学验证、批次设计和专家复核。",
    })
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
