"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import type { FigureLibraryEntry } from "@/data/figure-library-catalog";
import { figureLibraryPublicUrl } from "@/data/figure-library-catalog";

interface FigureLibraryInputSectionProps {
  entries: FigureLibraryEntry[];
}

export function FigureLibraryInputSection({ entries }: FigureLibraryInputSectionProps) {
  const { messages } = useLanguage();
  const copy = messages.itemPage;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-navy-900">{copy.figureLibraryInputTitle}</h3>
      <p className="text-sm leading-relaxed text-ink-secondary">{copy.figureLibraryInputHint}</p>
      <ul className="grid gap-4 lg:grid-cols-2">
        {entries.map((entry) => (
          <li key={entry.sha256} className="surface-card overflow-hidden p-3">
            <p className="text-sm font-semibold text-navy-900">{entry.fileName}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
              {entry.drugAnnotation}
              {entry.candidateProduct
                ? ` · ${entry.candidateProduct} / ${entry.referenceProduct}`
                : null}
            </p>
            {/* Local catalog bytes via API; next/image is not used for these paths. */}
            <img
              src={figureLibraryPublicUrl(entry.fileName)}
              alt={entry.fileName}
              className="mt-3 w-full rounded-sm border border-line bg-paper object-contain"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
