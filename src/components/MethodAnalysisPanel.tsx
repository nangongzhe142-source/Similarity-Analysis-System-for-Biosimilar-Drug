"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  analysisProfileById,
  methodAnalysisConfigByMethodId,
} from "@/data/method-analysis-config";
import { similaritySchemeByItemId } from "@/data/similarity-schemes";
import {
  figureLibraryEntriesForMethod,
  figureLibraryEntryByFileName,
  figureLibraryPublicUrl,
} from "@/data/figure-library-catalog";
import {
  AnalysisServiceError,
  analysisServiceBaseUrl,
  cancelAnalysisJob,
  checkAnalysisServiceHealth,
  createAnalysisJob,
  pollAnalysisJob,
  startAnalysisJob,
  uploadAnalysisFile,
} from "@/lib/analysis-service-client";
import {
  acceptAttributeForInputKinds,
  formatListForInputKinds,
} from "@/lib/analysis-uploads";
import type { AnalysisJobSnapshot } from "@/types/analysis-contract";
import type { DetectionMethod, MethodAnalysisStatus } from "@/types/models";
import { AnalysisResultView } from "@/components/analysis/AnalysisResultView";
import { ImageAxisCalibrationPicker } from "@/components/analysis/ImageAxisCalibrationPicker";
import { IntakeSourceBar } from "@/components/intake/IntakeSourceBar";
import {
  isFigureImageFileName,
  type ImageCalibrationPayload,
} from "@/lib/image-axis-calibration";
import {
  serializeWhitelistedProvenance,
  serializeWhitelistedResult,
  whitelistAnalysisProvenance,
  whitelistAnalysisResult,
} from "@/lib/assistant/analysis-result-whitelist";
import {
  publishAssistantPageContext,
  resetAssistantPageContext,
} from "@/lib/assistant/page-context";

interface MethodAnalysisPanelProps {
  itemId: string;
  method: DetectionMethod;
}

const TERMINAL_STATUSES = new Set<AnalysisJobSnapshot["status"]>([
  "SUCCEEDED",
  "FAILED",
  "CANCELLED",
]);

const STATUS_PANEL_CLASS: Record<MethodAnalysisStatus, string> = {
  analyzable: "border-teal-600 bg-teal-50/40",
  "blocked-by-tool": "border-amber-500 bg-amber-50",
  "not-yet-supported": "border-slate-400 bg-slate-50",
  "display-only": "border-slate-300 bg-slate-50",
  "rule-not-defined": "border-rose-500 bg-rose-50",
};

const STATUS_BADGE_CLASS: Record<MethodAnalysisStatus, string> = {
  analyzable: "bg-teal-700 text-white",
  "blocked-by-tool": "bg-amber-600 text-white",
  "not-yet-supported": "bg-slate-500 text-white",
  "display-only": "bg-slate-400 text-white",
  "rule-not-defined": "bg-rose-700 text-white",
};

/** One visible file slot: label, format hint, filename box, native picker. */
function AnalysisFileSlot({
  label,
  hint,
  accept,
  file,
  emptyLabel,
  disabled,
  onFileChange,
}: {
  label: string;
  hint: string;
  accept: string | undefined;
  file: File | null;
  emptyLabel: string;
  disabled: boolean;
  onFileChange: (file: File | null) => void;
}) {
  return (
    <label className="flex min-h-[8.5rem] cursor-pointer flex-col rounded border border-slate-300 bg-slate-50 p-2 hover:border-teal-600">
      <span className="text-xs font-semibold text-slate-800">{label}</span>
      <span className="mt-0.5 text-[11px] leading-snug text-slate-500">{hint}</span>
      <span
        className={
          file
            ? "mt-2 truncate rounded border border-teal-300 bg-white px-2 py-1.5 text-xs text-teal-900"
            : "mt-2 truncate rounded border border-dashed border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-400"
        }
        title={file?.name}
      >
        {file ? file.name : emptyLabel}
      </span>
      <input
        type="file"
        accept={accept}
        disabled={disabled}
        className="mt-2 w-full text-xs"
        onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
      />
    </label>
  );
}

