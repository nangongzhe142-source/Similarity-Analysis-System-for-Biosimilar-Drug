"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import type { Category } from "@/types/models";
import { getItemsByCategory } from "@/data/selectors";
import { ItemCard } from "@/components/ItemCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CategoryMark } from "@/components/CategoryMark";

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

      <header className="surface-card border-l-4 border-l-brand-700 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <CategoryMark categoryKey={category.key} order={category.order} />
          <h1 className="text-2xl font-bold text-navy-900">{localize(category.name)}</h1>
          <span className="text-sm font-medium text-ink-secondary">
            {items.length} {messages.categoryPage.itemCountSuffix}
          </span>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-secondary">
          {localize(category.description)}
        </p>
        {hasSupplementaryItems && (
          <p className="mt-3 text-sm text-navy-900">{messages.categoryPage.supplementaryNote}</p>
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
