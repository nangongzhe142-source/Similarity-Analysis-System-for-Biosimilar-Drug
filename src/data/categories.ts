// Hand-maintained category definitions. The Excel workbook has no category
// column; the item-to-category mapping is defined in the generator script
// (biosimilar-web-scripts/generate_data.py) per the authoritative mapping.
// TODO: 校对英文 (review the English translations).
import type { Category } from "@/types/models";

export const categories: Category[] = [
  {
    key: "primary-structure",
    name: { zh: "一级结构", en: "Primary Structure" },
    description: {
      zh: "确认氨基酸序列、末端加工、游离巯基与二硫键连接等一级结构要素与参照药一致。",
      en: "Confirms that the amino acid sequence, terminal processing, free thiols and disulfide linkages are consistent with the reference product.",
    },
    order: 1,
  },
  {
    key: "ptm-glycosylation",
    name: { zh: "翻译后修饰与糖基化", en: "PTMs & Glycosylation" },
    description: {
      zh: "鉴定并定量比较各类翻译后修饰及 N-糖谱分布，评估其对功能与免疫原性的潜在影响。",
      en: "Identifies and quantitatively compares post-translational modifications and N-glycan profiles, assessing potential impact on function and immunogenicity.",
    },
    order: 2,
  },
  {
    key: "higher-order-structure",
    name: { zh: "高级结构", en: "Higher-order Structure" },
    description: {
      zh: "通过光谱、量热及高分辨技术等正交方法比较蛋白折叠、构象与热稳定性。",
      en: "Compares protein folding, conformation and thermal stability using orthogonal spectroscopic, calorimetric and high-resolution techniques.",
    },
    order: 3,
  },
  {
    key: "physicochemical",
    name: { zh: "理化性质", en: "Physicochemical Properties" },
    description: {
      zh: "比较摩尔消光系数、等电点等基本理化参数，支持身份确认与含量测定。",
      en: "Compares basic physicochemical parameters such as molar extinction coefficient and isoelectric point, supporting identity and content determination.",
    },
    order: 4,
  },
  {
    key: "purity-size-variants",
    name: { zh: "纯度与大小变异体", en: "Purity & Size Variants" },
    description: {
      zh: "采用 SEC 与 CE-SDS 等方法评价聚集体、单体与片段分布的相似性。",
      en: "Evaluates similarity in the distribution of aggregates, monomer and fragments using SEC and CE-SDS methods.",
    },
    order: 5,
  },
  {
    key: "charge-variants",
    name: { zh: "电荷变异体", en: "Charge Variants" },
    description: {
      zh: "比较酸区、主峰与碱区电荷变异体分布，反映修饰与末端加工的一致性。",
      en: "Compares acidic, main-peak and basic charge-variant distributions, reflecting the consistency of modifications and terminal processing.",
    },
    order: 6,
  },
  {
    key: "binding-bioactivity",
    name: { zh: "结合活性与生物学活性", en: "Binding & Biological Activity" },
    description: {
      zh: "头对头比较靶标结合、Fc 受体结合及机制相关功能活性的等效性。",
      en: "Head-to-head comparison of target binding, Fc receptor binding and MoA-related functional activities for equivalence.",
    },
    order: 7,
  },
  {
    key: "process-product-impurities",
    name: { zh: "工艺及产品相关杂质", en: "Process- & Product-related Impurities" },
    description: {
      zh: "控制宿主蛋白、DNA、Protein A 等工艺相关杂质及产品相关杂质的安全风险。",
      en: "Controls the safety risks of process-related impurities (HCP, DNA, Protein A) and product-related impurities.",
    },
    order: 8,
  },
];

export function getCategoryByKey(key: string): Category | undefined {
  return categories.find((category) => category.key === key);
}
