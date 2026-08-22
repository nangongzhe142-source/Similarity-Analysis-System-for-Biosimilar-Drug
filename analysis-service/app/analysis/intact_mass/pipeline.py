# -*- coding: utf-8 -*-
"""End-to-end intact / subunit mass analysis pipeline."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np

from app.analysis.intact_mass.analyte_profiles import (
    DeconvolutionSettings,
    resolve_deconvolution_settings,
)
from app.analysis.intact_mass.constants import (
    HEXOSE_MASS_SHIFT_DA,
    MASS_RECOVERY_TOLERANCE_DA,
    MIN_DECONVOLUTION_R_SQUARED,
    RANDOM_SEED,
)
from app.analysis.intact_mass.deconvolution import DeconvolutionResult, deconvolve_spectrum, unidec_version
from app.analysis.intact_mass.plots import write_mirror_mass_plot
from app.analysis.provenance import input_hashes_from_evidence
from app.analysis.intact_mass.rules import (
    HeadToHeadShift,
    MassRecoveryCheck,
    MASS_ITEM_RULES,
    RuleDecision,
    decide_rule_outcome,
    deconvolution_is_reliable,
    evaluate_head_to_head_shift,
    evaluate_mass_recovery,
)
from app.analysis.intact_mass.sequence import (
    ProteinSequence,
    load_bsa_demo_fixture,
    load_protein_file,
    sequence_options_from_parameters,
)
from app.analysis.intact_mass.mzml_reader import MzmlSummary
from app.analysis.intact_mass.spectrum import load_spectrum, synthesize_charge_envelope
from app.analysis.intact_mass.theory import TheoreticalMasses, compute_theoretical_masses, pyopenms_version
from app.models.analysis_contract import (
    AnalysisArtifacts,
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
    AnalysisQualityGate,
    LocalizedText,
    RuleEvaluationOutcome,
    ThresholdKind,
)
from app.models.analysis_contract import (
    ANALYSIS_RESULT_SCHEMA_VERSION,
    ANALYSIS_RULE_SET_VERSION,
)


@dataclass(frozen=True)
class IntactMassPipelineResult:
    protein: ProteinSequence
    theoretical: TheoreticalMasses
    reference_deconvolution: DeconvolutionResult
    candidate_deconvolution: DeconvolutionResult
    recovery_checks: list[MassRecoveryCheck]
    head_to_head: HeadToHeadShift
    decision: RuleDecision
    mirror_plot_path: Path | None
    synthetic_demo: bool
    introduced_shift_da: float | None
    deconvolution_settings: DeconvolutionSettings
    reference_spectrum_summary: MzmlSummary | None = None
    candidate_spectrum_summary: MzmlSummary | None = None


def run_synthetic_demo(
    *,
    item_id: str,
    sequence_path: Path | None = None,
    introduced_shift_da: float = HEXOSE_MASS_SHIFT_DA,
    work_dir: Path | None = None,
    parameters: dict[str, Any] | None = None,
) -> IntactMassPipelineResult:
    protein = (
        load_protein_file(sequence_path, sequence_options_from_parameters(parameters))
        if sequence_path is not None
        else load_bsa_demo_fixture()
    )
    theoretical = compute_theoretical_masses(protein.mature_sequence, protein.disulfide_count)
    settings = resolve_deconvolution_settings(item_id, theoretical, parameters)
    assert theoretical.oxidized_average_mass_da is not None
    truth_mass = theoretical.oxidized_average_mass_da
    candidate_truth_mass = truth_mass + introduced_shift_da

    rng = np.random.default_rng(RANDOM_SEED)
    reference_spectrum = synthesize_charge_envelope(truth_mass, rng)
    candidate_spectrum = synthesize_charge_envelope(candidate_truth_mass, rng)

    reference_result = deconvolve_spectrum(
        reference_spectrum,
        "reference",
        work_dir,
        mass_range_da=settings.mass_range_da,
        charge_range=settings.charge_range,
    )
    candidate_result = deconvolve_spectrum(
        candidate_spectrum,
        "candidate",
        work_dir,
        mass_range_da=settings.mass_range_da,
        charge_range=settings.charge_range,
    )
    if reference_result.status != "OK" or candidate_result.status != "OK":
        raise RuntimeError("deconvolution failed for synthetic demo spectra")

    assert reference_result.base_peak_mass_da is not None
    assert candidate_result.base_peak_mass_da is not None

    recovery_checks = [
        evaluate_mass_recovery("reference", truth_mass, reference_result.base_peak_mass_da),
        evaluate_mass_recovery("candidate", candidate_truth_mass, candidate_result.base_peak_mass_da),
    ]
    head_to_head = evaluate_head_to_head_shift(
        candidate_result.base_peak_mass_da,
        reference_result.base_peak_mass_da,
        introduced_shift_da=introduced_shift_da,
    )
    decision = decide_rule_outcome(
        item_id,
        recovery_checks=recovery_checks,
        head_to_head=head_to_head,
        synthetic_demo=True,
        deconvolution_reliable=deconvolution_is_reliable(reference_result.r_squared)
        and deconvolution_is_reliable(candidate_result.r_squared),
        disulfide_known=protein.disulfide_known,
    )

    mirror_plot_path = None
    if work_dir is not None:
        mirror_plot_path = write_mirror_mass_plot(
            list(reference_result.all_peak_masses_da),
            list(candidate_result.all_peak_masses_da),
            work_dir / "mirror-plot.png",
            reference_label="reference",
            candidate_label="candidate",
        )

    return IntactMassPipelineResult(
        protein=protein,
        theoretical=theoretical,
        reference_deconvolution=reference_result,
        candidate_deconvolution=candidate_result,
        recovery_checks=recovery_checks,
        head_to_head=head_to_head,
        decision=decision,
        mirror_plot_path=mirror_plot_path,
        synthetic_demo=True,
        introduced_shift_da=introduced_shift_da,
        deconvolution_settings=settings,
    )


def run_uploaded_spectra(
    *,
    item_id: str,
    sequence_path: Path,
    reference_spectrum_path: Path,
    candidate_spectrum_path: Path,
    work_dir: Path | None = None,
    parameters: dict[str, Any] | None = None,
) -> IntactMassPipelineResult:
    protein = load_protein_file(sequence_path, sequence_options_from_parameters(parameters))
    theoretical = compute_theoretical_masses(protein.mature_sequence, protein.disulfide_count)
    settings = resolve_deconvolution_settings(item_id, theoretical, parameters)
    truth_mass = theoretical.oxidized_average_mass_da

    reference_spectrum, reference_summary = load_spectrum(reference_spectrum_path, work_dir=work_dir)
    candidate_spectrum, candidate_summary = load_spectrum(candidate_spectrum_path, work_dir=work_dir)
    reference_result = deconvolve_spectrum(
        reference_spectrum,
        "reference",
        work_dir,
        mass_range_da=settings.mass_range_da,
        charge_range=settings.charge_range,
    )
    candidate_result = deconvolve_spectrum(
        candidate_spectrum,
        "candidate",
        work_dir,
        mass_range_da=settings.mass_range_da,
        charge_range=settings.charge_range,
    )
    if reference_result.status != "OK" or candidate_result.status != "OK":
        raise RuntimeError("deconvolution failed for uploaded spectra")

    assert reference_result.base_peak_mass_da is not None
    assert candidate_result.base_peak_mass_da is not None

    recovery_checks: list[MassRecoveryCheck] = []
    if truth_mass is not None:
        recovery_checks = [
            evaluate_mass_recovery("reference", truth_mass, reference_result.base_peak_mass_da),
            evaluate_mass_recovery("candidate", truth_mass, candidate_result.base_peak_mass_da),
        ]
    head_to_head = evaluate_head_to_head_shift(
        candidate_result.base_peak_mass_da,
        reference_result.base_peak_mass_da,
        introduced_shift_da=None,
    )
    decision = decide_rule_outcome(
        item_id,
        recovery_checks=recovery_checks,
        head_to_head=head_to_head,
        synthetic_demo=False,
        deconvolution_reliable=deconvolution_is_reliable(reference_result.r_squared)
        and deconvolution_is_reliable(candidate_result.r_squared),
        disulfide_known=protein.disulfide_known,
    )

    mirror_plot_path = None
    if work_dir is not None:
        mirror_plot_path = write_mirror_mass_plot(
            list(reference_result.all_peak_masses_da),
            list(candidate_result.all_peak_masses_da),
            work_dir / "mirror-plot.png",
            reference_label="reference",
            candidate_label="candidate",
        )

    return IntactMassPipelineResult(
        protein=protein,
        theoretical=theoretical,
        reference_deconvolution=reference_result,
        candidate_deconvolution=candidate_result,
        recovery_checks=recovery_checks,
        head_to_head=head_to_head,
        decision=decision,
        mirror_plot_path=mirror_plot_path,
        synthetic_demo=False,
        introduced_shift_da=None,
        deconvolution_settings=settings,
        reference_spectrum_summary=reference_summary,
        candidate_spectrum_summary=candidate_summary,
    )


def _summary_parameters(summary: MzmlSummary | None) -> dict[str, Any] | None:
    if summary is None:
        return None
    return {
        "fileName": summary.file_name,
        "spectrumCount": summary.spectrum_count,
        "ms1SpectrumCount": summary.ms1_spectrum_count,
        "retentionTimeRangeSeconds": list(summary.retention_time_range_s),
        "mzRange": list(summary.mz_range),
        "averagedSpectrumCount": summary.averaged_spectrum_count,
    }


def _spectrum_source_parameters(pipeline: IntactMassPipelineResult) -> dict[str, Any]:
    if pipeline.synthetic_demo:
        return {"kind": "synthetic-charge-envelope"}
    reference = _summary_parameters(pipeline.reference_spectrum_summary)
    candidate = _summary_parameters(pipeline.candidate_spectrum_summary)
    return {
        "kind": "mzml-ms1-average" if reference or candidate else "text-two-column",
        "reference": reference,
        "candidate": candidate,
    }


def _intact_mass_quality_gates() -> list[AnalysisQualityGate]:
    return [
        AnalysisQualityGate(
            name="massRecoveryToleranceDa",
            value=MASS_RECOVERY_TOLERANCE_DA,
            unit="Da",
            threshold_kind=ThresholdKind.ALGORITHM_QUALITY_GATE,
            purpose=LocalizedText(
                zh="UniDec 质量轴 1 Da 分箱下的回收核对容差，只判断去卷积是否回到理论质量附近，不是相似性限度。",
                en="Recovery check against the 1 Da UniDec mass bin; not a biosimilarity limit.",
            ),
        ),
        AnalysisQualityGate(
            name="minDeconvolutionRSquared",
            value=MIN_DECONVOLUTION_R_SQUARED,
            unit=None,
            threshold_kind=ThresholdKind.ALGORITHM_QUALITY_GATE,
            purpose=LocalizedText(
                zh="去卷积拟合质量下限。低于此值说明没有解析出可靠电荷包络，不输出质量结论。",
                en="Deconvolution-fit floor. Below it no reliable charge envelope was resolved.",
            ),
        ),
    ]


def _pipeline_warnings(pipeline: IntactMassPipelineResult) -> list[str]:
    warnings: list[str] = []
    if not pipeline.protein.disulfide_known:
        warnings.append("disulfideCount is unknown; oxidised theoretical mass was not computed")
    if pipeline.protein.sequence_source == "user-fasta" and pipeline.protein.mature_start is None:
        warnings.append("FASTA used as provided; no BSA 25–607 mature-chain slice was applied")
    return warnings


def build_analysis_result(
    *,
    job_id: str,
    item_id: str,
    method_id: str,
    pipeline: IntactMassPipelineResult,
    input_evidence: AnalysisInputEvidence,
    trace_id: str,
    started_at: str,
    completed_at: str,
    artifacts_dir: Path | None = None,
) -> AnalysisResult:
    metadata = MASS_ITEM_RULES[item_id]
    settings = pipeline.deconvolution_settings
    reference_mass = pipeline.reference_deconvolution.base_peak_mass_da or 0.0
    candidate_mass = pipeline.candidate_deconvolution.base_peak_mass_da or 0.0
    delta_da = pipeline.head_to_head.observed_shift_da
    midpoint = (reference_mass + candidate_mass) / 2 if (reference_mass and candidate_mass) else 1.0
    delta_ppm = 1e6 * delta_da / midpoint if midpoint else 0.0

    mirror_plot_name = None
    if pipeline.mirror_plot_path is not None and artifacts_dir is not None:
        mirror_plot_name = pipeline.mirror_plot_path.name

    return AnalysisResult(
        schema_version=ANALYSIS_RESULT_SCHEMA_VERSION,
        rule_set_version=ANALYSIS_RULE_SET_VERSION,
        job_id=job_id,
        item_id=item_id,
        method_id=method_id,
        profile="intact-mass",
        input_evidence=input_evidence,
        extracted_features=AnalysisExtractedFeatures(
            deconvolved_masses_da=[reference_mass, candidate_mass],
            delta_da=[delta_da],
            delta_ppm=[round(delta_ppm, 2)],
        ),
        rule_evaluation=[
            AnalysisRuleEvaluation(
                rule_id=str(metadata["ruleId"]),
                source_sheet="3.特性鉴定相似性评价方案",
                source_row=int(metadata["sourceRow"]),
                source_cells=list(metadata["sourceCells"]),
                outcome=pipeline.decision.outcome,
                rationale=pipeline.decision.rationale,
            )
        ],
        verdict=pipeline.decision.verdict,
        verdict_rationale=pipeline.decision.verdict_rationale,
        artifacts=AnalysisArtifacts(mirror_plot=mirror_plot_name),
        evidence=AnalysisRunEvidence(
            tool_versions={
                "pyOpenMS": pyopenms_version(),
                "UniDec": unidec_version(),
            },
            parameters={
                "massConstantSource": f"pyOpenMS-{pyopenms_version()}-AASequence.getAverageWeight",
                "recoveryToleranceDa": MASS_RECOVERY_TOLERANCE_DA,
                "recoveryToleranceKind": ThresholdKind.ALGORITHM_QUALITY_GATE.value,
                "syntheticDemo": pipeline.synthetic_demo,
                "introducedShiftDa": pipeline.introduced_shift_da,
                "deconvolutionRSquared": {
                    "reference": pipeline.reference_deconvolution.r_squared,
                    "candidate": pipeline.candidate_deconvolution.r_squared,
                },
                "minDeconvolutionRSquared": MIN_DECONVOLUTION_R_SQUARED,
                "spectrumSource": _spectrum_source_parameters(pipeline),
                "analyteLevel": settings.profile.analyte_level,
                "treatmentState": settings.profile.treatment_state,
                "massRangeDa": list(settings.mass_range_da),
                "chargeRange": list(settings.charge_range),
                "windowSource": settings.window_source,
                "accession": pipeline.protein.accession,
                "disulfideCount": pipeline.protein.disulfide_count,
                "sequenceSource": pipeline.protein.sequence_source,
                "allowedModifications": list(settings.profile.allowed_modifications),
                "peakAssignment": settings.profile.peak_assignment,
            },
            quality_gates=_intact_mass_quality_gates(),
            trace_id=trace_id,
            started_at=started_at,
            completed_at=completed_at,
        ),
        provenance=AnalysisResultProvenance(
            summary=LocalizedText(
                zh="完整/亚基质量去卷积分析",
                en="Intact / subunit mass deconvolution analysis",
            ),
            what_it_is=LocalizedText(
                zh="pyOpenMS 理论质量 + UniDec 去卷积 + V2 Sheet3 规则评价。",
                en="pyOpenMS theoretical mass + UniDec deconvolution + V2 sheet 3 rule evaluation.",
            ),
            what_it_is_not=LocalizedText(
                zh="ΔDa/Δppm 仅反映方法准确度与观察差异，不是生物类似性数值合格线。",
                en="ΔDa/Δppm reflect method accuracy and observed differences, not biosimilarity pass/fail thresholds.",
            ),
            data_source=LocalizedText(
                zh="合成演示谱" if pipeline.synthetic_demo else "用户上传谱",
                en="synthetic demo spectra" if pipeline.synthetic_demo else "user-uploaded spectra",
            ),
            sample_pairing=input_evidence.sample_pairing.description,
            source_files=[path for path in [pipeline.protein.source_path] if path],
            input_hashes=input_hashes_from_evidence(input_evidence),
            external_links=[],
        ),
        warnings=_pipeline_warnings(pipeline),
        limitations=[
            "Synthetic demo spectra are not measured instrument data."
            if pipeline.synthetic_demo
            else "Uploaded text spectra were deconvolved without LC retention-time context."
        ],
        disclaimer=LocalizedText(
            zh="工具能运行不等于方法学已验证，更不等于符合 GxP / 21 CFR Part 11。",
            en="Running the toolchain does not validate the method or imply GxP / 21 CFR Part 11 compliance.",
        ),
    )


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


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
