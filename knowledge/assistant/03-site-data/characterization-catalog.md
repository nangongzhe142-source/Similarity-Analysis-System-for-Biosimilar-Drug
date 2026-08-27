# 检测项目与方法目录

- sourceFile: src/data/characterization-items.ts
- nature: 系统规则（网页实际展示数据，源自 V2 Excel）

## itemId `intact-mass`
- categoryKey: primary-structure
- itemName.zh: 完整分子质量（intact mass）
- itemName.en: Intact molecular mass (intact mass)
- guidelineTerm.zh: 完整分子量
- isSupplementary: False
- judgingPrinciple.zh: 采用候选药与参照药同条件头对头定性/图谱比较；结合理论结构和正交方法解释差异。主要分子形式应对应，差异可由已知糖型或翻译后修饰解释，不应出现无法解释的新分子形式。
- numericLimit.zh: 无通用于所有品种的统一数值限度；仪器质量准确度属于方法性能，不是“相差多少Da即可相似”的判定线
- methodId `intact-mass-primary-1` type=primary name.zh=LC-ESI-MS（高分辨QTOF/Orbitrap等）
- methodId `intact-mass-orthogonal-1` type=orthogonal name.zh=肽图LC-MS/MS
- methodId `intact-mass-orthogonal-2` type=orthogonal name.zh=完整/脱糖/亚基结果相互印证

## itemId `deglycosylated-intact-mass`
- categoryKey: primary-structure
- itemName.zh: 脱糖完整分子质量
- itemName.en: Deglycosylated intact molecular mass
- guidelineTerm.zh: 脱糖分子量
- isSupplementary: False
- judgingPrinciple.zh: 采用候选药与参照药同条件头对头定性/图谱比较；结合理论结构和正交方法解释差异。主要分子形式应对应，差异可由已知糖型或翻译后修饰解释，不应出现无法解释的新分子形式。
- numericLimit.zh: 无通用于所有品种的统一数值限度；仪器质量准确度属于方法性能，不是“相差多少Da即可相似”的判定线
- methodId `deglycosylated-intact-mass-primary-1` type=primary name.zh=酶法脱糖后LC-ESI-MS
- methodId `deglycosylated-intact-mass-orthogonal-1` type=orthogonal name.zh=肽图LC-MS/MS
- methodId `deglycosylated-intact-mass-orthogonal-2` type=orthogonal name.zh=完整/脱糖/亚基结果相互印证

## itemId `light-chain-mass`
- categoryKey: primary-structure
- itemName.zh: 轻链分子质量
- itemName.en: Light chain molecular mass
- guidelineTerm.zh: 轻链分子量
- isSupplementary: False
- judgingPrinciple.zh: 采用候选药与参照药同条件头对头定性/图谱比较；结合理论结构和正交方法解释差异。主要分子形式应对应，差异可由已知糖型或翻译后修饰解释，不应出现无法解释的新分子形式。
- numericLimit.zh: 无通用于所有品种的统一数值限度；仪器质量准确度属于方法性能，不是“相差多少Da即可相似”的判定线
- methodId `light-chain-mass-primary-1` type=primary name.zh=还原/亚基LC-MS
- methodId `light-chain-mass-orthogonal-1` type=orthogonal name.zh=肽图LC-MS/MS
- methodId `light-chain-mass-orthogonal-2` type=orthogonal name.zh=完整/脱糖/亚基结果相互印证

## itemId `non-deglycosylated-heavy-chain-mass`
- categoryKey: primary-structure
- itemName.zh: 未脱糖重链分子质量
- itemName.en: Non-deglycosylated heavy chain molecular mass
- guidelineTerm.zh: 非脱糖重链分子量
- isSupplementary: False
- judgingPrinciple.zh: 采用候选药与参照药同条件头对头定性/图谱比较；结合理论结构和正交方法解释差异。主要分子形式应对应，差异可由已知糖型或翻译后修饰解释，不应出现无法解释的新分子形式。
- numericLimit.zh: 无通用于所有品种的统一数值限度；仪器质量准确度属于方法性能，不是“相差多少Da即可相似”的判定线
- methodId `non-deglycosylated-heavy-chain-mass-primary-1` type=primary name.zh=还原后重链LC-MS
- methodId `non-deglycosylated-heavy-chain-mass-orthogonal-1` type=orthogonal name.zh=肽图LC-MS/MS
- methodId `non-deglycosylated-heavy-chain-mass-orthogonal-2` type=orthogonal name.zh=完整/脱糖/亚基结果相互印证

## itemId `deglycosylated-heavy-chain-mass`
- categoryKey: primary-structure
- itemName.zh: 脱糖重链分子质量
- itemName.en: Deglycosylated heavy chain molecular mass
- guidelineTerm.zh: 脱糖后重链分子量
- isSupplementary: False
- judgingPrinciple.zh: 采用候选药与参照药同条件头对头定性/图谱比较；结合理论结构和正交方法解释差异。主要分子形式应对应，差异可由已知糖型或翻译后修饰解释，不应出现无法解释的新分子形式。
- numericLimit.zh: 无通用于所有品种的统一数值限度；仪器质量准确度属于方法性能，不是“相差多少Da即可相似”的判定线
- methodId `deglycosylated-heavy-chain-mass-primary-1` type=primary name.zh=脱糖并还原后LC-MS
- methodId `deglycosylated-heavy-chain-mass-orthogonal-1` type=orthogonal name.zh=肽图LC-MS/MS
- methodId `deglycosylated-heavy-chain-mass-orthogonal-2` type=orthogonal name.zh=完整/脱糖/亚基结果相互印证

## itemId `ms1-sequence-coverage`
- categoryKey: primary-structure
- itemName.zh: MS1肽质量覆盖率
- itemName.en: MS1 peptide mass coverage
- guidelineTerm.zh: 序列覆盖率/一级质谱
- isSupplementary: False
- judgingPrinciple.zh: 采用候选药与参照药同条件头对头定性/图谱比较；结合理论结构和正交方法解释差异。主要分子形式应对应，差异可由已知糖型或翻译后修饰解释，不应出现无法解释的新分子形式。
- numericLimit.zh: 无通用统一数值限度；应关注关键区域和方法盲区
- methodId `ms1-sequence-coverage-primary-1` type=primary name.zh=酶切肽图LC-MS（MS1）
- methodId `ms1-sequence-coverage-orthogonal-1` type=orthogonal name.zh=LC-MS/MS
- methodId `ms1-sequence-coverage-orthogonal-2` type=orthogonal name.zh=增加其他蛋白酶

## itemId `msms-sequence-coverage`
- categoryKey: primary-structure
- itemName.zh: MS/MS序列确认覆盖率
- itemName.en: MS/MS-confirmed sequence coverage
- guidelineTerm.zh: 序列覆盖率/二级质谱
- isSupplementary: False
- judgingPrinciple.zh: 氨基酸序列原则上应与参照药相同；关键区需有充分序列证据，不得出现未经解释的氨基酸替换。
- numericLimit.zh: 原则上序列一致；CDR和功能关键区应获得明确证据。
- methodId `msms-sequence-coverage-primary-1` type=primary name.zh=肽图LC-MS/MS
- methodId `msms-sequence-coverage-orthogonal-1` type=orthogonal name.zh=不同酶切策略
- methodId `msms-sequence-coverage-orthogonal-2` type=orthogonal name.zh=端基分析

