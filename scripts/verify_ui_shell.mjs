/**
 * UI-shell invariants for the layered drawer interface (M series).
 *
 * Covers: exactly one disclaimer render point site-wide and it lives on the
 * home page; the demo-data banner is still rendered; the status glyph still
 * carries five distinct shapes; every animation added by the drawer shell is
 * switched off in the reduced-motion block; the drawer components still carry
 * their ARIA contract and Esc handling; and the frozen business files are
 * byte-identical to their pre-refactor content.
 *
 * Static analysis only — it never renders React and never calls the network.
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const failures = [];

function fail(message) {
  failures.push(message);
}

function toPosix(path) {
  return relative(projectRoot, path).replaceAll("\\", "/");
}

function read(relativePath) {
  return readFileSync(join(projectRoot, relativePath), "utf8");
}

function walkFiles(root, extensions) {
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
        if (entry.name === "node_modules" || entry.name === ".git") continue;
        stack.push(full);
        continue;
      }
      if (extensions.includes(extname(entry.name))) out.push(full);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// 1. Exactly one disclaimer render point, and it is the home-page one-liner.
// ---------------------------------------------------------------------------

/** Matches a JSX render of any disclaimer-flavoured message key, e.g.
 *  `{messages.common.siteDisclaimerLine}` or `{copy.disclaimer}`. */
const DISCLAIMER_RENDER_PATTERN =
  /\{\s*(?:messages|copy|toolMessages)\.(?:[A-Za-z0-9_]+\.)*(?:disclaimer|disclaimerTitle|disclaimerText|footerDisclaimer|notAGovernmentSite|siteDisclaimerLine)\s*\}/g;

const EXPECTED_DISCLAIMER_FILE = "src/components/views/HomeView.tsx";
const EXPECTED_DISCLAIMER_KEY = "messages.common.siteDisclaimerLine";

const componentFiles = walkFiles(join(projectRoot, "src"), [".tsx"]);
const disclaimerRenders = [];
for (const file of componentFiles) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(DISCLAIMER_RENDER_PATTERN)) {
    disclaimerRenders.push({ file: toPosix(file), render: match[0] });
  }
}

if (disclaimerRenders.length !== 1) {
  fail(
    `expected exactly 1 disclaimer render point, found ${disclaimerRenders.length}: ${
      disclaimerRenders.map((entry) => `${entry.file} ${entry.render}`).join(" | ") || "none"
    }`,
  );
} else {
  const [only] = disclaimerRenders;
  if (only.file !== EXPECTED_DISCLAIMER_FILE) {
    fail(`the only disclaimer render must live in ${EXPECTED_DISCLAIMER_FILE}, found ${only.file}`);
  }
  if (!only.render.includes(EXPECTED_DISCLAIMER_KEY)) {
    fail(`the home-page disclaimer must render ${EXPECTED_DISCLAIMER_KEY}, found ${only.render}`);
  }
}

// The message definitions themselves must stay in place, only unrendered.
const messagesSource = read("src/i18n/messages.ts");
for (const key of [
  "notAGovernmentSite",
  "footerDisclaimer",
  "disclaimerTitle",
  "disclaimerText",
  "siteDisclaimerLine",
]) {
  if (!messagesSource.includes(`${key}:`)) {
    fail(`messages.ts lost the ${key} definition`);
  }
}

// ---------------------------------------------------------------------------
// 2. The demo-data banner is a data-nature statement and must stay rendered.
// ---------------------------------------------------------------------------

const DEMO_BANNER_FILES = [
  "src/components/comprehensive-analysis/ProductPairForm.tsx",
  "src/components/comprehensive-analysis/OverallEvidencePanel.tsx",
];
for (const relativePath of DEMO_BANNER_FILES) {
  if (!read(relativePath).includes("demoUseBanner")) {
    fail(`${relativePath} no longer renders demoUseBanner`);
  }
}
if (!messagesSource.includes("demoUseBanner:")) {
  fail("messages.ts lost the demoUseBanner definition");
}

// ---------------------------------------------------------------------------
// 3. Five distinct status shapes; colour must never be the only channel.
// ---------------------------------------------------------------------------

const glyphSource = read("src/components/comprehensive-analysis/AssessmentStatusGlyph.tsx");
const glyphShapeMarkers = [
  { name: "circle + check (supports)", pattern: /<circle[^>]*r="9"/ },
  { name: "octagon (does not support)", pattern: /d="M7 2\.5h6l4\.5 4\.5v6L13 17\.5H7L2\.5 13V7z"/ },
  { name: "square + question (insufficient)", pattern: /<text[^>]*>\s*\?/ },
  { name: "diamond (not applicable)", pattern: /transform="rotate\(45 10 2\.5\)"/ },
  { name: "dashed circle (unset)", pattern: /strokeDasharray="3 2"/ },
];
for (const marker of glyphShapeMarkers) {
  if (!marker.pattern.test(glyphSource)) {
    fail(`AssessmentStatusGlyph lost the shape channel: ${marker.name}`);
  }
}
if (!glyphSource.includes("resolvedLabel")) {
  fail("AssessmentStatusGlyph must keep the text label beside the shape");
}

// ---------------------------------------------------------------------------
// 4. Reduced motion switches off every animation the drawer shell added.
// ---------------------------------------------------------------------------

