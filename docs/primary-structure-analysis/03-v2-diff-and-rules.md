# P2 — V0.1 / V2 差异与 Sheet3 规则清单

> 上游：[`implementation-plan.md`](./implementation-plan.md) §P2、决策 **D2**（只实现 Sheet3 已填写完整的规则）、**D4**（不动主数据，只建 sidecar）
> 产出代码：[`src/data/similarity-schemes.ts`](../../src/data/similarity-schemes.ts)、[`scripts/verify_similarity_schemes.mjs`](../../scripts/verify_similarity_schemes.mjs)
> 源工作簿：`V2-生物类似药药学比对研究质量属性、检测方法及相似性评价原则汇总表.xlsx`
> SHA-256 `8bd6b18f08d3b9a3b99c61cdb8eeff24ceef75a54a43b9f7d14d1709b703051f`（40,273 字节，修改时间 2026-08-20 09:08）
> 解析：openpyxl 3.1.5，`data_only=True`

---

## 一、前置发现：V0.1 工作簿已不存在

`src/data/characterization-items.ts` 的文件头声明：

```
// Source of truth: 生物类似药评价指导原则/V0.1生物类似药药学比对研究质量属性、检测方法及相似性评价原则汇总表(1).xlsx
// Regenerate with: python scripts/generate_data.py
```

`scripts/generate_data.py` 第 24 行硬编码该绝对路径。**但该文件在整个 `d:\生物类似药判别系统` 工作区已不存在**——全盘搜索 `*.xlsx` / `*.xls`（排除 `node_modules`、`.venv`、`site-packages`）只找到两个文件：

| 文件 | 字节 | 修改时间 |
|---|---|---|
| `生物类似药评价指导原则\V2-…汇总表.xlsx` | 40,273 | 2026-08-20 09:08 |
| `上市产品20260710-导出量1873.xlsx`（无关） | 392,868 | 2026-07-10 11:36 |

由此产生两个后果：

1. **`characterization-items.ts` 与 `regulatory-framework.ts` 已无法再生成。** 生成脚本会因找不到输入而失败。这两个文件目前是脱离源头的产物。
2. **逐字节的 V0.1↔V2 差异无法计算。** V0.1 唯一存活的表示就是那份已生成的 TypeScript。

因此本步的比对是**派生比对**：把 V2 Sheet2 的一级结构区与已生成的 `characterization-items.ts` 逐字段比较。这一点必须明示，不能让读者误以为做了原始工作簿对比。

这也把 **D4（只建 sidecar，不迁移主数据）从「优选方案」变成了「唯一可行方案」**——即使想迁移到 V2，也没有 V0.1 基线可供回归对照。

---

## 二、派生比对结果：一级结构区零差异

V2 Sheet2「2.特性鉴定」共 13 列 × 62 个非空数据行，一级结构区为 **row 2–14（13 行）**。

比对方法：按「指南原词」列做键匹配（比较前统一去除空白、全角转半角），逐字段比对 9 个文本字段，另比对「分析方法（首选）」与「正交/补充方法」两列与站点 `methods[].rawSourceText`。

| 指标 | 结果 |
|---|---|
| V2 一级结构行数 | 13 |
| 匹配到站点项目 | **11** |
| 未匹配的 V2 行 | 2（均为 `示例占位项`） |
| 站点项目在 V2 中无对应行 | **0** |
| **字段级差异总数** | **0** |

逐行对照：

| V2 row | 项目来源 | 指南原词 | 表征项目 | 站点 itemId | 差异 |
|---|---|---|---|---|---|
| 2 | 示例原项 | 完整分子量 | 完整分子质量（intact mass） | `intact-mass` | 无 |
| 3 | 示例原项 | 脱糖分子量 | 脱糖完整分子质量 | `deglycosylated-intact-mass` | 无 |
| 4 | 示例原项 | 轻链分子量 | 轻链分子质量 | `light-chain-mass` | 无 |
| 5 | 示例原项 | 非脱糖重链分子量 | 未脱糖重链分子质量 | `non-deglycosylated-heavy-chain-mass` | 无 |
| 6 | 示例原项 | 脱糖后重链分子量 | 脱糖重链分子质量 | `deglycosylated-heavy-chain-mass` | 无 |
| 7 | 示例原项 | 序列覆盖率/一级质谱 | MS1肽质量覆盖率 | `ms1-sequence-coverage` | 无 |
| 8 | 示例原项 | 序列覆盖率/二级质谱 | MS/MS序列确认覆盖率 | `msms-sequence-coverage` | 无 |
| 9 | **示例占位项** | 翻译后修饰—修饰1 | 见表末补充 | — | 占位行，属 PTM 大类 |
| 10 | **示例占位项** | 翻译后修饰—修饰2 | （空） | — | 占位行，属 PTM 大类 |
| 11 | 示例原项 | CDR区特征肽段鉴别 | CDR区特征肽确认 | `cdr-signature-peptides` | 无 |
| 12 | 示例原项 | C/N端氨基酸序列 | N/C端氨基酸序列及末端异质性 | `n-c-terminal-sequence` | 无 |
| 13 | 示例原项 | 游离巯基 | 游离巯基水平 | `free-thiol` | 无 |
| 14 | 示例原项 | 二硫键 | 二硫键连接图谱 | `disulfide-bonds` | 无 |

