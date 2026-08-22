# P1 — 公开单抗数据集候选清单（待用户选定）

> 上游：[`implementation-plan.md`](./implementation-plan.md) §P1、决策 **D1**（先列清单，用户选定后才下载）
> 查询方式：PRIDE Archive REST API v3（`https://www.ebi.ac.uk/pride/ws/archive/v3`），2026-08-20
> 文件体积与格式**逐个实测**：对每个候选文件发 `Range: bytes=0-1023` 请求，读取 `Content-Range` 总长度与 magic bytes，**未下载完整文件**
> 约束：**磁盘总增量 ≤ 15 GB**（D13），其中数据集预算约 8–10 GB

---

## 一、网络与访问方式（已实测）

| 项 | 结果 |
|---|---|
| PRIDE FTP（`ftp://ftp.pride.ebi.ac.uk`） | ❌ **被网络阻断**（`WinError 10060` 连接超时） |
| PRIDE HTTPS（`https://ftp.pride.ebi.ac.uk/pride/data/archive/...`） | ✅ **可用**，HTTP 200 / 206，支持 `Range` 断点续传 |

**结论：下载脚本必须走 HTTPS 并支持 Range 续传，不得依赖 FTP。**

实测 magic bytes（直接用于 P6 的文件类型校验，不依赖扩展名）：

| 格式 | magic bytes | 说明 |
|---|---|---|
| mzML | `3C 3F 78 6D 6C 20 76 65`（`<?xml ve`） | 纯 XML，需防 XXE |
| Thermo RAW | `01 A1 46 00 69 00 6E 00`（`\x01\xa1F\0i\0n\0`） | UTF-16 `Fin`(nigan) 签名 |
| SCIEX WIFF | `D0 CF 11 E0 A1 B1 1A E1` | OLE2 复合文档；**必须与同名 `.wiff.scan` 配对**，单独 wiff 无谱数据 |
| XLSX | `50 4B 03 04`（`PK\x03\x04`） | ZIP 容器 |

---

## 二、候选清单

全部为 **CC0（Creative Commons Public Domain）** 许可，无使用限制。

### 候选 1 ★★★ — PXD023358

| 项 | 值 |
|---|---|
| 标题 | Comprehensive Analysis of Tryptic Peptides Arising from Disulfide Linkages in NISTmAb |
| 品种 | **NISTmAb（RM 8671）** 人源化 IgG1κ 参考物质 |
| 实验类型 | 部分还原 / 非还原胰酶消化 nanoLC-MS/MS（**二硫键连接肽**） |
| 仪器 | Orbitrap Fusion Lumos、Q Exactive |
| 许可 | CC0 |
| 发布 | 2021-02-08 |
| 文献 | Dong Q 等, *J Proteome Res* 2021;20(3):1612-1629 |
| 全集 | 75 文件 / **28.1 GB** |
| 文件构成 | 36×`.raw`（28.1 GB，单个约 625 MB）、36×`.csv`（**8.8 MB**，单个约 75 KB）、`NISTmAb.fasta`（1,107 B）、`checksum.txt`（14 KB，官方 SHA-1 清单） |

**CSV 内容已实测**（不是靠描述推断），列头为：

```
RUNID  PROTID  SPOS  CLASS  DSB  CYS  CLEV  Z  SEQ  MODS  NCE
MASS  CLUNUM  MZ  MZDIFF  CLURTH  CLUAB  SCANNUM  SCMZSAMP  SCMS2RT
```

实测数据行示例：

```
71  1  6    Exp  VH   HC22-HC97    0  5  ESGPALVKPTQTLTLTCTFSGFSLSTAGMSVGWIR_S-S_VTNMDPADTATYYCAR  unm  24  5431.588  ...  1087.325  2.300  122.760  ...
71  1  137  Exp  CH1  HC147-HC203  0  5  STSGGTAALGCLVK_S-S_DYFPEPVTVSWNSGALTSGVHTFPAVLQSSGLYSLSSVVTVPSSSLGTQTYICNVNHKPSNTK  unm  24  7916.919  ...
```

