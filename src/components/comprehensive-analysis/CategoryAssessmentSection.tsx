"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { CategoryMark } from "@/components/CategoryMark";
import { AssessmentStatusGlyph } from "@/components/comprehensive-analysis/AssessmentStatusGlyph";
import { ItemAssessmentCard } from "@/components/comprehensive-analysis/ItemAssessmentCard";
import { createFallbackItemEntry } from "@/lib/comprehensive-analysis/summarize";
import type { Category, CharacterizationItem } from "@/types/models";
import type {
  ComprehensiveAggregationResult,
  ComprehensiveAssessmentSession,
  ItemAssessmentEntry,
} from "@/types/comprehensive-analysis";

interface CategoryAssessmentSectionProps {
  category: Category;
  items: CharacterizationItem[];
  session: ComprehensiveAssessmentSession;
  aggregation: ComprehensiveAggregationResult;
  defaultExpanded: boolean;
  onItemEntryChange: (entry: ItemAssessmentEntry) => void;
  /** Set when this section is rendered inside a drawer layer: each item then
   *  opens its own layer instead of expanding a full card in place. */
  onOpenItemLayer?: (item: CharacterizationItem) => void;
}

export function CategoryAssessmentSection({
  category,
  items,
  session,
  aggregation,
  defaultExpanded,
  onItemEntryChange,
  onOpenItemLayer,
}: CategoryAssessmentSectionProps) {
  const { localize, messages } = useLanguage();
  const copy = messages.comprehensiveAnalysis;
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const panelId = `category-${category.key}-panel`;
  const categoryRecord = aggregation.categoryRecords.find(
    (record) => record.categoryKey === category.key,
  );

  return (
    <section
      id={`category-${category.key}`}
      tabIndex={-1}
      className="surface-card scroll-mt-24 border-l-4 border-l-brand-700 p-4 outline-none sm:p-5"
      aria-labelledby={`category-${category.key}-heading`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <CategoryMark categoryKey={category.key} order={category.order} />
            <h3
              id={`category-${category.key}-heading`}
              className="text-lg font-semibold text-navy-900"
            >
              {localize(category.name)}
            </h3>
          </div>
          <p className="mt-1 text-sm text-ink-secondary">{localize(category.description)}</p>
          <p className="mt-2 text-xs text-ink-secondary">
            {copy.statusSupports} {categoryRecord?.supportsCount ?? 0}
            {" · "}
            {copy.statusDoesNotSupport} {categoryRecord?.doesNotSupportCount ?? 0}
            {" · "}
            {copy.statusInsufficient} {categoryRecord?.insufficientEvidenceCount ?? 0}
            {" · "}
            {copy.incompleteCountLabel} {categoryRecord?.incompleteCount ?? 0}
          </p>
        </div>
        <button
          type="button"
          className="tap-target shrink-0 rounded-sm border border-line bg-paper px-3 text-sm font-semibold text-navy-900 hover:bg-canvas-muted"
          aria-expanded={isExpanded}
          aria-controls={panelId}
          onClick={() => setIsExpanded((expanded) => !expanded)}
        >
          {isExpanded ? copy.collapseCategory : copy.expandCategory}
        </button>
      </div>

      {isExpanded && (
        <div id={panelId} className="mt-4 flex flex-col gap-3">
          {items.map((item) => {
            const entry = session.itemEntries[item.id] ?? createFallbackItemEntry(item.id);
            const aggregationRecord = aggregation.itemRecords.find(
              (record) => record.itemId === item.id,
            );
            if (aggregationRecord === undefined) {
              return null;
            }
            if (onOpenItemLayer !== undefined) {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onOpenItemLayer(item)}
                  className="surface-card tap-target flex w-full items-center justify-between gap-3 p-3 text-left transition-shadow duration-150 hover:shadow-[var(--shadow-depth-2)]"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-navy-900">
                      {localize(item.itemName)}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-secondary">
                      {aggregationRecord.isComplete
                        ? copy.completenessComplete
                        : copy.completenessIncomplete}
                    </span>
                  </span>
                  <span className="shrink-0">
                    <AssessmentStatusGlyph status={entry.demoStatus} />
                  </span>
                </button>
              );
            }
            return (
              <ItemAssessmentCard
                key={item.id}
                item={item}
                entry={entry}
                aggregationRecord={aggregationRecord}
                onEntryChange={onItemEntryChange}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
