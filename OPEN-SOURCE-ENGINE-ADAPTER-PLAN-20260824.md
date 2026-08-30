# BioCompare 待接入项目开源引擎适配方案

日期：2026-08-24  
范围：能力核验、引擎适配判断、CLI/进程调度、输入输出解析和结果映射设计。本文不包含完整业务实现。

## 1. 设计原则

1. 第三方工具负责专业计算，BioCompare只负责任务编排、参数固化、进程调用、输出解析、参照药区间比较、页面和报告。
2. “能够读取格式”不等于“能够完成该质量属性鉴定”。解析库不得登记成鉴定引擎。
3. 外部程序退出码为0只表示程序执行完成；必需产物、FDR、定位概率和定量完整性通过后，业务任务才能完成。
4. 任务执行状态与业务筛查结果分离。不得把`completed`解释为相似，也不得自动输出最终生物类似性结论。
5. GPL/LGPL工具优先使用独立进程、独立环境和用户自备安装；正式分发前单独进行许可证审查。
6. 每个引擎冻结版本、参数模板、输入哈希、完整命令、标准输出/错误、产物哈希和解析器版本。

## 2. 当前待接入项目概况

当前表征目录共60项，其中6项已接入，54项为待接入框架。已接入的UniDec五个分子量专项和OpenMS/Sage PTM总入口保持原样，不作为本轮重复接入对象。

## 3. 工具能力与项目适配矩阵

### 3.1 推荐作为专业计算引擎

| 工具 | 适配等级 | 优先对应项目 | 能力边界 |
|---|---|---|---|
| Sage | 高 | SEQ-02、SEQ-03；PTM-01、PTM-03、PTM-04；SEQ-04条件适用 | mzML+FASTA数据库检索、目标诱饵FDR、LFQ。不能用MS1单独证明序列；isoAsp不能仅凭常规质量差可靠区分。 |
| OpenMS | 高（工作流框架） | SEQ-01~04、PTM-01~04，与Sage组合；也负责标准格式转换、FDR、特征提取 | 适合LC-MS工作流，不适合直接代替CD、DSC、SPR、细胞活性、ELISA、qPCR等实验。 |
| MetaMorpheus | 高（备选） | SEQ-02~04、PTM-01~04；未知PTM发现；O-糖肽场景 | 支持mzML/MGF/Thermo RAW、FASTA/UniProt XML、G-PTM-D、FlashLFQ。不能把未知PTM发现直接当作经确认的CQA定量。 |
| FlashLFQ | 中高（下游定量） | PTM-01、PTM-03、PTM-04；SEQ项目的肽段丰度辅助 | 必须先提供合格PSM；自身不是搜索引擎。开放搜索结果需先规范修饰质量和序列，不能直接量化。 |
| hplc-py | 高（数值色谱） | PUR-01 HMW、PUR-02 SEC主峰、PUR-03 LMW；CHG-01~03仅限IEX-HPLC数据 | 输入必须是时间-信号数值轨迹；负责基线、峰检测和拟合。不能处理色谱截图，也不能自动知道峰的业务身份。 |
| GlycReSoft | 高（糖组/糖肽LC-MS/MS） | GLY-01~09，优先GLY-01、GLY-04、GLY-07~09 | 构建糖/糖肽假设、mzML预处理、糖肽搜索和导出。必须建立方法特异的糖库、FDR、位点和定量质量门槛。 |

### 3.2 只作为辅助组件，不登记成独立鉴定引擎

| 工具 | 判断 | 可承担职责 | 不可承担职责 |
|---|---|---|---|
| pyteomics | 辅助适用 | FASTA读取、理论酶切、质量/pI计算、mzML及搜索结果解析、修饰序列规范化 | 不能单独从原始谱图产生监管可用的肽段/PTM鉴定。 |
| glypy | 辅助适用 | 糖链结构/组成表示、质量计算、motif分类、结果标准化 | 不能从实验谱图独立鉴定或定量糖型。 |
| chromConverter | 上游解析器 | Agilent/Waters/Thermo/岛津等色谱文件转统一时间-信号表和元数据 | 不做峰定量、样品比对或相似性评价。应与hplc-py串联。 |

### 3.3 不新增映射或不强行接入

