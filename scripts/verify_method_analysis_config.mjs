// Mechanically check src/data/method-analysis-config.ts against the generated
// method list, and enforce the invariants that keep the analysis panel honest.
//
// This is not a type check. tsc already proves the shapes are right. What it
// cannot prove is that the file covers every method exactly once, that the ids
// resolve, and that a method claiming to be analyzable is not in fact governed
// by an absent rule or blocked by an unverified tool. Those are the mistakes
// that would silently put a working upload form in front of a user for an
// attribute the system must not judge.
//
// Reads the TypeScript as text on purpose, so the check does not depend on a
// build step and cannot be fooled by a stale compiled artefact.

import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const ITEMS_PATH = path.join(PROJECT_ROOT, "src", "data", "characterization-items.ts");
const CONFIG_PATH = path.join(PROJECT_ROOT, "src", "data", "method-analysis-config.ts");
const SCHEMES_PATH = path.join(PROJECT_ROOT, "src", "data", "similarity-schemes.ts");

const PRIMARY_STRUCTURE = "primary-structure";
const EXPECTED_METHOD_COUNT = 33;
const EXPECTED_ITEM_COUNT = 11;

/** Statuses that must NOT carry a profile, because they admit no workflow. */
const STATUSES_WITHOUT_PROFILE = new Set(["display-only", "rule-not-defined"]);
/** Statuses that must carry a human-readable reason. */
const STATUSES_NEEDING_REASON = new Set([
  "blocked-by-tool",
  "not-yet-supported",
  "display-only",
  "rule-not-defined",
]);

const failures = [];
const warnings = [];

function fail(message) {
  failures.push(message);
}

/** Parse the generated items file, which is a JSON array literal. */
function loadPrimaryStructureMethods() {
  const text = readFileSync(ITEMS_PATH, "utf8");
  const anchor = text.indexOf("characterizationItems");
  const start = text.indexOf("= [", anchor) + 2;
  const end = text.lastIndexOf("]") + 1;
  const items = JSON.parse(text.slice(start, end));

  const byMethodId = new Map();
  const itemIds = new Set();
  for (const item of items) {
    if (item.category !== PRIMARY_STRUCTURE) continue;
    itemIds.add(item.id);
    for (const method of item.methods) {
      byMethodId.set(method.id, { itemId: item.id, name: method.name.zh });
    }
  }
  return { byMethodId, itemIds };
}

/** Split the hand-written config into one text block per entry, then read the
 *  scalar fields out of each. Block boundary is a 4-space-indented methodId. */
function loadConfigBlocks() {
  const text = readFileSync(CONFIG_PATH, "utf8");
  const arrayStart = text.indexOf("export const methodAnalysisConfigs");
  if (arrayStart < 0) {
    fail("methodAnalysisConfigs not found in method-analysis-config.ts");
    return [];
  }
  const body = text.slice(arrayStart);
  const parts = body.split(/\n {4}methodId: /).slice(1);

  return parts.map((part) => {
    const chunk = `methodId: ${part}`;
    const scalar = (field) => {
      const match = chunk.match(new RegExp(`\\n?\\s*${field}: "([^"]*)"`));
      return match ? match[1] : undefined;
    };
    const bool = (field) => {
      const match = chunk.match(new RegExp(`\\s${field}: (true|false)`));
      return match ? match[1] === "true" : undefined;
    };
    const list = (field) => {
      const match = chunk.match(new RegExp(`\\s${field}: \\[([^\\]]*)\\]`));
      if (!match) return undefined;
      return match[1]
        .split(",")
        .map((entry) => entry.trim().replace(/^"|"$/g, ""))
        .filter(Boolean);
    };
    return {
      methodId: scalar("methodId"),
      itemId: scalar("itemId"),
      status: scalar("status"),
      profile: scalar("profile"),
      blockedBy: list("blockedBy"),
      allowsImageFallback: bool("allowsImageFallback"),
      plannedIn: scalar("plannedIn"),
      // A reason may be an inline object or a shared constant; either counts.
      hasReason:
        /\sstatusReason: [A-Z_]+,/.test(chunk) || /\sstatusReason: \{/.test(chunk),
      raw: chunk,
    };
  });
}

/** Which items have a complete, programmable rule, taken from the P2 sidecar so
 *  the two files cannot disagree about what is judgeable. */
function loadSchemeCompleteness() {
  const text = readFileSync(SCHEMES_PATH, "utf8");
  const completeness = new Map();
  const pattern = /itemId: "([^"]+)",[\s\S]{0,400}?completeness: "([a-z-]+)"/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    completeness.set(match[1], match[2]);
  }
  return completeness;
}

