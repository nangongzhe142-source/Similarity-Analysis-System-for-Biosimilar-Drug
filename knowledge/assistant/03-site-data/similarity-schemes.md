# V2 Sheet3 相似性评价规则 sidecar

- sourceFile: src/data/similarity-schemes.ts
- sourceWorkbook: V2-生物类似药药学比对研究质量属性、检测方法及相似性评价原则汇总表.xlsx
- sourceWorkbookSha256: 8bd6b18f08d3b9a3b99c61cdb8eeff24ceef75a54a43b9f7d14d1709b703051f
- sourceSheet: 3.特性鉴定相似性评价方案
- nature: 系统规则

## itemId `intact-mass`
- sourceRow: 2
- completeness: complete
- methodIds: intact-mass-primary-1, intact-mass-orthogonal-1, intact-mass-orthogonal-2
- guidelineTerm.zh: 完整分子量
- recognizedContent.zh: 去卷积实测质量；对应结构的理论质量；实测与理论质量差值（ΔDa或Δppm）；
- comparisonBaseline.zh: 理论结构；候选药与参照药的头对头比较
- decisionMethod.zh: ① 确认候选药与参照药的主要完整分子形式能够相互对应，并符合理论分子结构；
- numericBoundary.zh: 
- finalProgramRule.zh: 
- basis.zh: 

## itemId `deglycosylated-intact-mass`
- sourceRow: 3
- completeness: complete
- methodIds: deglycosylated-intact-mass-primary-1, deglycosylated-intact-mass-orthogonal-1, deglycosylated-intact-mass-orthogonal-2
- guidelineTerm.zh: 脱糖分子量
- recognizedContent.zh: 去卷积实测质量；对应结构的理论脱糖质量；实测与理论质量差值（ΔDa或Δppm）；
- comparisonBaseline.zh: 理论脱糖结构；候选药与参照药的头对头比较
- decisionMethod.zh: ①确认候选药与参照药主要脱糖分子形式相互对应并符合理论结构；
- numericBoundary.zh: 
- finalProgramRule.zh: 
- basis.zh: 

## itemId `light-chain-mass`
- sourceRow: 4
- completeness: complete
- methodIds: light-chain-mass-primary-1, light-chain-mass-orthogonal-1, light-chain-mass-orthogonal-2
- guidelineTerm.zh: 轻链分子量
- recognizedContent.zh: 去卷积实测质量；理论轻链质量；实测与理论质量差值（ΔDa或Δppm）；
- comparisonBaseline.zh: 理论轻链结构；候选药与参照药的头对头比较
- decisionMethod.zh: ①主要轻链分子形式与RP对应并符合理论结构；②实测质量与理论质量偏差符合方法准确度要求；
- numericBoundary.zh: 
- finalProgramRule.zh: 
- basis.zh: 

## itemId `non-deglycosylated-heavy-chain-mass`
- sourceRow: 5
- completeness: complete
- methodIds: non-deglycosylated-heavy-chain-mass-primary-1, non-deglycosylated-heavy-chain-mass-orthogonal-1, non-deglycosylated-heavy-chain-mass-orthogonal-2
- guidelineTerm.zh: 非脱糖重链分子量
- recognizedContent.zh: 去卷积实测质量；理论重链质量；实测与理论质量差值（ΔDa或Δppm）；
- comparisonBaseline.zh: 理论重链结构；候选药与参照药的头对头比较
- decisionMethod.zh: ①主要重链分子形式与RP对应并符合理论结构；②实测质量符合方法准确度要求；
- numericBoundary.zh: 
- finalProgramRule.zh: 
- basis.zh: 

## itemId `deglycosylated-heavy-chain-mass`
- sourceRow: 6
- completeness: complete
- methodIds: deglycosylated-heavy-chain-mass-primary-1, deglycosylated-heavy-chain-mass-orthogonal-1, deglycosylated-heavy-chain-mass-orthogonal-2
- guidelineTerm.zh: 脱糖后重链分子量
- recognizedContent.zh: 实测/理论质量；ΔDa/Δppm；主要峰归属；异常新峰
- comparisonBaseline.zh: 理论脱糖重链结构；候选药与参照药的头对头比较
- decisionMethod.zh: ①主要脱糖重链形式与RP对应并符合理论结构；②实测质量符合方法准确度要求；
- numericBoundary.zh: 
- finalProgramRule.zh: 
- basis.zh: 

## itemId `ms1-sequence-coverage`
- sourceRow: 7
- completeness: complete
- methodIds: ms1-sequence-coverage-primary-1, ms1-sequence-coverage-orthogonal-1, ms1-sequence-coverage-orthogonal-2
- guidelineTerm.zh: 序列覆盖率/一级质谱
- recognizedContent.zh: 实测/理论肽质量、Δppm、匹配肽段、覆盖区段、覆盖率（%）
- comparisonBaseline.zh: 理论氨基酸序列；候选药与参照药头对头比较
- decisionMethod.zh: 检出肽段质量应与理论肽匹配；候选药与RP应获得充分且一致的序列覆盖，
- numericBoundary.zh: 无序列覆盖率（Sequence Coverage）的统一合格判定阈值，
- finalProgramRule.zh: 覆盖充分+肽段匹配+无序列异常→PASS；覆盖不足→REVIEW；确认关键序列差异→FAIL
- basis.zh: 

## itemId `msms-sequence-coverage`
- sourceRow: 8
- completeness: complete
- methodIds: msms-sequence-coverage-primary-1, msms-sequence-coverage-orthogonal-1, msms-sequence-coverage-orthogonal-2
- guidelineTerm.zh: 序列覆盖率/二级质谱
- recognizedContent.zh: 鉴定肽段、碎片离子匹配、覆盖区段、覆盖率（%）、未覆盖区段
- comparisonBaseline.zh: 理论氨基酸序列；候选药与参照药头对头比较
- decisionMethod.zh: MS/MS碎片应支持理论肽序列；候选药与RP应获得充分序列确认，
- numericBoundary.zh: 无序列覆盖率（Sequence Coverage）的统一合格判定阈值，
- finalProgramRule.zh: 序列确认充分+无序列异常→PASS；覆盖不足→REVIEW；确认关键序列差异→FAIL
- basis.zh: 

## itemId `cdr-signature-peptides`
- sourceRow: 11
- completeness: partial
- methodIds: 
- guidelineTerm.zh: CDR区特征肽段鉴别
- notDefinedReason.zh: V2 汇总表 Sheet3 第 11 行仅填写至 F 列（结果类型），

## itemId `n-c-terminal-sequence`
- sourceRow: 
- completeness: absent
- methodIds: 
- guidelineTerm.zh: C/N端氨基酸序列
- notDefinedReason.zh: V2 汇总表 Sheet3 中没有「C/N端氨基酸序列」对应的行（Sheet2 第 12 行有该项目，

## itemId `free-thiol`
- sourceRow: 
- completeness: absent
- methodIds: 
- guidelineTerm.zh: 游离巯基
- notDefinedReason.zh: Sheet3 未定义该项程序规则。

## itemId `disulfide-bonds`
- sourceRow: 
- completeness: absent
- methodIds: 
- guidelineTerm.zh: 二硫键
- notDefinedReason.zh: Sheet3 未定义该项程序规则。
