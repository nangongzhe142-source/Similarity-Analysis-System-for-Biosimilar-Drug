# -*- coding: utf-8 -*-
"""Runtime configuration for the analysis service."""

from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

SERVICE_ROOT = Path(__file__).resolve().parents[1]


def _split_csv(value: str) -> list[str]:
    return [part.strip() for part in value.split(",") if part.strip()]


@dataclass(frozen=True)
class Settings:
    host: str
    port: int
    workspace_root: Path
    max_concurrent_jobs: int
    cors_origins: list[str]
    job_timeout_seconds: int
    allow_stub_adapter: bool

    @classmethod
    def from_env(cls) -> "Settings":
        workspace = Path(
            os.environ.get("WORKSPACE_ROOT", str(SERVICE_ROOT / "workspaces"))
        ).resolve()
        return cls(
            host=os.environ.get("ANALYSIS_SERVICE_HOST", "0.0.0.0"),
            port=int(os.environ.get("ANALYSIS_SERVICE_PORT", "8765")),
            workspace_root=workspace,
            max_concurrent_jobs=int(os.environ.get("MAX_CONCURRENT_JOBS", "2")),
            cors_origins=_split_csv(
                os.environ.get("CORS_ORIGINS", "http://localhost:3000")
            ),
            job_timeout_seconds=int(os.environ.get("JOB_TIMEOUT_SECONDS", "3600")),
            allow_stub_adapter=os.environ.get("ANALYSIS_ALLOW_STUB_ADAPTER", "").lower()
            in {"1", "true", "yes"},
        )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings.from_env()


def reset_settings_cache() -> None:
    get_settings.cache_clear()
