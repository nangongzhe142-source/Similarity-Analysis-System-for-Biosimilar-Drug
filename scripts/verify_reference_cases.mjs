/**
 * Mechanical provenance check for `src/data/reference-cases.ts`.
 *
 * For every real (non-illustrative) reference case, this script greps each
 * `verification.verifiableValues` entry inside the chunk files listed in
 * `verification.sourceChunks`. A miss means the value was mistyped, or was
 * attributed to the wrong source file — both silent errors that no type checker
 * or linter can catch.
 *
 * It also enforces the data-integrity invariants that the type system cannot
 * express, and prints an audit summary of unresolved risks.
 *
 * Usage: npm run verify:cases
 * Exit code 0 = all checks pass; 1 = at least one hard failure.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const workspaceRoot = resolve(projectRoot, "..");

const CASES_FILES = [
  join(projectRoot, "src", "data", "reference-cases.ts"),
  join(projectRoot, "src", "data", "reference-cases-gp2015-remaining.ts"),
];
const CHUNKS_DIRECTORY = join(
  workspaceRoot,
  "生物类似药审批报告",
  "翻译",
  "output",
  "17_etanercept_szzs",
  "chunks",
);

/** Hyphen-like characters are interchanged freely between the source document
 *  and transcription (en dash vs ASCII hyphen), so ranges are compared with
 *  every dash variant normalized to a single form. */
const DASH_PATTERN = /[\u2010-\u2015\u2212-]/g;

function normalize(text) {
  return text.replace(DASH_PATTERN, "-").replace(/[ \t]+/g, " ");
}

/** A verifiable value is either a literal substring, or several `|`-separated
 *  tokens that must all occur on the same source line. The latter form pins a
 *  per-lot table cell to its row (e.g. "#B213820|103"), which a bare number
 *  could never do unambiguously. */
function isValueFound(rawValue, content) {
  const needle = normalize(rawValue);
  if (!needle.includes("|")) return content.includes(needle);

  const tokens = needle.split("|").map((token) => token.trim());
  return content
    .split("\n")
    .some((line) => tokens.every((token) => line.includes(token)));
}

/** Pull the argument list from a `gp2015Verification(...)` call, whether the
 *  call is formatted on one line or several. */
function extractVerificationArguments(block) {
  const marker = "gp2015Verification(";
  const markerIndex = block.indexOf(marker);
  if (markerIndex === -1) return null;

  let depth = 0;
  for (
    let index = markerIndex + "gp2015Verification".length;
    index < block.length;
    index += 1
  ) {
    const character = block[index];
    if (character === "(") depth += 1;
    if (character === ")") {
      depth -= 1;
      if (depth === 0) {
        return block.slice(markerIndex + marker.length, index);
      }
    }
  }

  return null;
}

/** Extracts the reference cases without executing TypeScript. Each case is a
 *  brace-balanced block starting at an `id:` key, which is enough to read the
 *  few flat fields this check needs. */
