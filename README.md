# 生物类似药药学相似性分析系统

基于《V0.1 生物类似药药学比对研究质量属性、检测方法及相似性评价原则汇总表》构建的结构化 Web 框架。系统将 61 个检测项目、184 个检测方法条目组织为可浏览、可扩展的双语站点，并为每一类分析方法预留**嵌入路径**与**可行性证明**。

## 项目目标（当前阶段）

**核心任务：将全部 184 个检测分析方法完成嵌入。**

这里的「嵌入」指：

- 为每个方法写明**可操作的分析路径**（原理、样品制备、仪器参数、系统适用性、数据解读、相似性判定衔接）；
- 用**监管审评案例**、**开源工具部署实录**或**浏览器实机演示**证明该路径在生物类似药比对中的**可行性与可接受性**；
- **不要求**在本阶段实现真实的计算引擎、文件上传、GxP 合规或监管结论。

换言之：本阶段交付的是**结构化方法知识库 + 可追溯的可行性证据**，而非自动化分析软件。

> 「工具能运行」≠「方法学已验证」≠「符合 GxP / 21 CFR Part 11」；  
> 「两组数据数值接近」≠「生物类似性成立」。

### 完成标准

对每个检测方法条目，至少应满足：

| 维度 | 要求 |
|------|------|
| 方法学正文 | 在 `src/data/method-content.ts` 按 `method.id` 填入 `DetectionMethodContent`（**原理**优先；其余 SOP 字段逐步补全） |
| 工具与部署 | 在 `src/data/method-tools.ts` 记录开源工具调研结论（许可证、部署层级、证据路径） |
| 实机演示 | 有可运行链路的方法须在检测方法模块内嵌浏览器当场计算 + 可展开溯源（计划 S14–S15） |
| 分析路径 | 从样品到结论的流程可逐步阅读，与框架中的判定原则 / 数值限度对齐 |
| 可行性证明 | 至少满足以下之一：监管审评参考案例（`reference-cases`）、PoC 部署实录、或明确标注的示意性说明 |
| 可追溯性 | 真实数据案例须带来源、局限性说明与 `npm run verify:cases` 可校验的溯源字段 |

## 当前进展

| 模块 | 规模 | 状态 |
|------|------|------|
| 质量属性大类 | 8 类 | 已完成 |
| 检测项目 | 61 项（含 9 个补充项） | 已完成（Excel 驱动） |
| 检测方法条目 | 184 条 | 框架已建立；**一级结构 33/33 已嵌入原理 + 工具 + 演示**；其余 151 条待嵌入 |
| 法规框架 | CTD 申报要求 9 条 + 相似性评价关系 9 条 | 已完成 |
| 参考案例 | 35 / 61 项已挂载案例 | 进行中（GP2015 试点） |
| 相似性分析槽位 | 61 项均已预留 | 占位阶段，本期不实现 |
| 开源工具 PoC | 一级结构 3 条 L4 链路 | 已完成（见 `tools-poc/`） |

**一级结构（`primary-structure`）网站嵌入进度**

| 交付项 | 覆盖 | 计划步骤 |
|--------|------|----------|
| 工具与部署面板 | 33 / 33 方法 | S11 |
| 实机演示 + 溯源 | 27 / 33 方法（6 条硬缺口/未做浏览器演示） | S14–S15 |
| 方法学正文·原理 | 33 / 33 方法 | S16 |
| SOP 其余五字段 | 0 / 33（界面标「待嵌入」） | S17+ |

参考案例试点来源：FDA 对 Sandoz GP2015（依那西普，BLA 761042）的多学科审评报告，经结构化转录并附带机械溯源校验。

