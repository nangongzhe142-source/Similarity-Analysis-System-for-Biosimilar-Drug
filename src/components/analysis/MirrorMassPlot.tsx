"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";

export type MirrorPlotMode = "compare" | "reference" | "candidate";

interface MirrorMassPlotProps {
  referenceMassesDa: number[];
  candidateMassesDa: number[];
  mode?: MirrorPlotMode;
}

function PlotLegend({
  referenceLabel,
  candidateLabel,
  showReference,
  showCandidate,
}: {
  referenceLabel: string;
  candidateLabel: string;
  showReference: boolean;
  showCandidate: boolean;
}) {
  return (
    <ul className="mt-1 flex flex-wrap gap-3 text-[11px] text-slate-600">
      {showReference ? (
        <li className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 bg-red-700" />
          {referenceLabel}
        </li>
      ) : null}
      {showCandidate ? (
        <li className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 bg-blue-700" />
          {candidateLabel}
        </li>
      ) : null}
    </ul>
  );
}

export function MirrorMassPlot({
  referenceMassesDa,
  candidateMassesDa,
  mode = "compare",
}: MirrorMassPlotProps) {
  const { messages } = useLanguage();
  const [hover, setHover] = useState<string | null>(null);
  const massesForAxis =
    mode === "reference"
      ? referenceMassesDa
      : mode === "candidate"
        ? candidateMassesDa
        : [...referenceMassesDa, ...candidateMassesDa];
  if (massesForAxis.length === 0) {
    return null;
  }
  const width = 640;
  const height = mode === "compare" ? 180 : 140;
  const padding = { left: 52, right: 16, top: 16, bottom: 32 };
  const minMass = Math.min(...massesForAxis);
  const maxMass = Math.max(...massesForAxis);
  const span = maxMass - minMass || 1;
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const midY = padding.top + innerHeight / 2;
  const baseY = height - padding.bottom;
  const x = (mass: number) => padding.left + ((mass - minMass) / span) * innerWidth;
  const title =
    mode === "reference"
      ? messages.methodAnalysis.referenceOnlyPlotTitle
      : mode === "candidate"
        ? messages.methodAnalysis.candidateOnlyPlotTitle
        : messages.methodAnalysis.mirrorPlotTitle;
  const showReference = mode !== "candidate";
  const showCandidate = mode !== "reference";

  const sticks =
    mode === "compare" ? (
      <>
        {referenceMassesDa.map((mass) => (
          <line
            key={`r-${mass}`}
            x1={x(mass)}
            y1={midY}
            x2={x(mass)}
            y2={padding.top}
            stroke="#b91c1c"
            strokeWidth="2"
            onMouseEnter={() =>
              setHover(`${messages.methodAnalysis.referenceTrace}: ${mass.toFixed(2)} Da`)
            }
            onMouseLeave={() => setHover(null)}
          />
        ))}
        {candidateMassesDa.map((mass) => (
          <line
            key={`c-${mass}`}
            x1={x(mass)}
            y1={midY}
            x2={x(mass)}
            y2={height - padding.bottom}
            stroke="#1d4ed8"
            strokeWidth="2"
            onMouseEnter={() =>
              setHover(`${messages.methodAnalysis.candidateTrace}: ${mass.toFixed(2)} Da`)
            }
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </>
    ) : (
      massesForAxis.map((mass) => (
        <line
          key={`${mode}-${mass}`}
          x1={x(mass)}
          y1={baseY}
          x2={x(mass)}
          y2={padding.top}
          stroke={mode === "reference" ? "#b91c1c" : "#1d4ed8"}
          strokeWidth="2"
          onMouseEnter={() =>
            setHover(
              `${mode === "reference" ? messages.methodAnalysis.referenceTrace : messages.methodAnalysis.candidateTrace}: ${mass.toFixed(2)} Da`,
            )
          }
          onMouseLeave={() => setHover(null)}
        />
      ))
    );

  return (
    <figure>
      <figcaption className="mb-1 text-xs font-semibold text-slate-600">{title}</figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-36 w-full sm:h-44" role="img">
        <line
          x1={padding.left}
          y1={mode === "compare" ? midY : baseY}
          x2={width - padding.right}
          y2={mode === "compare" ? midY : baseY}
          stroke="#94a3b8"
        />
        {sticks}
        {mode === "compare" ? (
          <>
            <text x={4} y={padding.top + 10} className="fill-red-700" fontSize="11">
              {messages.methodAnalysis.referenceTrace}
            </text>
            <text x={4} y={height - padding.bottom + 10} className="fill-blue-700" fontSize="11">
              {messages.methodAnalysis.candidateTrace}
            </text>
          </>
        ) : null}
        <text x={padding.left} y={height - 8} className="fill-slate-500" fontSize="11">
          {minMass.toFixed(1)}
        </text>
        <text
          x={width - padding.right}
          y={height - 8}
          textAnchor="end"
          className="fill-slate-500"
          fontSize="11"
        >
          {maxMass.toFixed(1)} Da
        </text>
      </svg>
      <PlotLegend
        referenceLabel={messages.methodAnalysis.referenceTrace}
        candidateLabel={messages.methodAnalysis.candidateTrace}
        showReference={showReference}
        showCandidate={showCandidate}
      />
      <p className="text-[11px] text-slate-500">{hover ?? messages.methodAnalysis.plotHoverHint}</p>
    </figure>
  );
}
