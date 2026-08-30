import type { AIReport, AnalysisResult, CovalentCalculationResult, GlycanCalculationResult, PTMIntervalResult, PTMMapCalculationResult, PurityChromatographyResult, SequenceCalculationResult } from "@/lib/types";

export type ModuleState = "not-started" | "queued" | "running" | "completed" | "attention" | "failed" | "planned";
export type ModuleKind = "mass" | "ptm" | "ptm-map" | "sequence" | "covalent" | "glycan" | "chromatography";
export type DispatchMode = "parallel" | "serial";

export interface ProjectModule {
  id: string;
  code: string;
  name: string;
  shortName: string;
  description: string;
  method: string;
  engine: string;
  kind: ModuleKind;
  accent: "teal" | "orange" | "violet";
}

export interface ModuleRun {
  status: ModuleState;
  message: string;
  progress: number;
  source?: "batch" | "single";
  startedAt?: string;
  completedAt?: string;
  result?: AnalysisResult;
  ptmResult?: PTMIntervalResult;
  sequenceResult?: SequenceCalculationResult;
  glycanResult?: GlycanCalculationResult;
  ptmMapResult?: PTMMapCalculationResult;
  chromatographyResult?: PurityChromatographyResult;
  covalentResult?: CovalentCalculationResult;
  aiReport?: AIReport;
}

export interface ModuleFiles {
  candidate: File | null;
  reference: File | null;
}

