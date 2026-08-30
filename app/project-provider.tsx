"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { projectModules, type DispatchMode, type ModuleFiles, type ModuleRun, type ProjectModule } from "@/lib/project";
import type { AnalysisJob, AnalysisResult, CalculationJob, CovalentCalculationResult, ExternalEngineStatus, GlycanCalculationResult, PTMIntervalResult, PTMMapCalculationResult, PurityChromatographyResult, SequenceCalculationResult, SubmissionImportResult } from "@/lib/types";
import { adaptStructuredPtmMap } from "@/lib/ptm-map-structured";

type EngineStatus = { online: boolean; engines: ExternalEngineStatus[]; ptm: { available: boolean; version?: string } } | null;
type ProjectRules = { toleranceDa: number; intervalMethod: string; minReferenceLots: number };
export type PTMInputMode = "structured" | "openms-sage";
export type PTMMapInputMode = "raw" | "structured";
export type SequenceInputMode = "raw" | "structured";
export type PTMRawFiles = { referenceMzml: File[]; candidateMzml: File[]; fasta: File | null };
export type SequenceFiles = { referenceMzml: File[]; candidateMzml: File[]; fasta: File | null };
type ProjectContextValue = {
  runs: Record<string, ModuleRun>;
  files: Record<string, ModuleFiles>;
  rules: ProjectRules;
  dispatchMode: DispatchMode;
  batchRunning: boolean;
  importingMaterials: boolean;
  exportingReport: boolean;
  projectStarted: boolean;
  engineStatus: EngineStatus;
  error: string;
  errorDetail: string;
  completedCount: number;
  submissionImport: SubmissionImportResult | null;
  ptmInputMode: PTMInputMode;
  ptmMapInputMode: Record<string, PTMMapInputMode>;
  sequenceInputMode: Record<string, SequenceInputMode>;
  ptmRawFiles: PTMRawFiles;
  sequenceFiles: Record<string, SequenceFiles>;
  unpairedMassMzmlFiles: { reference: File[]; candidate: File[]; unresolved: File[] };
  sequenceCdrJson: string;
  purityPeakWindowsJson: string;
  calculationHistory: CalculationJob[];
  updateFile: (moduleId: string, role: keyof ModuleFiles, file: File | null) => void;
  setPtmInputMode: (mode: PTMInputMode) => void;
  setPtmMapInputMode: (moduleId: string, mode: PTMMapInputMode) => void;
  setSequenceInputMode: (moduleId: string, mode: SequenceInputMode) => void;
  updatePtmRawFiles: (patch: Partial<PTMRawFiles>) => void;
  updateSequenceFiles: (moduleId: string, patch: Partial<SequenceFiles>) => void;
  setSequenceCdrJson: (value: string) => void;
  setPurityPeakWindowsJson: (value: string) => void;
  refreshCalculationHistory: () => Promise<void>;
  updateRules: (rules: Partial<ProjectRules>) => void;
  setDispatchMode: (mode: DispatchMode) => void;
  runModule: (moduleId: string, source?: "batch" | "single") => Promise<void>;
  importProjectMaterials: (materials: File[]) => Promise<SubmissionImportResult>;
  runAll: (configuredOnly?: boolean) => Promise<void>;
  exportReport: () => Promise<void>;
  clearError: () => void;
};

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
const ProjectContext = createContext<ProjectContextValue | null>(null);
const initialRuns = Object.fromEntries(projectModules.map((module) => [module.id, { status: "not-started", message: "等待运行", progress: 0 } satisfies ModuleRun]));
const initialFiles = Object.fromEntries(projectModules.map((module) => [module.id, { candidate: null, reference: null }]));
const initialSequenceFiles = Object.fromEntries(projectModules.filter((module) => module.kind === "sequence" || module.kind === "ptm-map" || module.kind === "covalent").map((module) => [module.id, { referenceMzml: [], candidateMzml: [], fasta: null } satisfies SequenceFiles]));
const initialPtmMapInputMode = Object.fromEntries(projectModules.filter((module) => module.kind === "ptm-map").map((module) => [module.id, "raw" as PTMMapInputMode]));
const initialSequenceInputMode = Object.fromEntries(projectModules.filter((module) => module.code === "SEQ-01" || module.code === "SEQ-02").map((module) => [module.id, "raw" as SequenceInputMode]));
const hasModuleResult = (run: ModuleRun) => Boolean(run.result || run.ptmResult || run.sequenceResult || run.ptmMapResult || run.glycanResult || run.chromatographyResult || run.covalentResult);
type ErrorPayload = { error?: string; errorSummary?: string; message?: string; detail?: string };
type ReviewError = Error & { summary?: string; detail?: string };

function createReviewError(payload: ErrorPayload, fallbackSummary: string): ReviewError {
  const detail = payload.error || payload.detail || payload.message || fallbackSummary;
  const error = new Error(detail) as ReviewError;
  error.summary = payload.errorSummary || fallbackSummary;
  error.detail = detail;
  return error;
}

