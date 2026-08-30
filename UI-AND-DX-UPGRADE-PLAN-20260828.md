# BioCompare 五项体验优化 · 实施指令（20260828）

> 本文档是给实施 AI 的完整执行说明书。请**严格按照本文档执行**，按 A→E 顺序依次完成，每个工作流做完先自测再进入下一个。
> 总原则：**不新增任何依赖**（前端零新包、后端零新包）；动画只用 CSS（transform/opacity 为主）；所有新样式必须复用现有 CSS 变量并兼容深色主题；改动以最小化为先，禁止重写无关代码。

---

## 现状关键事实（已核实，实施前不要重复探索）

- 前端：Next.js 16.3 App Router + React 19，`pnpm typecheck` 做类型检查；样式全部在 `app/globals.css`（单文件、自定义类，无 Tailwind）。已存在设计令牌（`--page/--surface/--brand/--brand-soft/--card-shadow` 等）与动画（`@keyframes disclosure-in`、`number-rise`，过渡统一约 240ms）。
- Word 导出链路：`app/project-provider.tsx` 的 `exportReport()`（400-410 行）把**全部** `runs`（含未启动/待接入/失败）POST 到 `${backendUrl}/reports/export-docx`；`backend/docx_report.py` 65 行把所有 modules 逐行写进"专项状态总表"。**未运行专项也会出现在文档里**——这是本次要修的点 A。
- 统一入口：`importProjectMaterials()`（provider 341-382 行）解析 Excel 表格路由 + mzML/FASTA 原始数据束（`rawPtmBundle`，后端按文件名 R\d+/C\d+ 自动判角色）。**若 `RAW-BUNDLE-AUTO-DISPATCH-PLAN-20260828.md` 尚未实施，先实施那份计划再做本文件 B 项**；若已实施，B 项在其基础上扩展。
- AI 助手：`app/ai-chat-widget.tsx`（浮动组件）+ `backend/chat_gateway.py`（`POST /api/chat` SSE 流式）+ `.env.local` 的 `AI_BASE_URL/AI_API_KEY/AI_MODEL`。当前无项目上下文、不显示模型来源。
- 侧栏：`app/workspace-shell.tsx`（结构：brand 行、project-switcher、primary-nav、module-nav 的 nav-group-card 分组、sidebar-bottom）+ globals.css 71-72 行样式段。

---

## A. Word 导出：只写"本次实际运算"的结果

**目标**：导出的 Word 只包含本次实际执行且有结果的专项；未运行的专项一律不出现（不写"未启动""待接入""未连接"之类占位内容）。

**改动**：

1. `app/project-provider.tsx` `exportReport()`：构造 `modules` 时过滤，只保留满足以下条件的专项：
   - `run.status` 为 `completed` 或 `attention`，**且**存在任一结果载荷（`result/ptmResult/sequenceResult/ptmMapResult/glycanResult/chromatographyResult/covalentResult` 至少一个非空）；
   - `failed` 的专项默认排除（可保留一个附录小节"执行失败专项"仅列 code+错误一句话，若实现简单则加，复杂则不加）。
   - 请求体中附带 `batchLabel`（如 `整套材料自动调度`/`手动单发`，取各 run 的 `source` 众数）与 `completedAt` 最新时间，供文档标题下方的说明行使用。
2. `backend/docx_report.py`：加防御性过滤——`modules` 里任何没有结果详情的条目直接跳过，不再生成占位行；文档开头的专项状态总表只列实际有结果的专项。若 `modules` 为空，返回 400 与明确错误信息（前端已拦截，后端兜底）。
3. 若没有任何可导出结果，前端按钮置灰逻辑：`exportReport` 按钮的 `disabled` 条件从 `!completedCount` 保持不变（completedCount 已含 attention），但点击后若过滤结果为空则 `setError("本次运算尚无可导出的结果")`，不发请求。

**验收**：跑完 12 个专项导出 → 文档恰好 12 个专项、无占位行；只跑 3 个再导出 → 只含这 3 个；什么都不跑点导出 → 页面提示且不生成文档。

## B. 智能识别升级：自动判断数据类型，尽量多调度

**目标**：上传任何一批文件后，系统自动识别每类数据能支撑哪些专项，把有输入的专项尽可能全部自动调度；识别不了的明确提示，不瞎猜。

**前置**：`RAW-BUNDLE-AUTO-DISPATCH-PLAN-20260828.md`（肽图束→6 专项自动调度）已实施。

**改动**：

