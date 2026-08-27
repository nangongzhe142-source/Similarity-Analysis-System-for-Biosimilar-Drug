import type { AssistantPageContext } from "@/lib/assistant/page-context";
import { whitelistAnalysisResult } from "@/lib/assistant/analysis-result-whitelist";

export const ASSISTANT_QUERY_MAX_CHARS = 4_000;
export const ASSISTANT_SHORT_INPUT_MAX_CHARS = 500;
export const ASSISTANT_PARAGRAPH_INPUT_MAX_CHARS = 12_000;
export const ASSISTANT_USER_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const FORBIDDEN_CLIENT_KEYS = [
  "difyUrl",
  "dify_url",
  "baseUrl",
  "base_url",
  "apiUrl",
  "api_url",
  "upstream",
  "endpoint",
  "apiKey",
  "api_key",
  "authorization",
] as const;

const INPUT_KEYS: Array<keyof AssistantPageContext> = [
  "pageUrl",
  "pageTitle",
  "locale",
  "categoryKey",
  "itemId",
  "itemName",
  "methodId",
  "methodName",
  "analysisStatus",
  "analysisResult",
  "analysisProvenance",
];

export type AssistantChatErrorCode =
  | "INVALID_BODY"
  | "QUERY_TOO_LONG"
  | "INVALID_USER"
  | "FORBIDDEN_FIELD"
  | "RATE_LIMITED"
  | "DIFY_UNAVAILABLE"
  | "DIFY_UNCONFIGURED"
  | "TIMEOUT"
  | "UPSTREAM_ERROR";

export interface AssistantChatRequest {
  query: string;
  conversationId: string;
  user: string;
  inputs: Record<keyof AssistantPageContext, string>;
}

export interface AssistantGuardFlags {
  overrideAttempt: boolean;
  productDetermination: boolean;
  imagePeakGuess: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clip(value: string, max: number): string {
  return value.length <= max ? value : value.slice(0, max);
}

export function detectAssistantGuards(query: string): AssistantGuardFlags {
  const normalized = query.toLowerCase();
  return {
    overrideAttempt:
      /忽略(之前|以上|系统)?规则/.test(query) ||
      /ignore (all )?(previous|prior|system) (instructions|rules)/i.test(query) ||
      /system prompt|api key|内部地址|服务配置/.test(normalized),
    productDetermination:
      /是不是生物类似药|是否为生物类似药|是生物类似药还是|直接判定/.test(query) ||
      /is (this|the product) (a )?biosimilar/.test(normalized) ||
      /declare (it )?biosimilar/.test(normalized),
    imagePeakGuess:
      /根据(这|该)?张?(图|图片|截图|png|jpeg|jpg).*?(峰|分子量|覆盖率)/i.test(query) ||
      /guess (the )?peaks?/.test(normalized) ||
      /from (the )?(image|png|jpeg|screenshot).*(peak|mass|coverage)/.test(normalized),
  };
}

export function parseAssistantChatRequest(
  body: unknown,
): { ok: true; value: AssistantChatRequest } | { ok: false; code: AssistantChatErrorCode } {
  if (!isRecord(body)) {
    return { ok: false, code: "INVALID_BODY" };
  }
  for (const key of FORBIDDEN_CLIENT_KEYS) {
    if (key in body) {
      return { ok: false, code: "FORBIDDEN_FIELD" };
    }
  }
  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (query.length === 0) {
    return { ok: false, code: "INVALID_BODY" };
  }
  if (query.length > ASSISTANT_QUERY_MAX_CHARS) {
    return { ok: false, code: "QUERY_TOO_LONG" };
  }
  const user = typeof body.user === "string" ? body.user.trim() : "";
  if (!ASSISTANT_USER_UUID_PATTERN.test(user)) {
    return { ok: false, code: "INVALID_USER" };
  }
  const conversationId =
    typeof body.conversationId === "string" ? body.conversationId.trim() : "";
  const rawInputs = isRecord(body.inputs) ? body.inputs : {};
  for (const key of Object.keys(rawInputs)) {
    if ((FORBIDDEN_CLIENT_KEYS as readonly string[]).includes(key)) {
      return { ok: false, code: "FORBIDDEN_FIELD" };
    }
  }

  const inputs = {} as Record<keyof AssistantPageContext, string>;
  for (const key of INPUT_KEYS) {
    const raw = rawInputs[key];
    const text = typeof raw === "string" ? raw : "";
    const max =
      key === "analysisResult" || key === "analysisProvenance"
        ? ASSISTANT_PARAGRAPH_INPUT_MAX_CHARS
        : ASSISTANT_SHORT_INPUT_MAX_CHARS;
    inputs[key] = clip(text, max);
  }

  if (inputs.analysisResult.length > 0) {
    try {
      const parsed: unknown = JSON.parse(inputs.analysisResult);
      const whitelisted = whitelistAnalysisResult(parsed);
      inputs.analysisResult = whitelisted === null ? "" : JSON.stringify(whitelisted);
    } catch {
      inputs.analysisResult = "";
    }
  }

  if (inputs.locale !== "zh" && inputs.locale !== "en") {
    inputs.locale = "zh";
  }

  return {
    ok: true,
    value: {
      query,
      conversationId,
      user,
      inputs,
    },
  };
}

export function visibleAssistantAnswer(raw: string): string {
  if (raw.length === 0) return "";
  const withoutClosed = raw.replace(/<think\b[^>]*>[\s\S]*?<\/think>/gi, "");
  const openIndex = withoutClosed.search(/<think\b/i);
  const visible = openIndex >= 0 ? withoutClosed.slice(0, openIndex) : withoutClosed;
  return visible.replace(/^\s+/, "");
}
