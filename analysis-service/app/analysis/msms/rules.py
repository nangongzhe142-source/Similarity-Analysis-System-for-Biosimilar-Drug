# -*- coding: utf-8
"""V2 Sheet3 rule evaluation for MS/MS sequence-confirmation items."""

from __future__ import annotations

from dataclasses import dataclass

from app.analysis.msms.constants import (
    COVERAGE_DROP_SANITY_PERCENT,
    COVERAGE_INSUFFICIENT_PERCENT,
    COVERAGE_NUMERIC_BOUNDARY_ZH,
    MSMS_ITEM_RULES,
)
from app.models.analysis_contract import (
    AnalysisVerdict,
    LocalizedText,
    RuleEvaluationOutcome,
)


@dataclass(frozen=True)
class RuleDecision:
    outcome: RuleEvaluationOutcome
    verdict: AnalysisVerdict
    rationale: LocalizedText
    verdict_rationale: LocalizedText


def decide_rule_outcome(
    item_id: str,
    *,
    reference_coverage_percent: float,
    candidate_coverage_percent: float,
    confirmed_sequence_difference: bool,
    synthetic_demo: bool,
    comet_used: bool,
) -> RuleDecision:
    metadata = MSMS_ITEM_RULES.get(item_id)
    if metadata is None or not metadata.get("sourceRow"):
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

    coverage_drop = reference_coverage_percent - candidate_coverage_percent
    coverage_insufficient = candidate_coverage_percent < COVERAGE_INSUFFICIENT_PERCENT

    if confirmed_sequence_difference:
        outcome = RuleEvaluationOutcome.FAIL
        verdict = AnalysisVerdict.DIFFERENCE_DETECTED
        rationale_zh = (
            "MS/MS 确认的关键肽段出现候选药与参照药无法共存的序列差异，"
            "应按 Sheet3 进一步定位确认。"
        )
    elif coverage_insufficient or coverage_drop > COVERAGE_DROP_SANITY_PERCENT:
        outcome = RuleEvaluationOutcome.REVIEW
        verdict = AnalysisVerdict.REVIEW
        rationale_zh = (
            "MS/MS 序列覆盖不足或候选药相对参照明显下降，应补充酶切/MS/MS；"
            f"{COVERAGE_INSUFFICIENT_PERCENT:g}% / {COVERAGE_DROP_SANITY_PERCENT:g} 百分点只是 "
            f"algorithmQualityGate，K 列：{COVERAGE_NUMERIC_BOUNDARY_ZH}。"
        )
    else:
        outcome = RuleEvaluationOutcome.PASS
        verdict = AnalysisVerdict.REVIEW
        rationale_zh = (
            "MS/MS 碎片支持理论肽序列，未见需进一步解释的关键序列差异；"
            f"程序规则：{metadata['finalRuleZh']}。"
            f"K 列明确：{COVERAGE_NUMERIC_BOUNDARY_ZH}，算法质量门通过也不构成相似性 PASS。"
        )

    if synthetic_demo or not comet_used:
        verdict = AnalysisVerdict.REVIEW

    return RuleDecision(
        outcome=outcome,
        verdict=verdict,
        rationale=LocalizedText(
            zh=rationale_zh,
            en="MS/MS sequence confirmation rule evaluation based on V2 sheet 3.",
        ),
        verdict_rationale=LocalizedText(
            zh=(
                "合成演示或未接 Comet 搜库，不得作为生物类似性判定依据。"
                if synthetic_demo or not comet_used
                else "基于 Comet 搜库 + FDR 过滤后的 MS/MS 序列确认结果。"
            ),
            en=(
                "Synthetic demo or search engine not used; not a biosimilarity decision basis."
                if synthetic_demo or not comet_used
                else "Result based on Comet search with FDR-controlled PSMs."
            ),
        ),
    )