## itemId `ptm-modification-1`
- categoryKey: ptm-glycosylation
- itemName.zh: 翻译后修饰—修饰1
- itemName.en: Post-translational modification — modification 1
- guidelineTerm.zh: 见表末补充
- isSupplementary: False
- judgingPrinciple.zh: 先确认修饰种类和位点；高/中风险且可定量者可按QR或实际范围比较；与MoA直接相关者可关联功能评价。
- numericLimit.zh: 无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。
- methodId `ptm-modification-1-primary-1` type=primary name.zh=肽图LC-MS/MS
- methodId `ptm-modification-1-primary-2` type=primary name.zh=完整/亚基质谱
- methodId `ptm-modification-1-primary-3` type=primary name.zh=必要时专项方法
- methodId `ptm-modification-1-orthogonal-1` type=orthogonal name.zh=电荷/疏水分离、富集后鉴定

## itemId `ptm-modification-2`
- categoryKey: ptm-glycosylation
- itemName.zh: 翻译后修饰—修饰2
- itemName.en: Post-translational modification — modification 2
- guidelineTerm.zh: 见表末补充
- isSupplementary: False
- judgingPrinciple.zh: 先确认修饰种类和位点；高/中风险且可定量者可按QR或实际范围比较；与MoA直接相关者可关联功能评价。
- numericLimit.zh: 无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。
- methodId `ptm-modification-2-primary-1` type=primary name.zh=肽图LC-MS/MS
- methodId `ptm-modification-2-primary-2` type=primary name.zh=完整/亚基质谱
- methodId `ptm-modification-2-primary-3` type=primary name.zh=必要时专项方法
- methodId `ptm-modification-2-orthogonal-1` type=orthogonal name.zh=电荷/疏水分离、富集后鉴定

## itemId `cdr-signature-peptides`
- categoryKey: primary-structure
- itemName.zh: CDR区特征肽确认
- itemName.en: Confirmation of CDR signature peptides
- guidelineTerm.zh: CDR区特征肽段鉴别
- isSupplementary: False
- judgingPrinciple.zh: 候选药CDR特征肽应与参照药/理论序列一致。
- numericLimit.zh: 不适用，定性身份确认
- methodId `cdr-signature-peptides-primary-1` type=primary name.zh=靶向肽图LC-MS/MS
- methodId `cdr-signature-peptides-orthogonal-1` type=orthogonal name.zh=多酶切策略
- methodId `cdr-signature-peptides-orthogonal-2` type=orthogonal name.zh=高分辨MS

## itemId `n-c-terminal-sequence`
- categoryKey: primary-structure
- itemName.zh: N/C端氨基酸序列及末端异质性
- itemName.en: N/C-terminal amino acid sequence and terminal heterogeneity
- guidelineTerm.zh: C/N端氨基酸序列
- isSupplementary: False
- judgingPrinciple.zh: 端基序列应一致；可量化末端异质体可结合风险采用QR或实际范围。
- numericLimit.zh: 序列本身→定性；异质体比例→QR
- methodId `n-c-terminal-sequence-primary-1` type=primary name.zh=肽图LC-MS/MS
- methodId `n-c-terminal-sequence-primary-2` type=primary name.zh=必要时Edman降解
- methodId `n-c-terminal-sequence-orthogonal-1` type=orthogonal name.zh=完整/亚基质谱

## itemId `free-thiol`
- categoryKey: primary-structure
- itemName.zh: 游离巯基水平
- itemName.en: Free thiol level
- guidelineTerm.zh: 游离巯基
- isSupplementary: False
- judgingPrinciple.zh: 与参照药分布总体相似，且不提示候选药增加错误连接或聚集风险。
- numericLimit.zh: 无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。
- methodId `free-thiol-primary-1` type=primary name.zh=Ellman试剂法或荧光巯基法
- methodId `free-thiol-orthogonal-1` type=orthogonal name.zh=非还原肽图LC-MS/MS
- methodId `free-thiol-orthogonal-2` type=orthogonal name.zh=还原/非还原CE-SDS

## itemId `disulfide-bonds`
- categoryKey: primary-structure
- itemName.zh: 二硫键连接图谱
- itemName.en: Disulfide linkage map
- guidelineTerm.zh: 二硫键
- isSupplementary: False
- judgingPrinciple.zh: 预期二硫键连接方式应一致；不应出现未经解释的新连接形式。
- numericLimit.zh: 不适用，预期连接方式一致即可
- methodId `disulfide-bonds-primary-1` type=primary name.zh=非还原肽图LC-MS/MS
- methodId `disulfide-bonds-orthogonal-1` type=orthogonal name.zh=游离巯基
- methodId `disulfide-bonds-orthogonal-2` type=orthogonal name.zh=还原/非还原CE-SDS

## itemId `far-uv-cd`
- categoryKey: higher-order-structure
- itemName.zh: 二级结构（远紫外CD）
- itemName.en: Secondary structure (far-UV CD)
- guidelineTerm.zh: 圆二色谱/远紫外
- isSupplementary: False
- judgingPrinciple.zh: 采用候选药与参照药同条件头对头定性/图谱比较；结合理论结构和正交方法解释差异。多个正交方法应共同支持整体构象相似。
- numericLimit.zh: 无通用于所有品种的统一数值限度；采用头对头定性或图谱比对。
- methodId `far-uv-cd-primary-1` type=primary name.zh=远紫外CD
- methodId `far-uv-cd-orthogonal-1` type=orthogonal name.zh=采用不同原理的正交方法（FT-IR等）
- methodId `far-uv-cd-orthogonal-2` type=orthogonal name.zh=必要时高分辨结构技术（X-ray、NMR等）

## itemId `near-uv-cd`
- categoryKey: higher-order-structure
- itemName.zh: 三级结构（近紫外CD）
- itemName.en: Tertiary structure (near-UV CD)
- guidelineTerm.zh: 圆二色谱/近紫外
- isSupplementary: False
- judgingPrinciple.zh: 采用候选药与参照药同条件头对头定性/图谱比较；结合理论结构和正交方法解释差异。多个正交方法应共同支持整体构象相似。
- numericLimit.zh: 无通用于所有品种的统一数值限度；采用头对头定性或图谱比对。
- methodId `near-uv-cd-primary-1` type=primary name.zh=近紫外CD
- methodId `near-uv-cd-orthogonal-1` type=orthogonal name.zh=采用不同原理的正交方法（内源荧光光谱）
- methodId `near-uv-cd-orthogonal-2` type=orthogonal name.zh=必要时高分辨结构技术（X-ray、NMR等）

## itemId `intrinsic-fluorescence`
- categoryKey: higher-order-structure
- itemName.zh: 三级结构（内源荧光）
- itemName.en: Tertiary structure (intrinsic fluorescence)
- guidelineTerm.zh: 荧光光谱
- isSupplementary: False
- judgingPrinciple.zh: 采用候选药与参照药同条件头对头定性/图谱比较；结合理论结构和正交方法解释差异。多个正交方法应共同支持整体构象相似。
- numericLimit.zh: 无通用于所有品种的统一数值限度；采用头对头定性或图谱比对。
- methodId `intrinsic-fluorescence-primary-1` type=primary name.zh=内源荧光光谱
- methodId `intrinsic-fluorescence-orthogonal-1` type=orthogonal name.zh=采用不同原理的正交方法
- methodId `intrinsic-fluorescence-orthogonal-2` type=orthogonal name.zh=必要时高分辨结构技术

