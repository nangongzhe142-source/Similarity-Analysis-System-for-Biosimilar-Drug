import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";
import fs from "node:fs/promises";
import path from "node:path";

const outputPath = process.argv[2];
if (!outputPath) throw new Error("Missing output path");

const wb = Workbook.create();

const massModules = [
  { name: "完整分子量", referenceMass: 148056.7, candidateMass: 148057.2, chargeMin: 35, chargeMax: 55 },
  { name: "脱糖完整分子量", referenceMass: 145166.0, candidateMass: 145166.5, chargeMin: 35, chargeMax: 55 },
  { name: "轻链分子量", referenceMass: 23440.2, candidateMass: 23440.5, chargeMin: 10, chargeMax: 25 },
  { name: "重链分子量", referenceMass: 51000.4, candidateMass: 51001.0, chargeMin: 20, chargeMax: 40 },
  { name: "DeglyHeavy", referenceMass: 48800.1, candidateMass: 48800.7, chargeMin: 20, chargeMax: 40 },
];

function massSpectrum(mass, chargeMin, chargeMax, roleShift) {
  const proton = 1.007276;
  const points = [];
  const center = (chargeMin + chargeMax) / 2;
  for (let z = chargeMin; z <= chargeMax; z += 1) {
    const mz0 = (mass + z * proton) / z;
    const envelope = Math.exp(-0.5 * Math.pow((z - center) / 5.2, 2));
    for (let k = -8; k <= 8; k += 1) {
      const offset = k * 0.035;
      const peak = Math.exp(-0.5 * Math.pow(offset / 0.075, 2));
      const deterministicNoise = 18 + 8 * Math.sin((z * 17 + k * 11 + roleShift) * 0.37);
      const intensity = 120 + 94000 * envelope * peak * (1 + roleShift * 0.008) + deterministicNoise;
      points.push([Number((mz0 + offset).toFixed(5)), Number(intensity.toFixed(2))]);
    }
  }
  points.sort((a, b) => a[0] - b[0]);
  return [["m/z", "intensity"], ...points];
}

function styleMassSheet(sheet, rowCount) {
  sheet.getRange("A1:B1").format = {
    fill: "#0F766E",
    font: { bold: true, color: "#FFFFFF" },
    horizontalAlignment: "center",
  };
  sheet.getRange(`A2:A${rowCount}`).format.numberFormat = "0.00000";
  sheet.getRange(`B2:B${rowCount}`).format.numberFormat = "0.00";
  sheet.getRange(`A1:B${rowCount}`).format.borders = {
    bottom: { style: "continuous", color: "#D7E5E3" },
  };
  sheet.getRange("A:A").format.columnWidth = 17;
  sheet.getRange("B:B").format.columnWidth = 18;
  sheet.freezePanes.freezeRows(1);
}

for (const module of massModules) {
  for (const [role, mass, roleShift] of [["参照药", module.referenceMass, 0], ["候选药", module.candidateMass, 1]]) {
    const sheet = wb.worksheets.add(`${module.name}_${role}`);
    const values = massSpectrum(mass, module.chargeMin, module.chargeMax, roleShift);
    sheet.getRange(`A1:B${values.length}`).values = values;
    styleMassSheet(sheet, values.length);
  }
}

const ptmAnalytes = [
  { chain: "HC", residue: "M", position: 252, modification: "Oxidation", risk: "high", ref: [1.10, 1.22, 1.31, 1.42, 1.50], cand: [1.30, 1.38] },
  { chain: "HC", residue: "N", position: 387, modification: "Deamidation", risk: "high", ref: [2.00, 2.12, 2.22, 2.38, 2.50], cand: [3.10, 3.18] },
  { chain: "HC", residue: "N", position: 392, modification: "Deamidation", risk: "medium", ref: [0.70, 0.78, 0.84, 0.91, 1.00], cand: [0.82, 0.89] },
  { chain: "HC", residue: "K", position: 447, modification: "C-terminal lysine", risk: "medium", ref: [3.00, 3.18, 3.42, 3.70, 4.00], cand: [3.45, 3.62] },
  { chain: "LC", residue: "N", position: 30, modification: "Deamidation", risk: "low", ref: [0.40, 0.46, 0.52, 0.60, 0.70], cand: [0.54, 0.59] },
  { chain: "HC", residue: "Q", position: 1, modification: "Pyro-glu", risk: "medium", ref: [96.0, 96.4, 96.9, 97.4, 98.0], cand: [97.0, 97.3] },
];

