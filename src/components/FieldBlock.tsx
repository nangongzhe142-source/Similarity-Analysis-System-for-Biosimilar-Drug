"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import type { LocalizedText } from "@/types/models";

interface FieldBlockProps {
  label: string;
  value: LocalizedText;
  /** Highlight variant for decision-critical fields. */
  emphasized?: boolean;
}

export function FieldBlock({ label, value, emphasized = false }: FieldBlockProps) {
  const { localize, messages } = useLanguage();
  const text = localize(value);
  const displayText =
    text === "" || text === "-" ? messages.itemPage.emptyFieldPlaceholder : text;

  return (
    <section
      className={
        emphasized
          ? "surface-card border-l-4 border-l-coral-700 p-4"
          : "surface-card p-4"
      }
    >
      <h4
        className={`mb-1.5 text-xs font-semibold uppercase tracking-wide ${
          emphasized ? "text-brand-800" : "text-ink-secondary"
        }`}
      >
        {label}
      </h4>
      <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{displayText}</p>
    </section>
  );
}
