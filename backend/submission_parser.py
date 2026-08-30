"""Auditable enterprise-submission parser and deterministic module router.

CSV/TSV/XLSX are parsed as structured tables. DOCX tables and text-layer PDF
tables are extracted locally without an AI model. Scanned PDFs are detected
and reported explicitly; OCR remains an extension point instead of silently
guessing values. mzML/FASTA files are inventoried as a raw OpenMS/Sage bundle.
"""

from __future__ import annotations

import csv
import io
import re
import zipfile
from collections import defaultdict
from pathlib import Path
from typing import Any
from xml.etree import ElementTree as ET

MAX_ROWS_PER_TABLE = 100_000
MAX_XLSX_UNCOMPRESSED_BYTES = 100 * 1024 * 1024
MAX_DOCUMENT_CHARACTERS = 5_000_000
NS = {"a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main", "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships", "p": "http://schemas.openxmlformats.org/package/2006/relationships"}
WORD_NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}

MODULES = {
    "deglycosylated-heavy-chain-mass": ("脱糖重链分子量", ("deglycosylatedheavy", "deglycoheavy", "deglyheavy", "脱糖重链")),
    "deglycosylated-intact-mass": ("脱糖完整分子量", ("deglycosylatedintact", "deglyintact", "deglyco", "脱糖完整", "脱糖分子量")),
    "heavy-chain-mass": ("未脱糖重链分子量", ("heavychainmass", "heavychain", "intactheavy", "未脱糖重链", "重链分子量")),
    "light-chain-mass": ("轻链分子量", ("lightchainmass", "lightchain", "轻链分子量", "轻链")),
    "post-translational-modifications": ("翻译后修饰位点定量", ("posttranslational", "modification", "ptm", "mam", "翻译后修饰", "修饰位点")),
    "intact-mass": ("完整分子量", ("intactmass", "wholemass", "fullmass", "完整分子量", "完整分子质量")),
}
ROLE_ALIASES = {
    "candidate": ("candidate", "biosimilar", "test", "samplea", "drug a", "候选药", "候选", "类似药", "样品a", "a药"),
    "reference": ("reference", "originator", "innovator", "comparator", "sampleb", "drug b", "参照药", "参照", "原研药", "样品b", "b药"),
}
HEADER_ALIASES = {
    "sample_role": ("sample_role", "role", "sampletype", "样品角色", "样品类型", "药物角色"),
    "mz": ("mz", "m/z", "masscharge", "质荷比"),
    "mass": ("mass", "massda", "molecularmass", "分子量", "质量"),
    "intensity": ("intensity", "abundance", "signal", "height", "强度", "丰度", "峰高"),
    "lot_id": ("lot_id", "lot", "batch", "batchid", "批号", "批次"),
    "protein_chain": ("protein_chain", "chain", "蛋白链", "链"),
    "residue": ("residue", "aminoacid", "氨基酸", "残基"),
    "position": ("position", "site", "位点", "位置"),
    "modification": ("modification", "ptm", "修饰", "修饰类型"),
    "value_percent": ("value_percent", "relativeabundance", "percent", "含量", "相对丰度", "百分比"),
}
RAW_HEADER_ALIASES = {
    "time": ("time", "retention_time", "retention time", "migration_time", "migration time", "rt", "时间", "保留时间", "迁移时间"),
    "signal": ("intensity", "signal", "absorbance", "fluorescence", "response", "强度", "信号", "吸光度", "荧光"),
    "glycan": ("glycan", "glycoform", "n-glycan", "糖型", "糖链"),
    "peak_area": (
        "peak_area",
        "peak area",
        "peak_area_percent",
        "peak area percent",
        "area",
        "area_percent",
        "area percent",
        "峰面积",
        "峰面积占比",
        "面积",
        "面积占比",
    ),
    "free_thiol": ("sh/mol protein", "mol sh/mol protein", "free thiol", "free sulfhydryl", "游离巯基"),
}


def _norm(value: Any) -> str:
    return re.sub(r"[^a-z0-9\u4e00-\u9fff]+", "", str(value or "").strip().lower())


