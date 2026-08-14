/**
 * Which detection methods expose a browser-side live demo, and the synthetic
 * / public data those demos start from.
 *
 * Live demos compute in the browser. They do not call UniDec or pyOpenMS.
 * Every demo is labelled synthetic-demo except the BSA sequence, which is
 * the public UniProt P02769 mature chain (residues 25–607).
 */

export type LiveDemoKind = "intact-mass" | "peptide-map" | "quality-range";

/** UniProt P02769 mature chain, residues 25–607, 583 aa. Cached from rest.uniprot.org on 2026-08-14. */
export const BSA_MATURE_SEQUENCE =
  "DTHKSEIAHRFKDLGEEHFKGLVLIAFSQYLQQCPFDEHVKLVNELTEFAKTCVADESHAGCEKSLHTLFGDELCKVASLRETYGDMADCCEKQEPERNECFLSHKDDSPDLPKLKPDPNTLCDEFKADEKKFWGKYLYEIARRHPYFYAPELLYYANKYNGVFQECCQAEDKGACLLPKIETMREKVLASSARQRLRCASIQKFGERALKAWSVARLSQKFPKAEFVEVTKLVTDLTKVHKECCHGDLLECADDRADLAKYICDNQDTISSKLKECCDKPLLEKSHCIAEVEKDAIPENLPPLTADFAEDKDVCKNYQEAKDAFLGSFLYEYSRRHPEYAVSVLLRLAKEYEATLEECCAKDDPHACYSTVFDKLKHLVDEPQNLIKQNCDQFEKLGEYGFQNALIVRYTRKVPQVSTPTLVEVSRSLGKVGTRCCTKPESERMPCTEDYLSLILNRLCVLHEKTPVSEKVTKCCTESLVNRRPCFSALTPDETYVPKAFDEKLFTFHADICTLPDTEKQIKKQTALVELLKHKPKATEEQLKTVMENFVAFVDKCCAADDKEACFAVEGPKLVVSTQTALA";

export const BSA_DISULFIDE_COUNT = 17;
export const BSA_UNIPROT_ACCESSION = "P02769";
export const HEXOSE_MASS_SHIFT_DA = 162.0528;
export const PEPTIDE_SUBSTITUTION_POSITION = 327;

/** Synthetic lot values from tools-poc/output/s09c_free_thiol_quality_range.json. */
export const SYNTHETIC_REFERENCE_LOTS = [
  0.9273, 0.976, 0.9612, 0.9277, 0.9474, 0.8124, 0.8194, 0.981, 0.9016, 0.8981, 0.8519, 0.9267,
  0.9627, 0.9648, 0.9362, 0.9349, 0.9258, 1.0159, 0.828, 0.9329,
];

export const SYNTHETIC_CANDIDATE_SIMILAR_LOTS = [
  0.8937, 0.9795, 0.9201, 0.8896, 0.929, 0.9258, 1.0812, 1.0213, 0.9826, 0.9115, 0.8893, 0.9086,
];

export const SYNTHETIC_CANDIDATE_SHIFTED_LOTS = [
  1.0551, 1.0404, 1.1672, 1.0729, 1.2117, 1.14, 1.0673, 1.1496, 1.1602, 1.1723, 1.1254, 1.0905,
];

const INTACT_MASS_DEMO_METHOD_IDS = [
  "intact-mass-primary-1",
  "intact-mass-orthogonal-2",
  "deglycosylated-intact-mass-primary-1",
  "deglycosylated-intact-mass-orthogonal-2",
  "light-chain-mass-primary-1",
  "light-chain-mass-orthogonal-2",
  "non-deglycosylated-heavy-chain-mass-primary-1",
  "non-deglycosylated-heavy-chain-mass-orthogonal-2",
  "deglycosylated-heavy-chain-mass-primary-1",
  "deglycosylated-heavy-chain-mass-orthogonal-2",
  "n-c-terminal-sequence-orthogonal-1",
];

const PEPTIDE_MAP_DEMO_METHOD_IDS = [
  "intact-mass-orthogonal-1",
  "deglycosylated-intact-mass-orthogonal-1",
  "light-chain-mass-orthogonal-1",
  "non-deglycosylated-heavy-chain-mass-orthogonal-1",
  "deglycosylated-heavy-chain-mass-orthogonal-1",
  "ms1-sequence-coverage-primary-1",
  "ms1-sequence-coverage-orthogonal-1",
  "ms1-sequence-coverage-orthogonal-2",
  "msms-sequence-coverage-primary-1",
  "msms-sequence-coverage-orthogonal-1",
  "cdr-signature-peptides-primary-1",
  "cdr-signature-peptides-orthogonal-1",
  "cdr-signature-peptides-orthogonal-2",
  "n-c-terminal-sequence-primary-1",
  "free-thiol-orthogonal-1",
];

const QUALITY_RANGE_DEMO_METHOD_IDS = ["free-thiol-primary-1"];

const demoKindByMethodId = new Map<string, LiveDemoKind>();
for (const methodId of INTACT_MASS_DEMO_METHOD_IDS) {
  demoKindByMethodId.set(methodId, "intact-mass");
}
for (const methodId of PEPTIDE_MAP_DEMO_METHOD_IDS) {
  demoKindByMethodId.set(methodId, "peptide-map");
}
for (const methodId of QUALITY_RANGE_DEMO_METHOD_IDS) {
  demoKindByMethodId.set(methodId, "quality-range");
}

export function getLiveDemoKind(methodId: string): LiveDemoKind | undefined {
  return demoKindByMethodId.get(methodId);
}

export function formatLotList(values: number[]): string {
  return values.join("\n");
}
