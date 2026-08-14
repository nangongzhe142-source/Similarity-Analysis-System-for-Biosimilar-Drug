/**
 * Theoretical protein mass using the same elemental masses as pyOpenMS 3.5.0.
 *
 * Free amino-acid average / monoisotopic masses were dumped from
 * `pyopenms.AASequence.fromString(aa).getAverageWeight()` on 2026-08-14.
 * A protein's intact mass is sum(free AA) − (n − 1) × water, i.e. residues
 * plus the terminal H2O. Forming one disulfide bond loses two hydrogens.
 *
 * This is the calculation side of the framework's 「理论质量核对」.
 * It is not a substitute for measured deconvolution.
 */

/** pyOpenMS EmpiricalFormula('H2O') average / monoisotopic weights. */
export const WATER_AVERAGE_MASS = 18.015286830612062;
export const WATER_MONOISOTOPIC_MASS = 18.0105650638;
export const HYDROGEN_AVERAGE_MASS = 1.0079407537260314;
export const HYDROGEN_LOST_PER_DISULFIDE = 2;

/** Free amino-acid masses (include the terminal water of a single residue). */
const FREE_AMINO_ACID_AVERAGE_MASS: Record<string, number> = {
  A: 89.09334670670222,
  R: 174.20136894468445,
  N: 132.11817177088824,
  D: 133.10289325152223,
  C: 121.15943144199122,
  E: 147.1295106574743,
  Q: 146.14478917684033,
  G: 75.06672930075015,
  H: 155.1549220872543,
  I: 131.17319892455842,
  L: 131.17319892455842,
  K: 146.18788276708443,
  M: 149.21266625389535,
  F: 165.18952511260636,
  P: 115.13070001115429,
  S: 105.09275202986223,
  T: 119.11936943581429,
  W: 204.2256807521324,
  Y: 181.18893043576634,
  V: 117.14658151860635,
};

const FREE_AMINO_ACID_MONOISOTOPIC_MASS: Record<string, number> = {
  A: 89.0476792233,
  R: 174.11167644660003,
  N: 132.0534932552,
  D: 133.0375092233,
  C: 121.01974995329999,
  E: 147.05315928710002,
  Q: 146.06914331900003,
  G: 75.0320291595,
  H: 155.06947728710003,
  I: 131.0946294147,
  L: 131.0946294147,
  K: 146.10552844660003,
  M: 149.05105008089998,
  F: 165.07897935090006,
  P: 115.06332928709999,
  S: 105.0425942233,
  T: 119.05824428710001,
  W: 204.0898783828,
  Y: 181.07389435090005,
  V: 117.0789793509,
};

export interface ProteinMassResult {
  residueCount: number;
  cysteineCount: number;
  reducedAverageMassDa: number;
  reducedMonoisotopicMassDa: number;
  disulfideCount: number;
  disulfideMassLossDa: number;
  oxidizedAverageMassDa: number;
}

export function normalizeProteinSequence(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .replace(/[BXZJOU]/g, "");
}

function sumMasses(sequence: string, table: Record<string, number>, waterMass: number): number {
  if (sequence.length === 0) {
    return 0;
  }
  let freeSum = 0;
  for (const residue of sequence) {
    const mass = table[residue];
    if (mass === undefined) {
      throw new Error(`不支持的氨基酸残基: ${residue}`);
    }
    freeSum += mass;
  }
  return freeSum - (sequence.length - 1) * waterMass;
}

export function computeProteinMass(sequence: string, disulfideCount: number): ProteinMassResult {
  const residueCount = sequence.length;
  const cysteineCount = (sequence.match(/C/g) ?? []).length;
  const reducedAverageMassDa = sumMasses(sequence, FREE_AMINO_ACID_AVERAGE_MASS, WATER_AVERAGE_MASS);
  const reducedMonoisotopicMassDa = sumMasses(
    sequence,
    FREE_AMINO_ACID_MONOISOTOPIC_MASS,
    WATER_MONOISOTOPIC_MASS,
  );
  const disulfideMassLossDa = disulfideCount * HYDROGEN_LOST_PER_DISULFIDE * HYDROGEN_AVERAGE_MASS;
  return {
    residueCount,
    cysteineCount,
    reducedAverageMassDa,
    reducedMonoisotopicMassDa,
    disulfideCount,
    disulfideMassLossDa,
    oxidizedAverageMassDa: reducedAverageMassDa - disulfideMassLossDa,
  };
}

export function peptideMonoisotopicMass(peptide: string): number {
  return sumMasses(peptide, FREE_AMINO_ACID_MONOISOTOPIC_MASS, WATER_MONOISOTOPIC_MASS);
}