## itemId `thermal-stability`
- categoryKey: higher-order-structure
- itemName.zh: 热稳定性/热转变
- itemName.en: Thermal stability / thermal transitions
- guidelineTerm.zh: 热稳定性
- isSupplementary: False
- judgingPrinciple.zh: 采用候选药与参照药同条件头对头定性/图谱比较；结合理论结构和正交方法解释差异。多个正交方法应共同支持整体构象相似。
- numericLimit.zh: 无通用于所有品种的统一数值限度；采用头对头定性或图谱比对。
- methodId `thermal-stability-primary-1` type=primary name.zh=DSC（差示扫描量热法）
- methodId `thermal-stability-primary-2` type=primary name.zh=可辅以DSF（差示扫描荧光法）
- methodId `thermal-stability-orthogonal-1` type=orthogonal name.zh=采用不同原理的正交方法
- methodId `thermal-stability-orthogonal-2` type=orthogonal name.zh=必要时高分辨结构技术

## itemId `other-higher-order-structure-methods`
- categoryKey: higher-order-structure
- itemName.zh: 其他高级结构确证方法（见表末补充）
- itemName.en: Other higher-order structure confirmation methods (see supplementary entries)
- guidelineTerm.zh: -
- isSupplementary: False
- judgingPrinciple.zh: 采用候选药与参照药同条件头对头定性/图谱比较；结合理论结构和正交方法解释差异。多个正交方法应共同支持整体构象相似。
- numericLimit.zh: 无通用于所有品种的统一数值限度；采用头对头定性或图谱比对。
- methodId `other-higher-order-structure-methods-primary-1` type=primary name.zh=见表末补充

## itemId `n-glycosylation-site-occupancy`
- categoryKey: ptm-glycosylation
- itemName.zh: N-糖基化位点及占有率
- itemName.en: N-glycosylation sites and site occupancy
- guidelineTerm.zh: N-糖基化位点（天冬酰胺Asn，简称N）
- isSupplementary: False
- judgingPrinciple.zh: 糖基化位点应与参照药及预期结构一致。对于典型IgG类单克隆抗体，应重点确认Fc区保守N-糖基化位点（通常为EU编号Asn-297）；如产品存在其他N-或O-糖基化位点，也应分别鉴定并评价占有率
- numericLimit.zh: 无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。
- methodId `n-glycosylation-site-occupancy-primary-1` type=primary name.zh=糖肽LC-MS/MS或PNGase F处理前后肽图LC-MS/MS，用于确认具体糖基化位点及占有率
- methodId `n-glycosylation-site-occupancy-orthogonal-1` type=orthogonal name.zh=完整/亚基分子量LC-MS（宏观检测脱糖前后的质量偏移，验证整体糖型分布）
- methodId `n-glycosylation-site-occupancy-orthogonal-2` type=orthogonal name.zh=PNGase F处理前后完整分子量比对

## itemId `glycan-g0f`
- categoryKey: ptm-glycosylation
- itemName.zh: G0F糖型比例
- itemName.en: G0F glycoform proportion
- guidelineTerm.zh: N-糖链类型及比例/G0F
- isSupplementary: False
- judgingPrinciple.zh: 主要糖型种类和整体分布应与参照药图谱高度相似；G0F作为主峰，可采用质量范围法：；高风险糖型（如G0、高甘露糖）需更严格评估，并关联Fc功能、PK或免疫风险
- numericLimit.zh: 无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。
- methodId `glycan-g0f-primary-1` type=primary name.zh=释放N-糖链HILIC-FLD（释放糖链后，用亲水作用色谱分离，荧光检测器定量各糖型峰面积）
- methodId `glycan-g0f-orthogonal-1` type=orthogonal name.zh=HILIC-MS（用质谱确认各色谱峰对应的具体糖型身份）
- methodId `glycan-g0f-orthogonal-2` type=orthogonal name.zh=糖型LC-MS/MS（补充确证，尤其用于区分共洗脱峰）

## itemId `glycan-g0`
- categoryKey: ptm-glycosylation
- itemName.zh: G0糖型比例
- itemName.en: G0 glycoform proportion
- guidelineTerm.zh: N-糖链类型及比例/G0
- isSupplementary: False
- judgingPrinciple.zh: G0作为高风险增益糖型，其比例不得显著高于参照药，超标需进行ADCC功能活性验证；主要糖型整体分布应与参照药相似；高风险糖型需更严格评估并关联Fc功能、PK或免疫风险
- numericLimit.zh: 无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。
- methodId `glycan-g0-primary-1` type=primary name.zh=释放N-糖链HILIC-FLD
- methodId `glycan-g0-orthogonal-1` type=orthogonal name.zh=HILIC-MS
- methodId `glycan-g0-orthogonal-2` type=orthogonal name.zh=糖型LC-MS/MS

## itemId `other-n-glycans`
- categoryKey: ptm-glycosylation
- itemName.zh: 其他主要/次要N-糖型
- itemName.en: Other major/minor N-glycoforms
- guidelineTerm.zh: N-糖链类型及比例/……
- isSupplementary: False
- judgingPrinciple.zh: 主要糖型种类和整体分布应与参照药相似；高风险糖型需更严格评估，并关联Fc功能、PK或免疫风险。
- numericLimit.zh: 无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。
- methodId `other-n-glycans-primary-1` type=primary name.zh=释放N-糖链HILIC-FLD
- methodId `other-n-glycans-primary-2` type=primary name.zh=糖型质谱确认
- methodId `other-n-glycans-orthogonal-1` type=orthogonal name.zh=HILIC-MS
- methodId `other-n-glycans-orthogonal-2` type=orthogonal name.zh=糖肽LC-MS/MS

## itemId `sialic-acid-ngna`
- categoryKey: ptm-glycosylation
- itemName.zh: N-羟乙酰神经氨酸（NGNA）
- itemName.en: N-glycolylneuraminic acid (NGNA)
- guidelineTerm.zh: 唾液酸修饰/NGNA
- isSupplementary: False
- judgingPrinciple.zh: 若检出NGNA，其含量应与参照药高度一致，并需关联其潜在的Fc功能、PK或免疫风险。
- numericLimit.zh: 无通用统一数值；采用头对头图谱比对 + 质量范围法（QR）进行差异评估
- methodId `sialic-acid-ngna-primary-1` type=primary name.zh=释放N-糖链后衍生化HILIC-FLD/LC-MS
- methodId `sialic-acid-ngna-orthogonal-1` type=orthogonal name.zh=HILIC-MS
- methodId `sialic-acid-ngna-orthogonal-2` type=orthogonal name.zh=糖肽LC-MS/MS等

