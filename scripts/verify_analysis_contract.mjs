/**
 * Mechanical parity check: TypeScript analysis-contract.ts ↔ Pydantic models ↔
 * committed JSON Schema / field manifest.
 *
 * Exit 0 only when all three agree on wire field names and requiredness for
 * every model in CONTRACT_MODELS. Drift between TS and Python has caused silent
 * API breakage in other projects; this script exists to catch that before P5
 * ships endpoints.
 */

import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");

const TS_PATH = join(projectRoot, "src", "types", "analysis-contract.ts");
const MODELS_TS_PATH = join(projectRoot, "src", "types", "models.ts");
const MANIFEST_PATH = join(
  projectRoot,
  "analysis-service",
  "contracts",
  "field-manifest.json",
);
const RESULT_SCHEMA_PATH = join(
  projectRoot,
  "analysis-service",
  "contracts",
  "analysis-result.schema.json",
);
const JOB_SCHEMA_PATH = join(
  projectRoot,
  "analysis-service",
  "contracts",
  "analysis-job-snapshot.schema.json",
);
const EXPORT_SCRIPT = join(
  projectRoot,
  "analysis-service",
  "scripts",
  "export_contract_schema.py",
);

/** Models that must exist in TS, Python, and the committed manifest. */
const CONTRACT_MODELS = [
  "LocalizedText",
  "AnalysisInputFileDescriptor",
  "AnalysisSamplePairing",
  "AnalysisInputEvidence",
  "AnalysisChromatogramPeak",
  "AnalysisFragmentIon",
  "AnalysisImageMetrics",
  "AnalysisExtractedFeatures",
  "AnalysisRuleEvaluation",
  "AnalysisArtifacts",
  "AnalysisQualityGate",
  "AnalysisRunEvidence",
  "AnalysisInputHash",
  "AnalysisExternalLink",
  "AnalysisResultProvenance",
  "AnalysisResult",
  "AnalysisJobProgress",
  "AnalysisJobError",
  "AnalysisJobSnapshot",
];

const failures = [];

function fail(message) {
  failures.push(message);
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

/** Parse `export interface Foo { ... }` blocks from the TS contract file. */
function parseTsInterfaces(source) {
  const interfaces = new Map();
  const pattern = /export interface (\w+) \{([\s\S]*?)\n\}/g;
  let match;
  while ((match = pattern.exec(source)) !== null) {
    const [, name, body] = match;
    const fields = new Map();
    for (const line of body.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("*") || trimmed.startsWith("//")) continue;
      const fieldMatch = trimmed.match(/^(\w+)(\?)?: (.+);$/);
      if (!fieldMatch) continue;
      const [, fieldName, optional, rawType] = fieldMatch;
      let nested = null;
      let kind = "scalar";
      if (rawType.endsWith("[]")) {
        kind = "array";
        const element = rawType.slice(0, -2).trim();
        if (/^[A-Z]\w*$/.test(element)) nested = element;
      } else if (/^[A-Z]\w*$/.test(rawType)) {
        kind = "object";
        nested = rawType;
      } else if (rawType.startsWith("Partial<") || rawType.startsWith("Record<")) {
        kind = "object";
      } else if (rawType.startsWith("typeof ")) {
        kind = "scalar";
      }
      fields.set(fieldName, {
        required: optional !== "?",
        kind,
        nested,
      });
    }
    interfaces.set(name, fields);
  }
  return interfaces;
}

function compareModel(modelName, tsFields, pyFields) {
  if (!tsFields) {
    fail(`${modelName}: missing TypeScript interface`);
    return;
  }
  if (!pyFields) {
    fail(`${modelName}: missing Python manifest entry`);
    return;
  }

  for (const [fieldName, tsMeta] of tsFields.entries()) {
    const pyMeta = pyFields[fieldName];
    if (!pyMeta) {
      fail(`${modelName}.${fieldName}: present in TS, absent in Python manifest`);
      continue;
    }
    if (tsMeta.required !== pyMeta.required) {
      fail(
        `${modelName}.${fieldName}: requiredness differs (TS=${tsMeta.required}, Python=${pyMeta.required})`,
      );
    }
    if (tsMeta.nested && pyMeta.nested && tsMeta.nested !== pyMeta.nested) {
      fail(
        `${modelName}.${fieldName}: nested type differs (TS=${tsMeta.nested}, Python=${pyMeta.nested})`,
      );
    }
  }

  for (const fieldName of Object.keys(pyFields)) {
    if (!tsFields.has(fieldName)) {
      fail(`${modelName}.${fieldName}: present in Python manifest, absent in TS`);
    }
  }
}

