"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import type { AnalysisPlaceholder } from "@/types/models";

interface SimilarityAnalysisPlaceholderProps {
  analysisPlaceholder: AnalysisPlaceholder;
}

interface SlotDefinition {
  key: keyof AnalysisPlaceholder;
  title: string;
  description: string;
  showUploadAction: boolean;
}

/** Disabled placeholder slots reserved for the future real similarity
 *  analysis (candidate/reference data entry and result display). */
export function SimilarityAnalysisPlaceholder({
  analysisPlaceholder,
}: SimilarityAnalysisPlaceholderProps) {
  const { messages } = useLanguage();

  const slots: SlotDefinition[] = [
    {
      key: "candidateDataSlot",
      title: messages.itemPage.candidateSlotTitle,
      description: messages.itemPage.candidateSlotDescription,
      showUploadAction: true,
    },
    {
      key: "referenceDataSlot",
      title: messages.itemPage.referenceSlotTitle,
      description: messages.itemPage.referenceSlotDescription,
      showUploadAction: true,
    },
    {
      key: "resultSlot",
      title: messages.itemPage.resultSlotTitle,
      description: messages.itemPage.resultSlotDescription,
      showUploadAction: false,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {slots
        .filter((slot) => analysisPlaceholder[slot.key])
        .map((slot) => (
          <div
            key={slot.key}
            aria-disabled="true"
            className="flex flex-col gap-2 rounded-lg border-2 border-dashed border-line bg-canvas-muted p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-navy-900">{slot.title}</h4>
              <span className="shrink-0 rounded-sm bg-paper px-2 py-0.5 text-[11px] font-semibold text-ink-secondary">
                {messages.itemPage.underDevelopment}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-ink-secondary">{slot.description}</p>
            {slot.showUploadAction && (
              <button
                type="button"
                disabled
                className="tap-target mt-auto cursor-not-allowed rounded-sm border border-line bg-paper px-3 text-xs font-semibold text-ink-secondary"
              >
                {messages.itemPage.uploadPlaceholderAction}
              </button>
            )}
          </div>
        ))}
    </div>
  );
}
