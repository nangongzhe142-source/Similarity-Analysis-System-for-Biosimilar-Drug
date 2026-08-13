"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import type { SchematicFigure, SchematicFigureVariant } from "@/types/models";

/** Hand-drawn illustrations. These curves are decorative geometry, never
 *  derived from measurements — the UI always labels them as schematic. */

const CANDIDATE_COLOR = "#0f766e";
const REFERENCE_COLOR = "#64748b";

interface AxisLabels {
  x: string;
  y: string;
}

function FigureFrame({
  axisLabels,
  children,
}: {
  axisLabels: AxisLabels;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 320 190"
      role="img"
      className="h-auto w-full max-w-md"
      aria-label={`${axisLabels.y} / ${axisLabels.x}`}
    >
      <line x1="44" y1="150" x2="300" y2="150" stroke="#cbd5e1" strokeWidth="1.5" />
      <line x1="44" y1="18" x2="44" y2="150" stroke="#cbd5e1" strokeWidth="1.5" />
      {children}
      <text x="172" y="177" textAnchor="middle" fontSize="10" fill="#64748b">
        {axisLabels.x}
      </text>
      <text
        x="12"
        y="84"
        textAnchor="middle"
        fontSize="10"
        fill="#64748b"
        transform="rotate(-90 12 84)"
      >
        {axisLabels.y}
      </text>
    </svg>
  );
}

function FigureLegend({
  candidateLabel,
  referenceLabel,
}: {
  candidateLabel: string;
  referenceLabel: string;
}) {
  return (
    <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
      <li className="flex items-center gap-1.5">
        <svg viewBox="0 0 24 8" className="h-2 w-6" aria-hidden="true">
          <line x1="0" y1="4" x2="24" y2="4" stroke={CANDIDATE_COLOR} strokeWidth="2.5" />
        </svg>
        {candidateLabel}
      </li>
      <li className="flex items-center gap-1.5">
        <svg viewBox="0 0 24 8" className="h-2 w-6" aria-hidden="true">
          <line
            x1="0"
            y1="4"
            x2="24"
            y2="4"
            stroke={REFERENCE_COLOR}
            strokeWidth="2.5"
            strokeDasharray="5 3"
          />
        </svg>
        {referenceLabel}
      </li>
    </ul>
  );
}

/** Two parallel sigmoid curves offset horizontally: the geometry that makes a
 *  relative-potency calculation valid. */
function DoseResponseFigure({ axisLabels }: { axisLabels: AxisLabels }) {
  const candidatePath =
    "M56 138 C 96 138, 104 132, 122 104 S 148 34, 188 30 L 296 28";
  const referencePath =
    "M56 140 C 112 140, 122 134, 142 106 S 170 36, 210 32 L 296 30";

  return (
    <FigureFrame axisLabels={axisLabels}>
      <line
        x1="44"
        y1="30"
        x2="300"
        y2="30"
        stroke="#e2e8f0"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <line
        x1="44"
        y1="139"
        x2="300"
        y2="139"
        stroke="#e2e8f0"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <path d={referencePath} fill="none" stroke={REFERENCE_COLOR} strokeWidth="2" strokeDasharray="5 3" />
      <path d={candidatePath} fill="none" stroke={CANDIDATE_COLOR} strokeWidth="2.5" />
      <line x1="150" y1="84" x2="172" y2="84" stroke="#0f766e" strokeWidth="1" />
      <path d="M150 84 l5 -3 v6 z" fill="#0f766e" />
      <path d="M172 84 l-5 -3 v6 z" fill="#0f766e" />
      <text x="176" y="80" fontSize="9" fill="#0f766e">
        EC50
      </text>
    </FigureFrame>
  );
}

/** Association phase, steady state, then dissociation after buffer switch. */
function SprSensorgramFigure({ axisLabels }: { axisLabels: AxisLabels }) {
  const candidatePath =
    "M56 148 C 84 148, 96 74, 148 62 L 196 60 C 236 62, 262 96, 296 118";
  const referencePath =
    "M56 149 C 84 149, 98 86, 148 76 L 196 74 C 236 78, 262 108, 296 128";

  return (
    <FigureFrame axisLabels={axisLabels}>
      <line
        x1="196"
        y1="18"
        x2="196"
        y2="150"
        stroke="#e2e8f0"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <text x="120" y="32" textAnchor="middle" fontSize="9" fill="#94a3b8">
        association
      </text>
      <text x="252" y="32" textAnchor="middle" fontSize="9" fill="#94a3b8">
        dissociation
      </text>
      <path d={referencePath} fill="none" stroke={REFERENCE_COLOR} strokeWidth="2" strokeDasharray="5 3" />
      <path d={candidatePath} fill="none" stroke={CANDIDATE_COLOR} strokeWidth="2.5" />
    </FigureFrame>
  );
}

