export interface Peak {
  mass: number;
  intensity: number;
}

export interface PeakMatch {
  candidateMass: number;
  referenceMass: number;
  deltaDa: number;
  deltaPpm: number;
  candidateRelative: number;
  referenceRelative: number;
  abundanceDelta: number;
}

export interface AnalysisResult {
  runId: string;
  status: "completed" | "failed";
  engine: { name: string; version: string };
  methodKey: string;
  generatedAt: string;
  score: number;
  summary: {
    matchedCount: number;
    candidatePeakCount: number;
    referencePeakCount: number;
    unmatchedCandidateCount: number;
    meanAbsDeltaDa: number;
    maxAbsDeltaPpm: number;
  };
  matches: PeakMatch[];
  candidatePeaks: Peak[];
  referencePeaks: Peak[];
  warnings: string[];
  trace: Record<string, unknown>;
  disclaimer: string;
  briefExplanation?: string;
}

export interface AIReport {
  title: string;
  summary: string;
  keyFindings: string[];
  risks: string[];
  conclusion: string;
  narrative: string;
  source: "ai-model" | "rules-fallback";
  provider: string;
  model: string;
  generatedAt: string;
  warnings: string[];
  disclaimer: string;
}

export interface AnalysisJob {
  id: string;
  status: "queued" | "running" | "completed" | "quality-blocked" | "failed";
  stage: string;
  progress: number;
  methodKey: string;
  engineKey?: string;
  engineName?: string;
  message: string;
  error?: string;
  events: Array<{ at: string; message: string; progress: number }>;
  artifacts?: Array<{ name: string; file: string; url?: string }>;
}

export interface SequenceCoverageMap {
  accession: string;
  sequence: string;
  referenceCoveredPositions: number[];
  candidateCoveredPositions: number[];
  bothCoveredPositions: number[];
  referenceOnlyPositions: number[];
  candidateOnlyPositions: number[];
}

export interface SequenceComparisonRow {
  accession: string;
  referenceCoveragePercent: number | null;
  candidateCoveragePercent: number | null;
  differencePercentagePoints: number | null;
  referenceRunCount: number;
  candidateRunCount: number;
}

export interface SequenceCalculationResult {
  moduleCode: "SEQ-01" | "SEQ-02" | "SEQ-03" | "SEQ-04";
  status: "completed" | "quality-blocked";
  professionalEngine: string;
  processingBoundary: string;
  metrics: Array<Record<string, string | number | null>> | Record<string, string | number | null>;
  comparisonTable?: SequenceComparisonRow[];
  sequenceCoverage?: SequenceCoverageMap[];
  evidence?: Array<Record<string, unknown>>;
  warnings?: Array<{ code: string; severity: "low" | "medium" | "high"; message: string }>;
  qualityGate?: { passed: boolean; message?: string; qValueThreshold?: number; acceptedPsmCount?: number; mappedPeptideCount?: number };
  decision: null;
  disclaimer: string;
}

export interface CovalentCalculationResult {
  moduleCode: "COV-01" | "COV-02";
  status: "completed" | "quality-blocked";
  professionalEngine: string;
  theoreticalPairCount?: number;
  expectedCoverage?: Array<Record<string, unknown>>;
  identifiedLinks?: Array<Record<string, unknown>>;
  orthogonalPairIds?: string[];
  unexpectedLinks?: Array<Record<string, unknown>>;
  comparisonTable?: Array<Record<string, unknown>>;
  qualityGate: { passed: boolean; message?: string; messages?: string[]; note?: string };
  decision: null;
  disclaimer: string;
}

export interface EllmanResult {
  correctedAbsorbance412: number;
  thiolConcentrationMolL: number;
  proteinConcentrationMolL: number;
  molShPerMolProtein: number;
  formula: string;
  riskThresholdMolShPerMolProtein: number | null;
  hmwPercent: number | null;
  warnings: Array<{ code: string; severity: "low" | "medium" | "high"; message: string }>;
  decision: null;
  disclaimer: string;
}

export interface GlycanTracePoint { time: number; signal: number }
export interface GlycanCalculationResult {
  moduleCode: "GLY-02" | "GLY-03" | "GLY-04" | "GLY-05" | "GLY-06";
  status: "completed" | "quality-blocked";
  professionalEngine: string;
  methodRoute: string;
  targetGlycoform: string;
  traces: Array<{ cohort: "reference" | "candidate"; lotId: string; points: GlycanTracePoint[] }>;
  glycoformRows: Array<{ cohort: "reference" | "candidate"; lotId: string; glycoform: string; retentionTime: number; peakArea: number; areaPercent: number; composition: string; theoreticalMass: number | null; assignmentBasis: string; confirmationStatus: string }>;
  comparisonTable: Array<{ glycoform: string; referencePercent: number | null; candidatePercent: number | null; differencePercentagePoints: number | null; intervalStatus: string }>;
  warnings: Array<{ code: string; severity: "low" | "medium" | "high"; message: string }>;
  totalSialylationPercent: { reference: number; candidate: number };
  massRules: { g0fMinusG0Da: number; ngnaMinusNanaDa: number };
  msConfirmation: { status: string; message?: string };
  comparison: Record<string, unknown>;
  decision: null;
  disclaimer: string;
}

