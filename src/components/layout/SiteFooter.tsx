"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { regulatoryFramework } from "@/data/regulatory-framework";

export function SiteFooter() {
  const { localize, messages } = useLanguage();

  return (
    <footer className="relative isolate overflow-hidden border-t-4 border-coral-700 bg-navy-900 text-paper">
      <div aria-hidden="true" className="aurora-layer opacity-40" />
      <div className="relative z-[1] mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm sm:px-6 md:pl-[var(--drawer-rail-width)]">
        <p className="text-cyan-100">
          {messages.regulatoryPage.sourceLabel}:{" "}
          {localize(regulatoryFramework.sourceTitle)}
        </p>
        <p className="text-cyan-100">{messages.common.englishTodoNotice}</p>
      </div>
    </footer>
  );
}
