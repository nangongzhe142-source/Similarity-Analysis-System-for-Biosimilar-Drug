// Unified analysis data contract — TypeScript side.
//
// Wire format shared by the FastAPI service (P5+), the MethodAnalysisPanel (P11),
// and downloadable JSON exports. Field names are camelCase in JSON; Python models
// use snake_case internally with explicit aliases.
//
// Sources:
//   * original nine-section spec (AnalysisResult skeleton)
//   * docs/primary-structure-analysis/implementation-plan.md §二 证据等级契约
//   * P1 pyOpenMS average-mass constant note → evidence.parameters.massConstantSource
//   * DOCX figure 6 coverage definitions → extractedFeatures.coverageDefinition
//   * D20 pairing constraint → inputEvidence.samplePairing
//
// Checked by scripts/verify_analysis_contract.mjs (TS ↔ Pydantic ↔ JSON Schema).

import type { AnalysisEvidenceLevel, AnalysisProfileId } from "@/types/models";
import type { LocalizedText } from "@/types/models";

/** Increment when the AnalysisResult shape changes incompatibly. */
export const ANALYSIS_RESULT_SCHEMA_VERSION = "1.0.0";

/** Ties verdict rules to the V2 workbook sheet 3 sidecar. Prefix is the first
 *  8 hex digits of the workbook SHA-256 recorded in similarity-schemes.ts. */
export const ANALYSIS_RULE_SET_VERSION = "v2-sheet3-8bd6b18f";

/** Task lifecycle states for the analysis job queue (P5). */
export type AnalysisJobStatus =
  | "QUEUED"
  | "VALIDATING"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED";

/** Item-level outcome for a single quality attribute. Deliberately NOT named
 *  SIMILAR/PASS to avoid readers conflating it with overall biosimilarity. */
export type AnalysisVerdict =
  | "SUPPORTED_BY_THIS_ATTRIBUTE"
  | "REVIEW"
  | "DIFFERENCE_DETECTED"
  | "RULE_NOT_DEFINED";

/** Where the input data came from. Distinct from evidenceLevel, which states
 *  how much the analysis may claim given that input. */
export type AnalysisDataSource =
  | "measured"
  | "exported-table"
  | "public"
  | "official-example"
  | "synthetic-demo"
  | "image-only";

/** Per-rule outcome from evaluating V2 sheet 3 against extracted features. */
export type RuleEvaluationOutcome =
  | "PASS"
  | "REVIEW"
  | "FAIL"
  | "NOT_APPLICABLE"
  | "RULE_NOT_DEFINED";

/** DOCX figure 6 and V2 both require stating which coverage definition is
 *  reported; a bare percentage without this field is invalid for MS profiles. */
export type CoverageDefinition =
  | "control"
  | "analyte"
  | "combined"
  | "common"
  | "analyte-unique";

/** Role of an uploaded or referenced file in the comparison. */
export type AnalysisInputFileRole =
  | "candidate"
  | "reference"
  | "sequence"
  | "calibration";

/** One uploaded or built-in input file recorded for traceability. */
export interface AnalysisInputFileDescriptor {
  fileName: string;
  sha256: string;
  format: string;
  byteSize: number;
  role: AnalysisInputFileRole;
}

/** Describes which two samples are being compared. Decision D20: any two samples
 *  may be paired, but the panel must never imply a head-to-head biosimilar design
 *  when the data are not one. */
export interface AnalysisSamplePairing {
  candidateLabel: string;
  referenceLabel: string;
  description: LocalizedText;
  /** True only when the dataset is an actual candidate-vs-reference biosimilar
   *  study design. Public PRIDE fixtures must leave this false. */
  isHeadToHeadBiosimilarDesign: boolean;
}

/** Input-side evidence: what was fed in and at what tier. */
export interface AnalysisInputEvidence {
  dataSource: AnalysisDataSource;
  evidenceLevel: AnalysisEvidenceLevel;
  candidateFiles: AnalysisInputFileDescriptor[];
  referenceFiles: AnalysisInputFileDescriptor[];
  sequenceFiles: AnalysisInputFileDescriptor[];
  samplePairing: AnalysisSamplePairing;
}

/** One point on an extracted LC trace. */
export interface AnalysisChromatogramPeak {
  retentionTime: number;
  intensity: number;
  area?: number;
}

/** One annotated MS/MS fragment ion. */
export interface AnalysisFragmentIon {
  ionType: string;
  ordinal: number;
  theoreticalMz: number;
  observedMz: number;
  errorPpm: number;
}

/** Metrics available only in image-only-exploratory mode. When
 *  calibrationReliable is false, no Da/mz/RT values may appear elsewhere. */
export interface AnalysisImageMetrics {
  calibrationReliable: boolean;
  ssim?: number;
  correlation?: number;
  dtwDistance?: number;
}

/** What a numeric cut-off is entitled to decide. An algorithmQualityGate may gate
 *  whether a measurement is usable and nothing else; only a similarityBoundary,
 *  which must come from the workbook or a validated method, decides
 *  biosimilarity. The UI must never render the first as the second. */
export type ThresholdKind = "algorithmQualityGate" | "similarityBoundary";

/** How alike two curves look on a rendered figure. A statement about pictures,
 *  never about products: the verdict stays REVIEW whatever this says. */
export type ImageComparisonOutcome =
  | "CONSISTENT"
  | "INCONCLUSIVE"
  | "DIFFERENCE_OBSERVED"
  | "NOT_APPLICABLE";

