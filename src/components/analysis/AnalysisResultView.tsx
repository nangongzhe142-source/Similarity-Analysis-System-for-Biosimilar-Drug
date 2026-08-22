"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { AnalysisProvenancePanel } from "@/components/analysis/AnalysisProvenancePanel";
import { ChromatogramOverlayPlot } from "@/components/analysis/ChromatogramOverlayPlot";
import { FragmentIonPlot } from "@/components/analysis/FragmentIonPlot";
import { MirrorMassPlot } from "@/components/analysis/MirrorMassPlot";
import { PeakMatchTable } from "@/components/analysis/PeakMatchTable";
import { SequenceCoveragePlot } from "@/components/analysis/SequenceCoveragePlot";
import { similaritySchemeByItemId } from "@/data/similarity-schemes";
import { downloadAnalysisArtifact } from "@/lib/analysis-service-client";
import type {
  AnalysisChromatogramPeak,
  AnalysisImageComparison,
  AnalysisQualityGate,
  AnalysisResult,
  ImageComparisonOutcome,
} from "@/types/analysis-contract";

interface AnalysisResultViewProps {
  result: AnalysisResult;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function chromatogramPointsFromUnknown(value: unknown): { x: number; y: number }[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const points: { x: number; y: number }[] = [];
  for (const entry of value) {
    const record = asRecord(entry);
    if (!record) continue;
    const x = Number(record.retentionTime ?? record.x);
    const y = Number(record.intensity ?? record.y);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      points.push({ x, y });
    }
  }
  return points;
}

