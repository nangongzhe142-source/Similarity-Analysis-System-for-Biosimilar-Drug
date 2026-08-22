"""S09b — 肽图与序列覆盖率分析链路可行性验证

Thin wrapper around analysis-service/app/analysis/ms1_coverage (P8 单一实现源)。
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
SERVICE_ROOT = SCRIPT_DIR.parents[1] / "analysis-service"
sys.path.insert(0, str(SERVICE_ROOT))

from app.analysis.intact_mass.theory import pyopenms_version  # noqa: E402
from app.analysis.ms1_coverage.pipeline import run_synthetic_demo  # noqa: E402

OUTPUT_DIR = SCRIPT_DIR.parent / "output"


def main() -> int:
    pipeline = run_synthetic_demo(item_id="ms1-sequence-coverage")

    report = {
        "script": Path(__file__).name,
        "runAt": datetime.now(timezone.utc).isoformat(),
        "frameworkItems": ["ms1-sequence-coverage", "msms-sequence-coverage", "cdr-signature-peptides"],
        "detectionIndicator": "覆盖率%、匹配肽段、肽图",
        "judgingPrinciple": "氨基酸序列原则上应与参照药相同；不得出现未经解释的氨基酸替换。",
        "tools": [{"name": "pyOpenMS", "version": pyopenms_version(), "role": "体外酶切与肽段质量计算"}],
        "dataSource": {
            "sequence": "public-uniprot",
            "observedMasses": "synthetic-demo",
            "note": "实测母离子质量列表为合成数据，不是任何真实测量结果，不得用于相似性判定。",
        },
        "reference": {
            "theoreticalPeptideCount": pipeline.reference_coverage.theoretical_peptide_count,
            "matchedPeptideCount": pipeline.reference_coverage.matched_peptide_count,
            "unmatchedPeptideCount": pipeline.reference_coverage.unmatched_peptide_count,
            "coveredResidueCount": pipeline.reference_coverage.covered_residue_count,
            "sequenceLength": pipeline.reference_coverage.sequence_length,
            "coveragePercent": pipeline.reference_coverage.coverage_percent,
            "unmatchedPeptides": [
                {"sequence": p.sequence, "start": p.start, "end": p.end}
                for p in pipeline.reference_coverage.unmatched_peptides
            ],
        },
        "candidate": {
            "theoreticalPeptideCount": pipeline.candidate_coverage.theoretical_peptide_count,
            "matchedPeptideCount": pipeline.candidate_coverage.matched_peptide_count,
            "unmatchedPeptideCount": pipeline.candidate_coverage.unmatched_peptide_count,
            "coveredResidueCount": pipeline.candidate_coverage.covered_residue_count,
            "sequenceLength": pipeline.candidate_coverage.sequence_length,
            "coveragePercent": pipeline.candidate_coverage.coverage_percent,
            "unmatchedPeptides": [
                {"sequence": p.sequence, "start": p.start, "end": p.end}
                for p in pipeline.candidate_coverage.unmatched_peptides
            ],
        },
        "substitution": {
            "position": pipeline.substitution_position,
            "detected": pipeline.substitution_detected,
        },
        "allPassed": pipeline.substitution_detected
        and pipeline.reference_coverage.coverage_percent >= 80.0,
        "deploymentLevelClaimed": "L4",
        "limitations": [
            "本链路只做 MS1 母离子质量匹配，未做 MS/MS 碎片离子序列确认；"
            "MS1 质量匹配不能替代 MS/MS 序列确认。",
        ],
    }

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / "s09b_peptide_map_coverage.json"
    output_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"reference coverage={pipeline.reference_coverage.coverage_percent}%")
    print(f"candidate coverage={pipeline.candidate_coverage.coverage_percent}%")
    print(f"substitution detected={pipeline.substitution_detected}")
    print(f"output: {output_path}")
    return 0 if report["allPassed"] else 1


if __name__ == "__main__":
    sys.exit(main())
