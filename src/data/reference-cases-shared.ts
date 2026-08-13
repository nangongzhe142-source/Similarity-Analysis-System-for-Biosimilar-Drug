/**
 * Shared helpers for GP2015 reference-case data files.
 */
import type {
  ReferenceCaseSource,
  ReferenceCaseVerification,
} from "@/types/models";

export const TRANSCRIBED_BY = "AI 抄录（未经人工复核）";
export const TRANSCRIBED_ON = "2026-08-10";

export const GP2015_SOURCE_PATH =
  "生物类似药审批报告/翻译/output/17_etanercept_szzs/全文译文.md";

export function gp2015Verification(
  sourceChunks: string[],
  verifiableValues: string[],
  hasUnresolvedOcrDamage = false,
): ReferenceCaseVerification {
  return {
    sourceChunks,
    verifiableValues,
    englishSourceCheck: "not-checked",
    hasUnresolvedOcrDamage,
    transcribedBy: TRANSCRIBED_BY,
    transcribedOn: TRANSCRIBED_ON,
  };
}

export function gp2015Source(
  citationZh: string,
  citationEn: string,
): ReferenceCaseSource {
  return {
    candidateProduct: {
      zh: "GP2015（依那西普生物类似药，Erelzi）",
      en: "GP2015 (etanercept-szzs biosimilar, Erelzi)",
    },
    referenceProduct: {
      zh: "US-licensed Enbrel / EU-approved Enbrel",
      en: "US-licensed Enbrel / EU-approved Enbrel",
    },
    documentTitle: {
      zh: "FDA 多学科审评报告（BLA 761042，Sandoz GP2015）",
      en: "FDA multi-disciplinary review (BLA 761042, Sandoz GP2015)",
    },
    citation: { zh: citationZh, en: citationEn },
    localSourcePath: GP2015_SOURCE_PATH,
  };
}

export const TIER_1_CRITERION = {
  zh: "统计学等效性检验（Tier 1）。由 FDA 生物统计学审评员独立分析，候选药与参照药的均值需满足预设等效性界值。",
  en: "Statistical equivalence testing (Tier 1). Independently analyzed by the FDA biostatistics reviewer; candidate and reference means must meet the predefined equivalence margin.",
};

export const TIER_2_QUALITY_RANGE_CRITERION = {
  zh: "质量范围法（Tier 2）：以参照药均值 ± 3SD 构成质量范围，候选药批次应落在该范围内。",
  en: "Quality range approach (Tier 2): the range is the reference product mean ± 3SD; candidate batches should fall within it.",
};

export const TIER_2_NO_STATISTICS_CRITERION = {
  zh: "Tier 2 属性，但本案例明确未做统计学评价，原因是方法变异较大；采用范围重叠的描述性比较。",
  en: "A Tier 2 attribute, but this case explicitly performed no statistical evaluation because of high method variability; a descriptive comparison of overlapping ranges was used instead.",
};

export const TIER_3_DESCRIPTIVE_CRITERION = {
  zh: "描述性评价（Tier 3）：不设统计学等效性界值，以头对头比较与质量范围作为支持性证据。",
  en: "Descriptive evaluation (Tier 3): no statistical equivalence margin; head-to-head comparison and quality ranges serve as supportive evidence.",
};

export const MEAN_AND_RANGE_ROWS_LABEL = {
  mean: { zh: "均值（批次数）", en: "Mean (lots)" },
  range: { zh: "范围（均值 ± 3SD）", en: "Range (mean ± 3SD)" },
};

export const GLYCAN_NAMING_CAVEAT = {
  zh: "命名映射风险：译文使用 bG0/bG1/bG2/bG2-F/bGX(-F) 等命名，框架使用 G0F/G0/G1F/G2F/核心岩藻糖；(-F) 后缀推断为「非岩藻糖基化」，译文未明确定义 b 与 -F。部分数值为全分子 N-糖链合计，非仅 Fc 区，与框架隐含「Fc 区糖型」语义不完全等价。",
  en: "Naming mapping risk: the translation uses bG0/bG1/bG2/bG2-F/bGX(-F) etc., while the framework uses G0F/G0/G1F/G2F/core fucosylation; the (-F) suffix is inferred to mean \"afucosylated\" but is never defined in the source. Some values are whole-molecule N-glycan totals, not Fc-region only, which is not fully equivalent to the framework's implied Fc-region glycoform semantics.",
};

export const TRANSLATION_ONLY_CAVEAT = {
  zh: "数值抄录自中文译文，尚未回英文原文逐条核对。",
  en: "Values were transcribed from the Chinese translation and have not been reconciled item by item with the English original.",
};
