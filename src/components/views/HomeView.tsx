"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import { categories } from "@/data/categories";
import { characterizationItems } from "@/data/characterization-items";
import {
  getItemCountByCategory,
  getSupplementaryItemCount,
  getTotalMethodCount,
} from "@/data/selectors";
import { CategoryCard } from "@/components/CategoryCard";

export function HomeView() {
  const { messages } = useLanguage();

  const statistics: Array<{ label: string; value: number }> = [
    { label: messages.home.statsItems, value: characterizationItems.length },
    { label: messages.home.statsCategories, value: categories.length },
    { label: messages.home.statsMethods, value: getTotalMethodCount() },
    { label: messages.home.statsSupplementary, value: getSupplementaryItemCount() },
  ];

  return (
    <div className="flex flex-col gap-10">
      <section className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-sky-50 px-6 py-10 sm:px-10">
        <h1 className="max-w-3xl text-2xl font-bold leading-snug text-teal-950 sm:text-3xl">
          {messages.home.heroTitle}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
          {messages.home.heroDescription}
        </p>
        <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {statistics.map((statistic) => (
            <div
              key={statistic.label}
              className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3"
            >
              <dt className="text-xs text-slate-500">{statistic.label}</dt>
              <dd className="mt-1 text-2xl font-bold text-teal-800">
                {statistic.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        aria-labelledby="site-disclaimer-heading"
        className="rounded-xl border border-amber-300 bg-amber-50 px-6 py-5"
      >
        <h2
          id="site-disclaimer-heading"
          className="text-sm font-semibold text-amber-900"
        >
          {messages.referenceCase.disclaimerTitle}
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-amber-900">
          {messages.referenceCase.disclaimerText}
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">
          {messages.home.categoriesSectionTitle}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {messages.home.categoriesSectionDescription}
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.key}
              category={category}
              itemCount={getItemCountByCategory(category.key)}
            />
          ))}
        </div>
      </section>

      <section>
        <Link
          href="/regulatory"
          className="group flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-teal-400 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold text-slate-900 group-hover:text-teal-800">
              {messages.home.regulatoryEntryTitle}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {messages.home.regulatoryEntryDescription}
            </p>
          </div>
          <span className="shrink-0 text-sm font-medium text-teal-700">
            {messages.common.viewDetails} →
          </span>
        </Link>
      </section>
    </div>
  );
}
