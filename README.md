# 生物类似药药学相似性分析系统

本系统用于**生物类似药的药学（CMC）相似性分析**：把候选药与参照药放在同一套质量属性、检测方法和评价原则下，做头对头比对，并汇总总体证据。

它是一套可运行的完整产品，而不是只有表格目录的网站。打开后即可浏览特性鉴定与法规框架、对规则完整的项目上传数据进行分析、在综合判别页汇总 61 项证据并导出报告，也可向右下角助手询问方法、规则和当前分析结果。界面为中英文。

分析所依据的质量属性、检测方法与相似性评价原则，来自《V2 生物类似药药学比对研究质量属性、检测方法及相似性评价原则汇总表》（8 个大类、61 个检测项目、184 个方法条目）。

本地默认地址：[http://localhost:3000](http://localhost:3000)。导航为总览、特性鉴定、综合判别、法规框架。

| 你能做的事 | 在哪里 | 系统如何完成 |
|------|------|------|
| 按质量属性与方法做药学比对 | `/`、`/category/[key]`、`/item/[id]` | 方法学正文、工具实录、浏览器演示、审评参考案例 |
| 对候选药 / 参照药数据跑分析 | 项目详情的方法分析区 | 经 `/api/analysis` 转到本机 FastAPI（8765），做质谱或曲线头对头比对 |
| 汇总药学相似性证据 | `/comprehensive-analysis` | 61 项选择器保守汇总；可导入填表包、下载书面报告 |
| 使用已有图谱 | 已编目项目的输入区 | 只读本机 `图谱数据库` 中已映射文件 |
| 解释结果与方法 | 右下角助手 | 本站代理本机 Dify，浏览器不持有密钥 |

本系统用于药学研究、教学与内部评估。它给出的是按项目、按方法的药学比对证据，**不构成生物类似药认定或监管建议**。

> 「工具能运行」≠「方法学已验证」≠「符合 GxP / 21 CFR Part 11」；  
> 「两组数据数值接近」≠「生物类似性成立」。

## 方法覆盖与嵌入进度

**核心任务：将全部 184 个检测分析方法完成嵌入。**

这里的「嵌入」指：

- 为每个方法写明**可操作的分析路径**（原理、样品制备、仪器参数、系统适用性、数据解读、相似性判定衔接）；
- 用**监管审评案例**、**开源工具部署实录**或**浏览器实机演示**证明该路径在生物类似药比对中的**可行性与可接受性**；
- **不要求**对其余尚未嵌入的大类实现计算引擎；**不实现** GxP 合规或监管结论。

一级结构中 V2 Sheet3 **规则完整的 7 个项目**已接入可运行的分析服务（计划 P0–P16，其后纠错见 P17–P24）：网页经 `/api/analysis` 转发到 FastAPI（8765）→ pyOpenMS / UniDec / Comet / 图片降级。游离巯基、二硫键等 Sheet3 未定义规则的项目按 D17 **不跑分析**。P26 另为 SEC 聚集体、酸性电荷变异体、远紫外 CD 三条主方法提供 `curve-overlay` 曲线比对演示，**verdict 固定 REVIEW**。清单与缺口见 [`docs/primary-structure-analysis/16-final-audit.md`](docs/primary-structure-analysis/16-final-audit.md) 及 [`log/CHANGELOG.md`](log/CHANGELOG.md)。

知识库线（S0–S16）与分析软件线（P0–P16 及之后的 P 系列）**不互相覆盖**。

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

数量来自 `characterization-items.ts`（生成文件）、sidecar 与校验脚本，不是估算。

| 模块 | 规模 | 状态 |
|------|------|------|
| 质量属性大类 | 8 类（11 / 15 / 7 / 2 / 7 / 3 / 11 / 5 项） | 已完成 |
| 检测项目 | 61 项（含 9 个补充项） | 已完成（Excel 驱动） |
| 检测方法条目 | 184 条 | 框架已建立；**一级结构 33/33 已嵌入原理 + 工具**；其余 151 条待嵌入 |
| 法规框架 | CTD 申报要求 9 条 + 相似性评价关系 9 条 | 已完成 |
| 参考案例 | 37 个项目已挂载 GP2015 案例 | 进行中（依那西普 BLA 761042 试点） |
| 综合判别 | `/comprehensive-analysis` | 已完成（演示汇总 + 填表包导入/报告下载） |
| 分层抽屉 UI | 全站轨 + 层栈 | 已完成 |
| AI 助手 | 右下角 | 已完成（本机 Dify 代理） |
| 开源工具 PoC | 一级结构 3 条 L4 链路 | 已完成（见 `tools-poc/`） |
| 分析服务 | 一级结构 20 条可分析 + P26 曲线比对 3 条 | P0–P16 完成；P17–P24、P26 见变更日志 |

**一级结构（`primary-structure`）网站嵌入进度**

| 交付项 | 覆盖 | 计划步骤 |
|--------|------|----------|
| 工具与部署面板 | 33 / 33 方法 | S11 |
| 实机演示 + 溯源 | 27 / 33 方法（6 条硬缺口/未做浏览器演示） | S14–S15 |
| 方法学正文·原理 | 33 / 33 方法 | S16 |
| SOP 其余五字段 | 0 / 33（界面标「待嵌入」） | S17+ |

参考案例试点来源：FDA 对 Sandoz GP2015（依那西普，BLA 761042）的多学科审评报告，经结构化转录并附带机械溯源校验。

变更记录见 [`log/CHANGELOG.md`](log/CHANGELOG.md)。实施步骤见 [`implementation-plan.mdc`](implementation-plan.mdc)。

## 系统架构

```
┌──────────────────────────────────────────────────────────────┐
│  展示层  Next.js 16.3 App Router + React 19 + Tailwind CSS 4  │
│          页头导航 + 左侧 SideExplorerRail + 抽屉栈 + 看板娘助手 │
├──────────────────────────────────────────────────────────────┤
│  页面     /  /category/[key]  /item/[id]  /regulatory        │
│          /comprehensive-analysis                              │
├──────────────────────────────────────────────────────────────┤
│  数据层  src/data/（全站内容来源；characterization-items 勿手改）│
├──────────────────────────────────────────────────────────────┤
│  计算层  src/lib/live-demo/     浏览器演示公式（非后端）       │
│          src/lib/comprehensive-analysis/  演示汇总（无后端）   │
│          analysis-service/      FastAPI 8765                 │
│          Next rewrite /api/analysis → 8765                  │
├──────────────────────────────────────────────────────────────┤
│  助手    POST /api/assistant/chat → 本机 Dify /v1              │
│          GET  /api/assistant/health                           │
│          GET  /api/figure-library?file=  本机图谱只读          │
├──────────────────────────────────────────────────────────────┤
│  生成    scripts/generate_data.py  Excel → TypeScript          │
│  校验    npm run check（typecheck + lint + verify:*）       │
└──────────────────────────────────────────────────────────────┘
```

项目详情页（`ItemDetailContent`，项目路由与抽屉层共用）主要包括：

1. **评价字段** — 检测指标、相似性评价方法、判定原则、数值限度（来自 Excel）
2. **检测方法** — 首选/正交方法；选中后按顺序展示方法学正文、分析面板、实机演示、工具面板
3. **参考案例** — 监管审评实例或示意性说明
4. **相似性分析输入区** — 已编目项目展示图谱库图；可分析方法走 `MethodAnalysisPanel` 上传；其余仍为槽位

## 页面与本地运行

需要三件事才能用全功能（站点可单独打开浏览）：

```bash
npm install
npm run dev          # http://localhost:3000 ，会加载 .env.local
```

分析服务（上传质谱 / 曲线比对时需要），命令见 [`analysis-service/README.md`](analysis-service/README.md)。默认：

```powershell
$venv = "..\tools-poc\.venv\Scripts"
$env:WORKSPACE_ROOT = "$PWD\workspaces"
$env:CORS_ORIGINS = "http://localhost:3000"
& "$venv\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8765
```

Next 通过 `ANALYSIS_SERVICE_URL`（默认 `http://127.0.0.1:8765`）把 `/api/analysis/*` 转发到该进程。

AI 助手需要本机已部署的 Dify（控制台默认 [http://127.0.0.1/](http://127.0.0.1/)），以及本仓库根目录 `.env.local`（已被 `.gitignore` 忽略）：

```
DIFY_API_BASE_URL=http://127.0.0.1/v1
DIFY_APP_API_KEY=
DIFY_TIMEOUT_MS=60000
```

不要写成 `NEXT_PUBLIC_*`。未配置 Key 时，`GET /api/assistant/health` 为 `configured: false`，聊天返回 `DIFY_UNCONFIGURED`。

示例页面：

- `/` — 总览
- `/comprehensive-analysis` — 综合判别演示
- `/regulatory` — 法规框架
- `/item/intact-mass` — 原理 + 完整质量演示 + 分析面板
- `/item/free-thiol` — 原理 + QR 演示（不进入分析服务）
- `/item/disulfide-bonds` — 原理 + 工具面板（D17 不跑分析）

其他脚本：

```bash
npm run build
npm run start
npm run lint
npm run typecheck
npm run verify:cases
npm run verify:demo
npm run verify:method-content
npm run verify:schemes
npm run verify:analysis-config
npm run verify:analysis-contract
npm run verify:primary-analysis
npm run verify:comprehensive-analysis
npm run verify:assistant
npm run verify:ui-shell
npm run check                 # 以上校验全部串联
```

## 综合判别（演示）

`/comprehensive-analysis` 对 61 项做**交互式总体证据汇总**，不输出「该产品是生物类似药」。

- 补充项永不进入总体分母；不适用项不进总体分母，但非补充项缺少不适用原因视为未完成。
- 保守优先级：任一参与项「不支持相似」→ 不支持相似性证据；否则若有证据不足 / 未完成 / 无参与项 → 证据不足；全部支持且无缺口 → 支持相似性证据。
- 自由文本不驱动判定；状态只来自选择器或填表包中的明确状态列。
- 浏览器内读取 `.md` / `.txt` / JSON（限制 2 MB），导入后填充会话并可下载 Markdown 报告，不上传后端。示例包：[`docs/demo-comprehensive-assessment/`](docs/demo-comprehensive-assessment/)。

## AI 助手

右下角 Q 版看板娘打开聊天窗，经 `POST /api/assistant/chat` 调用本机 Dify Chatflow（`advanced-chat`，`POST /v1/chat-messages`）。助手只解释系统资料和已有分析结果。

- 知识 Markdown：`knowledge/assistant/`（原库 Biosimilar Similarity Assistant KB）
- 已批准内部复核写入独立知识库 `Biosimilar Human Review KB`，不写入原库
- Chatflow DSL（导出无明文密钥）：`dify/biosimilar-assistant-chatflow.yml`
- 开始节点上下文：`pageUrl, pageTitle, locale, categoryKey, itemId, itemName, methodId, methodName, analysisStatus, analysisResult, analysisProvenance`
- `analysisResult` 只传白名单字段；回复按纯文本渲染
- 除空输入追问外，先给出结构完整的完善回复，再由内部药学人员在 Dify Human Input 中复核解释口径；终端用户不填复核表、不能入库
- 整品认定、看图猜峰、要密钥时仍不越界，但回复必须完整，不得只回一句拒绝
- 助手免责声明原文：「AI 助手仅用于解释系统资料和分析结果，不构成生物类似药认定或监管建议。」
- 入库用的知识库 Key 只放在 Dify 应用环境变量 `HUMAN_REVIEW_DATASET_API_KEY`，不要写入本站 `.env.local` 或 `NEXT_PUBLIC_*`。同时在 Dify 填写 `HUMAN_REVIEW_DATASET_ID` 与 `DIFY_KNOWLEDGE_API_BASE`。

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
| 分析面板配置 | `src/data/method-analysis-config.ts` | `npm run verify:analysis-config` |
| 实机演示映射 | `src/data/live-demos.ts` + `src/lib/live-demo/*` | `npm run verify:demo` |
| 演示溯源 | `src/data/live-demo-provenance.ts` | — |
| 参考案例 | `src/data/reference-cases*.ts` | `npm run verify:cases` |
| 分析契约 | `src/types/analysis-contract.ts` | `npm run verify:analysis-contract` |
| 分析服务测试 | `analysis-service/tests/` | `npm run verify:primary-analysis` |
| 综合判别 | `src/lib/comprehensive-analysis/` | `npm run verify:comprehensive-analysis` |
| 助手代理 | `src/lib/assistant/` | `npm run verify:assistant` |

**大类全覆盖规则**：某大类只要有一条方法写了原理，`verify:method-content` 会强制该大类**全部**方法都有原理。

### 渲染逻辑（`MethodSelector`）

```
方法标签
  → MethodContentPanel     （getMethodContent(id) 有值）
  → MethodAnalysisPanel    （method-analysis-config 有条目）
  → MethodLiveDemo         （getLiveDemoKind(id) 有值）
  → MethodContentPlaceholder （正文与演示皆无）
  → MethodToolPanel        （始终；未调研大类显示未调研）
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
2. **已有参考案例的项目** — 方法正文与案例中的 `methodUsed` 对齐；
3. **184 条方法** — 同一项目下多个方法可共享部分前处理/仪器参数描述，按 `method.id` 独立维护 sidecar。

## 技术栈

- **前端**：Next.js 16.3.0（App Router）+ React 19.2.8 + TypeScript 5.9.3（严格模式）
- **样式**：Tailwind CSS 4.3.3
- **国际化**：自研 i18n（React Context + `localStorage`）
- **数据生成**：Python 3 + openpyxl
- **分析服务**：FastAPI + pyOpenMS / UniDec / Comet（虚拟环境在 `tools-poc/.venv`）
- **助手**：本机 Dify 1.14.x Chatflow（先完善回复，再内部 Human Input），本站服务端代理 `/v1/chat-messages`
- **质量校验**：ESLint + TypeScript + `verify:*.mjs` + 分析服务 pytest

## 目录结构

```
src/
├── app/
│   ├── page.tsx
│   ├── category/[key]/
│   ├── item/[id]/
│   ├── regulatory/
│   ├── comprehensive-analysis/
│   └── api/
│       ├── assistant/chat|health
│       └── figure-library/
├── components/
│   ├── assistant/                   # 看板娘与聊天面板
│   ├── drawer/                      # 层栈与层壳
│   ├── layout/                      # 页头、页脚、左侧轨
│   ├── comprehensive-analysis/
│   ├── MethodContentPanel.tsx
│   ├── MethodAnalysisPanel.tsx
│   ├── MethodSelector.tsx
│   ├── MethodToolPanel.tsx
│   ├── analysis/                   # 图谱库输入、谱图可视化
│   ├── live-demo/
│   ├── reference-case/
│   └── views/
├── data/                            # 见上表；characterization-items.ts 勿手改
├── lib/assistant/
├── lib/comprehensive-analysis/
├── lib/live-demo/
├── lib/analysis-service-client.ts
├── i18n/
└── types/
scripts/                             # 生成与 verify_*
analysis-service/                   # FastAPI 8765
knowledge/assistant/                 # 助手知识 Markdown
dify/biosimilar-assistant-chatflow.yml
docs/primary-structure-analysis/
docs/tool-survey/
docs/demo-comprehensive-assessment/
tools-poc/
log/
```

## 数据来源与再生成

生成脚本当前读取的工作簿（V0.1 文件已不在工作区；V2 Sheet1/2 内容经列偏移后与已提交 TypeScript 一致，见 `scripts/generate_data.py`）：

```
生物类似药评价指导原则/V2-生物类似药药学比对研究质量属性、检测方法及相似性评价原则汇总表.xlsx
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

图谱文件留在工作区 `图谱数据库/`，由 `src/data/figure-library-catalog.json` 编目；`GET /api/figure-library` 只返回已编目文件名。

## 双语说明

- UI 外壳文案在 `src/i18n/messages.ts` 维护，`zh` / `en` 成对。
- 正文数据的每个文本字段均为 `{ zh, en }`：`zh` 来自 Excel 或人工撰写；`en` 多为机器翻译或占位（**待校对**）。
- 语言切换在页面右上角。

## 开源工具调研与可行性证明

| 资源 | 路径 |
|------|------|
| 执行计划与进度（S0–S16） | [`docs/tool-survey/implementation-plan.md`](docs/tool-survey/implementation-plan.md) |
| 一级结构分析软件（P0–P16） | [`docs/primary-structure-analysis/implementation-plan.md`](docs/primary-structure-analysis/implementation-plan.md) |
| 一级结构分析最终审计 | [`docs/primary-structure-analysis/16-final-audit.md`](docs/primary-structure-analysis/16-final-audit.md) |
| 一级结构大类报告 | [`docs/tool-survey/01-primary-structure.md`](docs/tool-survey/01-primary-structure.md) |
| PoC 环境与脚本 | [`tools-poc/`](tools-poc/README.md) |
| 网站交付变更日志 | [`log/CHANGELOG.md`](log/CHANGELOG.md) |
| 站点功能实施计划 | [`implementation-plan.mdc`](implementation-plan.mdc) |

**进入下一大类前须满足**（计划 S13）：S11 工具嵌入 + S14–S15 实机演示与溯源 + S16 方法学原理全覆盖。

| 大类 | 工具调研 | 最高 PoC 层级 | 网站演示 | 原理 |
|------|----------|---------------|----------|------|
| 一级结构（11 项 / 33 方法） | 已完成 | L4（3 条链路） | 27 / 33 | 33 / 33 |
| 其余 7 个大类 | 未开始 | — | — | — |

浏览器演示使用 TypeScript 当场计算（公开序列 UniProt P02769 或明示合成数据），**不**调用 `tools-poc` 中的 Python 进程。质谱 RAW / mzML 上传走 `MethodAnalysisPanel` → `analysis-service`，与演示层分离。请先将厂商 RAW/WIFF 转为 mzML 或 TXT/CSV 再上传。

## 本期明确不做

- 不实现面向生产的相似性判定、统计等效性检验或 GxP / 21 CFR Part 11 合规流程；
- 不输出整品「是/不是生物类似药」结论（综合判别页与助手均禁止）；
- 不对一级结构中规则未定义的项目运行分析（D17）；不对看图结果做峰识别认定；
- 不在参考案例、演示或图片降级中冒充实测图谱或监管结论；
- 不把 UniDec / pyOpenMS / Comet 接入 Next.js 运行时（计算在 FastAPI 进程）；
- 不把 Dify API Key 写入前端或 `NEXT_PUBLIC_*`；
- 页面组件不硬编码业务内容，全部来自 `src/data/` 与 sidecar。

（浏览器 QR 演示仅复现 PoC 判定**公式**与合成批次，不等于已完成方法学验证，也不进入分析服务。P26 曲线比对同样是演示，法规 verdict 为 REVIEW。）

## 路线图

| 阶段 | 目标 | 状态 |
|------|------|------|
| V0.1 | 框架：61 项 + 184 方法 + 法规 + 双语 UI | 已完成 |
| V0.2 | 方法嵌入：184 条正文 + 工具实录 + 演示 + 可行性证明 | **进行中**（一级结构网站层 S11/S14–S16 已完成） |
| V0.3 | 一级结构分析软件：7 个规则完整项目全链路 | **已完成**（P0–P16）；其后 P17–P24、P26 为纠错与演示扩展 |
| 演示层 | 综合判别、抽屉 UI、Dify 助手、图谱库输入 | 已完成 |
| V1.0 | 其余大类引擎、统计判定、GxP | 远期 |

## 许可证

待定。