/** Tools declared verified in the profile table. A method may only be
 *  analyzable when every tool its profile hard-requires is verified; msconvert
 *  is conditional on vendor input, so it does not gate an otherwise open-format
 *  workflow. */
function loadUnverifiedGatingTools() {
  const text = readFileSync(CONFIG_PATH, "utf8");
  const gating = new Map();
  const profilePattern = /\n {4}id: "([a-z0-9-]+)",[\s\S]*?docxFigures:/g;
  let match;
  while ((match = profilePattern.exec(text)) !== null) {
    const profileId = match[1];
    const block = match[0];
    const tools = [];
    const toolPattern = /tool: "([^"]+)",[\s\S]*?verified: (true|false)/g;
    let toolMatch;
    while ((toolMatch = toolPattern.exec(block)) !== null) {
      const [, tool, verified] = toolMatch;
      // msconvert only matters when the user brings a vendor file, which the
      // panel decides per upload, not per method.
      if (tool !== "msconvert" && verified === "false") tools.push(tool);
    }
    gating.set(profileId, tools);
  }
  return gating;
}

function main() {
  const { byMethodId, itemIds } = loadPrimaryStructureMethods();
  const configs = loadConfigBlocks();
  const completeness = loadSchemeCompleteness();
  const gatingTools = loadUnverifiedGatingTools();

  if (byMethodId.size !== EXPECTED_METHOD_COUNT) {
    fail(
      `expected ${EXPECTED_METHOD_COUNT} primary-structure methods in ` +
        `characterization-items.ts, found ${byMethodId.size}`,
    );
  }
  if (itemIds.size !== EXPECTED_ITEM_COUNT) {
    fail(
      `expected ${EXPECTED_ITEM_COUNT} primary-structure items, found ${itemIds.size}`,
    );
  }

  // 1. Coverage: every method configured exactly once, nothing invented.
  const seen = new Set();
  for (const config of configs) {
    if (!config.methodId) {
      fail("a config entry has no methodId");
      continue;
    }
    if (seen.has(config.methodId)) {
      fail(`${config.methodId}: configured more than once`);
    }
    seen.add(config.methodId);

    const method = byMethodId.get(config.methodId);
    if (!method) {
      fail(`${config.methodId}: not a primary-structure method id`);
      continue;
    }
    if (config.itemId !== method.itemId) {
      fail(
        `${config.methodId}: declares itemId ${config.itemId} but the method ` +
          `belongs to ${method.itemId}`,
      );
    }
  }
  for (const methodId of byMethodId.keys()) {
    if (!seen.has(methodId)) fail(`${methodId}: no analysis config entry`);
  }

  // 2. Status invariants.
  for (const config of configs) {
    const { methodId, status, profile } = config;
    if (!status) {
      fail(`${methodId}: no status`);
      continue;
    }

    if (STATUSES_WITHOUT_PROFILE.has(status)) {
      if (profile) {
        fail(`${methodId}: status ${status} must not carry a profile, has ${profile}`);
      }
      if (config.allowsImageFallback !== false) {
        fail(`${methodId}: status ${status} must set allowsImageFallback false`);
      }
    } else if (!profile) {
      fail(`${methodId}: status ${status} requires a profile`);
    }

    if (STATUSES_NEEDING_REASON.has(status) && !config.hasReason) {
      fail(`${methodId}: status ${status} requires a statusReason`);
    }

    const blocked = config.blockedBy ?? [];
    if (status === "blocked-by-tool" && blocked.length === 0) {
      fail(`${methodId}: status blocked-by-tool requires a non-empty blockedBy`);
    }
    if (status !== "blocked-by-tool" && blocked.length > 0) {
      fail(`${methodId}: blockedBy is only allowed with status blocked-by-tool`);
    }
  }

  // 3. A method may not be analyzable when its parent item has no complete rule.
  //    This is decision D17 expressed as a structural constraint.
  for (const config of configs) {
    const itemCompleteness = completeness.get(config.itemId);
    if (itemCompleteness === undefined) {
      warnings.push(`${config.itemId}: no similarity scheme found for cross-check`);
      continue;
    }
    const judgeable = itemCompleteness === "complete";
    if (!judgeable && config.status !== "rule-not-defined" && config.status !== "display-only") {
      fail(
        `${config.methodId}: item ${config.itemId} has completeness ` +
          `"${itemCompleteness}", so the status must be rule-not-defined or ` +
          `display-only, not "${config.status}"`,
      );
    }
    if (judgeable && config.status === "rule-not-defined") {
      fail(
        `${config.methodId}: item ${config.itemId} has a complete rule, so ` +
          `rule-not-defined is wrong`,
      );
    }
  }

  // 3b. P13 / D17: free-thiol methods never get an analysis workflow.
  const freeThiolMethods = configs.filter((config) => config.itemId === "free-thiol");
  if (freeThiolMethods.length !== 3) {
    fail(`expected 3 free-thiol methods, found ${freeThiolMethods.length}`);
  }
  for (const config of freeThiolMethods) {
    if (config.status === "analyzable") {
      fail(`${config.methodId}: D17 forbids analyzable status on free-thiol`);
    }
    if (config.profile) {
      fail(`${config.methodId}: D17 forbids an analysis profile on free-thiol`);
    }
  }

  // 3c. P14 / D17: disulfide-bonds methods never get an analysis workflow.
  const disulfideMethods = configs.filter((config) => config.itemId === "disulfide-bonds");
  if (disulfideMethods.length !== 3) {
    fail(`expected 3 disulfide-bonds methods, found ${disulfideMethods.length}`);
  }
  for (const config of disulfideMethods) {
    if (config.status === "analyzable") {
      fail(`${config.methodId}: D17 forbids analyzable status on disulfide-bonds`);
    }
    if (config.profile) {
      fail(`${config.methodId}: D17 forbids an analysis profile on disulfide-bonds`);
    }
  }

  // 4. Analyzable must not depend on an unverified gating tool.
  for (const config of configs) {
    if (config.status !== "analyzable" || !config.profile) continue;
    const pending = gatingTools.get(config.profile) ?? [];
    if (pending.length > 0) {
      fail(
        `${config.methodId}: claims analyzable but profile ${config.profile} ` +
          `depends on unverified tool(s) ${pending.join(", ")}`,
      );
    }
  }

  // 5. Every profile referenced must be declared, and every declared profile used.
  const declaredProfiles = new Set(gatingTools.keys());
  const usedProfiles = new Set(
    configs.map((config) => config.profile).filter(Boolean),
  );
  for (const profile of usedProfiles) {
    if (!declaredProfiles.has(profile)) {
      fail(`profile "${profile}" is referenced but not declared in analysisProfiles`);
    }
  }
  for (const profile of declaredProfiles) {
    if (!usedProfiles.has(profile)) {
      warnings.push(`profile "${profile}" is declared but no method uses it`);
    }
  }

  // ---------------------------------------------------------------------
  const statusCounts = {};
  const profileCounts = {};
  for (const config of configs) {
    statusCounts[config.status] = (statusCounts[config.status] ?? 0) + 1;
    if (config.profile) {
      profileCounts[config.profile] = (profileCounts[config.profile] ?? 0) + 1;
    }
  }

  console.log("Method analysis config check");
  console.log("----------------------------");
  console.log(`primary-structure methods    : ${byMethodId.size}`);
  console.log(`configured                   : ${configs.length}`);
  console.log(`  by status                  : ${JSON.stringify(statusCounts)}`);
  console.log(`  by profile                 : ${JSON.stringify(profileCounts)}`);
  console.log(
    `image fallback allowed       : ${configs.filter((c) => c.allowsImageFallback).length}`,
  );
  console.log(`warnings                     : ${warnings.length}`);
  for (const warning of warnings) console.log(`  WARN  ${warning}`);
  console.log(`failures                     : ${failures.length}`);
  for (const failure of failures) console.log(`  FAIL  ${failure}`);

  if (failures.length === 0) {
    console.log("");
    console.log("Every primary-structure method has exactly one config entry, every");
    console.log("method has at most one profile, and no method claims to be analyzable");
    console.log("while its rule is absent or its tools are unverified.");
    console.log("");
    console.log("Note: this checks coverage, id linkage and status invariants only, NOT");
    console.log("whether the profile assignment is scientifically the right one.");
  }

  return failures.length === 0 ? 0 : 1;
}

process.exit(main());