def _header_key(value: Any) -> str | None:
    normalized = _norm(value)
    for key, aliases in HEADER_ALIASES.items():
        if normalized in {_norm(alias) for alias in aliases}:
            return key
    return None


def _raw_dataset_kind(headers: list[str]) -> str | None:
    normalized = {_norm(header) for header in headers}
    matched = {key for key, aliases in RAW_HEADER_ALIASES.items() if any(_norm(alias) in normalized for alias in aliases)}
    if "free_thiol" in matched:
        return "free-thiol"
    if {"glycan", "peak_area"} <= matched:
        return "glycan"
    if {"time", "signal"} <= matched:
        return "chromatography"
    return None


def _file_role(name: str) -> tuple[str | None, str | None]:
    role, reason = _recognize_role(name)
    if role:
        return role, reason
    lowered = name.lower()
    if re.search(r"(?:^|[^a-z])r(?:ef)?\d+", lowered):
        return "reference", "文件名命中R批次编号"
    if re.search(r"(?:^|[^a-z])c(?:and)?\d+", lowered):
        return "candidate", "文件名命中C批次编号"
    return None, None


def _read_delimited(path: Path) -> list[tuple[str, list[list[Any]]]]:
    raw = path.read_bytes()
    text = None
    for encoding in ("utf-8-sig", "gb18030", "utf-16"):
        try:
            text = raw.decode(encoding)
            break
        except UnicodeDecodeError:
            continue
    if text is None:
        raise ValueError("无法识别文本编码")
    try:
        dialect = csv.Sniffer().sniff(text[:8192], delimiters=",\t;")
    except csv.Error:
        dialect = csv.excel_tab if path.suffix.lower() == ".tsv" else csv.excel
    rows = [list(row) for row in csv.reader(io.StringIO(text), dialect) if any(str(cell).strip() for cell in row)]
    return [(path.stem, rows[:MAX_ROWS_PER_TABLE])]


def _column_index(cell_ref: str) -> int:
    letters = "".join(character for character in cell_ref if character.isalpha()).upper()
    value = 0
    for letter in letters:
        value = value * 26 + ord(letter) - 64
    return max(value - 1, 0)


def _read_xlsx(path: Path) -> list[tuple[str, list[list[Any]]]]:
    with zipfile.ZipFile(path) as archive:
        if sum(item.file_size for item in archive.infolist()) > MAX_XLSX_UNCOMPRESSED_BYTES:
            raise ValueError("XLSX解压后内容超过100MB安全限制")
        shared: list[str] = []
        if "xl/sharedStrings.xml" in archive.namelist():
            root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            shared = ["".join(node.text or "" for node in item.findall(".//a:t", NS)) for item in root.findall("a:si", NS)]
        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        relationships = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        targets = {item.attrib["Id"]: item.attrib["Target"] for item in relationships.findall("p:Relationship", NS)}
        output = []
        for sheet in workbook.findall(".//a:sheet", NS):
            name = sheet.attrib.get("name", "Sheet")
            relation_id = sheet.attrib.get(f"{{{NS['r']}}}id")
            target = targets.get(relation_id or "", "")
            member = target.lstrip("/") if target.startswith("/") else f"xl/{target.lstrip('/')}"
            member = re.sub(r"xl/\.\./", "", member)
            root = ET.fromstring(archive.read(member))
            rows: list[list[Any]] = []
            for row_node in root.findall(".//a:sheetData/a:row", NS)[:MAX_ROWS_PER_TABLE]:
                values: list[Any] = []
                for cell in row_node.findall("a:c", NS):
                    index = _column_index(cell.attrib.get("r", "A1"))
                    while len(values) <= index:
                        values.append("")
                    cell_type = cell.attrib.get("t")
                    value_node = cell.find("a:v", NS)
                    if cell_type == "inlineStr":
                        value = "".join(node.text or "" for node in cell.findall(".//a:t", NS))
                    elif value_node is None:
                        value = ""
                    elif cell_type == "s":
                        shared_index = int(value_node.text or 0)
                        value = shared[shared_index] if shared_index < len(shared) else ""
                    else:
                        value = value_node.text or ""
                    values[index] = value
                if any(str(value).strip() for value in values):
                    rows.append(values)
            if rows:
                output.append((name, rows))
        return output


