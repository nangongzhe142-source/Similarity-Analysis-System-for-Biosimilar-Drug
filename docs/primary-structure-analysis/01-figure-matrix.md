# P1 — DOCX 图谱与分析需求矩阵

> 上游：[`implementation-plan.md`](./implementation-plan.md) §P1
> 资料：`生物类似药评价指导原则/生物类似药药学评价比较.docx`
> SHA-256 `ea5c09058fd1c0dc771b5ebf97db812d1b951649ca7b706b359f28484e1b10ec`（1,100,522 字节）
> 解析工具：python-docx 1.2.0（body 遍历 + `a:blip` 内嵌图定位）、zipfile（`word/media/` 核对）、Pillow（尺寸/模式）

DOCX 第 5.1.1 节共 **6 张图**，全部为文献截图。**它们定义的是本系统必须支持的「结果展示类型」，而不是唯一输入。**
每张图都必须能由两条路径驱动：优先由结构化数据/仪器数据计算得出（`raw-data-analysis` / `structured-export-analysis`），退化时才由图片本身辅助分析（`image-only-exploratory`）。

---

## 一、总矩阵

| # | DOCX 小节 | 图谱类型 | 底层数据类型 | profile | itemId | 推荐工具 | 核心分析指标 | 图片降级方式 | 科学边界 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 5.1.1.1 完整分子量 | 去卷积完整质量**镜像谱**（红=原研 / 蓝=类似药，上下镜像） | 去卷积质量谱（Mass, Intensity 二维数组）；上游为原始 m/z 谱 | `intact-mass` | `intact-mass` | pyOpenMS 3.5.0（mzML 读取、理论质量）、UniDec 8.2.1（多电荷去卷积）、NumPy/SciPy（峰匹配） | 去卷积质量峰、主要峰 Da、相对强度、峰归属、候选/参照峰配对、ΔDa、Δppm、候选新增峰、候选缺失峰、无法解释的新分子形式 | 曲线按颜色（红/蓝）分离 → 峰检测 → 手动两点 Mass 轴校准 → SSIM/相关/DTW | **ΔDa/Δppm 属于方法质量准确度，不是生物类似性阈值。** 不得输出「相差 X Da 即相似」 |
| 2 | 5.1.1.2 酶切肽图 + 六层质量 | (a) 胰酶肽图色谱；(b) 完整 mAb、(c) 还原 LC、(d) 还原 HC、(e) 还原+脱糖 HC、(f) Fc、(g) Fab 的 MS 谱 | 原始 m/z 谱 + LC 色谱 | `intact-mass` + `peptide-map` | `intact-mass`、`deglycosylated-intact-mass`、`light-chain-mass`、`non-deglycosylated-heavy-chain-mass`、`deglycosylated-heavy-chain-mass` | 同 #1；亚基层额外需要 IdeS/还原/PNGase F 处理参数记录 | 各亚基去卷积质量、糖型峰归属、亚基间相互印证 | 多子图需先切分绘图区，再逐子图独立校准 | 亚基结果必须与完整质量**相互印证**；单一亚基一致不足以支持整体一级结构一致 |
| 3 | 5.1.1.3 序列覆盖率/一级质谱 | LC-MS 肽图 **TIC 镜像图** +（B）32.0–35.0 min 电荷归约/同位素去卷积局部放大 | LC-MS 色谱（RT, Intensity）；上游为 mzML | `peptide-map` | `ms1-sequence-coverage`（+ 5 个质量项目的 `*-orthogonal-1` 肽图正交） | pyOpenMS（TIC/BPC 提取）、Pyteomics、SciPy（对齐/DTW）、NumPy | TIC/BPC、保留时间、峰面积/相对强度、色谱对齐、主要峰匹配、RT 偏移、候选独有峰、参照独有峰、局部差异区间、相关系数、DTW 距离 | 曲线提取 + 手动两点 RT 轴校准 → 镜像/叠加/差异图 + SSIM/相关/DTW | **仅凭肽图图片不得声称序列已经确认。** 色谱相似只是「图谱相似」层级证据 |
| 4 | 5.1.1.3 肽段表 | Table 1：CT-P13 vs RMP LC-ESI-MS 肽段表（Peptide No. / Amino Acid No. / Theoretical Mass (Da) / Observed Mass (Da) / RT (min)，两组各列） | **肽段鉴定表 / 峰表**（CSV/TSV 可直接表达） | `ms1-coverage` | `ms1-sequence-coverage`、`cdr-signature-peptides`、`n-c-terminal-sequence` | pyOpenMS（理论酶切）、Pyteomics、NumPy | 理论酶切肽段、匹配肽段、未匹配肽段、序列覆盖率、未覆盖区域、CDR 覆盖、N/C 端覆盖、质量误差（Δppm） | OCR 表格 → 结构化行（**必须人工确认**，OCR 未确认时不进入数值计算） | **MS1 质量匹配只能支持「可能对应该肽段」，不能替代 MS/MS 序列确认。关键区域仅有 MS1 证据时状态为 `REVIEW`。** 表中大量 `N/D`（三肽等未检出）说明覆盖率必须报告未覆盖区域而非只报百分比 |
| 5 | 5.1.1.4 序列覆盖率/二级质谱 | HT35 肽的电荷归约/同位素去卷积 **MSᴱ 碎片谱**：(A) innovator `EEMTK`；(B) biosimilar `DELTK`；y 红 / b 蓝 / 失水失氨绿 / 未归属灰 | MS/MS 碎片谱（碎片 m/z, intensity + b/y 归属）；上游为 mzML/MGF | `msms-sequence` | `msms-sequence-coverage`、`cdr-signature-peptides`、`n-c-terminal-sequence`、`free-thiol-orthogonal-1`、`disulfide-bonds-primary-1` | Comet（待 P9 实机验证）、pyOpenMS、Pyteomics（理论 b/y 计算与标注） | 前体离子、碎片峰、b/y 匹配、PSM、质量误差、FDR、确认肽段、未确认肽段、覆盖率、CDR 确认、N/C 端确认、候选与参照差异位点 | 棒状峰提取 + 手动两点 m/z 轴校准；标注文字 OCR 需人工确认 | **未建立可靠搜索与 FDR 控制前，不得声称序列已确认。** 本图正是「真实序列差异」的范例（`EEMTK`→`DELTK`，双残基替换），说明系统必须能区分「图谱相似」与「序列一致」 |
| 6 | 5.1.1.4 覆盖图 | Trastuzumab-Probiomed **MS/MS 序列覆盖图**：LC 99.5% / HC 99.8%；按 50 残基分行，覆盖残基灰底；含 Control/Combined/Analyte/Common/Analyte-unique 五种覆盖率 | 序列覆盖表（残基级布尔覆盖 + 覆盖率百分比） | `msms-sequence` | `msms-sequence-coverage` | 同 #5 + 前端序列覆盖渲染 | 残基级覆盖、覆盖率%、未覆盖区段、CDR 区确认、N/C 端确认 | OCR 序列块 → 灰底像素判定覆盖（**低可靠，仅作提示**） | 覆盖率数字本身**不是**合格判据：V2 Sheet3 明确「无序列覆盖率的统一合格判定阈值」。本图 Analyte coverage 0.0% 说明覆盖率必须区分「Control/Analyte/Combined」口径，不得混报 |

