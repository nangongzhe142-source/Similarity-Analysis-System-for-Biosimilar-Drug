// Hand-maintained sidecar — NOT generated.
//
// Declares, for every primary-structure detection method, what the analysis
// panel may do with it. The methods themselves come from
// characterization-items.ts (generated from the workbook); this file only says
// which of them the software can actually analyse, and never redefines a method.
//
// Sources of truth for the decisions encoded here:
//   * profile assignment and input contracts:
//       docs/primary-structure-analysis/01-figure-matrix.md
//   * which items carry a usable rule:
//       src/data/similarity-schemes.ts (V2 workbook sheet 3)
//   * scope of this phase (7 items with complete rules run end to end, the rest
//     are declared unsupported rather than half-built):
//       docs/primary-structure-analysis/implementation-plan.md, decision D23
//   * no analysis at all for items without a rule:
//       decision D17, which supersedes D3
//
// Mechanically checked by scripts/verify_method_analysis_config.mjs, which is
// wired into `npm run check`. The checks that matter: all 33 methods present
// exactly once, every methodId and itemId resolvable, one profile per method,
// and the invariants tying status to profile / reason / blockedBy /
// allowsImageFallback.
//
// NOTE: all `en` strings are hand-written here rather than machine-translated,
// because they state scientific limits that a mistranslation would misrepresent.

import type {
  AnalysisProfileConfig,
  AnalysisProfileId,
  MethodAnalysisConfig,
} from "@/types/models";

// ---------------------------------------------------------------------------
// Reasons reused across many methods.
//
// Held as constants so that the twelve rule-not-defined methods cannot drift
// into twelve slightly different explanations of the same decision.
// ---------------------------------------------------------------------------

/** Items whose V2 sheet-3 row is missing or incomplete. Decision D17. */
const RULE_NOT_DEFINED_REASON = {
  zh:
    "V2 汇总表 Sheet3 未为本项目编写可用的判定规则，因此本系统不对该项目运行任何分析，" +
    "面板只声明「规则未定义」并转人工复核。这不是能力不足，而是刻意不产出无规则可依的数值：" +
    "一旦给出 ΔDa、覆盖率或批次统计，读者极易将其误当作判定结论。",
  en:
    "The V2 workbook sheet 3 defines no usable decision rule for this item, so the " +
    "system runs no analysis for it and the panel states that the rule is undefined, " +
    "routing the item to human review. This is a deliberate refusal rather than a " +
    "capability gap: any mass delta, coverage figure or lot statistic shown here " +
    "would be read as a verdict it cannot support.",
};

/** The 相互印证 orthogonal methods. */
const CROSS_CHECK_NOTE = {
  zh:
    "本方法是对其他层级结果的相互印证，不引入新的原始数据。面板复用完整/脱糖/亚基三层" +
    "已有结果做一致性核对，因此其可用性取决于那些层级是否已分析。",
  en:
    "This method cross-checks results from the other levels rather than introducing " +
    "new raw data. The panel reconciles the existing intact, deglycosylated and " +
    "subunit results, so its usefulness depends on those levels having been analysed.",
};

/** Methods whose output is not machine-readable at all. */
const WET_LAB_ONLY_REASON = {
  zh:
    "本方法的产出不是本系统可接收的质谱数据格式，无软件可分析路径，因此只展示原理与" +
    "适用性说明，不提供上传入口。这一状态不会因为继续写代码而改变。",
  en:
    "This method does not produce data in any format the system can ingest, so there " +
    "is no software analysis path. The panel shows the principle and applicability " +
    "only, with no upload control. Writing more code will not change this.",
};

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------

