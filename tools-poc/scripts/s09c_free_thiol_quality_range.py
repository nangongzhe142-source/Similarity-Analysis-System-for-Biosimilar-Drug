"""S09c — 游离巯基质量范围（quality range）判定链路可行性验证

对应框架分析点（src/data/characterization-items.ts）：
    free-thiol   游离巯基水平   （第 994 行）

检测指标（第 1014 行）：mol SH/mol protein 或相对荧光/含量
相似性评价方法（第 1018 行）：定量 QR/实际范围
数值限度原文（第 1026 行）：
    「无通用于所有品种的统一数值限度；可按风险采用质量范围法：
      QR=(μR−XσR, μR+XσR)；X需按属性风险论证；
      足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。」

这是本大类中**唯一**输入为纯数值、判定规则在框架中已完整写出、
且不依赖任何质谱原始文件的分析点，因此选作端到端判定链路的演示。

【为什么是自研而不是调用开源工具】
  本轮调研（2026-08-14）未找到任何维护中的、可直接用于生物类似药 quality range
  判定的开源工具。唯一相关的 R 包 nicoballarini/tailTest（1 star，
  最后提交 2019-04-17，仓库无许可证文件）不满足准入要求。
  详见 docs/tool-survey/01-primary-structure.md 的缺口分析章节。
  因此本判定逻辑由 numpy/scipy 自行实现，约 100 行，无外部领域依赖。

【三种区间必须严格区分，不得互相替代】
  quality range (QR) : μR ± X·σR，**描述性**区间，刻画参照药批次的经验散布；
  置信区间 (CI)      : 对参照药**总体均值**这一参数的推断区间；
  容许区间 (TI)      : 以给定置信度覆盖参照药总体中给定比例**个体**的区间。
  三者宽度与含义都不同，本脚本同时计算三者以显示其差异。

【数据性质声明】
  全部批次数值为 **合成数据**，不是任何真实产品的实测结果。
  理论游离巯基数取自 UniProt P02769 注释（35 个半胱氨酸 − 17×2 = 1 个游离巯基），
  仅用于给合成数据一个物理上合理的中心值。
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from scipy import stats

OUTPUT_DIR = Path(__file__).resolve().parents[1] / "output"

# 质量范围参数。X=3 是 FDA 历史上常用的取值，框架要求「X 需按属性风险论证」，
# 此处取 3 仅为演示，不构成对任何具体属性的风险论证。
QUALITY_RANGE_SIGMA_MULTIPLIER = 3.0
# 框架原文「足够批次（如90%以上）落入」。
MIN_WITHIN_RANGE_FRACTION = 0.90

CONFIDENCE_LEVEL = 0.95
# 容许区间：以 95% 置信度覆盖参照药总体中 99% 的个体。
TOLERANCE_INTERVAL_COVERAGE = 0.99

# 合成批次数据参数。中心值取 BSA 注释推算的 1 个游离巯基/分子。
THEORETICAL_FREE_THIOL_PER_MOLECULE = 1.0
REFERENCE_LOT_COUNT = 20
REFERENCE_TRUE_MEAN = 0.92
REFERENCE_TRUE_SD = 0.055
CANDIDATE_LOT_COUNT = 12
RANDOM_SEED = 20260814

# 第二个候选药情景：均值明显偏高，用于验证判定逻辑能够给出「不支持相似」的结论。
# 若一个判定脚本对任何输入都返回通过，它就没有判定能力。
SHIFTED_CANDIDATE_MEAN_OFFSET = 0.18


def two_sided_tolerance_factor(sample_size: int, coverage: float, confidence: float) -> float:
    """正态双侧容许区间因子 k2，Howe (1969) 近似。

    与 quality range 的 X 是完全不同的量：k2 随样本量变化，X 是人为设定的常数。
    """
    z_coverage = stats.norm.ppf(0.5 + coverage / 2.0)
    chi_square_quantile = stats.chi2.ppf(1.0 - confidence, sample_size - 1)
    correction = (sample_size - 1) * (1.0 + 1.0 / sample_size) * z_coverage**2
    return float(np.sqrt(correction / chi_square_quantile))


def evaluate_candidate(candidate_values: np.ndarray, lower: float, upper: float) -> dict:
    within_mask = (candidate_values >= lower) & (candidate_values <= upper)
    within_count = int(within_mask.sum())
    within_fraction = within_count / len(candidate_values)
    return {
        "lotCount": len(candidate_values),
        "values": [round(float(value), 4) for value in candidate_values],
        "mean": round(float(candidate_values.mean()), 4),
        "sd": round(float(candidate_values.std(ddof=1)), 4),
        "withinRangeCount": within_count,
        "withinRangeFraction": round(within_fraction, 4),
        "meetsThreshold": within_fraction >= MIN_WITHIN_RANGE_FRACTION,
        "outOfRangeValues": [round(float(value), 4) for value in candidate_values[~within_mask]],
    }


def main() -> int:
    rng = np.random.default_rng(RANDOM_SEED)

    print("=== 步骤 1：生成参照药批次数据（合成数据）===")
    reference_values = rng.normal(REFERENCE_TRUE_MEAN, REFERENCE_TRUE_SD, REFERENCE_LOT_COUNT)
    reference_mean = float(reference_values.mean())
    reference_sd = float(reference_values.std(ddof=1))
    print(f"理论游离巯基数（UniProt P02769 注释推算）: {THEORETICAL_FREE_THIOL_PER_MOLECULE} mol SH/mol protein")
    print(f"参照药批次数 nR = {REFERENCE_LOT_COUNT}")
    print(f"  μR = {reference_mean:.4f} mol SH/mol protein")
    print(f"  σR = {reference_sd:.4f}")
    print(f"  实际范围 = [{reference_values.min():.4f}, {reference_values.max():.4f}]")

    print("\n=== 步骤 2：计算三种区间（必须严格区分）===")
    quality_range_lower = reference_mean - QUALITY_RANGE_SIGMA_MULTIPLIER * reference_sd
    quality_range_upper = reference_mean + QUALITY_RANGE_SIGMA_MULTIPLIER * reference_sd
    quality_range_width = quality_range_upper - quality_range_lower

    standard_error = reference_sd / np.sqrt(REFERENCE_LOT_COUNT)
    t_critical = stats.t.ppf(0.5 + CONFIDENCE_LEVEL / 2.0, REFERENCE_LOT_COUNT - 1)
    confidence_lower = reference_mean - t_critical * standard_error
    confidence_upper = reference_mean + t_critical * standard_error

    tolerance_factor = two_sided_tolerance_factor(
        REFERENCE_LOT_COUNT, TOLERANCE_INTERVAL_COVERAGE, CONFIDENCE_LEVEL
    )
    tolerance_lower = reference_mean - tolerance_factor * reference_sd
    tolerance_upper = reference_mean + tolerance_factor * reference_sd

    print(f"  质量范围 QR (μR ± {QUALITY_RANGE_SIGMA_MULTIPLIER}σR)")
    print(f"      = [{quality_range_lower:.4f}, {quality_range_upper:.4f}]，宽度 {quality_range_width:.4f}")
    print(f"      含义：参照药批次经验散布的描述性区间，不是统计推断区间。")
    print(f"  {CONFIDENCE_LEVEL:.0%} 置信区间 CI（针对总体均值）")
    print(f"      = [{confidence_lower:.4f}, {confidence_upper:.4f}]，"
          f"宽度 {confidence_upper - confidence_lower:.4f}")
    print(f"      含义：对参照药真实均值的推断，比 QR 窄得多，"
          f"**不可**用来判断单个候选药批次是否落入。")
    print(f"  {CONFIDENCE_LEVEL:.0%}/{TOLERANCE_INTERVAL_COVERAGE:.0%} 容许区间 TI（k2={tolerance_factor:.4f}）")
    print(f"      = [{tolerance_lower:.4f}, {tolerance_upper:.4f}]，"
          f"宽度 {tolerance_upper - tolerance_lower:.4f}")
    print(f"      含义：以 {CONFIDENCE_LEVEL:.0%} 置信度覆盖参照药总体中 "
          f"{TOLERANCE_INTERVAL_COVERAGE:.0%} 的个体批次。")
    print(f"  三者宽度比 QR : CI : TI = 1 : "
          f"{(confidence_upper - confidence_lower) / quality_range_width:.3f} : "
          f"{(tolerance_upper - tolerance_lower) / quality_range_width:.3f}")

    print("\n=== 步骤 3：候选药批次落入判定 ===")
    similar_candidate = rng.normal(REFERENCE_TRUE_MEAN, REFERENCE_TRUE_SD, CANDIDATE_LOT_COUNT)
    shifted_candidate = rng.normal(
        REFERENCE_TRUE_MEAN + SHIFTED_CANDIDATE_MEAN_OFFSET, REFERENCE_TRUE_SD, CANDIDATE_LOT_COUNT
    )

    scenarios = {}
    for name, values in (("similar", similar_candidate), ("shifted", shifted_candidate)):
        evaluation = evaluate_candidate(values, quality_range_lower, quality_range_upper)
        scenarios[name] = evaluation
        verdict = "支持该属性相似" if evaluation["meetsThreshold"] else "不支持该属性相似"
        print(f"  情景 [{name}] nT={evaluation['lotCount']}，均值 {evaluation['mean']}，"
              f"SD {evaluation['sd']}")
        print(f"      落入 QR: {evaluation['withinRangeCount']}/{evaluation['lotCount']} = "
              f"{evaluation['withinRangeFraction']:.1%}"
              f"（阈值 {MIN_WITHIN_RANGE_FRACTION:.0%}）→ {verdict}")
        if evaluation["outOfRangeValues"]:
            print(f"      超出 QR 的批次值: {evaluation['outOfRangeValues']}")

    # 判定逻辑本身是否有效：相似情景应通过，偏移情景应不通过。
    logic_valid = scenarios["similar"]["meetsThreshold"] and not scenarios["shifted"]["meetsThreshold"]
    print(f"\n  [{'PASS' if logic_valid else 'FAIL'}] 判定逻辑具有区分能力"
          f"（相似情景通过、偏移情景不通过）")

    print("\n=== 步骤 4：方法学局限（必须与结论一同呈现）===")
    limitations = [
        f"X={QUALITY_RANGE_SIGMA_MULTIPLIER} 未经风险论证。框架第 1026 行明确要求"
        "「X 需按属性风险论证」，本演示直接取 3 只是沿用惯例。",
        "μR 与 σR 由 20 个合成批次估计，参照药批次数越少，QR 越不稳定，"
        "σR 被低估会使 QR 过窄、把相似产品误判为不相似。",
        "已发表文献（Mielke et al., AAPS J 2019；以及 AAPS J 2022 关于 bootstrapping "
        "检验的报道）指出，3SD 这类简单范围检验对第一类错误的控制存在缺陷。"
        "本演示实现的是框架 numericLimit 中写明的算法，不代表该算法在统计上最优。"
        "[该文献结论来自摘要，未逐篇精读，标为未完全验证]",
        "框架同时要求「比较均值、SD 和分布」，本演示只实现了落入比例判定，"
        "均值与 SD 已计算但未做正式比较，分布比较未实现。",
        "全部批次数值为合成数据，任何结论都不具有产品意义。",
    ]
    for index, item in enumerate(limitations, start=1):
        print(f"  {index}. {item}")

    report = {
        "script": Path(__file__).name,
        "runAt": datetime.now(timezone.utc).isoformat(),
        "frameworkItems": ["free-thiol"],
        "detectionIndicator": "mol SH/mol protein",
        "similarityMethod": "定量 QR/实际范围",
        "numericLimitSource": "src/data/characterization-items.ts:1026",
        "tools": [
            {"name": "numpy", "version": np.__version__, "role": "描述统计与区间计算"},
            {"name": "scipy", "version": __import__("scipy").__version__, "role": "t 分布与卡方分位数"},
        ],
        "openSourceToolFound": False,
        "openSourceToolNote": (
            "本轮调研未找到维护中的、可直接用于生物类似药 quality range 判定的开源工具；"
            "判定逻辑为自研实现。"
        ),
        "dataSource": {
            "lotValues": "synthetic-demo",
            "theoreticalFreeThiol": "public-uniprot-annotation",
            "note": "批次数值为合成数据，不是任何真实产品的实测结果，不得用于相似性判定。",
        },
        "reference": {
            "lotCount": REFERENCE_LOT_COUNT,
            "values": [round(float(value), 4) for value in reference_values],
            "meanMuR": round(reference_mean, 4),
            "sdSigmaR": round(reference_sd, 4),
            "observedMin": round(float(reference_values.min()), 4),
            "observedMax": round(float(reference_values.max()), 4),
        },
        "intervals": {
            "qualityRange": {
                "definition": "μR ± X·σR，描述性区间",
                "sigmaMultiplierX": QUALITY_RANGE_SIGMA_MULTIPLIER,
                "lower": round(quality_range_lower, 4),
                "upper": round(quality_range_upper, 4),
                "width": round(quality_range_width, 4),
            },
            "confidenceInterval": {
                "definition": "对参照药总体均值的推断区间，不可用于单批次落入判定",
                "level": CONFIDENCE_LEVEL,
                "lower": round(confidence_lower, 4),
                "upper": round(confidence_upper, 4),
                "width": round(confidence_upper - confidence_lower, 4),
            },
            "toleranceInterval": {
                "definition": "以给定置信度覆盖总体中给定比例个体的区间（Howe 1969 近似）",
                "confidence": CONFIDENCE_LEVEL,
                "coverage": TOLERANCE_INTERVAL_COVERAGE,
                "k2Factor": round(tolerance_factor, 4),
                "lower": round(tolerance_lower, 4),
                "upper": round(tolerance_upper, 4),
                "width": round(tolerance_upper - tolerance_lower, 4),
            },
        },
        "minWithinRangeFraction": MIN_WITHIN_RANGE_FRACTION,
        "candidateScenarios": scenarios,
        "decisionLogicDiscriminates": logic_valid,
        "limitations": limitations,
        "deploymentLevelClaimed": "L4" if logic_valid else "L3",
        "deploymentLevelRationale": (
            "输入输出与框架项目 free-thiol 的检测指标与 numericLimit 中写明的 QR 公式"
            "直接对应，且判定逻辑在相似与偏移两种情景下给出相反结论，具备区分能力，"
            "故判定 L4。未接入前端，未达 L5。"
        ),
        "disclaimer": (
            "工具能运行不等于方法学已验证，更不等于符合 GxP / 21 CFR Part 11。"
            "本链路使用合成批次数据，数值落入质量范围不等于生物类似性成立。"
        ),
    }

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / "s09c_free_thiol_quality_range.json"
    output_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\n判定部署层级: {report['deploymentLevelClaimed']}")
    print(f"输出: {output_path}")
    return 0 if logic_valid else 1


if __name__ == "__main__":
    sys.exit(main())
