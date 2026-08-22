# -*- coding: utf-8 -*-
"""End-to-end MS/MS sequence confirmation pipeline (P9)."""

from __future__ import annotations

import csv
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np

from app.analysis.intact_mass.sequence import (
    ProteinSequence,
    load_bsa_demo_fixture,
    load_fasta_file,
    sequence_options_from_parameters,
)
from app.analysis.intact_mass.theory import pyopenms_version
from app.analysis.ms1_coverage.digestion import TheoreticalPeptide, digest_sequence
from app.analysis.ms1_coverage.matching import match_and_cover
from app.analysis.ms1_coverage.simulation import simulate_observed_masses
from app.analysis.ms1_coverage.substitution import introduce_substitution
from app.analysis.msms.comet_runner import (
    comet_available,
    comet_version,
    run_comet_search,
)
from app.analysis.msms.constants import (
    BIOSIMILAR_SIGNATURE_PEPTIDE,
    COVERAGE_DROP_SANITY_PERCENT,
    COVERAGE_INSUFFICIENT_PERCENT,
    COVERAGE_NUMERIC_BOUNDARY_ZH,
    FDR_THRESHOLD,
    FRAGMENT_TOLERANCE_PPM,
    INNOVATOR_SIGNATURE_PEPTIDE,
    MSMS_ITEM_RULES,
    PRECURSOR_TOLERANCE_PPM,
    PROTEASE_NAME,
    RANDOM_SEED,
)
from app.analysis.msms.coverage import MsmsCoverageResult, compute_msms_coverage
from app.analysis.msms.fragment_ions import FragmentAnnotationResult
from app.analysis.msms.psm_parser import PeptideSpectrumMatch
from app.analysis.msms.rules import RuleDecision, decide_rule_outcome
from app.analysis.msms.simulation import (
    build_synthetic_psms,
    signature_fragment_annotation,
    substitution_site_from_peptides,
)
from app.analysis.plots import write_fragment_ion_plot, write_sequence_coverage_plot
from app.analysis.provenance import input_hashes_from_evidence
from app.models.analysis_contract import (
    ANALYSIS_RESULT_SCHEMA_VERSION,
    ANALYSIS_RULE_SET_VERSION,
    AnalysisArtifacts,
    AnalysisDataSource,
    AnalysisEvidenceLevel,
    AnalysisExtractedFeatures,
    AnalysisFragmentIon,
    AnalysisInputEvidence,
    AnalysisInputFileDescriptor,
    AnalysisResult,
    AnalysisResultProvenance,
    AnalysisRuleEvaluation,
    AnalysisRunEvidence,
    AnalysisSamplePairing,
    AnalysisQualityGate,
    CoverageDefinition,
    LocalizedText,
    ThresholdKind,
)
from app.security.ascii_workspace import ensure_ascii_directory


@dataclass(frozen=True)
class MsmsPipelineResult:
    protein: ProteinSequence
    reference_coverage: MsmsCoverageResult
    candidate_coverage: MsmsCoverageResult
    decision: RuleDecision
    substitution_position: int | None
    sequence_difference_detected: bool
    synthetic_demo: bool
    comet_used: bool
    reference_psm_count: int
    candidate_psm_count: int
    fdr_threshold: float
    signature_innovator: FragmentAnnotationResult
    signature_biosimilar: FragmentAnnotationResult
    psm_table_path: Path | None


def _psms_from_matched_peptides(
    peptides: tuple[Any, ...],
    *,
    start_scan: int = 1,
) -> list[PeptideSpectrumMatch]:
    psms: list[PeptideSpectrumMatch] = []
    for index, peptide in enumerate(peptides, start=start_scan):
        mass_da = getattr(peptide, "theoretical_mass_da", None) or getattr(
            peptide, "monoisotopic_mass_da"
        )
        psms.append(
            PeptideSpectrumMatch(
                rank=1,
                scan=index,
                precursor_mz=float(mass_da),
                xcorr=0.95,
                expect=1e-8,
                num_matched_ions=10,
                num_total_ions=18,
                peptide_sequence=peptide.sequence,
                is_decoy=False,
            )
        )
    return psms


