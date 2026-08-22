# -*- coding: utf-8 -*-
"""Golden-test expectations from docs/tool-survey/evidence/run_s09b.log."""

from __future__ import annotations

import importlib.util

import pytest

from app.analysis.ms1_coverage.constants import MS1_CANNOT_REPLACE_MSMS_ZH
from app.analysis.ms1_coverage.pipeline import run_synthetic_demo


def _scientific_stack_available() -> bool:
    return importlib.util.find_spec("pyopenms") is not None


pytestmark = pytest.mark.skipif(
    not _scientific_stack_available(),
    reason="pyopenms not installed",
)


def test_s09b_golden_coverage_and_substitution() -> None:
    pipeline = run_synthetic_demo(item_id="ms1-sequence-coverage")

    assert pipeline.reference_coverage.theoretical_peptide_count == 118
    assert pipeline.reference_coverage.matched_peptide_count == 106
    assert pipeline.reference_coverage.coverage_percent == pytest.approx(99.31, abs=0.01)
    assert pipeline.reference_coverage.covered_residue_count == 579
    assert pipeline.reference_coverage.sequence_length == 583

    assert pipeline.candidate_coverage.matched_peptide_count == 97
    assert pipeline.candidate_coverage.coverage_percent == pytest.approx(96.57, abs=0.01)

    assert pipeline.substitution_position == 327
    assert pipeline.substitution_detected is True


def test_ms1_limitation_is_declared() -> None:
    assert "不能替代 MS/MS 序列确认" in MS1_CANNOT_REPLACE_MSMS_ZH