def _split_table_line(line: str) -> list[str]:
    line = line.strip().strip("|")
    if "\t" in line:
        return [item.strip() for item in line.split("\t")]
    if "|" in line:
        return [item.strip() for item in line.split("|")]
    if "," in line or "，" in line:
        return [item.strip() for item in re.split(r"[,，]", line)]
    return [item.strip() for item in re.split(r"\s{2,}", line)]


def _tables_from_text(text: str, prefix: str) -> list[tuple[str, list[list[Any]]]]:
    """Find conservative table-like blocks in extracted document text."""
    blocks: list[list[list[str]]] = []
    current: list[list[str]] = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        cells = _split_table_line(line) if line else []
        table_like = len(cells) >= 2 and any(_header_key(cell) for cell in cells)
        numeric_like = len(cells) >= 2 and any(_is_number(cell) for cell in cells)
        if table_like or (current and numeric_like):
            current.append(cells)
        elif current:
            if len(current) >= 2:
                blocks.append(current)
            current = []
    if len(current) >= 2:
        blocks.append(current)
    return [(f"{prefix}-{index + 1}", rows[:MAX_ROWS_PER_TABLE]) for index, rows in enumerate(blocks)]


def _read_docx(path: Path) -> tuple[list[tuple[str, list[list[Any]]]], dict[str, Any]]:
    with zipfile.ZipFile(path) as archive:
        if sum(item.file_size for item in archive.infolist()) > MAX_XLSX_UNCOMPRESSED_BYTES:
            raise ValueError("DOCX解压后内容超过100MB安全限制")
        if "word/document.xml" not in archive.namelist():
            raise ValueError("DOCX中缺少word/document.xml，文件可能已损坏或并非有效Word文档")
        root = ET.fromstring(archive.read("word/document.xml"))
    tables: list[tuple[str, list[list[Any]]]] = []
    for index, table in enumerate(root.findall(".//w:tbl", WORD_NS)):
        rows = []
        for row in table.findall("w:tr", WORD_NS):
            values = ["".join(node.text or "" for node in cell.findall(".//w:t", WORD_NS)).strip() for cell in row.findall("w:tc", WORD_NS)]
            if any(values):
                rows.append(values)
        if rows:
            tables.append((f"Word表格{index + 1}", rows[:MAX_ROWS_PER_TABLE]))
    paragraphs = ["".join(node.text or "" for node in paragraph.findall(".//w:t", WORD_NS)).strip() for paragraph in root.findall(".//w:p", WORD_NS)]
    text = "\n".join(item for item in paragraphs if item)[:MAX_DOCUMENT_CHARACTERS]
    if not tables:
        tables.extend(_tables_from_text(text, "Word文本表"))
    return tables, {
        "status": "parsed" if tables else "unrecognized",
        "paragraphCount": sum(bool(item) for item in paragraphs), "tableCount": len(tables),
        "extractedCharacters": len(text), "preview": text[:500], "warnings": [],
    }


def _read_pdf(path: Path) -> tuple[list[tuple[str, list[list[Any]]]], dict[str, Any]]:
    try:
        from pypdf import PdfReader
    except ImportError as error:
        raise ValueError("PDF解析组件pypdf未安装，请先执行本地依赖安装脚本") from error
    reader = PdfReader(str(path), strict=False)
    pages: list[str] = []
    blank_pages = 0
    for page in reader.pages:
        try:
            page_text = page.extract_text(extraction_mode="layout") or ""
        except Exception:
            page_text = page.extract_text() or ""
        pages.append(page_text)
        blank_pages += int(not page_text.strip())
    text = "\n\n".join(pages)[:MAX_DOCUMENT_CHARACTERS]
    tables = _tables_from_text(text, "PDF文本表")
    warnings = []
    if blank_pages:
        warnings.append(f"{blank_pages}页未检测到可提取文本")
    status = "parsed" if tables else "partial" if text.strip() else "unrecognized"
    if status == "unrecognized":
        warnings.append("PDF没有可用文本层，可能是扫描件；当前未启用OCR，请提供可检索PDF或结构化结果表")
    elif not tables:
        warnings.append("已提取PDF文字，但未识别到包含标准字段的可比对表格")
    return tables, {
        "status": status, "pageCount": len(reader.pages), "tableCount": len(tables),
        "extractedCharacters": len(text), "preview": text[:500], "warnings": warnings,
    }