function FigureFileThumb({ file }: { file: File }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!isFigureImageFileName(file.name)) {
      const frame = window.requestAnimationFrame(() => setUrl(null));
      return () => window.cancelAnimationFrame(frame);
    }
    const objectUrl = URL.createObjectURL(file);
    const frame = window.requestAnimationFrame(() => setUrl(objectUrl));
    return () => {
      window.cancelAnimationFrame(frame);
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);
  if (url === null) {
    return null;
  }
  return (
    <img
      src={url}
      alt={file.name}
      className="mt-2 max-h-36 w-full rounded border border-slate-200 bg-white object-contain"
    />
  );
}
function ComparisonFileSlot({
  label,
  hint,
  accept,
  files,
  firstRoleLabel,
  secondRoleLabel,
  emptyLabel,
  disabled,
  onFilesChange,
}: {
  label: string;
  hint: string;
  accept: string | undefined;
  files: File[];
  firstRoleLabel: string;
  secondRoleLabel: string;
  emptyLabel: string;
  disabled: boolean;
  onFilesChange: (files: File[]) => void;
}) {
  const first = files[0] ?? null;
  const second = files[1] ?? null;
  return (
    <label className="flex min-h-[8.5rem] cursor-pointer flex-col rounded border border-slate-300 bg-slate-50 p-2 hover:border-teal-600">
      <span className="text-xs font-semibold text-slate-800">{label}</span>
      <span className="mt-0.5 text-[11px] leading-snug text-slate-500">{hint}</span>
      <span
        className={
          first
            ? "mt-2 truncate rounded border border-teal-300 bg-white px-2 py-1.5 text-xs text-teal-900"
            : "mt-2 truncate rounded border border-dashed border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-400"
        }
        title={first?.name}
      >
        {firstRoleLabel}: {first ? first.name : emptyLabel}
      </span>
      <span
        className={
          second
            ? "mt-1 truncate rounded border border-teal-300 bg-white px-2 py-1.5 text-xs text-teal-900"
            : "mt-1 truncate rounded border border-dashed border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-400"
        }
        title={second?.name}
      >
        {secondRoleLabel}: {second ? second.name : emptyLabel}
      </span>
      {first ? <FigureFileThumb file={first} /> : null}
      {second ? <FigureFileThumb file={second} /> : null}
      <input
        type="file"
        accept={accept}
        multiple
        disabled={disabled}
        className="mt-2 w-full text-xs"
        onChange={(event) =>
          onFilesChange(Array.from(event.target.files ?? []).slice(0, 2))
        }
      />
    </label>
  );
}

/** Analysis upload + job control for one detection method (P11).
 *  Renders a status-specific panel; only `analyzable` methods expose the job workflow. */
