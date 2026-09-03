# -*- coding: utf-8 -*-
"""End-to-end curve overlay pipeline (P26)."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from app.analysis.curve_overlay.constants import (
    CURVE_OVERLAY_PROFILE,
    PEARSON_QUALITY_GATE,
    REGION_AREA_DELTA_PP_GATE,
)
from app.analysis.curve_overlay.kinds import CurveKind, get_curve_kind
from app.analysis.curve_overlay.metrics import compute_curve_metrics
from app.analysis.curve_overlay.simulation import CurveTrace, simulate_curve_pair
from app.analysis.peptide_map.loading import load_chromatogram_points
from app.analysis.plots import write_chromatogram_overlay_plot
from app.analysis.provenance import input_hashes_from_evidence
from app.models.analysis_contract import (
    ANALYSIS_RESULT_SCHEMA_VERSION,
    ANALYSIS_RULE_SET_VERSION,
    AnalysisArtifacts,
    AnalysisChromatogramPeak,
    AnalysisDataSource,
    AnalysisEvidenceLevel,
    AnalysisExtractedFeatures,
    AnalysisInputEvidence,
    AnalysisInputFileDescriptor,
    AnalysisQualityGate,
    AnalysisResult,
    AnalysisResultProvenance,
    AnalysisRuleEvaluation,
    AnalysisRunEvidence,
    AnalysisSamplePairing,
    AnalysisVerdict,
    LocalizedText,
    RuleEvaluationOutcome,
    ThresholdKind,
)


@dataclass(frozen=True)
class CurveOverlayPipelineResult:
    kind: CurveKind
    reference_trace: CurveTrace
    candidate_trace: CurveTrace
    metrics: CurveMetrics
    synthetic_demo: bool
    overlay_plot_path: Path | None


def _write_overlay(
    kind: CurveKind,
    reference: CurveTrace,
    candidate: CurveTrace,
    work_dir: Path | None,
    *,
    synthetic_demo: bool,
) -> Path | None:
    if work_dir is None:
        return None
    title = kind.plot_title_en if synthetic_demo else kind.plot_title_en.replace(
        " (synthetic demo)", ""
    )
    return write_chromatogram_overlay_plot(
        list(reference.points),
        list(candidate.points),
        work_dir / "overlay-plot.png",
        reference_label="illustrative-reference",
        candidate_label="illustrative-candidate",
        x_label=kind.x_label_en,
        y_label=kind.y_label_en,
        title=title,
    )


def run_synthetic_demo(
    *,
    item_id: str,
    work_dir: Path | None = None,
) -> CurveOverlayPipelineResult:
    kind, reference, candidate = simulate_curve_pair(item_id)
    metrics = compute_curve_metrics(kind, reference, candidate)
    return CurveOverlayPipelineResult(
        kind=kind,
        reference_trace=reference,
        candidate_trace=candidate,
        metrics=metrics,
        synthetic_demo=True,
        overlay_plot_path=_write_overlay(
            kind, reference, candidate, work_dir, synthetic_demo=True
        ),
    )


def run_uploaded_curves(
    *,
    item_id: str,
    reference_path: Path,
    candidate_path: Path,
    work_dir: Path | None = None,
) -> CurveOverlayPipelineResult:
    kind = get_curve_kind(item_id)
    reference = CurveTrace(
        label="reference",
        points=tuple(load_chromatogram_points(reference_path)),
    )
    candidate = CurveTrace(
        label="candidate",
        points=tuple(load_chromatogram_points(candidate_path)),
    )
    metrics = compute_curve_metrics(kind, reference, candidate)
    return CurveOverlayPipelineResult(
        kind=kind,
        reference_trace=reference,
        candidate_trace=candidate,
        metrics=metrics,
        synthetic_demo=False,
        overlay_plot_path=_write_overlay(
            kind, reference, candidate, work_dir, synthetic_demo=False
        ),
    )


def _quality_gates() -> list[AnalysisQualityGate]:
    return [
        AnalysisQualityGate(
            name="pearsonCorrelationFloor",
            value=PEARSON_QUALITY_GATE,
            unit=None,
            threshold_kind=ThresholdKind.ALGORITHM_QUALITY_GATE,
            purpose=LocalizedText(
                zh="对齐后轮廓 Pearson 相关的算法观察门，不是生物类似性限度。",
                en="Pearson-correlation floor on aligned traces; an algorithm gate, not a biosimilarity limit.",
            ),
        ),
        AnalysisQualityGate(
            name="regionAreaDeltaPp",
            value=REGION_AREA_DELTA_PP_GATE,
            unit="pp",
            threshold_kind=ThresholdKind.ALGORITHM_QUALITY_GATE,
            purpose=LocalizedText(
                zh="分区面积百分点差的算法观察门，不是质量范围合格线。",
                en="Region area-percentage delta used as an algorithm gate, not a quality-range pass line.",
            ),
        ),
    ]


def build_analysis_result(
    *,
    job_id: str,
    item_id: str,
    method_id: str,
    pipeline: CurveOverlayPipelineResult,
    input_evidence: AnalysisInputEvidence,
    trace_id: str,
    started_at: str,
    completed_at: str,
    artifacts_dir: Path | None = None,
) -> AnalysisResult:
    overlay_name = None
    if pipeline.overlay_plot_path is not None and artifacts_dir is not None:
        destination = artifacts_dir / pipeline.overlay_plot_path.name
        if pipeline.overlay_plot_path != destination:
            destination.write_bytes(pipeline.overlay_plot_path.read_bytes())
        overlay_name = destination.name

    candidate_peaks = [
        AnalysisChromatogramPeak(retention_time=x, intensity=y)
        for x, y in pipeline.candidate_trace.points
    ]
    return AnalysisResult(
        schema_version=ANALYSIS_RESULT_SCHEMA_VERSION,
        rule_set_version=ANALYSIS_RULE_SET_VERSION,
        job_id=job_id,
        item_id=item_id,
        method_id=method_id,
        profile=CURVE_OVERLAY_PROFILE,
        input_evidence=input_evidence,
        extracted_features=AnalysisExtractedFeatures(chromatogram_peaks=candidate_peaks),
        rule_evaluation=[
            AnalysisRuleEvaluation(
                rule_id=f"{item_id}-curve-overlay-review",
                source_sheet="3.特性鉴定相似性评价方案",
                source_row=0,
                source_cells=[],
                outcome=RuleEvaluationOutcome.REVIEW,
                rationale=LocalizedText(
                    zh="本项目无 V2 Sheet3 程序规则。曲线相关与面积%只作算法观察，转入人工复核。",
                    en="This item has no V2 sheet 3 program rule. Curve correlation and area % are algorithm observations and route to review.",
                ),
            )
        ],
        verdict=AnalysisVerdict.REVIEW,
        verdict_rationale=LocalizedText(
            zh="合成或导出曲线叠加不能替代程序判定。法规结论固定为复核。",
            en="Synthetic or exported curve overlay cannot replace a program rule. The regulatory verdict stays REVIEW.",
        ),
        artifacts=AnalysisArtifacts(overlay_plot=overlay_name),
        evidence=AnalysisRunEvidence(
            tool_versions={"numpy": _numpy_version()},
            parameters={
                "syntheticDemo": pipeline.synthetic_demo,
                "curveKind": pipeline.kind.item_id,
                "pearsonR": pipeline.metrics.pearson_r,
                "rmse": pipeline.metrics.rmse,
                "overlayXLabel": {
                    "zh": pipeline.kind.x_label_zh,
                    "en": pipeline.kind.x_label_en,
                },
                "curveRegions": [
                    {
                        "id": region.region_id,
                        "referencePercent": region.reference_percent,
                        "candidatePercent": region.candidate_percent,
                        "deltaPp": region.delta_pp,
                    }
                    for region in pipeline.metrics.regions
                ],
                "curvePeaks": {
                    "reference": [
                        {"x": peak.x, "height": peak.height}
                        for peak in pipeline.metrics.reference_peaks
                    ],
                    "candidate": [
                        {"x": peak.x, "height": peak.height}
                        for peak in pipeline.metrics.candidate_peaks
                    ],
                },
                "referenceChromatogramPeaks": [
                    {"retentionTime": x, "intensity": y}
                    for x, y in pipeline.reference_trace.points
                ],
            },
            quality_gates=_quality_gates(),
            trace_id=trace_id,
            started_at=started_at,
            completed_at=completed_at,
        ),
        provenance=AnalysisResultProvenance(
            summary=LocalizedText(
                zh=pipeline.kind.plot_title_zh,
                en=pipeline.kind.plot_title_en,
            ),
            what_it_is=LocalizedText(
                zh="候选与参照两列曲线对齐后的叠加、相关、检峰与分区面积%。",
                en="Aligned overlay of candidate and reference traces with correlation, peaks and region area %.",
            ),
            what_it_is_not=LocalizedText(
                zh="不是生物类似性合格判定，也不是实测批次的质量范围。",
                en="Not a biosimilarity pass/fail test and not a quality range from real lots.",
            ),
            data_source=LocalizedText(
                zh="illustrative 合成演示曲线" if pipeline.synthetic_demo else "用户上传两列表",
                en="illustrative synthetic demo traces"
                if pipeline.synthetic_demo
                else "user-uploaded two-column tables",
            ),
            sample_pairing=input_evidence.sample_pairing.description,
            source_files=[],
            input_hashes=input_hashes_from_evidence(input_evidence),
            external_links=[],
        ),
        warnings=["合成曲线不是仪器谱图，不得当作实测批次。"] if pipeline.synthetic_demo else [],
        limitations=[
            "V2 Sheet3 未为本项目编写程序规则，verdict 固定 REVIEW。",
            "Pearson 相关与面积百分点差是 algorithmQualityGate，不是相似性限度。",
        ],
        disclaimer=LocalizedText(
            zh="工具能运行不等于方法学已验证，更不等于符合 GxP / 21 CFR Part 11。",
            en="Running the toolchain does not validate the method or imply GxP / 21 CFR Part 11 compliance.",
        ),
    )


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _numpy_version() -> str:
    import numpy

    return numpy.__version__


def build_input_evidence(
    *,
    candidate_label: str,
    reference_label: str,
    pairing_description: LocalizedText,
    is_head_to_head_biosimilar_design: bool,
    candidate_files: list[AnalysisInputFileDescriptor],
    reference_files: list[AnalysisInputFileDescriptor],
    sequence_files: list[AnalysisInputFileDescriptor],
    synthetic_demo: bool,
) -> AnalysisInputEvidence:
    return AnalysisInputEvidence(
        data_source=AnalysisDataSource.SYNTHETIC_DEMO
        if synthetic_demo
        else AnalysisDataSource.EXPORTED_TABLE,
        evidence_level=AnalysisEvidenceLevel.STRUCTURED_EXPORT_ANALYSIS,
        candidate_files=candidate_files,
        reference_files=reference_files,
        sequence_files=sequence_files,
        sample_pairing=AnalysisSamplePairing(
            candidate_label=candidate_label,
            reference_label=reference_label,
            description=pairing_description,
            is_head_to_head_biosimilar_design=is_head_to_head_biosimilar_design,
        ),
    )
