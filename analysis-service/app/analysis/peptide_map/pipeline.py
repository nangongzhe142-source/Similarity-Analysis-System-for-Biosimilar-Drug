# -*- coding: utf-8 -*-
"""Peptide-map TIC overlay pipeline (P12 visualization fixture + optional CSV)."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from app.analysis.peptide_map.loading import load_chromatogram_points
from app.analysis.peptide_map.simulation import (
    CANDIDATE_LAST_PEAK_SHIFT_MIN,
    ChromatogramTrace,
    simulate_tic_pair,
)
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
    AnalysisResult,
    AnalysisResultProvenance,
    AnalysisRuleEvaluation,
    AnalysisRunEvidence,
    AnalysisSamplePairing,
    AnalysisVerdict,
    LocalizedText,
    RuleEvaluationOutcome,
)


@dataclass(frozen=True)
class PeptideMapPipelineResult:
    reference_trace: ChromatogramTrace
    candidate_trace: ChromatogramTrace
    synthetic_demo: bool
    overlay_plot_path: Path | None
    last_peak_shift_min: float | None


def run_synthetic_demo(*, work_dir: Path | None = None) -> PeptideMapPipelineResult:
    reference_trace, candidate_trace = simulate_tic_pair()
    overlay_plot_path = None
    if work_dir is not None:
        overlay_plot_path = write_chromatogram_overlay_plot(
            list(reference_trace.points),
            list(candidate_trace.points),
            work_dir / "overlay-plot.png",
            reference_label="reference",
            candidate_label="candidate",
            x_label="Retention time (min)",
            title="LC-MS TIC overlay (synthetic fixture)",
        )
    return PeptideMapPipelineResult(
        reference_trace=reference_trace,
        candidate_trace=candidate_trace,
        synthetic_demo=True,
        overlay_plot_path=overlay_plot_path,
        last_peak_shift_min=CANDIDATE_LAST_PEAK_SHIFT_MIN,
    )


def run_uploaded_chromatograms(
    *,
    reference_path: Path,
    candidate_path: Path,
    work_dir: Path | None = None,
) -> PeptideMapPipelineResult:
    reference_points = load_chromatogram_points(reference_path)
    candidate_points = load_chromatogram_points(candidate_path)
    reference_trace = ChromatogramTrace(label="reference", points=tuple(reference_points))
    candidate_trace = ChromatogramTrace(label="candidate", points=tuple(candidate_points))
    overlay_plot_path = None
    if work_dir is not None:
        overlay_plot_path = write_chromatogram_overlay_plot(
            reference_points,
            candidate_points,
            work_dir / "overlay-plot.png",
            reference_label="reference",
            candidate_label="candidate",
            x_label="Retention time (min)",
            title="LC-MS TIC overlay",
        )
    return PeptideMapPipelineResult(
        reference_trace=reference_trace,
        candidate_trace=candidate_trace,
        synthetic_demo=False,
        overlay_plot_path=overlay_plot_path,
        last_peak_shift_min=None,
    )


def build_analysis_result(
    *,
    job_id: str,
    item_id: str,
    method_id: str,
    pipeline: PeptideMapPipelineResult,
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
        AnalysisChromatogramPeak(retention_time=rt, intensity=intensity)
        for rt, intensity in pipeline.candidate_trace.points
    ]
    return AnalysisResult(
        schema_version=ANALYSIS_RESULT_SCHEMA_VERSION,
        rule_set_version=ANALYSIS_RULE_SET_VERSION,
        job_id=job_id,
        item_id=item_id,
        method_id=method_id,
        profile="peptide-map",
        input_evidence=input_evidence,
        extracted_features=AnalysisExtractedFeatures(chromatogram_peaks=candidate_peaks),
        rule_evaluation=[
            AnalysisRuleEvaluation(
                rule_id="peptide-map-overlay-review",
                source_sheet="3.特性鉴定相似性评价方案",
                source_row=0,
                source_cells=[],
                outcome=RuleEvaluationOutcome.REVIEW,
                rationale=LocalizedText(
                    zh="色谱叠加图只展示 TIC 轮廓，不把保留时间差当作生物类似性阈值。",
                    en="The overlay shows TIC shape only; retention-time shift is not a biosimilarity threshold.",
                ),
            )
        ],
        verdict=AnalysisVerdict.REVIEW,
        verdict_rationale=LocalizedText(
            zh="肽图色谱叠加为可视化辅助，合成或未对齐数据一律转人工复核。",
            en="Peptide-map overlay is a visualization aid; synthetic or unaligned data always routes to review.",
        ),
        artifacts=AnalysisArtifacts(overlay_plot=overlay_name),
        evidence=AnalysisRunEvidence(
            tool_versions={"numpy": np_version()},
            parameters={
                "syntheticDemo": pipeline.synthetic_demo,
                "lastPeakShiftMin": pipeline.last_peak_shift_min,
                "referenceChromatogramPeaks": [
                    {"retentionTime": rt, "intensity": intensity}
                    for rt, intensity in pipeline.reference_trace.points
                ],
            },
            trace_id=trace_id,
            started_at=started_at,
            completed_at=completed_at,
        ),
        provenance=AnalysisResultProvenance(
            summary=LocalizedText(
                zh="肽图 LC-MS TIC 叠加",
                en="Peptide-map LC-MS TIC overlay",
            ),
            what_it_is=LocalizedText(
                zh="候选与参照总离子流的叠加图，用于观察轮廓差异。",
                en="Overlay of candidate and reference total-ion chromatograms.",
            ),
            what_it_is_not=LocalizedText(
                zh="不是保留时间对齐算法，也不是生物类似性合格判定。",
                en="Not a retention-time alignment method and not a biosimilarity pass/fail test.",
            ),
            data_source=LocalizedText(
                zh="合成演示 TIC" if pipeline.synthetic_demo else "用户上传色谱表",
                en="synthetic demo TIC" if pipeline.synthetic_demo else "user-uploaded chromatogram tables",
            ),
            sample_pairing=input_evidence.sample_pairing.description,
            source_files=[],
            input_hashes=input_hashes_from_evidence(input_evidence),
            external_links=[],
        ),
        warnings=[]
        if not pipeline.synthetic_demo
        else ["合成 TIC 不是仪器色谱图，不得当作实测肽图比对。"],
        limitations=[
            "未做峰对齐与峰面积定量。"
            if not pipeline.synthetic_demo
            else "合成演示在末峰引入 +0.40 min 位移，仅用于叠加图回归。",
            "覆盖率与序列确认见 ms1-coverage / msms-sequence，本 profile 只提供色谱可视化。",
        ],
        disclaimer=LocalizedText(
            zh="工具能运行不等于方法学已验证，更不等于符合 GxP / 21 CFR Part 11。",
            en="Running the toolchain does not validate the method or imply GxP / 21 CFR Part 11 compliance.",
        ),
    )


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def np_version() -> str:
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
        data_source=AnalysisDataSource.SYNTHETIC_DEMO if synthetic_demo else AnalysisDataSource.MEASURED,
        evidence_level=AnalysisEvidenceLevel.RAW_DATA_ANALYSIS,
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
