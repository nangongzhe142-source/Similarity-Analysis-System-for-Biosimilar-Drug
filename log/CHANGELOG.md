# 更新日志

> 倒序排列。详细文件见同目录下 `2026-08-14-s*.md`、`2026-08-20-p*.md`、`2026-08-21-p*.md`、`2026-08-22-p*.md`。

---

## 2026-08-22 — P24 两点校准 UI；保留 0.95 条带

**状态**：Done。详见 [`2026-08-22-p24-两点校准UI.md`](./2026-08-22-p24-两点校准UI.md)。

操作员确认保留图像层 0.95 CONSISTENT。上传区可点选两点并提交 `imageCalibration`；OCR 仍不得标可靠。实机发现预览裂图：严格模式回收 `blob:` 地址，已改为 data URL。

---

## 2026-08-22 — P22 前端双层结论展示

**状态**：Done。详见 [`2026-08-22-p22-双层结论展示.md`](./2026-08-22-p22-双层结论展示.md)。

法规判定与图像层观察分栏；质量门标明 `algorithmQualityGate`；V2 判定方法 / 数值边界 / 最终程序规则上屏。

---

## 2026-08-22 — P21 Next.js API 代理

**状态**：Done。详见 [`2026-08-22-p21-api代理.md`](./2026-08-22-p21-api代理.md)。

浏览器默认走 `/api/analysis`，不再直连 8765。

---

## 2026-08-22 — P19 OCR 轴猜测降级

**状态**：Done。详见 [`2026-08-22-p19-ocr轴猜测降级.md`](./2026-08-22-p19-ocr轴猜测降级.md)。

OCR 数字只作记录，不能把校准打成可靠；无操作员两点锚点时只做形状比对。

---

## 2026-08-22 — P17-2 图谱库映射与颜色角色

**状态**：Done。详见 [`2026-08-22-p17-2-图谱库映射.md`](./2026-08-22-p17-2-图谱库映射.md)。

六张库图按 SHA-256 落到 itemId/methodId；Fab/Fc 排除。中文文件名清洗后不能当查找键。

---

## 2026-08-21 — P20 防护性修复 F1–F5

**状态**：Done。详见 [`2026-08-21-p20-防护性修复.md`](./2026-08-21-p20-防护性修复.md)。

任意 FASTA 不再被切成 BSA；五个质量项目分剖面与动态 UniDec 窗；上传 RAW/WIFF 拒绝（adapter 未调 msconvert）；5 Da / 覆盖率百分点等标为 `algorithmQualityGate`，不能把 verdict 打成相似性 PASS。`pytest` 89 passed / 7 deselected；`npm run check` exit 0。

---

## 2026-08-21 — P18 双层结论契约

**状态**：Done。详见 [`2026-08-21-p18-双层结论契约.md`](./2026-08-21-p18-双层结论契约.md)。

图片路径增加 `extractedFeatures.imageComparison`。法规 `verdict` 仍为 REVIEW。驱动指标只有轮廓相关；SSIM/DTW 标为无判别力。

---

## 2026-08-21 — P17 图片降级纠错

**状态**：P17-1/2/3/4/5 Done。详见 [`2026-08-21-p17-图片降级纠错.md`](./2026-08-21-p17-图片降级纠错.md)、[`2026-08-22-p17-2-图谱库映射.md`](./2026-08-22-p17-2-图谱库映射.md)。

颜色中性标签、镜像/堆叠版式、双迹检峰与配对、基线校正；图像层只用轮廓相关（0.95 / 0.30），且只是算法质量门。

---

## 2026-08-21 — P16 README、日志和最终审计

**状态**：Done。详见 [`2026-08-21-p16-最终审计.md`](./2026-08-21-p16-最终审计.md)。审计正文 [`docs/primary-structure-analysis/16-final-audit.md`](../docs/primary-structure-analysis/16-final-audit.md)。

检查点 5：P13–P16 完成，计划停止。

---

## 2026-08-21 — P15 自动化测试

**状态**：Done。详见 [`2026-08-21-p15-自动化测试.md`](./2026-08-21-p15-自动化测试.md)。

新增 `npm run verify:primary-analysis`（默认 pytest + 分析面板结构检查）并接入 `npm run check`。中文文件名清洗测试。`pytest` 76 passed / 7 deselected；`npm run check` exit 0。

---

## 2026-08-21 — P14 二硫键 Blocked/L0

**状态**：Blocked/L0。详见 [`2026-08-21-p14-二硫键Blocked-L0.md`](./2026-08-21-p14-二硫键Blocked-L0.md)。

GitHub API 复核 pLink 2/3 无 SPDX 许可证；pLink 2.3.11 授权已于 2025-01-10 过期。未安装。D17 面板不跑分析。`npm run check` exit 0。

---

## 2026-08-21 — P13 游离巯基占位（D17）

**状态**：Done。详见 [`2026-08-21-p13-游离巯基占位.md`](./2026-08-21-p13-游离巯基占位.md)。

D17 取代 D3：不把 QR 接到分析服务。s09c golden 保留；面板明示 Sheet3 未定义规则。`pytest` 71 passed；`npm run check` exit 0。

---

## 2026-08-21 — P12 专业结果可视化

**状态**：Done。详见 [`2026-08-21-p12-专业结果可视化.md`](./2026-08-21-p12-专业结果可视化.md)。

交互 SVG（镜像谱、色谱叠加、覆盖图、碎片离子、峰表、V2 规则、溯源）+ matplotlib PNG 下载；peptide-map 合成 TIC fixture；产物 API。`pytest` 69 passed；`npm run check` exit 0。

---

## 2026-08-21 — P11 方法区域前端接口

**状态**：Done。详见 [`2026-08-21-p11-方法区域前端接口.md`](./2026-08-21-p11-方法区域前端接口.md)。

在现有 `MethodSelector` 四层堆叠中插入 `MethodAnalysisPanel`；连接 analysis-service（8765）；按 33 条方法配置显示可分析/规则未定义/仅展示；上传、任务进度、取消、结果摘要与 JSON 下载。`npm run check` exit 0。