## itemId `sialic-acid-nana`
- categoryKey: ptm-glycosylation
- itemName.zh: N-乙酰神经氨酸（NANA）
- itemName.en: N-acetylneuraminic acid (NANA)
- guidelineTerm.zh: 唾液酸修饰/NANA
- isSupplementary: False
- judgingPrinciple.zh: 主要糖型种类和整体分布应与参照药相似；高风险糖型需更严格评估，并关联Fc功能、PK或免疫风险。
- numericLimit.zh: 无通用统一数值；采用头对头图谱比对 + 质量范围法（QR）进行差异评估
- methodId `sialic-acid-nana-primary-1` type=primary name.zh=释放N-糖链后衍生化HILIC-FLD/LC-MS
- methodId `sialic-acid-nana-orthogonal-1` type=orthogonal name.zh=HILIC-MS
- methodId `sialic-acid-nana-orthogonal-2` type=orthogonal name.zh=糖肽LC-MS/MS等

## itemId `molar-extinction-coefficient`
- categoryKey: physicochemical
- itemName.zh: 摩尔消光系数
- itemName.en: Molar extinction coefficient
- guidelineTerm.zh: 摩尔消光系数
- isSupplementary: False
- judgingPrinciple.zh: 实测值与理论值及参照药结果一致或差异可解释。
- numericLimit.zh: 无通用于所有品种的统一数值限度；不应把仪器吸光度允许误差当作相似性限度。
- methodId `molar-extinction-coefficient-primary-1` type=primary name.zh=UV分光光度法结合蛋白浓度基准方法
- methodId `molar-extinction-coefficient-orthogonal-1` type=orthogonal name.zh=氨基酸分析
- methodId `molar-extinction-coefficient-orthogonal-2` type=orthogonal name.zh=理论序列计算

## itemId `isoelectric-point`
- categoryKey: physicochemical
- itemName.zh: 等电点（pI）
- itemName.en: Isoelectric point (pI)
- guidelineTerm.zh: 等电点
- isSupplementary: False
- judgingPrinciple.zh: pI和整体电荷特征应与参照药相似；若为定量结果可结合实际范围。
- numericLimit.zh: 无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。
- methodId `isoelectric-point-primary-1` type=primary name.zh=icIEF/CIEF
- methodId `isoelectric-point-primary-2` type=primary name.zh=IEF
- methodId `isoelectric-point-orthogonal-1` type=orthogonal name.zh=离子交换色谱

## itemId `sec-hmw-aggregates`
- categoryKey: purity-size-variants
- itemName.zh: 高分子量物质/聚集体（HMW）
- itemName.en: High-molecular-weight species / aggregates (HMW)
- guidelineTerm.zh: 分子排阻色谱法/聚体
- isSupplementary: False
- judgingPrinciple.zh: 候选药不应显示不利增加的聚集体风险；总体分布应受参照药范围支持。
- numericLimit.zh: 无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。
- methodId `sec-hmw-aggregates-primary-1` type=primary name.zh=SEC-UV
- methodId `sec-hmw-aggregates-orthogonal-1` type=orthogonal name.zh=SEC-MALS/AUC/CE-SDS

## itemId `sec-main-peak-monomer`
- categoryKey: purity-size-variants
- itemName.zh: SEC主峰/单体
- itemName.en: SEC main peak / monomer
- guidelineTerm.zh: 分子排阻色谱法/主峰
- isSupplementary: False
- judgingPrinciple.zh: 单体/主峰分布与参照药总体相似。
- numericLimit.zh: 无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。
- methodId `sec-main-peak-monomer-primary-1` type=primary name.zh=SEC-UV
- methodId `sec-main-peak-monomer-orthogonal-1` type=orthogonal name.zh=SEC-MALS/AUC/CE-SDS

## itemId `sec-lmw-fragments`
- categoryKey: purity-size-variants
- itemName.zh: 低分子量物质/片段（LMW）
- itemName.en: Low-molecular-weight species / fragments (LMW)
- guidelineTerm.zh: 分子排阻色谱法/片段
- isSupplementary: False
- judgingPrinciple.zh: 候选药LMW水平及整体图谱应与参照药相似；若出现参照药图谱中不存在的异常峰，应通过质谱等方法鉴定其结构并评估风险。
- numericLimit.zh: 无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。
- methodId `sec-lmw-fragments-primary-1` type=primary name.zh=SEC-UV
- methodId `sec-lmw-fragments-orthogonal-1` type=orthogonal name.zh=SEC-MALS/AUC/CE-SDS

## itemId `reduced-ce-sds-hc-lc-purity`
- categoryKey: purity-size-variants
- itemName.zh: 还原CE-SDS重链+轻链纯度
- itemName.en: Reduced CE-SDS heavy + light chain purity
- guidelineTerm.zh: CE-SDS还原电泳法/轻链+重链
- isSupplementary: False
- judgingPrinciple.zh: 候选药与参照药还原纯度及片段分布相似；新增峰需鉴定来源并评估风险。
- numericLimit.zh: 无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。
- methodId `reduced-ce-sds-hc-lc-purity-primary-1` type=primary name.zh=还原CE-SDS
- methodId `reduced-ce-sds-hc-lc-purity-orthogonal-1` type=orthogonal name.zh=非还原CE-SDS
- methodId `reduced-ce-sds-hc-lc-purity-orthogonal-2` type=orthogonal name.zh=SEC
- methodId `reduced-ce-sds-hc-lc-purity-orthogonal-3` type=orthogonal name.zh=完整分子量LC-MS

## itemId `reduced-ce-sds-fragments`
- categoryKey: purity-size-variants
- itemName.zh: 还原CE-SDS片段/杂质
- itemName.en: Reduced CE-SDS fragments/impurities
- guidelineTerm.zh: CE-SDS还原电泳法/片段
- isSupplementary: False
- judgingPrinciple.zh: 候选药片段/杂质水平及整体图谱应与参照药相似；若出现参照药图谱中不存在的特有峰，需通过MS或加标实验鉴定其结构并评估风险。
- numericLimit.zh: 无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。
- methodId `reduced-ce-sds-fragments-primary-1` type=primary name.zh=还原CE-SDS
- methodId `reduced-ce-sds-fragments-orthogonal-1` type=orthogonal name.zh=SDS-PAGE
- methodId `reduced-ce-sds-fragments-orthogonal-2` type=orthogonal name.zh=非还原CE-SDS
- methodId `reduced-ce-sds-fragments-orthogonal-3` type=orthogonal name.zh=SEC

## itemId `non-reduced-ce-sds-main-peak`
- categoryKey: purity-size-variants
- itemName.zh: 非还原CE-SDS主峰
- itemName.en: Non-reduced CE-SDS main peak
- guidelineTerm.zh: CE-SDS非还原电泳法/主峰
- isSupplementary: False
- judgingPrinciple.zh: 候选药非还原CE-SDS主峰纯度及整体图谱应与参照药相似；若出现参照药图谱中不存在的、面积超过定量限（LOQ）的新增峰，应优先排除方法伪差，再通过LC-MS/MS或加标实验鉴定其结构，并评估其对ADCC、FcRn结合或免疫原性的潜在影响
- numericLimit.zh: 无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。
- methodId `non-reduced-ce-sds-main-peak-primary-1` type=primary name.zh=非还原CE-SDS
- methodId `non-reduced-ce-sds-main-peak-orthogonal-1` type=orthogonal name.zh=SEC
- methodId `non-reduced-ce-sds-main-peak-orthogonal-2` type=orthogonal name.zh=还原CE-SDS
- methodId `non-reduced-ce-sds-main-peak-orthogonal-3` type=orthogonal name.zh=SDS-PAGE

