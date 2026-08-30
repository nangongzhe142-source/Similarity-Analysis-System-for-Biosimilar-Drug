# 简洁错误提示 + 批量逐项进度面板 · 实施指令（20260829）

> 本文档是给实施 AI 的完整执行说明书。请严格按照本文档执行，只改动列出的文件。
> 两个工作流相互独立，按 A→B 顺序实施，各自完成后先自测再进入下一个。
> 总原则：不新增任何依赖；不动引擎调用层与任务提交逻辑；所有新样式复用现有 CSS 变量并兼容深色主题。

---

## 背景与现状（已核实，实施前不要重复探索）

- 用户当前的痛点一：引擎报错原文（如 `RuntimeError: MetaMorpheus exited 4: Could not define precursor ion because...`，长达上千字符的 traceback）直接展示在页面顶部，用户看不懂。
  - 冒泡链路：`worker/metamorpheus_ptm.py:30` 等 worker 抛 `RuntimeError(原文截断1800字符)` → 计算任务层写入 job → 前端 `app/project-provider.tsx` 的 `runModule` 在轮询后 `throw new Error(job.error)` → `runAll`/页面 catch 后 `setError(...)` → `app/workspace-shell.tsx` 的 `<div className="error global-error">` 整段显示。
- 痛点二：批量比对（12 个专项）时只有各模块卡片里的零散状态，没有一个"一项一项推进"的集中进度视图。
  - 现有可用状态源：provider 的 `runs`（每个模块 `status/progress/message`，运行中由各轮询循环实时刷新 0-100）、`batchRunning`、`dispatchMode`（parallel/serial）。`runAll` 依次或并行调用 `runModule`。
- 相关既有计划（可参考动效令牌与验收风格，但本文档自包含）：仓库根 `UI-AND-DX-UPGRADE-PLAN-20260828.md`。

## A. 简洁错误提示（数据/引擎错误一句话说明 + 详情折叠）

**目标**：出现错误时用户第一眼看到一句人话（发生了什么 + 该做什么），原始日志默认收起、需要时可展开。

### A1. 后端：错误摘要字段（改 `backend/calculation_tasks.py`、`backend/calculation_router.py`，若错误聚合点在其他文件以实际为准）

1. 在任务状态 JSON 中新增两个字段，原有 `error` 字段**保持不变**（继续存原文，供审计）：
   - `errorSummary: str` —— 简短中文摘要；
   - 生成规则：新增一个纯函数 `summarize_error(raw: str) -> str`，按下面的映射表从上到下首个命中生效，全部不命中时返回 `"专项计算失败，可展开查看原始日志"`。

   | 原文包含（不区分大小写） | errorSummary |
   | --- | --- |
   | `Could not define precursor ion` / `isolation m/z window is undefined` | 质谱数据文件缺少母离子隔离窗口信息，无法搜索；请更换为仪器导出的标准 mzML |
   | `MetaMorpheus exited` / `SageAdapter` / `engine` + `exited`（其余引擎退出码） | 专业引擎执行失败；可展开查看原始日志，或稍后重试 |
   | `timed? ?out` / `Timeout` / `超时` | 计算超时；可减少同时运行的专项数后重试 |
   | `质量闸门` / `quality_blocked` / `未获得目标PTM` | 数据未通过质量闸门（FDR 过滤后证据不足）；建议补充更多批次或谱图数据 |
   | `AI_API_KEY` / `未配置` | 服务配置缺失；请检查 .env.local 并重启后端 |
   | `FDR` / `q值` / `q value` | 统计过滤后无足够鉴定结果；数据量可能不足 |
   | `无法识别` / `not recognized` | 输入文件无法识别；请确认文件格式与命名（候选=C开头，参照=R开头） |

2. 失败路径上（任务状态置为 failed 的地方）调用 `summarize_error` 填入 `errorSummary`；已有历史任务缺该字段时视为空，前端回退显示通用摘要。

### A2. 前端：错误条一句话 + 折叠详情（改 `app/workspace-shell.tsx`、`app/project-provider.tsx`、`app/globals.css`）

1. `project-provider.tsx`：`runAll`/`runModule` 的 catch 处，若 error 对象携带 `errorSummary`（轮询 job 的失败分支构造 Error 时挂上 `summary` 属性），`setError` 优先使用摘要文案；原文存入新的 provider 状态 `errorDetail`（一并通过 context 暴露，附 `clearError` 一并清理）。
2. `workspace-shell.tsx` 的全局错误条改为：
   - 第一行：`errorSummary`（加一个醒目图标 ⚠，沿用现有 `.error` 样式）；
   - 第二行：`<details>` 折叠的"查看原始日志"，内容 `<pre>`（`white-space:pre-wrap`、`max-height:240px; overflow:auto`、等宽小字号）；
   - 右侧"知道了"按钮调用 `clearError`。
