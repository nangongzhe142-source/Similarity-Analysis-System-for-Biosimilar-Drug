# -*- coding: utf-8 -*-
"""V2 Sheet3 rule evaluation for intact / subunit mass items."""

from __future__ import annotations

from dataclasses import dataclass

from app.analysis.intact_mass.constants import (
    MASS_RECOVERY_TOLERANCE_DA,
    MIN_DECONVOLUTION_R_SQUARED,
)
from app.models.analysis_contract import (
    AnalysisVerdict,
    LocalizedText,
    RuleEvaluationOutcome,
    ThresholdKind,
)

MASS_ITEM_RULES: dict[str, dict[str, object]] = {
    "intact-mass": {
        "ruleId": "intact-mass-sheet3-row2",
        "sourceRow": 2,
        "sourceCells": ["G2", "N2"],
        "finalRuleZh": "对应+准确度合格+无异常→PASS；异常→REVIEW；确认关键结构差异→FAIL",
    },
    "deglycosylated-intact-mass": {
        "ruleId": "deglycosylated-intact-mass-sheet3-row3",
        "sourceRow": 3,
        "sourceCells": ["G3", "N3"],
        "finalRuleZh": "对应+准确度合格+无异常→PASS；异常→REVIEW；确认关键结构差异→FAIL",
    },
    "light-chain-mass": {
        "ruleId": "light-chain-mass-sheet3-row4",
        "sourceRow": 4,
        "sourceCells": ["G4", "N4"],
        "finalRuleZh": "对应+准确度合格+无异常→PASS；异常→REVIEW；确认关键结构差异→FAIL",
    },
    "non-deglycosylated-heavy-chain-mass": {
        "ruleId": "non-deglycosylated-heavy-chain-mass-sheet3-row5",
        "sourceRow": 5,
        "sourceCells": ["G5", "N5"],
        "finalRuleZh": "主要形式对应+准确度合格+无异常→PASS；差异→REVIEW；确认关键结构差异→FAIL",
    },
    "deglycosylated-heavy-chain-mass": {
        "ruleId": "deglycosylated-heavy-chain-mass-sheet3-row6",
        "sourceRow": 6,
        "sourceCells": ["G6", "N6"],
        "finalRuleZh": "主要形式对应+准确度合格+无异常→PASS；差异→REVIEW；确认关键结构差异→FAIL",
    },
}

NUMERIC_BOUNDARY_ZH = (
    "无统一相似性数值限度；实测质量与理论质量偏差应符合方法特异预设的质量准确度标准"
)

MASS_RECOVERY_GATE_KIND = ThresholdKind.ALGORITHM_QUALITY_GATE


@dataclass(frozen=True)
class MassRecoveryCheck:
    label: str
    truth_mass_da: float
    recovered_mass_da: float
    deviation_da: float
    deviation_ppm: float
    passed: bool
    evaluable: bool = True


@dataclass(frozen=True)
class HeadToHeadShift:
    observed_shift_da: float
    introduced_shift_da: float | None
    shift_error_da: float
    attributable_to_known_modification: bool


@dataclass(frozen=True)
class RuleDecision:
    outcome: RuleEvaluationOutcome
    verdict: AnalysisVerdict
    rationale: LocalizedText
    verdict_rationale: LocalizedText


def evaluate_mass_recovery(
    label: str,
    truth_mass_da: float,
    recovered_mass_da: float,
) -> MassRecoveryCheck:
    deviation_da = recovered_mass_da - truth_mass_da
    deviation_ppm = 1e6 * deviation_da / truth_mass_da
    passed = abs(deviation_da) <= MASS_RECOVERY_TOLERANCE_DA
    return MassRecoveryCheck(
        label=label,
        truth_mass_da=truth_mass_da,
        recovered_mass_da=recovered_mass_da,
        deviation_da=round(deviation_da, 4),
        deviation_ppm=round(deviation_ppm, 2),
        passed=passed,
        evaluable=True,
    )


def evaluate_head_to_head_shift(
    candidate_mass_da: float,
    reference_mass_da: float,
    introduced_shift_da: float | None = None,
) -> HeadToHeadShift:
    observed_shift_da = candidate_mass_da - reference_mass_da
    shift_error_da = 0.0 if introduced_shift_da is None else observed_shift_da - introduced_shift_da
    attributable = (
        introduced_shift_da is not None
        and abs(shift_error_da) <= MASS_RECOVERY_TOLERANCE_DA
    )
    return HeadToHeadShift(
        observed_shift_da=round(observed_shift_da, 4),
        introduced_shift_da=introduced_shift_da,
        shift_error_da=round(shift_error_da, 4),
        attributable_to_known_modification=attributable,
    )


def deconvolution_is_reliable(r_squared: float | None) -> bool:
    """A deconvolution whose fit is below the floor cannot support a mass claim."""
    return r_squared is not None and r_squared >= MIN_DECONVOLUTION_R_SQUARED


