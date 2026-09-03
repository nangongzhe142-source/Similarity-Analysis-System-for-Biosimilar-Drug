# 一级结构真实分析软件接入 — 实施计划（P0–P16）

> 本计划独立于 [`docs/tool-survey/implementation-plan.md`](../tool-survey/implementation-plan.md)（S0–S16，工具调研线）。
> 两份计划**不互相覆盖**。工具调研线交付的是「知识库 + 可行性证据」；本计划交付的是**可运行的分析软件**。

| 字段 | 值 |
|---|---|
| 计划编号 | P0–P16 |
| 目标大类 | 一级结构（`primary-structure`，11 项 / 33 方法） |
| 创建日期 | 2026-08-20 |
| 主机 | Windows 10.0.26200 / PowerShell 5.1（**不支持 `&&`，用 `;`**） |
| 交付基线提交 | `b800c17` |
| 起始工作区状态 | 1 个未提交修改：`log/2026-08-14-s14-实机演示.md`（**保持不动，不得提交**） |

---

## 一、任务边界

在网站一级结构「检测方法」区域接入**真正可运行的 Python 分析软件**，使系统能分析
《生物类似药药学评价比较.docx》第 5.1.1 节列举的图谱类型。

渲染顺序（**不得删除或替换任何现有面板**）：

```
方法标签
  → MethodContentPanel      （现有，不动）
  → MethodAnalysisPanel     （本计划新增）
  → MethodLiveDemo          （现有，不动）
  → MethodToolPanel         （现有，不动）
```

### 明确不做

- 不实现 GxP / 21 CFR Part 11 合规流程；
- 不把 Python / OpenMS / UniDec / OCR 依赖加入 Next.js 生产进程；
- 不手工修改 `src/data/characterization-items.ts`（Excel 生成文件）；
- 不重新生成 `characterization-items.ts`（V2 迁移是独立后续任务，见 P2 差异清单）；
- 不创建 git commit / 不 push（除用户明确要求）；
- 不生成静态假结果，不把合成数据标成实测，不把图片分析标成原始数据分析；
- **不得根据图像相似度直接判定生物类似性**。

---

## 二、证据等级契约（贯穿全部步骤）

```
raw-data-analysis  >  structured-export-analysis  >  image-only-exploratory
```

| `dataSource` | 含义 | 举例 |
|---|---|---|
| `measured` | 用户上传的实测仪器数据 | 用户的 mzML |
| `exported-table` | 仪器/软件导出的结构化表 | 峰表 CSV、肽段鉴定表 |
| `public` | 公开数据库下载 | PRIDE/MassIVE accession |
| `official-example` | 工具官方示例数据 | OpenMS `tiny.mzML`、UniDec `test_1.txt` |
| `synthetic-demo` | 程序正演生成 | s09a 合成电荷包络 |
| `image-only` | 仅图片 | DOCX 截图、PNG/JPEG |

三条硬边界：

1. **仪器质量误差属于方法性能，不是生物类似性阈值。** 判定不得简化成「相差 X Da 就相似」。
2. **MS1 质量匹配只能支持「可能对应该肽段」，不能替代 MS/MS 序列确认。** 关键区域仅有 MS1 证据时状态为 `REVIEW`。
3. **图片模式坐标校准失败 → `calibrationReliable = false`**，此时不输出 Da / m·z⁻¹ / 保留时间，只输出归一化像素坐标，且**不得输出生物类似性 PASS/FAIL**。

另有一条状态语义边界：

- 分析软件执行失败 → `job.status = FAILED`；
- 检出质量属性差异 → `verdict = DIFFERENCE_DETECTED`。
- **不得把软件报错显示为「不相似」。**

---

## 三、已确认的决策记录（2026-08-20，用户答复）

| # | 议题 | 决策 |
|---|---|---|
| D1 | 真实数据 | 允许联网下载公开单抗数据集。**先列 5–8 个候选清单（accession / 品种 / 实验类型 / 格式 / 体积）给用户选，选定后才下载。** |
| D2 | V2 规则缺口 | **只实现 Sheet3 已填写完整的 7 条规则。** 其余一律 `RULE_NOT_DEFINED` + 人工 REVIEW，**绝不从 Sheet2 或别处补造**。 |
| D3 | P13/P14 判定 | 游离巯基与二硫键**只做计算与展示**，`verdict` 一律 `RULE_NOT_DEFINED`，**不出 PASS/FAIL**。 |
| D4 | 项目主数据 | **不动** `characterization-items.ts`。V2 只用于建 sidecar；P2 输出 V0.1↔V2 差异清单供后续决策。 |
| D5 | MS/MS 引擎 | 允许下载安装 **Comet**（Apache-2.0）实机验证。跑不通则 P9 写 `Blocked/L0`，不得伪造。 |
| D6 | 图片模式依赖 | **opencv-python + scikit-image + Tesseract**（需额外安装系统级 `tesseract.exe`）。手动两点校准通道无论如何都要实现。 |
| D7 | 服务运行方式 | **Docker**（引擎已确认运行：`ServerVersion=28.1.1 OSType=linux`）。宿主已有 12 个 Dify 容器占用端口，需选不冲突端口 + 独立 compose 项目名。 |
| D8 | 任务队列 | 进程内 asyncio 队列 + 有界并发 + **磁盘持久化任务状态 JSON**（重启后可读回结果）。 |
| D9 | 图谱渲染 | **两者都要**：前端手写交互 SVG（悬停查峰 / 缩放 / 双语）+ 后端 matplotlib 出可下载 PNG。 |
| D10 | 推进节奏 | **分阶段停下确认**：P0–P4 → 停；P5–P6 → 停；P7–P10 → 停；P11–P12 → 停；P13–P16 → 停。 |
| D11 | i18n | 新组件文案**完整双语**，全部写进 `src/i18n/messages.ts`。 |
| D12 | RAW 转换 | 用户**明确同意厂商 DLL 许可**：拉 `chambm/pwiz-skyline-i-agree-to-the-vendor-licenses` 作 sidecar 容器。**转换实机跑通后**才在 UI 标 RAW 已支持，否则标 Blocked。 |
| D13 | 磁盘预算 | **工作区总增量 ≤ 15 GB**（用户后续更具体的答复优先于先前的 30 GB）。其中 pwiz 镜像约 2 GB、服务镜像/venv 约 2 GB、数据集预算约 8–10 GB。 |
| D14 | 数据集存放 | `analysis-service/fixtures/`，**加入 .gitignore**；仅 manifest（accession / URL / SHA-256 / 下载日期 / 体积）+ 下载脚本入库。 |
| D15 | API 访问方式 | 浏览器**直连** FastAPI（需配置 CORS，仅允许本地开发源）。 |
| D16 | 上传上限 | mzML/mzXML **2 GB**；RAW **4 GB**；MGF 1 GB；CSV/TXT 20 MB；FASTA 2 MB；图片 20 MB 且总像素 ≤ 4000×4000。 |
| D17 | 无规则项目的面板行为 | 游离巯基、二硫键、N/C 端序列、CDR 特征肽这 4 项**完全不跑分析**，面板只显示「本项规则未定义」。**此决策取代 D3**：P13/P14 不再「只算不判」，而是降为纯占位，避免用户把数值误当结论。 |
| D18 | 主数据源 | **V0.1 = V2 的 Sheet1 + Sheet2**（用户确认）。`generate_data.py` 改指向 V2，Sheet2 列号 **+2**（V2 前插 A 项目来源、B CTD章节）。已机械验证：两个 TS 文件正文逐行复现，仅头部 source-of-truth 注释更新。**D4 中「不动主数据」的部分因此解除**，但数据体依然一字未变。 |
| D19 | Tesseract 语言包 | 需要 **chi_sim**（中文图注与中文轴标签）。放项目内 `analysis-service/tessdata/`，经 `TESSDATA_PREFIX` 指向，不写 Program Files、不需提权。变体选 `tessdata_best`（轴标签是短串，错一位数字就毁掉校准，精度优先于速度）。 |
| D20 | 候选/参照配对 | **只要能做两侧比对即可**，不强求「候选药 vs 参照药」。溯源面板仍须写明比的是哪两个样本、且该配对不是头对头生物类似药设计。 |
| D21 | RAW 转换验证样本 | 删除已下载的 625 MB 二硫键 RAW（D17 后无消费方），改用 **ProteoWizard 自带的 Thermo 读取器回归样本** 4 个共 1.04 MB。它们是厂商读取器自己的测试基准，读不了就说明 msconvert 本身坏了，比任意生产 RAW 更强的 P6 测试。 |
| D23 | 本期分析范围 | **只做 V2 Sheet3 中规则完整的 7 个项目**（完整分子量、脱糖分子量、轻链分子量、非脱糖重链分子量、脱糖后重链分子量、MS1 序列覆盖率、MS/MS 序列覆盖率），先把这 7 项**跑通全链路**（后端分析 → 前端面板 → 规则判定），其余项在配置表中明示状态、界面不给可用入口，跳通后再扩。P3 的配置表仍**逐条覆盖全部 33 条方法**，不留空白。 |

#### D22 — 宿主机原生工具无法处理中文工作区路径（实测，非推测）

工作区路径 `d:\生物类似药判别系统\…` 含中文，**宿主机原生二进制会因此失败**。实测证据：

