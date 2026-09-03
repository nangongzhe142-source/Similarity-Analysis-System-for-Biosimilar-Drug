"use client";

import { useEffect, useRef } from "react";
import type { UiMessages } from "@/i18n/messages";
import { AssistantMascotFace } from "@/components/assistant/AssistantMascot";

export interface AssistantChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources: string[];
}

interface AssistantPanelProps {
  copy: UiMessages["assistant"];
  open: boolean;
  sending: boolean;
  errorMessage: string | null;
  messages: AssistantChatMessage[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onClose: () => void;
  onNewConversation: () => void;
  onSuggestionSelect: (query: string) => void;
}

export function AssistantPanel({
  copy,
  open,
  sending,
  errorMessage,
  messages,
  draft,
  onDraftChange,
  onSend,
  onClose,
  onNewConversation,
  onSuggestionSelect,
}: AssistantPanelProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const suggestions = [copy.suggestionMethod, copy.suggestionResult, copy.suggestionInput];

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, sending]);

  return (
    <section
      id="assistant-panel"
      aria-label={copy.title}
      aria-hidden={!open}
      hidden={!open}
      inert={open ? undefined : true}
      className={`assistant-panel glass-edge relative ${open ? "assistant-panel-open" : "assistant-panel-closed"}`}
    >
      <header className="assistant-head flex items-center gap-3 px-3 py-3">
        <span aria-hidden="true" className="aurora-layer opacity-50" />
        <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-cyan-100/30 bg-navy-950/40 shadow-[0_0_18px_rgb(14_116_144_/_0.45)]">
          <AssistantMascotFace size="md" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold tracking-tight">{copy.title}</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-cyan-100">
            <span className="assistant-pulse" />
            {copy.statusLive}
          </p>
        </div>
        <button
          type="button"
          className="tap-target rounded-full px-3 text-xs font-semibold text-cyan-100 hover:bg-paper/10"
          onClick={onNewConversation}
        >
          {copy.newConversation}
        </button>
        <button
          type="button"
          className="tap-target grid size-9 place-items-center rounded-full text-lg leading-none text-paper hover:bg-paper/10"
          aria-label={copy.closeButton}
          onClick={onClose}
        >
          ×
        </button>
      </header>

      <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col justify-center gap-4 py-4">
            <div className="mx-auto">
              <AssistantMascotFace size="lg" />
            </div>
            <p className="text-center text-sm leading-relaxed text-ink-secondary">{copy.emptyHint}</p>
            <div className="flex flex-col gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={sending}
                  onClick={() => onSuggestionSelect(suggestion)}
                  className="rounded-full border border-line bg-paper px-3 py-2 text-left text-xs font-semibold text-navy-900 shadow-card transition-colors hover:border-cyan-700 hover:text-cyan-800 disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {messages.map((message) => {
          const showTyping = message.role === "assistant" && message.text.length === 0 && sending;
          return (
            <article
              key={message.id}
              className={
                message.role === "user"
                  ? "ml-8 rounded-2xl rounded-br-md bg-gradient-to-br from-brand-700 to-cyan-800 px-3 py-2 text-sm text-paper shadow-card"
                  : "mr-4 flex gap-2"
              }
            >
              {message.role === "assistant" ? (
                <span className="mt-1 grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-navy-900">
                  <AssistantMascotFace size="sm" />
                </span>
              ) : null}
              {message.role === "assistant" ? (
                <div className="min-w-0 flex-1 rounded-2xl rounded-bl-md border border-line bg-paper px-3 py-2 text-sm text-ink shadow-card">
                  {showTyping ? (
                    <div className="flex items-center gap-2 text-ink-secondary" aria-live="polite">
                      <span className="assistant-typing-dot" />
                      <span className="assistant-typing-dot" />
                      <span className="assistant-typing-dot" />
                      <span className="text-xs">{copy.loading}</span>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{message.text}</p>
                  )}
                  {message.sources.length > 0 ? (
                    <ul className="mt-2 space-y-0.5 border-t border-line pt-2 text-[11px] text-ink-secondary">
                      <li className="font-semibold text-cyan-800">{copy.sourcesTitle}</li>
                      {message.sources.map((source) => (
                        <li key={source} className="truncate">
                          {source}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : (
                <p className="whitespace-pre-wrap break-words">{message.text}</p>
              )}
            </article>
          );
        })}
        {errorMessage ? (
          <p className="rounded-md border border-signal-red/30 bg-paper px-3 py-2 text-xs font-semibold text-signal-red">
            {errorMessage}
          </p>
        ) : null}
      </div>

      <form
        className="border-t border-line bg-paper/90 p-2 backdrop-blur-sm"
        onSubmit={(event) => {
          event.preventDefault();
          onSend();
        }}
      >
        <label className="sr-only" htmlFor="assistant-draft">
          {copy.placeholder}
        </label>
        <div className="flex items-end gap-2 rounded-2xl border border-line bg-canvas px-2 py-1.5 shadow-[inset_0_1px_2px_rgb(11_26_46_/_0.06)] focus-within:border-cyan-700">
          <textarea
            id="assistant-draft"
            ref={inputRef}
            rows={2}
            value={draft}
            disabled={sending}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
            placeholder={copy.placeholder}
            className="min-h-11 flex-1 resize-none bg-transparent px-1 py-1.5 text-sm text-ink outline-none"
          />
          <button
            type="submit"
            disabled={sending}
            aria-label={sending ? copy.sending : copy.send}
            className="tap-target grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-600 to-cyan-700 text-paper shadow-raised disabled:opacity-40"
          >
            {sending ? (
              <span className="text-lg leading-none">…</span>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 12h14M13 6l7 6-7 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
