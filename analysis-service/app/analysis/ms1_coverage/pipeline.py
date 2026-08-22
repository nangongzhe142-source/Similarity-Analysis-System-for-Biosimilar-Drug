# -*- coding: utf-8 -*-
"""End-to-end MS1 peptide-map coverage pipeline (P8)."""

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
from app.analysis.ms1_coverage.constants import (
    COVERAGE_DROP_SANITY_PERCENT,
    COVERAGE_NUMERIC_BOUNDARY_ZH,
    MATCH_TOLERANCE_PPM,
    MISSED_CLEAVAGES,
    MIN_PEPTIDE_LENGTH,
    MS1_CANNOT_REPLACE_MSMS_ZH,
    PROTEASE_NAME,
    RANDOM_SEED,
    DEMO_COVERAGE_SANITY_PERCENT,
)
from app.analysis.ms1_coverage.digestion import TheoreticalPeptide, digest_sequence
from app.analysis.ms1_coverage.matching import CoverageResult, match_and_cover
from app.analysis.ms1_coverage.observed_masses import load_observed_masses
from app.analysis.ms1_coverage.regions import (
    terminal_hints,
    uncovered_regions_for_result,
)
from app.analysis.ms1_coverage.rules import (
    MS1_ITEM_RULES,
    RuleDecision,
    decide_rule_outcome,
)
from app.analysis.ms1_coverage.simulation import simulate_observed_masses
from app.analysis.ms1_coverage.substitution import (
    detect_substitution_exposure,
    introduce_substitution,
    substitution_mass_shift_da,
)
from app.analysis.plots import write_sequence_coverage_plot
from app.analysis.provenance import input_hashes_from_evidence
from app.models.analysis_contract import (
    ANALYSIS_RESULT_SCHEMA_VERSION,
    ANALYSIS_RULE_SET_VERSION,
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
    CoverageDefinition,
    LocalizedText,
    ThresholdKind,
)


@dataclass(frozen=True)
class Ms1CoveragePipelineResult:
    protein: ProteinSequence
    reference_peptides: tuple[TheoreticalPeptide, ...]
    reference_coverage: CoverageResult
    candidate_coverage: CoverageResult
    decision: RuleDecision
    substitution_position: int | None
    substitution_detected: bool
    synthetic_demo: bool
    peak_table_path: Path | None
    reference_uncovered_regions: tuple[str, ...]
    candidate_uncovered_regions: tuple[str, ...]
    terminal_hint_flags: dict[str, bool]


def _write_peak_table(path: Path, coverage: CoverageResult) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(
            [
                "sequence",
                "start",
                "end",
                "theoreticalMassDa",
                "observedMassDa",
                "deviationPpm",
            ]
        )
        for peptide in coverage.matched_peptides:
            writer.writerow(
                [
                    peptide.sequence,
                    peptide.start,
                    peptide.end,
                    f"{peptide.theoretical_mass_da:.4f}",
                    f"{peptide.observed_mass_da:.4f}",
                    peptide.deviation_ppm,
                ]
            )
    return path


def run_synthetic_demo(
    *,
    item_id: str,
    sequence_path: Path | None = None,
    work_dir: Path | None = None,
    parameters: dict[str, Any] | None = None,
) -> Ms1CoveragePipelineResult:
    protein = (
        load_fasta_file(sequence_path, sequence_options_from_parameters(parameters))
        if sequence_path is not None
        else load_bsa_demo_fixture()
    )
    reference_sequence = protein.mature_sequence
    reference_peptides = digest_sequence(reference_sequence)

    rng = np.random.default_rng(RANDOM_SEED)
    reference_observed = simulate_observed_masses(reference_peptides, rng)
    reference_coverage = match_and_cover(reference_peptides, reference_observed, len(reference_sequence))

    candidate_sequence, substitution_position = introduce_substitution(reference_sequence)
    candidate_peptides_true = digest_sequence(candidate_sequence)
    candidate_observed = simulate_observed_masses(candidate_peptides_true, rng)
    candidate_coverage = match_and_cover(reference_peptides, candidate_observed, len(reference_sequence))

    substitution_detected, _ = detect_substitution_exposure(
        substitution_position=substitution_position,
        reference_peptides=reference_peptides,
        candidate_coverage_unmatched=candidate_coverage.unmatched_peptides,
    )
    decision = decide_rule_outcome(
        item_id,
        reference_coverage_percent=reference_coverage.coverage_percent,
        candidate_coverage_percent=candidate_coverage.coverage_percent,
        unexplained_sequence_anomaly=substitution_detected,
        synthetic_demo=True,
    )

    peak_table_path = None
    if work_dir is not None:
        peak_table_path = _write_peak_table(work_dir / "candidate-peak-table.csv", candidate_coverage)

    reference_uncovered = tuple(uncovered_regions_for_result(reference_coverage))
    candidate_uncovered = tuple(uncovered_regions_for_result(candidate_coverage))

    return Ms1CoveragePipelineResult(
        protein=protein,
        reference_peptides=tuple(reference_peptides),
        reference_coverage=reference_coverage,
        candidate_coverage=candidate_coverage,
        decision=decision,
        substitution_position=substitution_position,
        substitution_detected=substitution_detected,
        synthetic_demo=True,
        peak_table_path=peak_table_path,
        reference_uncovered_regions=reference_uncovered,
        candidate_uncovered_regions=candidate_uncovered,
        terminal_hint_flags=terminal_hints(candidate_uncovered, len(reference_sequence)),
    )


