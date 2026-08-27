/**
 * Conservative overall-evidence aggregation for the comprehensive assessment
 * demonstration. Pure: no I/O, no randomness, no weighted scores.
 */
import type { CategoryKey, CharacterizationItem, LocalizedText } from "@/types/models";
import {
  DEMO_ASSESSMENT_STATUS,
  ITEM_COMPLETION_ISSUE,
  OVERALL_EVIDENCE_CONCLUSION,
  type CategoryAggregationRecord,
  type ComprehensiveAggregationResult,
  type DemoAssessmentStatusSelection,
  type ItemAggregationRecord,
  type ItemAssessmentEntry,
  type ItemCompletionIssue,
  type OverallEvidenceConclusion,
} from "@/types/comprehensive-analysis";

export const EMPTY_LOCALIZED_TEXT: LocalizedText = { zh: "", en: "" };

export function localizedTextHasContent(text: LocalizedText): boolean {
  return text.zh.trim() !== "" || text.en.trim() !== "";
}

export function createFallbackItemEntry(itemId: string): ItemAssessmentEntry {
  return {
    itemId,
    isApplicable: true,
    demoStatus: null,
    candidateDescription: EMPTY_LOCALIZED_TEXT,
    referenceDescription: EMPTY_LOCALIZED_TEXT,
    comparisonNotes: EMPTY_LOCALIZED_TEXT,
    notApplicableReason: EMPTY_LOCALIZED_TEXT,
  };
}

export function isNotApplicableEntry(entry: ItemAssessmentEntry): boolean {
  return (
    entry.isApplicable === false ||
    entry.demoStatus === DEMO_ASSESSMENT_STATUS.notApplicable
  );
}

export function collectItemCompletionIssues(
  entry: ItemAssessmentEntry,
): ItemCompletionIssue[] {
  if (isNotApplicableEntry(entry)) {
    if (!localizedTextHasContent(entry.notApplicableReason)) {
      return [ITEM_COMPLETION_ISSUE.missingNotApplicableReason];
    }
    return [];
  }

  const issues: ItemCompletionIssue[] = [];
  if (entry.demoStatus === null) {
    issues.push(ITEM_COMPLETION_ISSUE.missingStatus);
  }
  if (!localizedTextHasContent(entry.candidateDescription)) {
    issues.push(ITEM_COMPLETION_ISSUE.missingCandidateText);
  }
  if (!localizedTextHasContent(entry.referenceDescription)) {
    issues.push(ITEM_COMPLETION_ISSUE.missingReferenceText);
  }
  if (!localizedTextHasContent(entry.comparisonNotes)) {
    issues.push(ITEM_COMPLETION_ISSUE.missingComparisonNotes);
  }
  return issues;
}

function resolveEntry(
  itemId: string,
  itemEntries: Readonly<Record<string, ItemAssessmentEntry>>,
): ItemAssessmentEntry {
  const existingEntry = itemEntries[itemId];
  return existingEntry === undefined ? createFallbackItemEntry(itemId) : existingEntry;
}

function buildItemRecord(
  item: CharacterizationItem,
  entry: ItemAssessmentEntry,
): ItemAggregationRecord {
  const isNotApplicable = isNotApplicableEntry(entry);
  const completionIssues = collectItemCompletionIssues(entry);
  return {
    itemId: item.id,
    category: item.category,
    isSupplementary: item.isSupplementary,
    isNotApplicable,
    participatesInOverall: !item.isSupplementary && !isNotApplicable,
    demoStatus: entry.demoStatus,
    completionIssues,
    isComplete: completionIssues.length === 0,
  };
}

function countByStatus(
  records: ItemAggregationRecord[],
  status: DemoAssessmentStatusSelection,
): number {
  return records.filter((record) => record.demoStatus === status).length;
}

function buildCategoryRecord(
  categoryKey: CategoryKey,
  itemRecords: ItemAggregationRecord[],
): CategoryAggregationRecord {
  const recordsInCategory = itemRecords.filter((record) => record.category === categoryKey);
  const incompleteCount = recordsInCategory.filter((record) => !record.isComplete).length;
  const unsetStatusCount = recordsInCategory.filter(
    (record) => !record.isNotApplicable && record.demoStatus === null,
  ).length;
  const doesNotSupportCount = countByStatus(
    recordsInCategory,
    DEMO_ASSESSMENT_STATUS.doesNotSupportSimilarity,
  );
  const insufficientEvidenceCount = countByStatus(
    recordsInCategory,
    DEMO_ASSESSMENT_STATUS.insufficientEvidence,
  );
  return {
    categoryKey,
    itemCount: recordsInCategory.length,
    supportsCount: countByStatus(recordsInCategory, DEMO_ASSESSMENT_STATUS.supportsSimilarity),
    doesNotSupportCount,
    insufficientEvidenceCount,
    notApplicableCount: recordsInCategory.filter((record) => record.isNotApplicable).length,
    incompleteCount,
    unsetStatusCount,
    hasBlockingStatus: doesNotSupportCount > 0 || insufficientEvidenceCount > 0,
  };
}

