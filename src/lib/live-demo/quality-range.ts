/**
 * Quality-range (QR) decision as written in characterization-items.ts:1026:
 *   QR = (μR − X·σR, μR + X·σR)
 *   a sufficient fraction of candidate lots (e.g. ≥90%) falling inside
 *   can support similarity of that attribute.
 *
 * QR is a descriptive interval of the reference lots. It is not a
 * confidence interval and not a tolerance interval.
 */

export const DEFAULT_SIGMA_MULTIPLIER = 3;
export const DEFAULT_MIN_WITHIN_RANGE_FRACTION = 0.9;

export interface QualityRangeInput {
  referenceValues: number[];
  candidateValues: number[];
  sigmaMultiplier: number;
  minWithinRangeFraction: number;
}

export interface QualityRangeResult {
  referenceLotCount: number;
  candidateLotCount: number;
  meanMuR: number;
  sdSigmaR: number;
  qualityRangeLower: number;
  qualityRangeUpper: number;
  qualityRangeWidth: number;
  candidateMean: number;
  candidateSd: number;
  withinRangeCount: number;
  withinRangeFraction: number;
  outOfRangeValues: number[];
  meetsThreshold: boolean;
}

export function parseNumericList(raw: string): number[] {
  return raw
    .split(/[\s,;]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .map((token) => Number(token))
    .filter((value) => Number.isFinite(value));
}

export function mean(values: number[]): number {
  if (values.length === 0) {
    throw new Error("均值需要至少一个数值");
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function sampleStandardDeviation(values: number[]): number {
  if (values.length < 2) {
    throw new Error("样本标准差需要至少两个数值");
  }
  const sampleMean = mean(values);
  const squaredErrorSum = values.reduce((sum, value) => {
    const residual = value - sampleMean;
    return sum + residual * residual;
  }, 0);
  return Math.sqrt(squaredErrorSum / (values.length - 1));
}

export function computeQualityRange(input: QualityRangeInput): QualityRangeResult {
  if (input.referenceValues.length < 2) {
    throw new Error("参照药至少需要 2 个批次才能估计 σR");
  }
  if (input.candidateValues.length < 1) {
    throw new Error("候选药至少需要 1 个批次");
  }
  if (!(input.sigmaMultiplier > 0)) {
    throw new Error("X 必须为正数");
  }

  const meanMuR = mean(input.referenceValues);
  const sdSigmaR = sampleStandardDeviation(input.referenceValues);
  const qualityRangeLower = meanMuR - input.sigmaMultiplier * sdSigmaR;
  const qualityRangeUpper = meanMuR + input.sigmaMultiplier * sdSigmaR;
  const candidateMean = mean(input.candidateValues);
  const candidateSd =
    input.candidateValues.length >= 2 ? sampleStandardDeviation(input.candidateValues) : 0;
  const outOfRangeValues = input.candidateValues.filter(
    (value) => value < qualityRangeLower || value > qualityRangeUpper,
  );
  const withinRangeCount = input.candidateValues.length - outOfRangeValues.length;
  const withinRangeFraction = withinRangeCount / input.candidateValues.length;

  return {
    referenceLotCount: input.referenceValues.length,
    candidateLotCount: input.candidateValues.length,
    meanMuR,
    sdSigmaR,
    qualityRangeLower,
    qualityRangeUpper,
    qualityRangeWidth: qualityRangeUpper - qualityRangeLower,
    candidateMean,
    candidateSd,
    withinRangeCount,
    withinRangeFraction,
    outOfRangeValues,
    meetsThreshold: withinRangeFraction >= input.minWithinRangeFraction,
  };
}
