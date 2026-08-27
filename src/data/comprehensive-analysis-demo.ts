/**
 * Illustrative / demo session for the comprehensive assessment page.
 * Not measured data, not a regulatory case, and not an AnalysisResult.
 */
import { characterizationItems } from "@/data/characterization-items";
import { DEMO_ASSESSMENT_STATUS } from "@/types/comprehensive-analysis";
import type {
  ComprehensiveAssessmentSession,
  ItemAssessmentEntry,
  ProductPairInput,
} from "@/types/comprehensive-analysis";
import type { LocalizedText } from "@/types/models";
import { EMPTY_LOCALIZED_TEXT } from "@/lib/comprehensive-analysis/summarize";

export const ILLUSTRATIVE_DEMO_ITEM_ID = {
  doesNotSupport: "sialic-acid-ngna",
  insufficientEvidence: "other-higher-order-structure-methods",
  notApplicable: "cdc",
  supplementaryDoesNotSupport: "core-fucosylation",
} as const;

const EMPTY_PRODUCT_PAIR: ProductPairInput = {
  analysisName: EMPTY_LOCALIZED_TEXT,
  candidateName: EMPTY_LOCALIZED_TEXT,
  referenceName: EMPTY_LOCALIZED_TEXT,
  candidateLot: EMPTY_LOCALIZED_TEXT,
  referenceLot: EMPTY_LOCALIZED_TEXT,
  productTypeOrNotes: EMPTY_LOCALIZED_TEXT,
};

const ILLUSTRATIVE_PRODUCT_PAIR: ProductPairInput = {
  analysisName: {
    zh: "示意性分析 · 综合证据演示（非申报）",
    en: "Illustrative analysis · integrated evidence demo (non-filing)",
  },
  candidateName: {
    zh: "示意候选药 mAb-X（illustrative）",
    en: "Illustrative candidate mAb-X",
  },
  referenceName: {
    zh: "示意参照药 mAb-R（illustrative）",
    en: "Illustrative reference mAb-R",
  },
  candidateLot: {
    zh: "DEMO-C-001",
    en: "DEMO-C-001",
  },
  referenceLot: {
    zh: "DEMO-R-001",
    en: "DEMO-R-001",
  },
  productTypeOrNotes: {
    zh: "单克隆抗体示意品种。本页数据为 illustrative/demo，非正式实验、不来自审评报告。",
    en: "Illustrative monoclonal-antibody product. Entries are illustrative/demo, not measured experiments and not from a review report.",
  },
};

function cloneLocalizedText(text: LocalizedText): LocalizedText {
  return { zh: text.zh, en: text.en };
}

function cloneProductPair(productPair: ProductPairInput): ProductPairInput {
  return {
    analysisName: cloneLocalizedText(productPair.analysisName),
    candidateName: cloneLocalizedText(productPair.candidateName),
    referenceName: cloneLocalizedText(productPair.referenceName),
    candidateLot: cloneLocalizedText(productPair.candidateLot),
    referenceLot: cloneLocalizedText(productPair.referenceLot),
    productTypeOrNotes: cloneLocalizedText(productPair.productTypeOrNotes),
  };
}

function cloneItemEntry(entry: ItemAssessmentEntry): ItemAssessmentEntry {
  return {
    itemId: entry.itemId,
    isApplicable: entry.isApplicable,
    demoStatus: entry.demoStatus,
    candidateDescription: cloneLocalizedText(entry.candidateDescription),
    referenceDescription: cloneLocalizedText(entry.referenceDescription),
    comparisonNotes: cloneLocalizedText(entry.comparisonNotes),
    notApplicableReason: cloneLocalizedText(entry.notApplicableReason),
  };
}

export function cloneAssessmentSession(
  session: ComprehensiveAssessmentSession,
): ComprehensiveAssessmentSession {
  const itemEntries: Record<string, ItemAssessmentEntry> = {};
  for (const [itemId, entry] of Object.entries(session.itemEntries)) {
    itemEntries[itemId] = cloneItemEntry(entry);
  }
  return {
    productPair: cloneProductPair(session.productPair),
    itemEntries,
  };
}

