# -*- coding: utf-8 -*-
"""Analysis adapter interface. Real implementations land in P7–P10."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from app.models.analysis_contract import AnalysisJobSnapshot, AnalysisResult


@dataclass(frozen=True)
class AdapterContext:
    job: AnalysisJobSnapshot
    workspace: Path
    parameters: dict[str, Any]


class AnalysisAdapter(ABC):
    profile: str

    @abstractmethod
    async def run(self, context: AdapterContext) -> AnalysisResult:
        raise NotImplementedError


class AdapterNotImplementedError(RuntimeError):
    """Raised when no adapter exists for the requested profile."""


class IncompleteUploadError(RuntimeError):
    """User uploaded files that this profile cannot analyse; never substitute a demo."""


def raise_if_incomplete_upload(complete: bool, manifest: object) -> None:
    if complete:
        return
    candidate_files = getattr(manifest, "candidate_files", [])
    reference_files = getattr(manifest, "reference_files", [])
    sequence_files = getattr(manifest, "sequence_files", [])
    if candidate_files or reference_files or sequence_files:
        raise IncompleteUploadError(
            "uploaded files are incomplete for this profile; synthetic demo is not substituted"
        )