const globalsCss = read("src/app/globals.css");
if (!globalsCss.includes(".assistant-panel.glass-edge::before")) {
  fail(
    "globals.css must disable .assistant-panel.glass-edge::before so the chat body is not covered",
  );
}
const NEW_KEYFRAMES = [
  "drawer-layer-in",
  "drawer-layer-in-mobile",
  "drawer-scrim-in",
  "drawer-stagger-in",
  "spine-sheen",
  "aurora-drift",
  "hero-grid-drift",
  "glyph-pulse",
];
for (const keyframeName of NEW_KEYFRAMES) {
  if (!globalsCss.includes(`@keyframes ${keyframeName}`)) {
    fail(`globals.css is missing @keyframes ${keyframeName}`);
  }
}

const reducedMotionIndex = globalsCss.indexOf("@media (prefers-reduced-motion: reduce)");
if (reducedMotionIndex < 0) {
  fail("globals.css lost the prefers-reduced-motion block");
} else {
  const reducedMotionBlock = globalsCss.slice(reducedMotionIndex);
  const SELECTORS_TO_NEUTRALISE = [
    ".drawer-layer",
    ".drawer-scrim",
    ".drawer-stagger > *",
    ".drawer-spine::after",
    ".aurora-layer",
    ".hero-grid-parallax",
    ".glyph-pulse",
  ];
  for (const selector of SELECTORS_TO_NEUTRALISE) {
    if (!reducedMotionBlock.includes(selector)) {
      fail(`reduced-motion block does not neutralise ${selector}`);
    }
  }
  if (!reducedMotionBlock.includes("animation: none !important")) {
    fail("reduced-motion block must set animation: none !important for the new animations");
  }
}

// ---------------------------------------------------------------------------
// 5. The drawer stack keeps its keyboard and ARIA contract.
// ---------------------------------------------------------------------------

const providerSource = read("src/components/drawer/DrawerStackProvider.tsx");
for (const token of ["pushLayer", "popLayer", "popToDepth", "closeAll", '"Escape"']) {
  if (!providerSource.includes(token)) {
    fail(`DrawerStackProvider.tsx lost ${token}`);
  }
}

const shellSource = read("src/components/drawer/DrawerLayerShell.tsx");
for (const token of ['role="dialog"', 'aria-modal="false"', "aria-label={title}"]) {
  if (!shellSource.includes(token)) {
    fail(`DrawerLayerShell.tsx lost ${token}`);
  }
}

const stackSource = read("src/components/drawer/DrawerStack.tsx");
for (const token of ["aria-label", 'event.key !== "Tab"']) {
  if (!stackSource.includes(token)) {
    fail(`DrawerStack.tsx lost ${token}`);
  }
}

const railSource = read("src/components/layout/SideExplorerRail.tsx");
for (const token of ["aria-expanded", "aria-controls"]) {
  if (!railSource.includes(token)) {
    fail(`SideExplorerRail.tsx lost ${token}`);
  }
}

// The skip-link target must survive the layout rework.
const layoutSource = read("src/app/layout.tsx");
if (!layoutSource.includes('id="main-content"')) {
  fail("layout.tsx lost the main#main-content skip-link target");
}

// ---------------------------------------------------------------------------
// 6. Frozen business files are byte-identical to the pre-refactor content.
// ---------------------------------------------------------------------------

const FROZEN_FILE_HASHES = {
  "src/lib/comprehensive-analysis/summarize.ts":
    "87c7e3c3fb7b61b34279df84858b34ac3104631970b88fe76bee22d39d2e883c",
  "src/data/characterization-items.ts":
    "57b5e99ab521b925b2e12dbffa7cd710e823ac473e419e617dd523793037c3df",
  "src/lib/comprehensive-analysis/demo-process.ts":
    "af5c92fb02069beb83813fe6f4f62cb7b5e1739439860383d1ca531b819c1ce1",
};
for (const [relativePath, expectedHash] of Object.entries(FROZEN_FILE_HASHES)) {
  const actualHash = createHash("sha256")
    .update(readFileSync(join(projectRoot, relativePath)))
    .digest("hex");
  if (actualHash !== expectedHash) {
    fail(`${relativePath} changed: expected sha256 ${expectedHash}, got ${actualHash}`);
  }
}

// ---------------------------------------------------------------------------

function statExists(path) {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
}

for (const relativePath of [
  "src/components/drawer/DrawerStackProvider.tsx",
  "src/components/drawer/DrawerStack.tsx",
  "src/components/drawer/DrawerLayerShell.tsx",
  "src/components/layout/SideExplorerRail.tsx",
]) {
  if (!statExists(join(projectRoot, relativePath))) {
    fail(`missing drawer shell file ${relativePath}`);
  }
}

if (failures.length > 0) {
  for (const message of failures) {
    console.error(`FAIL ${message}`);
  }
  process.exit(1);
}

console.log("verify_ui_shell: ok");
console.log(`  disclaimer render points : 1 (${EXPECTED_DISCLAIMER_FILE})`);
console.log(`  status glyph shapes      : ${glyphShapeMarkers.length}`);
console.log(`  new keyframes covered    : ${NEW_KEYFRAMES.length}`);
console.log(`  frozen files verified    : ${Object.keys(FROZEN_FILE_HASHES).length}`);