function overlayTracesFromParameters(parameters: Record<string, unknown>): {
  reference: { x: number; y: number }[];
  candidate: { x: number; y: number }[];
} {
  const normalized = asRecord(parameters.normalizedTraces);
  if (!normalized) {
    return { reference: [], candidate: [] };
  }
  const directReference = chromatogramPointsFromUnknown(normalized.reference);
  const directCandidate = chromatogramPointsFromUnknown(normalized.candidate);
  if (directReference.length > 0 || directCandidate.length > 0) {
    return { reference: directReference, candidate: directCandidate };
  }
  const roles = asRecord(parameters.colourRoles);
  let referenceKey = "red";
  let candidateKey = "blue";
  if (roles) {
    for (const [colour, role] of Object.entries(roles)) {
      if (role === "reference") referenceKey = colour;
      if (role === "candidate") candidateKey = colour;
    }
  }
  return {
    reference: chromatogramPointsFromUnknown(normalized[referenceKey]),
    candidate: chromatogramPointsFromUnknown(normalized[candidateKey]),
  };
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function sequenceLengthFromResult(result: AnalysisResult): number {
  const raw = result.evidence.parameters.sequenceLength;
  if (typeof raw === "number" && raw > 0) {
    return raw;
  }
  return 0;
}

function downloadJsonResult(result: AnalysisResult): void {
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `analysis-${result.jobId}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function verdictBadgeClass(verdict: AnalysisResult["verdict"]): string {
  switch (verdict) {
    case "SUPPORTED_BY_THIS_ATTRIBUTE":
      return "bg-emerald-100 text-emerald-900 border-emerald-300";
    case "DIFFERENCE_DETECTED":
      return "bg-rose-100 text-rose-900 border-rose-300";
    case "RULE_NOT_DEFINED":
      return "bg-rose-100 text-rose-900 border-rose-300";
    default:
      return "bg-amber-100 text-amber-900 border-amber-300";
  }
}

function imageOutcomeBadgeClass(outcome: ImageComparisonOutcome): string {
  switch (outcome) {
    case "CONSISTENT":
      return "bg-slate-100 text-slate-800 border-slate-300";
    case "DIFFERENCE_OBSERVED":
      return "bg-orange-100 text-orange-900 border-orange-300";
    case "NOT_APPLICABLE":
      return "bg-slate-50 text-slate-600 border-slate-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-300";
  }
}

interface ImagePeakPairRow {
  firstNormalisedPosition: number | null;
  secondNormalisedPosition: number | null;
  firstAxisValue: number | null;
  secondAxisValue: number | null;
  normalisedShift: number | null;
  matched: boolean;
}

function imagePeakPairsFromParameters(parameters: Record<string, unknown>): ImagePeakPairRow[] {
  const raw = parameters.peakPairs;
  if (!Array.isArray(raw)) {
    return [];
  }
  const rows: ImagePeakPairRow[] = [];
  for (const entry of raw) {
    const record = asRecord(entry);
    if (!record) continue;
    rows.push({
      firstNormalisedPosition: isFiniteNumber(record.firstNormalisedPosition)
        ? record.firstNormalisedPosition
        : null,
      secondNormalisedPosition: isFiniteNumber(record.secondNormalisedPosition)
        ? record.secondNormalisedPosition
        : null,
      firstAxisValue: isFiniteNumber(record.firstAxisValue) ? record.firstAxisValue : null,
      secondAxisValue: isFiniteNumber(record.secondAxisValue) ? record.secondAxisValue : null,
      normalisedShift: isFiniteNumber(record.normalisedShift) ? record.normalisedShift : null,
      matched: record.matched === true,
    });
  }
  return rows;
}

export function AnalysisResultView({ result }: AnalysisResultViewProps) {
  const { localize, messages } = useLanguage();
  const features = result.extractedFeatures;
  const scheme = similaritySchemeByItemId[result.itemId];
  const masses = features.deconvolvedMassesDa ?? [];
  const referenceMasses = masses.length === 2 ? [masses[0]] : masses;
  const candidateMasses = masses.length === 2 ? [masses[1]] : [];
  const candidateChromatogram = (features.chromatogramPeaks ?? []).map(
    (peak: AnalysisChromatogramPeak) => ({
      x: peak.retentionTime,
      y: peak.intensity,
    }),
  );
  const referenceChromatogram = chromatogramPointsFromUnknown(
    result.evidence.parameters.referenceChromatogramPeaks,
  );
  const normalizedOverlay = overlayTracesFromParameters(result.evidence.parameters);
  const overlayReference =
    referenceChromatogram.length > 0 ? referenceChromatogram : normalizedOverlay.reference;
  const overlayCandidate =
    candidateChromatogram.length > 0 ? candidateChromatogram : normalizedOverlay.candidate;
  const notRetentionTime = result.evidence.parameters.normalizedTracesAreNotRetentionTime === true;
  const overlayXLabel = notRetentionTime
    ? messages.methodAnalysis.normalizedColumnLabel
    : messages.methodAnalysis.retentionTimeLabel;
  const signatures = asRecord(result.evidence.parameters.signaturePeptides);
  const innovatorPeptide =
    typeof signatures?.innovator === "string" ? signatures.innovator : undefined;
  const sequenceLength = sequenceLengthFromResult(result);
  const coveragePercent = isFiniteNumber(features.coveragePercent)
    ? features.coveragePercent
    : undefined;
  const imageComparison = features.imageComparison;
  const qualityGates = result.evidence.qualityGates ?? [];
  const imagePeakPairs = imagePeakPairsFromParameters(result.evidence.parameters);
  const imagePeakHasAxis = imagePeakPairs.some(
    (row) => row.firstAxisValue !== null || row.secondAxisValue !== null,
  );
  const artifactNames = [
    result.artifacts.mirrorPlot,
    result.artifacts.overlayPlot,
    result.artifacts.sequenceCoveragePlot,
    result.artifacts.fragmentIonPlot,
    result.artifacts.peakTable,
  ].filter((name): name is string => Boolean(name));

  return (
    <div className="mt-4 space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded border border-amber-200 bg-amber-50/60 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-900">
            {messages.methodAnalysis.regulatoryVerdictTitle}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded border px-2 py-0.5 text-xs font-semibold ${verdictBadgeClass(result.verdict)}`}
            >
              {messages.methodAnalysis.verdictLabels[result.verdict]}
            </span>
            {result.inputEvidence.dataSource === "synthetic-demo" ? (
              <span className="rounded bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                {messages.methodAnalysis.syntheticDemoTag}
              </span>
            ) : null}
            {result.inputEvidence.dataSource === "image-only" ? (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900">
                {messages.methodAnalysis.imageOnlyTag}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-slate-700">{localize(result.verdictRationale)}</p>
        </div>
        {imageComparison ? (
          <ImageComparisonCard
            comparison={imageComparison}
            labels={messages.methodAnalysis.imageComparisonOutcomes}
            title={messages.methodAnalysis.imageComparisonTitle}
            localize={localize}
          />
        ) : (
          <div className="rounded border border-dashed border-slate-200 p-3 text-[11px] text-slate-500">
            {messages.methodAnalysis.imageComparisonTitle}
          </div>
        )}
      </div>

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        {masses.length > 0 ? (
          <div>
            <dt className="font-semibold text-slate-600">{messages.methodAnalysis.massesLabel}</dt>
            <dd className="font-mono text-slate-800">
              {masses.map((mass) => mass.toFixed(2)).join(" · ")} Da
            </dd>
          </div>
        ) : null}
        {features.deltaDa && features.deltaDa.length > 0 ? (
          <div>
            <dt className="font-semibold text-slate-600">{messages.methodAnalysis.deltaDaLabel}</dt>
            <dd className="font-mono text-slate-800">
              {features.deltaDa.map((value) => value.toFixed(2)).join(" · ")} Da
            </dd>
          </div>
        ) : null}
        {coveragePercent !== undefined ? (
          <div>
            <dt className="font-semibold text-slate-600">{messages.methodAnalysis.coverageLabel}</dt>
            <dd className="text-slate-800">
              {coveragePercent.toFixed(2)}%
              {features.coverageDefinition ? ` (${features.coverageDefinition})` : null}
            </dd>
          </div>
        ) : null}
      </dl>

      {features.coveragePercentByDefinition ? (
        <ul className="text-[11px] text-slate-600">
          {Object.entries(features.coveragePercentByDefinition).map(([definition, value]) =>
            isFiniteNumber(value) ? (
              <li key={definition}>
                {definition}: {value.toFixed(1)}%
              </li>
            ) : null,
          )}
        </ul>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <MirrorMassPlot
          mode="reference"
          referenceMassesDa={referenceMasses}
          candidateMassesDa={candidateMasses}
        />
        <MirrorMassPlot
          mode="candidate"
          referenceMassesDa={referenceMasses}
          candidateMassesDa={candidateMasses}
        />
      </div>
      <MirrorMassPlot referenceMassesDa={referenceMasses} candidateMassesDa={candidateMasses} />
      <div className="grid gap-3 sm:grid-cols-2">
        <ChromatogramOverlayPlot
          mode="reference"
          referencePoints={overlayReference}
          candidatePoints={overlayCandidate}
          xLabel={overlayXLabel}
          notRetentionTime={notRetentionTime}
        />
        <ChromatogramOverlayPlot
          mode="candidate"
          referencePoints={overlayReference}
          candidatePoints={overlayCandidate}
          xLabel={overlayXLabel}
          notRetentionTime={notRetentionTime}
        />
      </div>
      <ChromatogramOverlayPlot
        referencePoints={overlayReference}
        candidatePoints={overlayCandidate}
        xLabel={overlayXLabel}
        notRetentionTime={notRetentionTime}
      />
      {coveragePercent !== undefined ? (
        <SequenceCoveragePlot
          sequenceLength={sequenceLength}
          uncoveredRegions={features.uncoveredRegions ?? []}
          coveragePercent={coveragePercent}
        />
      ) : null}
      <FragmentIonPlot
        ions={features.fragmentIons ?? []}
        peptideSequence={innovatorPeptide}
      />
      <PeakMatchTable
        matchedPeptides={features.matchedPeptides ?? []}
        unmatchedPeptides={features.unmatchedPeptides ?? []}
        deltaPpm={features.deltaPpm ?? []}
      />

      {imagePeakPairs.length > 0 ? (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {messages.methodAnalysis.imagePeakTableTitle}
          </h4>
          <div className="mt-1 max-h-48 overflow-auto rounded border border-slate-200">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-2 py-1 font-semibold">
                    {messages.methodAnalysis.referenceTrace}
                  </th>
                  <th className="px-2 py-1 font-semibold">
                    {messages.methodAnalysis.candidateTrace}
                  </th>
                  {imagePeakHasAxis ? (
                    <>
                      <th className="px-2 py-1 font-semibold">
                        {messages.methodAnalysis.imagePeakAxisColumn} (
                        {messages.methodAnalysis.referenceTrace})
                      </th>
                      <th className="px-2 py-1 font-semibold">
                        {messages.methodAnalysis.imagePeakAxisColumn} (
                        {messages.methodAnalysis.candidateTrace})
                      </th>
                    </>
                  ) : null}
                  <th className="px-2 py-1 font-semibold">
                    {messages.methodAnalysis.imagePeakShiftColumn}
                  </th>
                  <th className="px-2 py-1 font-semibold">
                    {messages.methodAnalysis.imagePeakMatchedColumn}
                  </th>
                </tr>
              </thead>
              <tbody>
                {imagePeakPairs.slice(0, 40).map((row, index) => (
                  <tr key={index} className="border-t border-slate-100 font-mono">
                    <td className="px-2 py-0.5">
                      {row.firstNormalisedPosition === null
                        ? "—"
                        : row.firstNormalisedPosition.toFixed(3)}
                    </td>
                    <td className="px-2 py-0.5">
                      {row.secondNormalisedPosition === null
                        ? "—"
                        : row.secondNormalisedPosition.toFixed(3)}
                    </td>
                    {imagePeakHasAxis ? (
                      <>
                        <td className="px-2 py-0.5">
                          {row.firstAxisValue === null ? "—" : row.firstAxisValue.toFixed(2)}
                        </td>
                        <td className="px-2 py-0.5">
                          {row.secondAxisValue === null ? "—" : row.secondAxisValue.toFixed(2)}
                        </td>
                      </>
                    ) : null}
                    <td className="px-2 py-0.5">
                      {row.normalisedShift === null ? "—" : row.normalisedShift.toFixed(3)}
                    </td>
                    <td className="px-2 py-0.5">{row.matched ? "yes" : "no"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {scheme?.completeness === "complete" ? (
        <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {messages.methodAnalysis.v2RuleConditionsTitle}
          </p>
          {scheme.decisionMethod ? (
            <p className="mt-2 whitespace-pre-wrap leading-relaxed">
              <span className="font-semibold">{messages.methodAnalysis.v2DecisionMethodLabel}: </span>
              {localize(scheme.decisionMethod)}
            </p>
          ) : null}
          {scheme.numericBoundary ? (
            <p className="mt-2 whitespace-pre-wrap leading-relaxed">
              <span className="font-semibold">
                {messages.methodAnalysis.v2NumericBoundaryLabel}:{" "}
              </span>
              {localize(scheme.numericBoundary)}
            </p>
          ) : null}
          {scheme.finalProgramRule ? (
            <p className="mt-2 whitespace-pre-wrap leading-relaxed">
              <span className="font-semibold">{messages.methodAnalysis.v2FinalRuleLabel}: </span>
              {localize(scheme.finalProgramRule)}
            </p>
          ) : null}
        </div>
      ) : null}

      {result.ruleEvaluation.length > 0 ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {messages.methodAnalysis.ruleEvaluationTitle}
          </p>
          <ul className="mt-1 space-y-1 text-sm text-slate-700">
            {result.ruleEvaluation.map((row) => (
              <li key={row.ruleId}>
                <span className="font-medium">{row.outcome}</span>
                {" — "}
                {localize(row.rationale)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {qualityGates.length > 0 ? (
        <QualityGateList
          gates={qualityGates}
          title={messages.methodAnalysis.qualityGatesTitle}
          kindLabel={messages.methodAnalysis.qualityGateKindLabel}
          localize={localize}
        />
      ) : null}

      {result.warnings.length > 0 ? (
        <div className="rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
          <p className="font-semibold">{messages.methodAnalysis.warningsTitle}</p>
          <ul className="mt-1 list-inside list-disc">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <AnalysisProvenancePanel result={result} />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => downloadJsonResult(result)}
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          {messages.methodAnalysis.downloadJson}
        </button>
        {artifactNames.map((fileName) => (
          <button
            key={fileName}
            type="button"
            onClick={() => void downloadAnalysisArtifact(result.jobId, fileName)}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            {messages.methodAnalysis.downloadPng}: {fileName}
          </button>
        ))}
      </div>
    </div>
  );
}

function ImageComparisonCard({
  comparison,
  labels,
  title,
  localize,
}: {
  comparison: AnalysisImageComparison;
  labels: Record<ImageComparisonOutcome, string>;
  title: string;
  localize: (text: { zh: string; en: string }) => string;
}) {
  return (
    <div className="rounded border border-slate-200 bg-slate-50 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">{title}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span
          className={`rounded border px-2 py-0.5 text-xs font-semibold ${imageOutcomeBadgeClass(comparison.outcome)}`}
        >
          {labels[comparison.outcome]}
        </span>
        <span className="text-[11px] text-slate-500">{comparison.thresholdKind}</span>
      </div>
      {isFiniteNumber(comparison.driverValue) ? (
        <p className="mt-1 font-mono text-[11px] text-slate-600">
          {comparison.driverMetric} = {comparison.driverValue.toFixed(3)}
        </p>
      ) : null}
      <p className="mt-2 text-sm text-slate-700">{localize(comparison.rationale)}</p>
    </div>
  );
}

function QualityGateList({
  gates,
  title,
  kindLabel,
  localize,
}: {
  gates: AnalysisQualityGate[];
  title: string;
  kindLabel: string;
  localize: (text: { zh: string; en: string }) => string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <ul className="mt-1 space-y-1 text-[11px] text-slate-700">
        {gates.map((gate) => (
          <li key={gate.name} className="rounded border border-slate-200 bg-white px-2 py-1">
            <span className="font-semibold">{gate.name}</span>
            {isFiniteNumber(gate.value) ? (
              <span className="ml-2 font-mono">
                {gate.value}
                {gate.unit ? ` ${gate.unit}` : ""}
              </span>
            ) : null}
            <span className="ml-2 text-slate-500">
              {kindLabel}: {gate.thresholdKind}
            </span>
            <p className="mt-0.5 text-slate-600">{localize(gate.purpose)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