---

## 2026-08-21 — P9 MS/MS 序列确认分析器

**状态**：Done。详见 [`2026-08-21-p9-MSMS分析器.md`](./2026-08-21-p9-MSMS分析器.md)。

Comet 2024.01 实机跑通（BSA MS2 → YICDNQDTISSK PSM）；`app/analysis/msms/` + `MsmsSequenceAdapter`。合成 golden 对齐 s09b（99.31% / 96.57% / 327 位替换）；DOCX #5 EEMTK/DELTK b/y 注释。前端 3 条 msms-sequence 方法解除 Comet 阻塞。`pytest` 67 passed。

---

## 2026-08-21 — P8 肽图与 MS1 覆盖分析器

**状态**：Done。详见 [`2026-08-21-p8-肽图与MS1覆盖分析器.md`](./2026-08-21-p8-肽图与MS1覆盖分析器.md)。

提取 s09b 为 `app/analysis/ms1_coverage/`；`Ms1CoverageAdapter` 接入 `ms1-coverage` profile。pyOpenMS 胰酶酶切 + MS1 ppm 匹配 + 覆盖率 + 未覆盖区段 + N/C 端提示 + Sheet3 row 7 规则。s09b golden：99.31% / 96.57% / 327 位替换检出。`pytest` 65 passed。

---

## 2026-08-20 — P6 补记：RAW→mzML 实机闭合

**状态**：Done。详见 [`2026-08-20-p6-安全文件摄取.md`](./2026-08-20-p6-安全文件摄取.md) §三。

pwiz 镜像（9.26 GB，digest `52d83017`）拉取完成，耗时 56 分钟。**但绝非「拉完即通」**，镜像到位后实机暴露并修掉 3 个缺陷：

1. `exec: "msconvert": executable file not found in $PATH`（exit 127）—— msconvert 是 Windows 可执行文件需经 Wine 启动，代码直接传 `msconvert` 覆盖了镜像 CMD。
2. `sudo: wine64: command not found`（exit 1）—— **镜像自带的 CMD `["wine64_anyuser","msconvert"]` 本身已失效**：该脚本调 `sudo wine64`，而本镜像的 Wine 10.6 已把 `wine64` 合并进 `wine`。改用镜像内 `mywine` 包装器。
3. 转换 exit 0 却「无 mzML 输出」—— `-e mzML` 被当**字面后缀**拼接，产出 `BSA-FT-HCDmzML`（无点）。删掉该参数，`--mzML` 已足够。

**4/4 Thermo RAW 全部转换并经 pyOpenMS 读出真实谱图**：BSA-FT-ETD（MS2，426 峰）、BSA-FT-HCD（MS2，1077 峰）、FT-HCD-MSX（MS2，1504 峰）、IT-HCD-SPS（**MS3**，3984 峰）。完整链路闭合：Thermo RAW → msconvert(Docker/Wine) → mzML → pyOpenMS。D12 达成，UI 可标 RAW 已支持。

**集成测试移出默认套件**：单次转换 57.8 s（每次都在 9.26 GB 镜像内重建 wineprefix），并入默认套件的一次运行远超预期时长后被中断（宿主同时跑 13 个 Dify 容器）。`pytest.ini` 加 `addopts = -m "not integration"`，默认 **62 passed / 6 deselected / 21 s**，集成用例用 `pytest -m integration` 显式运行。

---

## 2026-08-20 — P10 图片降级分析器

**状态**：Done。详见 [`2026-08-20-p10-图片降级分析器.md`](./2026-08-20-p10-图片降级分析器.md)。

### 做了什么

新建 `app/analysis/image_fallback/` 与 `ImageFallbackAdapter`；registry 改为**按输入格式分派**，全部上传均为图片时降级，因此图片路径对所有 profile 可达。

`生物类似药药学评价比较.docx` 的 6 张图全部跑通并产出契约结果：image1 镜像质量谱（两点校准后 147927–148202 Da）、image2 多子图拒绝出峰、image3 拒绝把噪声当第二条迹、image4 肽段表重建 18 行、image5 双迹谱 36 峰、image6 五种覆盖率口径全读出（control/combined 99.8，analyte/common **0.0**）。工具：OpenCV 5.0.0、scikit-image 0.25.2、Tesseract 5.5.0。

### 实机发现并修复的 4 个正确性缺陷

1. **OCR 把轴刻度当成峰标注**：读 image1 得 147605/147805/…，而真实峰标注为 148059/148221/…。自动校准不可用，手动两点校准确定为唯一可信通道。
2. **校验和自身可能被污染**：用同行印刷理论质量交叉校验的思路正确，但理论质量本身也会被读错（1544.7→15447），于是实测值被「修复」成同样错 10 倍的 15448 且校验通过。已加理论质量合理区间（150–10000 Da），理论值不可信时该行直接丢弃而非充当基准。
3. **保留时间无法校验**：`19.8→198`、`0.4→4.0` 在图上无任何可对照量，原理上不可检测。只做区间检查，`retention_times_validated` 永久为 False，明确写出「无法检出」，不假装能修。
4. **按彩色像素有无分类会凭噪声虚构第二个产品**：image3 的 137 个抗锯齿红像素曾使单迹图被判为双产品镜像图。改用 200 px 存在阈值 + 多子图长宽比识别。

顺带修掉 P7 潜伏 bug：两个 adapter 原用 `context.workspace / file_name` 拼上传路径，实际文件在 `workspace/uploads/`，此前因总落到合成演示分支而未暴露。

### 硬边界写进代码

校准不可靠时 `axis_value` 结构上无法赋值；`build_image_analysis_result` 硬编码 `REVIEW`，6 图逐张断言 verdict 不为 SUPPORTED/DIFFERENCE_DETECTED；`similarity.py` 不含任何返回判定的函数。image6 强制声明 analyte/common 为 0.0 意味着只有一侧有数据，不是头对头比较。

### 验收

