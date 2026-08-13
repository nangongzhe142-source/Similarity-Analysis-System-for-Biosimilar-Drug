import type { Locale } from "@/types/models";

/** All translatable UI-shell strings (navigation, labels, section titles…). */
export interface UiMessages {
  site: {
    title: string;
    subtitle: string;
  };
  navigation: {
    overview: string;
    characterization: string;
    regulatory: string;
    allCategories: string;
  };
  home: {
    heroTitle: string;
    heroDescription: string;
    categoriesSectionTitle: string;
    categoriesSectionDescription: string;
    regulatoryEntryTitle: string;
    regulatoryEntryDescription: string;
    itemCountSuffix: string;
    statsItems: string;
    statsCategories: string;
    statsMethods: string;
    statsSupplementary: string;
  };
  categoryPage: {
    backToOverview: string;
    itemCountSuffix: string;
    supplementaryNote: string;
  };
  itemPage: {
    breadcrumbHome: string;
    fieldSectionTitle: string;
    guidelineTermLabel: string;
    applicabilityLabel: string;
    purposeLabel: string;
    detectionIndicatorsLabel: string;
    similarityMethodLabel: string;
    judgingPrincipleLabel: string;
    numericLimitLabel: string;
    remarkLabel: string;
    emptyFieldPlaceholder: string;
    methodSectionTitle: string;
    methodSectionDescription: string;
    primaryMethodLabel: string;
    orthogonalMethodLabel: string;
    methodContentPlaceholderTitle: string;
    methodContentPlaceholderText: string;
    noMethodsPlaceholder: string;
    analysisSectionTitle: string;
    analysisSectionDescription: string;
    candidateSlotTitle: string;
    candidateSlotDescription: string;
    referenceSlotTitle: string;
    referenceSlotDescription: string;
    resultSlotTitle: string;
    resultSlotDescription: string;
    underDevelopment: string;
    uploadPlaceholderAction: string;
    previousItem: string;
    nextItem: string;
  };
  regulatoryPage: {
    title: string;
    description: string;
    requirementsTableTitle: string;
    relationsTableTitle: string;
    ctdSectionHeader: string;
    subjectHeader: string;
    requirementHeader: string;
    pageReferenceHeader: string;
    remarkHeader: string;
    relationHeader: string;
    relationDirectlyRelated: string;
    relationIndirectlyRelated: string;
    relationSupportive: string;
    sourceLabel: string;
  };
  referenceCase: {
    sectionTitle: string;
    sectionDescription: string;
    noCaseTitle: string;
    noCaseDescription: string;
    hasCaseTag: string;
    expandAction: string;
    collapseAction: string;
    evidenceVerified: string;
    evidenceNarrative: string;
    evidenceIllustrative: string;
    evidenceVerifiedHint: string;
    evidenceNarrativeHint: string;
    evidenceIllustrativeHint: string;
    tier1: string;
    tier2: string;
    tier3: string;
    tierNotTiered: string;
    methodUsedLabel: string;
    methodDeviationLabel: string;
    candidateColumn: string;
    referenceUsColumn: string;
    referenceEuColumn: string;
    indicatorColumn: string;
    qualitativeFindingLabel: string;
    acceptanceCriterionLabel: string;
    reviewerConclusionLabel: string;
    dataCaveatLabel: string;
    sourceLabel: string;
    sourceCandidateLabel: string;
    sourceReferenceLabel: string;
    sourceDocumentLabel: string;
    sourceCitationLabel: string;
    sourceFileLabel: string;
    verificationLabel: string;
    verificationTranscribedBy: string;
    verificationTranscribedOn: string;
    verificationCheckedValues: string;
    verificationEnglishSource: string;
    englishCheckNotChecked: string;
    englishCheckChecked: string;
    englishCheckDiscrepancy: string;
    ocrDamageWarningTitle: string;
    ocrDamageWarningText: string;
    disclaimerTitle: string;
    disclaimerText: string;
    footerDisclaimer: string;
    schematicOnlyTag: string;
    legendCandidate: string;
    legendReference: string;
    axisLogConcentration: string;
    axisResponse: string;
    axisTime: string;
    axisResponseUnit: string;
    axisRetentionTime: string;
    axisWavelength: string;
    axisSignal: string;
    emptyValuePlaceholder: string;
  };
  common: {
    supplementaryTag: string;
    viewDetails: string;
    notFoundTitle: string;
    notFoundDescription: string;
    backToHome: string;
    languageSwitchLabel: string;
    englishTodoNotice: string;
  };
}

