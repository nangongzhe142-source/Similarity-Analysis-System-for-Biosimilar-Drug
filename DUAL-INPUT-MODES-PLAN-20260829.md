# 专项双通道输入（谱图原始数据 ⇄ 结果表）· 实施指令（20260829）

> 本文档是给实施 AI 的完整执行说明书。请严格按照本文档执行，按 A→D 顺序实施，每组完成后先自测再进入下一组。
> 总原则：**不新增任何依赖**；不改引擎调用层；结果表通道必须标注"外部专业结果"证据边界；所有改动兼容深色主题；`pnpm typecheck` 通过。
> 参考样板：PTM-06 已是双通道（`ptmInputMode: "structured" | "openms-sage"`，见 `app/modules/[moduleId]/module-workspace.tsx` 与 `app/project-provider.tsx` 的 `runPtm`）——本次就是把这个模式推广到其他专项。

---

## 现状关键事实（已核实，实施前不要重复探索）

- 双通道样板：PTM-06 表格模式走 `POST ${backendUrl}/ptm/analyze`（`worker/ptm_interval.py` 的 `analyze_ptm_files`，输入为位点定量 CSV）；原始模式走 `/ptm/openms-sage/jobs`。前端在专项页有模式切换（module-workspace.tsx 中 `ptmInputMode` 相关 UI）。
- 分子量引擎按后缀自动路由：`backend/service.py:51` `MASS_ENGINE_SUFFIXES = {"unidec": {".txt",".dat"}, "flashdeconv": {".mzml"}}`——**mzML 走 FlashDeconv 的链路后端已存在**（`worker/flashdeconv_cli.py`），分子量专项页的文件选择框 accept 也已含 `.mzml`。
- PTM 区间引擎（表格）可复用：`/ptm/analyze` 返回的 `analytes/summary` 结构与 PTM-01~04 结果视图消费的 `siteRows` 不同，需要一层字段适配（见 B）。
- 色谱链：`runChromatography`（provider 223-248 行）→ `/api/jobs` → 色谱曲线解析/峰拟合 → `peakRows/comparisonTable` 等结构（`app/result-views.tsx` purity 视图消费）。
- 序列覆盖引擎可复用：`worker/sequence_evidence.py` 的 `build_sequence_coverage(sequences, evidence)`——evidence 为肽段列表即可算覆盖率，不需要 mzML。
- 糖型（GLY）与 PTM-06 **已经是双通道**，本次不动，只在交付说明中写明。
- 明确不做：SEQ-03/04、COV-01/02 的表格通道（CDR 证据/末端加工/二硫键连接/巯基定量依赖谱图或生化实验原始结果，表格化无增益）。

## A. 分子量五项：统一入口支持 mzML 原始数据（工作量最小，先做）

**目标**：用户在专项页或「统一输入」页给 IM-01~DHC-05 传 mzML 时，走 FlashDeconv 链完成比对；传 .txt/.dat 峰表时维持 UniDec 链不变。

**改动**：

1. 验证现有链路：手动向 `/jobs` 提交一份 mzML 的 intact-mass 任务（Form 字段与 `runMass` 一致，`engineKey=auto`），确认 FlashDeconv 被选中且产出结果。FlashDeconv 可执行文件在 `.env.local` 的 `FLASHDECONV_BIN`。
2. `app/project/page.tsx` 统一入口：解析结果中，当出现**无 FASTA 配对的 mzML 文件**（R\d+/C\d+ 命名）时，在 route preview 或解析预警区给出提示行："检测到未配对 FASTA 的 mzML——若为完整蛋白/亚基质谱，可在「统一输入」或各分子量专项页直接指定给分子量专项（FlashDeconv 链）"。**不要自动调度**（避免与肽图束语义冲突），只提示 + 在「统一输入」页把这类文件列为分子量专项的可选快捷分配。
3. 专项页文案：分子量类专项的输入卡说明改为"支持 UniDec 峰表（.txt/.dat/.csv）或质谱原始文件（.mzML，走 FlashDeconv）"。

**验收**：`/jobs` 用 mzML 跑通 intact-mass 并返回结果（curl 记录）；峰表路径回归不变；统一入口提示文案出现/不出现的两种场景各截一张图。

## B. PTM-01~04：新增"位点定量表"输入模式（复用 PTM-06 表格链）

**目标**：四个修饰专项除 mzML+FASTA 外，也能直接吃**外部专业引擎导出的位点定量表**（与 PTM-06 表格同格式：`lot_id, protein_chain, residue, position, modification, value_percent, replicate_id, risk_level`）。

**改动**：

1. `app/project-provider.tsx`：
   - 为 ptm-map 类模块新增每模块独立的输入模式状态（建议 `ptmMapInputMode: Record<moduleId, "raw" | "structured">`，默认 `"raw"`，避免沿用 PTM-06 的全局状态）；
   - 新增 `runPtmMapStructured(module, source)`：把 `files[module.id]` 的 candidate/reference 表 POST 到 `/ptm/analyze`（与 `runPtm` 表格分支相同的调用），拿到 `analytes` 后做**按修饰类型过滤 + 字段适配**：
     - PTM-01 只保留 `modification` 含 "Oxidation" 的 analyte；PTM-02 "Deamidation"；PTM-03 "pyroGlu"（或 N端 pGlu）；PTM-04 保留特征名含 "C-terminal-Lys" 或按 `residue=="K" 且位于末端` 的行（以 analyte 现有字段可判定为准，判定不了的整组保留并在 warnings 里注明人工确认）；
     - 映射为结果视图消费的 `siteRows`（`cohort/lotId/accession(=proteinChain)/residue/position/modification/relativeAbundancePercent(=valuePercent)/massShiftDa(按修饰类型常量)`）；
     - 组装 `PTMMapCalculationResult`：`status="completed"`、`professionalEngine="外部专业结果表格通道（未经本平台谱图重算）"`、`qualityGate={passed:true, acceptedPsmCount:null→显示"—", quantifiedPeptideCount:行数, message:"外部结果表通道"}`、`warnings` 首条固定加 `{code:"EXTERNAL_TABLE_INPUT", severity:"medium", message:"本结果来自外部导出的定量表，未经本平台谱图级FDR重算；请确认来源与质控。"}`
   - `runModule` 的 ptm-map 分支按该模块的模式选择 raw/structured 路径。
