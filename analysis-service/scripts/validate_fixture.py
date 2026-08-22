# -*- coding: utf-8 -*-
"""Validate the minimal AnalysisResult fixture. Used by verify_analysis_contract.mjs."""

from __future__ import annotations

import sys
from pathlib import Path

SERVICE_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SERVICE_ROOT))

from app.models.analysis_contract import AnalysisResult  # noqa: E402

FIXTURE = SERVICE_ROOT / "contracts" / "fixtures" / "minimal-analysis-result.json"


def main() -> int:
    AnalysisResult.model_validate_json(FIXTURE.read_text(encoding="utf-8"))
    print("fixture_ok")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
