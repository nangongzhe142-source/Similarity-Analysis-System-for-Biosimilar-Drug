"use client";

import { usePathname } from "next/navigation";
import { useCallback, type ReactNode } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { categories } from "@/data/categories";
import { regulatoryFramework } from "@/data/regulatory-framework";
import {
  getItemById,
  getItemCountByCategory,
  getItemsByCategory,
} from "@/data/selectors";
import { CategoryMark } from "@/components/CategoryMark";
import { ItemDetailContent } from "@/components/views/ItemDetailContent";
import {
  drawerLayerDomId,
  useDrawerStack,
} from "@/components/drawer/DrawerStackProvider";
import type {
  Category,
  CharacterizationItem,
  RegulatoryCtdRelation,
  RegulatoryRelationLevel,
} from "@/types/models";

const PURPOSE_SUMMARY_LIMIT = 3;
const PURPOSE_SUMMARY_MAX_LENGTH = 64;
const SPINE_LABEL_MAX_LENGTH = 10;

function spineLabelOf(title: string): string {
  return title.length <= SPINE_LABEL_MAX_LENGTH
    ? title
    : `${title.slice(0, SPINE_LABEL_MAX_LENGTH)}…`;
}

function truncate(text: string, maxLength: number): string {
  const trimmed = text.trim();
  return trimmed.length <= maxLength ? trimmed : `${trimmed.slice(0, maxLength)}…`;
}

export function categoryOverviewLayerId(categoryKey: string): string {
  return `explorer-category-${categoryKey}`;
}

export function categoryItemsLayerId(categoryKey: string): string {
  return `explorer-category-items-${categoryKey}`;
}

export function itemSummaryLayerId(itemId: string): string {
  return `explorer-item-${itemId}`;
}

export function itemDetailLayerId(itemId: string): string {
  return `explorer-item-detail-${itemId}`;
}

export function regulatoryRelationsLayerId(): string {
  return "explorer-regulatory-relations";
}

export function regulatoryRelationLayerId(relationId: string): string {
  return `explorer-regulatory-relation-${relationId}`;
}

function LayerSectionTitle({ children }: { children: string }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
      {children}
    </h3>
  );
}

/** Shared drawer-layer builders. Exported so the rail and the page views push
 *  byte-identical layers instead of each inventing their own copy. */
