import { characterizationItems } from "@/data/characterization-items";
import {
  extractScreenIntakeRegions,
  screenIntakeVisionStatus,
} from "@/lib/screen-intake/vision-client";

export const SCREEN_INTAKE_MAX_BYTES = 8 * 1024 * 1024;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47];
const JPEG_MAGIC = [0xff, 0xd8, 0xff];
const WEBP_RIFF = [0x52, 0x49, 0x46, 0x46];
const WEBP_TAG = [0x57, 0x45, 0x42, 0x50];

const hitsBySession = new Map<string, number[]>();

const KNOWN_ITEM_IDS = new Set(characterizationItems.map((item) => item.id));

type ExtractErrorCode =
  | "INVALID_BODY"
  | "UNSUPPORTED_TYPE"
  | "FILE_TOO_LARGE"
  | "RATE_LIMITED"
  | "VISION_UNCONFIGURED"
  | "VISION_UPSTREAM";

function jsonError(code: ExtractErrorCode, status: number): Response {
  return Response.json({ error: { code } }, { status });
}

function allowRequest(sessionKey: string): boolean {
  const now = Date.now();
  const recent = (hitsBySession.get(sessionKey) ?? []).filter(
    (stamp) => now - stamp < RATE_LIMIT_WINDOW_MS,
  );
  if (recent.length >= RATE_LIMIT_MAX) {
    hitsBySession.set(sessionKey, recent);
    return false;
  }
  recent.push(now);
  hitsBySession.set(sessionKey, recent);
  return true;
}

function sniffMime(bytes: Uint8Array): "image/png" | "image/jpeg" | "image/webp" | null {
  if (
    bytes.length >= 4 &&
    PNG_MAGIC.every((value, index) => bytes[index] === value)
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 3 &&
    JPEG_MAGIC.every((value, index) => bytes[index] === value)
  ) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 12 &&
    WEBP_RIFF.every((value, index) => bytes[index] === value) &&
    WEBP_TAG.every((value, index) => bytes[8 + index] === value)
  ) {
    return "image/webp";
  }
  return null;
}

function sessionKey(request: Request, formSession: string): string {
  const header = request.headers.get("x-intake-session")?.trim() ?? "";
  if (header.length > 0) {
    return header.slice(0, 80);
  }
  if (formSession.length > 0) {
    return formSession.slice(0, 80);
  }
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
}

export async function GET(): Promise<Response> {
  return Response.json(screenIntakeVisionStatus());
}

export async function POST(request: Request): Promise<Response> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    return jsonError("INVALID_BODY", 400);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("INVALID_BODY", 400);
  }

  const sessionId = typeof form.get("sessionId") === "string" ? String(form.get("sessionId")) : "";
  const key = sessionKey(request, sessionId);
  if (!allowRequest(key)) {
    return jsonError("RATE_LIMITED", 429);
  }

  const image = form.get("image");
  if (!(image instanceof File)) {
    return jsonError("INVALID_BODY", 400);
  }
  if (image.size > SCREEN_INTAKE_MAX_BYTES) {
    return jsonError("FILE_TOO_LARGE", 413);
  }

  const bytes = new Uint8Array(await image.arrayBuffer());
  const mimeType = sniffMime(bytes);
  if (mimeType === null) {
    return jsonError("UNSUPPORTED_TYPE", 415);
  }

  try {
    const extracted = await extractScreenIntakeRegions({
      bytes,
      mimeType,
      knownItemIds: KNOWN_ITEM_IDS,
    });
    const kinds = extracted.regions.map((region) => region.kind);
    const itemIds = extracted.regions
      .map((region) => region.itemId)
      .filter((itemId): itemId is string => itemId !== null);
    console.info("screen-intake extract", {
      bytes: bytes.byteLength,
      regionCount: extracted.regions.length,
      kinds,
      itemIds,
    });
    return Response.json(extracted);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "VISION_UNCONFIGURED") {
      return jsonError("VISION_UNCONFIGURED", 503);
    }
    return jsonError("VISION_UPSTREAM", 502);
  }
}
