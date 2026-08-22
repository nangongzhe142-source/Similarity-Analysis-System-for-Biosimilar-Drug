// Similarity evaluation schemes extracted from the V2 workbook, sheet 3.
//
// Source of truth:
//   生物类似药评价指导原则/V2-生物类似药药学比对研究质量属性、检测方法及相似性评价原则汇总表.xlsx
//   sheet: 3.特性鉴定相似性评价方案 (read via openpyxl 3.1.5 with data_only=True)
//   SHA-256: 8bd6b18f08d3b9a3b99c61cdb8eeff24ceef75a54a43b9f7d14d1709b703051f
//
// This file is a SIDECAR. It does not replace characterization-items.ts, which
// is still generated from the V0.1 workbook. Item and method definitions come
// from there; only the programmable decision rules come from here.
//
// Hand-maintained rather than generated, because sheet 3 holds 10 non-empty rows
// with irregular column alignment (merged ranges B7:B8, B11:B12, D9:D10 and a
// shifted 项目来源 column on rows 5 through 7) that a generic row reader would
// silently mangle. Every field carries the worksheet coordinate it came from.
//
// HARD RULE: sheet 3 populates columns G through N for only 7 of the 11
// primary-structure items. The remaining 4 must never be given a derived rule,
// whether from sheet 2, from another guideline, or from inference. They report
// RULE_NOT_DEFINED and route to human review.
//
// NOTE: all `en` strings are machine-translation placeholders.
// TODO: 校对英文 (review the English translations).
import type {
  LocalizedText,
  SimilarityScheme,
  SimilaritySchemeProvenance,
} from "@/types/models";

const SOURCE_WORKBOOK =
  "V2-生物类似药药学比对研究质量属性、检测方法及相似性评价原则汇总表.xlsx";
const SOURCE_WORKBOOK_SHA256 =
  "8bd6b18f08d3b9a3b99c61cdb8eeff24ceef75a54a43b9f7d14d1709b703051f";
const SOURCE_SHEET = "3.特性鉴定相似性评价方案";

/** Column letters G through N, which are the columns that carry rule content. */
const RULE_COLUMNS = ["G", "H", "I", "J", "K", "L", "M", "N"] as const;

/** Column letters used by every fully populated row. */
const ALL_RULE_CELLS = {
  recognizedContent: "G",
  comparisonBaseline: "H",
  ruleType: "I",
  decisionMethod: "J",
  numericBoundary: "K",
  overflowHandling: "L",
  basis: "M",
  finalProgramRule: "N",
} as const;

function provenance(
  sourceRow: number,
  missingCells: string[],
  sourceCells: SimilaritySchemeProvenance["sourceCells"] = ALL_RULE_CELLS,
): SimilaritySchemeProvenance {
  return {
    sourceWorkbook: SOURCE_WORKBOOK,
    sourceWorkbookSha256: SOURCE_WORKBOOK_SHA256,
    sourceSheet: SOURCE_SHEET,
    sourceRow,
    sourceCells,
    missingCells,
  };
}

/** K column text shared verbatim by all five molecular-mass rows (rows 2 to 6). */
const MASS_NUMERIC_BOUNDARY: LocalizedText = {
  zh: "无统一相似性数值限度；实测质量与理论质量偏差应符合方法特异预设的质量准确度标准",
  en:
    "No unified numerical similarity limit; the deviation between measured and " +
    "theoretical mass shall meet the method-specific predefined mass accuracy criteria",
};

/** M column text shared verbatim by the five mass rows (rows 2 to 6). */
const MASS_BASIS: LocalizedText = {
  zh:
    "CDE 2026《生物类似药首次申报临床试验药学资料撰写指导原则》；" +
    "FDA 2025 Development of Therapeutic Protein Biosimilars: Comparative Analytical " +
    "Assessment and Other Quality-Related Considerations；" +
    "WHO 2022 Guidelines on evaluation of biosimilars；ICH Q6B；ICH Q2(R2)",
  en:
    "CDE 2026 Guideline on CMC documentation for the first IND filing of biosimilars; " +
    "FDA 2025 Development of Therapeutic Protein Biosimilars: Comparative Analytical " +
    "Assessment and Other Quality-Related Considerations; " +
    "WHO 2022 Guidelines on evaluation of biosimilars; ICH Q6B; ICH Q2(R2)",
};

/** M column text shared verbatim by the two coverage rows (rows 7 and 8), which
 *  omit ICH Q2(R2) relative to the mass rows. */
const COVERAGE_BASIS: LocalizedText = {
  zh:
    "CDE 2026《生物类似药首次申报临床试验药学资料撰写指导原则》；" +
    "FDA 2025 Development of Therapeutic Protein Biosimilars: Comparative Analytical " +
    "Assessment and Other Quality-Related Considerations；" +
    "WHO 2022 Guidelines on evaluation of biosimilars；ICH Q6B",
  en:
    "CDE 2026 Guideline on CMC documentation for the first IND filing of biosimilars; " +
    "FDA 2025 Development of Therapeutic Protein Biosimilars: Comparative Analytical " +
    "Assessment and Other Quality-Related Considerations; " +
    "WHO 2022 Guidelines on evaluation of biosimilars; ICH Q6B",
};

