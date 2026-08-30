const { chromium } = require("playwright");
const path = require("path");

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 1 });
  await page.goto("http://127.0.0.1:3000/modules/g0f-glycoform/results", { waitUntil: "networkidle" });
  await page.getByText("释放N-糖链HILIC-FLD 糖型定量结果").waitFor({ timeout: 20000 });
  await page.screenshot({ path: path.resolve("validation/glycan-hilic-fld/gly02-result-page.png"), fullPage: true });
  await browser.close();
})();