1. `backend/submission_parser.py` 扩展内容签名识别（在现有表格表头别名机制上扩展，不新建解析框架）：
   - **色谱/电泳数据**（PUR-01~07）：CSV/TSV/XLSX 表头同时含时间轴与信号列（`time/retention/迁移时间` + `intensity/signal/吸光度/荧光`）→ 识别为色谱原始数据；按文件名 R\d+/C\d+ 或"参照/候选"关键词判角色；
   - **糖型定量表**（GLY-02~06）：表头含 `glycan/糖型/peak_area/峰面积` 组合 → 识别为糖型表；
   - **游离巯基结果表**（COV-01）：表头含 `SH/mol.*protein|游离巯基` 类字段；
   - 识别结果进入返回 JSON 新增的 `rawDatasets` 数组（元素：`{kind: "chromatography"|"glycan"|"free-thiol", role, fileNames[]}`）；无法判断角色的进 `warnings`（沿用现有警告通道文案风格），**不强行分配**。
2. 前端 `importProjectMaterials()`：拿到 `rawDatasets` 后，把对应 File 对象填入匹配专项的 `files` 槽（chromatography→PUR 各模块、glycan→GLY 各模块按现有 runChromatography/runGlycan 的输入要求：candidate+reference 各一）；同 kind 多文件时按角色各取第一个，多余文件记入提示。沿用既有 `setAutoDispatchArmed(true)` 机制自动触发 `runAll(true)`。
3. `app/project/page.tsx`：route preview 对这些专项同样显示"已就绪（自动识别）"态（复用 A 前一份计划的 bundleReady 覆盖逻辑，扩展 kind 判断）。
4. 识别边界写清楚：mzML/FASTA 束沿用现有规则；一份文件只归属一类；系统无法识别的文件在"解析预警"里列出"该文件未能自动识别，请在专项页手动分配"。

**验收**：Excel+肽图束+一张 R/C 色谱 CSV 一起上传 → 12+色谱类专项自动排队；上传无法识别的文件 → 出现明确警告、不误调度；`pnpm typecheck` 通过；后端重启后 `/project-materials/inspect` 对新色谱样本返回正确 `rawDatasets`（用 curl 自测一次并记录返回）。

## C. AI 助手：界面升级 + 答案数据来源

**目标**：助手更好看；每条回答能看出"是谁答的、依据了什么"。

**改动**：

1. **数据来源（后端）** `backend/chat_gateway.py` + `service.py`：
   - `ChatRequest` 增加可选字段 `contextSummary: str`（≤2000 字符）；`stream_chat_reply()` 将其追加到系统提示词末尾，并加一句指令："回答涉及项目数据时，必须引用对应专项编号（如 PTM-06、IM-01），没有依据时明确说明'当前上下文未包含该数据'"；
   - SSE 在 `[DONE]` 前追加一个元事件 `data: {"meta":{"model":"<AI_MODEL值>","contextChars":N}}`。
2. **数据来源（前端）** `app/ai-chat-widget.tsx`：
   - 组件从 `useProject()` 取 `runs/completedCount/calculationHistory`，生成压缩上下文（每个已完成专项一行：code、状态、核心结论一两句——从各 result 的 summary 字段提取，写一个小函数，无法提取就只给 code+状态），随每次请求发送 `contextSummary`；
   - 收到 `meta` 事件后在对应回答气泡底部渲染来源条：`⚙ 模型：glm-4-flash · 📎 已引用项目状态（8 项）`（未附带上下文时显示 `未附带项目数据`）；
   - **重要**：上下文只在本地后端与模型间传递，不引入任何新第三方服务。
3. **界面升级**（改 `ai-chat-widget.tsx` + globals.css 的 ai-chat 样式段，不加包）：
   - 面板加宽到 `min(420px, …)`，头部用 `linear-gradient(135deg,var(--nav),#134a52)` + 呼吸状态点动画；
   - 消息气泡区分角色头像（助手：品牌色圆形"B"，用户："审"沿用现有 avatar 风格）；气泡入场 `fade-slide` 动画（新 keyframes，180ms）；
   - 流式输出时显示三点"思考中"动画（气泡内 CSS 动画），收到首个 delta 后替换；
   - 轻量 Markdown：仅支持 `**粗体**`、换行、`- ` 列表（用一个 ~30 行的纯函数把文本切成 React 节点，禁止引入 markdown 库）；
   - 输入区：textarea 自适应行数（1~4 行），发送按钮带加载态；深浅主题均正常（只用 CSS 变量）。

**验收**：问"我这个项目哪些专项超出了参照区间？"→ 回答引用专项编号；气泡底部显示模型名与上下文项数；`AI_API_KEY` 未配置时错误样式不破版；深色主题下打开无样式错乱；`pnpm typecheck` 通过。

## D. 全局 UI 动效升级

**目标**：整体质感上一个层级，风格与汇总报告页一致（克制的专业感，不是花哨）。

**改动**（全部 CSS 为主，个别组件加 className/style 钩子）：