export interface PurityChromatographyResult {
  moduleCode: "PUR-01" | "PUR-02" | "PUR-03" | "PUR-04" | "PUR-05" | "PUR-06" | "PUR-07";
  status: "completed" | "quality-blocked";
  professionalEngine: string;
  methodRoute: string;
  targetMetric: string;
  traces: Array<{ cohort: "reference" | "candidate"; lotId: string; points: GlycanTracePoint[] }>;
  peakRows: Array<{ cohort: "reference" | "candidate"; lotId: string; peakId: string; peakGroup: string; migrationTime: number; peakArea: number; areaPercent: number }>;
  summaryRows: Array<{ cohort: "reference" | "candidate"; lotId: string; target: string; targetPercent: number; lcPlusHcPercent: number | null; lcHcRatio: number | null; nghcPercent: number | null }>;
  comparisonTable: Array<{ metric: string; referencePercent: number; candidatePercent: number; differencePercentagePoints: number; intervalStatus: string }>;
  warnings: Array<{ code: string; severity: "low" | "medium" | "high"; message: string }>;
  newCandidatePeaks: Array<{ peakId: string; peakGroup: string; migrationTime: number; areaPercent: number; reviewAction: string }>;
  calibration: Array<{ cohort: "reference" | "candidate"; lotId: string; engine: string; anchorCount: number; polynomialCoefficients: number[] }>;
  configUsed: { peakWindows: Record<string, [number, number]>; loqPercent: number; peakMatchTolerance: number; mainPeakHalfWindow: number };
  manualReview: { CEVal: string };
  comparison: Record<string, unknown>;
  decision: null;
  disclaimer: string;
}

export interface PTMMapSiteRow {
  cohort: "reference" | "candidate";
  lotId: string;
  accession?: string;
  residue?: string;
  position?: number;
  modification?: string;
  relativeAbundancePercent?: number;
  hotspot?: boolean;
  isoAspStatus?: string | null;
  massShiftDa?: number;
  retainedLysPeptidePercent?: number;
  clippedLysPeptidePercent?: number;
  inferred0KPercent?: number;
  inferred1KPercent?: number;
  inferred2KPercent?: number;
  distributionBasis?: string;
}

export interface PTMMapCalculationResult {
  moduleCode: "PTM-01" | "PTM-02" | "PTM-03" | "PTM-04";
  status: "completed" | "quality-blocked";
  professionalEngine: string;
  siteRows: PTMMapSiteRow[];
  comparison: { intervals: Array<Record<string, unknown>>; candidateMarks: Array<Record<string, unknown>>; summary: Record<string, number>; decision: null; disclaimer: string };
  qualityGate: { passed: boolean; acceptedPsmCount: number | null; quantifiedPeptideCount: number; message: string };
  warnings: Array<{ code: string; severity: "low" | "medium" | "high"; message: string }>;
  unidecEvidence: { status: string; message?: string; citation?: string };
  isoAspEvidence: { status: string };
  openSearchSlot: { status: string; engine: string; phase: string };
  decision: null;
  disclaimer: string;
}

