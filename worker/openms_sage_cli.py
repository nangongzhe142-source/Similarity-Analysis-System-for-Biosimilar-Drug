"""Isolated OpenMS + Sage PTM/MAM workflow adapter.

OpenMS and Sage perform all spectrum/database-search work. BioCompare only
stages inputs, records parameters, converts the professional output contract,
and applies its deterministic multi-lot regulatory comparison layer.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from scripts.sage_to_biocompare_ptm import build_rows, write_table
from worker.ptm_interval import PTMInputError, analyze_ptm_files


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def run_command(command: list[str], cwd: Path, log: list[dict[str, Any]]) -> subprocess.CompletedProcess[str]:
    started = now()
    run = subprocess.run(command, cwd=str(cwd), capture_output=True, text=True, check=False)
    log.append({
        "startedAt": started,
        "finishedAt": now(),
        "command": command,
        "returnCode": run.returncode,
        "stdout": (run.stdout or "")[-12000:],
        "stderr": (run.stderr or "")[-12000:],
    })
    if run.returncode != 0:
        message = (run.stderr or run.stdout or "no diagnostic output")[-1800:]
        raise RuntimeError(f"external command failed with exit code {run.returncode}: {message}")
    return run


def psm_statistics(path: Path) -> dict[str, Any]:
    target = decoy = 0
    minimum_q: float | None = None
    passing_target = 0
    with path.open(encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle, delimiter="\t"):
            if not row.get("psm_id"):
                continue
            label = row.get("label")
            q_value = float(row.get("spectrum_q") or 1)
            minimum_q = q_value if minimum_q is None else min(minimum_q, q_value)
            if label == "1":
                target += 1
                if q_value <= 0.01:
                    passing_target += 1
            elif label == "-1":
                decoy += 1
    return {"targetPsmCount": target, "decoyPsmCount": decoy, "minimumSpectrumQValue": minimum_q, "targetPsmCountAtFdr01": passing_target}


def fasta_has_prefix_decoys(path: Path) -> bool:
    with path.open(encoding="utf-8", errors="replace") as handle:
        return any(line.startswith(">DECOY_") for line in handle)


def fasta_has_suffix_decoys(path: Path) -> bool:
    with path.open(encoding="utf-8", errors="replace") as handle:
        return any(line.startswith(">") and line.split()[0].endswith("_rev") for line in handle)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--reference", action="append", type=Path, required=True)
    parser.add_argument("--candidate", action="append", type=Path, required=True)
    parser.add_argument("--fasta", type=Path, required=True)
    parser.add_argument("--result-dir", type=Path, required=True)
    parser.add_argument("--work-root", type=Path, default=Path(tempfile.gettempdir()) / "BioCompareEngineJobs")
    parser.add_argument("--decoy-database", type=Path, required=True)
    parser.add_argument("--sage-adapter", type=Path, required=True)
    parser.add_argument("--sage", type=Path, required=True)
    parser.add_argument("--openms-data-path", type=Path, required=True)
    parser.add_argument("--interval-method", default="observed-range")
    parser.add_argument("--min-reference-lots", type=int, default=3)
    parser.add_argument("--q-threshold", type=float, default=0.01)
    parser.add_argument("--precursor-tolerance-da", type=float, default=0.05)
    parser.add_argument("--fragment-tolerance-da", type=float, default=0.3)
    parser.add_argument("--threads", type=int, default=4)
    parser.add_argument("--variable-modification", action="append", dest="variable_modifications")
    args = parser.parse_args()

    variable_modifications = args.variable_modifications or [
        "Oxidation (M)", "Deamidated (N)", "Deamidated (Q)",
    ]

    args.result_dir.mkdir(parents=True, exist_ok=True)
    args.work_root.mkdir(parents=True, exist_ok=True)
    stage = Path(tempfile.mkdtemp(prefix="ptm-", dir=args.work_root.resolve()))
    command_log: list[dict[str, Any]] = []
    parameters = {
        "fixedModifications": ["Carbamidomethyl (C)"],
        "variableModifications": variable_modifications,
        "precursorToleranceDa": args.precursor_tolerance_da,
        "fragmentToleranceDa": args.fragment_tolerance_da,
        "qValueThreshold": args.q_threshold,
        "intervalMethod": args.interval_method,
        "minReferenceLots": args.min_reference_lots,
        "threads": args.threads,
    }
    try:
        input_dir = stage / "input"
        sage_dir = stage / "sage"
        input_dir.mkdir(); sage_dir.mkdir()
        reference_files: list[Path] = []
        candidate_files: list[Path] = []
        for index, source in enumerate(args.reference, start=1):
            target = input_dir / f"reference-{index:03d}.mzML"
            shutil.copy2(source, target); reference_files.append(target)
        for index, source in enumerate(args.candidate, start=1):
            target = input_dir / f"candidate-{index:03d}.mzML"
            shutil.copy2(source, target); candidate_files.append(target)
        target_fasta = input_dir / "target.fasta"
        shutil.copy2(args.fasta, target_fasta)
        target_decoy = input_dir / "target-decoy.fasta"
        if fasta_has_prefix_decoys(target_fasta):
            shutil.copy2(target_fasta, target_decoy)
        else:
            if fasta_has_suffix_decoys(target_fasta):
                raise ValueError("FASTA contains _rev suffix decoys, which SageAdapter does not support; provide target-only FASTA or DECOY_ prefix decoys")
            run_command([
                str(args.decoy_database), "-in", str(target_fasta), "-out", str(target_decoy),
                "-decoy_string", "DECOY_", "-decoy_string_position", "prefix",
                "-method", "reverse", "-enzyme", "Trypsin", "-no_progress",
            ], stage, command_log)

        idxml = sage_dir / "openms-sage-fdr01.idXML"
        all_mzml = reference_files + candidate_files
        command = [
            str(args.sage_adapter), "-in", *[str(path) for path in all_mzml],
            "-out", str(idxml), "-database", str(target_decoy),
            "-sage_executable", str(args.sage), "-decoy_prefix", "DECOY_",
            "-fixed_modifications", "Carbamidomethyl (C)",
            "-variable_modifications", *variable_modifications,
            "-precursor_tol_left", str(-args.precursor_tolerance_da),
            "-precursor_tol_right", str(args.precursor_tolerance_da), "-precursor_tol_unit", "Da",
            "-fragment_tol_left", str(-args.fragment_tolerance_da),
            "-fragment_tol_right", str(args.fragment_tolerance_da), "-fragment_tol_unit", "Da",
            "-q_value_threshold", str(args.q_threshold), "-threads", str(args.threads),
            "-reindex", "true", "-PeptideIndexing:missing_decoy_action", "warn", "-no_progress",
        ]
        os.environ["OPENMS_DATA_PATH"] = str(args.openms_data_path)
        os.environ["OPENMS_DISABLE_UPDATE_CHECK"] = "ON"
        run_command(command, stage, command_log)

        sage_tsv = sage_dir / "results.sage.tsv"
        if not sage_tsv.is_file():
            raise RuntimeError("SageAdapter completed without results.sage.tsv")
        stats = psm_statistics(sage_tsv)
        run_rows = build_rows(sage_tsv, target_fasta, args.q_threshold)
        reference_table = args.result_dir / "reference-ptm.csv"
        candidate_table = args.result_dir / "candidate-ptm.csv"
        write_table(reference_table, run_rows, [(f"R{index:02d}", path.name) for index, path in enumerate(reference_files, 1)])
        write_table(candidate_table, run_rows, [(f"C{index:02d}", path.name) for index, path in enumerate(candidate_files, 1)])

        shutil.copy2(sage_tsv, args.result_dir / "results.sage.tsv")
        shutil.copy2(idxml, args.result_dir / "openms-sage-fdr01.idXML")
        workflow = {
            "engine": "OpenMS + Sage", "generatedAt": now(), "parameters": parameters,
            "psmStatistics": stats,
            "referenceRunCount": len(reference_files), "candidateRunCount": len(candidate_files),
            "commands": command_log,
            "processingBoundary": "OpenMS/Sage perform spectrum search and FDR; BioCompare performs output adaptation and multi-lot interval marking.",
        }
        try:
            comparison = analyze_ptm_files(reference_table, candidate_table, args.interval_method, args.min_reference_lots)
            outcome = "completed"
        except PTMInputError as error:
            outcome = "quality_blocked"
            comparison = None
            workflow["qualityGate"] = {
                "passed": False,
                "message": str(error),
                "requiredSpectrumQValue": args.q_threshold,
                "quantifiedSiteRecordCountPassing": sum(len(rows) for rows in run_rows.values()),
            }
        payload: dict[str, Any] = {
            "outcome": outcome,
            "externalWorkflow": workflow,
            "comparison": comparison,
            "artifacts": ["reference-ptm.csv", "candidate-ptm.csv", "results.sage.tsv", "openms-sage-fdr01.idXML", "workflow.json"],
            "disclaimer": "This technical output does not constitute a biosimilarity or regulatory conclusion.",
        }
        (args.result_dir / "workflow.json").write_text(json.dumps(workflow, ensure_ascii=False, indent=2), encoding="utf-8")
        (args.result_dir / "openms-sage-result.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        print(json.dumps({"outcome": outcome, "psmStatistics": stats}, ensure_ascii=False))
        return 0
    finally:
        shutil.rmtree(stage, ignore_errors=True)


if __name__ == "__main__":
    raise SystemExit(main())