变更记录见 [`log/CHANGELOG.md`](log/CHANGELOG.md)。

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│  展示层  Next.js App Router + React 19 + Tailwind CSS 4     │
├─────────────────────────────────────────────────────────────┤
│  组件层  ItemDetailView / MethodSelector / MethodContentPanel │
│          MethodLiveDemo / MethodToolPanel / ReferenceCase…    │
├─────────────────────────────────────────────────────────────┤
│  数据层  src/data/  （全站唯一内容来源，数据驱动渲染）        │
│    ├── characterization-items.ts   ← 61 项 + 184 方法（生成） │
│    ├── method-content.ts           ← 方法学正文 sidecar       │
│    ├── method-tools.ts             ← 开源工具调研 sidecar     │
│    ├── live-demos.ts               ← 实机演示路由与默认数据   │
│    ├── live-demo-provenance.ts     ← 演示溯源条目             │
│    ├── reference-cases*.ts         ← 可行性证明案例           │
│    ├── regulatory-framework.ts     ← 法规对照                 │
│    └── categories.ts               ← 8 大类定义               │
├─────────────────────────────────────────────────────────────┤
│  计算层  src/lib/live-demo/        ← 浏览器演示公式（非后端） │
├─────────────────────────────────────────────────────────────┤
│  生成层  scripts/generate_data.py  ← Excel → TypeScript     │
│  校验层  verify_reference_cases.mjs                           │
│          verify_live_demo.mjs / verify_method_content.mjs     │
└─────────────────────────────────────────────────────────────┘
```

每个检测项目详情页由四块内容组成：

1. **评价字段** — 检测指标、相似性评价方法、判定原则、数值限度（来自 Excel）
2. **检测方法** — 首选/正交方法切换；选中后在同一区块内按顺序展示：
   - **方法学正文**（`MethodContentPanel`，原理已嵌入时）
   - **实机演示**（`MethodLiveDemo`，有演示时；含可展开溯源）
   - **虚线占位**（仅当既无正文又无演示时）
   - **开源工具与部署实录**（`MethodToolPanel`）
3. **参考案例** — 监管审评实例或示意性说明
4. **相似性分析预留区** — 候选药/参照药数据录入与结果展示槽位（本期占位）

## 分析方法嵌入路径

方法学正文、工具信息、演示配置均通过 **sidecar 文件**按 `DetectionMethod.id` 索引，**不手改** `characterization-items.ts`（Excel 生成文件）。

### 数据模型

`DetectionMethodContent` 定义于 `src/types/models.ts`：

```ts
interface DetectionMethodContent {
  principle: LocalizedText;              // 本轮优先填充
  samplePreparation?: LocalizedText;
  instrumentParameters?: LocalizedText;
  systemSuitability?: LocalizedText;
  dataInterpretation?: LocalizedText;
  similarityAssessmentLink?: LocalizedText;
}
```

生成文件中的 `DetectionMethod.contentPlaceholder: true` 在 sidecar 未覆盖全部 SOP 字段前保留。

### 推荐维护方式

| 内容 | 文件 | 校验命令 |
|------|------|----------|
| 方法学正文 | `src/data/method-content.ts` | `npm run verify:method-content` |
| 工具调研 | `src/data/method-tools.ts` | — |
| 实机演示映射 | `src/data/live-demos.ts` + `src/lib/live-demo/*` | `npm run verify:demo` |
| 演示溯源 | `src/data/live-demo-provenance.ts` | — |
| 参考案例 | `src/data/reference-cases*.ts` | `npm run verify:cases` |

**大类全覆盖规则**：某大类只要有一条方法写了原理，`verify:method-content` 会强制该大类**全部**方法都有原理。

### 渲染逻辑（`MethodSelector`）

```
方法标签
  → MethodContentPanel     （getMethodContent(id) 有值）
  → MethodLiveDemo         （getLiveDemoKind(id) 有值）
  → MethodContentPlaceholder （两者皆无）
  → MethodToolPanel        （始终）
```

新增演示时：先写 `live-demo-provenance.ts` 对应条目，再挂组件（计划 S15 强制）。

### 挂载可行性证明

在 `src/data/reference-cases.ts`（或 `reference-cases-gp2015-remaining.ts`）中为对应 `CharacterizationItem.id` 添加案例：

| 证据等级 | 适用场景 | 要求 |
|----------|----------|------|
| `regulatory-verified` | 审评报告中有完整统计表（均值 + 批数 + 质量范围） | 来源、dataCaveat、verification 必填 |
| `regulatory-narrative` | 审评叙述中有真实数值，但无完整统计表 | 来源、dataCaveat、verification 必填 |
| `illustrative` | 无可引用实测数据，用示意说明评估逻辑 | 必须附带 schematicFigure，不得伪造数值 |

### 嵌入优先级建议

1. **按大类推进** — 完成 S11 + S14–S16 后再进入下一大类（见工具调研计划 S13）；
2. **已有参考案例的 35 项** — 方法正文与案例中的 `methodUsed` 对齐；
3. **184 条方法** — 同一项目下多个方法可共享部分前处理/仪器参数描述，按 `method.id` 独立维护 sidecar。

## 技术栈

- **前端**：Next.js 16（App Router）+ React 19 + TypeScript 5（严格模式）
- **样式**：Tailwind CSS 4
- **国际化**：自研 i18n（React Context + `localStorage` 持久化）
- **数据生成**：Python 3 + openpyxl
- **工具 PoC**：Python 3.10 虚拟环境（`tools-poc/.venv`，与 Next.js 隔离）
- **质量校验**：ESLint + TypeScript + 三项机械校验脚本（见下）

## 安装与运行

```bash
npm install
npm run dev          # 开发服务器，默认 http://localhost:3000
```

示例页面：

- `/item/intact-mass` — 原理 + 完整质量演示 + 工具面板
- `/item/free-thiol` — 原理 + QR 演示 + 工具面板
- `/item/disulfide-bonds` — 原理 + 工具面板（无二硫键浏览器演示）

其他脚本：

```bash
npm run build                 # 生产构建（74 页静态生成）
npm run start                 # 运行生产构建
npm run lint                  # ESLint
npm run typecheck             # TypeScript
npm run verify:cases          # 参考案例溯源（grep 翻译 chunk）
npm run verify:demo           # 实机演示公式 vs PoC 预言机
npm run verify:method-content # 方法学正文覆盖与 method id 链接
npm run check                 # 以上全部
```

## 目录结构

```
src/
├── app/                              # 路由
│   ├── page.tsx                      # 总览 /
│   ├── category/[key]/               # 大类页
│   ├── item/[id]/                    # 项目详情（方法嵌入主战场）
│   └── regulatory/                   # 法规框架
├── components/
│   ├── MethodContentPanel.tsx        # 方法学正文（原理 + 待嵌入标签）
│   ├── MethodContentPlaceholder.tsx  # 无正文且无演示时的虚线占位
│   ├── MethodSelector.tsx            # 方法切换 + 四层堆叠
│   ├── MethodToolPanel.tsx           # 开源工具与部署实录
│   ├── live-demo/                    # 实机演示与溯源 UI
│   ├── reference-case/
│   └── views/
├── data/
│   ├── characterization-items.ts     # 61 项 + 184 方法（脚本生成，勿手改）
│   ├── method-content.ts             # 方法学正文 sidecar
│   ├── method-tools.ts               # 工具调研 sidecar
│   ├── live-demos.ts                 # 演示 kind 映射
│   ├── live-demo-provenance.ts       # 演示溯源
│   ├── reference-cases*.ts
│   ├── regulatory-framework.ts
│   └── categories.ts
├── lib/live-demo/                    # 浏览器演示计算（非 UniDec/pyOpenMS）
├── i18n/
└── types/models.ts
scripts/
├── generate_data.py
├── verify_reference_cases.mjs
├── verify_live_demo.mjs
├── verify_method_content.mjs
└── requirements.txt
docs/tool-survey/                     # 工具调研计划、大类报告、PoC 证据
tools-poc/                            # Python 隔离环境与 s09 链路
log/                                  # 网站交付变更日志（非 PoC stdout）
```

## 数据来源与再生成

框架 Excel 的唯一真实来源：

```
生物类似药评价指导原则/V0.1生物类似药药学比对研究质量属性、检测方法及相似性评价原则汇总表(1).xlsx
```

Excel 修改后重新生成：

```bash
pip install -r scripts/requirements.txt
python scripts/generate_data.py
```

脚本内置校验：61 个项目、9 个补充项、各大类数量、英文翻译覆盖完整性，任一不满足即报错退出。

参考案例的翻译来源（用于 `verify:cases`）：

```
生物类似药审批报告/翻译/output/17_etanercept_szzs/chunks/
```

## 双语说明

- UI 外壳文案在 `src/i18n/messages.ts` 维护，`zh` / `en` 完整。
- 正文数据的每个文本字段均为 `{ zh, en }` 结构：`zh` 来自 Excel 或人工撰写；`en` 为机器翻译或占位（**待校对**）。
- 语言切换在页面右上角，选择持久化于 `localStorage`。

## 开源工具调研与可行性证明

除方法内容嵌入外，并行工作线：调研每类分析方法可用的开源工具，**在本机装起来跑一遍**，用日志与输出说明能到哪一步，并把结论嵌入网站。

| 资源 | 路径 |
|------|------|
| 执行计划与进度（S0–S16） | [`docs/tool-survey/implementation-plan.md`](docs/tool-survey/implementation-plan.md) |
| 一级结构大类报告 | [`docs/tool-survey/01-primary-structure.md`](docs/tool-survey/01-primary-structure.md) |
| PoC 环境与脚本 | [`tools-poc/`](tools-poc/README.md) |
| PoC 运行 stdout | `docs/tool-survey/evidence/*.log` |
| 网站交付变更日志 | [`log/CHANGELOG.md`](log/CHANGELOG.md) |

**进入下一大类前须满足**（计划 S13）：S11 工具嵌入 + S14–S15 实机演示与溯源 + S16 方法学原理全覆盖。

| 大类 | 工具调研 | 最高 PoC 层级 | 网站演示 | 原理 |
|------|----------|---------------|----------|------|
| 一级结构（11 项 / 33 方法） | 已完成 | L4（3 条链路） | 27 / 33 | 33 / 33 |
| 其余 7 个大类 | 未开始 | — | — | — |

浏览器演示使用 TypeScript 当场计算（公开序列 UniProt P02769 或明示合成数据），**不**调用 `tools-poc` 中的 Python 进程，**不**上传质谱 RAW 文件。

## 本期明确不做

- 不实现面向生产的相似性判定、统计等效性检验或 GxP 合规流程；
- 不做真实文件上传与后端存储（预留槽位为禁用占位）；
- 不在参考案例或演示中冒充实测图谱或监管结论；
- 不把 UniDec / pyOpenMS 接入 Next.js 运行时；
- 页面组件不硬编码业务内容，全部来自 `src/data/` 与 sidecar。

（浏览器 QR 演示仅复现 PoC 判定**公式**与合成批次，不等于已完成方法学验证。）

## 路线图

| 阶段 | 目标 | 状态 |
|------|------|------|
| V0.1 | 框架搭建：61 项 + 184 方法 + 法规 + 双语 UI | 已完成 |
| V0.2 | 方法嵌入：184 条正文 + 工具实录 + 演示 + 61 项可行性证明 | **进行中**（一级结构网站层 S11/S14–S16 已完成） |
| V0.3 | 相似性分析接入：候选药/参照药数据录入与结果展示 | 规划中 |
| V1.0 | 真实计算引擎与统计判定 | 远期 |

## 许可证

待定。