export const projectModules: ProjectModule[] = [
  { id: "intact-mass", code: "IM-01", name: "完整分子量比对", shortName: "完整分子量", description: "比较完整蛋白去卷积质量峰，展示主要分子形式、峰匹配和质量偏移。", method: "LC–ESI–MS", engine: "UniDec 适配器", kind: "mass", accent: "teal" },
  { id: "deglycosylated-intact-mass", code: "DM-02", name: "脱糖完整分子量比对", shortName: "脱糖完整分子量", description: "去除 N-糖链影响后比较蛋白主链质量，区分主链差异与糖链异质性。", method: "酶法脱糖后 LC–ESI–MS", engine: "UniDec 适配器", kind: "mass", accent: "orange" },
  { id: "light-chain-mass", code: "LC-03", name: "轻链分子量比对", shortName: "轻链分子量", description: "比较还原后轻链质量及主要末端加工形式。", method: "还原 LC–MS", engine: "UniDec 适配器", kind: "mass", accent: "teal" },
  { id: "heavy-chain-mass", code: "HC-04", name: "未脱糖重链分子量比对", shortName: "未脱糖重链", description: "比较重链主链与糖型共同形成的质量分布。", method: "还原 LC–MS", engine: "UniDec 适配器", kind: "mass", accent: "orange" },
  { id: "deglycosylated-heavy-chain-mass", code: "DHC-05", name: "脱糖重链分子量比对", shortName: "脱糖重链", description: "脱糖后比较重链蛋白主链质量，辅助定位非糖链差异。", method: "脱糖并还原后 LC–MS", engine: "UniDec 适配器", kind: "mass", accent: "teal" },
  { id: "post-translational-modifications", code: "PTM-06", name: "翻译后修饰位点定量比对", shortName: "PTM位点定量", description: "接收 OpenMS/Sage 等专业程序产生的修饰定量结果，再以多批参照药构建逐位点区间并标记偏离。", method: "肽图 / MAM LC–MS/MS", engine: "OpenMS + Sage 结果适配器 / PTM监管区间层", kind: "ptm", accent: "violet" },
  { id: "oxidation", code: "PTM-01", name: "甲硫氨酸/色氨酸等氧化", shortName: "氧化", description: "MetaMorpheus可变修饰搜库与FlashLFQ定量，输出Met/Trp逐位点相对丰度并标记热点。", method: "肽图 LC–MS/MS", engine: "MetaMorpheus + FlashLFQ + Pyteomics", kind: "ptm-map", accent: "orange" },
  { id: "deamidation-isomerization", code: "PTM-02", name: "Asn脱酰胺及异构化", shortName: "脱酰胺/isoAsp", description: "输出Asn脱酰胺位点与丰度；常规HCD不能区分Asp/isoAsp时触发质量闸门提示。", method: "肽图 LC–MS/MS / 正交isoAsp证据", engine: "MetaMorpheus + FlashLFQ + Pyteomics", kind: "ptm-map", accent: "orange" },
  { id: "n-terminal-pyroglutamate", code: "PTM-03", name: "N端焦谷氨酸形成", shortName: "N端pGlu", description: "确认N端Q/E对应-17.0265/-18.0106 Da证据；有完整质量谱时追加UniDec正交核对。", method: "肽图 LC–MS/MS + 可选完整质量", engine: "MetaMorpheus + FlashLFQ；UniDec按需", kind: "ptm-map", accent: "violet" },
  { id: "heavy-chain-c-terminal-lys", code: "PTM-04", name: "重链C端Lys加工", shortName: "C端Lys", description: "比较含K/缺K末端肽；有亚基质量谱时追加UniDec 0K/1K/2K直接去卷积。", method: "肽图 LC–MS/MS + 可选亚基质量", engine: "MetaMorpheus + FlashLFQ；UniDec按需", kind: "ptm-map", accent: "violet" },
  { id: "ms1-peptide-mass-coverage", code: "SEQ-01", name: "MS1肽质量覆盖率", shortName: "MS1肽质量覆盖", description: "OpenMS校验mzML，Pyteomics执行理论酶切、质量计算和MS1 XIC提取。", method: "LC–MS肽图", engine: "OpenMS + Pyteomics", kind: "sequence", accent: "teal" },
  { id: "msms-sequence-coverage", code: "SEQ-02", name: "MS/MS序列确认覆盖率", shortName: "MS/MS序列覆盖", description: "Sage完成数据库检索与FDR，Pyteomics将合格肽段映射到抗体序列。", method: "LC–MS/MS肽图", engine: "OpenMS + Sage + Pyteomics", kind: "sequence", accent: "teal" },
  { id: "cdr-signature-peptides", code: "SEQ-03", name: "CDR区特征肽确认", shortName: "CDR特征肽", description: "按配置的CDR区间生成理论证据范围，并从Sage合格肽段中筛选跨区特征肽。", method: "靶向LC–MS/MS", engine: "Sage + Pyteomics", kind: "sequence", accent: "orange" },
  { id: "terminal-sequence-heterogeneity", code: "SEQ-04", name: "N/C端序列及末端异质性", shortName: "末端序列", description: "通过肽图检索确认N/C端肽；TopPIC和UniDec保留为有顶端数据时的正交核对位。", method: "肽图 / Top-down MS", engine: "Sage + Pyteomics；TopPIC/UniDec按需", kind: "sequence", accent: "violet" },
  { id: "free-thiol", code: "COV-01", name: "游离巯基水平", shortName: "游离巯基", description: "Ellman法公式计算mol SH/mol protein；可选上传IAM/NEM烷基化肽图进入Sage位点证据入口。", method: "Ellman / 荧光法；可选LC–MS/MS", engine: "平台公式 + Sage可选位点证据", kind: "covalent", accent: "orange" },
  { id: "disulfide-map", code: "COV-02", name: "二硫键连接图谱", shortName: "二硫键", description: "非还原肽图经OpenMS转峰表，由Kojak与xiSEARCH检索Cys–Cys连接，Pyteomics生成理论连接肽清单。", method: "非还原肽图 LC–MS/MS", engine: "OpenMS + Kojak + xiSEARCH + Pyteomics", kind: "covalent", accent: "teal" },
  { id: "g0f-glycoform", code: "GLY-02", name: "G0F糖型比例", shortName: "G0F糖型", description: "释放N-糖链HILIC-FLD峰面积定量；保留时间归属由glypy核对，MS确证作为独立证据。", method: "HILIC-FLD / HILIC-MS", engine: "chromConverter + hplc-py + glypy", kind: "glycan", accent: "teal" },
  { id: "g0-glycoform", code: "GLY-03", name: "G0糖型比例", shortName: "G0糖型", description: "定量无核心岩藻糖G0，并触发平台层功能关联审阅提示。", method: "HILIC-FLD / HILIC-MS", engine: "chromConverter + hplc-py + glypy", kind: "glycan", accent: "orange" },
  { id: "other-n-glycoforms", code: "GLY-04", name: "其他主要/次要N-糖型", shortName: "其他N-糖型", description: "输出主要和次要释放N-糖链的归一化峰面积与批间分布。", method: "HILIC-FLD / HILIC-MS", engine: "chromConverter + hplc-py + glypy", kind: "glycan", accent: "teal" },
  { id: "ngna", code: "GLY-05", name: "NGNA糖型比例", shortName: "NGNA", description: "DMB衍生化后积分NGNA，并按平台规则显示免疫原性资料审阅标记。", method: "DMB-FLD / MS确证", engine: "chromConverter + hplc-py + glypy", kind: "glycan", accent: "violet" },
  { id: "nana", code: "GLY-06", name: "NANA糖型比例", shortName: "NANA", description: "DMB衍生化后积分NANA，并与NGNA共同汇总总唾液酸化占比。", method: "DMB-FLD / MS确证", engine: "chromConverter + hplc-py + glypy", kind: "glycan", accent: "violet" },
  { id: "high-molecular-weight-species", code: "PUR-01", name: "高分子量物质/聚集体（HMW）", shortName: "HMW", description: "SEC色谱时间校准、峰拟合及归一化面积定量；HMW升高时显示聚集风险审阅标记。", method: "SEC-HPLC", engine: "chromConverter + HappyTools + hplc-py", kind: "chromatography", accent: "orange" },
  { id: "sec-main-peak", code: "PUR-02", name: "SEC主峰/单体", shortName: "SEC主峰", description: "按可配置主峰窗口汇总单体面积比例，并展示候选药与参照药叠加色谱。", method: "SEC-HPLC", engine: "chromConverter + HappyTools + hplc-py", kind: "chromatography", accent: "teal" },
  { id: "low-molecular-weight-species", code: "PUR-03", name: "低分子量物质/片段（LMW）", shortName: "LMW", description: "汇总主峰后低分子峰；参照药未匹配的新峰标记待MS鉴定。", method: "SEC-HPLC", engine: "chromConverter + HappyTools + hplc-py", kind: "chromatography", accent: "orange" },
  { id: "reduced-ce-sds-purity", code: "PUR-04", name: "还原CE-SDS重链+轻链纯度", shortName: "还原CE-SDS纯度", description: "按LC/HC/NGHC可配置迁移时间窗计算LC+HC纯度、LC/HC比和NGHC%。", method: "还原CE-SDS", engine: "HappyTools + hplc-py；chromConverter按需", kind: "chromatography", accent: "teal" },
  { id: "reduced-ce-sds-impurities", code: "PUR-05", name: "还原CE-SDS片段/杂质", shortName: "还原CE-SDS杂质", description: "量化LC/HC窗口外片段和杂质，超LOQ新峰进入MS鉴定审阅队列。", method: "还原CE-SDS", engine: "HappyTools + hplc-py；chromConverter按需", kind: "chromatography", accent: "orange" },
  { id: "nonreduced-ce-sds-main-peak", code: "PUR-06", name: "非还原CE-SDS主峰", shortName: "非还原主峰", description: "计算非还原CE-SDS主峰面积比例及候选药/参照药迁移图叠加。", method: "非还原CE-SDS", engine: "HappyTools + hplc-py；chromConverter按需", kind: "chromatography", accent: "teal" },
  { id: "nonreduced-ce-sds-impurities", code: "PUR-07", name: "非还原CE-SDS片段/杂质", shortName: "非还原杂质", description: "汇总非还原主峰外片段/杂质，对超LOQ候选药新峰标记送MS鉴定。", method: "非还原CE-SDS", engine: "HappyTools + hplc-py；chromConverter按需", kind: "chromatography", accent: "violet" },
];

