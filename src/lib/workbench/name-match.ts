import { characterizationItems } from "@/data/characterization-items";
import { methodAnalysisConfigs } from "@/data/method-analysis-config";

/**
 * Frozen snapshot of teammate `characterizationProjects[].name`.
 * Matching uses these names only — never `projectModules.name`.
 */
export const TEAMMATE_CHARACTERIZATION_PROJECT_NAMES: readonly string[] = [
  "完整分子质量（intact mass）",
  "脱糖完整分子质量",
  "轻链分子质量",
  "未脱糖重链分子质量",
  "脱糖重链分子质量",
  "MS1肽质量覆盖率",
  "MS/MS序列确认覆盖率",
  "CDR区特征肽确认",
  "N/C端氨基酸序列及末端异质性",
  "游离巯基水平",
  "二硫键连接图谱",
  "翻译后修饰总入口",
  "甲硫氨酸/色氨酸等氧化",
  "Asn脱酰胺及异构化",
  "N端焦谷氨酸形成",
  "重链C端Lys加工",
  "二级结构（远紫外CD）",
  "三级结构（近紫外CD）",
  "三级结构（内源荧光）",
  "热稳定性/热转变",
  "其他高级结构确证方法",
  "FT-IR二级结构正交分析",
  "位点特异高级结构",
  "N-糖基化位点及占有率",
  "G0F糖型比例",
  "G0糖型比例",
  "其他主要/次要N-糖型",
  "N-羟乙酰神经氨酸（NGNA）",
  "N-乙酰神经氨酸（NANA）",
  "常见IgG N-糖型（半乳糖基化糖型比例）",
  "Man5/Man6等高甘露糖糖型比例",
  "核心岩藻糖水平",
  "摩尔消光系数",
  "等电点（pI）",
  "高分子量物质/聚集体（HMW）",
  "SEC主峰/单体",
  "低分子量物质/片段（LMW）",
  "还原CE-SDS重链+轻链纯度",
  "还原CE-SDS片段/杂质",
  "非还原CE-SDS主峰",
  "非还原CE-SDS片段/杂质",
  "酸性变异体比例",
  "主电荷峰比例",
  "碱性变异体比例",
  "靶标/抗原结合活性",
  "机制相关生物学活性/相对效价",
  "其他机制相关功能",
  "FcγRI（CD64）结合活力",
  "FcγRIIa（CD32a）结合活力",
  "FcγRIIb（CD32b）结合活力",
  "FcγRIIIa（CD16a）结合活力",
  "FcRn（新生儿Fc受体）结合活力",
  "C1q结合活力",
  "抗体依赖的细胞介导细胞毒作用",
  "补体依赖性细胞毒性",
  "其他产品相关物质/杂质",
  "Protein A残留量",
  "外源性DNA残留量",
  "宿主细胞蛋白（HCP）残留量",
  "其他工艺相关杂质",
];

/** Human-verified normalized equals that generated `computableItemIds` must contain. */
export const REQUIRED_EQUAL_ITEM_IDS: readonly string[] = [
  "intact-mass",
  "deglycosylated-intact-mass",
  "light-chain-mass",
  "non-deglycosylated-heavy-chain-mass",
  "deglycosylated-heavy-chain-mass",
  "ms1-sequence-coverage",
  "msms-sequence-coverage",
];

export function normalizeProjectName(raw: string): string {
  return raw
    .replace(/\s+/g, "")
    .replace(/[（(][^）)]*[）)]/g, "")
    .replace(/(?:比对|水平)$/u, "");
}

export function teammateNormalizedNameSet(): Set<string> {
  return new Set(TEAMMATE_CHARACTERIZATION_PROJECT_NAMES.map(normalizeProjectName));
}

export function isNameMatchedItemName(itemNameZh: string): boolean {
  return teammateNormalizedNameSet().has(normalizeProjectName(itemNameZh));
}

export function itemHasAnalyzableMethod(itemId: string): boolean {
  return methodAnalysisConfigs.some(
    (config) => config.itemId === itemId && config.status === "analyzable",
  );
}

function buildNameMatchedItemIds(): string[] {
  const teammateNames = teammateNormalizedNameSet();
  return characterizationItems
    .filter((item) => teammateNames.has(normalizeProjectName(item.itemName.zh)))
    .map((item) => item.id);
}

export const nameMatchedItemIds: readonly string[] = buildNameMatchedItemIds();

export const computableItemIds: readonly string[] = nameMatchedItemIds.filter(
  itemHasAnalyzableMethod,
);

export function isNameMatchedItemId(itemId: string): boolean {
  return nameMatchedItemIds.includes(itemId);
}

export function isComputableItemId(itemId: string): boolean {
  return computableItemIds.includes(itemId);
}

export function firstAnalyzableMethodId(itemId: string): string | undefined {
  return methodAnalysisConfigs.find(
    (config) => config.itemId === itemId && config.status === "analyzable",
  )?.methodId;
}