export interface CalculationJob {
  id: string;
  projectId: string;
  moduleCode: string;
  status: "staging" | "queued" | "running" | "completed" | "quality-blocked" | "failed" | "timed-out" | "interrupted";
  stage: string;
  progress: number;
  message: string;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export interface ExternalEngineStatus {
  contractVersion: string;
  key: string;
  name: string;
  installed: boolean;
  detected: boolean;
  technicalConnectivityValidated: boolean;
  regulatoryWorkflowValidated: boolean;
  productionAvailable: boolean;
  /** @deprecated 等同 productionAvailable，不表示程序仅被探测到。 */
  available: boolean;
  availableDeprecated: string;
  version?: string | null;
  commandPath?: string | null;
  missingExecutables: string[];
  repository: string;
  license: string;
  executionMode: string;
  moduleIds: string[];
  inputFormats: string[];
  outputFormats: string[];
  role: string;
  distributionNote: string;
  onlineConfiguration: {
    localEnvironmentFilePresent: boolean;
    localEnvironmentFileLoaded: boolean;
    requiredVariables: string[];
    configuredVariables: string[];
    missingVariables: string[];
    onlineConfigurationLoaded: boolean;
  };
  detectionEvidence: Array<{
    name: string;
    path?: string | null;
    detected: boolean;
    detectionSource?: string | null;
    reportedVersion?: string | null;
    reportedVersionText?: string | null;
    declaredAssetVersion?: string | null;
    versionConsistent?: boolean | null;
  }>;
  versionMismatches: Array<{
    component: string;
    declaredAssetVersion: string;
    reportedProgramVersion: string;
    message: string;
  }>;
  regulatoryValidationRequirements: string[];
  regulatoryValidationGaps: string[];
  validationNote: string;
}

export type PTMAssessmentStatus =
  | "within_interval"
  | "below_interval"
  | "above_interval"
  | "candidate_only_variant"
  | "insufficient_reference"
  | "indeterminate";

export interface PTMCandidateAssessment {
  lotId: string;
  valuePercent: number | null;
  status: PTMAssessmentStatus;
  deviationFromBoundaryPercent: number | null;
  technicalReplicateCount: number;
  qualityWarnings: string[];
}

export interface PTMAnalyteResult {
  analyteId: string;
  proteinChain: string;
  residue: string;
  position: number;
  modification: string;
  riskLevel: "low" | "medium" | "high";
  referenceLotCount: number;
  referenceInterval: { lowerPercent: number; upperPercent: number; method: string; note?: string | null } | null;
  referenceMedianPercent: number | null;
  candidateMedianPercent: number | null;
  auxiliaryMedianDifferencePercent: number | null;
  referenceLots?: Array<{ lotId: string; valuePercent: number | null; technicalReplicateCount: number; qualityWarnings: string[] }>;
  candidateAssessments: PTMCandidateAssessment[];
}

export interface PTMIntervalResult {
  taskId: string;
  upstreamProfessionalEngine?: string;
  processingBoundary?: string;
  engine: { name: string; version: string };
  generatedAt: string;
  intervalMethod: string;
  minReferenceLots: number;
  inputs: {
    reference: { name: string; sha256: string; lotCount: number };
    candidate: { name: string; sha256: string; lotCount: number };
  };
  summary: {
    analyteCount: number;
    referenceLotCount: number;
    candidateLotCount: number;
    withinIntervalCount: number;
    outsideIntervalCount: number;
    candidateOnlyVariantCount: number;
    indeterminateCount: number;
    integrityWarningCount: number;
  };
  integrityWarnings: Array<{ code: string; severity: "low" | "medium" | "high"; message: string; analyteId?: string }>;
  analytes: PTMAnalyteResult[];
  disclaimer: string;
  briefExplanation?: string;
  externalWorkflow?: {
    engine: string;
    generatedAt: string;
    parameters: Record<string, unknown>;
    psmStatistics: {
      targetPsmCount: number;
      decoyPsmCount: number;
      minimumSpectrumQValue: number | null;
      targetPsmCountAtFdr01: number;
    };
    referenceRunCount: number;
    candidateRunCount: number;
    processingBoundary: string;
  };
}

export type SubmissionRouteStatus = "ready" | "partial" | "conflict" | "not-found";

export interface ExtractedSubmissionFile {
  name: string;
  content: string;
  sources: string[];
  rowCount: number;
}

export interface SubmissionRoute {
  moduleId: string;
  moduleName: string;
  status: SubmissionRouteStatus;
  candidate: ExtractedSubmissionFile | null;
  reference: ExtractedSubmissionFile | null;
  message: string;
}

export interface SubmissionImportResult {
  submissionId: string;
  generatedAt: string;
  files: Array<{ name: string; tableCount: number; format: string }>;
  datasets: Array<{
    moduleId: string;
    moduleName: string;
    role: "candidate" | "reference" | null;
    sourceFile: string;
    sheetName: string;
    rowCount: number;
    columns: string[];
    confidence: "high" | "medium";
    reasons: string[];
  }>;
  routes: SubmissionRoute[];
  warnings: string[];
  documentExtractions: Array<{
    sourceFile: string;
    format: "pdf" | "docx";
    status: "parsed" | "partial" | "unrecognized" | "failed";
    pageCount?: number;
    paragraphCount?: number;
    tableCount: number;
    extractedCharacters: number;
    preview: string;
    warnings: string[];
  }>;
  rawPtmBundle: {
    status: "ready" | "partial" | "not-found";
    referenceMzmlNames: string[];
    candidateMzmlNames: string[];
    unresolvedMzmlNames: string[];
    fastaName: string | null;
    message: string;
  };
  rawDatasets: Array<{
    kind: "chromatography" | "glycan" | "free-thiol";
    role: "candidate" | "reference" | null;
    fileNames: string[];
  }>;
  ocrReserved: boolean;
  parser: { name: string; version: string; supportedFormats: string[] };
}
