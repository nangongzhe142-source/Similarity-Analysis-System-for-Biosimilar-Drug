# -*- coding: utf-8 -*-
"""Golden-test expectations from docs/tool-survey/evidence/run_s09a.log."""

from __future__ import annotations

import importlib.util
from pathlib import Path

import pytest

from app.analysis.intact_mass.pipeline import run_synthetic_demo
from app.analysis.intact_mass.rules import NUMERIC_BOUNDARY_ZH


def _scientific_stack_available() -> bool:
    return (
        importlib.util.find_spec("pyopenms") is not None
        and importlib.util.find_spec("unidec") is not None
        and importlib.util.find_spec("numpy") is not None
        and importlib.util.find_spec("matplotlib") is not None
    )


pytestmark = pytest.mark.skipif(
    not _scientific_stack_available(),
    reason="pyopenms/unidec/numpy/matplotlib not installed",
)


def test_s09a_golden_mass_recovery(tmp_path: Path) -> None:
    pipeline = run_synthetic_demo(item_id="intact-mass", work_dir=tmp_path)

    assert round(pipeline.theoretical.oxidized_average_mass_da, 2) == 66398.19
    assert pipeline.reference_deconvolution.base_peak_mass_da == 66398.0
    assert pipeline.candidate_deconvolution.base_peak_mass_da == 66560.0

    reference_check, candidate_check = pipeline.recovery_checks
    assert reference_check.deviation_da == pytest.approx(-0.19, abs=0.01)
    assert candidate_check.deviation_da == pytest.approx(-0.24, abs=0.01)
    assert reference_check.passed is True
    assert candidate_check.passed is True

    assert pipeline.head_to_head.observed_shift_da == 162.0
    assert pipeline.head_to_head.shift_error_da == pytest.approx(-0.05, abs=0.01)
    assert pipeline.head_to_head.attributable_to_known_modification is True
    assert pipeline.protein.accession == "P02769"
    assert pipeline.protein.sequence_source == "bsa-demo-fixture"
    assert pipeline.deconvolution_settings.window_source == "theoretical-mass"
    assert pipeline.mirror_plot_path is not None
    assert pipeline.mirror_plot_path.is_file()


def test_delta_metrics_are_not_similarity_thresholds() -> None:
    assert "无统一相似性数值限度" in NUMERIC_BOUNDARY_ZH
    assert "方法特异预设的质量准确度标准" in NUMERIC_BOUNDARY_ZH
