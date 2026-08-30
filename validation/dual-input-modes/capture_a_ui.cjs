const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const fixture = fs.readFileSync(path.join(__dirname, "fixtures", "reference-intact.mzML"));
const fasta = Buffer.from(">HC\nEVQLVESGGGLVQPGGSLRLSCAASGFTFSSYAMSWVRQAPGKGLEWVSAISGSGGSTYYADSVKGRFTISRDNSKNTLYLQMNSLRAEDTAVYYCAR\n");
const upload = (name, buffer, mimeType) => ({ name, buffer, mimeType });
const warning =
  "检测到未配对 FASTA 的 mzML";

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const cases = [
    ["mass-mzml-without-fasta", [upload("R01.mzML", fixture, "application/octet-stream"), upload("C01.mzML", fixture, "application/octet-stream")], true],
    [
      "mass-mzml-with-fasta",
      [upload("R01.mzML", fixture, "application/octet-stream"), upload("C01.mzML", fixture, "application/octet-stream"), upload("antibody.fasta", fasta, "text/plain")],
      false,
    ],
  ];
  for (const [name, files, expectWarning] of cases) {
    const context = await browser.newContext({ viewport: { width: 1600, height: 1100 } });
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:3000/project");
    await page.locator('input[type="file"]').setInputFiles(files);
    await page.waitForTimeout(8_000);
    const bodyText = await page.locator("body").innerText();
    if (expectWarning) {
      if (!bodyText.includes(warning)) throw new Error(`Expected warning was absent. Relevant text: ${bodyText.match(/已识别[^\n]*/g) || "none"}`);
    } else {
      if (await page.locator(".mass-mzml-notice").count()) {
        throw new Error("FASTA present but the mass mzML warning remained visible");
      }
    }
    await page.screenshot({
      path: path.join(__dirname, "screenshots", `${name}.png`),
      fullPage: true,
    });
    console.log(`${name}: ${expectWarning ? "warning-present" : "warning-absent"}`);
    await context.close();
  }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
