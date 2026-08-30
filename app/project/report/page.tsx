"use client";

import Link from "next/link";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { moduleResultSummary, projectModules, statusText } from "@/lib/project";
import { characterizationProjects, connectedCharacterizationCount } from "@/lib/characterization-catalog";
import { useProject } from "@/app/project-provider";
import { CountUp } from "@/app/count-up";

const groups = [
  ["一级结构", ["IM-", "DM-", "LC-", "HC-", "DHC-", "SEQ-"]],
  ["糖基化", ["GLY-"]], ["翻译后修饰", ["PTM-"]], ["纯化-尺寸异质性", ["PUR-"]], ["共价连接", ["COV-"]],
] as const;

export default function ReportPage() {
  const { runs, completedCount, exportingReport, exportReport } = useProject();
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [registerExpanded, setRegisterExpanded] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const percent = Math.round(completedCount / projectModules.length * 100);
  const runningCount = Object.values(runs).filter((run) => run.status === "queued" || run.status === "running").length;
  const criticalCount = Object.values(runs).filter((run) => run.status === "attention" || run.status === "failed").length;
  const pendingEngineCount = characterizationProjects.length - connectedCharacterizationCount;
  const grouped = useMemo(() => groups.map(([name, prefixes]) => ({ name, modules: projectModules.filter((module) => prefixes.some((prefix) => module.code.startsWith(prefix))) })).filter((group) => group.modules.length), []);
  const pages = Math.ceil(projectModules.length / pageSize);
  const visibleModules = projectModules.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setOpenGroups(new Set(JSON.parse(localStorage.getItem("biocompare.report.groups") || "[]") as string[]));
    setRegisterExpanded(localStorage.getItem("biocompare.report.register") === "true");
  }, []);
  const toggleGroup = (name: string) => setOpenGroups((current) => { const next = new Set(current); if (next.has(name)) next.delete(name); else next.add(name); localStorage.setItem("biocompare.report.groups", JSON.stringify([...next])); return next; });
  const toggleRegister = () => setRegisterExpanded((current) => { localStorage.setItem("biocompare.report.register", String(!current)); return !current; });

  return <section className="section-stack report-page">
    <div className="section-heading"><div><span className="eyebrow">CONSOLIDATED REVIEW SUMMARY</span><h2>总项目汇总简版报告</h2><p>聚合任务状态、客观结果和风险标记；点击专项可穿透到二级明细页。</p></div><button className="primary" disabled={exportingReport} onClick={() => void exportReport()}>{exportingReport ? "正在生成 Word…" : "导出整体结果（Word）"}</button></div>
    <section className="report-kpi kpi-strip"><article style={{ "--i": 0 } as CSSProperties}><span>总专项数</span><strong><CountUp value={projectModules.length} /></strong><small>已接入运行单元</small></article><article style={{ "--i": 1 } as CSSProperties}><span>已完成</span><strong><CountUp value={completedCount} /></strong><small>{percent}% 完成度</small></article><article style={{ "--i": 2 } as CSSProperties}><span>进行中</span><strong><CountUp value={runningCount} /></strong><small>排队及执行任务</small></article><article style={{ "--i": 3 } as CSSProperties}><span>引擎待接入</span><strong><CountUp value={pendingEngineCount} /></strong><small>静态表征框架</small></article><article className={criticalCount ? "danger" : ""} style={{ "--i": 4 } as CSSProperties}><span>关键差异项</span><strong><CountUp value={criticalCount} /></strong><small>需审评关注</small></article></section>
    <section className="report-module-accordions"><div className="section-heading compact"><div><span className="eyebrow">MODULE SUMMARIES</span><h2>按模块汇总</h2></div><div className="expand-controls"><button onClick={() => { const all = new Set(grouped.map((group) => group.name)); setOpenGroups(all); localStorage.setItem("biocompare.report.groups", JSON.stringify([...all])); }}>展开全部</button><button onClick={() => { setOpenGroups(new Set()); localStorage.setItem("biocompare.report.groups", "[]"); }}>收起全部</button></div></div>{grouped.map((group, index) => { const open = openGroups.has(group.name); const attention = group.modules.filter((module) => ["attention", "failed"].includes(runs[module.id].status)).length; const done = group.modules.filter((module) => ["completed", "attention"].includes(runs[module.id].status)).length; const staggerIndex = Math.min(index, 12); return <article className={`report-module-panel ${open ? "expanded" : ""}`} style={{ "--i": staggerIndex, "--stagger-delay": `${staggerIndex * 35}ms` } as CSSProperties} key={group.name}><button onClick={() => toggleGroup(group.name)} aria-expanded={open}><div><h3>{group.name}</h3><p>{done}/{group.modules.length} 项已形成结果{attention ? `，${attention} 项需关注` : "，当前无关键差异标记"}</p></div><span>{group.modules.length} 项</span><i>⌄</i></button>{open && <div className="report-module-body"><table><thead><tr><th>编号</th><th>专项</th><th>状态</th><th>结果摘要</th><th>操作</th></tr></thead><tbody>{group.modules.map((module) => <tr key={module.id}><td>{module.code}</td><td>{module.name}</td><td><span className={`status-chip ${runs[module.id].status}`}>{statusText[runs[module.id].status]}</span></td><td>{moduleResultSummary(runs[module.id])}</td><td><Link href={`/modules/${module.id}/results`}>穿透 →</Link></td></tr>)}</tbody></table></div>}</article>; })}</section>
    <section className="report-conclusion-grid"><article className="panel report-summary"><span className="eyebrow">OVERALL REVIEW CONTEXT</span><h3>总体结论边界</h3><p>当前 {completedCount} 个专项形成客观结果，项目完成度 {percent}%。总项目只汇总证据，不改变专项原始输出。</p><div className="report-callout">本报告不自动给出生物类似或不相似结论，最终判断由审评人员结合全部证据作出。</div></article><article className={`panel risk-panel ${criticalCount ? "has-risk" : ""}`}><span className="eyebrow">RISK FLAGS</span><h3>风险提示</h3><strong><CountUp value={criticalCount} /></strong><p>{criticalCount ? "存在需审评关注或执行失败的专项，请穿透明细核对。" : "当前暂无关键差异标记；未完成项目不视为无风险。"}</p></article></section>
    <section className={`panel report-table disclosure-panel ${registerExpanded ? "expanded" : ""}`}><button className="disclosure-summary" onClick={toggleRegister} aria-expanded={registerExpanded}><div><span className="eyebrow">MODULE EVIDENCE REGISTER</span><h2>专项结果登记与穿透</h2></div><p>{completedCount} 项已回传，{criticalCount} 项需关注</p><i>⌄</i></button>{registerExpanded && <div className="disclosure-body table-scroll"><table><thead className="sticky-head"><tr><th>编号</th><th>专项模块</th><th>运行来源</th><th>状态</th><th>简要结果</th><th>明细</th></tr></thead><tbody>{visibleModules.map((module) => { const run = runs[module.id]; return <tr key={module.id}><td>{module.code}</td><td><strong>{module.name}</strong><small>{module.method}</small></td><td>{run.source === "batch" ? "总项目调度" : run.source === "single" ? "专项独立运行" : "—"}</td><td><span className={`status-chip ${run.status}`}>{statusText[run.status]}</span></td><td>{moduleResultSummary(run)}</td><td><Link className="detail-link" href={`/modules/${module.id}/results`}>穿透 →</Link></td></tr>; })}</tbody></table><div className="table-pagination"><button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>上一页</button><span>第 {page} / {pages} 页</span><button disabled={page === pages} onClick={() => setPage((value) => value + 1)}>下一页</button></div></div>}</section>
  </section>;
}
