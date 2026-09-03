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
    integratedAssessment: string;
    allCategories: string;
    primaryLabel: string;
  };
  comprehensiveAnalysis: {
    pageTitle: string;
    pageDescription: string;
    demoDataBadge: string;
    demoUseBanner: string;
    overallConclusionTitle: string;
    conclusionSupports: string;
    conclusionDoesNotSupport: string;
    conclusionInsufficient: string;
    rationaleSupports: string;
    rationaleDoesNotSupport: string;
    rationaleInsufficient: string;
    rationaleNoApplicableItems: string;
    candidateNameLabel: string;
    referenceNameLabel: string;
    candidateLotLabel: string;
    referenceLotLabel: string;
    productTypeLabel: string;
    analysisNameLabel: string;
    clearAndReenter: string;
    restoreDemo: string;
    disclaimer: string;
    participatingCountLabel: string;
    supportsCountLabel: string;
    doesNotSupportCountLabel: string;
    insufficientCountLabel: string;
    notApplicableCountLabel: string;
    incompleteCountLabel: string;
    completenessLabel: string;
    criticalItemsTitle: string;
    noCriticalItems: string;
    jumpToItem: string;
    overviewTitle: string;
    statusInventoryNote: string;
    statusSumLabel: string;
    completedRatioLabel: string;
    categoryOverviewTitle: string;
    jumpToCategory: string;
    productPairOverviewTitle: string;
    statusSupports: string;
    statusDoesNotSupport: string;
    statusInsufficient: string;
    statusNotApplicable: string;
    statusUnset: string;
    applicabilityLabel: string;
    applicableYes: string;
    applicableNo: string;
    demoStatusLabel: string;
    candidateDataLabel: string;
    referenceDataLabel: string;
    comparisonNotesLabel: string;
    notApplicableReasonLabel: string;
    completenessComplete: string;
    completenessIncomplete: string;
    expandProcess: string;
    collapseProcess: string;
    expandCategory: string;
    collapseCategory: string;
    processTitle: string;
    processStepInput: string;
    processStepNormalization: string;
    processStepSideBySide: string;
    processStepDifference: string;
    processStepPrinciple: string;
    processStepConclusion: string;
    processStepProvenance: string;
    demoFlowBadge: string;
    realComputationNotConnected: string;
    notForRegulatoryJudgement: string;
    schematicCaption: string;
    schematicAlignmentAligned: string;
    schematicAlignmentOffset: string;
    schematicAlignmentIncomplete: string;
    schematicAlignmentNotApplicable: string;
    emptyValuePlaceholder: string;
    supplementaryExcludedNote: string;
    notApplicableReasonRequired: string;
    textLengthLabel: string;
    textsIdenticalNote: string;
    textsDifferNote: string;
    judgingPrincipleSourceLabel: string;
    numericLimitSourceLabel: string;
    demoDataSourceNote: string;
    normalizationNote: string;
    differenceNote: string;
    formSectionTitle: string;
    itemsSectionTitle: string;
    inputFileSectionTitle: string;
    inputFileSectionDescription: string;
    inputFileLabel: string;
    inputFileAcceptHint: string;
    inputFileImportSuccess: string;
    inputFileImportError: string;
    inputFileEmptyError: string;
    inputFileTooLarge: string;
    downloadOutputFile: string;
    outputFileReadyNote: string;
    inputFileStatusColumnNote: string;
  };
  home: {
    heroTitle: string;
    heroDescription: string;
    heroPrimaryAction: string;
    heroSecondaryAction: string;
    comprehensiveEntryTitle: string;
    comprehensiveEntryDescription: string;
    categoriesSectionTitle: string;
    categoriesSectionDescription: string;
    regulatoryEntryTitle: string;
    regulatoryEntryDescription: string;
    itemCountSuffix: string;
    statsItems: string;
    statsCategories: string;
    statsMethods: string;
    statsSupplementary: string;
    categoryIndexPrefix: string;
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
    figureLibraryInputTitle: string;
    figureLibraryInputHint: string;
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
  liveDemo: {
    badge: string;
    title: string;
    runButton: string;
    rerunButton: string;
    syntheticTag: string;
    publicSequenceTag: string;
    disclaimer: string;
    sopStillPending: string;
    sequenceLabel: string;
    disulfideLabel: string;
    residueCountLabel: string;
    cysteineCountLabel: string;
    reducedMassLabel: string;
    oxidizedMassLabel: string;
    recoveredMassLabel: string;
    deviationLabel: string;
    chargeLabel: string;
    hexoseShiftLabel: string;
    candidateMassLabel: string;
    observedShiftLabel: string;
    attributableLabel: string;
    envelopeCaption: string;
    passLabel: string;
    failLabel: string;
    peptideCountLabel: string;
    coverageLabel: string;
    unmatchedLabel: string;
    substitutionLabel: string;
    substitutionDetectedLabel: string;
    substitutionMissedLabel: string;
    referenceLotsLabel: string;
    candidateLotsLabel: string;
    scenarioSimilar: string;
    scenarioShifted: string;
    sigmaMultiplierLabel: string;
    thresholdLabel: string;
    meanLabel: string;
    sdLabel: string;
    qrLabel: string;
    withinLabel: string;
    outOfRangeLabel: string;
    supportsSimilarity: string;
    doesNotSupport: string;
    editHint: string;
    provenanceTitle: string;
    provenanceWhatItIs: string;
    provenanceWhatItIsNot: string;
    provenanceDataSource: string;
    provenancePrinciple: string;
    provenanceCheck: string;
    provenanceOracle: string;
    provenanceFiles: string;
    provenanceLinks: string;
  };
  methodContent: {
    sectionTitle: string;
    principleLabel: string;
    pendingFieldsTitle: string;
    pendingSamplePreparation: string;
    pendingInstrumentParameters: string;
    pendingSystemSuitability: string;
    pendingDataInterpretation: string;
    pendingSimilarityAssessmentLink: string;
    disclaimer: string;
  };
  methodTools: {
    sectionTitle: string;
    notSurveyedTitle: string;
    notSurveyedText: string;
    gapTitle: string;
    surveyedOnLabel: string;
    licenseLabel: string;
    stackLabel: string;
    capabilityLabel: string;
    deploymentLabel: string;
    notSupportedLabel: string;
    evidenceLabel: string;
    repositoryLabel: string;
    statsLabel: string;
    recommendationPreferred: string;
    recommendationAlternative: string;
    recommendationConditional: string;
    recommendationNotRecommended: string;
    deploymentUnverifiedWarning: string;
    disclaimer: string;
  };
  methodAnalysis: {
    sectionTitle: string;
    statusLabels: Record<
      "analyzable" | "blocked-by-tool" | "not-yet-supported" | "display-only" | "rule-not-defined",
      string
    >;
    verdictLabels: Record<
      "SUPPORTED_BY_THIS_ATTRIBUTE" | "REVIEW" | "DIFFERENCE_DETECTED" | "RULE_NOT_DEFINED",
      string
    >;
    jobStatusValues: Record<
      "QUEUED" | "VALIDATING" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED",
      string
    >;
    ruleCompleteTag: string;
    rulePartialTag: string;
    ruleAbsentTag: string;
    sheet3RuleUndefined: string;
    plannedInLabel: string;
    blockedByLabel: string;
    uploadHint: string;
    candidateLabelField: string;
    referenceLabelField: string;
    headToHeadLabel: string;
    comparisonFileLabel: string;
    comparisonFileHint: string;
    comparisonSelectedFirst: string;
    comparisonSelectedSecond: string;
    sequenceFileLabel: string;
    inputFilesBoxTitle: string;
    fileEmptyPlaceholder: string;
    syntheticFallbackNote: string;
    runButton: string;
    runningButton: string;
    cancelButton: string;
    jobStatusLabel: string;
    serviceOfflineTitle: string;
    serviceOfflineText: string;
    genericError: string;
    syntheticDemoTag: string;
    imageOnlyTag: string;
    massesLabel: string;
    deltaDaLabel: string;
    coverageLabel: string;
    matchedPeptidesLabel: string;
    unmatchedPeptidesLabel: string;
    ruleEvaluationTitle: string;
    warningsTitle: string;
    limitationsTitle: string;
    downloadJson: string;
    downloadPng: string;
    mirrorPlotTitle: string;
    overlayPlotTitle: string;
    referenceOnlyPlotTitle: string;
    candidateOnlyPlotTitle: string;
    coveragePlotTitle: string;
    coveragePlotCaption: string;
    fragmentPlotTitle: string;
    peakTableTitle: string;
    peptideColumn: string;
    ppmColumn: string;
    plotHoverHint: string;
    referenceTrace: string;
    candidateTrace: string;
    notRetentionTimeNote: string;
    retentionTimeLabel: string;
    normalizedColumnLabel: string;
    provenanceTitle: string;
    provenanceWhatItIs: string;
    provenanceWhatItIsNot: string;
    provenanceDataSource: string;
    provenancePairing: string;
    notHeadToHeadNote: string;
    toolVersionsTitle: string;
    parametersTitle: string;
    inputHashesTitle: string;
    disclaimer: string;
    regulatoryVerdictTitle: string;
    imageComparisonTitle: string;
    imageComparisonOutcomes: Record<
      "CONSISTENT" | "INCONCLUSIVE" | "DIFFERENCE_OBSERVED" | "NOT_APPLICABLE",
      string
    >;
    qualityGatesTitle: string;
    qualityGateKindLabel: string;
    v2RuleConditionsTitle: string;
    v2DecisionMethodLabel: string;
    v2NumericBoundaryLabel: string;
    v2FinalRuleLabel: string;
    imagePeakTableTitle: string;
    imagePeakMatchedColumn: string;
    imagePeakShiftColumn: string;
    figureLibraryMismatch: string;
    figureLibraryExcluded: string;
    figureLibraryAnnotation: string;
    figureLibraryUseButton: string;
    figureLibraryLoadFailed: string;
    imageCalibrationTitle: string;
    imageCalibrationHint: string;
    imageCalibrationAxisMass: string;
    imageCalibrationAxisMz: string;
    imageCalibrationAxisRt: string;
    imageCalibrationPointOne: string;
    imageCalibrationPointTwo: string;
    imageCalibrationValuePlaceholder: string;
    imageCalibrationSpanTooSmall: string;
    imageCalibrationReady: string;
    imageCalibrationOptional: string;
    imageCalibrationClear: string;
    imagePeakAxisColumn: string;
    imageCalibrationLoadFailed: string;
    curveMetricsTitle: string;
    curvePearsonLabel: string;
    curveRmseLabel: string;
    curveRegionTableTitle: string;
    curveRegionNameColumn: string;
    curveReferencePercentColumn: string;
    curveCandidatePercentColumn: string;
    curveDeltaPpColumn: string;
    curvePeakTableTitle: string;
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
  assistant: {
    openButton: string;
    closeButton: string;
    title: string;
    newConversation: string;
    placeholder: string;
    send: string;
    sending: string;
    loading: string;
    timeout: string;
    networkError: string;
    unavailable: string;
    unconfigured: string;
    disclaimer: string;
    emptyHint: string;
    sourcesTitle: string;
    statusLive: string;
    mascotGreeting: string;
    suggestionMethod: string;
    suggestionResult: string;
    suggestionInput: string;
  };
  drawer: {
    railLabel: string;
    railTitle: string;
    railCategoriesGroup: string;
    railPagesGroup: string;
    railContextGroup: string;
    layerPositionTemplate: string;
    backOneLayer: string;
    closeAllLayers: string;
    closeTopLayer: string;
    returnToLayerTemplate: string;
    collapsedLayersTemplate: string;
    collapsedLayersHint: string;
    categoryOverviewTitle: string;
    categoryItemsTitle: string;
    itemSummaryTitle: string;
    itemDetailTitle: string;
    viewFullDetail: string;
    itemQuickLookTitle: string;
    itemFieldsTitle: string;
    methodSelectionTitle: string;
    methodDetailTitle: string;
    referenceCaseLayerTitle: string;
    regulatoryRelationTitle: string;
    categoryAssessmentTitle: string;
    itemAssessmentTitle: string;
    comparisonProcessTitle: string;
    openCategoryLayer: string;
    openItemLayer: string;
    openRelationLayer: string;
    emptyLayerNotice: string;
  };
  common: {
    supplementaryTag: string;
    viewDetails: string;
    notFoundTitle: string;
    notFoundDescription: string;
    backToHome: string;
    languageSwitchLabel: string;
    englishTodoNotice: string;
    skipToMainContent: string;
    openSiteMenu: string;
    closeSiteMenu: string;
    notAGovernmentSite: string;
    siteDisclaimerLine: string;
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
      integratedAssessment: "综合判别",
      allCategories: "全部大类",
      primaryLabel: "主导航",
    },
    comprehensiveAnalysis: {
      pageTitle: "综合相似性判别（演示）",
      pageDescription:
        "按 8 个质量属性大类与 61 个检测项目汇总用户录入的演示状态。这是总体证据演示，不是监管认定。",
      demoDataBadge: "示意 / 演示数据",
      demoUseBanner: "本页预载明确标注的 illustrative/demo 数据，便于查看完整流程；可清空后自行录入。",
      overallConclusionTitle: "总体证据结论",
      conclusionSupports: "支持相似性证据",
      conclusionDoesNotSupport: "不支持相似性证据",
      conclusionInsufficient: "证据不足",
      rationaleSupports: "所有参与汇总的适用非补充项均被标记为「支持相似」，且必要文本已填写。",
      rationaleDoesNotSupport: "至少一个参与汇总的项目被标记为「不支持相似」，按保守规则给出本结论。",
      rationaleInsufficient: "存在证据不足、未选择状态、必要文本缺失或未完成项目，尚不能给出支持性总体证据。",
      rationaleNoApplicableItems: "当前没有参与汇总的适用非补充项，总体结论为证据不足。",
      candidateNameLabel: "候选药名称",
      referenceNameLabel: "参照药名称",
      candidateLotLabel: "候选药批次",
      referenceLotLabel: "参照药批次",
      productTypeLabel: "产品类型或备注",
      analysisNameLabel: "分析名称",
      clearAndReenter: "清空并重新录入",
      restoreDemo: "恢复演示数据",
      disclaimer:
        "该结果为基于用户录入状态生成的总体证据演示，不构成生物类似药监管认定、临床结论或申报意见。",
      participatingCountLabel: "参与汇总项目",
      supportsCountLabel: "支持相似",
      doesNotSupportCountLabel: "不支持相似",
      insufficientCountLabel: "证据不足",
      notApplicableCountLabel: "不适用",
      incompleteCountLabel: "未完成",
      completenessLabel: "数据完整度",
      criticalItemsTitle: "影响最终结论的关键项目",
      noCriticalItems: "没有阻断性关键项目。",
      jumpToItem: "定位到该项目",
      overviewTitle: "直观比对总览",
      statusInventoryNote:
        "状态计数覆盖全部检测项目（含补充项），五项之和等于项目总数。补充项计入本图，但不参与总体结论。",
      statusSumLabel: "状态合计",
      completedRatioLabel: "已完成项目占比",
      categoryOverviewTitle: "八个质量属性大类概览",
      jumpToCategory: "定位到该大类",
      productPairOverviewTitle: "候选药与参照药并列",
      statusSupports: "支持相似",
      statusDoesNotSupport: "不支持相似",
      statusInsufficient: "证据不足",
      statusNotApplicable: "不适用",
      statusUnset: "未选择",
      applicabilityLabel: "是否适用于当前产品",
      applicableYes: "适用",
      applicableNo: "不适用",
      demoStatusLabel: "演示判定状态",
      candidateDataLabel: "候选药数据或描述",
      referenceDataLabel: "参照药数据或描述",
      comparisonNotesLabel: "比对说明",
      notApplicableReasonLabel: "不适用原因",
      completenessComplete: "已完成",
      completenessIncomplete: "未完成",
      expandProcess: "展开具体比对过程",
      collapseProcess: "收起比对过程",
      expandCategory: "展开大类",
      collapseCategory: "收起大类",
      processTitle: "具体比对过程（演示流程）",
      processStepInput: "1. 输入数据",
      processStepNormalization: "2. 归一化或预处理",
      processStepSideBySide: "3. 候选药与参照药直观并列",
      processStepDifference: "4. 差异识别",
      processStepPrinciple: "5. 判定原则",
      processStepConclusion: "6. 项目结论",
      processStepProvenance: "7. 数据来源和限制",
      demoFlowBadge: "演示流程",
      realComputationNotConnected: "尚未接入真实计算",
      notForRegulatoryJudgement: "不参与监管判断",
      schematicCaption: "示意并列图由项目编号与演示状态确定性生成，不是实测图谱。",
      schematicAlignmentAligned: "示意对齐（由「支持相似」状态绘制）",
      schematicAlignmentOffset: "示意偏移（由「不支持相似」状态绘制）",
      schematicAlignmentIncomplete: "示意不完整（由「证据不足」或未选择状态绘制）",
      schematicAlignmentNotApplicable: "示意不适用",
      emptyValuePlaceholder: "—",
      supplementaryExcludedNote: "补充项可展示，但不参与总体结论。",
      notApplicableReasonRequired: "选择不适用时必须填写原因。",
      textLengthLabel: "规范化后的描述字符数（不是检测值）",
      textsIdenticalNote: "规范化后的录入文本完全相同（演示层字符串比较，不是检测差异）。",
      textsDifferNote: "规范化后的录入文本不同（演示层字符串比较，不是检测差异）。",
      judgingPrincipleSourceLabel: "框架判定原则（来自特性鉴定条目，不是本页计算结果）",
      numericLimitSourceLabel: "数值限度/判定边界（来自特性鉴定条目）",
      demoDataSourceNote:
        "本页自由文本为用户录入或 illustrative/demo 预载内容，不是分析服务输出，也不覆盖单项真实分析结果。",
      normalizationNote:
        "演示预处理仅做空白折叠与去首尾空格，尚未接入真实谱图对齐、去卷积或统计等效性计算。",
      differenceNote: "差异识别目前只比较规范化文本，不根据关键词自动改写演示状态。",
      formSectionTitle: "基础信息",
      itemsSectionTitle: "按质量属性大类逐项录入",
      inputFileSectionTitle: "输入文件",
      inputFileSectionDescription:
        "选择输入填表包（Markdown）或会话 JSON。导入后填充 61 项综合判别表，并生成本地下载的输出书面报告。演示状态只来自表格中的状态列，描述文字不会改写结论。",
      inputFileLabel: "选择输入文件",
      inputFileAcceptHint:
        "只接受填表包 .md、.txt、.json，不接受图谱 PNG。填表包在「综合判别-岚岫珠单抗」子文件夹；根目录那 8 张 PNG 请到检测方法的比对文件框上传。",
      inputFileImportSuccess: "已导入并生成综合判别表与输出文件。",
      inputFileImportError: "无法导入该文件。",
      inputFileEmptyError: "没有选择文件，或文件为空。",
      inputFileTooLarge: "文件过大。请使用小于 2 MB 的填表包。",
      downloadOutputFile: "下载输出文件",
      outputFileReadyNote: "输出文件由当前会话生成，可再次下载。",
      inputFileStatusColumnNote:
        "自由文本不驱动判定。总体结论仍按选择器状态汇总，不构成生物类似药认定。",
    },
    home: {
      heroTitle: "生物类似药药学相似性分析框架",
      heroDescription:
        "基于《生物类似药药学比对研究质量属性、检测方法及相似性评价原则汇总表》构建的结构化知识框架，覆盖 8 个质量属性大类、61 个检测项目及其首选/正交检测方法，并为后续接入真实相似性分析预留接口。",
      heroPrimaryAction: "进入综合判别",
      heroSecondaryAction: "浏览质量属性大类",
      comprehensiveEntryTitle: "综合判别",
      comprehensiveEntryDescription:
        "按 8 个大类与 61 个检测项目汇总演示性比对证据。结果不是监管认定。",
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
      categoryIndexPrefix: "质量属性",
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
      methodSectionDescription:
        "选择一个方法查看检测内容。带「实机演示」标记的方法可在本页当场计算（合成数据）。",
      primaryMethodLabel: "首选",
      orthogonalMethodLabel: "正交/补充",
      methodContentPlaceholderTitle: "检测内容待嵌入",
      methodContentPlaceholderText:
        "该方法的真实检测内容（原理、样品制备、仪器参数、系统适用性、数据解读等）将在后续版本中嵌入此处。",
      noMethodsPlaceholder: "该项目未在汇总表中列出具体分析方法，需结合具体品种确定。",
      analysisSectionTitle: "相似性分析（预留）",
      analysisSectionDescription:
        "已编目的图谱库图会显示在下方。一张图同时含候选与参照。要跑分析，请到「方法选择」使用同一文件。",
      figureLibraryInputTitle: "图谱库比对图",
      figureLibraryInputHint:
        "来自本机「图谱数据库」根目录，不是综合判别填表包。",
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
    liveDemo: {
      badge: "实机演示",
      title: "实机演示（浏览器当场计算）",
      runButton: "运行演示",
      rerunButton: "重新计算",
      syntheticTag: "合成数据",
      publicSequenceTag: "公开序列 UniProt P02769",
      disclaimer:
        "本演示在浏览器内当场计算，使用公开序列或合成数据。工具能运行不等于方法学已验证，更不等于符合 GxP；数值接近不等于生物类似性成立。样品制备与仪器参数仍待嵌入。",
      sopStillPending:
        "本页上方已给出方法原理；样品制备、仪器参数、系统适用性等正文仍待嵌入。",
      sequenceLabel: "氨基酸序列",
      disulfideLabel: "二硫键对数",
      residueCountLabel: "残基数",
      cysteineCountLabel: "半胱氨酸数",
      reducedMassLabel: "全还原态平均质量",
      oxidizedMassLabel: "氧化态理论质量（真值）",
      recoveredMassLabel: "从电荷态包络回收的质量",
      deviationLabel: "回收偏差",
      chargeLabel: "主峰推断电荷",
      hexoseShiftLabel: "人为引入的己糖差异",
      candidateMassLabel: "候选药模拟质量",
      observedShiftLabel: "头对头质量差",
      attributableLabel: "该差异可归因为已知糖型",
      envelopeCaption: "合成电荷态包络（m/z vs 相对强度），不是实测谱图。",
      passLabel: "通过",
      failLabel: "未通过",
      peptideCountLabel: "理论肽段数",
      coverageLabel: "序列覆盖率",
      unmatchedLabel: "未匹配肽段（覆盖替换位点）",
      substitutionLabel: "人为氨基酸替换",
      substitutionDetectedLabel: "替换已在肽图中暴露为未匹配肽段",
      substitutionMissedLabel: "替换未被检出",
      referenceLotsLabel: "参照药批次（mol SH/mol protein）",
      candidateLotsLabel: "候选药批次",
      scenarioSimilar: "相似情景",
      scenarioShifted: "偏移情景",
      sigmaMultiplierLabel: "X（σ 倍数）",
      thresholdLabel: "落入比例阈值",
      meanLabel: "均值 μ",
      sdLabel: "标准差 σ",
      qrLabel: "质量范围 QR",
      withinLabel: "落入 QR 的批次",
      outOfRangeLabel: "超出 QR 的批次",
      supportsSimilarity: "按框架规则：可支持该属性相似",
      doesNotSupport: "按框架规则：不支持该属性相似",
      editHint: "数值可编辑。用空格、逗号或换行分隔。",
      provenanceTitle: "数据来源与计算原理",
      provenanceWhatItIs: "这是什么（为何不是虚构）",
      provenanceWhatItIsNot: "这不是什么",
      provenanceDataSource: "数据来源",
      provenancePrinciple: "计算原理",
      provenanceCheck: "独立校验",
      provenanceOracle: "可对照的已知数值",
      provenanceFiles: "本仓库中的实现与证据文件",
      provenanceLinks: "外部可核验链接",
    },
    methodContent: {
      sectionTitle: "方法学正文",
      principleLabel: "原理",
      pendingFieldsTitle: "以下正文字段仍待嵌入",
      pendingSamplePreparation: "样品制备",
      pendingInstrumentParameters: "仪器参数",
      pendingSystemSuitability: "系统适用性",
      pendingDataInterpretation: "数据解读",
      pendingSimilarityAssessmentLink: "与相似性评价的衔接",
      disclaimer:
        "原理为方法学说明，不是可直接执行的 SOP，也未经方法学验证；不得据此判定生物类似性。",
    },
    methodTools: {
      sectionTitle: "开源工具与部署实录",
      notSurveyedTitle: "该方法尚未调研",
      notSurveyedText:
        "本方法所属大类的开源工具调研尚未开展，此处不给出任何未经验证的结论。",
      gapTitle: "调研结论：缺口",
      surveyedOnLabel: "调研日期",
      licenseLabel: "许可证",
      stackLabel: "技术栈",
      capabilityLabel: "能力层级",
      deploymentLabel: "实际部署层级",
      notSupportedLabel: "明确不支持",
      evidenceLabel: "本机实测证据",
      repositoryLabel: "仓库",
      statsLabel: "仓库数据",
      recommendationPreferred: "首选",
      recommendationAlternative: "备选",
      recommendationConditional: "条件推荐",
      recommendationNotRecommended: "不推荐",
      deploymentUnverifiedWarning:
        "未在本机部署验证，以下判断仅来自文档与仓库页面。",
      disclaimer:
        "「工具能运行」不等于「方法学已验证」，更不等于「符合 GxP / 21 CFR Part 11」；「两组数据数值接近」不等于「生物类似性成立」。本栏仅说明工具可行性，不提供任何分析能力。",
    },
    methodAnalysis: {
      sectionTitle: "程序分析",
      statusLabels: {
        analyzable: "可运行分析",
        "blocked-by-tool": "工具未验证，暂不可用",
        "not-yet-supported": "尚未支持",
        "display-only": "仅展示（无上传入口）",
        "rule-not-defined": "规则未定义 — 不运行分析",
      },
      verdictLabels: {
        SUPPORTED_BY_THIS_ATTRIBUTE: "本属性支持一致",
        REVIEW: "需复核",
        DIFFERENCE_DETECTED: "检出差异",
        RULE_NOT_DEFINED: "规则未定义",
      },
      jobStatusValues: {
        QUEUED: "排队中",
        VALIDATING: "校验输入",
        RUNNING: "运行中",
        SUCCEEDED: "已完成",
        FAILED: "失败",
        CANCELLED: "已取消",
      },
      ruleCompleteTag: "V2 Sheet3 规则完整",
      rulePartialTag: "V2 Sheet3 规则部分",
      ruleAbsentTag: "V2 Sheet3 无可用规则",
      sheet3RuleUndefined: "Sheet3 未定义该项程序规则",
      plannedInLabel: "计划步骤",
      blockedByLabel: "阻塞工具",
      uploadHint:
        "比对文件与 DOCX 5.1.1 一致：可上传一张已含两侧的图/表，或按顺序选两个独立谱文件；序列 FASTA 另传。留空则运行合成演示。",
      candidateLabelField: "候选样品标签",
      referenceLabelField: "参照样品标签",
      headToHeadLabel: "声明为候选药与参照药头对头生物类似药设计",
      comparisonFileLabel: "候选/参照比对文件",
      comparisonFileHint:
        "1 个文件：镜像谱、TIC 镜像、A/B 双面板或两侧同表的合成图（含图谱库 PNG）。2 个文件须在同一对话框内一次选中：第 1 个=候选，第 2 个=参照（mzML、TXT/CSV；请先自行把 RAW/WIFF 转为 mzML）。若对话框里看不到 PNG，把文件类型改成「所有文件」。",
      comparisonSelectedFirst: "第 1 个（候选，或合成图）",
      comparisonSelectedSecond: "第 2 个（参照）",
      sequenceFileLabel: "序列 FASTA（可选）",
      inputFilesBoxTitle: "输入文件",
      fileEmptyPlaceholder: "未选择文件",
      syntheticFallbackNote:
        "未上传比对文件时使用合成演示，verdict 为 REVIEW。只传一个非图片谱文件时无法拆出两侧，同样退回合成演示。",
      runButton: "创建并运行分析",
      runningButton: "分析进行中…",
      cancelButton: "取消任务",
      jobStatusLabel: "任务状态",
      serviceOfflineTitle: "分析服务未连接",
      serviceOfflineText:
        "请在本机启动 analysis-service（默认 http://127.0.0.1:8765）。网页经本站 /api/analysis 转发，不直连 8765。例如：cd analysis-service && uvicorn app.main:app --port 8765",
      genericError: "分析请求失败，请检查服务日志。",
      syntheticDemoTag: "合成演示",
      imageOnlyTag: "仅图片",
      massesLabel: "去卷积质量",
      deltaDaLabel: "ΔDa",
      coverageLabel: "序列覆盖率",
      matchedPeptidesLabel: "匹配肽段（节选）",
      unmatchedPeptidesLabel: "未匹配肽段",
      ruleEvaluationTitle: "V2 规则评价",
      warningsTitle: "警告",
      limitationsTitle: "局限性",
      downloadJson: "下载 AnalysisResult JSON",
      downloadPng: "下载产物",
      mirrorPlotTitle: "完整质量镜像比对",
      overlayPlotTitle: "LC-MS 色谱叠加比对",
      referenceOnlyPlotTitle: "参照样品",
      candidateOnlyPlotTitle: "候选样品",
      coveragePlotTitle: "序列覆盖图",
      coveragePlotCaption: "每行 50 残基；灰底为已覆盖，白底为未覆盖。覆盖率百分比不是合格线。",
      fragmentPlotTitle: "MS/MS 碎片离子（b 上 / y 下）",
      peakTableTitle: "峰匹配表",
      peptideColumn: "肽段",
      ppmColumn: "Δppm",
      plotHoverHint: "悬停查看数值。前端为交互 SVG；PNG 由后端 matplotlib 生成。",
      referenceTrace: "参照",
      candidateTrace: "候选",
      notRetentionTimeNote: "横轴是图片列方向的归一化坐标，不是保留时间。",
      retentionTimeLabel: "RT (min)",
      normalizedColumnLabel: "normalized column",
      provenanceTitle: "分析溯源",
      provenanceWhatItIs: "这是什么",
      provenanceWhatItIsNot: "这不是什么",
      provenanceDataSource: "数据来源",
      provenancePairing: "样本配对",
      notHeadToHeadNote: "当前配对未声明为候选药与参照药头对头生物类似药设计。",
      toolVersionsTitle: "工具版本",
      parametersTitle: "运行参数",
      inputHashesTitle: "输入 SHA-256",
      disclaimer:
        "本面板连接 FastAPI 分析服务，输出的是单项质量属性的程序评价，不是整体生物类似性结论，也不代表 GxP 合规。",
      regulatoryVerdictTitle: "法规判定（V2 Sheet3）",
      imageComparisonTitle: "图像比对观察（只描述图片）",
      imageComparisonOutcomes: {
        CONSISTENT: "形状一致（图像层）",
        INCONCLUSIVE: "证据不足，不下结论",
        DIFFERENCE_OBSERVED: "图像层可见差异",
        NOT_APPLICABLE: "无两条可比曲线",
      },
      qualityGatesTitle: "算法质量门（不是相似性限度）",
      qualityGateKindLabel: "种类",
      v2RuleConditionsTitle: "V2 Sheet3 规则条件",
      v2DecisionMethodLabel: "判定方法",
      v2NumericBoundaryLabel: "数值边界",
      v2FinalRuleLabel: "最终程序规则",
      imagePeakTableTitle: "图像层峰配对（像素列，非实测 Da）",
      imagePeakMatchedColumn: "配对",
      imagePeakShiftColumn: "归一化位移",
      figureLibraryMismatch:
        "所选文件在图谱库中归属于其他检测项目，分析仍会运行，但药物体系可能对不上。",
      figureLibraryExcluded: "该图已从第一阶段映射中排除（V2 Sheet3 无对应项目）。",
      figureLibraryAnnotation: "图谱库标注",
      figureLibraryUseButton: "用作比对文件",
      figureLibraryLoadFailed: "未能从本机图谱库读取该图。请确认文件仍在「图谱数据库」根目录。",
      imageCalibrationTitle: "坐标轴两点校准（可选）",
      imageCalibrationHint:
        "在图上点选横轴上两个已知刻度，并填入印刷值。两点像素间距须 ≥ 20。未校准则只做形状比对，不输出 Da / m·z⁻¹ / min。OCR 读数不能替代这一步。",
      imageCalibrationAxisMass: "质量 (Da)",
      imageCalibrationAxisMz: "m/z (Da)",
      imageCalibrationAxisRt: "保留时间 (min)",
      imageCalibrationPointOne: "点 1",
      imageCalibrationPointTwo: "点 2",
      imageCalibrationValuePlaceholder: "轴值",
      imageCalibrationSpanTooSmall: "两点过近，无法定标。请点选相距更远的刻度。",
      imageCalibrationReady: "两点校准已就绪，将随本次分析提交。",
      imageCalibrationOptional: "未完成两点校准：本次运行不输出物理单位。",
      imageCalibrationClear: "清除校准点",
      imagePeakAxisColumn: "轴值",
      imageCalibrationLoadFailed: "预览未能显示该图，无法在图上取点。请重新选择文件后再试。",
      curveMetricsTitle: "曲线比对指标（算法观察）",
      curvePearsonLabel: "Pearson 相关",
      curveRmseLabel: "RMSE",
      curveRegionTableTitle: "分区面积 %",
      curveRegionNameColumn: "分区",
      curveReferencePercentColumn: "参照 %",
      curveCandidatePercentColumn: "候选 %",
      curveDeltaPpColumn: "差值 (pp)",
      curvePeakTableTitle: "检出峰",
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
    assistant: {
      openButton: "打开 AI 助手",
      closeButton: "关闭 AI 助手",
      title: "药学相似性助手",
      newConversation: "新建会话",
      placeholder: "询问方法、规则或当前分析结果…",
      send: "发送",
      sending: "发送中…",
      loading: "正在生成回答…",
      timeout: "请求超时，请稍后重试。",
      networkError: "网络错误，无法连接助手。",
      unavailable: "AI 助手暂时不可用。",
      unconfigured: "AI 助手尚未配置。",
      disclaimer:
        "AI 助手仅用于解释系统资料和分析结果，不构成生物类似药认定或监管建议。",
      emptyHint: "可询问检测方法、评价原则、系统操作，或请助手解释当前页已生成的分析结果。",
      sourcesTitle: "来源",
      statusLive: "在线",
      mascotGreeting: "有问题就问我呀～",
      suggestionMethod: "完整分子量一般用什么方法测定？",
      suggestionResult: "当前页面的分析结果说明了什么？",
      suggestionInput: "如何准备分析输入数据？",
    },
    drawer: {
      railLabel: "分层浏览导航",
      railTitle: "分层浏览",
      railCategoriesGroup: "质量属性大类",
      railPagesGroup: "全站入口",
      railContextGroup: "当前页入口",
      layerPositionTemplate: "第 {current} 层 / 共 {total} 层",
      backOneLayer: "返回上一层",
      closeAllLayers: "关闭全部层",
      closeTopLayer: "关闭最上层",
      returnToLayerTemplate: "返回第 {index} 层：{title}",
      collapsedLayersTemplate: "上层 {count} 个",
      collapsedLayersHint: "点击回跳到被折叠的最外层",
      categoryOverviewTitle: "大类概览",
      categoryItemsTitle: "检测项目列表",
      itemSummaryTitle: "项目摘要",
      itemDetailTitle: "完整详情",
      viewFullDetail: "查看完整详情",
      itemQuickLookTitle: "项目速览",
      itemFieldsTitle: "适用性与评价字段",
      methodSelectionTitle: "方法选择",
      methodDetailTitle: "方法原理与演示",
      referenceCaseLayerTitle: "参考案例与溯源",
      regulatoryRelationTitle: "法规关系说明",
      categoryAssessmentTitle: "大类判别明细",
      itemAssessmentTitle: "检测项目判别",
      comparisonProcessTitle: "七步比对过程",
      openCategoryLayer: "展开该大类",
      openItemLayer: "展开该项目",
      openRelationLayer: "展开该条法规关系",
      emptyLayerNotice: "该层暂无可展示内容。",
    },
    common: {
      supplementaryTag: "补充项",
      viewDetails: "查看详情",
      notFoundTitle: "页面不存在",
      notFoundDescription: "您访问的内容不存在或已被移除。",
      backToHome: "返回首页",
      languageSwitchLabel: "切换语言",
      englishTodoNotice: "英文内容为机器翻译占位，待校对。",
      skipToMainContent: "跳到主要内容",
      openSiteMenu: "打开站点菜单",
      closeSiteMenu: "关闭站点菜单",
      notAGovernmentSite: "本网站为研究与教学框架，不是政府机构官方网站。",
      siteDisclaimerLine:
        "本系统仅用于框架演示与教学，不构成生物类似药认定或监管建议。",
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
      integratedAssessment: "Integrated Assessment",
      allCategories: "All categories",
      primaryLabel: "Primary navigation",
    },
    comprehensiveAnalysis: {
      pageTitle: "Integrated similarity assessment (demo)",
      pageDescription:
        "Summarises user-entered demo statuses across 8 quality-attribute categories and 61 characterization items. This is an overall-evidence demonstration, not a regulatory determination.",
      demoDataBadge: "Illustrative / demo data",
      demoUseBanner:
        "This page preloads clearly labelled illustrative/demo data so the full flow is visible; you can clear it and enter your own values.",
      overallConclusionTitle: "Overall Evidence Conclusion",
      conclusionSupports: "Supports similarity evidence",
      conclusionDoesNotSupport: "Does not support similarity evidence",
      conclusionInsufficient: "Insufficient evidence",
      rationaleSupports:
        "Every applicable non-supplementary item included in the roll-up is marked “supports similarity”, and the required text is present.",
      rationaleDoesNotSupport:
        "At least one item included in the roll-up is marked “does not support similarity”; the conservative rule yields this conclusion.",
      rationaleInsufficient:
        "There is insufficient evidence, an unset status, missing required text, or an incomplete item, so a supportive overall conclusion cannot be issued.",
      rationaleNoApplicableItems:
        "There are currently no applicable non-supplementary items in the roll-up; the overall conclusion is insufficient evidence.",
      candidateNameLabel: "Candidate product name",
      referenceNameLabel: "Reference product name",
      candidateLotLabel: "Candidate lot",
      referenceLotLabel: "Reference lot",
      productTypeLabel: "Product type or notes",
      analysisNameLabel: "Analysis name",
      clearAndReenter: "Clear and re-enter",
      restoreDemo: "Restore demo data",
      disclaimer:
        "This result is an overall-evidence demonstration generated from user-entered statuses. It does not constitute a biosimilar regulatory determination, a clinical conclusion, or a filing opinion.",
      participatingCountLabel: "Items in the roll-up",
      supportsCountLabel: "Supports similarity",
      doesNotSupportCountLabel: "Does not support similarity",
      insufficientCountLabel: "Insufficient evidence",
      notApplicableCountLabel: "Not applicable",
      incompleteCountLabel: "Incomplete",
      completenessLabel: "Data completeness",
      criticalItemsTitle: "Items that drive the overall conclusion",
      noCriticalItems: "No blocking critical items.",
      jumpToItem: "Jump to this item",
      overviewTitle: "Visual comparison overview",
      statusInventoryNote:
        "Status counts cover every characterization item, including supplementary items. The five status totals equal the item count. Supplementary items appear here but are excluded from the overall conclusion.",
      statusSumLabel: "Status total",
      completedRatioLabel: "Share of completed items",
      categoryOverviewTitle: "Overview of the eight quality-attribute categories",
      jumpToCategory: "Jump to this category",
      productPairOverviewTitle: "Candidate and reference side by side",
      statusSupports: "Supports similarity",
      statusDoesNotSupport: "Does not support similarity",
      statusInsufficient: "Insufficient evidence",
      statusNotApplicable: "Not applicable",
      statusUnset: "Not selected",
      applicabilityLabel: "Applies to the current product",
      applicableYes: "Applicable",
      applicableNo: "Not applicable",
      demoStatusLabel: "Demo assessment status",
      candidateDataLabel: "Candidate data or description",
      referenceDataLabel: "Reference data or description",
      comparisonNotesLabel: "Comparison notes",
      notApplicableReasonLabel: "Reason not applicable",
      completenessComplete: "Complete",
      completenessIncomplete: "Incomplete",
      expandProcess: "Expand the comparison process",
      collapseProcess: "Collapse the comparison process",
      expandCategory: "Expand category",
      collapseCategory: "Collapse category",
      processTitle: "Item-level comparison process (demo flow)",
      processStepInput: "1. Input data",
      processStepNormalization: "2. Normalization or preprocessing",
      processStepSideBySide: "3. Candidate vs reference side by side",
      processStepDifference: "4. Difference identification",
      processStepPrinciple: "5. Judging principle",
      processStepConclusion: "6. Item conclusion",
      processStepProvenance: "7. Data source and limitations",
      demoFlowBadge: "Demo flow",
      realComputationNotConnected: "Real computation is not connected",
      notForRegulatoryJudgement: "Not used for regulatory judgement",
      schematicCaption:
        "The schematic overlay is generated deterministically from the item id and demo status; it is not a measured chromatogram or spectrum.",
      schematicAlignmentAligned: "Schematic alignment (drawn from “supports similarity”)",
      schematicAlignmentOffset: "Schematic offset (drawn from “does not support similarity”)",
      schematicAlignmentIncomplete:
        "Schematic incomplete (drawn from “insufficient evidence” or an unset status)",
      schematicAlignmentNotApplicable: "Schematic not applicable",
      emptyValuePlaceholder: "—",
      supplementaryExcludedNote: "Supplementary items can be shown but are excluded from the overall conclusion.",
      notApplicableReasonRequired: "A reason is required when the item is marked not applicable.",
      textLengthLabel: "Character count after normalization (not a measured value)",
      textsIdenticalNote:
        "Normalized entered texts are identical (demo-layer string comparison, not an analytical difference).",
      textsDifferNote:
        "Normalized entered texts differ (demo-layer string comparison, not an analytical difference).",
      judgingPrincipleSourceLabel:
        "Framework judging principle (from the characterization item, not computed on this page)",
      numericLimitSourceLabel: "Numerical limit / decision boundary (from the characterization item)",
      demoDataSourceNote:
        "Free text on this page is user-entered or illustrative/demo preload. It is not analysis-service output and does not overwrite per-item real analysis results.",
      normalizationNote:
        "Demo preprocessing only collapses whitespace and trims ends. Spectrum alignment, deconvolution and statistical equivalence are not connected.",
      differenceNote:
        "Difference identification currently compares normalized text only and never rewrites the demo status from keywords.",
      formSectionTitle: "Basic information",
      itemsSectionTitle: "Item-by-item entry by quality-attribute category",
      inputFileSectionTitle: "Input file",
      inputFileSectionDescription:
        "Choose an input fill-in pack (Markdown) or a session JSON. Import fills the 61-item assessment table and generates a locally downloaded written output report. Demo status comes only from the status column; description text never rewrites the conclusion.",
      inputFileLabel: "Choose input file",
      inputFileAcceptHint:
        "Accepts .md, .txt, and .json fill-in packs, not spectrum PNGs. The pack is in the 综合判别-岚岫珠单抗 subfolder; upload the eight root PNGs in a method comparison slot.",
      inputFileImportSuccess:
        "Imported. The assessment table and the output file have been generated.",
      inputFileImportError: "This file could not be imported.",
      inputFileEmptyError: "No file was selected, or the file is empty.",
      inputFileTooLarge: "The file is too large. Use a fill-in pack smaller than 2 MB.",
      downloadOutputFile: "Download output file",
      outputFileReadyNote: "The output file is generated from the current session and can be downloaded again.",
      inputFileStatusColumnNote:
        "Free text does not drive the verdict. The overall conclusion still rolls up selector status and is not a biosimilar determination.",
    },
    home: {
      heroTitle: "Biosimilar CMC Similarity Assessment Framework",
      heroDescription:
        "A structured knowledge framework built on the summary table of quality attributes, analytical methods and similarity assessment principles for biosimilar CMC comparability studies. It covers 8 quality-attribute categories, 61 characterization items with their primary/orthogonal methods, and reserves interfaces for future real similarity analysis.",
      heroPrimaryAction: "Open integrated assessment",
      heroSecondaryAction: "Browse quality-attribute categories",
      comprehensiveEntryTitle: "Integrated Assessment",
      comprehensiveEntryDescription:
        "Roll up illustrative comparison evidence across 8 categories and 61 items. The result is not a regulatory determination.",
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
      categoryIndexPrefix: "Quality attribute",
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
        "Select a method to view its detection content. Methods marked Live demo compute on this page (synthetic data).",
      primaryMethodLabel: "Primary",
      orthogonalMethodLabel: "Orthogonal / supplementary",
      methodContentPlaceholderTitle: "Detection content to be embedded",
      methodContentPlaceholderText:
        "The real detection content of this method (principle, sample preparation, instrument parameters, system suitability, data interpretation, etc.) will be embedded here in a future release.",
      noMethodsPlaceholder:
        "No specific analytical method is listed for this item in the summary table; it must be defined for the specific product.",
      analysisSectionTitle: "Similarity Analysis (Reserved)",
      analysisSectionDescription:
        "Catalogued figure-library images appear below. Each figure contains both sides. To run analysis, use the same file under Method selection.",
      figureLibraryInputTitle: "Figure-library comparison",
      figureLibraryInputHint:
        "From the local 图谱数据库 folder root, not the comprehensive-assessment fill-in pack.",
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
    liveDemo: {
      badge: "Live demo",
      title: "Live demo (computed in the browser)",
      runButton: "Run demo",
      rerunButton: "Recompute",
      syntheticTag: "Synthetic data",
      publicSequenceTag: "Public sequence UniProt P02769",
      disclaimer:
        "This demo computes in the browser from a public sequence or synthetic data. That the tool runs does not mean the method is validated, still less GxP-compliant; numerical closeness does not establish biosimilarity. Sample preparation and instrument parameters are still to be embedded.",
      sopStillPending:
        "The method principle is given above; sample preparation, instrument parameters and system suitability are still to be embedded.",
      sequenceLabel: "Amino-acid sequence",
      disulfideLabel: "Disulfide-bond count",
      residueCountLabel: "Residue count",
      cysteineCountLabel: "Cysteine count",
      reducedMassLabel: "Fully reduced average mass",
      oxidizedMassLabel: "Oxidised theoretical mass (ground truth)",
      recoveredMassLabel: "Mass recovered from the charge envelope",
      deviationLabel: "Recovery deviation",
      chargeLabel: "Inferred charge of the base peak",
      hexoseShiftLabel: "Deliberately introduced hexose difference",
      candidateMassLabel: "Simulated candidate mass",
      observedShiftLabel: "Head-to-head mass difference",
      attributableLabel: "Difference attributable to a known glycoform",
      envelopeCaption:
        "Synthetic charge-state envelope (m/z vs relative intensity), not a measured spectrum.",
      passLabel: "Pass",
      failLabel: "Fail",
      peptideCountLabel: "Theoretical peptide count",
      coverageLabel: "Sequence coverage",
      unmatchedLabel: "Unmatched peptides spanning the substitution",
      substitutionLabel: "Deliberate amino-acid substitution",
      substitutionDetectedLabel: "The substitution is exposed as unmatched peptides",
      substitutionMissedLabel: "The substitution was not detected",
      referenceLotsLabel: "Reference lots (mol SH/mol protein)",
      candidateLotsLabel: "Candidate lots",
      scenarioSimilar: "Similar scenario",
      scenarioShifted: "Shifted scenario",
      sigmaMultiplierLabel: "X (σ multiplier)",
      thresholdLabel: "Within-range fraction threshold",
      meanLabel: "Mean μ",
      sdLabel: "SD σ",
      qrLabel: "Quality range QR",
      withinLabel: "Lots inside QR",
      outOfRangeLabel: "Lots outside QR",
      supportsSimilarity: "Per the framework rule: similarity of this attribute can be supported",
      doesNotSupport: "Per the framework rule: similarity of this attribute is not supported",
      editHint: "Values are editable. Separate them with spaces, commas or newlines.",
      provenanceTitle: "Data source and calculation principle",
      provenanceWhatItIs: "What this is (why it is not fictional)",
      provenanceWhatItIsNot: "What this is not",
      provenanceDataSource: "Data source",
      provenancePrinciple: "Calculation principle",
      provenanceCheck: "Independent check",
      provenanceOracle: "Oracle values that can be checked",
      provenanceFiles: "Implementation and evidence files in this repository",
      provenanceLinks: "External verifiable links",
    },
    methodContent: {
      sectionTitle: "Method SOP body",
      principleLabel: "Principle",
      pendingFieldsTitle: "SOP fields still to be embedded",
      pendingSamplePreparation: "Sample preparation",
      pendingInstrumentParameters: "Instrument parameters",
      pendingSystemSuitability: "System suitability",
      pendingDataInterpretation: "Data interpretation",
      pendingSimilarityAssessmentLink: "Link to similarity assessment",
      disclaimer:
        "The principle is explanatory method text, not an executable SOP, and has not been validated; biosimilarity must not be concluded from it.",
    },
    methodTools: {
      sectionTitle: "Open-source tools and deployment record",
      notSurveyedTitle: "This method has not been surveyed",
      notSurveyedText:
        "The open-source tool survey for this method's category has not started; no unverified conclusion is offered here.",
      gapTitle: "Survey conclusion: gap",
      surveyedOnLabel: "Surveyed on",
      licenseLabel: "Licence",
      stackLabel: "Stack",
      capabilityLabel: "Capability levels",
      deploymentLabel: "Deployment level reached",
      notSupportedLabel: "Explicitly not supported",
      evidenceLabel: "Local verification evidence",
      repositoryLabel: "Repository",
      statsLabel: "Repository metrics",
      recommendationPreferred: "Preferred",
      recommendationAlternative: "Alternative",
      recommendationConditional: "Conditional",
      recommendationNotRecommended: "Not recommended",
      deploymentUnverifiedWarning:
        "Not deployed or verified locally; the assessment below comes from documentation and the repository page only.",
      disclaimer:
        "\"The tool runs\" does not mean \"the method is validated\", still less \"GxP / 21 CFR Part 11 compliant\"; \"the two datasets are numerically close\" does not mean \"biosimilarity is established\". This panel describes tool feasibility only and provides no analytical capability.",
    },
    methodAnalysis: {
      sectionTitle: "Program analysis",
      statusLabels: {
        analyzable: "Analysis available",
        "blocked-by-tool": "Blocked — tool not verified",
        "not-yet-supported": "Not yet supported",
        "display-only": "Display only — no upload",
        "rule-not-defined": "Rule not defined — no analysis runs",
      },
      verdictLabels: {
        SUPPORTED_BY_THIS_ATTRIBUTE: "Supported for this attribute",
        REVIEW: "Review required",
        DIFFERENCE_DETECTED: "Difference detected",
        RULE_NOT_DEFINED: "Rule not defined",
      },
      jobStatusValues: {
        QUEUED: "Queued",
        VALIDATING: "Validating",
        RUNNING: "Running",
        SUCCEEDED: "Succeeded",
        FAILED: "Failed",
        CANCELLED: "Cancelled",
      },
      ruleCompleteTag: "V2 sheet 3 rule complete",
      rulePartialTag: "V2 sheet 3 rule partial",
      ruleAbsentTag: "No usable V2 sheet 3 rule",
      sheet3RuleUndefined: "Sheet 3 defines no program rule for this item",
      plannedInLabel: "Planned in",
      blockedByLabel: "Blocked by",
      uploadHint:
        "Comparison files follow DOCX 5.1.1: one combined figure/table with both sides, or two separate spectra in order. FASTA is separate. Leave empty for the synthetic demo.",
      candidateLabelField: "Candidate label",
      referenceLabelField: "Reference label",
      headToHeadLabel: "Declare head-to-head biosimilar candidate vs reference design",
      comparisonFileLabel: "Candidate/reference comparison file",
      comparisonFileHint:
        "One file: a combined mirror, TIC overlay, A/B panels, or a two-sided table (including figure-library PNGs). Two files must be chosen in the same dialog: first = candidate, second = reference (mzML or TXT/CSV; convert RAW/WIFF to mzML yourself first). If PNGs are hidden, set the dialog type to All files.",
      comparisonSelectedFirst: "1st (candidate, or combined figure)",
      comparisonSelectedSecond: "2nd (reference)",
      sequenceFileLabel: "Sequence FASTA (optional)",
      inputFilesBoxTitle: "Input files",
      fileEmptyPlaceholder: "No file selected",
      syntheticFallbackNote:
        "With no comparison file the service uses the synthetic demo and verdict is REVIEW. A single non-image spectrum cannot be split into two sides, so it also falls back to the demo.",
      runButton: "Create and run analysis",
      runningButton: "Analysis running…",
      cancelButton: "Cancel job",
      jobStatusLabel: "Job status",
      serviceOfflineTitle: "Analysis service offline",
      serviceOfflineText:
        "Start analysis-service locally (default http://127.0.0.1:8765). The page talks to /api/analysis on this site, not to port 8765 directly. Example: cd analysis-service && uvicorn app.main:app --port 8765",
      genericError: "Analysis request failed; check the service log.",
      syntheticDemoTag: "Synthetic demo",
      imageOnlyTag: "Image only",
      massesLabel: "Deconvolved masses",
      deltaDaLabel: "ΔDa",
      coverageLabel: "Sequence coverage",
      matchedPeptidesLabel: "Matched peptides (sample)",
      unmatchedPeptidesLabel: "Unmatched peptides",
      ruleEvaluationTitle: "V2 rule evaluation",
      warningsTitle: "Warnings",
      limitationsTitle: "Limitations",
      downloadJson: "Download AnalysisResult JSON",
      downloadPng: "Download artifact",
      mirrorPlotTitle: "Intact-mass mirror comparison",
      overlayPlotTitle: "LC-MS chromatogram overlay comparison",
      referenceOnlyPlotTitle: "Reference sample",
      candidateOnlyPlotTitle: "Candidate sample",
      coveragePlotTitle: "Sequence coverage map",
      coveragePlotCaption:
        "50 residues per row; grey is covered, white is uncovered. Coverage % is not an acceptance threshold.",
      fragmentPlotTitle: "MS/MS fragment ions (b up / y down)",
      peakTableTitle: "Peak match table",
      peptideColumn: "Peptide",
      ppmColumn: "Δppm",
      plotHoverHint: "Hover for values. The SVG is interactive; PNGs are rendered by matplotlib.",
      referenceTrace: "Reference",
      candidateTrace: "Candidate",
      notRetentionTimeNote: "The x-axis is a normalized image column, not retention time.",
      retentionTimeLabel: "RT (min)",
      normalizedColumnLabel: "normalized column",
      provenanceTitle: "Analysis provenance",
      provenanceWhatItIs: "What this is",
      provenanceWhatItIsNot: "What this is not",
      provenanceDataSource: "Data source",
      provenancePairing: "Sample pairing",
      notHeadToHeadNote:
        "This pairing is not declared as a head-to-head biosimilar candidate-versus-reference design.",
      toolVersionsTitle: "Tool versions",
      parametersTitle: "Run parameters",
      inputHashesTitle: "Input SHA-256",
      disclaimer:
        "This panel calls the FastAPI analysis service. Output is a programmatic view on one quality attribute, not overall biosimilarity or GxP compliance.",
      regulatoryVerdictTitle: "Regulatory verdict (V2 sheet 3)",
      imageComparisonTitle: "Image-level observation (pictures only)",
      imageComparisonOutcomes: {
        CONSISTENT: "Shape consistent (image layer)",
        INCONCLUSIVE: "Inconclusive",
        DIFFERENCE_OBSERVED: "Difference visible at image level",
        NOT_APPLICABLE: "No comparable pair of curves",
      },
      qualityGatesTitle: "Algorithm quality gates (not similarity limits)",
      qualityGateKindLabel: "Kind",
      v2RuleConditionsTitle: "V2 sheet 3 rule conditions",
      v2DecisionMethodLabel: "Decision method",
      v2NumericBoundaryLabel: "Numeric boundary",
      v2FinalRuleLabel: "Final program rule",
      imagePeakTableTitle: "Image-level peak pairs (pixel column, not measured Da)",
      imagePeakMatchedColumn: "Paired",
      imagePeakShiftColumn: "Normalised shift",
      figureLibraryMismatch:
        "This file is catalogued under a different analysis item. The run still proceeds, but the drug system may not match.",
      figureLibraryExcluded:
        "This figure is excluded from the first-phase mapping (no matching V2 sheet 3 item).",
      figureLibraryAnnotation: "Library annotation",
      figureLibraryUseButton: "Use as comparison file",
      figureLibraryLoadFailed:
        "Could not read this figure from the local library. Confirm it is still in the 图谱数据库 folder root.",
      imageCalibrationTitle: "Two-point axis calibration (optional)",
      imageCalibrationHint:
        "Click two known ticks on the horizontal axis and type the printed values. The pixel span must be ≥ 20. Without this, only shape comparison is reported — no Da / m·z⁻¹ / min. OCR readings cannot replace this step.",
      imageCalibrationAxisMass: "Mass (Da)",
      imageCalibrationAxisMz: "m/z (Da)",
      imageCalibrationAxisRt: "Retention time (min)",
      imageCalibrationPointOne: "Point 1",
      imageCalibrationPointTwo: "Point 2",
      imageCalibrationValuePlaceholder: "Axis value",
      imageCalibrationSpanTooSmall:
        "The two points are too close to fix a scale. Click ticks farther apart.",
      imageCalibrationReady: "Two-point calibration is ready and will be sent with this run.",
      imageCalibrationOptional: "No complete two-point calibration: this run withholds physical units.",
      imageCalibrationClear: "Clear calibration points",
      imagePeakAxisColumn: "Axis value",
      imageCalibrationLoadFailed:
        "The figure preview failed to load, so points cannot be picked. Reselect the file and try again.",
      curveMetricsTitle: "Curve comparison metrics (algorithm observation)",
      curvePearsonLabel: "Pearson correlation",
      curveRmseLabel: "RMSE",
      curveRegionTableTitle: "Region area %",
      curveRegionNameColumn: "Region",
      curveReferencePercentColumn: "Reference %",
      curveCandidatePercentColumn: "Candidate %",
      curveDeltaPpColumn: "Delta (pp)",
      curvePeakTableTitle: "Picked peaks",
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
    assistant: {
      openButton: "Open AI assistant",
      closeButton: "Close AI assistant",
      title: "CMC similarity assistant",
      newConversation: "New conversation",
      placeholder: "Ask about methods, rules, or the current analysis result…",
      send: "Send",
      sending: "Sending…",
      loading: "Generating an answer…",
      timeout: "The request timed out. Please try again.",
      networkError: "Network error. The assistant could not be reached.",
      unavailable: "The AI assistant is temporarily unavailable.",
      unconfigured: "The AI assistant is not configured.",
      disclaimer:
        "The AI assistant only explains system materials and analysis results. It does not constitute a biosimilar determination or regulatory advice.",
      emptyHint:
        "Ask about methods, evaluation principles, system use, or an explanation of results already generated on this page.",
      sourcesTitle: "Sources",
      statusLive: "Live",
      mascotGreeting: "Ask me anything!",
      suggestionMethod: "What method is typically used to measure intact mass?",
      suggestionResult: "What does the analysis result on this page mean?",
      suggestionInput: "How should I prepare analysis input data?",
    },
    drawer: {
      railLabel: "Layered browsing navigation",
      railTitle: "Layered browsing",
      railCategoriesGroup: "Quality attribute categories",
      railPagesGroup: "Site entries",
      railContextGroup: "Entries for this page",
      layerPositionTemplate: "Layer {current} of {total}",
      backOneLayer: "Back one layer",
      closeAllLayers: "Close all layers",
      closeTopLayer: "Close the top layer",
      returnToLayerTemplate: "Back to layer {index}: {title}",
      collapsedLayersTemplate: "{count} outer layers",
      collapsedLayersHint: "Select to jump back to the outermost collapsed layer",
      categoryOverviewTitle: "Category overview",
      categoryItemsTitle: "Characterization items",
      itemSummaryTitle: "Item summary",
      itemDetailTitle: "Full detail",
      viewFullDetail: "View full details",
      itemQuickLookTitle: "Item quick look",
      itemFieldsTitle: "Applicability and assessment fields",
      methodSelectionTitle: "Method selection",
      methodDetailTitle: "Method principle and demo",
      referenceCaseLayerTitle: "Reference cases and provenance",
      regulatoryRelationTitle: "Regulatory relation detail",
      categoryAssessmentTitle: "Category assessment detail",
      itemAssessmentTitle: "Item assessment",
      comparisonProcessTitle: "Seven-step comparison process",
      openCategoryLayer: "Open this category",
      openItemLayer: "Open this item",
      openRelationLayer: "Open this regulatory relation",
      emptyLayerNotice: "This layer has no content to show.",
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
      skipToMainContent: "Skip to main content",
      openSiteMenu: "Open site menu",
      closeSiteMenu: "Close site menu",
      notAGovernmentSite:
        "This website is a research and teaching framework, not an official government site.",
      siteDisclaimerLine:
        "This system is for framework demonstration and teaching only. It does not constitute a biosimilar determination or regulatory advice.",
    },
  },
};