def decide_rule_outcome(
    item_id: str,
    *,
    recovery_checks: list[MassRecoveryCheck],
    head_to_head: HeadToHeadShift,
    synthetic_demo: bool,
    deconvolution_reliable: bool = True,
    disulfide_known: bool = True,
) -> RuleDecision:
    metadata = MASS_ITEM_RULES.get(item_id)
    if metadata is None:
        return RuleDecision(
            outcome=RuleEvaluationOutcome.RULE_NOT_DEFINED,
            verdict=AnalysisVerdict.RULE_NOT_DEFINED,
            rationale=LocalizedText(
                zh="该项目在 V2 Sheet3 中无程序规则。",
                en="No programmable rule is defined for this item in V2 sheet 3.",
            ),
            verdict_rationale=LocalizedText(
                zh="规则未定义，需人工复核。",
                en="Rule not defined; human review required.",
            ),
        )

    if not deconvolution_reliable:
        return RuleDecision(
            outcome=RuleEvaluationOutcome.REVIEW,
            verdict=AnalysisVerdict.REVIEW,
            rationale=LocalizedText(
                zh=(
                    "去卷积拟合质量低于可接受下限（UniDec R² < "
                    f"{MIN_DECONVOLUTION_R_SQUARED}），该谱图未解析出可靠的单一电荷包络，"
                    "因此不输出实测质量结论，需人工复核输入谱图是否为完整/亚基质量谱。"
                    f"该下限是 algorithmQualityGate，不是相似性限度。"
                ),
                en=(
                    "Deconvolution fit fell below the acceptable floor (UniDec R-squared < "
                    f"{MIN_DECONVOLUTION_R_SQUARED}); no reliable single charge envelope was "
                    "resolved, so no measured-mass conclusion is issued. This floor is an "
                    "algorithmQualityGate, not a similarity boundary."
                ),
            ),
            verdict_rationale=LocalizedText(
                zh="去卷积不可靠，不构成质量一致或不一致的证据。",
                en="Unreliable deconvolution; this is evidence of neither mass agreement nor disagreement.",
            ),
        )

    if not disulfide_known:
        return RuleDecision(
            outcome=RuleEvaluationOutcome.REVIEW,
            verdict=AnalysisVerdict.REVIEW,
            rationale=LocalizedText(
                zh=(
                    "二硫键数目为 unknown，不能把实测质量与氧化态理论质量作准确度核对；"
                    f"K 列明确：{NUMERIC_BOUNDARY_ZH}。"
                    "不得默认 BSA 的 17 对二硫键。"
                ),
                en=(
                    "The disulfide count is unknown, so recovered mass cannot be checked "
                    "against an oxidised theoretical mass. BSA's 17 disulfides are not assumed."
                ),
            ),
            verdict_rationale=LocalizedText(
                zh="二硫键未知，质量准确度无法评价，转人工复核。",
                en="Disulfide count unknown; mass accuracy cannot be evaluated.",
            ),
        )

    accuracy_ok = all(check.evaluable and check.passed for check in recovery_checks)
    has_unexplained_shift = (
        head_to_head.introduced_shift_da is None
        and abs(head_to_head.observed_shift_da) > MASS_RECOVERY_TOLERANCE_DA
    )
    has_explainable_shift = head_to_head.attributable_to_known_modification

    # Invented numeric gates (5 Da) may only force REVIEW. Sheet3 K forbids using
    # them as a similarity PASS/FAIL boundary, so a clean recovery still routes
    # to REVIEW rather than SUPPORTED_BY_THIS_ATTRIBUTE.
    if not accuracy_ok:
        outcome = RuleEvaluationOutcome.REVIEW
        rationale_zh = (
            "实测回收质量与理论质量的偏差超出去卷积质量轴分箱容差"
            f"（{MASS_RECOVERY_TOLERANCE_DA} Da，algorithmQualityGate），"
            "应按 Sheet3 要求复核方法准确度；"
            f"K 列明确：{NUMERIC_BOUNDARY_ZH}。"
        )
    elif has_unexplained_shift:
        outcome = RuleEvaluationOutcome.REVIEW
        rationale_zh = (
            "候选药与参照药之间存在尚未归因的质量差异，需进一步结构鉴定；"
            "ΔDa/Δppm 不作为相似性合格线。"
        )
    elif has_explainable_shift:
        outcome = RuleEvaluationOutcome.PASS
        rationale_zh = (
            "主要分子形式可对应，去卷积回收落在算法质量门内，观察到的质量差可归因于已知修饰；"
            f"程序规则：{metadata['finalRuleZh']}。"
            f"K 列明确：{NUMERIC_BOUNDARY_ZH}，因此不把算法质量门写成相似性 PASS。"
        )
    else:
        outcome = RuleEvaluationOutcome.PASS
        rationale_zh = (
            "主要分子形式可对应，去卷积回收落在算法质量门内，未见需进一步解释的异常新峰；"
            f"程序规则：{metadata['finalRuleZh']}。"
            f"K 列明确：{NUMERIC_BOUNDARY_ZH}，因此不把算法质量门写成相似性 PASS。"
        )

    return RuleDecision(
        outcome=outcome,
        verdict=AnalysisVerdict.REVIEW,
        rationale=LocalizedText(
            zh=rationale_zh,
            en="Mass rule evaluation based on V2 sheet 3; ΔDa/Δppm are method-accuracy metrics only.",
        ),
        verdict_rationale=LocalizedText(
            zh=(
                "合成演示数据，不得作为生物类似性判定依据。"
                if synthetic_demo
                else "Sheet3 K 列无统一相似性数值限度；算法质量门通过也不构成相似性 PASS。"
            ),
            en=(
                "Synthetic demo data; not a biosimilarity decision basis."
                if synthetic_demo
                else "Sheet 3 column K states no universal similarity limit; passing an algorithm quality gate is not a similarity PASS."
            ),
        ),
    )
