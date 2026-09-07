import {
  parseVisionJsonText,
  VISION_EXTRACT_JSON_INSTRUCTION,
} from "@/lib/screen-intake/vision-contract";
import type { VisionExtractResponse } from "@/types/intake";

export const SCREEN_INTAKE_VISION_URL_ENV = "SCREEN_INTAKE_VISION_URL";
export const SCREEN_INTAKE_VISION_KEY_ENV = "SCREEN_INTAKE_VISION_KEY";
export const SCREEN_INTAKE_VISION_MODEL_ENV = "SCREEN_INTAKE_VISION_MODEL";
export const SCREEN_INTAKE_VISION_MOCK_ENV = "SCREEN_INTAKE_VISION_MOCK";

export const MOCK_VISION_EXTRACT_RESPONSE: VisionExtractResponse = {
  regions: [
    {
      kind: "table",
      itemId: "intact-mass",
      confidence: 0.91,
      lots: [
        { role: "reference", lotId: "R1", value: 148212.4, unit: "Da" },
        { role: "candidate", lotId: "C1", value: 148215.1, unit: "Da" },
      ],
      note: "mock table draft",
    },
    {
      kind: "other",
      itemId: "not-a-real-characterization-item",
      confidence: 0.4,
      text: "unmatched mock region",
    },
  ],
};

function readEnv(name: string): string {
  const raw = process.env[name];
  return typeof raw === "string" ? raw.trim() : "";
}

export function isScreenIntakeVisionMockEnabled(): boolean {
  if (readEnv(SCREEN_INTAKE_VISION_MOCK_ENV) === "1") {
    return true;
  }
  return process.env.NODE_ENV === "test";
}

export function isScreenIntakeVisionConfigured(): boolean {
  return (
    readEnv(SCREEN_INTAKE_VISION_URL_ENV).length > 0 &&
    readEnv(SCREEN_INTAKE_VISION_KEY_ENV).length > 0
  );
}

export function screenIntakeVisionStatus(): {
  configured: boolean;
  mockEnabled: boolean;
} {
  return {
    configured: isScreenIntakeVisionConfigured(),
    mockEnabled: isScreenIntakeVisionMockEnabled(),
  };
}

function dataUrlFromBytes(bytes: Uint8Array, mimeType: string): string {
  const binary = Buffer.from(bytes).toString("base64");
  return `data:${mimeType};base64,${binary}`;
}

async function callCompatibleVisionApi(args: {
  bytes: Uint8Array;
  mimeType: string;
  knownItemIds: ReadonlySet<string>;
}): Promise<VisionExtractResponse> {
  const url = readEnv(SCREEN_INTAKE_VISION_URL_ENV);
  const apiKey = readEnv(SCREEN_INTAKE_VISION_KEY_ENV);
  const model = readEnv(SCREEN_INTAKE_VISION_MODEL_ENV) || "gpt-4o-mini";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: VISION_EXTRACT_JSON_INSTRUCTION },
            {
              type: "image_url",
              image_url: {
                url: dataUrlFromBytes(args.bytes, args.mimeType),
              },
            },
          ],
        },
      ],
    }),
    signal: AbortSignal.timeout(60_000),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`VISION_UPSTREAM_${response.status}`);
  }
  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: unknown } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  const text = typeof content === "string" ? content : JSON.stringify(content ?? {});
  return parseVisionJsonText(text, args.knownItemIds);
}

export async function extractScreenIntakeRegions(args: {
  bytes: Uint8Array;
  mimeType: string;
  knownItemIds: ReadonlySet<string>;
}): Promise<VisionExtractResponse> {
  if (isScreenIntakeVisionMockEnabled()) {
    return parseVisionJsonText(
      JSON.stringify(MOCK_VISION_EXTRACT_RESPONSE),
      args.knownItemIds,
    );
  }
  if (!isScreenIntakeVisionConfigured()) {
    throw new Error("VISION_UNCONFIGURED");
  }
  return callCompatibleVisionApi(args);
}