`pytest` **63 passed**（P10 新增 14）。API 端到端实测：`dataSource=image-only`、`evidenceLevel=image-only-exploratory`、`verdict=REVIEW`、`calibrationReliable=false`。

**实机更正 D19**：6 张图文字全为英文，`chi_sim` 语言包不需要。

### 未实现

image2 逐子图校准、image5 碎片离子按颜色归属、自动坐标校准（实测不可靠，不提供）。这 6 张图是第三方文献插图，本身不能作为任何在研产品的相似性证据。

---

## 2026-08-20 — P7 完整/亚基质量分析器

**状态**：Done。详见 [`2026-08-20-p7-完整亚基质量分析器.md`](./2026-08-20-p7-完整亚基质量分析器.md)。

### 做了什么

提取 s09a 为 `app/analysis/intact_mass/` 共享模块；`IntactMassAdapter` 接入任务队列。pyOpenMS 理论质量 + UniDec 去卷积 + V2 Sheet3 五条质量规则 + matplotlib 镜像图。

### 用户质疑「是否真接了可用软件」后的核查与修复

确认内核为第三方编译软件：pyOpenMS **3.5.0**、UniDec **8.2.1**（`unidec.exe` 306,176 B，以子进程执行），仓库内无自写质量计算或去卷积算法。

核查暴露两个真实缺陷，均已修复：

1. **初版没有 mzML 读取路径**，只能读两列 txt——真实质谱文件根本进不来。新增 `mzml_reader.py`（`OnDiscMSExperiment` 流式），实测读通 **702 MB / 33,039 谱**的真实抗体 mzML。同时实测确认 pyOpenMS 对中文路径直接 `IO error`，故原生读取前强制 ASCII 暂存（D22），有专测锁定。
2. **拟合质量再差也照样输出实测质量**：真实肽图谱去卷积 R² = **−10.07** 时仍报「主峰 17021.0 Da」。新增 `MIN_DECONVOLUTION_R_SQUARED = 0.9` 门禁，低于下限强制 `REVIEW`，明确「不构成质量一致或不一致的证据」。对照：合成 BSA 包络 R² = 0.9998 通过。

### 验收

s09a golden 数值一致（66398.19 / 66398.0 / 66560.0 / +162 Da）；`pytest` **49 passed**。ΔDa/Δppm 明确标注为方法准确度指标，非相似性阈值。

### 未闭合缺口

工作区**无真实完整/亚基质量原始数据**（P1 三个数据集均为肽图/二硫键类型），故 148 kDa 级抗体去卷积的科学验证未完成；WIFF 未接；RAW 待 pwiz 镜像。

**检查点 3 进行中**（P8–P10 待开始）。

---

## 2026-08-20 — P6 安全文件摄取 + RAW 转换管线

**状态**：Done（RAW 集成测试待 pwiz 镜像首次 `docker pull` 完成后重跑）。详见 [`2026-08-20-p6-安全文件摄取.md`](./2026-08-20-p6-安全文件摄取.md)。

### 做了什么

| 类别 | 新建/修改 |
|---|---|
| 安全校验 | `app/security/limits.py`、`ingest.py`、`upload_io.py` |
| 上传接入 | `app/api/service.py`、`app/api/errors.py` |
| RAW 转换 | `app/conversion/raw_converter.py`、`scripts/fetch_pwiz_thermo_fixtures.py` |
| 测试 | `test_secure_ingest.py`、`test_official_mzml.py`、`test_raw_conversion.py`；`test_api.py` 增补上传用例 |
| 依赖 | `defusedxml`、`Pillow` |

扩展名/MIME/magic/大小/像素/CSV/FASTA/mzML（defusedxml 禁 XXE）；`indexedmzML` 根元素支持；>8 MB 谱图仅头部校验。

### 验收

`pytest` **42 passed**（不含 RAW 集成）；6/6 official mzML 可读；攻击输入全部拦截。Docker 服务镜像已重建。RAW→mzML 集成测试待 pwiz 镜像拉取。

**检查点 2（P5–P6）已完成**，等用户确认后进 P7。

---

## 2026-08-20 — P5 Python 服务与任务状态机

**状态**：Done。详见 [`2026-08-20-p5-服务与任务状态机.md`](./2026-08-20-p5-服务与任务状态机.md)。

### 做了什么

FastAPI 分析服务：`analysis-service/app/`（路由、JobStore、asyncio 队列、6 态状态机、路径脱敏、ASCII 工作区辅助）。端口 **8765**，Docker 项目名 **`bsim-analysis`**。任务状态磁盘持久化至 `workspaces/{jobId}/job.json`（D8）。

无真实 adapter 时返回 `ADAPTER_NOT_IMPLEMENTED`，不伪造分析结果；`ANALYSIS_ALLOW_STUB_ADAPTER` 仅测试启用。

### 验收

本地 uvicorn 与 `docker compose up` 均通过 `/health`；`pytest` 27 passed；`npm run check` exit 0。

---

## 2026-08-20 — P4 统一数据契约（TS + Pydantic + JSON Schema）

**状态**：Done。**检查点 1（P0–P4）已全部完成**，等用户确认后进 P5。详见 [`2026-08-20-p4-统一数据契约.md`](./2026-08-20-p4-统一数据契约.md)。

### 做了什么

| 类别 | 新建 | 修改 |
|---|---|---|
| 类型 | **`src/types/analysis-contract.ts`** | — |
| Python | **`analysis-service/app/models/analysis_contract.py`**、`scripts/export_contract_schema.py`、`scripts/validate_fixture.py`、`tests/test_analysis_contract.py`、`requirements.txt` | — |
| 契约产物 | **`analysis-service/contracts/`**（2 份 JSON Schema、`field-manifest.json`、minimal fixture） | — |
| 脚本 | **`scripts/verify_analysis_contract.mjs`** | `package.json`（`verify:analysis-contract` 接入 `check`） |
| 日志 | `log/2026-08-20-p4-统一数据契约.md` | `implementation-plan.md`、本文件 |

