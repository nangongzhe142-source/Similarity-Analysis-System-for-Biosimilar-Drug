"""Dependency-free DOCX skeleton for the BioCompare consolidated report."""

from __future__ import annotations

import json
import zipfile
from datetime import datetime, timezone
from html import escape
from pathlib import Path
from typing import Any

RESULT_KEYS = ("result", "ptmResult", "sequenceResult", "ptmMapResult", "glycanResult", "chromatographyResult", "covalentResult")


def _text(value: Any) -> str:
    if value is None:
        return "—"
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False)
    return str(value)


def _run(text: Any, *, bold: bool = False, size: int = 22, color: str = "142E3B") -> str:
    props = f'<w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Microsoft YaHei"/><w:b w:val="{1 if bold else 0}"/><w:color w:val="{color}"/><w:sz w:val="{size}"/><w:szCs w:val="{size}"/></w:rPr>'
    return f'<w:r>{props}<w:t xml:space="preserve">{escape(_text(text))}</w:t></w:r>'


def _paragraph(text: Any, *, style: str = "Normal", bold: bool = False, size: int = 22, color: str = "142E3B", before: int = 0, after: int = 120) -> str:
    return f'<w:p><w:pPr><w:pStyle w:val="{style}"/><w:spacing w:before="{before}" w:after="{after}" w:line="264" w:lineRule="auto"/></w:pPr>{_run(text, bold=bold, size=size, color=color)}</w:p>'


def _cell(text: Any, width: int, *, header: bool = False) -> str:
    fill = '<w:shd w:val="clear" w:color="auto" w:fill="E8EEF5"/>' if header else ""
    return f'<w:tc><w:tcPr><w:tcW w:w="{width}" w:type="dxa"/>{fill}<w:tcMar><w:top w:w="80" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar></w:tcPr>{_paragraph(text, bold=header, size=18, after=0)}</w:tc>'


def _table(headers: list[str], rows: list[list[Any]], widths: list[int]) -> str:
    grid = "".join(f'<w:gridCol w:w="{width}"/>' for width in widths)
    border = '<w:tblBorders>' + "".join(f'<w:{side} w:val="single" w:sz="4" w:space="0" w:color="DCE7E7"/>' for side in ("top", "left", "bottom", "right", "insideH", "insideV")) + '</w:tblBorders>'
    props = f'<w:tblPr><w:tblW w:w="9360" w:type="dxa"/><w:tblInd w:w="120" w:type="dxa"/><w:tblLayout w:type="fixed"/>{border}</w:tblPr>'
    head = '<w:tr><w:trPr><w:tblHeader/></w:trPr>' + "".join(_cell(value, widths[index], header=True) for index, value in enumerate(headers)) + '</w:tr>'
    body = "".join('<w:tr>' + "".join(_cell(value, widths[index]) for index, value in enumerate(row)) + '</w:tr>' for row in rows)
    return f'<w:tbl>{props}<w:tblGrid>{grid}</w:tblGrid>{head}{body}</w:tbl>'


def _module_result(module: dict[str, Any]) -> dict[str, Any]:
    return next((value for key in RESULT_KEYS if isinstance((value := module.get(key)), dict) and value), {})


def _has_result(module: dict[str, Any]) -> bool:
    return module.get("status") in {"completed", "attention"} and bool(_module_result(module))


def _module_detail(module: dict[str, Any]) -> str:
    result = _module_result(module)
    summary = result.get("summary") if isinstance(result, dict) else None
    if isinstance(summary, dict) and module.get("kind") == "ptm":
        return f"参照批次 {summary.get('referenceLotCount', '—')}；区间外 {summary.get('outsideIntervalCount', 0)}；新增修饰 {summary.get('candidateOnlyVariantCount', 0)}；完整性预警 {summary.get('integrityWarningCount', 0)}"
    if isinstance(summary, dict) and "matchedCount" in summary:
        return f"匹配峰 {summary.get('matchedCount', 0)}；平均|ΔDa| {summary.get('meanAbsDeltaDa', '—')}；最大|Δppm| {summary.get('maxAbsDeltaPpm', '—')}；未匹配峰 {summary.get('unmatchedCandidateCount', 0)}"
    if isinstance(result.get("comparisonTable"), list):
        return f"形成对比结果 {len(result['comparisonTable'])} 行；状态 {result.get('status', module.get('statusText', '已完成'))}"
    if isinstance(result.get("siteRows"), list):
        quality = result.get("qualityGate") if isinstance(result.get("qualityGate"), dict) else {}
        return f"定量位点 {len(result['siteRows'])}；合格PSM {quality.get('acceptedPsmCount', '—')}"
    if isinstance(result.get("identifiedLinks"), list):
        return f"连接证据 {len(result['identifiedLinks'])}；正交一致 {len(result.get('orthogonalPairIds') or [])}"
    return module.get("message") or "专项已形成结构化结果"


