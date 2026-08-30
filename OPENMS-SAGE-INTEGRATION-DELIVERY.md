# BioCompare OpenMS + Sage 集成交付说明

交付日期：2026-08-20

## 已实现能力

PTM/MAM 分项现在支持两种兼容模式：

1. **已有专业结果模式**：上传候选药和多批参照药 CSV/TSV，直接执行 BioCompare PTM 区间比较。
2. **原始数据模式**：上传多批参照药 mzML、候选药 mzML 和 FASTA，由系统异步调用本机 OpenMS + Sage，专业结果通过质量闸门后再进入 BioCompare 区间比较。

OpenMS/Sage 负责质谱核心算法；BioCompare 负责任务调度、参数冻结、文件哈希、状态管理、超时终止、输出转换、多批参照区间、偏离标记和报告数据。系统不在内部重复实现数据库检索算法，也不自动给出相似/不相似结论。

## 页面使用

进入：`翻译后修饰位点定量比对（PTM-06）`。

选择“原始 mzML + FASTA”，依次上传：

- 参照药 mzML：至少达到公共规则中的最低批次数，默认 3 个；
- 候选药 mzML：一个或多个；
- 蛋白数据库 FASTA：目标序列库，或已经使用 `DECOY_` 前缀的目标/诱饵库。

点击“运行本专项”。页面会轮询后端任务状态。严格 1% FDR 后没有可定量修饰位点时，任务显示质量闸门阻断，不进入区间比较。

页面中的“技术已接入，试点验证中”表示 CLI 可以真实调用；不等同于“监管工作流已验证”或“生产可用”。

## 后端接口

### 创建任务

`POST /ptm/openms-sage/jobs`

Multipart 字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `referenceMzml` | 多文件 | 多批参照药 mzML |
| `candidateMzml` | 多文件 | 候选药 mzML |
| `fasta` | 文件 | `.fasta` 或 `.fa` |
| `intervalMethod` | 文本 | `observed-range`、`mean-3sd`、`robust-mad` |
| `minReferenceLots` | 整数 | 2–50，默认3 |
| `qValueThreshold` | 数值 | 大于0且不高于0.01 |
| `precursorToleranceDa` | 数值 | 默认0.05 Da |
| `fragmentToleranceDa` | 数值 | 默认0.3 Da |
| `threads` | 整数 | 1–32，默认4 |

### 查询与下载

- `GET /ptm/openms-sage/jobs/{jobId}`：状态、进度、事件、错误和产物
- `GET /ptm/openms-sage/jobs/{jobId}/result`：通过质量闸门后的区间结果
- `GET /ptm/openms-sage/jobs/{jobId}/quality-gate-result`：被质量闸门阻断的专业搜索证据
- `GET /ptm/openms-sage/jobs/{jobId}/artifacts/{filename}`：下载审计产物

任务状态：`queued → running → completed`，或 `quality-blocked / failed`。

## 实际执行流程

```text
网页上传
  ↓
保存原始文件、SHA-256、任务清单
  ↓
复制到纯英文隔离工作目录
  ↓
OpenMS DecoyDatabase：生成 DECOY_ 前缀目标/诱饵 FASTA
  ↓
OpenMS SageAdapter → Sage：数据库检索、打分、目标/诱饵 FDR
  ↓
解析 results.sage.tsv，映射氧化和脱酰胺到蛋白位点
  ↓
严格 q ≤ 0.01 质量闸门
  ↓
BioCompare：多批参照区间、候选逐位点标记、数据完整性预警
```

默认搜索修饰：

- 固定：Carbamidomethyl (C)
- 可变：Oxidation (M)、Deamidated (N)、Deamidated (Q)
- 酶：Trypsin
- 目标/诱饵前缀：`DECOY_`

## 关键代码

- `worker/openms_sage_cli.py`：隔离运行、英文路径暂存、OpenMS/Sage 命令组装、日志和质量闸门
- `scripts/sage_to_biocompare_ptm.py`：Sage PSM/ProForma 质量偏移到 BioCompare PTM 位点表
- `backend/service.py`：异步队列、上传接口、状态轮询、超时与产物下载
- `backend/external_engines.py`：组件探测、版本证据和技术/监管状态分离
- `app/modules/[moduleId]/module-workspace.tsx`：双输入模式与多文件上传
- `app/project-provider.tsx`：任务提交、轮询、质量阻断提示和结果回传

## 异常保护

- 每个上传文件最大 250 MB；参照药/候选药各最多50个 mzML。
- 外部任务默认最多900秒；超时后终止整个进程树，防止 Sage/OpenMS 残留卡死。
- Windows 中文路径问题通过纯英文隔离目录解决。
- `_rev` 后缀诱饵库会被拒绝；SageAdapter 要求 `DECOY_` 前缀。
- q 值阈值不能放宽到 0.01 以上。
- 专业程序退出码、stdout、stderr、版本、命令和参数均保留。
- 严格 FDR 无结果属于 `quality-blocked`，与程序执行失败区分。

## 产物

- `reference-ptm.csv`、`candidate-ptm.csv`
- `results.sage.tsv`
- `openms-sage-fdr01.idXML`
- `workflow.json`
- `openms-sage-result.json`
- `analysis-request.json`
- `worker.log`

## 验收结果

真实 HTTP 任务：`b72d65c8896e4f41bd2dbc3f60ebbdc5`

- 输入：3个真实参照运行 mzML、1个候选测试副本、真实 FASTA
- Sage：目标 PSM 1,019；诱饵 PSM 857
- 最低谱图 q 值：0.02739726
- 1% FDR 通过目标 PSM：0
- 最终状态：`quality-blocked`
- 审计产物：8个，下载接口 HTTP 200

该结果证明调用链和质量阻断有效，不证明这套 BSA 教学数据满足正式 MAM 要求。

## 正式使用前仍需完成

1. 用真实生物药高分辨率 MAM 数据冻结仪器相关质量容差。
2. 将当前 MS2 强度技术代理升级为经验证的 XIC 峰面积定量。
3. 接入位点定位概率、LOQ、缺失值、共洗脱干扰和系统适用性规则。
4. Sage 运行时已固定到官方 v0.14.6 Windows 资产，使配置声明与程序自报一致；升级版本时仍须重新冻结并回归。
5. 完成代表性数据回归、版本冻结和审计确认后，才可把 `productionAvailable` 设为 `true`。
