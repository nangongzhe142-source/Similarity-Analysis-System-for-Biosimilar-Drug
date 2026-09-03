"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { categories } from "@/data/categories";
import { characterizationItems } from "@/data/characterization-items";
import {
  getItemCountByCategory,
  getSupplementaryItemCount,
  getTotalMethodCount,
} from "@/data/selectors";
import { CategoryMark } from "@/components/CategoryMark";
import { drawerLayerDomId, useDrawerStack } from "@/components/drawer/DrawerStackProvider";
import {
  categoryOverviewLayerId,
  useExplorerLayers,
} from "@/components/layout/SideExplorerRail";

const COUNT_UP_DURATION_MS = 900;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** One-shot count-up for the hero metrics. Never loops, and lands exactly on
 *  the real value. The initial state is already the real value, so both the
 *  server render and the reduced-motion path show the final number untouched. */
function useCountUp(target: number): number {
  const [displayed, setDisplayed] = useState(target);

  useEffect(() => {
    if (prefersReducedMotion()) {
      return;
    }
    let frameId = 0;
    const startedAt = performance.now();
    function step(now: number) {
      const progress = Math.min(1, (now - startedAt) / COUNT_UP_DURATION_MS);
      const eased = 1 - (1 - progress) ** 3;
      setDisplayed(Math.round(target * eased));
      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      }
    }
    frameId = window.requestAnimationFrame(step);
    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [target]);

  return displayed;
}

function HeroMetric({ label, value }: { label: string; value: number }) {
  const displayed = useCountUp(value);
  return (
    <div className="rounded-md border border-white/25 bg-navy-950/40 px-4 py-3 backdrop-blur-sm">
      <dt className="text-xs font-medium text-cyan-100">{label}</dt>
      <dd className="mt-1 font-mono text-3xl font-bold text-paper">{displayed}</dd>
    </div>
  );
}

export function HomeView() {
  const { localize, messages } = useLanguage();
  const { layers, closeAll } = useDrawerStack();
  const { openCategoryOverview } = useExplorerLayers();

  const statistics: Array<{ label: string; value: number }> = [
    { label: messages.home.statsItems, value: characterizationItems.length },
    { label: messages.home.statsCategories, value: categories.length },
    { label: messages.home.statsMethods, value: getTotalMethodCount() },
    { label: messages.home.statsSupplementary, value: getSupplementaryItemCount() },
  ];

  return (
    <div className="flex flex-col gap-10">
      <section className="surface-hero rounded-lg px-6 py-10 sm:px-10 sm:py-12">
        <div aria-hidden="true" className="aurora-layer" />
        <div aria-hidden="true" className="hero-grid-parallax" />
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
            className="tap-target inline-flex items-center rounded-sm bg-coral-700 px-4 text-sm font-bold text-paper transition-colors duration-150 hover:bg-coral-800"
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
            <HeroMetric key={statistic.label} label={statistic.label} value={statistic.value} />
          ))}
        </dl>
      </section>

      <section id="quality-attribute-categories">
        <h2 className="text-xl font-bold text-navy-900">{messages.home.categoriesSectionTitle}</h2>
        <p className="mt-1 text-sm text-ink-secondary">{messages.home.categoriesSectionDescription}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => {
            const layerDomId = drawerLayerDomId(categoryOverviewLayerId(category.key));
            const isOpen = layers.some((layer) => drawerLayerDomId(layer.id) === layerDomId);
            return (
              <div
                key={category.key}
                className="surface-card flex flex-col gap-2 border-l-4 border-l-coral-700 p-5"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!isOpen) {
                      closeAll();
                    }
                    openCategoryOverview(category);
                  }}
                  aria-expanded={isOpen}
                  aria-controls={layerDomId}
                  className="tap-target flex flex-col items-start gap-2 rounded-sm text-left"
                >
                  <span className="flex items-center gap-2">
                    <CategoryMark categoryKey={category.key} order={category.order} />
                    <span className="text-xs font-semibold text-ink-secondary">
                      {getItemCountByCategory(category.key)} {messages.home.itemCountSuffix}
                    </span>
                  </span>
                  <span className="text-base font-bold text-navy-900">
                    {localize(category.name)}
                  </span>
                  <span className="text-sm leading-relaxed text-ink-secondary">
                    {localize(category.description)}
                  </span>
                  <span className="pt-1 text-sm font-semibold text-brand-800">
                    {messages.drawer.openCategoryLayer} →
                  </span>
                </button>
                <Link
                  href={`/category/${category.key}`}
                  className="tap-target mt-auto inline-flex items-center text-sm font-semibold text-brand-800 hover:underline"
                >
                  {messages.common.viewDetails} →
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Link
          href="/comprehensive-analysis"
          className="surface-card group flex flex-col gap-2 border-l-4 border-l-coral-700 p-6 transition-shadow duration-150 hover:shadow-[var(--shadow-depth-2)]"
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
          className="surface-card group flex flex-col gap-2 border-l-4 border-l-cyan-700 p-6 transition-shadow duration-150 hover:shadow-[var(--shadow-depth-2)]"
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
