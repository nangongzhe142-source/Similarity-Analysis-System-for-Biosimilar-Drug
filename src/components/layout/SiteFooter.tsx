"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { regulatoryFramework } from "@/data/regulatory-framework";

export function SiteFooter() {
  const { localize, messages } = useLanguage();

  return (
    <footer className="border-t-4 border-brand-700 bg-navy-900 text-paper">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm sm:px-6">
        <p className="text-cyan-100">
          {messages.regulatoryPage.sourceLabel}:{" "}
          {localize(regulatoryFramework.sourceTitle)}
        </p>
        <p className="text-cyan-100">{messages.common.englishTodoNotice}</p>
        <p className="font-medium text-paper">{messages.common.notAGovernmentSite}</p>
        <p className="font-medium text-paper">{messages.referenceCase.footerDisclaimer}</p>
      </div>
    </footer>
  );
}
