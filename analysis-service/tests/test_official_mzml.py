# -*- coding: utf-8 -*-

from __future__ import annotations

from pathlib import Path

import pytest

from app.security.ingest import validate_upload_content

OFFICIAL_FILES = (
    "tiny.mzML",
    "PrecursorPurity_input.mzML",
    "FeatureFinderMetaboIdent_1_input.mzML",
    "small.mzML",
    "Metabolomics_1.mzML",
    "Metabolomics_2.mzML",
)

OFFICIAL_DIR = (
    Path(__file__).resolve().parents[2].parent
    / "数据分析提取系统"
    / "ms_analysis"
    / "official_data"
)


@pytest.mark.parametrize("file_name", OFFICIAL_FILES)
def test_official_example_mzml_is_readable(file_name: str) -> None:
    path = OFFICIAL_DIR / file_name
    if not path.is_file():
        pytest.skip(f"official fixture not present: {path}")
    content = path.read_bytes()
    result = validate_upload_content(filename=file_name, content=content)
    assert result.format == "mzml"
    assert result.byte_size == path.stat().st_size