export function useExplorerLayers() {
  const { localize, messages } = useLanguage();
  const { pushLayer } = useDrawerStack();

  const openItemDetail = useCallback(
    (item: CharacterizationItem) => {
      const title = `${messages.drawer.itemDetailTitle} · ${localize(item.itemName)}`;
      pushLayer({
        id: itemDetailLayerId(item.id),
        title,
        spineLabel: spineLabelOf(localize(item.itemName)),
        content: <ItemDetailContent item={item} />,
      });
    },
    [localize, messages, pushLayer],
  );

  const openItemSummary = useCallback(
    (item: CharacterizationItem) => {
      const title = `${messages.drawer.itemSummaryTitle} · ${localize(item.itemName)}`;
      pushLayer({
        id: itemSummaryLayerId(item.id),
        title,
        spineLabel: spineLabelOf(localize(item.itemName)),
        content: (
          <div className="flex flex-col gap-4">
            <section className="surface-card p-4">
              <LayerSectionTitle>{messages.itemPage.guidelineTermLabel}</LayerSectionTitle>
              <p className="mt-1 text-sm text-ink">{localize(item.guidelineTerm)}</p>
            </section>
            <section className="surface-card p-4">
              <LayerSectionTitle>{messages.itemPage.purposeLabel}</LayerSectionTitle>
              <p className="mt-1 text-sm leading-relaxed text-ink">{localize(item.purpose)}</p>
            </section>
            <section className="surface-card p-4">
              <LayerSectionTitle>{messages.itemPage.judgingPrincipleLabel}</LayerSectionTitle>
              <p className="mt-1 text-sm leading-relaxed text-ink">
                {localize(item.judgingPrinciple)}
              </p>
            </section>
            <section className="surface-card p-4">
              <LayerSectionTitle>{messages.itemPage.numericLimitLabel}</LayerSectionTitle>
              <p className="mt-1 text-sm leading-relaxed text-ink">
                {localize(item.numericLimit)}
              </p>
            </section>
            <button
              type="button"
              onClick={() => openItemDetail(item)}
              aria-controls={drawerLayerDomId(itemDetailLayerId(item.id))}
              className="tap-target inline-flex items-center justify-center rounded-sm bg-coral-700 px-4 text-sm font-bold text-paper hover:bg-coral-800"
            >
              {messages.drawer.viewFullDetail} →
            </button>
          </div>
        ),
      });
    },
    [localize, messages, openItemDetail, pushLayer],
  );

  const openCategoryItems = useCallback(
    (category: Category) => {
      const items = getItemsByCategory(category.key);
      const title = `${messages.drawer.categoryItemsTitle} · ${localize(category.name)}`;
      pushLayer({
        id: categoryItemsLayerId(category.key),
        title,
        spineLabel: spineLabelOf(messages.drawer.categoryItemsTitle),
        content: (
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => openItemSummary(item)}
                  aria-controls={drawerLayerDomId(itemSummaryLayerId(item.id))}
                  className="surface-card tap-target flex w-full flex-col items-start gap-1 p-3 text-left transition-shadow duration-150 hover:shadow-[var(--shadow-depth-2)]"
                >
                  <span className="text-sm font-semibold text-navy-900">
                    {localize(item.itemName)}
                  </span>
                  <span className="text-xs text-ink-secondary">
                    {truncate(localize(item.purpose), PURPOSE_SUMMARY_MAX_LENGTH)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ),
      });
    },
    [localize, messages, openItemSummary, pushLayer],
  );

  const openCategoryOverview = useCallback(
    (category: Category) => {
      const items = getItemsByCategory(category.key);
      const supplementaryCount = items.filter((item) => item.isSupplementary).length;
      const title = `${messages.drawer.categoryOverviewTitle} · ${localize(category.name)}`;
      pushLayer({
        id: categoryOverviewLayerId(category.key),
        title,
        spineLabel: spineLabelOf(localize(category.name)),
        content: (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <CategoryMark categoryKey={category.key} order={category.order} />
              <p className="text-base font-bold text-navy-900">{localize(category.name)}</p>
            </div>
            <dl className="grid grid-cols-2 gap-3">
              <div className="metric-card px-3 py-2">
                <dt className="text-xs text-ink-secondary">{messages.home.statsItems}</dt>
                <dd className="mt-1 font-mono text-2xl font-bold text-navy-900">
                  {items.length}
                </dd>
              </div>
              <div className="metric-card px-3 py-2">
                <dt className="text-xs text-ink-secondary">
                  {messages.home.statsSupplementary}
                </dt>
                <dd className="mt-1 font-mono text-2xl font-bold text-navy-900">
                  {supplementaryCount}
                </dd>
              </div>
            </dl>
            <p className="text-sm leading-relaxed text-ink-secondary">
              {localize(category.description)}
            </p>
            <section>
              <LayerSectionTitle>{messages.itemPage.purposeLabel}</LayerSectionTitle>
              <ul className="mt-2 flex flex-col gap-1.5">
                {items.slice(0, PURPOSE_SUMMARY_LIMIT).map((item) => (
                  <li key={item.id} className="text-sm text-ink">
                    <span className="font-semibold text-navy-900">
                      {localize(item.itemName)}
                    </span>
                    {" — "}
                    {truncate(localize(item.purpose), PURPOSE_SUMMARY_MAX_LENGTH)}
                  </li>
                ))}
              </ul>
            </section>
            <button
              type="button"
              onClick={() => openCategoryItems(category)}
              aria-controls={drawerLayerDomId(categoryItemsLayerId(category.key))}
              className="tap-target inline-flex items-center justify-center rounded-sm bg-coral-700 px-4 text-sm font-bold text-paper hover:bg-coral-800"
            >
              {messages.drawer.categoryItemsTitle} →
            </button>
          </div>
        ),
      });
    },
    [localize, messages, openCategoryItems, pushLayer],
  );

  const openRegulatoryRelation = useCallback(
    (relation: RegulatoryCtdRelation) => {
      const relationLabels: Record<RegulatoryRelationLevel, string> = {
        "directly-related": messages.regulatoryPage.relationDirectlyRelated,
        "indirectly-related": messages.regulatoryPage.relationIndirectlyRelated,
        supportive: messages.regulatoryPage.relationSupportive,
      };
      const title = `${messages.drawer.regulatoryRelationTitle} · ${relation.ctdSection}`;
      pushLayer({
        id: regulatoryRelationLayerId(relation.id),
        title,
        spineLabel: spineLabelOf(relation.ctdSection),
        content: (
          <div className="flex flex-col gap-4">
            <section className="surface-card p-4">
              <LayerSectionTitle>{messages.regulatoryPage.ctdSectionHeader}</LayerSectionTitle>
              <p className="mt-1 font-mono text-sm font-semibold text-navy-900">
                {relation.ctdSection}
              </p>
            </section>
            <section className="surface-card p-4">
              <LayerSectionTitle>{messages.regulatoryPage.subjectHeader}</LayerSectionTitle>
              <p className="mt-1 text-sm leading-relaxed text-ink">
                {localize(relation.subject)}
              </p>
            </section>
            <section className="surface-card p-4">
              <LayerSectionTitle>{messages.regulatoryPage.relationHeader}</LayerSectionTitle>
              <p className="mt-1 text-sm font-semibold text-ink">
                <span aria-hidden="true" className="mr-1.5">
                  {relation.relation === "directly-related"
                    ? "●"
                    : relation.relation === "indirectly-related"
                      ? "◆"
                      : "■"}
                </span>
                {relationLabels[relation.relation]}
              </p>
            </section>
            <p className="text-xs leading-relaxed text-ink-secondary">
              {messages.regulatoryPage.sourceLabel}:{" "}
              {localize(regulatoryFramework.sourceTitle)}
            </p>
          </div>
        ),
      });
    },
    [localize, messages, pushLayer],
  );

  const openRegulatoryRelations = useCallback(() => {
    pushLayer({
      id: regulatoryRelationsLayerId(),
      title: messages.regulatoryPage.relationsTableTitle,
      spineLabel: spineLabelOf(messages.navigation.regulatory),
      content: (
        <ul className="flex flex-col gap-2">
          {regulatoryFramework.relations.map((relation) => (
            <li key={relation.id}>
              <button
                type="button"
                onClick={() => openRegulatoryRelation(relation)}
                aria-controls={drawerLayerDomId(regulatoryRelationLayerId(relation.id))}
                className="surface-card tap-target flex w-full flex-col items-start gap-1 p-3 text-left transition-shadow duration-150 hover:shadow-[var(--shadow-depth-2)]"
              >
                <span className="font-mono text-xs font-semibold text-brand-800">
                  {relation.ctdSection}
                </span>
                <span className="text-sm font-medium text-ink">
                  {localize(relation.subject)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ),
    });
  }, [localize, messages, openRegulatoryRelation, pushLayer]);

  const openCategoryIndex = useCallback(() => {
    pushLayer({
      id: "explorer-category-index",
      title: messages.navigation.allCategories,
      spineLabel: spineLabelOf(messages.navigation.allCategories),
      content: (
        <ul className="flex flex-col gap-2">
          {categories.map((category) => (
            <li key={category.key}>
              <button
                type="button"
                onClick={() => openCategoryOverview(category)}
                aria-controls={drawerLayerDomId(categoryOverviewLayerId(category.key))}
                className="surface-card tap-target flex w-full items-center justify-between gap-3 p-3 text-left transition-shadow duration-150 hover:shadow-[var(--shadow-depth-2)]"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <CategoryMark categoryKey={category.key} order={category.order} />
                  <span className="truncate text-sm font-semibold text-navy-900">
                    {localize(category.name)}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-ink-secondary">
                  {getItemCountByCategory(category.key)} {messages.home.itemCountSuffix}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ),
    });
  }, [localize, messages, openCategoryOverview, pushLayer]);

  return {
    openItemSummary,
    openItemDetail,
    openCategoryItems,
    openCategoryOverview,
    openRegulatoryRelation,
    openRegulatoryRelations,
    openCategoryIndex,
  };
}

interface RailEntry {
  key: string;
  label: string;
  layerDomId: string;
  glyph: ReactNode;
  onSelect: () => void;
}

export function SideExplorerRail() {
  const pathname = usePathname();
  const { localize, messages } = useLanguage();
  const { layers, closeAll } = useDrawerStack();
  const {
    openCategoryOverview,
    openCategoryIndex,
    openItemSummary,
    openRegulatoryRelations,
  } = useExplorerLayers();

  const categoryEntries: RailEntry[] = categories.map((category) => ({
    key: category.key,
    label: `${localize(category.name)} · ${getItemCountByCategory(category.key)} ${messages.home.itemCountSuffix}`,
    layerDomId: drawerLayerDomId(categoryOverviewLayerId(category.key)),
    glyph: <CategoryMark categoryKey={category.key} order={category.order} />,
    onSelect: () => openCategoryOverview(category),
  }));

  const pageEntries: RailEntry[] = [
    {
      key: "regulatory",
      label: messages.navigation.regulatory,
      layerDomId: drawerLayerDomId(regulatoryRelationsLayerId()),
      glyph: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6 stroke-current">
          <path strokeWidth="1.75" d="M6 3h9l4 4v14H6z" />
          <path strokeWidth="1.75" d="M9 9h7M9 13h7M9 17h4" />
        </svg>
      ),
      onSelect: openRegulatoryRelations,
    },
    {
      key: "all-categories",
      label: messages.navigation.allCategories,
      layerDomId: drawerLayerDomId("explorer-category-index"),
      glyph: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6 stroke-current">
          <path strokeWidth="1.75" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      onSelect: openCategoryIndex,
    },
  ];

  const contextEntries: RailEntry[] = [];
  const categoryMatch = pathname.match(/^\/category\/([^/]+)$/);
  if (categoryMatch !== null) {
    const contextCategory = categories.find((category) => category.key === categoryMatch[1]);
    if (contextCategory !== undefined) {
      contextEntries.push({
        key: `context-${contextCategory.key}`,
        label: `${messages.drawer.categoryOverviewTitle} · ${localize(contextCategory.name)}`,
        layerDomId: drawerLayerDomId(categoryOverviewLayerId(contextCategory.key)),
        glyph: (
          <CategoryMark categoryKey={contextCategory.key} order={contextCategory.order} />
        ),
        onSelect: () => openCategoryOverview(contextCategory),
      });
    }
  }
  const itemMatch = pathname.match(/^\/item\/([^/]+)$/);
  if (itemMatch !== null) {
    const contextItem = getItemById(itemMatch[1]);
    if (contextItem !== undefined) {
      contextEntries.push({
        key: `context-${contextItem.id}`,
        label: `${messages.drawer.itemSummaryTitle} · ${localize(contextItem.itemName)}`,
        layerDomId: drawerLayerDomId(itemSummaryLayerId(contextItem.id)),
        glyph: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="h-6 w-6 stroke-current"
          >
            <path strokeWidth="1.75" d="M5 4h11l3 3v13H5z" />
            <path strokeWidth="1.75" d="M8 11h8M8 15h5" />
          </svg>
        ),
        onSelect: () => openItemSummary(contextItem),
      });
    }
  }

  const groups: Array<{ key: string; label: string; entries: RailEntry[] }> = [
    { key: "context", label: messages.drawer.railContextGroup, entries: contextEntries },
    { key: "categories", label: messages.drawer.railCategoriesGroup, entries: categoryEntries },
    { key: "pages", label: messages.drawer.railPagesGroup, entries: pageEntries },
  ].filter((group) => group.entries.length > 0);

  return (
    <div className="rail-shell">
      <nav aria-label={messages.drawer.railLabel} className="rail-scroll">
        {groups.map((group) => (
          <div key={group.key} className="contents">
            <p className="sr-only">{group.label}</p>
            {group.entries.map((entry) => {
              const isOpen = layers.some(
                (layer) => drawerLayerDomId(layer.id) === entry.layerDomId,
              );
              return (
                <button
                  key={entry.key}
                  type="button"
                  onClick={() => {
                    if (!isOpen) {
                      closeAll();
                    }
                    entry.onSelect();
                  }}
                  aria-expanded={isOpen}
                  aria-controls={entry.layerDomId}
                  aria-label={`${group.label}：${entry.label}`}
                  className={`rail-button tap-target ${isOpen ? "rail-button-active" : ""}`}
                >
                  <span aria-hidden="true">{entry.glyph}</span>
                  <span aria-hidden="true" className="rail-text-inline">
                    {entry.label}
                  </span>
                  <span aria-hidden="true" className="rail-label">
                    {entry.label}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );
}
