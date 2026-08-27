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
import { getItemsByCategory } from "@/data/selectors";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CategoryAssessmentSection } from "@/components/comprehensive-analysis/CategoryAssessmentSection";
import { ComparisonOverview } from "@/components/comprehensive-analysis/ComparisonOverview";
import { OverallEvidencePanel } from "@/components/comprehensive-analysis/OverallEvidencePanel";
import { ProductPairForm } from "@/components/comprehensive-analysis/ProductPairForm";
import { summarizeComprehensiveAssessment } from "@/lib/comprehensive-analysis/summarize";
import type {
  ComprehensiveAssessmentSession,
  ItemAssessmentEntry,
  ProductPairInput,
} from "@/types/comprehensive-analysis";

const CATEGORY_ORDER = categories.map((category) => category.key);

export function ComprehensiveAnalysisView() {
  const { messages } = useLanguage();
  const copy = messages.comprehensiveAnalysis;
  const [session, setSession] = useState<ComprehensiveAssessmentSession>(() =>
    createIllustrativeDemoSession(),
  );
  const [sessionEpoch, setSessionEpoch] = useState(0);

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

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        entries={[
          { label: messages.itemPage.breadcrumbHome, href: "/" },
          { label: copy.pageTitle },
        ]}
      />

      <header className="surface-card flex flex-col gap-3 border-l-4 border-l-brand-700 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">{copy.pageTitle}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-secondary">
            {copy.pageDescription}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => replaceSession(createEmptyAssessmentSession())}
            className="tap-target rounded-sm border border-line bg-paper px-3 text-sm font-semibold text-navy-900 hover:bg-canvas-muted"
          >
            {copy.clearAndReenter}
          </button>
          <button
            type="button"
            onClick={() => replaceSession(createIllustrativeDemoSession())}
            className="tap-target rounded-sm bg-brand-700 px-3 text-sm font-semibold text-paper hover:bg-brand-800"
          >
            {copy.restoreDemo}
          </button>
        </div>
      </header>

      <OverallEvidencePanel productPair={session.productPair} aggregation={aggregation} />
      <ComparisonOverview productPair={session.productPair} aggregation={aggregation} />
      <ProductPairForm
        productPair={session.productPair}
        onProductPairChange={handleProductPairChange}
        onClearAndReenter={() => replaceSession(createEmptyAssessmentSession())}
        onRestoreDemo={() => replaceSession(createIllustrativeDemoSession())}
      />

      <section aria-labelledby="comprehensive-items-heading" className="flex flex-col gap-4">
        <h2 id="comprehensive-items-heading" className="text-lg font-bold text-navy-900">
          {copy.itemsSectionTitle}
        </h2>
        {categories.map((category) => {
          const categoryRecord = aggregation.categoryRecords.find(
            (record) => record.categoryKey === category.key,
          );
          return (
            <CategoryAssessmentSection
              key={`${category.key}-${sessionEpoch}`}
              category={category}
              items={getItemsByCategory(category.key)}
              session={session}
              aggregation={aggregation}
              defaultExpanded={categoryRecord?.hasBlockingStatus === true}
              onItemEntryChange={handleItemEntryChange}
            />
          );
        })}
      </section>
    </div>
  );
}
