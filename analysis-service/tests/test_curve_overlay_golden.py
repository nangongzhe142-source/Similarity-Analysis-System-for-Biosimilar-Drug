# -*- coding: utf-8 -*-
"""Golden checks for the P26 curve-overlay synthetic demo."""

from __future__ import annotations

from pathlib import Path

from app.analysis.curve_overlay.constants import PEARSON_QUALITY_GATE
from app.analysis.curve_overlay.pipeline import (
    build_analysis_result,
    build_input_evidence,
    run_synthetic_demo,
    run_uploaded_curves,
)
from app.models.analysis_contract import LocalizedText


def test_sec_synthetic_demo_is_review_and_labeled(tmp_path: Path) -> None:
    pipeline = run_synthetic_demo(item_id="sec-hmw-aggregates", work_dir=tmp_path)
    assert pipeline.synthetic_demo is True
    assert pipeline.metrics.pearson_r > PEARSON_QUALITY_GATE
    assert {region.region_id for region in pipeline.metrics.regions} == {"HMW", "monomer", "LMW"}
    assert pipeline.overlay_plot_path is not None
    assert pipeline.overlay_plot_path.is_file()

    result = build_analysis_result(
        job_id="job-sec",
        item_id="sec-hmw-aggregates",
        method_id="sec-hmw-aggregates-primary-1",
        pipeline=pipeline,
        input_evidence=build_input_evidence(
            candidate_label="illustrative-candidate",
            reference_label="illustrative-reference",
            pairing_description=LocalizedText(zh="合成演示。", en="Synthetic demo."),
            is_head_to_head_biosimilar_design=False,
            candidate_files=[],
            reference_files=[],
            sequence_files=[],
            synthetic_demo=True,
        ),
        trace_id="t1",
        started_at="2026-08-30T00:00:00+00:00",
        completed_at="2026-08-30T00:00:01+00:00",
        artifacts_dir=tmp_path,
    )
    assert result.verdict.value == "REVIEW"
    assert result.profile == "curve-overlay"
    assert result.input_evidence.data_source.value == "synthetic-demo"
    assert all(gate.threshold_kind.value == "algorithmQualityGate" for gate in result.evidence.quality_gates)
    assert result.evidence.parameters["syntheticDemo"] is True
    hmw = next(
        region for region in result.evidence.parameters["curveRegions"] if region["id"] == "HMW"
    )
    assert hmw["candidatePercent"] > hmw["referencePercent"]


def test_cd_synthetic_demo_has_no_regions() -> None:
    pipeline = run_synthetic_demo(item_id="far-uv-cd")
    assert pipeline.metrics.regions == ()
    assert pipeline.metrics.pearson_r > PEARSON_QUALITY_GATE


def test_uploaded_two_column_csv(tmp_path: Path) -> None:
    reference = tmp_path / "reference.csv"
    candidate = tmp_path / "candidate.csv"
    reference.write_text("x,y\n1,0\n2,1\n3,0\n", encoding="utf-8")
    candidate.write_text("x,y\n1,0\n2,0.9\n3,0\n", encoding="utf-8")
    pipeline = run_uploaded_curves(
        item_id="sec-hmw-aggregates",
        reference_path=reference,
        candidate_path=candidate,
        work_dir=tmp_path,
    )
    assert pipeline.synthetic_demo is False
    assert pipeline.metrics.pearson_r > 0.9
