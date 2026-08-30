const { chromium } = require("playwright");
const path = require("path");

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
    await page.goto("http://127.0.0.1:3000/modules/high-molecular-weight-species");
    const inputs = page.locator('.module-input-summary input[type="file"]');
    const bad = path.join(__dirname, "fixtures", "purity-bad-header.csv");
    await inputs.nth(0).setInputFiles(bad);
    await inputs.nth(1).setInputFiles(bad);
    await page.getByRole("button", { name: "运行本专项" }).click();
    await page.locator(".analysis-status .status-chip.failed").waitFor({ timeout: 60_000 });
    const body = await page.locator("body").innerText();
    if (!body.includes("输入表头无法识别")) throw new Error("Expected a clear unrecognized-header error in the page");
    await page.screenshot({ path: path.join(__dirname, "screenshots", "PUR-01-bad-header.png"), fullPage: true });
    console.log(body.match(/输入表头无法识别[^\n]*/)?.[0] || "clear unrecognized-header error present");
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
