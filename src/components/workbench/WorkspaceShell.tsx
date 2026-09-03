"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type CSSProperties, type ReactNode, useEffect, useMemo, useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BatchProgressPanel } from "@/components/workbench/BatchProgressPanel";
import {
  getItemRun,
  itemFilesAreReady,
  useWorkbench,
} from "@/components/workbench/WorkbenchProvider";
import { categories } from "@/data/categories";
import { getItemById, getItemsByCategory } from "@/data/selectors";
import { useLanguage } from "@/i18n/LanguageProvider";
import { computableItemIds, isComputableItemId } from "@/lib/workbench/name-match";
import type { CategoryKey } from "@/types/models";

const PROJECT_NAV = [
  { href: "/project", key: "navProject" as const, icon: "⌂" },
  { href: "/project/data", key: "navData" as const, icon: "⇥" },
  { href: "/project/rules", key: "navRules" as const, icon: "◇" },
  { href: "/project/report", key: "navReport" as const, icon: "▤" },
  { href: "/comprehensive-analysis", key: "navComprehensive" as const, icon: "▣" },
  { href: "/regulatory", key: "navRegulatory" as const, icon: "§" },
];

const CATEGORY_GLYPH: Record<CategoryKey, string> = {
  "primary-structure": "chain",
  "ptm-glycosylation": "hex",
  "higher-order-structure": "helix",
  physicochemical: "wave",
  "purity-size-variants": "bars",
  "charge-variants": "star",
  "binding-bioactivity": "pulse",
  "process-product-impurities": "filter",
};

