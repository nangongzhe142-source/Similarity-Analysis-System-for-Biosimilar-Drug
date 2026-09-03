"use client";

import Link from "next/link";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { CountUp } from "@/components/workbench/CountUp";
import {
  getItemRun,
  useWorkbench,
  type WorkbenchRunStatus,
} from "@/components/workbench/WorkbenchProvider";
import { categories } from "@/data/categories";
import { characterizationItems } from "@/data/characterization-items";
import { getItemsByCategory } from "@/data/selectors";
import { useLanguage } from "@/i18n/LanguageProvider";
import { computableItemIds, isComputableItemId } from "@/lib/workbench/name-match";

const PAGE_SIZE = 20;

function statusLabel(
  status: WorkbenchRunStatus,
  planned: boolean,
  copy: {
    statusNotStarted: string;
    statusQueued: string;
    statusRunning: string;
    statusCompleted: string;
    statusFailed: string;
    statusPlanned: string;
  },
): string {
  if (planned) return copy.statusPlanned;
  if (status === "queued") return copy.statusQueued;
  if (status === "running") return copy.statusRunning;
  if (status === "completed") return copy.statusCompleted;
  if (status === "failed") return copy.statusFailed;
  return copy.statusNotStarted;
}

function summaryLabel(
  status: WorkbenchRunStatus,
  planned: boolean,
  copy: {
    summaryNotStarted: string;
    summaryQueued: string;
    summaryRunning: string;
    summaryCompleted: string;
    summaryFailed: string;
    summaryPlanned: string;
  },
): string {
  if (planned) return copy.summaryPlanned;
  if (status === "queued") return copy.summaryQueued;
  if (status === "running") return copy.summaryRunning;
  if (status === "completed") return copy.summaryCompleted;
  if (status === "failed") return copy.summaryFailed;
  return copy.summaryNotStarted;
}

