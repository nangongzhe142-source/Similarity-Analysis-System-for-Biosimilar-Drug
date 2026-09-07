import {
  analysisProfileById,
  methodAnalysisConfigs,
} from "@/data/method-analysis-config";
import { isComputableItemId } from "@/lib/workbench/name-match";
import {
  INTAKE_EXTRACTOR_VISION_API,
  INTAKE_SOURCE_SCREEN_CAPTURE,
  INTAKE_SOURCE_SPONSOR_UPLOAD,
  type IntakeReviewState,
  type LotNumericRow,
  type ScreenRegionKind,
  type ScreenRegionRecord,
  type SponsorItemEntry,
  type UnmatchedRegionRef,
  type VisionRegion,
} from "@/types/intake";

export function createEmptySponsorEntries(
  itemIds: readonly string[],
): Record<string, SponsorItemEntry> {
  const entries: Record<string, SponsorItemEntry> = {};
  for (const itemId of itemIds) {
    entries[itemId] = {
      itemId,
      omitted: false,
      omitReason: "",
      unit: "",
      lots: [],
      notes: "",
      reviewState: "draft",
      source: INTAKE_SOURCE_SPONSOR_UPLOAD,
    };
  }
  return entries;
}

function rowHasUnit(row: LotNumericRow, itemUnit: string): boolean {
  return row.unit.trim().length > 0 || itemUnit.trim().length > 0;
}

export function isSponsorItemFilled(entry: SponsorItemEntry): boolean {
  if (entry.omitted) {
    return false;
  }
  if (entry.lots.length === 0) {
    return false;
  }
  const itemUnit = entry.unit.trim();
  return entry.lots.every(
    (row) =>
      row.lotId.trim().length > 0 &&
      Number.isFinite(row.value) &&
      rowHasUnit(row, itemUnit),
  );
}

export function sponsorCompleteness(entries: Readonly<Record<string, SponsorItemEntry>>): {
  filled: number;
  denominator: number;
} {
  const included = Object.values(entries).filter((entry) => !entry.omitted);
  return {
    denominator: included.length,
    filled: included.filter(isSponsorItemFilled).length,
  };
}

export function sponsorCategoryCompleteness(
  itemIds: readonly string[],
  entries: Readonly<Record<string, SponsorItemEntry>>,
): { filled: number; denominator: number } {
  const included = itemIds
    .map((itemId) => entries[itemId])
    .filter((entry): entry is SponsorItemEntry => entry !== undefined && !entry.omitted);
  return {
    denominator: included.length,
    filled: included.filter(isSponsorItemFilled).length,
  };
}

export function itemAllowsIntakeFigureAnalysis(itemId: string): boolean {
  if (!isComputableItemId(itemId)) {
    return false;
  }
  return methodAnalysisConfigs.some((config) => {
    if (config.itemId !== itemId || config.status !== "analyzable") {
      return false;
    }
    if (config.allowsImageFallback) {
      return true;
    }
    if (config.profile === undefined) {
      return false;
    }
    return analysisProfileById[config.profile].acceptedInputs.includes("figure-image");
  });
}

export function regionCanSendToAnalysis(
  region: {
    reviewState: IntakeReviewState;
    kind: ScreenRegionKind;
    itemId: string | null;
  },
  calibrated: boolean,
): boolean {
  if (region.reviewState !== "confirmed") {
    return false;
  }
  if (region.kind !== "spectrum") {
    return false;
  }
  if (!calibrated) {
    return false;
  }
  if (region.itemId === null) {
    return false;
  }
  return itemAllowsIntakeFigureAnalysis(region.itemId);
}

function toLotRows(region: VisionRegion, fallbackUnit: string): LotNumericRow[] {
  return (region.lots ?? []).map((lot) => ({
    role: lot.role,
    lotId: lot.lotId,
    value: lot.value,
    unit: (lot.unit ?? fallbackUnit).trim(),
  }));
}

export function visionRegionsToRecords(
  frameId: string,
  regions: VisionRegion[],
  idFactory: () => string,
): ScreenRegionRecord[] {
  return regions.map((region) => ({
    id: idFactory(),
    frameId,
    kind: region.kind,
    itemId: region.itemId,
    confidence: region.confidence,
    text: region.text,
    lots: region.lots ?? [],
    note: region.note,
    assignedLotRole: null,
    reviewState: "draft",
    extractor: INTAKE_EXTRACTOR_VISION_API,
    source: INTAKE_SOURCE_SCREEN_CAPTURE,
  }));
}

export function applyRegionRecordsToEntries(
  entries: Readonly<Record<string, SponsorItemEntry>>,
  records: readonly ScreenRegionRecord[],
): {
  entries: Record<string, SponsorItemEntry>;
  unmatched: UnmatchedRegionRef[];
} {
  const next: Record<string, SponsorItemEntry> = { ...entries };
  const unmatched: UnmatchedRegionRef[] = [];
  for (const record of records) {
    if (record.itemId === null || next[record.itemId] === undefined) {
      unmatched.push({ regionId: record.id, frameId: record.frameId });
      continue;
    }
    const existing = next[record.itemId];
    if (existing.reviewState === "confirmed") {
      continue;
    }
    const lots = toLotRows(record, existing.unit);
    next[record.itemId] = {
      ...existing,
      unit: lots[0]?.unit || existing.unit,
      lots: lots.length > 0 ? lots : existing.lots,
      notes: record.note ?? existing.notes,
      reviewState: "draft",
      source: INTAKE_SOURCE_SCREEN_CAPTURE,
    };
  }
  return { entries: next, unmatched };
}
