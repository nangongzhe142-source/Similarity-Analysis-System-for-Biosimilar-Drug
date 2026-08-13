"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { categories } from "@/data/categories";
import { getItemCountByCategory } from "@/data/selectors";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function navLinkClassName(isActive: boolean): string {
  return `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:text-teal-700"
  }`;
}

export function SiteHeader() {
  const { localize, messages } = useLanguage();
  const pathname = usePathname();
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        categoryMenuRef.current !== null &&
        !categoryMenuRef.current.contains(event.target as Node)
      ) {
        setIsCategoryMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isCharacterizationActive =
    pathname.startsWith("/category/") || pathname.startsWith("/item/");

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-w-0 flex-col">
          <span className="truncate text-base font-bold text-teal-900">
            {messages.site.title}
          </span>
          <span className="hidden truncate text-xs text-slate-500 md:block">
            {messages.site.subtitle}
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/" className={navLinkClassName(pathname === "/")}>
            {messages.navigation.overview}
          </Link>

          <div ref={categoryMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsCategoryMenuOpen((open) => !open)}
              aria-expanded={isCategoryMenuOpen}
              aria-haspopup="menu"
              className={`${navLinkClassName(isCharacterizationActive)} inline-flex items-center gap-1`}
            >
              {messages.navigation.characterization}
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className={`h-4 w-4 transition-transform ${isCategoryMenuOpen ? "rotate-180" : ""}`}
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {isCategoryMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
              >
                <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {messages.navigation.allCategories}
                </p>
                <ul>
                  {categories.map((category) => (
                    <li key={category.key}>
                      <Link
                        href={`/category/${category.key}`}
                        role="menuitem"
                        onClick={() => setIsCategoryMenuOpen(false)}
                        className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-900"
                      >
                        <span className="font-medium">{localize(category.name)}</span>
                        <span className="shrink-0 text-xs text-slate-400">
                          {getItemCountByCategory(category.key)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Link
            href="/regulatory"
            className={navLinkClassName(pathname === "/regulatory")}
          >
            {messages.navigation.regulatory}
          </Link>
        </nav>

        <LanguageSwitcher />
      </div>
    </header>
  );
}