**结论：V2 与 V0.1 在一级结构区没有任何分叉。** 13 行减去 2 个 PTM 占位行正好等于站点现有的 11 个一级结构项目，且所有字段逐字一致。

这同时修正了 P0 记录中的一处推断错误：P0 曾把「V2 一级结构 13 行 vs 站点 11 项」记为潜在分叉风险，实际是占位行造成的计数差，不是内容分叉。

---

## 三、Sheet3 规则清单（全部 10 个非空行）

Sheet3「3.特性鉴定相似性评价方案」共 14 列 × 12 行（row 12 全空），列头：

| 列 | 列名 | 是否规则内容列 |
|---|---|---|
| A | 项目来源 | 否 |
| B | CTD章节（页码） | 否 |
| C | 指南原词 | 否（键） |
| D | 表征项目 | 否（键） |
| E | 分析方法（首选） | 否 |
| F | 结果类型 | 否 |
| **G** | 识别内容 | **是** |
| **H** | 比较基准 | **是** |
| **I** | 判定规则类型 | **是** |
| **J** | 判定方法 | **是** |
| **K** | 数值边界 | **是** |
| **L** | 超界处理 | **是** |
| **M** | 主要依据 | **是** |
| **N** | 最终程序规则 | **是** |

合并单元格：`B7:B8`、`B11:B12`、`D9:D10`。

### 3.1 完整规则（7 条，可程序化）

| Sheet3 row | 指南原词 | itemId | 治理方法数 | 判定规则类型 | 缺失列 |
|---|---|---|---|---|---|
| 2 | 完整分子量 | `intact-mass` | 3 | 2.1 身份/结构一致 + 2.2 图谱相似 | 无 |
| 3 | 脱糖分子量 | `deglycosylated-intact-mass` | 3 | 2.1（主要）+ 2.2 | 无 |
| 4 | 轻链分子量 | `light-chain-mass` | 3 | 2.1 + 2.2 | 无 |
| 5 | 非脱糖重链分子量 | `non-deglycosylated-heavy-chain-mass` | 3 | 2.1 + 2.2 | **A** |
| 6 | 脱糖后重链分子量 | `deglycosylated-heavy-chain-mass` | 3 | 2.1 + 2.2 | **A** |
| 7 | 序列覆盖率/一级质谱 | `ms1-sequence-coverage` | 3 | 2.1 | **A** |
| 8 | 序列覆盖率/二级质谱 | `msms-sequence-coverage` | 3 | 2.1 | **A、B** |
| | | | **21** | | |

缺失列均为非规则内容列（A 项目来源、B CTD 章节），不影响规则可程序化性：

- row 5/6/7 存在**列错位**：本应在 A 列的「示例原项」被填入 B 列，挤掉了 CTD 章节；
- row 8 的 A、B 皆空，其中 B 由合并区 `B7:B8` 覆盖。

这些错位已逐条记录在 `similarity-schemes.ts` 的 `provenance.missingCells` 中，并在代码注释里说明原因——这正是本文件采用手工维护而非通用行读取器生成的理由：通用读取器会把错位的「示例原项」当成 CTD 章节静默吞下。

### 3.2 数值边界的一致口径（关键）

五条质量规则（row 2–6）的 K 列**逐字相同**：

> 无统一相似性数值限度；实测质量与理论质量偏差应符合方法特异预设的质量准确度标准

两条覆盖率规则（row 7/8）的 K 列语义相同：

> 无序列覆盖率（Sequence Coverage）的统一合格判定阈值，应获得足以支持一级结构确认的覆盖，尽可能实现完整覆盖

**因此七条规则无一提供可比较的数值阈值。** 界面上不得把 ΔDa / Δppm / 覆盖率百分比渲染成「合格线」。这与《生物类似药药学评价比较.docx》§3 反复强调的边界一致：方法学性能标准、产品质量标准、法规安全限度、相似性判定边界四者不得混用。

### 3.3 M 列依据的差异

| 规则组 | M 列引用 |
|---|---|
| 质量类（row 2–6） | CDE 2026 + FDA 2025 + WHO 2022 + ICH Q6B + **ICH Q2(R2)** |
| 覆盖率类（row 7/8） | CDE 2026 + FDA 2025 + WHO 2022 + ICH Q6B |

覆盖率规则不引用 ICH Q2(R2)（分析方法验证），与其「无统一阈值、以覆盖充分性论证为主」的定位自洽。

### 3.4 空缺规则（4 项 → `RULE_NOT_DEFINED`）