def _is_number(value: Any) -> bool:
    try:
        float(str(value).replace(",", "").strip())
        return True
    except ValueError:
        return False


def _table_parts(rows: list[list[Any]]) -> tuple[list[str], list[list[Any]]]:
    if not rows:
        return [], []
    if sum(_is_number(cell) for cell in rows[0][:2]) == min(2, len(rows[0])):
        width = max(len(row) for row in rows)
        return [f"column_{index + 1}" for index in range(width)], rows
    return [str(cell).strip() for cell in rows[0]], rows[1:]


def _recognize_module(context: str, canonical_headers: set[str]) -> tuple[str | None, list[str]]:
    normalized = _norm(context)
    for module_id, (_, aliases) in MODULES.items():
        for alias in aliases:
            if _norm(alias) and _norm(alias) in normalized:
                return module_id, [f"名称命中：{alias}"]
    ptm_required = {"lot_id", "protein_chain", "residue", "position", "modification", "value_percent"}
    if len(ptm_required & canonical_headers) >= 4:
        return "post-translational-modifications", ["字段结构符合PTM位点定量表"]
    if "intensity" in canonical_headers and ({"mz", "mass"} & canonical_headers):
        return "intact-mass", ["字段结构符合两列质谱数据；未发现更具体项目名称，暂归完整分子量"]
    return None, []


def _recognize_role(context: str) -> tuple[str | None, str | None]:
    normalized = _norm(context)
    hits = [(role, alias) for role, aliases in ROLE_ALIASES.items() for alias in aliases if _norm(alias) and _norm(alias) in normalized]
    roles = {role for role, _ in hits}
    if len(roles) == 1:
        role = next(iter(roles))
        return role, f"名称命中：{next(alias for hit_role, alias in hits if hit_role == role)}"
    return None, None


def _role_from_cell(value: Any) -> str | None:
    normalized = _norm(value)
    for role, aliases in ROLE_ALIASES.items():
        if any(_norm(alias) == normalized for alias in aliases):
            return role
    return None


def _csv_content(headers: list[str], rows: list[list[Any]]) -> str:
    buffer = io.StringIO(newline="")
    writer = csv.writer(buffer)
    writer.writerow(headers)
    writer.writerows(rows)
    return buffer.getvalue()


def _mass_content(headers: list[str], rows: list[list[Any]], canonical: dict[str, int]) -> str:
    x_index = canonical.get("mz", canonical.get("mass", 0))
    y_index = canonical.get("intensity", 1)
    lines = []
    for row in rows:
        if max(x_index, y_index) < len(row) and _is_number(row[x_index]) and _is_number(row[y_index]):
            lines.append(f"{str(row[x_index]).replace(',', '').strip()}\t{str(row[y_index]).replace(',', '').strip()}")
    return "\n".join(lines) + ("\n" if lines else "")


