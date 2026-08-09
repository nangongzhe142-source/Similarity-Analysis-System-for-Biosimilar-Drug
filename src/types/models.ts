/**
 * Core data models for the biosimilar CMC (pharmaceutical) similarity
 * assessment framework. All content shown on pages is driven by structured
 * data files under `src/data/` that conform to these types.
 */

/** Bilingual text container. `zh` is the source of truth (from the Excel
 *  workbook); `en` is a machine-translation placeholder pending review. */
export interface LocalizedText {
  zh: string;
  en: string;
}

/** Supported UI locales. */
export type Locale = "zh" | "en";

/** Stable keys for the 8 characterization categories. */
export type CategoryKey =
  | "primary-structure"
  | "ptm-glycosylation"
  | "higher-order-structure"
  | "physicochemical"
  | "purity-size-variants"
  | "charge-variants"
  | "binding-bioactivity"
  | "process-product-impurities";

export interface Category {
  key: CategoryKey;
  name: LocalizedText;
  /** One-sentence description of the category. */
  description: LocalizedText;
  /** Display order on the overview page and in navigation. */
  order: number;
}

/** A single detection method (primary or orthogonal/supplementary).
 *  Real detection content will be embedded in a later phase. */
export interface DetectionMethod {
  id: string;
  /** Method name, e.g. "LC-ESI-MS（高分辨QTOF/Orbitrap等）". */
  name: LocalizedText;
  /** "primary" = 分析方法（首选）; "orthogonal" = 正交/补充方法. */
  type: "primary" | "orthogonal";
  /** Marker: the real detection content of this method is to be embedded. */
  contentPlaceholder: true;
  /** Fallback: the original unsplit source text this method was parsed from. */
  rawSourceText: LocalizedText;
}

/** Placeholder slots reserved for the future real similarity analysis.
 *  No analysis logic is implemented in the current phase. */
export interface AnalysisPlaceholder {
  /** Slot for candidate drug data / spectra input. */
  candidateDataSlot: true;
  /** Slot for reference drug data / spectra input. */
  referenceDataSlot: true;
  /** Slot for similarity conclusion / QR range / equivalence results. */
  resultSlot: true;
}

/** One characterization item = one logical row of the Excel sheet
 *  "2.特性鉴定" (11 fields). */
export interface CharacterizationItem {
  /** Stable slug, e.g. "intact-mass". */
  id: string;
  category: CategoryKey;
  /** True when the Excel applicability column marks it as "补充项…". */
  isSupplementary: boolean;

  // ---- Compact fields used by cards / lists ----
  /** 指南原词 */
  guidelineTerm: LocalizedText;
  /** 表征项目 */
  itemName: LocalizedText;
  /** 适用性 */
  applicability: LocalizedText;
  /** 评价目的 */
  purpose: LocalizedText;

  // ---- Expanded fields used by the detail page ----
  /** 检测指标 */
  detectionIndicators: LocalizedText;
  /** 相似性评价方法 */
  similarityMethod: LocalizedText;
  /** 判定原则 */
  judgingPrinciple: LocalizedText;
  /** 数值限度/判定边界 */
  numericLimit: LocalizedText;
  /** 备注 */
  remark: LocalizedText;

  /** Detection methods parsed from "分析方法（首选）" and "正交/补充方法". */
  methods: DetectionMethod[];

  /** Reserved slots for the future real similarity analysis. */
  analysisPlaceholder: AnalysisPlaceholder;
}

// ---------------------------------------------------------------------------
// Regulatory framework module (Excel sheet "1.法规框架")
// ---------------------------------------------------------------------------

/** One row of the CTD section vs. CMC dossier requirement table. */
export interface RegulatoryCtdRequirement {
  id: string;
  /** CTD位置, e.g. "3.2.S.3". */
  ctdSection: string;
  /** 对象 */
  subject: LocalizedText;
  /** 底层要求 */
  requirement: LocalizedText;
  /** 对应页码 */
  pageReference: string;
  /** 备注 ("-" in the source is normalized to an empty string). */
  remark: LocalizedText;
}

/** Relationship level between a CTD section and CMC similarity assessment. */
export type RegulatoryRelationLevel =
  | "directly-related"
  | "indirectly-related"
  | "supportive";

/** One row of the "CTD章节 / 对象 / 与药学相似性评价关系" sub-table. */
export interface RegulatoryCtdRelation {
  id: string;
  /** CTD章节 */
  ctdSection: string;
  /** 对象 */
  subject: LocalizedText;
  /** 与药学相似性评价关系 */
  relation: RegulatoryRelationLevel;
}

export interface RegulatoryFramework {
  /** Title of the source guideline document (sheet header row). */
  sourceTitle: LocalizedText;
  requirements: RegulatoryCtdRequirement[];
  relations: RegulatoryCtdRelation[];
}