export const analysisProfiles: AnalysisProfileConfig[] = [
  {
    id: "intact-mass",
    title: {
      zh: "完整与亚基分子量（去卷积质量谱）",
      en: "Intact and subunit molecular mass (deconvoluted mass spectra)",
    },
    summary: {
      zh:
        "从原始 m/z 谱去卷积得到质量谱，检出主要分子形式的质量值，与理论质量比对得到 ΔDa / Δppm，" +
        "并将候选与参照的峰配对，报告候选新增峰、候选缺失峰与无法解释的新分子形式。",
      en:
        "Deconvolutes the raw m/z spectrum into a mass spectrum, detects the major " +
        "molecular forms, compares each against the theoretical mass as ΔDa and Δppm, " +
        "pairs candidate peaks with reference peaks, and reports peaks gained, peaks " +
        "lost and any unexplained new molecular form.",
    },
    acceptedInputs: [
      "raw-spectra",
      "structured-export",
      "sequence",
      "figure-image",
    ],
    requiredInputs: ["raw-spectra"],
    evidenceByInput: {
      "raw-spectra": "raw-data-analysis",
      "structured-export": "structured-export-analysis",
      "figure-image": "image-only-exploratory",
    },
    toolDependencies: [
      {
        tool: "msconvert",
        purpose: {
          zh: "P6 已实机验证 Thermo RAW→mzML，但本 adapter 并不调用 msconvert。请先自行导出 mzML 或 TXT/CSV。SCIEX WIFF 未验证，系统不接受。",
          en: "P6 verified Thermo RAW→mzML, but this adapter does not invoke msconvert. Export mzML or TXT/CSV first. SCIEX WIFF is unverified and is not accepted.",
        },
        verifiedBy: "P6",
        verified: false,
      },
    ],
    docxFigures: [1, 2],
    scientificBoundaries: [
      {
        zh:
          "ΔDa 与 Δppm 属于方法的质量准确度指标，不是生物类似性阈值。" +
          "V2 Sheet3 K 列明确「无统一相似性数值限度」，界面不得把它们渲染成合格线。",
        en:
          "ΔDa and Δppm express the mass accuracy of the method, not a biosimilarity " +
          "threshold. Column K of V2 sheet 3 states plainly that no universal numerical " +
          "similarity limit applies, so these values must never be rendered as a pass line.",
      },
      {
        zh:
          "亚基结果必须与完整分子量相互印证。单一亚基质量一致不足以支持整体一级结构一致。",
        en:
          "Subunit results must be reconciled with the intact mass. Agreement on one " +
          "subunit does not by itself support identity of the whole primary structure.",
      },
    ],
  },
  {
    id: "peptide-map",
    title: {
      zh: "酶切肽图色谱比对（镜像/叠加）",
      en: "Peptide map chromatogram comparison (mirror / overlay)",
    },
    summary: {
      zh:
        "提取 TIC/BPC 色谱，做保留时间对齐后以镜像或叠加方式比对，报告主要峰匹配、RT 偏移、" +
        "候选独有峰、参照独有峰、局部差异区间，以及相关系数与 DTW 距离。",
      en:
        "Extracts the TIC or BPC trace, aligns retention time, then compares the two " +
        "runs as a mirror or overlay, reporting matched major peaks, retention-time " +
        "shifts, peaks unique to either side, the intervals where they differ, and " +
        "correlation plus DTW distance.",
    },
    acceptedInputs: [
      "raw-spectra",
      "structured-export",
      "figure-image",
    ],
    requiredInputs: ["raw-spectra"],
    evidenceByInput: {
      "raw-spectra": "raw-data-analysis",
      "structured-export": "structured-export-analysis",
      "figure-image": "image-only-exploratory",
    },
    toolDependencies: [
      {
        tool: "msconvert",
        purpose: {
          zh: "P6 已实机验证 Thermo RAW→mzML，但本 adapter 并不调用 msconvert。请先自行导出 mzML 或 TXT/CSV。SCIEX WIFF 未验证，系统不接受。",
          en: "P6 verified Thermo RAW→mzML, but this adapter does not invoke msconvert. Export mzML or TXT/CSV first. SCIEX WIFF is unverified and is not accepted.",
        },
        verifiedBy: "P6",
        verified: false,
      },
    ],
    docxFigures: [3],
    scientificBoundaries: [
      {
        zh:
          "仅凭肽图相似不得声称序列已确认。色谱相似只是 V2 判定类型 2.2「图谱相似」层级的证据，" +
          "与类型 2.1「身份/结构一致」不是同一件事。",
        en:
          "A similar peptide map does not confirm a sequence. Chromatographic similarity " +
          "is evidence at the level of V2 decision type 2.2, profile similarity, which is " +
          "not the same claim as type 2.1, identity of structure.",
      },
    ],
  },
  {
    id: "ms1-coverage",
    title: {
      zh: "MS1 肽段质量匹配与序列覆盖率",
      en: "MS1 peptide mass matching and sequence coverage",
    },
    summary: {
      zh:
        "按酶切规则从理论序列生成肽段，与实测 MS1 质量在给定容差内匹配，输出匹配肽段、" +
        "未匹配肽段、覆盖率及**未覆盖区域**，并单列 CDR 与 N/C 端的覆盖情况。",
      en:
        "Digests the theoretical sequence in silico, matches the peptides against " +
        "measured MS1 masses within a stated tolerance, and reports matched peptides, " +
        "unmatched peptides, coverage and the regions left uncovered, with CDR and " +
        "terminal coverage listed separately.",
    },
    acceptedInputs: [
      "raw-spectra",
      "structured-export",
      "sequence",
      "figure-image",
    ],
    requiredInputs: ["sequence", "raw-spectra"],
    evidenceByInput: {
      "raw-spectra": "raw-data-analysis",
      "structured-export": "structured-export-analysis",
      "figure-image": "image-only-exploratory",
    },
    toolDependencies: [
      {
        tool: "msconvert",
        purpose: {
          zh: "P6 已实机验证 Thermo RAW→mzML，但本 adapter 并不调用 msconvert。请先自行导出 mzML 或 TXT/CSV。SCIEX WIFF 未验证，系统不接受。",
          en: "P6 verified Thermo RAW→mzML, but this adapter does not invoke msconvert. Export mzML or TXT/CSV first. SCIEX WIFF is unverified and is not accepted.",
        },
        verifiedBy: "P6",
        verified: false,
      },
    ],
    docxFigures: [4],
    scientificBoundaries: [
      {
        zh:
          "MS1 质量匹配只能支持「可能对应该肽段」，不能替代 MS/MS 序列确认。" +
          "关键区域仅有 MS1 证据时，判定结果为 REVIEW 而非通过。",
        en:
          "An MS1 mass match supports only that a peptide may correspond to that mass; it " +
          "cannot replace MS/MS sequence confirmation. Where a critical region rests on " +
          "MS1 evidence alone the verdict is REVIEW, not pass.",
      },
      {
        zh:
          "覆盖率必须连同未覆盖区域一起报告，且必须写明口径" +
          "（Control / Analyte / Combined / Common / Analyte-unique），不得只报一个百分比。" +
          "V2 Sheet3 明确「无序列覆盖率的统一合格判定阈值」。",
        en:
          "Coverage must be reported together with the uncovered regions and must state " +
          "which definition it uses (control, analyte, combined, common or analyte-unique). " +
          "A single percentage is not an acceptable report, and V2 sheet 3 states that no " +
          "universal coverage acceptance threshold applies.",
      },
    ],
  },
  {
    id: "msms-sequence",
    title: {
      zh: "MS/MS 碎片谱与序列确证",
      en: "MS/MS fragment spectra and sequence confirmation",
    },
    summary: {
      zh:
        "对 MS/MS 谱做搜库与 FDR 控制，标注 b/y 碎片，输出确认肽段、未确认肽段、残基级覆盖、" +
        "以及候选与参照的差异位点。",
      en:
        "Searches the MS/MS spectra with FDR control, annotates b and y fragments, and " +
        "reports confirmed peptides, unconfirmed peptides, residue-level coverage and the " +
        "positions at which candidate and reference differ.",
    },
    acceptedInputs: [
      "raw-spectra",
      "peak-list",
      "structured-export",
      "sequence",
      "figure-image",
    ],
    requiredInputs: ["sequence", "raw-spectra"],
    evidenceByInput: {
      "raw-spectra": "raw-data-analysis",
      "peak-list": "raw-data-analysis",
      "structured-export": "structured-export-analysis",
      "figure-image": "image-only-exploratory",
    },
    toolDependencies: [
      {
        tool: "comet",
        purpose: {
          zh: "MS/MS 搜库与 PSM 打分，是序列确证的前提。",
          en: "Searches MS/MS spectra and scores PSMs; a precondition for confirming a sequence.",
        },
        verifiedBy: "P9",
        verified: true,
      },
      {
        tool: "msconvert",
        purpose: {
          zh: "P6 已实机验证 Thermo RAW→mzML，但本 adapter 并不调用 msconvert。请先自行导出 mzML 或 MGF。SCIEX WIFF 未验证，系统不接受。",
          en: "P6 verified Thermo RAW→mzML, but this adapter does not invoke msconvert. Export mzML or MGF first. SCIEX WIFF is unverified and is not accepted.",
        },
        verifiedBy: "P6",
        verified: false,
      },
    ],
    docxFigures: [5, 6],
    scientificBoundaries: [
      {
        zh:
          "未建立可靠搜库与 FDR 控制前，不得声称序列已确认。DOCX 图 5 正是反例：" +
          "HT35 肽 EEMTK → DELTK 的双残基替换说明「图谱相似」与「序列一致」必须严格区分。",
        en:
          "Without a search engine and FDR control in place, no sequence may be declared " +
          "confirmed. DOCX figure 5 is the cautionary case: the HT35 peptide differs as " +
          "EEMTK against DELTK, a two-residue substitution, which is exactly why profile " +
          "similarity and sequence identity must not be conflated.",
      },
      {
        zh:
          "覆盖率数字本身不是合格判据。DOCX 图 6 中 Analyte coverage 为 0.0% 却总覆盖 99.8%，" +
          "说明必须区分覆盖率口径，不得混报。",
        en:
          "A coverage percentage is not an acceptance criterion in itself. In DOCX figure 6 " +
          "the analyte coverage is 0.0% while total coverage is 99.8%, which shows why the " +
          "different coverage definitions must be kept apart.",
      },
    ],
  },
  {
    id: "curve-overlay",
    title: {
      zh: "曲线叠加比对（SEC / 电荷 / CD 演示）",
      en: "Curve overlay comparison (SEC / charge / CD demo)",
    },
    summary: {
      zh:
        "读取两列 x–y 表，对齐到同一网格后计算 Pearson 相关、RMSE、峰位置与分区面积%。" +
        "用于 SEC 聚集体、酸性电荷变异体与远紫外 CD 的合成演示。没有 Sheet3 程序规则，结论固定为复核。",
      en:
        "Reads two-column x–y tables, interpolates them onto one grid, and reports Pearson " +
        "correlation, RMSE, peak positions and region area %. Used for the SEC aggregate, " +
        "acidic charge-variant and far-UV CD synthetic demos. There is no Sheet3 program " +
        "rule; the verdict stays REVIEW.",
    },
    acceptedInputs: ["structured-export"],
    requiredInputs: ["structured-export"],
    evidenceByInput: {
      "structured-export": "structured-export-analysis",
    },
    toolDependencies: [
      {
        tool: "numpy",
        purpose: {
          zh: "网格对齐、相关、积分与检峰。",
          en: "Grid alignment, correlation, integration and peak picking.",
        },
        verifiedBy: "P26",
        verified: true,
      },
    ],
    docxFigures: [],
    scientificBoundaries: [
      {
        zh:
          "Pearson 相关与面积差百分点是算法质量门，不是生物类似性限度。本 profile 的输入可以是合成夹具。",
        en:
          "Pearson correlation and area-percentage deltas are algorithm quality gates, not " +
          "biosimilarity limits. Inputs to this profile may be synthetic fixtures.",
      },
      {
        zh:
          "V2 Sheet3 未为这三项编写程序规则，因此不得输出相似性 PASS。",
        en:
          "V2 sheet 3 defines no program rule for these items, so a similarity PASS must not be emitted.",
      },
    ],
  },
];

