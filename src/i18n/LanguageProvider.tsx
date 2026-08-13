"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Locale, LocalizedText } from "@/types/models";
import { uiMessages, type UiMessages } from "@/i18n/messages";

const LOCALE_STORAGE_KEY = "biosimilar-framework.locale";
const LOCALE_CHANGE_EVENT = "biosimilar-framework:locale-change";
const DEFAULT_LOCALE: Locale = "zh";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** UI-shell messages for the current locale. */
  messages: UiMessages;
  /** Resolve a bilingual data field for the current locale (falls back to zh). */
  localize: (text: LocalizedText) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLocale(value: string | null): value is Locale {
  return value === "zh" || value === "en";
}

function subscribeToLocaleChanges(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(LOCALE_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(LOCALE_CHANGE_EVENT, onStoreChange);
  };
}

function getLocaleSnapshot(): Locale {
  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return isLocale(storedLocale) ? storedLocale : DEFAULT_LOCALE;
}

function getServerLocaleSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeToLocaleChanges,
    getLocaleSnapshot,
    getServerLocaleSnapshot,
  );

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    window.dispatchEvent(new Event(LOCALE_CHANGE_EVENT));
  }, []);

  const localize = useCallback(
    (text: LocalizedText): string => {
      const resolved = locale === "zh" ? text.zh : text.en;
      return resolved || text.zh;
    },
    [locale],
  );

  const contextValue = useMemo<LanguageContextValue>(
    () => ({ locale, setLocale, messages: uiMessages[locale], localize }),
    [locale, setLocale, localize],
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (context === null) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