function resolveOverallConclusion(input: {
  participatingRecords: ItemAggregationRecord[];
  nonSupplementaryIncompleteCount: number;
}): OverallEvidenceConclusion {
  const participatingDoesNotSupportCount = countByStatus(
    input.participatingRecords,
    DEMO_ASSESSMENT_STATUS.doesNotSupportSimilarity,
  );
  if (participatingDoesNotSupportCount > 0) {
    return OVERALL_EVIDENCE_CONCLUSION.doesNotSupportSimilarityEvidence;
  }

  if (input.participatingRecords.length === 0) {
    return OVERALL_EVIDENCE_CONCLUSION.insufficientEvidence;
  }

  const participatingInsufficientCount = countByStatus(
    input.participatingRecords,
    DEMO_ASSESSMENT_STATUS.insufficientEvidence,
  );
  const participatingUnsetCount = input.participatingRecords.filter(
    (record) => record.demoStatus === null,
  ).length;
  const participatingIncompleteCount = input.participatingRecords.filter(
    (record) => !record.isComplete,
  ).length;

  if (
    participatingInsufficientCount > 0 ||
    participatingUnsetCount > 0 ||
    participatingIncompleteCount > 0 ||
    input.nonSupplementaryIncompleteCount > 0
  ) {
    return OVERALL_EVIDENCE_CONCLUSION.insufficientEvidence;
  }

  const allParticipatingSupport = input.participatingRecords.every(
    (record) => record.demoStatus === DEMO_ASSESSMENT_STATUS.supportsSimilarity,
  );
  if (allParticipatingSupport) {
    return OVERALL_EVIDENCE_CONCLUSION.supportsSimilarityEvidence;
  }

  return OVERALL_EVIDENCE_CONCLUSION.insufficientEvidence;
}

function resolveCriticalItemIds(
  overallConclusion: OverallEvidenceConclusion,
  itemRecords: ItemAggregationRecord[],
): string[] {
  if (overallConclusion === OVERALL_EVIDENCE_CONCLUSION.doesNotSupportSimilarityEvidence) {
    return itemRecords
      .filter(
        (record) =>
          record.participatesInOverall &&
          record.demoStatus === DEMO_ASSESSMENT_STATUS.doesNotSupportSimilarity,
      )
      .map((record) => record.itemId);
  }

  if (overallConclusion === OVERALL_EVIDENCE_CONCLUSION.insufficientEvidence) {
    return itemRecords
      .filter((record) => {
        if (record.isSupplementary) {
          return false;
        }
        if (record.participatesInOverall) {
          return (
            !record.isComplete ||
            record.demoStatus === null ||
            record.demoStatus === DEMO_ASSESSMENT_STATUS.insufficientEvidence
          );
        }
        return !record.isComplete;
      })
      .map((record) => record.itemId);
  }

  return [];
}

export function summarizeComprehensiveAssessment(input: {
  items: readonly CharacterizationItem[];
  itemEntries: Readonly<Record<string, ItemAssessmentEntry>>;
  categoryOrder: readonly CategoryKey[];
}): ComprehensiveAggregationResult {
  const itemRecords = input.items.map((item) =>
    buildItemRecord(item, resolveEntry(item.id, input.itemEntries)),
  );
  const participatingRecords = itemRecords.filter((record) => record.participatesInOverall);
  const nonSupplementaryRecords = itemRecords.filter((record) => !record.isSupplementary);
  const nonSupplementaryIncompleteCount = nonSupplementaryRecords.filter(
    (record) => !record.isComplete,
  ).length;
  const completeItemCount = itemRecords.filter((record) => record.isComplete).length;
  const inventoryApplicableRecords = itemRecords.filter((record) => !record.isNotApplicable);
  const overallConclusion = resolveOverallConclusion({
    participatingRecords,
    nonSupplementaryIncompleteCount,
  });

  return {
    overallConclusion,
    participatingItemCount: participatingRecords.length,
    supportsCount: countByStatus(participatingRecords, DEMO_ASSESSMENT_STATUS.supportsSimilarity),
    doesNotSupportCount: countByStatus(
      participatingRecords,
      DEMO_ASSESSMENT_STATUS.doesNotSupportSimilarity,
    ),
    insufficientEvidenceCount: countByStatus(
      participatingRecords,
      DEMO_ASSESSMENT_STATUS.insufficientEvidence,
    ),
    notApplicableCount: nonSupplementaryRecords.filter((record) => record.isNotApplicable).length,
    incompleteCount: nonSupplementaryIncompleteCount,
    unsetStatusCount: participatingRecords.filter((record) => record.demoStatus === null).length,
    supplementaryItemCount: itemRecords.filter((record) => record.isSupplementary).length,
    inventorySupportsCount: countByStatus(
      inventoryApplicableRecords,
      DEMO_ASSESSMENT_STATUS.supportsSimilarity,
    ),
    inventoryDoesNotSupportCount: countByStatus(
      inventoryApplicableRecords,
      DEMO_ASSESSMENT_STATUS.doesNotSupportSimilarity,
    ),
    inventoryInsufficientEvidenceCount: countByStatus(
      inventoryApplicableRecords,
      DEMO_ASSESSMENT_STATUS.insufficientEvidence,
    ),
    inventoryNotApplicableCount: itemRecords.filter((record) => record.isNotApplicable).length,
    inventoryUnsetStatusCount: inventoryApplicableRecords.filter(
      (record) => record.demoStatus === null,
    ).length,
    dataCompletenessRatio:
      itemRecords.length === 0 ? 0 : completeItemCount / itemRecords.length,
    criticalItemIds: resolveCriticalItemIds(overallConclusion, itemRecords),
    itemRecords,
    categoryRecords: input.categoryOrder.map((categoryKey) =>
      buildCategoryRecord(categoryKey, itemRecords),
    ),
  };
}
