"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import type { DetectionMethod } from "@/types/models";

interface MethodContentPlaceholderProps {
  method: DetectionMethod;
}

/** Placeholder panel where the real detection content of a method will be
 *  embedded in a later phase (marked by `method.contentPlaceholder`). */
export function MethodContentPlaceholder({ method }: MethodContentPlaceholderProps) {
  const { localize, messages } = useLanguage();

  return (
    <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <p className="text-sm font-semibold text-slate-700">
        {localize(method.name)}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-500">
        {messages.itemPage.methodContentPlaceholderTitle}
      </p>
      <p className="mx-auto mt-1 max-w-xl text-xs leading-relaxed text-slate-400">
        {messages.itemPage.methodContentPlaceholderText}
      </p>
    </div>
  );
}