export const uiMessages: Record<Locale, UiMessages> = {
  zh: {
    site: {
      title: "生物类似药药学相似性分析",
      subtitle: "药学比对研究质量属性、检测方法及相似性评价原则",
    },
    navigation: {
      overview: "总览",
      characterization: "特性鉴定",
      regulatory: "法规框架",
      allCategories: "全部大类",
    },
    home: {
      heroTitle: "生物类似药药学相似性分析框架",
      heroDescription:
        "基于《生物类似药药学比对研究质量属性、检测方法及相似性评价原则汇总表》构建的结构化知识框架，覆盖 8 个质量属性大类、61 个检测项目及其首选/正交检测方法，并为后续接入真实相似性分析预留接口。",
      categoriesSectionTitle: "特性鉴定 · 8 个质量属性大类",
      categoriesSectionDescription: "点击大类卡片查看该大类下的检测项目列表。",
      regulatoryEntryTitle: "法规框架",
      regulatoryEntryDescription:
        "CTD 章节与药学申报要求对照，以及各章节与药学相似性评价的关系。",
      itemCountSuffix: "个项目",
      statsItems: "检测项目",
      statsCategories: "质量属性大类",
      statsMethods: "检测方法条目",
      statsSupplementary: "补充项",
    },
    categoryPage: {
      backToOverview: "返回总览",
      itemCountSuffix: "个检测项目",
      supplementaryNote: "标注“补充项”的项目是否纳入取决于品种、工艺、作用机制和风险。",
    },
    itemPage: {
      breadcrumbHome: "总览",
      fieldSectionTitle: "评价要素",
      guidelineTermLabel: "指南原词",
      applicabilityLabel: "适用性",
      purposeLabel: "评价目的",
      detectionIndicatorsLabel: "检测指标",
      similarityMethodLabel: "相似性评价方法",
      judgingPrincipleLabel: "判定原则",
      numericLimitLabel: "数值限度/判定边界",
      remarkLabel: "备注",
      emptyFieldPlaceholder: "—",
      methodSectionTitle: "检测方法",
      methodSectionDescription: "选择一个方法查看其检测内容（本期为占位，待后续嵌入）。",
      primaryMethodLabel: "首选",
      orthogonalMethodLabel: "正交/补充",
      methodContentPlaceholderTitle: "检测内容待嵌入",
      methodContentPlaceholderText:
        "该方法的真实检测内容（原理、样品制备、仪器参数、系统适用性、数据解读等）将在后续版本中嵌入此处。",
      noMethodsPlaceholder: "该项目未在汇总表中列出具体分析方法，需结合具体品种确定。",
      analysisSectionTitle: "相似性分析（预留）",
      analysisSectionDescription:
        "以下为候选药/参照药数据录入与相似性结论展示的预留位置，本期不实现分析逻辑。",
      candidateSlotTitle: "候选药数据/图谱",
      candidateSlotDescription: "候选药检测数据或图谱的录入位。",
      referenceSlotTitle: "参照药数据/图谱",
      referenceSlotDescription: "参照药检测数据或图谱的录入位。",
      resultSlotTitle: "相似性结论 / QR 区间 / 等效性结果",
      resultSlotDescription: "相似性评价结果的展示位。",
      underDevelopment: "功能开发中",
      uploadPlaceholderAction: "上传数据（暂未开放）",
      previousItem: "上一项",
      nextItem: "下一项",
    },
    regulatoryPage: {
      title: "法规框架",
      description:
        "生物类似药首次申报临床试验药学资料的 CTD 章节要求对照，以及各 CTD 章节与药学相似性评价的关系。",
      requirementsTableTitle: "CTD 章节与药学申报要求对照",
      relationsTableTitle: "CTD 章节与药学相似性评价关系",
      ctdSectionHeader: "CTD 位置",
      subjectHeader: "对象",
      requirementHeader: "底层要求",
      pageReferenceHeader: "对应页码",
      remarkHeader: "备注",
      relationHeader: "与药学相似性评价关系",
      relationDirectlyRelated: "直接相关",
      relationIndirectlyRelated: "间接相关",
      relationSupportive: "支持性",
      sourceLabel: "来源",
    },
    referenceCase: {
      sectionTitle: "参考案例",
      sectionDescription:
        "取自已获批生物类似药审评报告的真实对比数据，用于把上方的判定原则与数值限度具象化。案例数据均标注证据等级与出处，示意图谱明确标注为非真实数据。",
      noCaseTitle: "参考案例待补充",
      noCaseDescription:
        "该项目暂无可引用的真实审评案例数据。后续将补充真实案例，或以示意图谱说明该项的典型评价方式。",
      hasCaseTag: "含参考案例",
      expandAction: "展开完整数据与溯源",
      collapseAction: "收起",
      evidenceVerified: "审评报告实测数据",
      evidenceNarrative: "审评报告范围值",
      evidenceIllustrative: "示意说明",
      evidenceVerifiedHint:
        "来自审评报告中审评员自制的统计表，含均值、批次数与质量范围，是完整度最高的一档。",
      evidenceNarrativeHint:
        "数值真实且可溯源，但仅见于审评报告正文，源表未复制，因此缺少批次数与质量范围（均值 ± 3SD）。",
      evidenceIllustrativeHint:
        "非真实测定数据。该项目在案例中无可引用数值，此处仅以典型评价思路与示意图谱说明该项如何评价。",
      tier1: "Tier 1 · 统计学等效性检验",
      tier2: "Tier 2 · 质量范围法",
      tier3: "Tier 3 · 描述性评价",
      tierNotTiered: "未分层",
      methodUsedLabel: "案例实际使用方法",
      methodDeviationLabel: "与框架方法的差异",
      candidateColumn: "候选药",
      referenceUsColumn: "参照药（美国）",
      referenceEuColumn: "参照药（欧盟）",
      indicatorColumn: "指标",
      qualitativeFindingLabel: "案例中的真实定性结论",
      acceptanceCriterionLabel: "可接受标准",
      reviewerConclusionLabel: "审评结论与论证过程",
      dataCaveatLabel: "数据局限与注意事项",
      sourceLabel: "数据溯源",
      sourceCandidateLabel: "候选药",
      sourceReferenceLabel: "参照药",
      sourceDocumentLabel: "来源文件",
      sourceCitationLabel: "出处",
      sourceFileLabel: "本地路径",
      verificationLabel: "抄录与校验状态",
      verificationTranscribedBy: "抄录人",
      verificationTranscribedOn: "抄录日期",
      verificationCheckedValues: "已机械校验数值",
      verificationEnglishSource: "英文原文核对",
      englishCheckNotChecked: "未核对（数值取自中文译文，未回英文原文比对）",
      englishCheckChecked: "已核对",
      englishCheckDiscrepancy: "发现不一致，勿引用",
      ocrDamageWarningTitle: "该案例含 OCR 损坏数值，尚未回原始 PDF 核对",
      ocrDamageWarningText:
        "译文在对应位置标注了 OCR 识别损坏或自相矛盾。在回原始 PDF 核对之前，本案例数值不可作为可靠依据引用。",
      disclaimerTitle: "数据定位说明：仅供框架演示与教学，不得作为监管决策依据",
      disclaimerText:
        "本站参考案例取自已获批生物类似药的公开审评报告，但存在以下已知限制：一、数值抄录自中文译文，尚未回英文原文逐条核对；二、源文件本身不完整，大量表格标注「原文未复制」，部分段落 OCR 不可读，并有依 (b)(4) 商业秘密条款的涂黑内容；三、将译文术语映射到本框架 61 个检测项目时存在推断成分（尤其糖型命名）。因此本站只能保证「不编造、可溯源、证据等级不夸大」，不能保证数据的完全真实与严谨。任何实际申报或评价工作请以原始审评报告与现行指导原则为准。",
      footerDisclaimer:
        "参考案例仅供框架演示与教学，数值未经人工复核，不得作为监管决策依据。",
      schematicOnlyTag: "示意图 · 非真实数据",
      legendCandidate: "候选药（示意）",
      legendReference: "参照药（示意）",
      axisLogConcentration: "浓度对数",
      axisResponse: "反应值",
      axisTime: "时间",
      axisResponseUnit: "响应值 RU",
      axisRetentionTime: "保留时间",
      axisWavelength: "波长",
      axisSignal: "信号强度",
      emptyValuePlaceholder: "—",
    },
    common: {
      supplementaryTag: "补充项",
      viewDetails: "查看详情",
      notFoundTitle: "页面不存在",
      notFoundDescription: "您访问的内容不存在或已被移除。",
      backToHome: "返回首页",
      languageSwitchLabel: "切换语言",
      englishTodoNotice: "英文内容为机器翻译占位，待校对。",
    },
  },
  en: {
    site: {
      title: "Biosimilar CMC Similarity Assessment",
      subtitle:
        "Quality attributes, analytical methods and similarity assessment principles for CMC comparability studies",
    },
    navigation: {
      overview: "Overview",
      characterization: "Characterization",
      regulatory: "Regulatory Framework",
      allCategories: "All categories",
    },
    home: {
      heroTitle: "Biosimilar CMC Similarity Assessment Framework",
      heroDescription:
        "A structured knowledge framework built on the summary table of quality attributes, analytical methods and similarity assessment principles for biosimilar CMC comparability studies. It covers 8 quality-attribute categories, 61 characterization items with their primary/orthogonal methods, and reserves interfaces for future real similarity analysis.",
      categoriesSectionTitle: "Characterization · 8 Quality-attribute Categories",
      categoriesSectionDescription:
        "Click a category card to browse its characterization items.",
      regulatoryEntryTitle: "Regulatory Framework",
      regulatoryEntryDescription:
        "CTD sections mapped to CMC dossier requirements, and their relationship with CMC similarity assessment.",
      itemCountSuffix: "items",
      statsItems: "Characterization items",
      statsCategories: "Categories",
      statsMethods: "Method entries",
      statsSupplementary: "Supplementary items",
    },
    categoryPage: {
      backToOverview: "Back to overview",
      itemCountSuffix: "characterization items",
      supplementaryNote:
        "Whether items tagged \"Supplementary\" are included depends on the product, process, mechanism of action and risk.",
    },
    itemPage: {
      breadcrumbHome: "Overview",
      fieldSectionTitle: "Assessment Elements",
      guidelineTermLabel: "Guideline term",
      applicabilityLabel: "Applicability",
      purposeLabel: "Assessment purpose",
      detectionIndicatorsLabel: "Analytical readouts",
      similarityMethodLabel: "Similarity assessment approach",
      judgingPrincipleLabel: "Judging principle",
      numericLimitLabel: "Numerical limit / decision boundary",
      remarkLabel: "Remarks",
      emptyFieldPlaceholder: "—",
      methodSectionTitle: "Detection Methods",
      methodSectionDescription:
        "Select a method to view its detection content (placeholder in this phase; to be embedded later).",
      primaryMethodLabel: "Primary",
      orthogonalMethodLabel: "Orthogonal / supplementary",
      methodContentPlaceholderTitle: "Detection content to be embedded",
      methodContentPlaceholderText:
        "The real detection content of this method (principle, sample preparation, instrument parameters, system suitability, data interpretation, etc.) will be embedded here in a future release.",
      noMethodsPlaceholder:
        "No specific analytical method is listed for this item in the summary table; it must be defined for the specific product.",
      analysisSectionTitle: "Similarity Analysis (Reserved)",
      analysisSectionDescription:
        "The slots below are reserved for candidate/reference data entry and similarity results. No analysis logic is implemented in this phase.",
      candidateSlotTitle: "Candidate drug data / spectra",
      candidateSlotDescription: "Input slot for candidate drug test data or spectra.",
      referenceSlotTitle: "Reference drug data / spectra",
      referenceSlotDescription: "Input slot for reference drug test data or spectra.",
      resultSlotTitle: "Similarity conclusion / QR range / equivalence results",
      resultSlotDescription: "Display slot for similarity assessment results.",
      underDevelopment: "Under development",
      uploadPlaceholderAction: "Upload data (not yet available)",
      previousItem: "Previous",
      nextItem: "Next",
    },
    regulatoryPage: {
      title: "Regulatory Framework",
      description:
        "CTD section requirements for the CMC dossier of an initial biosimilar clinical trial application, and the relationship of each CTD section with CMC similarity assessment.",
      requirementsTableTitle: "CTD Sections vs. CMC Dossier Requirements",
      relationsTableTitle: "CTD Sections vs. CMC Similarity Assessment",
      ctdSectionHeader: "CTD Section",
      subjectHeader: "Subject",
      requirementHeader: "Underlying Requirement",
      pageReferenceHeader: "Page",
      remarkHeader: "Remarks",
      relationHeader: "Relation to CMC Similarity Assessment",
      relationDirectlyRelated: "Directly related",
      relationIndirectlyRelated: "Indirectly related",
      relationSupportive: "Supportive",
      sourceLabel: "Source",
    },
    referenceCase: {
      sectionTitle: "Reference Case",
      sectionDescription:
        "Real comparative data taken from the review report of an approved biosimilar, used to make the judging principles and numerical limits above concrete. Every case is labelled with its evidence level and provenance; schematic figures are explicitly marked as not being real data.",
      noCaseTitle: "Reference case pending",
      noCaseDescription:
        "No citable real review-case data is available for this item yet. A real case will be added later, or a schematic figure will illustrate the typical assessment approach.",
      hasCaseTag: "Reference case",
      expandAction: "Expand full data and provenance",
      collapseAction: "Collapse",
      evidenceVerified: "Measured review data",
      evidenceNarrative: "Review narrative ranges",
      evidenceIllustrative: "Schematic explanation",
      evidenceVerifiedHint:
        "Taken from a reviewer-compiled statistics table in the review report, including mean, lot count and quality range — the most complete evidence level.",
      evidenceNarrativeHint:
        "The values are real and traceable but appear only in the review narrative; the source table was not reproduced, so lot counts and the quality range (mean ± 3SD) are missing.",
      evidenceIllustrativeHint:
        "Not real measured data. No citable values exist for this item in the case, so the typical assessment approach and a schematic figure are used to explain how the item is assessed.",
      tier1: "Tier 1 · Statistical equivalence testing",
      tier2: "Tier 2 · Quality range approach",
      tier3: "Tier 3 · Descriptive evaluation",
      tierNotTiered: "Not tiered",
      methodUsedLabel: "Method actually used in the case",
      methodDeviationLabel: "Deviation from the framework method",
      candidateColumn: "Candidate",
      referenceUsColumn: "Reference (US)",
      referenceEuColumn: "Reference (EU)",
      indicatorColumn: "Indicator",
      qualitativeFindingLabel: "Real qualitative finding in the case",
      acceptanceCriterionLabel: "Acceptance criterion",
      reviewerConclusionLabel: "Reviewer conclusion and reasoning",
      dataCaveatLabel: "Data limitations and caveats",
      sourceLabel: "Provenance",
      sourceCandidateLabel: "Candidate product",
      sourceReferenceLabel: "Reference product",
      sourceDocumentLabel: "Source document",
      sourceCitationLabel: "Citation",
      sourceFileLabel: "Local path",
      verificationLabel: "Transcription and verification status",
      verificationTranscribedBy: "Transcribed by",
      verificationTranscribedOn: "Transcribed on",
      verificationCheckedValues: "Mechanically verified values",
      verificationEnglishSource: "English source reconciliation",
      englishCheckNotChecked:
        "Not checked (values taken from the Chinese translation, never reconciled with the English original)",
      englishCheckChecked: "Checked",
      englishCheckDiscrepancy: "Discrepancy found — do not cite",
      ocrDamageWarningTitle:
        "This case contains OCR-damaged values not yet reconciled with the source PDF",
      ocrDamageWarningText:
        "The translation flagged the corresponding passage as OCR-damaged or self-contradictory. Until it is reconciled with the source PDF, the values in this case must not be cited as a reliable basis.",
      disclaimerTitle:
        "Data positioning: for framework demonstration and teaching only — not a basis for regulatory decisions",
      disclaimerText:
        "The reference cases on this site are drawn from public review reports of approved biosimilars, but carry the following known limitations. First, values were transcribed from a Chinese translation and have not been reconciled item by item with the English original. Second, the source document is itself incomplete: many tables are marked \"not reproduced\", some passages are OCR-unreadable, and content is redacted under the (b)(4) commercial-confidentiality provision. Third, mapping the translation's terminology onto this framework's 61 characterization items involves inference in places, notably glycan nomenclature. This site can therefore guarantee only that nothing is fabricated, that every value is traceable, and that evidence levels are not overstated — it cannot guarantee complete accuracy or rigour. For any actual filing or assessment work, rely on the original review reports and the current guidelines.",
      footerDisclaimer:
        "Reference cases are for framework demonstration and teaching only; values are not human-reviewed and must not be used as a basis for regulatory decisions.",
      schematicOnlyTag: "Schematic · not real data",
      legendCandidate: "Candidate (schematic)",
      legendReference: "Reference (schematic)",
      axisLogConcentration: "log concentration",
      axisResponse: "Response",
      axisTime: "Time",
      axisResponseUnit: "Response (RU)",
      axisRetentionTime: "Retention time",
      axisWavelength: "Wavelength",
      axisSignal: "Signal intensity",
      emptyValuePlaceholder: "—",
    },
    common: {
      supplementaryTag: "Supplementary",
      viewDetails: "View details",
      notFoundTitle: "Page not found",
      notFoundDescription: "The content you requested does not exist or has been removed.",
      backToHome: "Back to home",
      languageSwitchLabel: "Switch language",
      englishTodoNotice:
        "English item content is a machine-translation placeholder pending review.",
    },
  },
};
