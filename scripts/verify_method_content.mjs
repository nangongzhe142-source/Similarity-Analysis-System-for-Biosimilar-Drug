/**
 * Mechanical check for `src/data/method-content.ts`.
 *
 * The SOP body lives in a sidecar file keyed by `DetectionMethod.id`, while the
 * method ids themselves come from the Excel-generated `characterization-items.ts`.
 * Nothing in the type system links the two, so a renamed or mistyped id would
 * silently drop the principle text from the page. This script enforces:
 *   1. every method id referenced in method-content.ts really exists;
 *   2. every method of an already-covered category has a principle
 *      (a category counts as covered once any of its methods has one);
 *   3. no principle is an empty or near-empty string.
 *
 * Usage: npm run verify:method-content
 * Exit code 0 = all checks pass; 1 = at least one hard failure.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");

const ITEMS_FILE = join(projectRoot, "src", "data", "characterization-items.ts");
const CONTENT_FILE = join(projectRoot, "src", "data", "method-content.ts");

/** A principle shorter than this is a stub, not method text. */
const MINIMUM_PRINCIPLE_LENGTH = 60;
/** Method ids are generated as `<itemId>-<primary|orthogonal>-<n>`. */
const METHOD_ID_PATTERN = /^[a-z0-9-]+-(?:primary|orthogonal)-\d+$/;

/** The items file is a plain JSON array behind a TypeScript annotation, so it
 *  can be parsed without executing TypeScript. */
function loadItems() {
  const source = readFileSync(ITEMS_FILE, "utf8");
  const start = source.indexOf("= [") + 2;
  const end = source.lastIndexOf("]") + 1;
  return JSON.parse(source.slice(start, end));
}

/** Collects the method ids referenced anywhere in the sidecar, and the length
 *  of the Chinese principle each one resolves to. Both `assign(...)` calls and
 *  bare object keys are covered, because every id appears as a quoted token. */
function loadContentReferences(source) {
  const referenced = new Set();
  for (const match of source.matchAll(/"([a-z0-9-]+)"/g)) {
    if (METHOD_ID_PATTERN.test(match[1])) referenced.add(match[1]);
  }
  return referenced;
}

/** Every `zh:` principle string in the sidecar, used for the stub check. */
function loadPrincipleLengths(source) {
  return Array.from(source.matchAll(/zh:\s*"((?:[^"\\]|\\.)*)"/g)).map(
    (match) => match[1].length,
  );
}

function main() {
  for (const filePath of [ITEMS_FILE, CONTENT_FILE]) {
    if (!existsSync(filePath)) {
      console.error(`FAIL  file not found: ${filePath}`);
      process.exit(1);
    }
  }

  const items = loadItems();
  const contentSource = readFileSync(CONTENT_FILE, "utf8");
  const referenced = loadContentReferences(contentSource);

  const methodsByCategory = new Map();
  const knownMethodIds = new Set();
  for (const item of items) {
    const bucket = methodsByCategory.get(item.category) ?? [];
    for (const method of item.methods) {
      knownMethodIds.add(method.id);
      bucket.push({ methodId: method.id, itemId: item.id });
    }
    methodsByCategory.set(item.category, bucket);
  }

  const failures = [];

  for (const methodId of referenced) {
    if (!knownMethodIds.has(methodId)) {
      failures.push(`method-content.ts references an unknown method id: ${methodId}`);
    }
  }

  const coveredCategories = [];
  let coveredMethodCount = 0;
  for (const [category, methods] of methodsByCategory) {
    const covered = methods.filter((entry) => referenced.has(entry.methodId));
    if (covered.length === 0) continue;

    coveredCategories.push(category);
    coveredMethodCount += covered.length;
    for (const entry of methods) {
      if (!referenced.has(entry.methodId)) {
        failures.push(
          `${category}: partially covered — ${entry.methodId} (item ${entry.itemId}) has no principle`,
        );
      }
    }
  }

  for (const length of loadPrincipleLengths(contentSource)) {
    if (length < MINIMUM_PRINCIPLE_LENGTH) {
      failures.push(
        `a principle is only ${length} characters long; a stub is worse than an honest placeholder`,
      );
    }
  }

  const totalMethodCount = knownMethodIds.size;

  console.log("Method SOP body coverage check");
  console.log("------------------------------");
  console.log(`methods total        : ${totalMethodCount}`);
  console.log(`methods with body    : ${coveredMethodCount}`);
  console.log(`categories covered   : ${coveredCategories.join(", ") || "(none)"}`);
  console.log(`failures             : ${failures.length}`);
  console.log("");

  for (const failure of failures) console.error(`FAIL  ${failure}`);

  if (failures.length > 0) {
    console.error("");
    console.error("Method SOP body check FAILED.");
    process.exit(1);
  }

  console.log("Every covered category has a principle on all of its methods.");
  console.log(
    "Note: this checks presence and id linkage only, NOT the scientific correctness",
  );
  console.log("of the text, which remains unreviewed by a subject-matter expert.");
}

main();
