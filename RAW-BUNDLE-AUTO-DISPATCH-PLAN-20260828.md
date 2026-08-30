# 原始数据束自动调度全部专项 · 实施计划（20260828）

> 本文档是给实施 AI 的完整执行说明书。请**严格按照本文档执行**，不要自行扩大改动范围。
> 目标：用户在「总项目」统一入口一次性上传 Excel 表格 + mzML/FASTA 原始文件后，系统自动识别原始数据束，**自动填充并自动调度全部肽图类专项**（PTM-01~04、SEQ-01/02），与前六项表格专项一起跑完，不需要再进各专项页面上传。

---

## 1. 现状关键事实（已核实，实施前不要重复探索）

- 前端：Next.js 16.3 App Router + React 19，`pnpm typecheck` 可做类型检查。样式为 `app/globals.css` 自定义 CSS。
- 统一入口流程：`app/project-provider.tsx` 的 `importProjectMaterials()`（341-382 行）把文件 POST 到后端 `/project-materials/inspect`，返回 `submissionImport`。其中 `rawPtmBundle` 含 `status / referenceMzmlNames / candidateMzmlNames / fastaName`（后端已按文件名 R\d+/C\d+ 自动判角色，**后端无需任何改动**）。
- **问题根源**：352-358 行，当 `rawPtmBundle.status === "ready"` 时只填充了 PTM-06 的 `ptmRawFiles`（openms-sage 模式），没有填充其他专项的 `sequenceFiles`，因此批量调度只认 PTM-06。
- 专项输入分发逻辑（已存在，勿改）：
  - `kind === "sequence" | "ptm-map"` 的专项走 `sequenceFiles[module.id]`（含 `referenceMzml[] / candidateMzml[] / fasta`），由 `runSequence`/`runPtmMap` 提交 `${backendUrl}/api/jobs`；
  - `kind === "covalent"`（COV-01/02）也用 `sequenceFiles`，但**需要非还原肽图**，与本次的还原烷基化肽图束不匹配，**明确不自动填充**；
  - `runAll(configuredOnly=true)`（384-398 行）已有完整逻辑：只调度输入齐备的专项，支持并行/串行。
- 涉及的六个肽图专项 id：`oxidation`、`deamidation-isomerization`、`n-terminal-pyroglutamate`、`heavy-chain-c-terminal-lys`、`ms1-peptide-mass-coverage`、`msms-sequence-coverage`（`lib/project.ts`，kind 分别为 ptm-map×4、sequence×2）。不要用 id 硬编码清单，按 `module.kind` 判断。
- 总项目页 `app/project/page.tsx` 中 `readyCount` 只统计 Excel 表格路由 + PTM；route preview 直接显示后端 routes 状态，肽图专项恒显示"未识别"。

## 2. 改动清单（共 2 个文件）

| # | 文件 | 操作 |
| --- | --- | --- |
| 1 | `app/project-provider.tsx` | **修改**：数据束自动填充 `sequenceFiles` + 自动调度状态与 effect |
| 2 | `app/project/page.tsx` | **修改**：route preview 与 readyCount 纳入肽图专项就绪态 |

**不得改动**其他任何文件（尤其不改 `backend/`、不改 `runSequence`/`runPtmMap`/`runAll` 的现有提交逻辑、不新增依赖）。

## 3. 具体改动

### 3.1 `app/project-provider.tsx`

**(a) 新增自动调度状态**（放在 65 行 `sequenceFiles` state 附近）：

```tsx
const [autoDispatchArmed, setAutoDispatchArmed] = useState(false);
```

**(b) 修改 `importProjectMaterials` 的 raw bundle 分支**（原 352-358 行）。把只填 `ptmRawFiles` 的逻辑替换为同时填充全部 `sequence`/`ptm-map` 专项：

```tsx
if (result.rawPtmBundle.status === "ready" && result.rawPtmBundle.fastaName) {
  const referenceMzml = result.rawPtmBundle.referenceMzmlNames.map((name) => byName.get(name)).filter((file): file is File => Boolean(file));
  const candidateMzml = result.rawPtmBundle.candidateMzmlNames.map((name) => byName.get(name)).filter((file): file is File => Boolean(file));
  const fasta = byName.get(result.rawPtmBundle.fastaName) || null;
  setPtmInputMode("openms-sage");
  setPtmRawFiles({ referenceMzml, candidateMzml, fasta });
  if (referenceMzml.length && candidateMzml.length && fasta) {
    // 同一还原烷基化肽图束同时服务 sequence 与 ptm-map 专项；covalent 需要非还原肽图，不自动填充
    setSequenceFiles((current) => Object.fromEntries(Object.entries(current).map(([moduleId, input]) => {
      const module = projectModules.find((item) => item.id === moduleId);
      if (!module || (module.kind !== "sequence" && module.kind !== "ptm-map")) return [moduleId, input];
      return [moduleId, { referenceMzml, candidateMzml, fasta }];
    })));
    setAutoDispatchArmed(true);
  }
} else {
  setPtmInputMode("structured");
}
```