def _write_psm_table(path: Path, psms: list[PeptideSpectrumMatch]) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(
            [
                "scan",
                "peptideSequence",
                "precursorMz",
                "xcorr",
                "expect",
                "numMatchedIons",
                "isDecoy",
            ]
        )
        for psm in psms:
            writer.writerow(
                [
                    psm.scan,
                    psm.peptide_sequence,
                    f"{psm.precursor_mz:.4f}",
                    f"{psm.xcorr:.4f}",
                    f"{psm.expect:.2e}",
                    psm.num_matched_ions,
                    int(psm.is_decoy),
                ]
            )
    return path


def run_synthetic_demo(
    *,
    item_id: str,
    sequence_path: Path | None = None,
    work_dir: Path | None = None,
    parameters: dict[str, Any] | None = None,
) -> MsmsPipelineResult:
    protein = (
        load_fasta_file(sequence_path, sequence_options_from_parameters(parameters))
        if sequence_path is not None
        else load_bsa_demo_fixture()
    )
    reference_sequence = protein.mature_sequence
    reference_peptides = digest_sequence(reference_sequence)

    rng = np.random.default_rng(RANDOM_SEED)
    reference_observed = simulate_observed_masses(reference_peptides, rng)
    reference_ms1 = match_and_cover(reference_peptides, reference_observed, len(reference_sequence))

    candidate_sequence, substitution_position = introduce_substitution(reference_sequence)
    candidate_peptides_true = digest_sequence(candidate_sequence)
    candidate_observed = simulate_observed_masses(candidate_peptides_true, rng)
    candidate_ms1 = match_and_cover(reference_peptides, candidate_observed, len(reference_sequence))

    reference_psms = _psms_from_matched_peptides(reference_ms1.matched_peptides)
    candidate_psms = _psms_from_matched_peptides(
        candidate_ms1.matched_peptides,
        start_scan=len(reference_psms) + 1,
    )

    reference_coverage = compute_msms_coverage(reference_sequence, tuple(reference_psms))
    candidate_coverage = compute_msms_coverage(reference_sequence, tuple(candidate_psms))

    sequence_difference_detected = substitution_site_from_peptides(
        substitution_position=substitution_position,
        reference_peptides=reference_peptides,
        candidate_unmatched=candidate_ms1.unmatched_peptides,
    )

    decision = decide_rule_outcome(
        item_id,
        reference_coverage_percent=reference_coverage.coverage_percent,
        candidate_coverage_percent=candidate_coverage.coverage_percent,
        confirmed_sequence_difference=sequence_difference_detected,
        synthetic_demo=True,
        comet_used=False,
    )

    innovator_signature, biosimilar_signature = signature_fragment_annotation(
        tolerance_ppm=FRAGMENT_TOLERANCE_PPM,
    )

    psm_table_path = None
    if work_dir is not None:
        psm_table_path = _write_psm_table(work_dir / "candidate-psm-table.csv", candidate_psms)

    return MsmsPipelineResult(
        protein=protein,
        reference_coverage=reference_coverage,
        candidate_coverage=candidate_coverage,
        decision=decision,
        substitution_position=substitution_position,
        sequence_difference_detected=sequence_difference_detected,
        synthetic_demo=True,
        comet_used=False,
        reference_psm_count=len(reference_psms),
        candidate_psm_count=len(candidate_psms),
        fdr_threshold=FDR_THRESHOLD,
        signature_innovator=innovator_signature,
        signature_biosimilar=biosimilar_signature,
        psm_table_path=psm_table_path,
    )


def _spectra_suffix(path: Path) -> bool:
    return path.suffix.lower() in {".mzml", ".mgf", ".mzxml", ".ms2", ".cms2", ".bms2"}