export default function ProjectReportPage() {
  const { messages, localize } = useLanguage();
  const copy = messages.workbench;
  const { runStatusByItemId } = useWorkbench();
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [registerExpanded, setRegisterExpanded] = useState(false);
  const [page, setPage] = useState(1);

  const completedCount = computableItemIds.filter(
    (itemId) => getItemRun(runStatusByItemId, itemId).status === "completed",
  ).length;
  const runningCount = computableItemIds.filter((itemId) => {
    const status = getItemRun(runStatusByItemId, itemId).status;
    return status === "queued" || status === "running";
  }).length;
  const criticalCount = characterizationItems.filter(
    (item) => getItemRun(runStatusByItemId, item.id).status === "failed",
  ).length;
  const pendingEngineCount = characterizationItems.length - computableItemIds.length;
  const percent = Math.round((completedCount / characterizationItems.length) * 100);
  const pages = Math.max(1, Math.ceil(characterizationItems.length / PAGE_SIZE));
  const visibleItems = characterizationItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const grouped = useMemo(
    () =>
      categories.map((category) => ({
        key: category.key,
        name: localize(category.name),
        items: getItemsByCategory(category.key),
      })),
    [localize],
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = JSON.parse(
          localStorage.getItem("biocompare.report.groups") || "[]",
        ) as string[];
        setOpenGroups(new Set(Array.isArray(stored) ? stored : []));
      } catch {
        setOpenGroups(new Set());
      }
      setRegisterExpanded(localStorage.getItem("biocompare.report.register") === "true");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function persistGroups(next: Set<string>) {
    localStorage.setItem("biocompare.report.groups", JSON.stringify([...next]));
  }

  function toggleGroup(key: string) {
    setOpenGroups((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      persistGroups(next);
      return next;
    });
  }

  function toggleRegister() {
    setRegisterExpanded((current) => {
      localStorage.setItem("biocompare.report.register", String(!current));
      return !current;
    });
  }

  return (
    <section className="section-stack report-page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{copy.reportEyebrow}</span>
          <h2>{copy.reportTitle}</h2>
          <p>{copy.reportDescription}</p>
        </div>
        <button className="primary" type="button" disabled title={copy.exportWordReserved}>
          {copy.exportWordDisabled}（{copy.exportWordReserved}）
        </button>
      </div>
      <section className="report-kpi kpi-strip">
        <article style={{ "--i": 0 } as CSSProperties}>
          <span>{copy.kpiTotal}</span>
          <strong>
            <CountUp value={characterizationItems.length} />
          </strong>
          <small>{copy.kpiTotalHint}</small>
        </article>
        <article style={{ "--i": 1 } as CSSProperties}>
          <span>{copy.kpiCompleted}</span>
          <strong>
            <CountUp value={completedCount} />
          </strong>
          <small>{copy.kpiCompletedHint.replace("{percent}", String(percent))}</small>
        </article>
        <article style={{ "--i": 2 } as CSSProperties}>
          <span>{copy.kpiRunning}</span>
          <strong>
            <CountUp value={runningCount} />
          </strong>
          <small>{copy.kpiRunningHint}</small>
        </article>
        <article style={{ "--i": 3 } as CSSProperties}>
          <span>{copy.kpiPending}</span>
          <strong>
            <CountUp value={pendingEngineCount} />
          </strong>
          <small>{copy.kpiPendingHint}</small>
        </article>
        <article className={criticalCount ? "danger" : ""} style={{ "--i": 4 } as CSSProperties}>
          <span>{copy.kpiCritical}</span>
          <strong>
            <CountUp value={criticalCount} />
          </strong>
          <small>{copy.kpiCriticalHint}</small>
        </article>
      </section>
      <section className="report-module-accordions">
        <div className="section-heading compact">
          <div>
            <span className="eyebrow">{copy.moduleSummariesEyebrow}</span>
            <h2>{copy.moduleSummariesTitle}</h2>
          </div>
          <div className="expand-controls">
            <button
              type="button"
              onClick={() => {
                const all = new Set(grouped.map((group) => group.key));
                setOpenGroups(all);
                persistGroups(all);
              }}
            >
              {copy.expandAll}
            </button>
            <button
              type="button"
              onClick={() => {
                const empty = new Set<string>();
                setOpenGroups(empty);
                persistGroups(empty);
              }}
            >
              {copy.collapseAll}
            </button>
          </div>
        </div>
        {grouped.map((group, index) => {
          const open = openGroups.has(group.key);
          const attention = group.items.filter(
            (item) => getItemRun(runStatusByItemId, item.id).status === "failed",
          ).length;
          const done = group.items.filter(
            (item) => getItemRun(runStatusByItemId, item.id).status === "completed",
          ).length;
          const staggerIndex = Math.min(index, 12);
          return (
            <article
              className={`report-module-panel ${open ? "expanded" : ""}`}
              style={
                {
                  "--i": staggerIndex,
                  "--stagger-delay": `${staggerIndex * 35}ms`,
                } as CSSProperties
              }
              key={group.key}
            >
              <button type="button" onClick={() => toggleGroup(group.key)} aria-expanded={open}>
                <div>
                  <h3>{group.name}</h3>
                  <p>
                    {copy.groupProgress
                      .replace("{done}", String(done))
                      .replace("{total}", String(group.items.length))}
                    {attention
                      ? copy.hasAttention.replace("{count}", String(attention))
                      : copy.noCritical}
                  </p>
                </div>
                <span>
                  {group.items.length}
                  {copy.catalogItemsUnit}
                </span>
                <i>⌄</i>
              </button>
              {open && (
                <div className="report-module-body">
                  <table>
                    <thead>
                      <tr>
                        <th>{copy.colCode}</th>
                        <th>{copy.colItem}</th>
                        <th>{copy.colStatusChip}</th>
                        <th>{copy.colSummary}</th>
                        <th>{copy.colAction}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((item) => {
                        const planned = !isComputableItemId(item.id);
                        const run = getItemRun(runStatusByItemId, item.id);
                        return (
                          <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{localize(item.itemName)}</td>
                            <td>
                              <span className={`status-chip ${planned ? "planned" : run.status}`}>
                                {statusLabel(run.status, planned, copy)}
                              </span>
                            </td>
                            <td>{summaryLabel(run.status, planned, copy)}</td>
                            <td>
                              <Link href={`/item/${item.id}`}>{copy.drillThrough}</Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          );
        })}
      </section>
      <section className="report-conclusion-grid">
        <article className="panel report-summary">
          <span className="eyebrow">{copy.conclusionEyebrow}</span>
          <h3>{copy.conclusionTitle}</h3>
          <p>{copy.conclusionBody.replace("{completed}", String(completedCount))}</p>
          <div className="report-callout">{copy.conclusionCallout}</div>
        </article>
        <article className={`panel risk-panel ${criticalCount ? "has-risk" : ""}`}>
          <span className="eyebrow">{copy.reportRiskEyebrow}</span>
          <h3>{copy.reportRiskTitle}</h3>
          <strong>
            <CountUp value={criticalCount} />
          </strong>
          <p>{criticalCount ? copy.reportRiskHas : copy.reportRiskNone}</p>
        </article>
      </section>
      <section
        className={`panel report-table disclosure-panel ${registerExpanded ? "expanded" : ""}`}
      >
        <button
          className="disclosure-summary"
          type="button"
          onClick={toggleRegister}
          aria-expanded={registerExpanded}
        >
          <div>
            <span className="eyebrow">{copy.registerEyebrow}</span>
            <h2>{copy.registerTitle}</h2>
          </div>
          <p>
            {completedCount} / {criticalCount}
          </p>
          <i>⌄</i>
        </button>
        {registerExpanded && (
          <div className="disclosure-body table-scroll">
            <table>
              <thead className="sticky-head">
                <tr>
                  <th>{copy.colCode}</th>
                  <th>{copy.colItem}</th>
                  <th>{copy.colSource}</th>
                  <th>{copy.colStatusChip}</th>
                  <th>{copy.colSummary}</th>
                  <th>{copy.colAction}</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item) => {
                  const planned = !isComputableItemId(item.id);
                  const run = getItemRun(runStatusByItemId, item.id);
                  const sourceLabel =
                    run.source === "batch"
                      ? copy.sourceBatch
                      : run.source === "single"
                        ? copy.sourceSingle
                        : copy.sourceNone;
                  return (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>
                        <strong>{localize(item.itemName)}</strong>
                        <small>{localize(item.guidelineTerm)}</small>
                      </td>
                      <td>{sourceLabel}</td>
                      <td>
                        <span className={`status-chip ${planned ? "planned" : run.status}`}>
                          {statusLabel(run.status, planned, copy)}
                        </span>
                      </td>
                      <td>{summaryLabel(run.status, planned, copy)}</td>
                      <td>
                        <Link className="detail-link" href={`/item/${item.id}`}>
                          {copy.drillThrough}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="table-pagination">
              <button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>
                {copy.prevPage}
              </button>
              <span>
                {copy.pageStatus
                  .replace("{page}", String(page))
                  .replace("{pages}", String(pages))}
              </span>
              <button
                type="button"
                disabled={page === pages}
                onClick={() => setPage((value) => value + 1)}
              >
                {copy.nextPage}
              </button>
            </div>
          </div>
        )}
      </section>
    </section>
  );
}
