"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ModuleWorkspace } from "@/app/modules/[moduleId]/module-workspace";
import { useProject } from "@/app/project-provider";
import { projectModules, statusText } from "@/lib/project";

export function ModuleAccordion() {
  const { runs } = useProject();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => new Set());
  useEffect(() => { setExpandedModules(new Set(JSON.parse(localStorage.getItem("biocompare.module-details") || "[]") as string[])); }, []);

  function toggleModule(moduleId: string) {
    setExpandedModules((current) => {
      const next = new Set(current);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      localStorage.setItem("biocompare.module-details", JSON.stringify([...next]));
      return next;
    });
  }

  return <section className="module-accordion-list" aria-label="专项比对项目总览"><div className="expand-controls module-expand-controls"><button type="button" onClick={() => { const all = new Set(projectModules.map((module) => module.id)); setExpandedModules(all); localStorage.setItem("biocompare.module-details", JSON.stringify([...all])); }}>展开全部</button><button type="button" onClick={() => { setExpandedModules(new Set()); localStorage.setItem("biocompare.module-details", "[]"); }}>收起全部</button></div>{projectModules.map((module) => {
    const run = runs[module.id];
    const expanded = expandedModules.has(module.id);
    const detailId = `module-detail-${module.id}`;
    return <article key={module.id} className={`module-accordion-item ${module.accent} ${expanded ? "expanded" : ""}`}>
      <div className="module-overview-row">
        <div className="module-overview-identity"><div className="module-icon">{module.kind === "ptm" ? "PTM" : "Da"}</div><div><span className="module-code-label">{module.code}</span><h3>{module.name}</h3><p>{module.description}</p></div></div>
        <div className="module-overview-engine"><span>专业引擎</span><strong>{module.engine}</strong><small>{module.method}</small></div>
        <div className="module-overview-state"><span className={`status-chip ${run.status}`}>{statusText[run.status]}</span><strong>{run.progress}%</strong><div className={`task-progress ${run.status}`}><span style={{ width: `${run.progress}%` }} /></div><small>{run.message}</small></div>
        <div className="module-overview-actions"><button type="button" className="module-toggle" aria-expanded={expanded} aria-controls={detailId} onClick={() => toggleModule(module.id)}>查看具体项目对比 <span aria-hidden="true">⌄</span></button><Link href={`/modules/${module.id}`}>在独立页面打开</Link></div>
      </div>
      {expanded && <div id={detailId} className="module-inline-detail"><div className="inline-detail-heading"><div><span>第二层明细</span><strong>{module.code} · {module.name}</strong></div><button type="button" onClick={() => toggleModule(module.id)}>收起明细 ×</button></div><ModuleWorkspace module={module} embedded /></div>}
    </article>;
  })}</section>;
}