def _module_brief(module: dict[str, Any]) -> str:
    result = _module_result(module)
    if isinstance(result, dict) and result.get("briefExplanation"):
        return str(result["briefExplanation"])
    return _module_detail(module)


def build_project_report(payload: dict[str, Any], target: Path) -> None:
    raw_modules = payload.get("modules") if isinstance(payload.get("modules"), list) else []
    modules = [item for item in raw_modules if isinstance(item, dict) and _has_result(item)]
    if not modules:
        raise ValueError("本次运算尚无可导出的结果")
    generated = datetime.now(timezone.utc).astimezone().strftime("%Y-%m-%d %H:%M:%S %Z")
    completed = sum(1 for item in modules if item.get("status") in {"completed", "attention"})
    rows = [[item.get("code"), item.get("name"), item.get("statusText") or item.get("status"), "总项目调度" if item.get("source") == "batch" else "专项独立运行" if item.get("source") == "single" else "—", _module_detail(item)] for item in modules]
    body = [
        _paragraph(payload.get("projectName") or "生物类似药比对项目", style="Title", bold=True, size=40, color="0B5960", after=80),
        _paragraph("整体结果汇总报告（试点版）", style="Subtitle", size=26, color="506A72", after=240),
        _paragraph(f"生成时间：{generated}", size=18, color="6F858E", after=40),
        _paragraph(f"运行批次：{payload.get('batchLabel') or '未标注'}；最近完成：{payload.get('completedAt') or '—'}", size=18, color="6F858E", after=40),
        _paragraph(f"报告范围：{len(modules)} 个专项；已形成结果：{completed} 个", size=20, after=180),
        _paragraph("一、项目说明", style="Heading1", bold=True, size=32, color="2E74B5", before=160, after=100),
        _paragraph("本报告自动汇总 BioCompare 总项目及各专项的结构化结果。系统仅呈现客观数据、任务状态和风险提示，不自动给出生物类似或不相似结论。", after=180),
        _paragraph("二、专项结果汇总", style="Heading1", bold=True, size=32, color="2E74B5", before=160, after=100),
        _table(["编号", "专项", "状态", "运行来源", "关键数据"], rows, [800, 1900, 1000, 1400, 4260]),
        _paragraph("三、结果简要解释", style="Heading1", bold=True, size=32, color="2E74B5", before=200, after=100),
        *[_paragraph(f"{item.get('code', '—')} {item.get('name', '专项')}：{_module_brief(item)}", after=90) for item in modules],
        _paragraph("四、审评提示", style="Heading1", bold=True, size=32, color="2E74B5", before=200, after=100),
        _paragraph("对于标记为“需关注”或“失败”的专项，应结合输入完整性、方法学适用性、批次设计、原始谱图和正交证据进行人工复核。", after=120),
        _paragraph("声明：本自动导出文档为研发阶段报告骨架，内容和样式模板仍需后续验证与版本化管理。", bold=True, size=18, color="9B1C1C", before=120, after=0),
    ]
    document = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + "".join(body) + '<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>'
    styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Microsoft YaHei"/><w:sz w:val="22"/></w:rPr></w:rPrDefault></w:docDefaults>' + "".join(f'<w:style w:type="paragraph" w:styleId="{style}"><w:name w:val="{name}"/></w:style>' for style, name in (("Normal", "Normal"), ("Title", "Title"), ("Subtitle", "Subtitle"), ("Heading1", "Heading 1"))) + '</w:styles>'
    content_types = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>'
    rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>'
    document_rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'
    core = f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>BioCompare整体结果汇总报告</dc:title><dc:creator>BioCompare</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">{datetime.now(timezone.utc).isoformat()}</dcterms:created></cp:coreProperties>'
    app = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>BioCompare</Application></Properties>'
    target.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as archive:
        for name, value in (("[Content_Types].xml", content_types), ("_rels/.rels", rels), ("word/document.xml", document), ("word/styles.xml", styles), ("word/_rels/document.xml.rels", document_rels), ("docProps/core.xml", core), ("docProps/app.xml", app)):
            archive.writestr(name, value.encode("utf-8"))