2. `app/modules/[moduleId]/module-workspace.tsx`：ptm-map 类专项加模式切换（复用 PTM-06 切换 UI 的结构与样式），structured 模式下显示两个文件槽（候选表/参照表，accept `.csv,.tsv`）并链接下载 `/templates/ptm-candidate-example.csv`、`/templates/ptm-reference-example.csv` 模板；raw 模式维持现状（mzML+FASTA）。
3. 「统一输入」页：ptm-map 专项的 accept 扩为 `.csv,.tsv,.mzml`，按所选文件后缀自动落到对应模式。

**验收**：用桌面 Excel 中 PTM 位点定量表拆出的两张 CSV（或直接上传含 PTM sheet 的 Excel 导出 CSV）在 PTM-01 structured 模式跑通：siteRows 只含 Oxidation 行、数值与表格一致、区间标记正确；raw 模式回归（mzML 束照跑）；PTM-02~04 各跑一次 structured 并记录行数。

## C. PUR-01~07：新增"峰面积表"输入模式

**目标**：七个色谱/电泳专项除色谱曲线外，也能吃**预积分的峰面积表**（厂商报告导出：`peak_id/峰名, retention_time/保留时间或迁移时间, area_percent/峰面积百分比, cohort 或分文件`）。

**改动**：

1. 后端 `backend/calculation_units.py`（或色谱任务实际所在模块）新增表格入口函数 `ingest_peak_area_table(reference_csv, candidate_csv, module_code, parameters)`：
   - 表头别名（复用现有 HEADER_ALIASES 风格）：峰标识/峰名、保留时间/迁移时间、峰面积%/area_percent、(可选)峰分组 group；
   - 产出与曲线链**同构**的 `peakRows`（`cohort/lotId/migrationTime/peakGroup/areaPercent/peakId`），未提供分组的按模块默认窗口配置（复用 `purityPeakWindowsJson` 的窗口）推断峰分组；
   - `comparisonTable`/区间标记沿用现有函数，`professionalEngine="外部峰面积表通道"`，warnings 加外部输入声明（同 B 的模式）。
   - 挂到 calculation_router 的任务分发：PUR 任务收到 `.csv` 且表头匹配"峰面积"签名时走表格入口，收到曲线数据（time+signal）时走原曲线链——判定规则写清楚并加防御（不匹配则报错让用户确认）。
2. 前端：PUR 专项页 accept 已含 `.csv`，无需大改；补充说明文案"支持色谱曲线导出或厂商峰面积报告表"。

**验收**：构造两张最小峰面积表 CSV（HMW/MAIN/LMW 三峰，候选 HMW 略高）在 PUR-01 跑通：peakRows/区间标记与表格一致；曲线路径回归不变；表头不匹配时给出明确错误提示。

## D. SEQ-01/02：新增"肽段鉴定表"输入模式（复用序列覆盖引擎）

**目标**：两个覆盖率专项除 mzML+FASTA 外，也能吃**肽段鉴定结果表**（Sage/MetaMorpheus 导出或人工整理：`accession, peptide_sequence, q_value(可选), source_file(可选)`）。

**改动**：

1. 后端：新增表格入口（位置随序列任务实现，建议 `worker/sequence_evidence.py` 旁）：读 CSV + FASTA（此通道仍需 FASTA，用于映射与覆盖率分母），过滤 `q_value≤0.01`（缺省全收并 warning），组装 `evidence` 后调用现有 `build_sequence_coverage(sequences, evidence)`；产出与 mzML 链同构的 `sequenceResult`（`professionalEngine="外部肽段鉴定表通道"` + 外部输入 warning）。
2. 前端：SEQ-01/02 专项页加模式切换（raw=mzML，structured=鉴定表+FASTA）；SEQ-03/04 不加。
3. 任务分发按所选文件形态路由（`.csv` 且表头含 peptide → 表格通道）。

**验收**：用一份含 HC/LC 各 5~8 条肽段的鉴定表 + antibody.fasta 在 SEQ-01 structured 跑通：覆盖率数值正确（手算对照）、结果视图正常渲染；mzML 路径回归不变。

## 交付要求

1. 每组按验收标准自测并记录（curl 输出、截图、行数）。
2. 端到端演示：同一批专项各演示一次"谱图通道"与"表格通道"的运行结果对比（可各取一个专项）。
3. 所有表格通道的结果页必须能看到"外部专业结果通道"的声明（warnings 或结果头部标签）。
4. `pnpm typecheck` 通过；后端改动后按老规矩重启（结束 uvicorn 进程 → `Start-BioCompare.cmd`）。
5. 引擎真实失败如实上报原文，禁止调参硬凑。
