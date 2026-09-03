"use client";

import { useCallback } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { CharacterizationItem, DetectionMethod } from "@/types/models";
import { getReferenceCases } from "@/data/reference-cases";
import { getLiveDemoKind } from "@/data/live-demos";
import { getMethodContent } from "@/data/method-content";
import { ApplicabilityBadge } from "@/components/ApplicabilityBadge";
import { SupplementaryTag } from "@/components/SupplementaryTag";
import { FieldBlock } from "@/components/FieldBlock";
import { MethodSelector } from "@/components/MethodSelector";
import { MethodContentPanel } from "@/components/MethodContentPanel";
import { MethodContentPlaceholder } from "@/components/MethodContentPlaceholder";
import { MethodToolPanel } from "@/components/MethodToolPanel";
import { MethodLiveDemo } from "@/components/live-demo/MethodLiveDemo";
import { ReferenceCaseSection } from "@/components/reference-case/ReferenceCaseSection";
import { SimilarityAnalysisPlaceholder } from "@/components/SimilarityAnalysisPlaceholder";
import { FigureLibraryInputSection } from "@/components/analysis/FigureLibraryInputSection";
import { figureLibraryEntriesForItem } from "@/data/figure-library-catalog";
import {
  drawerLayerDomId,
  useDrawerStack,
} from "@/components/drawer/DrawerStackProvider";

interface ItemDetailContentProps {
  item: CharacterizationItem;
}

function methodSelectionLayerId(itemId: string): string {
  return `item-method-selection-${itemId}`;
}

function methodDetailLayerId(methodId: string): string {
  return `item-method-detail-${methodId}`;
}

function referenceCaseLayerId(itemId: string): string {
  return `item-reference-cases-${itemId}`;
}

/** Full item interface shared by the dedicated page and the explorer drawer
 *  layer. Page chrome (breadcrumb, prev/next) stays in ItemDetailView. */