**18 个模型/枚举**三方对齐：`AnalysisResult` + 嵌套类型 + `AnalysisJobSnapshot`。版本常量 `schemaVersion=1.0.0`、`ruleSetVersion=v2-sheet3-8bd6b18f`。

**四处增补**（相对原九节 spec）：`provenance` 块；`inputEvidence.samplePairing`（D20）；`extractedFeatures.coverageDefinition`（DOCX 图 6）；`evidence.parameters.massConstantSource`（P1 pyOpenMS 常数差异 ~9 ppm）。

**staleness 门禁**：committed manifest/schema 与 Pydantic 实时导出 SHA 不一致则 `verify:analysis-contract` fail。

### 验收

`npm run check` exit 0；`pytest analysis-service/tests/test_analysis_contract.py` 4 passed；TS ↔ Pydantic 字段差异 **0**。

### 没做

未启动 FastAPI（P5）；未写 UI（P11）；fixture 数值为占位，真实 extractedFeatures 在 P7–P9。

---

## 2026-08-20 — P3 方法分析配置（33 条方法逐条定性）

**状态**：Done。检查点 1 只剩 P4。详见 [`2026-08-20-p3-方法分析配置.md`](./2026-08-20-p3-方法分析配置.md)。

### 做了什么

| 类别 | 新建 | 修改 |
|---|---|---|
| 数据 | **`src/data/method-analysis-config.ts`** | — |
| 类型 | — | `src/types/models.ts`（**仅追加** 7 个类型，未改既有类型） |
| 脚本 | **`scripts/verify_method_analysis_config.mjs`** | `package.json`（`verify:analysis-config` 接入 `check`） |
| 日志 | `log/2026-08-20-p3-方法分析配置.md` | `implementation-plan.md`、`docs/…/01-figure-matrix.md`、本文件 |

**D23 — 范围先问清再动手。** 用户原话「只尝试 V2 sheet3 中的 3 个项目」有两种读法，没有猜；提问时同时指出一个影响选择的事实：Sheet3 规则完整的 7 项只对应 **3 类工作流**（第 2–6 行五个质量项目共用同一套去卷积管线）。用户答复为**全部 7 项**、先跑通全链路。

**33 条方法全覆盖，状态分布**：可分析 17 / 被 Comet 阻塞 3 / 仅展示 4 / 规则未定义 9。profile 由 P1 的 6 个**收敛为 4 个**（`intact-mass` 10、`peptide-map` 5、`ms1-coverage` 2、`msms-sequence` 3），余 13 条无 profile。范围内 21 条方法这个数字，与 P2 的 `verify:schemes` 从另一条路径（Sheet3 规则完整性）独立算出的结果吻合。

**三处更正 P1 图谱矩阵**（已在矩阵文档内标注，不改写 P1 原记录）：`free-thiol` / `disulfide-map` 两个 profile 按 D17 取消——P1 原写这两条「获得了分析路径」，**该判断被 D17 推翻**；`ms1-sequence-coverage-orthogonal-2`（增加其他蛋白酶）由 `peptide-map` 改为 `ms1-coverage`，因为换酶后仍是 MS1 质量匹配而非色谱比对，P1 的归法与同性质的 MS/MS 侧「不同酶切策略」自相矛盾；`ms1-sequence-coverage-orthogonal-1`（LC-MS/MS）归 `msms-sequence` 并随之被 Comet 阻塞。

**校验器把两条约定变成机械约束**，因为靠人记住一定会忘：项目 `completeness ≠ complete` 时方法不得声明 `analyzable`（D17）；profile 的硬依赖工具 `verified: false` 时同样不得（Comet 未跑通不得声称能做序列确证）。`msconvert` 不作方法级门禁——它只在上传厂商格式时才需要，是按上传件而非按方法决定的。此外强制：`display-only` / `rule-not-defined` 不得带 profile 且 `allowsImageFallback` 必须为 false，否则会出现一个能从截图量出 ΔDa、却无规则可解释该数值的入口。

**类型层面刻意区分 `display-only` 与 `not-yet-supported`**：前者是能力性质（Edman 降解、CE-SDS 的产出永远不是质谱数据，写更多代码也不会变），后者是排期。混为一谈，读者无法判断等下一版有没有用。

### 验收

`npm run check` **exit 0**（含新增 `verify:analysis-config`：33/33 覆盖、0 warning、0 failure）。`characterization-items.ts` 未被触碰。

### 没做

未写任何 UI（`MethodAnalysisPanel` 属 P11）；未定 `AnalysisResult` 契约（P4）；**17 条 `analyzable` 意为「规则与工具就位」，不是「已实现」**，适配器在 P7/P8 落地；profile 归属的科学正确性未经领域专家复核，校验器输出里已写明此句。

---

## 2026-08-20 — P2 附录 决策补充（D17–D22）、生成器修复与宿主环境约束

**状态**：Done。P3 前的阻断项清理。

### 做了什么

| 类别 | 新建 | 修改 |
|---|---|---|
| 脚本 | `analysis-service/tessdata/fetch_tessdata.py` | **`scripts/generate_data.py`（修复为可运行）** |
| 数据 | — | `src/data/characterization-items.ts`、`regulatory-framework.ts`（**各 1 行**，仅头部注释）、`similarity-schemes.ts`（删死代码） |
| 元数据 | `analysis-service/tessdata/tessdata.manifest.json` | `fixtures/manifest.json`（v1.1.0）、`fixtures.lock.json`、`.gitignore` |
| 日志 | `log/2026-08-20-p2b-决策补充与环境约束.md` | `implementation-plan.md`、`log/CHANGELOG.md` |

**D18 — 主数据源查清，生成器恢复可用。** 用户指出 V0.1 的内容就是 V2 的 Sheet1 + Sheet2。实测确认 V2 Sheet2 **在最前面插了两列**（A 项目来源、B CTD章节（页码）），其后 C–M 与 V0.1 的 A–K 逐列对应。把 `EXCEL_PATH` 指向 V2、列常量整体 +2 后，两个 TS 文件正文**逐行完全一致**（5324 行 / 247 行），61 项、9 补充项、184 方法、9 要求、9 关联全部复现。重新生成后 `git diff --stat` 显示**各只改 1 行**，即头部 `Source of truth` 指向真实存在的 V2 文件。偏移量被双向钉死：不加偏移则 `supplementary got 0` 且 61/61 项 `applicability` 错位。

