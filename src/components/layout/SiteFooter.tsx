"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { regulatoryFramework } from "@/data/regulatory-framework";

export function SiteFooter() {
  const { localize, messages } = useLanguage();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-6 text-xs text-slate-400 sm:px-6">
        <p>
          {messages.regulatoryPage.sourceLabel}:{" "}
          {localize(regulatoryFramework.sourceTitle)}
        </p>
        <p>{messages.common.englishTodoNotice}</p>
        <p className="mt-1 font-medium text-amber-700">
          {messages.referenceCase.footerDisclaimer}
        </p>
      </div>
    </footer>
  );
}
