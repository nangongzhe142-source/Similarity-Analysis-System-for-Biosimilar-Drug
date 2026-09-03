"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { getMethodContent } from "@/data/method-content";
import type { DetectionMethod, DetectionMethodContent, LocalizedText } from "@/types/models";

interface MethodContentPanelProps {
  method: DetectionMethod;
}

/** Renders the method SOP body for a method that has one in
 *  `src/data/method-content.ts`. This round only `principle` is filled;
 *  the remaining SOP fields are listed explicitly as "still to be embedded"
 *  so an absent field is never mistaken for "not applicable". */
export function MethodContentPanel({ method }: MethodContentPanelProps) {
  const { localize, messages } = useLanguage();
  const content = getMethodContent(method.id);

  if (content === undefined) {
    return null;
  }

  const optionalFields: Array<{
    key: keyof DetectionMethodContent;
    label: string;
    value: LocalizedText | undefined;
  }> = [
    {
      key: "samplePreparation",
      label: messages.methodContent.pendingSamplePreparation,
      value: content.samplePreparation,
    },
    {
      key: "instrumentParameters",
      label: messages.methodContent.pendingInstrumentParameters,
      value: content.instrumentParameters,
    },
    {
      key: "systemSuitability",
      label: messages.methodContent.pendingSystemSuitability,
      value: content.systemSuitability,
    },
    {
      key: "dataInterpretation",
      label: messages.methodContent.pendingDataInterpretation,
      value: content.dataInterpretation,
    },
    {
      key: "similarityAssessmentLink",
      label: messages.methodContent.pendingSimilarityAssessmentLink,
      value: content.similarityAssessmentLink,
    },
  ];

  const embeddedFields = optionalFields.filter((field) => field.value !== undefined);
  const pendingFields = optionalFields.filter((field) => field.value === undefined);

  return (
    <section className="glass-surface glass-edge relative p-5">
      <div className="mb-3 flex flex-wrap items-baseline gap-2">
        <h3 className="text-sm font-semibold text-navy-900">
          {messages.methodContent.sectionTitle}
        </h3>
        <p className="text-sm text-ink-secondary">{localize(method.name)}</p>
      </div>

      <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
        {messages.methodContent.principleLabel}
      </h4>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink">
        {localize(content.principle)}
      </p>

      {embeddedFields.map((field) => (
        <div key={field.key} className="mt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
            {field.label}
          </h4>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink">
            {localize(field.value as LocalizedText)}
          </p>
        </div>
      ))}

      {pendingFields.length > 0 ? (
        <div className="mt-4 border-t border-line pt-3">
          <p className="text-[11px] font-medium text-ink-secondary">
            {messages.methodContent.pendingFieldsTitle}
          </p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {pendingFields.map((field) => (
              <li
                key={field.key}
                className="rounded-sm border border-dashed border-line-strong px-1.5 py-0.5 text-[11px] text-ink-secondary"
              >
                {field.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