def run_comet_uploaded(
    *,
    item_id: str,
    sequence_path: Path,
    reference_spectra_path: Path | None,
    candidate_spectra_path: Path,
    work_dir: Path | None = None,
    parameters: dict[str, Any] | None = None,
) -> MsmsPipelineResult:
    if not comet_available():
        raise RuntimeError("Comet is not installed; MS/MS raw-data analysis requires Comet (D5).")

    protein = load_fasta_file(sequence_path, sequence_options_from_parameters(parameters))
    reference_sequence = protein.mature_sequence
    ascii_dir = work_dir or ensure_ascii_directory()

    reference_psms: list[PeptideSpectrumMatch] = []
    if reference_spectra_path is not None and _spectra_suffix(reference_spectra_path):
        reference_result = run_comet_search(
            spectra_path=reference_spectra_path,
            fasta_path=sequence_path,
            work_dir=ascii_dir / "reference-comet",
            input_label="reference",
        )
        reference_psms = list(reference_result.filtered_psms)

    candidate_result = run_comet_search(
        spectra_path=candidate_spectra_path,
        fasta_path=sequence_path,
        work_dir=ascii_dir / "candidate-comet",
        input_label="candidate",
    )
    candidate_psms = list(candidate_result.filtered_psms)

    reference_coverage = compute_msms_coverage(
        reference_sequence,
        tuple(reference_psms) if reference_psms else tuple(candidate_psms),
    )
    candidate_coverage = compute_msms_coverage(reference_sequence, tuple(candidate_psms))

    reference_peptides = digest_sequence(reference_sequence)
    unmatched = tuple(
        peptide
        for peptide in reference_peptides
        if peptide.sequence
        not in {psm.peptide_sequence for psm in candidate_psms if not psm.is_decoy}
    )
    coverage_drop = reference_coverage.coverage_percent - candidate_coverage.coverage_percent
    sequence_difference_detected = coverage_drop > COVERAGE_DROP_SANITY_PERCENT and len(unmatched) > 0

    decision = decide_rule_outcome(
        item_id,
        reference_coverage_percent=reference_coverage.coverage_percent,
        candidate_coverage_percent=candidate_coverage.coverage_percent,
        confirmed_sequence_difference=sequence_difference_detected,
        synthetic_demo=False,
        comet_used=True,
    )

    innovator_signature, biosimilar_signature = signature_fragment_annotation(
        tolerance_ppm=FRAGMENT_TOLERANCE_PPM,
    )

    psm_table_path = None
    if work_dir is not None:
        psm_table_path = _write_psm_table(work_dir / "candidate-psm-table.csv", candidate_psms)

    return MsmsPipelineResult(
        protein=protein,
        reference_coverage=reference_coverage,
        candidate_coverage=candidate_coverage,
        decision=decision,
        substitution_position=None,
        sequence_difference_detected=sequence_difference_detected,
        synthetic_demo=False,
        comet_used=True,
        reference_psm_count=len(reference_psms),
        candidate_psm_count=len(candidate_psms),
        fdr_threshold=FDR_THRESHOLD,
        signature_innovator=innovator_signature,
        signature_biosimilar=biosimilar_signature,
        psm_table_path=psm_table_path,
    )