1. **统一动效令牌**：globals.css 定义 `--ease-out:cubic-bezier(.22,.8,.36,1)`、`--dur-fast:160ms`、`--dur-base:240ms`；现有 240ms 过渡统一替换为令牌。
2. **列表级联入场**：`route-item`（route preview）、`.metric`（KPI）、`.module-accordion-item`、`.report-kpi article` 增加 `animation: rise-in 320ms var(--ease-out) both` + `animation-delay: calc(var(--i)*40ms)`（在对应组件 map 时用 `style={{ "--i": index }}` 传序号；不支持的旧浏览器自然退化为无延迟）。
3. **数字滚动**：`summary-statistics .metric strong`、`.report-kpi strong` 用纯 JS 小组件 `CountUp`（约 25 行，requestAnimationFrame，600ms ease-out，进入视口才触发用 IntersectionObserver，同样无依赖）替换直接渲染数值；保留 `font-variant-numeric: tabular-nums`。
4. **进度反馈**：`.progress-track span` 增加流光动画（伪元素渐变扫过，running 态专属类）；`.status-chip.queued/.running` 加轻微 pulse；完成态切换时 `pop`（scale 1→1.06→1，180ms）。
5. **面板与卡片**：`.panel/.metric/.overview-entry-card` hover 提升 1px + 阴影加深已有，统一改为 translateY(-2px)；`.disclosure-body` 展开 velocity 保持 `disclosure-in`。
6. **无障碍**：所有新增动画包进 `@media (prefers-reduced-motion: reduce){ animation:none; transition:none }`。

**验收**：上传→识别→自动调度的全流程中至少 5 处可感知动效（KPI 滚动、路由级联、进度流光、状态 pop、面板 hover）；开启动画后页面无可察觉卡顿（组件 200+ 个 route-item 场景下仍流畅）；`prefers-reduced-motion` 开启时全部静止；深浅主题均正常。

## E. 左侧菜单栏美化

**目标**：分组卡更协调、更精致；层级清晰、呼吸感一致。

**改动**（优先只动 `globals.css` 71-72 行样式段；`workspace-shell.tsx` 仅在必要时加类名，不改 DOM 结构）：

1. **分组卡统一节奏**：`.nav-group-card` 间距、内边距、圆角统一（`margin 10px 0`、`padding 5px`、`radius 11px`）；组与组之间用同一种细分隔（`border-bottom: 1px solid #ffffff0a` 于组标题行，去掉卡片的边框堆叠感，整体更"嵌入式"）。
2. **组标题行**：图标 20px 网格对齐（`place-items:center`），文字 13px/600，计数徽章统一 `min-width:26px` 右对齐；hover 时仅图标描边变亮 + 背景 `#ffffff0d`，不整块变色。
3. **项目条目**：`.module-nav-item` 行高、点与文字间距统一（点 8px、gap 10px）；active 态左侧指示条改为 3px 圆头短条（高 60%、居中）+ 背景 `#22b8ae1f`；planned 项透明度与点样式统一（空心点、文字 #80959a 一致化）。
4. **微动效**：分组展开时 `.nav-group-projects` 用既有 `disclosure-in`，但子项加 `calc(var(--i)*20ms)` 级联（在 workspace-shell 渲染时传 `--i`）；active 指示条与 hover 背景过渡 160ms；折叠态（sidebar-is-collapsed）下组标题只留图标并居中，hover 出原生 title 提示（已用 title 属性则不动）。
5. **滚动条与底部**：module-nav 滚动条样式统一（4px、圆角、`#ffffff26`）；`.sidebar-bottom` 的 engine-card 与 profile 风格与新分组卡一致（同圆角/边框/内距）。
6. 全部颜色仅用既有变量或现有侧栏色系微调值，保证深色主题不变（侧栏本身深色，两主题共用）。

**验收**：侧栏 10 个分组视觉节奏一致（组间距、徽章、行高肉眼对齐）；展开/收起/切换 active 均有顺滑动效；折叠态不破版；文字不换行溢出（长项目名 ellipsis 保留）；`pnpm typecheck` 通过。

---

## 总体验收与交付要求

1. 每个工作流（A~E）完成后立即按各自验收标准自测，**全部完成**后执行：`pnpm typecheck`；重启前端（后端仅 A/B 涉及需重启：先结束本项目 uvicorn 进程再运行根目录 `Start-BioCompare.cmd`）。
2. 用桌面 `BioCompare_统一上传_合成测试材料.xlsx` + `BioCompare_后六项_数据束` 5 个文件做端到端验证：上传 → 自动识别 → 自动调度 → 汇总报告 → 导出 Word（只含实际结果项）→ AI 助手引用专项编号回答。
3. 交付说明按工作流分节汇报：改了哪些文件、验收逐条结论、以及 B/C 中任何引擎或识别失败的真实报错原文（如实记录，禁止调参硬凑）。
4. 禁止事项：不动 `runSequence/runPtmMap/runChromatography/runGlycan/runCovalent/runMass` 的提交逻辑与参数；不动引擎调用层；不新增 npm/pip 依赖；不引入 localStorage 之外的持久化。
