/**
 * Parse a comprehensive-assessment input file into a session.
 * Demo status comes only from explicit status columns / JSON fields.
 * Description text is never keyword-inferred.
 */
import { EMPTY_LOCALIZED_TEXT } from "@/lib/comprehensive-analysis/summarize";
import { DEMO_ASSESSMENT_STATUS } from "@/types/comprehensive-analysis";
import type {
  ComprehensiveAssessmentSession,
  DemoAssessmentStatusSelection,
  ItemAssessmentEntry,
  ProductPairInput,
} from "@/types/comprehensive-analysis";
import type { LocalizedText } from "@/types/models";

const PRODUCT_PAIR_LABEL_TO_FIELD = {
  分析名称: "analysisName",
  产品类型或备注: "productTypeOrNotes",
  候选药名称: "candidateName",
  参照药名称: "referenceName",
  候选药批次: "candidateLot",
  参照药批次: "referenceLot",
  "Analysis name": "analysisName",
  "Product type or notes": "productTypeOrNotes",
  "Candidate product name": "candidateName",
  "Reference product name": "referenceName",
  "Candidate lot": "candidateLot",
  "Reference lot": "referenceLot",
} as const;

type ProductPairFieldName = keyof ProductPairInput;

export interface ParseInputFileResult {
  ok: boolean;
  session: ComprehensiveAssessmentSession | null;
  recognizedItemCount: number;
  warnings: string[];
  error: string | null;
}

function textFromZh(value: string): LocalizedText {
  return { zh: value, en: "" };
}

function createEmptySession(allowedItemIds: readonly string[]): ComprehensiveAssessmentSession {
  const itemEntries: Record<string, ItemAssessmentEntry> = {};
  for (const itemId of allowedItemIds) {
    itemEntries[itemId] = {
      itemId,
      isApplicable: true,
      demoStatus: null,
      candidateDescription: EMPTY_LOCALIZED_TEXT,
      referenceDescription: EMPTY_LOCALIZED_TEXT,
      comparisonNotes: EMPTY_LOCALIZED_TEXT,
      notApplicableReason: EMPTY_LOCALIZED_TEXT,
    };
  }
  return {
    productPair: {
      analysisName: EMPTY_LOCALIZED_TEXT,
      candidateName: EMPTY_LOCALIZED_TEXT,
      referenceName: EMPTY_LOCALIZED_TEXT,
      candidateLot: EMPTY_LOCALIZED_TEXT,
      referenceLot: EMPTY_LOCALIZED_TEXT,
      productTypeOrNotes: EMPTY_LOCALIZED_TEXT,
    },
    itemEntries,
  };
}

function productPairFieldFromLabel(label: string): ProductPairFieldName | undefined {
  if (Object.prototype.hasOwnProperty.call(PRODUCT_PAIR_LABEL_TO_FIELD, label)) {
    return PRODUCT_PAIR_LABEL_TO_FIELD[label as keyof typeof PRODUCT_PAIR_LABEL_TO_FIELD];
  }
  return undefined;
}

function splitMarkdownRow(line: string): string[] | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|")) {
    return null;
  }
  const inner = trimmed.replace(/^\|/, "").replace(/\|$/, "");
  return inner.split("|").map((cell) => cell.trim());
}

function isSeparatorRow(cells: readonly string[]): boolean {
  return cells.length > 0 && cells.every((cell) => /^:?-{2,}:?$/.test(cell));
}

function isHeaderRow(cells: readonly string[]): boolean {
  const firstCell = cells[0] ?? "";
  return firstCell === "itemId" || firstCell === "网页标签";
}

function parseDemoStatus(raw: string): DemoAssessmentStatusSelection | "invalid" {
  const normalized = raw.trim().replace(/[「」""]/g, "");
  if (normalized === "" || normalized === "未选择" || normalized === "Unset") {
    return null;
  }
  if (
    normalized === "支持相似" ||
    normalized === "Supports similarity" ||
    normalized === DEMO_ASSESSMENT_STATUS.supportsSimilarity
  ) {
    return DEMO_ASSESSMENT_STATUS.supportsSimilarity;
  }
  if (
    normalized === "不支持相似" ||
    normalized === "Does not support similarity" ||
    normalized === DEMO_ASSESSMENT_STATUS.doesNotSupportSimilarity
  ) {
    return DEMO_ASSESSMENT_STATUS.doesNotSupportSimilarity;
  }
  if (
    normalized === "证据不足" ||
    normalized === "Insufficient evidence" ||
    normalized === DEMO_ASSESSMENT_STATUS.insufficientEvidence
  ) {
    return DEMO_ASSESSMENT_STATUS.insufficientEvidence;
  }
  if (
    normalized === "不适用" ||
    normalized === "Not applicable" ||
    normalized === DEMO_ASSESSMENT_STATUS.notApplicable
  ) {
    return DEMO_ASSESSMENT_STATUS.notApplicable;
  }
  return "invalid";
}

