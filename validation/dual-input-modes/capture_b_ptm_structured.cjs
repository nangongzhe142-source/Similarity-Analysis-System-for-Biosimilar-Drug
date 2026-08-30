const { chromium } = require("playwright");
const path = require("path");

const reference = path.join(__dirname, "fixtures", "ptm-reference-all.csv");
const candidate = path.join(__dirname, "fixtures", "ptm-candidate-all.csv");
const cases = [
  ["oxidation", "PTM-01", "Oxidation", 4],
  ["deamidation-isomerization", "PTM-02", "Deamidation", 4],
  ["n-terminal-pyroglutamate", "PTM-03", "pyroGlu", 4],
  ["heavy-chain-c-terminal-lys", "PTM-04", "12.000%", 4],
];

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    for (const [moduleId, code, expectedModification, expectedRows] of cases) {
      const context = await browser.newContext({ viewport: { width: 1600, height: 1100 } });
      const page = await context.newPage();
      await page.goto(`http://127.0.0.1:3000/modules/${moduleId}`);
      await page.getByRole("button", { name: "位点定量 CSV/TSV" }).click();
      const inputs = page.locator('.module-input-summary input[type="file"]');
      await inputs.nth(0).setInputFiles(candidate);
      await inputs.nth(1).setInputFiles(reference);
      await page.getByRole("button", { name: "运行本专项" }).click();
      await page.locator(".analysis-status .status-chip.attention").waitFor({ timeout: 30_000 });
      await page.getByRole("link", { name: "查看结果" }).click();
      await page.getByText("外部专业结果通道", { exact: true }).waitFor({ timeout: 30_000 });
      const rows = page.locator(".ptm-map-results tbody tr");
      const rowCount = await rows.count();
      if (rowCount !== expectedRows) throw new Error(`${code}: expected ${expectedRows} rows, got ${rowCount}`);
      const text = await page.locator(".ptm-map-results").innerText();
      if (!text.includes(expectedModification)) throw new Error(`${code}: missing ${expectedModification}`);
      if (!text.includes("未经本平台谱图级FDR重算")) throw new Error(`${code}: missing external evidence warning`);
      await page.screenshot({ path: path.join(__dirname, "screenshots", `${code}-structured.png`), fullPage: true });
      console.log(`${code}: rows=${rowCount}; filter=${expectedModification}; external-warning=present`);
      await context.close();
    }
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