function supportingEntry(itemId: string, itemName: LocalizedText): ItemAssessmentEntry {
  return {
    itemId,
    isApplicable: true,
    demoStatus: DEMO_ASSESSMENT_STATUS.supportsSimilarity,
    candidateDescription: {
      zh: `【示意/演示】候选药在「${itemName.zh}」项的描述性说明。非正式测定值，不代表真实批放行数据。`,
      en: `[Illustrative/demo] Descriptive note for the candidate on “${itemName.en}”. Not a measured value and not batch-release data.`,
    },
    referenceDescription: {
      zh: `【示意/演示】参照药在「${itemName.zh}」项的描述性说明。非正式测定值。`,
      en: `[Illustrative/demo] Descriptive note for the reference product on “${itemName.en}”. Not a measured value.`,
    },
    comparisonNotes: {
      zh: "【示意/演示】演示状态由选择器设为「支持相似」。自由文本仅供展示，未做关键词推断。",
      en: "[Illustrative/demo] Demo status is set to “supports similarity” by the selector. Free text is display-only and is not keyword-inferred.",
    },
    notApplicableReason: EMPTY_LOCALIZED_TEXT,
  };
}

function overlayDoesNotSupport(itemName: LocalizedText): ItemAssessmentEntry {
  return {
    itemId: ILLUSTRATIVE_DEMO_ITEM_ID.doesNotSupport,
    isApplicable: true,
    demoStatus: DEMO_ASSESSMENT_STATUS.doesNotSupportSimilarity,
    candidateDescription: {
      zh: `【示意/演示】「${itemName.zh}」项被演示选择器标为不支持相似。此句不是实测 NGNA 含量。`,
      en: `[Illustrative/demo] “${itemName.en}” is marked as not supporting similarity by the demo selector. This is not a measured NGNA level.`,
    },
    referenceDescription: {
      zh: `【示意/演示】参照药「${itemName.zh}」项的占位描述。非正式测定值。`,
      en: `[Illustrative/demo] Placeholder description for the reference product on “${itemName.en}”. Not a measured value.`,
    },
    comparisonNotes: {
      zh: "【示意/演示】用于展示保守汇总：任一适用非补充项为「不支持相似」时，总体结论不得为支持。",
      en: "[Illustrative/demo] Shows the conservative rule: any applicable non-supplementary “does not support” item blocks an overall supportive conclusion.",
    },
    notApplicableReason: EMPTY_LOCALIZED_TEXT,
  };
}

function overlayInsufficient(itemName: LocalizedText): ItemAssessmentEntry {
  return {
    itemId: ILLUSTRATIVE_DEMO_ITEM_ID.insufficientEvidence,
    isApplicable: true,
    demoStatus: DEMO_ASSESSMENT_STATUS.insufficientEvidence,
    candidateDescription: {
      zh: `【示意/演示】「${itemName.zh}」项仅有不完整示意描述，演示状态为证据不足。`,
      en: `[Illustrative/demo] “${itemName.en}” has only an incomplete schematic description; demo status is insufficient evidence.`,
    },
    referenceDescription: {
      zh: `【示意/演示】参照药「${itemName.zh}」项占位描述。非正式测定值。`,
      en: `[Illustrative/demo] Placeholder description for the reference product on “${itemName.en}”. Not a measured value.`,
    },
    comparisonNotes: {
      zh: "【示意/演示】该项未接入真实高级结构计算；状态由选择器明示为证据不足。",
      en: "[Illustrative/demo] No real higher-order-structure computation is connected; the selector explicitly marks insufficient evidence.",
    },
    notApplicableReason: EMPTY_LOCALIZED_TEXT,
  };
}

