"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { regulatoryFramework } from "@/data/regulatory-framework";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  RegulatoryRelationsTable,
  RegulatoryRequirementsTable,
} from "@/components/RegulatoryTable";

export function RegulatoryView() {
  const { localize, messages } = useLanguage();

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb
        entries={[
          { label: messages.itemPage.breadcrumbHome, href: "/" },
          { label: messages.regulatoryPage.title },
        ]}
      />

      <header className="surface-card border-l-4 border-l-cyan-700 p-5">
        <h1 className="text-2xl font-bold text-navy-900">{messages.regulatoryPage.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-secondary">
          {messages.regulatoryPage.description}
        </p>
        <p className="mt-3 text-sm text-ink-secondary">
          {messages.regulatoryPage.sourceLabel}: {localize(regulatoryFramework.sourceTitle)}
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-bold text-navy-900">
          {messages.regulatoryPage.requirementsTableTitle}
        </h2>
        <RegulatoryRequirementsTable requirements={regulatoryFramework.requirements} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-navy-900">
          {messages.regulatoryPage.relationsTableTitle}
        </h2>
        <RegulatoryRelationsTable relations={regulatoryFramework.relations} />
      </section>
    </div>
  );
}
