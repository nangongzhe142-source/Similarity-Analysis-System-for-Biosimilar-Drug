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
      className="surface-card group flex flex-col gap-2 p-5 transition-shadow duration-150 hover:shadow-[var(--shadow-raised)]"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-navy-900 group-hover:text-brand-800">
          {localize(item.itemName)}
        </h3>
        {item.isSupplementary && <SupplementaryTag />}
      </div>
      <p className="text-xs font-medium text-ink-secondary">{localize(item.guidelineTerm)}</p>
      <div className="flex flex-wrap items-center gap-2">
        <ApplicabilityBadge applicability={item.applicability} compact />
        {showReferenceCaseTag && (
          <span className="rounded-sm border border-cyan-700 bg-cyan-100 px-2 py-0.5 text-[11px] font-semibold text-cyan-800">
            {messages.referenceCase.hasCaseTag}
          </span>
        )}
      </div>
      <p className="line-clamp-2 text-sm leading-relaxed text-ink" title={localize(item.purpose)}>
        {localize(item.purpose)}
      </p>
    </Link>
  );
}