function parseApplicability(raw: string): boolean | "invalid" | "empty" {
  const normalized = raw.trim();
  if (normalized === "") {
    return "empty";
  }
  if (normalized === "适用" || normalized === "是" || normalized === "Applicable") {
    return true;
  }
  if (normalized === "不适用" || normalized === "否" || normalized === "Not applicable") {
    return false;
  }
  return "invalid";
}

function looksLikeJsonObject(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.startsWith("{") && trimmed.endsWith("}");
}

function readLocalizedText(value: unknown): LocalizedText | null {
  if (typeof value === "string") {
    return textFromZh(value);
  }
  if (value === null || typeof value !== "object") {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (typeof record.zh !== "string" || typeof record.en !== "string") {
    return null;
  }
  return { zh: record.zh, en: record.en };
}

function parseJsonSession(
  text: string,
  allowedItemIdSet: ReadonlySet<string>,
  allowedItemIds: readonly string[],
): ParseInputFileResult {
  const warnings: string[] = [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    return {
      ok: false,
      session: null,
      recognizedItemCount: 0,
      warnings,
      error: "JSON 无法解析。",
    };
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      ok: false,
      session: null,
      recognizedItemCount: 0,
      warnings,
      error: "JSON 根节点必须是对象。",
    };
  }

  const root = parsed as Record<string, unknown>;
  const session = createEmptySession(allowedItemIds);
  const productPairRaw = root.productPair;
  if (productPairRaw !== undefined) {
    if (productPairRaw === null || typeof productPairRaw !== "object") {
      return {
        ok: false,
        session: null,
        recognizedItemCount: 0,
        warnings,
        error: "productPair 必须是对象。",
      };
    }
    const pairRecord = productPairRaw as Record<string, unknown>;
    const fieldNames: ProductPairFieldName[] = [
      "analysisName",
      "candidateName",
      "referenceName",
      "candidateLot",
      "referenceLot",
      "productTypeOrNotes",
    ];
    for (const fieldName of fieldNames) {
      if (pairRecord[fieldName] === undefined) {
        continue;
      }
      const localized = readLocalizedText(pairRecord[fieldName]);
      if (localized === null) {
        return {
          ok: false,
          session: null,
          recognizedItemCount: 0,
          warnings,
          error: `productPair.${fieldName} 必须是字符串或 { zh, en }。`,
        };
      }
      session.productPair[fieldName] = localized;
    }
  }

  const itemEntriesRaw = root.itemEntries;
  let recognizedItemCount = 0;
  if (itemEntriesRaw !== undefined) {
    if (itemEntriesRaw === null || typeof itemEntriesRaw !== "object" || Array.isArray(itemEntriesRaw)) {
      return {
        ok: false,
        session: null,
        recognizedItemCount: 0,
        warnings,
        error: "itemEntries 必须是对象。",
      };
    }
    for (const [itemId, entryRaw] of Object.entries(itemEntriesRaw as Record<string, unknown>)) {
      if (!allowedItemIdSet.has(itemId)) {
        warnings.push(`跳过未知 itemId：${itemId}`);
        continue;
      }
      if (entryRaw === null || typeof entryRaw !== "object") {
        warnings.push(`跳过无法读取的条目：${itemId}`);
        continue;
      }
      const entryRecord = entryRaw as Record<string, unknown>;
      const statusRaw = entryRecord.demoStatus;
      let demoStatus: DemoAssessmentStatusSelection = null;
      if (statusRaw === null || statusRaw === "") {
        demoStatus = null;
      } else if (typeof statusRaw === "string") {
        const parsedStatus = parseDemoStatus(statusRaw);
        if (parsedStatus === "invalid") {
          warnings.push(`条目 ${itemId} 的 demoStatus 无法识别，已留空。`);
          demoStatus = null;
        } else {
          demoStatus = parsedStatus;
        }
      } else {
        warnings.push(`条目 ${itemId} 的 demoStatus 类型无效，已留空。`);
      }

      let isApplicable = true;
      if (typeof entryRecord.isApplicable === "boolean") {
        isApplicable = entryRecord.isApplicable;
      } else if (demoStatus === DEMO_ASSESSMENT_STATUS.notApplicable) {
        isApplicable = false;
      }

      const candidateDescription =
        readLocalizedText(entryRecord.candidateDescription) ?? EMPTY_LOCALIZED_TEXT;
      const referenceDescription =
        readLocalizedText(entryRecord.referenceDescription) ?? EMPTY_LOCALIZED_TEXT;
      const comparisonNotes = readLocalizedText(entryRecord.comparisonNotes) ?? EMPTY_LOCALIZED_TEXT;
      const notApplicableReason =
        readLocalizedText(entryRecord.notApplicableReason) ?? EMPTY_LOCALIZED_TEXT;

      session.itemEntries[itemId] = {
        itemId,
        isApplicable,
        demoStatus,
        candidateDescription,
        referenceDescription,
        comparisonNotes,
        notApplicableReason,
      };
      recognizedItemCount += 1;
    }
  }

  if (recognizedItemCount === 0) {
    return {
      ok: false,
      session: null,
      recognizedItemCount: 0,
      warnings,
      error: "JSON 中没有可识别的检测项。",
    };
  }

  return {
    ok: true,
    session,
    recognizedItemCount,
    warnings,
    error: null,
  };
}

