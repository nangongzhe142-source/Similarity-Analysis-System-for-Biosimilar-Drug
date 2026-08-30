# BioCompare 第三方质谱引擎集成说明

## 系统边界

BioCompare 不重复实现质谱去卷积、数据库检索、FDR 控制或肽段定量算法。系统仅负责：材料路由、任务编排、参数组装、外部 CLI 调用、超时和失败处理、输出解析、候选药与多批参照药的监管业务比对、页面展示、审计记录与报告导出。

## 当前专项与引擎映射

| 专项 | 默认专业引擎 | 可选引擎 | BioCompare 自身职责 |
|---|---|---|---|
| 完整分子量 | UniDec | OpenMS FLASHDeconv（mzML） | 匹配候选药/参照药去卷积峰，计算质量偏移并展示 |
| 脱糖完整分子量 | UniDec | OpenMS FLASHDeconv（mzML） | 同上，业务语义为脱糖后结果 |
| 轻链分子量 | UniDec | OpenMS FLASHDeconv（mzML） | 同上，业务语义为还原轻链 |
| 未脱糖重链分子量 | UniDec | OpenMS FLASHDeconv（mzML） | 同上，保留糖型分布信息 |
| 脱糖重链分子量 | UniDec | OpenMS FLASHDeconv（mzML） | 同上，聚焦主链质量 |
| PTM/MAM 位点定量 | OpenMS + Sage 产生鉴定/定量结果 | 用户自备 FragPipe/MSFragger | 读取专业结果，构建多批参照区间、标记偏离和新型修饰；不重新做谱图搜索 |

## 已实现调用

- `POST /jobs`：`engineKey=auto` 时，`.txt/.dat` 自动选择 UniDec，`.mzML` 自动选择 FLASHDeconv。
- 每个任务独立保存输入、参数、命令合同、外部程序版本、输入 SHA-256、标准输出/错误日志和结构化结果。
- 外部进程有统一硬超时；超时、非零退出码、缺失输出和解析失败都会形成失败状态，不会伪造成功结果。
- `GET /external-engines`：返回所有引擎的真实安装状态、版本、路径、许可、支持格式和缺失组件。
- PTM 接口只接受结构化位点定量表，监管区间逻辑与上游质谱识别/定量算法明确分层。

## 部署配置

在 `.env.local` 中配置实际安装位置；不配置时从 PATH 探测：

```text
EXTERNAL_ENGINE_TIMEOUT_SECONDS=600
UNIDEC_BIN=C:\path\to\unidec.exe
OPENMS_BIN_DIR=C:\Program Files\OpenMS\bin
FLASHDECONV_BIN=C:\Program Files\OpenMS\bin\FLASHDeconv.exe
SAGE_BIN=C:\path\to\sage.exe
FRAGPIPE_BIN=C:\path\to\fragpipe.exe
```

程序不会静默下载或捆绑第三方软件。这样可以让部署单位单独完成版本锁定、软件验证、许可证审查和升级控制。

## 许可证与选择理由

- UniDec：许可允许源代码和二进制再分发，但包含明确的标示和论文引用传递要求；系统必须在页面和报告中保留 UniDec 名称与版本。
- OpenMS：三条款 BSD；提供 150 多个 TOPP 命令行工具和统一参数机制，适合任务编排。
- FLASHDeconv：OpenMS 内的顶端蛋白去卷积工具，输入 mzML，输出 TSV/mzML/msalign/feature。
- Sage：MIT 许可，支持数据库检索、开放搜索、FDR 与定量，并可通过 OpenMS SageAdapter 编排。
- FragPipe/MSFragger：功能完整但组件许可证不统一。BioCompare 只保留“用户自备安装”的适配位置，不随产品打包或再分发，部署前必须单独审查商业/非学术许可。

## 尚需部署方完成

当前环境已探测到 UniDec 8.2.1。OpenMS/FLASHDeconv、Sage、FragPipe 尚未安装，因此其适配器会明确显示“未安装”并拒绝启动相关任务。安装后无需修改业务代码，只需配置路径并重启后端。
