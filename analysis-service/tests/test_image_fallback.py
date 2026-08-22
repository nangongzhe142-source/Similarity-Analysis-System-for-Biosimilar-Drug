# -*- coding: utf-8 -*-
"""P10 image-fallback tests against the six real figures of the comparison DOCX.

The figures are extracted from
生物类似药评价指导原则/生物类似药药学评价比较.docx at test time rather than
committed, so the tests run against the actual document the user asked about.
"""

from __future__ import annotations

import importlib.util
import zipfile
from pathlib import Path

import pytest

COMPARISON_DOCX = Path(
    r"d:\生物类似药判别系统\生物类似药评价指导原则\生物类似药药学评价比较.docx"
)
EXPECTED_FIGURE_NAMES = (
    "image1.jpeg",
    "image2.jpeg",
    "image3.png",
    "image4.png",
    "image5.png",
    "image6.png",
)


def _stack_available() -> bool:
    return all(
        importlib.util.find_spec(module) is not None
        for module in ("cv2", "skimage", "pytesseract")
    )


pytestmark = pytest.mark.skipif(
    not _stack_available(),
    reason="opencv/scikit-image/pytesseract not installed",
)


@pytest.fixture(scope="module")
def figures(tmp_path_factory) -> dict[str, Path]:
    if not COMPARISON_DOCX.is_file():
        pytest.skip(f"comparison DOCX not present: {COMPARISON_DOCX}")

    target = tmp_path_factory.mktemp("docx-figures")
    extracted: dict[str, Path] = {}
    with zipfile.ZipFile(COMPARISON_DOCX) as archive:
        for name in archive.namelist():
            if not name.startswith("word/media/") or name.endswith("/"):
                continue
            destination = target / Path(name).name
            destination.write_bytes(archive.read(name))
            extracted[destination.name] = destination
    return extracted


def test_docx_contains_the_six_expected_figures(figures) -> None:
    assert set(figures) == set(EXPECTED_FIGURE_NAMES)


def test_every_figure_produces_an_outcome(figures) -> None:
    """All six figure types must enter analysis, even when only images exist."""
    from app.analysis.image_fallback.pipeline import analyse_figure

    for name in EXPECTED_FIGURE_NAMES:
        outcome = analyse_figure(figures[name])
        assert outcome.file_name == name
        assert outcome.width > 0 and outcome.height > 0
        assert outcome.limitations, f"{name} must carry an explicit limitation"


def test_physical_units_withheld_without_calibration(figures) -> None:
    """The calibration gate must be structural, not advisory."""
    from app.analysis.image_fallback.pipeline import analyse_figure

    outcome = analyse_figure(figures["image1.jpeg"])
    assert outcome.calibration.reliable is False
    assert all(peak.axis_value is None for peak in outcome.peaks)
    assert any("calibration" in warning.lower() for warning in outcome.warnings)


def test_calibration_enables_axis_values(figures) -> None:
    """With two operator anchors, peaks gain mass values on the printed axis."""
    from app.analysis.image_fallback.calibration import (
        CalibrationPoint,
        build_axis_calibration,
    )
    from app.analysis.image_fallback.pipeline import analyse_figure

    calibration = build_axis_calibration(
        "mass",
        "Da",
        [CalibrationPoint(63.0, 147600.0), CalibrationPoint(404.0, 148800.0)],
    )
    assert calibration.reliable is True

    outcome = analyse_figure(figures["image1.jpeg"], calibration=calibration)
    assert outcome.peaks
    masses = [peak.axis_value for peak in outcome.peaks if peak.axis_value is not None]
    assert masses, "a reliable calibration must yield axis values"
    # The figure's printed axis spans 1.476e5 to 1.488e5 Da.
    assert all(147000.0 < mass < 149500.0 for mass in masses)


def test_retention_time_calibration_does_not_fill_mass_field(figures) -> None:
    """A calibrated RT axis is physical, but it is not a deconvolved mass."""
    from app.analysis.image_fallback.calibration import (
        CalibrationPoint,
        build_axis_calibration,
    )
    from app.analysis.image_fallback.pipeline import analyse_figure, build_extracted_features

    calibration = build_axis_calibration(
        "rt",
        "min",
        [CalibrationPoint(40.0, 5.0), CalibrationPoint(400.0, 80.0)],
    )
    outcome = analyse_figure(figures["image1.jpeg"], calibration=calibration)
    features = build_extracted_features(outcome)
    assert outcome.calibration.reliable is True
    assert features.deconvolved_masses_da is None


