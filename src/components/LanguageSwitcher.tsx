"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import type { Locale } from "@/types/models";

const LOCALE_OPTIONS: ReadonlyArray<{ value: Locale; label: string }> = [
  { value: "zh", label: "中" },
  { value: "en", label: "EN" },
];

export function LanguageSwitcher() {
  const { locale, setLocale, messages } = useLanguage();

  return (
    <div
      role="group"
      aria-label={messages.common.languageSwitchLabel}
      className="inline-flex items-center rounded-full border border-slate-300 bg-white p-0.5"
    >
      {LOCALE_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLocale(option.value)}
          aria-pressed={locale === option.value}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            locale === option.value
              ? "bg-teal-700 text-white"
              : "text-slate-600 hover:text-teal-700"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
