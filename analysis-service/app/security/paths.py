# -*- coding: utf-8 -*-
"""Workspace path helpers and filename sanitisation (P5 baseline; P6 extends)."""

from __future__ import annotations

import re
import uuid
from pathlib import Path

from app.models.analysis_contract import AnalysisInputFileRole

SAFE_FILENAME = re.compile(r"[^A-Za-z0-9._-]+")
JOB_ID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.I)
ARTIFACT_NAME = re.compile(r"^[A-Za-z0-9._-]+$")
ARTIFACT_SUFFIXES = frozenset({".png", ".csv", ".svg"})


def new_job_id() -> str:
    return str(uuid.uuid4())


def validate_job_id(job_id: str) -> str:
    if not JOB_ID.match(job_id):
        raise ValueError("invalid job id")
    return job_id


def job_workspace(root: Path, job_id: str) -> Path:
    validate_job_id(job_id)
    workspace = (root / job_id).resolve()
    if root.resolve() not in workspace.parents and workspace != root.resolve():
        raise ValueError("path traversal blocked")
    return workspace


def job_state_path(workspace: Path) -> Path:
    return workspace / "job.json"


def artifacts_dir(workspace: Path) -> Path:
    return workspace / "artifacts"


def uploads_dir(workspace: Path) -> Path:
    return workspace / "uploads"


def artifact_file(workspace: Path, file_name: str) -> Path:
    """Resolve a downloadable artifact inside the job workspace (no traversal)."""
    if not ARTIFACT_NAME.match(file_name):
        raise ValueError("invalid artifact name")
    suffix = Path(file_name).suffix.lower()
    if suffix not in ARTIFACT_SUFFIXES:
        raise ValueError("artifact type is not allowed")
    root = artifacts_dir(workspace).resolve()
    target = (root / file_name).resolve()
    if root not in target.parents and target != root:
        raise ValueError("path traversal blocked")
    return target


def upload_path(workspace: Path, role: AnalysisInputFileRole, original_name: str) -> Path:
    safe_name = sanitize_filename(original_name)
    return uploads_dir(workspace) / f"{role.value}-{safe_name}"


def sanitize_filename(name: str) -> str:
    base = Path(name).name
    if not base or base in {".", ".."}:
        return "upload.bin"
    suffix = Path(base).suffix
    stem = base[: len(base) - len(suffix)] if suffix else base
    cleaned_stem = SAFE_FILENAME.sub("_", stem).strip("._") or "upload"
    if not suffix:
        return cleaned_stem
    suffix_body = SAFE_FILENAME.sub("", suffix.lstrip(".")).strip("._")
    if not suffix_body:
        return cleaned_stem
    return f"{cleaned_stem}.{suffix_body}"
