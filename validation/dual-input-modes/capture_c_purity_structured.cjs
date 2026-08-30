const { chromium } = require("playwright");
const path = require("path");

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });
    await page.goto("http://127.0.0.1:3000/modules/high-molecular-weight-species");
    const inputs = page.locator('.module-input-summary input[type="file"]');
    await inputs.nth(0).setInputFiles(path.join(__dirname, "fixtures", "purity-candidate-peaks.csv"));
    await inputs.nth(1).setInputFiles(path.join(__dirname, "fixtures", "purity-reference-peaks.csv"));
    await page.getByRole("button", { name: "运行本专项" }).click();
    await page.locator(".analysis-status .status-chip.attention, .analysis-status .status-chip.completed").waitFor({ timeout: 60_000 });
    await page.getByRole("link", { name: "查看结果" }).click();
    await page.getByText("外部专业结果通道", { exact: true }).waitFor({ timeout: 20_000 });
    const rows = await page.locator(".purity-results tbody tr").count();
    if (rows !== 6) throw new Error(`PUR-01 expected 6 peak rows, got ${rows}`);
    const body = await page.locator(".purity-results").innerText();
    if (!body.includes("3.50%") || !body.includes("2.00%")) throw new Error("PUR-01 HMW values do not match source tables");
    if (!body.includes("未经本平台重新积分")) throw new Error("PUR-01 external table boundary missing");
    await page.screenshot({ path: path.join(__dirname, "screenshots", "PUR-01-peak-table.png"), fullPage: true });
    console.log("PUR-01 structured: peakRows=6; HMW reference=2.00%; candidate=3.50%; external-warning=present");
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