即 **真实的二硫键连接肽鉴定表**：含结构域归属（VH / CH1）、**半胱氨酸配对（`HC22-HC97`、`HC147-HC203`）**、`_S-S_` 连接肽序列、电荷、实测质量、m/z、质量偏差、保留时间、丰度、扫描号。

`NISTmAb.fasta` 内容已实测：重链 450 aa（`MW=49579.26 PI=8.49`）、轻链 213 aa（`MW=23127.78 PI=7.76`）、猪胰蛋白酶污染物 231 aa。SHA-256 `755f3550147f04de08071823b423c3efce87e44d049daeb17ac4424f908922e7`。

**可解决的问题**

| 用途 | 说明 |
|---|---|
| **P14 二硫键（唯一真实数据源）** | 36 个连接肽鉴定表可直接驱动「预期连接肽 / 实际连接肽 / 预期连接覆盖 / 异常连接 / 未配对半胱氨酸」，把 `disulfide-map` 从 `Blocked` 提升到 `structured-export-analysis` |
| P9 MS/MS | RAW 转 mzML 后可作搜库输入 |
| P6 RAW 转换验证 | 下 1 个 RAW（约 625 MB）即可实机验证 pwiz 容器 |
| 全流程 FASTA fixture | NISTmAb 权威序列 |
| SHA-256 溯源 | 官方 `checksum.txt` 提供 SHA-1 对照 |

**建议下载**：`NISTmAb.fasta` + `checksum.txt` + 全部 36 个 CSV + **1 个 RAW** ≈ **635 MB**

---

### 候选 2 ★★★ — PXD054948

| 项 | 值 |
|---|---|
| 标题 | Multi-level – Intact, Subunits, and Peptides – Characterization of Antibody-Based Therapeutics by a Single-Column LC-MS setup |
| 品种 | **NISTmAb**、**Enbrel（依那西普）**、RG7221 等 |
| 实验类型 | **完整 / 亚基（middle-up、middle-down）/ 肽 三层表征** |
| 仪器 | SCIEX ZenoTOF 7600 |
| 许可 | CC0 |
| 发布 | 2025-02-26 |
| 全集 | 49 文件 / **1.3 GB** |
| 文件构成 | 15×`.wiff`（40.5 MB）、15×`.wiff.scan`（1.2 GB）、12×`.xlsx` 结果表（1.1 MB）、6×`.rtf` 报告（106 MB）、`checksum.txt` |

**为什么对口**：这是 **DOCX 图 2 的完全对应场景**（完整 mAb / 还原 LC / 还原 HC / 脱糖 HC / Fc / Fab 多层质量）。而且含 **Enbrel（依那西普）**——正是站点现有参考案例 GP2015（Sandoz 依那西普，BLA 761042）的原研药，可与 `reference-cases` 形成呼应。

实测体积（最小的一对）：`20230110_Enbrel-desialylated_25ng.wiff` = **115,200 B**，配对的 `.wiff.scan` = **7,313,233 B**。`NISTmAb_SubUnitAnalysis_Results.xlsx` = **92,943 B**。

**可解决的问题**

| 用途 | 说明 |
|---|---|
| **P7 完整/亚基质量（真实数据）** | 完整 + 亚基两层，直接对应 5 个质量 itemId |
| P6 WIFF 转换验证 | wiff/.scan 配对转换是 pwiz 的另一条路径 |
| 结构化导出层 | 12 个 xlsx 结果表（亚基分析结果、肽段结果）可直接作 `exported-table` 输入 |

**建议下载**：12 个 xlsx（1.1 MB）+ 2–3 对小 wiff/.wiff.scan ≈ **25 MB**（可选再加 1 对大的 RG7221 IdeS-DTT，302 MB）

---

### 候选 3 ★★★ — PXD063988

