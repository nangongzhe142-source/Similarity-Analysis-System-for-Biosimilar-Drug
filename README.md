# 生物类似药药学相似性分析框架

基于《V0.1 生物类似药药学比对研究质量属性、检测方法及相似性评价原则汇总表》构建的结构化 Web 框架。系统将 61 个检测项目、184 个检测方法条目组织为可浏览、可扩展的双语站点，并为每一类分析方法预留**嵌入路径**与**可行性证明**。

## 项目目标（当前阶段）

**核心任务：将全部 184 个检测分析方法完成嵌入。**

这里的「嵌入」指：

- 为每个方法写明**可操作的分析路径**（原理、样品制备、仪器参数、系统适用性、数据解读、相似性判定衔接）；
- 用**监管审评案例**或**示意性说明**证明该路径在生物类似药比对中的**可行性与可接受性**；
- **不要求**在本阶段实现真实的计算引擎、文件上传或统计等效性检验。

换言之：本阶段交付的是**结构化方法知识库 + 可追溯的可行性证据**，而非自动化分析软件。

### 完成标准

对每个检测方法条目，至少应满足：

| 维度 | 要求 |
|------|------|
| 方法内容 | 在 `src/data/method-content.ts` 按方法 id 填入 `DetectionMethodContent` 各字段（原理已完成一级结构 33/33） |
| 分析路径 | 从样品到结论的完整流程可逐步阅读，与框架中的判定原则/数值限度对齐 |
| 可行性证明 | 至少满足以下之一：监管审评参考案例（`reference-cases`）、已发表方法学文献引用、或明确标注的示意性说明 |
| 可追溯性 | 真实数据案例须带来源、局限性说明与 `npm run verify:cases` 可校验的溯源字段 |

## 当前进展

| 模块 | 规模 | 状态 |
|------|------|------|
| 质量属性大类 | 8 类 | 已完成 |
| 检测项目 | 61 项（含 9 个补充项） | 已完成（Excel 驱动） |
| 检测方法条目 | 184 条 | 框架已建立，**方法内容待嵌入** |
| 法规框架 | CTD 申报要求 9 条 + 相似性评价关系 9 条 | 已完成 |
| 参考案例 | 35 / 61 项已挂载案例 | 进行中（GP2015 试点） |
| 相似性分析槽位 | 61 项均已预留 | 占位阶段，本期不实现 |

参考案例试点来源：FDA 对 Sandoz GP2015（依那西普，BLA 761042）的多学科审评报告，经结构化转录并附带机械溯源校验。

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│  展示层  Next.js App Router + React 19 + Tailwind CSS 4     │
├─────────────────────────────────────────────────────────────┤
│  组件层  ItemDetailView / MethodSelector / ReferenceCase…   │
├─────────────────────────────────────────────────────────────┤
│  数据层  src/data/  （全站唯一内容来源，数据驱动渲染）        │
│    ├── characterization-items.ts   ← 61 项 + 184 方法       │
│    ├── reference-cases*.ts         ← 可行性证明案例           │
│    ├── regulatory-framework.ts     ← 法规对照                 │
│    └── categories.ts               ← 8 大类定义               │
├─────────────────────────────────────────────────────────────┤
│  生成层  scripts/generate_data.py  ← Excel → TypeScript     │
│  校验层  scripts/verify_reference_cases.mjs ← 案例溯源审计   │
└─────────────────────────────────────────────────────────────┘
```

每个检测项目详情页由四块内容组成：

1. **评价字段** — 检测指标、相似性评价方法、判定原则、数值限度（来自 Excel）
2. **检测方法** — 首选/正交方法切换；每方法下方为方法内容嵌入位
3. **参考案例** — 监管审评实例或示意性说明，证明分析路径可行
4. **相似性分析预留区** — 候选药/参照药数据录入与结果展示槽位（本期占位）

## 分析方法嵌入路径

### 第一步：扩展数据模型

在 `src/types/models.ts` 中为 `DetectionMethod` 增加内容字段：

```ts
interface DetectionMethodContent {
  /** 方法原理与适用场景 */
  principle: LocalizedText;
  /** 样品制备与前处理 */
  samplePreparation: LocalizedText;
  /** 仪器、试剂与关键参数 */
  instrumentParameters: LocalizedText;
  /** 系统适用性与对照设置 */
  systemSuitability: LocalizedText;
  /** 数据采集与解读要点 */
  dataInterpretation: LocalizedText;
  /** 与相似性评价的衔接方式（Tier 判定、接受标准引用等） */
  similarityAssessmentLink: LocalizedText;
}

