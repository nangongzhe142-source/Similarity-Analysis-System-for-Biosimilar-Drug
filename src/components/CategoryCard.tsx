"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Category } from "@/types/models";
import { CategoryMark } from "@/components/CategoryMark";

interface CategoryCardProps {
  category: Category;
  itemCount: number;
}

export function CategoryCard({ category, itemCount }: CategoryCardProps) {
  const { localize, messages } = useLanguage();

  return (
    <Link
      href={`/category/${category.key}`}
      className="surface-card group flex flex-col gap-3 border-l-4 border-l-coral-700 p-5 transition-shadow duration-150 hover:shadow-[var(--shadow-raised)]"
    >
      <div className="flex items-start justify-between gap-3">
        <CategoryMark categoryKey={category.key} order={category.order} />
        <span className="shrink-0 rounded-sm bg-canvas-muted px-2.5 py-1 text-xs font-semibold text-navy-900">
          {itemCount} {messages.home.itemCountSuffix}
        </span>
      </div>
      <h3 className="text-base font-semibold text-navy-900 group-hover:text-brand-800">
        {localize(category.name)}
      </h3>
      <p className="text-sm leading-relaxed text-ink-secondary">
        {localize(category.description)}
      </p>
      <span className="mt-auto pt-1 text-sm font-semibold text-brand-800">
        {messages.common.viewDetails} →
      </span>
    </Link>
  );
}
