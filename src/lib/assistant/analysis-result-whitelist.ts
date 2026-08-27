import type {
  AnalysisExtractedFeatures,
  AnalysisResult,
  AnalysisResultProvenance,
  AnalysisRuleEvaluation,
} from "@/types/analysis-contract";

export const ASSISTANT_ANALYSIS_RESULT_MAX_CHARS = 12_000;
export const ASSISTANT_FEATURE_ARRAY_LIMIT = 12;
export const ASSISTANT_RULE_EVALUATION_LIMIT = 20;
export const ASSISTANT_WARNING_LIMIT = 12;

export interface WhitelistedAnalysisProvenance {
  summary: AnalysisResultProvenance["summary"];
  whatItIs: AnalysisResultProvenance["whatItIs"];
  whatItIsNot: AnalysisResultProvenance["whatItIsNot"];
  dataSource: AnalysisResultProvenance["dataSource"];
  samplePairing: AnalysisResultProvenance["samplePairing"];
}

export interface WhitelistedAnalysisResult {
  schemaVersion: string;
  ruleSetVersion: string;
  jobId: string;
  itemId: string;
  methodId: string;
  profile: string;
  verdict: AnalysisResult["verdict"];
  verdictRationale: AnalysisResult["verdictRationale"];
  inputEvidence: {
    dataSource: AnalysisResult["inputEvidence"]["dataSource"];
    evidenceLevel: AnalysisResult["inputEvidence"]["evidenceLevel"];
    samplePairing: {
      candidateLabel: string;
      referenceLabel: string;
      isHeadToHeadBiosimilarDesign: boolean;
    };
  };
  extractedFeatures: {
    deltaDa?: number[];
    deltaPpm?: number[];
    coveragePercent?: number;
    coverageDefinition?: AnalysisExtractedFeatures["coverageDefinition"];
    imageComparison?: AnalysisExtractedFeatures["imageComparison"];
  };
  ruleEvaluation: Array<{
    ruleId: string;
    sourceSheet: string;
    sourceRow: number;
    sourceCells: string[];
    outcome: AnalysisRuleEvaluation["outcome"];
    rationale: AnalysisRuleEvaluation["rationale"];
  }>;
  warnings: string[];
  limitations: string[];
  disclaimer: AnalysisResult["disclaimer"];
  truncated: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function limitNumbers(value: unknown, limit: number): number[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const numbers = value.filter((entry): entry is number => typeof entry === "number");
  if (numbers.length === 0) return undefined;
  return numbers.slice(0, limit);
}

function limitStrings(value: unknown, limit: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is string => typeof entry === "string" && entry.length > 0)
    .slice(0, limit);
}

function clipText(value: string, max: number): string {
  return value.length <= max ? value : value.slice(0, max);
}

function localized(value: { zh: string; en: string }, max: number): { zh: string; en: string } {
  return { zh: clipText(value.zh, max), en: clipText(value.en, max) };
}

function whitelistImageComparison(
  value: unknown,
): AnalysisExtractedFeatures["imageComparison"] | undefined {
  if (!isRecord(value)) return undefined;
  const outcome = asString(value.outcome);
  const driverMetric = asString(value.driverMetric);
  if (!outcome || !driverMetric) return undefined;
  const rationale = isRecord(value.rationale) ? value.rationale : {};
  return {
    outcome: outcome as NonNullable<AnalysisExtractedFeatures["imageComparison"]>["outcome"],
    driverMetric,
    driverValue: typeof value.driverValue === "number" ? value.driverValue : undefined,
    consistentThreshold:
      typeof value.consistentThreshold === "number" ? value.consistentThreshold : 0,
    differenceThreshold:
      typeof value.differenceThreshold === "number" ? value.differenceThreshold : 0,
    thresholdKind: asString(
      value.thresholdKind,
    ) as NonNullable<AnalysisExtractedFeatures["imageComparison"]>["thresholdKind"],
    nonDiscriminatingMetrics: limitStrings(value.nonDiscriminatingMetrics, 8),
    rationale: localized({ zh: asString(rationale.zh), en: asString(rationale.en) }, 300),
  };
}

/**
 * Copy only the fields the assistant is allowed to see. Missing results stay
 * empty; this function never invents a verdict, threshold or provenance.
 */
