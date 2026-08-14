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
    <section className="rounded-lg border border-slate-300 bg-white p-5">
      <div className="mb-3 flex flex-wrap items-baseline gap-2">
        <h3 className="text-sm font-semibold text-slate-900">
          {messages.methodContent.sectionTitle}
        </h3>
        <p className="text-sm text-slate-600">{localize(method.name)}</p>
      </div>

      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {messages.methodContent.principleLabel}
      </h4>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-700">
        {localize(content.principle)}
      </p>

      {embeddedFields.map((field) => (
        <div key={field.key} className="mt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {field.label}
          </h4>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {localize(field.value as LocalizedText)}
          </p>
        </div>
      ))}

      {pendingFields.length > 0 ? (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <p className="text-[11px] font-medium text-slate-500">
            {messages.methodContent.pendingFieldsTitle}
          </p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {pendingFields.map((field) => (
              <li
                key={field.key}
                className="rounded border border-dashed border-slate-300 px-1.5 py-0.5 text-[11px] text-slate-400"
              >
                {field.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
        {messages.methodContent.disclaimer}
      </p>
    </section>
  );
}