## itemId `non-reduced-ce-sds-fragments`
- categoryKey: purity-size-variants
- itemName.zh: 非还原CE-SDS片段/杂质
- itemName.en: Non-reduced CE-SDS fragments/impurities
- guidelineTerm.zh: CE-SDS非还原电泳法/片段
- isSupplementary: False
- judgingPrinciple.zh: 候选药非还原CE-SDS片段/杂质水平及整体图谱应与参照药相似；若出现参照药图谱中不存在的、面积超过定量限（LOQ）的新增峰，应优先排除方法伪差，再通过LC-MS/MS或加标实验鉴定其结构，并评估其对ADCC、FcRn结合或免疫原性的潜在影响
- numericLimit.zh: 无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。
- methodId `non-reduced-ce-sds-fragments-primary-1` type=primary name.zh=非还原CE-SDS
- methodId `non-reduced-ce-sds-fragments-orthogonal-1` type=orthogonal name.zh=SEC
- methodId `non-reduced-ce-sds-fragments-orthogonal-2` type=orthogonal name.zh=还原CE-SDS
- methodId `non-reduced-ce-sds-fragments-orthogonal-3` type=orthogonal name.zh=SDS-PAGE

## itemId `acidic-charge-variants`
- categoryKey: charge-variants
- itemName.zh: 酸性变异体比例
- itemName.en: Acidic variant proportion
- guidelineTerm.zh: 电荷变异体/酸区
- isSupplementary: False
- judgingPrinciple.zh: 酸性区分布应与参照药总体相似；若酸性区分布出现显著性偏差，应对酸性区内的关键亚峰进行结构归属
- numericLimit.zh: 无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。
- methodId `acidic-charge-variants-primary-1` type=primary name.zh=CEX-HPLC或icIEF
- methodId `acidic-charge-variants-orthogonal-1` type=orthogonal name.zh=icIEF与CEX正交
- methodId `acidic-charge-variants-orthogonal-2` type=orthogonal name.zh=峰分离后LC-MS鉴定

## itemId `main-charge-peak`
- categoryKey: charge-variants
- itemName.zh: 主电荷峰比例
- itemName.en: Main charge peak proportion
- guidelineTerm.zh: 电荷变异体/主峰
- isSupplementary: False
- judgingPrinciple.zh: 主峰和整体电荷分布（酸区+主峰+碱区）应与参照药相似。
- numericLimit.zh: 无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。
- methodId `main-charge-peak-primary-1` type=primary name.zh=CEX-HPLC或icIEF
- methodId `main-charge-peak-orthogonal-1` type=orthogonal name.zh=icIEF与CEX正交
- methodId `main-charge-peak-orthogonal-2` type=orthogonal name.zh=峰分离后LC-MS鉴定

## itemId `basic-charge-variants`
- categoryKey: charge-variants
- itemName.zh: 碱性变异体比例
- itemName.en: Basic variant proportion
- guidelineTerm.zh: 电荷变异体/碱区
- isSupplementary: False
- judgingPrinciple.zh: 候选药碱性区峰面积百分比及整体图谱应与参照药相似；若碱性区分布出现显著性偏差（超出QR范围），应对碱性区内的关键亚峰进行结构归属（如通过肽图LC-MS/MS确认C端赖氨酸残留或N端焦谷氨酸化程度）
- numericLimit.zh: 无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。
- methodId `basic-charge-variants-primary-1` type=primary name.zh=CEX-HPLC或icIEF
- methodId `basic-charge-variants-orthogonal-1` type=orthogonal name.zh=icIEF与CEX正交
- methodId `basic-charge-variants-orthogonal-2` type=orthogonal name.zh=峰分离后LC-MS鉴定

## itemId `target-binding-activity`
- categoryKey: binding-bioactivity
- itemName.zh: 靶标/抗原结合活性
- itemName.en: Target/antigen binding activity
- guidelineTerm.zh: 结合活性
- isSupplementary: False
- judgingPrinciple.zh: 结合动力学和/或相对结合活性满足预设标准，且曲线和机制解释一致。
- numericLimit.zh: 无通用统一数值限度；等效性界值需在实验前预设（如80%-125%），并在相同实验条件下进行头对头验证；剂量-响应曲线形状及机制解释应与参照药一致。
- methodId `target-binding-activity-primary-1` type=primary name.zh=SPR（表面等离子体共振）/BLI（生物膜层干涉技术）
- methodId `target-binding-activity-orthogonal-1` type=orthogonal name.zh=ELISA（用于相对结合活性定量）或基于细胞的结合测定（如流式细胞术）

## itemId `moa-related-bioactivity`
- categoryKey: binding-bioactivity
- itemName.zh: 机制相关生物学活性/相对效价
- itemName.en: MoA-related biological activity / relative potency
- guidelineTerm.zh: 生物学活性
- isSupplementary: False
- judgingPrinciple.zh: 候选药与参照药的相对效价应通过预设等效性检验（；若存在多重作用机制（MoA），应对每种相关机制分别进行活性评价，且所有结果均需落在等效性界值内；剂量-响应曲线应呈现平行性，以验证作用机制的一致性。
- numericLimit.zh: 无通用统一数值限度；对与MoA直接相关的生物学活性，应采用预设等效性界值（如80%-125%）进行评价；界值选择需基于产品作用机制及临床相关性论证。
- methodId `moa-related-bioactivity-primary-1` type=primary name.zh=机制相关细胞效价试验/酶学功能试验
- methodId `moa-related-bioactivity-orthogonal-1` type=orthogonal name.zh=不同原理的细胞效应检测方法（如报告基因、 细胞增殖抑制、流式细胞术检测）
- methodId `moa-related-bioactivity-orthogonal-2` type=orthogonal name.zh=或酶学活性检测（若首选为细胞法，则酶学法可作为正交）

## itemId `fcgri-cd64-binding`
- categoryKey: binding-bioactivity
- itemName.zh: FcγRI（CD64）结合活力
- itemName.en: FcγRI (CD64) binding activity
- guidelineTerm.zh: 与FcγRI结合力
- isSupplementary: False
- judgingPrinciple.zh: 候选药与参照药的结合亲和力（KD、ka、kd）及/或相对结合活性上应呈现相似性；采用QR法或90%置信区间法进行统计学评价，若相对结合活性（或KD比值）的90%置信区间完全落在预设等效性界值内，且动力学谱图与参照药一致，则判定为结合力相似
- numericLimit.zh: 无通用统一KD绝对值限度；相对结合活性%应采用预设等效性界值（如80%-125%），在相同实验条件下进行头对头验证；界值需基于方法变异和参照药批间变异进行论证。
- methodId `fcgri-cd64-binding-primary-1` type=primary name.zh=SPR（表面等离子体共振）
- methodId `fcgri-cd64-binding-orthogonal-1` type=orthogonal name.zh=ELISA
- methodId `fcgri-cd64-binding-orthogonal-2` type=orthogonal name.zh=BLI
- methodId `fcgri-cd64-binding-orthogonal-3` type=orthogonal name.zh=细胞/功能试验（如ADCP）可作为生物学活性补充。