function schemaPropertyKeys(schema, rootName) {
  const defs = schema.$defs ?? {};
  const root = defs[rootName] ?? schema;
  return Object.keys(root.properties ?? {}).sort();
}

function compareSchemaToManifest(schema, modelName, manifestEntry) {
  const keys = schemaPropertyKeys(schema, modelName);
  const manifestKeys = Object.keys(manifestEntry).sort();
  if (keys.join(",") !== manifestKeys.join(",")) {
    fail(
      `${modelName}: JSON Schema properties [${keys.join(", ")}] != manifest [${manifestKeys.join(", ")}]`,
    );
  }
}

function runPython(command) {
  return execSync(`python "${EXPORT_SCRIPT}" ${command}`, {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, PYTHONIOENCODING: "utf-8" },
  });
}

function main() {
  const tsSource = readFileSync(TS_PATH, "utf8");
  const modelsSource = readFileSync(MODELS_TS_PATH, "utf8");
  const tsInterfaces = new Map([
    ...parseTsInterfaces(modelsSource),
    ...parseTsInterfaces(tsSource),
  ]);
  const committedManifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  const freshManifest = JSON.parse(runPython("manifest"));

  if (sha256(JSON.stringify(committedManifest)) !== sha256(JSON.stringify(freshManifest))) {
    fail(
      "field-manifest.json is stale — run: python analysis-service/scripts/export_contract_schema.py write",
    );
  }

  for (const modelName of CONTRACT_MODELS) {
    compareModel(modelName, tsInterfaces.get(modelName), committedManifest[modelName]);
  }

  const committedResultSchema = JSON.parse(readFileSync(RESULT_SCHEMA_PATH, "utf8"));
  const committedJobSchema = JSON.parse(readFileSync(JOB_SCHEMA_PATH, "utf8"));
  const freshSchemas = JSON.parse(runPython("schemas"));

  if (
    sha256(JSON.stringify(committedResultSchema)) !==
    sha256(JSON.stringify(freshSchemas.analysisResult))
  ) {
    fail(
      "analysis-result.schema.json is stale — run: python analysis-service/scripts/export_contract_schema.py write",
    );
  }
  if (
    sha256(JSON.stringify(committedJobSchema)) !==
    sha256(JSON.stringify(freshSchemas.analysisJobSnapshot))
  ) {
    fail(
      "analysis-job-snapshot.schema.json is stale — run: python analysis-service/scripts/export_contract_schema.py write",
    );
  }

  compareSchemaToManifest(committedResultSchema, "AnalysisResult", committedManifest.AnalysisResult);
  compareSchemaToManifest(
    committedJobSchema,
    "AnalysisJobSnapshot",
    committedManifest.AnalysisJobSnapshot,
  );

  // Round-trip: minimal fixture must parse under Pydantic.
  try {
    const validateOutput = execSync(`python "${join(projectRoot, "analysis-service", "scripts", "validate_fixture.py")}"`, {
      cwd: projectRoot,
      encoding: "utf8",
    });
    if (!validateOutput.includes("fixture_ok")) {
      fail("minimal fixture did not validate under Pydantic");
    }
  } catch (error) {
    fail(`minimal fixture Pydantic validation failed: ${error.stderr ?? error.message}`);
  }

  console.log("Analysis contract parity check");
  console.log("------------------------------");
  console.log(`TypeScript interfaces parsed : ${tsInterfaces.size}`);
  console.log(`models checked               : ${CONTRACT_MODELS.length}`);
  console.log(`schemaVersion constant       : 1.0.0`);
  console.log(`ruleSetVersion constant      : v2-sheet3-8bd6b18f`);
  console.log(`failures                     : ${failures.length}`);
  for (const failure of failures) console.log(`  FAIL  ${failure}`);

  if (failures.length === 0) {
    console.log("");
    console.log("TS, Pydantic manifest, and committed JSON Schema agree on wire fields.");
    console.log("Minimal fixture round-trips through AnalysisResult.model_validate_json.");
  }

  return failures.length === 0 ? 0 : 1;
}

process.exit(main());
