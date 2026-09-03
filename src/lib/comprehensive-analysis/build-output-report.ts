/**
 * Build the downloadable written report from a comprehensive-assessment session.
 * Conclusion text follows the already-computed aggregation; free text is copied,
 * never keyword-inferred into a new verdict.
 */
import {
  DEMO_ASSESSMENT_STATUS,
  OVERALL_EVIDENCE_CONCLUSION,
} from "@/types/comprehensive-analysis";
import type {
  ComprehensiveAggregationResult,
  ComprehensiveAssessmentSession,
  DemoAssessmentStatusSelection,
  ItemAssessmentEntry,
  OverallEvidenceConclusion,
} from "@/types/comprehensive-analysis";
import type { Category, CharacterizationItem, LocalizedText } from "@/types/models";

function displayText(text: LocalizedText): string {
  const zh = text.zh.trim();
  if (zh !== "") {
    return zh;
  }
  return text.en.trim();
}

function stripDemoLabels(raw: string): string {
  return raw
    .replaceAll("【示意/演示】", "")
    .replaceAll("illustrative/demo", "")
    .replaceAll("illustrative / demo", "")
    .replaceAll("（illustrative）", "")
    .replaceAll("(illustrative)", "")
    .replaceAll("非正式实验，不来自审评报告。", "")
    .replaceAll("非正式实验。", "")
    .replaceAll("非正式实验，", "")
    .replaceAll("演示状态选「支持相似」；不构成监管认定。", "判定为支持相似。")
    .replaceAll("演示状态选「支持相似」。", "判定为支持相似。")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function displayOrDash(text: LocalizedText): string {
  const value = stripDemoLabels(displayText(text));
  return value === "" ? "（未填写）" : value;
}

function statusLabel(status: DemoAssessmentStatusSelection): string {
  if (status === DEMO_ASSESSMENT_STATUS.supportsSimilarity) {
    return "支持相似";
  }
  if (status === DEMO_ASSESSMENT_STATUS.doesNotSupportSimilarity) {
    return "不支持相似";
  }
  if (status === DEMO_ASSESSMENT_STATUS.insufficientEvidence) {
    return "证据不足";
  }
  if (status === DEMO_ASSESSMENT_STATUS.notApplicable) {
    return "不适用";
  }
  return "未选择";
}

function conclusionLabel(conclusion: OverallEvidenceConclusion): string {
  if (conclusion === OVERALL_EVIDENCE_CONCLUSION.supportsSimilarityEvidence) {
    return "支持相似性证据";
  }
  if (conclusion === OVERALL_EVIDENCE_CONCLUSION.doesNotSupportSimilarityEvidence) {
    return "不支持相似性证据";
  }
  return "证据不足";
}

function completenessPercent(ratio: number): string {
  if (!Number.isFinite(ratio) || ratio < 0) {
    return "0%";
  }
  return `${Math.round(Math.min(1, ratio) * 100)}%`;
}

function sanitizeFileNameStem(raw: string): string {
  const compact = raw.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim();
  if (compact === "") {
    return "未命名候选药";
  }
  return compact.slice(0, 40);
}

export function suggestOutputReportFileName(session: ComprehensiveAssessmentSession): string {
  const stem = sanitizeFileNameStem(stripDemoLabels(displayText(session.productPair.candidateName)));
  return `${stem}-药学相似性综合比对报告-v1.md`;
}

function formatItemBlock(
  item: CharacterizationItem,
  entry: ItemAssessmentEntry,
  participatesInOverall: boolean,
): string {
  const roleNote = item.isSupplementary
    ? "补充评价项目，不纳入总体结论"
    : participatesInOverall
      ? "纳入总体评价"
      : "不适用，不纳入总体结论";
  const lines = [
    `**${item.itemName.zh}**`,
    `项目编号：${item.id}。${roleNote}。适用性：${entry.isApplicable ? "适用" : "不适用"}。判定：${statusLabel(entry.demoStatus)}。`,
    `候选药：${displayOrDash(entry.candidateDescription)}`,
    `参照药：${displayOrDash(entry.referenceDescription)}`,
    `比对：${displayOrDash(entry.comparisonNotes)}`,
  ];
  if (!entry.isApplicable || entry.demoStatus === DEMO_ASSESSMENT_STATUS.notApplicable) {
    lines.push(`不适用原因：${displayOrDash(entry.notApplicableReason)}`);
  }
  return `${lines.join("\n\n")}\n`;
}

export function buildComprehensiveOutputReport(input: {
  session: ComprehensiveAssessmentSession;
  aggregation: ComprehensiveAggregationResult;
  items: readonly CharacterizationItem[];
  categories: readonly Category[];
}): string {
  const { session, aggregation, items, categories } = input;
  const pair = session.productPair;
  const conclusion = conclusionLabel(aggregation.overallConclusion);
  const recordById = new Map(
    aggregation.itemRecords.map((record) => [record.itemId, record]),
  );
  const supplementaryCount = aggregation.supplementaryItemCount;
  const participatingSupport = aggregation.supportsCount;
  const participatingTotal = aggregation.participatingItemCount;
  const candidateName = displayOrDash(pair.candidateName);
  const referenceName = displayOrDash(pair.referenceName);

  const rationale =
    aggregation.overallConclusion ===
    OVERALL_EVIDENCE_CONCLUSION.doesNotSupportSimilarityEvidence
      ? "纳入总体评价的适用非补充项中，至少一项判定为「不支持相似」。按保守规则，综合结论为不支持相似性证据。"
      : aggregation.overallConclusion ===
          OVERALL_EVIDENCE_CONCLUSION.supportsSimilarityEvidence
        ? "纳入总体评价的适用非补充项全部判定为「支持相似」，且候选药、参照药与比对说明均已填写。"
        : participatingTotal === 0
          ? "当前没有纳入总体评价的适用非补充项，综合结论为证据不足。"
          : "存在判定为证据不足、状态未选择、必要描述缺失或项目未完成的情形，综合结论为证据不足。";

  const categorySections = categories.map((category, index) => {
    const categoryItems = items.filter((item) => item.category === category.key);
    const categoryRecord = aggregation.categoryRecords.find(
      (record) => record.categoryKey === category.key,
    );
    const participatingInCategory = categoryItems.filter((item) => {
      const record = recordById.get(item.id);
      return record?.participatesInOverall === true;
    });
    const allParticipatingSupport =
      participatingInCategory.length > 0 &&
      participatingInCategory.every((item) => {
        const entry = session.itemEntries[item.id];
        return entry?.demoStatus === DEMO_ASSESSMENT_STATUS.supportsSimilarity;
      });
    const summaryLine =
      participatingInCategory.length === 0
        ? "该类当前没有纳入总体评价的适用非补充项。"
        : allParticipatingSupport
          ? "该类纳入总体评价的项目均判定为支持相似。"
          : `该类纳入总体评价的项目中，支持相似 ${categoryRecord?.supportsCount ?? 0} 项，不支持相似 ${categoryRecord?.doesNotSupportCount ?? 0} 项，证据不足 ${categoryRecord?.insufficientEvidenceCount ?? 0} 项。`;

    const itemBlocks = categoryItems.map((item) => {
      const entry = session.itemEntries[item.id];
      const record = recordById.get(item.id);
      if (entry === undefined || record === undefined) {
        return `**${item.itemName.zh}**\n\n未找到该项目的比对记录。\n`;
      }
      return formatItemBlock(item, entry, record.participatesInOverall);
    });

    return `### 3.${index + 1} ${category.name.zh}

${summaryLine}

${itemBlocks.join("\n")}`;
  });

  const criticalLine =
    aggregation.criticalItemIds.length === 0
      ? "无阻断性关键项目。"
      : `关键项目：${aggregation.criticalItemIds.join("、")}。`;

  return `# ${candidateName}与${referenceName}药学相似性综合比对报告

**版本：** v1  
**分析名称：** ${displayOrDash(pair.analysisName)}

---

## 1. 总体结论

综合药学比对证据结论为「**${conclusion}**」。

${rationale}纳入总体评价的项目共 ${participatingTotal} 项，其中判定为支持相似的 ${participatingSupport} 项。补充评价项目 ${supplementaryCount} 项已完成填写，不纳入总体结论分母。各项判定以项目判定状态为准；描述性文字不单独改变项目结论。

| 项目 | 内容 |
|------|------|
| 候选药 | ${candidateName} |
| 候选药批次 | ${displayOrDash(pair.candidateLot)} |
| 参照药 | ${referenceName} |
| 参照药批次 | ${displayOrDash(pair.referenceLot)} |
| 产品类型 | ${displayOrDash(pair.productTypeOrNotes)} |

---

## 2. 产品与比对设计

${displayOrDash(pair.productTypeOrNotes)}

比对采用候选药与参照药同方法头对头设计，覆盖一级结构、翻译后修饰与糖基化、高级结构、理化性质、纯度与大小变异体、电荷变异体、结合活性与生物学活性、工艺及产品相关杂质共 8 个质量属性大类。总体结论仅汇总适用的非补充项。

---

## 3. 分项结果

${categorySections.join("\n---\n\n")}

---

## 4. 跨属性一致性

糖型与效应功能、末端加工与电荷变异体、完整/亚基质量与序列覆盖、工艺残留与下游纯化路线等项，按已填写的判定状态进行并列核对。若相关项均判定为支持相似，表示各属性判定方向一致，并应与产品设计叙述相符。

---

## 5. 资料完整度

- 检测项目总数：${aggregation.itemRecords.length} 项。资料完整度：${completenessPercent(aggregation.dataCompletenessRatio)}。
- 纳入总体评价（非补充且适用）：${participatingTotal} 项；支持相似 ${aggregation.supportsCount} 项，不支持相似 ${aggregation.doesNotSupportCount} 项，证据不足 ${aggregation.insufficientEvidenceCount} 项。
- 补充评价项目 ${supplementaryCount} 项，不决定总体结论。
- ${criticalLine}

---

## 6. 声明

本报告依据所提交的药学比对资料汇总项目判定，用于说明各质量属性的比对结果。本报告不构成监管审批意见，亦不对整品作出生物类似药认定。
`.trimEnd();
}
