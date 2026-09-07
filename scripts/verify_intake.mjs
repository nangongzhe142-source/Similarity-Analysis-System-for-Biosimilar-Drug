/**
 * Intake invariants for reviewer screen-capture and sponsor per-item entry.
 * Does not call vision APIs or analysis-service.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";
import { registerHooks } from "node:module";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const srcRoot = join(projectRoot, "src");
const failures = [];

function fail(message) {
  failures.push(message);
}

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

const CHARACTERIZATION_ITEMS_HASH =
  "57b5e99ab521b925b2e12dbffa7cd710e823ac473e419e617dd523793037c3df";
const actualItemsHash = createHash("sha256")
  .update(readFileSync(join(projectRoot, "src/data/characterization-items.ts")))
  .digest("hex");
if (actualItemsHash !== CHARACTERIZATION_ITEMS_HASH) {
  fail(
    `characterization-items.ts changed: expected ${CHARACTERIZATION_ITEMS_HASH}, got ${actualItemsHash}`,
  );
}

const {
  sanitizeVisionExtractResponse,
} = await import(pathToFileURL(join(srcRoot, "lib/screen-intake/vision-contract.ts")).href);
const {
  MOCK_VISION_EXTRACT_RESPONSE,
} = await import(pathToFileURL(join(srcRoot, "lib/screen-intake/vision-client.ts")).href);
const {
  applyRegionRecordsToEntries,
  createEmptySponsorEntries,
  regionCanSendToAnalysis,
  sponsorCompleteness,
  visionRegionsToRecords,
} = await import(pathToFileURL(join(srcRoot, "lib/screen-intake/session-rules.ts")).href);
const {
  allTracksStopped,
  enqueueAsyncWork,
  isVideoFrameReady,
  screenFrameFileName,
  stopMediaTracks,
} = await import(pathToFileURL(join(srcRoot, "lib/screen-intake/capture-frame.ts")).href);
const { characterizationItems } = await import(
  pathToFileURL(join(srcRoot, "data/characterization-items.ts")).href
);

const knownItemIds = new Set(characterizationItems.map((item) => item.id));

const dirty = {
  regions: [
    {
      kind: "table",
      itemId: "not-a-real-characterization-item",
      confidence: 0.9,
      lots: [{ role: "candidate", lotId: "C1", value: 1, unit: "Da" }],
    },
    {
      kind: "table",
      itemId: "intact-mass",
      confidence: 0.8,
      lots: [{ role: "reference", lotId: "R1", value: 2, unit: "Da" }],
    },
  ],
};
const cleaned = sanitizeVisionExtractResponse(dirty, knownItemIds);
if (cleaned.regions[0].itemId !== null) {
  fail("unknown itemId must be forced to null");
}
if (cleaned.regions[1].itemId !== "intact-mass") {
  fail("known itemId must be kept");
}

const mockCleaned = sanitizeVisionExtractResponse(MOCK_VISION_EXTRACT_RESPONSE, knownItemIds);
if (mockCleaned.regions.some((region) => region.itemId && !knownItemIds.has(region.itemId))) {
  fail("mock extract still contains unknown itemId");
}
if (!mockCleaned.regions.some((region) => region.itemId === null)) {
  fail("mock unknown itemId was not discarded to unmatched");
}

const itemIds = characterizationItems.map((item) => item.id);
const emptyEntries = createEmptySponsorEntries(itemIds);
if (Object.keys(emptyEntries).some((key) => !knownItemIds.has(key))) {
  fail("sponsor entries contain keys that are not characterization item ids");
}
emptyEntries[itemIds[1]].omitted = true;
emptyEntries[itemIds[0]].lots = [
  { role: "candidate", lotId: "C1", value: 1, unit: "Da" },
];
const completeness = sponsorCompleteness(emptyEntries);
if (completeness.denominator !== itemIds.length - 1) {
  fail(
    `omitted items must leave the completeness denominator; got ${completeness.denominator}`,
  );
}
if (completeness.filled !== 1) {
  fail(`filled count should be 1, got ${completeness.filled}`);
}

const records = visionRegionsToRecords("frame-1", mockCleaned.regions, () =>
  `region-${Math.random().toString(16).slice(2)}`,
);
if (records.some((region) => region.reviewState !== "draft")) {
  fail("mock extract records must start as draft");
}
const applied = applyRegionRecordsToEntries(createEmptySponsorEntries(itemIds), records);
if (applied.entries["intact-mass"].reviewState !== "draft") {
  fail("mock write must keep reviewState draft");
}
if (applied.entries["not-a-real-characterization-item"] !== undefined) {
  fail("unknown itemId must not become a session key");
}
if (applied.unmatched.length < 1) {
  fail("null itemId regions must go to the unmatched inbox");
}
const draftRegion = records.find((region) => region.itemId === "intact-mass");
if (
  draftRegion &&
  regionCanSendToAnalysis(draftRegion, true)
) {
  fail("draft regions must not be sendable to analysis even if calibrated");
}
const confirmedSpectrum = {
  reviewState: "confirmed",
  kind: "spectrum",
  itemId: "intact-mass",
};
if (regionCanSendToAnalysis(confirmedSpectrum, false)) {
  fail("confirmed spectrum without calibration must not be sendable");
}

const chatRequest = read("src/lib/assistant/chat-request.ts");
if (!chatRequest.includes("imagePeakGuess")) {
  fail("chat-request.ts lost imagePeakGuess; screen intake must not loosen the whitelist");
}
if (!chatRequest.includes("from (the )?(image|png|jpeg|screenshot)")) {
  fail("chat-request.ts screenshot peak-guess guard was relaxed");
}

const intakeRoots = [
  join(srcRoot, "components/intake"),
  join(srcRoot, "lib/screen-intake"),
  join(srcRoot, "app/api/screen-intake"),
  join(srcRoot, "app/project/intake"),
  join(srcRoot, "types/intake.ts"),
];
const forbiddenSnippets = [
  "NEXT_PUBLIC_BACKEND_URL",
  "127.0.0.1:8000",
  "NEXT_PUBLIC_SCREEN_INTAKE_VISION_KEY",
  "/api/assistant/chat",
];
for (const root of intakeRoots) {
  const files = statSync(root).isDirectory()
    ? walkFiles(root, [".ts", ".tsx", ".mjs", ".js"])
    : [root];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const snippet of forbiddenSnippets) {
      if (text.includes(snippet)) {
        fail(`${relative(projectRoot, file)} contains forbidden snippet ${snippet}`);
      }
    }
  }
}

const visionClient = read("src/lib/screen-intake/vision-client.ts");
if (visionClient.includes("NEXT_PUBLIC_")) {
  fail("vision-client.ts must not use NEXT_PUBLIC_ env vars");
}
if (!visionClient.includes("SCREEN_INTAKE_VISION_KEY")) {
  fail("vision-client.ts must read SCREEN_INTAKE_VISION_KEY on the server");
}

const extractRoute = read("src/app/api/screen-intake/extract/route.ts");
if (extractRoute.includes("region.text") || extractRoute.includes("lots:")) {
  fail("extract route must not log extracted text or lot values");
}

const captureHelper = read("src/lib/screen-intake/capture-frame.ts");
if (!captureHelper.includes("track.stop()")) {
  fail("capture-frame.ts must stop media tracks");
}
if (!captureHelper.includes("loadedmetadata") || !captureHelper.includes("setInterval(onReady")) {
  fail("waitForVideoFrame must re-check after subscribe and poll for a decoded frame");
}

const intakeProvider = read("src/components/intake/IntakeProvider.tsx");
if (!intakeProvider.includes("data-intake-ready")) {
  fail("IntakeProvider must mark client hydration for the live probe");
}

const screenView = read("src/components/intake/ScreenIntakeView.tsx");
if (!screenView.includes("getDisplayMedia")) {
  fail("screen intake must use getDisplayMedia");
}
if (!screenView.includes("stopMediaTracks")) {
  fail("ScreenIntakeView must stop media tracks via stopMediaTracks");
}
if (!screenView.includes("enqueueAsyncWork") || !screenView.includes("waitForVideoFrame")) {
  fail("ScreenIntakeView must wait for a video frame and serialize captures");
}
if (!screenView.includes('data-testid="intake-capture-frame"')) {
  fail("ScreenIntakeView must expose intake-capture-frame for the live probe");
}
if (!screenView.includes("intake-share-phase") || !screenView.includes("requesting")) {
  fail("ScreenIntakeView must expose share phase so the probe can see getDisplayMedia start");
}

const probe = read("scripts/probe_screen_capture.mjs");
if (!probe.includes("data-intake-ready") || !probe.includes("Input.dispatchMouseEvent")) {
  fail("screen-capture probe must wait for hydration and dispatch a real mouse gesture");
}
if (!probe.includes("auto-select-desktop-capture-source")) {
  fail("screen-capture probe must still drive getDisplayMedia via Chromium auto-select");
}

const nextConfig = read("next.config.ts");
if (!nextConfig.includes("allowedDevOrigins") || !nextConfig.includes("127.0.0.1")) {
  fail("next.config.ts must allow 127.0.0.1 to load client chunks in the capture probe");
}

let stopCount = 0;
const liveTrack = {
  readyState: "live",
  stop() {
    stopCount += 1;
    this.readyState = "ended";
  },
};
const fakeStream = { getTracks: () => [liveTrack] };
if (allTracksStopped(fakeStream)) {
  fail("live tracks must not report as stopped");
}
stopMediaTracks(fakeStream);
if (stopCount !== 1 || !allTracksStopped(fakeStream)) {
  fail("stopMediaTracks must end every track");
}
if (isVideoFrameReady({ readyState: 0, videoWidth: 1920, videoHeight: 1080 })) {
  fail("video without current data must not be capturable");
}
if (isVideoFrameReady({ readyState: 2, videoWidth: 0, videoHeight: 0 })) {
  fail("zero-size video must not be capturable");
}
if (!isVideoFrameReady({ readyState: 2, videoWidth: 1280, videoHeight: 720 })) {
  fail("a decoded frame of sufficient size must be capturable");
}
if (screenFrameFileName(1) === screenFrameFileName(2)) {
  fail("rapid captures must not share a file name");
}
const order = [];
await enqueueAsyncWork(
  enqueueAsyncWork(Promise.resolve(), async () => {
    order.push(1);
  }),
  async () => {
    order.push(2);
  },
);
if (order.join(",") !== "1,2") {
  fail("capture queue must run clicks in order");
}

const summarize = read("src/lib/comprehensive-analysis/summarize.ts");
const demoProcess = read("src/lib/comprehensive-analysis/demo-process.ts");
if (summarize.includes("screen-capture") || demoProcess.includes("sponsorEntries")) {
  fail("comprehensive-analysis roll-up must not consume intake entries");
}

if (failures.length > 0) {
  for (const message of failures) {
    console.error(`FAIL ${message}`);
  }
  process.exit(1);
}

console.log("verify_intake: ok");
console.log(`  characterization-items hash : ${actualItemsHash.slice(0, 12)}…`);
console.log(`  unknown itemId discarded    : yes`);
console.log(`  omitted excluded from denom : ${completeness.denominator}`);
console.log(`  mock drafts stay draft      : yes`);
