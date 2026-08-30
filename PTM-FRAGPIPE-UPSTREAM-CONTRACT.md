# FragPipe/MSFragger → BioCompare PTM上游状态与输出合同

版本：R0.1  
维护分支：03｜PTM区间与位点定量  
适用范围：用户自行安装并自行确认许可的FragPipe/MSFragger工作流，作为BioCompare PTM/MAM的可选上游。

## 1. 定位与固定边界

- FragPipe/MSFragger不是BioCompare默认或随产品分发的PTM引擎，只是用户自备可选上游。
- 当前环境未配置`FRAGPIPE_BIN`，不得真实运行FragPipe，不得声称已安装、已验证或生产可用。
- `fragpipe --headless`返回码0只表示外部程序执行完成，不表示FDR、位点定位、XIC定量或PTM区间比较完成。
- FragPipe输出只有经过受控解析、质量闸门和统一PTM定量合同转换后，才能进入`/ptm/analyze`。
- 现有OpenMS + Sage `/ptm/openms-sage/jobs`路径保持不变；FragPipe适配器不得替换、降级或旁路该路径。
- 无论上游引擎为何，BioCompare只输出客观区间和风险标记，不自动给出相似性结论。

## 2. 分层完成概念

必须分别记录四种完成状态，禁止用一个`completed`混合表示：

1. **外部执行完成**：FragPipe进程返回0，并登记预期产物。
2. **上游质量完成**：FDR、修饰定位和系统适用性均通过预设门槛。
3. **位点定量完成**：经验证的XIC提取、积分、归一化、LOQ和干扰检查完成。
4. **PTM比较完成**：独立多批参照药数据满足要求，区间引擎完成逐位点客观标记。

只有第4层完成后，PTM业务任务才允许使用`completed`。

## 3. 规范状态机

API内部建议统一使用下划线状态名；页面可显示对应中文。

| 状态 | 进入条件 | 允许的下一步 | 可进入PTM汇总 |
| --- | --- | --- | --- |
| `staging` | 正在保存输入 | `queued` / `failed` | 否 |
| `queued` | 输入保存完成 | `running` / `interrupted` | 否 |
| `running` | FragPipe进程运行中 | `upstream_completed` / `quality_blocked` / `failed` / `timed_out` | 否 |
| `upstream_completed` | 返回码0且预期上游产物存在，但尚未完成结构化质量评估 | `awaiting_quality_gate` / `quality_blocked` | 否 |
| `awaiting_quality_gate` | 已解析鉴定结果，等待或正在执行FDR、定位和系统适用性检查 | `awaiting_quantification` / `quality_blocked` | 否 |
| `awaiting_quantification` | 鉴定质量门槛通过，但尚无合格XIC位点定量表 | `awaiting_interval` / `quality_blocked` | 否 |
| `awaiting_interval` | FDR、定位、系统适用性和XIC定量已通过，统一PTM表已形成，但区间尚未计算 | `completed` / `quality_blocked` / `failed` | 否 |
| `quality_blocked` | 任一必要质量门槛未通过或证据不足 | 重新提交新任务 | 仅汇总阻断原因，不得汇总区间结果 |
| `completed` | 区间引擎成功完成且形成正式客观PTM结果 | 终态 | 是 |
| `failed` | 输入、解析器、外部程序或内部程序错误 | 重新提交 | 否 |
| `timed_out` | 外部进程超时并终止 | 重新提交 | 否 |
| `interrupted` | 服务重启或人为中断 | 重新提交 | 否 |

### 当前代码的过渡状态映射

当前`engine-tasks`使用`awaiting_downstream`表示“FragPipe返回0且输出目录有文件”。在专属适配器完成前：

- `awaiting_downstream`只能视为`upstream_completed`的兼容别名。
- 不得将`awaiting_downstream`显示为“PTM已完成”。
- `progress=75`只表示上游进度占位，不表示完成75%的监管分析。
- 后续解析器能够确定阶段后，应迁移到`awaiting_quality_gate`、`awaiting_quantification`或`awaiting_interval`。

### 当前骨架与正式合同的差距

