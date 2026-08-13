"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Category } from "@/types/models";

interface CategoryCardProps {
  category: Category;
  itemCount: number;
}

export function CategoryCard({ category, itemCount }: CategoryCardProps) {
  const { localize, messages } = useLanguage();

  return (
    <Link
      href={`/category/${category.key}`}
      className="group flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-teal-400 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900 group-hover:text-teal-800">
          {localize(category.name)}
        </h3>
        <span className="shrink-0 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
          {itemCount} {messages.home.itemCountSuffix}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-slate-600">
        {localize(category.description)}
      </p>
      <span className="mt-auto pt-1 text-sm font-medium text-teal-700 opacity-0 transition-opacity group-hover:opacity-100">
        {messages.common.viewDetails} →
      </span>
    </Link>
  );
}
