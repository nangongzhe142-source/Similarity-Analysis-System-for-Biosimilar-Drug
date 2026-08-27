"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { categories } from "@/data/categories";
import { AssessmentStatusGlyph } from "@/components/comprehensive-analysis/AssessmentStatusGlyph";
import { CategoryMark } from "@/components/CategoryMark";
import { DEMO_ASSESSMENT_STATUS } from "@/types/comprehensive-analysis";
import type {
  ComprehensiveAggregationResult,
  ProductPairInput,
} from "@/types/comprehensive-analysis";

interface ComparisonOverviewProps {
  productPair: ProductPairInput;
  aggregation: ComprehensiveAggregationResult;
}

function CountMeter({
  label,
  value,
  total,
  barClassName,
}: {
  label: string;
  value: number;
  total: number;
  barClassName: string;
}) {
  const widthPercent = total <= 0 ? 0 : Math.min(100, Math.round((value / total) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="text-ink-secondary">{label}</span>
        <span className="font-mono font-semibold text-navy-900">{value}</span>
      </div>
      <div
        className="mt-1 h-2 overflow-hidden rounded-full bg-canvas-muted"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={value}
      >
        <div className={`h-full rounded-full ${barClassName}`} style={{ width: `${widthPercent}%` }} />
      </div>
    </div>
  );
}

export function ComparisonOverview({ productPair, aggregation }: ComparisonOverviewProps) {
  const { localize, messages } = useLanguage();
  const copy = messages.comprehensiveAnalysis;
  const placeholder = copy.emptyValuePlaceholder;
  const totalItemCount = aggregation.itemRecords.length;
  const completedItemCount = aggregation.itemRecords.filter((record) => record.isComplete).length;
  const completedWidthPercent =
    totalItemCount <= 0 ? 0 : Math.round((completedItemCount / totalItemCount) * 100);

  const scrollToCategory = (categoryKey: string) => {
    const target = document.getElementById(`category-${categoryKey}`);
    if (target !== null) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.focus();
    }
  };

  return (
    <section
      aria-labelledby="comparison-overview-heading"
      className="surface-card p-5"
    >
      <h2 id="comparison-overview-heading" className="text-lg font-semibold text-navy-900">
        {copy.overviewTitle}
      </h2>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-line bg-canvas-muted p-4">
          <h3 className="text-sm font-semibold text-navy-900">{copy.productPairOverviewTitle}</h3>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-line bg-paper p-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
                {copy.candidateNameLabel}
              </dt>
              <dd className="mt-1 text-sm font-medium text-ink">
                {localize(productPair.candidateName).trim() || placeholder}
              </dd>
              <dt className="mt-2 text-xs text-ink-secondary">{copy.candidateLotLabel}</dt>
              <dd className="text-sm text-ink">
                {localize(productPair.candidateLot).trim() || placeholder}
              </dd>
            </div>
            <div className="rounded-md border border-line bg-paper p-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
                {copy.referenceNameLabel}
              </dt>
              <dd className="mt-1 text-sm font-medium text-ink">
                {localize(productPair.referenceName).trim() || placeholder}
              </dd>
              <dt className="mt-2 text-xs text-ink-secondary">{copy.referenceLotLabel}</dt>
              <dd className="text-sm text-ink">
                {localize(productPair.referenceLot).trim() || placeholder}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col gap-3 rounded-md border border-line bg-canvas-muted p-4">
          <p className="text-xs leading-relaxed text-ink-secondary">{copy.statusInventoryNote}</p>
          <CountMeter
            label={copy.supportsCountLabel}
            value={aggregation.inventorySupportsCount}
            total={Math.max(totalItemCount, 1)}
            barClassName="bg-brand-700"
          />
          <CountMeter
            label={copy.doesNotSupportCountLabel}
            value={aggregation.inventoryDoesNotSupportCount}
            total={Math.max(totalItemCount, 1)}
            barClassName="bg-signal-red"
          />
          <CountMeter
            label={copy.insufficientCountLabel}
            value={aggregation.inventoryInsufficientEvidenceCount}
            total={Math.max(totalItemCount, 1)}
            barClassName="bg-navy-800"
          />
          <CountMeter
            label={copy.notApplicableCountLabel}
            value={aggregation.inventoryNotApplicableCount}
            total={Math.max(totalItemCount, 1)}
            barClassName="bg-ink-secondary"
          />
          <CountMeter
            label={copy.statusUnset}
            value={aggregation.inventoryUnsetStatusCount}
            total={Math.max(totalItemCount, 1)}
            barClassName="bg-line-strong"
          />
          <p className="text-sm font-medium text-ink">
            {copy.statusSumLabel}：
            {aggregation.inventorySupportsCount +
              aggregation.inventoryDoesNotSupportCount +
              aggregation.inventoryInsufficientEvidenceCount +
              aggregation.inventoryNotApplicableCount +
              aggregation.inventoryUnsetStatusCount}
            /{totalItemCount}
          </p>
          <div>
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="text-ink-secondary">{copy.completedRatioLabel}</span>
              <span className="font-mono font-semibold text-navy-900">
                {completedItemCount}/{totalItemCount} ({completedWidthPercent}%)
              </span>
            </div>
            <div
              className="mt-1 h-2 overflow-hidden rounded-full bg-paper"
              role="meter"
              aria-label={copy.completedRatioLabel}
              aria-valuemin={0}
              aria-valuemax={totalItemCount}
              aria-valuenow={completedItemCount}
            >
              <div
                className="h-full rounded-full bg-brand-700"
                style={{ width: `${completedWidthPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <h3 className="mt-6 text-sm font-semibold text-navy-900">{copy.categoryOverviewTitle}</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => {
          const record = aggregation.categoryRecords.find(
            (categoryRecord) => categoryRecord.categoryKey === category.key,
          );
          const supportsCount = record?.supportsCount ?? 0;
          const doesNotSupportCount = record?.doesNotSupportCount ?? 0;
          const insufficientEvidenceCount = record?.insufficientEvidenceCount ?? 0;
          const incompleteCount = record?.incompleteCount ?? 0;
          return (
            <button
              key={category.key}
              type="button"
              onClick={() => scrollToCategory(category.key)}
              className="surface-card border-l-4 border-l-brand-700 p-3 text-left transition-shadow duration-150 hover:shadow-[var(--shadow-raised)]"
            >
              <span className="sr-only">{copy.jumpToCategory}</span>
              <div className="flex items-start justify-between gap-2">
                <CategoryMark categoryKey={category.key} order={category.order} />
                <span className="shrink-0 rounded-sm bg-canvas-muted px-2 py-1 text-xs font-semibold text-navy-900">
                  {record?.itemCount ?? 0} {messages.home.itemCountSuffix}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-navy-900">{localize(category.name)}</p>
              <ul className="mt-2 flex flex-col gap-1 text-xs text-ink">
                <li className="flex items-center justify-between gap-2">
                  <AssessmentStatusGlyph status={DEMO_ASSESSMENT_STATUS.supportsSimilarity} />
                  <span className="font-mono font-semibold">{supportsCount}</span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <AssessmentStatusGlyph status={DEMO_ASSESSMENT_STATUS.doesNotSupportSimilarity} />
                  <span className="font-mono font-semibold">{doesNotSupportCount}</span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <AssessmentStatusGlyph status={DEMO_ASSESSMENT_STATUS.insufficientEvidence} />
                  <span className="font-mono font-semibold">{insufficientEvidenceCount}</span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span>{copy.incompleteCountLabel}</span>
                  <span className="font-mono font-semibold">{incompleteCount}</span>
                </li>
              </ul>
            </button>
          );
        })}
      </div>
    </section>
  );
}
