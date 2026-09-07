"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImageAxisCalibrationPicker } from "@/components/analysis/ImageAxisCalibrationPicker";
import { useIntake } from "@/components/intake/IntakeProvider";
import { characterizationItems } from "@/data/characterization-items";
import { getItemById } from "@/data/selectors";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  captureVideoElementToPngFile,
  enqueueAsyncWork,
  isVideoFrameReady,
  stopMediaTracks,
  waitForVideoFrame,
} from "@/lib/screen-intake/capture-frame";
import { firstAnalyzableMethodId } from "@/lib/workbench/name-match";
import type { ImageCalibrationPayload } from "@/lib/image-axis-calibration";
import type { LotRole, ScreenExtractStatus, ScreenRegionKind } from "@/types/intake";

function extractLabel(
  status: ScreenExtractStatus,
  copy: {
    extractQueued: string;
    extractRunning: string;
    extractSucceeded: string;
    extractFailed: string;
    extractSkipped: string;
  },
): string {
  if (status === "queued") return copy.extractQueued;
  if (status === "running") return copy.extractRunning;
  if (status === "succeeded") return copy.extractSucceeded;
  if (status === "failed") return copy.extractFailed;
  return copy.extractSkipped;
}

function kindLabel(
  kind: ScreenRegionKind,
  copy: {
    regionKindTable: string;
    regionKindSpectrum: string;
    regionKindOther: string;
  },
): string {
  if (kind === "table") return copy.regionKindTable;
  if (kind === "spectrum") return copy.regionKindSpectrum;
  return copy.regionKindOther;
}

