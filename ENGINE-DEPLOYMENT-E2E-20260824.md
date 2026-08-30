# BioCompare 六引擎实机部署与统一 API 复验记录

日期：2026-08-24

## 部署位置与固定版本

| 引擎 | 版本 | 本机位置/入口 |
|---|---|---|
| OpenMS | 3.5.0 | `C:\Users\MI\OpenMS-3.5.0\bin` |
| Sage | 0.14.6 | `D:\BioCompareEngines\Sage-0.14.6\sage-v0.14.6-x86_64-pc-windows-msvc\sage.exe` |
| R | 4.6.1 | `D:\BioCompareEngines\R-4.6.1\bin\Rscript.exe` |
| chromConverter | 0.9.0 | `D:\BioCompareEngines\R-library` |
| hplc-py | 0.2.8 | BioCompare `.venv` |
| GlycReSoft | 0.4.24 | `D:\BioCompareEngines\GlycReSoft\Scripts\glycresoft.exe` |
| glypy | 1.0.17 | BioCompare `.venv` 与 GlycReSoft 独立环境 |
| Python（GlycReSoft） | 3.10.11 | `D:\BioCompareEngines\Python310\python.exe` |

Sage 官方 v0.14.7 Windows 资产本身自报 0.14.6。为避免资产标签与运行时版本不一致，运行配置固定为官方 v0.14.6 Windows 资产；程序自报、配置声明和状态接口现均为 0.14.6。

## 环境变量

项目 `.env.local` 已配置：

```text
OPENMS_BIN_DIR=C:\Users\MI\OpenMS-3.5.0\bin
SAGE_BIN=D:\BioCompareEngines\Sage-0.14.6\sage-v0.14.6-x86_64-pc-windows-msvc\sage.exe
RSCRIPT_BIN=D:\BioCompareEngines\R-4.6.1\bin\Rscript.exe
R_LIBS_USER=D:\BioCompareEngines\R-library
RETICULATE_PYTHON=D:\BioCompareEngines\Python310\python.exe
GLYCRESOFT_BIN=D:\BioCompareEngines\GlycReSoft\Scripts\glycresoft.exe
EXTERNAL_ENGINE_WORK_ROOT=D:\BioCompareEngineJobs
CALCULATION_TASK_ROOT=D:\BioCompareEngineJobs\calculation-jobs
```

## 批次闸门结果

### 第一批：OpenMS / Sage

- 统一 API 任务：`128dbaf986de4ba8a01c20dd04971415`
- 单元：`PTM-01`
- 输入：OpenMS 官方 BSA 教学数据中的 3 个真实 mzML 运行及真实 FASTA。
- 原生执行：OpenMS `DecoyDatabase`、`SageAdapter` 和 Sage 均返回 0。
- 原生结果：目标 PSM 854、诱饵 PSM 729、最低 spectrum q = 0.04597701、1% FDR 通过目标 PSM = 0。
- 系统结果：`quality-blocked`，原因是严格 FDR 后没有可定量氧化位点。该状态证明质量闸门生效，不是程序失败。
- 登记产物：`results.sage.tsv`、`idXML`、PTM CSV、工作流 JSON、命令日志和标准结果 JSON。

### 第二批：chromConverter / hplc-py

- 统一 API 任务：`e5e24ae0254547a3b262af515f8c506e`
- 单元：`PUR-02`
- 输入：chromConverter 官方测试仓库中的真实 Agilent ChemStation `chemstation_130.ch`，SHA-256 `61D5AC4A2BBEC49EF0606C307B3419DDD7F6A2A5E2453E7EA00BC756A2E0DAA3`。
- 原生执行：Rscript 加载 chromConverter，输出 6001 点 `time,signal` canonical CSV；hplc-py 完成自身基线校正、峰检测和峰拟合，共得到 4 个正向色谱峰。
- 系统结果：PUR-02 主峰面积占比 91.367036%；成功建立参照区间并生成候选客观标记，`decision=null`。
- 适配修复：hplc-py 会同时将负残差谷识别为候选峰。Worker 保留其原生基线校正，仅在拟合前将负残差截为零，防止负谷产生不合法峰宽；不替代 hplc-py 的峰计算。

### 第三批：GlycReSoft / glypy

- 统一 API 任务：`e55b6cf351f0496c8a4b4731ea2f7fa9`
- 单元：`GLYCO`
- 输入：GlycReSoft 官方仓库 AGP 真实夹具 `20150710_3um_AGP_001_29_30.mzML`、`agp.fa`、`agp_glycans.txt`。
- 原生执行顺序：`mzml preprocess` → `build-hypothesis glycopeptide-fa` → `analyze search-glycopeptide --export csv`，所有真实命令返回 0。
- 原生结果：搜索导出 15 个 identified glycopeptides；CSV 中实际糖组成位于 `glycopeptide` 字段末尾。
- 系统解析：glypy 从糖肽字符串提取并规范化 9 种糖组成，按组成聚合 `total_signal` 后归一化为 100%，再进入多批参照区间。
- 系统结果：9 个参照区间、9 个候选客观标记，`decision=null`。
- 同哈希优化：验证中同一真实夹具作为技术副本重复提交。Worker 对字节哈希完全相同的 mzML 只执行一次预处理/搜索，并在命令日志中登记复用；不同真实批次不会复用。

## 统一 API 闭环

以上三项均由 `POST /calculation-jobs` 创建，随后通过：

- `GET /calculation-jobs/{id}?projectId=engine-e2e-20260824`
- `GET /calculation-jobs/{id}/result?projectId=engine-e2e-20260824`
- `GET /calculation-jobs/{id}/artifacts/{path}?projectId=engine-e2e-20260824`

读取任务状态、标准结果和登记产物。后台已受控重启，`GET /calculation-units` 在线报告三批技术就绪。

## 回归验证

- Python 编译检查：通过。
- 后端测试：35/35 通过。
- 前端 TypeScript 检查：通过。

## 解释边界

1. 三条链路已经达到“外部项目本体已部署、Worker 真实拉起、原生输出可解析、统一异步 API 可返回结果”的技术接入标准。
2. 本次第二、第三批为了检验多批接口，重复使用同一真实夹具，不能把这些副本解释为独立参照药批次，所得零宽区间不具有方法学意义。
3. 第一批 BSA 教学数据不满足正式高分辨率 MAM 质量要求，因此正确停在 `quality-blocked`。
4. `productionAvailable` 和监管工作流验证仍应保持 `false`；正式启用前必须使用企业真实独立多批参照药/候选药数据冻结参数并完成方法学验证。
