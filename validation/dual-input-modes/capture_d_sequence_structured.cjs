const { chromium } = require("playwright");
const path = require("path");

const modules = [
  ["SEQ-01", "ms1-peptide-mass-coverage"],
  ["SEQ-02", "msms-sequence-coverage"],
];

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    for (const [code, moduleId] of modules) {
      const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });
      await page.goto(`http://127.0.0.1:3000/modules/${moduleId}`);
      await page.getByRole("button", { name: "肽段鉴定表 + FASTA" }).click();
      const inputs = page.locator('.module-input-summary input[type="file"]');
      await inputs.nth(0).setInputFiles(path.join(__dirname, "fixtures", "sequence-reference-peptides.csv"));
      await inputs.nth(1).setInputFiles(path.join(__dirname, "fixtures", "sequence-candidate-peptides.csv"));
      await inputs.nth(2).setInputFiles(path.join(__dirname, "fixtures", "sequence-antibody.fasta"));
      await page.getByRole("button", { name: "运行本专项" }).click();
      await page.locator(".analysis-status .status-chip.completed").waitFor({ timeout: 60_000 });
      await page.getByRole("link", { name: "查看结果" }).click();
      await page.getByText("外部专业结果通道", { exact: true }).waitFor({ timeout: 20_000 });
      const results = await page.locator(".sequence-results").innerText();
      for (const expected of ["37.50%", "66.67%", "52.94%", "外部肽段鉴定表"]) {
        if (!results.includes(expected)) throw new Error(`${code} missing ${expected}`);
      }
      if ((await page.locator(".sequence-results tbody tr").count()) !== 2) {
        throw new Error(`${code} expected 2 comparison rows`);
      }
      await page.screenshot({ path: path.join(__dirname, "screenshots", `${code}-peptide-table.png`), fullPage: true });
      console.log(`${code} structured: q<=0.01; HC 37.50%/66.67%; LC 52.94%/52.94%; external-warning=present`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
