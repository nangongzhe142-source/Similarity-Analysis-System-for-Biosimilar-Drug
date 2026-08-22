# -*- coding: utf-8 -*-
"""Golden expectations for the peptide-map TIC overlay fixture."""

from __future__ import annotations

from pathlib import Path

from app.analysis.peptide_map.pipeline import run_synthetic_demo
from app.analysis.peptide_map.simulation import CANDIDATE_LAST_PEAK_SHIFT_MIN, POINT_COUNT


def test_synthetic_tic_overlay_is_labeled_fixture(tmp_path: Path) -> None:
    pipeline = run_synthetic_demo(work_dir=tmp_path)
    assert pipeline.synthetic_demo is True
    assert pipeline.last_peak_shift_min == CANDIDATE_LAST_PEAK_SHIFT_MIN
    assert len(pipeline.reference_trace.points) == POINT_COUNT
    assert len(pipeline.candidate_trace.points) == POINT_COUNT
    assert pipeline.overlay_plot_path is not None
    assert pipeline.overlay_plot_path.is_file()