export function whitelistAnalysisResult(
  value: unknown,
): WhitelistedAnalysisResult | null {
  if (!isRecord(value)) return null;
  const verdict = asString(value.verdict);
  if (verdict.length === 0) return null;

  const inputEvidence = isRecord(value.inputEvidence) ? value.inputEvidence : {};
  const samplePairing = isRecord(inputEvidence.samplePairing)
    ? inputEvidence.samplePairing
    : {};
  const features = isRecord(value.extractedFeatures) ? value.extractedFeatures : {};
  const ruleEvaluationRaw = Array.isArray(value.ruleEvaluation)
    ? value.ruleEvaluation
    : [];

  const whitelisted: WhitelistedAnalysisResult = {
    schemaVersion: asString(value.schemaVersion),
    ruleSetVersion: asString(value.ruleSetVersion),
    jobId: asString(value.jobId),
    itemId: asString(value.itemId),
    methodId: asString(value.methodId),
    profile: asString(value.profile),
    verdict: verdict as AnalysisResult["verdict"],
    verdictRationale: isRecord(value.verdictRationale)
      ? {
          zh: asString(value.verdictRationale.zh),
          en: asString(value.verdictRationale.en),
        }
      : { zh: "", en: "" },
    inputEvidence: {
      dataSource: asString(inputEvidence.dataSource) as AnalysisResult["inputEvidence"]["dataSource"],
      evidenceLevel: asString(
        inputEvidence.evidenceLevel,
      ) as AnalysisResult["inputEvidence"]["evidenceLevel"],
      samplePairing: {
        candidateLabel: asString(samplePairing.candidateLabel),
        referenceLabel: asString(samplePairing.referenceLabel),
        isHeadToHeadBiosimilarDesign: samplePairing.isHeadToHeadBiosimilarDesign === true,
      },
    },
    extractedFeatures: {
      deltaDa: limitNumbers(features.deltaDa, ASSISTANT_FEATURE_ARRAY_LIMIT),
      deltaPpm: limitNumbers(features.deltaPpm, ASSISTANT_FEATURE_ARRAY_LIMIT),
      coveragePercent:
        typeof features.coveragePercent === "number" ? features.coveragePercent : undefined,
      coverageDefinition: asString(features.coverageDefinition)
        ? (asString(features.coverageDefinition) as AnalysisExtractedFeatures["coverageDefinition"])
        : undefined,
      imageComparison: whitelistImageComparison(features.imageComparison),
    },
    ruleEvaluation: ruleEvaluationRaw
      .filter(isRecord)
      .slice(0, ASSISTANT_RULE_EVALUATION_LIMIT)
      .map((row) => ({
        ruleId: asString(row.ruleId),
        sourceSheet: asString(row.sourceSheet),
        sourceRow: typeof row.sourceRow === "number" ? row.sourceRow : 0,
        sourceCells: limitStrings(row.sourceCells, 16),
        outcome: asString(row.outcome) as AnalysisRuleEvaluation["outcome"],
        rationale: isRecord(row.rationale)
          ? localized(
              { zh: asString(row.rationale.zh), en: asString(row.rationale.en) },
              500,
            )
          : { zh: "", en: "" },
      })),
    warnings: limitStrings(value.warnings, ASSISTANT_WARNING_LIMIT).map((entry) =>
      clipText(entry, 300),
    ),
    limitations: limitStrings(value.limitations, ASSISTANT_WARNING_LIMIT).map((entry) =>
      clipText(entry, 300),
    ),
    disclaimer: isRecord(value.disclaimer)
      ? localized(
          { zh: asString(value.disclaimer.zh), en: asString(value.disclaimer.en) },
          500,
        )
      : { zh: "", en: "" },
    truncated: false,
  };
  whitelisted.verdictRationale = localized(whitelisted.verdictRationale, 500);

  let serialized = JSON.stringify(whitelisted);
  if (serialized.length <= ASSISTANT_ANALYSIS_RESULT_MAX_CHARS) {
    return whitelisted;
  }

  whitelisted.extractedFeatures = {
    coveragePercent: whitelisted.extractedFeatures.coveragePercent,
    coverageDefinition: whitelisted.extractedFeatures.coverageDefinition,
  };
  whitelisted.truncated = true;
  serialized = JSON.stringify(whitelisted);
  if (serialized.length <= ASSISTANT_ANALYSIS_RESULT_MAX_CHARS) {
    return whitelisted;
  }

  whitelisted.ruleEvaluation = whitelisted.ruleEvaluation.slice(0, 3);
  whitelisted.warnings = [];
  whitelisted.limitations = [];
  serialized = JSON.stringify(whitelisted);
  if (serialized.length <= ASSISTANT_ANALYSIS_RESULT_MAX_CHARS) {
    return whitelisted;
  }

  return {
    schemaVersion: whitelisted.schemaVersion,
    ruleSetVersion: whitelisted.ruleSetVersion,
    jobId: whitelisted.jobId,
    itemId: whitelisted.itemId,
    methodId: whitelisted.methodId,
    profile: whitelisted.profile,
    verdict: whitelisted.verdict,
    verdictRationale: localized(whitelisted.verdictRationale, 120),
    inputEvidence: whitelisted.inputEvidence,
    extractedFeatures: {},
    ruleEvaluation: [],
    warnings: [],
    limitations: [],
    disclaimer: localized(whitelisted.disclaimer, 120),
    truncated: true,
  };
}

export function whitelistAnalysisProvenance(
  value: unknown,
): WhitelistedAnalysisProvenance | null {
  if (!isRecord(value)) return null;
  const summary = isRecord(value.summary) ? value.summary : {};
  if (!asString(summary.zh) && !asString(summary.en)) return null;
  const pick = (field: string): { zh: string; en: string } => {
    const entry = isRecord(value[field]) ? value[field] : {};
    return { zh: asString(entry.zh), en: asString(entry.en) };
  };
  return {
    summary: pick("summary"),
    whatItIs: pick("whatItIs"),
    whatItIsNot: pick("whatItIsNot"),
    dataSource: pick("dataSource"),
    samplePairing: pick("samplePairing"),
  };
}

export function serializeWhitelistedResult(
  value: WhitelistedAnalysisResult | null,
): string {
  if (value === null) return "";
  return JSON.stringify(value);
}

export function serializeWhitelistedProvenance(
  value: WhitelistedAnalysisProvenance | null,
): string {
  if (value === null) return "";
  return JSON.stringify(value);
}
