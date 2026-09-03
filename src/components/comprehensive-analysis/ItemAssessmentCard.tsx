"use client";

import { useId, useMemo, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { SupplementaryTag } from "@/components/SupplementaryTag";
import { AssessmentStatusGlyph } from "@/components/comprehensive-analysis/AssessmentStatusGlyph";
import { ItemComparisonProcess } from "@/components/comprehensive-analysis/ItemComparisonProcess";
import { buildDemoProcessViewModel } from "@/lib/comprehensive-analysis/demo-process";
import { DEMO_ASSESSMENT_STATUS } from "@/types/comprehensive-analysis";
import type {
  DemoAssessmentStatusSelection,
  ItemAggregationRecord,
  ItemAssessmentEntry,
} from "@/types/comprehensive-analysis";
import type { CharacterizationItem, LocalizedText } from "@/types/models";

interface ItemAssessmentCardProps {
  item: CharacterizationItem;
  entry: ItemAssessmentEntry;
  aggregationRecord: ItemAggregationRecord;
  onEntryChange: (entry: ItemAssessmentEntry) => void;
  /** Set when this card is rendered inside a drawer layer: the seven-step
   *  process then opens as the next layer instead of expanding in place. */
  onOpenProcessLayer?: (item: CharacterizationItem) => void;
}

const SUMMARY_MAX_LENGTH = 80;

const CONTROL_CLASS_NAME =
  "mt-1 w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink";

const DEMO_STATUS_OPTIONS: DemoAssessmentStatusSelection[] = [
  null,
  DEMO_ASSESSMENT_STATUS.supportsSimilarity,
  DEMO_ASSESSMENT_STATUS.doesNotSupportSimilarity,
  DEMO_ASSESSMENT_STATUS.insufficientEvidence,
  DEMO_ASSESSMENT_STATUS.notApplicable,
];

function updateLocalizedField(
  current: LocalizedText,
  locale: "zh" | "en",
  value: string,
): LocalizedText {
  if (locale === "zh") {
    return { zh: value, en: current.en };
  }
  return { zh: current.zh, en: value };
}

function truncateSummary(text: string, placeholder: string): string {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return placeholder;
  }
  if (trimmed.length <= SUMMARY_MAX_LENGTH) {
    return trimmed;
  }
  return `${trimmed.slice(0, SUMMARY_MAX_LENGTH)}…`;
}

