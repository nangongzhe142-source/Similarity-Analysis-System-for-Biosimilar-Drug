const { chromium } = require("playwright");
const path = require("path");

const base = "C:/Users/MI/Desktop/BioCompare_后六项_数据束/";
const requested = process.argv[2] || "SEQ-02";
const target = requested === "SEQ-01"
  ? { code: "SEQ-01", moduleId: "ms1-peptide-mass-coverage" }
  : { code: "SEQ-02", moduleId: "msms-sequence-coverage" };
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });
    await page.goto(`http://127.0.0.1:3000/modules/${target.moduleId}`);
    const inputs = page.locator('.module-input-summary.sequence-inputs input[type="file"]');
    await inputs.nth(0).setInputFiles([base + "R01.mzML", base + "R02.mzML", base + "R03.mzML"]);
    await inputs.nth(1).setInputFiles(base + "C01.mzML");
    await inputs.nth(2).setInputFiles(base + "antibody.fasta");
    await page.getByRole("button", { name: "运行本专项" }).click();
    await page.locator(".analysis-status .status-chip.completed, .analysis-status .status-chip.attention, .analysis-status .status-chip.failed").waitFor({ timeout: 300_000 });
    const state = await page.locator(".analysis-status .status-chip").innerText();
    await page.screenshot({ path: path.join(__dirname, "screenshots", `${target.code}-raw-regression.png`), fullPage: true });
    console.log(`${target.code} raw regression terminal-state=${state}`);
    if (state === "失败") {
      const body = await page.locator("body").innerText();
      console.log(body.match(/专项计算失败[^\n]*/)?.[0] || "raw failure captured in UI");
    }
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
