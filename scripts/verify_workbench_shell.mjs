/**
 * Workbench shell invariants: name-match allow-list, no teammate engine, no
 * second App Router root, no /modules/ routes.
 *
 * Usage: npm run verify:workbench-shell
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
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
  REQUIRED_EQUAL_ITEM_IDS,
  TEAMMATE_CHARACTERIZATION_PROJECT_NAMES,
  computableItemIds,
  itemHasAnalyzableMethod,
  isNameMatchedItemId,
  nameMatchedItemIds,
  normalizeProjectName,
} = await import(pathToFileURL(join(srcRoot, "lib/workbench/name-match.ts")).href);

const { characterizationItems } = await import(
  pathToFileURL(join(srcRoot, "data/characterization-items.ts")).href
);

const failures = [];

function fail(message) {
  failures.push(message);
}

function walkFiles(root, extensions, skipDirNames) {
  const out = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    let entries;
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        if (
          entry.name === "node_modules" ||
          entry.name === ".git" ||
          entry.name === ".next" ||
          skipDirNames.has(entry.name)
        ) {
          continue;
        }
        stack.push(full);
        continue;
      }
      if (extensions.includes(extname(entry.name))) out.push(full);
    }
  }
  return out;
}

const teammateSet = new Set(
  TEAMMATE_CHARACTERIZATION_PROJECT_NAMES.map((name) => normalizeProjectName(name)),
);

for (const itemId of REQUIRED_EQUAL_ITEM_IDS) {
  if (!computableItemIds.includes(itemId)) {
    fail(`computableItemIds missing required equal id ${itemId}`);
  }
}

for (const itemId of computableItemIds) {
  if (!isNameMatchedItemId(itemId)) {
    fail(`computableItemIds contains non-matching id ${itemId}`);
  }
  if (!itemHasAnalyzableMethod(itemId)) {
    fail(`computableItemIds contains non-analyzable id ${itemId}`);
  }
}

for (const item of characterizationItems) {
  const normalized = normalizeProjectName(item.itemName.zh);
  const namesMatch = teammateSet.has(normalized);
  if (!namesMatch && computableItemIds.includes(item.id)) {
    fail(`unequal id ${item.id} must never appear in computableItemIds`);
  }
  if (namesMatch && !nameMatchedItemIds.includes(item.id)) {
    fail(`name-matched item ${item.id} missing from nameMatchedItemIds`);
  }
}

const teammateCatalogPath = join(
  projectRoot,
  "a branch",
  "lib",
  "characterization-catalog.ts",
);
if (existsSync(teammateCatalogPath)) {
  const catalogSource = readFileSync(teammateCatalogPath, "utf8");
  const extracted = [];
  const nameRe = /project\("[^"]+", "[^"]+", "([^"]+)"/g;
  let match;
  while ((match = nameRe.exec(catalogSource))) {
    extracted.push(match[1]);
  }
  if (extracted.length !== TEAMMATE_CHARACTERIZATION_PROJECT_NAMES.length) {
    fail(
      `teammate name snapshot length ${TEAMMATE_CHARACTERIZATION_PROJECT_NAMES.length} != catalog ${extracted.length}`,
    );
  } else {
    extracted.forEach((name, index) => {
      if (name !== TEAMMATE_CHARACTERIZATION_PROJECT_NAMES[index]) {
        fail(`teammate name snapshot drifted at ${index}: ${name}`);
      }
    });
  }
}

const rootAppDir = join(projectRoot, "app");
if (existsSync(rootAppDir) && statSync(rootAppDir).isDirectory()) {
  fail("root-level app/ directory must not exist; App Router lives in src/app/");
}

const appDir = join(srcRoot, "app");
if (existsSync(join(appDir, "modules"))) {
  fail("src/app/modules must not exist");
}

const srcFiles = walkFiles(srcRoot, [".ts", ".tsx", ".mjs", ".js"], new Set(["a branch"]));
const forbiddenUrl = /NEXT_PUBLIC_BACKEND_URL|127\.0\.0\.1:8000/;
for (const file of srcFiles) {
  const text = readFileSync(file, "utf8");
  if (forbiddenUrl.test(text)) {
    fail(`${relative(projectRoot, file)} points at the teammate backend`);
  }
  if (text.includes('href={`/modules/') || text.includes('href="/modules/')) {
    fail(`${relative(projectRoot, file)} links to /modules/`);
  }
}

if (normalizeProjectName("完整分子质量（intact mass）") !== "完整分子质量") {
  fail("normalizeProjectName failed on intact mass parentheses");
}
if (normalizeProjectName("游离巯基水平") !== "游离巯基") {
  fail("normalizeProjectName failed on trailing 水平");
}

if (failures.length > 0) {
  for (const message of failures) {
    console.error(`FAIL ${message}`);
  }
  process.exit(1);
}

console.log("verify_workbench_shell: ok");
console.log(`  name-matched items : ${nameMatchedItemIds.length}`);
console.log(`  computable items   : ${computableItemIds.length}`);
console.log(`  required equals    : ${REQUIRED_EQUAL_ITEM_IDS.length}`);
