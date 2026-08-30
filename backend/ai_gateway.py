"""AI report gateway with a deterministic, evidence-only fallback."""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from datetime import datetime, timezone
from typing import Any


def evidence_summary(result: dict[str, Any]) -> dict[str, Any]:
    summary = result["summary"]
    findings = [
        f"A药检出 {summary['candidatePeakCount']} 个质量峰，B药检出 {summary['referencePeakCount']} 个质量峰。",
        f"在当前容差内匹配 {summary['matchedCount']} 个峰，A药未匹配峰 {summary['unmatchedCandidateCount']} 个。",
        f"匹配峰平均绝对质量差为 {summary['meanAbsDeltaDa']} Da，最大绝对偏差为 {summary['maxAbsDeltaPpm']} ppm。",
    ]
    risks: list[str] = []
    if summary["unmatchedCandidateCount"]:
        risks.append("存在未匹配的候选药质量峰，需要结合信噪比、加合物、糖型或其他修饰进一步归因。")
    if summary["matchedCount"] == 0:
        risks.append("当前参数下未获得匹配峰，应检查输入数据、质量搜索范围和去卷积参数。")
    if not risks:
        risks.append("当前峰表未见明显未匹配峰，但仍需使用真实批次、方法学验证和正交方法复核。")
    return {
        "title": "A药与B药质谱初步分析摘要",
        "summary": f"本次运行获得研发筛查分 {result['score']}。该分值仅用于界面排序和研发初筛，不是相似性判定界值。",
        "keyFindings": findings,
        "risks": risks,
        "conclusion": "现有数据可用于形成初步质量峰对照，不能单独支持药学相似或不相似结论。",
    }


def call_openai_compatible(result: dict[str, Any], base_report: dict[str, Any]) -> tuple[str, str]:
    api_key = os.getenv("AI_API_KEY", "").strip()
    model = os.getenv("AI_MODEL", "").strip()
    if not api_key or not model:
        raise RuntimeError("AI_API_KEY 或 AI_MODEL 未配置")

    base_url = os.getenv("AI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    endpoint = f"{base_url}/chat/completions"
    compact_result = {
        "methodKey": result.get("methodKey"),
        "engine": result.get("engine"),
        "score": result.get("score"),
        "summary": result.get("summary"),
        "matches": result.get("matches", [])[:30],
        "warnings": result.get("warnings", []),
    }
    prompt = (
        "你是生物类似药CMC质谱数据报告助手。只能依据输入JSON，不得补造实验条件、峰、阈值或监管结论。"
        "请用中文生成300字以内的专业摘要，依次写：数据概况、主要差异、异常/风险、建议复核事项。"
        "明确注明这是研发初筛结果。\n\n"
        + json.dumps({"analysis": compact_result, "verifiedFacts": base_report}, ensure_ascii=False)
    )
    body = json.dumps({
        "model": model,
        "temperature": 0.1,
        "messages": [
            {"role": "system", "content": "仅基于提供的数据进行客观总结，不作监管结论。"},
            {"role": "user", "content": prompt},
        ],
    }).encode("utf-8")
    req = urllib.request.Request(
        endpoint,
        data=body,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")[:500]
        raise RuntimeError(f"模型接口返回 HTTP {error.code}: {detail}") from error
    return str(payload["choices"][0]["message"]["content"]).strip(), model


def generate_report(result: dict[str, Any]) -> dict[str, Any]:
    report = evidence_summary(result)
    warnings: list[str] = []
    try:
        narrative, model = call_openai_compatible(result, report)
        source = "ai-model"
        provider = os.getenv("AI_BASE_URL", "https://api.openai.com/v1")
    except Exception as error:
        narrative = "；".join(report["keyFindings"] + report["risks"])
        model = "deterministic-evidence-summary"
        source = "rules-fallback"
        provider = "local"
        warnings.append(f"未调用外部大模型：{error}")

    report.update({
        "narrative": narrative,
        "source": source,
        "provider": provider,
        "model": model,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "warnings": warnings,
        "disclaimer": "AI或规则摘要仅重述计算结果，不替代原始数据、方法学验证、专家复核或监管判断。",
    })
    return report