| 调用方式 | 结果 |
|---|---|
| `TESSDATA_PREFIX` = 中文路径 | `Warning: TESSDATA_PREFIX … does not exist, ignore it`，静默回落到 Program Files，只看到 eng/osd |
| `tesseract --tessdata-dir` = 中文路径 | **硬崩溃**：`terminate called after throwing an instance of std::filesystem::filesystem_error`；报错里路径显示为 `ÉúÎïÀàËÆÒ©…`，即 UTF-8 被按 ANSI 重解释 |
| `TESSDATA_PREFIX` = `C:\bsim-tessdata-test`（ASCII） | 正常列出 **chi_sim / eng / osd** 三种语言 |
| Docker bind mount 中文路径 → `/data` | **完全正常**，容器内 `ls -la` 列出全部 5 个文件，`MOUNT_OK` |

**影响面不止 Tesseract**：D5 的 Comet.exe、D12 的 msconvert 若在宿主机直接调用，同样会撞上这个问题。

**因此确立工程约束**：所有原生二进制（tesseract、comet、msconvert）**一律在容器内执行**，宿主中文路径只通过 bind mount 暴露，容器内路径保持 ASCII（`/app/...`）。D7 选的 Docker 方案恰好使这条约束天然成立，无需迁移工作区。若将来必须在宿主机直调某个原生工具，须先把输入拷到 ASCII 临时目录。

---

## 四、P0 基线事实（已实机核实，非文件名推测）

### 4.1 DOCX 图谱清单

`生物类似药评价指导原则/生物类似药药学评价比较.docx`
SHA-256 `ea5c09058fd1c0dc771b5ebf97db812d1b951649ca7b706b359f28484e1b10ec`，1,100,522 字节。
用 `python-docx` 1.2.0 遍历 body 并用 `a:blip` 定位内嵌图，另用 zipfile 核对 `word/media/`：**共 6 张图**。

| # | media | 尺寸 | DOCX 小节 | 图谱类型 | 底层数据类型 | 工作流 |
|---|---|---|---|---|---|---|
| 1 | `image1.jpeg` | 427×476 | 5.1.1.1 完整分子量 | 曲妥珠单抗原研（红）/类似药（蓝）**去卷积完整质量镜像谱**；峰 148059/148060、148221/148222、148383/148384、148546 Da；RPLC-QTOF-MS + MaxEnt1 | 去卷积质量谱（Mass–Intensity 二维数组） | **A** |
| 2 | `image2.jpeg` | 922×1371 | 5.1.1.2 | HLX03 vs CN-Humira®：(a) 胰酶肽图；(b) 完整 mAb、(c) 还原 LC、(d) 还原 HC、(e) 还原+脱糖 HC、(f) Fc、(g) Fab 的 MS 谱 | 原始 m/z 谱 + LC 色谱 | **A** + **B** |
| 3 | `image3.png` | 887×1176 | 5.1.1.3 序列覆盖率/一级质谱 | innovator vs biosimilar 4h 胰酶消化 **LC-MS 肽图镜像图**：(A) TIC 色谱；(B) 32.0–35.0 min 电荷归约/同位素去卷积局部放大 | LC-MS TIC / 去卷积色谱（RT–Intensity） | **B** |
| 4 | `image4.png` | 1149×580 | 5.1.1.3 | **Table 1**：CT-P13 vs RMP LC-ESI-MS 肽段表（HT01…HT17；Peptide No. / Amino Acid No. / Theoretical Mass (Da) / Observed Mass (Da) / RT (min)，两组各一列） | **肽段鉴定表 / 峰表（CSV 可直接表达）** | **C** |
| 5 | `image5.png` | 811×639 | 5.1.1.4 序列覆盖率/二级质谱 | 胰酶肽 HT35 的电荷归约/同位素去卷积 **MSᴱ 碎片谱**：(A) innovator `EEMTK`；(B) biosimilar `DELTK`；y 离子红、b 离子蓝、失水/失氨绿、未归属灰 | MS/MS 碎片谱（碎片 m/z–intensity + b/y 归属） | **D** |
| 6 | `image6.png` | 1202×845 | 5.1.1.4 | Trastuzumab-Probiomed **MS/MS 序列覆盖图**：LC 99.5%、HC 99.8%；按 50 残基分行的序列块，覆盖残基灰底 | 序列覆盖表（残基级布尔覆盖 + 覆盖率百分比） | **D** |

**结论：DOCX 里的 6 张图全部是文献截图，本身只能作为 `image-only` 输入。** 它们定义的是本系统必须支持的**结果展示类型**，不是唯一输入。

### 4.2 V2 XLSX 规则现状

`V2-生物类似药药学比对研究质量属性、检测方法及相似性评价原则汇总表.xlsx`
SHA-256 `8bd6b18f08d3b9a3b99c61cdb8eeff24ceef75a54a43b9f7d14d1709b703051f`，40,273 字节。
`openpyxl` 3.1.5 读取，`data_only=True`。Sheet 名：`1.法规框架`、`2.特性鉴定`、`3.特性鉴定相似性评价方案`。

Sheet3 列头（A–N）：
`项目来源 | CTD章节（页码） | 指南原词 | 表征项目 | 分析方法（首选） | 结果类型 | 识别内容 | 比较基准 | 判定规则类型 | 判定方法 | 数值边界 | 超界处理 | 主要依据 | 最终程序规则`

Sheet3 **仅 11 个数据行（row 2–12，row 12 为空）**，填写状态：

| Sheet3 行 | 指南原词 | 填写状态 | 可程序化 |
|---|---|---|---|
| 2 | 完整分子量 | A–N 全列 | ✅ |
| 3 | 脱糖分子量 | A–N 全列 | ✅ |
| 4 | 轻链分子量 | A–N 全列 | ✅ |
| 5 | 非脱糖重链分子量 | A–N 全列（A 列空，B 列误填「示例原项」） | ✅ |
| 6 | 脱糖后重链分子量 | A–N 全列（同上列错位） | ✅ |
| 7 | 序列覆盖率/一级质谱 | A–N 全列 | ✅ |
| 8 | 序列覆盖率/二级质谱 | A–N 全列（B 列空，属 B7:B8 合并） | ✅ |
| 9 | 翻译后修饰—修饰1 | 仅 B/C/D，D=「见表末补充」 | ❌ 空缺 |
| 10 | 翻译后修饰—修饰2 | 仅 B/C | ❌ 空缺 |
| 11 | CDR区特征肽段鉴别 | 仅 A–F（缺 G 识别内容 / H 比较基准 / I 规则类型 / J 判定方法 / K 数值边界 / L 超界处理 / M 依据 / **N 最终程序规则**） | ❌ 空缺 |

**Sheet3 完全没有对应行的一级结构项目**：`n-c-terminal-sequence`（N/C 端序列）、`free-thiol`（游离巯基）、`disulfide-bonds`（二硫键）。

按 **D2/D3**：可程序化规则 = **7 条**；其余 4 个一级结构项目（CDR 特征肽、N/C 端、游离巯基、二硫键）+ 2 个 PTM 占位 = `RULE_NOT_DEFINED`。

Sheet2「2.特性鉴定」有 64 行数据（row 2–65），一级结构占 row 2–14（13 行，比 V0.1 多出「翻译后修饰—修饰1/修饰2」两个占位项），另 row 54–57 为表末 PTM 补充（氧化 / 脱酰胺 / N 端焦谷氨酸 / C 端 Lys）。V0.1↔V2 完整差异在 P2 输出。

### 4.3 现有项目一级结构 33 条方法（`characterization-items.ts`，V0.1 生成）

61 项 / 184 方法；`primary-structure` = 11 项 / 33 方法。逐条清单：

