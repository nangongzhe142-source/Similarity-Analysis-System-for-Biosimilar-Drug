/**
 * Types and status constants for the comprehensive (cross-item) evidence
 * demonstration. This module is independent of the per-method analysis
 * contract and must not be mixed with AnalysisResult verdicts.
 */
import type { CategoryKey, LocalizedText } from "@/types/models";

export const DEMO_ASSESSMENT_STATUS = {
  supportsSimilarity: "supports-similarity",
  doesNotSupportSimilarity: "does-not-support-similarity",
  insufficientEvidence: "insufficient-evidence",
  notApplicable: "not-applicable",
} as const;

export type DemoAssessmentStatus =
  (typeof DEMO_ASSESSMENT_STATUS)[keyof typeof DEMO_ASSESSMENT_STATUS];

/** Selected demo status, or unset when the user has not chosen one. */
export type DemoAssessmentStatusSelection = DemoAssessmentStatus | null;

export const OVERALL_EVIDENCE_CONCLUSION = {
  supportsSimilarityEvidence: "supports-similarity-evidence",
  doesNotSupportSimilarityEvidence: "does-not-support-similarity-evidence",
  insufficientEvidence: "insufficient-evidence",
} as const;

export type OverallEvidenceConclusion =
  (typeof OVERALL_EVIDENCE_CONCLUSION)[keyof typeof OVERALL_EVIDENCE_CONCLUSION];

export const ITEM_COMPLETION_ISSUE = {
  missingStatus: "missing-status",
  missingCandidateText: "missing-candidate-text",
  missingReferenceText: "missing-reference-text",
  missingComparisonNotes: "missing-comparison-notes",
  missingNotApplicableReason: "missing-not-applicable-reason",
} as const;

export type ItemCompletionIssue =
  (typeof ITEM_COMPLETION_ISSUE)[keyof typeof ITEM_COMPLETION_ISSUE];

export interface ProductPairInput {
  analysisName: LocalizedText;
  candidateName: LocalizedText;
  referenceName: LocalizedText;
  candidateLot: LocalizedText;
  referenceLot: LocalizedText;
  productTypeOrNotes: LocalizedText;
}

export interface ItemAssessmentEntry {
  itemId: string;
  isApplicable: boolean;
  demoStatus: DemoAssessmentStatusSelection;
  candidateDescription: LocalizedText;
  referenceDescription: LocalizedText;
  comparisonNotes: LocalizedText;
  notApplicableReason: LocalizedText;
}

export interface ComprehensiveAssessmentSession {
  productPair: ProductPairInput;
  itemEntries: Record<string, ItemAssessmentEntry>;
}

export interface ItemAggregationRecord {
  itemId: string;
  category: CategoryKey;
  isSupplementary: boolean;
  isNotApplicable: boolean;
  participatesInOverall: boolean;
  demoStatus: DemoAssessmentStatusSelection;
  completionIssues: ItemCompletionIssue[];
  isComplete: boolean;
}

export interface CategoryAggregationRecord {
  categoryKey: CategoryKey;
  itemCount: number;
  supportsCount: number;
  doesNotSupportCount: number;
  insufficientEvidenceCount: number;
  notApplicableCount: number;
  incompleteCount: number;
  unsetStatusCount: number;
  hasBlockingStatus: boolean;
}

export interface ComprehensiveAggregationResult {
  overallConclusion: OverallEvidenceConclusion;
  participatingItemCount: number;
  /** Status counts among items that participate in the overall conclusion. */
  supportsCount: number;
  doesNotSupportCount: number;
  insufficientEvidenceCount: number;
  notApplicableCount: number;
  incompleteCount: number;
  unsetStatusCount: number;
  supplementaryItemCount: number;
  /**
   * Status counts among every characterization item, including supplementary.
   * These five values must sum to `itemRecords.length`.
   */
  inventorySupportsCount: number;
  inventoryDoesNotSupportCount: number;
  inventoryInsufficientEvidenceCount: number;
  inventoryNotApplicableCount: number;
  inventoryUnsetStatusCount: number;
  /** Completed items / all characterization items, in [0, 1]. */
  dataCompletenessRatio: number;
  criticalItemIds: string[];
  itemRecords: ItemAggregationRecord[];
  categoryRecords: CategoryAggregationRecord[];
}
