# -*- coding: utf-8 -*-
"""Image-only fallback analysis pipeline (P10).

Scope boundary, enforced in code below rather than left to documentation:

* the verdict is never PASS or FAIL — image evidence cannot establish or refute
  biosimilarity, so the outcome is REVIEW or RULE_NOT_DEFINED;
* physical units are emitted only when axis calibration is reliable;
* similarity metrics are reported as orientation, never as a decision input.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.analysis.image_fallback.calibration import (
    AxisCalibration,
    ocr_guess_is_not_calibration,
    ocr_numeric_tokens,
)
from app.analysis.image_fallback.constants import (
    IMAGE_CONSISTENT_CORRELATION,
    IMAGE_DIFFERENT_CORRELATION,
)
from app.analysis.image_fallback.coverage import (
    CoverageExtraction,
    count_shaded_residue_blocks,
    parse_coverage_text,
)
from app.analysis.image_fallback.curves import (
    FIGURE_LAYOUT_MIRROR,
    FIGURE_LAYOUT_UNKNOWN,
    ExtractedPeak,
    ExtractedTrace,
    FigureLayout,
    PeakPair,
    detect_layout,
    pair_peaks,
    pick_peaks,
    separate_red_blue_traces,
)
from app.analysis.image_fallback.loader import load_bgr_image, to_grayscale
from app.analysis.image_fallback.similarity import (
    SimilarityMetrics,
    dtw_distance,
    mirror_similarity,
    profile_correlation,
    trace_shape_similarity,
)
from app.analysis.image_fallback.tables import (
    PeptideTableExtraction,
    ocr_text,
    parse_peptide_table,
)
from app.analysis.plots import write_chromatogram_overlay_plot
from app.analysis.provenance import input_hashes_from_evidence
from app.models.analysis_contract import (
    ANALYSIS_RESULT_SCHEMA_VERSION,
    ANALYSIS_RULE_SET_VERSION,
    AnalysisArtifacts,
    AnalysisDataSource,
    AnalysisEvidenceLevel,
    AnalysisExtractedFeatures,
    AnalysisImageComparison,
    AnalysisImageMetrics,
    AnalysisInputEvidence,
    AnalysisProfileId,
    AnalysisResult,
    AnalysisResultProvenance,
    AnalysisRuleEvaluation,
    AnalysisRunEvidence,
    AnalysisVerdict,
    AnalysisQualityGate,
    CoverageDefinition,
    ImageComparisonOutcome,
    LocalizedText,
    RuleEvaluationOutcome,
    ThresholdKind,
)

FIGURE_KIND_MIRROR_SPECTRUM = "mirror-spectrum"
FIGURE_KIND_PEPTIDE_TABLE = "peptide-table"
FIGURE_KIND_COVERAGE = "sequence-coverage"
FIGURE_KIND_FRAGMENT_SPECTRUM = "fragment-spectrum"
FIGURE_KIND_MULTI_PANEL = "multi-panel-figure"
FIGURE_KIND_GENERIC = "generic-figure"

# A figure whose panels each carry their own axes cannot be calibrated as one
# image; image2.jpeg holds seven such panels. Detected by aspect ratio, which is
# what distinguishes a stacked panel grid from a single plot in this document set.
MULTI_PANEL_MIN_ASPECT_RATIO = 1.4


@dataclass
class ImageAnalysisOutcome:
    figure_kind: str
    file_name: str
    width: int
    height: int
    calibration: AxisCalibration
    traces: tuple[ExtractedTrace, ...] = ()
    peaks: tuple[ExtractedPeak, ...] = ()
    counterpart_peaks: tuple[ExtractedPeak, ...] = ()
    peak_pairs: tuple[PeakPair, ...] = ()
    layout: FigureLayout | None = None
    similarity: SimilarityMetrics | None = None
    table: PeptideTableExtraction | None = None
    coverage: CoverageExtraction | None = None
    shaded_block_count: int | None = None
    ocr_numeric_tokens: tuple[float, ...] = ()
    warnings: list[str] = field(default_factory=list)
    limitations: list[str] = field(default_factory=list)


def classify_figure(
    text: str,
    red_trace: ExtractedTrace,
    blue_trace: ExtractedTrace,
    *,
    width: int,
    height: int,
) -> str:
    """Decide what kind of figure this is from its OCR text and colour content.

    Trace presence is judged by the pixel-count threshold rather than by "any
    coloured pixel at all": image3.png carries 137 stray red pixels from antialiased
    text, which would otherwise make a single-trace chromatogram look like a
    two-product mirror plot.
    """
    lowered = text.lower()
    if "coverage (%)" in lowered:
        return FIGURE_KIND_COVERAGE
    if "theoretical mass" in lowered and "peptide" in lowered:
        return FIGURE_KIND_PEPTIDE_TABLE

    both_traces_present = red_trace.present and blue_trace.present
    if height >= width * MULTI_PANEL_MIN_ASPECT_RATIO:
        return FIGURE_KIND_MULTI_PANEL
    if "y1" in lowered or "b2" in lowered or "fragment" in lowered:
        return FIGURE_KIND_FRAGMENT_SPECTRUM
    if both_traces_present:
        return FIGURE_KIND_MIRROR_SPECTRUM
    return FIGURE_KIND_GENERIC


def analyse_figure(
    image_path: Path,
    *,
    calibration: AxisCalibration | None = None,
) -> ImageAnalysisOutcome:
    """Run the fallback analysis appropriate to the figure's type."""
    image = load_bgr_image(image_path)
    gray = to_grayscale(image)
    height, width = image.shape[:2]

    red_trace, blue_trace = separate_red_blue_traces(image)
    text = ocr_text(image_path)
    figure_kind = classify_figure(
        text,
        red_trace,
        blue_trace,
        width=width,
        height=height,
    )
    numeric_tokens = ocr_numeric_tokens(text)

    # Operator two-point anchors are the only reliable calibration. OCR numbers
    # are recorded as guesses and never passed to build_axis_calibration.
    if calibration is not None:
        effective_calibration = calibration
    else:
        effective_calibration = ocr_guess_is_not_calibration()

    outcome = ImageAnalysisOutcome(
        figure_kind=figure_kind,
        file_name=image_path.name,
        width=width,
        height=height,
        calibration=effective_calibration,
        ocr_numeric_tokens=numeric_tokens,
    )
    outcome.limitations.append(
        "Image-only exploratory analysis; values are read off a rendered figure, "
        "not from instrument data."
    )
    if not effective_calibration.reliable:
        outcome.warnings.append(
            "Axis calibration is unreliable, so no Da / m·z / retention-time values are reported."
        )

    if figure_kind == FIGURE_KIND_COVERAGE:
        coverage = parse_coverage_text(text)
        outcome.coverage = coverage
        outcome.shaded_block_count = count_shaded_residue_blocks(image)
        if not coverage.has_analyte_side_data:
            outcome.warnings.append(
                "Analyte and common coverage read 0.0, so this figure reports one side only "
                "and is not a head-to-head coverage comparison."
            )
    elif figure_kind == FIGURE_KIND_PEPTIDE_TABLE:
        table = parse_peptide_table(text)
        outcome.table = table
        if table.rejected_field_count:
            outcome.warnings.append(
                f"{table.rejected_field_count} OCR mass field(s) failed cross-validation "
                "against the printed theoretical mass and were discarded."
            )
        if table.repaired_field_count:
            outcome.warnings.append(
                f"{table.repaired_field_count} OCR mass field(s) required decimal-point repair "
                "validated against the printed theoretical mass."
            )
        if table.unusable_theoretical_count:
            outcome.warnings.append(
                f"{table.unusable_theoretical_count} row(s) had an implausible theoretical mass, "
                "so their observed masses could not be cross-validated and were discarded."
            )
        outcome.limitations.append(
            "Retention times carry no printed redundancy, so OCR errors in them cannot be "
            "detected; they are range-checked only and remain unvalidated."
        )
    elif figure_kind == FIGURE_KIND_MULTI_PANEL:
        outcome.traces = (red_trace, blue_trace)
        outcome.similarity = SimilarityMetrics(
            ssim=mirror_similarity(gray),
            correlation=profile_correlation(
                red_trace.column_profile, blue_trace.column_profile
            ),
            dtw_distance=None,
        )
        outcome.warnings.append(
            "This figure holds multiple panels with independent axes; peak positions are not "
            "extracted because a single calibration cannot apply to all panels."
        )
        outcome.limitations.append(
            "Per-panel segmentation and calibration are required before any panel of this "
            "figure can yield axis values."
        )
    elif figure_kind in {FIGURE_KIND_MIRROR_SPECTRUM, FIGURE_KIND_FRAGMENT_SPECTRUM}:
        outcome.traces = (red_trace, blue_trace)

        layout = detect_layout(red_trace, blue_trace, image_height=height)
        outcome.layout = layout
        if layout.kind == FIGURE_LAYOUT_UNKNOWN or not layout.corroborated:
            outcome.warnings.append(
                f"Figure layout could not be established with confidence: {layout.reason}"
            )

        # Peaks are taken from both traces. Reading only one of them would leave
        # the comparison one-sided, and a peak present in one product but not the
        # other is precisely what has to be visible.
        outcome.peaks = tuple(pick_peaks(red_trace, effective_calibration))
        outcome.counterpart_peaks = tuple(pick_peaks(blue_trace, effective_calibration))
        outcome.peak_pairs = tuple(
            pair_peaks(list(outcome.peaks), list(outcome.counterpart_peaks))
        )

        outcome.similarity = SimilarityMetrics(
            ssim=trace_shape_similarity(
                red_trace.mask,
                blue_trace.mask,
                invert_second=layout.kind == FIGURE_LAYOUT_MIRROR,
            ),
            correlation=profile_correlation(
                red_trace.column_profile, blue_trace.column_profile
            ),
            dtw_distance=dtw_distance(
                red_trace.column_profile, blue_trace.column_profile
            ),
        )
        outcome.limitations.append(
            "Values read off this figure reflect the original authors' annotations and their "
            "instrument accuracy, not a similarity threshold."
        )
        outcome.limitations.append(
            "Unpaired peaks may come from the figure's rendering resolution rather than from "
            "the products: one pixel column spans several Da on a printed mass axis."
        )
    else:
        outcome.traces = (red_trace, blue_trace)
        outcome.similarity = SimilarityMetrics(
            ssim=mirror_similarity(gray),
            correlation=None,
            dtw_distance=None,
        )

    return outcome