/** N column text shared verbatim by rows 2, 3 and 4. */
const MASS_FINAL_RULE_A: LocalizedText = {
  zh: "对应+准确度合格+无异常→PASS；异常→REVIEW；确认关键结构差异→FAIL",
  en:
    "Correspondence plus acceptable accuracy plus no anomaly leads to PASS; an anomaly " +
    "leads to REVIEW; a confirmed critical structural difference leads to FAIL",
};

/** N column text shared verbatim by rows 5 and 6. */
const MASS_FINAL_RULE_B: LocalizedText = {
  zh: "主要形式对应+准确度合格+无异常→PASS；差异→REVIEW；确认关键结构差异→FAIL",
  en:
    "Correspondence of the major forms plus acceptable accuracy plus no anomaly leads " +
    "to PASS; a difference leads to REVIEW; a confirmed critical structural difference " +
    "leads to FAIL",
};

export const similaritySchemes: SimilarityScheme[] = [
  // -------------------------------------------------------------------------
  // Sheet 3 row 2 — 完整分子量
  // -------------------------------------------------------------------------
  {
    itemId: "intact-mass",
    methodIds: [
      "intact-mass-primary-1",
      "intact-mass-orthogonal-1",
      "intact-mass-orthogonal-2",
    ],
    completeness: "complete",
    guidelineTerm: { zh: "完整分子量", en: "Intact molecular mass" },
    characterizationItem: {
      zh: "完整分子质量（intact mass）",
      en: "Intact molecular mass (intact mass)",
    },
    preferredMethod: {
      zh: "LC-ESI-MS（高分辨QTOF/Orbitrap等）",
      en: "LC-ESI-MS (high-resolution QTOF/Orbitrap, etc.)",
    },
    resultType: {
      zh:
        "图谱+数值\n" +
        "原始m/z质谱图；去卷积完整质量谱；主要分子形式质量值（Da）；必要时记录相对峰强/峰型。",
      en:
        "Spectra plus numeric values\n" +
        "Raw m/z mass spectrum; deconvoluted intact mass spectrum; mass values of the " +
        "major molecular forms (Da); relative peak intensity and peak shape recorded " +
        "where necessary.",
    },
    recognizedContent: {
      zh:
        "去卷积实测质量；对应结构的理论质量；实测与理论质量差值（ΔDa或Δppm）；" +
        "方法学误差；质谱图的主要峰归属及整体图谱比较",
      en:
        "Deconvoluted measured mass; theoretical mass of the corresponding structure; " +
        "difference between measured and theoretical mass (ΔDa or Δppm); method error; " +
        "assignment of the major peaks and overall spectral comparison",
    },
    comparisonBaseline: {
      zh: "理论结构；候选药与参照药的头对头比较",
      en:
        "Theoretical structure; head-to-head comparison of the candidate and the " +
        "reference product",
    },
    ruleType: {
      zh: "2.1身份/结构一致；2.2：图谱相似。",
      en: "2.1 identity/structural consistency; 2.2 spectral similarity.",
    },
    ruleTypes: ["identity-structure", "profile-similarity"],
    decisionMethod: {
      zh:
        "① 确认候选药与参照药的主要完整分子形式能够相互对应，并符合理论分子结构；" +
        "② 对已归属分子形式，实测完整质量与相应理论质量的偏差应处于该质谱方法经确认/" +
        "验证的质量准确度范围内；③ 比较候选药与参照药整体质谱图；" +
        "④ 观察到的质量差异应能够由PTM解释，不应存在经确认的、无法合理解释的新分子形式",
      en:
        "(1) Confirm that the major intact molecular forms of the candidate and the " +
        "reference product correspond to each other and are consistent with the " +
        "theoretical molecular structure. (2) For assigned molecular forms, the " +
        "deviation between the measured intact mass and the corresponding theoretical " +
        "mass shall fall within the qualified/validated mass accuracy range of the mass " +
        "spectrometry method. (3) Compare the overall mass spectra of the candidate and " +
        "the reference product. (4) Observed mass differences shall be explainable by " +
        "PTMs; no confirmed, unexplainable new molecular form shall be present.",
    },
    numericBoundary: MASS_NUMERIC_BOUNDARY,
    overflowHandling: {
      zh: "方法超界→复核；真实差异→结构鉴定",
      en:
        "Method out of range leads to re-examination; a genuine difference leads to " +
        "structural identification",
    },
    basis: MASS_BASIS,
    finalProgramRule: MASS_FINAL_RULE_A,
    provenance: provenance(2, []),
  },

  // -------------------------------------------------------------------------
  // Sheet 3 row 3 — 脱糖分子量
  // -------------------------------------------------------------------------
  {
    itemId: "deglycosylated-intact-mass",
    methodIds: [
      "deglycosylated-intact-mass-primary-1",
      "deglycosylated-intact-mass-orthogonal-1",
      "deglycosylated-intact-mass-orthogonal-2",
    ],
    completeness: "complete",
    guidelineTerm: { zh: "脱糖分子量", en: "Deglycosylated molecular mass" },
    characterizationItem: {
      zh: "脱糖完整分子质量",
      en: "Deglycosylated intact molecular mass",
    },
    preferredMethod: {
      zh: "酶法脱糖后 LC-ESI-MS（高分辨QTOF/Orbitrap等）",
      en:
        "LC-ESI-MS after enzymatic deglycosylation (high-resolution QTOF/Orbitrap, etc.)",
    },
    resultType: {
      zh: "图谱+数值\n原始m/z质谱图；去卷积脱糖质量谱；主要脱糖分子形式质量值（Da）",
      en:
        "Spectra plus numeric values\n" +
        "Raw m/z mass spectrum; deconvoluted deglycosylated mass spectrum; mass values " +
        "of the major deglycosylated molecular forms (Da)",
    },
    recognizedContent: {
      zh:
        "去卷积实测质量；对应结构的理论脱糖质量；实测与理论质量差值（ΔDa或Δppm）；" +
        "方法学误差；主要峰归属及异常新峰",
      en:
        "Deconvoluted measured mass; theoretical deglycosylated mass of the " +
        "corresponding structure; difference between measured and theoretical mass " +
        "(ΔDa or Δppm); method error; assignment of the major peaks and any abnormal " +
        "new peaks",
    },
    comparisonBaseline: {
      zh: "理论脱糖结构；候选药与参照药的头对头比较",
      en:
        "Theoretical deglycosylated structure; head-to-head comparison of the candidate " +
        "and the reference product",
    },
    ruleType: {
      zh: "2.1身份/结构一致（主要）；2.2：图谱相似。",
      en: "2.1 identity/structural consistency (primary); 2.2 spectral similarity.",
    },
    ruleTypes: ["identity-structure", "profile-similarity"],
    decisionMethod: {
      zh:
        "①确认候选药与参照药主要脱糖分子形式相互对应并符合理论结构；" +
        "②实测质量与理论质量偏差应处于经确认/验证的方法准确度范围内；" +
        "③比较候选药与参照药整体脱糖质量谱；" +
        "④差异应可由已知PTM解释，不应存在无法合理解释的新分子形式",
      en:
        "(1) Confirm that the major deglycosylated molecular forms of the candidate and " +
        "the reference product correspond to each other and are consistent with the " +
        "theoretical structure. (2) The deviation between measured and theoretical mass " +
        "shall fall within the qualified/validated accuracy range of the method. " +
        "(3) Compare the overall deglycosylated mass spectra. (4) Differences shall be " +
        "explainable by known PTMs; no unexplainable new molecular form shall be present.",
    },
    numericBoundary: MASS_NUMERIC_BOUNDARY,
    overflowHandling: {
      zh: "方法超界→复核；真实差异→结构鉴定",
      en:
        "Method out of range leads to re-examination; a genuine difference leads to " +
        "structural identification",
    },
    basis: MASS_BASIS,
    finalProgramRule: MASS_FINAL_RULE_A,
    provenance: provenance(3, []),
  },

  // -------------------------------------------------------------------------
  // Sheet 3 row 4 — 轻链分子量
  // -------------------------------------------------------------------------
  {
    itemId: "light-chain-mass",
    methodIds: [
      "light-chain-mass-primary-1",
      "light-chain-mass-orthogonal-1",
      "light-chain-mass-orthogonal-2",
    ],
    completeness: "complete",
    guidelineTerm: { zh: "轻链分子量", en: "Light chain molecular mass" },
    characterizationItem: { zh: "轻链分子质量", en: "Light chain molecular mass" },
    preferredMethod: {
      zh: "还原后LC-ESI-MS（高分辨QTOF/Orbitrap等）",
      en: "LC-ESI-MS after reduction (high-resolution QTOF/Orbitrap, etc.)",
    },
    resultType: {
      zh: "图谱+数值\n去卷积轻链质量谱；主要轻链分子形式质量值（Da）",
      en:
        "Spectra plus numeric values\n" +
        "Deconvoluted light chain mass spectrum; mass values of the major light chain " +
        "molecular forms (Da)",
    },
    recognizedContent: {
      zh:
        "去卷积实测质量；理论轻链质量；实测与理论质量差值（ΔDa或Δppm）；" +
        "方法学误差；主要峰归属及异常新峰",
      en:
        "Deconvoluted measured mass; theoretical light chain mass; difference between " +
        "measured and theoretical mass (ΔDa or Δppm); method error; assignment of the " +
        "major peaks and any abnormal new peaks",
    },
    comparisonBaseline: {
      zh: "理论轻链结构；候选药与参照药的头对头比较",
      en:
        "Theoretical light chain structure; head-to-head comparison of the candidate " +
        "and the reference product",
    },
    ruleType: {
      zh: "2.1身份/结构一致；2.2：图谱相似。",
      en: "2.1 identity/structural consistency; 2.2 spectral similarity.",
    },
    ruleTypes: ["identity-structure", "profile-similarity"],
    decisionMethod: {
      zh:
        "①主要轻链分子形式与RP对应并符合理论结构；②实测质量与理论质量偏差符合方法准确度要求；" +
        "③整体轻链质量谱相似；④不应存在无法解释的新分子形式",
      en:
        "(1) The major light chain molecular forms correspond to those of the reference " +
        "product and are consistent with the theoretical structure. (2) The deviation " +
        "between measured and theoretical mass meets the method accuracy requirement. " +
        "(3) The overall light chain mass spectra are similar. (4) No unexplainable new " +
        "molecular form shall be present.",
    },
    numericBoundary: MASS_NUMERIC_BOUNDARY,
    overflowHandling: {
      zh: "方法超界→复核；真实差异→肽图/MS/MS等结构鉴定",
      en:
        "Method out of range leads to re-examination; a genuine difference leads to " +
        "structural identification such as peptide mapping or MS/MS",
    },
    basis: MASS_BASIS,
    finalProgramRule: MASS_FINAL_RULE_A,
    provenance: provenance(4, []),
  },

  // -------------------------------------------------------------------------
  // Sheet 3 row 5 — 非脱糖重链分子量
  // Column A is empty and "示例原项" sits in column B, displacing the CTD
  // section. The item text itself is unaffected.
  // -------------------------------------------------------------------------
  {
    itemId: "non-deglycosylated-heavy-chain-mass",
    methodIds: [
      "non-deglycosylated-heavy-chain-mass-primary-1",
      "non-deglycosylated-heavy-chain-mass-orthogonal-1",
      "non-deglycosylated-heavy-chain-mass-orthogonal-2",
    ],
    completeness: "complete",
    guidelineTerm: {
      zh: "非脱糖重链分子量",
      en: "Non-deglycosylated heavy chain molecular mass",
    },
    characterizationItem: {
      zh: "非脱糖重链分子质量",
      en: "Non-deglycosylated heavy chain molecular mass",
    },
    preferredMethod: {
      zh: "还原后LC-ESI-MS（高分辨QTOF/Orbitrap等）",
      en: "LC-ESI-MS after reduction (high-resolution QTOF/Orbitrap, etc.)",
    },
    resultType: {
      zh: "图谱+数值\n去卷积重链质量谱；主要重链分子形式质量值（Da）",
      en:
        "Spectra plus numeric values\n" +
        "Deconvoluted heavy chain mass spectrum; mass values of the major heavy chain " +
        "molecular forms (Da)",
    },
    recognizedContent: {
      zh:
        "去卷积实测质量；理论重链质量；实测与理论质量差值（ΔDa或Δppm）；" +
        "方法学误差；主要糖型/PTM峰归属及异常新峰",
      en:
        "Deconvoluted measured mass; theoretical heavy chain mass; difference between " +
        "measured and theoretical mass (ΔDa or Δppm); method error; assignment of the " +
        "major glycoform/PTM peaks and any abnormal new peaks",
    },
    comparisonBaseline: {
      zh: "理论重链结构；候选药与参照药的头对头比较",
      en:
        "Theoretical heavy chain structure; head-to-head comparison of the candidate " +
        "and the reference product",
    },
    ruleType: {
      zh: "2.1身份/结构一致；2.2：图谱相似。",
      en: "2.1 identity/structural consistency; 2.2 spectral similarity.",
    },
    ruleTypes: ["identity-structure", "profile-similarity"],
    decisionMethod: {
      zh:
        "①主要重链分子形式与RP对应并符合理论结构；②实测质量符合方法准确度要求；" +
        "③整体质量谱模式相似；④差异应可由糖型/PTM解释，无无法解释的新形式",
      en:
        "(1) The major heavy chain molecular forms correspond to those of the reference " +
        "product and are consistent with the theoretical structure. (2) The measured " +
        "mass meets the method accuracy requirement. (3) The overall mass spectral " +
        "pattern is similar. (4) Differences shall be explainable by glycoforms or PTMs, " +
        "with no unexplainable new form.",
    },
    numericBoundary: MASS_NUMERIC_BOUNDARY,
    overflowHandling: {
      zh: "方法超界→复核；真实差异→糖型/PTM及肽图等结构鉴定",
      en:
        "Method out of range leads to re-examination; a genuine difference leads to " +
        "structural identification such as glycoform/PTM analysis and peptide mapping",
    },
    basis: MASS_BASIS,
    finalProgramRule: MASS_FINAL_RULE_B,
    provenance: provenance(5, ["A"]),
  },

  // -------------------------------------------------------------------------
  // Sheet 3 row 6 — 脱糖后重链分子量
  // Same column-A displacement as row 5.
  // -------------------------------------------------------------------------
  {
    itemId: "deglycosylated-heavy-chain-mass",
    methodIds: [
      "deglycosylated-heavy-chain-mass-primary-1",
      "deglycosylated-heavy-chain-mass-orthogonal-1",
      "deglycosylated-heavy-chain-mass-orthogonal-2",
    ],
    completeness: "complete",
    guidelineTerm: {
      zh: "脱糖后重链分子量",
      en: "Deglycosylated heavy chain molecular mass",
    },
    characterizationItem: {
      zh: "脱糖后重链分子质量",
      en: "Deglycosylated heavy chain molecular mass",
    },
    preferredMethod: {
      // Verbatim from the worksheet, including the duplicated "后后".
      zh: "还原+酶法脱糖后后LC-ESI-MS（高分辨QTOF/Orbitrap等）",
      en:
        "LC-ESI-MS after reduction and enzymatic deglycosylation (high-resolution " +
        "QTOF/Orbitrap, etc.)",
    },
    resultType: {
      zh: "图谱+数值\n去卷积脱糖重链质量谱；主要重链分子形式质量值（Da）",
      en:
        "Spectra plus numeric values\n" +
        "Deconvoluted deglycosylated heavy chain mass spectrum; mass values of the major " +
        "heavy chain molecular forms (Da)",
    },
    recognizedContent: {
      zh: "实测/理论质量；ΔDa/Δppm；主要峰归属；异常新峰",
      en:
        "Measured and theoretical mass; ΔDa/Δppm; assignment of the major peaks; " +
        "abnormal new peaks",
    },
    comparisonBaseline: {
      zh: "理论脱糖重链结构；候选药与参照药的头对头比较",
      en:
        "Theoretical deglycosylated heavy chain structure; head-to-head comparison of " +
        "the candidate and the reference product",
    },
    ruleType: {
      zh: "2.1身份/结构一致；2.2：图谱相似。",
      en: "2.1 identity/structural consistency; 2.2 spectral similarity.",
    },
    ruleTypes: ["identity-structure", "profile-similarity"],
    decisionMethod: {
      zh:
        "①主要脱糖重链形式与RP对应并符合理论结构；②实测质量符合方法准确度要求；" +
        "③整体质量谱相似；④不应存在无法解释的新分子形式",
      en:
        "(1) The major deglycosylated heavy chain forms correspond to those of the " +
        "reference product and are consistent with the theoretical structure. (2) The " +
        "measured mass meets the method accuracy requirement. (3) The overall mass " +
        "spectra are similar. (4) No unexplainable new molecular form shall be present.",
    },
    numericBoundary: MASS_NUMERIC_BOUNDARY,
    overflowHandling: {
      zh: "方法超界→复核；真实差异→PTM及肽图等结构鉴定",
      en:
        "Method out of range leads to re-examination; a genuine difference leads to " +
        "structural identification such as PTM analysis and peptide mapping",
    },
    basis: MASS_BASIS,
    finalProgramRule: MASS_FINAL_RULE_B,
    provenance: provenance(6, ["A"]),
  },

  // -------------------------------------------------------------------------
  // Sheet 3 row 7 — 序列覆盖率/一级质谱
  // -------------------------------------------------------------------------
  {
    itemId: "ms1-sequence-coverage",
    methodIds: [
      "ms1-sequence-coverage-primary-1",
      "ms1-sequence-coverage-orthogonal-1",
      "ms1-sequence-coverage-orthogonal-2",
    ],
    completeness: "complete",
    guidelineTerm: {
      zh: "序列覆盖率/一级质谱",
      en: "Sequence coverage / MS1",
    },
    characterizationItem: {
      zh: "一级质谱肽图序列覆盖率（MS1 sequence coverage）",
      en: "MS1 peptide map sequence coverage",
    },
    preferredMethod: {
      zh: "酶切肽图LC-HRMS（MS1）",
      en: "Enzymatic peptide mapping LC-HRMS (MS1)",
    },
    resultType: {
      zh: "肽图+表格/数值\nLC-MS肽图/TIC＋肽段匹配结果＋序列覆盖率（%）",
      en:
        "Peptide map plus table/numeric values\n" +
        "LC-MS peptide map/TIC, peptide matching results and sequence coverage (%)",
    },
    recognizedContent: {
      zh: "实测/理论肽质量、Δppm、匹配肽段、覆盖区段、覆盖率（%）",
      en:
        "Measured and theoretical peptide masses, Δppm, matched peptides, covered " +
        "segments and coverage (%)",
    },
    comparisonBaseline: {
      zh: "理论氨基酸序列；候选药与参照药头对头比较",
      en:
        "Theoretical amino acid sequence; head-to-head comparison of the candidate and " +
        "the reference product",
    },
    ruleType: { zh: "2.1身份/结构一致", en: "2.1 identity/structural consistency" },
    ruleTypes: ["identity-structure"],
    decisionMethod: {
      zh:
        "检出肽段质量应与理论肽匹配；候选药与RP应获得充分且一致的序列覆盖，" +
        "无无法解释的序列差异",
      en:
        "The masses of detected peptides shall match the theoretical peptides; the " +
        "candidate and the reference product shall achieve sufficient and consistent " +
        "sequence coverage with no unexplainable sequence difference",
    },
    numericBoundary: {
      zh:
        "无序列覆盖率（Sequence Coverage）的统一合格判定阈值，" +
        "应获得足以支持一级结构确认的覆盖，尽可能实现完整覆盖",
      en:
        "There is no unified acceptance threshold for sequence coverage; coverage " +
        "sufficient to support confirmation of the primary structure shall be achieved, " +
        "with complete coverage sought wherever possible",
    },
    overflowHandling: {
      zh: "覆盖不足→补充酶切/质谱分析；真实序列差异→结构鉴定",
      en:
        "Insufficient coverage leads to supplementary digestion or mass spectrometry; a " +
        "genuine sequence difference leads to structural identification",
    },
    basis: COVERAGE_BASIS,
    finalProgramRule: {
      zh: "覆盖充分+肽段匹配+无序列异常→PASS；覆盖不足→REVIEW；确认关键序列差异→FAIL",
      en:
        "Sufficient coverage plus peptide matching plus no sequence anomaly leads to " +
        "PASS; insufficient coverage leads to REVIEW; a confirmed critical sequence " +
        "difference leads to FAIL",
    },
    provenance: provenance(7, ["A"]),
  },

  // -------------------------------------------------------------------------
  // Sheet 3 row 8 — 序列覆盖率/二级质谱
  // Columns A and B are empty; B is covered by the merged range B7:B8.
  // -------------------------------------------------------------------------
  {
    itemId: "msms-sequence-coverage",
    methodIds: [
      "msms-sequence-coverage-primary-1",
      "msms-sequence-coverage-orthogonal-1",
      "msms-sequence-coverage-orthogonal-2",
    ],
    completeness: "complete",
    guidelineTerm: {
      zh: "序列覆盖率/二级质谱",
      en: "Sequence coverage / MS/MS",
    },
    characterizationItem: {
      zh: "二级质谱序列确认覆盖率（MS/MS sequence coverage）",
      en: "MS/MS sequence confirmation coverage",
    },
    preferredMethod: {
      zh: "酶切肽图LC-MS/MS（HRMS）",
      en: "Enzymatic peptide mapping LC-MS/MS (HRMS)",
    },
    resultType: {
      zh: "MS/MS谱+数值\nMS/MS碎片谱/序列覆盖图＋序列覆盖率（%）",
      en:
        "MS/MS spectra plus numeric values\n" +
        "MS/MS fragment spectra and sequence coverage map, plus sequence coverage (%)",
    },
    recognizedContent: {
      zh: "鉴定肽段、碎片离子匹配、覆盖区段、覆盖率（%）、未覆盖区段",
      en:
        "Identified peptides, fragment ion matching, covered segments, coverage (%) and " +
        "uncovered segments",
    },
    comparisonBaseline: {
      zh: "理论氨基酸序列；候选药与参照药头对头比较",
      en:
        "Theoretical amino acid sequence; head-to-head comparison of the candidate and " +
        "the reference product",
    },
    ruleType: { zh: "2.1身份/结构一致", en: "2.1 identity/structural consistency" },
    ruleTypes: ["identity-structure"],
    decisionMethod: {
      zh:
        "MS/MS碎片应支持理论肽序列；候选药与RP应获得充分序列确认，" +
        "无无法解释的氨基酸序列差异",
      en:
        "MS/MS fragments shall support the theoretical peptide sequence; the candidate " +
        "and the reference product shall achieve sufficient sequence confirmation with " +
        "no unexplainable amino acid sequence difference",
    },
    numericBoundary: {
      zh:
        "无序列覆盖率（Sequence Coverage）的统一合格判定阈值，" +
        "应获得足以确认一级结构的MS/MS覆盖，尽可能实现完整覆盖",
      en:
        "There is no unified acceptance threshold for sequence coverage; MS/MS coverage " +
        "sufficient to confirm the primary structure shall be achieved, with complete " +
        "coverage sought wherever possible",
    },
    overflowHandling: {
      zh: "覆盖不足→补充酶切/MS/MS；真实序列差异→进一步定位确认",
      en:
        "Insufficient coverage leads to supplementary digestion or MS/MS; a genuine " +
        "sequence difference leads to further localisation and confirmation",
    },
    basis: COVERAGE_BASIS,
    finalProgramRule: {
      zh: "序列确认充分+无序列异常→PASS；覆盖不足→REVIEW；确认关键序列差异→FAIL",
      en:
        "Sufficient sequence confirmation plus no sequence anomaly leads to PASS; " +
        "insufficient coverage leads to REVIEW; a confirmed critical sequence difference " +
        "leads to FAIL",
    },
    provenance: provenance(8, ["A", "B"]),
  },

  // -------------------------------------------------------------------------
  // Sheet 3 row 11 — CDR区特征肽段鉴别
  // Columns A and G through N are empty, so there is no programmable rule.
  // -------------------------------------------------------------------------
  {
    itemId: "cdr-signature-peptides",
    methodIds: [],
    completeness: "partial",
    guidelineTerm: {
      zh: "CDR区特征肽段鉴别",
      en: "Identification of CDR signature peptides",
    },
    characterizationItem: {
      zh: "CDR区特征肽段鉴别（CDR-specific peptide identification）",
      en: "CDR-specific peptide identification",
    },
    preferredMethod: {
      zh: "酶切肽图LC-MS/MS（HRMS）",
      en: "Enzymatic peptide mapping LC-MS/MS (HRMS)",
    },
    resultType: {
      zh: "LC肽图/提取离子图＋MS/MS碎片谱＋肽段鉴定结果",
      en:
        "LC peptide map / extracted ion chromatogram, MS/MS fragment spectra and peptide " +
        "identification results",
    },
    notDefinedReason: {
      zh:
        "V2 汇总表 Sheet3 第 11 行仅填写至 F 列（结果类型），" +
        "G 识别内容、H 比较基准、I 判定规则类型、J 判定方法、K 数值边界、L 超界处理、" +
        "M 主要依据、N 最终程序规则均为空。" +
        "本系统可以完成 CDR 区特征肽的提取与比较并展示结果，" +
        "但不得输出相似性判定，须由人工复核。",
      en:
        "Row 11 of sheet 3 in the V2 workbook is populated only up to column F (result " +
        "type). Columns G (recognized content), H (comparison baseline), I (rule type), " +
        "J (decision method), K (numerical boundary), L (out-of-range handling), M " +
        "(basis) and N (final program rule) are all empty. The system can extract and " +
        "compare CDR signature peptides and display the results, but must not issue a " +
        "similarity verdict; human review is required.",
    },
    provenance: provenance(11, [...RULE_COLUMNS, "A"], {}),
  },

  // -------------------------------------------------------------------------
  // No sheet 3 row at all — N/C terminal sequence
  // -------------------------------------------------------------------------
  {
    itemId: "n-c-terminal-sequence",
    methodIds: [],
    completeness: "absent",
    guidelineTerm: { zh: "C/N端氨基酸序列", en: "C/N-terminal amino acid sequence" },
    characterizationItem: {
      zh: "N/C端氨基酸序列及末端异质性",
      en: "N/C-terminal amino acid sequence and terminal heterogeneity",
    },
    notDefinedReason: {
      zh:
        "V2 汇总表 Sheet3 中没有「C/N端氨基酸序列」对应的行（Sheet2 第 12 行有该项目，" +
        "但相似性评价方案未编写）。本系统可以完成 N/C 端肽段的提取、末端异质体比例计算" +
        "与头对头比较并展示结果，但不得输出相似性判定，须由人工复核。",
      en:
        "Sheet 3 of the V2 workbook contains no row for the C/N-terminal amino acid " +
        "sequence (the item exists in sheet 2 row 12, but no similarity evaluation " +
        "scheme was written). The system can extract N/C-terminal peptides, compute " +
        "terminal variant proportions and perform head-to-head comparison, and display " +
        "the results, but must not issue a similarity verdict; human review is required.",
    },
    provenance: {
      sourceWorkbook: SOURCE_WORKBOOK,
      sourceWorkbookSha256: SOURCE_WORKBOOK_SHA256,
      sourceSheet: SOURCE_SHEET,
      // No row exists. 0 marks "absent" rather than pointing at an unrelated row.
      sourceRow: 0,
      sourceCells: {},
      missingCells: [...RULE_COLUMNS, "A", "B", "C", "D", "E", "F"],
    },
  },

  // -------------------------------------------------------------------------
  // No sheet 3 row at all — free thiol
  // -------------------------------------------------------------------------
  {
    itemId: "free-thiol",
    methodIds: [],
    completeness: "absent",
    guidelineTerm: { zh: "游离巯基", en: "Free thiol" },
    characterizationItem: { zh: "游离巯基水平", en: "Free thiol level" },
    notDefinedReason: {
      zh:
        "Sheet3 未定义该项程序规则。" +
        "V2 汇总表 Sheet3 中没有「游离巯基」对应的行（Sheet2 第 13 行有该项目，" +
        "并在数值限度列描述了质量范围法 QR=(μR−XσR, μR+XσR)，" +
        "但 Sheet3 未将其编写为程序规则）。" +
        "按 D17，本系统对该项目完全不运行分析、不计算也不展示 μR/σR/QR/落入比例，" +
        "避免把无规则可依的数值误当成判定结论。面板只声明规则未定义并转人工复核。" +
        "浏览器内 Live Demo 的 QR 计算是合成数据教学演示，不是本项程序评价。",
      en:
        "Sheet 3 defines no program rule for this item. The V2 workbook sheet 3 has no " +
        "row for free thiol (the item exists in sheet 2 row 13, whose numerical-limit " +
        "column describes QR = (μR − XσR, μR + XσR), but sheet 3 does not encode it as " +
        "a program rule). Under D17 the system runs no analysis for this item and does " +
        "not compute or display μR, σR, QR or lot-in-range fractions, so that a number " +
        "without a rule cannot be read as a verdict. The panel states that the rule is " +
        "undefined and routes to human review. The in-browser live demo is a synthetic " +
        "teaching calculation, not a programmatic evaluation of this attribute.",
    },
    provenance: {
      sourceWorkbook: SOURCE_WORKBOOK,
      sourceWorkbookSha256: SOURCE_WORKBOOK_SHA256,
      sourceSheet: SOURCE_SHEET,
      sourceRow: 0,
      sourceCells: {},
      missingCells: [...RULE_COLUMNS, "A", "B", "C", "D", "E", "F"],
    },
  },

  // -------------------------------------------------------------------------
  // No sheet 3 row at all — disulfide bonds
  // -------------------------------------------------------------------------
  {
    itemId: "disulfide-bonds",
    methodIds: [],
    completeness: "absent",
    guidelineTerm: { zh: "二硫键", en: "Disulfide bonds" },
    characterizationItem: { zh: "二硫键连接图谱", en: "Disulfide bond linkage map" },
    notDefinedReason: {
      zh:
        "Sheet3 未定义该项程序规则。" +
        "V2 汇总表 Sheet3 中没有「二硫键」对应的行（Sheet2 第 14 行有该项目，" +
        "但相似性评价方案未编写）。" +
        "按 D17，本系统对该项目完全不运行分析、不提取也不展示连接肽比对结果，" +
        "避免把无规则可依的数值误当成判定结论。面板只声明规则未定义并转人工复核。" +
        "P14 另确认交联肽搜索停在 Blocked/L0：pLink 2/3 仓库无 SPDX 许可证，" +
        "pLink 2.3.11 授权已于 2025-01-10 过期，因此未安装、未跑官方示例。",
      en:
        "Sheet 3 defines no program rule for this item. The V2 workbook sheet 3 has no " +
        "row for disulfide bonds (the item exists in sheet 2 row 14, but no similarity " +
        "evaluation scheme was written). Under D17 the system runs no analysis for this " +
        "item and does not extract or display linked-peptide comparisons, so that a " +
        "number without a rule cannot be read as a verdict. The panel states that the " +
        "rule is undefined and routes to human review. P14 separately records the " +
        "cross-link search as Blocked/L0: pLink 2/3 have no SPDX licence on GitHub, and " +
        "the pLink 2.3.11 licence expired on 2025-01-10, so nothing was installed and no " +
        "official example was run.",
    },
    provenance: {
      sourceWorkbook: SOURCE_WORKBOOK,
      sourceWorkbookSha256: SOURCE_WORKBOOK_SHA256,
      sourceSheet: SOURCE_SHEET,
      sourceRow: 0,
      sourceCells: {},
      missingCells: [...RULE_COLUMNS, "A", "B", "C", "D", "E", "F"],
    },
  },
];

