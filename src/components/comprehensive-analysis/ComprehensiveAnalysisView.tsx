"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { categories } from "@/data/categories";
import { characterizationItems } from "@/data/characterization-items";
import {
  cloneAssessmentSession,
  createEmptyAssessmentSession,
  createIllustrativeDemoSession,
} from "@/data/comprehensive-analysis-demo";
import { getItemById, getItemsByCategory } from "@/data/selectors";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CategoryMark } from "@/components/CategoryMark";
import { CategoryAssessmentSection } from "@/components/comprehensive-analysis/CategoryAssessmentSection";
import { ComparisonOverview } from "@/components/comprehensive-analysis/ComparisonOverview";
import { InputFilePanel, type InputFileImportStatus } from "@/components/comprehensive-analysis/InputFilePanel";
import { ItemAssessmentCard } from "@/components/comprehensive-analysis/ItemAssessmentCard";
import { ItemComparisonProcess } from "@/components/comprehensive-analysis/ItemComparisonProcess";
import { OverallEvidencePanel } from "@/components/comprehensive-analysis/OverallEvidencePanel";
import { ProductPairForm } from "@/components/comprehensive-analysis/ProductPairForm";
import {
  drawerLayerDomId,
  useDrawerLayerSync,
  useDrawerStack,
} from "@/components/drawer/DrawerStackProvider";
import {
  buildComprehensiveOutputReport,
  suggestOutputReportFileName,
} from "@/lib/comprehensive-analysis/build-output-report";
import { buildDemoProcessViewModel } from "@/lib/comprehensive-analysis/demo-process";
import { parseComprehensiveInputFile } from "@/lib/comprehensive-analysis/parse-input";
import {
  createFallbackItemEntry,
  summarizeComprehensiveAssessment,
} from "@/lib/comprehensive-analysis/summarize";
import type { Category, CharacterizationItem } from "@/types/models";
import type {
  ComprehensiveAssessmentSession,
  ItemAssessmentEntry,
  ProductPairInput,
} from "@/types/comprehensive-analysis";

const CATEGORY_ORDER = categories.map((category) => category.key);
const ALLOWED_ITEM_IDS = characterizationItems.map((item) => item.id);

const CATEGORY_LAYER_PREFIX = "ca-category-";
const ITEM_LAYER_PREFIX = "ca-item-";
const PROCESS_LAYER_PREFIX = "ca-process-";

function categoryLayerId(categoryKey: string): string {
  return `${CATEGORY_LAYER_PREFIX}${categoryKey}`;
}

