"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { categories } from "@/data/categories";
import { getItemCountByCategory } from "@/data/selectors";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function primaryNavClassName(isActive: boolean): string {
  return `tap-target inline-flex items-center rounded-sm px-3 text-sm font-semibold transition-colors duration-150 ${
    isActive ? "bg-coral-700 text-paper" : "text-navy-900 hover:bg-canvas-muted"
  }`;
}

function mobileNavClassName(isActive: boolean): string {
  return `tap-target flex items-center rounded-sm px-3 text-base font-semibold ${
    isActive ? "bg-coral-700 text-paper" : "text-navy-900 hover:bg-canvas-muted"
  }`;
}

export function SiteHeader() {
  const pathname = usePathname();
  return <SiteHeaderChrome key={pathname} pathname={pathname} />;
}

function SiteHeaderChrome({ pathname }: { pathname: string }) {
  const { localize, messages } = useLanguage();
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuId = useId();
  const categoryMenuId = useId();

  const isCharacterizationActive =
    pathname.startsWith("/category/") || pathname.startsWith("/item/");

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        categoryMenuRef.current !== null &&
        !categoryMenuRef.current.contains(event.target as Node)
      ) {
        setIsCategoryMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsCategoryMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 shadow-[var(--shadow-card)]">
      <a href="#main-content" className="skip-link">
        {messages.common.skipToMainContent}
      </a>

      <div className="bg-navy-900 text-paper">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="min-w-0 rounded-sm">
            <span className="block truncate text-base font-bold tracking-tight sm:text-lg">
              {messages.site.title}
            </span>
            <span className="mt-0.5 hidden truncate text-xs text-cyan-100 sm:block">
              {messages.site.subtitle}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="dark" />
            <button
              type="button"
              className="tap-target inline-flex items-center justify-center rounded-sm border border-white/30 lg:hidden"
              aria-expanded={isMobileMenuOpen}
              aria-controls={mobileMenuId}
              onClick={() => setIsMobileMenuOpen((open) => !open)}
            >
              <span className="sr-only">
                {isMobileMenuOpen ? messages.common.closeSiteMenu : messages.common.openSiteMenu}
              </span>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6 stroke-current">
                {isMobileMenuOpen ? (
                  <path strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path strokeWidth="2" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="hidden border-b-4 border-coral-700 bg-paper lg:block">
        <nav
          aria-label={messages.navigation.primaryLabel}
          className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-2 sm:px-6"
        >
          <Link href="/" className={primaryNavClassName(pathname === "/")}>
            {messages.navigation.overview}
          </Link>

          <div ref={categoryMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsCategoryMenuOpen((open) => !open)}
              aria-expanded={isCategoryMenuOpen}
              aria-haspopup="menu"
              aria-controls={categoryMenuId}
              className={`${primaryNavClassName(isCharacterizationActive)} gap-1`}
            >
              {messages.navigation.characterization}
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className={`h-4 w-4 transition-transform duration-150 ${isCategoryMenuOpen ? "rotate-180" : ""}`}
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
                id={categoryMenuId}
                role="menu"
                className="surface-card absolute left-0 z-50 mt-2 w-[22rem] p-2"
              >
                <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-ink-secondary">
                  {messages.navigation.allCategories}
                </p>
                <ul>
                  {categories.map((category) => (
                    <li key={category.key}>
                      <Link
                        href={`/category/${category.key}`}
                        role="menuitem"
                        onClick={() => setIsCategoryMenuOpen(false)}
                        className="tap-target flex items-center justify-between gap-2 rounded-sm px-3 text-sm text-ink hover:bg-canvas-muted"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-brand-700">
                            {String(category.order).padStart(2, "0")}
                          </span>
                          <span className="truncate font-medium">{localize(category.name)}</span>
                        </span>
                        <span className="shrink-0 text-xs font-semibold text-ink-secondary">
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
            href="/comprehensive-analysis"
            className={primaryNavClassName(pathname === "/comprehensive-analysis")}
          >
            {messages.navigation.integratedAssessment}
          </Link>
          <Link href="/regulatory" className={primaryNavClassName(pathname === "/regulatory")}>
            {messages.navigation.regulatory}
          </Link>
        </nav>
      </div>

      {isMobileMenuOpen && (
        <nav
          id={mobileMenuId}
          aria-label={messages.navigation.primaryLabel}
          className="border-b border-line bg-paper lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
            <Link href="/" className={mobileNavClassName(pathname === "/")}>
              {messages.navigation.overview}
            </Link>
            <Link
              href="/comprehensive-analysis"
              className={mobileNavClassName(pathname === "/comprehensive-analysis")}
            >
              {messages.navigation.integratedAssessment}
            </Link>
            <Link href="/regulatory" className={mobileNavClassName(pathname === "/regulatory")}>
              {messages.navigation.regulatory}
            </Link>
            <p className="mt-2 px-3 text-xs font-semibold uppercase tracking-wide text-ink-secondary">
              {messages.navigation.allCategories}
            </p>
            {categories.map((category) => (
              <Link
                key={category.key}
                href={`/category/${category.key}`}
                className="tap-target flex items-center justify-between rounded-sm px-3 text-sm text-navy-900 hover:bg-canvas-muted"
              >
                <span>
                  <span className="mr-2 font-mono text-xs font-semibold text-brand-700">
                    {String(category.order).padStart(2, "0")}
                  </span>
                  {localize(category.name)}
                </span>
                <span className="text-xs font-semibold text-ink-secondary">
                  {getItemCountByCategory(category.key)}
                </span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
