"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  characterizationCategories,
  characterizationProjects,
  connectedCharacterizationCount,
  type CatalogAvailability,
  type CharacterizationCategory,
} from "@/lib/characterization-catalog";

type CategoryFilter = "全部项目" | CharacterizationCategory;
type AvailabilityFilter = "all" | CatalogAvailability;

const categoryIcon: Record<CharacterizationCategory, string> = {
  "结构确证": "构",
  "理化特性": "理",
  "生物学功能": "效",
  "杂质": "杂",
};

const subgroupDescription: Record<string, string> = {
  "分子组成与亚基质量": "确认整体及亚基质量、主要分子形式和可解释异质性。",
  "序列确认": "通过肽质量、碎片谱和特征肽形成一级序列证据链。",
  "共价连接": "核对游离巯基和二硫键连接方式。",
  "翻译后修饰": "按修饰类型、位点与相对丰度建立分层比较框架。",
  "整体构象与二级结构": "从整体构象层面比较二级结构特征。",
  "三级结构与局部环境": "观察芳香族残基微环境及三级结构差异。",
  "构象稳定性": "比较热转变及构象稳定性分布。",
  "补充高级结构": "预留正交或位点特异的高级结构证据。",
  "糖基化位点": "确认糖基化位点及占有率。",
  "糖型组成与分布": "比较主要、次要糖型和唾液酸相关结构。",
  "N-糖链类型及比例": "细化半乳糖、高甘露糖和核心岩藻糖特征。",
  "基本理化性质": "展示分子基础物理化学属性。",
  "纯度与分子尺寸异质性": "覆盖聚集体、单体、片段及电泳纯度。",
  "电荷异质性": "比较酸性、主峰和碱性电荷变异体。",
  "靶标结合与作用机制": "连接靶标结合、机制相关功能和相对效价。",
  "Fc受体及补体结合": "覆盖Fc受体、FcRn及C1q结合能力。",
  "效应功能": "比较ADCC与CDC等关键效应功能。",
  "产品相关杂质": "登记由产品结构变化或降解形成的杂质。",
  "工艺相关杂质": "登记Protein A、DNA、HCP等工艺残留。",
};