export function MethodAnalysisPanel({ itemId, method }: MethodAnalysisPanelProps) {
  const { localize, messages } = useLanguage();
  const config = methodAnalysisConfigByMethodId[method.id];
  const scheme = similaritySchemeByItemId[itemId];
  const profile = config?.profile ? analysisProfileById[config.profile] : undefined;

  const [serviceOnline, setServiceOnline] = useState<boolean | null>(null);
  const [candidateLabel, setCandidateLabel] = useState("candidate");
  const [referenceLabel, setReferenceLabel] = useState("reference");
  const [headToHead, setHeadToHead] = useState(false);
  const [measurementFiles, setMeasurementFiles] = useState<File[]>([]);
  const [sequenceFile, setSequenceFile] = useState<File | null>(null);
  const [snapshot, setSnapshot] = useState<AnalysisJobSnapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageCalibration, setImageCalibration] = useState<ImageCalibrationPayload | null>(
    null,
  );
  const pollAbortRef = useRef<AbortController | null>(null);

  const measurementAccept = useMemo(() => {
    if (!profile) return "";
    const kinds = profile.acceptedInputs.filter((kind) => kind !== "sequence");
    return acceptAttributeForInputKinds(kinds);
  }, [profile]);

  const sequenceAccept = acceptAttributeForInputKinds(["sequence"]);
  const figureFile =
    measurementFiles[0] && isFigureImageFileName(measurementFiles[0].name)
      ? measurementFiles[0]
      : null;
  const onImageCalibrationChange = useCallback((payload: ImageCalibrationPayload | null) => {
    setImageCalibration(payload);
  }, []);

  const resetJob = useCallback(() => {
    pollAbortRef.current?.abort();
    pollAbortRef.current = null;
    setSnapshot(null);
    setErrorMessage(null);
    setBusy(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const HEALTH_RETRY_MS = 4000;

    const ping = () => {
      void checkAnalysisServiceHealth().then((online) => {
        if (cancelled) return;
        setServiceOnline(online);
        if (!online) {
          retryTimer = setTimeout(ping, HEALTH_RETRY_MS);
        }
      });
    };
    ping();
    return () => {
      cancelled = true;
      if (retryTimer !== undefined) clearTimeout(retryTimer);
    };
  }, [method.id]);

  useEffect(() => {
    const status = snapshot?.status ?? config?.status ?? "";
    publishAssistantPageContext({
      analysisStatus: status,
      analysisResult: serializeWhitelistedResult(
        whitelistAnalysisResult(snapshot?.result),
      ),
      analysisProvenance: serializeWhitelistedProvenance(
        whitelistAnalysisProvenance(snapshot?.result?.provenance),
      ),
    });
    return () => {
      resetAssistantPageContext([
        "analysisStatus",
        "analysisResult",
        "analysisProvenance",
      ]);
    };
  }, [config?.status, snapshot]);

  const applyLibraryFigure = useCallback(
    async (fileName: string) => {
      setErrorMessage(null);
      try {
        const response = await fetch(
          `/api/figure-library?file=${encodeURIComponent(fileName)}`,
        );
        if (!response.ok) {
          setErrorMessage(messages.methodAnalysis.figureLibraryLoadFailed);
          return;
        }
        const blob = await response.blob();
        const file = new File([blob], fileName, {
          type: blob.type.length > 0 ? blob.type : "image/png",
        });
        setMeasurementFiles([file]);
      } catch {
        setErrorMessage(messages.methodAnalysis.figureLibraryLoadFailed);
      }
    },
    [messages.methodAnalysis.figureLibraryLoadFailed],
  );

  if (!config) {
    return null;
  }

  const statusLabel = messages.methodAnalysis.statusLabels[config.status];
  const panelClass = STATUS_PANEL_CLASS[config.status];
  const badgeClass = STATUS_BADGE_CLASS[config.status];

  const runAnalysis = async () => {
    if (!config.profile || config.status !== "analyzable") return;
    setBusy(true);
    setErrorMessage(null);
    resetJob();

    try {
      const libraryEntry = figureLibraryEntryByFileName(measurementFiles[0]?.name);
      const parameters: Record<string, unknown> = {};
      if (libraryEntry) {
        parameters.figureLibraryFileName = libraryEntry.fileName;
        if (libraryEntry.mapped && Object.keys(libraryEntry.colourRoles).length > 0) {
          parameters.colourRoles = libraryEntry.colourRoles;
        }
      }
      if (figureFile && imageCalibration) {
        parameters.imageCalibration = imageCalibration;
      }
      const created = await createAnalysisJob({
        itemId,
        methodId: method.id,
        profile: config.profile,
        candidateLabel,
        referenceLabel,
        pairingDescription: {
          zh: headToHead
            ? "用户声明为候选药与参照药头对头比较。"
            : "用户上传配对；非 PRIDE 等公共数据默认不视为头对头生物类似药设计。",
          en: headToHead
            ? "User-declared head-to-head candidate versus reference pairing."
            : "User-provided pairing; not assumed to be a head-to-head biosimilar design.",
        },
        isHeadToHeadBiosimilarDesign: headToHead,
        parameters: Object.keys(parameters).length > 0 ? parameters : undefined,
        autoStart: false,
      });
      setSnapshot(created);

      let current = created;
      const candidateFile = measurementFiles[0] ?? null;
      const referenceFile = measurementFiles[1] ?? null;
      if (candidateFile) {
        current = await uploadAnalysisFile(created.jobId, "candidate", candidateFile);
        setSnapshot(current);
      }
      if (referenceFile) {
        current = await uploadAnalysisFile(created.jobId, "reference", referenceFile);
        setSnapshot(current);
      }
      if (sequenceFile) {
        current = await uploadAnalysisFile(created.jobId, "sequence", sequenceFile);
        setSnapshot(current);
      }

      current = await startAnalysisJob(created.jobId);
      setSnapshot(current);

      const controller = new AbortController();
      pollAbortRef.current = controller;
      const finished = await pollAnalysisJob(created.jobId, setSnapshot, controller.signal);
      setSnapshot(finished);
    } catch (error) {
      const message =
        error instanceof AnalysisServiceError
          ? error.message
          : messages.methodAnalysis.genericError;
      setErrorMessage(message);
    } finally {
      setBusy(false);
    }
  };

  const cancelJob = async () => {
    if (!snapshot || TERMINAL_STATUSES.has(snapshot.status)) return;
    setBusy(true);
    setErrorMessage(null);
    try {
      pollAbortRef.current?.abort();
      const cancelled = await cancelAnalysisJob(snapshot.jobId);
      setSnapshot(cancelled);
    } catch (error) {
      setErrorMessage(
        error instanceof AnalysisServiceError
          ? error.message
          : messages.methodAnalysis.genericError,
      );
    } finally {
      setBusy(false);
    }
  };

  const methodLibraryEntries = figureLibraryEntriesForMethod(method.id);
  const libraryEntry = figureLibraryEntryByFileName(measurementFiles[0]?.name);
  const libraryMismatch =
    libraryEntry?.mapped === true &&
    libraryEntry.itemId !== null &&
    libraryEntry.itemId !== itemId;
  const libraryExcluded = libraryEntry?.mapped === false;

  const showWorkflow = config.status === "analyzable" && profile !== undefined;
  const workflowProfile = profile;
  const running =
    snapshot !== null &&
    !TERMINAL_STATUSES.has(snapshot.status);

  return (
    <section className={`rounded-lg border-2 p-5 ${panelClass}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${badgeClass}`}>
              {statusLabel}
            </span>
            {scheme?.completeness === "complete" ? (
              <span className="rounded border border-teal-600 px-2 py-0.5 text-[11px] font-medium text-teal-800">
                {messages.methodAnalysis.ruleCompleteTag}
              </span>
            ) : scheme?.completeness === "partial" ? (
              <span className="rounded border border-amber-500 px-2 py-0.5 text-[11px] font-medium text-amber-900">
                {messages.methodAnalysis.rulePartialTag}
              </span>
            ) : config.status === "rule-not-defined" ? (
              <span className="rounded border border-rose-600 px-2 py-0.5 text-[11px] font-semibold text-rose-800">
                {messages.methodAnalysis.ruleAbsentTag}
              </span>
            ) : null}
          </div>
          <h3 className="mt-2 text-sm font-semibold text-slate-900">
            {messages.methodAnalysis.sectionTitle}
          </h3>
          {profile ? (
            <p className="mt-1 text-sm text-slate-700">{localize(profile.summary)}</p>
          ) : null}
        </div>
        {config.plannedIn ? (
          <span className="text-[11px] text-slate-500">
            {messages.methodAnalysis.plannedInLabel}: {config.plannedIn}
          </span>
        ) : null}
      </div>

      {config.status === "rule-not-defined" ? (
        <p className="mt-3 rounded border border-rose-300 bg-white px-3 py-2 text-sm font-semibold text-rose-900">
          {messages.methodAnalysis.sheet3RuleUndefined}
        </p>
      ) : null}

      {scheme?.notDefinedReason ? (
        <p className="mt-3 text-sm leading-relaxed text-slate-800">
          {localize(scheme.notDefinedReason)}
        </p>
      ) : config.statusReason ? (
        <p className="mt-3 text-sm leading-relaxed text-slate-800">{localize(config.statusReason)}</p>
      ) : null}

      {config.blockedBy && config.blockedBy.length > 0 ? (
        <p className="mt-2 text-xs font-medium text-amber-900">
          {messages.methodAnalysis.blockedByLabel}: {config.blockedBy.join(", ")}
        </p>
      ) : null}

      {profile && profile.scientificBoundaries.length > 0 ? (
        <ul className="mt-3 list-inside list-disc text-xs leading-relaxed text-slate-600">
          {profile.scientificBoundaries.slice(0, 2).map((boundary) => (
            <li key={boundary.zh}>{localize(boundary)}</li>
          ))}
        </ul>
      ) : null}

      {showWorkflow && workflowProfile ? (
        <div className="mt-4 border-t border-slate-200/80 pt-4">
          <IntakeSourceBar
            itemId={itemId}
            onUseFiles={(files) => {
              const next = [files.candidate, files.reference].filter(
                (file): file is File => file !== null,
              );
              if (next.length > 0) {
                setMeasurementFiles(next);
              }
            }}
          />
          {serviceOnline === false ? (
            <div className="rounded border border-rose-300 bg-white p-3 text-sm text-rose-900">
              <p className="font-semibold">{messages.methodAnalysis.serviceOfflineTitle}</p>
              <p className="mt-1 text-xs">
                {messages.methodAnalysis.serviceOfflineText.replace(
                  "{url}",
                  analysisServiceBaseUrl(),
                )}
              </p>
            </div>
          ) : (
            <>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-xs">
                  <span className="font-medium text-slate-700">
                    {messages.methodAnalysis.candidateLabelField}
                  </span>
                  <input
                    type="text"
                    value={candidateLabel}
                    onChange={(event) => setCandidateLabel(event.target.value)}
                    className="rounded border border-slate-300 px-2 py-1 text-sm"
                    disabled={busy || running}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  <span className="font-medium text-slate-700">
                    {messages.methodAnalysis.referenceLabelField}
                  </span>
                  <input
                    type="text"
                    value={referenceLabel}
                    onChange={(event) => setReferenceLabel(event.target.value)}
                    className="rounded border border-slate-300 px-2 py-1 text-sm"
                    disabled={busy || running}
                  />
                </label>
              </div>

              <label className="mt-3 flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={headToHead}
                  onChange={(event) => setHeadToHead(event.target.checked)}
                  disabled={busy || running}
                />
                {messages.methodAnalysis.headToHeadLabel}
              </label>

              <div className="mt-3 rounded-md border-2 border-slate-400 bg-white p-3">
                <p className="text-sm font-semibold text-slate-900">
                  {messages.methodAnalysis.inputFilesBoxTitle}
                </p>
                <p className="mt-1 text-xs text-slate-500">{messages.methodAnalysis.uploadHint}</p>
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <ComparisonFileSlot
                    label={messages.methodAnalysis.comparisonFileLabel}
                    hint={`${messages.methodAnalysis.comparisonFileHint} ${formatListForInputKinds(
                      workflowProfile.acceptedInputs.filter((kind) => kind !== "sequence"),
                    )}`}
                    accept={measurementAccept}
                    files={measurementFiles}
                    firstRoleLabel={messages.methodAnalysis.comparisonSelectedFirst}
                    secondRoleLabel={messages.methodAnalysis.comparisonSelectedSecond}
                    emptyLabel={messages.methodAnalysis.fileEmptyPlaceholder}
                    disabled={busy || running}
                    onFilesChange={setMeasurementFiles}
                  />
                  <AnalysisFileSlot
                    label={messages.methodAnalysis.sequenceFileLabel}
                    hint={formatListForInputKinds(["sequence"])}
                    accept={sequenceAccept}
                    file={sequenceFile}
                    emptyLabel={messages.methodAnalysis.fileEmptyPlaceholder}
                    disabled={busy || running}
                    onFileChange={setSequenceFile}
                  />
                </div>
                {methodLibraryEntries.length > 0 ? (
                  <ul className="mt-3 grid gap-3 lg:grid-cols-2">
                    {methodLibraryEntries.map((entry) => (
                      <li
                        key={entry.sha256}
                        className="rounded-sm border border-line bg-paper p-2"
                      >
                        <img
                          src={figureLibraryPublicUrl(entry.fileName)}
                          alt={entry.fileName}
                          className="mb-2 max-h-36 w-full bg-white object-contain"
                        />
                        <button
                          type="button"
                          disabled={busy || running}
                          onClick={() => void applyLibraryFigure(entry.fileName)}
                          className="tap-target w-full rounded-sm border border-line bg-canvas-muted px-3 py-2 text-left text-xs font-semibold text-navy-900 hover:bg-coral-100 disabled:opacity-50"
                        >
                          {messages.methodAnalysis.figureLibraryUseButton} · {entry.fileName}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <p className="mt-2 text-[11px] text-slate-500">
                  {messages.methodAnalysis.syntheticFallbackNote}
                </p>
                {libraryEntry ? (
                  <p className="mt-2 text-[11px] text-slate-700">
                    {messages.methodAnalysis.figureLibraryAnnotation}:{" "}
                    {libraryEntry.drugAnnotation}
                    {libraryEntry.candidateProduct
                      ? ` · ${libraryEntry.candidateProduct} / ${libraryEntry.referenceProduct}`
                      : null}
                  </p>
                ) : null}
                {libraryMismatch ? (
                  <p className="mt-2 rounded border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] text-amber-900">
                    {messages.methodAnalysis.figureLibraryMismatch}
                  </p>
                ) : null}
                {libraryExcluded ? (
                  <p className="mt-2 rounded border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] text-amber-900">
                    {messages.methodAnalysis.figureLibraryExcluded}
                  </p>
                ) : null}
                {figureFile ? (
                  <ImageAxisCalibrationPicker
                    key={`${figureFile.name}-${figureFile.size}-${figureFile.lastModified}-${workflowProfile.id}`}
                    file={figureFile}
                    profileId={workflowProfile.id}
                    disabled={busy || running}
                    onPayloadChange={onImageCalibrationChange}
                  />
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void runAnalysis()}
                  disabled={busy || running || serviceOnline === null}
                  className="rounded bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                >
                  {busy || running
                    ? messages.methodAnalysis.runningButton
                    : messages.methodAnalysis.runButton}
                </button>
                {running && snapshot ? (
                  <button
                    type="button"
                    onClick={() => void cancelJob()}
                    disabled={busy}
                    className="rounded border border-slate-400 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                  >
                    {messages.methodAnalysis.cancelButton}
                  </button>
                ) : null}
              </div>

              {snapshot ? (
                <div className="mt-3 text-xs text-slate-600">
                  <span className="font-semibold">{messages.methodAnalysis.jobStatusLabel}:</span>{" "}
                  {messages.methodAnalysis.jobStatusValues[snapshot.status]}
                  {snapshot.progress?.phase ? (
                    <span className="ml-2 text-slate-500">({snapshot.progress.phase})</span>
                  ) : null}
                </div>
              ) : null}

              {errorMessage ? (
                <p className="mt-3 rounded border border-rose-300 bg-white p-2 text-sm text-rose-800">
                  {errorMessage}
                </p>
              ) : null}

              {snapshot?.status === "FAILED" && snapshot.error ? (
                <p className="mt-3 rounded border border-rose-300 bg-white p-2 text-sm text-rose-800">
                  {localize(snapshot.error.safeMessage)}
                </p>
              ) : null}

              {snapshot?.status === "SUCCEEDED" && snapshot.result ? (
                <AnalysisResultView result={snapshot.result} />
              ) : null}
            </>
          )}
        </div>
      ) : null}

    </section>
  );
}
