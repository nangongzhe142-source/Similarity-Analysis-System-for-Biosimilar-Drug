"""Short, deterministic result explanations for review screens and exports."""

from __future__ import annotations

from typing import Any


def mass_brief_explanation(result: dict[str, Any]) -> str:
    summary = result.get("summary", {})
    matched = summary.get("matchedCount", 0)
    unmatched = summary.get("unmatchedCandidateCount", 0)
    ppm = summary.get("maxAbsDeltaPpm", "—")
    attention = f"另有{unmatched}个候选药峰未匹配，需复核归因。" if unmatched else "当前峰表未标记候选药未匹配峰。"
    return f"当前参数下匹配{matched}个质量峰，最大绝对质量偏差为{ppm} ppm。{attention}本摘要不构成相似性结论。"


def ptm_brief_explanation(result: dict[str, Any]) -> str:
    summary = result.get("summary", {})
    outside = summary.get("outsideIntervalCount", 0)
    novel = summary.get("candidateOnlyVariantCount", 0)
    warnings = summary.get("integrityWarningCount", 0)
    return (
        f"本次逐位点比对标记区间外结果{outside}项、候选药特有修饰变体{novel}项、数据完整性提示{warnings}项。"
        "请结合原始结果和方法学证据人工审阅；工具不自动给出相似或不相似结论。"
    )