- 当前代码只统计`outputs/`下是否出现文件，没有验证文件名称、格式、非空内容或可解析性。
- 当前代码尚未解析FragPipe/MSFragger、Philosopher、IonQuant等组件的真实版本和质量统计。
- 当前代码没有执行FDR、定位概率、XIC、LOQ或系统适用性门槛。
- 当前`awaiting_downstream`可作为外部进程生命周期的终态，但必须作为PTM业务流程的中间态。
- 当前产物清单只证明路径已登记，不证明产物适合形成统一PTM位点表。

因此当前骨架只能评价为“调度接口已预留”，不能评价为“技术连通已验证”。

## 4. 每一道门槛

### 4.1 外部执行与产物门槛

返回码0还必须同时满足：

- 工作流和manifest已保存SHA-256；
- FragPipe及关键组件真实自报版本已记录；
- stdout、stderr、实际命令、工作目录和运行时间已登记；
- 预期输出文件存在、非空且可以解析；
- 输出文件与上传manifest的样品运行能够一一对应。

返回码0但没有可登记输出时进入`quality_blocked`；非零返回码进入`failed`。

### 4.2 FDR与鉴定门槛

- 明确PSM、肽段和蛋白层采用的FDR层级与阈值。
- 正式PTM位点输入至少要求目标PSM的q值不高于0.01。
- 保留目标/诱饵标签、q值、肽段序列、修饰形式、蛋白归属和运行标识。
- 未执行FDR时停留在`awaiting_quality_gate`；执行后无合格鉴定进入`quality_blocked`。

### 4.3 修饰定位与系统适用性门槛

- 位点特异性修饰必须有定位概率和预先冻结的接受阈值。
- 无法唯一定位的修饰不得静默指定到残基。
- 系统适用性必须覆盖质量精度、保留时间、响应、峰形、重复性及携带污染。
- 定位概率或系统适用性不满足时进入`quality_blocked`。

### 4.4 XIC定量门槛

- 使用经验证的MS1/XIC峰面积或已批准的等效方法，不接受仅有PSM或谱图强度的结果冒充位点定量。
- 记录修饰肽和未修饰肽的提取离子窗口、保留时间窗口、积分边界、归一化与相对丰度计算方法。
- 每条定量记录保留LOQ、缺失值原因、积分质量和共洗脱干扰状态。
- 尚未形成合格XIC定量表时为`awaiting_quantification`；定量失败或低于门槛时为`quality_blocked`。

### 4.5 区间准入门槛

进入`awaiting_interval`前必须同时满足：

- 统一PTM表字段合同验证通过；
- 候选药与参照药样品角色明确；
- 独立生产批次、制样、技术重复和仪器运行关系可追溯；
- 参照药最低批次数按独立生产批次统计，不按文件或技术运行数量统计；
- 候选药与参照药不存在原始文件哈希复用；
- FDR、定位概率、系统适用性、XIC及LOQ质量标记全部满足预设规则。

只有`/ptm/analyze`成功返回正式比较结果后，业务状态才能改为`completed`。

## 5. FragPipe上游结果合同

专属适配器输出建议采用以下任务级结构。字段不得用默认值伪造；未知或未执行必须显式为`null`、`false`或对应等待状态。

```json
{
  "taskId": "...",
  "engineKey": "fragpipe-msfragger",
  "businessStatus": "awaiting_quantification",
  "upstreamExecution": {
    "status": "completed",
    "returnCode": 0,
    "startedAt": "...",
    "completedAt": "...",
    "workflowSha256": "...",
    "manifestSha256": "...",
    "versions": {
      "fragpipe": null,
      "msfragger": null,
      "philosopher": null,
      "ionquant": null
    }
  },
  "identificationQuality": {
    "evaluated": false,
    "psmQValueThreshold": 0.01,
    "targetPsmCount": null,
    "decoyPsmCount": null,
    "passingTargetPsmCount": null,
    "passed": null
  },
  "localizationQuality": {
    "evaluated": false,
    "probabilityThreshold": null,
    "localizedRecordCountPassing": null,
    "passed": null
  },
  "quantification": {
    "status": "not_evaluated",
    "method": null,
    "xicAreaAvailable": false,
    "loqRuleApplied": false,
    "quantifiedSiteRecordCountPassing": null
  },
  "systemSuitability": {
    "evaluated": false,
    "passed": null,
    "failures": []
  },
  "intervalEligibility": {
    "eligible": false,
    "independentReferenceLotCount": null,
    "requiredReferenceLotCount": 3,
    "blockingReasons": ["XIC quantification has not been evaluated"]
  },
  "comparison": null,
  "artifacts": [],
  "audit": {
    "inputFiles": [],
    "parameters": {},
    "commands": [],
    "adapterVersion": null
  },
  "disclaimer": "Upstream execution does not constitute PTM comparison or a biosimilarity conclusion."
}
```