3. `globals.css` 追加少量样式（类名前缀 `error-ux-`），全部用现有变量。

### A3. 验收

1. 人为制造错误（任选其一）：把某个 mzML 改名后单独上传跑专项 / 临时把 `.env.local` 的 `METAMORPHEUS_CMD` 指向不存在路径重启后端）→ 页面顶部只显示一句摘要；点开折叠可见完整原文；点"知道了"消失。
2. 正常成功路径不出现错误条；`pnpm typecheck` 通过；后端 `/api/jobs/{id}` 返回的 JSON 同时含 `error`（原文）与 `errorSummary`。
3. 用 curl 验证一个失败任务的 JSON 字段（记录在交付说明里）。

## B. 批量比对逐项进度面板

**目标**：批量调度启动后，出现一个集中进度面板，逐项显示"哪个专项→正在跑第几个→完成情况"，一项一项推进、一目了然；全部结束后停留显示总结。

### B1. 新组件 `app/batch-progress-panel.tsx`（"use client"，无新依赖）

数据全部来自 `useProject()` 的 `runs`、`batchRunning`、`dispatchMode`、`projectModules`：

1. **显示时机**：`batchRunning === true` 时出现；结束后（`batchRunning` 变 false 且本次有 ≥2 个模块进入终态）停留为"本次批量总结"态，右上角 × 可关闭（本地 state 记住已关闭，下次批量再次出现）。
2. **列表内容**（按 `projectModules` 顺序过滤出本次参与的模块——标准：调度开始时刻 `status !== "not-started"` 的模块快照；用 useRef 在 `batchRunning` 由 false→true 时记录一次清单）：
   每行 = `模块编号 + 名称` + `状态徽章` + `迷你进度条`：
   - 排队（queued）：灰色圆点 + "排队中"；
   - 运行中（running）：teal 呼吸点 + 百分比数字 + 进度条（宽度 = `progress`）；
   - completed：绿勾"完成"；attention：橙点"需关注"；failed：红叉"失败"（附 A 项的 errorSummary 一行小字）；
   - 串行模式（dispatchMode === "serial"）时当前运行项高亮（左侧 3px 指示条 + 背景微亮），未开始项半透明；
   - 并行模式多项同时 running，各自独立进度条。
3. **头部**：`批量比对进度 · 3/12 已完成`，右侧小字显示调度模式（并行/串行）。计数 = 终态（completed+attention+failed）模块数。
4. **动效**：行进入用 `rise-in` 级联（`animation-delay: calc(var(--i)*40ms)`，参考 UI-AND-DX-UPGRADE-PLAN 的既有令牌写法）；状态切换时徽章 `pop`（180ms scale）；进度条 `width` 过渡 400ms；全部包进 `prefers-reduced-motion` 降级。
5. **位置与样式**：固定在右侧（`position:fixed; right:24px; bottom:96px`，避开右下角 AI 助手按钮），宽 `min(360px, calc(100vw-32px))`，`max-height: 70vh` 内部滚动；样式沿用面板卡语言（var(--surface)/var(--line)/圆角/阴影变量）。移动端 `@media (max-width:640px)` 改为 `left:16px; right:16px; width:auto`。

### B2. 挂载 `app/workspace-shell.tsx`

在 `<AiChatWidget />` 旁同级渲染 `<BatchProgressPanel />`（不传 props，内部消费 context）。

### B3. 验收

1. 上传 Excel + mzML 数据束触发自动批量调度（或手动"一键执行"）：面板立即出现，逐项从"排队"→"运行中 x%"→"完成/需关注"推进；串行模式下能清晰看到"一项跑完下一项开始"；并行模式多项同时推进。
2. 全部结束后面板停留显示总结（完成/需关注/失败计数），× 关闭后不挡页面；再次批量会重新出现。
3. 深浅主题正常；`prefers-reduced-motion` 下无动画；`pnpm typecheck` 通过。
4. 端到端：用桌面 `BioCompare_统一上传_合成测试材料.xlsx` + `BioCompare_后六项_数据束`（5 文件）完整跑一轮，截图记录面板在 3 个时间点的状态（开局/中途/结束）写入交付说明。

## 交付要求

1. 改动文件清单 + 每项验收结论 + A3.3 的 curl 输出 + B3.4 的三张截图。
2. 引擎真实失败时如实记录报错原文反馈，禁止调参数硬凑通过。
3. 不改：引擎调用层、任务提交参数、`runAll`/`runModule` 的调度逻辑本身（只读取状态）。
