const { chromium } = require("playwright");
const path = require("path");

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1250 }, deviceScaleFactor: 1 });
  await page.goto("http://127.0.0.1:3000/modules/high-molecular-weight-species/results", { waitUntil: "networkidle" });
  await page.getByText("SEC-HPLC 专业计算结果").waitFor({ timeout: 30000 });
  await page.screenshot({ path: path.resolve("validation/purity-chromatography-example/pur01-result-page.png"), fullPage: true });
  await browser.close();
})();
