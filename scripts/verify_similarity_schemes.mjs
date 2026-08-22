/**
 * Mechanical check for `src/data/similarity-schemes.ts`.
 *
 * The similarity schemes are a hand-maintained sidecar keyed by
 * `CharacterizationItem.id` and `DetectionMethod.id`, while those ids come from
 * the Excel-generated `characterization-items.ts`. Nothing in the type system
 * links the two, so a mistyped id would silently detach a rule from the method
 * it is supposed to govern — and an undetected detachment is worse than a
 * missing rule, because the page would look complete while evaluating nothing.
 *
 * This script enforces:
 *   1. every itemId in the sidecar really exists in characterization-items.ts;
 *   2. every methodId in the sidecar really exists, and belongs to the item that
 *      claims it;
 *   3. every primary-structure item has exactly one scheme (no gaps, no dupes);
 *   4. a `complete` scheme has all eight rule fields G through N and a non-empty
 *      methodIds list;
 *   5. a scheme that is NOT `complete` carries no rule fields at all and an
 *      empty methodIds list, so it cannot drive a verdict;
 *   6. a scheme that is NOT `complete` states a reason;
 *   7. the recorded workbook SHA-256 still matches the workbook on disk, so a
 *      silent edit of the source of truth is caught.
 *
 * Usage: npm run verify:schemes
 * Exit code 0 = all checks pass; 1 = at least one hard failure.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");

const ITEMS_FILE = join(projectRoot, "src", "data", "characterization-items.ts");
const SCHEMES_FILE = join(projectRoot, "src", "data", "similarity-schemes.ts");
const WORKBOOK_FILE = resolve(
  projectRoot,
  "..",
  "生物类似药评价指导原则",
  "V2-生物类似药药学比对研究质量属性、检测方法及相似性评价原则汇总表.xlsx",
);

const TARGET_CATEGORY = "primary-structure";

/** The eight sheet-3 columns that carry rule content. A scheme is only
 *  programmable when all eight are present. */
const RULE_FIELDS = [
  "recognizedContent",
  "comparisonBaseline",
  "ruleType",
  "decisionMethod",
  "numericBoundary",
  "overflowHandling",
  "basis",
  "finalProgramRule",
];

/** The items file is a plain JSON array behind a TypeScript annotation. */
function loadItems() {
  const source = readFileSync(ITEMS_FILE, "utf8");
  const start = source.indexOf("= [") + 2;
  const end = source.lastIndexOf("]") + 1;
  return JSON.parse(source.slice(start, end));
}

/** The schemes file is hand-written TypeScript with string concatenation, so it
 *  cannot be JSON-parsed. Each scheme object is delimited by its `itemId:` key,
 *  which is enough to check structure without executing TypeScript. */
function loadSchemeBlocks(source) {
  const arrayStart = source.indexOf("export const similaritySchemes");
  if (arrayStart < 0) throw new Error("similaritySchemes array not found");
  const arrayEnd = source.indexOf("export const unmappedSheet3Rows");
  const body = source.slice(arrayStart, arrayEnd < 0 ? undefined : arrayEnd);

  const starts = [];
  for (const match of body.matchAll(/^\s{4}itemId:\s*"([a-z0-9-]+)",/gm)) {
    starts.push({ itemId: match[1], index: match.index });
  }

  return starts.map((entry, position) => {
    const end = position + 1 < starts.length ? starts[position + 1].index : body.length;
    const block = body.slice(entry.index, end);
    const completeness = block.match(/^\s{4}completeness:\s*"([a-z-]+)",/m)?.[1] ?? null;
    const methodIdsRaw = block.match(/methodIds:\s*\[([^\]]*)\]/s)?.[1] ?? "";
    const methodIds = Array.from(methodIdsRaw.matchAll(/"([a-z0-9-]+)"/g)).map(
      (m) => m[1],
    );
    const presentRuleFields = RULE_FIELDS.filter((field) =>
      new RegExp(`^\\s{4}${field}:`, "m").test(block),
    );
    const hasReason = /^\s{4}notDefinedReason:/m.test(block);
    const sourceRow = Number(block.match(/provenance\(\s*(\d+)/)?.[1] ?? NaN);
    return {
      itemId: entry.itemId,
      completeness,
      methodIds,
      presentRuleFields,
      hasReason,
      sourceRow,
    };
  });
}

function recordedWorkbookSha(source) {
  return source.match(/SOURCE_WORKBOOK_SHA256\s*=\s*\n?\s*"([0-9a-f]{64})"/)?.[1] ?? null;
}

