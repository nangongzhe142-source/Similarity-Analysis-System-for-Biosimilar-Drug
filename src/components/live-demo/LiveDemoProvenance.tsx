"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { getLiveDemoProvenance } from "@/data/live-demo-provenance";
import type { LiveDemoKind } from "@/data/live-demos";

interface LiveDemoProvenancePanelProps {
  kind: LiveDemoKind;
}

export function LiveDemoProvenancePanel({ kind }: LiveDemoProvenancePanelProps) {
  const { localize, messages } = useLanguage();
  const provenance = getLiveDemoProvenance(kind);
  const copy = messages.liveDemo;

  return (
    <details className="mt-4 rounded-lg border border-slate-300 bg-slate-50 open:[&_summary_span:first-child]:rotate-90">
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
          <h4 className="font-semibold text-slate-900">{copy.provenancePrinciple}</h4>
          <p className="mt-1">{localize(provenance.principle)}</p>
        </section>
        <section>
          <h4 className="font-semibold text-slate-900">{copy.provenanceCheck}</h4>
          <p className="mt-1">{localize(provenance.independentCheck)}</p>
        </section>
        {provenance.oracleValues.length > 0 ? (
          <section>
            <h4 className="font-semibold text-slate-900">{copy.provenanceOracle}</h4>
            <dl className="mt-1 grid gap-1 sm:grid-cols-2">
              {provenance.oracleValues.map((item) => (
                <div key={item.value}>
                  <dt className="inline text-slate-500">{localize(item.label)}：</dt>
                  <dd className="inline font-mono">{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
        <section>
          <h4 className="font-semibold text-slate-900">{copy.provenanceFiles}</h4>
          <ul className="mt-1 list-inside list-disc font-mono text-[11px]">
            {provenance.sourceFiles.map((path) => (
              <li key={path}>{path}</li>
            ))}
          </ul>
        </section>
        {provenance.externalLinks.length > 0 ? (
          <section>
            <h4 className="font-semibold text-slate-900">{copy.provenanceLinks}</h4>
            <ul className="mt-1 list-inside list-disc">
              {provenance.externalLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-800 underline underline-offset-2"
                  >
                    {localize(link.label)}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </details>
  );
}
