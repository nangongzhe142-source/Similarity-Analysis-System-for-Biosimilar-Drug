"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import type { Category } from "@/types/models";
import { getItemsByCategory } from "@/data/selectors";
import { ItemCard } from "@/components/ItemCard";
import { Breadcrumb } from "@/components/Breadcrumb";

interface CategoryViewProps {
  category: Category;
}

export function CategoryView({ category }: CategoryViewProps) {
  const { localize, messages } = useLanguage();
  const items = getItemsByCategory(category.key);
  const hasSupplementaryItems = items.some((item) => item.isSupplementary);

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        entries={[
          { label: messages.itemPage.breadcrumbHome, href: "/" },
          { label: localize(category.name) },
        ]}
      />

      <header>
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-2xl font-bold text-slate-900">
            {localize(category.name)}
          </h1>
          <span className="text-sm text-slate-500">
            {items.length} {messages.categoryPage.itemCountSuffix}
          </span>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
          {localize(category.description)}
        </p>
        {hasSupplementaryItems && (
          <p className="mt-2 text-xs text-amber-700">
            {messages.categoryPage.supplementaryNote}
          </p>
        )}
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