| # | itemId | methodId | type | 方法名 |
|---|---|---|---|---|
| 1 | `intact-mass` | `intact-mass-primary-1` | primary | LC-ESI-MS（高分辨QTOF/Orbitrap等） |
| 2 | | `intact-mass-orthogonal-1` | orthogonal | 肽图LC-MS/MS |
| 3 | | `intact-mass-orthogonal-2` | orthogonal | 完整/脱糖/亚基结果相互印证 |
| 4 | `deglycosylated-intact-mass` | `deglycosylated-intact-mass-primary-1` | primary | 酶法脱糖后LC-ESI-MS |
| 5 | | `deglycosylated-intact-mass-orthogonal-1` | orthogonal | 肽图LC-MS/MS |
| 6 | | `deglycosylated-intact-mass-orthogonal-2` | orthogonal | 完整/脱糖/亚基结果相互印证 |
| 7 | `light-chain-mass` | `light-chain-mass-primary-1` | primary | 还原/亚基LC-MS |
| 8 | | `light-chain-mass-orthogonal-1` | orthogonal | 肽图LC-MS/MS |
| 9 | | `light-chain-mass-orthogonal-2` | orthogonal | 完整/脱糖/亚基结果相互印证 |
| 10 | `non-deglycosylated-heavy-chain-mass` | `non-deglycosylated-heavy-chain-mass-primary-1` | primary | 还原后重链LC-MS |
| 11 | | `non-deglycosylated-heavy-chain-mass-orthogonal-1` | orthogonal | 肽图LC-MS/MS |
| 12 | | `non-deglycosylated-heavy-chain-mass-orthogonal-2` | orthogonal | 完整/脱糖/亚基结果相互印证 |
| 13 | `deglycosylated-heavy-chain-mass` | `deglycosylated-heavy-chain-mass-primary-1` | primary | 脱糖并还原后LC-MS |
| 14 | | `deglycosylated-heavy-chain-mass-orthogonal-1` | orthogonal | 肽图LC-MS/MS |
| 15 | | `deglycosylated-heavy-chain-mass-orthogonal-2` | orthogonal | 完整/脱糖/亚基结果相互印证 |
| 16 | `ms1-sequence-coverage` | `ms1-sequence-coverage-primary-1` | primary | 酶切肽图LC-MS（MS1） |
| 17 | | `ms1-sequence-coverage-orthogonal-1` | orthogonal | LC-MS/MS |
| 18 | | `ms1-sequence-coverage-orthogonal-2` | orthogonal | 增加其他蛋白酶 |
| 19 | `msms-sequence-coverage` | `msms-sequence-coverage-primary-1` | primary | 肽图LC-MS/MS |
| 20 | | `msms-sequence-coverage-orthogonal-1` | orthogonal | 不同酶切策略 |
| 21 | | `msms-sequence-coverage-orthogonal-2` | orthogonal | 端基分析 |
| 22 | `cdr-signature-peptides` | `cdr-signature-peptides-primary-1` | primary | 靶向肽图LC-MS/MS |
| 23 | | `cdr-signature-peptides-orthogonal-1` | orthogonal | 多酶切策略 |
| 24 | | `cdr-signature-peptides-orthogonal-2` | orthogonal | 高分辨MS |
| 25 | `n-c-terminal-sequence` | `n-c-terminal-sequence-primary-1` | primary | 肽图LC-MS/MS |
| 26 | | `n-c-terminal-sequence-primary-2` | primary | 必要时Edman降解 |
| 27 | | `n-c-terminal-sequence-orthogonal-1` | orthogonal | 完整/亚基质谱 |
| 28 | `free-thiol` | `free-thiol-primary-1` | primary | Ellman试剂法或荧光巯基法 |
| 29 | | `free-thiol-orthogonal-1` | orthogonal | 非还原肽图LC-MS/MS |
| 30 | | `free-thiol-orthogonal-2` | orthogonal | 还原/非还原CE-SDS |
| 31 | `disulfide-bonds` | `disulfide-bonds-primary-1` | primary | 非还原肽图LC-MS/MS |
| 32 | | `disulfide-bonds-orthogonal-1` | orthogonal | 游离巯基 |
| 33 | | `disulfide-bonds-orthogonal-2` | orthogonal | 还原/非还原CE-SDS |

### 4.4 DOCX 图谱 → 工作流 → itemId/methodId 映射（P1 将细化）

| 工作流 | profile | 覆盖 itemId | 方法数 |
|---|---|---|---|
| **A** 完整/亚基分子质量与去卷积谱 | `intact-mass` | `intact-mass`、`deglycosylated-intact-mass`、`light-chain-mass`、`non-deglycosylated-heavy-chain-mass`、`deglycosylated-heavy-chain-mass`（+ `n-c-terminal-sequence-orthogonal-1`） | 16 |
| **B** LC-MS 肽图与镜像色谱 | `peptide-map` | 上述 5 项的 `*-orthogonal-1`（肽图正交）+ `ms1-sequence-coverage` | — |
| **C** MS1 肽质量匹配与序列覆盖率 | `ms1-coverage` | `ms1-sequence-coverage`、`cdr-signature-peptides`、`n-c-terminal-sequence` | — |
| **D** MS/MS 碎片谱与序列确认 | `msms-sequence` | `msms-sequence-coverage`、`cdr-signature-peptides`、`n-c-terminal-sequence`、`free-thiol-orthogonal-1`、`disulfide-bonds-primary-1` | — |
| **E** 游离巯基 QR | `free-thiol` | `free-thiol` | 3 |
| **F** 二硫键连接图谱 | `disulfide-map` | `disulfide-bonds` | 3 |

（B/C/D 存在方法重叠，最终每个 methodId 归属唯一 profile，由 P3 的 `method-analysis-config.ts` 定死。）

### 4.5 可复用代码

| 资产 | 路径 | 复用方式 |
|---|---|---|
| 完整质量链路（pyOpenMS 理论质量 + UniDec 去卷积 + ppm 核对） | `tools-poc/scripts/s09a_intact_mass_chain.py`（L4，exit 0） | **P7 重构为 `adapters/intact_mass.py` 的单一实现源**，`tools-poc` 脚本改为调用该模块，避免两套算法漂移 |
| 肽图/覆盖率（胰酶酶切 + ppm 匹配 + 替换检出） | `tools-poc/scripts/s09b_peptide_map_coverage.py`（L4，覆盖率 99.31%） | **P8 重构为 `adapters/ms1_coverage.py` 单一实现源** |
| 游离巯基 QR（μR/σR/QR/落入比例，含 CI/TI 区分） | `tools-poc/scripts/s09c_free_thiol_quality_range.py`（L4） | **P13 重构为 `adapters/free_thiol.py`**，改为读真实 CSV 批次 |
| 中文路径规避（`OPENMS_DATA_PATH` → ASCII 临时目录） | `tools-poc/scripts/_openms_bootstrap.py` | **P5 直接移植**为 `analysis-service/app/security/ascii_workspace.py` 的基础 |
| 浏览器端 SVG 绘图范式 | `src/components/live-demo/IntactMassDemo.tsx`、`PeptideMapDemo.tsx`、`QualityRangeDemo.tsx` | **P12 交互 SVG 的样式与结构参照**（D9） |
| 溯源面板范式（可展开、强制小节） | `src/components/live-demo/LiveDemoProvenance.tsx` + `src/data/live-demo-provenance.ts` | **P12 `AnalysisProvenance` 的结构参照** |
| 方法区域四层堆叠 | `src/components/MethodSelector.tsx` | **P11 插入 `MethodAnalysisPanel`**（只加一行渲染，不改现有三层） |
| 双语壳文案 | `src/i18n/messages.ts` | **P11/P12 新增键**（D11） |
| 校验脚本范式 | `scripts/verify_live_demo.mjs`、`verify_method_content.mjs` | **P15 `verify:primary-analysis`** 参照 |

### 4.6 真实数据现状（关键缺口）

| 位置 | 内容 | 性质 | 可用性 |
|---|---|---|---|
| `tools-poc/data/P02769.fasta` / `.json` | UniProt BSA 成熟链（583 aa） | **真实公开序列** | ✅ 可作 FASTA fixture |
| `tools-poc/.venv/.../unidec/bin/TestSpectra/test_1.txt`（91,810 B）、`test_2.txt`（180,387 B） | UniDec 包内示例文本谱（m/z + intensity） | `official-example` | ✅ 可作去卷积回归 fixture |
| `数据分析提取系统/ms_analysis/official_data/` 6 个 mzML：`tiny.mzML`(25 KB)、`PrecursorPurity_input.mzML`(115 KB)、`FeatureFinderMetaboIdent_1_input.mzML`(3.0 MB)、`small.mzML`(6.6 MB)、`Metabolomics_1.mzML`(8.5 MB)、`Metabolomics_2.mzML`(8.6 MB) | 来源经代码核实为 OpenMS 仓库 `doc/pyopenms/src/data`（见 `ms_analysis/constants.py` 的 `OPENMS_DOC_DATA_BASE`） | `official-example`，**小分子代谢组学 / 通用测试谱** | ⚠️ 仅可验证 **mzML 读取层**（P6），**不能**用于完整质量或肽图的科学内容 |
| 全工作区 | `.mgf` / `.raw` / `.wiff` / 肽图峰表 CSV | — | ❌ **不存在** |
| `tools-poc/output/*.json` | s09a/s09b/s09c 输出 | `synthetic-demo`（随机种子 20260814） | ✅ 可作 golden test 预言机 |

**因此：抗体完整质量、肽图、MS/MS 的真实数据全部缺失。** 按 **D1**，P1 阶段输出候选公开数据集清单交用户选定；在数据到位前，P7–P9 的 `raw-data-analysis` 等级只能用 `official-example` 与 `synthetic-demo` 做回归，真实模式待数据落地后验证。

### 4.7 工具与环境现状

| 组件 | 状态 | 证据 |
|---|---|---|
| Python | 3.10.13（`tools-poc/.venv`）；系统另有 3.12.10 | `py --version` |
| pyOpenMS / OpenMS core | **3.5.0**，L2（官方示例 6/6 断言通过） | `docs/tool-survey/evidence/run_s08.log`，exit 0 |
| UniDec | **8.2.1**，L1+（官方测试谱可跑，R²=0.9997/0.8912；**L2 未建立**，包内 `.out` 非权威预期输出） | `run_s08b.log` exit 0；`run_s08b_fail_reference.log` exit 1 |
| Pyteomics | 5.0.1 已安装，**6 个 PoC 脚本均未 import**，L0 | `install_core.log` |
| numpy / scipy | 2.2.6 / 1.15.3 | `versions_L1.log` |
| OpenCV / scikit-image | **未安装** | Glob 无 `cv2` |
| Tesseract | **未安装** | 需按 D6 下载 |
| Comet / MS-GF+ | **未安装**，L0 | `docs/tool-survey/01-primary-structure.md` §3.2 |
| 二硫键搜索工具 | **硬缺口 L0**（pLink-SS/pLink2 无许可证文件；dibby 停更 3 年+ 无许可证；SIM-XL/SlinkS 未找到可验证公开仓库） | 同上 §3.3/§6/§7.1 |
| Docker | CLI **28.1.1** + Compose **v2.35.1-desktop.1**，引擎运行中（`OSType=linux`） | `docker info` |
| 端口占用 | 宿主已有 12 个 Dify 容器（nginx / postgres:15 / redis:6 / weaviate:1.27 / dify-api 等） | `docker ps -a` |
| Next.js 前端 | Next 16.3.0 / React 19.2.8 / TS 5.9.3 / Tailwind 4；**无任何图表库依赖**，live-demo 为手写 SVG | `package.json` |

