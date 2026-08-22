"""S09a — 完整分子质量分析链路可行性验证

Thin wrapper around analysis-service/app/analysis/intact_mass (P7 单一实现源)。
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
SERVICE_ROOT = SCRIPT_DIR.parents[1] / "analysis-service"
sys.path.insert(0, str(SERVICE_ROOT))

from app.analysis.intact_mass.deconvolution import unidec_version  # noqa: E402
from app.analysis.intact_mass.pipeline import run_synthetic_demo  # noqa: E402
from app.analysis.intact_mass.theory import pyopenms_version  # noqa: E402


OUTPUT_DIR = SCRIPT_DIR.parent / "output"


def main() -> int:
    pipeline = run_synthetic_demo(item_id="intact-mass")

    truth_mass = round(pipeline.theoretical.oxidized_average_mass_da, 2)
    candidate_truth = round(truth_mass + (pipeline.introduced_shift_da or 0.0), 2)

    report = {
        "script": Path(__file__).name,
        "runAt": datetime.now(timezone.utc).isoformat(),
        "frameworkItems": [
            "intact-mass",
            "deglycosylated-intact-mass",
            "light-chain-mass",
            "non-deglycosylated-heavy-chain-mass",
            "deglycosylated-heavy-chain-mass",
        ],
        "tools": [
            {"name": "pyOpenMS", "version": pyopenms_version(), "role": "理论质量计算"},
            {"name": "UniDec", "version": unidec_version(), "role": "电荷态去卷积"},
        ],
        "dataSource": {
            "sequence": "public-uniprot",
            "spectra": "synthetic-demo",
            "note": "谱图为由理论质量正演生成的合成数据，不是任何真实测量结果，不得用于相似性判定。",
        },
        "theoreticalMasses": {
            "reducedAverageMassDa": pipeline.theoretical.reduced_average_mass_da,
            "reducedMonoisotopicMassDa": pipeline.theoretical.reduced_monoisotopic_mass_da,
            "disulfideCount": pipeline.theoretical.disulfide_count,
            "disulfideMassLossDa": pipeline.theoretical.disulfide_mass_loss_da,
            "oxidizedAverageMassDa": pipeline.theoretical.oxidized_average_mass_da,
        },
        "deconvolution": {
            "reference": {
                "basePeakMassDa": pipeline.reference_deconvolution.base_peak_mass_da,
                "rSquared": pipeline.reference_deconvolution.r_squared,
                "peakCount": pipeline.reference_deconvolution.peak_count,
            },
            "candidate": {
                "basePeakMassDa": pipeline.candidate_deconvolution.base_peak_mass_da,
                "rSquared": pipeline.candidate_deconvolution.r_squared,
                "peakCount": pipeline.candidate_deconvolution.peak_count,
            },
        },
        "massRecoveryChecks": [
            {
                "label": check.label,
                "truthMassDa": check.truth_mass_da,
                "recoveredMassDa": check.recovered_mass_da,
                "deviationDa": check.deviation_da,
                "deviationPpm": check.deviation_ppm,
                "passed": check.passed,
            }
            for check in pipeline.recovery_checks
        ],
        "headToHeadShift": {
            "observedShiftDa": pipeline.head_to_head.observed_shift_da,
            "introducedShiftDa": pipeline.introduced_shift_da,
            "shiftErrorDa": pipeline.head_to_head.shift_error_da,
            "attributableToKnownGlycoform": pipeline.head_to_head.attributable_to_known_modification,
        },
        "allPassed": all(check.passed for check in pipeline.recovery_checks)
        and pipeline.head_to_head.attributable_to_known_modification,
        "deploymentLevelClaimed": "L4",
    }

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / "s09a_intact_mass_chain.json"
    output_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"truth={truth_mass} candidate_truth={candidate_truth}")
    print(f"reference_peak={pipeline.reference_deconvolution.base_peak_mass_da}")
    print(f"candidate_peak={pipeline.candidate_deconvolution.base_peak_mass_da}")
    print(f"output: {output_path}")
    return 0 if report["allPassed"] else 1


if __name__ == "__main__":
    sys.exit(main())
