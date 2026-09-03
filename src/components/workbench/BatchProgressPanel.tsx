"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { characterizationItems } from "@/data/characterization-items";
import { useLanguage } from "@/i18n/LanguageProvider";
import { computableItemIds } from "@/lib/workbench/name-match";
import {
  getItemRun,
  useWorkbench,
  type WorkbenchRunStatus,
} from "@/components/workbench/WorkbenchProvider";

const TERMINAL = new Set<WorkbenchRunStatus>(["completed", "failed"]);

export function BatchProgressPanel() {
  const { messages, localize } = useLanguage();
  const copy = messages.workbench;
  const { runStatusByItemId, batchRunning, dispatchMode } = useWorkbench();
  const [batchItemIds, setBatchItemIds] = useState<string[]>([]);
  const [closed, setClosed] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [seenBatchRunning, setSeenBatchRunning] = useState(batchRunning);

  const liveBatchIds = computableItemIds.filter((itemId) => {
    const run = getItemRun(runStatusByItemId, itemId);
    return run.source === "batch" && run.status !== "not-started" && run.status !== "planned";
  });

  let nextIds = batchItemIds;
  let nextClosed = closed;
  let nextSeen = seenBatchRunning;
  if (batchRunning !== seenBatchRunning) {
    nextSeen = batchRunning;
    if (batchRunning) {
      nextIds = [];
      nextClosed = false;
    }
  }
  if (batchRunning) {
    nextIds = computableItemIds.filter(
      (itemId) => nextIds.includes(itemId) || liveBatchIds.includes(itemId),
    );
  }
  if (nextSeen !== seenBatchRunning) setSeenBatchRunning(nextSeen);
  if (nextClosed !== closed) setClosed(nextClosed);
  if (
    nextIds.length !== batchItemIds.length ||
    nextIds.some((itemId, index) => itemId !== batchItemIds[index])
  ) {
    setBatchItemIds(nextIds);
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMinimized(localStorage.getItem("biocompare.batch-progress.minimized") === "true");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function toggleMinimized() {
    setMinimized((current) => {
      localStorage.setItem("biocompare.batch-progress.minimized", String(!current));
      return !current;
    });
  }

  const items = useMemo(
    () =>
      batchItemIds
        .map((itemId) => characterizationItems.find((item) => item.id === itemId))
        .filter((item): item is (typeof characterizationItems)[number] => Boolean(item)),
    [batchItemIds],
  );
  const terminalCount = items.filter((item) =>
    TERMINAL.has(getItemRun(runStatusByItemId, item.id).status),
  ).length;
  const failedCount = items.filter(
    (item) => getItemRun(runStatusByItemId, item.id).status === "failed",
  ).length;
  const overallProgress = items.length
    ? Math.round(
        items.reduce((total, item) => total + getItemRun(runStatusByItemId, item.id).progress, 0) /
          items.length,
      )
    : 0;
  const finished = !batchRunning && terminalCount >= 1 && items.length > 0;

  const statusLabel = (status: WorkbenchRunStatus): string => {
    if (status === "queued") return copy.statusQueued;
    if (status === "running") return copy.statusRunning;
    if (status === "completed") return copy.statusCompleted;
    if (status === "failed") return copy.statusFailed;
    if (status === "planned") return copy.statusPlanned;
    return copy.waitingRun;
  };

  if (!items.length || closed || (!batchRunning && !finished)) return null;

  return (
    <aside
      className={`batch-progress-panel ${finished ? "finished" : "active"} ${dispatchMode} ${minimized ? "minimized" : "expanded"}`}
      aria-label={copy.batchPanelLabel}
      aria-live="polite"
    >
      <header className="batch-progress-head">
        <div>
          <span className="eyebrow">BATCH ORCHESTRATION</span>
          <strong>
            {finished ? copy.batchPanelDoneTitle : copy.batchPanelTitle} · {terminalCount}/
            {items.length} {copy.statusCompleted}
          </strong>
          <small>
            {dispatchMode === "parallel" ? copy.dispatchParallel : copy.dispatchSerial}
            {minimized ? ` · ${overallProgress}%` : ""}
          </small>
          {minimized && (
            <span className="batch-progress-mini-track">
              <i style={{ width: `${overallProgress}%` }} />
            </span>
          )}
        </div>
        <div className="batch-progress-actions">
          <button
            type="button"
            onClick={toggleMinimized}
            aria-expanded={!minimized}
            aria-label={minimized ? copy.batchExpand : copy.batchMinimize}
          >
            {minimized ? "⌃" : "—"}
          </button>
          {finished && (
            <button type="button" onClick={() => setClosed(true)} aria-label={copy.batchClose}>
              ×
            </button>
          )}
        </div>
      </header>
      {!minimized && (
        <>
          <div className="batch-progress-list">
            {items.map((item, index) => {
              const run = getItemRun(runStatusByItemId, item.id);
              const style = { "--i": Math.min(index, 12) } as CSSProperties;
              return (
                <article className={`batch-progress-row ${run.status}`} style={style} key={item.id}>
                  <span className="batch-status-icon" aria-hidden="true">
                    {run.status === "completed" ? "✓" : run.status === "failed" ? "×" : ""}
                  </span>
                  <div className="batch-progress-copy">
                    <div>
                      <strong>{item.id}</strong>
                      <span>{localize(item.itemName)}</span>
                      <em>{statusLabel(run.status)}</em>
                    </div>
                    <p>{run.message || statusLabel(run.status)}</p>
                    <div className={`batch-row-track ${run.status}`}>
                      <i style={{ width: `${run.progress}%` }} />
                    </div>
                  </div>
                  <b>{Math.round(run.progress)}%</b>
                </article>
              );
            })}
          </div>
          <footer className="batch-progress-footer">
            <div>
              <span>{finished ? copy.batchFinished : copy.batchOverall}</span>
              <strong>{overallProgress}%</strong>
            </div>
            <div className="batch-overall-track">
              <i style={{ width: `${overallProgress}%` }} />
            </div>
            {finished && (
              <small>
                {failedCount
                  ? copy.batchFailCount.replace("{count}", String(failedCount))
                  : copy.batchNoFail}
              </small>
            )}
          </footer>
        </>
      )}
    </aside>
  );
}
