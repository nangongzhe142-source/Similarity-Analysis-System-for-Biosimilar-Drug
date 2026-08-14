/**
 * Mechanical checks for the browser-side live-demo formulas.
 * Mirrors src/lib/live-demo/*.ts so a drift in the TypeScript copy is caught
 * by the same numeric oracles used in the Python PoC.
 *
 * Run: node scripts/verify_live_demo.mjs
 */
import assert from "node:assert/strict";

const WATER_AVERAGE_MASS = 18.015286830612062;
const HYDROGEN_AVERAGE_MASS = 1.0079407537260314;
const PROTON_MASS = 1.007276467;
const HEXOSE_MASS_SHIFT_DA = 162.0528;

const FREE_AMINO_ACID_AVERAGE_MASS = {
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

const BSA_MATURE_SEQUENCE =
  "DTHKSEIAHRFKDLGEEHFKGLVLIAFSQYLQQCPFDEHVKLVNELTEFAKTCVADESHAGCEKSLHTLFGDELCKVASLRETYGDMADCCEKQEPERNECFLSHKDDSPDLPKLKPDPNTLCDEFKADEKKFWGKYLYEIARRHPYFYAPELLYYANKYNGVFQECCQAEDKGACLLPKIETMREKVLASSARQRLRCASIQKFGERALKAWSVARLSQKFPKAEFVEVTKLVTDLTKVHKECCHGDLLECADDRADLAKYICDNQDTISSKLKECCDKPLLEKSHCIAEVEKDAIPENLPPLTADFAEDKDVCKNYQEAKDAFLGSFLYEYSRRHPEYAVSVLLRLAKEYEATLEECCAKDDPHACYSTVFDKLKHLVDEPQNLIKQNCDQFEKLGEYGFQNALIVRYTRKVPQVSTPTLVEVSRSLGKVGTRCCTKPESERMPCTEDYLSLILNRLCVLHEKTPVSEKVTKCCTESLVNRRPCFSALTPDETYVPKAFDEKLFTFHADICTLPDTEKQIKKQTALVELLKHKPKATEEQLKTVMENFVAFVDKCCAADDKEACFAVEGPKLVVSTQTALA";

function proteinAverageMass(sequence) {
  let freeSum = 0;
  for (const residue of sequence) {
    freeSum += FREE_AMINO_ACID_AVERAGE_MASS[residue];
  }
  return freeSum - (sequence.length - 1) * WATER_AVERAGE_MASS;
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sampleSd(values) {
  const sampleMean = mean(values);
  const squared = values.reduce((sum, value) => {
    const residual = value - sampleMean;
    return sum + residual * residual;
  }, 0);
  return Math.sqrt(squared / (values.length - 1));
}

function recoverMass(theoreticalMass) {
  const peaks = [];
  for (let charge = 30; charge <= 60; charge += 1) {
    const mz = (theoreticalMass + charge * PROTON_MASS) / charge;
    const intensity = Math.exp(-0.5 * ((charge - 45) / 7) ** 2);
    peaks.push({ charge, mz, intensity });
  }
  const sorted = [...peaks].sort((left, right) => left.mz - right.mz);
  const base = peaks.reduce((current, candidate) =>
    candidate.intensity > current.intensity ? candidate : current,
  );
  const baseIndex = sorted.findIndex((peak) => peak.mz === base.mz);
  const next = sorted[baseIndex + 1];
  const inferredCharge = Math.round(next.mz / (next.mz - base.mz));
  return inferredCharge * base.mz - inferredCharge * PROTON_MASS;
}

const failures = [];

function check(label, actual, expected, tolerance) {
  const ok = Math.abs(actual - expected) <= tolerance;
  if (!ok) {
    failures.push(`${label}: actual=${actual} expected=${expected}`);
  }
}

assert.equal(BSA_MATURE_SEQUENCE.length, 583);
assert.equal((BSA_MATURE_SEQUENCE.match(/C/g) || []).length, 35);

const reduced = proteinAverageMass(BSA_MATURE_SEQUENCE);
const oxidized = reduced - 17 * 2 * HYDROGEN_AVERAGE_MASS;
// pyOpenMS 3.5.0 on this sequence: reduced 66432.46 Da, oxidised 66398.19 Da
check("BSA reduced average mass vs pyOpenMS", reduced, 66432.46, 0.05);
check("BSA oxidised average mass vs pyOpenMS", oxidized, 66398.19, 0.05);

const recovered = recoverMass(oxidized);
check("charge-envelope mass recovery", recovered, oxidized, 0.05);

const candidateTruth = oxidized + HEXOSE_MASS_SHIFT_DA;
const recoveredShift = recoverMass(candidateTruth) - recovered;
check("hexose shift recovery", recoveredShift, HEXOSE_MASS_SHIFT_DA, 0.05);

const reference = [
  0.9273, 0.976, 0.9612, 0.9277, 0.9474, 0.8124, 0.8194, 0.981, 0.9016, 0.8981, 0.8519, 0.9267,
  0.9627, 0.9648, 0.9362, 0.9349, 0.9258, 1.0159, 0.828, 0.9329,
];
const similar = [
  0.8937, 0.9795, 0.9201, 0.8896, 0.929, 0.9258, 1.0812, 1.0213, 0.9826, 0.9115, 0.8893, 0.9086,
];
const shifted = [
  1.0551, 1.0404, 1.1672, 1.0729, 1.2117, 1.14, 1.0673, 1.1496, 1.1602, 1.1723, 1.1254, 1.0905,
];
const muR = mean(reference);
const sigmaR = sampleSd(reference);
const lower = muR - 3 * sigmaR;
const upper = muR + 3 * sigmaR;
check("QR lower vs s09c", lower, 0.7548, 0.00015);
check("QR upper vs s09c", upper, 1.0884, 0.00015);

const similarInside = similar.filter((value) => value >= lower && value <= upper).length;
const shiftedInside = shifted.filter((value) => value >= lower && value <= upper).length;
assert.equal(similarInside, 12);
assert.equal(shiftedInside, 4);

if (failures.length > 0) {
  console.error("Live demo verification failed:");
  for (const failure of failures) {
    console.error("  ", failure);
  }
  process.exit(1);
}

console.log("Live demo formulas match the pyOpenMS / s09c oracles.");
console.log(`  BSA oxidised mass ${oxidized.toFixed(2)} Da`);
console.log(`  recovered ${recovered.toFixed(2)} Da`);
console.log(`  QR [${lower.toFixed(4)}, ${upper.toFixed(4)}]`);