| 工具/项目 | 结论 | 原因 |
|---|---|---|
| UniDec → 新的待接入项目 | 不新增 | 已正确服务五个完整/亚基分子量项目。不能用去卷积质量谱替代SEC聚集体、CE-SDS纯度、活性或糖链结构测定。 |
| Sage/MetaMorpheus → SEQ-01 MS1肽质量覆盖率 | 条件适用 | 可用MS/MS鉴定结果回填MS1特征并计算覆盖率；若只有MS1精确质量，不能宣称序列已鉴定。 |
| Sage/MetaMorpheus → PTM-02异构化 | 部分不适用 | 脱酰胺可按+0.984 Da检索；Asp/isoAsp常无质量差，需专门碎裂、色谱或标准品证据。输出必须拆成“脱酰胺已评估/异构化证据不足”。 |
| 列表内工具 → COV-01游离巯基 | 不适用 | 需要Ellman/荧光标记/LC-MS衍生等方法特异结果；普通肽段搜索不能直接给出游离巯基水平。 |
| 列表内工具 → COV-02二硫键图谱 | 不直接适用 | 需要非还原肽图和二硫键配对专用搜索/验证；普通线性肽搜索不应强行解释。 |
| hplc-py → CE-SDS PUR-04~07 | 条件适用、非首选 | 数学上能处理时间-信号轨迹，但无CE-SDS专用迁移时间校准和峰身份规则。只有在方法模板锁定、标准品窗口和系统适用性验证后可用。 |
| OpenMS → SEC/电荷异质性 | 通常不适用 | OpenMS面向LC-MS数据；若业务数据是UV/CE/cIEF，不应为了复用软件而改变检测方法语义。 |
| 列表内工具 → HOS-01~07 | 不适用 | CD、FT-IR、荧光、DSC/DSF、HDX等需要各自专用仪器数据与算法。 |
| 列表内工具 → BIO-01~11 | 不适用 | 靶标/Fc受体结合、效价、ADCC、CDC属于SPR/BLI/ELISA或细胞功能数据，不是质谱搜索或普通色谱峰拟合问题。 |
| 列表内工具 → IMP-02~04 | 不适用 | Protein A、DNA、HCP通常由ELISA/qPCR/免疫分析等方法获得；本批工具不提供对应专业定量。 |
| 列表内工具 → PHY-01 | 不适用 | 摩尔消光系数需要UV吸收与浓度/序列方法，pyteomics理论值只能作辅助，不能替代实验测定。 |
| pyteomics → PHY-02 | 辅助、不作主引擎 | 可计算理论pI，但不能替代实测icIEF/CEX电荷异质性。 |

## 4. 推荐实施优先级

### P1：肽图、序列覆盖与明确PTM

项目：SEQ-02、SEQ-03、SEQ-04、PTM-01、PTM-03、PTM-04。  
首选链：`OpenMS DecoyDatabase → SageAdapter/Sage → PeptideIndexer/FDR/IDFilter → ProteomicsLFQ或Sage LFQ → BioCompare结果适配器`。  
备选链：`MetaMorpheus Search/G-PTM-D → FlashLFQ → BioCompare结果适配器`。

### P2：SEC和IEX数值色谱

项目：PUR-01、PUR-02、PUR-03；CHG-01、CHG-02、CHG-03仅限IEX-HPLC。  
推荐链：`chromConverter（厂商格式时）→ canonical_trace.csv → hplc-py → BioCompare峰区域映射 → 多批参照区间`。

### P3：糖基化

项目：GLY-01~09。  
推荐链：`GlycReSoft mzML preprocess → 糖/糖肽假设库 → search-glycopeptide/search-glycan → CSV导出 → glypy规范化 → BioCompare糖型结果适配器`。

### 暂缓

COV-01/02、HOS-01~07、BIO-01~11、IMP-02~05、PHY-01/02、CE-SDS PUR-04~07。暂缓不代表不重要，而是截图中的工具不能完整承担其专业计算。

## 5. CLI与进程调用设计

所有命令均以参数数组和`shell=False`调用；模板只允许后端具名参数，不接受用户自由附加命令片段。

### 5.1 Sage直接调用

真实命令合同：

```text
sage [OPTIONS] <parameters.json> [mzML_paths]...
  --fasta <database.fasta>
  --output_directory <task-output>
  --batch-size <N>
  --write-pin
  --disable-telemetry-i-dont-want-to-improve-sage
```