---

## 二、按 profile 归并的方法归属（P3 将据此定死，每个 methodId 唯一 profile）

| profile | 覆盖 methodId | 数量 |
|---|---|---|
| `intact-mass` | `intact-mass-primary-1`、`intact-mass-orthogonal-2`、`deglycosylated-intact-mass-primary-1`、`deglycosylated-intact-mass-orthogonal-2`、`light-chain-mass-primary-1`、`light-chain-mass-orthogonal-2`、`non-deglycosylated-heavy-chain-mass-primary-1`、`non-deglycosylated-heavy-chain-mass-orthogonal-2`、`deglycosylated-heavy-chain-mass-primary-1`、`deglycosylated-heavy-chain-mass-orthogonal-2`、`n-c-terminal-sequence-orthogonal-1` | 11 |
| `peptide-map` | `intact-mass-orthogonal-1`、`deglycosylated-intact-mass-orthogonal-1`、`light-chain-mass-orthogonal-1`、`non-deglycosylated-heavy-chain-mass-orthogonal-1`、`deglycosylated-heavy-chain-mass-orthogonal-1`、`ms1-sequence-coverage-orthogonal-2` | 6 |
| `ms1-coverage` | `ms1-sequence-coverage-primary-1`、`ms1-sequence-coverage-orthogonal-1` | 2 |
| `msms-sequence` | `msms-sequence-coverage-primary-1`、`msms-sequence-coverage-orthogonal-1`、`cdr-signature-peptides-primary-1`、`cdr-signature-peptides-orthogonal-1`、`cdr-signature-peptides-orthogonal-2`、`n-c-terminal-sequence-primary-1`、`free-thiol-orthogonal-1`、`disulfide-bonds-primary-1` | 8 |
| `free-thiol` | `free-thiol-primary-1` | 1 |
| `disulfide-map` | `disulfide-bonds-orthogonal-1` | 1 |
| **无分析 profile（仅展示）** | `msms-sequence-coverage-orthogonal-2`（端基分析）、`n-c-terminal-sequence-primary-2`（Edman 降解）、`free-thiol-orthogonal-2`、`disulfide-bonds-orthogonal-2`（还原/非还原 CE-SDS） | 4 |
| **合计** | | **33** |

