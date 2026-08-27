import {
  parseAssistantChatRequest,
  type AssistantChatErrorCode,
} from "@/lib/assistant/chat-request";
import { DifyClientError, isDifyConfigured, sendDifyChatMessage } from "@/lib/assistant/dify-client";

export const ASSISTANT_USER_COOKIE = "biosimilar-assistant-user";
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const MAX_BODY_BYTES = 32_000;

const hitsByUser = new Map<string, number[]>();

const STATUS_BY_CODE: Record<AssistantChatErrorCode, number> = {
  INVALID_BODY: 400,
  QUERY_TOO_LONG: 400,
  INVALID_USER: 400,
  FORBIDDEN_FIELD: 400,
  RATE_LIMITED: 429,
  DIFY_UNAVAILABLE: 502,
  DIFY_UNCONFIGURED: 503,
  TIMEOUT: 504,
  UPSTREAM_ERROR: 502,
};

function jsonError(code: AssistantChatErrorCode): Response {
  return Response.json({ error: { code } }, { status: STATUS_BY_CODE[code] });
}

function allowRequest(user: string): boolean {
  const now = Date.now();
  const recent = (hitsByUser.get(user) ?? []).filter((stamp) => now - stamp < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    hitsByUser.set(user, recent);
    return false;
  }
  recent.push(now);
  hitsByUser.set(user, recent);
  return true;
}

function cookieUser(request: Request): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`(?:^|; )${ASSISTANT_USER_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function POST(request: Request): Promise<Response> {
  if (!isDifyConfigured()) {
    return jsonError("DIFY_UNCONFIGURED");
  }

  const rawLength = Number(request.headers.get("content-length") ?? "0");
  if (rawLength > MAX_BODY_BYTES) {
    return jsonError("INVALID_BODY");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("INVALID_BODY");
  }

  const cookieId = cookieUser(request);
  if (cookieId && typeof body === "object" && body !== null && !("user" in body)) {
    (body as Record<string, unknown>).user = cookieId;
  }

  const parsed = parseAssistantChatRequest(body);
  if (!parsed.ok) {
    return jsonError(parsed.code);
  }
  if (!allowRequest(parsed.value.user)) {
    return jsonError("RATE_LIMITED");
  }

  try {
    const upstream = await sendDifyChatMessage(parsed.value);
    if (!upstream.ok) {
      return jsonError(upstream.status >= 500 ? "DIFY_UNAVAILABLE" : "UPSTREAM_ERROR");
    }
    const headers = new Headers({
      "Content-Type": upstream.headers.get("Content-Type") ?? "text/event-stream",
      "Cache-Control": "no-cache",
    });
    return new Response(upstream.body, { status: 200, headers });
  } catch (error) {
    if (error instanceof DifyClientError) {
      return jsonError(error.code);
    }
    return jsonError("DIFY_UNAVAILABLE");
  }
}