### 4.8 阻塞与缺口总览

| 项 | 阻塞原因 | 计划步骤 | 预期状态 |
|---|---|---|---|
| 抗体真实 mzML/MGF | 工作区无数据 | P1（列清单）→ 下载 | 待用户选定 |
| ~~厂商 RAW 读取~~ | ~~需拉 pwiz 镜像并实机验证~~ | ~~P6~~ | **已解除**：pwiz 镜像 9.26 GB 拉取完成后又修掉 3 个缺陷（`msconvert` 不在 PATH、镜像自带 `wine64_anyuser` 因 Wine 10.6 合并 `wine64` 而失效、`-e mzML` 产出无点文件名）；4/4 Thermo RAW 转换并经 pyOpenMS 读出谱图，UI 可标 RAW 已支持（D12 达成） |
| MS/MS 搜库 + FDR | Comet 未安装未验证 | P9 | 跑不通即 **Blocked/L0** |
| 二硫键搜索 | 无许可证清晰、可复现的开源工具 | P14 | 预期 **Blocked/L0** |
| CDR / N-C 端 / 游离巯基 / 二硫键的程序规则 | V2 Sheet3 未填写 | P2 | **RULE_NOT_DEFINED** |
| ~~图片坐标 OCR~~ | ~~Tesseract 未安装~~ | ~~P10~~ | **已解除**：Tesseract 5.5.0 已装；实测 OCR 会把轴刻度当峰标注，故手动两点校准确定为唯一可信通道，自动校准不提供 |
| UniDec L2 | 官方包无权威预期输出 | — | 维持 **L1+**，不虚报 |

---

## 五、步骤定义与验收标准

每步的 Done 必须包含：① 两行总结；② 修改文件；③ 实际执行命令；④ 退出码；⑤ 测试结果；⑥ 证据文件；⑦ 新风险或缺口；⑧ 下一步。
未达验收标准**不得**写 Done；部分完成写 `### In progress — P<n> …`；阻塞写 `### Blocked — P<n> …`。

### P0 — 当前状态与计划

检查 Git 状态；不覆盖用户现有改动；实际解析 DOCX/XLSX；清点现有项目与真实数据文件；创建本计划。**不改业务代码。**

**验收**：本文件存在且第四节全部事实均有实机证据；`git status` 除本计划新增文件外无其他变化。

### P1 — DOCX 图谱与分析需求矩阵

建立矩阵：DOCX 小节 → 图谱类型 → 底层数据类型 → itemId → methodId → 推荐工具 → 分析指标 → 图片降级方式 → 科学边界。
同时按 **D1** 输出 5–8 个候选公开单抗数据集清单（accession / 品种 / 实验类型 / 格式 / 体积 / 许可）交用户选定。

**产出**：`docs/primary-structure-analysis/01-figure-matrix.md`、`docs/primary-structure-analysis/02-dataset-shortlist.md`
**验收**：DOCX 6 张图全部落入矩阵且每行都有明确科学边界；数据集清单每条都有可验证 URL。

### P2 — V0.1/V2 差异和规则清单

比较 V0.1 与 V2 的项目、方法与规则；提取 Sheet3 全部 11 行（含空缺）；记录空缺；**不覆盖现有生成数据**。

**产出**：`docs/primary-structure-analysis/03-v2-diff-and-rules.md`；`src/data/similarity-schemes.ts`（每条规则带 `sourceWorkbook`/`sourceSheet`/`sourceRow`/`sourceCells`/`itemId`/`methodId`/`resultType`/`recognizedContent`/`comparisonBaseline`/`ruleType`/`decisionMethod`/`numericBoundary`/`overflowHandling`/`basis`/`finalProgramRule`）
**验收**：7 条完整规则逐字段可回溯到 Sheet3 单元格；4 个缺口项显式标 `RULE_NOT_DEFINED`；`npm run typecheck` exit 0。

### P3 — 方法分析配置 — **Done（2026-08-20）**

建立 `src/data/method-analysis-config.ts`，覆盖一级结构**全部 33 条方法**，每条明确：可分析 / 仅展示 / 尚未支持 / 被工具阻塞，以及图片降级允许与否。**不得手工修改 `characterization-items.ts`。**

**验收**：33 条方法全覆盖且无遗漏（脚本机械校验）；`profile` 归属唯一；`typecheck` exit 0。

**结果**：33/33 覆盖，`npm run check` exit 0（新增 `verify:analysis-config` 已接入）。状态分布 —— 可分析 17、被 Comet 阻塞 3、仅展示 4、规则未定义 9。profile 收敛为 **4 个**（`intact-mass` 10、`peptide-map` 5、`ms1-coverage` 2、`msms-sequence` 3），P1 的 `free-thiol` / `disulfide-map` 两个 profile 按 D17 取消。按 D23，7 个有规则项目共 21 条方法在范围内（17+3+1 仅展示），4 个无规则项目共 12 条出范围（9 规则未定义 + 3 湿实验仅展示）——与 P2 校验器独立算出的「受规则约束 21 条」一致。校验器把 D17 写成**结构约束**：项目 `completeness ≠ complete` 时方法不得声明 `analyzable`，工具未实机验证时同样不得。详见 [`log/2026-08-20-p3-方法分析配置.md`](../../log/2026-08-20-p3-方法分析配置.md)。

### P4 — 统一数据契约 — **Done（2026-08-20）**

TypeScript 类型 + Pydantic 模型 + JSON Schema + 自动化契约测试（三者字段一致性机械校验）。

**验收**：契约测试通过；TS 与 Pydantic 字段差异为 0。

**结果**：`src/types/analysis-contract.ts`（18 个模型/枚举）、`analysis-service/app/models/analysis_contract.py`、两份 JSON Schema + `field-manifest.json`、最小 fixture 已提交。`verify:analysis-contract` 与 `pytest analysis-service/tests/test_analysis_contract.py`（4 项）均通过；`npm run check` exit 0。相较原九节 spec 增补：`provenance` 块、`inputEvidence.samplePairing`（D20）、`extractedFeatures.coverageDefinition`（DOCX 图 6）、`evidence.parameters.massConstantSource`（P1 pyOpenMS 常数差异）。详见 [`log/2026-08-20-p4-统一数据契约.md`](../../log/2026-08-20-p4-统一数据契约.md)。

> **检查点 1：P0–P4 已完成。等用户确认后再进 P5。**

### P5 — Python 服务和任务状态机 — **Done（2026-08-20）**

`analysis-service/`：health / create job / upload / get job / cancel / safe error / 临时目录。进程内 asyncio 队列 + 磁盘持久化（D8）。Dockerfile + compose（独立项目名，不冲突端口）。

**验收**：容器与本地 venv 两种方式均能起；状态机 6 态转换有测试；错误信息不含服务器绝对路径。

**结果**：FastAPI 运行于 **8765**，compose 项目名 `bsim-analysis`。API：`GET /health`、`POST /v1/jobs`、`POST /v1/jobs/{id}/upload/{role}`、`POST /v1/jobs/{id}/start`、`GET /v1/jobs/{id}`、`DELETE /v1/jobs/{id}`。任务状态持久化至 `workspaces/{jobId}/job.json` + `input-manifest.json`；6 态状态机有单元测试；错误响应脱敏 Windows/Unix 绝对路径。无真实 adapter 时失败码 `ADAPTER_NOT_IMPLEMENTED`（非伪造结果）；`ANALYSIS_ALLOW_STUB_ADAPTER=true` 仅用于测试。本地 uvicorn 与 `docker compose up` 均已实机验证 `/health`。`pytest` 27 passed。详见 [`log/2026-08-20-p5-服务与任务状态机.md`](../../log/2026-08-20-p5-服务与任务状态机.md)。

> **检查点 2：P5 完成。P6 待开始。**

### P6 — 安全文件摄取 — **Done（2026-08-20）**

支持 mzML / mzXML / MGF / TXT / CSV / FASTA / PNG / JPEG / WebP / RAW / WIFF，含扩展名白名单、MIME、magic bytes、大小、总像素、文本编码、CSV 列/行数、mzML XML 安全解析（**禁外部实体**）、SHA-256、安全文件名、路径穿越防护、流式有界读取。完成异常格式与攻击输入测试（XXE / zip 伪装 / 超大像素 / 畸形 CSV）。
按 **D12** 实现 pwiz 侧车 `raw_converter.py`；**RAW→mzML 集成测试**依赖 `chambm/pwiz-skyline-i-agree-to-the-vendor-licenses` 镜像首次拉取（~2 GB）。

**验收**：攻击输入测试全部拦截；6 个 official-example mzML 全部可读；RAW 转换跑通才标已支持。

**结果**：`app/security/{limits,ingest,upload_io}.py`、`app/conversion/raw_converter.py`、上传路由接入安全校验、`UploadRejectedError`→HTTP 400。`pytest` 42 passed（不含 RAW 集成）；6/6 official mzML 通过 `validate_upload_content`。indexedmzML 根元素与 >8 MB 头部校验已处理。RAW 集成测试 `test_raw_conversion.py` 已实现，**待 pwiz 镜像 `docker pull` 完成后重跑闭合**（首次无本地镜像时 exit 125）。详见 [`log/2026-08-20-p6-安全文件摄取.md`](../../log/2026-08-20-p6-安全文件摄取.md)。

