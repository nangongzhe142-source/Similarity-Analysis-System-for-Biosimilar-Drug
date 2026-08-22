"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import type { AnalysisResult } from "@/types/analysis-contract";

interface AnalysisProvenancePanelProps {
  result: AnalysisResult;
}

export function AnalysisProvenancePanel({ result }: AnalysisProvenancePanelProps) {
  const { localize, messages } = useLanguage();
  const copy = messages.methodAnalysis;
  const provenance = result.provenance;
  const parameterEntries = Object.entries(result.evidence.parameters).filter(
    ([, value]) => value !== null && typeof value !== "object",
  );

  return (
    <details className="rounded-lg border border-slate-300 bg-slate-50 open:[&_summary_span:first-child]:rotate-90">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-800 marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="mr-2 inline-block text-teal-700 transition-transform">▸</span>
        {copy.provenanceTitle}
        <span className="ml-2 font-normal text-slate-500">— {localize(provenance.summary)}</span>
      </summary>
      <div className="space-y-3 border-t border-slate-200 px-4 py-3 text-xs leading-relaxed text-slate-700">
        <section>
          <h4 className="font-semibold text-slate-900">{copy.provenanceWhatItIs}</h4>
          <p className="mt-1">{localize(provenance.whatItIs)}</p>
        </section>
        <section>
          <h4 className="font-semibold text-slate-900">{copy.provenanceWhatItIsNot}</h4>
          <p className="mt-1">{localize(provenance.whatItIsNot)}</p>
        </section>
        <section>
          <h4 className="font-semibold text-slate-900">{copy.provenanceDataSource}</h4>
          <p className="mt-1">{localize(provenance.dataSource)}</p>
        </section>
        <section>
          <h4 className="font-semibold text-slate-900">{copy.provenancePairing}</h4>
          <p className="mt-1">{localize(provenance.samplePairing)}</p>
          {!result.inputEvidence.samplePairing.isHeadToHeadBiosimilarDesign ? (
            <p className="mt-1 text-amber-800">{copy.notHeadToHeadNote}</p>
          ) : null}
        </section>
        <section>
          <h4 className="font-semibold text-slate-900">{copy.toolVersionsTitle}</h4>
          <ul className="mt-1 font-mono text-[11px]">
            {Object.entries(result.evidence.toolVersions).map(([name, version]) => (
              <li key={name}>
                {name}: {version}
              </li>
            ))}
          </ul>
        </section>
        {parameterEntries.length > 0 ? (
          <section>
            <h4 className="font-semibold text-slate-900">{copy.parametersTitle}</h4>
            <dl className="mt-1 grid gap-1 sm:grid-cols-2">
              {parameterEntries.map(([key, value]) => (
                <div key={key}>
                  <dt className="inline text-slate-500">{key}：</dt>
                  <dd className="inline font-mono">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
        {provenance.inputHashes.length > 0 ? (
          <section>
            <h4 className="font-semibold text-slate-900">{copy.inputHashesTitle}</h4>
            <ul className="mt-1 list-inside list-disc font-mono text-[11px]">
              {provenance.inputHashes.map((item) => (
                <li key={`${item.label}-${item.sha256}`}>
                  {item.label}: {item.sha256.slice(0, 16)}…
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {result.limitations.length > 0 ? (
          <section>
            <h4 className="font-semibold text-slate-900">{copy.limitationsTitle}</h4>
            <ul className="mt-1 list-inside list-disc">
              {result.limitations.map((limitation) => (
                <li key={limitation}>{limitation}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </details>
  );
}
