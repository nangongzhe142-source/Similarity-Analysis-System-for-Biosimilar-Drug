# -*- coding: utf-8 -*-
"""Unified analysis data contract — Pydantic side.

Wire format field names match src/types/analysis-contract.ts (camelCase).
Python attributes use snake_case with explicit Field(alias=...).

Checked by scripts/verify_analysis_contract.mjs and
analysis-service/tests/test_analysis_contract.py.
"""

from __future__ import annotations

from enum import Enum
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

ANALYSIS_RESULT_SCHEMA_VERSION = "1.0.0"
ANALYSIS_RULE_SET_VERSION = "v2-sheet3-8bd6b18f"


class AnalysisJobStatus(str, Enum):
    QUEUED = "QUEUED"
    VALIDATING = "VALIDATING"
    RUNNING = "RUNNING"
    SUCCEEDED = "SUCCEEDED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class AnalysisVerdict(str, Enum):
    SUPPORTED_BY_THIS_ATTRIBUTE = "SUPPORTED_BY_THIS_ATTRIBUTE"
    REVIEW = "REVIEW"
    DIFFERENCE_DETECTED = "DIFFERENCE_DETECTED"
    RULE_NOT_DEFINED = "RULE_NOT_DEFINED"


class AnalysisDataSource(str, Enum):
    MEASURED = "measured"
    EXPORTED_TABLE = "exported-table"
    PUBLIC = "public"
    OFFICIAL_EXAMPLE = "official-example"
    SYNTHETIC_DEMO = "synthetic-demo"
    IMAGE_ONLY = "image-only"


class AnalysisEvidenceLevel(str, Enum):
    RAW_DATA_ANALYSIS = "raw-data-analysis"
    STRUCTURED_EXPORT_ANALYSIS = "structured-export-analysis"
    IMAGE_ONLY_EXPLORATORY = "image-only-exploratory"


class AnalysisProfileId(str, Enum):
    INTACT_MASS = "intact-mass"
    PEPTIDE_MAP = "peptide-map"
    MS1_COVERAGE = "ms1-coverage"
    MSMS_SEQUENCE = "msms-sequence"
    CURVE_OVERLAY = "curve-overlay"


class RuleEvaluationOutcome(str, Enum):
    PASS = "PASS"
    REVIEW = "REVIEW"
    FAIL = "FAIL"
    NOT_APPLICABLE = "NOT_APPLICABLE"
    RULE_NOT_DEFINED = "RULE_NOT_DEFINED"


class ThresholdKind(str, Enum):
    """What a numeric cut-off is entitled to decide.

    `ALGORITHM_QUALITY_GATE` marks a value chosen so an algorithm can operate —
    it may gate whether a measurement is usable, and nothing else.
    `SIMILARITY_BOUNDARY` marks a limit that decides biosimilarity, which may only
    come from the workbook or from a validated method. The distinction is carried
    in the contract so that a reader cannot mistake one for the other.
    """

    ALGORITHM_QUALITY_GATE = "algorithmQualityGate"
    SIMILARITY_BOUNDARY = "similarityBoundary"


class ImageComparisonOutcome(str, Enum):
    """How alike two curves look on a rendered figure.

    This is a statement about pictures, not about products. It exists so the
    interface can show at a glance what the operator would see anyway, while the
    regulatory verdict stays REVIEW.
    """

    CONSISTENT = "CONSISTENT"
    INCONCLUSIVE = "INCONCLUSIVE"
    DIFFERENCE_OBSERVED = "DIFFERENCE_OBSERVED"
    NOT_APPLICABLE = "NOT_APPLICABLE"


class CoverageDefinition(str, Enum):
    CONTROL = "control"
    ANALYTE = "analyte"
    COMBINED = "combined"
    COMMON = "common"
    ANALYTE_UNIQUE = "analyte-unique"


class AnalysisInputFileRole(str, Enum):
    CANDIDATE = "candidate"
    REFERENCE = "reference"
    SEQUENCE = "sequence"
    CALIBRATION = "calibration"


class LocalizedText(BaseModel):
    model_config = ConfigDict(extra="forbid")

    zh: str
    en: str


