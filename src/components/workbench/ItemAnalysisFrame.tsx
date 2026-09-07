"use client";

import { MethodSelector } from "@/components/MethodSelector";
import { IntakeSourceBar } from "@/components/intake/IntakeSourceBar";
import {
  getItemFiles,
  getItemRun,
  itemFilesAreReady,
  useWorkbench,
  type WorkbenchRunStatus,
} from "@/components/workbench/WorkbenchProvider";
import { getItemById } from "@/data/selectors";
import { useLanguage } from "@/i18n/LanguageProvider";
import { isComputableItemId, isNameMatchedItemId } from "@/lib/workbench/name-match";

function statusChipClass(status: WorkbenchRunStatus, planned: boolean): string {
  if (planned) return "planned";
  return status;
}

export function ItemAnalysisFrame({
  itemId,
  embedded = false,
}: {
  itemId: string;
  embedded?: boolean;
}) {
  const { messages, localize } = useLanguage();
  const copy = messages.workbench;
  const item = getItemById(itemId);
  const { filesByItemId, runStatusByItemId } = useWorkbench();
  if (!item) return null;

  const computable = isComputableItemId(itemId);
  const nameMatched = isNameMatchedItemId(itemId);
  const files = getItemFiles(filesByItemId, itemId);
  const run = getItemRun(runStatusByItemId, itemId);
  const hasFiles = itemFilesAreReady(files);
  const running = run.status === "queued" || run.status === "running";
  const hasResult = run.status === "completed" || run.status === "failed";
  const planned = !computable;
  const chipStatus = planned ? "planned" : run.status;
  const chipLabel = planned
    ? copy.statusPlanned
    : run.status === "queued"
      ? copy.statusQueued
      : run.status === "running"
        ? copy.statusRunning
        : run.status === "completed"
          ? copy.statusCompleted
          : run.status === "failed"
            ? copy.statusFailed
            : copy.statusNotStarted;

  return (
    <section className={embedded ? "embedded-workspace" : undefined}>
      <div className="panel analysis-panel">
        <div className="analysis-head">
          <div>
            <span className="eyebrow">{copy.analysisEyebrow}</span>
            <h2>{localize(item.itemName)}</h2>
            <p>{planned ? (nameMatched ? copy.ruleNotRunnable : copy.notConnectedHint) : localize(item.purpose)}</p>
          </div>
          <div className="analysis-status">
            <span className={`status-chip ${statusChipClass(run.status, planned)}`}>{chipLabel}</span>
            <small>{chipStatus}</small>
          </div>
        </div>
        <div className="module-stepper">
          <div className={hasFiles ? "done" : "active"}>
            <span>1</span>
            <strong>{copy.step1Title}</strong>
            <small>{copy.step1Small}</small>
          </div>
          <b>→</b>
          <div className={running ? "active" : hasResult ? "done" : ""}>
            <span>2</span>
            <strong>{copy.step2Title}</strong>
            <small>{copy.step2Small}</small>
          </div>
          <b>→</b>
          <div className={hasResult ? "done" : ""}>
            <span>3</span>
            <strong>{copy.step3Title}</strong>
            <small>{copy.step3Small}</small>
          </div>
        </div>
        {computable ? (
          <div style={{ padding: "16px 20px 20px" }}>
            <IntakeSourceBar itemId={itemId} />
            <MethodSelector itemId={item.id} methods={item.methods} />
          </div>
        ) : (
          <>
            <div style={{ padding: "16px 20px 0" }}>
              <IntakeSourceBar itemId={itemId} />
            </div>
            <div className="module-input-summary">
              <label className="input-card">
                <span>{copy.colCandidate}</span>
                <strong>{copy.pickCandidate}</strong>
                <input type="file" disabled />
              </label>
              <label className="input-card reference">
                <span>{copy.colReference}</span>
                <strong>{copy.pickReference}</strong>
                <input type="file" disabled />
              </label>
              <div>
                <span>{copy.colStatus}</span>
                <strong>{copy.waitingConnect}</strong>
              </div>
            </div>
            <div className="run-controls">
              <p>
                <strong>{copy.notConnectedHint}</strong>
                <span>{nameMatched ? copy.ruleNotRunnable : copy.notConnectedHint}</span>
              </p>
              <button className="primary" type="button" disabled>
                {copy.runThisItem}
              </button>
            </div>
            <div className="reserved-adapters">
              <div>
                <span>{copy.reservedEngine}</span>
                <strong>External Engine Adapter</strong>
                <small>{copy.reservedEngineSmall}</small>
              </div>
              <div>
                <span>{copy.reservedOcr}</span>
                <strong>OCR Adapter</strong>
                <small>{copy.reservedOcrSmall}</small>
              </div>
              <div>
                <span>{copy.reservedReport}</span>
                <strong>Report / LLM Adapter</strong>
                <small>{copy.reservedReportSmall}</small>
              </div>
              <div>
                <span>{copy.reservedAudit}</span>
                <strong>Audit Adapter</strong>
                <small>{copy.reservedAuditSmall}</small>
              </div>
            </div>
            <div className="empty-result">
              <div className="orbit">
                <span />
              </div>
              <h3>{copy.resultSkeletonTitle}</h3>
              <p>{copy.resultSkeletonBody}</p>
            </div>
          </>
        )}
        {running && (
          <div className="job-progress">
            <div>
              <span>{run.message || chipLabel}</span>
              <strong>{run.progress}%</strong>
            </div>
            <div className="progress-track">
              <span style={{ width: `${run.progress}%` }} />
            </div>
            <small>
              {run.source === "batch" ? copy.jobSourceBatch : copy.jobSourceSingle}
            </small>
          </div>
        )}
      </div>
    </section>
  );
}