> **检查点 2：P5–P6 已完成。等用户确认后再进 P7。**

### P7 — 完整/亚基质量分析器 — **Done（2026-08-20）**

pyOpenMS + UniDec 去卷积、峰匹配、ΔDa/Δppm、镜像谱、V2 规则。**复用 s09a 并建立单一实现源。**

**验收**：s09a golden test 数值一致；ΔDa/Δppm 不被当作相似性阈值（规则文本核对）。

**结果**：`app/analysis/intact_mass/`（theory/spectrum/**mzml_reader**/deconvolution/rules/pipeline/plots）、`app/adapters/intact_mass.py`、`app/adapters/registry.py`；`s09a_intact_mass_chain.py` 改为调用共享模块。合成演示模式复现 s09a 数值：66398.19 Da 理论质量、回收 66398/66560 Da、头对头 +162 Da。V2 Sheet3 五条质量项目规则评价；K 列「无统一相似性数值限度」写入规则 rationale。`pytest` **49 passed**。

**用户质疑后的实机核查（重要）**：确认计算内核为第三方编译软件——pyOpenMS 3.5.0 + UniDec 8.2.1 的 `unidec.exe`（306,176 B），本仓库无自写质量/去卷积算法。核查中发现并修复**两个真实缺陷**：① 初版**完全没有 mzML 读取路径**（只能读两列 txt），已补 `mzml_reader.py`（OnDiscMSExperiment 流式，实测可读 702 MB / 33,039 谱的真实抗体 mzML；另实测确认 pyOpenMS 对中文路径直接 IO error，故强制 ASCII 暂存）；② 去卷积拟合质量再差也会被输出为实测质量（真实肽图谱 R²=−10.07 仍照常出峰），已加 `MIN_DECONVOLUTION_R_SQUARED=0.9` 门禁，低于下限强制 REVIEW 且不出质量结论。

**尚未闭合**：真实**完整/亚基质量**原始数据在工作区不存在（P1 下载的三个数据集均为肽图/二硫键类型），故 148 kDa 级抗体去卷积的科学验证未完成，golden test 科学依据仍为合成谱已知真值。详见 [`log/2026-08-20-p7-完整亚基质量分析器.md`](../../log/2026-08-20-p7-完整亚基质量分析器.md)。

> **检查点 3：P7 完成（含能力边界声明）。P8–P10 待开始。**

### P8 — 肽图和 MS1 覆盖分析器

理论酶切、峰表、TIC、对齐、覆盖率、未覆盖区域、CDR/N-C 端提示。**复用并重构 s09b。**

**验收**：s09b golden test 一致；MS1 结果强制携带「不能替代 MS/MS 确认」限制文本。

**结果**：`app/analysis/ms1_coverage/`（digestion/matching/simulation/substitution/regions/observed_masses/rules/pipeline）、`app/adapters/ms1_coverage.py`；`s09b_peptide_map_coverage.py` 改为调用共享模块。合成演示复现 s09b：118 理论肽段、参照 99.31%、候选 96.57%、327 位 G→A 替换检出。V2 Sheet3 row 7 规则；MS1 不能替代 MS/MS 写入 limitations 与 provenance。`pytest` **65 passed**（默认套件，+3）。详见 [`log/2026-08-21-p8-肽图与MS1覆盖分析器.md`](../../log/2026-08-21-p8-肽图与MS1覆盖分析器.md)。

> **检查点 3：P7、P8、P10 完成；P9 待开始。**

### Done — P9 — MS/MS 分析器

实机验证搜索引擎（Comet，D5）、PSM、b/y 离子、FDR、覆盖率、差异位点。**未达 L2 则写 Blocked，不得伪造。**

**验收**：Comet 在官方示例上跑通并有 FDR 控制 → 可标可用；否则 `### Blocked — P9`。

**结果**：Comet **2024.01 rev. 0** 实机跑通（BSA-FT-HCD mzML → `K.YICDNQDTISSK` PSM，FDR 1%）。`app/analysis/msms/`（comet_runner/psm_parser/fdr/coverage/fragment_ions/simulation/rules/pipeline）、`app/adapters/msms_sequence.py`；registry 注册 `msms-sequence`。合成演示复用 s09b 覆盖率口径：参照 99.31%、候选 96.57%、327 位 G→A 替换检出；DOCX #5 签名肽 `EEMTK`/`DELTK` b/y 理论注释写入 `fragmentIons`。V2 Sheet3 row 8 规则；合成/未跑 Comet 时 verdict 强制 REVIEW。`pytest` **67 passed**（+2 golden，Comet 集成 1 deselected）。详见 [`log/2026-08-21-p9-MSMS分析器.md`](../../log/2026-08-21-p9-MSMS分析器.md)。

**Done** — Comet 已安装至 `analysis-service/tools/comet/win64/comet.exe`（Apache-2.0，UWPR v2024.01.0）；ASCII 暂存工作目录调用；target-decoy FDR 过滤 rank-1 PSM。

**Done** — 前端 P11 约束已记录：面板在现有 `生物类似药相似性分析系统` 上扩展，非新建项目（P11 尚未开工）。

> **检查点 3：P7–P10 完成；P9 完成。下一步 P11（现有前端扩展）或 P13。**

<!-- legacy P9 heading kept for anchor -->

### Done — P10 — 图片降级分析器

曲线/棒峰提取、OCR、手动坐标校准、镜像/叠加/差异、SSIM/相关/DTW、`calibrationReliable`。保证 DOCX 全部图谱类型即使只有图片也能进入辅助分析。

**验收**：DOCX 6 张图逐张跑通；校准失败时确认不输出 Da/m·z⁻¹/RT，且无 PASS/FAIL。

**结果**：`app/analysis/image_fallback/`（constants/loader/calibration/curves/tables/coverage/similarity/pipeline）+ `app/adapters/image_fallback.py`；registry 改为**按输入格式分派**（全部上传均为图片时降级），因此图片降级对所有 profile 可达。DOCX 6 张图全部跑通并产出契约结果：image1 双迹镜像谱（给两点校准后输出 147927–148202 Da）、image2 识别为多子图并拒绝出峰、image3 拒绝把 137 个抗锯齿红像素当第二条迹、image4 肽段表 OCR 重建 18 行、image5 双迹谱 36 峰、image6 五种覆盖率口径全读出（control/combined 99.8，analyte/common 0.0）。工具：OpenCV 5.0.0 + scikit-image 0.25.2 + Tesseract 5.5.0。`pytest` **63 passed**（P10 新增 14）。

**实机发现并修复 4 个正确性缺陷**：① OCR 读 image1 轴刻度得到 147605/147805/… 而真实峰标注是 148059/148221/…，即把轴刻度当峰标注，证实自动校准不可用、手动两点校准必须为主通道（D6 判断得到实测支持）；② 用同行印刷理论质量当校验和的思路正确，但理论质量本身也会被 OCR 读错（1544.7→15447），导致实测值被「修复」成同样错 10 倍的 15448 且校验通过，已加理论质量合理区间（150–10000 Da），理论值不可信时该行直接丢弃而非充当基准；③ 保留时间无印刷冗余，`19.8→198`、`0.4→4.0` 原理上无法检测，故只做区间检查并永久标记 `retention_times_validated=False`，不假装能修；④ 分类原按「有无彩色像素」判断，会凭噪声虚构出第二个产品的谱，已改用 200 px 存在阈值 + 多子图长宽比识别。

**顺带修掉 P7 潜伏 bug**：两个 adapter 原用 `context.workspace / file_name` 拼上传路径，实际文件在 `workspace/uploads/`；此前因总落到合成演示分支而未暴露。

**硬边界写进代码而非文档**：校准不可靠时 `axis_value` 结构上无法赋值（`to_axis_value()` 抛异常）；`build_image_analysis_result` 硬编码 `REVIEW`，6 图逐张断言 verdict 不为 SUPPORTED/DIFFERENCE_DETECTED；`similarity.py` 无任何返回判定的函数。image6 额外强制声明 analyte/common 覆盖率为 0.0 意味着只有一侧有数据，不是头对头比较。

**实机更正 D19**：6 张图文字全为英文，`chi_sim` 语言包对本批图不需要。

**未实现**：image2 逐子图校准、image5 碎片离子按颜色归属、自动坐标校准（实测不可靠，不提供）。详见 [`log/2026-08-20-p10-图片降级分析器.md`](../../log/2026-08-20-p10-图片降级分析器.md)。

> **检查点 3：P7–P10 完成；P9 完成。**

### Done — P11 — 方法区域前端接口

**约束（用户确认）**：在现有「生物类似药相似性分析系统」前端（`MethodContentPanel → MethodAnalysisPanel → MethodLiveDemo → MethodToolPanel` 四层结构）上插入 `MethodAnalysisPanel`，**不新建项目**。双语（D11）。

**验收**：现有三个面板行为不变；33 条方法逐条切换面板配置正确；`npm run check` exit 0。

**结果**：`src/components/MethodAnalysisPanel.tsx` + `src/lib/analysis-service-client.ts` + `src/lib/analysis-uploads.ts`；`MethodSelector` 插入一层并传入 `itemId`；`messages.ts` 新增 `methodAnalysis` 双语键。按 `method-analysis-config` 状态渲染（可分析 / 规则未定义 / 仅展示 / 工具阻塞）；可分析方法提供上传、配对标签、创建任务、轮询、取消、失败提示与基础结果摘要（verdict、覆盖率/质量、规则评价、JSON 下载）。规则完整 vs 未定义视觉区分（teal vs rose）。`npm run check` exit 0。详见 [`log/2026-08-21-p11-方法区域前端接口.md`](../../log/2026-08-21-p11-方法区域前端接口.md)。

