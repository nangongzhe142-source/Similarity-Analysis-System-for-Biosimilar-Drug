"""BioCompare UniDec command-line adapter.

This module deliberately runs as a separate process. The web service invokes it
with explicit input/output arguments, enforces a timeout, and consumes only the
JSON output contract written here.
"""

from __future__ import annotations

import argparse
import importlib.metadata
import json
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from worker.analyze import compare_peaks, run_unidec


def main() -> int:
    parser = argparse.ArgumentParser(description="Run UniDec for an A/B comparison")
    parser.add_argument("--candidate", required=True)
    parser.add_argument("--reference", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--method", required=True)
    parser.add_argument("--tolerance-da", type=float, default=2.0)
    parser.add_argument("--mass-lower", type=float, default=10000.0)
    parser.add_argument("--mass-upper", type=float, default=250000.0)
    args = parser.parse_args()

    candidate_path = Path(args.candidate).resolve()
    reference_path = Path(args.reference).resolve()
    output_path = Path(args.output).resolve()
    for path in (candidate_path, reference_path):
        if not path.is_file():
            parser.error(f"input file does not exist: {path}")
    if args.mass_lower >= args.mass_upper:
        parser.error("mass-lower must be less than mass-upper")

    print("[BioCompare] UniDec CLI adapter started", flush=True)
    candidate, candidate_trace = run_unidec(candidate_path, args.mass_lower, args.mass_upper)
    print(f"[BioCompare] candidate peaks: {len(candidate)}", flush=True)
    reference, reference_trace = run_unidec(reference_path, args.mass_lower, args.mass_upper)
    print(f"[BioCompare] reference peaks: {len(reference)}", flush=True)

    result = compare_peaks(candidate, reference, args.tolerance_da)
    result.update({
        "runId": uuid.uuid4().hex[:12],
        "status": "completed",
        "engine": {"name": "UniDec CLI adapter", "version": importlib.metadata.version("unidec")},
        "methodKey": args.method,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "warnings": [],
        "trace": {
            "mode": "unidec-cli",
            "commandContract": "worker/unidec_cli.py --candidate --reference --output --method --tolerance-da --mass-lower --mass-upper",
            "candidate": candidate_trace,
            "reference": reference_trace,
        },
        "disclaimer": "本结果仅用于研发阶段初筛，不构成药学相似性或监管结论；必须结合方法学验证、批次设计和专家复核。",
    })
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[BioCompare] result written: {output_path}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
