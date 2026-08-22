# -*- coding: utf-8 -*-
"""Golden-test expectations for MS/MS synthetic demo (s09b-aligned coverage)."""

from __future__ import annotations

import importlib.util

import pytest

from app.analysis.msms.constants import (
    BIOSIMILAR_SIGNATURE_PEPTIDE,
    INNOVATOR_SIGNATURE_PEPTIDE,
)
from app.analysis.msms.pipeline import run_synthetic_demo


def _scientific_stack_available() -> bool:
    return importlib.util.find_spec("pyopenms") is not None


pytestmark = pytest.mark.skipif(
    not _scientific_stack_available(),
    reason="pyopenms not installed",
)


def test_msms_synthetic_demo_matches_s09b_coverage() -> None:
    pipeline = run_synthetic_demo(item_id="msms-sequence-coverage")

    assert pipeline.reference_coverage.confirmed_peptide_count == 106
    assert pipeline.reference_coverage.coverage_percent == pytest.approx(99.31, abs=0.01)
    assert pipeline.reference_coverage.covered_residue_count == 579
    assert pipeline.reference_coverage.sequence_length == 583

    assert pipeline.candidate_coverage.confirmed_peptide_count == 97
    assert pipeline.candidate_coverage.coverage_percent == pytest.approx(96.57, abs=0.01)

    assert pipeline.substitution_position == 327
    assert pipeline.sequence_difference_detected is True
    assert pipeline.comet_used is False
    assert pipeline.synthetic_demo is True


def test_signature_peptide_fragment_annotations() -> None:
    pipeline = run_synthetic_demo(item_id="msms-sequence-coverage")

    assert pipeline.signature_innovator.peptide_sequence == INNOVATOR_SIGNATURE_PEPTIDE
    assert pipeline.signature_biosimilar.peptide_sequence == BIOSIMILAR_SIGNATURE_PEPTIDE
    assert pipeline.signature_innovator.matched_ion_count >= 5
    assert pipeline.signature_biosimilar.matched_ion_count >= 5