并在其后 `setRuns` 的映射里（原 373-377 行），让这六个专项的状态文案更新：对 kind 为 sequence/ptm-map 且即将被填充的模块，message 置为 `"原始数据束已解析，候选药与参照药肽图输入就绪"`、status 置为 `"not-started"`、progress 0（在现有映射分支上扩展一个条件即可，找不到 route 的模块目前原样返回，需改为：若是肽图专项且本次 bundle ready，则更新文案）。

**(c) 自动调度 effect**（放在 `runAll` 定义之后、`exportReport` 之前，确保引用顺序合法）：

```tsx
useEffect(() => {
  if (!autoDispatchArmed || importingMaterials || batchRunning) return;
  setAutoDispatchArmed(false);
  void runAll(true);
}, [autoDispatchArmed, importingMaterials, batchRunning, runAll]);
```

说明：`setState` 后状态在下一次渲染才生效，所以不能在 `importProjectMaterials` 里直接调 `runAll`；用 armed 标志 + effect 保证 `runAll(true)` 读到的是填充后的 `sequenceFiles/files`。`runAll(true)` 本身只会调度输入齐备的专项（Excel 六项 + 肽图六项），并沿用用户选择的并行/串行模式。

### 3.2 `app/project/page.tsx`

**(a) 从 `useProject()` 补充解构 `sequenceFiles`**（第 14 行附近）。

**(b) readyCount 纳入肽图专项**（替换现有 `readyCount` 计算）：

```tsx
const peptideMapReadyCount = projectModules.filter((module) => (module.kind === "sequence" || module.kind === "ptm-map") && sequenceFiles[module.id]?.referenceMzml.length && sequenceFiles[module.id]?.candidateMzml.length && sequenceFiles[module.id]?.fasta).length;
const readyCount = structuredReadyCount + (ptmReady ? 1 : 0) + peptideMapReadyCount;
```

（`structuredReadyCount` 原本就排除了 PTM 模块，勿动其过滤条件，避免重复计数。）

**(c) route preview 状态覆盖**：route-item 渲染处（`submissionImport.routes.find(...)` 一带），当后端 route 为 `not-found` 但该模块是肽图专项且 `sequenceFiles` 已就绪时，显示为就绪态：

```tsx
const bundleReady = (module.kind === "sequence" || module.kind === "ptm-map") && Boolean(sequenceFiles[module.id]?.referenceMzml.length && sequenceFiles[module.id]?.candidateMzml.length && sequenceFiles[module.id]?.fasta);
const status = route && route.status !== "not-found" ? route.status : bundleReady ? "ready" : "not-found";
```

对应的 `<em>` 状态标签与 `route?.message` 文案：`bundleReady && (!route || route.status === "not-found")` 时显示 `已就绪（原始数据束）`，message 用 `"肽图数据束已自动分配"`。CSS 类沿用现有 `route-item ready` 样式，不新增 CSS。

**(d) 原始数据束提示条**（`intake-audit-strip` 里 `raw-bundle` 的 `<small>`），在原有文案后追加：`· 将自动调度 6 个肽图专项`（可用 `peptideMapReadyCount` 动态显示）。

## 4. 行为定义（验收口径）

1. 一次多选上传 `Excel + R01/R02/R03.mzML + C01.mzML + antibody.fasta` → 解析完成后**不再需要任何手动点击**：12 个专项自动开始（5 个分子量表格项 + PTM-06 原始路径 + 6 个肽图专项），各专项状态实时推进，结果回传汇总报告。
2. route preview 中六个肽图专项显示"已就绪（原始数据束）"，一键执行按钮计数变为 12。
3. 仅上传 Excel（无 mzML）时行为与现在完全一致（structured 模式，六个表格项照常）。
4. 仅上传 mzML+FASTA（无 Excel）时：只自动调度 PTM-06 + 六个肽图专项。
5. 重复上传会整体覆盖上次的自动分配（以最新一次为准）；用户在专项页面手动重新选择文件仍可覆盖自动分配。
6. covalent（COV-01/02）永远不被自动填充。
7. 自动调度触发一次即 disarm，不会循环触发；批量进行中再次上传不会并发调度（`batchRunning` 守卫已有）。

## 5. 验收步骤

1. `pnpm typecheck` 无新增错误。
2. 用桌面 `BioCompare_统一上传_合成测试材料.xlsx` 与 `BioCompare_后六项_数据束` 的 5 个文件按第 4 节场景 1 上传，观察：解析 → 肽图专项"已就绪（原始数据束）" → 自动开始运行 → 12 项全部进入终态（completed/attention/failed）。
3. 场景 3（仅 Excel）回归：与改动前一致。
4. 引擎结果口径：PTM-06 已知可通过（实测 180 PSM、q=0.0056）。PTM-01~04 走 MetaMorpheus 链、SEQ-01/02 走 OpenMS/Pyteomics/Sage 链，若个别专项出现质量闸门阻断或引擎报错，**如实记录并停止**，把报错原文写进交付说明反馈，不要为通过验收而改动引擎参数或伪造结果。
5. `git status` 确认只有上述 2 个文件变更。

## 6. 明确不做

- 不改后端（解析、判角色、任务执行全部复用现有实现）。
- 不自动填充 covalent 专项。
- 不新增"自动调度"开关 UI（默认开启；如需关闭，用户可不混传 mzML 或在专项页手动改）。
- 不做失败重试与断点续跑。
