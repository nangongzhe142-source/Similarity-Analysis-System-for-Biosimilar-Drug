"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { projectModules } from "@/lib/project";
import { characterizationProjects } from "@/lib/characterization-catalog";
import { useProject } from "@/app/project-provider";
import { AiChatWidget } from "@/app/ai-chat-widget";
import { BatchProgressPanel } from "@/app/batch-progress-panel";

const projectNav = [
  { href: "/project", label: "总项目", icon: "⌂" },
  { href: "/project/data", label: "统一输入", icon: "⇥" },
  { href: "/project/rules", label: "公共规则", icon: "◇" },
  { href: "/project/report", label: "汇总报告", icon: "▤" },
];

const navGroups = [
  { id: "primary", label: "一级结构", icon: "chain", prefixes: ["IM-", "DM-", "LC-", "HC-", "DHC-", "SEQ-"] },
  { id: "glycan", label: "糖基化", icon: "hex", prefixes: ["GLY-"] },
  { id: "hos", label: "高级结构", icon: "helix", prefixes: ["HOS-"] },
  { id: "ptm", label: "翻译后修饰", icon: "star", prefixes: ["PTM-"] },
  { id: "purity", label: "纯化-尺寸异质性", icon: "bars", prefixes: ["PUR-"] },
  { id: "covalent", label: "共价连接", icon: "link", prefixes: ["COV-"] },
  { id: "physchem", label: "理化与电荷特性", icon: "wave", prefixes: ["PHY-", "CHG-"] },
  { id: "bio", label: "生物学功能", icon: "pulse", prefixes: ["BIO-"] },
  { id: "impurity", label: "杂质", icon: "filter", prefixes: ["IMP-"] },
] as const;

