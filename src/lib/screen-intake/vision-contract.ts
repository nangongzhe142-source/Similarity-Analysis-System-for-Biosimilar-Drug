import type {
  ScreenRegionKind,
  VisionExtractResponse,
  VisionLotDraft,
  VisionRegion,
} from "@/types/intake";

const REGION_KINDS: ReadonlySet<ScreenRegionKind> = new Set([
  "table",
  "spectrum",
  "other",
]);

const LOT_ROLES = new Set(["reference", "candidate"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function sanitizeLot(value: unknown): VisionLotDraft | null {
  if (!isRecord(value)) {
    return null;
  }
  const role = value.role;
  if (role !== "reference" && role !== "candidate") {
    return null;
  }
  if (!LOT_ROLES.has(role)) {
    return null;
  }
  const lotId = typeof value.lotId === "string" ? value.lotId.trim() : "";
  const parsedValue = asFiniteNumber(value.value);
  if (lotId.length === 0 || parsedValue === null) {
    return null;
  }
  const unit = typeof value.unit === "string" ? value.unit.trim() : undefined;
  return {
    role,
    lotId,
    value: parsedValue,
    ...(unit && unit.length > 0 ? { unit } : {}),
  };
}

function sanitizeKind(value: unknown): ScreenRegionKind {
  if (typeof value === "string" && REGION_KINDS.has(value as ScreenRegionKind)) {
    return value as ScreenRegionKind;
  }
  return "other";
}

function sanitizeItemId(
  value: unknown,
  knownItemIds: ReadonlySet<string>,
): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const itemId = value.trim();
  if (itemId.length === 0 || !knownItemIds.has(itemId)) {
    return null;
  }
  return itemId;
}

function sanitizeRegion(
  value: unknown,
  knownItemIds: ReadonlySet<string>,
): VisionRegion {
  const record = isRecord(value) ? value : {};
  const confidenceRaw = asFiniteNumber(record.confidence);
  const lotsRaw = Array.isArray(record.lots) ? record.lots : [];
  const lots = lotsRaw
    .map((entry) => sanitizeLot(entry))
    .filter((entry): entry is VisionLotDraft => entry !== null);
  const text = typeof record.text === "string" ? record.text : undefined;
  const note = typeof record.note === "string" ? record.note : undefined;
  return {
    kind: sanitizeKind(record.kind),
    itemId: sanitizeItemId(record.itemId, knownItemIds),
    confidence:
      confidenceRaw === null ? 0 : Math.max(0, Math.min(1, confidenceRaw)),
    ...(text !== undefined ? { text } : {}),
    ...(lots.length > 0 ? { lots } : {}),
    ...(note !== undefined ? { note } : {}),
  };
}

/** Drop unknown item ids. AI must not invent characterization items. */
export function sanitizeVisionExtractResponse(
  raw: unknown,
  knownItemIds: ReadonlySet<string>,
): VisionExtractResponse {
  const regionsRaw = isRecord(raw) && Array.isArray(raw.regions) ? raw.regions : [];
  return {
    regions: regionsRaw.map((region) => sanitizeRegion(region, knownItemIds)),
  };
}

export function parseVisionJsonText(
  text: string,
  knownItemIds: ReadonlySet<string>,
): VisionExtractResponse {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  const payload = fenced ? fenced[1].trim() : trimmed;
  let parsed: unknown;
  try {
    parsed = JSON.parse(payload) as unknown;
  } catch {
    return { regions: [] };
  }
  return sanitizeVisionExtractResponse(parsed, knownItemIds);
}

export const VISION_EXTRACT_JSON_INSTRUCTION = [
  "Return JSON only, matching:",
  '{ "regions": [ { "kind": "table"|"spectrum"|"other", "itemId": string|null, "confidence": number, "text"?: string, "lots"?: [ { "role": "reference"|"candidate", "lotId": string, "value": number, "unit"?: string } ], "note"?: string } ] }',
  "itemId must be an existing characterization item id or null. Do not invent ids.",
  "Do not judge similarity. Do not treat a screenshot as instrument raw data.",
].join(" ");
