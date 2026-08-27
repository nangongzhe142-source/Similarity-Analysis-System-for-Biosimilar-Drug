/**
 * Deterministic illustrative process view for a single characterization item.
 * Same inputs always produce the same view model. This is not a real
 * analytical algorithm and must not be presented as one.
 */
import type { CharacterizationItem, LocalizedText } from "@/types/models";
import {
  DEMO_ASSESSMENT_STATUS,
  type ItemAssessmentEntry,
} from "@/types/comprehensive-analysis";
import { localizedTextHasContent } from "@/lib/comprehensive-analysis/summarize";

export const COMPARISON_PROCESS_STEP_ID = {
  inputData: "input-data",
  normalization: "normalization",
  sideBySide: "side-by-side",
  differenceIdentification: "difference-identification",
  judgingPrinciple: "judging-principle",
  itemConclusion: "item-conclusion",
  provenanceLimits: "provenance-limits",
} as const;

export type ComparisonProcessStepId =
  (typeof COMPARISON_PROCESS_STEP_ID)[keyof typeof COMPARISON_PROCESS_STEP_ID];

export const COMPARISON_PROCESS_STEP_IDS: readonly ComparisonProcessStepId[] = [
  COMPARISON_PROCESS_STEP_ID.inputData,
  COMPARISON_PROCESS_STEP_ID.normalization,
  COMPARISON_PROCESS_STEP_ID.sideBySide,
  COMPARISON_PROCESS_STEP_ID.differenceIdentification,
  COMPARISON_PROCESS_STEP_ID.judgingPrinciple,
  COMPARISON_PROCESS_STEP_ID.itemConclusion,
  COMPARISON_PROCESS_STEP_ID.provenanceLimits,
];

export const SCHEMATIC_POINT_COUNT = 8;
const SCHEMATIC_HEIGHT_FLOOR = 24;
const SCHEMATIC_HEIGHT_SPAN = 64;
const SCHEMATIC_OFFSET_STEP = 17;
const SCHEMATIC_DIVERGENCE_SHIFT = 18;

export const SCHEMATIC_ALIGNMENT = {
  aligned: "aligned",
  offset: "offset",
  incomplete: "incomplete",
  notApplicable: "not-applicable",
} as const;

export type SchematicAlignment =
  (typeof SCHEMATIC_ALIGNMENT)[keyof typeof SCHEMATIC_ALIGNMENT];

export interface SchematicBarPoint {
  pointId: string;
  referenceHeight: number;
  candidateHeight: number;
}

export interface DemoProcessViewModel {
  itemId: string;
  isRealComputationConnected: false;
  processKind: "illustrative-demo";
  normalizedCandidate: string;
  normalizedReference: string;
  candidateCharacterCount: number;
  referenceCharacterCount: number;
  textsAreIdentical: boolean;
  firstCodePointDifferenceIndex: number | null;
  schematicAlignment: SchematicAlignment;
  schematicBars: SchematicBarPoint[];
}

export function normalizeDemoDisplayText(text: LocalizedText, locale: "zh" | "en"): string {
  const resolved = locale === "zh" ? text.zh : text.en;
  const source = resolved.trim() !== "" ? resolved : text.zh;
  return source.replace(/\s+/g, " ").trim();
}

function resolveSchematicAlignment(
  entry: ItemAssessmentEntry,
): SchematicAlignment {
  if (
    entry.isApplicable === false ||
    entry.demoStatus === DEMO_ASSESSMENT_STATUS.notApplicable
  ) {
    return SCHEMATIC_ALIGNMENT.notApplicable;
  }
  if (entry.demoStatus === DEMO_ASSESSMENT_STATUS.supportsSimilarity) {
    return SCHEMATIC_ALIGNMENT.aligned;
  }
  if (entry.demoStatus === DEMO_ASSESSMENT_STATUS.doesNotSupportSimilarity) {
    return SCHEMATIC_ALIGNMENT.offset;
  }
  return SCHEMATIC_ALIGNMENT.incomplete;
}

function schematicBaseHeights(itemId: string): number[] {
  const heights: number[] = [];
  const source = itemId.length > 0 ? itemId : "item";
  for (let pointIndex = 0; pointIndex < SCHEMATIC_POINT_COUNT; pointIndex += 1) {
    const code = source.charCodeAt(pointIndex % source.length) + pointIndex * SCHEMATIC_OFFSET_STEP;
    heights.push(SCHEMATIC_HEIGHT_FLOOR + (code % SCHEMATIC_HEIGHT_SPAN));
  }
  return heights;
}

function buildSchematicBars(
  itemId: string,
  alignment: SchematicAlignment,
): SchematicBarPoint[] {
  const referenceHeights = schematicBaseHeights(itemId);
  return referenceHeights.map((referenceHeight, pointIndex) => {
    let candidateHeight = referenceHeight;
    if (alignment === SCHEMATIC_ALIGNMENT.offset) {
      candidateHeight = Math.min(
        SCHEMATIC_HEIGHT_FLOOR + SCHEMATIC_HEIGHT_SPAN,
        referenceHeight + SCHEMATIC_DIVERGENCE_SHIFT,
      );
    } else if (alignment === SCHEMATIC_ALIGNMENT.incomplete && pointIndex % 2 === 1) {
      candidateHeight = 0;
    } else if (alignment === SCHEMATIC_ALIGNMENT.notApplicable) {
      candidateHeight = SCHEMATIC_HEIGHT_FLOOR;
    }
    return {
      pointId: `${itemId}-schematic-${pointIndex}`,
      referenceHeight,
      candidateHeight,
    };
  });
}

function firstDifferingCodePointIndex(
  candidateText: string,
  referenceText: string,
): number | null {
  const maxLength = Math.max(candidateText.length, referenceText.length);
  for (let index = 0; index < maxLength; index += 1) {
    if (candidateText[index] !== referenceText[index]) {
      return index;
    }
  }
  return null;
}

export function buildDemoProcessViewModel(input: {
  item: CharacterizationItem;
  entry: ItemAssessmentEntry;
  locale: "zh" | "en";
}): DemoProcessViewModel {
  const normalizedCandidate = normalizeDemoDisplayText(
    input.entry.candidateDescription,
    input.locale,
  );
  const normalizedReference = normalizeDemoDisplayText(
    input.entry.referenceDescription,
    input.locale,
  );
  const schematicAlignment = resolveSchematicAlignment(input.entry);

  return {
    itemId: input.item.id,
    isRealComputationConnected: false,
    processKind: "illustrative-demo",
    normalizedCandidate,
    normalizedReference,
    candidateCharacterCount: normalizedCandidate.length,
    referenceCharacterCount: normalizedReference.length,
    textsAreIdentical: normalizedCandidate === normalizedReference,
    firstCodePointDifferenceIndex: firstDifferingCodePointIndex(
      normalizedCandidate,
      normalizedReference,
    ),
    schematicAlignment,
    schematicBars: buildSchematicBars(input.item.id, schematicAlignment),
  };
}

export function itemHasDisplayableText(entry: ItemAssessmentEntry): boolean {
  return (
    localizedTextHasContent(entry.candidateDescription) ||
    localizedTextHasContent(entry.referenceDescription) ||
    localizedTextHasContent(entry.comparisonNotes)
  );
}
