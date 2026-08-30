"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProject } from "@/app/project-provider";
import { ModuleAccordion } from "@/app/project/module-accordion";
import { CharacterizationCatalog } from "@/app/project/characterization-catalog";
import { characterizationProjects, connectedCharacterizationCount } from "@/lib/characterization-catalog";

export function ProjectOverviewDisclosure() {
  const { completedCount, runs } = useProject();
  const [overviewExpanded, setOverviewExpanded] = useState(false);
  const attentionCount = Object.values(runs).filter((run) => run.status === "attention" || run.status === "failed").length;
  const contentId = "all-comparison-projects-overview";
  useEffect(() => { setOverviewExpanded(localStorage.getItem("biocompare.project-overview.expanded") === "true"); }, []);
  const toggleOverview = () => setOverviewExpanded((current) => { localStorage.setItem("biocompare.project-overview.expanded", String(!current)); return !current; });

  return <section className={`project-overview-disclosure ${overviewExpanded ? "expanded" : ""}`}>
    <div className="overview-parent-row">
      <div className="overview-parent-copy"><span className="eyebrow">PHARMACEUTICAL CHARACTERIZATION</span><h2>药学表征项目一级概览</h2><p>按 CTD 章节浏览全部质量属性，快速定位已接入运算专项，并逐层进入项目明细。</p>
        <div className="overview-parent-metrics"><div><span>表征项目总数</span><strong>{characterizationProjects.length}</strong><small>项</small></div><div><span>已接入专业引擎</span><strong>{connectedCharacterizationCount}</strong><small>项</small></div><div><span>当前需关注</span><strong>{attentionCount}</strong><small>项</small></div></div>
      </div>
      <div className="overview-orbit" aria-hidden="true"><span>QUALITY<br />PROFILE</span></div>
    </div>
    <div className="overview-entry-grid">
      <article className="overview-entry-card catalog-entry"><div className="overview-entry-top"><span className="overview-entry-number">01</span><em>CTD PROJECT CATALOG</em></div><h3>药学表征项目总览</h3><p>浏览结构确证、理化特性、生物学功能与杂质四大类别，共 {characterizationProjects.length} 个表征项目。</p><div className="overview-entry-flow"><span>分类导航</span><b>→</b><span>项目检索</span><b>→</b><span>查看明细</span></div><button type="button" className="overview-master-toggle" aria-expanded={overviewExpanded} aria-controls={contentId} onClick={toggleOverview}><span>{overviewExpanded ? "收起全部比对项目总览" : "查看全部比对项目总览"}</span><i aria-hidden="true">⌄</i></button></article>
      <article className="overview-entry-card engine-entry"><div className="overview-entry-top"><span className="overview-entry-number">02</span><em>CONNECTED ANALYSIS</em></div><h3>已接入运算专项</h3><p>保留现有数据上传、任务调度、专业引擎和结果明细流程，当前已有 {connectedCharacterizationCount} 项可运行。</p><div className="overview-entry-flow"><span>专项输入</span><b>→</b><span>引擎计算</span><b>→</b><span>结果审阅</span></div><Link className="overview-entry-link" href="/project/data">进入专项数据工作区</Link></article>
    </div>
    {overviewExpanded && <div id={contentId} className="overview-disclosure-content">
      <div className="section-heading"><div><span className="eyebrow">LEVEL 2 · CTD PROJECT CATALOG</span><h2>全部药学表征项目总览</h2><p>根据Excel中的表征项目和清洗后CTD章节构建；未接入项目当前仅提供静态框架。</p></div><Link className="quiet link-button" href="/project/report">查看汇总简报</Link></div>
      <CharacterizationCatalog />
      <section className="connected-modules-section">
        <div className="connected-modules-head"><div><span className="eyebrow">CONNECTED ANALYSIS MODULES</span><h3>已接入运算专项</h3><p>继续使用现有数据上传、任务调度、专业引擎和结果明细逻辑。</p></div><strong>{connectedCharacterizationCount}<small> 项可运行</small></strong></div>
        <ModuleAccordion />
      </section>
    </div>}
  </section>;
}