export function ItemAssessmentCard({
  item,
  entry,
  aggregationRecord,
  onEntryChange,
  onOpenProcessLayer,
}: ItemAssessmentCardProps) {
  const { locale, localize, messages } = useLanguage();
  const copy = messages.comprehensiveAnalysis;
  const reactId = useId();
  const processPanelId = `${reactId}-process`;
  const [isProcessExpanded, setIsProcessExpanded] = useState(false);

  const processView = useMemo(
    () => buildDemoProcessViewModel({ item, entry, locale }),
    [item, entry, locale],
  );

  const applicabilityYesId = `item-${item.id}-applicable-yes`;
  const applicabilityNoId = `item-${item.id}-applicable-no`;
  const statusFieldId = `item-${item.id}-demo-status`;
  const candidateFieldId = `item-${item.id}-candidate`;
  const referenceFieldId = `item-${item.id}-reference`;
  const notesFieldId = `item-${item.id}-notes`;
  const reasonFieldId = `item-${item.id}-na-reason`;
  const showNotApplicableReason =
    entry.isApplicable === false ||
    entry.demoStatus === DEMO_ASSESSMENT_STATUS.notApplicable;

  const statusLabel = (status: DemoAssessmentStatusSelection): string => {
    if (status === DEMO_ASSESSMENT_STATUS.supportsSimilarity) {
      return copy.statusSupports;
    }
    if (status === DEMO_ASSESSMENT_STATUS.doesNotSupportSimilarity) {
      return copy.statusDoesNotSupport;
    }
    if (status === DEMO_ASSESSMENT_STATUS.insufficientEvidence) {
      return copy.statusInsufficient;
    }
    if (status === DEMO_ASSESSMENT_STATUS.notApplicable) {
      return copy.statusNotApplicable;
    }
    return copy.statusUnset;
  };

  return (
    <article
      id={`item-${item.id}`}
      className="surface-card scroll-mt-24 p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-base font-semibold text-navy-900">{localize(item.itemName)}</h4>
          <p className="mt-1 text-xs text-ink-secondary">{localize(item.guidelineTerm)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {item.isSupplementary && <SupplementaryTag />}
          <AssessmentStatusGlyph status={entry.demoStatus} />
        </div>
      </div>

      {item.isSupplementary && (
        <p className="mt-2 text-xs text-navy-800">{copy.supplementaryExcludedNote}</p>
      )}

      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-ink-secondary">{copy.applicabilityLabel}</dt>
          <dd className="font-medium text-ink">
            {entry.isApplicable ? copy.applicableYes : copy.applicableNo}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-secondary">{copy.completenessLabel}</dt>
          <dd className="font-medium text-ink">
            {aggregationRecord.isComplete ? copy.completenessComplete : copy.completenessIncomplete}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-secondary">{copy.candidateDataLabel}</dt>
          <dd className="break-words text-ink">
            {truncateSummary(localize(entry.candidateDescription), copy.emptyValuePlaceholder)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-secondary">{copy.referenceDataLabel}</dt>
          <dd className="break-words text-ink">
            {truncateSummary(localize(entry.referenceDescription), copy.emptyValuePlaceholder)}
          </dd>
        </div>
      </dl>

      <fieldset className="mt-4">
        <legend className="text-sm font-medium text-ink">{copy.applicabilityLabel}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          <label
            htmlFor={applicabilityYesId}
            className="tap-target inline-flex items-center gap-2 px-2 text-sm text-ink"
          >
            <input
              id={applicabilityYesId}
              type="radio"
              name={`item-${item.id}-applicable`}
              checked={entry.isApplicable}
              onChange={() =>
                onEntryChange({
                  ...entry,
                  isApplicable: true,
                  demoStatus:
                    entry.demoStatus === DEMO_ASSESSMENT_STATUS.notApplicable
                      ? null
                      : entry.demoStatus,
                })
              }
            />
            {copy.applicableYes}
          </label>
          <label
            htmlFor={applicabilityNoId}
            className="tap-target inline-flex items-center gap-2 px-2 text-sm text-ink"
          >
            <input
              id={applicabilityNoId}
              type="radio"
              name={`item-${item.id}-applicable`}
              checked={!entry.isApplicable}
              onChange={() =>
                onEntryChange({
                  ...entry,
                  isApplicable: false,
                  demoStatus: DEMO_ASSESSMENT_STATUS.notApplicable,
                })
              }
            />
            {copy.applicableNo}
          </label>
        </div>
      </fieldset>

      <div className="mt-4">
        <label htmlFor={statusFieldId} className="block text-sm font-medium text-ink">
          {copy.demoStatusLabel}
        </label>
        <select
          id={statusFieldId}
          value={entry.demoStatus ?? ""}
          onChange={(event) => {
            const nextValue = event.target.value;
            const nextStatus: DemoAssessmentStatusSelection =
              nextValue === "" ? null : (nextValue as Exclude<DemoAssessmentStatusSelection, null>);
            onEntryChange({
              ...entry,
              demoStatus: nextStatus,
              isApplicable: nextStatus !== DEMO_ASSESSMENT_STATUS.notApplicable,
            });
          }}
          className={`${CONTROL_CLASS_NAME} tap-target`}
        >
          {DEMO_STATUS_OPTIONS.map((status) => (
            <option key={status ?? "unset"} value={status ?? ""}>
              {statusLabel(status)}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div>
          <label htmlFor={candidateFieldId} className="block text-sm font-medium text-ink">
            {copy.candidateDataLabel}
          </label>
          <textarea
            id={candidateFieldId}
            value={localize(entry.candidateDescription)}
            onChange={(event) =>
              onEntryChange({
                ...entry,
                candidateDescription: updateLocalizedField(
                  entry.candidateDescription,
                  locale,
                  event.target.value,
                ),
              })
            }
            rows={4}
            className={CONTROL_CLASS_NAME}
          />
        </div>
        <div>
          <label htmlFor={referenceFieldId} className="block text-sm font-medium text-ink">
            {copy.referenceDataLabel}
          </label>
          <textarea
            id={referenceFieldId}
            value={localize(entry.referenceDescription)}
            onChange={(event) =>
              onEntryChange({
                ...entry,
                referenceDescription: updateLocalizedField(
                  entry.referenceDescription,
                  locale,
                  event.target.value,
                ),
              })
            }
            rows={4}
            className={CONTROL_CLASS_NAME}
          />
        </div>
      </div>

      <div className="mt-3">
        <label htmlFor={notesFieldId} className="block text-sm font-medium text-ink">
          {copy.comparisonNotesLabel}
        </label>
        <textarea
          id={notesFieldId}
          value={localize(entry.comparisonNotes)}
          onChange={(event) =>
            onEntryChange({
              ...entry,
              comparisonNotes: updateLocalizedField(
                entry.comparisonNotes,
                locale,
                event.target.value,
              ),
            })
          }
          rows={3}
          className={CONTROL_CLASS_NAME}
        />
      </div>

      {showNotApplicableReason && (
        <div className="mt-3">
          <label htmlFor={reasonFieldId} className="block text-sm font-medium text-ink">
            {copy.notApplicableReasonLabel}
          </label>
          <p className="mt-1 text-xs text-navy-800">{copy.notApplicableReasonRequired}</p>
          <textarea
            id={reasonFieldId}
            required
            value={localize(entry.notApplicableReason)}
            onChange={(event) =>
              onEntryChange({
                ...entry,
                notApplicableReason: updateLocalizedField(
                  entry.notApplicableReason,
                  locale,
                  event.target.value,
                ),
              })
            }
            rows={3}
            className={CONTROL_CLASS_NAME}
          />
        </div>
      )}

      {onOpenProcessLayer !== undefined ? (
        <button
          type="button"
          className="tap-target mt-4 rounded-sm border border-line bg-paper px-3 text-sm font-semibold text-navy-900 hover:bg-canvas-muted"
          onClick={() => onOpenProcessLayer(item)}
        >
          {copy.expandProcess} →
        </button>
      ) : (
        <>
          <button
            type="button"
            className="tap-target mt-4 rounded-sm px-1 text-sm font-semibold text-brand-800 underline-offset-2 hover:underline"
            aria-expanded={isProcessExpanded}
            aria-controls={processPanelId}
            onClick={() => setIsProcessExpanded((expanded) => !expanded)}
          >
            {isProcessExpanded ? copy.collapseProcess : copy.expandProcess}
          </button>
          {isProcessExpanded && (
            <div id={processPanelId}>
              <ItemComparisonProcess item={item} entry={entry} processView={processView} />
            </div>
          )}
        </>
      )}
    </article>
  );
}
