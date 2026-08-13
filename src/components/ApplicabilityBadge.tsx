"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import type { LocalizedText } from "@/types/models";

interface ApplicabilityBadgeProps {
  applicability: LocalizedText;
  /** Compact mode truncates long applicability text to one line (for cards). */
  compact?: boolean;
}

export function ApplicabilityBadge({ applicability, compact = false }: ApplicabilityBadgeProps) {
  const { localize } = useLanguage();
  const text = localize(applicability);

  return (
    <span
      title={text}
      className={`inline-flex max-w-full items-center rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-800 ${
        compact ? "truncate" : ""
      }`}
    >
      <span className={compact ? "truncate" : ""}>{text}</span>
    </span>
  );
}
