# BioCompare 分批计算引擎交付说明

## 交付范围

统一入口为 `POST /calculation-jobs`，通过 `moduleCode` 选择计算单元。所有任务均立即返回任务 ID，在独立目录内异步执行；状态、结果与登记产物分别通过以下接口读取：

- `GET /calculation-units`：计算单元、输入格式及本机引擎就绪状态
- `GET /calculation-jobs/{taskId}?projectId=...`：任务状态
- `GET /calculation-jobs/{taskId}/result?projectId=...`：标准结果
- `GET /calculation-jobs/{taskId}/artifacts/{path}?projectId=...`：仅下载完成时登记且哈希一致的产物

系统不接收任意命令或自由命令行参数。每个任务采用 `projectId/moduleCode/taskId` 独立目录，输入、工作区、输出和日志彼此隔离。

## 第一批：OpenMS / Sage

已注册 `SEQ-02`、`SEQ-03`、`SEQ-04`、`PTM-01`、`PTM-03`、`PTM-04`。它们复用既有 `worker/openms_sage_cli.py`，由 OpenMS SageAdapter/Sage 完成目标诱饵数据库检索和 FDR；新增层只解释已有 TSV/CSV 产物。

- `SEQ-02`：按 FASTA 和严格 FDR 肽段计算覆盖率。
- `SEQ-03`：调用方必须提供 `cdrRegions`；通用 FASTA 不能可靠推断 CDR 边界。
- `SEQ-04`：输出 N/C 末端肽证据。
- `PTM-01`：筛选氧化位点，再做多批参照区间。
- `PTM-03`：搜索参数增加 N 端 Gln/Glu 焦谷氨酸，并做位点区间。
- `PTM-04`：必须获得带 C 端 Lys 的末端肽证据，否则为 `quality-blocked`。

## 第二批：数值色谱

已注册 `PUR-01`～`PUR-03` 与 `IEX-ACIDIC`、`IEX-MAIN`、`IEX-BASIC`。

1. CSV/TXT 被规范成 `time,signal` 两列的 canonical trace。
2. 厂商原始格式通过独立 `Rscript` 调用 `chromConverter::read_chroms`，仅承担格式转换。
3. 独立 Python worker 调用 hplc-py 的 `Chromatogram.fit_peaks`，完成 SNIP 基线校正和峰拟合。
4. 峰面积归一化为高/主/低分子量或酸性/主/碱性组分。
5. 先用至少 3 批参照药建立 observed-range、mean-3sd 或 robust-mad 区间，再标记候选药。

本机现已部署 R 4.6.1、chromConverter 0.9.0 和 hplc-py 0.2.8，厂商原始格式入口及 canonical CSV 下游均已用真实 Agilent `.ch` 夹具通过统一 API 实测。详见 `ENGINE-DEPLOYMENT-E2E-20260824.md`。

## 第三批：GlycReSoft / glypy

已注册 `GLYCO`，执行顺序固定为：

1. `glycresoft mzml preprocess`
2. `glycresoft build-hypothesis glycopeptide-fa`
3. `glycresoft analyze search-glycopeptide --export csv`
4. glypy 组成式解析与统一命名
5. 每批归一化后进入 BioCompare 多批参照区间

本机现已建立 Python 3.10.11 独立环境并部署 GlycReSoft 0.4.24、glypy 1.0.17 及兼容依赖。真实 AGP mzML/FASTA 已完成预处理、建库、搜索、CSV 导出、glypy 标准化和统一 API 区间结果，在线状态为 `technicalReady=true`。详见 `ENGINE-DEPLOYMENT-E2E-20260824.md`。

## 请求格式

`POST /calculation-jobs` 使用 multipart：

- `projectId`：项目隔离标识
- `moduleCode`：上述计算单元编号
- `files`：一个或多个输入文件
- `inputManifestJson`：与 files 顺序一一对应；每项包含 `role`，可选 `lotId`、`formatIn`
- `parametersJson`：受控业务参数

第一批清单示例：

```json
[
  {"role":"reference","lotId":"R01"},
  {"role":"reference","lotId":"R02"},
  {"role":"reference","lotId":"R03"},
  {"role":"candidate","lotId":"C01"},
  {"role":"fasta"}
]
```

`SEQ-03` 参数示例：

```json
{"cdrRegions":[{"accession":"HC","name":"CDR-H1","start":26,"end":35}],"qValueThreshold":0.01}
```

## 结果原则

结果对象只包含 `within`、`outside`、`new-variant`、`insufficient-reference` 等客观标记，`decision` 固定为空。工具不会自动给出候选药与参照药“相似/不相似”的最终监管结论。