## 6. 统一PTM位点表合同

FragPipe输出经过FDR、定位和XIC定量适配后，至少转换出以下字段，才能提交区间引擎：

- `lot_id`
- `protein_chain`
- `residue`
- `position`
- `modification`
- `value_percent`
- `replicate_id`
- `quant_status`
- `loq_percent`
- `identification_q_value`
- `localization_probability`
- `risk_level`

转换器还必须保留源PSM/肽段ID、原始运行ID、FragPipe结果文件和转换器版本之间的追溯关系。

## 7. API与页面显示要求

- `GET /engine-tasks/{taskId}`同时返回`upstreamExecutionStatus`和PTM业务状态，避免只显示单一完成状态。
- `GET /engine-tasks/{taskId}/result`在区间完成前必须保持`comparison: null`和`ptmComparisonCompleted: false`。
- 上游等待状态的操作入口应为“查看上游产物/继续质量处理”，不得显示“查看PTM比对结果”。
- `quality_blocked`页面展示具体门槛、实际值、阈值和可下载审计产物。
- 只有`completed`可以回传区间外数量、新增修饰数量和逐位点结果。
- 总项目可以登记上游任务状态，但不得把等待或阻断任务计入“PTM比对已完成”。

## 8. 正负回归预期

### 当前未配置环境

- `FRAGPIPE_BIN`为空或路径无效时，创建真实任务应被拒绝或进入`failed`，错误明确提示未配置。
- 不得调用替代程序伪造FragPipe成功结果。
- 引擎状态保持未安装/未检测或未配置，`regulatoryWorkflowValidated=false`、`productionAvailable=false`。

### 上游正向、下游未完成

- FragPipe返回0且存在可解析输出：状态只能是`upstream_completed`或兼容的`awaiting_downstream`。
- 有FDR合格鉴定但无XIC定量：`awaiting_quantification`。
- XIC及所有质量门槛通过但尚未运行区间：`awaiting_interval`。

### 必须阻断

- 返回0但没有可解析输出。
- FDR无合格目标PSM或未达到预设阈值。
- 修饰无法唯一定位或定位概率不足。
- 系统适用性失败。
- XIC积分失败、低于LOQ或存在不可接受干扰。
- 参照药独立生产批次数不足或批次身份无法追溯。
- 候选药与参照药复用相同原始文件。

## 9. 放行条件

FragPipe路径只有在以下条件全部满足后，才可以考虑升级监管验证或生产状态：

1. 用户自备部署和许可边界完成审查。
2. FragPipe及相关组件版本、workflow和manifest合同冻结。
3. 专属输出解析器完成FDR、定位概率、XIC和系统适用性字段映射。
4. 统一PTM表合同和完整审计追溯验证通过。
5. 独立多批高分辨率MAM正向与负向回归通过。
6. 与OpenMS + Sage路径在相同业务合同下完成结果一致性或差异解释验证。
7. 多批参照区间、选择性单批漏洞及候选新增修饰预警测试通过。

在此之前必须保持：

- `technicalConnectivityValidated = false`（当前未配置，不能真实运行）
- `regulatoryWorkflowValidated = false`
- `productionAvailable = false`

## 10. 当前合同实现与回归

- `backend/ptm_upstream_contract.py`：纯证据状态判定器；不执行搜库、FDR、定位、XIC或区间算法。
- `backend/local_engine_tasks.py`：FragPipe骨架结果附加`ptmStageContract`，同时保留现有`awaiting_downstream`兼容状态。
- `tests/test_ptm_upstream_contract.py`：固定无输出阻断、仅上游完成、等待质量门槛、FDR阻断、等待XIC、等待区间、正式完成及提前附带comparison拒绝等状态。
- `tests/test_integration_skeleton.py`：验证`engine-tasks`结果中的规范阶段、`ptmComparisonCompleted=false`及`comparison=null`。

2026-08-21执行全部Python回归：28项全部通过。该结果只验证状态合同和系统骨架，不代表FragPipe专业链路已经安装或完成验证。