def test_calibration_rejects_degenerate_anchors() -> None:
    from app.analysis.image_fallback.calibration import (
        CalibrationPoint,
        CalibrationUnreliableError,
        build_axis_calibration,
    )

    single = build_axis_calibration("mass", "Da", [CalibrationPoint(10.0, 100.0)])
    assert single.reliable is False

    too_close = build_axis_calibration(
        "mass",
        "Da",
        [CalibrationPoint(10.0, 100.0), CalibrationPoint(12.0, 200.0)],
    )
    assert too_close.reliable is False

    identical_values = build_axis_calibration(
        "mass",
        "Da",
        [CalibrationPoint(10.0, 100.0), CalibrationPoint(300.0, 100.0)],
    )
    assert identical_values.reliable is False

    with pytest.raises(CalibrationUnreliableError):
        single.to_axis_value(50.0)


def test_coverage_figure_reports_all_definitions(figures) -> None:
    """image6 prints five coverage definitions; reporting only one would mislead."""
    from app.analysis.image_fallback.pipeline import FIGURE_KIND_COVERAGE, analyse_figure

    outcome = analyse_figure(figures["image6.png"])
    assert outcome.figure_kind == FIGURE_KIND_COVERAGE
    assert outcome.coverage is not None

    percentages = outcome.coverage.percent_by_definition
    assert percentages["control"] == 99.8
    assert percentages["combined"] == 99.8
    assert percentages["analyte"] == 0.0
    assert percentages["common"] == 0.0

    # Only one side of the comparison carries data, and that must be surfaced.
    assert outcome.coverage.has_analyte_side_data is False
    assert any("head-to-head" in warning for warning in outcome.warnings)


def test_peptide_table_rejects_uncheckable_masses(figures) -> None:
    """OCR drops decimal points; unverifiable values must be discarded, not reported."""
    from app.analysis.image_fallback.pipeline import (
        FIGURE_KIND_PEPTIDE_TABLE,
        analyse_figure,
    )

    outcome = analyse_figure(figures["image4.png"])
    assert outcome.figure_kind == FIGURE_KIND_PEPTIDE_TABLE
    assert outcome.table is not None

    rows = {row.peptide_id: row for row in outcome.table.rows}
    assert len(outcome.table.rows) >= 15

    # A row OCR'd correctly keeps its masses.
    good = rows["HT03"]
    assert good.theoretical_mass_da == 2310.1
    assert good.reference_observed_mass_da == 2310.1
    assert good.candidate_observed_mass_da == 2310.1

    # HT02's theoretical mass 1544.7 is read as "15447"; that row must not report
    # masses validated against a corrupted reference.
    broken = rows["HT02"]
    assert broken.theoretical_mass_da is None
    assert broken.reference_observed_mass_da is None
    assert broken.candidate_observed_mass_da is None
    assert "referenceObservedMass" in broken.rejected_fields

    assert outcome.table.rejected_field_count > 0
    assert outcome.table.unusable_theoretical_count > 0


def test_retention_times_are_never_marked_validated(figures) -> None:
    """Retention time has no printed checksum, so it must stay flagged unvalidated."""
    from app.analysis.image_fallback.pipeline import analyse_figure

    outcome = analyse_figure(figures["image4.png"])
    assert outcome.table is not None
    assert all(row.retention_times_validated is False for row in outcome.table.rows)
    assert any("retention times carry no printed redundancy" in text.lower()
               for text in outcome.limitations)


def test_out_of_range_retention_time_is_dropped() -> None:
    """OCR read 19.8 min as 198; a value outside the run window must be discarded."""
    from app.analysis.image_fallback.tables import parse_peptide_table

    extraction = parse_peptide_table("HT01-HT02 1-19 1901.0 1901.0 19.8 1901.0 198")
    row = extraction.rows[0]
    assert row.reference_retention_time_min == 19.8
    assert row.candidate_retention_time_min is None


def test_multi_panel_figure_withholds_peaks(figures) -> None:
    """image2 stacks seven panels; one calibration cannot serve them all."""
    from app.analysis.image_fallback.pipeline import (
        FIGURE_KIND_MULTI_PANEL,
        analyse_figure,
    )

    outcome = analyse_figure(figures["image2.jpeg"])
    assert outcome.figure_kind == FIGURE_KIND_MULTI_PANEL
    assert outcome.peaks == ()
    assert any("multiple panels" in warning for warning in outcome.warnings)


