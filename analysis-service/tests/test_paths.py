# -*- coding: utf-8 -*-
"""Filename sanitisation and artifact-path traversal guards."""

from __future__ import annotations

from pathlib import Path

import pytest

from app.models.analysis_contract import AnalysisInputFileRole
from app.security.paths import artifact_file, sanitize_filename, upload_path


def test_chinese_png_keeps_image_suffix() -> None:
    cleaned = sanitize_filename("镜像谱.png")
    assert cleaned.endswith(".png")
    assert all(ord(character) < 128 for character in cleaned)


def test_chinese_filename_is_sanitized_to_ascii() -> None:
    cleaned = sanitize_filename("候选药-完整质量.mzML")
    assert cleaned.endswith(".mzML")
    assert all(ord(character) < 128 for character in cleaned)
    assert "候" not in cleaned


def test_upload_path_keeps_role_prefix_after_sanitising(tmp_path: Path) -> None:
    target = upload_path(tmp_path, AnalysisInputFileRole.CANDIDATE, "参照.mzML")
    assert target.parent.name == "uploads"
    assert target.name.startswith("candidate-")
    assert all(ord(character) < 128 for character in target.name)


def test_artifact_file_rejects_traversal(tmp_path: Path) -> None:
    artifacts = tmp_path / "artifacts"
    artifacts.mkdir()
    (artifacts / "mirror-plot.png").write_bytes(b"x")
    with pytest.raises(ValueError):
        artifact_file(tmp_path, "../job.json")
    with pytest.raises(ValueError):
        artifact_file(tmp_path, "notes.txt")


def test_looks_like_image_uses_declared_format_when_suffix_stripped() -> None:
    from app.adapters.image_fallback import looks_like_image

    assert looks_like_image("candidate-png") is False
    assert looks_like_image("candidate-png", "png") is True
    assert looks_like_image("upload.png") is True