const ptmHeaders = [["lot_id", "protein_chain", "residue", "position", "modification", "value_percent", "replicate_id", "risk_level"]];
const refRows = [];
for (const analyte of ptmAnalytes) {
  analyte.ref.forEach((base, lotIndex) => {
    [1, 2].forEach((rep) => {
      const adjustment = rep === 1 ? -0.015 : 0.015;
      refRows.push([`R${String(lotIndex + 1).padStart(2, "0")}`, analyte.chain, analyte.residue, analyte.position, analyte.modification, Number((base + adjustment).toFixed(3)), `REP${rep}`, analyte.risk]);
    });
  });
}

const candidateRows = [];
for (const analyte of ptmAnalytes) {
  analyte.cand.forEach((base, lotIndex) => {
    [1, 2].forEach((rep) => {
      const adjustment = rep === 1 ? -0.012 : 0.012;
      candidateRows.push([`C${String(lotIndex + 1).padStart(2, "0")}`, analyte.chain, analyte.residue, analyte.position, analyte.modification, Number((base + adjustment).toFixed(3)), `REP${rep}`, analyte.risk]);
    });
  });
}
for (const [lotId, base] of [["C01", 0.30], ["C02", 0.35]]) {
  [1, 2].forEach((rep) => {
    const adjustment = rep === 1 ? -0.01 : 0.01;
    candidateRows.push([lotId, "HC", "W", 420, "Oxidation", Number((base + adjustment).toFixed(3)), `REP${rep}`, "high"]);
  });
}

function addPtmSheet(name, rows) {
  const sheet = wb.worksheets.add(name);
  const values = [...ptmHeaders, ...rows];
  sheet.getRange(`A1:H${values.length}`).values = values;
  sheet.getRange("A1:H1").format = {
    fill: "#0F766E",
    font: { bold: true, color: "#FFFFFF" },
    horizontalAlignment: "center",
    wrapText: true,
  };
  sheet.getRange(`D2:D${values.length}`).format.numberFormat = "0";
  sheet.getRange(`F2:F${values.length}`).format.numberFormat = "0.000";
  const widths = [12, 15, 10, 10, 23, 16, 14, 13];
  widths.forEach((width, i) => sheet.getRange(`${String.fromCharCode(65 + i)}:${String.fromCharCode(65 + i)}`).format.columnWidth = width);
  sheet.getRange(`A1:H${values.length}`).format.borders = { bottom: { style: "continuous", color: "#D7E5E3" } };
  sheet.freezePanes.freezeRows(1);
}

addPtmSheet("PTM位点定量_参照药", refRows);
addPtmSheet("PTM位点定量_候选药", candidateRows);

await fs.mkdir(path.dirname(outputPath), { recursive: true });
const out = await SpreadsheetFile.exportXlsx(wb);
await out.save(outputPath);

for (const sheet of wb.worksheets.items) {
  const isPtm = sheet.name.startsWith("PTM");
  const renderRange = isPtm ? "A1:H20" : "A1:B20";
  const image = await wb.render({ sheetName: sheet.name, range: renderRange, scale: 1.25 });
  const safeName = sheet.name.replace(/[\\/:*?"<>|]/g, "_");
  const renderDir = path.join(path.dirname(outputPath), "renders");
  await fs.mkdir(renderDir, { recursive: true });
  const imageBytes = new Uint8Array(await image.arrayBuffer());
  await fs.writeFile(path.join(renderDir, `${safeName}.png`), imageBytes);
}

const check = wb.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 100 } });
console.log(JSON.stringify({ outputPath, sheets: wb.worksheets.items.map(s => s.name), formulaErrors: check.matches?.length ?? 0, referenceRows: refRows.length, candidateRows: candidateRows.length }, null, 2));