export function ItemDetailContent({ item }: ItemDetailContentProps) {
  const { localize, messages } = useLanguage();
  const { layers, pushLayer } = useDrawerStack();
  const referenceCases = getReferenceCases(item.id);
  const libraryFigures = figureLibraryEntriesForItem(item.id);

  const openReferenceCases = useCallback(() => {
    pushLayer({
      id: referenceCaseLayerId(item.id),
      title: messages.drawer.referenceCaseLayerTitle,
      spineLabel: messages.drawer.referenceCaseLayerTitle,
      content: <ReferenceCaseSection referenceCases={referenceCases} />,
    });
  }, [item.id, messages, pushLayer, referenceCases]);

  const openMethodDetail = useCallback(
    (method: DetectionMethod) => {
      const hasMethodContent = getMethodContent(method.id) !== undefined;
      const hasLiveDemo = getLiveDemoKind(method.id) !== undefined;
      pushLayer({
        id: methodDetailLayerId(method.id),
        title: `${messages.drawer.methodDetailTitle} · ${localize(method.name)}`,
        spineLabel: localize(method.name),
        content: (
          <div className="flex flex-col gap-4">
            {hasMethodContent ? <MethodContentPanel method={method} /> : null}
            <MethodLiveDemo method={method} />
            {!hasMethodContent && !hasLiveDemo ? (
              <MethodContentPlaceholder method={method} />
            ) : null}
            <MethodToolPanel methodId={method.id} />
            <button
              type="button"
              onClick={openReferenceCases}
              aria-controls={drawerLayerDomId(referenceCaseLayerId(item.id))}
              className="tap-target inline-flex items-center justify-center rounded-sm bg-coral-700 px-4 text-sm font-bold text-paper hover:bg-coral-800"
            >
              {messages.drawer.referenceCaseLayerTitle} →
            </button>
          </div>
        ),
      });
    },
    [item.id, localize, messages, openReferenceCases, pushLayer],
  );

  const openMethodSelection = useCallback(() => {
    pushLayer({
      id: methodSelectionLayerId(item.id),
      title: `${messages.drawer.methodSelectionTitle} · ${localize(item.itemName)}`,
      spineLabel: messages.drawer.methodSelectionTitle,
      content: (
        <div className="flex flex-col gap-5">
          <MethodSelector itemId={item.id} methods={item.methods} />
          <section aria-labelledby={`${item.id}-method-detail-entries`}>
            <h3
              id={`${item.id}-method-detail-entries`}
              className="text-sm font-semibold text-navy-900"
            >
              {messages.drawer.methodDetailTitle}
            </h3>
            <ul className="mt-2 flex flex-col gap-2">
              {item.methods.map((method) => (
                <li key={method.id}>
                  <button
                    type="button"
                    onClick={() => openMethodDetail(method)}
                    aria-controls={drawerLayerDomId(methodDetailLayerId(method.id))}
                    className="surface-card tap-target flex w-full items-center justify-between gap-3 p-3 text-left transition-shadow duration-150 hover:shadow-[var(--shadow-depth-2)]"
                  >
                    <span className="min-w-0 truncate text-sm font-medium text-ink">
                      {localize(method.name)}
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-brand-800">
                      {method.type === "primary"
                        ? messages.itemPage.primaryMethodLabel
                        : messages.itemPage.orthogonalMethodLabel}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ),
    });
  }, [item, localize, messages, openMethodDetail, pushLayer]);

  const methodSelectionDomId = drawerLayerDomId(methodSelectionLayerId(item.id));
  const referenceCaseDomId = drawerLayerDomId(referenceCaseLayerId(item.id));
  const isMethodSelectionOpen = layers.some(
    (layer) => drawerLayerDomId(layer.id) === methodSelectionDomId,
  );
  const isReferenceCaseOpen = layers.some(
    (layer) => drawerLayerDomId(layer.id) === referenceCaseDomId,
  );

  return (
    <div className="flex flex-col gap-8">
      <header className="surface-card border-l-4 border-l-coral-700 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-navy-900">{localize(item.itemName)}</h1>
          {item.isSupplementary && <SupplementaryTag />}
        </div>
        <p className="mt-2 text-sm text-ink-secondary">
          {messages.itemPage.guidelineTermLabel}: {localize(item.guidelineTerm)}
        </p>
        <div className="mt-3">
          <ApplicabilityBadge applicability={item.applicability} />
        </div>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-bold text-navy-900">
          {messages.itemPage.fieldSectionTitle}
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <FieldBlock label={messages.itemPage.purposeLabel} value={item.purpose} />
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
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <button
          type="button"
          onClick={openMethodSelection}
          aria-expanded={isMethodSelectionOpen}
          aria-controls={methodSelectionDomId}
          className="surface-card tap-target flex flex-col items-start gap-2 border-l-4 border-l-coral-700 p-6 text-left transition-shadow duration-150 hover:shadow-[var(--shadow-depth-2)]"
        >
          <span className="text-lg font-bold text-navy-900">
            {messages.itemPage.methodSectionTitle}
          </span>
          <span className="text-sm leading-relaxed text-ink-secondary">
            {messages.itemPage.methodSectionDescription}
          </span>
          <span className="pt-1 text-sm font-semibold text-brand-800">
            {messages.drawer.methodSelectionTitle} →
          </span>
        </button>
        <button
          type="button"
          onClick={openReferenceCases}
          aria-expanded={isReferenceCaseOpen}
          aria-controls={referenceCaseDomId}
          className="surface-card tap-target flex flex-col items-start gap-2 border-l-4 border-l-cyan-700 p-6 text-left transition-shadow duration-150 hover:shadow-[var(--shadow-depth-2)]"
        >
          <span className="text-lg font-bold text-navy-900">
            {messages.referenceCase.sectionTitle}
          </span>
          <span className="text-sm leading-relaxed text-ink-secondary">
            {messages.referenceCase.sectionDescription}
          </span>
          <span className="pt-1 text-sm font-semibold text-brand-800">
            {messages.drawer.referenceCaseLayerTitle} →
          </span>
        </button>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-900">
          {messages.itemPage.analysisSectionTitle}
        </h2>
        <p className="mb-3 mt-1 text-sm text-ink-secondary">
          {messages.itemPage.analysisSectionDescription}
        </p>
        {libraryFigures.length > 0 ? (
          <FigureLibraryInputSection entries={libraryFigures} />
        ) : (
          <SimilarityAnalysisPlaceholder analysisPlaceholder={item.analysisPlaceholder} />
        )}
      </section>
    </div>
  );
}
