"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { getItemById } from "@/data/selectors";
import { AssessmentStatusGlyph } from "@/components/comprehensive-analysis/AssessmentStatusGlyph";
import {
  DEMO_ASSESSMENT_STATUS,
  OVERALL_EVIDENCE_CONCLUSION,
} from "@/types/comprehensive-analysis";
import type {
  ComprehensiveAggregationResult,
  ProductPairInput,
} from "@/types/comprehensive-analysis";

interface OverallEvidencePanelProps {
  productPair: ProductPairInput;
  aggregation: ComprehensiveAggregationResult;
  /** Opens the item assessment layer for a critical item. */
  onCriticalItemSelect: (itemId: string) => void;
}

function overallStatusSelection(
  conclusion: ComprehensiveAggregationResult["overallConclusion"],
) {
  if (conclusion === OVERALL_EVIDENCE_CONCLUSION.supportsSimilarityEvidence) {
    return DEMO_ASSESSMENT_STATUS.supportsSimilarity;
  }
  if (conclusion === OVERALL_EVIDENCE_CONCLUSION.doesNotSupportSimilarityEvidence) {
    return DEMO_ASSESSMENT_STATUS.doesNotSupportSimilarity;
  }
  return DEMO_ASSESSMENT_STATUS.insufficientEvidence;
}

function formatCompletenessPercent(ratio: number): string {
  if (!Number.isFinite(ratio) || ratio < 0) {
    return "0%";
  }
  const boundedRatio = Math.min(1, ratio);
  return `${Math.round(boundedRatio * 100)}%`;
}

export function OverallEvidencePanel({
  productPair,
  aggregation,
  onCriticalItemSelect,
}: OverallEvidencePanelProps) {
  const { localize, messages } = useLanguage();
  const copy = messages.comprehensiveAnalysis;
  const placeholder = copy.emptyValuePlaceholder;
  const candidateName = localize(productPair.candidateName).trim() || placeholder;
  const referenceName = localize(productPair.referenceName).trim() || placeholder;

  const rationale =
    aggregation.overallConclusion ===
    OVERALL_EVIDENCE_CONCLUSION.doesNotSupportSimilarityEvidence
      ? copy.rationaleDoesNotSupport
      : aggregation.overallConclusion ===
          OVERALL_EVIDENCE_CONCLUSION.supportsSimilarityEvidence
        ? copy.rationaleSupports
        : aggregation.participatingItemCount === 0
          ? copy.rationaleNoApplicableItems
          : copy.rationaleInsufficient;

  const countItems: Array<{ key: string; label: string; value: number }> = [
    { key: "all", label: messages.home.statsItems, value: aggregation.itemRecords.length },
    { key: "participating", label: copy.participatingCountLabel, value: aggregation.participatingItemCount },
    { key: "supports", label: copy.supportsCountLabel, value: aggregation.inventorySupportsCount },
    { key: "does-not-support", label: copy.doesNotSupportCountLabel, value: aggregation.inventoryDoesNotSupportCount },
    { key: "insufficient", label: copy.insufficientCountLabel, value: aggregation.inventoryInsufficientEvidenceCount },
    { key: "not-applicable", label: copy.notApplicableCountLabel, value: aggregation.inventoryNotApplicableCount },
  ];

  return (
    <section
      aria-labelledby="overall-evidence-conclusion-heading"
      className="glass-surface glass-edge relative border-l-4 border-l-brand-700 p-5 sm:p-6"
    >
      <div className="relative z-[1] flex flex-wrap items-center gap-2">
        <span className="rounded-sm border border-navy-800 bg-canvas-muted px-2 py-0.5 text-xs font-semibold text-navy-900">
          {copy.demoDataBadge}
        </span>
        <span className="rounded-sm border border-line bg-paper px-2 py-0.5 text-xs font-semibold text-ink">
          {copy.demoFlowBadge}
        </span>
        <span className="rounded-sm border border-line bg-paper px-2 py-0.5 text-xs font-semibold text-ink">
          {copy.notForRegulatoryJudgement}
        </span>
        {/* Data-nature statement, not a disclaimer: it says this page is
            preloaded with labelled illustrative/demo data. */}
        <span className="rounded-sm border border-cyan-700 bg-cyan-100 px-2 py-0.5 text-xs font-semibold text-cyan-800">
          {copy.demoUseBanner}
        </span>
      </div>

      <h2
        id="overall-evidence-conclusion-heading"
        className="mt-4 text-sm font-semibold uppercase tracking-wide text-ink-secondary"
      >
        {copy.overallConclusionTitle}
      </h2>
      <div className="mt-2 rounded-md border border-line bg-paper/70 px-4 py-3">
        <AssessmentStatusGlyph
          status={overallStatusSelection(aggregation.overallConclusion)}
          size="lg"
          emphasis
          label={
            aggregation.overallConclusion ===
            OVERALL_EVIDENCE_CONCLUSION.supportsSimilarityEvidence
              ? copy.conclusionSupports
              : aggregation.overallConclusion ===
                  OVERALL_EVIDENCE_CONCLUSION.doesNotSupportSimilarityEvidence
                ? copy.conclusionDoesNotSupport
                : copy.conclusionInsufficient
          }
        />
      </div>

      <p className="mt-3 text-sm text-ink">
        <span className="font-medium">{copy.candidateNameLabel}：</span>
        {candidateName}
        <span className="mx-2 text-line-strong">|</span>
        <span className="font-medium">{copy.referenceNameLabel}：</span>
        {referenceName}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{rationale}</p>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {countItems.map((countItem) => (
          <div key={countItem.key} className="metric-card px-3 py-2">
            <dt className="text-xs text-ink-secondary">{countItem.label}</dt>
            <dd className="mt-1 font-mono text-lg font-bold text-navy-900">{countItem.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-sm text-ink">
        <span className="font-medium">{copy.completenessLabel}：</span>
        {formatCompletenessPercent(aggregation.dataCompletenessRatio)}
      </p>

      <div className="mt-4">
        <h3 className="text-sm font-semibold text-navy-900">{copy.criticalItemsTitle}</h3>
        {aggregation.criticalItemIds.length === 0 ? (
          <p className="mt-1 text-sm text-ink-secondary">{copy.noCriticalItems}</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1">
            {aggregation.criticalItemIds.map((itemId) => {
              const item = getItemById(itemId);
              const itemLabel = item === undefined ? itemId : localize(item.itemName);
              return (
                <li key={itemId}>
                  <button
                    type="button"
                    onClick={() => onCriticalItemSelect(itemId)}
                    className="tap-target text-left text-sm font-semibold text-brand-800 underline-offset-2 hover:underline"
                  >
                    {itemLabel}
                    <span className="sr-only"> — {copy.jumpToItem}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
