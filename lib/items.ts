export type ItemStatus = "available" | "planned";

export interface ComparisonItem {
  id: string;
  name: string;
  purpose: string;
  preferredMethod: string;
  engine: string;
  status: ItemStatus;
}

export const comparisonItems: ComparisonItem[] = [
  { id: "intact-mass", name: "完整分子质量", purpose: "确认整体分子组成和主要分子形式", preferredMethod: "LC–ESI–MS", engine: "UniDec", status: "available" },
  { id: "deglycosylated-intact-mass", name: "脱糖完整分子质量", purpose: "排除N-糖链影响后确认蛋白主链质量", preferredMethod: "酶法脱糖后LC–ESI–MS", engine: "UniDec", status: "available" },
  { id: "light-chain-mass", name: "轻链分子质量", purpose: "确认抗体轻链组成和末端加工", preferredMethod: "还原LC–MS", engine: "UniDec", status: "available" },
  { id: "heavy-chain-mass", name: "未脱糖重链分子质量", purpose: "观察重链主链与糖型共同形成的质量分布", preferredMethod: "还原后重链LC–MS", engine: "UniDec", status: "available" },
  { id: "deglycosylated-heavy-chain-mass", name: "脱糖重链分子质量", purpose: "区分蛋白主链差异与糖链差异", preferredMethod: "脱糖并还原后LC–MS", engine: "UniDec", status: "available" },
  { id: "heavy-chain-glycoforms", name: "重链糖型分布", purpose: "比较主要糖型组成及相对丰度", preferredMethod: "重链LC–MS＋糖型质量库", engine: "UniDec＋糖型归属", status: "planned" },
  { id: "ms1-peptide-coverage", name: "一级质谱序列覆盖率", purpose: "通过肽质量匹配支持一级结构确认", preferredMethod: "酶切肽图LC–MS", engine: "OpenMS＋肽质量匹配", status: "planned" },
  { id: "ms2-peptide-coverage", name: "二级质谱序列覆盖率", purpose: "通过碎片离子证据确认肽段与氨基酸序列", preferredMethod: "LC–MS/MS数据库检索", engine: "OpenMS＋搜索引擎＋FDR", status: "planned" },
  { id: "post-translational-modifications", name: "翻译后修饰", purpose: "定位并比较氧化、脱酰胺化、末端加工等修饰", preferredMethod: "LC–MS/MS可变修饰检索与人工复核", engine: "OpenMS＋搜索引擎", status: "planned" },
  { id: "cdr-confirmation", name: "CDR肽段确认", purpose: "确认互补决定区关键肽段及序列覆盖", preferredMethod: "LC–MS/MS肽段鉴定", engine: "MS/MS搜索＋序列映射", status: "planned" },
  { id: "terminal-sequence", name: "C/N端氨基酸序列", purpose: "确认轻链、重链N端与C端序列及末端异质性", preferredMethod: "LC–MS/MS末端肽鉴定＋正交确认", engine: "OpenMS＋搜索引擎＋人工复核", status: "planned" },
];

export const demoCandidatePeaks = [
  { mass: 148057.2, intensity: 100 },
  { mass: 148219.1, intensity: 58 },
  { mass: 148381.4, intensity: 24 },
  { mass: 147895.0, intensity: 17 },
];

export const demoReferencePeaks = [
  { mass: 148056.7, intensity: 100 },
  { mass: 148218.9, intensity: 61 },
  { mass: 148381.0, intensity: 21 },
  { mass: 147894.6, intensity: 19 },
];
