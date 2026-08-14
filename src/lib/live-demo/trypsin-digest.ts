/**
 * Trypsin in-silico digestion matching pyOpenMS ProteaseDigestion
 * (cleave after K/R unless followed by P). Used for the sequence-coverage
 * live demo. MS1 precursor matching is simulated; this is not MS/MS
 * sequence confirmation.
 */

import { peptideMonoisotopicMass } from "@/lib/live-demo/protein-mass";

export const DEFAULT_MISSED_CLEAVAGES = 1;
export const DEFAULT_MIN_PEPTIDE_LENGTH = 6;
export const DEFAULT_MATCH_TOLERANCE_PPM = 10;

export interface DigestedPeptide {
  sequence: string;
  start: number;
  end: number;
  length: number;
  monoisotopicMassDa: number;
}

export interface CoverageResult {
  theoreticalPeptideCount: number;
  matchedPeptideCount: number;
  unmatchedPeptideCount: number;
  coveredResidueCount: number;
  sequenceLength: number;
  coveragePercent: number;
  unmatchedPeptides: DigestedPeptide[];
  peptides: DigestedPeptide[];
}

function cleavageSites(sequence: string): number[] {
  const sites: number[] = [];
  for (let index = 0; index < sequence.length - 1; index += 1) {
    const residue = sequence[index];
    const nextResidue = sequence[index + 1];
    if ((residue === "K" || residue === "R") && nextResidue !== "P") {
      sites.push(index + 1);
    }
  }
  sites.push(sequence.length);
  return sites;
}

export function digestWithTrypsin(
  sequence: string,
  missedCleavages = DEFAULT_MISSED_CLEAVAGES,
  minPeptideLength = DEFAULT_MIN_PEPTIDE_LENGTH,
): DigestedPeptide[] {
  const ends = cleavageSites(sequence);
  const starts = [0, ...ends.slice(0, -1)];
  const fragmentCount = starts.length;
  const peptides: DigestedPeptide[] = [];

  for (let fragmentIndex = 0; fragmentIndex < fragmentCount; fragmentIndex += 1) {
    for (let skip = 0; skip <= missedCleavages; skip += 1) {
      const endFragmentIndex = fragmentIndex + skip;
      if (endFragmentIndex >= fragmentCount) {
        break;
      }
      const start = starts[fragmentIndex];
      const end = ends[endFragmentIndex];
      const peptideSequence = sequence.slice(start, end);
      if (peptideSequence.length < minPeptideLength) {
        continue;
      }
      peptides.push({
        sequence: peptideSequence,
        start: start + 1,
        end,
        length: peptideSequence.length,
        monoisotopicMassDa: peptideMonoisotopicMass(peptideSequence),
      });
    }
  }
  return peptides;
}

export function introduceSubstitution(
  sequence: string,
  fromResidue: string,
  toResidue: string,
  preferredPositionOneBased: number,
): { mutated: string; position: number } {
  const preferredIndex = preferredPositionOneBased - 1;
  if (sequence[preferredIndex] === fromResidue) {
    return {
      mutated: sequence.slice(0, preferredIndex) + toResidue + sequence.slice(preferredIndex + 1),
      position: preferredPositionOneBased,
    };
  }
  const midpoint = Math.floor(sequence.length / 2);
  for (let offset = 0; offset < sequence.length; offset += 1) {
    for (const index of [midpoint + offset, midpoint - offset]) {
      if (index >= 0 && index < sequence.length && sequence[index] === fromResidue) {
        return {
          mutated: sequence.slice(0, index) + toResidue + sequence.slice(index + 1),
          position: index + 1,
        };
      }
    }
  }
  throw new Error(`序列中未找到可替换的 ${fromResidue}`);
}

export function matchPeptidesToObservedMasses(
  peptides: DigestedPeptide[],
  observedMasses: number[],
  sequenceLength: number,
  matchTolerancePpm = DEFAULT_MATCH_TOLERANCE_PPM,
): CoverageResult {
  const coveredPositions = new Set<number>();
  const unmatchedPeptides: DigestedPeptide[] = [];
  let matchedPeptideCount = 0;

  for (const peptide of peptides) {
    const toleranceDa = peptide.monoisotopicMassDa * matchTolerancePpm * 1e-6;
    const matched = observedMasses.some(
      (observed) => Math.abs(observed - peptide.monoisotopicMassDa) <= toleranceDa,
    );
    if (matched) {
      matchedPeptideCount += 1;
      for (let position = peptide.start; position <= peptide.end; position += 1) {
        coveredPositions.add(position);
      }
    } else {
      unmatchedPeptides.push(peptide);
    }
  }

  return {
    theoreticalPeptideCount: peptides.length,
    matchedPeptideCount,
    unmatchedPeptideCount: unmatchedPeptides.length,
    coveredResidueCount: coveredPositions.size,
    sequenceLength,
    coveragePercent: sequenceLength === 0 ? 0 : (100 * coveredPositions.size) / sequenceLength,
    unmatchedPeptides,
    peptides,
  };
}

/** Perfect-detection observed list: every theoretical peptide mass is "measured". */
export function observedMassesFromPeptides(peptides: DigestedPeptide[]): number[] {
  return peptides.map((peptide) => peptide.monoisotopicMassDa);
}