def test_stray_pixels_do_not_fake_a_second_trace(figures) -> None:
    """image3 carries 137 antialiasing-red pixels that are not a second product."""
    from app.analysis.image_fallback.loader import load_bgr_image
    from app.analysis.image_fallback.curves import separate_red_blue_traces

    reference, candidate = separate_red_blue_traces(load_bgr_image(figures["image3.png"]))
    assert reference.pixel_count < 500
    assert reference.present is False
    assert candidate.present is True


def test_no_figure_yields_a_pass_or_fail_verdict(figures) -> None:
    """The core safety property: image evidence never decides biosimilarity."""
    from app.analysis.image_fallback.pipeline import (
        analyse_figure,
        build_image_analysis_result,
        image_input_evidence_defaults,
        utc_now,
    )
    from app.models.analysis_contract import (
        AnalysisInputEvidence,
        AnalysisProfileId,
        AnalysisSamplePairing,
        AnalysisVerdict,
        LocalizedText,
        RuleEvaluationOutcome,
        ThresholdKind,
    )

    data_source, evidence_level = image_input_evidence_defaults()
    forbidden_verdicts = {
        AnalysisVerdict.SUPPORTED_BY_THIS_ATTRIBUTE,
        AnalysisVerdict.DIFFERENCE_DETECTED,
    }

    for name in EXPECTED_FIGURE_NAMES:
        outcome = analyse_figure(figures[name])
        result = build_image_analysis_result(
            job_id="job-image",
            item_id="intact-mass",
            method_id="intact-mass-primary-1",
            profile=AnalysisProfileId.INTACT_MASS,
            outcome=outcome,
            input_evidence=AnalysisInputEvidence(
                data_source=data_source,
                evidence_level=evidence_level,
                candidate_files=[],
                reference_files=[],
                sequence_files=[],
                sample_pairing=AnalysisSamplePairing(
                    candidate_label="candidate",
                    reference_label="reference",
                    description=LocalizedText(zh="图片配对", en="image pairing"),
                    is_head_to_head_biosimilar_design=False,
                ),
            ),
            trace_id="trace-image",
            started_at=utc_now(),
            completed_at=utc_now(),
        )

        assert result.verdict == AnalysisVerdict.REVIEW, name
        assert result.verdict not in forbidden_verdicts, name
        assert result.input_evidence.data_source.value == "image-only", name
        assert result.extracted_features.image_metrics is not None
        assert (
            result.extracted_features.image_metrics.calibration_reliable
            is outcome.calibration.reliable
        )
        # The image layer may say the curves differ; it still may not move the
        # verdict off REVIEW, and its cut-offs may not pose as similarity limits.
        comparison = result.extracted_features.image_comparison
        assert comparison is not None, name
        assert comparison.threshold_kind == ThresholdKind.ALGORITHM_QUALITY_GATE, name
        for evaluation in result.rule_evaluation:
            assert evaluation.outcome in {
                RuleEvaluationOutcome.REVIEW,
                RuleEvaluationOutcome.RULE_NOT_DEFINED,
            }, name
        assert "不构成生物类似性判定" in result.provenance.what_it_is_not.zh


def test_image_comparison_bands_follow_the_calibrated_correlation(figures) -> None:
    """The band edges were measured on same-figure and cross-analyte pairs; this
    pins the mapping from correlation to statement, including the middle band
    where the method is entitled to say nothing."""
    import dataclasses

    from app.analysis.image_fallback.constants import (
        IMAGE_CONSISTENT_CORRELATION,
        IMAGE_DIFFERENT_CORRELATION,
    )
    from app.analysis.image_fallback.pipeline import analyse_figure, build_image_comparison
    from app.analysis.image_fallback.similarity import SimilarityMetrics
    from app.models.analysis_contract import ImageComparisonOutcome

    outcome = analyse_figure(figures["image1.jpeg"])

    def comparison_at(correlation: float | None):
        similarity = SimilarityMetrics(ssim=0.5, correlation=correlation, dtw_distance=1.0)
        return build_image_comparison(dataclasses.replace(outcome, similarity=similarity))

    assert comparison_at(IMAGE_CONSISTENT_CORRELATION).outcome is (
        ImageComparisonOutcome.CONSISTENT
    )
    assert comparison_at(IMAGE_DIFFERENT_CORRELATION).outcome is (
        ImageComparisonOutcome.DIFFERENCE_OBSERVED
    )
    midpoint = (IMAGE_CONSISTENT_CORRELATION + IMAGE_DIFFERENT_CORRELATION) / 2
    assert comparison_at(midpoint).outcome is ImageComparisonOutcome.INCONCLUSIVE

    absent = build_image_comparison(dataclasses.replace(outcome, similarity=None))
    assert absent.outcome is ImageComparisonOutcome.NOT_APPLICABLE
    assert absent.driver_value is None

    # SSIM and DTW are carried for description; measurement showed their ranges
    # overlap between like-for-like and cross-analyte pairs, so they must stay
    # out of the decision.
    for comparison in (comparison_at(0.99), absent):
        assert comparison.driver_metric == "correlation"
        assert set(comparison.non_discriminating_metrics) == {"ssim", "dtwDistance"}


