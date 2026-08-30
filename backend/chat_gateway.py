"""Streaming chat gateway for the workspace AI assistant."""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Any, Iterator

SYSTEM_PROMPT = (
    "你是 BioCompare 生物类似药药学比对工作台内置的 AI 助手，面向 CMC 审评与研发场景。"
    "请用中文回答，保持专业、简洁、结构清晰。"
    "你不掌握当前页面的实时数据：涉及具体数据结论时，提醒用户以页面内各专项引擎的计算结果为准；"
    "不替代监管审评结论，不编造实验数据、法规条款或文献。"
)

MAX_MESSAGES = 30
MAX_MESSAGE_CHARS = 2000
MAX_CONTEXT_CHARS = 2000
REQUEST_TIMEOUT_SECONDS = 120


class ChatGatewayError(RuntimeError):
    """Raised with a user-presentable message."""


def ensure_configured() -> None:
    api_key = os.getenv("AI_API_KEY", "").strip()
    model = os.getenv("AI_MODEL", "").strip()
    if not api_key or not model:
        raise ChatGatewayError("AI 助手未配置：请在 .env.local 中设置 AI_API_KEY 与 AI_MODEL，然后重启后端。")


def normalize_messages(raw_messages: list[dict[str, Any]], context_summary: str = "") -> list[dict[str, str]]:
    if not isinstance(raw_messages, list) or not raw_messages:
        raise ChatGatewayError("消息列表不能为空。")
    trimmed = raw_messages[-MAX_MESSAGES:]
    context = str(context_summary or "").strip()[:MAX_CONTEXT_CHARS]
    context_instruction = (
        "\n\n以下是当前项目页面提供的压缩上下文。回答涉及项目数据时，必须引用上下文中的专项编号；"
        "如果上下文没有支持问题所需的数据，请明确说明‘当前上下文不包含该数据’，不要推测。\n"
        f"【当前项目上下文】\n{context}"
        if context
        else "\n\n当前页面没有提供项目结果上下文。涉及项目数据时，请明确说明‘当前上下文不包含该数据’。"
    )
    messages: list[dict[str, str]] = [{"role": "system", "content": SYSTEM_PROMPT + context_instruction}]
    for item in trimmed:
        role = str(item.get("role", ""))
        content = str(item.get("content", "")).strip()
        if role not in {"user", "assistant"} or not content:
            continue
        messages.append({"role": role, "content": content[:MAX_MESSAGE_CHARS]})
    if len(messages) <= 1 or messages[-1]["role"] != "user":
        raise ChatGatewayError("最后一条有效消息必须是用户消息。")
    return messages


def stream_chat_reply(messages: list[dict[str, str]]) -> Iterator[str]:
    api_key = os.getenv("AI_API_KEY", "").strip()
    model = os.getenv("AI_MODEL", "").strip()
    if not api_key or not model:
        raise ChatGatewayError("AI 助手未配置：请在 .env.local 中设置 AI_API_KEY 与 AI_MODEL，然后重启后端。")
    base_url = os.getenv("AI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    body = json.dumps({
        "model": model,
        "temperature": 0.3,
        "stream": True,
        "messages": messages,
    }).encode("utf-8")
    request = urllib.request.Request(
        f"{base_url}/chat/completions",
        data=body,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        response = urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT_SECONDS)
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")[:300]
        raise ChatGatewayError(f"模型接口返回 HTTP {error.code}: {detail}") from error
    except urllib.error.URLError as error:
        raise ChatGatewayError(f"无法连接模型服务: {error.reason}") from error

    with response:
        for raw_line in response:
            line = raw_line.decode("utf-8", errors="replace").strip()
            if not line.startswith("data:"):
                continue
            payload = line[5:].strip()
            if payload == "[DONE]":
                break
            try:
                delta = json.loads(payload)["choices"][0]["delta"].get("content")
            except (KeyError, IndexError, AttributeError, json.JSONDecodeError):
                continue
            if delta:
                yield delta
