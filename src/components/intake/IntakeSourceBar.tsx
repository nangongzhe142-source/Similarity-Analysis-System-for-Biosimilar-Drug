"use client";

import { useIntake } from "@/components/intake/IntakeProvider";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { IntakeReviewState, IntakeSource } from "@/types/intake";

export function IntakeSourceBar({
  itemId,
  onUseFiles,
}: {
  itemId: string;
  onUseFiles?: (files: { candidate: File | null; reference: File | null }) => void;
}) {
  const { messages } = useLanguage();
  const copy = messages.intake;
  const { session, filesRevision, getConfirmedFigures } = useIntake();
  const entry = session.sponsorEntries[itemId];
  const figures = getConfirmedFigures(itemId);
  const hasFigure = figures.candidate !== null || figures.reference !== null;
  const screenRegions = session.frames.flatMap((frame) =>
    frame.regions.filter(
      (region) => region.itemId === itemId && region.reviewState !== "rejected",
    ),
  );
  const confirmedScreen = screenRegions.some((region) => region.reviewState === "confirmed");
  const draftScreen = screenRegions.some((region) => region.reviewState === "draft");

  void filesRevision;

  if (!entry && screenRegions.length === 0 && !hasFigure) {
    return null;
  }

  const source: IntakeSource =
    confirmedScreen || draftScreen || entry?.source === "screen-capture"
      ? "screen-capture"
      : "sponsor-upload";
  const reviewState: IntakeReviewState = confirmedScreen
    ? "confirmed"
    : entry?.reviewState ?? (draftScreen ? "draft" : "draft");
  const reviewLabel =
    reviewState === "confirmed"
      ? copy.reviewStateConfirmed
      : reviewState === "rejected"
        ? copy.reviewStateRejected
        : copy.reviewStateDraft;
  const canFillSlots = reviewState === "confirmed" && hasFigure && onUseFiles !== undefined;

  return (
    <aside className="panel" style={{ marginBottom: 12 }}>
      <p>
        <strong>{copy.sourceBarTitle}</strong>
      </p>
      <p>
        <span className="status-chip planned">
          {source === "screen-capture" ? copy.sourceScreenCapture : copy.sourceSponsorUpload}
        </span>{" "}
        <span className={`status-chip ${reviewState}`}>
          {copy.sourceBarReview}: {reviewLabel}
        </span>{" "}
        {source === "screen-capture" ? (
          <>
            <span className="status-chip planned">{copy.notInstrumentRaw}</span>{" "}
            <span className="status-chip planned">{copy.extractorVision}</span>
          </>
        ) : null}
      </p>
      {reviewState !== "confirmed" && source === "screen-capture" ? (
        <p className="parser-trace">{copy.sourceBarCannotRun}</p>
      ) : null}
      {canFillSlots ? (
        <button
          className="secondary"
          type="button"
          onClick={() => onUseFiles?.(figures)}
        >
          {copy.sourceBarUseFiles}
        </button>
      ) : null}
    </aside>
  );
}