def run_uploaded_masses(
    *,
    item_id: str,
    sequence_path: Path,
    reference_masses_path: Path,
    candidate_masses_path: Path,
    work_dir: Path | None = None,
    parameters: dict[str, Any] | None = None,
) -> Ms1CoveragePipelineResult:
    protein = load_fasta_file(sequence_path, sequence_options_from_parameters(parameters))
    reference_sequence = protein.mature_sequence
    reference_peptides = digest_sequence(reference_sequence)

    reference_observed = load_observed_masses(reference_masses_path)
    candidate_observed = load_observed_masses(candidate_masses_path)
    reference_coverage = match_and_cover(reference_peptides, reference_observed, len(reference_sequence))
    candidate_coverage = match_and_cover(reference_peptides, candidate_observed, len(reference_sequence))

    coverage_drop = reference_coverage.coverage_percent - candidate_coverage.coverage_percent
    unexplained = (
        coverage_drop > COVERAGE_DROP_SANITY_PERCENT
        and candidate_coverage.unmatched_peptide_count > reference_coverage.unmatched_peptide_count
    )

    decision = decide_rule_outcome(
        item_id,
        reference_coverage_percent=reference_coverage.coverage_percent,
        candidate_coverage_percent=candidate_coverage.coverage_percent,
        unexplained_sequence_anomaly=unexplained,
        synthetic_demo=False,
    )

    peak_table_path = None
    if work_dir is not None:
        peak_table_path = _write_peak_table(work_dir / "candidate-peak-table.csv", candidate_coverage)

    candidate_uncovered = tuple(uncovered_regions_for_result(candidate_coverage))
    return Ms1CoveragePipelineResult(
        protein=protein,
        reference_peptides=tuple(reference_peptides),
        reference_coverage=reference_coverage,
        candidate_coverage=candidate_coverage,
        decision=decision,
        substitution_position=None,
        substitution_detected=False,
        synthetic_demo=False,
        peak_table_path=peak_table_path,
        reference_uncovered_regions=tuple(uncovered_regions_for_result(reference_coverage)),
        candidate_uncovered_regions=candidate_uncovered,
        terminal_hint_flags=terminal_hints(candidate_uncovered, len(reference_sequence)),
    )