export function ScreenIntakeView() {
  const { messages, localize } = useLanguage();
  const copy = messages.intake;
  const {
    session,
    visionStatus,
    addCapturedFrame,
    extractFrame,
    getFrameFile,
    assignRegionItem,
    assignRegionRole,
    confirmRegion,
    rejectRegion,
    confirmAllScreenDrafts,
    setRegionCalibration,
    getRegionCalibration,
    regionReadyForAnalysis,
    prepareRegionForAnalysis,
  } = useIntake();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureChainRef = useRef(Promise.resolve());
  const captureIndexRef = useRef(0);
  const [consent, setConsent] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [sharePhase, setSharePhase] = useState<"idle" | "requesting" | "waiting" | "ready" | "failed">(
    "idle",
  );
  const [shareFailed, setShareFailed] = useState(false);
  const [captureFailed, setCaptureFailed] = useState(false);
  const [confirmAllOpen, setConfirmAllOpen] = useState(false);
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
  const [activeSpectrumRegionId, setActiveSpectrumRegionId] = useState<string | null>(null);

  const stopShare = useCallback(() => {
    stopMediaTracks(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setSharing(false);
    setVideoReady(false);
    setSharePhase("idle");
  }, []);

  useEffect(() => {
    return () => {
      stopMediaTracks(streamRef.current);
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!sharing) {
      return;
    }
    const pollId = window.setInterval(() => {
      const video = videoRef.current;
      if (video && isVideoFrameReady(video)) {
        setVideoReady(true);
        setSharePhase("ready");
      }
    }, 100);
    return () => window.clearInterval(pollId);
  }, [sharing]);

  async function startShare(): Promise<void> {
    if (!consent) {
      return;
    }
    setShareFailed(false);
    setCaptureFailed(false);
    setVideoReady(false);
    setSharePhase("requesting");
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      stopMediaTracks(streamRef.current);
      streamRef.current = stream;
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack?.addEventListener("ended", stopShare);
      const video = videoRef.current;
      if (!video) {
        stopShare();
        return;
      }
      video.srcObject = stream;
      await video.play().catch(() => undefined);
      setSharing(true);
      setSharePhase("waiting");
      try {
        await waitForVideoFrame(video);
      } catch {
        // Keep the live share; the poll above still enables capture when a frame arrives.
      }
      if (isVideoFrameReady(video)) {
        setVideoReady(true);
        setSharePhase("ready");
      }
    } catch {
      stopMediaTracks(streamRef.current);
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setSharing(false);
      setVideoReady(false);
      setShareFailed(true);
      setSharePhase("failed");
    }
  }

  const captureOnce = useCallback(async () => {
    const video = videoRef.current;
    if (!video) {
      throw new Error("VIDEO_NOT_READY");
    }
    await waitForVideoFrame(video);
    const frameIndex = captureIndexRef.current + 1;
    captureIndexRef.current = frameIndex;
    const file = await captureVideoElementToPngFile(video, frameIndex);
    const frameId = addCapturedFrame(file);
    setSelectedFrameId(frameId);
    void extractFrame(frameId);
  }, [addCapturedFrame, extractFrame]);

  function enqueueCapture(): void {
    if (!videoReady) {
      return;
    }
    setCaptureFailed(false);
    captureChainRef.current = enqueueAsyncWork(captureChainRef.current, async () => {
      try {
        await captureOnce();
      } catch {
        setCaptureFailed(true);
      }
    });
  }

  const selectedFrame =
    session.frames.find((frame) => frame.id === selectedFrameId) ??
    session.frames[session.frames.length - 1];
  const unmatched = session.unmatchedRegions
    .map((ref) => {
      const frame = session.frames.find((entry) => entry.id === ref.frameId);
      const region = frame?.regions.find((entry) => entry.id === ref.regionId);
      return region && region.reviewState !== "rejected" ? { frame, region } : null;
    })
    .filter((entry) => entry !== null);
  const draftItems = useMemo(() => {
    return Object.values(session.sponsorEntries).filter(
      (entry) => entry.source === "screen-capture" && entry.reviewState === "draft",
    );
  }, [session.sponsorEntries]);
  const spectrumFile = activeSpectrumRegionId
    ? getFrameFile(
        session.frames.find((frame) =>
          frame.regions.some((region) => region.id === activeSpectrumRegionId),
        )?.id ?? "",
      )
    : null;
  const profileId = activeSpectrumRegionId
    ? firstAnalyzableMethodId(
        session.frames
          .flatMap((frame) => frame.regions)
          .find((region) => region.id === activeSpectrumRegionId)?.itemId ?? "",
      )
    : undefined;

  const onCalibrationChange = useCallback(
    (payload: ImageCalibrationPayload | null) => {
      if (activeSpectrumRegionId) {
        setRegionCalibration(activeSpectrumRegionId, payload);
      }
    },
    [activeSpectrumRegionId, setRegionCalibration],
  );

  return (
    <section className="section-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{copy.cardScreenEyebrow}</span>
          <h2>{copy.cardScreenTitle}</h2>
          <p>{copy.cardScreenBody}</p>
        </div>
        <Link className="quiet link-button" href="/project">
          {copy.backToProject}
        </Link>
      </div>

      <section className="panel">
        <h3>{copy.consentTitle}</h3>
        <p>{copy.consentText}</p>
        <p>
          <span className="status-chip planned">{copy.sourceScreenCapture}</span>{" "}
          <span className="status-chip planned">{copy.notInstrumentRaw}</span>{" "}
          <span className="status-chip planned">{copy.aiDraftNeedsReview}</span>{" "}
          <span className="status-chip planned">{copy.extractorVision}</span>
        </p>
        <label className="tap-target" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            data-testid="intake-consent"
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
          />
          {copy.consentCheckbox}
        </label>
        <div className="ingest-actions" style={{ marginTop: 12 }}>
          <button
            data-testid="intake-start-share"
            className="primary"
            type="button"
            disabled={!consent}
            onClick={() => void startShare()}
          >
            {copy.startShare}
          </button>
          <button
            data-testid="intake-stop-share"
            className="secondary"
            type="button"
            disabled={!sharing}
            onClick={stopShare}
          >
            {copy.stopShare}
          </button>
          <button
            data-testid="intake-capture-frame"
            className="primary"
            type="button"
            disabled={!videoReady}
            onClick={enqueueCapture}
          >
            {copy.captureFrame}
          </button>
        </div>
        <p data-testid="intake-share-phase" data-phase={sharePhase} hidden>
          {sharePhase}
        </p>
        <p>
          <span className={`status-chip ${sharing ? "running" : "planned"}`}>
            {sharing ? copy.sharing : copy.notSharing}
          </span>
          {sharing && !videoReady ? (
            <span className="status-chip queued" style={{ marginLeft: 8 }}>
              {copy.videoWaiting}
            </span>
          ) : null}
          {videoReady ? (
            <span className="status-chip completed" style={{ marginLeft: 8 }}>
              {copy.videoReadyHint}
            </span>
          ) : null}
          {visionStatus?.configured !== true && visionStatus?.mockEnabled !== true ? (
            <span className="status-chip planned" style={{ marginLeft: 8 }}>
              {copy.visionUnconfigured}
            </span>
          ) : null}
          {visionStatus?.mockEnabled === true ? (
            <span className="status-chip queued" style={{ marginLeft: 8 }}>
              {copy.mockEnabled}
            </span>
          ) : null}
        </p>
        <p data-testid="intake-gallery-count">
          {copy.capturedCount.replace("{count}", String(session.frames.length))}
        </p>
        {shareFailed ? <p className="parser-trace">{copy.shareFailed}</p> : null}
        {captureFailed ? <p className="parser-trace">{copy.captureFailed}</p> : null}
        <video
          ref={videoRef}
          data-testid="intake-share-video"
          muted
          playsInline
          autoPlay
          style={{ width: "100%", maxHeight: 360, background: "#0b1a2e", marginTop: 12 }}
        />
      </section>

      <section className="panel" data-testid="intake-gallery">
        <h3>{copy.galleryTitle}</h3>
        {session.frames.length === 0 ? (
          <p>{copy.noFrames}</p>
        ) : (
          <div className="history-table">
            {session.frames.map((frame) => (
              <button
                key={frame.id}
                className="history-row"
                type="button"
                data-testid="intake-gallery-frame"
                onClick={() => setSelectedFrameId(frame.id)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={frame.objectUrl}
                  alt=""
                  style={{ width: 96, height: 64, objectFit: "cover" }}
                />
                <span>{new Date(frame.capturedAt).toLocaleString()}</span>
                <span className={`status-chip ${frame.extractStatus}`}>
                  {extractLabel(frame.extractStatus, copy)}
                </span>
                {frame.extractStatus === "skipped" || frame.extractStatus === "failed" ? (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      void extractFrame(frame.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.stopPropagation();
                        void extractFrame(frame.id);
                      }
                    }}
                  >
                    {copy.extractNow}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedFrame ? (
        <section className="panel">
          <h3>
            {copy.galleryTitle} · {selectedFrame.regions.length}
          </h3>
          {selectedFrame.regions.map((region) => {
            const item = region.itemId ? getItemById(region.itemId) : undefined;
            const ready = regionReadyForAnalysis(region.id);
            return (
              <div key={region.id} className="history-row" style={{ display: "block", padding: 12 }}>
                <p>
                  <span className="status-chip planned">{kindLabel(region.kind, copy)}</span>{" "}
                  <span className={`status-chip ${region.reviewState}`}>
                    {region.reviewState === "confirmed"
                      ? copy.reviewStateConfirmed
                      : region.reviewState === "rejected"
                        ? copy.reviewStateRejected
                        : copy.reviewStateDraft}
                  </span>{" "}
                  <small>
                    {item ? localize(item.itemName) : copy.unmatchedTitle} ·{" "}
                    {Math.round(region.confidence * 100)}%
                  </small>
                </p>
                {region.lots.length > 0 ? (
                  <ul>
                    {region.lots.map((lot) => (
                      <li key={`${lot.role}-${lot.lotId}`}>
                        {lot.role === "candidate" ? copy.roleCandidate : copy.roleReference} {lot.lotId}:{" "}
                        {lot.value} {lot.unit ?? ""}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <label>
                  {copy.assignItem}
                  <select
                    value={region.itemId ?? ""}
                    onChange={(event) =>
                      assignRegionItem(region.id, event.target.value || null)
                    }
                  >
                    <option value="">{copy.pickItemPlaceholder}</option>
                    {characterizationItems.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {localize(entry.itemName)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {copy.assignRole}
                  <select
                    value={region.assignedLotRole ?? ""}
                    onChange={(event) =>
                      assignRegionRole(
                        region.id,
                        event.target.value === "candidate" || event.target.value === "reference"
                          ? (event.target.value as LotRole)
                          : null,
                      )
                    }
                  >
                    <option value="">{copy.pickItemPlaceholder}</option>
                    <option value="candidate">{copy.roleCandidate}</option>
                    <option value="reference">{copy.roleReference}</option>
                  </select>
                </label>
                <div className="ingest-actions">
                  <button
                    className="primary"
                    type="button"
                    disabled={region.itemId === null}
                    onClick={() => {
                      confirmRegion(region.id);
                      if (region.kind === "spectrum") {
                        setActiveSpectrumRegionId(region.id);
                      }
                    }}
                  >
                    {copy.confirmWrite}
                  </button>
                  <button className="secondary" type="button" onClick={() => rejectRegion(region.id)}>
                    {copy.rejectRegion}
                  </button>
                  {region.kind === "spectrum" && region.reviewState === "confirmed" ? (
                    <button
                      className="quiet"
                      type="button"
                      onClick={() => setActiveSpectrumRegionId(region.id)}
                    >
                      {copy.calibrationRequired}
                    </button>
                  ) : null}
                  {region.kind === "spectrum" ? (
                    ready ? (
                      <Link
                        className="primary link-button"
                        href={`/item/${region.itemId}`}
                        onClick={() => prepareRegionForAnalysis(region.id)}
                      >
                        {copy.sendToAnalysis}
                      </Link>
                    ) : (
                      <span className="status-chip planned">{copy.sendToAnalysisBlocked}</span>
                    )
                  ) : (
                    <span className="status-chip planned">{copy.attachmentOnly}</span>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      ) : null}

      {activeSpectrumRegionId && spectrumFile ? (
        <section className="panel">
          <ImageAxisCalibrationPicker
            file={spectrumFile}
            profileId={profileId}
            disabled={false}
            onPayloadChange={onCalibrationChange}
          />
          {getRegionCalibration(activeSpectrumRegionId) ? (
            <p className="parser-trace">{copy.calibrationRequired}</p>
          ) : null}
        </section>
      ) : null}

      <section className="panel">
        <h3>{copy.unmatchedTitle}</h3>
        <p>{copy.unmatchedHint}</p>
        {unmatched.length === 0 ? (
          <p>{copy.unmatchedEmpty}</p>
        ) : (
          unmatched.map(({ region }) => (
            <div key={region.id} className="history-row">
              <span>{kindLabel(region.kind, copy)}</span>
              <span>{region.text ?? region.note ?? region.id}</span>
              <select
                value=""
                onChange={(event) => assignRegionItem(region.id, event.target.value || null)}
              >
                <option value="">{copy.pickItemPlaceholder}</option>
                {characterizationItems.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {localize(entry.itemName)}
                  </option>
                ))}
              </select>
            </div>
          ))
        )}
      </section>

      <section className="panel">
        <h3>{copy.draftsTitle}</h3>
        {draftItems.length === 0 ? (
          <p>{copy.unmatchedEmpty}</p>
        ) : (
          <ul>
            {draftItems.map((entry) => {
              const item = getItemById(entry.itemId);
              return (
                <li key={entry.itemId} id={`item-${entry.itemId}`}>
                  <Link href={`/project/intake/sponsor#item-${entry.itemId}`}>
                    {item ? localize(item.itemName) : entry.itemId}
                  </Link>{" "}
                  <span className="status-chip planned">{copy.draftChip}</span>
                </li>
              );
            })}
          </ul>
        )}
        <button className="secondary" type="button" onClick={() => setConfirmAllOpen(true)}>
          {copy.confirmAll}
        </button>
        {confirmAllOpen ? (
          <div role="dialog" aria-modal="true" className="panel" style={{ marginTop: 12 }}>
            <p>{copy.confirmAllDialog}</p>
            <div className="ingest-actions">
              <button
                className="primary"
                type="button"
                onClick={() => {
                  confirmAllScreenDrafts();
                  setConfirmAllOpen(false);
                }}
              >
                {copy.confirmAllYes}
              </button>
              <button className="quiet" type="button" onClick={() => setConfirmAllOpen(false)}>
                {copy.confirmAllNo}
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </section>
  );
}