function describeError(reason: unknown, fallbackSummary: string) {
  if (!(reason instanceof Error)) return { summary: fallbackSummary, detail: String(reason || fallbackSummary) };
  const reviewError = reason as ReviewError;
  return { summary: reviewError.summary || reason.message || fallbackSummary, detail: reviewError.detail || reason.message || fallbackSummary };
}

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [runs, setRuns] = useState<Record<string, ModuleRun>>(initialRuns);
  const [files, setFiles] = useState<Record<string, ModuleFiles>>(initialFiles);
  const [rules, setRules] = useState<ProjectRules>({ toleranceDa: 2, intervalMethod: "observed-range", minReferenceLots: 3 });
  const [dispatchMode, setDispatchMode] = useState<DispatchMode>("parallel");
  const [batchRunning, setBatchRunning] = useState(false);
  const [importingMaterials, setImportingMaterials] = useState(false);
  const [exportingReport, setExportingReport] = useState(false);
  const [projectStarted, setProjectStarted] = useState(false);
  const [submissionImport, setSubmissionImport] = useState<SubmissionImportResult | null>(null);
  const [ptmInputMode, setPtmInputMode] = useState<PTMInputMode>("structured");
  const [ptmMapInputMode, setPtmMapInputModeState] = useState<Record<string, PTMMapInputMode>>(initialPtmMapInputMode);
  const [sequenceInputMode, setSequenceInputModeState] = useState<Record<string, SequenceInputMode>>(initialSequenceInputMode);
  const [ptmRawFiles, setPtmRawFiles] = useState<PTMRawFiles>({ referenceMzml: [], candidateMzml: [], fasta: null });
  const [sequenceFiles, setSequenceFiles] = useState<Record<string, SequenceFiles>>(initialSequenceFiles);
  const [unpairedMassMzmlFiles, setUnpairedMassMzmlFiles] = useState<{ reference: File[]; candidate: File[]; unresolved: File[] }>({ reference: [], candidate: [], unresolved: [] });
  const [sequenceCdrJson, setSequenceCdrJson] = useState("[]");
  const [purityPeakWindowsJson, setPurityPeakWindowsJson] = useState('{"HMW":[0,8.8],"MAIN":[8.8,11.2],"LMW":[11.2,30]}');
  const [calculationHistory, setCalculationHistory] = useState<CalculationJob[]>([]);
  const [engineStatus, setEngineStatus] = useState<EngineStatus>(null);
  const [error, setError] = useState("");
  const [errorDetail, setErrorDetail] = useState("");

  const clearError = useCallback(() => { setError(""); setErrorDetail(""); }, []);
  const reportError = useCallback((reason: unknown, fallbackSummary: string) => {
    const described = describeError(reason, fallbackSummary);
    setError(described.summary); setErrorDetail(described.detail);
    return described;
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/health`).then((response) => response.json()).then((health) => setEngineStatus({
      online: health.status === "online",
      engines: health.externalEngines || [],
      ptm: health.ptmIntervalEngine || { available: false },
    })).catch(() => setEngineStatus(null));
  }, []);

  const updateRun = useCallback((moduleId: string, patch: Partial<ModuleRun>) => {
    setRuns((current) => ({ ...current, [moduleId]: { ...current[moduleId], ...patch } }));
  }, []);

  const refreshCalculationHistory = useCallback(async () => {
    const response = await fetch(`${backendUrl}/api/jobs?projectId=biocompare&limit=50`, { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json() as { jobs: CalculationJob[] };
    setCalculationHistory(payload.jobs);
  }, []);

  useEffect(() => { void refreshCalculationHistory(); }, [refreshCalculationHistory]);

  const runMass = useCallback(async (module: ProjectModule, source: "batch" | "single") => {
    const input = files[module.id];
    if (!input.candidate || !input.reference) {
      throw new Error(`${module.name}必须上传候选药和参照药谱图；正式任务不使用内部模拟算法替代专业引擎`);
    }
    const form = new FormData();
    form.append("candidate", input.candidate); form.append("reference", input.reference); form.append("methodKey", module.id);
    form.append("engineKey", "auto"); form.append("toleranceDa", String(rules.toleranceDa)); form.append("massLower", "10000"); form.append("massUpper", "250000");
    const createdResponse = await fetch(`${backendUrl}/jobs`, { method: "POST", body: form });
    const created = await createdResponse.json() as AnalysisJob;
    if (!createdResponse.ok) throw new Error((created as AnalysisJob & { detail?: string }).detail || "任务创建失败");
    let job = created;
    while (job.status === "queued" || job.status === "running") {
      updateRun(module.id, { status: job.status, progress: job.progress, message: job.message, source });
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      const response = await fetch(`${backendUrl}/jobs/${created.id}`, { cache: "no-store" }); job = await response.json();
    }
    if (job.status === "failed") throw createReviewError(job as ErrorPayload, "专业引擎执行失败；可展开查看原始日志，或稍后重试");
    const resultResponse = await fetch(`${backendUrl}/jobs/${created.id}/result`, { cache: "no-store" });
    const payload = await resultResponse.json();
    if (!resultResponse.ok) throw new Error(payload.detail || "结果读取失败");
    return payload.professionalResult as AnalysisResult;
  }, [files, rules.toleranceDa, updateRun]);

  const runPtm = useCallback(async (module: ProjectModule, source: "batch" | "single") => {
    if (ptmInputMode === "openms-sage") {
      if (ptmRawFiles.referenceMzml.length < rules.minReferenceLots || !ptmRawFiles.candidateMzml.length || !ptmRawFiles.fasta) {
        throw new Error(`OpenMS/Sage模式至少需要${rules.minReferenceLots}个参照药mzML、1个候选药mzML和1个FASTA`);
      }
      const form = new FormData();
      ptmRawFiles.referenceMzml.forEach((file) => form.append("referenceMzml", file));
      ptmRawFiles.candidateMzml.forEach((file) => form.append("candidateMzml", file));
      form.append("fasta", ptmRawFiles.fasta);
      form.append("intervalMethod", rules.intervalMethod); form.append("minReferenceLots", String(rules.minReferenceLots));
      form.append("qValueThreshold", "0.01"); form.append("precursorToleranceDa", "0.05"); form.append("fragmentToleranceDa", "0.3"); form.append("threads", "4");
      const createdResponse = await fetch(`${backendUrl}/ptm/openms-sage/jobs`, { method: "POST", body: form });
      const created = await createdResponse.json() as AnalysisJob & { detail?: string };
      if (!createdResponse.ok) throw new Error(created.detail || "OpenMS/Sage任务创建失败");
      let job: AnalysisJob = created;
      while (job.status === "queued" || job.status === "running") {
        updateRun(module.id, { status: job.status, progress: job.progress, message: job.message, source });
        await new Promise((resolve) => window.setTimeout(resolve, 900));
        const response = await fetch(`${backendUrl}/ptm/openms-sage/jobs/${created.id}`, { cache: "no-store" });
        job = await response.json();
      }
      if (job.status === "quality-blocked") throw createReviewError({ error: `OpenMS/Sage搜索完成，但质量闸门阻断：${job.error || "1% FDR后没有足够位点"}` }, "数据未通过质量闸门（FDR 过滤后证据不足）；建议补充更多批次或谱图数据");
      if (job.status === "failed") throw createReviewError(job as ErrorPayload, "专业引擎执行失败；可展开查看原始日志，或稍后重试");
      const resultResponse = await fetch(`${backendUrl}/ptm/openms-sage/jobs/${created.id}/result`, { cache: "no-store" });
      const result = await resultResponse.json();
      if (!resultResponse.ok) throw new Error(result.detail || "OpenMS/Sage结果读取失败");
      return result as PTMIntervalResult;
    }
    let candidate = files[module.id].candidate; let reference = files[module.id].reference;
    if (!candidate || !reference) {
      throw new Error("PTM专项必须上传由OpenMS/Sage、FragPipe等专业程序导出的候选药与多批参照药定量结果");
    }
    const form = new FormData(); form.append("candidate", candidate); form.append("reference", reference);
    form.append("upstreamEngine", "external-professional-result");
    form.append("intervalMethod", rules.intervalMethod); form.append("minReferenceLots", String(rules.minReferenceLots));
    const response = await fetch(`${backendUrl}/ptm/analyze`, { method: "POST", body: form }); const payload = await response.json();
    if (!response.ok) throw new Error(payload.detail || "PTM区间任务失败");
    return payload as PTMIntervalResult;
  }, [files, ptmInputMode, ptmRawFiles, rules.intervalMethod, rules.minReferenceLots, updateRun]);

  const runSequence = useCallback(async (module: ProjectModule, source: "batch" | "single") => {
    const input = sequenceFiles[module.id];
    if (!input?.referenceMzml.length || !input.candidateMzml.length || !input.fasta) {
      throw new Error(sequenceInputMode[module.id] === "structured" ? `${module.code}表格模式需要参照药与候选药肽段鉴定CSV/TSV及1个抗体FASTA` : `${module.code}需要至少1个参照药mzML、1个候选药mzML和1个抗体FASTA`);
    }
    let cdrRegions: unknown[] = [];
    if (module.code === "SEQ-03") {
      try { cdrRegions = JSON.parse(sequenceCdrJson) as unknown[]; } catch { throw new Error("CDR区间配置必须是合法JSON数组"); }
      if (!Array.isArray(cdrRegions) || !cdrRegions.length) throw new Error("SEQ-03必须配置至少一个CDR区间");
    }
    const form = new FormData();
    const manifest: Array<Record<string, string>> = [];
    input.referenceMzml.forEach((file, index) => { form.append("files", file); manifest.push({ role: "reference", lotId: `R${String(index + 1).padStart(2, "0")}` }); });
    input.candidateMzml.forEach((file, index) => { form.append("files", file); manifest.push({ role: "candidate", lotId: `C${String(index + 1).padStart(2, "0")}` }); });
    form.append("files", input.fasta); manifest.push({ role: "fasta" });
    form.append("projectId", "biocompare"); form.append("moduleCode", module.code);
    form.append("inputManifestJson", JSON.stringify(manifest));
    form.append("parametersJson", JSON.stringify({ qValueThreshold: 0.01, threads: 4, ms1PpmTolerance: 10, minXicScans: 2, cdrRegions }));
    const createdResponse = await fetch(`${backendUrl}/api/jobs`, { method: "POST", body: form });
    const created = await createdResponse.json() as CalculationJob & { detail?: string };
    if (!createdResponse.ok) throw new Error(created.detail || "序列任务创建失败");
    let job = created;
    while (["staging", "queued", "running"].includes(job.status)) {
      updateRun(module.id, { status: job.status === "running" ? "running" : "queued", progress: job.progress, message: job.message, source });
      await new Promise((resolve) => window.setTimeout(resolve, 900));
      const response = await fetch(`${backendUrl}/api/jobs/${created.id}`, { cache: "no-store" });
      job = await response.json() as CalculationJob;
    }
    if (["failed", "timed-out", "interrupted"].includes(job.status)) throw createReviewError(job as ErrorPayload, job.status === "timed-out" ? "计算超时；可减少同时运行的专项数后重试" : "专项计算失败，可展开查看原始日志");
    const resultResponse = await fetch(`${backendUrl}/api/jobs/${created.id}/result`, { cache: "no-store" });
    const result = await resultResponse.json() as SequenceCalculationResult & { detail?: string };
    if (!resultResponse.ok) throw new Error(result.detail || "序列结果读取失败");
    await refreshCalculationHistory();
    return result;
  }, [refreshCalculationHistory, sequenceCdrJson, sequenceFiles, sequenceInputMode, updateRun]);

  const runGlycan = useCallback(async (module: ProjectModule, source: "batch" | "single") => {
    const input = files[module.id];
    if (!input?.reference || !input.candidate) throw new Error(`${module.code}需要参照药与候选药色谱文件`);
    const form = new FormData();
    form.append("files", input.reference); form.append("files", input.candidate);
    form.append("projectId", "biocompare"); form.append("moduleCode", module.code);
    form.append("inputManifestJson", JSON.stringify([{ role: "reference", lotId: "R01" }, { role: "candidate", lotId: "C01" }]));
    form.append("parametersJson", JSON.stringify({
      intervalMethod: rules.intervalMethod, minReferenceLots: rules.minReferenceLots,
      approxPeakWidth: 0.8, prominence: 0.003, retentionTimeToleranceMinutes: 0.7,
      nonFucosylatedNoticePercent: 0.1, ngnaRiskThresholdPercent: 0.1,
    }));
    const createdResponse = await fetch(`${backendUrl}/api/jobs`, { method: "POST", body: form });
    const created = await createdResponse.json() as CalculationJob & { detail?: string };
    if (!createdResponse.ok) throw new Error(created.detail || "糖型任务创建失败");
    let job = created;
    while (["staging", "queued", "running"].includes(job.status)) {
      updateRun(module.id, { status: job.status === "running" ? "running" : "queued", progress: job.progress, message: job.message, source });
      await new Promise((resolve) => window.setTimeout(resolve, 800));
      const response = await fetch(`${backendUrl}/api/jobs/${created.id}`, { cache: "no-store" });
      job = await response.json() as CalculationJob;
    }
    if (["failed", "timed-out", "interrupted"].includes(job.status)) throw createReviewError(job as ErrorPayload, job.status === "timed-out" ? "计算超时；可减少同时运行的专项数后重试" : "专项计算失败，可展开查看原始日志");
    const resultResponse = await fetch(`${backendUrl}/api/jobs/${created.id}/result`, { cache: "no-store" });
    const result = await resultResponse.json() as GlycanCalculationResult & { detail?: string };
    if (!resultResponse.ok) throw new Error(result.detail || "糖型结果读取失败");
    await refreshCalculationHistory();
    return result;
  }, [files, refreshCalculationHistory, rules.intervalMethod, rules.minReferenceLots, updateRun]);

  const runChromatography = useCallback(async (module: ProjectModule, source: "batch" | "single") => {
    const input = files[module.id];
    if (!input?.reference || !input.candidate) throw new Error(`${module.code}需要参照药与候选药色谱/电泳数据文件`);
    let peakWindows: Record<string, [number, number]>;
    try { peakWindows = JSON.parse(purityPeakWindowsJson) as Record<string, [number, number]>; }
    catch { throw new Error("峰分组窗口必须是合法JSON对象"); }
    const form = new FormData();
    form.append("files", input.reference); form.append("files", input.candidate);
    form.append("projectId", "biocompare"); form.append("moduleCode", module.code);
    form.append("inputManifestJson", JSON.stringify([{ role: "reference", lotId: "R01" }, { role: "candidate", lotId: "C01" }]));
    form.append("parametersJson", JSON.stringify({ intervalMethod: rules.intervalMethod, minReferenceLots: rules.minReferenceLots, approxPeakWidth: 0.8, prominence: 0.003, peakWindows, loqPercent: 0.1, peakMatchTolerance: 0.2, mainPeakHalfWindow: 0.35 }));
    const createdResponse = await fetch(`${backendUrl}/api/jobs`, { method: "POST", body: form });
    const created = await createdResponse.json() as CalculationJob & { detail?: string };
    if (!createdResponse.ok) throw new Error(created.detail || "纯度/尺寸异质性任务创建失败");
    let job = created;
    while (["staging", "queued", "running"].includes(job.status)) {
      updateRun(module.id, { status: job.status === "running" ? "running" : "queued", progress: job.progress, message: job.message, source });
      await new Promise((resolve) => window.setTimeout(resolve, 800));
      const response = await fetch(`${backendUrl}/api/jobs/${created.id}`, { cache: "no-store" }); job = await response.json() as CalculationJob;
    }
    if (["failed", "timed-out", "interrupted"].includes(job.status)) throw createReviewError(job as ErrorPayload, job.status === "timed-out" ? "计算超时；可减少同时运行的专项数后重试" : "专项计算失败，可展开查看原始日志");
    const resultResponse = await fetch(`${backendUrl}/api/jobs/${created.id}/result`, { cache: "no-store" });
    const result = await resultResponse.json() as PurityChromatographyResult & { detail?: string };
    if (!resultResponse.ok) throw new Error(result.detail || "纯度/尺寸异质性结果读取失败");
    await refreshCalculationHistory(); return result;
  }, [files, purityPeakWindowsJson, refreshCalculationHistory, rules.intervalMethod, rules.minReferenceLots, updateRun]);

  const runPtmMap = useCallback(async (module: ProjectModule, source: "batch" | "single") => {
    if (ptmMapInputMode[module.id] === "structured") {
      const input = files[module.id];
      if (!input?.reference || !input.candidate) throw new Error(`${module.code}表格模式需要候选药与参照药位点定量CSV/TSV`);
      const form = new FormData();
      form.append("candidate", input.candidate); form.append("reference", input.reference);
      form.append("upstreamEngine", "external-professional-result");
      form.append("intervalMethod", rules.intervalMethod); form.append("minReferenceLots", String(rules.minReferenceLots));
      const response = await fetch(`${backendUrl}/ptm/analyze`, { method: "POST", body: form });
      const payload = await response.json() as PTMIntervalResult & { detail?: string };
      if (!response.ok) throw new Error(payload.detail || "PTM外部位点定量表解析失败");
      return adaptStructuredPtmMap(module, payload);
    }
    const input = sequenceFiles[module.id];
    if (!input?.referenceMzml.length || !input.candidateMzml.length || !input.fasta) throw new Error(`${module.code}需要至少1个参照药肽图、1个候选药肽图和1个FASTA`);
    const form = new FormData(); const manifest: Array<Record<string, string>> = [];
    input.referenceMzml.forEach((file, index) => { form.append("files", file); manifest.push({ role: "reference", lotId: `R${String(index + 1).padStart(2, "0")}` }); });
    input.candidateMzml.forEach((file, index) => { form.append("files", file); manifest.push({ role: "candidate", lotId: `C${String(index + 1).padStart(2, "0")}` }); });
    form.append("files", input.fasta); manifest.push({ role: "fasta" });
    form.append("projectId", "biocompare"); form.append("moduleCode", module.code);
    form.append("inputManifestJson", JSON.stringify(manifest));
    form.append("parametersJson", JSON.stringify({ qValueThreshold: 0.01, threads: 4, minReferenceLots: rules.minReferenceLots, intervalMethod: rules.intervalMethod }));
    const createdResponse = await fetch(`${backendUrl}/api/jobs`, { method: "POST", body: form });
    const created = await createdResponse.json() as CalculationJob & { detail?: string };
    if (!createdResponse.ok) throw new Error(created.detail || "PTM肽图任务创建失败");
    let job = created;
    while (["staging", "queued", "running"].includes(job.status)) {
      updateRun(module.id, { status: job.status === "running" ? "running" : "queued", progress: job.progress, message: job.message, source });
      await new Promise((resolve) => window.setTimeout(resolve, 900));
      const response = await fetch(`${backendUrl}/api/jobs/${created.id}`, { cache: "no-store" }); job = await response.json() as CalculationJob;
    }
    if (["failed", "timed-out", "interrupted"].includes(job.status)) throw createReviewError(job as ErrorPayload, job.status === "timed-out" ? "计算超时；可减少同时运行的专项数后重试" : "专项计算失败，可展开查看原始日志");
    const resultResponse = await fetch(`${backendUrl}/api/jobs/${created.id}/result`, { cache: "no-store" });
    const result = await resultResponse.json() as PTMMapCalculationResult & { detail?: string };
    if (!resultResponse.ok) throw new Error(result.detail || "PTM肽图结果读取失败");
    await refreshCalculationHistory(); return result;
  }, [files, ptmMapInputMode, refreshCalculationHistory, rules.intervalMethod, rules.minReferenceLots, sequenceFiles, updateRun]);

  const runCovalent = useCallback(async (module: ProjectModule, source: "batch" | "single") => {
    const input = sequenceFiles[module.id];
    if (!input?.referenceMzml.length || !input.candidateMzml.length || !input.fasta) throw new Error(`${module.code}的MS入口需要参照药、候选药非还原/烷基化肽图和抗体FASTA`);
    const form = new FormData(); const manifest: Array<Record<string, string>> = [];
    input.referenceMzml.forEach((file, index) => { form.append("files", file); manifest.push({ role: "reference", lotId: `R${String(index + 1).padStart(2, "0")}` }); });
    input.candidateMzml.forEach((file, index) => { form.append("files", file); manifest.push({ role: "candidate", lotId: `C${String(index + 1).padStart(2, "0")}` }); });
    form.append("files", input.fasta); manifest.push({ role: "fasta" });
    form.append("projectId", "biocompare"); form.append("moduleCode", module.code);
    form.append("inputManifestJson", JSON.stringify(manifest));
    form.append("parametersJson", JSON.stringify({ threads: 4, missedCleavages: 3, kojakMinScore: 0.1, xiMinScore: 0, expectedDisulfides: [] }));
    const createdResponse = await fetch(`${backendUrl}/api/jobs`, { method: "POST", body: form });
    const created = await createdResponse.json() as CalculationJob & { detail?: string };
    if (!createdResponse.ok) throw new Error(created.detail || "共价连接任务创建失败");
    let job = created;
    while (["staging", "queued", "running"].includes(job.status)) {
      updateRun(module.id, { status: job.status === "running" ? "running" : "queued", progress: job.progress, message: job.message, source });
      await new Promise((resolve) => window.setTimeout(resolve, 900));
      const response = await fetch(`${backendUrl}/api/jobs/${created.id}`, { cache: "no-store" }); job = await response.json() as CalculationJob;
    }
    if (["failed", "timed-out", "interrupted"].includes(job.status)) throw createReviewError(job as ErrorPayload, job.status === "timed-out" ? "计算超时；可减少同时运行的专项数后重试" : "专项计算失败，可展开查看原始日志");
    const resultResponse = await fetch(`${backendUrl}/api/jobs/${created.id}/result`, { cache: "no-store" });
    const result = await resultResponse.json() as CovalentCalculationResult & { detail?: string };
    if (!resultResponse.ok) throw new Error(result.detail || "共价连接结果读取失败");
    await refreshCalculationHistory(); return result;
  }, [refreshCalculationHistory, sequenceFiles, updateRun]);

  const runModule = useCallback(async (moduleId: string, source: "batch" | "single" = "single") => {
    const module = projectModules.find((item) => item.id === moduleId); if (!module) throw new Error("未找到专项模块");
    clearError(); updateRun(module.id, { status: "queued", message: source === "batch" ? "已进入总项目调度队列" : "专项任务已排队", progress: 8, source, startedAt: new Date().toISOString(), result: undefined, ptmResult: undefined, sequenceResult: undefined, glycanResult: undefined, ptmMapResult: undefined, chromatographyResult: undefined, covalentResult: undefined });
    await new Promise((resolve) => window.setTimeout(resolve, 180));
    updateRun(module.id, { status: "running", message: "正在调用专项分析适配器", progress: 35 });
    try {
      if (module.kind === "covalent") {
        const covalentResult = await runCovalent(module, source);
        const attention = covalentResult.status === "quality-blocked" || covalentResult.qualityGate?.passed === false;
        updateRun(module.id, { status: attention ? "attention" : "completed", message: attention ? "共价连接计算完成，存在证据/方法学边界提示" : "共价连接结果已回传", progress: 100, covalentResult, completedAt: new Date().toISOString() });
      } else if (module.kind === "ptm-map") {
        const ptmMapResult = await runPtmMap(module, source);
        const attention = ptmMapResult.status === "quality-blocked" || ptmMapResult.warnings.length > 0;
        updateRun(module.id, { status: attention ? "attention" : "completed", message: attention ? "PTM计算完成，存在质量/证据边界提示" : "PTM计算已完成并回传总项目", progress: 100, ptmMapResult, completedAt: new Date().toISOString() });
      } else if (module.kind === "chromatography") {
        const chromatographyResult = await runChromatography(module, source);
        const attention = chromatographyResult.status === "quality-blocked" || chromatographyResult.warnings.length > 0 || chromatographyResult.newCandidatePeaks.length > 0;
        updateRun(module.id, { status: attention ? "attention" : "completed", message: attention ? "色谱/电泳计算完成，存在风险或新峰标记" : "色谱/电泳计算完成并回传总项目", progress: 100, chromatographyResult, completedAt: new Date().toISOString() });
      } else if (module.kind === "glycan") {
        const glycanResult = await runGlycan(module, source);
        const attention = glycanResult.warnings.length > 0 || glycanResult.comparisonTable.some((row) => !["within", "not-evaluated"].includes(row.intervalStatus));
        updateRun(module.id, { status: attention ? "attention" : "completed", message: attention ? "糖型计算完成，存在审阅标记" : "糖型计算已完成并回传总项目", progress: 100, glycanResult, completedAt: new Date().toISOString() });
      } else if (module.kind === "sequence") {
        const sequenceResult = await runSequence(module, source);
        const attention = sequenceResult.status === "quality-blocked" || sequenceResult.qualityGate?.passed === false;
        updateRun(module.id, { status: attention ? "attention" : "completed", message: attention ? "专业计算已完成，质量闸门提示需审阅" : "序列确认已完成并回传总项目", progress: 100, sequenceResult, completedAt: new Date().toISOString() });
      } else if (module.kind === "ptm") {
        const ptmResult = await runPtm(module, source); const attention = ptmResult.summary.outsideIntervalCount > 0 || ptmResult.summary.candidateOnlyVariantCount > 0 || ptmResult.summary.integrityWarningCount > 0;
        updateRun(module.id, { status: attention ? "attention" : "completed", message: attention ? "已完成，存在需审阅标记" : "已完成并回传总项目", progress: 100, ptmResult, completedAt: new Date().toISOString() });
      } else {
        const result = await runMass(module, source); const attention = result.summary.unmatchedCandidateCount > 0;
        updateRun(module.id, { status: attention ? "attention" : "completed", message: attention ? "已完成，存在需复核峰" : "已完成并回传总项目", progress: 100, result, completedAt: new Date().toISOString() });
      }
    } catch (reason) {
      const described = reportError(reason, "专项计算失败，可展开查看原始日志");
      updateRun(module.id, { status: "failed", message: described.summary, progress: 100, completedAt: new Date().toISOString() }); throw reason;
    }
  }, [clearError, reportError, runChromatography, runCovalent, runGlycan, runMass, runPtm, runPtmMap, runSequence, updateRun]);

  const importProjectMaterials = useCallback(async (materials: File[]) => {
    if (!materials.length) throw new Error("请先选择企业申报材料");
    setImportingMaterials(true); clearError();
    try {
      const form = new FormData(); materials.forEach((file) => form.append("files", file));
      const response = await fetch(`${backendUrl}/project-materials/inspect`, { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail || "申报材料解析失败");
      const result = payload as SubmissionImportResult;
      setSubmissionImport(result);
      const byName = new Map(materials.map((file) => [file.name, file]));
      const noFastaMassBundle = !result.rawPtmBundle.fastaName && (result.rawPtmBundle.referenceMzmlNames.length > 0 || result.rawPtmBundle.candidateMzmlNames.length > 0 || result.rawPtmBundle.unresolvedMzmlNames.length > 0);
      setUnpairedMassMzmlFiles(noFastaMassBundle ? {
        reference: result.rawPtmBundle.referenceMzmlNames.map((name) => byName.get(name)).filter((file): file is File => Boolean(file)),
        candidate: result.rawPtmBundle.candidateMzmlNames.map((name) => byName.get(name)).filter((file): file is File => Boolean(file)),
        unresolved: result.rawPtmBundle.unresolvedMzmlNames.map((name) => byName.get(name)).filter((file): file is File => Boolean(file)),
      } : { reference: [], candidate: [], unresolved: [] });
      if (result.rawPtmBundle.status === "ready" && result.rawPtmBundle.fastaName) {
        const referenceMzml = result.rawPtmBundle.referenceMzmlNames.map((name) => byName.get(name)).filter((file): file is File => Boolean(file));
        const candidateMzml = result.rawPtmBundle.candidateMzmlNames.map((name) => byName.get(name)).filter((file): file is File => Boolean(file));
        const fasta = byName.get(result.rawPtmBundle.fastaName) || null;
        setPtmInputMode("openms-sage");
        setPtmMapInputModeState((current) => Object.fromEntries(Object.keys(current).map((moduleId) => [moduleId, "raw" as PTMMapInputMode])));
        setSequenceInputModeState((current) => Object.fromEntries(Object.keys(current).map((moduleId) => [moduleId, "raw" as SequenceInputMode])));
        setPtmRawFiles({ referenceMzml, candidateMzml, fasta });
        if (referenceMzml.length && candidateMzml.length && fasta) {
          // 同一还原烷基化肽图束同时服务 sequence 与 ptm-map 专项；covalent 需要非还原肽图，不自动填充
          setSequenceFiles((current) => Object.fromEntries(Object.entries(current).map(([moduleId, input]) => {
            const module = projectModules.find((item) => item.id === moduleId);
            const acceptsRawPeptideBundle = module?.kind === "ptm-map" || (module?.kind === "sequence" && module.method.startsWith("LC–MS"));
            if (!module || !acceptsRawPeptideBundle) return [moduleId, input];
            return [moduleId, { referenceMzml, candidateMzml, fasta }];
          })));
        }
      } else {
        setPtmInputMode("structured");
      }
      const rawPair = (kind: "chromatography" | "glycan") => {
        const referenceName = result.rawDatasets.find((dataset) => dataset.kind === kind && dataset.role === "reference")?.fileNames[0];
        const candidateName = result.rawDatasets.find((dataset) => dataset.kind === kind && dataset.role === "candidate")?.fileNames[0];
        return { reference: referenceName ? byName.get(referenceName) || null : null, candidate: candidateName ? byName.get(candidateName) || null : null };
      };
      const chromatographyPair = rawPair("chromatography");
      const glycanPair = rawPair("glycan");
      const runnableRawPairReady = Boolean(chromatographyPair.reference && chromatographyPair.candidate) || Boolean(glycanPair.reference && glycanPair.candidate);
      void runnableRawPairReady; // 色谱/糖型原始对仅自动填充，运行由「一键执行已识别项目」手动触发
      setFiles((current) => {
        const next = { ...current };
        for (const route of result.routes) {
          if (!next[route.moduleId]) continue;
          next[route.moduleId] = {
            candidate: route.candidate ? new File([route.candidate.content], route.candidate.name, { type: route.candidate.name.endsWith(".csv") ? "text/csv" : "text/plain" }) : next[route.moduleId].candidate,
            reference: route.reference ? new File([route.reference.content], route.reference.name, { type: route.reference.name.endsWith(".csv") ? "text/csv" : "text/plain" }) : next[route.moduleId].reference,
          };
        }
        for (const module of projectModules) {
          const pair = module.kind === "chromatography" ? chromatographyPair : module.kind === "glycan" ? glycanPair : null;
          if (pair?.candidate && pair.reference) next[module.id] = { candidate: pair.candidate, reference: pair.reference };
        }
        return next;
      });
      setRuns((current) => Object.fromEntries(Object.entries(current).map(([moduleId, run]) => {
        const route = result.routes.find((item) => item.moduleId === moduleId);
        const module = projectModules.find((item) => item.id === moduleId);
        const acceptsRawPeptideBundle = module?.kind === "ptm-map" || (module?.kind === "sequence" && module.method.startsWith("LC–MS"));
        const peptideMapReady = result.rawPtmBundle.status === "ready" && result.rawPtmBundle.fastaName && acceptsRawPeptideBundle;
        if (peptideMapReady) return [moduleId, { ...run, status: "not-started", progress: 0, message: "原始数据束已解析，候选药与参照药肽图输入就绪" }];
        const recognizedPairReady = module?.kind === "chromatography" ? Boolean(chromatographyPair.reference && chromatographyPair.candidate) : module?.kind === "glycan" ? Boolean(glycanPair.reference && glycanPair.candidate) : false;
        if (recognizedPairReady) return [moduleId, { ...run, status: "not-started", progress: 0, message: "原始数据已自动识别，候选药与参照药输入就绪" }];
        if (module?.id === "free-thiol" && result.rawDatasets.some((dataset) => dataset.kind === "free-thiol")) return [moduleId, { ...run, status: "not-started", progress: 0, message: "游离巯基结果表已识别，需在专项页人工确认" }];
        if (!route || route.status === "not-found") return [moduleId, run];
        return [moduleId, { ...run, status: "not-started", progress: 0, message: route.status === "ready" ? "整套材料已解析，候选药与参照药输入就绪" : route.message }];
      })));
      return result;
    } catch (reason) {
      reportError(reason, "申报材料解析失败"); throw reason;
    } finally { setImportingMaterials(false); }
  }, [clearError, reportError]);

  const runAll = useCallback(async (configuredOnly = false) => {
    if (batchRunning) return; setProjectStarted(true); setBatchRunning(true); clearError();
    try {
      const targets = configuredOnly ? projectModules.filter((module) => module.kind === "ptm-map"
        ? ptmMapInputMode[module.id] === "structured"
          ? Boolean(files[module.id]?.candidate && files[module.id]?.reference)
          : Boolean(sequenceFiles[module.id]?.referenceMzml.length && sequenceFiles[module.id]?.candidateMzml.length && sequenceFiles[module.id]?.fasta)
        : module.kind === "sequence"
          ? Boolean(sequenceFiles[module.id]?.referenceMzml.length && sequenceFiles[module.id]?.candidateMzml.length && sequenceFiles[module.id]?.fasta)
        : module.kind === "ptm" && ptmInputMode === "openms-sage"
          ? ptmRawFiles.referenceMzml.length >= rules.minReferenceLots && ptmRawFiles.candidateMzml.length > 0 && Boolean(ptmRawFiles.fasta)
          : files[module.id]?.candidate && files[module.id]?.reference) : projectModules;
      if (!targets.length) throw new Error("尚未识别出候选药与参照药均完整的专项数据");
      if (dispatchMode === "serial") { for (const module of targets) await runModule(module.id, "batch"); }
      else await Promise.allSettled(targets.map((module) => runModule(module.id, "batch")));
    } catch (reason) {
      reportError(reason, "批量任务调度失败");
    } finally { setBatchRunning(false); }
  }, [batchRunning, clearError, dispatchMode, files, ptmInputMode, ptmMapInputMode, ptmRawFiles, reportError, rules.minReferenceLots, runModule, sequenceFiles]);

  const exportReport = useCallback(async () => {
    setExportingReport(true); clearError();
    try {
      const modules = projectModules.map((module) => ({ ...module, ...runs[module.id], statusText: ({ "not-started": "未启动", queued: "已排队", running: "执行中", completed: "已完成", attention: "需关注", failed: "失败", planned: "待接入" } as const)[runs[module.id].status] }))
        .filter((module) => (module.status === "completed" || module.status === "attention") && hasModuleResult(module));
      if (!modules.length) { reportError("本次运算尚无可导出的结果", "本次运算尚无可导出的结果"); return; }
      const batchRuns = modules.filter((module) => module.source === "batch").length;
      const singleRuns = modules.filter((module) => module.source === "single").length;
      const batchLabel = batchRuns >= singleRuns ? "整套材料自动调度" : "手动单发";
      const completedAt = modules.map((module) => module.completedAt).filter((value): value is string => Boolean(value)).sort().at(-1) || new Date().toISOString();
      const response = await fetch(`${backendUrl}/reports/export-docx`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ projectName: "生物类似药比对项目", generatedAt: new Date().toISOString(), completedAt, batchLabel, submissionId: submissionImport?.submissionId, modules }) });
      if (!response.ok) { const detail = await response.json().catch(() => null); throw new Error(detail?.detail || "Word报告生成失败"); }
      const blob = await response.blob(); const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
      anchor.href = url; anchor.download = `BioCompare-整体结果-${new Date().toISOString().slice(0, 10)}.docx`; document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
    } catch (reason) { reportError(reason, "Word报告导出失败"); }
    finally { setExportingReport(false); }
  }, [clearError, reportError, runs, submissionImport]);

  const value = useMemo<ProjectContextValue>(() => ({
    runs, files, rules, dispatchMode, batchRunning, importingMaterials, exportingReport, projectStarted, engineStatus, error, errorDetail, submissionImport, ptmInputMode, ptmMapInputMode, sequenceInputMode, ptmRawFiles, sequenceFiles, unpairedMassMzmlFiles, sequenceCdrJson, purityPeakWindowsJson, calculationHistory,
    completedCount: Object.values(runs).filter((run) => run.status === "completed" || run.status === "attention").length,
    updateFile: (moduleId, role, file) => setFiles((current) => ({ ...current, [moduleId]: { ...current[moduleId], [role]: file } })),
    setPtmInputMode, setPtmMapInputMode: (moduleId, mode) => setPtmMapInputModeState((current) => ({ ...current, [moduleId]: mode })), setSequenceInputMode: (moduleId, mode) => setSequenceInputModeState((current) => ({ ...current, [moduleId]: mode })), updatePtmRawFiles: (patch) => setPtmRawFiles((current) => ({ ...current, ...patch })),
    updateSequenceFiles: (moduleId, patch) => setSequenceFiles((current) => ({ ...current, [moduleId]: { ...current[moduleId], ...patch } })),
    setSequenceCdrJson, setPurityPeakWindowsJson, refreshCalculationHistory,
    updateRules: (patch) => setRules((current) => ({ ...current, ...patch })), setDispatchMode, runModule, importProjectMaterials, runAll, exportReport, clearError,
  }), [runs, files, rules, dispatchMode, batchRunning, importingMaterials, exportingReport, projectStarted, engineStatus, error, errorDetail, submissionImport, ptmInputMode, ptmMapInputMode, sequenceInputMode, ptmRawFiles, sequenceFiles, unpairedMassMzmlFiles, sequenceCdrJson, purityPeakWindowsJson, calculationHistory, refreshCalculationHistory, runModule, importProjectMaterials, runAll, exportReport, clearError]);

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const context = useContext(ProjectContext); if (!context) throw new Error("useProject 必须在 ProjectProvider 内使用"); return context;
}
