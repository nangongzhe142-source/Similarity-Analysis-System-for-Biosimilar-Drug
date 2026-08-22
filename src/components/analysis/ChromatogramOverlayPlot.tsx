"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";

export interface ChromatogramPoint {
  x: number;
  y: number;
}

export type OverlayPlotMode = "compare" | "reference" | "candidate";

interface ChromatogramOverlayPlotProps {
  referencePoints: ChromatogramPoint[];
  candidatePoints: ChromatogramPoint[];
  xLabel: string;
  notRetentionTime?: boolean;
  mode?: OverlayPlotMode;
}

export function ChromatogramOverlayPlot({
  referencePoints,
  candidatePoints,
  xLabel,
  notRetentionTime = false,
  mode = "compare",
}: ChromatogramOverlayPlotProps) {
  const { messages } = useLanguage();
  const [hover, setHover] = useState<string | null>(null);
  const activeReference = mode === "candidate" ? [] : referencePoints;
  const activeCandidate = mode === "reference" ? [] : candidatePoints;
  if (activeReference.length < 2 && activeCandidate.length < 2) {
    return null;
  }
  const width = 640;
  const height = 180;
  const padding = { left: 44, right: 16, top: 12, bottom: 32 };
  const xs = [...activeReference, ...activeCandidate].map((point) => point.x);
  const ys = [...activeReference, ...activeCandidate].map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys, 1e-9);
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const x = (value: number) =>
    padding.left + ((value - minX) / (maxX - minX || 1)) * innerWidth;
  const y = (value: number) => padding.top + (1 - value / maxY) * innerHeight;
  const toPath = (points: ChromatogramPoint[]) =>
    points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${x(point.x)} ${y(point.y)}`)
      .join(" ");
  const title =
    mode === "reference"
      ? messages.methodAnalysis.referenceOnlyPlotTitle
      : mode === "candidate"
        ? messages.methodAnalysis.candidateOnlyPlotTitle
        : messages.methodAnalysis.overlayPlotTitle;

  return (
    <figure>
      <figcaption className="mb-1 text-xs font-semibold text-slate-600">{title}</figcaption>
      {notRetentionTime ? (
        <p className="mb-1 text-[11px] text-amber-800">
          {messages.methodAnalysis.notRetentionTimeNote}
        </p>
      ) : null}
      <svg viewBox={`0 0 ${width} ${height}`} className="h-36 w-full sm:h-44" role="img">
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#94a3b8"
        />
        {activeReference.length >= 2 ? (
          <path d={toPath(activeReference)} fill="none" stroke="#b91c1c" strokeWidth="1.5" />
        ) : null}
        {activeCandidate.length >= 2 ? (
          <path d={toPath(activeCandidate)} fill="none" stroke="#1d4ed8" strokeWidth="1.5" />
        ) : null}
        {[...activeReference, ...activeCandidate]
          .filter((_, index) => index % 12 === 0)
          .map((point) => (
            <circle
              key={`${mode}-${point.x}-${point.y}`}
              cx={x(point.x)}
              cy={y(point.y)}
              r="3"
              fill="transparent"
              onMouseEnter={() => setHover(`${point.x.toFixed(2)}, ${point.y.toFixed(3)}`)}
              onMouseLeave={() => setHover(null)}
            />
          ))}
        <text x={padding.left} y={height - 8} className="fill-slate-500" fontSize="11">
          {minX.toFixed(1)}
        </text>
        <text
          x={width - padding.right}
          y={height - 8}
          textAnchor="end"
          className="fill-slate-500"
          fontSize="11"
        >
          {xLabel}
        </text>
      </svg>
      <ul className="mt-1 flex flex-wrap gap-3 text-[11px] text-slate-600">
        {activeReference.length >= 2 ? (
          <li className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 bg-red-700" />
            {messages.methodAnalysis.referenceTrace}
          </li>
        ) : null}
        {activeCandidate.length >= 2 ? (
          <li className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 bg-blue-700" />
            {messages.methodAnalysis.candidateTrace}
          </li>
        ) : null}
      </ul>
      <p className="text-[11px] text-slate-500">{hover ?? messages.methodAnalysis.plotHoverHint}</p>
    </figure>
  );
}
