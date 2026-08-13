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

// ---------------------------------------------------------------------------
// Reference cases — concrete worked examples attached to a characterization
// item, so that the abstract judging principles become tangible.
// ---------------------------------------------------------------------------

/** Reliability tier of a reference case. Drives how the UI labels it, so that
 *  a reader can always tell verified regulatory data from an illustration.
 *  Never upgrade a level to make a case look stronger. */
export type ReferenceCaseEvidenceLevel =
  /** Complete reviewer statistics table: mean + lot count + quality range. */
  | "regulatory-verified"
  /** Real values quoted in the review narrative, but without lot counts or
   *  quality ranges (the underlying source table was not reproduced). */
  | "regulatory-narrative"
  /** Schematic illustration only — NOT real measured data. Used to explain how
   *  an item is normally assessed when no case data exists. */
  | "illustrative";

/** Statistical tier assigned by the regulator in the source case.
 *  Tier 1 = equivalence testing, Tier 2 = quality range, Tier 3 = descriptive. */
export type ReferenceCaseTier = "tier-1" | "tier-2" | "tier-3" | "not-tiered";

/** Provenance of a reference case. Mandatory for verified/narrative levels so
 *  that every number can be traced back to its source document. */
export interface ReferenceCaseSource {
  /** Candidate (proposed biosimilar) product, e.g. "GP2015（依那西普）". */
  candidateProduct: LocalizedText;
  /** Reference product(s), e.g. "US-licensed Enbrel / EU-approved Enbrel". */
  referenceProduct: LocalizedText;
  /** Source document, e.g. "FDA 多学科审评报告（BLA 761042）". */
  documentTitle: LocalizedText;
  /** Table/figure/section reference inside the source document. */
  citation: LocalizedText;
  /** Workspace-relative path of the local source file, for traceability. */
  localSourcePath: string;
}

/** One row of a reference-case comparison table. Values are kept as raw
 *  strings so that ranges, lot counts and "<LOQ" style entries survive
 *  verbatim from the source document without lossy numeric parsing. */
export interface ReferenceCaseDataRow {
  /** Row label, e.g. "相对效价 %（原液）" or "均值（批次数）". */
  label: LocalizedText;
  /** Candidate product value, verbatim from the source. */
  candidateValue: string;
  /** US reference product value; empty string when not reported separately. */
  referenceUsValue: string;
  /** EU reference product value; empty string when not reported separately. */
  referenceEuValue: string;
}

export interface ReferenceCaseDataTable {
  caption: LocalizedText;
  rows: ReferenceCaseDataRow[];
}

/** Schematic figure variants. These are hand-drawn SVG illustrations, never
 *  rendered from real measurements. */
export type SchematicFigureVariant =
  | "dose-response"
  | "spr-sensorgram"
  | "chromatogram"
  | "spectrum-overlay";

export interface SchematicFigure {
  variant: SchematicFigureVariant;
  caption: LocalizedText;
  /** What the reader should take away from the illustration. */
  explanation: LocalizedText;
}

/** Whether the transcribed values have been reconciled against the original
 *  English source document, rather than only against the Chinese translation.
 *  The translation is an intermediate artefact, not the base of truth. */
export type EnglishSourceCheckStatus =
  | "not-checked"
  | "checked"
  | "discrepancy-found";

/** Audit trail that makes transcription errors mechanically detectable.
 *  `scripts/verify_reference_cases.mjs` greps every `verifiableValues` entry in
 *  the listed `sourceChunks`; a miss means the value was mistyped, or attributed
 *  to the wrong source file. */
export interface ReferenceCaseVerification {
  /** Chunk file names inside the translation output directory that contain the
   *  values of this case, e.g. ["chunk_16.md", "chunk_17.md"]. */
  sourceChunks: string[];
  /** Distinctive value strings that must appear verbatim in `sourceChunks`.
   *  Pick unambiguous tokens (e.g. "101.7 (7)", "0.9143"), not bare integers. */
  verifiableValues: string[];
  englishSourceCheck: EnglishSourceCheckStatus;
  /** True when a value here is known to be OCR-damaged and not yet reconciled
   *  against the source PDF. Such a case must never be presented as reliable. */
  hasUnresolvedOcrDamage: boolean;
  /** Who transcribed the values, for audit. */
  transcribedBy: string;
  /** ISO date of transcription. */
  transcribedOn: string;
}

interface ReferenceCaseCommon {
  id: string;
  tier: ReferenceCaseTier;
  /** The method actually used in the case, which may differ from the
   *  framework's preferred method for this item. */
  methodUsed: LocalizedText;
  /** Set when the case method is not equivalent to the framework's preferred
   *  method, or when the item mapping needs human review. */
  methodDeviationNote?: LocalizedText;
  /** One-line takeaway shown on the collapsed card. */
  headline: LocalizedText;
  /** Comparison tables; empty for illustrative cases. */
  dataTables: ReferenceCaseDataTable[];
  /** Qualitative finding, used when the source reports no usable numbers. */
  qualitativeFinding?: LocalizedText;
  /** Acceptance criterion applied in the case. */
  acceptanceCriterion: LocalizedText;
  /** Reviewer's assessment, including the reasoning chain where available. */
  reviewerConclusion: LocalizedText;
  schematicFigure?: SchematicFigure;
}

/** A case carrying real measured values. Provenance, limitations and the
 *  verification audit trail are all mandatory: a real number without the
 *  context that qualifies it is a rigour failure, not a shortcut. */
export interface RegulatoryReferenceCase extends ReferenceCaseCommon {
  evidenceLevel: "regulatory-verified" | "regulatory-narrative";
  source: ReferenceCaseSource;
  /** Mandatory. Record everything that limits the strength of these values:
   *  expired lots, regulator redactions, declared method variability, which
   *  batch set the numbers belong to, missing lot counts or quality ranges.
   *  If the source genuinely reports no limitation, say so explicitly. */
  dataCaveat: LocalizedText;
  verification: ReferenceCaseVerification;
}

/** A schematic explanation used when no citable measured values exist.
 *  Carries no provenance by construction, and must carry a figure. */
export interface IllustrativeReferenceCase extends ReferenceCaseCommon {
  evidenceLevel: "illustrative";
  /** Illustrations have no measured data, so provenance is not applicable. */
  source?: never;
  verification?: never;
  dataCaveat?: LocalizedText;
  schematicFigure: SchematicFigure;
}

export type ReferenceCase = RegulatoryReferenceCase | IllustrativeReferenceCase;

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
