import { useSyncExternalStore } from "react";
import type { Locale } from "@/types/models";

export interface AssistantPageContext {
  pageUrl: string;
  pageTitle: string;
  locale: Locale;
  categoryKey: string;
  itemId: string;
  itemName: string;
  methodId: string;
  methodName: string;
  analysisStatus: string;
  analysisResult: string;
  analysisProvenance: string;
}

export const EMPTY_ASSISTANT_PAGE_CONTEXT: AssistantPageContext = {
  pageUrl: "",
  pageTitle: "",
  locale: "zh",
  categoryKey: "",
  itemId: "",
  itemName: "",
  methodId: "",
  methodName: "",
  analysisStatus: "",
  analysisResult: "",
  analysisProvenance: "",
};

let currentContext: AssistantPageContext = { ...EMPTY_ASSISTANT_PAGE_CONTEXT };
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function getAssistantPageContext(): AssistantPageContext {
  return currentContext;
}

export function subscribeAssistantPageContext(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function publishAssistantPageContext(
  patch: Partial<AssistantPageContext>,
): void {
  currentContext = { ...currentContext, ...patch };
  emit();
}

export function resetAssistantPageContext(
  keys: Array<keyof AssistantPageContext>,
): void {
  const next = { ...currentContext };
  for (const key of keys) {
    const emptyValue = EMPTY_ASSISTANT_PAGE_CONTEXT[key];
    (next[key] as AssistantPageContext[typeof key]) = emptyValue;
  }
  currentContext = next;
  emit();
}

export function useAssistantPageContext(): AssistantPageContext {
  return useSyncExternalStore(
    subscribeAssistantPageContext,
    getAssistantPageContext,
    getAssistantPageContext,
  );
}