「仅展示」的 4 条方法理由：Edman 降解与 CE-SDS 是仪器/湿实验方法，其输出不是本系统能接收的质谱数据格式，无软件可分析路径。这与 S16 记录的 6 条「有原理、无演示」方法一致（另 2 条 `disulfide-bonds-primary-1`、`disulfide-bonds-orthogonal-1` 在本计划中获得了分析路径）。

> **P3 已据此定死，但有 3 处偏离本表，以 [`src/data/method-analysis-config.ts`](../../src/data/method-analysis-config.ts) 为准：**
>
> 1. **`free-thiol` 与 `disulfide-map` 两个 profile 取消**。它们只服务于无 Sheet3 规则的项目，按 **D17** 这些项目不运行分析，profile 无存在意义。P3 只保留 4 个 profile。上表末行「另 2 条获得了分析路径」的判断因此被 D17 推翻。
> 2. **`ms1-sequence-coverage-orthogonal-2`（增加其他蛋白酶）从 `peptide-map` 改为 `ms1-coverage`**。换酶后做的仍是 MS1 肽段质量匹配与覆盖率合并，而不是色谱镜像比对；本表原归 `peptide-map` 与同性质的 `msms-sequence-coverage-orthogonal-1`（不同酶切策略，归 `msms-sequence`）自相矛盾。
> 3. **`ms1-sequence-coverage-orthogonal-1`（LC-MS/MS）归 `msms-sequence` 并随之被 Comet 阻塞**。本表未单独列出该条的工具依赖。

---

## 三、每类图谱的底层数据需求（输入契约）

| profile | 必需输入 | 可选输入 | 优先级顺序 |
|---|---|---|---|
| `intact-mass` | 候选药谱 + 参照药谱（或内置参考） | 理论序列 FASTA 或理论质量、糖型列表、电荷范围、质量范围、峰宽 | ① mzML/mzXML ② m/z-intensity TXT/CSV ③ UniDec 文本谱 ④ PNG/JPEG（降级） |
| `peptide-map` | 候选药 + 参照药 LC-MS 数据 | RT 窗口、对齐方法、平滑参数 | ① mzML ② LC-MS 峰表 CSV/TSV ③ 肽段鉴定表 ④ PNG/JPEG（降级） |
| `ms1-coverage` | **理论蛋白序列 FASTA（必需）** + MS1 数据或峰表 | 酶切规则、漏切数、固定修饰、可变修饰、质量容差、电荷范围、CDR 区间定义 | ① mzML ② MS1 峰表 ③ 肽段鉴定表 ④ 图片（仅辅助显示） |
| `msms-sequence` | **FASTA（必需）** + MS/MS 数据 | 前体容差、碎片容差、离子类型、FDR 阈值、酶、修饰 | ① mzML ② MGF ③ MS/MS 峰表 ④ PSM/鉴定结果表 ⑤ PNG/JPEG（降级） |
| `free-thiol` | 参照药批次 CSV（mol SH/mol protein）+ 候选药批次 CSV | X 倍数（σ 系数）、落入比例阈值 | ① CSV/TSV 批次表（无其他路径） |
| `disulfide-map` | 非还原肽图数据 + 理论二硫键连接 + FASTA | 连接肽搜索参数 | ① mzML/MGF ② 肽段鉴定结果表（含 `_S-S_` 连接肽） |