function extractCases(source) {
  const cases = [];
  const idPattern = /^\s{4,6}id: "([^"]+)",$/gm;
  let match;

  while ((match = idPattern.exec(source)) !== null) {
    const caseId = match[1];
    const blockStart = match.index;
    let depth = 0;
    let blockEnd = source.length;

    for (let index = blockStart; index < source.length; index += 1) {
      const character = source[index];
      if (character === "{") depth += 1;
      if (character === "}") {
        if (depth === 0) {
          blockEnd = index;
          break;
        }
        depth -= 1;
      }
    }

    const block = source.slice(blockStart, blockEnd);
    const evidenceLevel = /evidenceLevel: "([^"]+)"/.exec(block)?.[1] ?? "";
    const argumentText = extractVerificationArguments(block);

    let sourceChunks = [];
    let verifiableValues = [];
    let hasUnresolvedOcrDamage = false;

    if (argumentText !== null) {
      const arrayMatches = argumentText.match(/\[[\s\S]*?\]/g) ?? [];
      const parseArray = (raw) =>
        raw === undefined
          ? []
          : Array.from(raw.matchAll(/"([^"]*)"/g)).map((entry) => entry[1]);
      sourceChunks = parseArray(arrayMatches[0]);
      verifiableValues = parseArray(arrayMatches[1]);
      hasUnresolvedOcrDamage = /\btrue\b/.test(
        argumentText.slice(argumentText.lastIndexOf("]") + 1),
      );
    }

    cases.push({
      caseId,
      evidenceLevel,
      hasVerification: argumentText !== null,
      hasDataCaveat: /dataCaveat: \{/.test(block),
      hasSource: /source: gp2015Source\(/.test(block),
      hasSchematicFigure: /schematicFigure: \{/.test(block),
      sourceChunks,
      verifiableValues,
      hasUnresolvedOcrDamage,
    });
  }

  return cases;
}

function loadChunk(chunkName, chunkCache) {
  if (chunkCache.has(chunkName)) return chunkCache.get(chunkName);
  const chunkPath = join(CHUNKS_DIRECTORY, chunkName);
  const content = existsSync(chunkPath)
    ? normalize(readFileSync(chunkPath, "utf8"))
    : null;
  chunkCache.set(chunkName, content);
  return content;
}

function main() {
  const missingFiles = CASES_FILES.filter((filePath) => !existsSync(filePath));
  if (missingFiles.length > 0) {
    for (const filePath of missingFiles) {
      console.error(`FAIL  cases file not found: ${filePath}`);
    }
    process.exit(1);
  }

  if (!existsSync(CHUNKS_DIRECTORY)) {
    console.error(`FAIL  translation chunks not found: ${CHUNKS_DIRECTORY}`);
    console.error("      Provenance cannot be verified without the source.");
    process.exit(1);
  }

  const cases = CASES_FILES.flatMap((filePath) =>
    extractCases(readFileSync(filePath, "utf8")),
  );
  const combinedSource = CASES_FILES.map((filePath) =>
    readFileSync(filePath, "utf8"),
  ).join("\n");
  const chunkCache = new Map();
  const availableChunks = new Set(readdirSync(CHUNKS_DIRECTORY));

  const failures = [];
  const warnings = [];
  let checkedValueCount = 0;

  for (const referenceCase of cases) {
    const label = `${referenceCase.caseId} [${referenceCase.evidenceLevel}]`;

    if (referenceCase.evidenceLevel === "illustrative") {
      if (referenceCase.hasSource || referenceCase.hasVerification) {
        failures.push(
          `${label}: illustrative case must not carry source/verification`,
        );
      }
      if (!referenceCase.hasSchematicFigure) {
        failures.push(`${label}: illustrative case must carry a schematicFigure`);
      }
      continue;
    }

    if (!referenceCase.hasSource) {
      failures.push(`${label}: real case is missing source provenance`);
    }
    if (!referenceCase.hasDataCaveat) {
      failures.push(`${label}: real case is missing the mandatory dataCaveat`);
    }
    if (!referenceCase.hasVerification) {
      failures.push(`${label}: real case is missing verification`);
      continue;
    }
    if (referenceCase.verifiableValues.length === 0) {
      failures.push(`${label}: verifiableValues is empty, nothing can be checked`);
    }

    for (const chunkName of referenceCase.sourceChunks) {
      if (!availableChunks.has(chunkName)) {
        failures.push(`${label}: cited chunk does not exist: ${chunkName}`);
      }
    }

    for (const rawValue of referenceCase.verifiableValues) {
      checkedValueCount += 1;
      const foundIn = referenceCase.sourceChunks.filter((chunkName) => {
        const content = loadChunk(chunkName, chunkCache);
        return content !== null && isValueFound(rawValue, content);
      });

      if (foundIn.length === 0) {
        failures.push(
          `${label}: value "${rawValue}" not found in ${referenceCase.sourceChunks.join(", ")}`,
        );
      }
    }

    if (referenceCase.hasUnresolvedOcrDamage) {
      warnings.push(
        `${label}: contains OCR-damaged values not yet reconciled with the source PDF`,
      );
    }
  }

  const realCases = cases.filter((entry) => entry.evidenceLevel !== "illustrative");
  /** Every real case routes through the shared helper, so a "not-checked"
   *  default there means none of them has been reconciled with the English. */
  const notCheckedAgainstEnglish = /englishSourceCheck: "not-checked"/.test(
    combinedSource,
  )
    ? realCases.length
    : 0;

  console.log("Reference case provenance check");
  console.log("--------------------------------");
  console.log(`cases total          : ${cases.length}`);
  console.log(`  real (regulatory)  : ${realCases.length}`);
  console.log(`  illustrative       : ${cases.length - realCases.length}`);
  console.log(`values grepped       : ${checkedValueCount}`);
  console.log(`failures             : ${failures.length}`);
  console.log("");

  for (const failure of failures) console.error(`FAIL  ${failure}`);
  for (const warning of warnings) console.warn(`WARN  ${warning}`);

  if (notCheckedAgainstEnglish > 0) {
    console.warn("");
    console.warn(
      `WARN  ${notCheckedAgainstEnglish} case(s) never reconciled against the English source.`,
    );
    console.warn(
      "      The Chinese translation is an intermediate artefact, not the base of truth.",
    );
  }

  if (failures.length > 0) {
    console.error("");
    console.error("Provenance check FAILED.");
    process.exit(1);
  }

  console.log("");
  console.log("All cited values were found verbatim in their cited sources.");
  console.log(
    "Note: this proves faithful transcription from the translation, NOT that the",
  );
  console.log("translation itself is faithful to the English original.");
}

main();