def build_analysis_result(
    *,
    job_id: str,
    item_id: str,
    method_id: str,
    pipeline: MsmsPipelineResult,
    input_evidence: AnalysisInputEvidence,
    trace_id: str,
    started_at: str,
    completed_at: str,
    artifacts_dir: Path | None = None,
) -> AnalysisResult:
    metadata = MSMS_ITEM_RULES.get(item_id) or MSMS_ITEM_RULES["msms-sequence-coverage"]
    psm_table_name = None
    coverage_plot_name = None
    fragment_plot_name = None
    if pipeline.psm_table_path is not None and artifacts_dir is not None:
        destination = artifacts_dir / pipeline.psm_table_path.name
        if pipeline.psm_table_path != destination:
            destination.write_bytes(pipeline.psm_table_path.read_bytes())
        psm_table_name = destination.name
    if artifacts_dir is not None:
        coverage_plot_path = write_sequence_coverage_plot(
            pipeline.candidate_coverage.sequence_length,
            list(pipeline.candidate_coverage.uncovered_regions),
            artifacts_dir / "sequence-coverage-plot.png",
            coverage_percent=pipeline.candidate_coverage.coverage_percent,
        )
        coverage_plot_name = coverage_plot_path.name
        fragment_ions_for_plot = [
            (ion.ion_type, ion.ordinal, ion.observed_mz)
            for ion in pipeline.signature_innovator.ions
        ]
        fragment_plot_path = write_fragment_ion_plot(
            fragment_ions_for_plot,
            artifacts_dir / "fragment-ion-plot.png",
            peptide_sequence=pipeline.signature_innovator.peptide_sequence,
        )
        fragment_plot_name = fragment_plot_path.name

    matched_sequences = [peptide.sequence for peptide in pipeline.candidate_coverage.confirmed_peptides]
    fragment_ions: list[AnalysisFragmentIon] = list(pipeline.signature_innovator.ions[:6])
    fragment_ions.extend(pipeline.signature_biosimilar.ions[:6])

    tool_versions: dict[str, str] = {"pyOpenMS": pyopenms_version()}
    comet_label = comet_version()
    if comet_label:
        tool_versions["Comet"] = comet_label

    return AnalysisResult(
        schema_version=ANALYSIS_RESULT_SCHEMA_VERSION,
        rule_set_version=ANALYSIS_RULE_SET_VERSION,
        job_id=job_id,
        item_id=item_id,
        method_id=method_id,
        profile="msms-sequence",
        input_evidence=input_evidence,
        extracted_features=AnalysisExtractedFeatures(
            matched_peptides=matched_sequences,
            unmatched_peptides=[],
            coverage_percent=pipeline.candidate_coverage.coverage_percent,
            coverage_definition=CoverageDefinition.COMBINED,
            coverage_percent_by_definition={
                CoverageDefinition.CONTROL.value: pipeline.reference_coverage.coverage_percent,
                CoverageDefinition.ANALYTE.value: pipeline.candidate_coverage.coverage_percent,
                CoverageDefinition.COMBINED.value: pipeline.candidate_coverage.coverage_percent,
            },
            uncovered_regions=list(pipeline.candidate_coverage.uncovered_regions),
            fragment_ions=fragment_ions,
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
        artifacts=AnalysisArtifacts(
            peak_table=psm_table_name,
            sequence_coverage_plot=coverage_plot_name,
            fragment_ion_plot=fragment_plot_name,
        ),
        evidence=AnalysisRunEvidence(
            tool_versions=tool_versions,
            parameters={
                "protease": PROTEASE_NAME,
                "precursorTolerancePpm": PRECURSOR_TOLERANCE_PPM,
                "fragmentTolerancePpm": FRAGMENT_TOLERANCE_PPM,
                "fdrThreshold": pipeline.fdr_threshold,
                "referenceCoveragePercent": pipeline.reference_coverage.coverage_percent,
                "candidateCoveragePercent": pipeline.candidate_coverage.coverage_percent,
                "referencePsmCount": pipeline.reference_psm_count,
                "candidatePsmCount": pipeline.candidate_psm_count,
                "substitutionPosition": pipeline.substitution_position,
                "sequenceDifferenceDetected": pipeline.sequence_difference_detected,
                "syntheticDemo": pipeline.synthetic_demo,
                "cometUsed": pipeline.comet_used,
                "sequenceLength": pipeline.candidate_coverage.sequence_length,
                "accession": pipeline.protein.accession,
                "sequenceSource": pipeline.protein.sequence_source,
                "signaturePeptides": {
                    "innovator": INNOVATOR_SIGNATURE_PEPTIDE,
                    "biosimilar": BIOSIMILAR_SIGNATURE_PEPTIDE,
                },
            },
            quality_gates=[
                AnalysisQualityGate(
                    name="coverageInsufficientPercent",
                    value=COVERAGE_INSUFFICIENT_PERCENT,
                    unit="percent",
                    threshold_kind=ThresholdKind.ALGORITHM_QUALITY_GATE,
                    purpose=LocalizedText(
                        zh="MS/MS 覆盖率算法下限，不是 Sheet3 合格线。",
                        en="MS/MS coverage floor for the algorithm, not a Sheet 3 acceptance limit.",
                    ),
                ),
                AnalysisQualityGate(
                    name="coverageDropSanityPercent",
                    value=COVERAGE_DROP_SANITY_PERCENT,
                    unit="percent-points",
                    threshold_kind=ThresholdKind.ALGORITHM_QUALITY_GATE,
                    purpose=LocalizedText(
                        zh="覆盖率下降的算法提示阈值，不能单独构成相似性 PASS/FAIL。",
                        en="Coverage-drop hint; it cannot by itself decide similarity.",
                    ),
                ),
                AnalysisQualityGate(
                    name="fdrThreshold",
                    value=pipeline.fdr_threshold,
                    unit="FDR",
                    threshold_kind=ThresholdKind.ALGORITHM_QUALITY_GATE,
                    purpose=LocalizedText(
                        zh="target-decoy FDR 过滤门限，属于鉴定质量控制。",
                        en="Target-decoy FDR filter; identification quality control.",
                    ),
                ),
            ],
            trace_id=trace_id,
            started_at=started_at,
            completed_at=completed_at,
        ),
        provenance=AnalysisResultProvenance(
            summary=LocalizedText(
                zh="MS/MS 序列确认与覆盖率分析",
                en="MS/MS sequence confirmation and coverage analysis",
            ),
            what_it_is=LocalizedText(
                zh="Comet 搜库 + target-decoy FDR + pyOpenMS b/y 碎片注释 + V2 Sheet3 序列确认规则。",
                en="Comet search + target-decoy FDR + pyOpenMS b/y annotation + V2 sheet 3 sequence rules.",
            ),
            what_it_is_not=LocalizedText(
                zh=(
                    "MS1 母离子质量匹配不能替代本分析；"
                    f"覆盖率百分比不是生物类似性数值合格线（K 列：{COVERAGE_NUMERIC_BOUNDARY_ZH}）。"
                ),
                en=(
                    "MS1 precursor matching cannot replace this analysis; "
                    "coverage % is not a biosimilarity pass/fail threshold."
                ),
            ),
            data_source=LocalizedText(
                zh="合成演示 PSM" if pipeline.synthetic_demo else "用户上传 MS/MS 数据 + Comet 搜库",
                en="synthetic demo PSMs" if pipeline.synthetic_demo else "user-uploaded MS/MS with Comet search",
            ),
            sample_pairing=input_evidence.sample_pairing.description,
            source_files=[path for path in [pipeline.protein.source_path] if path],
            input_hashes=input_hashes_from_evidence(input_evidence),
            external_links=[],
        ),
        warnings=(
            []
            if pipeline.comet_used
            else ["未运行 Comet 搜库；结果为合成 PSM 演示，不能声称已完成 MS/MS 序列确认。"]
        ),
        limitations=[
            "未考虑翻译后修饰的完整搜库空间，真实肽图必须配置修饰参数。"
            if pipeline.comet_used
            else "合成演示 PSM 不是仪器二级谱图搜库结果。",
            "FDR 基于 Comet 内置 decoy 模型，复杂样品需人工复核 PSM 质量。",
            f"DOCX 范例肽段 {INNOVATOR_SIGNATURE_PEPTIDE}/{BIOSIMILAR_SIGNATURE_PEPTIDE} 的 b/y 注释来自理论谱，不等同于实测归属。",
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
