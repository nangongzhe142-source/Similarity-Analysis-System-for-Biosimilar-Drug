"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { categories } from "@/data/categories";
import { characterizationItems } from "@/data/characterization-items";
import { getItemsByCategory } from "@/data/selectors";
import { useLanguage } from "@/i18n/LanguageProvider";
import { isComputableItemId } from "@/lib/workbench/name-match";
import type { CategoryKey } from "@/types/models";

type AvailabilityFilter = "all" | "connected" | "planned";
type CategoryFilter = "all" | CategoryKey;

const CATEGORY_ICON: Record<CategoryKey, string> = {
  "primary-structure": "一",
  "ptm-glycosylation": "修",
  "higher-order-structure": "高",
  physicochemical: "理",
  "purity-size-variants": "纯",
  "charge-variants": "电",
  "binding-bioactivity": "活",
  "process-product-impurities": "杂",
};

export function CharacterizationCatalog() {
  const { messages, localize } = useLanguage();
  const copy = messages.workbench;
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [availability, setAvailability] = useState<AvailabilityFilter>("all");
  const [query, setQuery] = useState("");
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = JSON.parse(
          localStorage.getItem("biocompare.catalog.categories") || "[]",
        ) as string[];
        setOpenCategories(new Set(Array.isArray(stored) ? stored : []));
      } catch {
        setOpenCategories(new Set());
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
  const filteredItems = useMemo(
    () =>
      characterizationItems.filter((item) => {
        if (category !== "all" && item.category !== category) return false;
        const connected = isComputableItemId(item.id);
        if (availability === "connected" && !connected) return false;
        if (availability === "planned" && connected) return false;
        if (!normalizedQuery) return true;
        const haystack = [
          localize(item.itemName),
          item.id,
          localize(item.guidelineTerm),
        ]
          .join(" ")
          .toLocaleLowerCase("zh-CN");
        return haystack.includes(normalizedQuery);
      }),
    [availability, category, localize, normalizedQuery],
  );

  const grouped = useMemo(
    () =>
      categories
        .map((entry) => ({
          ...entry,
          items: filteredItems.filter((item) => item.category === entry.key),
        }))
        .filter((entry) => entry.items.length > 0),
    [filteredItems],
  );

  function persistOpen(next: Set<string>) {
    localStorage.setItem("biocompare.catalog.categories", JSON.stringify([...next]));
  }

  function resetFilters() {
    setCategory("all");
    setAvailability("all");
    setQuery("");
  }

  function toggleCategory(key: string) {
    setOpenCategories((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      persistOpen(next);
      return next;
    });
  }

  const connectedCount = characterizationItems.filter((item) =>
    isComputableItemId(item.id),
  ).length;

  return (
    <section
      id="characterization-catalog"
      className="characterization-catalog"
      aria-label={copy.catalogAria}
    >
      <aside className="catalog-sidebar">
        <div className="catalog-sidebar-head">
          <span>{copy.catalogHeadEyebrow}</span>
          <strong>{copy.catalogHeadTitle}</strong>
          <small>{copy.catalogHeadSource}</small>
        </div>
        <button
          type="button"
          className={category === "all" ? "catalog-nav-item active" : "catalog-nav-item"}
          onClick={() => setCategory("all")}
        >
          <i>全</i>
          <span>
            <strong>{copy.catalogAll}</strong>
            <small>{copy.catalogAllHint}</small>
          </span>
          <em>{characterizationItems.length}</em>
        </button>
        {categories.map((entry) => (
          <button
            type="button"
            key={entry.key}
            className={category === entry.key ? "catalog-nav-item active" : "catalog-nav-item"}
            onClick={() => setCategory(entry.key)}
          >
            <i>{CATEGORY_ICON[entry.key]}</i>
            <span>
              <strong>{localize(entry.name)}</strong>
              <small>{localize(entry.description)}</small>
            </span>
            <em>{getItemsByCategory(entry.key).length}</em>
          </button>
        ))}
        <div className="catalog-legend">
          <p>
            <span className="legend-dot connected" />
            {copy.catalogConnectedLegend} <b>{connectedCount}</b>
          </p>
          <p>
            <span className="legend-dot planned" />
            {copy.catalogPlannedLegend} <b>{characterizationItems.length - connectedCount}</b>
          </p>
        </div>
      </aside>
      <div className="catalog-content">
        <div className="catalog-toolbar">
          <label className="catalog-search">
            <span aria-hidden="true">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.catalogSearchPlaceholder}
              aria-label={copy.catalogSearch}
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} aria-label={copy.catalogClearSearch}>
                ×
              </button>
            ) : null}
          </label>
          <div className="catalog-filter" aria-label={copy.catalogSearch}>
            <button
              type="button"
              className={availability === "all" ? "active" : ""}
              onClick={() => setAvailability("all")}
            >
              {copy.catalogFilterAll}
            </button>
            <button
              type="button"
              className={availability === "connected" ? "active" : ""}
              onClick={() => setAvailability("connected")}
            >
              {copy.catalogFilterConnected}
            </button>
            <button
              type="button"
              className={availability === "planned" ? "active" : ""}
              onClick={() => setAvailability("planned")}
            >
              {copy.catalogFilterPlanned}
            </button>
          </div>
          <span className="catalog-result-count">
            {copy.catalogShowing} <strong>{filteredItems.length}</strong>
          </span>
          <div className="expand-controls">
            <button
              type="button"
              onClick={() => {
                const all = new Set(grouped.map((entry) => entry.key));
                setOpenCategories(all);
                persistOpen(all);
              }}
            >
              {copy.expandAll}
            </button>
            <button
              type="button"
              onClick={() => {
                const empty = new Set<string>();
                setOpenCategories(empty);
                persistOpen(empty);
              }}
            >
              {copy.collapseAll}
            </button>
          </div>
        </div>
        {grouped.length === 0 && (
          <div className="catalog-empty">
            <strong>{copy.catalogEmptyTitle}</strong>
            <p>{copy.catalogEmptyBody}</p>
            <button type="button" onClick={resetFilters}>
              {copy.catalogReset}
            </button>
          </div>
        )}
        {grouped.map((entry) => {
          const open = openCategories.has(entry.key);
          const code = String(entry.order).padStart(2, "0");
          return (
            <section
              className={`catalog-category category-${code} ${open ? "expanded" : ""}`}
              key={entry.key}
            >
              <button
                type="button"
                className="catalog-category-head"
                onClick={() => toggleCategory(entry.key)}
                aria-expanded={open}
              >
                <div className="category-number">{code}</div>
                <div>
                  <span>{copy.catalogCtdCategory}</span>
                  <h3>{localize(entry.name)}</h3>
                  <p>{localize(entry.description)}</p>
                </div>
                <strong>
                  {entry.items.length}
                  <small>{copy.catalogItemsUnit}</small>
                </strong>
                <i>⌄</i>
              </button>
              {open && (
                <section className="catalog-subgroup">
                  <div className="catalog-subgroup-head">
                    <div>
                      <h4>{localize(entry.name)}</h4>
                      <p>{localize(entry.description)}</p>
                    </div>
                    <span>
                      {entry.items.length}
                      {copy.catalogItemsUnit}
                    </span>
                  </div>
                  <div className="catalog-project-grid">
                    {entry.items.map((item) => {
                      const connected = isComputableItemId(item.id);
                      return (
                        <article
                          className={`catalog-project-card ${connected ? "connected" : "planned"}`}
                          key={item.id}
                        >
                          <div className="catalog-card-top">
                            <span className="catalog-code">{item.id}</span>
                            <span className={`catalog-status ${connected ? "connected" : "planned"}`}>
                              {connected ? copy.catalogStatusConnected : copy.catalogStatusPlanned}
                            </span>
                          </div>
                          <h5>{localize(item.itemName)}</h5>
                          <span className="ctd-tag" title={localize(item.guidelineTerm)}>
                            {localize(item.guidelineTerm)}
                          </span>
                          <p>{localize(item.purpose)}</p>
                          <div className="catalog-card-footer">
                            <span>
                              {connected ? copy.catalogConnectedFooter : copy.catalogPlannedFooter}
                            </span>
                            <Link href={`/item/${item.id}`}>{copy.catalogOpenItem}</Link>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}
