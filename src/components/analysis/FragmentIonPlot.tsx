"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { AnalysisFragmentIon } from "@/types/analysis-contract";

interface FragmentIonPlotProps {
  ions: AnalysisFragmentIon[];
  peptideSequence?: string;
}

export function FragmentIonPlot({ ions, peptideSequence }: FragmentIonPlotProps) {
  const { messages } = useLanguage();
  const [hover, setHover] = useState<string | null>(null);
  if (ions.length === 0) {
    return null;
  }
  const width = 640;
  const height = 180;
  const padding = { left: 36, right: 16, top: 20, bottom: 32 };
  const mzValues = ions.map((ion) => ion.observedMz);
  const minMz = Math.min(...mzValues);
  const maxMz = Math.max(...mzValues);
  const innerWidth = width - padding.left - padding.right;
  const midY = padding.top + (height - padding.top - padding.bottom) / 2;
  const x = (mz: number) =>
    padding.left + ((mz - minMz) / (maxMz - minMz || 1)) * innerWidth;

  return (
    <figure>
      <figcaption className="mb-1 text-xs font-semibold text-slate-600">
        {messages.methodAnalysis.fragmentPlotTitle}
        {peptideSequence ? ` — ${peptideSequence}` : ""}
      </figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full" role="img">
        <line
          x1={padding.left}
          y1={midY}
          x2={width - padding.right}
          y2={midY}
          stroke="#94a3b8"
        />
        {ions.map((ion) => {
          const isB = ion.ionType.toLowerCase().startsWith("b");
          const y2 = isB ? padding.top : height - padding.bottom;
          return (
            <g key={`${ion.ionType}${ion.ordinal}-${ion.observedMz}`}>
              <line
                x1={x(ion.observedMz)}
                y1={midY}
                x2={x(ion.observedMz)}
                y2={y2}
                stroke={isB ? "#1d4ed8" : "#b91c1c"}
                strokeWidth="2"
                onMouseEnter={() =>
                  setHover(
                    `${ion.ionType}${ion.ordinal}  ${ion.observedMz.toFixed(2)} m/z  ${ion.errorPpm.toFixed(1)} ppm`,
                  )
                }
                onMouseLeave={() => setHover(null)}
              />
            </g>
          );
        })}
        <text x={padding.left} y={height - 8} className="fill-slate-500" fontSize="11">
          {minMz.toFixed(1)}
        </text>
        <text
          x={width - padding.right}
          y={height - 8}
          textAnchor="end"
          className="fill-slate-500"
          fontSize="11"
        >
          m/z
        </text>
      </svg>
      <p className="text-[11px] text-slate-500">{hover ?? messages.methodAnalysis.plotHoverHint}</p>
    </figure>
  );
}
