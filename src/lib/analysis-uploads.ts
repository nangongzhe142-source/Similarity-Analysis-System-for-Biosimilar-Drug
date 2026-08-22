import type { AnalysisInputKind } from "@/types/models";

/** File extensions accepted by analysis-service/app/security/limits.py (D16). */
const EXTENSIONS_BY_INPUT_KIND: Record<AnalysisInputKind, string[]> = {
  "raw-spectra": [".mzml", ".mzxml"],
  "vendor-raw": [".raw"],
  "peak-list": [".mgf"],
  "structured-export": [".csv", ".tsv", ".txt"],
  sequence: [".fasta", ".fa", ".faa"],
  "figure-image": [".png", ".jpg", ".jpeg", ".webp"],
};

export function acceptAttributeForInputKinds(kinds: AnalysisInputKind[]): string {
  const extensions = new Set<string>();
  for (const kind of kinds) {
    for (const extension of EXTENSIONS_BY_INPUT_KIND[kind]) {
      extensions.add(extension);
    }
  }
  return [...extensions].join(",");
}

export function formatListForInputKinds(kinds: AnalysisInputKind[]): string {
  return kinds
    .flatMap((kind) => EXTENSIONS_BY_INPUT_KIND[kind])
    .map((extension) => extension.slice(1))
    .join(", ");
}
