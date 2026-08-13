"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { CharacterizationItem } from "@/types/models";
import { hasReferenceCases } from "@/data/reference-cases";
import { ApplicabilityBadge } from "@/components/ApplicabilityBadge";
import { SupplementaryTag } from "@/components/SupplementaryTag";

interface ItemCardProps {
  item: CharacterizationItem;
}

export function ItemCard({ item }: ItemCardProps) {
  const { localize, messages } = useLanguage();
  const showReferenceCaseTag = hasReferenceCases(item.id);

  return (
    <Link
      href={`/item/${item.id}`}
      className="group flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-teal-400 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-900 group-hover:text-teal-800">
          {localize(item.itemName)}
        </h3>
        {item.isSupplementary && <SupplementaryTag />}
      </div>
      <p className="text-xs text-slate-500">{localize(item.guidelineTerm)}</p>
      <div className="flex flex-wrap items-center gap-2">
        <ApplicabilityBadge applicability={item.applicability} compact />
        {showReferenceCaseTag && (
          <span className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
            {messages.referenceCase.hasCaseTag}
          </span>
        )}
      </div>
      <p className="truncate text-sm text-slate-600" title={localize(item.purpose)}>
        {localize(item.purpose)}
      </p>
    </Link>
  );
}
