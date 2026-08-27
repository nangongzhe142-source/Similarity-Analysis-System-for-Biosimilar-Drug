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
      <section className="surface-hero rounded-lg px-6 py-10 sm:px-10 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">
          {messages.home.categoryIndexPrefix}
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-paper sm:text-4xl">
          {messages.home.heroTitle}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-cyan-100 sm:text-base">
          {messages.home.heroDescription}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/comprehensive-analysis"
            className="tap-target inline-flex items-center rounded-sm bg-paper px-4 text-sm font-bold text-navy-900 transition-colors duration-150 hover:bg-cyan-100"
          >
            {messages.home.heroPrimaryAction}
          </Link>
          <Link
            href="#quality-attribute-categories"
            className="tap-target inline-flex items-center rounded-sm border border-paper/80 px-4 text-sm font-bold text-paper transition-colors duration-150 hover:bg-white/10"
          >
            {messages.home.heroSecondaryAction}
          </Link>
        </div>
        <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statistics.map((statistic) => (
            <div key={statistic.label} className="border border-white/20 bg-navy-950/35 px-4 py-3">
              <dt className="text-xs font-medium text-cyan-100">{statistic.label}</dt>
              <dd className="mt-1 font-mono text-3xl font-bold text-paper">{statistic.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        aria-labelledby="site-disclaimer-heading"
        className="rounded-md border border-navy-800 bg-paper px-5 py-4"
      >
        <h2 id="site-disclaimer-heading" className="text-sm font-semibold text-navy-900">
          {messages.referenceCase.disclaimerTitle}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          {messages.referenceCase.disclaimerText}
        </p>
      </section>

      <section id="quality-attribute-categories">
        <h2 className="text-xl font-bold text-navy-900">{messages.home.categoriesSectionTitle}</h2>
        <p className="mt-1 text-sm text-ink-secondary">{messages.home.categoriesSectionDescription}</p>
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

      <section className="grid gap-4 lg:grid-cols-2">
        <Link
          href="/comprehensive-analysis"
          className="surface-card group flex flex-col gap-2 border-l-4 border-l-brand-700 p-6 transition-shadow duration-150 hover:shadow-[var(--shadow-raised)]"
        >
          <h2 className="text-lg font-bold text-navy-900 group-hover:text-brand-800">
            {messages.home.comprehensiveEntryTitle}
          </h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            {messages.home.comprehensiveEntryDescription}
          </p>
          <span className="mt-auto pt-2 text-sm font-semibold text-brand-800">
            {messages.common.viewDetails} →
          </span>
        </Link>
        <Link
          href="/regulatory"
          className="surface-card group flex flex-col gap-2 border-l-4 border-l-cyan-700 p-6 transition-shadow duration-150 hover:shadow-[var(--shadow-raised)]"
        >
          <h2 className="text-lg font-bold text-navy-900 group-hover:text-brand-800">
            {messages.home.regulatoryEntryTitle}
          </h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            {messages.home.regulatoryEntryDescription}
          </p>
          <span className="mt-auto pt-2 text-sm font-semibold text-brand-800">
            {messages.common.viewDetails} →
          </span>
        </Link>
      </section>
    </div>
  );
}
