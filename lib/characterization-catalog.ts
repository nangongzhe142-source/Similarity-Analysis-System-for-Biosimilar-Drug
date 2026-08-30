export type CharacterizationCategory = "结构确证" | "理化特性" | "生物学功能" | "杂质";
export type CatalogAvailability = "connected" | "planned";

export interface CharacterizationProject {
  id: string;
  code: string;
  name: string;
  category: CharacterizationCategory;
  subgroup: string;
  ctdLabel: string;
  availability: CatalogAvailability;
  moduleId?: string;
  sourceNote?: string;
}

const project = (
  id: string,
  code: string,
  name: string,
  category: CharacterizationCategory,
  subgroup: string,
  ctdLabel: string,
  moduleId?: string,
  sourceNote?: string,
): CharacterizationProject => ({
  id, code, name, category, subgroup, ctdLabel,
  availability: moduleId ? "connected" : "planned",
  moduleId,
  sourceNote,
});

export const characterizationProjects: CharacterizationProject[] = [
  project("intact-molecular-mass", "IM-01", "完整分子质量（intact mass）", "结构确证", "分子组成与亚基质量", "结构确证 / 一级结构", "intact-mass"),
  project("deglycosylated-intact-molecular-mass", "DM-02", "脱糖完整分子质量", "结构确证", "分子组成与亚基质量", "结构确证 / 一级结构", "deglycosylated-intact-mass"),
  project("light-chain-molecular-mass", "LC-03", "轻链分子质量", "结构确证", "分子组成与亚基质量", "结构确证 / 一级结构", "light-chain-mass"),
  project("heavy-chain-molecular-mass", "HC-04", "未脱糖重链分子质量", "结构确证", "分子组成与亚基质量", "结构确证 / 一级结构", "heavy-chain-mass"),
  project("deglycosylated-heavy-chain-molecular-mass", "DHC-05", "脱糖重链分子质量", "结构确证", "分子组成与亚基质量", "结构确证 / 一级结构", "deglycosylated-heavy-chain-mass"),
  project("ms1-peptide-mass-coverage", "SEQ-01", "MS1肽质量覆盖率", "结构确证", "序列确认", "结构确证 / 一级结构", "ms1-peptide-mass-coverage"),
  project("msms-sequence-coverage", "SEQ-02", "MS/MS序列确认覆盖率", "结构确证", "序列确认", "结构确证 / 一级结构", "msms-sequence-coverage", "原表CTD为空，按相邻项目继承章节"),
  project("cdr-signature-peptides", "SEQ-03", "CDR区特征肽确认", "结构确证", "序列确认", "结构确证 / 一级结构", "cdr-signature-peptides"),
  project("terminal-sequence-heterogeneity", "SEQ-04", "N/C端氨基酸序列及末端异质性", "结构确证", "序列确认", "结构确证 / 一级结构", "terminal-sequence-heterogeneity"),
  project("free-thiol", "COV-01", "游离巯基水平", "结构确证", "共价连接", "结构确证 / 一级结构", "free-thiol"),
  project("disulfide-map", "COV-02", "二硫键连接图谱", "结构确证", "共价连接", "结构确证 / 一级结构", "disulfide-map"),
  project("ptm-gateway", "PTM-06", "翻译后修饰总入口", "结构确证", "翻译后修饰", "结构确证 / 一级结构 / 翻译后修饰", "post-translational-modifications"),
  project("oxidation", "PTM-01", "甲硫氨酸/色氨酸等氧化", "结构确证", "翻译后修饰", "结构确证 / 一级结构 / 翻译后修饰", "oxidation"),
  project("deamidation-isomerization", "PTM-02", "Asn脱酰胺及异构化", "结构确证", "翻译后修饰", "结构确证 / 一级结构 / 翻译后修饰", "deamidation-isomerization"),
  project("n-terminal-pyroglutamate", "PTM-03", "N端焦谷氨酸形成", "结构确证", "翻译后修饰", "结构确证 / 一级结构 / 翻译后修饰", "n-terminal-pyroglutamate"),
  project("heavy-chain-c-terminal-lys", "PTM-04", "重链C端Lys加工", "结构确证", "翻译后修饰", "结构确证 / 一级结构 / 翻译后修饰", "heavy-chain-c-terminal-lys"),
  project("secondary-structure-far-uv-cd", "HOS-01", "二级结构（远紫外CD）", "结构确证", "整体构象与二级结构", "结构确证 / 高级结构"),
  project("tertiary-structure-near-uv-cd", "HOS-02", "三级结构（近紫外CD）", "结构确证", "三级结构与局部环境", "结构确证 / 高级结构"),
  project("tertiary-structure-fluorescence", "HOS-03", "三级结构（内源荧光）", "结构确证", "三级结构与局部环境", "结构确证 / 高级结构"),
  project("thermal-stability", "HOS-04", "热稳定性/热转变", "结构确证", "构象稳定性", "结构确证 / 高级结构"),
  project("other-higher-order-structure", "HOS-05", "其他高级结构确证方法", "结构确证", "补充高级结构", "结构确证 / 高级结构"),
  project("ftir-secondary-structure", "HOS-06", "FT-IR二级结构正交分析", "结构确证", "整体构象与二级结构", "结构确证 / 高级结构"),
  project("site-specific-higher-order-structure", "HOS-07", "位点特异高级结构", "结构确证", "补充高级结构", "结构确证 / 高级结构"),
  project("n-glycosylation-site-occupancy", "GLY-01", "N-糖基化位点及占有率", "结构确证", "糖基化位点", "结构确证 / 糖基化"),
  project("g0f-glycoform", "GLY-02", "G0F糖型比例", "结构确证", "糖型组成与分布", "结构确证 / 糖基化", "g0f-glycoform"),
  project("g0-glycoform", "GLY-03", "G0糖型比例", "结构确证", "糖型组成与分布", "结构确证 / 糖基化", "g0-glycoform"),
  project("other-n-glycoforms", "GLY-04", "其他主要/次要N-糖型", "结构确证", "糖型组成与分布", "结构确证 / 糖基化", "other-n-glycoforms"),
  project("ngna", "GLY-05", "N-羟乙酰神经氨酸（NGNA）", "结构确证", "糖型组成与分布", "结构确证 / 糖基化", "ngna"),
  project("nana", "GLY-06", "N-乙酰神经氨酸（NANA）", "结构确证", "糖型组成与分布", "结构确证 / 糖基化", "nana"),
  project("galactosylated-glycoforms", "GLY-07", "常见IgG N-糖型（半乳糖基化糖型比例）", "结构确证", "N-糖链类型及比例", "结构确证 / 糖基化 / N-糖链类型及比例"),
  project("high-mannose-glycoforms", "GLY-08", "Man5/Man6等高甘露糖糖型比例", "结构确证", "N-糖链类型及比例", "结构确证 / 糖基化 / N-糖链类型及比例"),
  project("core-fucosylation", "GLY-09", "核心岩藻糖水平", "结构确证", "N-糖链类型及比例", "结构确证 / 糖基化 / N-糖链类型及比例"),
  project("molar-extinction-coefficient", "PHY-01", "摩尔消光系数", "理化特性", "基本理化性质", "理化特性"),
  project("isoelectric-point", "PHY-02", "等电点（pI）", "理化特性", "基本理化性质", "理化特性"),
  project("high-molecular-weight-species", "PUR-01", "高分子量物质/聚集体（HMW）", "理化特性", "纯度与分子尺寸异质性", "理化特性 / 纯度和杂质"),
  project("sec-main-peak", "PUR-02", "SEC主峰/单体", "理化特性", "纯度与分子尺寸异质性", "理化特性 / 纯度和杂质"),
  project("low-molecular-weight-species", "PUR-03", "低分子量物质/片段（LMW）", "理化特性", "纯度与分子尺寸异质性", "理化特性 / 纯度和杂质"),
  project("reduced-ce-sds-purity", "PUR-04", "还原CE-SDS重链+轻链纯度", "理化特性", "纯度与分子尺寸异质性", "理化特性 / 纯度和杂质"),
  project("reduced-ce-sds-impurities", "PUR-05", "还原CE-SDS片段/杂质", "理化特性", "纯度与分子尺寸异质性", "理化特性 / 纯度和杂质"),
  project("nonreduced-ce-sds-main-peak", "PUR-06", "非还原CE-SDS主峰", "理化特性", "纯度与分子尺寸异质性", "理化特性 / 纯度和杂质"),
  project("nonreduced-ce-sds-impurities", "PUR-07", "非还原CE-SDS片段/杂质", "理化特性", "纯度与分子尺寸异质性", "理化特性 / 纯度和杂质"),
  project("acidic-variants", "CHG-01", "酸性变异体比例", "理化特性", "电荷异质性", "理化特性 / 纯度和杂质"),
  project("main-charge-peak", "CHG-02", "主电荷峰比例", "理化特性", "电荷异质性", "理化特性 / 纯度和杂质"),
  project("basic-variants", "CHG-03", "碱性变异体比例", "理化特性", "电荷异质性", "理化特性 / 纯度和杂质"),
  project("target-binding", "BIO-01", "靶标/抗原结合活性", "生物学功能", "靶标结合与作用机制", "生物学功能"),
  project("mechanism-related-potency", "BIO-02", "机制相关生物学活性/相对效价", "生物学功能", "靶标结合与作用机制", "生物学功能"),
  project("other-mechanism-functions", "BIO-03", "其他机制相关功能", "生物学功能", "靶标结合与作用机制", "生物学功能"),
  project("fcgri-binding", "BIO-04", "FcγRI（CD64）结合活力", "生物学功能", "Fc受体及补体结合", "生物学功能"),
  project("fcgriia-binding", "BIO-05", "FcγRIIa（CD32a）结合活力", "生物学功能", "Fc受体及补体结合", "生物学功能"),
  project("fcgriib-binding", "BIO-06", "FcγRIIb（CD32b）结合活力", "生物学功能", "Fc受体及补体结合", "生物学功能"),
  project("fcgriiia-binding", "BIO-07", "FcγRIIIa（CD16a）结合活力", "生物学功能", "Fc受体及补体结合", "生物学功能"),
  project("fcrn-binding", "BIO-08", "FcRn（新生儿Fc受体）结合活力", "生物学功能", "Fc受体及补体结合", "生物学功能"),
  project("c1q-binding", "BIO-09", "C1q结合活力", "生物学功能", "Fc受体及补体结合", "生物学功能"),
  project("adcc", "BIO-10", "抗体依赖的细胞介导细胞毒作用", "生物学功能", "效应功能", "生物学功能"),
  project("cdc", "BIO-11", "补体依赖性细胞毒性", "生物学功能", "效应功能", "生物学功能"),
  project("other-product-related-impurities", "IMP-01", "其他产品相关物质/杂质", "杂质", "产品相关杂质", "杂质 / 产品相关杂质"),
  project("protein-a-residual", "IMP-02", "Protein A残留量", "杂质", "工艺相关杂质", "杂质 / 工艺相关杂质"),
  project("residual-dna", "IMP-03", "外源性DNA残留量", "杂质", "工艺相关杂质", "杂质 / 工艺相关杂质"),
  project("host-cell-protein", "IMP-04", "宿主细胞蛋白（HCP）残留量", "杂质", "工艺相关杂质", "杂质 / 工艺相关杂质"),
  project("other-process-related-impurities", "IMP-05", "其他工艺相关杂质", "杂质", "工艺相关杂质", "杂质 / 工艺相关杂质", undefined, "原表CTD写为产品相关杂质，按已确认语义归类，源数据待核对"),
];

export const characterizationCategories: Array<{
  name: CharacterizationCategory;
  code: string;
  description: string;
}> = [
  { name: "结构确证", code: "01", description: "一级结构、高级结构与糖基化" },
  { name: "理化特性", code: "02", description: "基本性质、纯度与异质性" },
  { name: "生物学功能", code: "03", description: "靶标结合、受体结合与效应功能" },
  { name: "杂质", code: "04", description: "产品相关及工艺相关杂质" },
];

export const connectedCharacterizationCount = characterizationProjects.filter((item) => item.availability === "connected").length;
