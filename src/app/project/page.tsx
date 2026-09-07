"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useIntake } from "@/components/intake/IntakeProvider";
import { CountUp } from "@/components/workbench/CountUp";
import { ProjectOverviewDisclosure } from "@/components/workbench/ProjectOverviewDisclosure";
import {
  getItemRun,
  itemFilesAreReady,
  useWorkbench,
} from "@/components/workbench/WorkbenchProvider";
import { characterizationItems } from "@/data/characterization-items";
import { getItemById } from "@/data/selectors";
import { useLanguage } from "@/i18n/LanguageProvider";
import { computableItemIds } from "@/lib/workbench/name-match";

function classifyExtension(fileName: string): "table" | "pdf" | "mzml" | "other" {
  const lower = fileName.toLowerCase();
  if (/\.(csv|tsv|xlsx|xls)$/.test(lower)) return "table";
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".mzml")) return "mzml";
  return "other";
}

function formatDuration(startedAt: string | undefined, updatedAt: string | undefined): string {
  if (!startedAt || !updatedAt) return "—";
  const seconds = Math.max(
    0,
    Math.round((new Date(updatedAt).getTime() - new Date(startedAt).getTime()) / 1000),
  );
  return String(seconds);
}

export default function ProjectPage() {
  const { messages, localize } = useLanguage();
  const copy = messages.workbench;
  const intakeCopy = messages.intake;
  const { role, setRole } = useIntake();
  const {
    batchRunning,
    dispatchMode,
    setDispatchMode,
    runAll,
    runStatusByItemId,
    filesByItemId,
  } = useWorkbench();
  const [materials, setMaterials] = useState<File[]>([]);
  const [classified, setClassified] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setHistoryExpanded(localStorage.getItem("biocompare.history.expanded") === "true");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const readyCount = computableItemIds.filter((itemId) =>
    itemFilesAreReady(filesByItemId[itemId]),
  ).length;
  const completedCount = computableItemIds.filter(
    (itemId) => getItemRun(runStatusByItemId, itemId).status === "completed",
  ).length;
  const historyRows = computableItemIds
    .map((itemId) => ({ itemId, run: getItemRun(runStatusByItemId, itemId) }))
    .filter(
      (entry) => entry.run.status !== "not-started" && entry.run.status !== "planned",
    )
    .sort((left, right) =>
      (right.run.updatedAt ?? "").localeCompare(left.run.updatedAt ?? ""),
    );
  const latest = historyRows[0];
  const latestItem = latest ? getItemById(latest.itemId) : undefined;

  const counts = useMemo(() => {
    const table = materials.filter((file) => classifyExtension(file.name) === "table").length;
    const pdf = materials.filter((file) => classifyExtension(file.name) === "pdf").length;
    const mzml = materials.filter((file) => classifyExtension(file.name) === "mzml").length;
    const other = materials.length - table - pdf - mzml;
    return { table, pdf, mzml, other };
  }, [materials]);

  function toggleHistory() {
    setHistoryExpanded((current) => {
      localStorage.setItem("biocompare.history.expanded", String(!current));
      return !current;
    });
  }

  function handleReparse() {
    if (!materials.length) return;
    setClassified(true);
  }

  const heroState = batchRunning
    ? copy.heroBatch
    : completedCount
      ? copy.heroHasResults
      : classified
        ? copy.heroParsing
        : copy.heroWaiting;

  return (
    <section className="section-stack">
      <section className="project-hero">
        <div className="hero-copy">
          <span className="eyebrow">{copy.heroEyebrow}</span>
          <h2>{copy.heroTitle}</h2>
          <p>{copy.heroDescription}</p>
          <div className="hero-tags">
            <span>{copy.heroTagTraceable}</span>
            <span>{copy.heroTagEngine}</span>
            <span>{copy.heroTagNotConclusion}</span>
          </div>
        </div>
        <div className="project-state">
          <span className={batchRunning || classified ? "pulse active" : "pulse"} />
          <div>
            <small>{copy.heroStateLabel}</small>
            <strong>{heroState}</strong>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="unified-ingest-head">
          <div>
            <span className="eyebrow">{intakeCopy.roleLabel}</span>
            <h2>{intakeCopy.roleHint}</h2>
          </div>
        </div>
        <div className="ingest-actions" style={{ marginTop: 12 }}>
          <button
            data-testid="intake-role-reviewer"
            className={role === "reviewer" ? "primary" : "secondary"}
            type="button"
            onClick={() => setRole("reviewer")}
          >
            {intakeCopy.roleReviewer}
          </button>
          <button
            data-testid="intake-role-sponsor"
            className={role === "sponsor" ? "primary" : "secondary"}
            type="button"
            onClick={() => setRole("sponsor")}
          >
            {intakeCopy.roleSponsor}
          </button>
        </div>
        <div className="metrics kpi-strip" style={{ marginTop: 16 }}>
          {role !== "sponsor" ? (
            <div className="metric">
              <span>{intakeCopy.cardScreenEyebrow}</span>
              <strong>{intakeCopy.cardScreenTitle}</strong>
              <small>{intakeCopy.cardScreenBody}</small>
              {role === "reviewer" ? (
                <Link
                  data-testid="intake-open-screen"
                  className="primary link-button"
                  href="/project/intake/screen"
                >
                  {intakeCopy.cardScreenAction}
                </Link>
              ) : (
                <button className="primary" type="button" disabled>
                  {intakeCopy.cardDisabledHint}
                </button>
              )}
            </div>
          ) : null}
          {role !== "reviewer" ? (
            <div className="metric accent">
              <span>{intakeCopy.cardSponsorEyebrow}</span>
              <strong>{intakeCopy.cardSponsorTitle}</strong>
              <small>{intakeCopy.cardSponsorBody}</small>
              {role === "sponsor" ? (
                <Link className="primary link-button" href="/project/intake/sponsor">
                  {intakeCopy.cardSponsorAction}
                </Link>
              ) : (
                <button className="primary" type="button" disabled>
                  {intakeCopy.cardDisabledHint}
                </button>
              )}
            </div>
          ) : null}
        </div>
        <p className="parser-trace">{intakeCopy.existingChannelNote}</p>
      </section>

      <section className="panel unified-ingest">
        <div className="unified-ingest-head">
          <div>
            <span className="eyebrow">{copy.ingestEyebrow}</span>
            <h2>{copy.ingestTitle}</h2>
            <p>{copy.ingestDescription}</p>
          </div>
          <span className="section-badge">{copy.ingestBadge}</span>
        </div>
        <div className="ingest-workflow">
          <label className={materials.length ? "submission-dropzone filled" : "submission-dropzone"}>
            <span className="upload-symbol">＋</span>
            <strong>
              {materials.length
                ? copy.dropzoneFilled.replace("{count}", String(materials.length))
                : copy.dropzoneEmpty}
            </strong>
            <small>
              {materials.length ? materials.map((file) => file.name).join("、") : copy.dropzoneHint}
            </small>
            <input
              type="file"
              multiple
              onChange={(event) => {
                setMaterials(Array.from(event.target.files ?? []));
                setClassified(false);
              }}
            />
          </label>
          <div className="ingest-actions">
            <button
              className="secondary"
              type="button"
              disabled={!materials.length}
              onClick={handleReparse}
            >
              {copy.reparse}
            </button>
            <button
              className="primary"
              type="button"
              disabled={!readyCount || batchRunning}
              onClick={() => void runAll()}
            >
              {batchRunning ? copy.runAllRunning : copy.runRecognized}
            </button>
            <button className="quiet" type="button" disabled title={copy.exportWordReserved}>
              {copy.exportWord}（{copy.exportWordReserved}）
            </button>
          </div>
        </div>
        {!classified && (
          <div className="ingest-empty">
            <span>{copy.emptySkeleton}</span>
            <div>
              <b>1</b>
              {copy.emptyStep1}
            </div>
            <div>
              <b>2</b>
              {copy.emptyStep2}
            </div>
            <div>
              <b>3</b>
              {copy.emptyStep3}
            </div>
            <div>
              <b>4</b>
              {copy.emptyStep4}
            </div>
            <div>
              <b>5</b>
              {copy.emptyStep5}
            </div>
          </div>
        )}
        {classified && (
          <div className="inspection-result">
            <div className="inspection-summary">
              <div>
                <span>{copy.classifyFiles}</span>
                <strong>
                  <CountUp value={materials.length} />
                </strong>
              </div>
              <div>
                <span>{copy.classifyTables}</span>
                <strong>
                  <CountUp value={counts.table} />
                </strong>
              </div>
              <div>
                <span>{copy.classifyPdf}</span>
                <strong>
                  <CountUp value={counts.pdf} />
                </strong>
              </div>
              <div>
                <span>{copy.classifyMzml}</span>
                <strong>
                  <CountUp value={counts.mzml} />
                </strong>
              </div>
            </div>
            <p className="parser-trace">{copy.classifiedHint}</p>
          </div>
        )}
      </section>

      <section className="panel batch-launch">
        <div>
          <span className="eyebrow">{copy.batchEyebrow}</span>
          <h2>{copy.batchTitle}</h2>
          <p>{copy.batchDescription}</p>
        </div>
        <label>
          {copy.dispatchLabel}
          <select
            value={dispatchMode}
            onChange={(event) =>
              setDispatchMode(event.target.value === "serial" ? "serial" : "parallel")
            }
          >
            <option value="parallel">{copy.dispatchParallel}</option>
            <option value="serial">{copy.dispatchSerial}</option>
          </select>
        </label>
        <Link className="quiet link-button" href="/project/data">
          {copy.traditionalInput}
        </Link>
      </section>

      <section className="workflow-line">
        <div>
          <span>01</span>
          <strong>{copy.wf1Title}</strong>
          <small>{copy.wf1Small}</small>
        </div>
        <b>→</b>
        <div>
          <span>02</span>
          <strong>{copy.wf2Title}</strong>
          <small>{copy.wf2Small}</small>
        </div>
        <b>→</b>
        <div>
          <span>03</span>
          <strong>{copy.wf3Title}</strong>
          <small>{copy.wf3Small}</small>
        </div>
        <b>→</b>
        <div>
          <span>04</span>
          <strong>{copy.wf4Title}</strong>
          <small>{copy.wf4Small}</small>
        </div>
      </section>

      <section
        className={`panel calculation-history disclosure-panel ${historyExpanded ? "expanded" : ""}`}
      >
        <button
          className="disclosure-summary"
          type="button"
          onClick={toggleHistory}
          aria-expanded={historyExpanded}
        >
          <div>
            <span className="eyebrow">{copy.historyEyebrow}</span>
            <h2>{copy.historyTitle}</h2>
          </div>
          <p>
            {latest && latestItem
              ? `${latestItem.id} · ${copy.historyLocalEngine} · ${latest.run.message || copy.waitingRun}`
              : copy.historyNone}
          </p>
          <i>⌄</i>
        </button>
        {historyExpanded && (
          <div className="disclosure-body">
            <div className="history-toolbar">
              <span>{copy.historyRecent}</span>
            </div>
            {historyRows.length ? (
              <div className="history-table">
                <div className="history-head">
                  <span>{copy.historyTask}</span>
                  <span>{copy.historyEngineStatus}</span>
                  <span>{copy.historyDuration}</span>
                  <span>{copy.historyUpdated}</span>
                </div>
                {historyRows.slice(0, 10).map((entry) => {
                  const item = getItemById(entry.itemId);
                  return (
                    <div className="history-row" key={entry.itemId}>
                      <span>
                        <strong>{entry.itemId}</strong>
                        <small>{item ? localize(item.itemName) : entry.itemId}</small>
                      </span>
                      <span>
                        <b>{copy.historyLocalEngine}</b>
                        <small>
                          <i className={`job-state ${entry.run.status}`} />
                          {entry.run.message || copy.waitingRun}
                        </small>
                      </span>
                      <span>
                        <b>
                          {copy.durationSeconds.replace(
                            "{seconds}",
                            formatDuration(entry.run.startedAt, entry.run.updatedAt),
                          )}
                        </b>
                      </span>
                      <span>
                        {entry.run.updatedAt
                          ? new Date(entry.run.updatedAt).toLocaleString()
                          : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="history-empty">
                <span className="empty-illustration">⌁</span>
                <strong>{copy.historyEmptyLead}</strong>
                <p>{copy.historyEmptyBody}</p>
              </div>
            )}
            <Link className="disclosure-footer-link" href="/project/report">
              {copy.viewAllTasks}
            </Link>
          </div>
        )}
      </section>

      <ProjectOverviewDisclosure />

      <section className="summary-statistics">
        <div className="section-heading compact">
          <div>
            <span className="eyebrow">{copy.kpiEyebrow}</span>
            <h2>{copy.kpiTitle}</h2>
          </div>
        </div>
        <div className="metrics kpi-strip">
          <div className="metric">
            <span>{copy.kpiItems}</span>
            <strong>
              <CountUp value={characterizationItems.length} />
            </strong>
            <small>{copy.kpiItemsHint}</small>
          </div>
          <div className="metric">
            <span>{copy.kpiEngines}</span>
            <strong>
              <CountUp value={computableItemIds.length} />
            </strong>
            <small>{copy.kpiEnginesHint}</small>
          </div>
          <div className="metric">
            <span>{copy.kpiDone}</span>
            <strong>
              <CountUp value={completedCount} />
            </strong>
            <small>{copy.kpiDoneHint}</small>
          </div>
          <div className="metric accent">
            <span>{copy.kpiMode}</span>
            <strong>
              {dispatchMode === "parallel" ? copy.dispatchParallel : copy.dispatchSerial}
            </strong>
            <small>{copy.kpiModeHint}</small>
          </div>
        </div>
      </section>

      <p className="disclaimer" style={{ marginTop: 8 }}>
        {messages.workbench.siteDisclaimerLine}
      </p>
    </section>
  );
}
