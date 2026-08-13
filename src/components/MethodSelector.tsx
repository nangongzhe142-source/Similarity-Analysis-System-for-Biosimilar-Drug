"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { DetectionMethod } from "@/types/models";
import { MethodContentPlaceholder } from "@/components/MethodContentPlaceholder";

interface MethodSelectorProps {
  methods: DetectionMethod[];
}

/** Renders the primary + orthogonal methods of an item as a selectable list.
 *  The first primary method is selected by default; selecting a method shows
 *  its content-embedding placeholder panel below. */
export function MethodSelector({ methods }: MethodSelectorProps) {
  const { localize, messages } = useLanguage();
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(
    methods.length > 0 ? methods[0].id : null,
  );

  if (methods.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        {messages.itemPage.noMethodsPlaceholder}
      </div>
    );
  }

  const selectedMethod =
    methods.find((method) => method.id === selectedMethodId) ?? methods[0];

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-wrap gap-2">
        {methods.map((method) => {
          const isSelected = method.id === selectedMethod.id;
          const typeLabel =
            method.type === "primary"
              ? messages.itemPage.primaryMethodLabel
              : messages.itemPage.orthogonalMethodLabel;
          return (
            <li key={method.id}>
              <button
                type="button"
                onClick={() => setSelectedMethodId(method.id)}
                aria-pressed={isSelected}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  isSelected
                    ? "border-teal-600 bg-teal-50 text-teal-900"
                    : "border-slate-200 bg-white text-slate-700 hover:border-teal-300"
                }`}
              >
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                    method.type === "primary"
                      ? "bg-teal-700 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {typeLabel}
                </span>
                <span className="font-medium">{localize(method.name)}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <MethodContentPlaceholder method={selectedMethod} />
    </div>
  );
}