新增 `assert_expected_layout()`：读任何单元格前先校验 Sheet2 表头 13 列，再插一列会在此响亮失败而非静默移位。**该断言当即抓错**——我写的期望值「相似性评价方案」有误，实际表头是「相似性评价方**法**」。

**D22 — 宿主机原生工具无法处理中文工作区路径（实测）。** 这是本轮最重要的意外发现：

| 调用方式 | 结果 |
|---|---|
| `TESSDATA_PREFIX` = 中文路径 | **静默回落**到 Program Files，只见 eng/osd，不报错 |
| `--tessdata-dir` = 中文路径 | **硬崩溃** `std::filesystem::filesystem_error`，路径显示为 `ÉúÎïÀàËÆÒ©…`（UTF-8 被按 ANSI 解释） |
| ASCII 路径 | 正常列出 chi_sim / eng / osd |
| Docker bind mount 中文路径 | **完全正常**，`MOUNT_OK` |

静默回落比崩溃更危险——看起来像模型能力不足，实则路径问题。影响面含 D5 的 Comet.exe 与 D12 的 msconvert。**据此确立约束：原生二进制一律在容器内执行**，宿主中文路径只经 bind mount 暴露。D7 选的 Docker 方案使这条约束天然成立，无需迁移工作区。

**D21 — 1.04 MB 替代 625 MB。** D17 使二硫键分析取消，625 MB RAW 失去消费方；但删掉它会让 D12 要求的「RAW 实机转换成功」失去样本，而 PXD023358 全部 36 个 `.raw` 最小也有 425.2 MB。改用 **ProteoWizard 自带的 Thermo 读取器回归样本** 4 个共 1.04 MB，magic bytes `01a1460069006e00` 与被删生产 RAW 前 8 字节完全一致。它们是厂商读取器自己的基准：读不了就说明 msconvert 坏了，比任意生产 RAW 是更强的 P6 测试。`BSA-FT-HCD.raw` 还与站点既有 BSA 演示（66398.19 Da）对齐。

**其余决策**：D17 四项无规则项目完全不跑分析（**取代 D3**）；D19 加 `chi_sim`（`tessdata_best`，26.47 MB 放项目内经 `TESSDATA_PREFIX` 指向，不写 Program Files）；D20 只要能两侧比对即可，不强求候选药 vs 参照药。

**下载器缺陷 — 静默短读被当成成功。** PXD063988 的两个 mzML 都恰好停在 47,761 字节。`.part` 内容是真正的 mzML 前缀而非错误页；服务器报 `Content-Length: 797,649,988`、`Accept-Ranges: bytes`，而单次 GET 在 104,972,288 字节处静默断流 —— **截断点随机**。根因是连接被掐断时 `read()` 返回空字节串**不抛异常**，短读被当成读完，而尺寸断言在重试循环之外，只能事后报错、无法触发续传。

第一轮修复（短读抛 `ShortRead` 进入重试续传 + 重试预算按「停滞次数」而非尝试次数）把进度从 47,761 字节推到 **639.7 MB / 669.4 MB（95.6%）**，但仍失败。日志揭示服务器的真实行为：开放式 `Range: bytes=N-` 能撑 40–240 MB 后被掐断，随后进入**拒绝重连**期，5/10/15 秒的退避熬不过去。

第二轮修复抓住了要点——**对策不是更耐心地重试整条尾部，而是不发长请求**：改为每次只要 `Range: bytes=N-(N+32MB-1)` 的有界区间（约 60 秒完成，通常在被掐断前结束，失败只损失一个区间）；退避改指数增长封顶 `min(5×2^(stalled−1), 120)` 秒、允许 8 次无进展；非 206 响应直接判失败，不再「从零重来」丢掉已验证的几百 MB；另加越界保护。

验证：卡了两轮共 55 分钟的 639.7 MB 位置，在区间模式下 15 秒退避后一次通过，第一个 mzML **完整落地** 669.4 MB / `sha256=a539c3dbd3b2fb1e…`。第二个文件在 186.1 MB 处连续被拒 4 次（5→10→20→40 秒），第 40 秒后恢复并继续，指数退避实测有效。

**尺寸断言原本被当作冗余保险，实际是唯一发现问题的机制。** 若无它，仓库里会躺着两个看起来正常、实则只有 6% 内容的 mzML，后续所有覆盖率结论都会错且极难追查。

### 实测发现

- **保留了权威序列**：只删 RAW、保留 PXD023358 的 8.8 MB 小文件。`NISTmAb.fasta`（HC 450 aa）与二硫键无关，是序列覆盖分析的理论序列来源，也是暴露 PXD063988 那份 449 aa 缺陷 FASTA 的尺子。
- **账目诚实**：lock 中该 RAW 条目移入 `deletedFiles` 并附删除原因，不直接抹掉——它的 SHA-256 是真实全量哈希过的证据；移出 `files` 后 `--verify` 也不会误报缺失。
- 清掉 P2 遗留死代码 `CTD_SECTION_PRIMARY`，`npm run lint` 归零。

### 测试

`npm run check` **exit 0 全绿**；`python scripts/generate_data.py` exit 0；Docker bind mount 中文路径 `MOUNT_OK`；ASCII 路径下 `tesseract --list-langs` 列出 chi_sim。

### 明确不是

- 不是「chi_sim 已验证可用」（只证明能被识别到，真实中文 OCR 属 P14，且必须在容器内做）
- 不是「RAW 已支持」（pwiz 样本只验证了是真 Thermo RAW，msconvert 能否读通等 P6；在此之前 UI 不得声称支持）
- 不是数据体改动（两个 TS 文件各只改头部 1 行注释）