**Done** — 分析服务地址 `NEXT_PUBLIC_ANALYSIS_SERVICE_URL`（默认 `http://127.0.0.1:8765`）；未连接时显式提示启动 uvicorn，不静默失败。

### Done — P12 — 专业结果可视化

完整质量镜像谱、LC-MS 色谱叠加、序列覆盖图、MS/MS 碎片离子图、峰匹配表、V2 规则结果、溯源面板、JSON 下载。前端交互 SVG + 后端 PNG 下载（D9）。

**验收**：每种图都有真实数据或明确标注的 fixture 驱动；溯源面板含输入哈希/工具版本/参数/数据来源/局限性。

**结果**：`AnalysisResultView` 接入现有 `MethodAnalysisPanel`；后端 `plots.py` 出 PNG；peptide-map 合成 TIC（末峰 +0.40 min，标明 fixture）；`GET /v1/jobs/{id}/artifacts/{file}`。`pytest` 69 passed；`npm run check` exit 0。详见 [`log/2026-08-21-p12-专业结果可视化.md`](../../log/2026-08-21-p12-专业结果可视化.md)。

**Done** — 溯源含 inputHashes / toolVersions / parameters / dataSource / limitations；图片叠加横轴不得标为保留时间。

> **检查点 4：P11–P12 完成后停下，等用户确认。**

### Done — P13 — 游离巯基 QR

复用 s09c，支持真实 CSV 批次输入。按 **D3**：只做计算与展示，`verdict = RULE_NOT_DEFINED`，**不出 PASS/FAIL**。不得将 QR 与置信区间、容许区间混淆。

**验收**：s09c golden test 一致；界面明确显示「Sheet3 未定义该项程序规则」。

**结果**：按 **D17（取代 D3）** 做成纯占位：不注册 `free-thiol` adapter、分析面板无上传。s09c 黄金测试核对 QR [0.7548, 1.0884]、相似 12/12、偏移 4/12，并断言 CI/TI 不是 QR。面板对 `rule-not-defined` 显示「Sheet3 未定义该项程序规则」。`pytest` 71 passed；`npm run check` exit 0。详见 [`log/2026-08-21-p13-游离巯基占位.md`](../../log/2026-08-21-p13-游离巯基占位.md)。

**Done** — 三条 free-thiol 方法不得为 analyzable、不得带 profile；QR 计算只留在 Live Demo / s09c，不进入程序评价。

### Blocked — P14 — 二硫键能力评估

调研、安装、官方示例、PoC。未跑通就保留明确缺口（预期 `Blocked/L0`）。

**结果**：2026-08-21 GitHub API 复核 pLink2/pLink3/dibby：`license` 均为 null；pLink 2.3.11 README 授权到期日 **2025-01-10 已过期**。按准入规则**未安装、未跑官方示例**。D17 面板仍为规则未定义、无上传。证据：[`docs/tool-survey/evidence/p14_disulfide_license_check.json`](../tool-survey/evidence/p14_disulfide_license_check.json)。`npm run check` exit 0。详见 [`log/2026-08-21-p14-二硫键Blocked-L0.md`](../../log/2026-08-21-p14-二硫键Blocked-L0.md)。

**Done** — 缺口闭合为 Blocked/L0，不得把 pLink 标成可用；分析服务无 `disulfide-map` adapter。

### Done — P15 — 自动化测试

Python unit / API integration / JSON contract / 安全上传 / 中文路径 / 任务失败 / 任务取消 / s09a·s09b·s09c golden tests / TypeScript / ESLint / 组件测试 / 上传→分析→结果 E2E。
新增 `npm run verify:primary-analysis` 并接入 `npm run check`。

**结果**：`scripts/verify_primary_analysis.mjs` 跑默认 pytest（排除 `integration`）并机械检查分析面板堆叠、D17 横幅与结果图组件。新增 `tests/test_paths.py`（中文文件名清洗）。未引入 Jest/Playwright。`pytest` **76 passed, 7 deselected**；`npm run check` exit 0。详见 [`log/2026-08-21-p15-自动化测试.md`](../../log/2026-08-21-p15-自动化测试.md)。

**Done** — `npm run check` 现在包含 `verify:primary-analysis`；Docker RAW / Comet-on-RAW 仍须 `pytest -m integration`。

### Done — P16 — README、日志和最终审计

明确列出：支持的 methodId、支持的输入格式、实际验证的软件版本、原始数据模式、结构化导出模式、图片降级模式、未支持项、规则缺口、GxP 非目标、复现命令。

**结果**：审计正文 [`docs/primary-structure-analysis/16-final-audit.md`](./16-final-audit.md)；根 README 与 `analysis-service/README.md` 与审计对齐。详见 [`log/2026-08-21-p16-最终审计.md`](../../log/2026-08-21-p16-最终审计.md)。

**Done** — 本计划在检查点 5 停止；不把图片模式、肽图叠加或 QR 演示写成监管结论。

**完成 P16 后停止。**

> **检查点 5：P13–P16 完成后停下。**

用户在检查点 5 之后继续纠错与接入，下列步骤不覆盖 P0–P16，只追加。

### Done — P17 — 图片降级纠错

P17-1 实机跑通；P17-2 图谱库 SHA-256 映射与颜色角色；P17-3 颜色中性标签、版式、双迹检峰与配对、形状 SSIM；P17-4 基线校正后对称检峰；P17-5 轮廓相关 0.95/0.30 为图像层算法质量门。

详见 [`log/2026-08-21-p17-图片降级纠错.md`](../../log/2026-08-21-p17-图片降级纠错.md)、[`log/2026-08-22-p17-2-图谱库映射.md`](../../log/2026-08-22-p17-2-图谱库映射.md)。

### Done — P18 — 双层结论契约

`extractedFeatures.imageComparison`；法规 verdict 保持 REVIEW。驱动指标只有 correlation。

详见 [`log/2026-08-21-p18-双层结论契约.md`](../../log/2026-08-21-p18-双层结论契约.md)。

### Done — P19 — OCR 自动坐标轴校准

OCR 数字只记录、永不标可靠。无操作员两点锚点时降级为仅形状比对。

详见 [`log/2026-08-22-p19-ocr轴猜测降级.md`](../../log/2026-08-22-p19-ocr轴猜测降级.md)。

### Done — P20 — 防护性修复 F1–F5

BSA 切片禁用（仅演示夹具保留）；五个质量项目分剖面与动态 UniDec 窗；RAW/WIFF 上传拒绝；自拟数值标 `algorithmQualityGate` 且不得把 verdict 打成相似性 PASS。

详见 [`log/2026-08-21-p20-防护性修复.md`](../../log/2026-08-21-p20-防护性修复.md)。

### Done — P21 — Next.js API 代理

浏览器默认请求 `/api/analysis`，Next.js rewrite 到 8765。

详见 [`log/2026-08-22-p21-api代理.md`](../../log/2026-08-22-p21-api代理.md)。

### Done — P22 — 前端展示双层结论

法规 REVIEW 与图像层结论分栏；峰表、V2 规则条件、质量门上屏。

详见 [`log/2026-08-22-p22-双层结论展示.md`](../../log/2026-08-22-p22-双层结论展示.md)。

### Done — P23 — 计划回填与全量检查

本步已把 P17-2 / P19 / P21 / P22 写入计划与 CHANGELOG。`pytest` **102 passed / 7 deselected**；`npm run check` exit 0。

### Done — P24 — 图像层 0.95 条带保留与交互式两点校准

操作员 2026-08-22 确认保留 `IMAGE_CONSISTENT_CORRELATION = 0.95`（仍只是 `algorithmQualityGate`）。上传图上点选两点并填入印刷轴值，经 `parameters.imageCalibration` 交给已有 `build_axis_calibration`；不完整则不提交，OCR 仍不得标可靠。实机预览裂图已改为 data URL，未加载成功不得记点。

详见 [`log/2026-08-22-p24-两点校准UI.md`](../../log/2026-08-22-p24-两点校准UI.md)。

### Done — P26 — 非一级结构曲线比对演示

SEC / 酸性电荷变异体 / 远紫外 CD 主方法共用 `curve-overlay`：合成两列曲线、叠加图、Pearson 与分区面积%。verdict 固定 REVIEW。正交方法未开放。

详见 [`log/2026-08-30-p26-曲线比对演示.md`](../../log/2026-08-30-p26-曲线比对演示.md)。

---

## 六、工作规则

1. 每步开始前读取本计划。
2. 不得跳步。
3. 一次修改一个文件。
4. 保留用户未提交改动（`log/2026-08-14-s14-实机演示.md`）。
5. 不做无关重构。
6. 修改后运行自动化检查。
7. 未达验收标准不得写 Done。
8. 不得生成静态假结果。
9. 不得将合成数据标成实测。
10. 不得将图片分析标成原始数据分析。
11. 不得根据图像相似度直接判定生物类似性。
12. 不得创建 commit 或 push，除非用户明确要求。
13. PowerShell 5.1 **不支持 `&&`**，命令分隔一律用 `;`。
14. 所有 OpenMS/UniDec/Comet 输入必须复制到 **ASCII 临时工作目录**（本仓库路径含中文）。