export const statusText: Record<ModuleState, string> = {
  "not-started": "未启动", queued: "已排队", running: "执行中", completed: "已完成",
  attention: "需关注", failed: "失败", planned: "待接入",
};

export function getProjectModule(moduleId: string) {
  return projectModules.find((module) => module.id === moduleId);
}

export function moduleResultSummary(run: ModuleRun) {
  if (run.covalentResult) return run.covalentResult.moduleCode === "COV-02" ? `连接证据 ${run.covalentResult.identifiedLinks?.length ?? 0}；双引擎一致 ${run.covalentResult.orthogonalPairIds?.length ?? 0}` : "游离巯基位点入口已执行";
  if (run.sequenceResult?.comparisonTable?.length) {
    const values = run.sequenceResult.comparisonTable.map((item) => item.candidateCoveragePercent).filter((value): value is number => value !== null);
    return values.length ? `候选药平均覆盖率 ${(values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)}%` : "序列任务已完成";
  }
  if (run.glycanResult?.comparisonTable?.length) {
    const target = run.glycanResult.targetGlycoform;
    const row = run.glycanResult.comparisonTable.find((item) => item.glycoform === target);
    return row?.candidatePercent == null ? "糖型任务已完成" : `${target} ${row.candidatePercent.toFixed(2)}%`;
  }
  if (run.ptmMapResult) return `合格PSM ${run.ptmMapResult.qualityGate.acceptedPsmCount ?? "—"}；定量证据 ${run.ptmMapResult.siteRows.length}`;
  if (run.chromatographyResult?.comparisonTable?.length) return `${run.chromatographyResult.targetMetric} ${run.chromatographyResult.comparisonTable[0].candidatePercent.toFixed(2)}%`;
  if (run.ptmResult) return `区间外 ${run.ptmResult.summary.outsideIntervalCount}；新增修饰 ${run.ptmResult.summary.candidateOnlyVariantCount}`;
  if (run.result) return `匹配峰 ${run.result.summary.matchedCount}；最大 |Δppm| ${run.result.summary.maxAbsDeltaPpm}`;
  return run.status === "running" || run.status === "queued" ? run.message : "尚无结果";
}
