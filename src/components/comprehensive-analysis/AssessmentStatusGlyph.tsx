"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { DEMO_ASSESSMENT_STATUS } from "@/types/comprehensive-analysis";
import type { DemoAssessmentStatusSelection } from "@/types/comprehensive-analysis";

interface AssessmentStatusGlyphProps {
  status: DemoAssessmentStatusSelection;
  size?: "sm" | "lg";
  label?: string;
}

function glyphClassName(status: DemoAssessmentStatusSelection, size: "sm" | "lg"): string {
  const dimension = size === "lg" ? "h-8 w-8" : "h-5 w-5";
  if (status === DEMO_ASSESSMENT_STATUS.supportsSimilarity) {
    return `${dimension} text-brand-800`;
  }
  if (status === DEMO_ASSESSMENT_STATUS.doesNotSupportSimilarity) {
    return `${dimension} text-signal-red`;
  }
  if (status === DEMO_ASSESSMENT_STATUS.insufficientEvidence) {
    return `${dimension} text-navy-800`;
  }
  if (status === DEMO_ASSESSMENT_STATUS.notApplicable) {
    return `${dimension} text-ink-secondary`;
  }
  return `${dimension} text-line-strong`;
}

function StatusShape({ status }: { status: DemoAssessmentStatusSelection }) {
  if (status === DEMO_ASSESSMENT_STATUS.supportsSimilarity) {
    return (
      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-full w-full">
        <circle cx="10" cy="10" r="9" className="fill-cyan-100 stroke-brand-800" strokeWidth="1.5" />
        <path
          d="M6 10.5l2.5 2.5 5.5-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (status === DEMO_ASSESSMENT_STATUS.doesNotSupportSimilarity) {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-full w-full">
        <path
          d="M7 2.5h6l4.5 4.5v6L13 17.5H7L2.5 13V7z"
          className="fill-paper stroke-signal-red"
          strokeWidth="1.5"
        />
        <path
          d="M7 7l6 6M13 7l-6 6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (status === DEMO_ASSESSMENT_STATUS.insufficientEvidence) {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-full w-full">
        <rect
          x="3"
          y="3"
          width="14"
          height="14"
          rx="1"
          className="fill-canvas-muted stroke-navy-800"
          strokeWidth="1.5"
        />
        <text x="10" y="14.5" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">
          ?
        </text>
      </svg>
    );
  }
  if (status === DEMO_ASSESSMENT_STATUS.notApplicable) {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-full w-full">
        <rect
          x="10"
          y="2.5"
          width="10.5"
          height="10.5"
          rx="1"
          transform="rotate(45 10 2.5)"
          className="fill-canvas-muted stroke-ink-secondary"
          strokeWidth="1.5"
        />
        <path d="M6.5 10h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-full w-full">
      <circle
        cx="10"
        cy="10"
        r="7.5"
        className="stroke-line-strong"
        strokeWidth="1.5"
        strokeDasharray="3 2"
      />
    </svg>
  );
}

export function AssessmentStatusGlyph({
  status,
  size = "sm",
  label,
}: AssessmentStatusGlyphProps) {
  const { messages } = useLanguage();
  const copy = messages.comprehensiveAnalysis;
  const resolvedLabel =
    label ??
    (status === DEMO_ASSESSMENT_STATUS.supportsSimilarity
      ? copy.statusSupports
      : status === DEMO_ASSESSMENT_STATUS.doesNotSupportSimilarity
        ? copy.statusDoesNotSupport
        : status === DEMO_ASSESSMENT_STATUS.insufficientEvidence
          ? copy.statusInsufficient
          : status === DEMO_ASSESSMENT_STATUS.notApplicable
            ? copy.statusNotApplicable
            : copy.statusUnset);

  return (
    <span className="inline-flex items-center gap-2">
      <span className={glyphClassName(status, size)}>
        <StatusShape status={status} />
      </span>
      <span className={size === "lg" ? "text-xl font-bold sm:text-2xl" : "text-sm font-medium"}>
        {resolvedLabel}
      </span>
    </span>
  );
}