/** A main peak with a shoulder, plus a smaller pre/post peak. */
function ChromatogramFigure({ axisLabels }: { axisLabels: AxisLabels }) {
  const candidatePath =
    "M56 148 L 108 148 C 118 148, 122 44, 140 44 C 158 44, 162 148, 176 148 C 196 148, 200 122, 214 122 C 228 122, 232 148, 296 148";
  const referencePath =
    "M56 149 L 108 149 C 120 149, 124 52, 142 52 C 160 52, 164 149, 178 149 C 194 149, 198 106, 216 106 C 234 106, 238 149, 296 149";

  return (
    <FigureFrame axisLabels={axisLabels}>
      <path d={referencePath} fill="none" stroke={REFERENCE_COLOR} strokeWidth="2" strokeDasharray="5 3" />
      <path d={candidatePath} fill="none" stroke={CANDIDATE_COLOR} strokeWidth="2.5" />
      <text x="140" y="36" textAnchor="middle" fontSize="9" fill="#94a3b8">
        main peak
      </text>
      <text x="238" y="100" textAnchor="middle" fontSize="9" fill="#94a3b8">
        variant
      </text>
    </FigureFrame>
  );
}

/** Two nearly superimposed spectra — the expected look of a passing comparison. */
function SpectrumOverlayFigure({ axisLabels }: { axisLabels: AxisLabels }) {
  const candidatePath =
    "M56 60 C 84 26, 104 130, 132 118 C 160 106, 176 44, 208 52 C 244 62, 268 118, 296 108";
  const referencePath =
    "M56 64 C 84 30, 104 134, 132 122 C 160 110, 176 48, 208 56 C 244 66, 268 121, 296 111";

  return (
    <FigureFrame axisLabels={axisLabels}>
      <path d={referencePath} fill="none" stroke={REFERENCE_COLOR} strokeWidth="2" strokeDasharray="5 3" />
      <path d={candidatePath} fill="none" stroke={CANDIDATE_COLOR} strokeWidth="2.5" />
    </FigureFrame>
  );
}

export function SchematicFigureView({ figure }: { figure: SchematicFigure }) {
  const { localize, messages } = useLanguage();

  const axisLabelsByVariant: Record<SchematicFigureVariant, AxisLabels> = {
    "dose-response": {
      x: messages.referenceCase.axisLogConcentration,
      y: messages.referenceCase.axisResponse,
    },
    "spr-sensorgram": {
      x: messages.referenceCase.axisTime,
      y: messages.referenceCase.axisResponseUnit,
    },
    chromatogram: {
      x: messages.referenceCase.axisRetentionTime,
      y: messages.referenceCase.axisSignal,
    },
    "spectrum-overlay": {
      x: messages.referenceCase.axisWavelength,
      y: messages.referenceCase.axisSignal,
    },
  };

  const axisLabels = axisLabelsByVariant[figure.variant];

  const figureByVariant: Record<SchematicFigureVariant, React.ReactNode> = {
    "dose-response": <DoseResponseFigure axisLabels={axisLabels} />,
    "spr-sensorgram": <SprSensorgramFigure axisLabels={axisLabels} />,
    chromatogram: <ChromatogramFigure axisLabels={axisLabels} />,
    "spectrum-overlay": <SpectrumOverlayFigure axisLabels={axisLabels} />,
  };

  return (
    <figure className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <figcaption className="text-sm font-medium text-slate-700">
          {localize(figure.caption)}
        </figcaption>
        <span className="shrink-0 rounded-md border border-violet-300 bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-800">
          {messages.referenceCase.schematicOnlyTag}
        </span>
      </div>
      <div className="mt-3">{figureByVariant[figure.variant]}</div>
      <FigureLegend
        candidateLabel={messages.referenceCase.legendCandidate}
        referenceLabel={messages.referenceCase.legendReference}
      />
      <p className="mt-3 whitespace-pre-line text-xs leading-relaxed text-slate-600">
        {localize(figure.explanation)}
      </p>
    </figure>
  );
}
