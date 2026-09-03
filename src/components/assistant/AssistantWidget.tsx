"use client";

import { useCallback, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { ASSISTANT_QUERY_MAX_CHARS, visibleAssistantAnswer } from "@/lib/assistant/chat-request";
import { useAssistantPageContext } from "@/lib/assistant/page-context";
import {
  AssistantPanel,
  type AssistantChatMessage,
} from "@/components/assistant/AssistantPanel";
import { AssistantMascot } from "@/components/assistant/AssistantMascot";

const USER_STORAGE_KEY = "biosimilar-assistant.user";
const CONVERSATION_STORAGE_KEY = "biosimilar-assistant.conversationId";
const USER_COOKIE = "biosimilar-assistant-user";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readOrCreateUserId(): string {
  const stored = window.localStorage.getItem(USER_STORAGE_KEY);
  const userId = stored && UUID_PATTERN.test(stored) ? stored : window.crypto.randomUUID();
  window.localStorage.setItem(USER_STORAGE_KEY, userId);
  document.cookie = `${USER_COOKIE}=${encodeURIComponent(userId)}; Path=/; SameSite=Lax; Max-Age=31536000`;
  return userId;
}

function errorText(
  copy: ReturnType<typeof useLanguage>["messages"]["assistant"],
  code: string | undefined,
): string {
  if (code === "TIMEOUT") return copy.timeout;
  if (code === "DIFY_UNCONFIGURED") return copy.unconfigured;
  if (code === "DIFY_UNAVAILABLE" || code === "UPSTREAM_ERROR") return copy.unavailable;
  return copy.networkError;
}

function parseSseChunk(
  payload: string,
  onDelta: (
    text: string,
    conversationId: string,
    sources: string[],
    pausedForReview?: boolean,
  ) => void,
): void {
  let conversationId = "";
  let sources: string[] = [];
  for (const block of payload.split("\n\n")) {
    const dataLine = block
      .split("\n")
      .find((line) => line.startsWith("data:"));
    if (!dataLine) continue;
    const raw = dataLine.slice(5).trim();
    if (!raw || raw === "[DONE]") continue;
    try {
      const event = JSON.parse(raw) as {
        event?: string;
        answer?: string;
        conversation_id?: string;
        metadata?: { retriever_resources?: Array<{ document_name?: string }> };
      };
      if (typeof event.conversation_id === "string") {
        conversationId = event.conversation_id;
      }
      if (event.event === "error") {
        onDelta("", conversationId, sources);
        continue;
      }
      if (
        event.event === "human_input_required" ||
        event.event === "workflow_paused" ||
        event.event === "human_input_form_filled" ||
        event.event === "human_input_form_timeout"
      ) {
        onDelta("", conversationId, sources, true);
        continue;
      }
      if (typeof event.answer === "string" && event.answer.length > 0) {
        onDelta(event.answer, conversationId, sources);
      }
      if (Array.isArray(event.metadata?.retriever_resources)) {
        sources = event.metadata.retriever_resources
          .map((resource) => resource.document_name)
          .filter((name): name is string => typeof name === "string" && name.length > 0);
        if (sources.length > 0) {
          onDelta("", conversationId, sources);
        }
      }
    } catch {
      // Ignore malformed SSE lines.
    }
  }
}

export function AssistantWidget() {
  const { locale, messages } = useLanguage();
  const pageContext = useAssistantPageContext();
  const copy = messages.assistant;
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState("");
  const [chatMessages, setChatMessages] = useState<AssistantChatMessage[]>([]);

  const persistConversation = useCallback((nextId: string) => {
    setConversationId(nextId);
    if (nextId) {
      window.sessionStorage.setItem(CONVERSATION_STORAGE_KEY, nextId);
    } else {
      window.sessionStorage.removeItem(CONVERSATION_STORAGE_KEY);
    }
  }, []);

  const startNewConversation = useCallback(() => {
    persistConversation("");
    setChatMessages([]);
    setErrorMessage(null);
    setDraft("");
  }, [persistConversation]);

  const send = useCallback(async (textOverride?: string) => {
    const query = (textOverride ?? draft).trim();
    if (sending) return;
    if (query.length > ASSISTANT_QUERY_MAX_CHARS) {
      setErrorMessage(copy.networkError);
      return;
    }
    setSending(true);
    setErrorMessage(null);
    setDraft("");
    const userMessage: AssistantChatMessage = {
      id: window.crypto.randomUUID(),
      role: "user",
      text: query,
      sources: [],
    };
    const assistantMessage: AssistantChatMessage = {
      id: window.crypto.randomUUID(),
      role: "assistant",
      text: "",
      sources: [],
    };
    setChatMessages((current) => [...current, userMessage, assistantMessage]);

    try {
      const user = readOrCreateUserId();
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          conversationId:
            conversationId ||
            window.sessionStorage.getItem(CONVERSATION_STORAGE_KEY) ||
            "",
          user,
          inputs: {
            ...pageContext,
            locale,
            pageUrl: window.location.href,
            pageTitle: document.title,
          },
        }),
      });
      if (!response.ok) {
        let code: string | undefined;
        try {
          const body = (await response.json()) as { error?: { code?: string } };
          code = body.error?.code;
        } catch {
          code = undefined;
        }
        setErrorMessage(errorText(copy, code));
        setChatMessages((current) => current.filter((item) => item.id !== assistantMessage.id));
        return;
      }
      const reader = response.body?.getReader();
      if (!reader) {
        setErrorMessage(copy.networkError);
        return;
      }
      const decoder = new TextDecoder();
      let buffer = "";
      let assembled = "";
      let pausedForReview = false;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const splitAt = buffer.lastIndexOf("\n\n");
        if (splitAt === -1) continue;
        const complete = buffer.slice(0, splitAt);
        buffer = buffer.slice(splitAt + 2);
        parseSseChunk(complete, (delta, nextConversationId, sources, paused) => {
          if (paused) pausedForReview = true;
          if (nextConversationId) persistConversation(nextConversationId);
          if (delta) assembled += delta;
          setChatMessages((current) =>
            current.map((item) =>
              item.id === assistantMessage.id
                ? {
                    ...item,
                    text: visibleAssistantAnswer(assembled),
                    sources: sources.length > 0 ? sources : item.sources,
                  }
                : item,
            ),
          );
        });
      }
      if (buffer.trim().length > 0) {
        parseSseChunk(buffer, (delta, nextConversationId, sources, paused) => {
          if (paused) pausedForReview = true;
          if (nextConversationId) persistConversation(nextConversationId);
          if (delta) assembled += delta;
          setChatMessages((current) =>
            current.map((item) =>
              item.id === assistantMessage.id
                ? {
                    ...item,
                    text: visibleAssistantAnswer(assembled),
                    sources: sources.length > 0 ? sources : item.sources,
                  }
                : item,
            ),
          );
        });
      }
      if (assembled.length === 0 && !pausedForReview) {
        setErrorMessage(copy.unavailable);
        setChatMessages((current) => current.filter((item) => item.id !== assistantMessage.id));
      }
    } catch {
      setErrorMessage(copy.networkError);
      setChatMessages((current) => current.filter((item) => item.id !== assistantMessage.id));
    } finally {
      setSending(false);
    }
  }, [conversationId, copy, draft, locale, pageContext, persistConversation, sending]);

  return (
    // z-90 keeps the mascot above drawers (60), the left rail (65) and the skip link (80).
    <div className="fixed right-4 bottom-4 z-[90]">
      <div className="pointer-events-none absolute right-0 bottom-[calc(100%+0.5rem)]">
        <AssistantPanel
          copy={copy}
          open={open}
          sending={sending}
          errorMessage={errorMessage}
          messages={chatMessages}
          draft={draft}
          onDraftChange={setDraft}
          onSend={() => void send()}
          onClose={() => setOpen(false)}
          onNewConversation={startNewConversation}
          onSuggestionSelect={(query) => void send(query)}
        />
      </div>
      <button
        type="button"
        className={`relative z-10 assistant-mascot-hit tap-target ${
          sending ? "assistant-mascot-think" : open ? "assistant-mascot-open" : "assistant-mascot-idle"
        }`}
        aria-expanded={open}
        aria-controls="assistant-panel"
        aria-label={open ? copy.closeButton : copy.openButton}
        onClick={() => setOpen((current) => !current)}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-2 bottom-1 h-16 rounded-full bg-cyan-700/25 blur-2xl"
        />
        <AssistantMascot
          mood={sending ? "think" : open ? "open" : "idle"}
          greeting={copy.mascotGreeting}
        />
        {open ? (
          <span className="assistant-mascot-close-badge" aria-hidden="true">
            ×
          </span>
        ) : null}
      </button>
    </div>
  );
}