function parseMarkdownPack(
  text: string,
  allowedItemIdSet: ReadonlySet<string>,
  allowedItemIds: readonly string[],
): ParseInputFileResult {
  const warnings: string[] = [];
  const session = createEmptySession(allowedItemIds);
  let recognizedItemCount = 0;
  let productPairFieldCount = 0;

  for (const line of text.split(/\r?\n/)) {
    const cells = splitMarkdownRow(line);
    if (cells === null || isSeparatorRow(cells) || isHeaderRow(cells)) {
      continue;
    }

    if (cells.length === 2) {
      const label = cells[0] ?? "";
      const fieldName = productPairFieldFromLabel(label);
      if (fieldName !== undefined) {
        session.productPair[fieldName] = textFromZh(cells[1] ?? "");
        productPairFieldCount += 1;
      }
      continue;
    }

    if (cells.length < 8) {
      continue;
    }

    const itemId = cells[0] ?? "";
    if (!allowedItemIdSet.has(itemId)) {
      if (itemId !== "") {
        warnings.push(`跳过未知 itemId：${itemId}`);
      }
      continue;
    }

    const applicability = parseApplicability(cells[3] ?? "");
    const parsedStatus = parseDemoStatus(cells[4] ?? "");
    if (parsedStatus === "invalid") {
      warnings.push(`条目 ${itemId} 的判定状态无法识别，已留空。`);
    }
    const demoStatus: DemoAssessmentStatusSelection = parsedStatus === "invalid" ? null : parsedStatus;

    let isApplicable = true;
    if (applicability === "invalid") {
      warnings.push(`条目 ${itemId} 的适用性无法识别，已按适用处理。`);
    } else if (applicability === false) {
      isApplicable = false;
    } else if (applicability === "empty" && demoStatus === DEMO_ASSESSMENT_STATUS.notApplicable) {
      isApplicable = false;
    } else if (applicability === true) {
      isApplicable = true;
    }
    if (demoStatus === DEMO_ASSESSMENT_STATUS.notApplicable) {
      isApplicable = false;
    }

    session.itemEntries[itemId] = {
      itemId,
      isApplicable,
      demoStatus,
      candidateDescription: textFromZh(cells[5] ?? ""),
      referenceDescription: textFromZh(cells[6] ?? ""),
      comparisonNotes: textFromZh(cells[7] ?? ""),
      notApplicableReason: EMPTY_LOCALIZED_TEXT,
    };
    recognizedItemCount += 1;
  }

  if (recognizedItemCount === 0 && productPairFieldCount === 0) {
    return {
      ok: false,
      session: null,
      recognizedItemCount: 0,
      warnings,
      error: "未识别到填表数据。请使用输入填表包（含 A1/A2 表格）或会话 JSON。",
    };
  }

  if (recognizedItemCount === 0) {
    warnings.push("已读到基础信息，但没有可识别的检测项行。");
  }

  return {
    ok: true,
    session,
    recognizedItemCount,
    warnings,
    error: null,
  };
}

export function parseComprehensiveInputFile(input: {
  text: string;
  allowedItemIds: readonly string[];
}): ParseInputFileResult {
  const allowedItemIds = input.allowedItemIds;
  const allowedItemIdSet = new Set(allowedItemIds);
  const trimmed = input.text.trim();
  if (trimmed === "") {
    return {
      ok: false,
      session: null,
      recognizedItemCount: 0,
      warnings: [],
      error: "输入文件为空。",
    };
  }
  if (looksLikeJsonObject(trimmed)) {
    return parseJsonSession(trimmed, allowedItemIdSet, allowedItemIds);
  }
  return parseMarkdownPack(input.text, allowedItemIdSet, allowedItemIds);
}
