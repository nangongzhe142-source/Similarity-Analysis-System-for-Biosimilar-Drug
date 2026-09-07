"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useIntake } from "@/components/intake/IntakeProvider";
import { categories } from "@/data/categories";
import { characterizationItems } from "@/data/characterization-items";
import { getItemsByCategory } from "@/data/selectors";
import { useLanguage } from "@/i18n/LanguageProvider";
import { acceptAttributeForInputKinds } from "@/lib/analysis-uploads";
import {
  isSponsorItemFilled,
  itemAllowsIntakeFigureAnalysis,
  sponsorCategoryCompleteness,
  sponsorCompleteness,
} from "@/lib/screen-intake/session-rules";
import { isComputableItemId } from "@/lib/workbench/name-match";
import type { LotNumericRow, LotRole } from "@/types/intake";

function defaultLot(role: LotRole, unit: string): LotNumericRow {
  return { role, lotId: "", value: 0, unit };
}

export function SponsorIntakeView() {
  const { messages, localize } = useLanguage();
  const copy = messages.intake;
  const {
    session,
    filesRevision,
    updateSponsorEntry,
    setSponsorFile,
    getSponsorFiles,
  } = useIntake();
  const orderedItems = useMemo(
    () =>
      categories.flatMap((category) => getItemsByCategory(category.key)),
    [],
  );
  const [currentId, setCurrentId] = useState(
    () => orderedItems[0]?.id ?? characterizationItems[0].id,
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const hash = window.location.hash.replace("#item-", "");
      if (hash && orderedItems.some((item) => item.id === hash)) {
        setCurrentId(hash);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [orderedItems]);
  const currentIndex = Math.max(
    0,
    orderedItems.findIndex((item) => item.id === currentId),
  );
  const currentItem = orderedItems[currentIndex] ?? orderedItems[0];
  const entry = session.sponsorEntries[currentItem.id];
  const files = getSponsorFiles(currentItem.id);
  const overall = sponsorCompleteness(session.sponsorEntries);
  const accept = acceptAttributeForInputKinds(["figure-image", "raw-spectra", "structured-export"]);
  const incomplete = orderedItems.filter((item) => {
    const itemEntry = session.sponsorEntries[item.id];
    return itemEntry !== undefined && !itemEntry.omitted && !isSponsorItemFilled(itemEntry);
  });

  void filesRevision;

  if (!entry) {
    return null;
  }

  function goTo(index: number): void {
    const next = orderedItems[index];
    if (next) {
      setCurrentId(next.id);
    }
  }

  function updateLot(index: number, patch: Partial<LotNumericRow>): void {
    const lots = entry.lots.map((row, rowIndex) =>
      rowIndex === index ? { ...row, ...patch } : row,
    );
    updateSponsorEntry(currentItem.id, { lots });
  }

  const bothFigures = Boolean(files.candidate && files.reference);
  const canOpenAnalysis = isComputableItemId(currentItem.id) && bothFigures;

  return (
    <section className="section-stack" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16 }}>
      <aside className="panel">
        <p>
          {copy.completenessLabel}:{" "}
          {copy.wizardProgress
            .replace("{filled}", String(overall.filled))
            .replace("{total}", String(overall.denominator))}
        </p>
        <p className="parser-trace">{copy.omittedExcludedNote}</p>
        <nav>
          {categories.map((category) => {
            const itemIds = getItemsByCategory(category.key).map((item) => item.id);
            const progress = sponsorCategoryCompleteness(itemIds, session.sponsorEntries);
            return (
              <div key={category.key} style={{ marginBottom: 12 }}>
                <strong>{localize(category.name)}</strong>
                <small>
                  {" "}
                  {progress.filled}/{progress.denominator}
                </small>
                <ul>
                  {getItemsByCategory(category.key).map((item) => {
                    const itemEntry = session.sponsorEntries[item.id];
                    const filled = itemEntry ? isSponsorItemFilled(itemEntry) : false;
                    const omitted = itemEntry?.omitted === true;
                    return (
                      <li key={item.id}>
                        <button
                          className={item.id === currentItem.id ? "primary" : "quiet"}
                          type="button"
                          onClick={() => setCurrentId(item.id)}
                        >
                          {localize(item.itemName)}
                          {omitted ? " · —" : filled ? " · ✓" : ""}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </aside>

      <div>
        <section className="panel" id={`item-${currentItem.id}`}>
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                {currentIndex + 1}/{orderedItems.length}
              </span>
              <h2>{localize(currentItem.itemName)}</h2>
            </div>
            <Link className="quiet link-button" href="/project">
              {copy.backToProject}
            </Link>
          </div>
          <p>
            <strong>{copy.purposeSummary}</strong> {localize(currentItem.purpose)}
          </p>
          <p>
            <strong>{copy.indicatorSummary}</strong> {localize(currentItem.detectionIndicators)}
          </p>
          <label className="tap-target" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={entry.omitted}
              onChange={(event) =>
                updateSponsorEntry(currentItem.id, {
                  omitted: event.target.checked,
                  omitReason: event.target.checked ? entry.omitReason : "",
                })
              }
            />
            {copy.omitItem}
          </label>
          {entry.omitted ? (
            <label>
              {copy.omitReason}
              <textarea
                value={entry.omitReason}
                onChange={(event) =>
                  updateSponsorEntry(currentItem.id, { omitReason: event.target.value })
                }
              />
            </label>
          ) : (
            <>
              <label>
                {copy.unitLabel}
                <input
                  value={entry.unit}
                  onChange={(event) => updateSponsorEntry(currentItem.id, { unit: event.target.value })}
                />
              </label>
              <table>
                <thead>
                  <tr>
                    <th>{copy.lotRole}</th>
                    <th>{copy.lotId}</th>
                    <th>{copy.lotValue}</th>
                    <th>{copy.unitLabel}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {entry.lots.map((row, index) => (
                    <tr key={`${row.role}-${index}`}>
                      <td>
                        <select
                          value={row.role}
                          onChange={(event) =>
                            updateLot(index, { role: event.target.value as LotRole })
                          }
                        >
                          <option value="candidate">{copy.roleCandidate}</option>
                          <option value="reference">{copy.roleReference}</option>
                        </select>
                      </td>
                      <td>
                        <input
                          value={row.lotId}
                          onChange={(event) => updateLot(index, { lotId: event.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={Number.isFinite(row.value) ? row.value : ""}
                          onChange={(event) =>
                            updateLot(index, { value: Number(event.target.value) })
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={row.unit}
                          placeholder={entry.unit}
                          onChange={(event) => updateLot(index, { unit: event.target.value })}
                        />
                      </td>
                      <td>
                        <button
                          className="quiet"
                          type="button"
                          onClick={() =>
                            updateSponsorEntry(currentItem.id, {
                              lots: entry.lots.filter((_, rowIndex) => rowIndex !== index),
                            })
                          }
                        >
                          {copy.removeLot}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                className="secondary"
                type="button"
                onClick={() =>
                  updateSponsorEntry(currentItem.id, {
                    lots: [
                      ...entry.lots,
                      defaultLot(
                        entry.lots.length % 2 === 0 ? "reference" : "candidate",
                        entry.unit,
                      ),
                    ],
                  })
                }
              >
                {copy.addLot}
              </button>
              <label>
                {copy.notes}
                <textarea
                  value={entry.notes}
                  onChange={(event) =>
                    updateSponsorEntry(currentItem.id, { notes: event.target.value })
                  }
                />
              </label>
              <div className="module-input-summary">
                <label className="input-card">
                  <span>{copy.candidateFigure}</span>
                  <strong>{files.candidate?.name ?? copy.candidateFigure}</strong>
                  <input
                    type="file"
                    accept={accept}
                    onChange={(event) =>
                      setSponsorFile(currentItem.id, "candidate", event.target.files?.[0] ?? null)
                    }
                  />
                </label>
                <label className="input-card reference">
                  <span>{copy.referenceFigure}</span>
                  <strong>{files.reference?.name ?? copy.referenceFigure}</strong>
                  <input
                    type="file"
                    accept={accept}
                    onChange={(event) =>
                      setSponsorFile(currentItem.id, "reference", event.target.files?.[0] ?? null)
                    }
                  />
                </label>
              </div>
              {canOpenAnalysis && itemAllowsIntakeFigureAnalysis(currentItem.id) ? (
                <Link className="primary link-button" href={`/item/${currentItem.id}`}>
                  {copy.openItemAnalysis}
                </Link>
              ) : isComputableItemId(currentItem.id) && bothFigures ? (
                <Link className="quiet link-button" href={`/item/${currentItem.id}`}>
                  {copy.openItemAnalysis}
                </Link>
              ) : null}
            </>
          )}
        </section>

        <div className="ingest-actions">
          <button
            className="secondary"
            type="button"
            disabled={currentIndex === 0}
            onClick={() => goTo(currentIndex - 1)}
          >
            {copy.previousItem}
          </button>
          <button
            className="secondary"
            type="button"
            disabled={currentIndex >= orderedItems.length - 1}
            onClick={() => goTo(currentIndex + 1)}
          >
            {copy.nextItem}
          </button>
          <Link className="primary link-button" href="/project">
            {copy.finishReturn}
          </Link>
        </div>

        <section className="panel">
          <h3>{copy.incompleteList}</h3>
          <ul>
            {incomplete.map((item) => (
              <li key={item.id}>
                <button className="quiet" type="button" onClick={() => setCurrentId(item.id)}>
                  {copy.goToItem}: {localize(item.itemName)}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
