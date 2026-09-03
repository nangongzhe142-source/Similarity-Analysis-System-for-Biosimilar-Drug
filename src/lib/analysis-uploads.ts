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

const IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function acceptAttributeForInputKinds(
  kinds: AnalysisInputKind[],
): string | undefined {
  const uniqueKinds = [...new Set(kinds)];
  const includesFigure = uniqueKinds.includes("figure-image");
  const includesNonFigure = uniqueKinds.some((kind) => kind !== "figure-image");

  // Windows Chromium applies only the first token in a mixed `accept` list.
  // `.mzml` was first, so 图谱数据库 PNGs were hidden. An empty `accept=""`
  // still sets the attribute; Chromium then shows files but does not keep the
  // selection. Omit the attribute instead. D16 still rejects other extensions.
  if (includesFigure && includesNonFigure) {
    return undefined;
  }

  const tokens: string[] = [];
  const seen = new Set<string>();
  function add(token: string) {
    if (seen.has(token)) {
      return;
    }
    seen.add(token);
    tokens.push(token);
  }

  if (includesFigure) {
    for (const extension of EXTENSIONS_BY_INPUT_KIND["figure-image"]) {
      add(extension);
    }
    for (const mime of IMAGE_MIME_TYPES) {
      add(mime);
    }
  }
  for (const kind of uniqueKinds) {
    if (kind === "figure-image") {
      continue;
    }
    for (const extension of EXTENSIONS_BY_INPUT_KIND[kind]) {
      add(extension);
    }
  }
  return tokens.join(",");
}

export function formatListForInputKinds(kinds: AnalysisInputKind[]): string {
  return kinds
    .flatMap((kind) => EXTENSIONS_BY_INPUT_KIND[kind])
    .map((extension) => extension.slice(1))
    .join(", ");
}