class AnalysisInputFileDescriptor(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    file_name: str = Field(alias="fileName")
    sha256: str
    format: str
    byte_size: int = Field(alias="byteSize")
    role: AnalysisInputFileRole


class AnalysisSamplePairing(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    candidate_label: str = Field(alias="candidateLabel")
    reference_label: str = Field(alias="referenceLabel")
    description: LocalizedText
    is_head_to_head_biosimilar_design: bool = Field(alias="isHeadToHeadBiosimilarDesign")


class AnalysisInputEvidence(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    data_source: AnalysisDataSource = Field(alias="dataSource")
    evidence_level: AnalysisEvidenceLevel = Field(alias="evidenceLevel")
    candidate_files: list[AnalysisInputFileDescriptor] = Field(alias="candidateFiles")
    reference_files: list[AnalysisInputFileDescriptor] = Field(alias="referenceFiles")
    sequence_files: list[AnalysisInputFileDescriptor] = Field(alias="sequenceFiles")
    sample_pairing: AnalysisSamplePairing = Field(alias="samplePairing")


class AnalysisChromatogramPeak(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    retention_time: float = Field(alias="retentionTime")
    intensity: float
    area: float | None = None


class AnalysisFragmentIon(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    ion_type: str = Field(alias="ionType")
    ordinal: int
    theoretical_mz: float = Field(alias="theoreticalMz")
    observed_mz: float = Field(alias="observedMz")
    error_ppm: float = Field(alias="errorPpm")


class AnalysisImageMetrics(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    calibration_reliable: bool = Field(alias="calibrationReliable")
    ssim: float | None = None
    correlation: float | None = None
    dtw_distance: float | None = Field(default=None, alias="dtwDistance")


class AnalysisImageComparison(BaseModel):
    """The image-level observation, kept apart from the regulatory verdict.

    `driver_metric` names the single metric the outcome rests on. It is recorded
    because the other metrics are reported too and are not equivalent: measured
    over like-for-like and cross-analyte pairs, profile correlation separated them
    completely while SSIM and DTW did not separate them at all.
    """

    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    outcome: ImageComparisonOutcome
    driver_metric: str = Field(alias="driverMetric")
    driver_value: float | None = Field(default=None, alias="driverValue")
    consistent_threshold: float = Field(alias="consistentThreshold")
    difference_threshold: float = Field(alias="differenceThreshold")
    threshold_kind: ThresholdKind = Field(alias="thresholdKind")
    non_discriminating_metrics: list[str] = Field(alias="nonDiscriminatingMetrics")
    rationale: LocalizedText


class AnalysisExtractedFeatures(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    deconvolved_masses_da: list[float] | None = Field(default=None, alias="deconvolvedMassesDa")
    delta_da: list[float] | None = Field(default=None, alias="deltaDa")
    delta_ppm: list[float] | None = Field(default=None, alias="deltaPpm")
    chromatogram_peaks: list[AnalysisChromatogramPeak] | None = Field(
        default=None, alias="chromatogramPeaks"
    )
    matched_peptides: list[str] | None = Field(default=None, alias="matchedPeptides")
    unmatched_peptides: list[str] | None = Field(default=None, alias="unmatchedPeptides")
    coverage_percent: float | None = Field(default=None, alias="coveragePercent")
    coverage_definition: CoverageDefinition | None = Field(default=None, alias="coverageDefinition")
    coverage_percent_by_definition: dict[str, float] | None = Field(
        default=None, alias="coveragePercentByDefinition"
    )
    uncovered_regions: list[str] | None = Field(default=None, alias="uncoveredRegions")
    fragment_ions: list[AnalysisFragmentIon] | None = Field(default=None, alias="fragmentIons")
    image_metrics: AnalysisImageMetrics | None = Field(default=None, alias="imageMetrics")
    image_comparison: AnalysisImageComparison | None = Field(
        default=None, alias="imageComparison"
    )


class AnalysisRuleEvaluation(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    rule_id: str = Field(alias="ruleId")
    source_sheet: str = Field(alias="sourceSheet")
    source_row: int = Field(alias="sourceRow")
    source_cells: list[str] = Field(alias="sourceCells")
    outcome: RuleEvaluationOutcome
    rationale: LocalizedText


class AnalysisArtifacts(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    mirror_plot: str | None = Field(default=None, alias="mirrorPlot")
    overlay_plot: str | None = Field(default=None, alias="overlayPlot")
    difference_plot: str | None = Field(default=None, alias="differencePlot")
    sequence_coverage_plot: str | None = Field(default=None, alias="sequenceCoveragePlot")
    fragment_ion_plot: str | None = Field(default=None, alias="fragmentIonPlot")
    peak_table: str | None = Field(default=None, alias="peakTable")


class AnalysisQualityGate(BaseModel):
    """A numeric cut-off that may only decide whether a measurement is usable.

    `threshold_kind` is required so a reader cannot treat the value as a
    similarity boundary. Sheet3 column K supplies no universal numerical limit.
    """

    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    name: str
    value: float | None = None
    unit: str | None = None
    threshold_kind: ThresholdKind = Field(alias="thresholdKind")
    purpose: LocalizedText


class AnalysisRunEvidence(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    tool_versions: dict[str, str] = Field(alias="toolVersions")
    parameters: dict[str, Any]
    quality_gates: list[AnalysisQualityGate] = Field(
        default_factory=list, alias="qualityGates"
    )
    trace_id: str = Field(alias="traceId")
    started_at: str = Field(alias="startedAt")
    completed_at: str = Field(alias="completedAt")


class AnalysisInputHash(BaseModel):
    model_config = ConfigDict(extra="forbid")

    label: str
    sha256: str


class AnalysisExternalLink(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    label: LocalizedText
    href: str


class AnalysisResultProvenance(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    summary: LocalizedText
    what_it_is: LocalizedText = Field(alias="whatItIs")
    what_it_is_not: LocalizedText = Field(alias="whatItIsNot")
    data_source: LocalizedText = Field(alias="dataSource")
    sample_pairing: LocalizedText = Field(alias="samplePairing")
    source_files: list[str] = Field(alias="sourceFiles")
    input_hashes: list[AnalysisInputHash] = Field(alias="inputHashes")
    external_links: list[AnalysisExternalLink] = Field(alias="externalLinks")


class AnalysisResult(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    schema_version: Literal["1.0.0"] = Field(alias="schemaVersion")
    rule_set_version: Literal["v2-sheet3-8bd6b18f"] = Field(alias="ruleSetVersion")
    job_id: str = Field(alias="jobId")
    item_id: str = Field(alias="itemId")
    method_id: str = Field(alias="methodId")
    profile: AnalysisProfileId
    input_evidence: AnalysisInputEvidence = Field(alias="inputEvidence")
    extracted_features: AnalysisExtractedFeatures = Field(alias="extractedFeatures")
    rule_evaluation: list[AnalysisRuleEvaluation] = Field(alias="ruleEvaluation")
    verdict: AnalysisVerdict
    verdict_rationale: LocalizedText = Field(alias="verdictRationale")
    artifacts: AnalysisArtifacts
    evidence: AnalysisRunEvidence
    provenance: AnalysisResultProvenance
    warnings: list[str]
    limitations: list[str]
    disclaimer: LocalizedText


class AnalysisJobProgress(BaseModel):
    model_config = ConfigDict(extra="forbid")

    phase: str
    percent: float | None = None
    message: str | None = None


class AnalysisJobError(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    code: str
    message: str
    safe_message: LocalizedText = Field(alias="safeMessage")


class AnalysisJobSnapshot(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    job_id: str = Field(alias="jobId")
    status: AnalysisJobStatus
    item_id: str = Field(alias="itemId")
    method_id: str = Field(alias="methodId")
    profile: AnalysisProfileId
    created_at: str = Field(alias="createdAt")
    updated_at: str = Field(alias="updatedAt")
    progress: AnalysisJobProgress | None = None
    error: AnalysisJobError | None = None
    result: AnalysisResult | None = None


CONTRACT_MODELS: dict[str, type[BaseModel]] = {
    "LocalizedText": LocalizedText,
    "AnalysisInputFileDescriptor": AnalysisInputFileDescriptor,
    "AnalysisSamplePairing": AnalysisSamplePairing,
    "AnalysisInputEvidence": AnalysisInputEvidence,
    "AnalysisChromatogramPeak": AnalysisChromatogramPeak,
    "AnalysisFragmentIon": AnalysisFragmentIon,
    "AnalysisImageMetrics": AnalysisImageMetrics,
    "AnalysisImageComparison": AnalysisImageComparison,
    "AnalysisExtractedFeatures": AnalysisExtractedFeatures,
    "AnalysisRuleEvaluation": AnalysisRuleEvaluation,
    "AnalysisArtifacts": AnalysisArtifacts,
    "AnalysisQualityGate": AnalysisQualityGate,
    "AnalysisRunEvidence": AnalysisRunEvidence,
    "AnalysisInputHash": AnalysisInputHash,
    "AnalysisExternalLink": AnalysisExternalLink,
    "AnalysisResultProvenance": AnalysisResultProvenance,
    "AnalysisResult": AnalysisResult,
    "AnalysisJobProgress": AnalysisJobProgress,
    "AnalysisJobError": AnalysisJobError,
    "AnalysisJobSnapshot": AnalysisJobSnapshot,
}