export const analysisProfileById: Record<AnalysisProfileId, AnalysisProfileConfig> =
  analysisProfiles.reduce(
    (accumulator, profile) => {
      accumulator[profile.id] = profile;
      return accumulator;
    },
    {} as Record<AnalysisProfileId, AnalysisProfileConfig>,
  );

// ---------------------------------------------------------------------------
// Methods
//
// Order follows characterization-items.ts so the two files can be read side by
// side. All 33 primary-structure methods appear exactly once.
// ---------------------------------------------------------------------------

export const methodAnalysisConfigs: MethodAnalysisConfig[] = [
  // -------------------------------------------------------------------------
  // 完整分子量 — sheet 3 row 2, rule complete
  // -------------------------------------------------------------------------
  {
    methodId: "intact-mass-primary-1",
    itemId: "intact-mass",
    status: "analyzable",
    profile: "intact-mass",
    allowsImageFallback: true,
    plannedIn: "P7",
  },
  {
    methodId: "intact-mass-orthogonal-1",
    itemId: "intact-mass",
    status: "analyzable",
    profile: "peptide-map",
    allowsImageFallback: true,
    plannedIn: "P8",
  },
  {
    methodId: "intact-mass-orthogonal-2",
    itemId: "intact-mass",
    status: "analyzable",
    profile: "intact-mass",
    statusReason: CROSS_CHECK_NOTE,
    allowsImageFallback: false,
    plannedIn: "P7",
  },

  // -------------------------------------------------------------------------
  // 脱糖分子量 — sheet 3 row 3, rule complete
  // -------------------------------------------------------------------------
  {
    methodId: "deglycosylated-intact-mass-primary-1",
    itemId: "deglycosylated-intact-mass",
    status: "analyzable",
    profile: "intact-mass",
    allowsImageFallback: true,
    plannedIn: "P7",
  },
  {
    methodId: "deglycosylated-intact-mass-orthogonal-1",
    itemId: "deglycosylated-intact-mass",
    status: "analyzable",
    profile: "peptide-map",
    allowsImageFallback: true,
    plannedIn: "P8",
  },
  {
    methodId: "deglycosylated-intact-mass-orthogonal-2",
    itemId: "deglycosylated-intact-mass",
    status: "analyzable",
    profile: "intact-mass",
    statusReason: CROSS_CHECK_NOTE,
    allowsImageFallback: false,
    plannedIn: "P7",
  },

  // -------------------------------------------------------------------------
  // 轻链分子量 — sheet 3 row 4, rule complete
  // -------------------------------------------------------------------------
  {
    methodId: "light-chain-mass-primary-1",
    itemId: "light-chain-mass",
    status: "analyzable",
    profile: "intact-mass",
    allowsImageFallback: true,
    plannedIn: "P7",
  },
  {
    methodId: "light-chain-mass-orthogonal-1",
    itemId: "light-chain-mass",
    status: "analyzable",
    profile: "peptide-map",
    allowsImageFallback: true,
    plannedIn: "P8",
  },
  {
    methodId: "light-chain-mass-orthogonal-2",
    itemId: "light-chain-mass",
    status: "analyzable",
    profile: "intact-mass",
    statusReason: CROSS_CHECK_NOTE,
    allowsImageFallback: false,
    plannedIn: "P7",
  },

  // -------------------------------------------------------------------------
  // 非脱糖重链分子量 — sheet 3 row 5, rule complete
  // -------------------------------------------------------------------------
  {
    methodId: "non-deglycosylated-heavy-chain-mass-primary-1",
    itemId: "non-deglycosylated-heavy-chain-mass",
    status: "analyzable",
    profile: "intact-mass",
    allowsImageFallback: true,
    plannedIn: "P7",
  },
  {
    methodId: "non-deglycosylated-heavy-chain-mass-orthogonal-1",
    itemId: "non-deglycosylated-heavy-chain-mass",
    status: "analyzable",
    profile: "peptide-map",
    allowsImageFallback: true,
    plannedIn: "P8",
  },
  {
    methodId: "non-deglycosylated-heavy-chain-mass-orthogonal-2",
    itemId: "non-deglycosylated-heavy-chain-mass",
    status: "analyzable",
    profile: "intact-mass",
    statusReason: CROSS_CHECK_NOTE,
    allowsImageFallback: false,
    plannedIn: "P7",
  },

  // -------------------------------------------------------------------------
  // 脱糖后重链分子量 — sheet 3 row 6, rule complete
  // -------------------------------------------------------------------------
  {
    methodId: "deglycosylated-heavy-chain-mass-primary-1",
    itemId: "deglycosylated-heavy-chain-mass",
    status: "analyzable",
    profile: "intact-mass",
    allowsImageFallback: true,
    plannedIn: "P7",
  },
  {
    methodId: "deglycosylated-heavy-chain-mass-orthogonal-1",
    itemId: "deglycosylated-heavy-chain-mass",
    status: "analyzable",
    profile: "peptide-map",
    allowsImageFallback: true,
    plannedIn: "P8",
  },
  {
    methodId: "deglycosylated-heavy-chain-mass-orthogonal-2",
    itemId: "deglycosylated-heavy-chain-mass",
    status: "analyzable",
    profile: "intact-mass",
    statusReason: CROSS_CHECK_NOTE,
    allowsImageFallback: false,
    plannedIn: "P7",
  },

  // -------------------------------------------------------------------------
  // 序列覆盖率/一级质谱 — sheet 3 row 7, rule complete
  // -------------------------------------------------------------------------
  {
    methodId: "ms1-sequence-coverage-primary-1",
    itemId: "ms1-sequence-coverage",
    status: "analyzable",
    profile: "ms1-coverage",
    allowsImageFallback: true,
    plannedIn: "P8",
  },
  {
    // 正交方法为 LC-MS/MS。该方法本身要搜库，因此与 msms-sequence 同受 Comet 阻塞。
    methodId: "ms1-sequence-coverage-orthogonal-1",
    itemId: "ms1-sequence-coverage",
    status: "analyzable",
    profile: "msms-sequence",
    allowsImageFallback: true,
    plannedIn: "P9",
  },
  {
    // 「增加其他蛋白酶」：换酶后仍是 MS1 质量匹配与覆盖率合并，故归 ms1-coverage。
    // P1 图谱矩阵曾把本条归入 peptide-map，P3 据此更正，理由见 P3 日志。
    methodId: "ms1-sequence-coverage-orthogonal-2",
    itemId: "ms1-sequence-coverage",
    status: "analyzable",
    profile: "ms1-coverage",
    allowsImageFallback: false,
    plannedIn: "P8",
  },

  // -------------------------------------------------------------------------
  // 序列覆盖率/二级质谱 — sheet 3 row 8, rule complete
  // -------------------------------------------------------------------------
  {
    methodId: "msms-sequence-coverage-primary-1",
    itemId: "msms-sequence-coverage",
    status: "analyzable",
    profile: "msms-sequence",
    allowsImageFallback: true,
    plannedIn: "P9",
  },
  {
    methodId: "msms-sequence-coverage-orthogonal-1",
    itemId: "msms-sequence-coverage",
    status: "analyzable",
    profile: "msms-sequence",
    allowsImageFallback: true,
    plannedIn: "P9",
  },
  {
    // 端基分析：其结论来自 N/C 端项目，而该项目按 D17 无规则不分析，
    // 因此本条没有可运行的分析路径，只展示。
    methodId: "msms-sequence-coverage-orthogonal-2",
    itemId: "msms-sequence-coverage",
    status: "display-only",
    statusReason: {
      zh:
        "端基分析的结论归属于「C/N 端氨基酸序列」项目，而该项目在 V2 Sheet3 中没有可用规则，" +
        "按决策 D17 不运行分析。因此本方法在本项目内只作原理展示，不单独提供上传入口，" +
        "避免出现一个算得出数值却无规则可依的入口。",
      en:
        "Terminal analysis reports into the C/N-terminal sequence item, which has no usable " +
        "rule in V2 sheet 3 and therefore runs no analysis under decision D17. This method is " +
        "shown for its principle only, with no upload control, so that no entry point exists " +
        "that would produce numbers no rule can interpret.",
    },
    allowsImageFallback: false,
  },

  // -------------------------------------------------------------------------
  // CDR 区特征肽段鉴定 — sheet 3 row 11, rule partial (columns G–N empty)
  // -------------------------------------------------------------------------
  {
    methodId: "cdr-signature-peptides-primary-1",
    itemId: "cdr-signature-peptides",
    status: "rule-not-defined",
    statusReason: RULE_NOT_DEFINED_REASON,
    allowsImageFallback: false,
  },
  {
    methodId: "cdr-signature-peptides-orthogonal-1",
    itemId: "cdr-signature-peptides",
    status: "rule-not-defined",
    statusReason: RULE_NOT_DEFINED_REASON,
    allowsImageFallback: false,
  },
  {
    methodId: "cdr-signature-peptides-orthogonal-2",
    itemId: "cdr-signature-peptides",
    status: "rule-not-defined",
    statusReason: RULE_NOT_DEFINED_REASON,
    allowsImageFallback: false,
  },

  // -------------------------------------------------------------------------
  // C/N 端氨基酸序列 — no sheet 3 row
  // -------------------------------------------------------------------------
  {
    methodId: "n-c-terminal-sequence-primary-1",
    itemId: "n-c-terminal-sequence",
    status: "rule-not-defined",
    statusReason: RULE_NOT_DEFINED_REASON,
    allowsImageFallback: false,
  },
  {
    methodId: "n-c-terminal-sequence-primary-2",
    itemId: "n-c-terminal-sequence",
    status: "display-only",
    statusReason: WET_LAB_ONLY_REASON,
    allowsImageFallback: false,
  },
  {
    methodId: "n-c-terminal-sequence-orthogonal-1",
    itemId: "n-c-terminal-sequence",
    status: "rule-not-defined",
    statusReason: RULE_NOT_DEFINED_REASON,
    allowsImageFallback: false,
  },

  // -------------------------------------------------------------------------
  // 游离巯基 — no sheet 3 row
  // -------------------------------------------------------------------------
  {
    methodId: "free-thiol-primary-1",
    itemId: "free-thiol",
    status: "rule-not-defined",
    statusReason: RULE_NOT_DEFINED_REASON,
    allowsImageFallback: false,
  },
  {
    methodId: "free-thiol-orthogonal-1",
    itemId: "free-thiol",
    status: "rule-not-defined",
    statusReason: RULE_NOT_DEFINED_REASON,
    allowsImageFallback: false,
  },
  {
    methodId: "free-thiol-orthogonal-2",
    itemId: "free-thiol",
    status: "display-only",
    statusReason: WET_LAB_ONLY_REASON,
    allowsImageFallback: false,
  },

  // -------------------------------------------------------------------------
  // 二硫键 — no sheet 3 row
  // -------------------------------------------------------------------------
  {
    methodId: "disulfide-bonds-primary-1",
    itemId: "disulfide-bonds",
    status: "rule-not-defined",
    statusReason: RULE_NOT_DEFINED_REASON,
    allowsImageFallback: false,
  },
  {
    methodId: "disulfide-bonds-orthogonal-1",
    itemId: "disulfide-bonds",
    status: "rule-not-defined",
    statusReason: RULE_NOT_DEFINED_REASON,
    allowsImageFallback: false,
  },
  {
    methodId: "disulfide-bonds-orthogonal-2",
    itemId: "disulfide-bonds",
    status: "display-only",
    statusReason: WET_LAB_ONLY_REASON,
    allowsImageFallback: false,
  },
  {
    methodId: "sec-hmw-aggregates-primary-1",
    itemId: "sec-hmw-aggregates",
    status: "analyzable",
    profile: "curve-overlay",
    allowsImageFallback: false,
    plannedIn: "P26",
  },
  {
    methodId: "acidic-charge-variants-primary-1",
    itemId: "acidic-charge-variants",
    status: "analyzable",
    profile: "curve-overlay",
    allowsImageFallback: false,
    plannedIn: "P26",
  },
  {
    methodId: "far-uv-cd-primary-1",
    itemId: "far-uv-cd",
    status: "analyzable",
    profile: "curve-overlay",
    allowsImageFallback: false,
    plannedIn: "P26",
  },
];

export const methodAnalysisConfigByMethodId: Record<string, MethodAnalysisConfig> =
  methodAnalysisConfigs.reduce<Record<string, MethodAnalysisConfig>>(
    (accumulator, config) => {
      accumulator[config.methodId] = config;
      return accumulator;
    },
    {},
  );