function Glyph({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    chain: <><path d="M8.5 7.5 6.7 9.3a3 3 0 0 0 4.2 4.2l1.7-1.7"/><path d="m11.5 16.5 1.8-1.8a3 3 0 0 0-4.2-4.2l-1.7 1.7"/></>,
    hex: <path d="m12 3 7.5 4.5v9L12 21l-7.5-4.5v-9Z"/>,
    helix: <><path d="M7 4c7 4 3 12 10 16"/><path d="M17 4C10 8 14 16 7 20"/><path d="M9 8h6M9 16h6"/></>,
    star: <path d="m12 3 2.2 5.2 5.6.5-4.3 3.7 1.3 5.5-4.8-2.8-4.8 2.8 1.3-5.5-4.3-3.7 5.6-.5Z"/>,
    bars: <><path d="M5 19V9M12 19V5M19 19v-7"/><path d="M3 19h18"/></>,
    link: <><path d="M9.5 14.5 8 16a3.5 3.5 0 0 1-5-5l3-3a3.5 3.5 0 0 1 5 0"/><path d="m14.5 9.5 1.5-1.5a3.5 3.5 0 0 1 5 5l-3 3a3.5 3.5 0 0 1-5 0"/><path d="m8.5 15.5 7-7"/></>,
    wave: <path d="M3 12c3-8 6 8 9 0s6 8 9 0"/>, pulse: <path d="M3 12h4l2-6 4 12 2-6h6"/>,
    filter: <path d="M4 5h16l-6 7v6l-4 2v-8Z"/>,
  };
  return <svg className="nav-glyph" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { engineStatus, completedCount, projectStarted, batchRunning, runAll, error, errorDetail, clearError } = useProject();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const activeModule = projectModules.find((module) => pathname.includes(module.id));
  const title = activeModule?.name || (pathname.endsWith("/data") ? "统一输入数据" : pathname.endsWith("/rules") ? "公共参数与风险规则" : pathname.endsWith("/report") ? "项目汇总报告" : "生物类似药比对");

  useEffect(() => {
    setSidebarCollapsed(localStorage.getItem("biocompare.sidebar.collapsed") === "true");
    const stored = JSON.parse(localStorage.getItem("biocompare.nav.groups") || "[]") as string[];
    setExpandedGroups(new Set(stored));
    const storedTheme = localStorage.getItem("biocompare.theme") === "dark" ? "dark" : "light";
    setTheme(storedTheme); document.documentElement.dataset.theme = storedTheme;
  }, []);

  const groupedProjects = useMemo(() => navGroups.map((group) => ({
    ...group,
    projects: characterizationProjects.filter((item) => group.prefixes.some((prefix) => item.code.startsWith(prefix))),
  })), []);

  function toggleSidebar() {
    setSidebarCollapsed((current) => { localStorage.setItem("biocompare.sidebar.collapsed", String(!current)); return !current; });
  }
  function toggleGroup(id: string) {
    setExpandedGroups((current) => {
      const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem("biocompare.nav.groups", JSON.stringify([...next])); return next;
    });
  }
  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light"; setTheme(next);
    localStorage.setItem("biocompare.theme", next); document.documentElement.dataset.theme = next;
  }

  return <div className={`app-shell ${sidebarCollapsed ? "sidebar-is-collapsed" : ""}`}>
    <aside className="sidebar">
      <div className="sidebar-brand-row"><Link className="brand" href="/project" title="BioCompare"><div className="brand-mark">B</div><div><strong>BioCompare</strong><span>药学比对工作台</span></div></Link><button className="sidebar-toggle" onClick={toggleSidebar} aria-label={sidebarCollapsed ? "展开侧栏" : "收起侧栏"} title={sidebarCollapsed ? "展开侧栏" : "收起侧栏"}>☰</button></div>
      <div className="project-switcher" title="生物类似药多维药学项目比对工作台"><span>一级项目</span><strong>生物类似药比对</strong><small>{batchRunning ? "批量任务执行中" : projectStarted ? "项目已启动" : "试点项目 · 待启动"}</small></div>
      <nav className="primary-nav"><p className="nav-label">总项目工作区</p>{projectNav.map((item) => <Link key={item.href} title={item.label} className={pathname === item.href ? "nav-item active" : "nav-item"} href={item.href}><span className="icon">{item.icon}</span><span className="nav-copy">{item.label}</span>{item.href.endsWith("report") && completedCount > 0 && <em>{completedCount}</em>}</Link>)}</nav>
      <nav className="module-nav"><p className="nav-label">药学表征项目</p>{groupedProjects.map((group) => {
        const expanded = expandedGroups.has(group.id) && !sidebarCollapsed;
        return <section className={`nav-group-card ${expanded ? "expanded" : ""}`} key={group.id}>
          <button className="nav-group-toggle" onClick={() => toggleGroup(group.id)} title={group.label} aria-expanded={expanded}><Glyph name={group.icon}/><span>{group.label}</span><em>{group.projects.length}</em><i>⌄</i></button>
          <div className="nav-group-projects">{group.projects.map((item, index) => { const staggerIndex = Math.min(index, 12); const style = { "--i": staggerIndex, "--stagger-delay": `${staggerIndex * 20}ms` } as CSSProperties; return item.moduleId ? <Link key={item.id} style={style} href={`/modules/${item.moduleId}`} title={`${item.code} ${item.name}`} className={activeModule?.id === item.moduleId ? "module-nav-item active" : "module-nav-item"}><b className="project-status-dot connected"/><span><small>{item.code}</small>{item.name}</span></Link> : <div key={item.id} style={style} title={`${item.code} ${item.name}（待接入）`} className="module-nav-item planned"><b className="project-status-dot"/><span><small>{item.code}</small>{item.name}</span></div>; })}</div>
        </section>;
      })}</nav>
      <div className="sidebar-bottom"><div className="engine-card" title="任务服务"><span className={engineStatus?.online ? "status-dot online" : "status-dot"} /><div><strong>任务服务</strong><small>{engineStatus?.online ? "调度骨架在线" : "正在检测"}</small></div></div><div className="profile" title="审评工作台"><div className="avatar">审</div><div><strong>审评工作台</strong><span>本地试点环境</span></div></div></div>
    </aside>
    <main>
      <header className="topbar"><div className="topbar-title"><span className="crumb">BioCompare / {activeModule ? `专项比对 / ${activeModule.code}` : "生物类似药比对项目"}</span><h1>{title}</h1></div><div className="topbar-tools"><label className="global-search"><span>⌕</span><input aria-label="全局搜索" placeholder="搜索项目、编号或任务" /></label><button className="theme-toggle" onClick={toggleTheme} title="切换浅色/深色主题" aria-label="切换主题">{theme === "light" ? "◐" : "☀"}</button><div className="top-actions"><Link className="quiet link-button" href="/project/report">查看项目汇总</Link><button className="primary" disabled={batchRunning} onClick={() => void runAll()}>{batchRunning ? "正在调度全部任务…" : "一键执行全部比对"}</button></div></div></header>
      <details className="notice help-drawer"><summary><span>i</span><strong>审评边界与使用说明</strong><i>⌄</i></summary><div><strong>总项目汇总客观证据，不自动给出生物类似性结论</strong><p>专项任务可由总项目统一调度，也可在二级页面独立运行。</p></div></details>
      {error && <section className="error-ux-card global-error" role="alert" aria-live="assertive">
        <div className="error-ux-summary"><span aria-hidden="true">⚠</span><strong>{error}</strong><button type="button" onClick={clearError} aria-label="知道了，关闭错误提示">知道了</button></div>
        {errorDetail && <details className="error-ux-detail"><summary>查看原始日志</summary><pre>{errorDetail}</pre></details>}
      </section>}
      {children}
      <footer className="app-footer"><span>BioCompare · 生物类似药多维药学项目比对工作台</span><small>本地试点环境 · 客观证据标记</small></footer>
    </main>
    <BatchProgressPanel />
    <AiChatWidget />
  </div>;
}
