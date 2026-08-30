# OpenMS + Sage 真实 mzML/FASTA PTM/MAM 全链路验证

验证日期：2026-08-20

## 结论

技术链路已打通：真实 mzML → OpenMS 目标/诱饵库 → Sage 数据库检索 → PSM/FDR → 肽段修饰映射到蛋白位点 → 技术定量代理表 → BioCompare 多批参照区间 → HTTP API 结果。

这次验证不构成 MAM 方法学验证，也不构成生物类似性结论。所用示例为 OpenMS 安装包附带的旧版低分辨率 BSA 教学数据；严格 1% FDR 下没有 PSM 通过，因此严格输入被 BioCompare 接口以 HTTP 422 拒绝。为验证后半段程序连通性，另用未过滤结果运行“诊断模式”；诊断结果不得进入审评报告。

## 已安装程序

- OpenMS 3.5.0：`C:\Users\MI\OpenMS-3.5.0`
- Sage：`D:\BioCompareEngines\Sage-0.14.6\sage-v0.14.6-x86_64-pc-windows-msvc\sage.exe`
- BioCompare 启动配置：项目根目录 `.env.local`

2026-08-20 18:05 已受控重启 8000 端口后端并在线复验：`GET /external-engines` 返回 OpenMS+Sage `available=true`、必需清单包含 `sage`、缺失清单为空。这里的 `available` 只表示程序安装与调用路径可用，不表示正式监管/MAM方法可用。

后续复验确认官方 v0.14.7 Windows 资产仍自报 0.14.6。为消除部署记录歧义，当前运行时已固定到官方 v0.14.6 Windows 资产，配置声明和程序自报均为 0.14.6。

## 真实输入

| 文件 | 大小（字节） | SHA-256 |
|---|---:|---|
| BSA1.mzML | 13,642,066 | `DC9ED61D595328D4EF2F1DE47D21F41B83E2EAE7C9145E1D9B88E910C8CEC2F7` |
| BSA2.mzML | 10,972,988 | `B1A24B44FA71C0918C0078786B9618E84696334079DD9976FD927FFF57C3156F` |
| BSA3.mzML | 10,475,965 | `B70C24E0130CDF46620715A4FCEBD5FC5F23FF68D2943127EDECEBDC22B6E58C` |
| 原始 FASTA | 4,928,077 | `714D53EDAF768C5162715CAE974CB3FA040477879BD999A45C28C66712A04CA8` |
| OpenMS 生成的目标/诱饵 FASTA | 10,035,524 | `31EDCE1B050C57424772792BE79784DE17C9D3A746609EB674FAB4C9EEA5D628` |

## 搜索参数

- 酶：Trypsin；最多 2 个漏切位点
- 固定修饰：Carbamidomethyl (C)
- 可变修饰：Oxidation (M)、Deamidated (N)、Deamidated (Q)
- 前体容差：±0.05 Da
- 碎片容差：±0.3 Da
- 目标/诱饵：OpenMS `DecoyDatabase`，`DECOY_` 前缀、反转法
- 严格质量阈值：谱图 q 值 ≤ 0.01

采用 Da 容差是因为官方随附的原 OMSSA 结果记录前体容差 0.05 Da、碎片容差 0.3 Da；使用默认高分辨率 ppm 参数时检索为零结果。

## 结果

- Sage 原始输出：1,583 条 PSM，其中目标 854、诱饵 729。
- 最低谱图 q 值约 0.04598；严格 1% FDR：0 条通过。
- 严格转换表只有表头，HTTP `/ptm/analyze` 返回 422，符合质量闸门预期。
- 诊断模式映射：BSA1 188 个、BSA2 180 个、BSA3 83 个修饰位点记录。
- BioCompare 诊断任务：422 个分析位点；2 个位点有 3 个“参照运行”数据并成功构建观测范围；420 个位点因批次覆盖不足不构建区间。
- 诊断候选输入复用了 BSA3，仅为管线连通测试，不是独立候选药。2 个可评估项标记为区间内；全部保留“鉴定 q 值高于 0.01”警告。
- 完整性警告 840 条，说明区间引擎没有把数据不足静默当作合格结果。

## 文件说明

- `input/`：真实 mzML、原始 FASTA、派生目标/诱饵 FASTA
- `sage/results.sage.tsv`：Sage PSM 结果
- `sage/bsa-3runs-fdr01.idXML`：OpenMS SageAdapter 的严格 FDR 输出（无通过鉴定）
- `biocompare/reference-fdr01.csv`、`candidate-fdr01.csv`：严格模式输入（仅表头）
- `biocompare/reference-diagnostic.csv`、`candidate-diagnostic.csv`：仅用于后半链路验证
- `biocompare/api-result-diagnostic.json`：真实 HTTP API 任务结果

## 已知限制与生产化要求

1. 本次 `value_percent` 用 MS2 intensity 构造技术代理，不等同于经验证的 XIC 峰面积 MAM 定量。
2. Sage 结果没有提供可直接用于本转换器的位点定位概率；生产链应增加定位算法/阈值。
3. 三个 BSA 文件是三个真实技术运行，不应被解释为三批独立参照药。
4. 候选输入复用了 BSA3，不可用于任何候选药判断。
5. 生产验证需要用户提供独立多批参照药和候选药、高分辨率原始数据、实验设计、方法学参数、系统适用性和预设 CQA 规则。

## 官方来源

- OpenMS Windows 安装：https://openms.readthedocs.io/en/latest/about/installation/installation-on-windows.html
- OpenMS GitHub：https://github.com/OpenMS/OpenMS
- Sage v0.14.7 发布页：https://github.com/lazear/sage/releases/tag/v0.14.7
- Sage GitHub：https://github.com/lazear/sage