export function CharacterizationCatalog() {
  const [category, setCategory] = useState<CategoryFilter>("全部项目");
  const [availability, setAvailability] = useState<AvailabilityFilter>("all");
  const [query, setQuery] = useState("");
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  useEffect(() => { setOpenCategories(new Set(JSON.parse(localStorage.getItem("biocompare.catalog.categories") || "[]") as string[])); }, []);

  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
  const filteredProjects = useMemo(() => characterizationProjects.filter((item) => {
    if (category !== "全部项目" && item.category !== category) return false;
    if (availability !== "all" && item.availability !== availability) return false;
    if (!normalizedQuery) return true;
    return [item.name, item.code, item.category, item.subgroup, item.ctdLabel]
      .some((value) => value.toLocaleLowerCase("zh-CN").includes(normalizedQuery));
  }), [availability, category, normalizedQuery]);

  const grouped = useMemo(() => characterizationCategories.map((categoryDefinition) => {
    const items = filteredProjects.filter((item) => item.category === categoryDefinition.name);
    const subgroups = Array.from(new Set(items.map((item) => item.subgroup)));
    return { ...categoryDefinition, items, subgroups };
  }).filter((item) => item.items.length > 0), [filteredProjects]);

  function resetFilters() {
    setCategory("全部项目");
    setAvailability("all");
    setQuery("");
  }

  function setCategoryOpen(name: string) {
    setOpenCategories((current) => { const next = new Set(current); if (next.has(name)) next.delete(name); else next.add(name); localStorage.setItem("biocompare.catalog.categories", JSON.stringify([...next])); return next; });
  }

  return <section id="characterization-catalog" className="characterization-catalog" aria-label="生物类似药表征项目目录">
    <aside className="catalog-sidebar">
      <div className="catalog-sidebar-head">
        <span>CTD CHARACTERIZATION</span>
        <strong>表征项目目录</strong>
        <small>来源：V0.1药学比对研究汇总表</small>
      </div>
      <button type="button" className={category === "全部项目" ? "catalog-nav-item active" : "catalog-nav-item"} onClick={() => setCategory("全部项目")}>
        <i>全</i><span><strong>全部项目</strong><small>完整静态框架</small></span><em>{characterizationProjects.length}</em>
      </button>
      {characterizationCategories.map((item) => {
        const count = characterizationProjects.filter((projectItem) => projectItem.category === item.name).length;
        return <button type="button" key={item.name} className={category === item.name ? "catalog-nav-item active" : "catalog-nav-item"} onClick={() => setCategory(item.name)}>
          <i>{categoryIcon[item.name]}</i><span><strong>{item.name}</strong><small>{item.description}</small></span><em>{count}</em>
        </button>;
      })}
      <div className="catalog-legend">
        <p><span className="legend-dot connected" />已接入运算专项 <b>{connectedCharacterizationCount}</b></p>
        <p><span className="legend-dot planned" />静态框架待接入 <b>{characterizationProjects.length - connectedCharacterizationCount}</b></p>
      </div>
    </aside>

    <div className="catalog-content">
      <div className="catalog-toolbar">
        <label className="catalog-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索项目名称、编号或CTD章节" aria-label="搜索表征项目" />{query && <button type="button" onClick={() => setQuery("")} aria-label="清空搜索">×</button>}</label>
        <div className="catalog-filter" aria-label="接入状态筛选">
          <button type="button" className={availability === "all" ? "active" : ""} onClick={() => setAvailability("all")}>全部</button>
          <button type="button" className={availability === "connected" ? "active" : ""} onClick={() => setAvailability("connected")}>已接入</button>
          <button type="button" className={availability === "planned" ? "active" : ""} onClick={() => setAvailability("planned")}>待接入</button>
        </div>
        <span className="catalog-result-count">当前显示 <strong>{filteredProjects.length}</strong> 项</span>
        <div className="expand-controls"><button type="button" onClick={() => { const all = new Set(grouped.map((item) => item.name)); setOpenCategories(all); localStorage.setItem("biocompare.catalog.categories", JSON.stringify([...all])); }}>展开全部</button><button type="button" onClick={() => { setOpenCategories(new Set()); localStorage.setItem("biocompare.catalog.categories", "[]"); }}>收起全部</button></div>
      </div>

      {grouped.length === 0 && <div className="catalog-empty"><strong>没有匹配的表征项目</strong><p>请调整关键词或筛选条件。</p><button type="button" onClick={resetFilters}>重置筛选</button></div>}

      {grouped.map((categoryGroup) => { const open = openCategories.has(categoryGroup.name); return <section className={`catalog-category category-${categoryGroup.code} ${open ? "expanded" : ""}`} key={categoryGroup.name}>
        <button type="button" className="catalog-category-head" onClick={() => setCategoryOpen(categoryGroup.name)} aria-expanded={open}><div className="category-number">{categoryGroup.code}</div><div><span>CTD CATEGORY</span><h3>{categoryGroup.name}</h3><p>{categoryGroup.description}</p></div><strong>{categoryGroup.items.length}<small> 项</small></strong><i>⌄</i></button>
        {open && categoryGroup.subgroups.map((subgroup) => {
          const subgroupItems = categoryGroup.items.filter((item) => item.subgroup === subgroup);
          return <section className="catalog-subgroup" key={subgroup}>
            <div className="catalog-subgroup-head"><div><h4>{subgroup}</h4><p>{subgroupDescription[subgroup]}</p></div><span>{subgroupItems.length} 项</span></div>
            <div className="catalog-project-grid">{subgroupItems.map((item) => <article className={`catalog-project-card ${item.availability}`} key={item.id}>
              <div className="catalog-card-top"><span className="catalog-code">{item.code}</span><span className={`catalog-status ${item.availability}`}>{item.availability === "connected" ? "已接入" : "引擎待接入"}</span></div>
              <h5>{item.name}</h5>
              <span className="ctd-tag" title={`CTD章节：${item.ctdLabel}`}>{item.ctdLabel}</span>
              <p>{subgroupDescription[item.subgroup]}</p>
              <div className="catalog-card-footer"><span>{item.availability === "connected" ? "保留现有运行逻辑" : "仅建立页面与数据占位"}</span>{item.moduleId ? <Link href={`/modules/${item.moduleId}`}>进入专项 →</Link> : <button type="button" disabled>暂不可运行</button>}</div>
            </article>)}</div>
          </section>;
        })}
      </section>; })}
    </div>
  </section>;
}
