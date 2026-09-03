/**
 * Deterministic checks for comprehensive-assessment aggregation.
 * Imports the TypeScript pure functions directly so the UI and the verifier
 * cannot drift apart.
 *
 * Usage: npm run verify:comprehensive-analysis
 * Exit code 0 = all checks pass; 1 = at least one hard failure.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { registerHooks } from "node:module";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const srcRoot = join(projectRoot, "src");

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const withoutAlias = specifier.slice(2);
      const candidates = [
        withoutAlias,
        `${withoutAlias}.ts`,
        `${withoutAlias}.tsx`,
        join(withoutAlias, "index.ts"),
      ];
      for (const candidate of candidates) {
        const absolutePath = join(srcRoot, candidate);
        if (existsSync(absolutePath)) {
          return nextResolve(pathToFileURL(absolutePath).href, context);
        }
      }
    }
    return nextResolve(specifier, context);
  },
});

const {
  DEMO_ASSESSMENT_STATUS,
  OVERALL_EVIDENCE_CONCLUSION,
} = await import(pathToFileURL(join(srcRoot, "types/comprehensive-analysis.ts")).href);

const {
  summarizeComprehensiveAssessment,
} = await import(
  pathToFileURL(join(srcRoot, "lib/comprehensive-analysis/summarize.ts")).href
);

const { categories } = await import(pathToFileURL(join(srcRoot, "data/categories.ts")).href);
const { characterizationItems } = await import(
  pathToFileURL(join(srcRoot, "data/characterization-items.ts")).href
);
const {
  cloneAssessmentSession,
  createIllustrativeDemoSession,
} = await import(
  pathToFileURL(join(srcRoot, "data/comprehensive-analysis-demo.ts")).href
);

const { parseComprehensiveInputFile } = await import(
  pathToFileURL(join(srcRoot, "lib/comprehensive-analysis/parse-input.ts")).href
);

const {
  buildComprehensiveOutputReport,
  suggestOutputReportFileName,
} = await import(
  pathToFileURL(join(srcRoot, "lib/comprehensive-analysis/build-output-report.ts")).href
);

const CATEGORY_ORDER = categories.map((category) => category.key);
const failures = [];

function recordFailure(message) {
  failures.push(message);
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    recordFailure(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function filledText(value) {
  return { zh: value, en: value };
}

function emptyText() {
  return { zh: "", en: "" };
}

function completeSupportingEntry(itemId) {
  return {
    itemId,
    isApplicable: true,
    demoStatus: DEMO_ASSESSMENT_STATUS.supportsSimilarity,
    candidateDescription: filledText("candidate"),
    referenceDescription: filledText("reference"),
    comparisonNotes: filledText("notes"),
    notApplicableReason: emptyText(),
  };
}

function notApplicableEntry(itemId, reason) {
  return {
    itemId,
    isApplicable: false,
    demoStatus: DEMO_ASSESSMENT_STATUS.notApplicable,
    candidateDescription: emptyText(),
    referenceDescription: emptyText(),
    comparisonNotes: emptyText(),
    notApplicableReason: reason,
  };
}

function entriesForItems(items, buildEntry) {
  const itemEntries = {};
  for (const item of items) {
    itemEntries[item.id] = buildEntry(item);
  }
  return itemEntries;
}

function summarize(items, itemEntries) {
  return summarizeComprehensiveAssessment({
    items,
    itemEntries,
    categoryOrder: CATEGORY_ORDER,
  });
}

const primaryItems = characterizationItems.filter((item) => !item.isSupplementary);
const supplementaryItems = characterizationItems.filter((item) => item.isSupplementary);
assertEqual(characterizationItems.length, 61, "characterization item count");
assertEqual(categories.length, 8, "category count");
assertEqual(primaryItems.length, 52, "non-supplementary item count");
assertEqual(supplementaryItems.length, 9, "supplementary item count");

// 1. Any applicable non-supplementary "does not support" wins.
{
  const itemEntries = entriesForItems(characterizationItems, (item) =>
    completeSupportingEntry(item.id),
  );
  const blockingItem = primaryItems[0];
  itemEntries[blockingItem.id] = {
    ...completeSupportingEntry(blockingItem.id),
    demoStatus: DEMO_ASSESSMENT_STATUS.doesNotSupportSimilarity,
  };
  const result = summarize(characterizationItems, itemEntries);
  assertEqual(
    result.overallConclusion,
    OVERALL_EVIDENCE_CONCLUSION.doesNotSupportSimilarityEvidence,
    "1. any applicable does-not-support",
  );
  assertEqual(result.criticalItemIds.includes(blockingItem.id), true, "1. critical item listed");
}

// 2. Insufficient-evidence status without a does-not-support item.
{
  const itemEntries = entriesForItems(characterizationItems, (item) =>
    completeSupportingEntry(item.id),
  );
  const insufficientItem = primaryItems[1];
  itemEntries[insufficientItem.id] = {
    ...completeSupportingEntry(insufficientItem.id),
    demoStatus: DEMO_ASSESSMENT_STATUS.insufficientEvidence,
  };
  const result = summarize(characterizationItems, itemEntries);
  assertEqual(
    result.overallConclusion,
    OVERALL_EVIDENCE_CONCLUSION.insufficientEvidence,
    "2. insufficient evidence present",
  );
}

// 3. Incomplete participating item (unset status).
{
  const itemEntries = entriesForItems(characterizationItems, (item) =>
    completeSupportingEntry(item.id),
  );
  const incompleteItem = primaryItems[2];
  itemEntries[incompleteItem.id] = {
    ...completeSupportingEntry(incompleteItem.id),
    demoStatus: null,
  };
  const result = summarize(characterizationItems, itemEntries);
  assertEqual(
    result.overallConclusion,
    OVERALL_EVIDENCE_CONCLUSION.insufficientEvidence,
    "3. unset status is incomplete",
  );
}

// 4. All applicable non-supplementary items support, with required text.
{
  const itemEntries = entriesForItems(characterizationItems, (item) =>
    item.isSupplementary
      ? notApplicableEntry(item.id, filledText("supplementary unused"))
      : completeSupportingEntry(item.id),
  );
  const result = summarize(characterizationItems, itemEntries);
  assertEqual(
    result.overallConclusion,
    OVERALL_EVIDENCE_CONCLUSION.supportsSimilarityEvidence,
    "4. all applicable items support",
  );
  assertEqual(result.participatingItemCount, primaryItems.length, "4. participating count");
}

// 5. Every item not applicable.
{
  const itemEntries = entriesForItems(characterizationItems, (item) =>
    notApplicableEntry(item.id, filledText("not used for this product")),
  );
  const result = summarize(characterizationItems, itemEntries);
  assertEqual(
    result.overallConclusion,
    OVERALL_EVIDENCE_CONCLUSION.insufficientEvidence,
    "5. all not applicable",
  );
  assertEqual(result.participatingItemCount, 0, "5. no participating items");
}

// 6. Supplementary does-not-support does not change a supportive roll-up.
{
  const itemEntries = entriesForItems(characterizationItems, (item) =>
    completeSupportingEntry(item.id),
  );
  const supplementaryBlockingItem = supplementaryItems[0];
  itemEntries[supplementaryBlockingItem.id] = {
    ...completeSupportingEntry(supplementaryBlockingItem.id),
    demoStatus: DEMO_ASSESSMENT_STATUS.doesNotSupportSimilarity,
  };
  const result = summarize(characterizationItems, itemEntries);
  assertEqual(
    result.overallConclusion,
    OVERALL_EVIDENCE_CONCLUSION.supportsSimilarityEvidence,
    "6. supplementary does-not-support ignored",
  );
  assertEqual(
    result.criticalItemIds.includes(supplementaryBlockingItem.id),
    false,
    "6. supplementary not listed as critical",
  );
}

// 7. Not-applicable item missing a reason.
{
  const itemEntries = entriesForItems(characterizationItems, (item) =>
    completeSupportingEntry(item.id),
  );
  const notApplicableItem = primaryItems[3];
  itemEntries[notApplicableItem.id] = notApplicableEntry(notApplicableItem.id, emptyText());
  const result = summarize(characterizationItems, itemEntries);
  assertEqual(
    result.overallConclusion,
    OVERALL_EVIDENCE_CONCLUSION.insufficientEvidence,
    "7. missing not-applicable reason",
  );
  assertEqual(
    result.criticalItemIds.includes(notApplicableItem.id),
    true,
    "7. incomplete not-applicable item is critical",
  );
}

// 8. Restoring demo data is stable.
{
  const firstSession = createIllustrativeDemoSession();
  const secondSession = cloneAssessmentSession(createIllustrativeDemoSession());
  const firstResult = summarize(characterizationItems, firstSession.itemEntries);
  const secondResult = summarize(characterizationItems, secondSession.itemEntries);
  assertEqual(Object.keys(firstSession.itemEntries).length, 61, "8. demo covers 61 items");
  assertEqual(
    firstResult.overallConclusion,
    secondResult.overallConclusion,
    "8. restored demo conclusion stable",
  );
  assertEqual(
    JSON.stringify(firstResult.criticalItemIds),
    JSON.stringify(secondResult.criticalItemIds),
    "8. restored demo critical items stable",
  );
  assertEqual(
    firstResult.overallConclusion,
    OVERALL_EVIDENCE_CONCLUSION.doesNotSupportSimilarityEvidence,
    "8. demo includes a blocking non-supplementary item",
  );
  const inventorySum =
    firstResult.inventorySupportsCount +
    firstResult.inventoryDoesNotSupportCount +
    firstResult.inventoryInsufficientEvidenceCount +
    firstResult.inventoryNotApplicableCount +
    firstResult.inventoryUnsetStatusCount;
  assertEqual(inventorySum, 61, "8. inventory status counts sum to 61");
}

// 9. Free-text edits do not rewrite demo status.
{
  const itemEntries = entriesForItems(characterizationItems, (item) =>
    completeSupportingEntry(item.id),
  );
  const editedItem = primaryItems[4];
  const originalStatus = itemEntries[editedItem.id].demoStatus;
  itemEntries[editedItem.id] = {
    ...itemEntries[editedItem.id],
    candidateDescription: filledText("completely different prose that mentions 不支持 and fail"),
    referenceDescription: filledText("also different, keywords: insufficient 证据不足"),
    comparisonNotes: filledText("still complete required text"),
  };
  const result = summarize(characterizationItems, itemEntries);
  assertEqual(itemEntries[editedItem.id].demoStatus, originalStatus, "9. status field unchanged");
  assertEqual(
    result.overallConclusion,
    OVERALL_EVIDENCE_CONCLUSION.supportsSimilarityEvidence,
    "9. keywords in free text do not change overall conclusion",
  );
}

// 10. Locale does not change aggregation: zh-only vs same status payload.
{
  const itemEntriesZh = entriesForItems(characterizationItems, (item) => ({
    ...completeSupportingEntry(item.id),
    candidateDescription: { zh: "候选", en: "" },
    referenceDescription: { zh: "参照", en: "" },
    comparisonNotes: { zh: "说明", en: "" },
  }));
  const itemEntriesEn = entriesForItems(characterizationItems, (item) => ({
    ...completeSupportingEntry(item.id),
    candidateDescription: { zh: "候选", en: "" },
    referenceDescription: { zh: "参照", en: "" },
    comparisonNotes: { zh: "说明", en: "" },
  }));
  const zhResult = summarize(characterizationItems, itemEntriesZh);
  const enResult = summarize(characterizationItems, itemEntriesEn);
  assertEqual(
    zhResult.overallConclusion,
    enResult.overallConclusion,
    "10. identical payloads yield identical conclusions",
  );
  assertEqual(
    zhResult.dataCompletenessRatio,
    enResult.dataCompletenessRatio,
    "10. completeness does not depend on UI locale",
  );
}

const allowedItemIds = characterizationItems.map((item) => item.id);

function parsePack(text) {
  return parseComprehensiveInputFile({ text, allowedItemIds });
}

// 11. Markdown A2 row fills status from the status column only.
{
  const markdown = [
    "| 网页标签 | 粘贴文本 |",
    "|----------|----------|",
    "| 分析名称 | 示意性分析 |",
    "| 候选药名称 | 示意候选 |",
    "",
    "| itemId | 中文项目名 | 是否补充项 | 是否适用 | 演示判定状态 | 候选药数据或描述 | 参照药数据或描述 | 比对说明 |",
    "|--------|------------|------------|----------|--------------|------------------|------------------|----------|",
    "| intact-mass | 完整分子质量（intact mass） | 否 | 适用 | 支持相似 | 候选示意完整质量 | 参照示意完整质量 | 两边对应 |",
  ].join("\n");
  const parsed = parsePack(markdown);
  assertEqual(parsed.ok, true, "11. markdown pack parses");
  assertEqual(parsed.recognizedItemCount, 1, "11. one item recognized");
  assertEqual(parsed.session?.productPair.analysisName.zh, "示意性分析", "11. analysis name");
  assertEqual(
    parsed.session?.itemEntries["intact-mass"]?.demoStatus,
    DEMO_ASSESSMENT_STATUS.supportsSimilarity,
    "11. status from column",
  );
  assertEqual(
    parsed.session?.itemEntries["intact-mass"]?.candidateDescription.zh,
    "候选示意完整质量",
    "11. candidate text",
  );
}

// 12. Description keywords do not rewrite demo status.
{
  const markdown = [
    "| itemId | 中文项目名 | 是否补充项 | 是否适用 | 演示判定状态 | 候选药数据或描述 | 参照药数据或描述 | 比对说明 |",
    "|--------|------------|------------|----------|--------------|------------------|------------------|----------|",
    "| sialic-acid-ngna | NGNA | 否 | 适用 | 支持相似 | 文本写不支持相似也不应改写 | 参照未检出 | 两边同样低 |",
  ].join("\n");
  const parsed = parsePack(markdown);
  assertEqual(parsed.ok, true, "12. keyword pack parses");
  assertEqual(
    parsed.session?.itemEntries["sialic-acid-ngna"]?.demoStatus,
    DEMO_ASSESSMENT_STATUS.supportsSimilarity,
    "12. status not inferred from 不支持相似 in description",
  );
}

// 13. JSON session import.
{
  const json = JSON.stringify({
    productPair: {
      analysisName: { zh: "JSON分析", en: "" },
      candidateName: { zh: "JSON候选", en: "" },
      referenceName: { zh: "JSON参照", en: "" },
      candidateLot: { zh: "C1", en: "" },
      referenceLot: { zh: "R1", en: "" },
      productTypeOrNotes: { zh: "IgG1κ illustrative", en: "" },
    },
    itemEntries: {
      cdc: {
        itemId: "cdc",
        isApplicable: true,
        demoStatus: DEMO_ASSESSMENT_STATUS.supportsSimilarity,
        candidateDescription: { zh: "CDC候选", en: "" },
        referenceDescription: { zh: "CDC参照", en: "" },
        comparisonNotes: { zh: "CDC比对", en: "" },
        notApplicableReason: { zh: "", en: "" },
      },
    },
  });
  const parsed = parsePack(json);
  assertEqual(parsed.ok, true, "13. json parses");
  assertEqual(parsed.recognizedItemCount, 1, "13. one json item");
  assertEqual(parsed.session?.productPair.candidateName.zh, "JSON候选", "13. json candidate");
  assertEqual(
    parsed.session?.itemEntries.cdc?.demoStatus,
    DEMO_ASSESSMENT_STATUS.supportsSimilarity,
    "13. json cdc supports",
  );
}

// 14. Empty file is an error.
{
  const parsed = parsePack("   ");
  assertEqual(parsed.ok, false, "14. empty file not ok");
  assertEqual(parsed.session, null, "14. no session");
}

// 15. Real fill-in pack loads 61 items and rolls up to supports.
{
  const packPath = join(
    projectRoot,
    "docs/demo-comprehensive-assessment/输入-岚岫珠单抗-药学比对数据包-v1.md",
  );
  assertEqual(existsSync(packPath), true, "15. fill-in pack exists");
  if (existsSync(packPath)) {
    const parsed = parsePack(readFileSync(packPath, "utf8"));
    assertEqual(parsed.ok, true, "15. real pack parses");
    assertEqual(parsed.recognizedItemCount, 61, "15. 61 items");
    const result = summarize(characterizationItems, parsed.session.itemEntries);
    assertEqual(
      result.overallConclusion,
      OVERALL_EVIDENCE_CONCLUSION.supportsSimilarityEvidence,
      "15. overall supports",
    );
    assertEqual(result.dataCompletenessRatio, 1, "15. completeness 100%");
    const report = buildComprehensiveOutputReport({
      session: parsed.session,
      aggregation: result,
      items: characterizationItems,
      categories,
    });
    assertEqual(report.includes("支持相似性证据"), true, "15. report has conclusion");
    assertEqual(report.includes("illustrative"), false, "15. generated report has no illustrative tag");
    assertEqual(report.includes("示意"), false, "15. generated report has no 示意 tag");
    assertEqual(report.includes("演示会话"), false, "15. generated report has no 演示会话");
    assertEqual(
      suggestOutputReportFileName(parsed.session).includes("药学相似性综合比对报告"),
      true,
      "15. filename is formal report",
    );
    const writtenReportPath = join(
      projectRoot,
      "docs/demo-comprehensive-assessment/岚岫珠单抗-药学相似性综合比对报告-v1.md",
    );
    assertEqual(existsSync(writtenReportPath), true, "15. written report exists");
    if (existsSync(writtenReportPath)) {
      const writtenReport = readFileSync(writtenReportPath, "utf8");
      assertEqual(writtenReport.includes("支持相似性证据"), true, "15. written report has conclusion");
      assertEqual(writtenReport.includes("illustrative"), false, "15. written report has no illustrative tag");
      assertEqual(writtenReport.includes("示意"), false, "15. written report has no 示意 tag");
      assertEqual(writtenReport.includes("演示会话"), false, "15. written report has no 演示会话");
    }
  }
}

if (failures.length > 0) {
  console.error(`verify:comprehensive-analysis failed (${failures.length}):`);
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("verify:comprehensive-analysis: 15 scenarios passed");
