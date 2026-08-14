"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { DetectionMethod } from "@/types/models";
import { MethodLiveDemo } from "@/components/live-demo/MethodLiveDemo";
import { MethodContentPanel } from "@/components/MethodContentPanel";
import { MethodContentPlaceholder } from "@/components/MethodContentPlaceholder";
import { MethodToolPanel } from "@/components/MethodToolPanel";
import { getLiveDemoKind } from "@/data/live-demos";
import { getMethodContent } from "@/data/method-content";

interface MethodSelectorProps {
  methods: DetectionMethod[];
}

/** Renders the primary + orthogonal methods of an item as a selectable list.
 *  Selecting a method shows, in order: the method SOP body (when embedded),
 *  the live demo (when one exists), then the surveyed-tool panel. The dashed
 *  placeholder appears only when neither SOP body nor demo exists. */
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
  const hasMethodContent = getMethodContent(selectedMethod.id) !== undefined;
  const hasSelectedLiveDemo = getLiveDemoKind(selectedMethod.id) !== undefined;

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-wrap gap-2">
        {methods.map((method) => {
          const isSelected = method.id === selectedMethod.id;
          const typeLabel =
            method.type === "primary"
              ? messages.itemPage.primaryMethodLabel
              : messages.itemPage.orthogonalMethodLabel;
          const hasLiveDemo = getLiveDemoKind(method.id) !== undefined;
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
                {hasLiveDemo ? (
                  <span className="shrink-0 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {messages.liveDemo.badge}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      {hasMethodContent ? <MethodContentPanel method={selectedMethod} /> : null}
      <MethodLiveDemo method={selectedMethod} />
      {!hasMethodContent && !hasSelectedLiveDemo ? (
        <MethodContentPlaceholder method={selectedMethod} />
      ) : null}
      <MethodToolPanel methodId={selectedMethod.id} />
    </div>
  );
}