/** The image-level observation, held apart from the regulatory verdict.
 *  driverMetric names the one metric the outcome rests on; the metrics listed in
 *  nonDiscriminatingMetrics are reported for description only, because measured
 *  over like-for-like and cross-analyte pairs their ranges overlap. */
export interface AnalysisImageComparison {
  outcome: ImageComparisonOutcome;
  driverMetric: string;
  driverValue?: number;
  consistentThreshold: number;
  differenceThreshold: number;
  thresholdKind: ThresholdKind;
  nonDiscriminatingMetrics: string[];
  rationale: LocalizedText;
}

/** Profile-specific numbers extracted from the inputs. All fields optional
 *  because only the active profile populates its subset. */
export interface AnalysisExtractedFeatures {
  deconvolvedMassesDa?: number[];
  deltaDa?: number[];
  deltaPpm?: number[];
  chromatogramPeaks?: AnalysisChromatogramPeak[];
  matchedPeptides?: string[];
  unmatchedPeptides?: string[];
  coveragePercent?: number;
  coverageDefinition?: CoverageDefinition;
  coveragePercentByDefinition?: Partial<Record<CoverageDefinition, number>>;
  uncoveredRegions?: string[];
  fragmentIons?: AnalysisFragmentIon[];
  imageMetrics?: AnalysisImageMetrics;
  imageComparison?: AnalysisImageComparison;
}

/** One row of the V2 rule evaluation table shown in the UI. */
export interface AnalysisRuleEvaluation {
  ruleId: string;
  sourceSheet: string;
  sourceRow: number;
  sourceCells: string[];
  outcome: RuleEvaluationOutcome;
  rationale: LocalizedText;
}

/** Relative paths or URLs to downloadable plot/table artifacts. SVG/PNG paths
 *  are served by the analysis service workspace; peakTable is CSV/JSON path. */
export interface AnalysisArtifacts {
  mirrorPlot?: string;
  overlayPlot?: string;
  differencePlot?: string;
  sequenceCoveragePlot?: string;
  fragmentIonPlot?: string;
  peakTable?: string;
}

/** A numeric cut-off that may only decide whether a measurement is usable.
 *  thresholdKind is required so the UI cannot render it as a similarity line. */
export interface AnalysisQualityGate {
  name: string;
  value?: number;
  unit?: string;
  thresholdKind: ThresholdKind;
  purpose: LocalizedText;
}

/** Run metadata: tool versions, parameters, timing. The massConstantSource field
 *  inside parameters is mandatory whenever theoretical masses are computed
 *  (P1: pyOpenMS vs ExPASy constants differ by ~9 ppm on a 148 kDa mAb). */
export interface AnalysisRunEvidence {
  toolVersions: Record<string, string>;
  parameters: Record<string, unknown>;
  qualityGates?: AnalysisQualityGate[];
  traceId: string;
  startedAt: string;
  completedAt: string;
}

/** One external link in the provenance panel. */
export interface AnalysisExternalLink {
  label: LocalizedText;
  href: string;
}

/** SHA-256 of one named input, listed in provenance.inputHashes. */
export interface AnalysisInputHash {
  label: string;
  sha256: string;
}

/** Expandable provenance block for the analysis panel (P12). Structure follows
 *  LiveDemoProvenance but adds pairing disclosure required by D20. */
export interface AnalysisResultProvenance {
  summary: LocalizedText;
  whatItIs: LocalizedText;
  whatItIsNot: LocalizedText;
  dataSource: LocalizedText;
  samplePairing: LocalizedText;
  sourceFiles: string[];
  inputHashes: AnalysisInputHash[];
  externalLinks: AnalysisExternalLink[];
}

/** Successful analysis payload returned by the service and rendered by the
 *  panel. Job failures use AnalysisJobSnapshot.error instead; they do not
 *  fabricate a verdict. */
export interface AnalysisResult {
  schemaVersion: typeof ANALYSIS_RESULT_SCHEMA_VERSION;
  ruleSetVersion: typeof ANALYSIS_RULE_SET_VERSION;
  jobId: string;
  itemId: string;
  methodId: string;
  profile: AnalysisProfileId;
  inputEvidence: AnalysisInputEvidence;
  extractedFeatures: AnalysisExtractedFeatures;
  ruleEvaluation: AnalysisRuleEvaluation[];
  verdict: AnalysisVerdict;
  verdictRationale: LocalizedText;
  artifacts: AnalysisArtifacts;
  evidence: AnalysisRunEvidence;
  provenance: AnalysisResultProvenance;
  warnings: string[];
  limitations: string[];
  disclaimer: LocalizedText;
}

/** Progress reported while a job is RUNNING. */
export interface AnalysisJobProgress {
  phase: string;
  percent?: number;
  message?: string;
}

/** Safe error surface when job.status = FAILED. Must not contain server paths. */
export interface AnalysisJobError {
  code: string;
  message: string;
  safeMessage: LocalizedText;
}

/** Job snapshot returned by create/get/cancel endpoints (P5). */
export interface AnalysisJobSnapshot {
  jobId: string;
  status: AnalysisJobStatus;
  itemId: string;
  methodId: string;
  profile: AnalysisProfileId;
  createdAt: string;
  updatedAt: string;
  progress?: AnalysisJobProgress;
  error?: AnalysisJobError;
  /** Present only when status = SUCCEEDED. */
  result?: AnalysisResult;
}