---

## 四、图片降级模式的统一约束

任何 profile 都可接收 PNG/JPEG/WebP，但**只能**作为降级模式。

处理链：绘图区裁剪 → 坐标轴 OCR（Tesseract，**结果必须人工确认**）→ 手动两点坐标校准 → 曲线颜色分离 / 棒状峰提取 → 镜像叠加 → SSIM / 相关系数 / DTW / 差异热图。

```
if not calibrationReliable:
    ├─ 不输出精确 m/z、Da、保留时间
    ├─ 只输出归一化像素坐标
    ├─ evidenceLevel = "image-only-exploratory"
    ├─ 状态仅限：图像特征接近 / 检出图像差异 / 需人工复核
    └─ 不得输出生物类似性 PASS/FAIL
```

`calibrationReliable = true` 的**唯一**来源是用户确认过的两点校准。OCR 只提供初值猜测。

---

## 五、DOCX 判定类型与本系统 verdict 的对应

DOCX §2 定义五种基本判定类型，§4 定义四种判定结果。一级结构涉及前两种类型：

| DOCX 判定类型 | 涉及 profile | 本系统 `AnalysisVerdict` 映射 |
|---|---|---|
| 2.1 身份/结构一致 | `intact-mass`、`ms1-coverage`、`msms-sequence`、`disulfide-map` | 一致 → `SUPPORTED_BY_THIS_ATTRIBUTE`；关键结构差异 → `DIFFERENCE_DETECTED` |
| 2.2 图谱/构象相似 | `intact-mass`、`peptide-map` | 图谱高度相似无异常新特征 → `SUPPORTED_BY_THIS_ATTRIBUTE`；出现新峰 → `REVIEW` |
| 2.3 定量分布（QR） | `free-thiol` | **Sheet3 未定义规则 → `RULE_NOT_DEFINED`**（见 D3） |

DOCX §4 的四种结果（4.1 支持相似性 / 4.2 存在差异但初步可接受 / 4.3 需进一步评价 / 4.4 不支持相似性）是**单项质量属性层面的评价**，不是全局生物类似性结论。本系统的 `verdict` 命名刻意使用 `SUPPORTED_BY_THIS_ATTRIBUTE` 而非 `SIMILAR`，以避免读者把单项结果误读为整体结论。

DOCX §3 强调的边界同样是硬约束：**必须区分「方法学性能标准」「产品质量标准」「法规安全限度」与「生物类似药相似性判定边界」，不得混用。** 这直接对应 V2 Sheet3 中反复出现的「无统一相似性数值限度；实测质量与理论质量偏差应符合方法特异预设的质量准确度标准」。

---

## 六、本矩阵暴露的能力缺口

| 缺口 | 影响 profile | 处置 |
|---|---|---|
| 无抗体真实 mzML/MGF/峰表（工作区） | 全部 | P1 输出候选数据集清单（见 [`02-dataset-shortlist.md`](./02-dataset-shortlist.md)） |
| 厂商 RAW/WIFF 无法直接读取 | `intact-mass`、`peptide-map`、`msms-sequence` | P6 用 pwiz 容器转 mzML，实机跑通才标已支持 |
| 无搜库引擎与 FDR 控制 | `msms-sequence` | P9 实机验证 Comet；跑不通即 Blocked |
| 无二硫键搜索工具 | `disulfide-map` | P14；但 PXD023358 的连接肽鉴定表可支撑 `structured-export-analysis` 层级 |
| Sheet3 未定义规则 | `msms-sequence`（CDR/N-C 端部分）、`free-thiol`、`disulfide-map` | 一律 `RULE_NOT_DEFINED`（D2/D3） |
| 覆盖率口径歧义（Control / Analyte / Combined / Common / Analyte-unique，见图 6） | `ms1-coverage`、`msms-sequence` | 结果契约必须显式携带覆盖率口径字段，不得只报一个百分比 |