**详情** → [2026-08-20-p2b-决策补充与环境约束.md](./2026-08-20-p2b-决策补充与环境约束.md)

---

## 2026-08-20 — P2 V0.1/V2 差异比对与 V2 Sheet3 规则 sidecar

**状态**：Done。

### 做了什么

| 类别 | 新建 | 修改 |
|---|---|---|
| 文档 | `docs/primary-structure-analysis/03-v2-diff-and-rules.md` | `implementation-plan.md`（进度日志） |
| 数据 | `src/data/similarity-schemes.ts` | `src/types/models.ts`（**追加** 5 个类型，未改既有类型） |
| 脚本 | `scripts/verify_similarity_schemes.mjs` | `package.json`（`verify:schemes` 接入 `check`） |
| 主数据 | — | **未触碰** `src/data/characterization-items.ts`（按 D4） |

**派生比对结论：一级结构区字段级差异为 0。** V2 Sheet2 的 13 个一级结构行中，11 行与站点项目逐字匹配（11 项 × 9 字段 + 2 个方法列全部一致），站点无一项在 V2 中缺失。未匹配的 2 行是 `示例占位项`（PTM 修饰1/修饰2）。**这修正了 P0「13 行 vs 11 项」的分叉推断**——差值只是计数差，不是内容分叉。

**Sheet3 规则清单**：10 个非空行逐单元格提取。

| completeness | 数量 | itemId |
|---|---|---|
| `complete`（治理 21 条方法） | 7 | 完整 / 脱糖完整 / 轻链 / 非脱糖重链 / 脱糖重链分子量、MS1 与 MS/MS 序列覆盖率 |
| `partial`（G–N 全空） | 1 | `cdr-signature-peptides` |
| `absent`（Sheet3 无行） | 3 | `n-c-terminal-sequence`、`free-thiol`、`disulfide-bonds` |
| 无法映射（未命名 PTM 占位） | 2 行 | 单独导出 `unmappedSheet3Rows`，不发明 itemId |

**关键前置发现：V0.1 工作簿在整个工作区已不存在。** 全盘搜索 `*.xlsx`/`*.xls` 仅剩 V2 汇总表与一个无关文件。`scripts/generate_data.py` 第 24 行硬编码指向 V0.1，故 `characterization-items.ts` 与 `regulatory-framework.ts` **已无法再生成**，逐字节 V0.1↔V2 差异也无法计算 —— 这使 **D4 从「优选」变为「唯一可行」**。建议作为独立后续任务处理，本计划不做迁移。

### 实测发现

- **七条完整规则无一提供数值阈值。** 五条质量规则 K 列逐字相同：「无统一相似性数值限度」；两条覆盖率规则：「无序列覆盖率的统一合格判定阈值」。界面**不得**把 ΔDa / Δppm / 覆盖率百分比渲染成合格线。
- **源工作簿仍在人工编辑中**：row 5/6/7 的「示例原项」错位填入 B 列挤掉 CTD 章节；row 8 的 A、B 皆空；row 6 存在笔误「还原+酶法脱糖**后后**」（已逐字保留并加注释）；合并单元格 `B7:B8`、`B11:B12`、`D9:D10`。这些错位正是 sidecar **手工维护而非通用读取器生成**的理由。
- **`verify:schemes` 把纪律变成结构约束**：非 `complete` 的 scheme 不得携带任何规则字段且 `methodIds` 必须为空 —— 任何人给 `cdr-signature-peptides` 补一条 `decisionMethod`，`npm run check` 立即失败。工作簿 SHA-256 由 `node:crypto` 实时重算比对。
- **规则治理率 21/33 = 64%**。P11 界面必须让有规则与无规则一眼可辨。

### 测试

`npm run check` **exit 0 全绿**（typecheck / lint / verify:cases / verify:demo / verify:method-content 184 方法 33 有正文 / verify:schemes 11 项 11 scheme 21 方法、SHA-256 matches、warnings 0、failures 0）。

### 明确不是

- 不是主数据迁移（`characterization-items.ts` 一字未动）
- 不是规则补造（4 项空缺一律 `RULE_NOT_DEFINED`，未从 Sheet2 或他处推导）
- 不是界面实现（P11 才渲染规则）

**详情** → [2026-08-20-p2-v2规则清单.md](./2026-08-20-p2-v2规则清单.md)

---

## 2026-08-20 — P1 DOCX 图谱矩阵与公开数据集候选清单

**状态**：**Done**。三个数据集全部落地并通过双重校验。

**落地结果**：74 个文件 / **1.74 GB**（低于原估 2.4 GB，因 D17 删去 625 MB 二硫键 RAW、D21 改用 1.04 MB 的 pwiz Thermo 样本）。加 `tessdata` 26.5 MB，`analysis-service/` 合计 1.77 GB，远低于 D13 的 15 GB 预算。

| 数据集 | 文件 | 体积 | 服务的 profile |
|---|---|---|---|
| PXD023358 | 37 | 8.8 MB | 仅作理论序列来源（权威 `NISTmAb.fasta`） |
| PXD054948 | 18 | 340 MB | `intact-mass`、`peptide-map`（3 组 WIFF+scan 配对） |
| PXD063988 | 5 | 1.4 GB | `peptide-map`、`ms1-coverage`、`msms-sequence`（**两个现成 mzML**） |
| pwiz-thermo | 4 | 1.04 MB | P6 msconvert 验证 |

**双重校验，两层 0 失败。** 新增 `verify_published_checksums.py`，用**投递者上传的 `checksum.txt`（SHA-1）**做独立见证：**60 OK / 0 mismatched / 0 not listed**。这一层不可省——`--verify` 的两个数字都来自我们自己，只能证明「字节自写入以来未变」，不能证明它们就是投递者产出的字节，而这两个 mzML 是靠几十次区间续传拼起来的。