---

## 七、进度日志

### Done — P0 当前状态与计划

已用 `python-docx` 1.2.0 + `zipfile` 实解 DOCX（6 张图逐张确认内容与所属小节），用 `openpyxl` 3.1.5 实解 V2 XLSX（Sheet3 仅 7 条规则完整、4 个一级结构项目无规则），并清点现有 61 项/184 方法与一级结构 33 条 methodId。
核实真实数据现状：工作区**无任何抗体 mzML/MGF/峰表**，仅有 UniProt P02769 序列、UniDec 官方测试谱与 6 个 OpenMS 小分子示例 mzML；确认 Docker 引擎可用、宿主已有 12 个 Dify 容器。

**修改文件**

| 类别 | 文件 |
|---|---|
| 新建 | `docs/primary-structure-analysis/implementation-plan.md`（本文件） |
| 修改 | 无（未触碰任何业务代码） |

**实际执行命令与退出码**

| 命令 | 退出码 |
|---|---|
| `git status --short` / `git log --oneline -8` | 0 |
| `python parse_docx.py`（python-docx 遍历 body + `a:blip` + zipfile media 清点） | 0 |
| `python extract_media.py`（导出 6 张图并计 SHA-256、读 PIL 尺寸） | 0 |
| `python parse_xlsx.py` / `python dump_sheet.py`（openpyxl 全量导出 Sheet2/Sheet3） | 0 |
| `python probe_items.py`（json.loads 解析生成文件，统计 8 大类与 33 条 methodId） | 0 |
| `docker --version` / `docker compose version` | 0 |
| `docker info --format …`（首次引擎未启动） | 1 |
| `docker info --format …` / `docker ps -a`（用户启动后复检） | 0 |
| Glob 全工作区搜 `*.mzML/*.mgf/*.raw/*.wiff/*.fasta` | 0 |

**测试结果**：本步不涉及代码变更，未运行 `npm run check`。事实核对全部以工具实际输出为准，无一项依据文件名推测。

**证据文件**

