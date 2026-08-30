import type { ProjectModule } from "@/lib/project";
import type { PTMAnalyteResult, PTMIntervalResult, PTMMapCalculationResult, PTMMapSiteRow } from "@/lib/types";

const EXTERNAL_WARNING = {
  code: "EXTERNAL_TABLE_INPUT",
  severity: "medium" as const,
  message: "本结果来自外部导出的定量表，未经本平台谱图级FDR重算；请确认来源与质控。",
};

const massShift = (moduleCode: string, analyte: PTMAnalyteResult) => {
  if (moduleCode === "PTM-01") return 15.9949;
  if (moduleCode === "PTM-02") return 0.9840;
  if (moduleCode === "PTM-03") return analyte.residue.toUpperCase() === "E" ? -18.0106 : -17.0265;
  return 128.0950;
};

function analyteMatches(moduleCode: string, analyte: PTMAnalyteResult) {
  const modification = analyte.modification.toLowerCase();
  if (moduleCode === "PTM-01") return modification.includes("oxidation");
  if (moduleCode === "PTM-02") return modification.includes("deamidation");
  if (moduleCode === "PTM-03") return /pyro|pglu|焦谷/.test(modification);
  return /c[- ]?terminal[- ]?lys|c端.*lys|terminal.*k/.test(modification);
}

function siteRow(moduleCode: string, analyte: PTMAnalyteResult, cohort: "reference" | "candidate", lotId: string, value: number | null): PTMMapSiteRow {
  const row: PTMMapSiteRow = {
    cohort,
    lotId,
    accession: analyte.proteinChain,
    residue: analyte.residue,
    position: analyte.position,
    modification: analyte.modification,
    relativeAbundancePercent: value ?? undefined,
    massShiftDa: massShift(moduleCode, analyte),
    hotspot: moduleCode === "PTM-01" && [252, 428].includes(analyte.position),
    isoAspStatus: moduleCode === "PTM-02" ? "外部表未提供正交isoAsp证据" : null,
  };
  if (moduleCode === "PTM-04" && value !== null) {
    row.retainedLysPeptidePercent = value;
    row.clippedLysPeptidePercent = Math.max(0, 100 - value);
    row.inferred0KPercent = Math.max(0, 100 - value);
    row.inferred1KPercent = value;
    row.inferred2KPercent = 0;
    row.distributionBasis = "外部C端Lys位点定量表；0K/1K/2K仅作展示映射，需正交质量证据确认";
  }
  return row;
}

export function adaptStructuredPtmMap(module: ProjectModule, interval: PTMIntervalResult): PTMMapCalculationResult {
  const exact = interval.analytes.filter((analyte) => analyteMatches(module.code, analyte));
  const lysFallback = module.code === "PTM-04" && exact.length === 0;
  const selected = lysFallback ? interval.analytes : exact;
  const siteRows = selected.flatMap((analyte) => [
    ...(analyte.referenceLots || []).map((lot) => siteRow(module.code, analyte, "reference", lot.lotId, lot.valuePercent)),
    ...analyte.candidateAssessments.map((lot) => siteRow(module.code, analyte, "candidate", lot.lotId, lot.valuePercent)),
  ]);
  const selectedIds = new Set(selected.map((analyte) => analyte.analyteId));
  const warnings: PTMMapCalculationResult["warnings"] = [
    EXTERNAL_WARNING,
    ...(lysFallback ? [{ code: "CTERM_LYS_ASSIGNMENT_REVIEW", severity: "medium" as const, message: "外部表中未识别到明确C-terminal-Lys命名，已保留整组结果并要求人工确认C端Lys归属。" }] : []),
    ...interval.integrityWarnings
      .filter((warning) => !warning.analyteId || selectedIds.has(warning.analyteId))
      .map((warning) => ({ code: warning.code, severity: warning.severity, message: warning.message })),
  ];
  const candidateMarks = selected.flatMap((analyte) => analyte.candidateAssessments.map((assessment) => ({
    analyteId: analyte.analyteId,
    lotId: assessment.lotId,
    valuePercent: assessment.valuePercent,
    intervalStatus: assessment.status,
    deviationFromBoundaryPercent: assessment.deviationFromBoundaryPercent,
  })));
  return {
    moduleCode: module.code as PTMMapCalculationResult["moduleCode"],
    status: "completed",
    professionalEngine: "外部专业结果表格通道（未经本平台谱图重算）",
    siteRows,
    comparison: {
      intervals: selected.map((analyte) => ({ analyteId: analyte.analyteId, ...analyte.referenceInterval })),
      candidateMarks,
      summary: {
        analyteCount: selected.length,
        rowCount: siteRows.length,
        outsideIntervalCount: candidateMarks.filter((row) => ["above_interval", "below_interval", "candidate_only_variant"].includes(String(row.intervalStatus))).length,
      },
      decision: null,
      disclaimer: interval.disclaimer,
    },
    qualityGate: { passed: true, acceptedPsmCount: null, quantifiedPeptideCount: siteRows.length, message: "外部结果表通道" },
    warnings,
    unidecEvidence: { status: "not-applicable", message: "表格通道未执行UniDec正交核对。", citation: "Marty et al. 2015" },
    isoAspEvidence: { status: module.code === "PTM-02" ? "not-provided" : "not-applicable" },
    openSearchSlot: { status: "not-run", engine: "Sage", phase: "optional-follow-up" },
    decision: null,
    disclaimer: interval.disclaimer,
  };
}