def _coverage_features(coverage: CoverageExtraction) -> dict[str, Any]:
    definition = None
    if "combined" in coverage.percent_by_definition:
        definition = CoverageDefinition.COMBINED
    elif "control" in coverage.percent_by_definition:
        definition = CoverageDefinition.CONTROL
    primary = (
        coverage.percent_by_definition.get("combined")
        or coverage.percent_by_definition.get("control")
    )
    return {
        "coverage_percent": primary,
        "coverage_definition": definition,
        "coverage_percent_by_definition": dict(coverage.percent_by_definition),
    }


NON_DISCRIMINATING_METRICS = ("ssim", "dtwDistance")


def build_image_comparison(outcome: ImageAnalysisOutcome) -> AnalysisImageComparison:
    """Turn the correlation into the image-level statement shown to the operator.

    Only profile correlation is consulted. SSIM and DTW are computed and reported,
    but measurement over like-for-like and cross-analyte pairs showed their ranges
    overlapping almost entirely, so they cannot support this call.
    """
    correlation = outcome.similarity.correlation if outcome.similarity else None

    if correlation is None:
        return AnalysisImageComparison(
            outcome=ImageComparisonOutcome.NOT_APPLICABLE,
            driver_metric="correlation",
            driver_value=None,
            consistent_threshold=IMAGE_CONSISTENT_CORRELATION,
            difference_threshold=IMAGE_DIFFERENT_CORRELATION,
            threshold_kind=ThresholdKind.ALGORITHM_QUALITY_GATE,
            non_discriminating_metrics=list(NON_DISCRIMINATING_METRICS),
            rationale=LocalizedText(
                zh="本图未能提取到两条可比曲线，因此不给出图像层面的比对结论。",
                en="This figure yielded no comparable pair of curves, so no image-level "
                "statement is made.",
            ),
        )

    if correlation >= IMAGE_CONSISTENT_CORRELATION:
        decision = ImageComparisonOutcome.CONSISTENT
        zh = (
            f"两条曲线的形状相关系数为 {correlation:.3f}，不低于 "
            f"{IMAGE_CONSISTENT_CORRELATION:.2f}，图像层面未见明显差异。"
            "这是对图片的观察，不是对产品的判定：图片的横向分辨率通常达不到糖型差异的量级。"
        )
        en = (
            f"The two curves correlate at {correlation:.3f}, at or above "
            f"{IMAGE_CONSISTENT_CORRELATION:.2f}; no difference is visible at image level. "
            "This describes the picture, not the products."
        )
    elif correlation <= IMAGE_DIFFERENT_CORRELATION:
        decision = ImageComparisonOutcome.DIFFERENCE_OBSERVED
        zh = (
            f"两条曲线的形状相关系数为 {correlation:.3f}，不高于 "
            f"{IMAGE_DIFFERENT_CORRELATION:.2f}，图像层面可见明显差异。"
            "差异可能来自产品，也可能来自曲线检出质量或图片渲染，需人工核对原图。"
        )
        en = (
            f"The two curves correlate at {correlation:.3f}, at or below "
            f"{IMAGE_DIFFERENT_CORRELATION:.2f}; a difference is visible at image level. "
            "Its source may be the products, the trace extraction or the rendering."
        )
    else:
        decision = ImageComparisonOutcome.INCONCLUSIVE
        zh = (
            f"两条曲线的形状相关系数为 {correlation:.3f}，落在 "
            f"{IMAGE_DIFFERENT_CORRELATION:.2f} 与 {IMAGE_CONSISTENT_CORRELATION:.2f} 之间，"
            "证据不足以支持任一方向的说法，请人工查看叠加图与峰表。"
        )
        en = (
            f"The two curves correlate at {correlation:.3f}, between "
            f"{IMAGE_DIFFERENT_CORRELATION:.2f} and {IMAGE_CONSISTENT_CORRELATION:.2f}, "
            "which supports no statement in either direction."
        )

    return AnalysisImageComparison(
        outcome=decision,
        driver_metric="correlation",
        driver_value=round(float(correlation), 4),
        consistent_threshold=IMAGE_CONSISTENT_CORRELATION,
        difference_threshold=IMAGE_DIFFERENT_CORRELATION,
        threshold_kind=ThresholdKind.ALGORITHM_QUALITY_GATE,
        non_discriminating_metrics=list(NON_DISCRIMINATING_METRICS),
        rationale=LocalizedText(zh=zh, en=en),
    )


