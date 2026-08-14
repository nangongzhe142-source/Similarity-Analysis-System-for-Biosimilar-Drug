# 一级结构（Primary Structure）— 开源工具调研与可行性证明

> **免责声明（贯穿全文）**
> - 「工具能运行」≠「方法学已验证」≠「符合 GxP / 21 CFR Part 11」；
> - 「两组数据数值接近」≠「生物类似性成立」。
> - 本文中所有工具的「实际部署层级」均为本机实测结果，未实测的一律标 `L0（未验证）`。
> - 本文不产出任何可用于监管申报的结论。

调研日期：2026-08-14
执行计划：[`implementation-plan.md`](./implementation-plan.md)

---

## 1. 分析点清单

来源 `src/data/characterization-items.ts`，`category: "primary-structure"`，共 11 项 / 33 条方法条目，均为常规项。

| # | id | 项目名 | 行号 | 首选方法 | 检测指标 | 判定方式 | 数值限度 |
|---|---|---|---|---|---|---|---|
| 1 | `intact-mass` | 完整分子质量 | 11 | LC-ESI-MS（高分辨 QTOF/Orbitrap） | 去卷积完整质量(Da)、主要质量峰、峰型 | 定性/图谱＋理论质量核对 | 无通用限度 |
| 2 | `deglycosylated-intact-mass` | 脱糖完整分子质量 | 98 | 酶法脱糖后 LC-ESI-MS | 脱糖完整质量(Da) | 定性/图谱＋理论质量核对 | 无通用限度 |
| 3 | `light-chain-mass` | 轻链分子质量 | 185 | 还原/亚基 LC-MS | 轻链质量(Da) | 定性/图谱＋理论质量核对 | 无通用限度 |
| 4 | `non-deglycosylated-heavy-chain-mass` | 未脱糖重链分子质量 | 272 | 还原后重链 LC-MS | 重链质量分布(Da) | 定性/图谱＋理论质量核对 | 无通用限度 |
| 5 | `deglycosylated-heavy-chain-mass` | 脱糖重链分子质量 | 359 | 脱糖并还原后 LC-MS | 脱糖重链质量(Da) | 定性/图谱＋理论质量核对 | 无通用限度 |
| 6 | `ms1-sequence-coverage` | MS1 肽质量覆盖率 | 446 | 酶切肽图 LC-MS（MS1） | 覆盖率%、匹配肽段、肽图 | 定性序列支持＋覆盖率描述 | 无通用限度 |
| 7 | `msms-sequence-coverage` | MS/MS 序列确认覆盖率 | 533 | 肽图 LC-MS/MS | MS/MS 确认覆盖率、碎片离子谱、修饰位点 | 直接序列比对 | 原则上序列一致 |
| 8 | `cdr-signature-peptides` | CDR 区特征肽确认 | 820 | 靶向肽图 LC-MS/MS | CDR 特征肽保留时间、质量、MS/MS 序列 | 直接定性比对 | 不适用（定性） |
| 9 | `n-c-terminal-sequence` | N/C 端序列及末端异质性 | 907 | 肽图 LC-MS/MS；必要时 Edman 降解 | 端基序列、焦谷氨酸化、C 端 Lys 比例 | 定性序列＋定量分布 | 序列定性；异质体比例→QR |
| 10 | `free-thiol` | 游离巯基水平 | 994 | Ellman 试剂法或荧光巯基法 | mol SH/mol protein | 定量 QR/实际范围 | **QR=(μR−XσR, μR+XσR)，≥90% 批次落入** |
| 11 | `disulfide-bonds` | 二硫键连接图谱 | 1081 | 非还原肽图 LC-MS/MS | 连接肽、预期连接覆盖、异常连接 | 直接定性比对 | 不适用（预期连接一致即可） |

### 1.1 技术主线归并

33 条方法条目在技术上高度重合，归为三条主线：

**主线 A — 完整/亚基质谱去卷积（覆盖项目 1、2、3、4、5，及项目 9 的正交方法）**
输入为 LC-MS 原始数据（厂商 RAW 或转换后的 mzML），核心运算是电荷态去卷积（charge deconvolution），
输出为零电荷质量列表。判定方式是与理论质量核对 + 候选药/参照药图谱叠加比较。

**主线 B — 肽图 LC-MS/MS（覆盖项目 6、7、8、9、11，及项目 10 的正交方法）**
输入为酶切后的 LC-MS/MS 数据，核心运算是数据库检索与肽段鉴定，
输出为覆盖率、匹配肽段列表、修饰位点、二硫键连接肽。

**主线 C — 巯基化学定量（覆盖项目 10 首选方法）**
Ellman 试剂法（DTNB，412 nm 吸光度）或荧光巯基法，输出为 mol SH/mol protein。
这是唯一一条**不产生质谱数据**的主线，输出直接是标量数值。

### 1.2 对工具需求的判断

11 项中 9 项的相似性评价方法为定性比对，`numericLimit` 明确写「无通用数值限度」或「不适用」。
因此本大类的工具需求集中在能力层级 **A（读数据）、B（特征提取）、D（对比）**，
而非 E（统计等效性）。只有 `free-thiol` 与 `n-c-terminal-sequence` 的异质体比例涉及 QR 计算。

