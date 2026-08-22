# -*- coding: utf-8 -*-

from __future__ import annotations

from app.api.errors import error_body, sanitize_message


def test_sanitize_message_strips_windows_paths() -> None:
    cleaned = sanitize_message(r"failed at D:\secret\path\file.mzML")
    assert r"D:\secret" not in cleaned
    assert "<path>" in cleaned


def test_error_body_uses_safe_message_only() -> None:
    payload = error_body(
        code="INTERNAL_ERROR",
        message=r"boom at C:\server\workspaces\job.json",
        zh="服务错误",
        en="Service error",
        status_code=500,
    )
    assert r"C:\server" not in payload["error"]["message"]
    assert payload["error"]["safeMessage"]["zh"] == "服务错误"
