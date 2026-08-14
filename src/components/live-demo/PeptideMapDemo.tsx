"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { BSA_MATURE_SEQUENCE, PEPTIDE_SUBSTITUTION_POSITION } from "@/data/live-demos";
import { normalizeProteinSequence } from "@/lib/live-demo/protein-mass";
import {
  digestWithTrypsin,
  introduceSubstitution,
  matchPeptidesToObservedMasses,
  observedMassesFromPeptides,
} from "@/lib/live-demo/trypsin-digest";

export function PeptideMapDemo() {
  const { messages } = useLanguage();
  const copy = messages.liveDemo;
  const [sequenceText, setSequenceText] = useState(BSA_MATURE_SEQUENCE);
  const [hasRun, setHasRun] = useState(false);

  const result = useMemo(() => {
    if (!hasRun) {
      return null;
    }
    const sequence = normalizeProteinSequence(sequenceText);
    if (sequence.length === 0) {
      return { error: true as const };
    }
    const referencePeptides = digestWithTrypsin(sequence);
    const referenceCoverage = matchPeptidesToObservedMasses(
      referencePeptides,
      observedMassesFromPeptides(referencePeptides),
      sequence.length,
    );
    const { mutated, position } = introduceSubstitution(sequence, "G", "A", PEPTIDE_SUBSTITUTION_POSITION);
    const candidatePeptides = digestWithTrypsin(mutated);
    const candidateCoverage = matchPeptidesToObservedMasses(
      referencePeptides,
      observedMassesFromPeptides(candidatePeptides),
      sequence.length,
    );
    const affected = referencePeptides.filter(
      (peptide) => peptide.start <= position && position <= peptide.end,
    );
    const unmatchedKeys = new Set(
      candidateCoverage.unmatchedPeptides.map((peptide) => `${peptide.start}-${peptide.end}`),
    );
    const exposed = affected.filter((peptide) => unmatchedKeys.has(`${peptide.start}-${peptide.end}`));
    return {
      error: false as const,
      referenceCoverage,
      position,
      exposed,
      detected: exposed.length > 0,
    };
  }, [hasRun, sequenceText]);

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
      <button
        type="button"
        onClick={() => setHasRun(true)}
        className="self-start rounded bg-teal-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-800"
      >
        {hasRun ? copy.rerunButton : copy.runButton}
      </button>
      {result?.error ? <p className="text-sm text-rose-700">{copy.failLabel}</p> : null}
      {result && !result.error ? (
        <div className="flex flex-col gap-2 text-xs">
          <p>
            <span className="font-semibold">{copy.peptideCountLabel}：</span>
            {result.referenceCoverage.theoreticalPeptideCount}
          </p>
          <p>
            <span className="font-semibold">{copy.coverageLabel}：</span>
            {result.referenceCoverage.coveragePercent.toFixed(2)}% （
            {result.referenceCoverage.coveredResidueCount}/
            {result.referenceCoverage.sequenceLength}）
          </p>
          <p>
            <span className="font-semibold">{copy.substitutionLabel}：</span>
            G{result.position}A
          </p>
          <p
            className={`rounded px-2 py-1 font-semibold ${
              result.detected ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"
            }`}
          >
            {result.detected ? copy.substitutionDetectedLabel : copy.substitutionMissedLabel}
          </p>
          {result.exposed.length > 0 ? (
            <div>
              <p className="font-semibold">{copy.unmatchedLabel}</p>
              <ul className="mt-1 list-inside list-disc font-mono text-[11px]">
                {result.exposed.map((peptide) => (
                  <li key={`${peptide.start}-${peptide.end}`}>
                    {peptide.start}–{peptide.end} {peptide.sequence}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