| 项 | 值 |
|---|---|
| 标题 | Deep Coverage and Extended Sequence Reads Obtained with a Single Archaeal Protease Expedite de novo Protein Sequencing by Mass Spectrometry |
| 品种 | **NISTmAb、Trastuzumab、Cetuximab** + 患者来源抗体 |
| 实验类型 | 多蛋白酶（trypsin / chymotrypsin / 古菌蛋白酶）+ 混合碎裂（EAD / EAciD / CID）**bottom-up 肽图与 de novo 测序**，专门针对 **CDR 高变区覆盖** |
| 仪器 | SCIEX ZenoTOF 7600 |
| 许可 | CC0 |
| 发布 | 2026-03-17 |
| 文献 | Pérez Pañeda L 等, *Cell Syst* 2026:101536 |
| 全集 | 151 文件 / **62.6 GB** |
| 文件构成 | **36×`.mzML`（29.8 GB，单个 669–760 MB）**、36×`.wiff`+36×`.wiff.scan`+36×`.wiff2`、`Byonic_search.zip`（17.0 GB）、`Peaks.zip`（38.5 MB）、2×`.csv` 肽段定量表（2.2 MB）、`4ABS_DB.fasta`（3,431 B）、`checksum.txt` |

**为什么对口**：**这是唯一提供现成 mzML 的抗体数据集**——无需转换即可直接进入 `raw-data-analysis` 等级。且论文核心正是解决 **CDR 区覆盖稀疏**问题，直接对应 `cdr-signature-peptides` 与 `ms1-sequence-coverage` / `msms-sequence-coverage`。

实测：`20241115_Z1_UM1_shamo002_EXT00_SA_TRYPSIN_EACID_RCE_KE9_100ng_03.mzML` = **701,961,275 B（669 MB）**，magic `<?xml ve`。在 D16 的 mzML 2 GB 上限内。

`4ABS_DB.fasta` 内容已实测，含 9 条序列：Keratin（污染物）、Cetuximab_HC/LC、**Trastuzumab_HC/LC**、NIST_HC/LC、患者抗体 HC/LC。SHA-256 `2173780eb353b6ca2beb7dff08dbed35f88b2a585f2457239d1c91064546aaa3`。

> ⚠️ **实测发现的序列缺陷（重要）**
> 本数据集的 `NIST_HC` 只有 **449** 个残基，而 PXD023358 的权威 `NISTmAb.fasta` 重链为 **450** 个残基。
> 交叉比对定位到**第 360 位缺失一个 Glu**：
>
> ```
> PXD023358（权威）: …SKAKGQPREPQVYTLPPSREEMTKNQVSLTCLVK…
> PXD063988（缺陷）: …SKAKGQPREPQVYTLPPSRE MTKNQVSLTCLVK…
>                                        ↑ 少一个 E
> ```
>
> 缺失位置恰好落在 **DOCX 图 5 的 HT35 肽 `EEMTK`** 上。轻链两者完全一致（213 aa）。
>
> **处置：NISTmAb 的理论序列一律采用 PXD023358 的 `NISTmAb.fasta`；PXD063988 的 `4ABS_DB.fasta` 只用于取 Trastuzumab/Cetuximab 序列，且必须与独立来源交叉核对后才可使用。**
> 这条发现直接确立一条工程规则：**任何下载的 FASTA 都不得未经交叉比对即当作理论序列。** 已写入 P7/P8 验收标准。

**建议下载**：`4ABS_DB.fasta` + `checksum.txt` + 2 个 CSV（2.2 MB）+ **1 个 mzML**（669 MB）≈ **672 MB**；若需候选/参照双样本对比则下 2 个 mzML ≈ **1.4 GB**

---

### 候选 4 ☆ — PXD025299（**建议排除**）

| 项 | 值 |
|---|---|
| 标题 | Semi-automated Glycoproteomic Data Analysis of LC-MS data using GlycopeptideGraphMS |
| 品种 | **Trastuzumab、Adalimumab**、IgG |
| 许可 | CC0 |
| 全集 | 7 文件 / **17.8 GB** |
| 文件构成 | 6×**`.uep`（17.8 GB）**、`Results.zip`（229.5 KB） |