def build_extracted_features(outcome: ImageAnalysisOutcome) -> AnalysisExtractedFeatures:
    image_metrics = None
    if outcome.similarity is not None:
        image_metrics = AnalysisImageMetrics(
            calibration_reliable=outcome.calibration.reliable,
            ssim=outcome.similarity.ssim,
            correlation=outcome.similarity.correlation,
            dtw_distance=outcome.similarity.dtw_distance,
        )
    else:
        image_metrics = AnalysisImageMetrics(calibration_reliable=outcome.calibration.reliable)

    features: dict[str, Any] = {
        "image_metrics": image_metrics,
        "image_comparison": build_image_comparison(outcome),
    }

    if outcome.coverage is not None:
        features.update(_coverage_features(outcome.coverage))

    if outcome.table is not None:
        matched = [
            row.peptide_id
            for row in outcome.table.rows
            if row.reference_observed_mass_da is not None
            and row.candidate_observed_mass_da is not None
        ]
        unmatched = [
            row.peptide_id
            for row in outcome.table.rows
            if row.reference_observed_mass_da is None
            or row.candidate_observed_mass_da is None
        ]
        features["matched_peptides"] = matched
        features["unmatched_peptides"] = unmatched

        deltas = [
            round(row.candidate_observed_mass_da - row.reference_observed_mass_da, 4)
            for row in outcome.table.rows
            if row.reference_observed_mass_da is not None
            and row.candidate_observed_mass_da is not None
        ]
        if deltas:
            features["delta_da"] = deltas

    # Physical peak positions are only ever populated behind the calibration gate.
    # deconvolvedMassesDa is a mass field: retention-time calibrations must not
    # write minutes into it.
    if (
        outcome.peaks
        and outcome.calibration.reliable
        and (outcome.calibration.unit or "").lower() == "da"
    ):
        features["deconvolved_masses_da"] = [
            peak.axis_value for peak in outcome.peaks if peak.axis_value is not None
        ]

    return AnalysisExtractedFeatures(**features)


