"use client";

import { useId } from "react";
import type { ChangeEvent } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";

const MAX_INPUT_FILE_BYTES = 2 * 1024 * 1024;
const ACCEPTED_INPUT_EXTENSIONS = ".md,.txt,.json,.markdown";

export type InputFileImportStatus = "idle" | "success" | "error";

interface InputFilePanelProps {
  importStatus: InputFileImportStatus;
  importDetail: string;
  onFileTextLoaded: (payload: { fileName: string; text: string }) => void;
  onFileRejected: (message: string) => void;
  onDownloadOutput: () => void;
}

export function InputFilePanel({
  importStatus,
  importDetail,
  onFileTextLoaded,
  onFileRejected,
  onDownloadOutput,
}: InputFilePanelProps) {
  const { messages } = useLanguage();
  const copy = messages.comprehensiveAnalysis;
  const fieldId = useId();
  const statusId = `${fieldId}-status`;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file === undefined) {
      onFileRejected(copy.inputFileEmptyError);
      return;
    }
    if (file.size === 0) {
      onFileRejected(copy.inputFileEmptyError);
      return;
    }
    if (file.size > MAX_INPUT_FILE_BYTES) {
      onFileRejected(copy.inputFileTooLarge);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        onFileRejected(copy.inputFileImportError);
        return;
      }
      onFileTextLoaded({ fileName: file.name, text: result });
    };
    reader.onerror = () => {
      onFileRejected(copy.inputFileImportError);
    };
    reader.readAsText(file);
  };

  const statusClassName =
    importStatus === "error"
      ? "text-sm text-coral-800"
      : importStatus === "success"
        ? "text-sm text-navy-800"
        : "text-sm text-ink-secondary";

  return (
    <section
      aria-labelledby="comprehensive-input-file-heading"
      className="surface-card border-l-4 border-l-brand-700 p-5"
    >
      <h2
        id="comprehensive-input-file-heading"
        className="text-lg font-semibold text-navy-900"
      >
        {copy.inputFileSectionTitle}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
        {copy.inputFileSectionDescription}
      </p>
      <p className="mt-2 text-sm text-ink-secondary">{copy.inputFileStatusColumnNote}</p>
      <p className="mt-1 text-xs text-ink-secondary">{copy.inputFileAcceptHint}</p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <label
          htmlFor={fieldId}
          className="tap-target inline-flex cursor-pointer items-center rounded-sm border border-line bg-paper px-3 text-sm font-semibold text-navy-900 hover:bg-canvas-muted"
        >
          {copy.inputFileLabel}
        </label>
        <input
          id={fieldId}
          type="file"
          accept={ACCEPTED_INPUT_EXTENSIONS}
          onChange={handleFileChange}
          aria-describedby={statusId}
          className="text-sm text-ink"
        />
        <button
          type="button"
          onClick={onDownloadOutput}
          className="tap-target rounded-sm bg-brand-800 px-3 text-sm font-semibold text-paper hover:bg-navy-800"
        >
          {copy.downloadOutputFile}
        </button>
      </div>

      <p id={statusId} className={`mt-3 ${statusClassName}`} role="status">
        {importStatus === "idle" ? copy.outputFileReadyNote : importDetail}
      </p>
    </section>
  );
}
