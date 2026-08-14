"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  BSA_DISULFIDE_COUNT,
  BSA_MATURE_SEQUENCE,
  HEXOSE_MASS_SHIFT_DA,
} from "@/data/live-demos";
import { deconvolveAgainstTheory } from "@/lib/live-demo/charge-deconvolution";
import {
  computeProteinMass,
  normalizeProteinSequence,
} from "@/lib/live-demo/protein-mass";

function formatDa(value: number): string {
  return `${value.toFixed(2)} Da`;
}

function EnvelopePlot({
  peaks,
}: {
  peaks: { mz: number; intensity: number }[];
}) {
  const width = 640;
  const height = 160;
  const padding = { left: 36, right: 12, top: 10, bottom: 28 };
  const maxIntensity = Math.max(...peaks.map((peak) => peak.intensity), 1);
  const minMz = Math.min(...peaks.map((peak) => peak.mz));
  const maxMz = Math.max(...peaks.map((peak) => peak.mz));
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const x = (mz: number) =>
    padding.left + ((mz - minMz) / (maxMz - minMz || 1)) * innerWidth;
  const y = (intensity: number) =>
    padding.top + (1 - intensity / maxIntensity) * innerHeight;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full" role="img">
      <line
        x1={padding.left}
        y1={padding.top + innerHeight}
        x2={width - padding.right}
        y2={padding.top + innerHeight}
        stroke="#94a3b8"
        strokeWidth="1"
      />
      {peaks.map((peak) => (
        <line
          key={peak.mz}
          x1={x(peak.mz)}
          y1={y(0)}
          x2={x(peak.mz)}
          y2={y(peak.intensity)}
          stroke="#0f766e"
          strokeWidth="2"
        />
      ))}
      <text x={padding.left} y={height - 8} className="fill-slate-500" fontSize="11">
        {minMz.toFixed(0)}
      </text>
      <text
        x={width - padding.right}
        y={height - 8}
        textAnchor="end"
        className="fill-slate-500"
        fontSize="11"
      >
        {maxMz.toFixed(0)} m/z
      </text>
    </svg>
  );
}

export function IntactMassDemo() {
  const { messages } = useLanguage();
  const copy = messages.liveDemo;
  const [sequenceText, setSequenceText] = useState(BSA_MATURE_SEQUENCE);
  const [disulfideCount, setDisulfideCount] = useState(String(BSA_DISULFIDE_COUNT));
  const [hasRun, setHasRun] = useState(false);

  const result = useMemo(() => {
    if (!hasRun) {
      return null;
    }
    const sequence = normalizeProteinSequence(sequenceText);
    const bonds = Number(disulfideCount);
    if (sequence.length === 0 || !Number.isFinite(bonds) || bonds < 0) {
      return { error: true as const };
    }
    const mass = computeProteinMass(sequence, bonds);
    const reference = deconvolveAgainstTheory(mass.oxidizedAverageMassDa);
    const candidateTruth = mass.oxidizedAverageMassDa + HEXOSE_MASS_SHIFT_DA;
    const candidate = deconvolveAgainstTheory(candidateTruth);
    const observedShift = candidate.recoveredMassDa - reference.recoveredMassDa;
    return {
      error: false as const,
      mass,
      reference,
      candidate,
      observedShift,
      attributable: Math.abs(observedShift - HEXOSE_MASS_SHIFT_DA) <= 5,
    };
  }, [hasRun, sequenceText, disulfideCount]);

  return (
    <div className="flex flex-col gap-3 text-left">
      <div className="flex flex-wrap gap-2 text-[11px]">
        <span className="rounded bg-sky-100 px-1.5 py-0.5 font-semibold text-sky-900">
          {copy.publicSequenceTag}
        </span>
        <span className="rounded bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-900">
          {copy.syntheticTag}
        </span>
      </div>
      <label className="text-xs font-semibold text-slate-700">
        {copy.sequenceLabel}
        <textarea
          value={sequenceText}
          onChange={(event) => {
            setSequenceText(event.target.value);
            setHasRun(false);
          }}
          rows={4}
          className="mt-1 w-full rounded border border-slate-300 bg-white p-2 font-mono text-[11px] leading-relaxed text-slate-800"
        />
      </label>
      <label className="text-xs font-semibold text-slate-700">
        {copy.disulfideLabel}
        <input
          type="number"
          min={0}
          value={disulfideCount}
          onChange={(event) => {
            setDisulfideCount(event.target.value);
            setHasRun(false);
          }}
          className="ml-2 w-20 rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs"
        />
      </label>
      <button
        type="button"
        onClick={() => setHasRun(true)}
        className="self-start rounded bg-teal-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-800"
      >
        {hasRun ? copy.rerunButton : copy.runButton}
      </button>
      {result?.error ? (
        <p className="text-sm text-rose-700">{copy.failLabel}</p>
      ) : null}
      {result && !result.error ? (
        <div className="flex flex-col gap-3">
          <dl className="grid gap-1 text-xs sm:grid-cols-2">
            <div>
              <dt className="inline font-semibold">{copy.residueCountLabel}：</dt>
              <dd className="inline">{result.mass.residueCount}</dd>
            </div>
            <div>
              <dt className="inline font-semibold">{copy.cysteineCountLabel}：</dt>
              <dd className="inline">{result.mass.cysteineCount}</dd>
            </div>
            <div>
              <dt className="inline font-semibold">{copy.reducedMassLabel}：</dt>
              <dd className="inline font-mono">{formatDa(result.mass.reducedAverageMassDa)}</dd>
            </div>
            <div>
              <dt className="inline font-semibold">{copy.oxidizedMassLabel}：</dt>
              <dd className="inline font-mono">{formatDa(result.mass.oxidizedAverageMassDa)}</dd>
            </div>
            <div>
              <dt className="inline font-semibold">{copy.recoveredMassLabel}：</dt>
              <dd className="inline font-mono">{formatDa(result.reference.recoveredMassDa)}</dd>
            </div>
            <div>
              <dt className="inline font-semibold">{copy.deviationLabel}：</dt>
              <dd className="inline font-mono">
                {result.reference.deviationDa >= 0 ? "+" : ""}
                {result.reference.deviationDa.toFixed(4)} Da (
                {result.reference.deviationPpm.toFixed(2)} ppm)
              </dd>
            </div>
            <div>
              <dt className="inline font-semibold">{copy.chargeLabel}：</dt>
              <dd className="inline">{result.reference.inferredChargeOfBasePeak}+</dd>
            </div>
            <div>
              <dt className="inline font-semibold">{copy.hexoseShiftLabel}：</dt>
              <dd className="inline font-mono">+{HEXOSE_MASS_SHIFT_DA.toFixed(4)} Da</dd>
            </div>
            <div>
              <dt className="inline font-semibold">{copy.observedShiftLabel}：</dt>
              <dd className="inline font-mono">
                {result.observedShift >= 0 ? "+" : ""}
                {result.observedShift.toFixed(2)} Da
              </dd>
            </div>
          </dl>
          <p
            className={`rounded px-2 py-1 text-xs font-semibold ${
              result.reference.withinTolerance && result.attributable
                ? "bg-emerald-100 text-emerald-900"
                : "bg-rose-100 text-rose-900"
            }`}
          >
            {result.reference.withinTolerance && result.attributable
              ? `${copy.passLabel} · ${copy.attributableLabel}`
              : copy.failLabel}
          </p>
          <EnvelopePlot peaks={result.reference.peaks} />
          <p className="text-[11px] text-slate-500">{copy.envelopeCaption}</p>
        </div>
      ) : null}
    </div>
  );
}