输入：候选/参照mzML、FASTA、冻结JSON参数。  
解析：`results.sage.tsv`、`results.json`、LFQ表；读取PSM q值、肽段、修饰、蛋白、RT和强度。  
质量门：目标诱饵标识存在、PSM q≤0.01、修饰位点可定位、所需样品均有有效运行。

### 5.2 OpenMS SageAdapter工作流

```text
SageAdapter -in <mzML...> -out <search.idXML> -database <decoy.fasta>
            -sage_executable <sage> -threads <N>
```

随后使用OpenMS工具完成索引、FDR过滤和定量。注意SageAdapter当前只支持Sage闭合搜索，不支持OpenMS包装层中的wide-window/open/DIA/chimeric模式；需要开放搜索时使用Sage直接CLI或MetaMorpheus。

### 5.3 MetaMorpheus

```text
dotnet CMD.dll -t <Task1.toml> [Task2.toml ...]
               -s <spectra.mzML|raw|mgf...>
               -d <database.fasta|xml>
               -o <task-output>
```

模板：Search、Calibration、G-PTM-D、二次Search、LFQ分别版本化。  
解析：PSM TSV、AllPeptides/AllQuantifiedPeptides、protein groups和任务日志。  
注意：Thermo RAW有单独许可确认，不应在无人值守任务中静默接受。

### 5.4 FlashLFQ

输入必须包含PSM表和对应raw/mzML；适配器只接受官方支持的MetaMorpheus `.psmtsv` 或经严格字段校验的generic TSV。启动时记录`--help`与版本并按冻结版本生成参数，避免跨版本参数漂移。  
解析输出：肽段/修饰肽强度、峰检测结果、样品列；映射为位点或peptidoform定量前必须保留修饰序列和理论质量。

### 5.5 hplc-py

hplc-py没有稳定的官方终端CLI，采用独立Python环境和BioCompare薄适配进程：

```text
<hplc-python> -m biocompare_hplc_adapter --input canonical_trace.csv
              --config method-template.json --output <task-output>
```

适配进程内部只负责调用包的`Chromatogram.correct_baseline()`与`fit_peaks()`并输出标准表。输入固定为`time,signal,sample_id,lot_id`；业务峰身份由BioCompare方法模板中的RT窗口定义，不由hplc-py猜测。

### 5.6 chromConverter

没有面向本系统的官方统一CLI，采用独立R进程：

```text
Rscript chromconverter_adapter.R --input <vendor-file-or-folder>
        --format <allowlisted-format> --output canonical_trace.csv
```

只登记为`parser`阶段；解析完成状态不得等同分析完成。输出统一为时间、信号、通道、检测器单位、样品名和源文件元数据。

### 5.7 GlycReSoft

```text
glycresoft mzml preprocess <input.mzML> <processed.mzML>
glycresoft build-hypothesis glycopeptide-fa <database.fasta> <hypothesis.db>
  --glycan-source <glycan-list> --glycan-source-type text
glycresoft analyze search-glycopeptide <hypothesis.db> <processed.mzML> <hypothesis-id>
  --psm-fdr-threshold <fdr> --output-path <analysis.db> --export csv
glycresoft export glycopeptide-identification <analysis.db> <analysis-id>
  --output-path <results.csv>
```

解析：位点、肽段、糖组成、色谱峰面积、得分和FDR。必须区分“糖组成推断”“位点定位”和“结构异构体确认”。

### 5.8 pyteomics与glypy

两者仅在独立结果适配进程中使用：pyteomics负责FASTA/PSM/mzML解析和理论属性；glypy负责糖组成与结构命名归一化。引擎状态页显示为`support-library`，不能显示为“专业鉴定已完成”。

## 6. 通用调度接口

建议新引擎统一实现以下适配器合同：

```text
probe()           -> executable/version/license/capabilities
validate_inputs() -> normalized manifest or input-invalid
build_command()   -> immutable argv + environment allowlist
run()             -> exit code/stdout/stderr/timeout evidence
validate_outputs()-> artifact manifest or quality-blocked
parse_outputs()   -> engine-native normalized records
map_result()      -> BioCompare comparison-ready result
```

任务请求：

```json
{
  "projectId": "string",
  "moduleId": "SEQ-02",
  "engineKey": "openms-sage",
  "inputs": [{"role": "reference|candidate|fasta|method", "path": "...", "sha256": "..."}],
  "parameters": {"templateId": "mam-closed-search-v1", "threads": 4},
  "comparisonPolicyId": "sequence-coverage-v1"
}
```

