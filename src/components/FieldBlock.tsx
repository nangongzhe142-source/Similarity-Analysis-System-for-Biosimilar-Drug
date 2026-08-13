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
      className={`rounded-lg border p-4 ${
        emphasized ? "border-teal-200 bg-teal-50/50" : "border-slate-200 bg-white"
      }`}
    >
      <h4
        className={`mb-1.5 text-xs font-semibold uppercase tracking-wide ${
          emphasized ? "text-teal-800" : "text-slate-500"
        }`}
      >
        {label}
      </h4>
      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800">
        {displayText}
      </p>
    </section>
  );
}
