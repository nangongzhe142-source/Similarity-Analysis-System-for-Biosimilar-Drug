"use client";

import { useLanguage } from "@/i18n/LanguageProvider";

interface PeakMatchTableProps {
  matchedPeptides: string[];
  unmatchedPeptides: string[];
  deltaPpm: number[];
}

export function PeakMatchTable({
  matchedPeptides,
  unmatchedPeptides,
  deltaPpm,
}: PeakMatchTableProps) {
  const { messages } = useLanguage();
  if (matchedPeptides.length === 0 && unmatchedPeptides.length === 0) {
    return null;
  }
  const rows = matchedPeptides.map((sequence, index) => ({
    sequence,
    ppm: deltaPpm[index],
  }));

  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {messages.methodAnalysis.peakTableTitle}
      </h4>
      {rows.length > 0 ? (
        <div className="mt-1 max-h-48 overflow-auto rounded border border-slate-200">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-2 py-1 font-semibold">{messages.methodAnalysis.peptideColumn}</th>
                <th className="px-2 py-1 font-semibold">{messages.methodAnalysis.ppmColumn}</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 40).map((row) => (
                <tr key={row.sequence} className="border-t border-slate-100 font-mono">
                  <td className="px-2 py-0.5">{row.sequence}</td>
                  <td className="px-2 py-0.5">
                    {row.ppm === undefined ? "—" : row.ppm.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {unmatchedPeptides.length > 0 ? (
        <p className="mt-2 font-mono text-[11px] text-slate-600">
          {messages.methodAnalysis.unmatchedPeptidesLabel}: {unmatchedPeptides.slice(0, 8).join(", ")}
          {unmatchedPeptides.length > 8 ? " …" : ""}
        </p>
      ) : null}
    </div>
  );
}
