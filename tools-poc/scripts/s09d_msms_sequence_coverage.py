#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Thin CLI wrapper around the shared MS/MS pipeline (P9 / s09d lineage)."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

SERVICE_ROOT = Path(__file__).resolve().parents[2] / "analysis-service"
sys.path.insert(0, str(SERVICE_ROOT))

from app.analysis.msms.pipeline import run_comet_uploaded, run_synthetic_demo  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="MS/MS sequence coverage (P9 shared module)")
    parser.add_argument("--synthetic", action="store_true", help="Run BSA synthetic demo")
    parser.add_argument("--fasta", type=Path, help="Protein FASTA for Comet mode")
    parser.add_argument("--candidate-mzml", type=Path, help="Candidate mzML/MGF")
    parser.add_argument("--reference-mzml", type=Path, help="Optional reference mzML/MGF")
    parser.add_argument("--item-id", default="msms-sequence-coverage")
    args = parser.parse_args()

    if args.synthetic or not (args.fasta and args.candidate_mzml):
        pipeline = run_synthetic_demo(item_id=args.item_id)
    else:
        pipeline = run_comet_uploaded(
            item_id=args.item_id,
            sequence_path=args.fasta,
            reference_spectra_path=args.reference_mzml,
            candidate_spectra_path=args.candidate_mzml,
        )

    payload = {
        "referenceCoveragePercent": pipeline.reference_coverage.coverage_percent,
        "candidateCoveragePercent": pipeline.candidate_coverage.coverage_percent,
        "referencePsmCount": pipeline.reference_psm_count,
        "candidatePsmCount": pipeline.candidate_psm_count,
        "substitutionPosition": pipeline.substitution_position,
        "sequenceDifferenceDetected": pipeline.sequence_difference_detected,
        "cometUsed": pipeline.comet_used,
        "syntheticDemo": pipeline.synthetic_demo,
        "verdict": pipeline.decision.verdict.value,
    }
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
