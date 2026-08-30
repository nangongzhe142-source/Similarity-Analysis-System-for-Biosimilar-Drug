# BioCompare 序列确认引擎接入交付记录

日期：2026-08-25

## 1. 技术栈与复用边界

- 前端：Next.js 16.3、React 19、TypeScript。
- 后端：Python FastAPI，默认监听 `127.0.0.1:8000`。
- 异步框架：复用现有持久化任务队列、独立项目/模块/任务目录、子进程超时、日志捕获和产物哈希白名单。
- 浏览器只负责上传、查询进度和显示结果；OpenMS、Sage、Pyteomics 仅在 FastAPI/Worker 服务端执行。
- OpenMS/Sage 负责原生数据库检索和 FDR；Pyteomics 负责 FASTA 消化、理论质量、MS1 XIC 和序列坐标映射；BioCompare 只负责候选药/参照药对照与客观标记。

## 2. 统一 API

现有 `/calculation-jobs` 契约保留，同时增加简洁兼容入口：

- `POST /api/jobs`：multipart 上传，返回任务 ID。
- `GET /api/jobs?projectId=biocompare&moduleCode=SEQ-02`：任务历史。
- `GET /api/jobs/{id}`：任务状态和进度。
- `GET /api/jobs/{id}/result`：结构化结果。

上传字段：

- `projectId`：默认 `biocompare`。
- `moduleCode`：`SEQ-01`、`SEQ-02`、`SEQ-03` 或 `SEQ-04`。
- `files`：参照药 mzML、候选药 mzML、FASTA，可多文件。
- `inputManifestJson`：与 files 一一对应，角色为 `reference`、`candidate`、`fasta`。
- `parametersJson`：q 值、线程数、MS1 ppm、CDR 坐标等模块参数。

## 3. 已接入的序列模块

| 模块 | 服务端引擎链 | 结果字段 | 当前状态 |
|---|---|---|---|
| SEQ-01 MS1肽质量覆盖率 | OpenMS 输入/检索链 + Pyteomics 理论酶切、质量与 XIC | 覆盖率、XIC 证据、序列高亮、组间表 | 已实现并可调用 |
| SEQ-02 MS/MS序列确认覆盖率 | OpenMS SageAdapter + Sage + Pyteomics | 1% FDR PSM、覆盖率、序列高亮、组间表 | 已实机验证 |
| SEQ-03 CDR区特征肽确认 | Sage + Pyteomics + 用户提供的 1-based CDR 区间 | 区间数、跨区合格肽、证据表 | 已实机冒烟 |
| SEQ-04 N/C端及末端异质性 | Sage + Pyteomics 末端肽证据 | N/C端证据数和明细 | 已实机冒烟；TopPIC/UniDec为有Top-down输入时的正交扩展位 |

所有模块均返回 `decision: null`；平台不自动生成“相似/不相似”最终结论。

## 4. SEQ-02 真实数据验收

输入：项目内真实 `BSA1.mzML`（参照）、`BSA2.mzML`（候选）以及目标 BSA FASTA。

- 任务 ID：`8b64394f594242dbb1d9261cc3935b5d`
- OpenMS：3.5.0
- Sage：0.14.6
- Pyteomics：5.0.1
- 1% FDR 合格并映射的证据：151
- 参照药覆盖率：40.691928%
- 候选药覆盖率：42.174629%
- 辅助差值：1.482701 个百分点
- 任务状态：`completed`

另用大型 18-protein 搜索库进行负向质量门验证，任务
`b07d0ad48647495c9a9be8c241871010` 在最低谱图 q 值 0.03508772 时正确返回
`quality-blocked`，没有把“外部程序返回 0”误报为序列确认完成。

## 5. 页面交付

其余序列模块实机冒烟：

- SEQ-01：任务 `b15695a8bdfe464eaf1b1ea283bf4a05`，121 个理论肽，142 条 XIC 证据；参照/候选覆盖率 91.268534% / 79.571664%，完成。
- SEQ-03：任务 `2af901ce03e84e5f89b6a5b4dd222b7b`，配置 1 个区间，获得 19 条跨区合格肽，完成。
- SEQ-04：任务 `4a7578eed6364941a1d0d26224cf8dcc`，获得 3 条末端肽证据，完成。

- `/modules/ms1-peptide-mass-coverage`
- `/modules/msms-sequence-coverage`
- `/modules/cdr-signature-peptides`
- `/modules/terminal-sequence-heterogeneity`
- 每个模块支持参照 mzML、候选 mzML、FASTA 上传和进度展示。
- SEQ-03 增加 CDR JSON 坐标输入。
- 结果页显示覆盖率数字、逐残基高亮、候选/参照表、引擎处理边界和完整 JSON。
- 结果页可读取服务器最近一次终态任务，刷新页面后结果不会只存在于浏览器内存。
- 综合看板增加最近任务历史、状态、进度和更新时间。

## 6. 依赖与配置

Python 计算环境新增：

- `pyteomics==5.0.1`
- `psims>=1.3,<2`（Pyteomics 5 解析 PSI mzML 所需）
- `numpy>=1.26,<3`

沿用 `.env.local` 中的：

- `OPENMS_BIN_DIR=C:\Users\MI\OpenMS-3.5.0\bin`
- `SAGE_BIN=D:\BioCompareEngines\Sage-0.14.6\sage-v0.14.6-x86_64-pc-windows-msvc\sage.exe`
- `CALCULATION_TASK_ROOT=D:\BioCompareEngineJobs\calculation-jobs`

## 7. 后续适配器注册位

`backend/engine_adapter_registry.py` 已登记糖基化、数值色谱、理化属性、结合动力学、
效价、ELISA/qPCR、CD/光谱、HDX-MS 和 NMR 的服务端适配器位置。登记不等于完成
专业方法学验证；只有 `status=implemented` 的条目才能作为当前可运行实现。

GPL/R 工具统一登记为独立 CLI/Rscript 子进程，不将其源代码内联或链接进 Web 服务。
pGlyco3、ChiraKit、MoltenProt 明确列入排除清单。

## 8. 验收截图

- `validation/screenshots/seq-02-engine-workspace.png`
- `validation/screenshots/seq-02-real-result.png`
- `validation/screenshots/dashboard-calculation-history.png`
