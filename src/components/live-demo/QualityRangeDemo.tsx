"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  formatLotList,
  SYNTHETIC_CANDIDATE_SHIFTED_LOTS,
  SYNTHETIC_CANDIDATE_SIMILAR_LOTS,
  SYNTHETIC_REFERENCE_LOTS,
} from "@/data/live-demos";
import {
  computeQualityRange,
  DEFAULT_MIN_WITHIN_RANGE_FRACTION,
  DEFAULT_SIGMA_MULTIPLIER,
  parseNumericList,
} from "@/lib/live-demo/quality-range";

type Scenario = "similar" | "shifted";

export function QualityRangeDemo() {
  const { messages } = useLanguage();
  const copy = messages.liveDemo;
  const [scenario, setScenario] = useState<Scenario>("similar");
  const [referenceText, setReferenceText] = useState(formatLotList(SYNTHETIC_REFERENCE_LOTS));
  const [candidateText, setCandidateText] = useState(
    formatLotList(SYNTHETIC_CANDIDATE_SIMILAR_LOTS),
  );
  const [sigmaText, setSigmaText] = useState(String(DEFAULT_SIGMA_MULTIPLIER));
  const [hasRun, setHasRun] = useState(false);

  const applyScenario = (nextScenario: Scenario) => {
    setScenario(nextScenario);
    setCandidateText(
      formatLotList(
        nextScenario === "similar"
          ? SYNTHETIC_CANDIDATE_SIMILAR_LOTS
          : SYNTHETIC_CANDIDATE_SHIFTED_LOTS,
      ),
    );
    setHasRun(false);
  };

  const result = useMemo(() => {
    if (!hasRun) {
      return null;
    }
    try {
      return {
        error: false as const,
        value: computeQualityRange({
          referenceValues: parseNumericList(referenceText),
          candidateValues: parseNumericList(candidateText),
          sigmaMultiplier: Number(sigmaText),
          minWithinRangeFraction: DEFAULT_MIN_WITHIN_RANGE_FRACTION,
        }),
      };
    } catch {
      return { error: true as const };
    }
  }, [hasRun, referenceText, candidateText, sigmaText]);

  return (
    <div className="flex flex-col gap-3 text-left">
      <div className="flex flex-wrap gap-2 text-[11px]">
        <span className="rounded bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-900">
          {copy.syntheticTag}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => applyScenario("similar")}
          className={`rounded border px-2 py-1 text-xs font-semibold ${
            scenario === "similar"
              ? "border-teal-600 bg-teal-50 text-teal-900"
              : "border-slate-200 bg-white text-slate-700"
          }`}
        >
          {copy.scenarioSimilar}
        </button>
        <button
          type="button"
          onClick={() => applyScenario("shifted")}
          className={`rounded border px-2 py-1 text-xs font-semibold ${
            scenario === "shifted"
              ? "border-teal-600 bg-teal-50 text-teal-900"
              : "border-slate-200 bg-white text-slate-700"
          }`}
        >
          {copy.scenarioShifted}
        </button>
      </div>
      <p className="text-[11px] text-slate-500">{copy.editHint}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-slate-700">
          {copy.referenceLotsLabel}
          <textarea
            value={referenceText}
            onChange={(event) => {
              setReferenceText(event.target.value);
              setHasRun(false);
            }}
            rows={8}
            className="mt-1 w-full rounded border border-slate-300 bg-white p-2 font-mono text-[11px]"
          />
        </label>
        <label className="text-xs font-semibold text-slate-700">
          {copy.candidateLotsLabel}
          <textarea
            value={candidateText}
            onChange={(event) => {
              setCandidateText(event.target.value);
              setHasRun(false);
            }}
            rows={8}
            className="mt-1 w-full rounded border border-slate-300 bg-white p-2 font-mono text-[11px]"
          />
        </label>
      </div>
      <label className="text-xs font-semibold text-slate-700">
        {copy.sigmaMultiplierLabel}
        <input
          type="number"
          min={0.1}
          step={0.5}
          value={sigmaText}
          onChange={(event) => {
            setSigmaText(event.target.value);
            setHasRun(false);
          }}
          className="ml-2 w-20 rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs"
        />
        <span className="ml-3 font-normal text-slate-500">
          {copy.thresholdLabel}: {(DEFAULT_MIN_WITHIN_RANGE_FRACTION * 100).toFixed(0)}%
        </span>
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
            <span className="font-semibold">{copy.meanLabel}R：</span>
            <span className="font-mono">{result.value.meanMuR.toFixed(4)}</span>
            <span className="ml-3 font-semibold">{copy.sdLabel}R：</span>
            <span className="font-mono">{result.value.sdSigmaR.toFixed(4)}</span>
          </p>
          <p>
            <span className="font-semibold">{copy.qrLabel}：</span>
            <span className="font-mono">
              [{result.value.qualityRangeLower.toFixed(4)}, {result.value.qualityRangeUpper.toFixed(4)}]
            </span>
          </p>
          <p>
            <span className="font-semibold">{copy.withinLabel}：</span>
            {result.value.withinRangeCount}/{result.value.candidateLotCount} ={" "}
            {(result.value.withinRangeFraction * 100).toFixed(1)}%
          </p>
          {result.value.outOfRangeValues.length > 0 ? (
            <p>
              <span className="font-semibold">{copy.outOfRangeLabel}：</span>
              <span className="font-mono">
                {result.value.outOfRangeValues.map((value) => value.toFixed(4)).join(", ")}
              </span>
            </p>
          ) : null}
          <p
            className={`rounded px-2 py-1 font-semibold ${
              result.value.meetsThreshold
                ? "bg-emerald-100 text-emerald-900"
                : "bg-rose-100 text-rose-900"
            }`}
          >
            {result.value.meetsThreshold ? copy.supportsSimilarity : copy.doesNotSupport}
          </p>
        </div>
      ) : null}
    </div>
  );
}