## itemId `fcgriia-cd32a-binding`
- categoryKey: binding-bioactivity
- itemName.zh: FcγRIIa（CD32a）结合活力
- itemName.en: FcγRIIa (CD32a) binding activity
- guidelineTerm.zh: 与FcγRIIa结合力
- isSupplementary: False
- judgingPrinciple.zh: 候选药与参照药的结合亲和力（KD、ka、kd）及/或相对结合活性上应呈现相似性；采用QR法或90%置信区间法进行统计学评价，若相对结合活性（或KD比值）的90%置信区间完全落在预设等效性界值内，且动力学谱图与参照药一致，则判定为结合力相似
- numericLimit.zh: 无通用统一KD绝对值限度；相对结合活性%应采用预设等效性界值（如80%-125%），在相同实验条件下进行头对头验证；界值需基于方法变异和参照药批间变异进行论证。
- methodId `fcgriia-cd32a-binding-primary-1` type=primary name.zh=SPR（表面等离子体共振）
- methodId `fcgriia-cd32a-binding-orthogonal-1` type=orthogonal name.zh=ELISA
- methodId `fcgriia-cd32a-binding-orthogonal-2` type=orthogonal name.zh=BLI
- methodId `fcgriia-cd32a-binding-orthogonal-3` type=orthogonal name.zh=细胞/功能试验（如血小板活化测定）可作为生物学活性补充。

## itemId `fcgriib-cd32b-binding`
- categoryKey: binding-bioactivity
- itemName.zh: FcγRIIb（CD32b）结合活力
- itemName.en: FcγRIIb (CD32b) binding activity
- guidelineTerm.zh: 与FcγRIIb结合力（KD，M）
- isSupplementary: False
- judgingPrinciple.zh: 候选药与参照药的结合亲和力（KD、ka、kd）及/或相对结合活性上应呈现相似性；采用QR法或90%置信区间法进行统计学评价，若相对结合活性（或KD比值）的90%置信区间完全落在预设等效性界值内，且动力学谱图与参照药一致，则判定为结合力相似
- numericLimit.zh: 无通用统一KD绝对值限度；相对结合活性%应采用预设等效性界值（如80%-125%），在相同实验条件下进行头对头验证；界值需基于方法变异和参照药批间变异进行论证。
- methodId `fcgriib-cd32b-binding-primary-1` type=primary name.zh=SPR（表面等离子体共振）
- methodId `fcgriib-cd32b-binding-orthogonal-1` type=orthogonal name.zh=ELISA
- methodId `fcgriib-cd32b-binding-orthogonal-2` type=orthogonal name.zh=BLI
- methodId `fcgriib-cd32b-binding-orthogonal-3` type=orthogonal name.zh=细胞水平结合实验可作为补充。

## itemId `fcgriiia-cd16a-binding`
- categoryKey: binding-bioactivity
- itemName.zh: FcγRIIIa（CD16a）结合活力
- itemName.en: FcγRIIIa (CD16a) binding activity
- guidelineTerm.zh: 与FcγRIIIa结合力（KD，M）
- isSupplementary: False
- judgingPrinciple.zh: 候选药与参照药的结合亲和力（KD、ka、kd）及/或相对结合活性上应呈现相似性；采用QR法或90%置信区间法进行统计学评价，若相对结合活性（或KD比值）的90%置信区间完全落在预设等效性界值内，且动力学谱图与参照药一致，则判定为结合力相似。应分别评价158V和158F变体；并结合无岩藻糖糖型及ADCC功能数据综合解释。
- numericLimit.zh: 无通用统一KD绝对值限度；相对结合活性%应采用预设等效性界值，在相同实验条件下进行头对头验证；若使用不同FcγRIIIa多态性变体，应分别设定等效性界值并独立评价
- methodId `fcgriiia-cd16a-binding-primary-1` type=primary name.zh=SPR（表面等离子体共振）
- methodId `fcgriiia-cd16a-binding-orthogonal-1` type=orthogonal name.zh=ELISA
- methodId `fcgriiia-cd16a-binding-orthogonal-2` type=orthogonal name.zh=BLI
- methodId `fcgriiia-cd16a-binding-orthogonal-3` type=orthogonal name.zh=细胞水平结合实验可作为补充。

## itemId `fcrn-binding`
- categoryKey: binding-bioactivity
- itemName.zh: FcRn（新生儿Fc受体）结合活力
- itemName.en: FcRn (neonatal Fc receptor) binding activity
- guidelineTerm.zh: 与FcRn的结合力（KD，M）
- isSupplementary: False
- judgingPrinciple.zh: 候选药与参照药的结合亲和力（KD、ka、kd）及/或相对结合活性上应呈现相似性；采用QR法或90%置信区间法进行统计学评价，若相对结合活性（或KD比值）的90%置信区间完全落在预设等效性界值内，且动力学谱图与参照药一致，则判定为结合力相似
- numericLimit.zh: 无通用统一KD绝对值限度；相对结合活性%应采用预设等效性界值，在相同实验条件下进行头对头验证；pH 6.0和pH 7.4两个条件需分别设定等效性界值并独立评价。
- methodId `fcrn-binding-primary-1` type=primary name.zh=SPR（表面等离子体共振）
- methodId `fcrn-binding-orthogonal-1` type=orthogonal name.zh=BLI
- methodId `fcrn-binding-orthogonal-2` type=orthogonal name.zh=FcRn亲和层析
- methodId `fcrn-binding-orthogonal-3` type=orthogonal name.zh=TR-FRET（时间分辨荧光能量转移）
- methodId `fcrn-binding-orthogonal-4` type=orthogonal name.zh=细胞水平的FcRn再循环报告基因测定可作为功能正交补充。

## itemId `c1q-binding`
- categoryKey: binding-bioactivity
- itemName.zh: C1q结合活力
- itemName.en: C1q binding activity
- guidelineTerm.zh: 与C1q的结合力
- isSupplementary: False
- judgingPrinciple.zh: 候选药与参照药的结合亲和力（KD、ka、kd）及/或相对结合活性上应呈现相似性；采用QR法或90%置信区间法进行统计学评价，若相对结合活性（或KD比值）的90%置信区间完全落在预设等效性界值内，且结合谱图与参照药一致，则判定为结合力相似
- numericLimit.zh: 无通用统一KD绝对值限度；相对结合活性%应采用预设等效性界值，在相同实验条件下进行头对头验证
- methodId `c1q-binding-primary-1` type=primary name.zh=SPR（表面等离子体共振）
- methodId `c1q-binding-orthogonal-1` type=orthogonal name.zh=ELISA
- methodId `c1q-binding-orthogonal-2` type=orthogonal name.zh=C1q沉积试验
- methodId `c1q-binding-orthogonal-3` type=orthogonal name.zh=补体活性测定（如CDC报告基因试验）可作为功能正交补充

## itemId `adcc`
- categoryKey: binding-bioactivity
- itemName.zh: 抗体依赖的细胞介导细胞毒作用
- itemName.en: Antibody-dependent cell-mediated cytotoxicity
- guidelineTerm.zh: ADCC
- isSupplementary: False
- judgingPrinciple.zh: 候选药的ADCC相对效价应与参照药相似，其90%置信区间应完全落在预设的等效性界值内
- numericLimit.zh: 无通用统一数值；需根据方法学验证和参照药历史批次数据，预设合理的等效性界值并予以论证
- methodId `adcc-primary-1` type=primary name.zh=基于报告基因的ADCC活性检测方法或基于靶细胞和效应细胞（如NK细胞或PBMC）的经典ADCC功能试验
- methodId `adcc-orthogonal-1` type=orthogonal name.zh=FcγRIIIa结合试验和无岩藻糖糖型分析