function Glyph({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    chain: (
      <>
        <path d="M8.5 7.5 6.7 9.3a3 3 0 0 0 4.2 4.2l1.7-1.7" />
        <path d="m11.5 16.5 1.8-1.8a3 3 0 0 0-4.2-4.2l-1.7 1.7" />
      </>
    ),
    hex: <path d="m12 3 7.5 4.5v9L12 21l-7.5-4.5v-9Z" />,
    helix: (
      <>
        <path d="M7 4c7 4 3 12 10 16" />
        <path d="M17 4C10 8 14 16 7 20" />
        <path d="M9 8h6M9 16h6" />
      </>
    ),
    star: <path d="m12 3 2.2 5.2 5.6.5-4.3 3.7 1.3 5.5-4.8-2.8-4.8 2.8 1.3-5.5-4.3-3.7 5.6-.5Z" />,
    bars: (
      <>
        <path d="M5 19V9M12 19V5M19 19v-7" />
        <path d="M3 19h18" />
      </>
    ),
    wave: <path d="M3 12c3-8 6 8 9 0s6 8 9 0" />,
    pulse: <path d="M3 12h4l2-6 4 12 2-6h6" />,
    filter: <path d="M4 5h16l-6 7v6l-4 2v-8Z" />,
  };
  return (
    <svg className="nav-glyph" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { messages, localize } = useLanguage();
  const copy = messages.workbench;
  const {
    batchRunning,
    runAll,
    error,
    errorDetail,
    clearError,
    theme,
    setTheme,
    engineOnline,
    runStatusByItemId,
    filesByItemId,
  } = useWorkbench();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const completedCount = computableItemIds.filter(
    (itemId) => getItemRun(runStatusByItemId, itemId).status === "completed",
  ).length;
  const projectStarted = Object.values(runStatusByItemId).some(
    (run) => run.status !== "not-started" && run.status !== "planned",
  );
  const readyCount = computableItemIds.filter((itemId) =>
    itemFilesAreReady(filesByItemId[itemId]),
  ).length;

  const itemMatch = pathname.match(/^\/item\/([^/]+)/);
  const categoryMatch = pathname.match(/^\/category\/([^/]+)/);
  const currentItem = itemMatch ? getItemById(itemMatch[1]) : undefined;

  let title = copy.pageProject;
  if (pathname.startsWith("/project/data")) title = copy.pageData;
  else if (pathname.startsWith("/project/rules")) title = copy.pageRules;
  else if (pathname.startsWith("/project/report")) title = copy.pageReport;
  else if (pathname.startsWith("/comprehensive-analysis")) title = copy.pageComprehensive;
  else if (pathname.startsWith("/regulatory")) title = copy.pageRegulatory;
  else if (categoryMatch) {
    const category = categories.find((entry) => entry.key === categoryMatch[1]);
    title = category ? localize(category.name) : copy.pageCategory;
  } else if (currentItem) title = localize(currentItem.itemName);

  const crumb = currentItem
    ? `BioCompare / ${copy.crumbItem} / ${currentItem.id}`
    : `BioCompare / ${copy.crumbProject}`;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSidebarCollapsed(localStorage.getItem("biocompare.sidebar.collapsed") === "true");
      try {
        const stored = JSON.parse(localStorage.getItem("biocompare.nav.groups") || "[]") as string[];
        setExpandedGroups(new Set(Array.isArray(stored) ? stored : []));
      } catch {
        setExpandedGroups(new Set());
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const groupedProjects = useMemo(
    () =>
      categories.map((category) => ({
        id: category.key,
        label: localize(category.name),
        icon: CATEGORY_GLYPH[category.key],
        items: getItemsByCategory(category.key),
      })),
    [localize],
  );

  function toggleSidebar() {
    setSidebarCollapsed((current) => {
      localStorage.setItem("biocompare.sidebar.collapsed", String(!current));
      return !current;
    });
  }

  function toggleGroup(id: string) {
    setExpandedGroups((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("biocompare.nav.groups", JSON.stringify([...next]));
      return next;
    });
  }

  const engineLabel =
    engineOnline === null ? copy.engineChecking : engineOnline ? copy.engineOnline : copy.engineOffline;
  const projectStatus = batchRunning
    ? copy.statusBatch
    : projectStarted
      ? copy.statusStarted
      : copy.statusIdle;

  return (
    <div className={`app-shell ${sidebarCollapsed ? "sidebar-is-collapsed" : ""}`}>
      <a href="#main-content" className="skip-link">
        {messages.common.skipToMainContent}
      </a>
      <aside className="sidebar">
        <div className="sidebar-brand-row">
          <Link className="brand" href="/project" title="BioCompare">
            <div className="brand-mark">B</div>
            <div>
              <strong>{copy.brandName}</strong>
              <span>{copy.brandSubtitle}</span>
            </div>
          </Link>
          <button
            className="sidebar-toggle"
            type="button"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? copy.sidebarExpand : copy.sidebarCollapse}
            title={sidebarCollapsed ? copy.sidebarExpand : copy.sidebarCollapse}
          >
            ☰
          </button>
        </div>
        <div className="project-switcher" title={copy.heroTitle}>
          <span>{copy.projectLevel}</span>
          <strong>{copy.projectName}</strong>
          <small>{projectStatus}</small>
        </div>
        <nav className="primary-nav">
          <p className="nav-label">{copy.navWorkspace}</p>
          {PROJECT_NAV.map((item) => (
            <Link
              key={item.href}
              title={copy[item.key]}
              className={pathname === item.href ? "nav-item active" : "nav-item"}
              href={item.href}
            >
              <span className="icon">{item.icon}</span>
              <span className="nav-copy">{copy[item.key]}</span>
              {item.href.endsWith("report") && completedCount > 0 && <em>{completedCount}</em>}
            </Link>
          ))}
        </nav>
        <nav className="module-nav">
          <p className="nav-label">{copy.navCharacterization}</p>
          {groupedProjects.map((group) => {
            const expanded = expandedGroups.has(group.id) && !sidebarCollapsed;
            return (
              <section className={`nav-group-card ${expanded ? "expanded" : ""}`} key={group.id}>
                <button
                  className="nav-group-toggle"
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  title={group.label}
                  aria-expanded={expanded}
                >
                  <Glyph name={group.icon} />
                  <span>{group.label}</span>
                  <em>{group.items.length}</em>
                  <i>⌄</i>
                </button>
                <div className="nav-group-projects">
                  {group.items.map((item, index) => {
                    const staggerIndex = Math.min(index, 12);
                    const style = {
                      "--i": staggerIndex,
                      "--stagger-delay": `${staggerIndex * 20}ms`,
                    } as CSSProperties;
                    const connected = isComputableItemId(item.id);
                    const active = pathname === `/item/${item.id}`;
                    return (
                      <Link
                        key={item.id}
                        style={style}
                        href={`/item/${item.id}`}
                        title={`${item.id} ${localize(item.itemName)}`}
                        className={`${active ? "module-nav-item active" : "module-nav-item"}${connected ? "" : " planned"}`}
                      >
                        <b className={connected ? "project-status-dot connected" : "project-status-dot"} />
                        <span>
                          <small>{item.id}</small>
                          {localize(item.itemName)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="engine-card" title={copy.engineTitle}>
            <span className={engineOnline ? "status-dot online" : "status-dot"} />
            <div>
              <strong>{copy.engineTitle}</strong>
              <small>{engineLabel}</small>
            </div>
          </div>
          <div className="profile" title={copy.profileTitle}>
            <div className="avatar">{copy.avatarMark}</div>
            <div>
              <strong>{copy.profileTitle}</strong>
              <span>{copy.profileSubtitle}</span>
            </div>
          </div>
        </div>
      </aside>
      <main id="main-content" tabIndex={-1} className="workbench-main">
        <header className="topbar">
          <div className="topbar-title">
            <span className="crumb">{crumb}</span>
            <h1>{title}</h1>
          </div>
          <div className="topbar-tools">
            <label className="global-search">
              <span>⌕</span>
              <input aria-label={copy.searchLabel} placeholder={copy.searchPlaceholder} />
            </label>
            <button
              className="theme-toggle"
              type="button"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              title={copy.themeToggle}
              aria-label={copy.themeToggle}
            >
              {theme === "light" ? "◐" : "☀"}
            </button>
            <div className="workbench-language">
              <LanguageSwitcher variant={theme === "dark" ? "dark" : "light"} />
            </div>
            <div className="top-actions">
              <Link className="quiet link-button" href="/project/report">
                {copy.viewReport}
              </Link>
              <button
                className="primary"
                type="button"
                disabled={batchRunning || readyCount === 0}
                onClick={() => void runAll()}
              >
                {batchRunning ? copy.runAllRunning : copy.runAll}
              </button>
            </div>
          </div>
        </header>
        <details className="notice help-drawer">
          <summary>
            <span>i</span>
            <strong>{copy.noticeTitle}</strong>
            <i>⌄</i>
          </summary>
          <div>
            <strong>{copy.noticeLead}</strong>
            <p>{copy.noticeBody}</p>
          </div>
        </details>
        {error && (
          <section className="error-ux-card global-error" role="alert" aria-live="assertive">
            <div className="error-ux-summary">
              <span aria-hidden="true">⚠</span>
              <strong>{error}</strong>
              <button type="button" onClick={clearError} aria-label={copy.errorDismiss}>
                {copy.errorDismiss}
              </button>
            </div>
            {errorDetail && (
              <details className="error-ux-detail">
                <summary>{copy.errorDetail}</summary>
                <pre>{errorDetail}</pre>
              </details>
            )}
          </section>
        )}
        {children}
        <footer className="app-footer">
          <span>{copy.footerMark}</span>
          <small>{copy.footerNote}</small>
        </footer>
      </main>
      <BatchProgressPanel />
    </div>
  );
}