def build_analysis_result(
    *,
    job_id: str,
    item_id: str,
    method_id: str,
    pipeline: Ms1CoveragePipelineResult,
    input_evidence: AnalysisInputEvidence,
    trace_id: str,
    started_at: str,
    completed_at: str,
    artifacts_dir: Path | None = None,
) -> AnalysisResult:
    metadata = MS1_ITEM_RULES.get(item_id) or MS1_ITEM_RULES["ms1-sequence-coverage"]
    peak_table_name = None
    coverage_plot_name = None
    if pipeline.peak_table_path is not None and artifacts_dir is not None:
        destination = artifacts_dir / pipeline.peak_table_path.name
        if pipeline.peak_table_path != destination:
            destination.write_bytes(pipeline.peak_table_path.read_bytes())
        peak_table_name = destination.name
    if artifacts_dir is not None:
        coverage_plot_path = write_sequence_coverage_plot(
            pipeline.candidate_coverage.sequence_length,
            list(pipeline.candidate_uncovered_regions),
            artifacts_dir / "sequence-coverage-plot.png",
            coverage_percent=pipeline.candidate_coverage.coverage_percent,
        )
        coverage_plot_name = coverage_plot_path.name

    matched_sequences = [peptide.sequence for peptide in pipeline.candidate_coverage.matched_peptides]
    unmatched_sequences = [peptide.sequence for peptide in pipeline.candidate_coverage.unmatched_peptides]
    delta_ppm = [peptide.deviation_ppm for peptide in pipeline.candidate_coverage.matched_peptides]

    return AnalysisResult(
        schema_version=ANALYSIS_RESULT_SCHEMA_VERSION,
        rule_set_version=ANALYSIS_RULE_SET_VERSION,
        job_id=job_id,
        item_id=item_id,
        method_id=method_id,
        profile="ms1-coverage",
        input_evidence=input_evidence,
        extracted_features=AnalysisExtractedFeatures(
            matched_peptides=matched_sequences,
            unmatched_peptides=unmatched_sequences,
            coverage_percent=pipeline.candidate_coverage.coverage_percent,
            coverage_definition=CoverageDefinition.COMBINED,
            uncovered_regions=list(pipeline.candidate_uncovered_regions),
            delta_ppm=delta_ppm,
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
            peak_table=peak_table_name,
            sequence_coverage_plot=coverage_plot_name,
        ),
        evidence=AnalysisRunEvidence(
            tool_versions={"pyOpenMS": pyopenms_version()},
            parameters={
                "protease": PROTEASE_NAME,
                "missedCleavages": MISSED_CLEAVAGES,
                "minPeptideLength": MIN_PEPTIDE_LENGTH,
                "matchTolerancePpm": MATCH_TOLERANCE_PPM,
                "referenceCoveragePercent": pipeline.reference_coverage.coverage_percent,
                "candidateCoveragePercent": pipeline.candidate_coverage.coverage_percent,
                "substitutionPosition": pipeline.substitution_position,
                "substitutionDetected": pipeline.substitution_detected,
                "substitutionMassShiftDa": (
                    round(substitution_mass_shift_da(), 4) if pipeline.substitution_position else None
                ),
                "syntheticDemo": pipeline.synthetic_demo,
                "terminalHints": pipeline.terminal_hint_flags,
                "sequenceLength": pipeline.candidate_coverage.sequence_length,
                "accession": pipeline.protein.accession,
                "sequenceSource": pipeline.protein.sequence_source,
            },
            quality_gates=[
                AnalysisQualityGate(
                    name="demoCoverageSanityPercent",
                    value=DEMO_COVERAGE_SANITY_PERCENT,
                    unit="percent",
                    threshold_kind=ThresholdKind.ALGORITHM_QUALITY_GATE,
                    purpose=LocalizedText(
                        zh="演示用覆盖率下限，不是 Sheet3 合格线。",
                        en="Demo coverage floor, not a Sheet 3 acceptance limit.",
                    ),
                ),
                AnalysisQualityGate(
                    name="coverageDropSanityPercent",
                    value=COVERAGE_DROP_SANITY_PERCENT,
                    unit="percent-points",
                    threshold_kind=ThresholdKind.ALGORITHM_QUALITY_GATE,
                    purpose=LocalizedText(
                        zh="候选相对参照覆盖率下降的算法提示阈值，不能触发相似性 PASS/FAIL。",
                        en="Algorithm hint for a coverage drop; it cannot trigger a similarity PASS/FAIL.",
                    ),
                ),
                AnalysisQualityGate(
                    name="matchTolerancePpm",
                    value=MATCH_TOLERANCE_PPM,
                    unit="ppm",
                    threshold_kind=ThresholdKind.ALGORITHM_QUALITY_GATE,
                    purpose=LocalizedText(
                        zh="MS1 质量匹配容差，属于方法性能，不是相似性限度。",
                        en="MS1 mass-match tolerance; a method-performance gate, not a similarity limit.",
                    ),
                ),
            ],
            trace_id=trace_id,
            started_at=started_at,
            completed_at=completed_at,
        ),
        provenance=AnalysisResultProvenance(
            summary=LocalizedText(
                zh="MS1 肽图序列覆盖率分析",
                en="MS1 peptide-map sequence coverage analysis",
            ),
            what_it_is=LocalizedText(
                zh="pyOpenMS 理论酶切 + MS1 母离子质量匹配 + V2 Sheet3 覆盖率规则评价。",
                en="pyOpenMS in-silico digestion + MS1 precursor mass matching + V2 sheet 3 coverage rules.",
            ),
            what_it_is_not=LocalizedText(
                zh=(
                    f"{MS1_CANNOT_REPLACE_MSMS_ZH} "
                    f"覆盖率百分比不是生物类似性数值合格线（K 列：{COVERAGE_NUMERIC_BOUNDARY_ZH}）。"
                ),
                en=(
                    "MS1 mass matching cannot replace MS/MS sequence confirmation; "
                    "coverage % is not a biosimilarity pass/fail threshold."
                ),
            ),
            data_source=LocalizedText(
                zh="合成演示母离子列表" if pipeline.synthetic_demo else "用户上传母离子质量列表",
                en="synthetic demo precursor list" if pipeline.synthetic_demo else "user-uploaded precursor masses",
            ),
            sample_pairing=input_evidence.sample_pairing.description,
            source_files=[path for path in [pipeline.protein.source_path] if path],
            input_hashes=input_hashes_from_evidence(input_evidence),
            external_links=[],
        ),
        warnings=[],
        limitations=[
            MS1_CANNOT_REPLACE_MSMS_ZH,
            "未考虑翻译后修饰对肽段质量的影响，真实肽图必须开启修饰搜索。"
            if not pipeline.synthetic_demo
            else "合成演示母离子列表不是仪器测量数据。",
            "未做保留时间比对，真实肽图比对中保留时间是重要的正交证据。",
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