function downloadTextFile(fileName: string, text: string): void {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

function buildOutputMarkdown(session: ComprehensiveAssessmentSession): string {
  const aggregation = summarizeComprehensiveAssessment({
    items: characterizationItems,
    itemEntries: session.itemEntries,
    categoryOrder: CATEGORY_ORDER,
  });
  return buildComprehensiveOutputReport({
    session,
    aggregation,
    items: characterizationItems,
    categories,
  });
}

function itemLayerId(itemId: string): string {
  return `${ITEM_LAYER_PREFIX}${itemId}`;
}

function processLayerId(itemId: string): string {
  return `${PROCESS_LAYER_PREFIX}${itemId}`;
}

export function ComprehensiveAnalysisView() {
  const { locale, localize, messages } = useLanguage();
  const copy = messages.comprehensiveAnalysis;
  const { layers, pushLayer } = useDrawerStack();
  const [session, setSession] = useState<ComprehensiveAssessmentSession>(() =>
    createIllustrativeDemoSession(),
  );
  const [sessionEpoch, setSessionEpoch] = useState(0);
  const [importStatus, setImportStatus] = useState<InputFileImportStatus>("idle");
  const [importDetail, setImportDetail] = useState("");

  const aggregation = useMemo(
    () =>
      summarizeComprehensiveAssessment({
        items: characterizationItems,
        itemEntries: session.itemEntries,
        categoryOrder: CATEGORY_ORDER,
      }),
    [session.itemEntries],
  );

  const replaceSession = (nextSession: ComprehensiveAssessmentSession) => {
    setSession(cloneAssessmentSession(nextSession));
    setSessionEpoch((currentEpoch) => currentEpoch + 1);
  };

  const handleInputFileRejected = (message: string) => {
    setImportStatus("error");
    setImportDetail(message);
  };

  const handleInputFileLoaded = (payload: { fileName: string; text: string }) => {
    const parsed = parseComprehensiveInputFile({
      text: payload.text,
      allowedItemIds: ALLOWED_ITEM_IDS,
    });
    if (!parsed.ok || parsed.session === null) {
      setImportStatus("error");
      setImportDetail(parsed.error ?? copy.inputFileImportError);
      return;
    }
    replaceSession(parsed.session);
    const warningSuffix =
      parsed.warnings.length > 0 ? ` ${parsed.warnings.join(" ")}` : "";
    setImportStatus("success");
    setImportDetail(
      `${copy.inputFileImportSuccess} ${payload.fileName} (${parsed.recognizedItemCount}).${warningSuffix}`.trim(),
    );
    downloadTextFile(
      suggestOutputReportFileName(parsed.session),
      buildOutputMarkdown(parsed.session),
    );
  };

  const handleDownloadOutput = () => {
    downloadTextFile(suggestOutputReportFileName(session), buildOutputMarkdown(session));
  };

  const handleClearAndReenter = () => {
    replaceSession(createEmptyAssessmentSession());
    setImportStatus("idle");
    setImportDetail("");
  };

  const handleRestoreDemo = () => {
    replaceSession(createIllustrativeDemoSession());
    setImportStatus("idle");
    setImportDetail("");
  };

  const handleProductPairChange = (productPair: ProductPairInput) => {
    setSession((currentSession) => ({
      ...currentSession,
      productPair,
    }));
  };

  const handleItemEntryChange = (entry: ItemAssessmentEntry) => {
    setSession((currentSession) => ({
      ...currentSession,
      itemEntries: {
        ...currentSession.itemEntries,
        [entry.itemId]: entry,
      },
    }));
  };

  /** Drawer layers live outside this subtree, so they are re-rendered whenever
   *  the entry data they show actually changes. Serialising the entries is what
   *  makes "changed" precise enough for a controlled textarea inside a layer. */
  const entriesSignature = useMemo(
    () => `${sessionEpoch}|${JSON.stringify(session.itemEntries)}`,
    [session.itemEntries, sessionEpoch],
  );

  const emptyLayerNotice = (
    <p className="text-sm text-ink-secondary">{messages.drawer.emptyLayerNotice}</p>
  );

  const buildProcessContent = (itemId: string) => {
    const item = getItemById(itemId);
    if (item === undefined) {
      return emptyLayerNotice;
    }
    const entry = session.itemEntries[itemId] ?? createFallbackItemEntry(itemId);
    return (
      <ItemComparisonProcess
        item={item}
        entry={entry}
        processView={buildDemoProcessViewModel({ item, entry, locale })}
      />
    );
  };

  const buildItemContent = (itemId: string) => {
    const item = getItemById(itemId);
    const aggregationRecord = aggregation.itemRecords.find(
      (record) => record.itemId === itemId,
    );
    if (item === undefined || aggregationRecord === undefined) {
      return emptyLayerNotice;
    }
    return (
      <ItemAssessmentCard
        item={item}
        entry={session.itemEntries[itemId] ?? createFallbackItemEntry(itemId)}
        aggregationRecord={aggregationRecord}
        onEntryChange={handleItemEntryChange}
        onOpenProcessLayer={openProcessLayer}
      />
    );
  };

  const buildCategoryContent = (categoryKey: string) => {
    const category = categories.find((candidate) => candidate.key === categoryKey);
    if (category === undefined) {
      return emptyLayerNotice;
    }
    const categoryRecord = aggregation.categoryRecords.find(
      (record) => record.categoryKey === category.key,
    );
    return (
      <CategoryAssessmentSection
        category={category}
        items={getItemsByCategory(category.key)}
        session={session}
        aggregation={aggregation}
        defaultExpanded={categoryRecord?.hasBlockingStatus === true}
        onItemEntryChange={handleItemEntryChange}
        onOpenItemLayer={openItemLayer}
      />
    );
  };

  function openProcessLayer(item: CharacterizationItem) {
    pushLayer({
      id: processLayerId(item.id),
      title: `${messages.drawer.comparisonProcessTitle} · ${localize(item.itemName)}`,
      spineLabel: messages.drawer.comparisonProcessTitle,
      content: buildProcessContent(item.id),
    });
  }

  function openItemLayer(item: CharacterizationItem) {
    pushLayer({
      id: itemLayerId(item.id),
      title: `${messages.drawer.itemAssessmentTitle} · ${localize(item.itemName)}`,
      spineLabel: localize(item.itemName),
      content: buildItemContent(item.id),
    });
  }

  function openCategoryLayer(category: Category) {
    pushLayer({
      id: categoryLayerId(category.key),
      title: `${messages.drawer.categoryAssessmentTitle} · ${localize(category.name)}`,
      spineLabel: localize(category.name),
      content: buildCategoryContent(category.key),
    });
  }

  function openCategoryLayerByKey(categoryKey: string) {
    const category = categories.find((candidate) => candidate.key === categoryKey);
    if (category !== undefined) {
      openCategoryLayer(category);
    }
  }

  function openItemLayerById(itemId: string) {
    const item = getItemById(itemId);
    if (item !== undefined) {
      openItemLayer(item);
    }
  }

  const openCategoryLayerId =
    layers.find((layer) => layer.id.startsWith(CATEGORY_LAYER_PREFIX))?.id ?? null;
  const openItemLayerId =
    layers.find((layer) => layer.id.startsWith(ITEM_LAYER_PREFIX))?.id ?? null;
  const openProcessLayerId =
    layers.find((layer) => layer.id.startsWith(PROCESS_LAYER_PREFIX))?.id ?? null;

  useDrawerLayerSync(openCategoryLayerId, entriesSignature, () =>
    openCategoryLayerId === null
      ? null
      : buildCategoryContent(openCategoryLayerId.slice(CATEGORY_LAYER_PREFIX.length)),
  );

  useDrawerLayerSync(openItemLayerId, entriesSignature, () =>
    openItemLayerId === null
      ? null
      : buildItemContent(openItemLayerId.slice(ITEM_LAYER_PREFIX.length)),
  );

  useDrawerLayerSync(openProcessLayerId, entriesSignature, () =>
    openProcessLayerId === null
      ? null
      : buildProcessContent(openProcessLayerId.slice(PROCESS_LAYER_PREFIX.length)),
  );

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        entries={[
          { label: messages.itemPage.breadcrumbHome, href: "/" },
          { label: copy.pageTitle },
        ]}
      />

      <header className="surface-card flex flex-col gap-3 border-l-4 border-l-coral-700 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">{copy.pageTitle}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-secondary">
            {copy.pageDescription}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleClearAndReenter}
            className="tap-target rounded-sm border border-line bg-paper px-3 text-sm font-semibold text-navy-900 hover:bg-canvas-muted"
          >
            {copy.clearAndReenter}
          </button>
          <button
            type="button"
            onClick={handleRestoreDemo}
            className="tap-target rounded-sm bg-coral-700 px-3 text-sm font-semibold text-paper hover:bg-coral-800"
          >
            {copy.restoreDemo}
          </button>
        </div>
      </header>

      <InputFilePanel
        importStatus={importStatus}
        importDetail={importDetail}
        onFileTextLoaded={handleInputFileLoaded}
        onFileRejected={handleInputFileRejected}
        onDownloadOutput={handleDownloadOutput}
      />

      <OverallEvidencePanel
        productPair={session.productPair}
        aggregation={aggregation}
        onCriticalItemSelect={openItemLayerById}
      />
      <ComparisonOverview
        productPair={session.productPair}
        aggregation={aggregation}
        onCategorySelect={openCategoryLayerByKey}
      />
      <ProductPairForm
        productPair={session.productPair}
        onProductPairChange={handleProductPairChange}
        onClearAndReenter={handleClearAndReenter}
        onRestoreDemo={handleRestoreDemo}
      />

      <section aria-labelledby="comprehensive-items-heading" className="flex flex-col gap-4">
        <h2 id="comprehensive-items-heading" className="text-lg font-bold text-navy-900">
          {copy.itemsSectionTitle}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => {
            const categoryRecord = aggregation.categoryRecords.find(
              (record) => record.categoryKey === category.key,
            );
            const layerDomId = drawerLayerDomId(categoryLayerId(category.key));
            const isOpen = layers.some((layer) => drawerLayerDomId(layer.id) === layerDomId);
            return (
              <li key={`${category.key}-${sessionEpoch}`}>
                <button
                  type="button"
                  onClick={() => openCategoryLayer(category)}
                  aria-expanded={isOpen}
                  aria-controls={layerDomId}
                  className="surface-card tap-target flex h-full w-full flex-col items-start gap-2 border-l-4 border-l-coral-700 p-3 text-left transition-shadow duration-150 hover:shadow-[var(--shadow-depth-2)]"
                >
                  <CategoryMark categoryKey={category.key} order={category.order} />
                  <span className="text-sm font-semibold text-navy-900">
                    {localize(category.name)}
                  </span>
                  <span className="text-xs text-ink-secondary">
                    {copy.statusDoesNotSupport} {categoryRecord?.doesNotSupportCount ?? 0}
                    {" · "}
                    {copy.statusInsufficient} {categoryRecord?.insufficientEvidenceCount ?? 0}
                    {" · "}
                    {copy.incompleteCountLabel} {categoryRecord?.incompleteCount ?? 0}
                  </span>
                  <span className="mt-auto pt-1 text-xs font-semibold text-brand-800">
                    {messages.drawer.openCategoryLayer} →
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
