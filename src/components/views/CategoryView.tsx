"use client";

import { useCallback } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Category, CharacterizationItem } from "@/types/models";
import { getItemsByCategory } from "@/data/selectors";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CategoryMark } from "@/components/CategoryMark";
import { ApplicabilityBadge } from "@/components/ApplicabilityBadge";
import { SupplementaryTag } from "@/components/SupplementaryTag";
import { FieldBlock } from "@/components/FieldBlock";
import {
  drawerLayerDomId,
  useDrawerStack,
} from "@/components/drawer/DrawerStackProvider";
import {
  itemDetailLayerId,
  useExplorerLayers,
} from "@/components/layout/SideExplorerRail";

interface CategoryViewProps {
  category: Category;
}

function itemQuickLookLayerId(itemId: string): string {
  return `category-item-quicklook-${itemId}`;
}

function itemFieldsLayerId(itemId: string): string {
  return `category-item-fields-${itemId}`;
}

export function CategoryView({ category }: CategoryViewProps) {
  const { localize, messages } = useLanguage();
  const { layers, pushLayer } = useDrawerStack();
  const { openItemDetail } = useExplorerLayers();
  const items = getItemsByCategory(category.key);
  const hasSupplementaryItems = items.some((item) => item.isSupplementary);

  const openItemFields = useCallback(
    (item: CharacterizationItem) => {
      pushLayer({
        id: itemFieldsLayerId(item.id),
        title: `${messages.drawer.itemFieldsTitle} · ${localize(item.itemName)}`,
        spineLabel: messages.drawer.itemFieldsTitle,
        content: (
          <div className="flex flex-col gap-4">
            <div>
              <ApplicabilityBadge applicability={item.applicability} />
            </div>
            {item.isSupplementary && (
              <p className="text-sm text-navy-900">{messages.categoryPage.supplementaryNote}</p>
            )}
            <FieldBlock
              label={messages.itemPage.detectionIndicatorsLabel}
              value={item.detectionIndicators}
            />
            <FieldBlock
              label={messages.itemPage.similarityMethodLabel}
              value={item.similarityMethod}
            />
            <FieldBlock
              label={messages.itemPage.judgingPrincipleLabel}
              value={item.judgingPrinciple}
              emphasized
            />
            <FieldBlock
              label={messages.itemPage.numericLimitLabel}
              value={item.numericLimit}
              emphasized
            />
            <FieldBlock label={messages.itemPage.remarkLabel} value={item.remark} />
          </div>
        ),
      });
    },
    [localize, messages, pushLayer],
  );

  const openItemQuickLook = useCallback(
    (item: CharacterizationItem) => {
      pushLayer({
        id: itemQuickLookLayerId(item.id),
        title: `${messages.drawer.itemQuickLookTitle} · ${localize(item.itemName)}`,
        spineLabel: localize(item.itemName),
        content: (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-navy-900">{localize(item.itemName)}</h3>
              {item.isSupplementary && <SupplementaryTag />}
            </div>
            <p className="text-sm text-ink-secondary">
              {messages.itemPage.guidelineTermLabel}: {localize(item.guidelineTerm)}
            </p>
            <FieldBlock label={messages.itemPage.purposeLabel} value={item.purpose} />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => openItemFields(item)}
                aria-controls={drawerLayerDomId(itemFieldsLayerId(item.id))}
                className="tap-target inline-flex items-center rounded-sm bg-coral-700 px-4 text-sm font-bold text-paper hover:bg-coral-800"
              >
                {messages.drawer.itemFieldsTitle} →
              </button>
              <button
                type="button"
                onClick={() => openItemDetail(item)}
                aria-controls={drawerLayerDomId(itemDetailLayerId(item.id))}
                className="tap-target inline-flex items-center rounded-sm border border-line bg-paper px-4 text-sm font-bold text-navy-900 hover:bg-canvas-muted"
              >
                {messages.drawer.viewFullDetail} →
              </button>
            </div>
          </div>
        ),
      });
    },
    [localize, messages, openItemDetail, openItemFields, pushLayer],
  );

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        entries={[
          { label: messages.itemPage.breadcrumbHome, href: "/" },
          { label: localize(category.name) },
        ]}
      />

      <header className="surface-card border-l-4 border-l-coral-700 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <CategoryMark categoryKey={category.key} order={category.order} />
          <h1 className="text-2xl font-bold text-navy-900">{localize(category.name)}</h1>
          <span className="text-sm font-medium text-ink-secondary">
            {items.length} {messages.categoryPage.itemCountSuffix}
          </span>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-secondary">
          {localize(category.description)}
        </p>
        {hasSupplementaryItems && (
          <p className="mt-3 text-sm text-navy-900">{messages.categoryPage.supplementaryNote}</p>
        )}
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const layerDomId = drawerLayerDomId(itemQuickLookLayerId(item.id));
          const isOpen = layers.some((layer) => drawerLayerDomId(layer.id) === layerDomId);
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => openItemQuickLook(item)}
                aria-expanded={isOpen}
                aria-controls={layerDomId}
                className="surface-card tap-target flex h-full w-full flex-col items-start gap-2 p-4 text-left transition-shadow duration-150 hover:shadow-[var(--shadow-depth-2)]"
              >
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-bold text-navy-900">
                    {localize(item.itemName)}
                  </span>
                  {item.isSupplementary && <SupplementaryTag />}
                </span>
                <span className="text-xs text-ink-secondary">
                  {localize(item.guidelineTerm)}
                </span>
                <span className="text-sm leading-relaxed text-ink-secondary">
                  {localize(item.purpose)}
                </span>
                <span className="mt-auto pt-1 text-sm font-semibold text-brand-800">
                  {messages.drawer.openItemLayer} →
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
