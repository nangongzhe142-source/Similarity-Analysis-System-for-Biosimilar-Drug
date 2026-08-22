# -*- coding: utf-8 -*-
"""P4 contract tests — fixture round-trip and schema export freshness."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import pytest

SERVICE_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SERVICE_ROOT))

from app.models.analysis_contract import (  # noqa: E402
    ANALYSIS_RESULT_SCHEMA_VERSION,
    ANALYSIS_RULE_SET_VERSION,
    AnalysisResult,
)

FIXTURE = SERVICE_ROOT / "contracts" / "fixtures" / "minimal-analysis-result.json"
EXPORT_SCRIPT = SERVICE_ROOT / "scripts" / "export_contract_schema.py"


def test_constants_match_typescript() -> None:
    assert ANALYSIS_RESULT_SCHEMA_VERSION == "1.0.0"
    assert ANALYSIS_RULE_SET_VERSION == "v2-sheet3-8bd6b18f"


def test_minimal_fixture_validates() -> None:
    payload = FIXTURE.read_text(encoding="utf-8")
    result = AnalysisResult.model_validate_json(payload)
    assert result.schema_version == "1.0.0"
    assert result.input_evidence.sample_pairing.is_head_to_head_biosimilar_design is False
    assert result.evidence.parameters["massConstantSource"]


def test_committed_schema_matches_pydantic_export() -> None:
    committed = json.loads(
        (SERVICE_ROOT / "contracts" / "analysis-result.schema.json").read_text(encoding="utf-8")
    )
    generated = AnalysisResult.model_json_schema(mode="serialization")
    assert committed == generated


def test_export_script_write_is_noop() -> None:
    before_manifest = (SERVICE_ROOT / "contracts" / "field-manifest.json").read_bytes()
    before_schema = (SERVICE_ROOT / "contracts" / "analysis-result.schema.json").read_bytes()
    subprocess.run(
        [sys.executable, str(EXPORT_SCRIPT), "write"],
        cwd=SERVICE_ROOT,
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    after_manifest = (SERVICE_ROOT / "contracts" / "field-manifest.json").read_bytes()
    after_schema = (SERVICE_ROOT / "contracts" / "analysis-result.schema.json").read_bytes()
    assert before_manifest == after_manifest
    assert before_schema == after_schema