实现坑两处：PXD063988 的 `checksum.txt` 是 `<UNC 路径>\t<sha1>`，摘要在**第二列**（与常见的 `<digest>  <name>` 相反），故解析器两种顺序都接受；路径含 Windows 盘符与 UNC 前缀，显式按 `[\\/]` 取末段而非依赖 `pathlib`。摘要算法按长度推断，不硬编码。

### 做了什么

| 类别 | 新建 | 修改 |
|---|---|---|
| 文档 | `docs/primary-structure-analysis/01-figure-matrix.md`、`02-dataset-shortlist.md` | `implementation-plan.md`（进度日志） |
| 日志 | `log/2026-08-20-p1-图谱矩阵与数据集.md` | `log/CHANGELOG.md` |
| 业务代码 | — | **无** |

**图谱矩阵**：DOCX 6 张图 × 9 维度（小节 / 图谱类型 / 底层数据类型 / profile / itemId / 推荐工具 / 分析指标 / 图片降级方式 / 科学边界）；33 条 methodId 唯一归并为 `intact-mass` 11、`peptide-map` 6、`ms1-coverage` 2、`msms-sequence` 8、`free-thiol` 1、`disulfide-map` 1、仅展示 4。

**数据集候选**（PRIDE API v3 实测，全部 CC0）：

| accession | 品种 | 关键价值 | 建议下载 |
|---|---|---|---|
| PXD023358 | NISTmAb RM 8671 | 36 个真实**二硫键连接肽鉴定表**（含 `HC22-HC97` 配对与 `_S-S_` 连接肽）+ 权威 FASTA | ≈ 635 MB |
| PXD054948 | NISTmAb、**Enbrel** | 完整 + 亚基 + 肽**三层表征**，对应 DOCX 图 2 | ≈ 25 MB |
| PXD063988 | NISTmAb、Trastuzumab、Cetuximab | **唯一提供现成 mzML**；论文核心为 CDR 覆盖 | ≈ 672 MB |

排除 PXD025299（`.uep` 为 Waters 专有格式，msconvert 不支持）与 PXD067004（1.4 TB，主题为 HCP 残留）。

### 实测发现

- **PRIDE FTP 被网络阻断**（`WinError 10060`），HTTPS + `Range` 可用 → 下载器必须走 HTTPS 续传。
- **取得 4 类格式的 magic bytes**：mzML `<?xml ve`、Thermo RAW `01 A1 46 00 69 00 6E 00`、SCIEX WIFF OLE2、XLSX `PK` —— 直接用于 P6 类型校验。
- **公开 FASTA 存在真实序列错误**：PXD063988 的 `NIST_HC` 为 449 aa，比权威 `NISTmAb.fasta`（450 aa）在第 **360** 位少一个 **Glu**，缺失点恰落在 DOCX 图 5 的 HT35 肽 `EEMTK` 上。已据此确立规则：**任何下载 FASTA 未经交叉比对不得当作理论序列。**
- **NISTmAb 重链声明 MW 与自算值差 +28.02 Da 未解释**（轻链完全吻合）。查清前不得作为理论质量基准。

### 明确不是

- 不是数据下载（本步只探测体积与 magic bytes，未下载任何大文件）
- 不是 profile 配置实现（P3 才写 `method-analysis-config.ts`）

**详情** → [2026-08-20-p1-图谱矩阵与数据集.md](./2026-08-20-p1-图谱矩阵与数据集.md)

---

## 2026-08-20 — P0 一级结构真实分析软件接入：现状核实与实施计划

**用户需求**：「在一级结构『检测方法』区域接入真正可运行的分析软件，能分析《生物类似药药学评价比较.docx》中列举的图谱类型。输入不限定为图片，必须优先分析结构化数据或仪器导出数据。」

**计划位置**：新建独立计划线 [`docs/primary-structure-analysis/implementation-plan.md`](../docs/primary-structure-analysis/implementation-plan.md)（P0–P16），**不覆盖** `docs/tool-survey/implementation-plan.md`（S0–S16）。

### 做了什么

| 类别 | 新建 | 修改 |
|---|---|---|
| 计划 | `docs/primary-structure-analysis/implementation-plan.md` | — |
| 日志 | `log/2026-08-20-p0-现状与计划.md` | `log/CHANGELOG.md` |
| 业务代码 | — | **无**（P0 只读取与规划） |

**实解结果**（python-docx 1.2.0 / openpyxl 3.1.5，非文件名推测）：

| 资料 | 结论 |
|---|---|
| DOCX | 6 张内嵌图，全部为文献截图，对应四类工作流：完整/亚基质量镜像谱、LC-MS 肽图 TIC 镜像、肽段峰表、MS/MS 碎片谱与序列覆盖图 |
| V2 Sheet3 | 仅 11 个数据行，**7 条规则完整**；CDR 特征肽仅填前 6 列；PTM 修饰1/2 为空占位；**N/C 端、游离巯基、二硫键完全无行** |
| 现有项目 | 61 项 / 184 方法；`primary-structure` = 11 项 / **33 条 methodId**（已逐条清点） |
| 真实数据 | 全工作区**无任何抗体 mzML/MGF/峰表/RAW**；仅 UniProt P02769 序列 + UniDec 官方测试谱 + 6 个 OpenMS 小分子示例 mzML |

**已确认的 16 项决策**（D1–D16）记入计划 §三，含：只实现 Sheet3 已有的 7 条规则、不动 `characterization-items.ts`、Docker 部署、允许下载公开数据集与 Comet、同意 pwiz 厂商许可、图谱前端 SVG + 后端 PNG 双轨、分 5 个检查点推进。

### 明确不是

- 不是分析功能实现（P0 未写任何业务代码）
- 不是 V2 主数据迁移（按 D4 只建 sidecar）
- 不是对 UniDec L2 的升级（维持 L1+）

**详情** → [2026-08-20-p0-现状与计划.md](./2026-08-20-p0-现状与计划.md)

---

## 2026-08-14 — S16 方法学正文（原理）嵌入检测方法模块

**用户需求**：「补充方法学正文的原理部分。此步骤同样修改入计划中。」