| 证据 | 位置 |
|---|---|
| DOCX SHA-256 | `ea5c09058fd1c0dc771b5ebf97db812d1b951649ca7b706b359f28484e1b10ec` |
| XLSX SHA-256 | `8bd6b18f08d3b9a3b99c61cdb8eeff24ceef75a54a43b9f7d14d1709b703051f` |
| 6 张图 SHA-256 前缀 | image1 `716724f3e0611ab8`、image2 `0af59e9fa451f1d4`、image3 `0a5deea046a0ab9a`、image4 `c02584a656b4cf32`、image5 `c68d866cef2c88b2`、image6 `34cf3e4d5c99f845` |
| 探针脚本与输出 | `%TEMP%\bsx_probe\`（临时目录，未入库） |
| 既有 PoC 证据 | `docs/tool-survey/evidence/run_s08.log`、`run_s08b.log`、`run_s09a.log`、`run_s09b.log`、`run_s09c.log`（均 exit 0） |

**新风险或缺口**

1. **真实抗体数据为零**（最高风险）。P7–P9 的 `raw-data-analysis` 等级在数据落地前无法真实验证，只能用 official-example + synthetic-demo 回归。已按 D1 安排 P1 输出候选清单。
2. **V2 Sheet3 规则覆盖率 7/11**。CDR 特征肽、N/C 端、游离巯基、二硫键无程序规则，直接导致 P13/P14 无法输出判定（D3 已确认接受）。
3. **UniDec 只到 L1+**，官方包内 `.out` 非权威预期输出，L2 无法建立。P7 的去卷积正确性只能靠 s09a 的 ppm 回收率自证，不能声称已对官方预期输出复现。
4. **Pyteomics 已装但零使用（L0）**。P8/P9 若依赖它，需先补 L1/L2 验证。
5. **端口冲突风险**：宿主 12 个 Dify 容器（含 nginx / postgres / redis / weaviate）已占用常用端口，P5 需先探测可用端口再定 compose。
6. **中文路径**：仓库根路径 `D:\生物类似药判别系统\生物类似药相似性分析系统` 含中文，OpenMS/UniDec/Comet C++ 内核均不支持，ASCII 工作目录是硬约束而非优化项。
7. **磁盘预算 15 GB 偏紧**：pwiz 镜像约 2 GB + 服务镜像/venv 约 2 GB 后，数据集只剩 8–10 GB，可能限制可选数据集规模。
8. **V0.1↔V2 主数据分叉**：站点现有 61 项/184 方法来自 V0.1，V2 Sheet2 有 64 行（一级结构多出 2 个 PTM 占位项）。本计划按 D4 只建 sidecar，但分叉会长期存在，需在 P2 量化。

**下一步**：P1 — 建立 DOCX 图谱与分析需求矩阵，并输出候选公开单抗数据集清单交用户选定。

---

### In progress — P1 DOCX 图谱与分析需求矩阵

已建立 6 张图 × 9 维度的完整需求矩阵，并把 33 条 methodId 唯一归并到 6 个 profile + 4 条「仅展示」；用 PRIDE REST API v3 实测筛出 3 个 CC0 单抗数据集，逐文件用 `Range` 请求核实体积与 magic bytes。
交叉比对发现 PXD063988 的 `NIST_HC` 比权威序列少一个 Glu（第 360 位，正落在 DOCX 图 5 的 `EEMTK` 肽上），据此确立「任何下载 FASTA 未经交叉比对不得当作理论序列」的工程规则。

**状态为 In progress 而非 Done 的原因**：D1 要求候选数据集清单交用户选定后才下载，用户尚未选择方案。数据集落地后本步才可闭合。

**修改文件**

| 类别 | 文件 |
|---|---|
| 新建 | `docs/primary-structure-analysis/01-figure-matrix.md` |
| 新建 | `docs/primary-structure-analysis/02-dataset-shortlist.md` |
| 修改 | 本文件（进度日志）、`log/CHANGELOG.md`、`log/2026-08-20-p1-图谱矩阵与数据集.md` |
| 业务代码 | 无 |

**实际执行命令与退出码**

| 命令 | 退出码 | 说明 |
|---|---|---|
| `python pride_probe.py` | 0 | PRIDE API v3 查询 PXD023358 + 4 组关键词检索 |
| `python pride_probe2.py` | 0 | 探测 PXD054948 / PXD063988 / PXD025299 / PXD067004；**FTP 取文件失败**（`WinError 10060`） |
| `python pride_https.py` | 0 | 改走 HTTPS：4 个小文件全文取回（HTTP 200）+ 5 个大文件 `Range` 探测（HTTP 206） |
| `python fasta_crosscheck.py` | 0 | 两个数据集的 NISTmAb 序列逐残基比对 + 声明 MW 核算 |

**测试结果**

| 检查 | 结果 |
|---|---|
| PRIDE FTP 可用性 | ❌ 阻断（`WinError 10060`）→ 下载器必须走 HTTPS |
| PRIDE HTTPS + Range | ✅ HTTP 200 / 206，支持续传 |
| mzML magic bytes | `3C 3F 78 6D 6C 20 76 65`（`<?xml ve`） |
| Thermo RAW magic bytes | `01 A1 46 00 69 00 6E 00`（UTF-16 `Fin`） |
| SCIEX WIFF magic bytes | `D0 CF 11 E0 A1 B1 1A E1`（OLE2） |
| PXD023358 CSV 实际内容 | 20 列二硫键连接肽鉴定表，含 `HC22-HC97` 等半胱氨酸配对与 `_S-S_` 连接肽序列 |
| NISTmAb 轻链交叉比对 | ✅ 两数据集完全一致（213 aa）；自算平均质量 23127.78 Da 与声明 MW **完全吻合** |
| NISTmAb 重链交叉比对 | ❌ **不一致**：450 aa vs 449 aa，第 360 位缺 Glu |
| NISTmAb 重链声明 MW 核算 | ⚠️ 自算全巯基态 49607.28 Da vs 声明 49579.26 Da，**差 +28.02 Da 未解释**（11 个 Cys 最多贡献 −10.08 Da，无法用二硫键解释） |

**证据文件**

| 证据 | 值 |
|---|---|
| `PXD023358/NISTmAb.fasta` SHA-256 | `755f3550147f04de08071823b423c3efce87e44d049daeb17ac4424f908922e7`（1,107 B） |
| `PXD063988/4ABS_DB.fasta` SHA-256 | `2173780eb353b6ca2beb7dff08dbed35f88b2a585f2457239d1c91064546aaa3`（3,431 B） |
| PXD063988 代表 mzML 实测体积 | 701,961,275 B（669 MB），在 D16 的 2 GB 上限内 |
| PXD023358 代表 RAW 实测体积 | 655,283,843 B（625 MB） |
| 探针脚本与输出 | `%TEMP%\bsx_probe\`（临时目录，未入库） |

**新风险或缺口**

1. **公开 FASTA 存在真实序列错误**（PXD063988 `NIST_HC` 缺一个 Glu）。已升级为 P7/P8 的硬性验收标准：理论序列必须交叉比对至少两个独立来源，并把残基数与声明 MW 一并核算。
2. **NISTmAb 重链声明 MW 与自算值差 +28.02 Da 尚未解释**。在 P7 建立完整质量基线前必须查清（可能是存放者工具的常数差异、或声明值对应另一变体）。**在查清之前不得把该 MW 当作理论质量基准。** 这正是 V2 Sheet3「实测质量与理论质量偏差」判定的前提。
3. **PRIDE FTP 被阻断**，`analysis-service/fixtures/download_fixtures.py` 必须实现 HTTPS + Range 续传 + SHA-256 校验，不能照抄常见的 FTP 下载范例。
4. **游离巯基无公开数据集**。Ellman 法批次数据不是质谱数据，公开库不收；P13 只能继续用 s09c 合成批次 + 用户自备 CSV。
5. **SCIEX WIFF 必须成对**（`.wiff` + `.wiff.scan`）。P6 的上传校验需要处理「多文件构成单个逻辑样本」的情形，这与单文件 mzML 的假设不同。
6. **覆盖率口径歧义**（DOCX 图 6 出现 Control / Combined / Common / Analyte / Analyte-unique 五种覆盖率）。结果契约必须显式携带口径字段，否则「99.8% 覆盖率」会被误读。

**下一步**：等用户从 [`02-dataset-shortlist.md`](./02-dataset-shortlist.md) §四 选定下载方案；同时可并行推进 P2（V0.1/V2 差异与规则清单），P2 不依赖数据集。

**用户已选定方案 B，并确认排除 PXD025299 / PXD067004。**

### Done — P1 闭合（数据集已落地并双重校验）

三个数据集全部落地：**74 个文件 / 1.74 GB**（低于原估 2.4 GB，因 D17 删去 625 MB 二硫键 RAW、D21 改用 1.04 MB 的 pwiz Thermo 样本）。加 `tessdata` 26.5 MB，`analysis-service/` 合计 **1.77 GB**，远低于 D13 的 15 GB 预算；D 盘余 40.3 GB。

| 数据集 | 文件 | 体积 | 服务的 profile |
|---|---|---|---|
| PXD023358 | 37 | 8.8 MB | 仅作理论序列来源（权威 `NISTmAb.fasta`） |
| PXD054948 | 18 | 340 MB | `intact-mass`、`peptide-map`（含 3 组 WIFF+scan 配对） |
| PXD063988 | 5 | 1.4 GB | `peptide-map`、`ms1-coverage`、`msms-sequence`（**两个现成 mzML**） |
| pwiz-thermo | 4 | 1.04 MB | P6 msconvert 验证 |

**双重校验，两层都是 0 失败**：

| 校验 | 依据 | 结果 |
|---|---|---|
| `download_fixtures.py --verify` | 我们自己在下载时记录的 SHA-256 | 全部 `[OK]`，failures 0 |
| `verify_published_checksums.py` | **投递者上传的 `checksum.txt` 中的 SHA-1** | **60 OK / 0 mismatched / 0 not listed** |

第二层是新增的，必要性在于第一层的两个数字都来自我们自己，只能证明「字节自写入以来未变」，不能证明它们就是投递者产出的字节——对需要几十次区间续传拼装的 800 MB 文件而言这个区别是实质性的。

**过程中修掉了下载器一个会静默产出损坏数据的缺陷**（短读被当成下载成功），详见 [`2026-08-20-p2b-决策补充与环境约束.md`](../../log/2026-08-20-p2b-决策补充与环境约束.md) §4A。

---

### Done — P2 V0.1/V2 差异和规则清单

派生比对证明 V2 Sheet2 一级结构区与 V0.1 生成的 `characterization-items.ts` **字段级零差异**（11 项 × 9 字段 + 2 个方法列全部逐字一致），修正了 P0 关于「13 行 vs 11 项」的分叉推断——差值来自 2 个属 PTM 大类的占位行。
Sheet3 全部 10 个非空行已逐单元格提取为 `similarity-schemes.ts`：7 条完整规则治理 21 条方法，4 项空缺一律 `RULE_NOT_DEFINED` 且结构上无法驱动判定。

**关键前置发现**：**V0.1 工作簿在整个工作区已不存在**（全盘搜 `*.xlsx/*.xls` 仅剩 V2 与一个无关文件）。`scripts/generate_data.py` 第 24 行硬编码指向它，故 `characterization-items.ts` 与 `regulatory-framework.ts` **已无法再生成**，逐字节 V0.1↔V2 差异也无法计算。这使 **D4 从「优选」变为「唯一可行」**——即使想迁移到 V2，也没有 V0.1 基线可做回归对照。

**修改文件**

| 类别 | 文件 |
|---|---|
| 新建 | `docs/primary-structure-analysis/03-v2-diff-and-rules.md` |
| 新建 | `src/data/similarity-schemes.ts`（11 个 scheme + `unmappedSheet3Rows` + 两个查找索引） |
| 新建 | `scripts/verify_similarity_schemes.mjs` |
| 新建 | `analysis-service/fixtures/manifest.json`、`download_fixtures.py`（P1 尾声，服务于 D14） |
| 修改 | `src/types/models.ts`（追加 `SimilarityScheme` 等 5 个类型，未改动任何既有类型） |
| 修改 | `package.json`（新增 `verify:schemes`，接入 `check`） |
| 修改 | `.gitignore`（fixture 数据体与 workspaces 不入库） |
| 未触碰 | **`src/data/characterization-items.ts`**（按 D4） |

**实际执行命令与退出码**

| 命令 | 退出码 |
|---|---|
| `python extract_rules.py`（openpyxl 逐单元格导出 Sheet3 全 10 行 + Sheet2） | 0 |
| `python derived_diff.py`（V2 Sheet2 vs 生成的 TS，逐字段） | 0 |
| 全盘搜索 `*.xlsx` / `*.xls` 定位 V0.1 | 0（**未找到 V0.1**） |
| `npx tsc --noEmit` | 0 |
| `node scripts/verify_similarity_schemes.mjs` | 0 |
| `npm run check`（typecheck + lint + 4 个 verify） | **0，全绿** |

**测试结果**

| 检查 | 结果 |
|---|---|
| 派生比对字段级差异 | **0**（11/11 项匹配，站点项目无一在 V2 中缺失） |
| 未匹配的 V2 行 | 2，均为 `示例占位项`（PTM 大类） |
| `verify:schemes` | 11 项 / 11 scheme；`{complete:7, partial:1, absent:3}`；治理 21 条方法；工作簿 SHA-256 **matches**；warnings 0；failures 0 |
| `verify:method-content` | 184 方法 / 33 有正文，failures 0（未受影响） |
| `verify:demo` | BSA 66398.19 Da、QR [0.7548, 1.0884] 复现（未受影响） |
| ESLint | 0 问题 |

**证据文件**

| 证据 | 值 |
|---|---|
| V2 工作簿 SHA-256（脚本实时复核） | `8bd6b18f08d3b9a3b99c61cdb8eeff24ceef75a54a43b9f7d14d1709b703051f` |
| Sheet3 合并单元格 | `B7:B8`、`B11:B12`、`D9:D10` |
| Sheet3 列错位 | row 5/6/7 的「示例原项」落在 B 列而非 A 列；row 8 的 A、B 皆空 |
| 规则治理率 | 21/33 方法 = 64% |

**新风险或缺口**

1. **V0.1 工作簿丢失**，`scripts/generate_data.py` 处于不可运行状态。建议作为独立后续任务处理（找回 V0.1，或正式迁移主数据到 V2 并更新生成脚本）。本计划不做此迁移。
2. **Sheet3 仍在人工编辑中**（列错位、`还原+酶法脱糖后后` 这类笔误、V2 文件修改时间为今日 09:08）。SHA-256 能捕获静默改动，但无法防止「改动后 SHA 一并更新而语义变了」，规则文本正确性仍需人工复核。
3. **规则治理率仅 64%**。P11 界面必须让「有规则」与「无规则」一眼可辨，否则展示性结果会被误读为判定结论。
4. **七条规则无一提供数值阈值**。K 列一致声明「无统一相似性数值限度」，界面不得把 ΔDa / Δppm / 覆盖率百分比渲染成合格线。
5. 英文为机器翻译占位，与站点既有约定一致，未经专业校对。

**下一步**：P3 — 建立 `src/data/method-analysis-config.ts`，覆盖一级结构全部 33 条方法，标注可分析 / 仅展示 / 尚未支持 / 被工具阻塞，并把 P1 的 6 个 profile 归属定死。

---

### Done — P17 图片降级纠错

颜色中性标签、镜像/堆叠版式、双迹检峰与基线校正；图像层只用轮廓相关。P17-2：六张库图按 SHA-256 映射，Fab/Fc 排除。

### Done — P18 双层结论契约

图片路径增加 `imageComparison`；法规 verdict 保持 REVIEW。

### Done — P19 OCR 轴猜测降级

OCR 数字不作为可靠校准。

### Done — P20 防护性修复 F1–F5

任意 FASTA 不再被切成 BSA；五个质量项目分剖面；RAW/WIFF 上传拒绝；自拟阈值不得触发相似性 PASS。

### Done — P21 Next.js API 代理

浏览器默认走 `/api/analysis`。

### Done — P22 前端双层结论

法规判定与图像层观察分栏；V2 规则条件与质量门上屏。

### Done — P24 图像层 0.95 保留与两点校准 UI

操作员确认保留 0.95 CONSISTENT 条带。上传区可点选两点并提交 `imageCalibration`。

**检查**：`pytest tests/test_image_fallback.py tests/test_image_fallback_adapter.py` 21 passed；`npm run check` exit 0。

### Done — P26 非一级结构曲线比对演示

SEC、酸性电荷变异体、远紫外 CD 主方法可在网页跑合成曲线叠加。法规判定固定 REVIEW。

**检查**：`pytest` 110 passed / 7 deselected；`npm run check` exit 0。
