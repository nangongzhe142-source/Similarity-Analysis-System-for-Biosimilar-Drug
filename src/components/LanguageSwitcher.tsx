"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import type { Locale } from "@/types/models";

const LOCALE_OPTIONS: ReadonlyArray<{ value: Locale; label: string }> = [
  { value: "zh", label: "中" },
  { value: "en", label: "EN" },
];

interface LanguageSwitcherProps {
  variant?: "light" | "dark";
}

export function LanguageSwitcher({ variant = "light" }: LanguageSwitcherProps) {
  const { locale, setLocale, messages } = useLanguage();
  const isDark = variant === "dark";

  return (
    <div
      role="group"
      aria-label={messages.common.languageSwitchLabel}
      className={
        isDark
          ? "inline-flex items-center rounded-sm border border-white/30 bg-navy-950/40 p-0.5"
          : "inline-flex items-center rounded-sm border border-line bg-paper p-0.5"
      }
    >
      {LOCALE_OPTIONS.map((option) => {
        const isPressed = locale === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setLocale(option.value)}
            aria-pressed={isPressed}
            className={`tap-target rounded-sm px-3 text-sm font-semibold transition-colors duration-150 ${
              isPressed
                ? isDark
                  ? "bg-paper text-navy-900"
                  : "bg-brand-700 text-paper"
                : isDark
                  ? "text-cyan-100 hover:bg-white/10"
                  : "text-ink-secondary hover:text-brand-800"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