def _downsample_trace(trace: ExtractedTrace, max_points: int = 120) -> list[tuple[float, float]]:
    profile = trace.column_profile
    if profile.size < 2:
        return []
    step = max(1, profile.size // max_points)
    peak = float(profile.max()) or 1.0
    last_index = max(profile.size - 1, 1)
    return [
        (round(index / last_index, 4), round(float(profile[index]) / peak, 4))
        for index in range(0, profile.size, step)
    ]


def build_image_analysis_result(
    *,
    job_id: str,
    item_id: str,
    method_id: str,
    profile: AnalysisProfileId,
    outcome: ImageAnalysisOutcome,
    input_evidence: AnalysisInputEvidence,
    trace_id: str,
    started_at: str,
    completed_at: str,
    artifacts_dir: Path | None = None,
    colour_roles: dict[str, str] | None = None,
    extra_parameters: dict[str, Any] | None = None,
) -> AnalysisResult:
    """Assemble the contract result, with the verdict pinned away from PASS/FAIL.

    `colour_roles` maps a trace colour onto `candidate` or `reference`. It comes
    from the figure's legend, which the extractor cannot read: in 图谱数据库 the
    candidate HLX03 is red and the reference CN-Humira is blue, the opposite of
    what a naive red-is-reference default would assume. Without the mapping the
    traces stay labelled by colour rather than being guessed at.
    """
    rule_outcome = RuleEvaluationOutcome.REVIEW
    verdict = AnalysisVerdict.REVIEW

    rationale_zh = (
        "本结果来自图片降级分析。图片证据不能确立也不能否定生物类似性，"
        "因此不输出 PASS/FAIL，一律转人工复核。"
    )
    if not outcome.calibration.reliable:
        rationale_zh += "坐标校准不可靠，未输出任何 Da / m·z⁻¹ / 保留时间数值。"

    roles = colour_roles or {}

    overlay_name = None
    normalized_traces: dict[str, list[dict[str, float]]] | None = None
    present_traces = [trace for trace in outcome.traces if trace.present]
    first_trace = present_traces[0] if present_traces else None
    second_trace = present_traces[1] if len(present_traces) > 1 else None
    if roles and first_trace is not None and second_trace is not None:
        by_role = {
            roles.get(trace.colour, trace.label): trace for trace in present_traces
        }
        if "reference" in by_role and "candidate" in by_role:
            first_trace = by_role["reference"]
            second_trace = by_role["candidate"]
    if artifacts_dir is not None and first_trace is not None and second_trace is not None:
        first_points = _downsample_trace(first_trace)
        second_points = _downsample_trace(second_trace)
        first_label = roles.get(first_trace.colour, first_trace.label)
        second_label = roles.get(second_trace.colour, second_trace.label)
        overlay_path = write_chromatogram_overlay_plot(
            first_points,
            second_points,
            artifacts_dir / "overlay-plot.png",
            reference_label=first_label,
            candidate_label=second_label,
            x_label="Normalized column (not retention time)",
            title="Image trace overlay — pixel column, not RT",
        )
        overlay_name = overlay_path.name
        normalized_traces = {
            first_label: [{"x": x, "y": y} for x, y in first_points],
            second_label: [{"x": x, "y": y} for x, y in second_points],
        }

    parameters: dict[str, Any] = {
        "figureKind": outcome.figure_kind,
        "imageWidth": outcome.width,
        "imageHeight": outcome.height,
        "calibrationReliable": outcome.calibration.reliable,
        "calibrationReason": outcome.calibration.reason,
        "calibrationAxisName": outcome.calibration.axis_name,
        "calibrationUnit": outcome.calibration.unit,
        "ocrLineCount": outcome.table.ocr_line_count if outcome.table else None,
        "shadedBlockCount": outcome.shaded_block_count,
        "normalizedTraceXUnit": "normalized-column",
        "normalizedTracesAreNotRetentionTime": True,
        "figureLayout": outcome.layout.kind if outcome.layout else None,
        "figureLayoutCorroborated": outcome.layout.corroborated if outcome.layout else None,
        "figureLayoutReason": outcome.layout.reason if outcome.layout else None,
        "colourRoles": roles or None,
        "ocrNumericTokens": list(outcome.ocr_numeric_tokens) or None,
        "ocrCalibrationApplied": False,
        "traceColourPixelCounts": {
            trace.colour: trace.pixel_count for trace in outcome.traces
        }
        or None,
    }
    if extra_parameters:
        parameters.update(extra_parameters)
    if normalized_traces is not None:
        parameters["normalizedTraces"] = normalized_traces
    if outcome.peak_pairs:
        parameters["peakPairs"] = [
            {
                "firstNormalisedPosition": (
                    pair.first_peak.normalised_position if pair.first_peak else None
                ),
                "secondNormalisedPosition": (
                    pair.second_peak.normalised_position if pair.second_peak else None
                ),
                "firstAxisValue": pair.first_peak.axis_value if pair.first_peak else None,
                "secondAxisValue": pair.second_peak.axis_value if pair.second_peak else None,
                "normalisedShift": pair.normalised_shift,
                "axisShift": pair.axis_shift,
                "matched": pair.matched,
            }
            for pair in outcome.peak_pairs
        ]

    return AnalysisResult(
        schema_version=ANALYSIS_RESULT_SCHEMA_VERSION,
        rule_set_version=ANALYSIS_RULE_SET_VERSION,
        job_id=job_id,
        item_id=item_id,
        method_id=method_id,
        profile=profile,
        input_evidence=input_evidence,
        extracted_features=build_extracted_features(outcome),
        rule_evaluation=[
            AnalysisRuleEvaluation(
                rule_id=f"{item_id}-image-fallback",
                source_sheet="3.特性鉴定相似性评价方案",
                source_row=0,
                source_cells=[],
                outcome=rule_outcome,
                rationale=LocalizedText(
                    zh=rationale_zh,
                    en=(
                        "Image-only fallback analysis. Image evidence can neither establish nor "
                        "refute biosimilarity, so no PASS/FAIL is issued and the result is routed "
                        "to human review."
                    ),
                ),
            )
        ],
        verdict=verdict,
        verdict_rationale=LocalizedText(
            zh="图片降级分析仅供探索性参考，不构成相似性结论。",
            en="Image-only fallback analysis is exploratory and is not a similarity conclusion.",
        ),
        artifacts=AnalysisArtifacts(overlay_plot=overlay_name),
        evidence=AnalysisRunEvidence(
            tool_versions=_tool_versions(),
            parameters=parameters,
            quality_gates=[
                AnalysisQualityGate(
                    name="imageConsistentCorrelation",
                    value=IMAGE_CONSISTENT_CORRELATION,
                    unit=None,
                    threshold_kind=ThresholdKind.ALGORITHM_QUALITY_GATE,
                    purpose=LocalizedText(
                        zh="图像层“形状一致”相关系数下限，只描述图片，不是产品相似性限度。",
                        en="Image-level consistent-correlation floor. It describes pictures, not products.",
                    ),
                ),
                AnalysisQualityGate(
                    name="imageDifferentCorrelation",
                    value=IMAGE_DIFFERENT_CORRELATION,
                    unit=None,
                    threshold_kind=ThresholdKind.ALGORITHM_QUALITY_GATE,
                    purpose=LocalizedText(
                        zh="图像层“可见差异”相关系数上限，只描述图片，不是产品相似性限度。",
                        en="Image-level difference-correlation ceiling. It describes pictures, not products.",
                    ),
                ),
            ],
            trace_id=trace_id,
            started_at=started_at,
            completed_at=completed_at,
        ),
        provenance=AnalysisResultProvenance(
            summary=LocalizedText(
                zh=f"图片降级分析（{outcome.figure_kind}）",
                en=f"Image-only fallback analysis ({outcome.figure_kind})",
            ),
            what_it_is=LocalizedText(
                zh="从已渲染图谱中提取的探索性特征，用于人工比对定向。",
                en="Exploratory features read off a rendered figure, to orient human comparison.",
            ),
            what_it_is_not=LocalizedText(
                zh=(
                    "不是原始数据分析，不是实测值，不构成生物类似性判定；"
                    "相似度指标只描述图像相像程度，不得据此判定产品相似。"
                ),
                en=(
                    "Not raw-data analysis, not a measured value, and not a biosimilarity "
                    "decision. Similarity metrics describe picture resemblance only."
                ),
            ),
            data_source=LocalizedText(
                zh="文献插图截图（image-only）",
                en="Figure extracted from a publication (image-only)",
            ),
            sample_pairing=input_evidence.sample_pairing.description,
            source_files=[outcome.file_name],
            input_hashes=input_hashes_from_evidence(input_evidence),
            external_links=[],
        ),
        warnings=list(outcome.warnings),
        limitations=list(outcome.limitations),
        disclaimer=LocalizedText(
            zh="图片分析不得作为监管申报证据，也不得替代原始数据分析。",
            en="Image analysis is not regulatory evidence and does not replace raw-data analysis.",
        ),
    )


def _tool_versions() -> dict[str, str]:
    versions: dict[str, str] = {}
    try:
        import cv2

        versions["OpenCV"] = cv2.__version__
    except Exception:  # noqa: BLE001 — version reporting must not fail the run
        pass
    try:
        import skimage

        versions["scikit-image"] = skimage.__version__
    except Exception:  # noqa: BLE001
        pass
    try:
        import pytesseract

        from app.analysis.image_fallback.tables import _configure_tesseract

        _configure_tesseract()
        versions["Tesseract"] = str(pytesseract.get_tesseract_version())
    except Exception:  # noqa: BLE001
        pass
    return versions


def image_input_evidence_defaults() -> tuple[AnalysisDataSource, AnalysisEvidenceLevel]:
    return AnalysisDataSource.IMAGE_ONLY, AnalysisEvidenceLevel.IMAGE_ONLY_EXPLORATORY


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()
