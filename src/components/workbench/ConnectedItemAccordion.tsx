"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ItemAnalysisFrame } from "@/components/workbench/ItemAnalysisFrame";
import {
  getItemRun,
  useWorkbench,
} from "@/components/workbench/WorkbenchProvider";
import { getItemById } from "@/data/selectors";
import { useLanguage } from "@/i18n/LanguageProvider";
import { computableItemIds } from "@/lib/workbench/name-match";

export function ConnectedItemAccordion() {
  const { messages, localize } = useLanguage();
  const copy = messages.workbench;
  const { runStatusByItemId } = useWorkbench();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = JSON.parse(
          localStorage.getItem("biocompare.module-details") || "[]",
        ) as string[];
        setExpandedIds(new Set(Array.isArray(stored) ? stored : []));
      } catch {
        setExpandedIds(new Set());
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function persist(next: Set<string>) {
    localStorage.setItem("biocompare.module-details", JSON.stringify([...next]));
  }

  function toggle(itemId: string) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      persist(next);
      return next;
    });
  }

  return (
    <section className="module-accordion-list" aria-label={copy.connectedTitle}>
      <div className="expand-controls module-expand-controls">
        <button
          type="button"
          onClick={() => {
            const all = new Set(computableItemIds);
            setExpandedIds(all);
            persist(all);
          }}
        >
          {copy.expandAll}
        </button>
        <button
          type="button"
          onClick={() => {
            const empty = new Set<string>();
            setExpandedIds(empty);
            persist(empty);
          }}
        >
          {copy.collapseAll}
        </button>
      </div>
      {computableItemIds.map((itemId) => {
        const item = getItemById(itemId);
        if (!item) return null;
        const run = getItemRun(runStatusByItemId, itemId);
        const expanded = expandedIds.has(itemId);
        const detailId = `item-detail-${itemId}`;
        return (
          <article
            key={itemId}
            className={`module-accordion-item ${expanded ? "expanded" : ""}`}
          >
            <div className="module-overview-row">
              <div className="module-overview-identity">
                <div className="module-icon">Da</div>
                <div>
                  <span className="module-code-label">{item.id}</span>
                  <h3>{localize(item.itemName)}</h3>
                  <p>{localize(item.purpose)}</p>
                </div>
              </div>
              <div className="module-overview-engine">
                <span>{copy.historyLocalEngine}</span>
                <strong>{copy.historyLocalEngine}</strong>
                <small>{localize(item.guidelineTerm)}</small>
              </div>
              <div className="module-overview-state">
                <span className={`status-chip ${run.status}`}>
                  {run.status === "queued"
                    ? copy.statusQueued
                    : run.status === "running"
                      ? copy.statusRunning
                      : run.status === "completed"
                        ? copy.statusCompleted
                        : run.status === "failed"
                          ? copy.statusFailed
                          : copy.statusNotStarted}
                </span>
                <strong>{run.progress}%</strong>
                <div className={`task-progress ${run.status}`}>
                  <span style={{ width: `${run.progress}%` }} />
                </div>
                <small>{run.message || copy.waitingRun}</small>
              </div>
              <div className="module-overview-actions">
                <button
                  type="button"
                  className="module-toggle"
                  aria-expanded={expanded}
                  aria-controls={detailId}
                  onClick={() => toggle(itemId)}
                >
                  {copy.openWorkspace} <span aria-hidden="true">⌄</span>
                </button>
                <Link href={`/item/${itemId}`}>{copy.independentPage}</Link>
              </div>
            </div>
            {expanded && (
              <div id={detailId} className="module-inline-detail">
                <div className="inline-detail-heading">
                  <div>
                    <span>{copy.layer2Detail}</span>
                    <strong>
                      {item.id} · {localize(item.itemName)}
                    </strong>
                  </div>
                  <button type="button" onClick={() => toggle(itemId)}>
                    {copy.closeDetail}
                  </button>
                </div>
                <ItemAnalysisFrame itemId={itemId} embedded />
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
}