## itemId `cdc`
- categoryKey: binding-bioactivity
- itemName.zh: 补体依赖性细胞毒性
- itemName.en: Complement-dependent cytotoxicity
- guidelineTerm.zh: CDC
- isSupplementary: False
- judgingPrinciple.zh: 候选药的CDC相对效价应与参照药相似，其90%置信区间应完全落在预设的等效性界值
- numericLimit.zh: 无通用统一数值；需根据方法学验证和参照药历史批次数据，预设合理的等效性界值并予以论证
- methodId `cdc-primary-1` type=primary name.zh=基于靶细胞的CDC活性检测法
- methodId `cdc-orthogonal-1` type=orthogonal name.zh=C1q结合力
- methodId `cdc-orthogonal-2` type=orthogonal name.zh=不同补体来源的交叉验证
- methodId `cdc-orthogonal-3` type=orthogonal name.zh=不同靶细胞系的验证

## itemId `other-moa-related-functions`
- categoryKey: binding-bioactivity
- itemName.zh: 其他机制相关功能
- itemName.en: Other MoA-related functions
- guidelineTerm.zh: -
- isSupplementary: False
- judgingPrinciple.zh: 所有关键功能均应得到相似性支持；不能只选择最容易通过的单一功能。
- numericLimit.zh: 无通用于所有品种的统一数值限度；评价项目和标准必须结合MoA及临床相关性预先确定

## itemId `other-product-related-impurities`
- categoryKey: process-product-impurities
- itemName.zh: 其他产品相关物质/杂质
- itemName.en: Other product-related substances/impurities
- guidelineTerm.zh: -
- isSupplementary: False
- judgingPrinciple.zh: 已知杂质总体可比；与风险正相关的杂质不应不利升高；新杂质必须鉴定和风险论证。
- numericLimit.zh: 无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。 如出现参照药未见的新峰/新成分，应先排除方法伪差，再鉴定、定量并评价对活性、安全性和免疫原性的影响。
- methodId `other-product-related-impurities-primary-1` type=primary name.zh=依据性质采用SEC、CE-SDS、IEX、HIC、肽图LC-MS等
- methodId `other-product-related-impurities-orthogonal-1` type=orthogonal name.zh=对新增峰进行结构鉴定（如LC-MS/MS、肽图）
- methodId `other-product-related-impurities-orthogonal-2` type=orthogonal name.zh=必要时进行杂质分离

## itemId `protein-a-residual`
- categoryKey: process-product-impurities
- itemName.zh: Protein A残留量
- itemName.en: Residual Protein A
- guidelineTerm.zh: 蛋白A残留
- isSupplementary: False
- judgingPrinciple.zh: 候选药每批的Protein A残留量必须低于经安全性、工艺能力、临床暴露和方法性能支持的产品特异放行限度，以确保纯化工艺的稳健性；若批次间出现显著波动，需启动偏差调查，评估层析柱寿命或清洗条件的潜在影响
- numericLimit.zh: 具体限度需依据方法学验证（检测限LOD、定量限LOQ）及临床批/毒理批数据设定，并确保对人体安全无风险
- methodId `protein-a-residual-primary-1` type=primary name.zh=ELISA（酶联免疫吸附测定法）
- methodId `protein-a-residual-orthogonal-1` type=orthogonal name.zh=LC-MS/MS（对疑似高残留样品或方法学验证时，作为结构确证）

## itemId `residual-dna`
- categoryKey: process-product-impurities
- itemName.zh: 外源性DNA残留量
- itemName.en: Residual exogenous DNA content
- guidelineTerm.zh: 外源性DNA残留
- isSupplementary: False
- judgingPrinciple.zh: 每批产品的残留DNA含量必须低于法定限度；若出现显著波动，需启动偏差调查。
- numericLimit.zh: 参照《中国药典》2020年版三部通则（3407）及相关国际指导原则（ICH Q5A、FDA guidance）
- methodId `residual-dna-primary-1` type=primary name.zh=定量PCR（qPCR）法
- methodId `residual-dna-orthogonal-1` type=orthogonal name.zh=DNA探针杂交法、荧光染色法

## itemId `residual-hcp`
- categoryKey: process-product-impurities
- itemName.zh: 宿主细胞蛋白（HCP）残留量
- itemName.en: Residual host cell protein (HCP)
- guidelineTerm.zh: 宿主蛋白残留
- isSupplementary: False
- judgingPrinciple.zh: 每批产品的HCP残留量必须低于放行限度；若出现显著波动或接近警戒限，需启动偏差调查
- numericLimit.zh: 参照《中国药典》2020年版通则（如3412）、ICH Q6B及USP<1132>等指导原则。
- methodId `residual-hcp-primary-1` type=primary name.zh=ELISA（酶联免疫吸附测定法）
- methodId `residual-hcp-orthogonal-1` type=orthogonal name.zh=LC-MS/MS（液相色谱-串联质谱法）

## itemId `other-process-related-impurities`
- categoryKey: process-product-impurities
- itemName.zh: 其他工艺相关杂质
- itemName.en: Other process-related impurities
- guidelineTerm.zh: -
- isSupplementary: False
- judgingPrinciple.zh: 工艺相关杂质通常因生产工艺不同而不要求与参照药定性相同；核心是采用适用方法充分控制，并证明不会增加安全性/免疫原性风险
- numericLimit.zh: 具体质量标准依产品、工艺、药典/法规和安全性论证
- methodId `other-process-related-impurities-primary-1` type=primary name.zh=产品/工艺特异方法
- methodId `other-process-related-impurities-orthogonal-1` type=orthogonal name.zh=采用不同原理方法或工艺清除/风险评估支持

## itemId `methionine-tryptophan-oxidation`
- categoryKey: ptm-glycosylation
- itemName.zh: 甲硫氨酸/色氨酸等氧化
- itemName.en: Oxidation of methionine/tryptophan residues
- guidelineTerm.zh: 氧化（P3，结构总结示例）
- isSupplementary: True
- judgingPrinciple.zh: 候选药与参照药在氧化位点分布上应总体相似；对于非关键位点的氧化水平差异，若其不影响抗原结合亲和力（SPR/BLI）及Fc效应功能（ADCC/CDC/FcRn结合），可视为可接受
- numericLimit.zh: 无统一的生物类似药“相似性”数值；具体质量标准依产品、工艺、药典/法规和安全性论证。
- methodId `methionine-tryptophan-oxidation-primary-1` type=primary name.zh=肽图LC-MS/MS
- methodId `methionine-tryptophan-oxidation-orthogonal-1` type=orthogonal name.zh=非还原/还原CE-SDS
- methodId `methionine-tryptophan-oxidation-orthogonal-2` type=orthogonal name.zh=完整分子量LC-MS
- methodId `methionine-tryptophan-oxidation-orthogonal-3` type=orthogonal name.zh=氧化强制降解试验结合功能活性测定

