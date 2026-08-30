# BioCompare 文档上传、自动解析、结果输出与 UI 迭代交付

## 1. 已完成范围

- 顶层统一入口支持 CSV、TSV、XLSX、带文本层 PDF、DOCX、图片留存，以及 mzML、FASTA/FA 原始 PTM 文件束。
- CSV/TSV/XLSX 继续按文件名、工作表名和字段名进行确定性项目识别、候选药/参照药拆分与字段对齐。
- DOCX 可提取 Word 表格；若无原生表格，则保守识别文本中的表格块。
- PDF 使用本地 `pypdf` 读取文本层并保守识别表格块；扫描件、空文本页和无法识别表格均返回明确提示。
- mzML/FASTA 根据文件名识别候选药和参照药角色；满足多批参照药、候选药和单一 FASTA 时，前端自动切换至现有 OpenMS/Sage 原始数据模式。
- 结果页同时展示完整结果表/机器可读 JSON 与不超过数句的规则化简要解释。
- Word 汇总报告新增“结果简要解释”章节。
- 顶层上传区、文档审计状态、原始 PTM 文件束状态和结果区完成专业化视觉优化。

## 2. 业务数据流

`顶层多文件上传 → 文件落盘与哈希 → 格式分类 → 文档/表格/原始谱图解析 → 项目与样品角色路由 → 专项任务调度 → 外部专业引擎 → BioCompare业务标记 → 完整结果＋简短解释 → 页面/Word输出`

三条输入路径相互隔离：

1. 结构化结果表：进入现有分子量或 PTM 业务适配器。
2. PDF/DOCX：只提取文档中真实存在的结构化字段，不猜测缺失值；提取后的表格按结构化结果表处理。
3. mzML＋FASTA：直接复用已集成的 OpenMS/Sage CLI 工作流，再进入 PTM 多批参照区间引擎。

PDF/DOCX 不能替代原始 mzML。文档中即使提到谱图文件名，也不会将文字伪装成原始质谱数据调用 OpenMS/Sage。

## 3. 文档解析与容错

- 单文件大小上限沿用 250 MB；单次最多 100 个文件。
- XLSX/DOCX 解压后内容上限 100 MB，降低压缩炸弹风险。
- PDF 逐页提取文本，记录页数、空文本页、字符数、表格数和预览。
- 无文本层 PDF 标记为“未识别”，提示提供可检索 PDF、CSV/XLSX，或待后续 OCR 能力启用。
- DOCX 损坏、缺少 `word/document.xml`、PDF 读取异常会形成单文件失败记录，不影响同批其他可解析文件。
- 无法判断候选药/参照药角色的数据不会自动投入计算，返回人工确认提示。
- 多个 FASTA、无法识别角色的 mzML、参照药批次不足均保持“部分就绪”，不自动发起任务。

## 4. 结果输出逻辑

简要解释由 `backend/result_summary.py` 的确定性规则生成，不依赖大语言模型。它只复述匹配峰、区间外结果、新型修饰和完整性提示，不补造实验条件，也不输出相似/不相似结论。大语言模型仍可作为后续报告草拟增强，但不是当前结果输出的必要依赖。

## 5. 关键代码位置

- `backend/submission_parser.py`：PDF/DOCX/表格解析、原始 PTM 文件束识别、路由和容错。
- `backend/result_summary.py`：分子量与 PTM 简短解释。
- `backend/service.py`：统一上传格式白名单、解析接口、结果字段组装；继续复用现有 OpenMS/Sage 队列、超时与失败处理。
- `app/project-provider.tsx`：把解析结果转换为专项 File 输入；原始文件束就绪时自动切换 OpenMS/Sage 模式。
- `app/project/page.tsx`：顶层上传、自动解析审计、任务状态和批量执行入口。
- `app/result-views.tsx`：完整结果、简短解释和 JSON 原始结果。
- `backend/docx_report.py`：Word 汇总报告的简要解释章节。
- `app/globals.css`：专业工作台样式与响应式布局。
- `scripts/setup-local.ps1`：固定 `pypdf==6.1.1` 依赖。

## 6. 验证结果

- Python 单元/集成测试：12/12 通过。
- TypeScript：`tsc --noEmit` 通过。
- Next.js 16.3.0 生产构建：通过，7 个页面成功生成。
- 在线 `POST /project-materials/inspect`：确认接受 CSV、FASTA，返回解析器 0.2.0、`documentExtractions` 和 `rawPtmBundle`。
- 在线 `POST /ptm/analyze`：确认返回完整区间结果和 `briefExplanation`。
- 在线 OpenMS/Sage：技术连通已验证；监管工作流验证与生产可用仍为 false，未被 UI 或接口误标为正式可用。

## 7. 后续迭代边界

- 扫描 PDF 和图片的 OCR 尚未实现；当前会清晰提示而非静默失败。
- 复杂 PDF（跨页表格、合并单元格、图中表格）建议下一期增加版面分析、OCR、人机校对和字段置信度。
- 正式监管用途仍需冻结版本、参数模板、字段映射和代表性数据集，完成审计追踪与回归验证。
