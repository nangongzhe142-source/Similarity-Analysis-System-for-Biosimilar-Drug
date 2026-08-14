# 更新日志

> 倒序排列。详细文件见同目录下 `2026-08-14-s*.md`。

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
