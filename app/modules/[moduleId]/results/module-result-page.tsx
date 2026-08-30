"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProject } from "@/app/project-provider";
import type { ProjectModule } from "@/lib/project";
import { statusText } from "@/lib/project";
import { CovalentResultView, GlycanResultView, MassResultView, PTMMapResultView, PTMResultView, PurityChromatographyResultView, ResultPlaceholder, SequenceResultView } from "@/app/result-views";
import type { CalculationJob, CovalentCalculationResult, GlycanCalculationResult, PTMMapCalculationResult, PurityChromatographyResult, SequenceCalculationResult } from "@/lib/types";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export function ModuleResultPage({ module }: { module: ProjectModule }) {
  const { runs, runModule } = useProject(); const run = runs[module.id]; const running = run.status === "running" || run.status === "queued";
  const [persistedSequenceResult, setPersistedSequenceResult] = useState<SequenceCalculationResult | null>(null);
  const [persistedGlycanResult, setPersistedGlycanResult] = useState<GlycanCalculationResult | null>(null);
  const [persistedPTMMapResult, setPersistedPTMMapResult] = useState<PTMMapCalculationResult | null>(null);
  const [persistedChromatographyResult, setPersistedChromatographyResult] = useState<PurityChromatographyResult | null>(null);
  const [persistedCovalentResult, setPersistedCovalentResult] = useState<CovalentCalculationResult | null>(null);
  useEffect(() => {
    if (module.kind !== "sequence" || run.sequenceResult) return;
    let cancelled = false;
    fetch(`${backendUrl}/api/jobs?projectId=biocompare&moduleCode=${module.code}&limit=10`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then(async (payload: { jobs?: CalculationJob[] } | null) => {
        const latest = payload?.jobs?.find((job) => job.status === "completed" || job.status === "quality-blocked");
        if (!latest) return;
        const response = await fetch(`${backendUrl}/api/jobs/${latest.id}/result`, { cache: "no-store" });
        if (response.ok && !cancelled) setPersistedSequenceResult(await response.json() as SequenceCalculationResult);
      }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [module.code, module.kind, run.sequenceResult]);
  useEffect(() => {
    if (module.kind !== "glycan" || run.glycanResult) return;
    let cancelled = false;
    fetch(`${backendUrl}/api/jobs?projectId=biocompare&moduleCode=${module.code}&limit=10`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then(async (payload: { jobs?: CalculationJob[] } | null) => {
        const latest = payload?.jobs?.find((job) => job.status === "completed" || job.status === "quality-blocked");
        if (!latest) return;
        const response = await fetch(`${backendUrl}/api/jobs/${latest.id}/result`, { cache: "no-store" });
        if (response.ok && !cancelled) setPersistedGlycanResult(await response.json() as GlycanCalculationResult);
      }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [module.code, module.kind, run.glycanResult]);
  useEffect(() => {
    if (module.kind !== "ptm-map" || run.ptmMapResult) return;
    let cancelled = false;
    fetch(`${backendUrl}/api/jobs?projectId=biocompare&moduleCode=${module.code}&limit=10`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then(async (payload: { jobs?: CalculationJob[] } | null) => {
        const latest = payload?.jobs?.find((job) => job.status === "completed" || job.status === "quality-blocked");
        if (!latest) return;
        const response = await fetch(`${backendUrl}/api/jobs/${latest.id}/result`, { cache: "no-store" });
        if (response.ok && !cancelled) setPersistedPTMMapResult(await response.json() as PTMMapCalculationResult);
      }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [module.code, module.kind, run.ptmMapResult]);
  useEffect(() => {
    if (module.kind !== "chromatography" || run.chromatographyResult) return;
    let cancelled = false;
    fetch(`${backendUrl}/api/jobs?projectId=biocompare&moduleCode=${module.code}&limit=10`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then(async (payload: { jobs?: CalculationJob[] } | null) => {
        const latest = payload?.jobs?.find((job) => job.status === "completed" || job.status === "quality-blocked");
        if (!latest) return;
        const response = await fetch(`${backendUrl}/api/jobs/${latest.id}/result`, { cache: "no-store" });
        if (response.ok && !cancelled) setPersistedChromatographyResult(await response.json() as PurityChromatographyResult);
      }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [module.code, module.kind, run.chromatographyResult]);
  useEffect(() => {
    if (module.kind !== "covalent" || run.covalentResult) return;
    let cancelled = false;
    fetch(`${backendUrl}/api/jobs?projectId=biocompare&moduleCode=${module.code}&limit=10`, { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then(async (payload: { jobs?: CalculationJob[] } | null) => {
      const latest = payload?.jobs?.find((job) => job.status === "completed" || job.status === "quality-blocked"); if (!latest) return;
      const response = await fetch(`${backendUrl}/api/jobs/${latest.id}/result`, { cache: "no-store" }); if (response.ok && !cancelled) setPersistedCovalentResult(await response.json() as CovalentCalculationResult);
    }).catch(() => undefined); return () => { cancelled = true; };
  }, [module.code, module.kind, run.covalentResult]);
  const sequenceResult = run.sequenceResult || persistedSequenceResult;
  const glycanResult = run.glycanResult || persistedGlycanResult;
  const ptmMapResult = run.ptmMapResult || persistedPTMMapResult;
  const chromatographyResult = run.chromatographyResult || persistedChromatographyResult;
  const covalentResult = run.covalentResult || persistedCovalentResult;
  const qualityBlocked = sequenceResult?.status === "quality-blocked" || ptmMapResult?.status === "quality-blocked" || chromatographyResult?.status === "quality-blocked" || covalentResult?.status === "quality-blocked";
  const hasReview = Boolean(ptmMapResult?.warnings.length || glycanResult?.warnings.length || chromatographyResult?.warnings.length || chromatographyResult?.newCandidatePeaks.length);
  const displayedStatus = ptmMapResult || glycanResult || chromatographyResult || covalentResult ? (qualityBlocked || hasReview ? "需关注" : "已完成") : qualityBlocked ? "需关注" : statusText[run.status];
  const displayedClass = ptmMapResult || glycanResult || chromatographyResult || covalentResult ? (qualityBlocked || hasReview ? "attention" : "completed") : qualityBlocked ? "attention" : run.status;
  const persisted = (sequenceResult && !run.sequenceResult) || (glycanResult && !run.glycanResult) || (ptmMapResult && !run.ptmMapResult) || (chromatographyResult && !run.chromatographyResult) || (covalentResult && !run.covalentResult);
  return <section className="section-stack"><div className="level-banner"><div><span>第二层 · 专项详细结果</span><strong>{module.code} / {module.name}</strong><small>该页保留原始专项明细，总项目只读取摘要</small></div><div><Link href={`/modules/${module.id}`}>返回专项运行页</Link><Link href="/project/report">返回汇总报告</Link></div></div><div className="panel analysis-panel"><div className="analysis-head"><div><span className="eyebrow">SPECIALIZED RESULT</span><h2>{module.name}详细结果</h2><p>状态、指标、图表、明细表、预警和审评备注的标准占位布局。</p></div><div className="analysis-status"><span className={`status-chip ${displayedClass}`}>{displayedStatus}</span><small>{persisted ? "读取服务器最近任务" : run.source === "batch" ? "由总项目调度" : run.source === "single" ? "专项独立运行" : "尚未运行"}</small></div></div>{covalentResult ? <CovalentResultView result={covalentResult} /> : chromatographyResult ? <PurityChromatographyResultView result={chromatographyResult} /> : ptmMapResult ? <PTMMapResultView result={ptmMapResult} /> : glycanResult ? <GlycanResultView result={glycanResult} /> : sequenceResult ? <SequenceResultView result={sequenceResult} /> : run.ptmResult ? <PTMResultView result={run.ptmResult} /> : run.result ? <MassResultView result={run.result} /> : <ResultPlaceholder />}<div className="result-actions"><button className="primary" disabled={running} onClick={() => void runModule(module.id, "single")}>{running ? "运行中…" : "运行/重新运行本专项"}</button><button className="quiet" disabled>导出专项报告（预留）</button></div></div></section>;
}
