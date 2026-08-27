"use client";

import { useLanguage } from "@/i18n/LanguageProvider";

export function SupplementaryTag() {
  const { messages } = useLanguage();

  return (
    <span className="inline-flex items-center gap-1 rounded-sm border border-navy-800 bg-canvas-muted px-2 py-0.5 text-xs font-semibold text-navy-900">
      <span aria-hidden="true" className="inline-block h-2 w-2 rotate-45 bg-navy-800" />
      {messages.common.supplementaryTag}
    </span>
  );
}