def test_uncalibrated_result_carries_no_physical_features(figures) -> None:
    """Without calibration the contract must not contain any mass field."""
    from app.analysis.image_fallback.pipeline import analyse_figure, build_extracted_features

    outcome = analyse_figure(figures["image1.jpeg"])
    features = build_extracted_features(outcome)
    assert features.deconvolved_masses_da is None
    assert features.image_metrics is not None
    assert features.image_metrics.calibration_reliable is False


def test_ocr_numeric_tokens_are_recorded_and_never_applied_as_axis(figures) -> None:
    """P19: OCR may surface numbers; they must not become a reliable calibration."""
    from app.analysis.image_fallback.pipeline import (
        analyse_figure,
        build_image_analysis_result,
        image_input_evidence_defaults,
        utc_now,
    )
    from app.models.analysis_contract import (
        AnalysisInputEvidence,
        AnalysisProfileId,
        AnalysisSamplePairing,
        LocalizedText,
    )

    outcome = analyse_figure(figures["image1.jpeg"])
    assert outcome.calibration.reliable is False
    data_source, evidence_level = image_input_evidence_defaults()
    result = build_image_analysis_result(
        job_id="job-ocr",
        item_id="intact-mass",
        method_id="intact-mass-primary-1",
        profile=AnalysisProfileId.INTACT_MASS,
        outcome=outcome,
        input_evidence=AnalysisInputEvidence(
            data_source=data_source,
            evidence_level=evidence_level,
            candidate_files=[],
            reference_files=[],
            sequence_files=[],
            sample_pairing=AnalysisSamplePairing(
                candidate_label="candidate",
                reference_label="reference",
                description=LocalizedText(zh="图片配对", en="image pairing"),
                is_head_to_head_biosimilar_design=False,
            ),
        ),
        trace_id="trace-ocr",
        started_at=utc_now(),
        completed_at=utc_now(),
    )
    assert result.evidence.parameters["ocrCalibrationApplied"] is False
    assert result.extracted_features.image_metrics is not None
    assert result.extracted_features.image_metrics.calibration_reliable is False
    assert result.extracted_features.deconvolved_masses_da is None


def test_colour_roles_order_overlay_as_reference_then_candidate(figures, tmp_path) -> None:
    """HLX03 figures paint the candidate red; overlay keys must follow the role."""
    from app.analysis.image_fallback.pipeline import (
        analyse_figure,
        build_image_analysis_result,
        image_input_evidence_defaults,
        utc_now,
    )
    from app.models.analysis_contract import (
        AnalysisInputEvidence,
        AnalysisProfileId,
        AnalysisSamplePairing,
        LocalizedText,
    )

    outcome = analyse_figure(figures["image1.jpeg"])
    data_source, evidence_level = image_input_evidence_defaults()
    result = build_image_analysis_result(
        job_id="job-roles",
        item_id="intact-mass",
        method_id="intact-mass-primary-1",
        profile=AnalysisProfileId.INTACT_MASS,
        outcome=outcome,
        input_evidence=AnalysisInputEvidence(
            data_source=data_source,
            evidence_level=evidence_level,
            candidate_files=[],
            reference_files=[],
            sequence_files=[],
            sample_pairing=AnalysisSamplePairing(
                candidate_label="candidate",
                reference_label="reference",
                description=LocalizedText(zh="图片配对", en="image pairing"),
                is_head_to_head_biosimilar_design=False,
            ),
        ),
        trace_id="trace-roles",
        started_at=utc_now(),
        completed_at=utc_now(),
        artifacts_dir=tmp_path,
        colour_roles={"red": "reference", "blue": "candidate"},
    )
    traces = result.evidence.parameters["normalizedTraces"]
    assert "reference" in traces
    assert "candidate" in traces
    assert result.evidence.parameters["colourRoles"] == {
        "red": "reference",
        "blue": "candidate",
    }
