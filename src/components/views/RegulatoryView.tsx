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

      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          {messages.regulatoryPage.title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
          {messages.regulatoryPage.description}
        </p>
        <p className="mt-2 text-xs text-slate-400">
          {messages.regulatoryPage.sourceLabel}:{" "}
          {localize(regulatoryFramework.sourceTitle)}
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          {messages.regulatoryPage.requirementsTableTitle}
        </h2>
        <RegulatoryRequirementsTable
          requirements={regulatoryFramework.requirements}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          {messages.regulatoryPage.relationsTableTitle}
        </h2>
        <RegulatoryRelationsTable relations={regulatoryFramework.relations} />
      </section>
    </div>
  );
}