| Sheet3 状态 | 指南原词 | itemId | completeness | 已填写列 | 缺失列 |
|---|---|---|---|---|---|
| row 11 存在但不完整 | CDR区特征肽段鉴别 | `cdr-signature-peptides` | `partial` | B、C、D、E、F | **A、G、H、I、J、K、L、M、N** |
| **无对应行** | C/N端氨基酸序列 | `n-c-terminal-sequence` | `absent` | — | 全部 |
| **无对应行** | 游离巯基 | `free-thiol` | `absent` | — | 全部 |
| **无对应行** | 二硫键 | `disulfide-bonds` | `absent` | — | 全部 |

按 **D2/D3**，这 4 项：

- `methodIds` 一律为**空数组**——没有任何方法可以继承一条不存在的规则；
- 不携带任何 G–N 规则字段——结构上就无法驱动判定；
- 必须填写 `notDefinedReason`，向用户说明「能算什么、不能判什么、为什么」；
- 对应的 12 条方法（CDR 3 条 + N/C 端 3 条 + 游离巯基 3 条 + 二硫键 3 条）在界面上只展示计算结果，`verdict` 恒为 `RULE_NOT_DEFINED`。

**游离巯基是最容易被误用的一项**：Sheet2 row 13 的「数值限度/判定边界」列确实写明了质量范围法 `QR = (μR − XσR, μR + XσR)` 与「足够批次（如90%以上）落入」，但 **Sheet3 没有把它编写成程序规则**。按 D2「绝不从 Sheet2 或别处补造」，系统可以算出 μR、σR、QR 区间与落入比例并全部展示，但**不得输出 PASS/FAIL**。X 倍数需按属性风险单独论证，不存在通用取值。

### 3.5 无法映射的 Sheet3 行（2 行）

row 9「翻译后修饰—修饰1」与 row 10「翻译后修饰—修饰2」在 Sheet2 中标记为 `示例占位项`，row 9 的 D 列写「见表末补充」，指向 Sheet2 row 54–57 的 PTM 补充项（氧化 / 脱酰胺 / N 端焦谷氨酸 / C 端 Lys）。

它们**属 PTM 大类，不是一级结构**，且是未命名占位项，无法分配 itemId。因此**不写入 `similaritySchemes`**（否则就是发明 id），而单独导出为 `unmappedSheet3Rows` 常量记录在案。

---

## 四、规则覆盖率总览

| 层级 | 数量 | 占比 |
|---|---|---|
| 一级结构项目总数 | 11 | — |
| 有完整程序规则 | **7** | 64% |
| 规则不完整（partial） | 1 | 9% |
| Sheet3 无对应行（absent） | 3 | 27% |
| 一级结构方法总数 | 33 | — |
| **受规则治理的方法** | **21** | **64%** |
| 无规则治理的方法 | 12 | 36% |

---

## 五、机械校验

`npm run verify:schemes` 强制七项检查：

1. 每个 `itemId` 真实存在于 `characterization-items.ts`；
2. 每个 `methodId` 真实存在，且**归属于声明它的那个项目**（防止跨项目错挂）；
3. 每个一级结构项目**有且仅有一个** scheme（无遗漏、无重复）；
4. `complete` 的 scheme 必须齐备 G–N 八个规则字段，且 `methodIds` 非空；
5. **非 `complete` 的 scheme 不得携带任何规则字段，`methodIds` 必须为空**——结构上杜绝「不完整规则驱动判定」；
6. 非 `complete` 必须写明 `notDefinedReason`；
7. 记录的工作簿 SHA-256 与磁盘上的实际文件一致——源头被静默改动会被捕获。

实测输出：

```text
primary-structure items      : 11
schemes declared             : 11
  by completeness            : {"complete":7,"partial":1,"absent":3}
programmable (complete)      : 7
methods governed by a rule   : 21
source workbook SHA-256      : matches
warnings                     : 0
failures                     : 0
```

第 5 项检查是本步最重要的设计：它把「不得从 Sheet2 补造规则」从一条纪律变成了一条**结构约束**。哪天有人往 `cdr-signature-peptides` 的 scheme 里加一个 `decisionMethod`，`npm run check` 会直接失败。

---

## 六、本步暴露的风险

1. **V0.1 工作簿丢失** → `characterization-items.ts` / `regulatory-framework.ts` 已无法再生成，`scripts/generate_data.py` 处于不可运行状态。建议后续单独处理（要么找回 V0.1，要么正式把主数据迁到 V2 并更新生成脚本）。**本计划不做此迁移。**
2. **Sheet3 列错位**（row 5/6/7 的「示例原项」落在 B 列）说明源工作簿仍在人工编辑中。SHA-256 校验是必要的防线，但不能防止「编辑后 SHA 一起更新而内容语义变了」——规则文本的正确性仍需人工复核。
3. **规则治理率仅 64%**（21/33 方法）。P11 的界面必须让「有规则」与「无规则」在视觉上一眼可辨，否则用户会把展示性结果误当判定结论。
4. **英文为机器翻译占位**，与站点既有约定一致，尚未经专业校对。
