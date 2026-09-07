/**
 * Live probe: open the reviewer screen-intake page in Chrome/Edge, click
 * consent → start share → capture this frame ×3 → stop share.
 * Still uses getDisplayMedia; the picker is auto-accepted via Chromium flags.
 *
 * Requires a running app (default http://127.0.0.1:3000).
 * Not part of `npm run check` — needs a local browser.
 *
 * Usage: node scripts/probe_screen_capture.mjs
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const APP_ORIGIN = process.env.INTAKE_PROBE_ORIGIN ?? "http://localhost:3000";
const DEBUG_PORT = Number(process.env.INTAKE_PROBE_PORT ?? "9333");

function browserPath() {
  const named = process.env.INTAKE_PROBE_BROWSER;
  if (named && existsSync(named)) {
    return named;
  }
  const candidates = [
    join(process.env.PROGRAMFILES ?? "", "Google/Chrome/Application/chrome.exe"),
    join(process.env.LOCALAPPDATA ?? "", "Google/Chrome/Application/chrome.exe"),
    join(process.env["PROGRAMFILES(X86)"] ?? "", "Microsoft/Edge/Application/msedge.exe"),
    join(process.env.PROGRAMFILES ?? "", "Microsoft/Edge/Application/msedge.exe"),
  ];
  return candidates.find((path) => existsSync(path)) ?? null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForJson(url, timeoutMs) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // browser still starting
    }
    await sleep(200);
  }
  throw new Error(`CDP not ready at ${url}`);
}

function isAppPageUrl(pageUrl) {
  try {
    const parsed = new URL(pageUrl);
    const origin = `${parsed.protocol}//${parsed.host}`;
    const localhostOrigin = APP_ORIGIN.replace("127.0.0.1", "localhost");
    const loopbackOrigin = APP_ORIGIN.replace("localhost", "127.0.0.1");
    return origin === APP_ORIGIN || origin === localhostOrigin || origin === loopbackOrigin;
  } catch {
    return false;
  }
}

async function waitForPageTarget(timeoutMs) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const pages = await waitForJson(`http://127.0.0.1:${DEBUG_PORT}/json/list`, 5_000);
    const pageTarget = (Array.isArray(pages) ? pages : []).find(
      (entry) =>
        entry.type === "page" &&
        typeof entry.webSocketDebuggerUrl === "string" &&
        isAppPageUrl(String(entry.url ?? "")),
    );
    if (pageTarget) {
      return pageTarget;
    }
    await sleep(200);
  }
  throw new Error("no app page target from CDP /json/list");
}

function cdpClient(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  let nextId = 1;
  const pending = new Map();
  const ready = new Promise((resolve, reject) => {
    socket.addEventListener("open", () => resolve(), { once: true });
    socket.addEventListener("error", () => reject(new Error("CDP websocket error")), {
      once: true,
    });
  });
  socket.addEventListener("message", (event) => {
    const payload = JSON.parse(String(event.data));
    if (payload.id && pending.has(payload.id)) {
      const { resolve, reject } = pending.get(payload.id);
      pending.delete(payload.id);
      if (payload.error) {
        reject(new Error(payload.error.message ?? "CDP error"));
      } else {
        resolve(payload.result);
      }
    }
  });
  return {
    async send(method, params = {}) {
      await ready;
      const id = nextId;
      nextId += 1;
      const result = new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
      });
      socket.send(JSON.stringify({ id, method, params }));
      return result;
    },
    close() {
      socket.close();
    },
  };
}

async function evaluate(client, expression, userGesture = false) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture,
  });
  if (result.exceptionDetails) {
    const details = result.exceptionDetails;
    const description =
      details.exception?.description ?? details.text ?? "page evaluate failed";
    throw new Error(description);
  }
  return result.result?.value;
}

async function waitFor(client, expression, timeoutMs, label) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const value = await evaluate(client, expression);
    if (value) {
      return value;
    }
    await sleep(250);
  }
  throw new Error(`timeout waiting for ${label}`);
}

async function domClick(client, selector) {
  const clicked = await evaluate(
    client,
    `(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element) return false;
      element.click();
      return true;
    })()`,
    true,
  );
  if (!clicked) {
    throw new Error(`no node for ${selector}`);
  }
}

async function clickSelector(client, selector, options = {}) {
  await waitFor(
    client,
    `Boolean(document.querySelector(${JSON.stringify(selector)}))`,
    8_000,
    selector,
  );
  await evaluate(
    client,
    `void document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({ block: "center", inline: "center" })`,
  );
  await sleep(120);
  const box = await evaluate(
    client,
    `(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return null;
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`,
  );
  if (!box) {
    throw new Error(`no clickable box for ${selector}`);
  }
  try {
    await client.send("Page.bringToFront");
  } catch {
    // page domain may already be focused
  }
  await client.send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: box.x,
    y: box.y,
  });
  await client.send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: box.x,
    y: box.y,
    button: "left",
    buttons: 1,
    clickCount: 1,
  });
  await client.send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: box.x,
    y: box.y,
    button: "left",
    clickCount: 1,
  });
  if (options.domFallback === false) {
    return;
  }
  await evaluate(
    client,
    `document.querySelector(${JSON.stringify(selector)})?.click()`,
    true,
  );
}

async function ensureCheckboxChecked(client, selector) {
  await clickSelector(client, selector, { domFallback: false });
  const checked = await evaluate(
    client,
    `Boolean(document.querySelector(${JSON.stringify(selector)})?.checked)`,
  );
  if (checked) {
    return;
  }
  await evaluate(
    client,
    `document.querySelector(${JSON.stringify(selector)})?.click()`,
    true,
  );
}

const chromePath = browserPath();
if (!chromePath) {
  console.error("probe_screen_capture: no Chrome/Edge executable found");
  process.exit(2);
}

try {
  const health = await fetch(`${APP_ORIGIN}/project`, { cache: "no-store" });
  if (!health.ok) {
    throw new Error(`${APP_ORIGIN}/project returned ${health.status}`);
  }
} catch (error) {
  console.error(`probe_screen_capture: app not reachable at ${APP_ORIGIN}`);
  console.error(error instanceof Error ? error.message : error);
  process.exit(2);
}

const profileDir = mkdtempSync(join(tmpdir(), "intake-probe-"));
const child = spawn(
  chromePath,
  [
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-sync",
    "--disable-infobars",
    "--disable-session-crashed-bubble",
    "--hide-crash-restore-bubble",
    "--noerrdialogs",
    "--start-maximized",
    "--lang=en-US",
    "--remote-allow-origins=*",
    "--auto-select-desktop-capture-source=screen",
    "--use-fake-ui-for-media-stream",
    "--enable-usermedia-screen-capturing",
    "--allow-http-screen-capture",
    `--unsafely-treat-insecure-origin-as-secure=${APP_ORIGIN}`,
    "--disable-features=LocalNetworkAccessChecks",
    `${APP_ORIGIN}/project`,
  ],
  { stdio: "ignore" },
);

let client;
try {
  const pageTarget = await waitForPageTarget(20_000);
  console.log("probe_screen_capture: page", pageTarget.url);
  client = cdpClient(pageTarget.webSocketDebuggerUrl);
  await client.send("Runtime.enable");
  await client.send("Page.enable");
  try {
    await client.send("Browser.grantPermissions", {
      origin: APP_ORIGIN,
      permissions: ["displayCapture", "videoCapture"],
    });
  } catch {
    // older Chromium builds omit displayCapture
  }
  await waitFor(client, `document.readyState === "complete"`, 20_000, "document complete");
  await waitFor(
    client,
    `document.documentElement.getAttribute("data-intake-ready") === "1"`,
    20_000,
    "client hydration (data-intake-ready)",
  );
  await clickSelector(client, '[data-testid="intake-role-reviewer"]');
  await waitFor(
    client,
    `document.documentElement.getAttribute("data-intake-role") === "reviewer"`,
    10_000,
    "reviewer role after click",
  );
  await waitFor(
    client,
    `Boolean(document.querySelector('[data-testid="intake-open-screen"]'))`,
    10_000,
    "screen intake card",
  );
  await clickSelector(client, '[data-testid="intake-open-screen"]');
  console.log("probe_screen_capture: opened screen intake");
  await waitFor(
    client,
    `location.pathname.indexOf("/project/intake/screen") !== -1 && document.documentElement.getAttribute("data-intake-ready") === "1"`,
    20_000,
    "screen intake route",
  );
  await waitFor(
    client,
    `Boolean(document.querySelector('[data-testid="intake-consent"]'))`,
    20_000,
    "consent checkbox",
  );
  await ensureCheckboxChecked(client, '[data-testid="intake-consent"]');
  await waitFor(
    client,
    `(() => {
      const button = document.querySelector('[data-testid="intake-start-share"]');
      return Boolean(button && !button.disabled);
    })()`,
    8_000,
    "start share enabled",
  );
  await clickSelector(client, '[data-testid="intake-start-share"]', { domFallback: false });
  await sleep(400);
  const phaseAfterMouse = await evaluate(
    client,
    `document.querySelector('[data-testid="intake-share-phase"]')?.getAttribute("data-phase") ?? "idle"`,
  );
  if (phaseAfterMouse === "idle") {
    await evaluate(
      client,
      `document.querySelector('[data-testid="intake-start-share"]')?.click()`,
      true,
    );
  }
  await waitFor(
    client,
    `(() => {
      const phase = document.querySelector('[data-testid="intake-share-phase"]')?.getAttribute("data-phase");
      return phase === "requesting" || phase === "waiting" || phase === "ready" || phase === "failed";
    })()`,
    8_000,
    "getDisplayMedia invoked (share phase left idle)",
  );
  await waitFor(
    client,
    `(() => {
      const button = document.querySelector('[data-testid="intake-capture-frame"]');
      return Boolean(button && !button.disabled);
    })()`,
    25_000,
    "capture button enabled (first video frame)",
  );
  await domClick(client, '[data-testid="intake-capture-frame"]');
  await domClick(client, '[data-testid="intake-capture-frame"]');
  await domClick(client, '[data-testid="intake-capture-frame"]');
  const count = await waitFor(
    client,
    `document.querySelectorAll('[data-testid="intake-gallery-frame"]').length === 3 ? 3 : 0`,
    15_000,
    "three gallery frames",
  );
  await domClick(client, '[data-testid="intake-stop-share"]');
  const stopped = await waitFor(
    client,
    `(() => {
      const video = document.querySelector('[data-testid="intake-share-video"]');
      const stream = video && video.srcObject;
      if (!stream) return true;
      return Array.from(stream.getTracks()).every((track) => track.readyState === "ended");
    })()`,
    8_000,
    "media tracks ended",
  );
  if (count !== 3 || stopped !== true) {
    throw new Error(`unexpected result count=${count} stopped=${stopped}`);
  }
  console.log("probe_screen_capture: ok");
  console.log("  gallery frames : 3");
  console.log("  tracks stopped : yes");
} catch (error) {
  console.error("probe_screen_capture: FAIL");
  console.error(error instanceof Error ? error.message : error);
  if (client) {
    try {
      const snapshot = await evaluate(
        client,
        `({
          text: document.body ? document.body.innerText.slice(0, 1200) : "",
          ready: document.documentElement.getAttribute("data-intake-ready"),
          role: document.documentElement.getAttribute("data-intake-role"),
          path: location.pathname,
          consent: document.querySelector('[data-testid="intake-consent"]')?.checked ?? null,
          sharePhase: document.querySelector('[data-testid="intake-share-phase"]')?.getAttribute("data-phase"),
          shareDisabled: document.querySelector('[data-testid="intake-start-share"]')?.disabled ?? null,
          captureDisabled: document.querySelector('[data-testid="intake-capture-frame"]')?.disabled ?? null,
          gallery: document.querySelectorAll('[data-testid="intake-gallery-frame"]').length,
        })`,
      );
      console.error("page snapshot:", snapshot);
    } catch {
      // ignore snapshot errors
    }
  }
  process.exitCode = 1;
} finally {
  client?.close();
  child.kill();
  await sleep(500);
  try {
    rmSync(profileDir, { recursive: true, force: true });
  } catch {
    // profile dir may still be locked by the browser
  }
}
