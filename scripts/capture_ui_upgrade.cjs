const { chromium } = require("playwright");
const path = require("path");

const phase = process.argv[2] || "after";
const pages = [
  ["project", "http://127.0.0.1:3000/project"],
  ["report", "http://127.0.0.1:3000/project/report"],
  ["data", "http://127.0.0.1:3000/project/data"],
];

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  });
  for (const [name, url] of pages) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on("console", (message) => {
      if (message.type() === "error" && !message.text().includes("Failed to load resource")) errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400 && !response.url().endsWith("favicon.ico")) errors.push(`${response.status()} ${response.url()}`);
    });
    await page.goto(url, { waitUntil: "networkidle" });
    if (phase === "after" && name === "project") {
      await page.getByRole("button", { name: /一级结构/ }).click();
      await page.getByRole("button", { name: /糖基化/ }).click();
    }
    await page.screenshot({ path: path.resolve(`validation/ui-upgrade/${phase}-${name}.png`), fullPage: true });
    if (errors.length) throw new Error(`${name}: ${errors.join(" | ")}`);
    await page.close();
  }
  await browser.close();
})();