## itemId `asn-deamidation`
- categoryKey: ptm-glycosylation
- itemName.zh: Asn脱酰胺及异构化
- itemName.en: Asn deamidation and isomerization
- guidelineTerm.zh: 脱酰胺（P3，结构总结示例）
- isSupplementary: True
- judgingPrinciple.zh: 与参照药在脱酰胺位点分布及关键热点丰度上应总体相似；脱酰胺引起的电荷变异体变化（酸性峰增加）应与参照药的电荷分布趋势一致
- numericLimit.zh: 无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。
- methodId `asn-deamidation-primary-1` type=primary name.zh=肽图LC-MS/MS（还原肽图）
- methodId `asn-deamidation-orthogonal-1` type=orthogonal name.zh=icIEF/CEX-HPLC
- methodId `asn-deamidation-orthogonal-2` type=orthogonal name.zh=完整分子量LC-MS

## itemId `n-terminal-pyroglutamate`
- categoryKey: ptm-glycosylation
- itemName.zh: N端焦谷氨酸形成
- itemName.en: N-terminal pyroglutamate formation
- guidelineTerm.zh: N末端焦谷氨酸化（P3，结构总结示例）
- isSupplementary: True
- judgingPrinciple.zh: 候选药与参照药在N端焦谷氨酸化位点及丰度上应总体相似；若差异较大，需结合抗原结合活性（SPR/BLI）数据确认其是否影响结合功能；若该修饰发生在CDR区，需更严格比对并评估功能影响。
- numericLimit.zh: 无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。
- methodId `n-terminal-pyroglutamate-primary-1` type=primary name.zh=肽图LC-MS/MS（还原肽图）
- methodId `n-terminal-pyroglutamate-orthogonal-1` type=orthogonal name.zh=完整/亚基LC-MS

## itemId `c-terminal-lysine-processing`
- categoryKey: ptm-glycosylation
- itemName.zh: 重链C端Lys加工
- itemName.en: Heavy chain C-terminal Lys processing
- guidelineTerm.zh: C端赖氨酸缺失/保留（P3，结构总结示例）
- isSupplementary: True
- judgingPrinciple.zh: 候选药与参照药在C端K缺失/保留的分布（0K/1K/2K比例）上应总体相似
- numericLimit.zh: 无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。
- methodId `c-terminal-lysine-processing-primary-1` type=primary name.zh=完整/还原亚基分子量LC-MS
- methodId `c-terminal-lysine-processing-primary-2` type=primary name.zh=电荷变异体分析（CEX-HPLC或icIEF）
- methodId `c-terminal-lysine-processing-orthogonal-1` type=orthogonal name.zh=肽图LC-MS/MS（还原肽图）

## itemId `ft-ir-secondary-structure`
- categoryKey: higher-order-structure
- itemName.zh: FT-IR二级结构正交分析
- itemName.en: FT-IR orthogonal secondary-structure analysis
- guidelineTerm.zh: FT-IR
- isSupplementary: True
- judgingPrinciple.zh: 候选药与参照药的FT-IR酰胺I带光谱应高度重叠；二阶导数谱的峰形及峰位应总体一致
- numericLimit.zh: 无通用统一数值限度；高级结构图谱相似性通常采用定性/半定量图谱比对，辅以相关系数法（如软件计算光谱重叠度）作为辅助参考
- methodId `ft-ir-secondary-structure-primary-1` type=primary name.zh=FT-IR光谱
- methodId `ft-ir-secondary-structure-orthogonal-1` type=orthogonal name.zh=远紫外CD

## itemId `hdx-ms-nmr-high-resolution`
- categoryKey: higher-order-structure
- itemName.zh: 位点特异高级结构
- itemName.en: Site-specific higher-order structure
- guidelineTerm.zh: HDX-MS/NMR等高分辨方法
- isSupplementary: True
- judgingPrinciple.zh: 若HDX-MS或NMR图谱与参照药高度重合（无显著差异区域），则判定高级结构在溶液构象及动态上高度一致；若出现显著性差异，需将该区域定位至三维结构（如Fab或Fc区），并结合抗原结合活性及Fc效应功能数据，评估其对产品作用机制（MoA）的潜在影响
- numericLimit.zh: 无通用统一数值限度；差异阈值需基于方法学验证（如HDX-MS的重复性）及参照药批间变异性进行预设
- methodId `hdx-ms-nmr-high-resolution-primary-1` type=primary name.zh=HDX-MS（氢氘交换质谱）
- methodId `hdx-ms-nmr-high-resolution-primary-2` type=primary name.zh=甲基NMR（甲基核磁共振）
- methodId `hdx-ms-nmr-high-resolution-orthogonal-1` type=orthogonal name.zh=抗原结合活性（SPR/BLI）、功能活性（ADCC/CDC等）用于将检测到的构象差异（若有）与功能变化进行关联分析

## itemId `galactosylation-g1f-g2f`
- categoryKey: ptm-glycosylation
- itemName.zh: 常见IgG N-糖型（半乳糖基化糖型比例）
- itemName.en: Common IgG N-glycoforms (galactosylated glycoform proportions)
- guidelineTerm.zh: G1F等半乳糖化糖型（P3，结构总结示例）
- isSupplementary: True
- judgingPrinciple.zh: 候选药与参照药在半乳糖化糖型（G1F、G2F）的分布及（G1F+G2F）总比例上应总体相似；若差异超出QR范围，需评估其对CDC活性及热稳定性（Tm，尤其CH2结构域）的潜在影响，并结合功能数据（CDC效价）进行风险论证
- numericLimit.zh: 无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。
- methodId `galactosylation-g1f-g2f-primary-1` type=primary name.zh=释放N-糖链HILIC-FLD/LC-MS
- methodId `galactosylation-g1f-g2f-orthogonal-1` type=orthogonal name.zh=完整/亚基分子量LC-MS
- methodId `galactosylation-g1f-g2f-orthogonal-2` type=orthogonal name.zh=糖肽LC-MS/MS

## itemId `high-mannose-glycans`
- categoryKey: ptm-glycosylation
- itemName.zh: Man5/Man6等高甘露糖糖型比例
- itemName.en: Proportions of high-mannose glycoforms (Man5/Man6, etc.)
- guidelineTerm.zh: 高甘露糖糖型
- isSupplementary: True
- judgingPrinciple.zh: 候选药与参照药在高甘露糖型（Man5/Man6等）的分布及总量上应总体相似
- numericLimit.zh: 无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。
- methodId `high-mannose-glycans-primary-1` type=primary name.zh=释放N-糖链HILIC-FLD/LC-MS
- methodId `high-mannose-glycans-orthogonal-1` type=orthogonal name.zh=完整/亚基分子量LC-MS

## itemId `core-fucosylation`
- categoryKey: ptm-glycosylation
- itemName.zh: 核心岩藻糖水平
- itemName.en: Core fucosylation level
- guidelineTerm.zh: 岩藻糖化/无岩藻糖糖型
- isSupplementary: True
- judgingPrinciple.zh: 候选药与参照药在核心岩藻糖基化总体水平（即有岩藻糖/无岩藻糖糖型的相对比例）上应总体相似
- numericLimit.zh: 无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。
- methodId `core-fucosylation-primary-1` type=primary name.zh=释放N-糖链HILIC-FLD/LC-MS
- methodId `core-fucosylation-orthogonal-1` type=orthogonal name.zh=完整/亚基分子量LC-MS
- methodId `core-fucosylation-orthogonal-2` type=orthogonal name.zh=FcγRIIIa结合力（SPR）
- methodId `core-fucosylation-orthogonal-3` type=orthogonal name.zh=ADCC报告基因活性测定