**计划位置**：`docs/tool-survey/implementation-plan.md` → §S16（后续大类强制）；S13 完成条件已补「须满足 S16」。

### 做了什么

| 类别 | 新建 | 修改 |
|---|---|---|
| 数据 | `src/data/method-content.ts` | — |
| 组件 | `src/components/MethodContentPanel.tsx` | `MethodSelector.tsx`、`live-demo/MethodLiveDemo.tsx` |
| 类型 | — | `src/types/models.ts`（`DetectionMethodContent`，前序步骤） |
| i18n | — | `src/i18n/messages.ts`（`methodContent.*`；`liveDemo` 文案去「原理待嵌入」） |
| 校验 | `scripts/verify_method_content.mjs` | `package.json`（`verify:method-content` → `check`） |
| 文档 | `log/*` | `docs/tool-survey/implementation-plan.md`、`README.md` |

**覆盖**：一级结构 **11 个检测项目、33/33 条方法**均有中英 `principle`；**184 条全局方法**中其余 151 条尚无正文（其他大类未开始）。

**页面行为变化**（相对 S15 之前）：

| 情形 | 旧行为 | 新行为（S16 起） |
|---|---|---|
| 有原理 + 有演示 | 仅演示 + 工具面板；演示底部写「原理仍待嵌入」 | **原理面板在上** → 演示 → 工具面板 |
| 有原理、无演示 | 虚线占位「检测内容待嵌入」 | **仅原理面板** + 工具面板（6 条方法属此类） |
| 无原理、有演示 | 演示替换占位 | 不变（其他大类将来可能遇到） |
| 两者皆无 | 虚线占位 | 不变 |

**6 条「有原理、无演示」的方法**（硬缺口或未做浏览器演示）：

- `msms-sequence-coverage-orthogonal-2`（端基分析 / Edman 类）
- `n-c-terminal-sequence-primary-2`（Edman 降解）
- `free-thiol-orthogonal-2`、`disulfide-bonds-orthogonal-2`（还原/非还原 CE-SDS）
- `disulfide-bonds-primary-1`、`disulfide-bonds-orthogonal-1`（二硫键连接图谱 / 游离巯基正交）

### 校验（2026-08-14）

```text
npm run verify:method-content
  methods total        : 184
  methods with body    : 33
  categories covered   : primary-structure
  failures             : 0

npm run check          → 全绿（typecheck + lint + verify:cases + verify:demo + verify:method-content）
npm run build          → 74 页 SSG 正常
```

### 明确不是

- 可执行 SOP（样品制备、仪器参数等五字段仍标「待嵌入」）
- 经方法学验证的文本；英文为占位级自撰
- 生物类似性判定依据

**详情** → [2026-08-14-s16-方法学正文原理.md](./2026-08-14-s16-方法学正文原理.md)

---

## 2026-08-14 — S15 演示下方可展开溯源说明

**用户需求**：演示下方须有点击展开的说明，让人相信数据与计算真实可复现，而非虚构。

### 做了什么

| 新建/修改 | 路径 |
|---|---|
| 溯源数据 | `src/data/live-demo-provenance.ts` |
| 组件 | `src/components/live-demo/LiveDemoProvenance.tsx` |
| 接入 | `MethodLiveDemo.tsx` 内 `<LiveDemoProvenancePanel>` |
| i18n | `messages.liveDemo.provenance*` 系列键 |
| 计划 | `implementation-plan.md` §S15 + Done 日志 |

**强制小节**（`<details>` 展开）：这是什么 / 这不是什么 / 数据来源 / 计算原理 / 独立校验 / 证据文件 / 外部链接。

**详情** → [2026-08-14-s15-演示溯源.md](./2026-08-14-s15-演示溯源.md)

---

## 2026-08-14 — S14 检测方法模块实机演示

**用户需求**：实机演示必须嵌入检测方法模块，当场计算，至少覆盖一条可运行链路。

### 做了什么

| 新建/修改 | 路径 |
|---|---|
| 演示路由 | `src/data/live-demos.ts`（27 条方法映射到 3 种 demo kind） |
| 计算库 | `src/lib/live-demo/protein-mass.ts`、`charge-deconvolution.ts`、`trypsin-digest.ts`、`quality-range.ts` |
| 组件 | `IntactMassDemo.tsx`、`PeptideMapDemo.tsx`、`QualityRangeDemo.tsx`、`MethodLiveDemo.tsx` |
| 校验 | `scripts/verify_live_demo.mjs` → `npm run verify:demo` |
| 计划 | `implementation-plan.md` §S14 + Done 日志 |

**三种演示**：

| kind | 覆盖方法数 | 默认数据 | 预言机 |
|---|---|---|---|
| `intact-mass` | 11 | UniProt P02769 成熟链 583 aa | 氧化态 66398.19 Da |
| `peptide-map` | 15 | 同上 + G327A 替换开关 | 覆盖率 99.31% |
| `quality-range` | 1（`free-thiol-primary-1`） | s09c 合成 20+12 批 | QR [0.7548, 1.0884] |

**明确不是**：浏览器内跑 UniDec/pyOpenMS；RAW 上传；监管结论。

**详情** → [2026-08-14-s14-实机演示.md](./2026-08-14-s14-实机演示.md)

---

## 2026-08-14 — S11 网站嵌入工具信息（索引）

逐方法展示开源工具短名单、许可证、部署层级（L0–L4）、证据路径；无工具方法显示缺口说明。

- 数据：`src/data/method-tools.ts`（33/33）
- 组件：`MethodToolPanel.tsx`
- 详见 `docs/tool-survey/implementation-plan.md` Done — S11

---

## 更早步骤（仅索引）

| 步骤 | 摘要 | 证据位置 |
|---|---|---|
| S0–S10 | 一级结构工具调研、PoC 三条 L4 链路 | `docs/tool-survey/01-primary-structure.md`、`tools-poc/` |
| S12 | 大类报告与缺口分析 | `docs/tool-survey/01-primary-structure.md` |
| S13 | 停止，等待进入下一大类 | 计划 §S13 |