`free-thiol` 的 `numericLimit` 字段（`characterization-items.ts:1026`）已明确写出完整判定公式：
`QR=(μR−XσR, μR+XσR)`，且要求「足够批次（如 90% 以上）落入」。
这是本大类唯一一条输入为纯数值、判定规则完全明确、不依赖任何质谱原始文件的链路，
选为端到端可行性演示的切入点。

---

## 2. 检索式

查询日期：2026-08-14。以下为实际使用的检索表达式，按技术主线分组。

### 2.1 主线 A — 完整/亚基质谱去卷积

| # | 检索式 | 意图 |
|---|---|---|
| A-1 | `intact protein mass deconvolution github` | 找去卷积算法实现 |
| A-2 | `charge state deconvolution mass spectrometry open source python` | 限定语言与开源属性 |
| A-3 | `UniDec` / `MSDeconv` / `FLASHDeconv` / `Thrash algorithm` | 领域内公认工具名直查 |
| A-4 | `mzML reader python library` | 找 A 级（数据读取）基础库 |
| A-5 | `antibody intact mass analysis biosimilar comparability toolkit` | 领域适配度检索 |
| A-6 | `native mass spectrometry deconvolution software repository license` | 许可证与仓库确认 |

中文补充检索词：完整分子量 去卷积、电荷态解卷积、亚基质谱 抗体。

### 2.2 主线 B — 肽图 LC-MS/MS

| # | 检索式 | 意图 |
|---|---|---|
| B-1 | `peptide mapping LC-MS/MS open source pipeline github` | 找端到端流程 |
| B-2 | `peptide identification search engine open source Comet MSFragger` | 找搜库引擎 |
| B-3 | `sequence coverage calculation proteomics python library` | 直接对应项目 6、7 的检测指标 |
| B-4 | `disulfide bond mapping software mass spectrometry github` | 直接对应项目 11 |
| B-5 | `pyOpenMS OpenMS peptide mapping workflow example` | 领域主流工具链直查 |
| B-6 | `monoclonal antibody peptide map comparability software` | 领域适配度检索 |
| B-7 | `N-terminal C-terminal heterogeneity pyroglutamate lysine quantification tool` | 直接对应项目 9 |

中文补充检索词：肽图分析 开源、序列覆盖率 计算、二硫键 鉴定 软件。

### 2.3 主线 C — 巯基定量与 quality range 判定

| # | 检索式 | 意图 |
|---|---|---|
| C-1 | `Ellman assay free thiol quantification script github` | 找显色法计算脚本 |
| C-2 | `biosimilar quality range statistics python R package` | 找 QR 计算实现 |
| C-3 | `tolerance interval equivalence testing biosimilar analytical similarity R` | 找统计判定实现 |
| C-4 | `mean +/- 3 SD quality range analytical similarity assessment code` | 直查 QR 公式实现 |

中文补充检索词：质量范围 QR 计算、分析相似性 统计。

### 2.4 检索策略说明

对每条主线同时检索两类工具并分别报告：

- **高 Star 通用工具**：社区活跃、文档完善，但可能未针对生物类似药场景；
- **低 Star 领域专业工具**：Star 数低但领域内公认，专业科学软件天然 Star 少，不设 Star 阈值。

不接受仅凭搜索摘要下结论，每个进入长名单的候选都必须打开仓库页面核实。

---

## 3. 候选工具长名单与核实结果

全部数据通过 GitHub 公开 REST API 于 **2026-08-14** 实时核实（命令见 `evidence/` 目录说明），
不依赖搜索摘要。API 无需登录即可读取仓库元数据，因此 star/fork/最近提交均为实测值而非估算。

### 3.1 主线 A — 完整/亚基质谱去卷积

