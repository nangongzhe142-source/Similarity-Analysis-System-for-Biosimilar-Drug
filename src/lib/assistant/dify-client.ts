import type { AssistantChatRequest } from "@/lib/assistant/chat-request";

export const DEFAULT_DIFY_API_BASE_URL = "http://127.0.0.1/v1";
export const DEFAULT_DIFY_TIMEOUT_MS = 60_000;

export class DifyClientError extends Error {
  constructor(
    readonly code:
      | "DIFY_UNCONFIGURED"
      | "DIFY_UNAVAILABLE"
      | "TIMEOUT"
      | "UPSTREAM_ERROR",
    readonly status = 502,
  ) {
    super(code);
    this.name = "DifyClientError";
  }
}

function readEnv(name: string): string {
  const raw = process.env[name];
  return typeof raw === "string" ? raw.trim() : "";
}

function readTimeoutMs(): number {
  const raw = readEnv("DIFY_TIMEOUT_MS");
  if (!raw) return DEFAULT_DIFY_TIMEOUT_MS;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_DIFY_TIMEOUT_MS;
}

export function difyApiBaseUrl(): string {
  const raw = readEnv("DIFY_API_BASE_URL");
  const base = raw.length > 0 ? raw : DEFAULT_DIFY_API_BASE_URL;
  return base.replace(/\/$/, "");
}

export function isDifyConfigured(): boolean {
  return readEnv("DIFY_APP_API_KEY").length > 0;
}

export async function checkDifyReachable(): Promise<boolean> {
  try {
    const response = await fetch(`${difyApiBaseUrl()}/info`, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    return response.status !== 404;
  } catch {
    return false;
  }
}

export function createDifyChatRequest(request: AssistantChatRequest): RequestInit {
  const apiKey = readEnv("DIFY_APP_API_KEY");
  if (!apiKey) {
    throw new DifyClientError("DIFY_UNCONFIGURED", 503);
  }
  return {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: request.inputs,
      query: request.query,
      response_mode: "streaming",
      conversation_id: request.conversationId,
      user: request.user,
    }),
    signal: AbortSignal.timeout(readTimeoutMs()),
  };
}

export async function sendDifyChatMessage(
  request: AssistantChatRequest,
): Promise<Response> {
  const init = createDifyChatRequest(request);
  try {
    const response = await fetch(`${difyApiBaseUrl()}/chat-messages`, init);
    if (!response.ok && response.status >= 500) {
      throw new DifyClientError("DIFY_UNAVAILABLE", 502);
    }
    return response;
  } catch (error) {
    if (error instanceof DifyClientError) throw error;
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new DifyClientError("TIMEOUT", 504);
    }
    throw new DifyClientError("DIFY_UNAVAILABLE", 502);
  }
}