// DetectionMethod 中：
// content?: DetectionMethodContent;
// contentPlaceholder 在有 content 后移除
```

### 第二步：填充方法内容

在 `src/data/characterization-items.ts` 中定位目标方法（按 `item.id` + `method.id`），写入 `content` 字段。

推荐维护方式：

- **批量来源**：扩展 `scripts/generate_data.py`，从结构化 Excel/Markdown 统一生成，避免手改生成文件；
- **单条补全**：直接在生成文件中追加，但下次运行生成脚本前须同步回源数据。

### 第三步：更新渲染组件

在 `src/components/MethodContentPlaceholder.tsx`（或新建 `MethodContentPanel`）中：

- 当 `method.content` 存在 → 渲染完整方法内容面板；
- 否则 → 保持「检测内容待嵌入」占位。

页面路由与布局无需改动，渲染始终由数据驱动。

### 第四步：挂载可行性证明

在 `src/data/reference-cases.ts`（或 `reference-cases-gp2015-remaining.ts`）中为对应 `CharacterizationItem.id` 添加案例：

| 证据等级 | 适用场景 | 要求 |
|----------|----------|------|
| `regulatory-verified` | 审评报告中有完整统计表（均值 + 批数 + 质量范围） | 来源、dataCaveat、verification 必填 |
| `regulatory-narrative` | 审评叙述中有真实数值，但无完整统计表 | 来源、dataCaveat、verification 必填 |
| `illustrative` | 无可引用实测数据，用示意说明评估逻辑 | 必须附带 schematicFigure，不得伪造数值 |

添加或修改案例后运行：

```bash
npm run verify:cases
```

脚本会在翻译 chunk 文件中逐条 grep `verifiableValues`，确保转录值与来源一致。

### 嵌入优先级建议

1. **已有参考案例的 35 项** — 先补全对应方法的 `content`，与案例中的 `methodUsed` 对齐；
2. **结合活性与生物学活性大类** — GP2015 数据最完整，可作为模板；
3. **其余 26 项** — 优先嵌入示意性案例 + 方法学路径，再逐步替换为监管案例；
4. **184 条方法条目** — 同一项目下多个方法可共享部分前处理/仪器参数描述，按 `method.id` 独立维护。

## 技术栈

- **前端**：Next.js 16（App Router）+ React 19 + TypeScript 5（严格模式）
- **样式**：Tailwind CSS 4
- **国际化**：自研 i18n（React Context + `localStorage` 持久化）
- **数据生成**：Python 3 + openpyxl
- **质量校验**：ESLint + TypeScript + 参考案例溯源脚本

## 安装与运行

```bash
npm install
npm run dev          # 开发服务器，默认 http://localhost:3000
```

其他脚本：

```bash
npm run build        # 生产构建（全部页面静态生成）
npm run start        # 运行生产构建
npm run lint         # ESLint 检查
npm run typecheck    # TypeScript 类型检查
npm run verify:cases          # 参考案例溯源校验
npm run verify:demo           # 实机演示公式与 PoC 预言机比对
npm run verify:method-content # 方法学正文（原理）覆盖与 id 链接校验
npm run check                 # 以上四项全部执行
```

## 目录结构

```
src/
├── app/                          # 路由页面
│   ├── page.tsx                  # 总览首页 /
│   ├── category/[key]/           # 大类页
│   ├── item/[id]/                # 项目详情页（方法嵌入的主战场）
│   └── regulatory/               # 法规框架
├── components/
│   ├── MethodContentPlaceholder.tsx   # 方法内容嵌入位（待扩展）
│   ├── MethodSelector.tsx             # 首选/正交方法切换
│   ├── reference-case/                # 参考案例展示（可行性证明）
│   ├── SimilarityAnalysisPlaceholder.tsx  # 相似性分析预留区
│   └── views/                         # 页面级视图
├── data/
│   ├── characterization-items.ts      # 61 项 + 184 方法（脚本生成）
│   ├── reference-cases.ts             # 参考案例（手工维护）
│   ├── reference-cases-gp2015-remaining.ts
│   ├── reference-cases-shared.ts
│   ├── regulatory-framework.ts
│   ├── categories.ts
│   └── selectors.ts
├── i18n/
└── types/models.ts               # 全部数据模型
scripts/
├── generate_data.py              # Excel → TypeScript 数据生成
├── verify_reference_cases.mjs    # 案例溯源机械校验
├── en_translations.py            # 英文机器翻译占位
└── requirements.txt
```

## 数据来源与再生成

框架数据的唯一真实来源：

```
生物类似药评价指导原则/V0.1生物类似药药学比对研究质量属性、检测方法及相似性评价原则汇总表(1).xlsx
```

Excel 修改后重新生成：

```bash
pip install -r scripts/requirements.txt
python scripts/generate_data.py
```

脚本内置校验：61 个项目、9 个补充项、各大类数量、英文翻译覆盖完整性，任一不满足即报错退出。

参考案例的翻译来源（用于溯源校验）：

```
生物类似药审批报告/翻译/output/17_etanercept_szzs/chunks/
```

## 双语说明

- UI 外壳文案在 `src/i18n/messages.ts` 维护，`zh` / `en` 完整。
- 正文数据的每个文本字段均为 `{ zh, en }` 结构：`zh` 来自 Excel 或人工撰写；`en` 为机器翻译占位（**待校对**）。
- 语言切换在页面右上角，选择持久化于 `localStorage`。

## 开源工具调研与可行性证明

除方法内容嵌入外，另有一条并行工作线：调研每类分析方法可用的开源工具，**在本机真正装起来跑一遍**，
用可复现的日志与输出说明它能做到哪一步、在哪一步卡住，并把结论嵌入对应方法的展示位。

- 执行计划与逐步进度：[`docs/tool-survey/implementation-plan.md`](docs/tool-survey/implementation-plan.md)
- 一级结构大类报告：[`docs/tool-survey/01-primary-structure.md`](docs/tool-survey/01-primary-structure.md)
- 可复现的验证脚本与环境：[`tools-poc/`](tools-poc/README.md)
- 运行日志与证据：`docs/tool-survey/evidence/`

工具信息按 `DetectionMethod.id` 维护在 `src/data/method-tools.ts`，由 `MethodToolPanel` 渲染在方法内容嵌入位下方。
有可运行链路的方法，在检测方法模块内嵌**实机演示**（点击即在浏览器当场计算），演示下方有可展开的数据来源、计算原理与独立校验说明。后续大类必须遵守计划中的 S14、S15，不得只交调研文字。

| 大类 | 状态 | 最高部署层级 | 实机演示 |
|------|------|--------------|----------|
| 一级结构（11 项 / 33 方法） | 已完成 | L4（3 条链路） | 完整质量 / 肽图 / QR |
| 其余 7 个大类 | 未开始 | — | — |

`tools-poc/` 与 Next.js 应用隔离。网站演示为浏览器端计算，不调用 Python、不上传质谱文件。

> 「工具能运行」≠「方法学已验证」≠「符合 GxP / 21 CFR Part 11」；
> 「两组数据数值接近」≠「生物类似性成立」。

## 本期明确不做

- 不实现真实相似性计算、统计等效性检验、QR 区间自动计算；
- 不做真实文件上传与后端存储（预留槽位为禁用占位）；
- 不在参考案例中伪造任何实测数值；
- 页面组件不硬编码业务内容，全部来自 `src/data/`。

## 路线图

| 阶段 | 目标 | 状态 |
|------|------|------|
| V0.1 | 框架搭建：61 项结构化 + 184 方法条目 + 法规对照 + 双语 UI | 已完成 |
| V0.2 | **方法嵌入**：184 条方法内容 + 61 项可行性证明 | **进行中** |
| V0.3 | 相似性分析接入：候选药/参照药数据录入与结果展示 | 规划中 |
| V1.0 | 真实计算引擎与统计判定 | 远期 |

## 许可证

待定。
