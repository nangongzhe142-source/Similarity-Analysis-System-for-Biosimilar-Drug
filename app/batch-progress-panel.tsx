"use client";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { projectModules, type ModuleState } from "@/lib/project";
import { useProject } from "@/app/project-provider";

const statusLabels: Record<ModuleState, string> = {
  "not-started": "等待运行",
  planned: "待接入",
  queued: "排队中",
  running: "运行中",
  completed: "完成",
  attention: "需关注",
  failed: "失败",
};
const terminalStates = new Set<ModuleState>(["completed", "attention", "failed"]);

export function BatchProgressPanel() {
  const { runs, batchRunning, dispatchMode } = useProject();
  const [batchModuleIds, setBatchModuleIds] = useState<string[]>([]);
  const [closed, setClosed] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const wasRunningRef = useRef(false);
  const batchStartedAtRef = useRef(0);

  useEffect(() => {
    setMinimized(localStorage.getItem("biocompare.batch-progress.minimized") === "true");
  }, []);

  function toggleMinimized() {
    setMinimized((current) => {
      localStorage.setItem("biocompare.batch-progress.minimized", String(!current));
      return !current;
    });
  }

  useEffect(() => {
    if (batchRunning && !wasRunningRef.current) {
      batchStartedAtRef.current = Date.now() - 1000;
      setBatchModuleIds([]);
      setClosed(false);
    }
    wasRunningRef.current = batchRunning;
  }, [batchRunning]);

  useEffect(() => {
    if (!batchRunning) return;
    const currentBatchIds = projectModules.filter((module) => {
      const run = runs[module.id];
      const startedAt = run.startedAt ? Date.parse(run.startedAt) : 0;
      return run.source === "batch" && run.status !== "not-started" && startedAt >= batchStartedAtRef.current;
    }).map((module) => module.id);
    if (!currentBatchIds.length) return;
    setBatchModuleIds((current) => {
      const merged = projectModules.map((module) => module.id).filter((id) => current.includes(id) || currentBatchIds.includes(id));
      return merged.length === current.length && merged.every((id, index) => id === current[index]) ? current : merged;
    });
  }, [batchRunning, runs]);

  const modules = useMemo(() => batchModuleIds.map((id) => projectModules.find((module) => module.id === id)).filter((module): module is (typeof projectModules)[number] => Boolean(module)), [batchModuleIds]);
  const terminalCount = modules.filter((module) => terminalStates.has(runs[module.id].status)).length;
  const failedCount = modules.filter((module) => runs[module.id].status === "failed").length;
  const attentionCount = modules.filter((module) => runs[module.id].status === "attention").length;
  const overallProgress = modules.length ? Math.round(modules.reduce((total, module) => total + runs[module.id].progress, 0) / modules.length) : 0;
  const finished = !batchRunning && terminalCount >= 2;

  if (!modules.length || closed || (!batchRunning && terminalCount < 2)) return null;
  return <aside className={`batch-progress-panel ${finished ? "finished" : "active"} ${dispatchMode} ${minimized ? "minimized" : "expanded"}`} aria-label="批量任务进度" aria-live="polite">
    <header className="batch-progress-head">
      <div><span className="eyebrow">BATCH ORCHESTRATION</span><strong>{finished ? "本次批量总结" : "批量比对进度"} · {terminalCount}/{modules.length} 已完成</strong><small>{dispatchMode === "parallel" ? "并行调度" : "串行调度"}{minimized ? ` · 总体 ${overallProgress}%` : ""}</small>{minimized && <span className="batch-progress-mini-track"><i style={{ width: `${overallProgress}%` }} /></span>}</div>
      <div className="batch-progress-actions"><button type="button" onClick={toggleMinimized} aria-expanded={!minimized} aria-label={minimized ? "展开批量任务窗口" : "最小化批量任务窗口"} title={minimized ? "展开显示" : "最小化"}>{minimized ? "⌃" : "—"}</button>{finished && <button type="button" onClick={() => setClosed(true)} aria-label="关闭批量任务摘要" title="关闭批量任务摘要">×</button>}</div>
    </header>
    {!minimized && <><div className="batch-progress-list">
      {modules.map((module, index) => {
        const run = runs[module.id];
        const style = { "--i": Math.min(index, 12) } as CSSProperties;
        return <article className={`batch-progress-row ${run.status}`} style={style} key={module.id}>
          <span className="batch-status-icon" aria-hidden="true">{run.status === "completed" ? "✓" : run.status === "attention" ? "!" : run.status === "failed" ? "×" : ""}</span>
          <div className="batch-progress-copy"><div><strong>{module.code}</strong><span>{module.name}</span><em>{statusLabels[run.status]}</em></div><p>{run.message}</p><div className={`batch-row-track ${run.status}`}><i style={{ width: `${run.progress}%` }} /></div></div>
          <b>{Math.round(run.progress)}%</b>
        </article>;
      })}
    </div>
    <footer className="batch-progress-footer"><div><span>{finished ? "批次已结束" : "总体进度"}</span><strong>{overallProgress}%</strong></div><div className="batch-overall-track"><i style={{ width: `${overallProgress}%` }} /></div>{finished && <small>{failedCount ? `${failedCount} 项失败` : "无失败项"}{attentionCount ? ` · ${attentionCount} 项需关注` : ""}</small>}</footer></>}
  </aside>;
}
