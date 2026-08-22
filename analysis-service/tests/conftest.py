# -*- coding: utf-8 -*-

from __future__ import annotations

import pytest

from app.config import Settings, reset_settings_cache


@pytest.fixture
def test_settings(tmp_path) -> Settings:
    reset_settings_cache()
    return Settings(
        host="127.0.0.1",
        port=8765,
        workspace_root=tmp_path / "workspaces",
        max_concurrent_jobs=1,
        cors_origins=["http://localhost:3000"],
        job_timeout_seconds=30,
        allow_stub_adapter=True,
    )
