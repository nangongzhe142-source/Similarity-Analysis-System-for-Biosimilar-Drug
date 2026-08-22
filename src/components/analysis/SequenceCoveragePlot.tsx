"use client";

import { useLanguage } from "@/i18n/LanguageProvider";

const RESIDUES_PER_ROW = 50;

interface SequenceCoveragePlotProps {
  sequenceLength: number;
  uncoveredRegions: string[];
  coveragePercent: number;
}

function uncoveredSet(regions: string[], sequenceLength: number): Set<number> {
  const uncovered = new Set<number>();
  for (const region of regions) {
    if (region.includes("-")) {
      const [startText, endText] = region.split("-", 2);
      const start = Number(startText);
      const end = Number(endText);
      for (let position = start; position <= end; position += 1) {
        if (position >= 1 && position <= sequenceLength) {
          uncovered.add(position);
        }
      }
    } else {
      const position = Number(region);
      if (position >= 1 && position <= sequenceLength) {
        uncovered.add(position);
      }
    }
  }
  return uncovered;
}

export function SequenceCoveragePlot({
  sequenceLength,
  uncoveredRegions,
  coveragePercent,
}: SequenceCoveragePlotProps) {
  const { messages } = useLanguage();
  if (sequenceLength <= 0) {
    return null;
  }
  const uncovered = uncoveredSet(uncoveredRegions, sequenceLength);
  const rowCount = Math.ceil(sequenceLength / RESIDUES_PER_ROW);
  const cell = 10;
  const width = RESIDUES_PER_ROW * cell + 8;
  const height = rowCount * cell + 8;

  return (
    <figure>
      <figcaption className="mb-1 text-xs font-semibold text-slate-600">
        {messages.methodAnalysis.coveragePlotTitle} ({coveragePercent.toFixed(2)}%)
      </figcaption>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ maxHeight: Math.min(240, rowCount * 14) }}
        role="img"
      >
        {Array.from({ length: sequenceLength }, (_, index) => {
          const position = index + 1;
          const row = Math.floor(index / RESIDUES_PER_ROW);
          const column = index % RESIDUES_PER_ROW;
          const covered = !uncovered.has(position);
          return (
            <rect
              key={position}
              x={column * cell + 1}
              y={row * cell + 1}
              width={cell - 1}
              height={cell - 1}
              fill={covered ? "#cbd5e1" : "#ffffff"}
              stroke="#94a3b8"
              strokeWidth="0.4"
            >
              <title>{`${position}: ${covered ? "covered" : "uncovered"}`}</title>
            </rect>
          );
        })}
      </svg>
      <p className="mt-1 text-[11px] text-slate-500">
        {messages.methodAnalysis.coveragePlotCaption}
      </p>
    </figure>
  );
}