function main() {
  for (const filePath of [ITEMS_FILE, SCHEMES_FILE]) {
    if (!existsSync(filePath)) {
      console.error(`FAIL  file not found: ${filePath}`);
      process.exit(1);
    }
  }

  const items = loadItems();
  const schemesSource = readFileSync(SCHEMES_FILE, "utf8");
  const schemes = loadSchemeBlocks(schemesSource);

  const itemById = new Map(items.map((item) => [item.id, item]));
  const methodOwner = new Map();
  for (const item of items) {
    for (const method of item.methods) methodOwner.set(method.id, item.id);
  }

  const failures = [];
  const warnings = [];

  // 1 and 2: id linkage.
  const seenItemIds = new Set();
  for (const scheme of schemes) {
    if (seenItemIds.has(scheme.itemId)) {
      failures.push(`duplicate scheme for item ${scheme.itemId}`);
    }
    seenItemIds.add(scheme.itemId);

    const item = itemById.get(scheme.itemId);
    if (!item) {
      failures.push(`scheme references an unknown item id: ${scheme.itemId}`);
      continue;
    }
    if (item.category !== TARGET_CATEGORY) {
      warnings.push(
        `scheme ${scheme.itemId} belongs to category ${item.category}, not ${TARGET_CATEGORY}`,
      );
    }
    for (const methodId of scheme.methodIds) {
      const owner = methodOwner.get(methodId);
      if (!owner) {
        failures.push(`scheme ${scheme.itemId} references an unknown method id: ${methodId}`);
      } else if (owner !== scheme.itemId) {
        failures.push(
          `scheme ${scheme.itemId} claims method ${methodId}, which belongs to ${owner}`,
        );
      }
    }
  }

  // 3: every primary-structure item is accounted for, exactly once.
  const targetItems = items.filter((item) => item.category === TARGET_CATEGORY);
  for (const item of targetItems) {
    if (!seenItemIds.has(item.id)) {
      failures.push(`no scheme entry for ${TARGET_CATEGORY} item ${item.id}`);
    }
  }

  // 4, 5 and 6: completeness must match the fields actually present.
  let completeCount = 0;
  let governedMethodCount = 0;
  for (const scheme of schemes) {
    if (scheme.completeness === "complete") {
      completeCount += 1;
      governedMethodCount += scheme.methodIds.length;
      const missing = RULE_FIELDS.filter(
        (field) => !scheme.presentRuleFields.includes(field),
      );
      if (missing.length > 0) {
        failures.push(
          `scheme ${scheme.itemId} is marked complete but lacks: ${missing.join(", ")}`,
        );
      }
      if (scheme.methodIds.length === 0) {
        failures.push(
          `scheme ${scheme.itemId} is marked complete but governs no method`,
        );
      }
      const expectedMethodCount = itemById.get(scheme.itemId)?.methods.length ?? 0;
      if (scheme.methodIds.length !== expectedMethodCount) {
        warnings.push(
          `scheme ${scheme.itemId} governs ${scheme.methodIds.length} of ` +
            `${expectedMethodCount} methods on its item`,
        );
      }
    } else {
      if (scheme.presentRuleFields.length > 0) {
        failures.push(
          `scheme ${scheme.itemId} is ${scheme.completeness} yet carries rule fields ` +
            `(${scheme.presentRuleFields.join(", ")}); an incomplete rule must not be ` +
            `able to drive a verdict`,
        );
      }
      if (scheme.methodIds.length > 0) {
        failures.push(
          `scheme ${scheme.itemId} is ${scheme.completeness} yet governs ` +
            `${scheme.methodIds.length} method(s); no method may inherit an undefined rule`,
        );
      }
      if (!scheme.hasReason) {
        failures.push(
          `scheme ${scheme.itemId} is ${scheme.completeness} but states no notDefinedReason`,
        );
      }
    }
  }

  // 7: the source of truth must not have changed under us.
  const recordedSha = recordedWorkbookSha(schemesSource);
  let shaStatus = "not checked";
  if (!recordedSha) {
    failures.push("similarity-schemes.ts records no source workbook SHA-256");
  } else if (!existsSync(WORKBOOK_FILE)) {
    shaStatus = `workbook not found at ${WORKBOOK_FILE}`;
    warnings.push(`source workbook not present, SHA-256 not verified`);
  } else {
    const actual = createHash("sha256").update(readFileSync(WORKBOOK_FILE)).digest("hex");
    if (actual === recordedSha) {
      shaStatus = "matches";
    } else {
      shaStatus = "MISMATCH";
      failures.push(
        `source workbook SHA-256 changed: recorded ${recordedSha}, actual ${actual}. ` +
          `Re-extract the rules before trusting this sidecar.`,
      );
    }
  }

  const byCompleteness = schemes.reduce((accumulator, scheme) => {
    accumulator[scheme.completeness] = (accumulator[scheme.completeness] ?? 0) + 1;
    return accumulator;
  }, {});

  console.log("V2 similarity scheme check");
  console.log("--------------------------");
  console.log(`primary-structure items      : ${targetItems.length}`);
  console.log(`schemes declared             : ${schemes.length}`);
  console.log(`  by completeness            : ${JSON.stringify(byCompleteness)}`);
  console.log(`programmable (complete)      : ${completeCount}`);
  console.log(`methods governed by a rule   : ${governedMethodCount}`);
  console.log(`source workbook SHA-256      : ${shaStatus}`);
  console.log(`warnings                     : ${warnings.length}`);
  console.log(`failures                     : ${failures.length}`);
  console.log("");

  for (const warning of warnings) console.log(`WARN  ${warning}`);
  for (const failure of failures) console.error(`FAIL  ${failure}`);

  if (failures.length > 0) {
    console.error("");
    console.error("V2 similarity scheme check FAILED.");
    process.exit(1);
  }

  console.log("");
  console.log(
    "Every primary-structure item has exactly one scheme; only fully populated",
  );
  console.log(
    "sheet-3 rows govern methods. Incomplete and absent rules govern nothing and",
  );
  console.log("must route to human review.");
  console.log("");
  console.log(
    "Note: this checks id linkage and structural completeness only, NOT whether the",
  );
  console.log("rule text is scientifically correct or correctly interpreted.");
}

main();