任务目录：

```text
runtime/{projectId}/{moduleId}/{taskId}/
  inputs/ work/ outputs/ logs/
  task.json command.json artifact-manifest.json result.json
```

状态：`staging → queued → running → upstream-completed → validating → awaiting-downstream → completed`；异常状态为`input-invalid / engine-unavailable / timed-out / failed / quality-blocked / cancelled`。

## 7. 标准结果映射

### 序列类

`sequenceCoveragePercent`、`identifiedPeptides`、`uniquePeptides`、`cdrCovered`、`terminalVariants`、`psmFdr`、`missingRegions`。

### PTM类

`lotId`、`chain`、`residue`、`position`、`modification`、`peptidoform`、`valuePercent`、`qValue`、`localizationProbability`、`qualityFlags`。随后进入现有多批参照区间层。

### 色谱类

`lotId`、`peakGroup`、`retentionTime`、`height`、`area`、`areaPercent`、`fwhm`、`baselineMethod`、`assignmentRule`。候选药指标只与多批参照区间比较，不以单批点对点差值为首要结论。

### 糖基化类

`lotId`、`site`、`peptide`、`glycanComposition`、`normalizedGlycanName`、`area`、`relativePercent`、`qValue`、`localizationEvidence`。

所有结果均包含`engine/version/parameters/inputHashes/generatedAt/warnings/disclaimer`。报告输出“区间内、区间外、证据不足、新增变体”等客观标记，不自动给出最终相似性结论。

## 8. 异常与质量闸门

- 程序缺失或版本不匹配：`engine-unavailable`，拒绝排队。
- 文件格式、角色、批次数不足：`input-invalid`。
- 超时：终止进程树并保存终止证据，状态`timed-out`。
- 非零退出码：`failed`，保留stdout/stderr尾部和完整日志。
- 退出码0但必需输出缺失：`quality-blocked`。
- PSM无decoy、FDR超限、位点无法定位：`quality-blocked`或`awaiting-downstream`，不得生成定量完成状态。
- 解析字段漂移：解析器拒绝猜测，记录`unsupported-output-schema`。
- 单批参照药或批次标识缺失：可以保存上游结果，但不得完成监管区间比较。

## 9. 许可证和部署建议

- MIT/BSD/Apache：Sage、MetaMorpheus、OpenMS、pyteomics、glypy、GlycReSoft可优先评估，但仍需保留许可证、版本和引用。
- LGPL-3.0：FlashLFQ建议用户自备二进制或独立进程部署，确认分发义务。
- GPL-3.0：hplc-py和chromConverter建议独立环境/进程、不得复制源码进入BioCompare；商业部署和再分发前进行正式法律审查。
- 所有工具先标记`technical-pilot`；只有完成真实代表性数据、固定参数、输出解析回归和审计验证后，才可标记`validated`。

## 10. 建议下一阶段

1. 首先实现P1的“SEQ-02 + SEQ-03 + PTM-01/03/04”共享OpenMS/Sage结果适配器，复用现有安装和PTM质量闸门。
2. 然后实现P2的`chromConverter → hplc-py`两阶段色谱管线，先限定SEC三项，避免把通用峰拟合误用于CE-SDS。
3. 最后以一套已知糖蛋白标准数据验证GlycReSoft，再开放GLY-01/04/07~09。
4. 不适用项目继续保留“待接入”，直至找到与检测方法直接匹配且许可证清晰的专业工具。

## 11. 核验来源

- https://github.com/lazear/sage
- https://sage-docs.vercel.app/docs/configuration
- https://github.com/smith-chem-wisc/MetaMorpheus
- https://github.com/smith-chem-wisc/FlashLFQ
- https://github.com/OpenMS/OpenMS
- https://openms.de/documentation/TOPP_SageAdapter.html
- https://github.com/levitsky/pyteomics
- https://github.com/michaelmarty/UniDec
- https://github.com/cremerlab/hplc-py
- https://github.com/ethanbass/chromConverter
- https://github.com/mobiusklein/glypy
- https://github.com/mobiusklein/glycresoft
- https://mobiusklein.github.io/glycresoft/docs/_build/html/cli-apps/index.html