function overlayNotApplicable(itemName: LocalizedText): ItemAssessmentEntry {
  return {
    itemId: ILLUSTRATIVE_DEMO_ITEM_ID.notApplicable,
    isApplicable: false,
    demoStatus: DEMO_ASSESSMENT_STATUS.notApplicable,
    candidateDescription: EMPTY_LOCALIZED_TEXT,
    referenceDescription: EMPTY_LOCALIZED_TEXT,
    comparisonNotes: EMPTY_LOCALIZED_TEXT,
    notApplicableReason: {
      zh: `【示意/演示】本示意品种未将「${itemName.zh}」列为适用项（例如作用机制不依赖该读出）。`,
      en: `[Illustrative/demo] This illustrative product does not treat “${itemName.en}” as applicable (for example if the mechanism does not rely on this readout).`,
    },
  };
}

function overlaySupplementaryDoesNotSupport(itemName: LocalizedText): ItemAssessmentEntry {
  return {
    itemId: ILLUSTRATIVE_DEMO_ITEM_ID.supplementaryDoesNotSupport,
    isApplicable: true,
    demoStatus: DEMO_ASSESSMENT_STATUS.doesNotSupportSimilarity,
    candidateDescription: {
      zh: `【示意/演示】补充项「${itemName.zh}」被标为不支持相似，但补充项不进入总体结论分母。`,
      en: `[Illustrative/demo] Supplementary item “${itemName.en}” is marked as not supporting similarity, but supplementary items are excluded from the overall denominator.`,
    },
    referenceDescription: {
      zh: `【示意/演示】参照药补充项「${itemName.zh}」占位描述。非正式测定值。`,
      en: `[Illustrative/demo] Placeholder for the reference product on supplementary item “${itemName.en}”. Not a measured value.`,
    },
    comparisonNotes: {
      zh: "【示意/演示】用于展示：补充项即使为「不支持相似」也不单独决定总体结论。",
      en: "[Illustrative/demo] Shows that a supplementary “does not support” item does not by itself decide the overall conclusion.",
    },
    notApplicableReason: EMPTY_LOCALIZED_TEXT,
  };
}

function buildEntryForItem(item: (typeof characterizationItems)[number]): ItemAssessmentEntry {
  if (item.id === ILLUSTRATIVE_DEMO_ITEM_ID.doesNotSupport) {
    return overlayDoesNotSupport(item.itemName);
  }
  if (item.id === ILLUSTRATIVE_DEMO_ITEM_ID.insufficientEvidence) {
    return overlayInsufficient(item.itemName);
  }
  if (item.id === ILLUSTRATIVE_DEMO_ITEM_ID.notApplicable) {
    return overlayNotApplicable(item.itemName);
  }
  if (item.id === ILLUSTRATIVE_DEMO_ITEM_ID.supplementaryDoesNotSupport) {
    return overlaySupplementaryDoesNotSupport(item.itemName);
  }
  return supportingEntry(item.id, item.itemName);
}

export function createEmptyAssessmentSession(): ComprehensiveAssessmentSession {
  const itemEntries: Record<string, ItemAssessmentEntry> = {};
  for (const item of characterizationItems) {
    itemEntries[item.id] = {
      itemId: item.id,
      isApplicable: true,
      demoStatus: null,
      candidateDescription: EMPTY_LOCALIZED_TEXT,
      referenceDescription: EMPTY_LOCALIZED_TEXT,
      comparisonNotes: EMPTY_LOCALIZED_TEXT,
      notApplicableReason: EMPTY_LOCALIZED_TEXT,
    };
  }
  return {
    productPair: cloneProductPair(EMPTY_PRODUCT_PAIR),
    itemEntries,
  };
}

export function createIllustrativeDemoSession(): ComprehensiveAssessmentSession {
  const itemEntries: Record<string, ItemAssessmentEntry> = {};
  for (const item of characterizationItems) {
    itemEntries[item.id] = buildEntryForItem(item);
  }
  return {
    productPair: cloneProductPair(ILLUSTRATIVE_PRODUCT_PAIR),
    itemEntries,
  };
}