**排除理由**：`.uep` 是 Waters UNIFI 专有工程包，**ProteoWizard msconvert 不支持**，无开源读取路径。品种虽最对口（曲妥珠单抗 + 阿达木单抗），但数据不可用。仅 `Results.zip`（229.5 KB）可能含可读结果，价值有限。

---

### 候选 5 ☆ — PXD067004（**本轮建议排除**）

| 项 | 值 |
|---|---|
| 标题 | Quantitative Host Cell Protein Analysis across Innovator Monoclonal Antibody-Based Protein Therapeutics using the Orbitrap Astral |
| 品种 | Trastuzumab **Biosimilar**、Avastin、Enbrel、Eylea、Entyvio、RoActemra 等 |
| 许可 | CC0 |
| 全集 | 314 文件 / **1.4 TB**（234 RAW = 829.5 GB；39 mzML = 554.5 GB，单个 7.6–16.6 GB） |

**排除理由**：① 主题是 **HCP 宿主细胞蛋白残留**，属「工艺相关杂质」大类，不是一级结构；② 单个 mzML 达 7.6–16.6 GB，**超出 D16 的 2 GB 上限与 15 GB 磁盘预算**。
但 39 个 `.mzid`（292.9 MB，单个 3–8 MB）在将来做「工艺相关杂质」大类时是好材料，已记录备查。

---

## 三、覆盖度检查

| 工作流 | 候选 1（PXD023358） | 候选 2（PXD054948） | 候选 3（PXD063988） |
|---|---|---|---|
| A 完整/亚基质量 | — | ✅ 完整 + 亚基（wiff→mzML） | — |
| B LC-MS 肽图 | ✅（RAW→mzML） | ✅（xlsx 肽段结果） | ✅ **现成 mzML** |
| C MS1 覆盖率 | ✅（CSV + FASTA） | ✅（xlsx） | ✅ **现成 mzML + CSV + FASTA** |
| D MS/MS 序列 | ✅（RAW→mzML） | ✅ | ✅ **现成 mzML** |
| CDR 特征肽 | — | — | ✅ **论文核心即 CDR 覆盖** |
| E 游离巯基 | — | — | — |
| F 二硫键 | ✅ **唯一真实数据源** | — | — |

**三者合选可覆盖 A/B/C/D + CDR + 二硫键，共 6 类。**
`free-thiol` 无公开数据集（Ellman 法批次数据不属于质谱数据，通常只在审评报告中以统计表形式出现）→ P13 继续使用 s09c 合成批次 + 允许用户上传真实 CSV。

---

## 四、推荐下载方案

| 方案 | 内容 | 体积 | 覆盖 |
|---|---|---|---|
| **A 精简（推荐）** | 三个数据集的全部小文件（FASTA / checksum / CSV / xlsx）+ 每个数据集 1 个代表性大文件（PXD023358 一个 RAW 625 MB、PXD054948 三对小 wiff 约 25 MB、PXD063988 一个 mzML 669 MB） | ≈ **1.35 GB** | A/B/C/D + CDR + 二硫键全覆盖 |
| **B 加强** | 方案 A + PXD063988 第二个 mzML（做候选/参照头对头）+ PXD054948 的 RG7221 IdeS-DTT 大文件对（302 MB） | ≈ **2.4 GB** | 增加真实「头对头」双样本对比能力 |
| **C 完整** | 三个数据集的**完整**下载 | ≈ **92 GB** | **超出 15 GB 预算，不可行** |

两种方案都远低于 8–10 GB 的数据集预算，留有余量。

---

## 五、待用户确认的事项

1. 选择方案 **A** 还是 **B**（或指定其他组合）。
2. 是否确认排除 PXD025299（`.uep` 不可读）与 PXD067004（1.4 TB / 主题为 HCP）。
3. 是否需要额外寻找 **游离巯基（Ellman 法）批次数据**——目前只能靠合成数据或用户自备 CSV。
4. 下载脚本入库（`analysis-service/fixtures/download_fixtures.py` + `manifest.json`），数据本体加入 `.gitignore`（D14）。