def parse_submission_files(files: list[tuple[Path, str]]) -> dict[str, Any]:
    datasets: list[dict[str, Any]] = []
    warnings: list[str] = []
    file_summaries = []
    document_extractions: list[dict[str, Any]] = []
    raw_reference: list[str] = []
    raw_candidate: list[str] = []
    raw_unresolved: list[str] = []
    fasta_names: list[str] = []
    raw_dataset_files: dict[tuple[str, str | None], list[str]] = defaultdict(list)
    for path, original_name in files:
        suffix = path.suffix.lower()
        if suffix in {".mzml", ".fasta", ".fa"}:
            file_summaries.append({"name": original_name, "tableCount": 0, "format": suffix.lstrip(".") or "unknown"})
            if suffix in {".fasta", ".fa"}:
                fasta_names.append(original_name)
            else:
                role, _ = _recognize_role(original_name)
                normalized = _norm(original_name)
                if role == "reference" or re.search(r"(?:^|[^a-z])r(?:ef)?\d+", original_name.lower()):
                    raw_reference.append(original_name)
                elif role == "candidate" or re.search(r"(?:^|[^a-z])c(?:and)?\d+", original_name.lower()):
                    raw_candidate.append(original_name)
                else:
                    raw_unresolved.append(original_name)
            continue
        if suffix not in {".csv", ".tsv", ".xlsx", ".pdf", ".docx"}:
            file_summaries.append({"name": original_name, "tableCount": 0, "format": suffix.lstrip(".") or "unknown"})
            warnings.append(f"{original_name}：文件已留存，但当前版本不能从该格式提取比对数据")
            continue
        try:
            document_info = None
            if suffix == ".xlsx":
                tables = _read_xlsx(path)
            elif suffix == ".docx":
                tables, document_info = _read_docx(path)
            elif suffix == ".pdf":
                tables, document_info = _read_pdf(path)
            else:
                tables = _read_delimited(path)
        except Exception as error:
            warnings.append(f"{original_name}：解析失败（{str(error)[:160]}）")
            if suffix in {".pdf", ".docx"}:
                document_extractions.append({"sourceFile": original_name, "format": suffix.lstrip("."), "status": "failed", "tableCount": 0, "extractedCharacters": 0, "warnings": [str(error)[:240]], "preview": ""})
            continue
        file_summaries.append({"name": original_name, "tableCount": len(tables), "format": suffix.lstrip(".")})
        if document_info is not None:
            document_info.update({"sourceFile": original_name, "format": suffix.lstrip(".")})
            document_extractions.append(document_info)
            warnings.extend(f"{original_name}：{item}" for item in document_info["warnings"])
        raw_kinds = [_raw_dataset_kind(_table_parts(raw_rows)[0]) for _, raw_rows in tables]
        raw_kind = next((kind for kind in ("free-thiol", "glycan", "chromatography") if kind in raw_kinds), None)
        if raw_kind:
            raw_role, _ = _file_role(original_name)
            raw_dataset_files[(raw_kind, raw_role)].append(original_name)
            if not raw_role:
                warnings.append(f"{original_name}：已识别为{raw_kind}数据，但无法判断候选药或参照药角色；请在专项页手动分配")
            continue
        for sheet_name, raw_rows in tables:
            headers, rows = _table_parts(raw_rows)
            canonical = {key: index for index, header in enumerate(headers) if (key := _header_key(header))}
            context = f"{original_name} {sheet_name} {' '.join(headers)}"
            module_id, module_reasons = _recognize_module(context, set(canonical))
            if not module_id:
                warnings.append(f"{original_name} / {sheet_name}：该文件未能自动识别，请在专项页手动分配")
                continue
            role, role_reason = _recognize_role(context)
            partitions: dict[str | None, list[list[Any]]] = defaultdict(list)
            role_index = canonical.get("sample_role")
            if role_index is not None:
                for row in rows:
                    detected = _role_from_cell(row[role_index] if role_index < len(row) else "")
                    partitions[detected or role].append(row)
            else:
                partitions[role] = rows
            for detected_role, partition_rows in partitions.items():
                reasons = module_reasons + ([role_reason] if role_reason else [])
                if role_index is not None and detected_role:
                    reasons.append("依据样品角色字段拆分")
                if not detected_role:
                    warnings.append(f"{original_name} / {sheet_name}：已识别{MODULES[module_id][0]}，但无法确定候选药或参照药角色")
                if module_id == "post-translational-modifications":
                    content = _csv_content(headers, partition_rows)
                    extension = ".csv"
                else:
                    content = _mass_content(headers, partition_rows, canonical)
                    extension = ".txt"
                    if not content.strip():
                        warnings.append(f"{original_name} / {sheet_name}：未提取到有效的质量/质荷比与强度数值")
                datasets.append({
                    "moduleId": module_id, "moduleName": MODULES[module_id][0], "role": detected_role,
                    "sourceFile": original_name, "sheetName": sheet_name, "rowCount": len(partition_rows),
                    "columns": headers, "normalizedContent": content, "extension": extension,
                    "confidence": "high" if detected_role and reasons else "medium", "reasons": [item for item in reasons if item],
                })

    grouped: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    for dataset in datasets:
        if dataset["role"] in {"candidate", "reference"} and dataset["normalizedContent"].strip():
            grouped[(dataset["moduleId"], dataset["role"])].append(dataset)
    routes = []
    for module_id, (module_name, _) in MODULES.items():
        candidate_items = grouped.get((module_id, "candidate"), [])
        reference_items = grouped.get((module_id, "reference"), [])
        conflict = module_id != "post-translational-modifications" and (len(candidate_items) > 1 or len(reference_items) > 1)
        status = "conflict" if conflict else "ready" if candidate_items and reference_items else "partial" if candidate_items or reference_items else "not-found"
        def combined(items: list[dict[str, Any]], role: str) -> dict[str, Any] | None:
            if not items or conflict:
                return None
            if module_id == "post-translational-modifications" and len(items) > 1:
                first_lines = items[0]["normalizedContent"].splitlines()
                lines = first_lines[:1]
                for item in items:
                    item_lines = item["normalizedContent"].splitlines()
                    lines.extend(item_lines[1:])
                content = "\n".join(lines) + "\n"
            else:
                content = items[0]["normalizedContent"]
            return {"name": f"{module_id}-{role}{items[0]['extension']}", "content": content, "sources": [f"{item['sourceFile']} / {item['sheetName']}" for item in items], "rowCount": sum(item["rowCount"] for item in items)}
        routes.append({"moduleId": module_id, "moduleName": module_name, "status": status, "candidate": combined(candidate_items, "candidate"), "reference": combined(reference_items, "reference"), "message": "同一质量项目识别到多个同角色数据表，请人工确认" if conflict else "候选药和参照药数据已自动对齐" if status == "ready" else "仅识别到一侧数据" if status == "partial" else "未从本批材料中识别"})
    raw_status = "ready" if len(raw_reference) >= 3 and raw_candidate and len(fasta_names) == 1 else "partial" if raw_reference or raw_candidate or fasta_names else "not-found"
    if raw_unresolved:
        warnings.append(f"{len(raw_unresolved)}个mzML无法从文件名判断候选药/参照药角色，请在PTM专项人工分配")
    if len(fasta_names) > 1:
        warnings.append("识别到多个FASTA，自动调度前需人工选择一个序列数据库")
        raw_status = "partial"
    raw_bundle = {
        "status": raw_status, "referenceMzmlNames": raw_reference, "candidateMzmlNames": raw_candidate,
        "unresolvedMzmlNames": raw_unresolved, "fastaName": fasta_names[0] if len(fasta_names) == 1 else None,
        "message": "原始PTM文件束已就绪，可调用OpenMS/Sage" if raw_status == "ready" else "已发现部分原始PTM文件，需补齐或确认角色" if raw_status == "partial" else "未发现mzML＋FASTA原始文件束",
    }
    raw_datasets = []
    for (kind, role), names in raw_dataset_files.items():
        unique_names = list(dict.fromkeys(names))
        raw_datasets.append({"kind": kind, "role": role, "fileNames": unique_names})
        if role and len(unique_names) > 1:
            warnings.append(f"{kind}识别到{len(unique_names)}个{role}文件，自动分配仅使用第一个，其余文件请在专项页确认")
    return {
        "files": file_summaries, "datasets": datasets, "routes": routes, "warnings": warnings,
        "documentExtractions": document_extractions, "rawPtmBundle": raw_bundle, "rawDatasets": raw_datasets, "ocrReserved": True,
        "parser": {"name": "BioCompare Auditable Submission Router", "version": "0.2.0", "supportedFormats": ["csv", "tsv", "xlsx", "pdf-text", "docx", "mzml", "fasta"]},
    }
