# 专项双通道输入交付记录（2026-08-29）

实施依据：`DUAL-INPUT-MODES-PLAN-20260829.md`。按 A → B → C → D 顺序开发，并在每组自测通过后进入下一组。未新增 npm、pip 或其他依赖，未改变专业引擎的算法参数或 CLI 参数。

## A. 分子量五项

- IM-01、DM-02、LC-03、HC-04、DHC-05 保留 UniDec 峰表输入，并支持 `.mzML` 自动选择 FlashDeconv。
- 一级材料页仅提示无 FASTA 的 R/C mzML 可快捷分配给分子量专项，不自动调度，避免将肽图文件误判为完整质量谱。
- 专项页明确展示两种输入及处理边界。
- FlashDeconv mzML 实机任务：`4b8db1d5ed57496da3bb1a3d1b26d7f4`，`completed`。
- UniDec 峰表回归任务：`71db9aedd26c4c0b975e7acbb777b0ea`，`completed`。
- 截图：`validation/dual-input-modes/screenshots/mass-mzml-without-fasta.png`、`mass-mzml-with-fasta.png`。

## B. PTM-01～04

- 每个 PTM-map 专项拥有独立 `raw | structured` 状态；原始模式仍走原有 MetaMorpheus/FlashLFQ 路径。
- structured 模式复用 `/ptm/analyze`，然后按专项筛选 Oxidation、Deamidation、pyroGlu、C-terminal-Lys 并适配既有结果对象。
- 外部表格通道固定显示证据边界，PSM 数显示 `—`，不假装平台执行过谱图搜索或 FDR 重算。
- PTM-01～04 structured 各得到 4 行符合专项过滤规则的数据；PTM-01 原始 mzML+FASTA 回归终态为“已完成”。
- 截图：`PTM-01-structured.png`～`PTM-04-structured.png`、`PTM-01-raw-regression.png`。

## C. PUR-01～07

- CSV 先按表头签名识别为时间-信号曲线或峰面积表；候选药与参照药输入形态不一致时拒绝运行。
- 峰面积表映射为与曲线链相同的 `peakRows/comparisonTable/summaryRows`，保留外部预积分声明。
- PUR-01 表格实机任务 `daf82688581845c9a34c1ad17a881776` 完成：参照 HMW 2.00%，候选 HMW 3.50%，共 6 行峰结果。
- PUR-01 曲线实机任务 `a7c11ae381444824bf435defccbb4b55` 完成，原 chromConverter → HappyTools → hplc-py 链路不变。
- 错误表头负向用例明确失败并显示：`输入表头无法识别；请提供时间-信号曲线，或包含峰名、保留/迁移时间和峰面积百分比的峰面积表`。
- Windows 任务包装器强制 UTF-8 标准输出/错误输出，仅用于保真传递校验错误；未修改引擎调用参数。
- 截图：`PUR-01-peak-table.png`、`PUR-01-bad-header.png`。

## D. SEQ-01/02

- 仅 SEQ-01、SEQ-02 新增 `raw | structured`；SEQ-03/04、COV-01/02 未增加表格通道。
- structured 模式读取 `accession, peptide_sequence, q_value, source_file` 与 FASTA，按 `q_value <= 0.01` 过滤并复用覆盖率计算。
- 结构化实测结果：HC 参照 37.50%、候选 66.67%；LC 两侧均 52.94%；接受并成功映射 5 条证据。SEQ-01 任务 `9f401c7fb3ba421b8b6d6699ed132ff5`、SEQ-02 任务 `947da4c03d134f40b6a39bb0b97e3e64` 均完成。
- SEQ-01 和 SEQ-02 的桌面真实 mzML+FASTA 原始模式回归均为“已完成”。
- 截图：`SEQ-01-peptide-table.png`、`SEQ-02-peptide-table.png`、`SEQ-01-raw-regression.png`、`SEQ-02-raw-regression.png`。

## 总体验收

- 每一类均至少完成一次谱图/曲线通道与一次结果表通道运行。
- PTM、PUR、SEQ 的表格结果页均显示“外部专业结果通道”及未重算边界。
- `python -m unittest discover -s tests -p "test_*.py"`：44/44 通过。
- `pnpm typecheck`：通过。
- 受控停止监听 8000 的 BioCompare Python 后端后，已通过根目录 `Start-BioCompare.cmd` 重启。
- 在线检查：后端 `/health` 为 `online`；前端 `/project` 返回 HTTP 200。
- 运行地址：<http://localhost:3000/project>。

## 如实记录的失败/提示

- 初次用肽段级 BSA mzML 验证完整分子量时，FlashDeconv 未获得适用于完整蛋白质量窗口的结果；未修改引擎参数硬凑，随后改用具有约 80 kDa 电荷/同位素包络的完整质量验证数据，链路正常完成。
- PUR 不合法表头为预期负向测试，任务按设计失败并给出明确输入修正提示。
- 测试环境提示未安装 `hdf5plugin`，psims 使用较慢的 GZIP；不影响本次 44 项测试结果，且按“不新增依赖”原则未安装。

## 主要改动文件

- 后端/worker：`backend/service.py`、`backend/calculation_units.py`、`backend/calculation_tasks.py`、`worker/batch_pipeline_cli.py`、`worker/sequence_evidence.py`
- 前端/类型：`app/project-provider.tsx`、`app/project/page.tsx`、`app/project/data/page.tsx`、`app/modules/[moduleId]/module-workspace.tsx`、`app/result-views.tsx`、`app/globals.css`、`lib/project.ts`、`lib/types.ts`、`lib/ptm-map-structured.ts`
- 测试/验证：`tests/test_calculation_units.py`、`validation/dual-input-modes/`

