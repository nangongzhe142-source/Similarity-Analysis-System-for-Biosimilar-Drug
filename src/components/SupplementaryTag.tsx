"use client";

import { useLanguage } from "@/i18n/LanguageProvider";

export function SupplementaryTag() {
  const { messages } = useLanguage();

  return (
    <span className="inline-flex items-center rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
      {messages.common.supplementaryTag}
    </span>
  );
}