| 仓库 | Star | Fork | 最近提交 | 许可证 | 主语言 | 归档 | 初步判断 |
|---|---|---|---|---|---|---|---|
| [michaelmarty/UniDec](https://github.com/michaelmarty/UniDec) | 90 | 28 | 2026-08-03 | NOASSERTION（README 称修改版 BSD-3） | C | 否 | **进入短名单**：领域内去卷积事实标准，pip 可装 |
| [OpenMS/OpenMS](https://github.com/OpenMS/OpenMS) | 611 | 432 | 2026-08-13 | NOASSERTION | C++ | 否 | **进入短名单**：含 FLASHDeconv，且是肽图主线的同一套工具 |
| [mobiusklein/ms_deisotope](https://github.com/mobiusklein/ms_deisotope) | 42 | 16 | 2025-07-30 | Apache-2.0 | Python | 否 | 备选：去同位素与电荷解析，一年未更新 |
| [mobiusklein/brainpy](https://github.com/mobiusklein/brainpy) | 23 | 12 | 2025-05-22 | Apache-2.0 | Python | 否 | 淘汰：仅同位素分布计算，能力层级过窄 |
| [pymzml/pymzML](https://github.com/pymzml/pymzML) | 194 | 97 | 2026-07-24 | MIT | Python | 否 | 备选：仅 A 级（mzML 读取），非分析工具 |
| [ProteoWizard/pwiz](https://github.com/ProteoWizard/pwiz) | 315 | 121 | 2026-08-13 | Apache-2.0 | C# | 否 | **进入短名单**：格式转换事实标准，A 级入口 |
| [PNNL-Comp-Mass-Spec/Informed-Proteomics](https://github.com/PNNL-Comp-Mass-Spec/Informed-Proteomics) | 32 | 9 | 2022-10-05 | 无 | C# | 否 | 淘汰：近四年停更且无许可证 |

### 3.2 主线 B — 肽图 LC-MS/MS

| 仓库 | Star | Fork | 最近提交 | 许可证 | 主语言 | 归档 | 初步判断 |
|---|---|---|---|---|---|---|---|
| [OpenMS/OpenMS](https://github.com/OpenMS/OpenMS)（pyOpenMS） | 611 | 432 | 2026-08-13 | NOASSERTION | C++ | 否 | **短名单首选** |
| [levitsky/pyteomics](https://github.com/levitsky/pyteomics) | 161 | 45 | 2026-07-22 | Apache-2.0 | Python | 否 | **进入短名单**：许可证最清晰 |
| [smith-chem-wisc/MetaMorpheus](https://github.com/smith-chem-wisc/MetaMorpheus) | 111 | 51 | 2026-08-13 | MIT | C# | 否 | **进入短名单**：少数自带完整肽图流水线者 |
| [Nesvilab/FragPipe](https://github.com/Nesvilab/FragPipe) | 314 | 48 | 2026-08-07 | NOASSERTION | Java | 否 | 条件方案：MSFragger 商用需授权 |
| [UWPR/Comet](https://github.com/UWPR/Comet) | 56 | 21 | 2026-08-13 | NOASSERTION | C | 否 | 备选：搜库引擎，需自行编排流程 |
| [CompOmics/searchgui](https://github.com/CompOmics/searchgui) | 48 | 16 | 2025-08-15 | 空 | Java | 否 | 淘汰：许可证字段为空，需人工确认 |
| [CompOmics/peptide-shaker](https://github.com/CompOmics/peptide-shaker) | 55 | 21 | 2026-08-01 | 空 | Java | 否 | 淘汰：同上 |
| [percolator/percolator](https://github.com/percolator/percolator) | 142 | 44 | 2026-05-21 | NOASSERTION | C++ | 否 | 淘汰：仅做 FDR 重打分，非本大类核心 |
| [bigbio/quantms](https://github.com/bigbio/quantms) | 82 | 57 | 2026-08-12 | MIT | Nextflow | 否 | 淘汰：定量蛋白组流水线，与肽图鉴定目标不符 |
| [wfondrie/mokapot](https://github.com/wfondrie/mokapot) | 52 | 21 | 2026-08-05 | Apache-2.0 | Python | 否 | 淘汰：同 percolator，定位为 FDR 重打分 |
| [MannLabs/alphapept](https://github.com/MannLabs/alphapept) | 192 | 35 | 2024-04-19 | Apache-2.0 | HTML | 否 | 淘汰：两年余未更新 |
| [MannLabs/alphabase](https://github.com/MannLabs/alphabase) | 56 | 15 | 2026-08-11 | Apache-2.0 | Python | 否 | 备选：活跃，但定位为基础库而非肽图流程 |
| [OpenMS/agentomics](https://github.com/OpenMS/agentomics) | 0 | 0 | 2026-03-26 | BSD-3-Clause | Python | 否 | 备选：118 个 pyopenms CLI 小工具，含 `protein_coverage_calculator`，但 0 star、无社区验证 |

### 3.3 主线 B 特例 — 二硫键连接肽

| 仓库 | Star | Fork | 最近提交 | 许可证 | 主语言 | 初步判断 |
|---|---|---|---|---|---|---|
| [pFindStudio/pLink2](https://github.com/pFindStudio/pLink2) | 25 | 1 | 2025-01-11 | 无许可证文件 | C++ | 条件方案：pLink-SS 是文献最常引用者，但许可证不明 |
| [Eugleo/dibby](https://github.com/Eugleo/dibby) | 1 | 0 | 2021-11-21 | 无许可证文件 | Jupyter Notebook | 不推荐：研究原型，停更三年余 |

SIM-XL 与 SlinkS 在文献中被提及，但均未找到公开维护的 GitHub 仓库，记为 **未找到可验证仓库**。

### 3.4 主线 C — quality range 与等效性统计

| 仓库 | Star | Fork | 最近提交 | 许可证 | 主语言 | 初步判断 |
|---|---|---|---|---|---|---|
| [nicoballarini/tailTest](https://github.com/nicoballarini/tailTest) | 1 | 0 | 2019-04-17 | 无许可证文件 | R | 不推荐：唯一对口但停更七年、无许可证 |
| [cran/T2EQ](https://github.com/cran/T2EQ) | 0 | 0 | 2016-08-31 | 空（CRAN 镜像） | R | 不推荐：多元等效性检验，非 quality range，且十年未更新 |

**这一主线的结论是「未找到」**：没有任何维护中的、许可证清晰的开源工具直接实现生物类似药 quality range 判定。
详见第 7 节缺口分析。

---

## 4. 短名单与部署实录

### 4.0 运行环境

| 项 | 值 |
|---|---|
| 操作系统 | Windows-10-10.0.26200-SP0 |
| Python | 3.10.13（`python -m venv tools-poc/.venv` 建立的独立虚拟环境） |
| pip | 26.2.1 |
| Node | 见 `package.json`，Next.js 16.3.0 |
| Docker | 未使用 |
| 虚拟环境体积 | 925.4 MB / 35 个包（预算上限 10 GB） |
| 依赖锁定 | `tools-poc/requirements.txt`（直接依赖）+ `tools-poc/requirements.lock.txt`（完整树） |

安装均通过 PyPI（清华镜像源）完成，未执行任何来源不明的安装脚本，未做全局安装，未修改系统 PATH，未触碰 `package.json` 现有依赖。

### 4.1 环境级障碍：非 ASCII 路径（影响全部 C/C++ 内核工具）

这是本轮最先遇到、也最容易被忽略的问题，单独记录。

本仓库位于 `d:\生物类似药判别系统\...`，路径含中文字符。**OpenMS 与 UniDec 的原生内核都无法处理非 ASCII 路径。**

首次运行 pyOpenMS 的失败原文（`evidence/run_s08.log` 首次执行）：

```
OpenMS FATAL ERROR!
  Cannot find shared data! OpenMS cannot function without it!
  The environment variable 'OPENMS_DATA_PATH' currently points to
  '...\tools-poc\.venv\lib\site-packages\pyopenms\share\OpenMS', which is incorrect!
```

排查过程：

1. 确认 share 目录确实存在（163 个文件，11.9 MB）→ 排除安装不完整；
2. 尝试用 Windows 8.3 短路径规避 → 短路径为 `D:\生物类~1\生物类~3\...`，**仍含中文**，无效；
3. 最终方案：把 share 目录复制到系统临时目录下的纯 ASCII 路径，并在 `import pyopenms` **之前**设置
   `OPENMS_DATA_PATH`。实现见 `tools-poc/scripts/_openms_bootstrap.py`，仅在脚本进程内生效。

UniDec 同理：其 `unidec.exe` 需要输入谱图位于 ASCII 路径，脚本先复制到 `%TEMP%\unidec-poc-work\` 再运行。

**这一发现对项目有实际影响**：若日后要把任何质谱工具接入后端服务，部署路径必须是纯 ASCII，
否则会在生产环境出现同样的启动失败。

### 4.2 pyOpenMS — 达到 L2，进而 L4

| 项 | 值 |
|---|---|
| 版本 | pyopenms 3.5.0 / OpenMS core 3.5.0 |
| 安装命令 | `tools-poc\.venv\Scripts\python.exe -m pip install numpy scipy pyteomics pyopenms` |
| 安装耗时 | 62.85 s，退出码 0（`evidence/install_core.log`） |
| 下载体积 | pyopenms wheel 32.9 MB，连同 numpy/scipy/pandas/matplotlib 共 17 个包 |

**L2 验证**（`tools-poc/scripts/s08_pyopenms_official_example.py`，日志 `evidence/run_s08.log`）

用官方文档 "Peptides and Proteins" 与 "Digestion" 章节的示例肽段 `DFPIANGER`，6 项断言全部通过：

| 断言 | 实测 | 文档预期 |
|---|---|---|
| 序列往返解析 | `DFPIANGER` | `DFPIANGER` |
| 分子式 | `C44H67N13O15` | `C44H67N13O15` |
| 单同位素质量 | 1017.4879641373001 Da | 1017.4879641373 Da（容差 1e-6） |
| 残基数 | 9 | 9 |
| 胰蛋白酶酶切产物 | `['DFPIANGER','DFPIANGER','K','DFPIANGER']` | 同左 |
| 理论 b/y 碎片离子数 | 15 | 15 |

**首次运行时第 6 项断言失败**（实测 15、预期 16）。排查后确认是**我的预期值算错**，不是工具出错：
`TheoreticalSpectrumGenerator` 默认 `add_first_prefix_ion=false`，即不生成 b1 离子，
因此 9 残基肽段应为 y1–y8 共 8 个加 b2–b8 共 7 个，合计 15 个。修正断言后通过。
失败记录保留在 `evidence/run_s08.log` 的历史版本与脚本注释中。

**L4 验证**：见 4.5 节肽图链路。

### 4.3 UniDec — 达到 L4，但 L2 未建立

| 项 | 值 |
|---|---|
| 版本 | unidec 8.2.1 |
| 安装命令 | `tools-poc\.venv\Scripts\python.exe -m pip install unidec` |
| 安装耗时 | 46.73 s，退出码 0（`evidence/install_unidec.log`） |
| 附带依赖 | 18 个包，含 numba、llvmlite、h5py、pythonnet、pymzml；**未拉入 wxPython**，即 GUI 依赖可选 |
| C 内核 | 随包提供 `unidec/bin/unidec.exe`，无需自行编译 |

**遇到的第一个失败：README 的 API 示例已过时。**

官方 README 与文档给出的写法是 `import unidec; eng = unidec.UniDec()`，在 8.2.1 上直接抛出：

```
AttributeError: module 'unidec' has no attribute 'UniDec'
```

实际入口已迁移到 `from unidec.engine import UniDec`。失败原文保留在 `evidence/run_s08b_fail_api.log`。

**遇到的第二个失败：包内 `.out` 文件不是权威预期输出。**

包内 `bin/TestSpectra/` 下有 `test_1.txt`、`test_2.txt` 两张测试谱与一个 `test_2.txt.out`。
本调研最初把 `.out` 当作参照输出，比对后 0/6 匹配。逐行检查该文件后确认：
它包含 **221 个不同质量、跨度 546～10269 Da**，其中绝大多数只出现 1 次，
是一张峰匹配表而非预期去卷积结果，**不能作为正确性判据**。
失败记录保留在 `evidence/run_s08b_fail_reference.log`。

**因此 UniDec 的 L2 未能建立**——不是工具的问题，而是官方 pip 包未随附可对照的预期输出。
按本任务规则，宁可记为未达 L2，也不把「跑完没报错」当成「输出正确」。

**实际运行记录**（`evidence/run_s08b.log`）：

| 测试谱 | 数据点 | 耗时 | R² | 检出质量峰 |
|---|---|---|---|---|
| `test_1.txt` | 1800 | 0.14 s | 0.999733 | 1 个：12000.00 Da（相对强度 100%） |
| `test_2.txt` | 3537 | 0.25 s | 0.891222 | 18 个，主峰 34660.00 Da |

`test_1.txt` 去卷积得到单一 12000.00 Da 物种、R² 达 0.9997，是一张干净的单组分谱，
结果本身高度自洽；但由于作者未声明该谱的真值，仍不据此判定 L2。

**L4 验证**：见 4.4 节完整分子质量链路。

### 4.4 完整分子质量链路（对应项目 1～5）— 达到 L4

脚本 `tools-poc/scripts/s09a_intact_mass_chain.py`，日志 `evidence/run_s09a.log`，
输出 `tools-poc/output/s09a_intact_mass_chain.json`。

**链路**：公开序列 → 理论质量（pyOpenMS）→ 电荷态包络谱（正演合成）→ 去卷积（UniDec）→ 质量核对 → 差异归因

**数据**：

- 序列为**真实公开数据**：UniProt P02769（牛血清白蛋白），成熟链残基 25–607 共 583 aa，
  35 个半胱氨酸，注释 17 对二硫键，推算游离半胱氨酸 1 个。FASTA 与 JSON 均缓存并记录 sha256。
- 谱图为**合成数据**：由理论质量正演生成，电荷态 30+～60+，m/z 900–2600，20000 个数据点，
  加 0.2% 基线噪声，随机种子 20260814。选择合成谱的唯一理由是它带**已知真值**，
  否则无法判断去卷积结果对不对。

**结果**：

| 项 | 数值 |
|---|---|
| 全还原态平均质量 | 66432.46 Da |
| 17 对二硫键失氢 | −34.27 Da |
| 氧化态理论质量（真值） | **66398.19 Da** |
| UniDec 回收质量（参照药） | 66398.00 Da，偏差 −0.19 Da（**−2.8 ppm**），R²=0.999784 |
| UniDec 回收质量（候选药） | 66560.00 Da，偏差 −0.24 Da（−3.6 ppm），R²=0.999782 |
| 头对头质量差 | +162.00 Da |
| 人为引入的己糖差异 | +162.05 Da |
| 差异还原误差 | −0.05 Da |

**为什么判定 L4**：输入输出与项目 `intact-mass` 的检测指标「去卷积完整质量（Da）」直接对应，
并完成了该项目相似性评价方法要求的「理论质量核对」，还演示了判定原则中
「差异可由已知糖型解释」的归因过程。未转为前端可消费数据，故未达 L5。

### 4.5 肽图与序列覆盖率链路（对应项目 6、7、8）— 达到 L4

脚本 `tools-poc/scripts/s09b_peptide_map_coverage.py`，日志 `evidence/run_s09b.log`。

**链路**：序列 → 体外酶切（pyOpenMS）→ 理论肽段表 → 母离子质量匹配（10 ppm）→ 覆盖率 → 序列替换检出

**结果**：

| 项 | 数值 |
|---|---|
| 酶切条件 | Trypsin，允许 1 个漏切，最短肽长 6 |
| 理论肽段数 | 118 |
| 参照药模拟实测母离子数 | 107（15% 随机未检出，3 ppm 测量噪声） |
| 参照药匹配肽段 | 106/118 |
| **参照药序列覆盖率** | **99.31%**（579/583 残基） |
| 候选药（含 G327A 替换）覆盖率 | 96.57% |
| 覆盖替换位点的理论肽段 | 3 条，**全部落为未匹配** |

三条被检出的肽段：`DAFLGSFLYEYSR`(323–335)、`NYQEAKDAFLGSFLYEYSR`(317–335)、`DAFLGSFLYEYSRR`(323–336)。

**为什么判定 L4**：直接产出项目 6、7 的检测指标「覆盖率%、匹配肽段」，
并演示了项目 7 判定原则「不得出现未经解释的氨基酸替换」的检出机制。

**已声明的局限**（写入输出 JSON 的 `limitations` 字段）：
只做 MS1 母离子质量匹配，未做 MS/MS 碎片离子序列确认——框架自身在
`characterization-items.ts:482` 已明确指出「MS1 质量匹配不能替代 MS/MS 序列确认」；
未考虑翻译后修饰；未做保留时间比对。

### 4.6 游离巯基质量范围判定链路（对应项目 10）— 达到 L4，自研实现

脚本 `tools-poc/scripts/s09c_free_thiol_quality_range.py`，日志 `evidence/run_s09c.log`。

这是本大类**唯一没有找到可用开源工具**的分析点，判定逻辑由 numpy/scipy 自研，约 100 行。

**实现的正是框架 `characterization-items.ts:1026` 写明的算法**：
`QR=(μR−XσR, μR+XσR)`，「足够批次（如90%以上）落入」。

**三种区间的严格区分**（这是本脚本最重要的输出之一）：

以 20 个合成参照药批次（μR=0.9216，σR=0.0556 mol SH/mol protein）计算：

| 区间 | 定义 | 结果 | 宽度 | 相对 QR |
|---|---|---|---|---|
| 质量范围 QR | μR ± 3σR，**描述性**区间 | [0.7548, 1.0884] | 0.3337 | 1.000 |
| 95% 置信区间 CI | 对**总体均值**的推断 | [0.8956, 0.9476] | 0.0521 | **0.156** |
| 95%/99% 容许区间 TI | 覆盖总体中 99% **个体**（Howe 1969，k2=3.6171） | [0.7204, 1.1227] | 0.4023 | **1.206** |

CI 只有 QR 的 15.6% 宽。**若误把 CI 当作 QR 用于单批次落入判定，会把绝大多数正常批次判为不相似。**
这正是本项目必须严格区分三者的原因。

**判定逻辑的区分能力检验**（一个对任何输入都返回通过的判定脚本没有判定能力）：

| 情景 | 候选药均值 | 落入 QR | 结论 |
|---|---|---|---|
| similar | 0.9443 | 12/12 = 100% | 支持该属性相似 |
| shifted（均值 +0.18） | 1.1210 | 4/12 = 33.3% | 不支持该属性相似 |

**已声明的局限**：X=3 未经风险论证（框架明确要求「X 需按属性风险论证」）；
σR 由 20 个合成批次估计，批次数少会使 QR 不稳定；
已发表文献指出 3SD 类简单范围检验对第一类错误控制存在缺陷
（Mielke et al., AAPS J 2019；AAPS J 2022 关于 bootstrapping 检验的报道，
**结论来自摘要，未逐篇精读，标为未完全验证**）；
框架同时要求比较均值、SD 与分布，本演示只实现了落入比例判定。

---

## 5. 横向比较（0～5 分加权）

权重：分析点适配度 30% / 技术可行性 20% / 维护活跃度 15% / 文档示例 10% /
许可证友好度 10% / 与 Next.js 集成难度 10% / 社区认可度 5%。

**约束：实际部署层级低于 L2 的，技术可行性不得高于 2 分。**

| 工具 | 适配度 30% | 技术可行 20% | 维护 15% | 文档 10% | 许可证 10% | 集成 10% | 社区 5% | 加权总分 |
|---|---|---|---|---|---|---|---|---|
| **pyOpenMS** | 5.0 | 5.0 | 5.0 | 4.0 | 3.0 | 3.5 | 4.5 | **4.48** |
| **UniDec** | 5.0 | 4.5 | 4.5 | 2.5 | 3.0 | 3.0 | 2.5 | **4.05** |
| Pyteomics | 3.0 | 2.0 | 5.0 | 4.0 | 5.0 | 4.0 | 3.5 | **3.33** |
| MetaMorpheus | 4.0 | 2.0 | 5.0 | 4.0 | 5.0 | 2.0 | 3.0 | **3.40** |
| ProteoWizard | 3.5 | 2.0 | 5.0 | 4.0 | 5.0 | 2.5 | 4.0 | **3.40** |
| FragPipe | 4.0 | 2.0 | 5.0 | 4.0 | 1.0 | 1.5 | 4.5 | **3.10** |
| pLink 2 | 4.5 | 2.0 | 2.5 | 2.0 | 0.5 | 1.0 | 2.0 | **2.63** |
| dibby | 3.0 | 2.0 | 0.5 | 1.5 | 0.5 | 2.5 | 0.5 | **1.90** |
| tailTest | 2.0 | 2.0 | 0.5 | 2.0 | 0.5 | 1.5 | 0.5 | **1.55** |

**扣分说明**：

- **pyOpenMS**：许可证扣分因 GitHub 标为 NOASSERTION，分发前需法务复核；
  集成扣分因需独立 Python 进程，且 C++ 内核对非 ASCII 路径敏感；文档扣分因 API 覆盖广但生物类似药场景无现成示例。
- **UniDec**：文档扣分严重——README 的 API 示例在 8.2.1 上已失效，官方文档自述「不完善」；
  社区扣分因 90 star；技术可行性未给满分因 L2 未建立。
- **Pyteomics / MetaMorpheus / ProteoWizard / FragPipe / pLink 2 / dibby / tailTest**：
  技术可行性均封顶 2 分，因为**本轮未在本机部署验证**（L0/L1），
  按规则不得给出更高分。这不是对工具本身的负面评价，而是对证据强度的诚实反映。

---

## 6. 分析点 → 工具 → 层级映射表

| # | 检测项目 | 首选工具 | 备选 | 能力层级 | **实际部署层级** |
|---|---|---|---|---|---|
| 1 | 完整分子质量 | UniDec | pyOpenMS、ProteoWizard | A/B/D/F | **L4** |
| 2 | 脱糖完整分子质量 | UniDec | pyOpenMS、ProteoWizard | A/B/D/F | **L4**（同链路） |
| 3 | 轻链分子质量 | UniDec | pyOpenMS、ProteoWizard | A/B/D/F | **L4**（同链路） |
| 4 | 未脱糖重链分子质量 | UniDec | pyOpenMS、ProteoWizard | A/B/D/F | **L4**（同链路） |
| 5 | 脱糖重链分子质量 | UniDec | pyOpenMS、ProteoWizard | A/B/D/F | **L4**（同链路） |
| 6 | MS1 肽质量覆盖率 | pyOpenMS | MetaMorpheus、Pyteomics | A/B/C/D/F | **L4** |
| 7 | MS/MS 序列确认覆盖率 | pyOpenMS | MetaMorpheus、FragPipe | A/B/C/D/F | **L4**（仅 MS1 层面，MS/MS 层面未验证） |
| 8 | CDR 区特征肽确认 | pyOpenMS | MetaMorpheus | A/B/D | **L3**（机制同项目 6，未针对 CDR 单独验证） |
| 9 | N/C 端序列及末端异质性 | pyOpenMS | UniDec（亚基质谱正交） | A/B/D | **L3**（序列侧已验证，末端异质体定量未验证） |
| 10 | 游离巯基水平 | **自研**（无可用开源工具） | — | E | **L4**（自研 QR 判定） |
| 11 | 二硫键连接图谱 | **缺口** | pLink 2（许可证不明）、dibby（停更） | B/D | **L0** |

**说明：项目 2～5 与项目 1 共用同一条链路**，只是样品前处理不同（脱糖、还原、亚基分离），
在数据分析侧完全相同，因此一次验证覆盖五个分析点。这正是「按大类找共用工具」判断成立的直接证据。

### 已跑通清单（L2 以上）

| 内容 | 层级 | 证据 |
|---|---|---|
| pyOpenMS 官方文档示例（6 项断言） | L2 | `evidence/run_s08.log` |
| 完整分子质量链路（UniDec + pyOpenMS，−2.8 ppm） | L4 | `evidence/run_s09a.log` |
| 肽图覆盖率链路（99.31%，替换检出） | L4 | `evidence/run_s09b.log` |
| 游离巯基 QR 判定（自研，区分能力已验证） | L4 | `evidence/run_s09c.log` |

### 卡住清单

| 内容 | 卡在哪 | 原因 | 需要什么才能推进 |
|---|---|---|---|
| UniDec L2 | 无法判定输出正确性 | pip 包未随附权威预期去卷积结果，包内 `.out` 是 221 行峰匹配表 | 向作者索取官方基准输出，或用带真值的公开数据集 |
| 二硫键连接图谱 | 停在 L0 | 唯一对口的 pLink-SS 无许可证文件，替代品 dibby 停更三年余 | 完成 pLink 2 许可证澄清，或自研交联肽匹配模块 |
| MS/MS 层面序列确认 | 停在 L3 | 本轮只做 MS1 母离子质量匹配，未接搜库引擎 | 引入 Comet 或 MetaMorpheus，并准备带碎片谱的公开数据集 |
| 厂商原始格式读取 | 停在 L0 | 无任何真实或公开的 RAW/WIFF 文件 | 获取一份可公开的厂商原始数据 |
| 末端异质体定量（C 端 Lys 比例） | 未验证 | 需要肽段级定量与保留时间比对，本轮未实现 | 扩展肽图脚本，加入相对定量 |

---

## 7. 缺口分析

### 7.1 无开源工具覆盖的分析点

**二硫键连接图谱（项目 11）** —— 本大类唯一完全没有可用工具的分析点。
文献中公认的 pLink-SS 与 SIM-XL 都不满足准入：前者仓库无许可证文件、商业条款不明，
后者未找到公开维护的仓库。dibby 虽是 Python 且思路对口，但停更三年余、无许可证、作者自述为原型。

**生物类似药 quality range 判定** —— 跨全部八个大类的横向缺口，不限于本大类。
本轮检索未找到任何维护中、许可证清晰的开源实现。唯一对口的 R 包 tailTest 仅 1 star、
2019 年后停更、无许可证文件。这个缺口比单个分析点的缺口更重要，因为**每一个采用 QR 判定的项目都依赖它**。

### 7.2 需自研的模块

| 模块 | 理由 | 已完成度 |
|---|---|---|
| quality range 判定引擎 | 无可用开源实现，且判定规则已在框架 `numericLimit` 中写明 | PoC 已完成并验证区分能力（`s09c`），约 100 行 |
| 理论质量核对模块 | pyOpenMS 提供计算能力，但「候选药 vs 参照药 vs 理论值」的三方核对逻辑需自研 | PoC 已完成（`s09a`） |
| 覆盖率与未匹配肽段报告 | pyOpenMS 提供酶切与质量计算，覆盖率统计与替换检出逻辑需自研 | PoC 已完成（`s09b`） |
| 交联肽（二硫键）匹配 | 无可用开源工具 | 未开始 |
| 厂商格式转换封装 | ProteoWizard 为 CLI，需封装调用与错误处理 | 未开始 |

### 7.3 实施优先级

1. **澄清 pyOpenMS 与 UniDec 的许可证**（两者 GitHub 均标 NOASSERTION）。这是分发前的前置条件，
   与技术无关但会否决整条路线，应最先解决。
2. **把 quality range 引擎从 PoC 提升为正式模块**。它是跨大类的公共基础，
   且已有可运行实现，投入产出比最高。
3. **获取一份可公开的质谱原始数据**。当前所有链路都止步于合成数据，
   这是从 L4 迈向真实可用的唯一瓶颈。
4. **二硫键分析的许可证澄清或自研决策**。这是本大类唯一的硬缺口。
5. MS/MS 层面搜库能力（优先验证 MetaMorpheus，MIT 许可证最干净）。

---

## 8. 已验证 URL 清单

全部通过 GitHub 公开 REST API 于 2026-08-14 核实：

- https://github.com/michaelmarty/UniDec
- https://github.com/OpenMS/OpenMS
- https://github.com/OpenMS/agentomics
- https://github.com/levitsky/pyteomics
- https://github.com/mobiusklein/ms_deisotope
- https://github.com/mobiusklein/brainpy
- https://github.com/pymzml/pymzML
- https://github.com/ProteoWizard/pwiz
- https://github.com/smith-chem-wisc/MetaMorpheus
- https://github.com/Nesvilab/FragPipe
- https://github.com/UWPR/Comet
- https://github.com/CompOmics/searchgui
- https://github.com/CompOmics/peptide-shaker
- https://github.com/percolator/percolator
- https://github.com/bigbio/quantms
- https://github.com/wfondrie/mokapot
- https://github.com/MannLabs/alphapept
- https://github.com/MannLabs/alphabase
- https://github.com/PNNL-Comp-Mass-Spec/Informed-Proteomics
- https://github.com/pFindStudio/pLink2
- https://github.com/Eugleo/dibby
- https://github.com/nicoballarini/tailTest
- https://github.com/cran/T2EQ

未通过 API 核实、仅作参考的来源（标 `[未验证]`）：

- https://pyopenms.readthedocs.io/en/latest/ （文档站，示例值已由本地运行独立验证）
- https://pypi.org/project/UniDec/ 、https://pypi.org/project/pyopenms/ （包索引页）
- https://rest.uniprot.org/uniprotkb/P02769 （公开数据源，已下载并记录 sha256）
- 二硫键与统计方法相关文献（PMC / AAPS J / PLOS One）：**仅读摘要，未逐篇精读**

`github.com/OpenMS/pyopenms-docs` 经核实**已归档**（README 声明已并入 OpenMS 主仓库），
因此未纳入候选，仅作为文档来源。

---

## 9. 本轮结论的证据局限与未验证项

必须与上述所有结论一同阅读。

1. **没有使用任何真实实验数据。** 全部谱图与批次数值均为合成数据。
   合成数据能验证算法正确性（因为有真值），但**完全无法验证方法在真实样品上的表现**——
   真实数据有基线漂移、离子抑制、共洗脱、加合物、批间差异，这些本轮一概未触及。
2. **没有读取过任何厂商原始格式。** 所有输入都是文本谱图或程序生成的数组，
   RAW/WIFF → mzML 这一环完全未验证。
3. **演示对象是 BSA，不是治疗性抗体。** BSA 是二硫键分析的经典模型蛋白且序列公开可溯源，
   适合验证计算链路；但抗体的糖基化异质性、亚基组装、电荷变异体复杂度远高于 BSA，
   本轮结论不能外推为「抗体分析可行」。
4. **UniDec 的 L2 未建立**，其正确性仅由合成谱的已知真值支撑。
5. **MS/MS 碎片离子层面完全未验证**，项目 7 的 L4 判定仅覆盖 MS1 质量匹配层面。
6. **许可证判定未经法务复核。** pyOpenMS 与 UniDec 在 GitHub 上均为 NOASSERTION，
   本文依据 README 与发行包声明做出的判断**不构成法律意见**。
7. **文献结论仅来自摘要。** 关于 3SD 检验第一类错误控制缺陷、FDA 分层方法调整等表述，
   来自检索到的论文摘要，未逐篇精读原文，标为未完全验证。
8. **其余 7 个大类完全未调研。** 本文结论仅适用于一级结构。
9. **本轮未接入任何在线计算能力。** 网站上呈现的是工具信息与部署层级，不是分析结果。

### 最后重申

- 「工具能运行」≠「方法学已验证」≠「符合 GxP / 21 CFR Part 11」；
- 「两组数据数值接近」≠「生物类似性成立」；
- 「装上了」≠「跑通了」，「跑通了」≠「结果正确」，「结果正确」≠「可用于相似性判定」。

