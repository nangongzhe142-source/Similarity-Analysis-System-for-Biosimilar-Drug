# -*- coding: utf-8 -*-
"""V2 Sheet3 rule evaluation for MS1 sequence-coverage items."""

from __future__ import annotations

from dataclasses import dataclass

from app.analysis.ms1_coverage.constants import (
    COVERAGE_NUMERIC_BOUNDARY_ZH,
    COVERAGE_DROP_SANITY_PERCENT,
    DEMO_COVERAGE_SANITY_PERCENT,
    MS1_CANNOT_REPLACE_MSMS_ZH,
)
from app.models.analysis_contract import (
    AnalysisVerdict,
    LocalizedText,
    RuleEvaluationOutcome,
)

MS1_ITEM_RULES: dict[str, dict[str, object]] = {
    "ms1-sequence-coverage": {
        "ruleId": "ms1-sequence-coverage-sheet3-row7",
        "sourceRow": 7,
        "sourceCells": ["G7", "N7"],
        "finalRuleZh": "覆盖充分+肽段匹配+无序列异常→PASS；覆盖不足→REVIEW；确认关键序列差异→FAIL",
    },
    "cdr-signature-peptides": {
        "ruleId": "cdr-signature-peptides-rule-not-defined",
        "sourceRow": 0,
        "sourceCells": [],
        "finalRuleZh": "",
    },
    "n-c-terminal-sequence": {
        "ruleId": "n-c-terminal-sequence-rule-not-defined",
        "sourceRow": 0,
        "sourceCells": [],
        "finalRuleZh": "",
    },
}


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
    unexplained_sequence_anomaly: bool,
    synthetic_demo: bool,
) -> RuleDecision:
    metadata = MS1_ITEM_RULES.get(item_id)
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
    coverage_insufficient = reference_coverage_percent < DEMO_COVERAGE_SANITY_PERCENT

    if unexplained_sequence_anomaly:
        outcome = RuleEvaluationOutcome.REVIEW
        verdict = AnalysisVerdict.REVIEW
        rationale_zh = (
            "候选药相对参照序列出现尚未解释的肽段匹配缺口，需进一步 MS/MS 结构鉴定；"
            f"{MS1_CANNOT_REPLACE_MSMS_ZH} "
            f"K 列明确：{COVERAGE_NUMERIC_BOUNDARY_ZH}，"
            "覆盖率百分比不得当作生物类似性数值合格线。"
        )
    elif coverage_insufficient or coverage_drop > COVERAGE_DROP_SANITY_PERCENT:
        outcome = RuleEvaluationOutcome.REVIEW
        verdict = AnalysisVerdict.REVIEW
        rationale_zh = (
            "序列覆盖不足或候选药覆盖率相对参照药明显下降，应按 Sheet3 要求补充酶切/质谱分析；"
            f"{DEMO_COVERAGE_SANITY_PERCENT:g}% / {COVERAGE_DROP_SANITY_PERCENT:g} 百分点只是 "
            f"algorithmQualityGate，K 列：{COVERAGE_NUMERIC_BOUNDARY_ZH}。"
        )
    else:
        outcome = RuleEvaluationOutcome.PASS
        verdict = AnalysisVerdict.REVIEW
        rationale_zh = (
            "肽段质量匹配充分，序列覆盖未见需进一步解释的新增缺口；"
            f"程序规则：{metadata['finalRuleZh']}。"
            f" {MS1_CANNOT_REPLACE_MSMS_ZH}"
            f" K 列明确：{COVERAGE_NUMERIC_BOUNDARY_ZH}，算法质量门通过也不构成相似性 PASS。"
        )

    if synthetic_demo:
        verdict = AnalysisVerdict.REVIEW

    return RuleDecision(
        outcome=outcome,
        verdict=verdict,
        rationale=LocalizedText(
            zh=rationale_zh,
            en="MS1 coverage rule evaluation based on V2 sheet 3; coverage % is not a pass/fail threshold.",
        ),
        verdict_rationale=LocalizedText(
            zh=(
                "合成演示数据，不得作为生物类似性判定依据。"
                if synthetic_demo
                else "基于 MS1 肽段质量匹配与覆盖率的结果。"
            ),
            en=(
                "Synthetic demo data; not a biosimilarity decision basis."
                if synthetic_demo
                else "Result based on MS1 peptide mass matching and coverage."
            ),
        ),
    )
