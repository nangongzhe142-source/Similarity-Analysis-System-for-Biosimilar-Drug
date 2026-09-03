import catalogJson from "@/data/figure-library-catalog.json";

export type ColourRole = "candidate" | "reference";
export type ColourRoleSource = "figure-legend" | "docx-body" | "none";

export interface FigureLibraryEntry {
  fileName: string;
  sha256: string;
  collection: "图谱数据库" | "docx-media";
  mapped: boolean;
  itemId: string | null;
  methodId: string | null;
  profile: string | null;
  drugAnnotation: string;
  candidateProduct: string;
  referenceProduct: string;
  colourRoles: Partial<Record<"red" | "blue", ColourRole>>;
  colourRoleSource: ColourRoleSource;
  exclusionReason: string | null;
}

export const figureLibraryEntries = catalogJson.entries as FigureLibraryEntry[];

export function figureLibraryEntryByFileName(
  fileName: string | undefined,
): FigureLibraryEntry | undefined {
  if (!fileName) {
    return undefined;
  }
  const base = fileName.split(/[/\\]/).pop() ?? fileName;
  return figureLibraryEntries.find((entry) => entry.fileName === base);
}

export function figureLibraryEntriesForItem(itemId: string): FigureLibraryEntry[] {
  return figureLibraryEntries.filter(
    (entry) =>
      entry.mapped &&
      entry.itemId === itemId &&
      entry.collection === "图谱数据库",
  );
}

export function figureLibraryEntriesForMethod(methodId: string): FigureLibraryEntry[] {
  return figureLibraryEntries.filter(
    (entry) =>
      entry.mapped &&
      entry.methodId === methodId &&
      entry.collection === "图谱数据库",
  );
}

export function figureLibraryPublicUrl(fileName: string): string {
  return `/api/figure-library?file=${encodeURIComponent(fileName)}`;
}
