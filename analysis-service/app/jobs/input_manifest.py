# -*- coding: utf-8 -*-
"""Per-job input manifest stored beside job.json in the workspace."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.analysis_contract import AnalysisInputFileDescriptor, LocalizedText
from app.security.paths import job_workspace


class JobInputManifest(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    candidate_label: str = Field(alias="candidateLabel")
    reference_label: str = Field(alias="referenceLabel")
    pairing_description: LocalizedText = Field(alias="pairingDescription")
    is_head_to_head_biosimilar_design: bool = Field(alias="isHeadToHeadBiosimilarDesign")
    parameters: dict[str, Any] = Field(default_factory=dict)
    candidate_files: list[AnalysisInputFileDescriptor] = Field(
        default_factory=list, alias="candidateFiles"
    )
    reference_files: list[AnalysisInputFileDescriptor] = Field(
        default_factory=list, alias="referenceFiles"
    )
    sequence_files: list[AnalysisInputFileDescriptor] = Field(
        default_factory=list, alias="sequenceFiles"
    )


def manifest_path(workspace: Path) -> Path:
    return workspace / "input-manifest.json"


def save_manifest(workspace_root: Path, job_id: str, manifest: JobInputManifest) -> None:
    workspace = job_workspace(workspace_root, job_id)
    manifest_path(workspace).write_text(
        manifest.model_dump_json(by_alias=True, indent=2) + "\n",
        encoding="utf-8",
    )


def load_manifest(workspace_root: Path, job_id: str) -> JobInputManifest:
    workspace = job_workspace(workspace_root, job_id)
    path = manifest_path(workspace)
    if not path.is_file():
        raise FileNotFoundError(job_id)
    return JobInputManifest.model_validate_json(path.read_text(encoding="utf-8"))
