"use client";

import { useEffect, useState } from "react";
import { projectModules } from "@/lib/project";
import { useProject } from "@/app/project-provider";

export default function DataPage() {
  const { files, updateFile, unpairedMassMzmlFiles, ptmMapInputMode, setPtmMapInputMode, sequenceInputMode, setSequenceInputMode, sequenceFiles, updateSequenceFiles } = useProject();
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const ready = projectModules.filter((module) => module.kind === "ptm-map" && ptmMapInputMode[module.id] === "raw"
    ? sequenceFiles[module.id]?.candidateMzml.length && sequenceFiles[module.id]?.referenceMzml.length && sequenceFiles[module.id]?.fasta
    : module.kind === "sequence" || module.kind === "covalent"
      ? sequenceFiles[module.id]?.candidateMzml.length && sequenceFiles[module.id]?.referenceMzml.length && sequenceFiles[module.id]?.fasta
    : files[module.id].candidate && files[module.id].reference).length;
  const assignedFiles = projectModules.reduce((count, module) => count + Number(Boolean(files[module.id].candidate)) + Number(Boolean(files[module.id].reference)), 0);
  useEffect(() => { setExpanded(localStorage.getItem("biocompare.input-routing.expanded") === "true"); }, []);
  const toggle = () => setExpanded((current) => { localStorage.setItem("biocompare.input-routing.expanded", String(!current)); return !current; });
  const visibleModules = projectModules.slice((page - 1) * pageSize, page * pageSize);
  const pages = Math.ceil(projectModules.length / pageSize);
  const massModules = projectModules.filter((module) => module.kind === "mass");
  const massPairReady = Boolean(unpairedMassMzmlFiles.reference[0] && unpairedMassMzmlFiles.candidate[0]);
  const assignFile = (moduleId: string, code: string, kind: string, role: "candidate" | "reference", file: File | null) => {
    if ((kind === "sequence" || kind === "covalent") && file) {
      if (code === "SEQ-01" || code === "SEQ-02") setSequenceInputMode(moduleId, /\.(csv|tsv)$/i.test(file.name) ? "structured" : "raw");
      updateSequenceFiles(moduleId, { [role === "candidate" ? "candidateMzml" : "referenceMzml"]: [file] });
      return;
    }
    if (kind !== "ptm-map" || !file) { updateFile(moduleId, role, file); return; }
    const structured = /\.(csv|tsv)$/i.test(file.name);
    setPtmMapInputMode(moduleId, structured ? "structured" : "raw");
    if (structured) updateFile(moduleId, role, file);
    else updateSequenceFiles(moduleId, { [role === "candidate" ? "candidateMzml" : "referenceMzml"]: [file] });
  };

  return <section className="section-stack">
    <div className="section-heading"><div><span className="eyebrow">PROJECT DATA HUB</span><h2>统一输入与数据分发</h2><p>总项目负责登记文件；每个文件只路由到指定专项，避免跨模块误用。</p></div><span className="section-badge">可审计数据流</span></div>
    <div className="panel common-data-panel"><div className="common-summary"><div><span>候选药角色</span><strong>候选生物类似药 A</strong></div><div><span>参照药角色</span><strong>参照药 B / 多批次</strong></div><div><span>流转规则</span><strong>项目登记 → 专项适配器</strong></div></div><details className="reserved-slots help-drawer inline-help"><summary>已接入能力与后续扩展说明 <i>⌄</i></summary><div><span>已接入能力</span><em>PDF文本层解析</em><em>DOCX表格解析</em><em>OpenMS/Sage适配器</em><em>结构化字段校验</em><span>后续扩展</span><em>扫描件OCR</em><em>对象存储</em></div></details></div>
    {(unpairedMassMzmlFiles.reference.length > 0 || unpairedMassMzmlFiles.candidate.length > 0 || unpairedMassMzmlFiles.unresolved.length > 0) && <section className="panel mass-mzml-quick-assign"><div><span className="eyebrow">MASS mzML QUICK ASSIGN</span><h2>未配对 FASTA 的 mzML 快捷分配</h2><p>参照：{unpairedMassMzmlFiles.reference.map((file) => file.name).join("、") || "未识别"}；候选：{unpairedMassMzmlFiles.candidate.map((file) => file.name).join("、") || "未识别"}</p><small>仅点击后登记到所选专项，不自动运行；请先确认数据确为完整蛋白或亚基质谱。</small></div><div>{massModules.map((module) => <button className="secondary" disabled={!massPairReady} key={module.id} onClick={() => { updateFile(module.id, "reference", unpairedMassMzmlFiles.reference[0]); updateFile(module.id, "candidate", unpairedMassMzmlFiles.candidate[0]); }}>{module.code} 分配此配对</button>)}</div></section>}
    <section className={`panel data-matrix disclosure-panel ${expanded ? "expanded" : ""}`}><button className="disclosure-summary" onClick={toggle} aria-expanded={expanded}><div><span className="eyebrow">MODULE INPUT ROUTING</span><h2>专项输入分配</h2></div><p>已为 {ready} 个专项完成双侧输入，共登记 {assignedFiles} 个文件</p><i>⌄</i></button>{expanded && <div className="disclosure-body"><div className="data-table-head sticky-head"><span>专项模块</span><span>候选药输入</span><span>参照药输入</span><span>状态</span></div>{visibleModules.map((module) => { const input = files[module.id]; const rawPtmMap = module.kind === "ptm-map" && ptmMapInputMode[module.id] === "raw"; const sequenceRouted = module.kind === "sequence" || module.kind === "covalent" || rawPtmMap; const candidate = sequenceRouted ? sequenceFiles[module.id]?.candidateMzml[0] : input.candidate; const reference = sequenceRouted ? sequenceFiles[module.id]?.referenceMzml[0] : input.reference; const moduleReady = sequenceRouted ? Boolean(candidate && reference && sequenceFiles[module.id]?.fasta) : Boolean(candidate && reference); const dualSequence = module.code === "SEQ-01" || module.code === "SEQ-02"; const accept = module.kind === "ptm" ? ".csv,.tsv" : module.kind === "ptm-map" || dualSequence ? ".csv,.tsv,.mzml" : module.kind === "sequence" || module.kind === "covalent" ? ".mzml,.mgf" : ".txt,.dat,.csv,.mzml"; return <div className="data-table-row" key={module.id}><div><strong>{module.name}</strong><small>{module.code} · {module.method}{dualSequence ? ` · ${sequenceInputMode[module.id] === "structured" ? "鉴定表" : "原始谱图"}` : ""}</small>{sequenceRouted && <label className="inline-fasta-slot">{sequenceFiles[module.id]?.fasta?.name || "补充FASTA"}<input type="file" accept=".fasta,.fa" onChange={(event) => updateSequenceFiles(module.id, { fasta: event.target.files?.[0] || null })} /></label>}</div><label className={candidate ? "file-slot filled" : "file-slot"}>{candidate?.name || "选择候选药文件"}<input type="file" accept={accept} onChange={(event) => assignFile(module.id, module.code, module.kind, "candidate", event.target.files?.[0] || null)} /></label><label className={reference ? "file-slot filled reference" : "file-slot reference"}>{reference?.name || "选择参照药文件"}<input type="file" accept={accept} onChange={(event) => assignFile(module.id, module.code, module.kind, "reference", event.target.files?.[0] || null)} /></label><span className={moduleReady ? "routing ready" : "routing"}>{moduleReady ? "输入就绪" : "等待输入"}</span></div>; })}<div className="table-pagination"><button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>上一页</button><span>第 {page} / {pages} 页</span><button disabled={page === pages} onClick={() => setPage((value) => value + 1)}>下一页</button></div></div>}</section>
    <div className="template-links"><span>PTM模板</span><a href="/templates/ptm-reference-example.csv" download>参照药示例</a><a href="/templates/ptm-candidate-example.csv" download>候选药示例</a><a href="/templates/PTM-INTERVAL-README.md" download>字段说明</a></div>
  </section>;
}
