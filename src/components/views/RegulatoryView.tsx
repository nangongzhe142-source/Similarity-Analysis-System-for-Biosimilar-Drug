"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { regulatoryFramework } from "@/data/regulatory-framework";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  RegulatoryRelationsTable,
  RegulatoryRequirementsTable,
} from "@/components/RegulatoryTable";
import {
  drawerLayerDomId,
  useDrawerStack,
} from "@/components/drawer/DrawerStackProvider";
import {
  regulatoryRelationLayerId,
  useExplorerLayers,
} from "@/components/layout/SideExplorerRail";

export function RegulatoryView() {
  const { localize, messages } = useLanguage();
  const { layers } = useDrawerStack();
  const { openRegulatoryRelation } = useExplorerLayers();

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
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {regulatoryFramework.relations.map((relation) => {
            const layerDomId = drawerLayerDomId(regulatoryRelationLayerId(relation.id));
            const isOpen = layers.some((layer) => drawerLayerDomId(layer.id) === layerDomId);
            return (
              <li key={relation.id}>
                <button
                  type="button"
                  onClick={() => openRegulatoryRelation(relation)}
                  aria-expanded={isOpen}
                  aria-controls={layerDomId}
                  className="surface-card tap-target flex w-full flex-col items-start gap-1 p-3 text-left transition-shadow duration-150 hover:shadow-[var(--shadow-depth-2)]"
                >
                  <span className="font-mono text-xs font-semibold text-brand-800">
                    {relation.ctdSection}
                  </span>
                  <span className="text-sm font-medium text-ink">
                    {localize(relation.subject)}
                  </span>
                  <span className="pt-0.5 text-xs font-semibold text-brand-800">
                    {messages.drawer.openRelationLayer} →
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
