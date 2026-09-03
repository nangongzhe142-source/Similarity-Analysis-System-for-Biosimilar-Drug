"use client";

import { useEffect, useState } from "react";
import {
  getItemFiles,
  itemFilesAreReady,
  useWorkbench,
} from "@/components/workbench/WorkbenchProvider";
import { characterizationItems } from "@/data/characterization-items";
import { useLanguage } from "@/i18n/LanguageProvider";
import { isComputableItemId } from "@/lib/workbench/name-match";

const PAGE_SIZE = 15;

export default function ProjectDataPage() {
  const { messages, localize } = useLanguage();
  const copy = messages.workbench;
  const { filesByItemId, setItemFile } = useWorkbench();
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setExpanded(localStorage.getItem("biocompare.input-routing.expanded") === "true");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const ready = characterizationItems.filter(
    (item) => isComputableItemId(item.id) && itemFilesAreReady(filesByItemId[item.id]),
  ).length;
  const assignedFiles = characterizationItems.reduce((count, item) => {
    const files = getItemFiles(filesByItemId, item.id);
    return count + Number(Boolean(files.candidate)) + Number(Boolean(files.reference));
  }, 0);
  const pages = Math.max(1, Math.ceil(characterizationItems.length / PAGE_SIZE));
  const visibleItems = characterizationItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggle() {
    setExpanded((current) => {
      localStorage.setItem("biocompare.input-routing.expanded", String(!current));
      return !current;
    });
  }

  return (
    <section className="section-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{copy.dataEyebrow}</span>
          <h2>{copy.dataTitle}</h2>
          <p>{copy.dataDescription}</p>
        </div>
        <span className="section-badge">{copy.dataBadge}</span>
      </div>
      <div className="panel common-data-panel">
        <div className="common-summary">
          <div>
            <span>{copy.roleCandidate}</span>
            <strong>{copy.roleCandidateValue}</strong>
          </div>
          <div>
            <span>{copy.roleReference}</span>
            <strong>{copy.roleReferenceValue}</strong>
          </div>
          <div>
            <span>{copy.roleFlow}</span>
            <strong>{copy.roleFlowValue}</strong>
          </div>
        </div>
        <details className="reserved-slots help-drawer inline-help">
          <summary>
            {copy.capabilitiesTitle} <i>⌄</i>
          </summary>
          <div>
            <span>{copy.capConnected}</span>
            <em>{copy.capPdf}</em>
            <em>{copy.capStructured}</em>
            <span>{copy.capLater}</span>
            <em>{copy.capOcr}</em>
            <em>{copy.capObject}</em>
          </div>
        </details>
      </div>
      <section className={`panel data-matrix disclosure-panel ${expanded ? "expanded" : ""}`}>
        <button className="disclosure-summary" type="button" onClick={toggle} aria-expanded={expanded}>
          <div>
            <span className="eyebrow">{copy.routingEyebrow}</span>
            <h2>{copy.routingTitle}</h2>
          </div>
          <p>
            {copy.routingSummary
              .replace("{ready}", String(ready))
              .replace("{files}", String(assignedFiles))}
          </p>
          <i>⌄</i>
        </button>
        {expanded && (
          <div className="disclosure-body">
            <div className="data-table-head sticky-head">
              <span>{copy.colModule}</span>
              <span>{copy.colCandidate}</span>
              <span>{copy.colReference}</span>
              <span>{copy.colStatus}</span>
            </div>
            {visibleItems.map((item) => {
              const computable = isComputableItemId(item.id);
              const files = getItemFiles(filesByItemId, item.id);
              const readyRow = computable && itemFilesAreReady(files);
              return (
                <div className="data-table-row" key={item.id}>
                  <div>
                    <strong>{localize(item.itemName)}</strong>
                    <small>{item.id}</small>
                  </div>
                  <label
                    className={
                      files.candidate ? "file-slot filled" : "file-slot"
                    }
                  >
                    {files.candidate?.name || copy.pickCandidate}
                    <input
                      type="file"
                      disabled={!computable}
                      onChange={(event) =>
                        setItemFile(item.id, "candidate", event.target.files?.[0] ?? null)
                      }
                    />
                  </label>
                  <label
                    className={
                      files.reference ? "file-slot filled reference" : "file-slot reference"
                    }
                  >
                    {files.reference?.name || copy.pickReference}
                    <input
                      type="file"
                      disabled={!computable}
                      onChange={(event) =>
                        setItemFile(item.id, "reference", event.target.files?.[0] ?? null)
                      }
                    />
                  </label>
                  <span className={readyRow ? "routing ready" : "routing"}>
                    {computable
                      ? readyRow
                        ? copy.inputReady
                        : copy.waitingInput
                      : copy.waitingConnect}
                  </span>
                </div>
              );
            })}
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