/** Sheet 3 rows that carry no characterization item this project can key on.
 *
 *  Rows 9 and 10 are titled 翻译后修饰—修饰1 / 修饰2 and are explicitly marked
 *  示例占位项 (placeholder examples) in sheet 2. Row 9 column D says
 *  「见表末补充」, pointing at the PTM supplement rows 54 to 57 of sheet 2.
 *  They are recorded here rather than invented into similaritySchemes, because
 *  no item id can be assigned to an unnamed placeholder. */
export const unmappedSheet3Rows = [
  {
    sourceRow: 9,
    guidelineTerm: { zh: "翻译后修饰—修饰1", en: "Post-translational modification 1" },
    populatedCells: ["B", "C", "D"],
    note: {
      zh: "D 列内容为「见表末补充」，指向 Sheet2 第 54 至 57 行的 PTM 补充项；属 PTM 大类，非一级结构。",
      en:
        "Column D reads \"see the supplement at the end of the table\", pointing at the " +
        "PTM supplement rows 54 to 57 of sheet 2. Belongs to the PTM category, not " +
        "primary structure.",
    },
  },
  {
    sourceRow: 10,
    guidelineTerm: { zh: "翻译后修饰—修饰2", en: "Post-translational modification 2" },
    populatedCells: ["B", "C"],
    note: {
      zh: "仅有标题，无表征项目名称；属 PTM 大类，非一级结构。",
      en: "Title only, with no characterization item name. Belongs to the PTM category, not primary structure.",
    },
  },
] as const;

/** Fast lookup by characterization item id. */
export const similaritySchemeByItemId: Record<string, SimilarityScheme> =
  Object.fromEntries(similaritySchemes.map((scheme) => [scheme.itemId, scheme]));

/** Fast lookup by detection method id. Only complete schemes appear here, so a
 *  method can never inherit a rule that sheet 3 did not define. */
export const similaritySchemeByMethodId: Record<string, SimilarityScheme> =
  Object.fromEntries(
    similaritySchemes.flatMap((scheme) =>
      scheme.methodIds.map((methodId) => [methodId, scheme]),
    ),
  );
