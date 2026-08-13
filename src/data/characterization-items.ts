// AUTO-GENERATED FILE — do not edit by hand.
// Source of truth: 生物类似药评价指导原则/V0.1生物类似药药学比对研究质量属性、检测方法及相似性评价原则汇总表(1).xlsx
//   sheet: 2.特性鉴定 (read via openpyxl with data_only=True)
// Regenerate with: python scripts/generate_data.py
// NOTE: all `en` strings are machine-translation placeholders.
// TODO: 校对英文 (review the English translations).
import type { CharacterizationItem } from "@/types/models";

export const characterizationItems: CharacterizationItem[] = [
  {
    "id": "intact-mass",
    "category": "primary-structure",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "完整分子量",
      "en": "Intact molecular mass"
    },
    "itemName": {
      "zh": "完整分子质量（intact mass）",
      "en": "Intact molecular mass (intact mass)"
    },
    "applicability": {
      "zh": "一般适用（仍需结合具体品种评估）",
      "en": "Generally applicable (product-specific assessment still required)"
    },
    "purpose": {
      "zh": "确认整体分子组成和主要分子形式。",
      "en": "Confirm the overall molecular composition and major molecular forms."
    },
    "detectionIndicators": {
      "zh": "去卷积完整质量（Da）、主要质量峰、峰型",
      "en": "Deconvoluted intact mass (Da), major mass peaks, peak profile"
    },
    "similarityMethod": {
      "zh": "定性/图谱＋理论质量核对",
      "en": "Qualitative/spectral comparison plus verification against the theoretical mass"
    },
    "judgingPrinciple": {
      "zh": "采用候选药与参照药同条件头对头定性/图谱比较；结合理论结构和正交方法解释差异。主要分子形式应对应，差异可由已知糖型或翻译后修饰解释，不应出现无法解释的新分子形式。",
      "en": "Perform head-to-head qualitative/spectral comparison of the candidate and the reference product under identical conditions; interpret differences using the theoretical structure and orthogonal methods. Major molecular forms should correspond; differences should be explainable by known glycoforms or post-translational modifications, and no unexplainable new molecular forms should appear."
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；仪器质量准确度属于方法性能，不是“相差多少Da即可相似”的判定线",
      "en": "No universal numerical limit applies to all products; instrument mass accuracy is a method-performance characteristic, not a \"similar if within X Da\" decision line"
    },
    "remark": {
      "zh": "“分子量”在质谱语境中通常以去卷积后的分子质量（Da）报告。",
      "en": "In the mass spectrometry context, \"molecular weight\" is usually reported as the deconvoluted molecular mass (Da)."
    },
    "methods": [
      {
        "id": "intact-mass-primary-1",
        "name": {
          "zh": "LC-ESI-MS（高分辨QTOF/Orbitrap等）",
          "en": "LC-ESI-MS (high-resolution QTOF/Orbitrap, etc.)"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "LC-ESI-MS（高分辨QTOF/Orbitrap等）",
          "en": "LC-ESI-MS (high-resolution QTOF/Orbitrap, etc.)"
        }
      },
      {
        "id": "intact-mass-orthogonal-1",
        "name": {
          "zh": "肽图LC-MS/MS",
          "en": "Peptide mapping LC-MS/MS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "肽图LC-MS/MS；完整/脱糖/亚基结果相互印证",
          "en": "Peptide mapping LC-MS/MS; Cross-confirmation among intact/deglycosylated/subunit results"
        }
      },
      {
        "id": "intact-mass-orthogonal-2",
        "name": {
          "zh": "完整/脱糖/亚基结果相互印证",
          "en": "Cross-confirmation among intact/deglycosylated/subunit results"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "肽图LC-MS/MS；完整/脱糖/亚基结果相互印证",
          "en": "Peptide mapping LC-MS/MS; Cross-confirmation among intact/deglycosylated/subunit results"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "deglycosylated-intact-mass",
    "category": "primary-structure",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "脱糖分子量",
      "en": "Deglycosylated molecular mass"
    },
    "itemName": {
      "zh": "脱糖完整分子质量",
      "en": "Deglycosylated intact molecular mass"
    },
    "applicability": {
      "zh": "一般适用（仍需结合具体品种评估）",
      "en": "Generally applicable (product-specific assessment still required)"
    },
    "purpose": {
      "zh": "去除N-糖链影响后确认蛋白主链质量。",
      "en": "Confirm the protein backbone mass after removing the influence of N-glycans."
    },
    "detectionIndicators": {
      "zh": "脱糖完整质量（Da）",
      "en": "Deglycosylated intact mass (Da)"
    },
    "similarityMethod": {
      "zh": "定性/图谱＋理论质量核对",
      "en": "Qualitative/spectral comparison plus verification against the theoretical mass"
    },
    "judgingPrinciple": {
      "zh": "采用候选药与参照药同条件头对头定性/图谱比较；结合理论结构和正交方法解释差异。主要分子形式应对应，差异可由已知糖型或翻译后修饰解释，不应出现无法解释的新分子形式。",
      "en": "Perform head-to-head qualitative/spectral comparison of the candidate and the reference product under identical conditions; interpret differences using the theoretical structure and orthogonal methods. Major molecular forms should correspond; differences should be explainable by known glycoforms or post-translational modifications, and no unexplainable new molecular forms should appear."
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；仪器质量准确度属于方法性能，不是“相差多少Da即可相似”的判定线",
      "en": "No universal numerical limit applies to all products; instrument mass accuracy is a method-performance characteristic, not a \"similar if within X Da\" decision line"
    },
    "remark": {
      "zh": "指去除可释放N-糖链后测定完整蛋白质量，用于减少糖型异质性对完整质量的影响。",
      "en": "Refers to measuring the intact protein mass after releasing N-glycans, reducing the impact of glycoform heterogeneity on the intact mass."
    },
    "methods": [
      {
        "id": "deglycosylated-intact-mass-primary-1",
        "name": {
          "zh": "酶法脱糖后LC-ESI-MS",
          "en": "LC-ESI-MS after enzymatic deglycosylation"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "酶法脱糖后LC-ESI-MS",
          "en": "LC-ESI-MS after enzymatic deglycosylation"
        }
      },
      {
        "id": "deglycosylated-intact-mass-orthogonal-1",
        "name": {
          "zh": "肽图LC-MS/MS",
          "en": "Peptide mapping LC-MS/MS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "肽图LC-MS/MS；完整/脱糖/亚基结果相互印证",
          "en": "Peptide mapping LC-MS/MS; Cross-confirmation among intact/deglycosylated/subunit results"
        }
      },
      {
        "id": "deglycosylated-intact-mass-orthogonal-2",
        "name": {
          "zh": "完整/脱糖/亚基结果相互印证",
          "en": "Cross-confirmation among intact/deglycosylated/subunit results"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "肽图LC-MS/MS；完整/脱糖/亚基结果相互印证",
          "en": "Peptide mapping LC-MS/MS; Cross-confirmation among intact/deglycosylated/subunit results"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "light-chain-mass",
    "category": "primary-structure",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "轻链分子量",
      "en": "Light chain molecular mass"
    },
    "itemName": {
      "zh": "轻链分子质量",
      "en": "Light chain molecular mass"
    },
    "applicability": {
      "zh": "主要适用于抗体类产品；非抗体产品需评估适用性",
      "en": "Mainly applicable to antibody products; applicability to non-antibody products needs assessment"
    },
    "purpose": {
      "zh": "确认抗体轻链组成和末端加工。",
      "en": "Confirm antibody light chain composition and terminal processing."
    },
    "detectionIndicators": {
      "zh": "轻链质量（Da）",
      "en": "Light chain mass (Da)"
    },
    "similarityMethod": {
      "zh": "定性/图谱＋理论质量核对",
      "en": "Qualitative/spectral comparison plus verification against the theoretical mass"
    },
    "judgingPrinciple": {
      "zh": "采用候选药与参照药同条件头对头定性/图谱比较；结合理论结构和正交方法解释差异。主要分子形式应对应，差异可由已知糖型或翻译后修饰解释，不应出现无法解释的新分子形式。",
      "en": "Perform head-to-head qualitative/spectral comparison of the candidate and the reference product under identical conditions; interpret differences using the theoretical structure and orthogonal methods. Major molecular forms should correspond; differences should be explainable by known glycoforms or post-translational modifications, and no unexplainable new molecular forms should appear."
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；仪器质量准确度属于方法性能，不是“相差多少Da即可相似”的判定线",
      "en": "No universal numerical limit applies to all products; instrument mass accuracy is a method-performance characteristic, not a \"similar if within X Da\" decision line"
    },
    "remark": {
      "zh": "非抗体或无轻链产品不适用。",
      "en": "Not applicable to non-antibody products or products without a light chain."
    },
    "methods": [
      {
        "id": "light-chain-mass-primary-1",
        "name": {
          "zh": "还原/亚基LC-MS",
          "en": "Reduced/subunit LC-MS"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "还原/亚基LC-MS",
          "en": "Reduced/subunit LC-MS"
        }
      },
      {
        "id": "light-chain-mass-orthogonal-1",
        "name": {
          "zh": "肽图LC-MS/MS",
          "en": "Peptide mapping LC-MS/MS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "肽图LC-MS/MS；完整/脱糖/亚基结果相互印证",
          "en": "Peptide mapping LC-MS/MS; Cross-confirmation among intact/deglycosylated/subunit results"
        }
      },
      {
        "id": "light-chain-mass-orthogonal-2",
        "name": {
          "zh": "完整/脱糖/亚基结果相互印证",
          "en": "Cross-confirmation among intact/deglycosylated/subunit results"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "肽图LC-MS/MS；完整/脱糖/亚基结果相互印证",
          "en": "Peptide mapping LC-MS/MS; Cross-confirmation among intact/deglycosylated/subunit results"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "non-deglycosylated-heavy-chain-mass",
    "category": "primary-structure",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "非脱糖重链分子量",
      "en": "Non-deglycosylated heavy chain molecular mass"
    },
    "itemName": {
      "zh": "未脱糖重链分子质量",
      "en": "Non-deglycosylated heavy chain molecular mass"
    },
    "applicability": {
      "zh": "主要适用于抗体类产品；非抗体产品需评估适用性",
      "en": "Mainly applicable to antibody products; applicability to non-antibody products needs assessment"
    },
    "purpose": {
      "zh": "同时观察重链主链和糖链异质性。",
      "en": "Observe heavy chain backbone and glycan heterogeneity simultaneously."
    },
    "detectionIndicators": {
      "zh": "重链质量分布（Da）",
      "en": "Heavy chain mass distribution (Da)"
    },
    "similarityMethod": {
      "zh": "定性/图谱＋理论质量核对",
      "en": "Qualitative/spectral comparison plus verification against the theoretical mass"
    },
    "judgingPrinciple": {
      "zh": "采用候选药与参照药同条件头对头定性/图谱比较；结合理论结构和正交方法解释差异。主要分子形式应对应，差异可由已知糖型或翻译后修饰解释，不应出现无法解释的新分子形式。",
      "en": "Perform head-to-head qualitative/spectral comparison of the candidate and the reference product under identical conditions; interpret differences using the theoretical structure and orthogonal methods. Major molecular forms should correspond; differences should be explainable by known glycoforms or post-translational modifications, and no unexplainable new molecular forms should appear."
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；仪器质量准确度属于方法性能，不是“相差多少Da即可相似”的判定线",
      "en": "No universal numerical limit applies to all products; instrument mass accuracy is a method-performance characteristic, not a \"similar if within X Da\" decision line"
    },
    "remark": {
      "zh": "保留重链糖链后测定，反映重链主链与糖型共同贡献。",
      "en": "Measured with heavy-chain glycans retained, reflecting the joint contribution of heavy chain backbone and glycoforms."
    },
    "methods": [
      {
        "id": "non-deglycosylated-heavy-chain-mass-primary-1",
        "name": {
          "zh": "还原后重链LC-MS",
          "en": "Heavy-chain LC-MS after reduction"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "还原后重链LC-MS",
          "en": "Heavy-chain LC-MS after reduction"
        }
      },
      {
        "id": "non-deglycosylated-heavy-chain-mass-orthogonal-1",
        "name": {
          "zh": "肽图LC-MS/MS",
          "en": "Peptide mapping LC-MS/MS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "肽图LC-MS/MS；完整/脱糖/亚基结果相互印证",
          "en": "Peptide mapping LC-MS/MS; Cross-confirmation among intact/deglycosylated/subunit results"
        }
      },
      {
        "id": "non-deglycosylated-heavy-chain-mass-orthogonal-2",
        "name": {
          "zh": "完整/脱糖/亚基结果相互印证",
          "en": "Cross-confirmation among intact/deglycosylated/subunit results"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "肽图LC-MS/MS；完整/脱糖/亚基结果相互印证",
          "en": "Peptide mapping LC-MS/MS; Cross-confirmation among intact/deglycosylated/subunit results"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "deglycosylated-heavy-chain-mass",
    "category": "primary-structure",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "脱糖后重链分子量",
      "en": "Deglycosylated heavy chain molecular mass"
    },
    "itemName": {
      "zh": "脱糖重链分子质量",
      "en": "Deglycosylated heavy chain molecular mass"
    },
    "applicability": {
      "zh": "主要适用于抗体类产品；非抗体产品需评估适用性",
      "en": "Mainly applicable to antibody products; applicability to non-antibody products needs assessment"
    },
    "purpose": {
      "zh": "区分重链主链差异与糖链差异。",
      "en": "Distinguish heavy chain backbone differences from glycan differences."
    },
    "detectionIndicators": {
      "zh": "脱糖重链质量（Da）",
      "en": "Deglycosylated heavy chain mass (Da)"
    },
    "similarityMethod": {
      "zh": "定性/图谱＋理论质量核对",
      "en": "Qualitative/spectral comparison plus verification against the theoretical mass"
    },
    "judgingPrinciple": {
      "zh": "采用候选药与参照药同条件头对头定性/图谱比较；结合理论结构和正交方法解释差异。主要分子形式应对应，差异可由已知糖型或翻译后修饰解释，不应出现无法解释的新分子形式。",
      "en": "Perform head-to-head qualitative/spectral comparison of the candidate and the reference product under identical conditions; interpret differences using the theoretical structure and orthogonal methods. Major molecular forms should correspond; differences should be explainable by known glycoforms or post-translational modifications, and no unexplainable new molecular forms should appear."
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；仪器质量准确度属于方法性能，不是“相差多少Da即可相似”的判定线",
      "en": "No universal numerical limit applies to all products; instrument mass accuracy is a method-performance characteristic, not a \"similar if within X Da\" decision line"
    },
    "remark": {
      "zh": "区分蛋白主链差异与糖链差异。",
      "en": "Distinguishes protein backbone differences from glycan differences."
    },
    "methods": [
      {
        "id": "deglycosylated-heavy-chain-mass-primary-1",
        "name": {
          "zh": "脱糖并还原后LC-MS",
          "en": "LC-MS after deglycosylation and reduction"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "脱糖并还原后LC-MS",
          "en": "LC-MS after deglycosylation and reduction"
        }
      },
      {
        "id": "deglycosylated-heavy-chain-mass-orthogonal-1",
        "name": {
          "zh": "肽图LC-MS/MS",
          "en": "Peptide mapping LC-MS/MS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "肽图LC-MS/MS；完整/脱糖/亚基结果相互印证",
          "en": "Peptide mapping LC-MS/MS; Cross-confirmation among intact/deglycosylated/subunit results"
        }
      },
      {
        "id": "deglycosylated-heavy-chain-mass-orthogonal-2",
        "name": {
          "zh": "完整/脱糖/亚基结果相互印证",
          "en": "Cross-confirmation among intact/deglycosylated/subunit results"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "肽图LC-MS/MS；完整/脱糖/亚基结果相互印证",
          "en": "Peptide mapping LC-MS/MS; Cross-confirmation among intact/deglycosylated/subunit results"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "ms1-sequence-coverage",
    "category": "primary-structure",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "序列覆盖率/一级质谱",
      "en": "Sequence coverage / MS1"
    },
    "itemName": {
      "zh": "MS1肽质量覆盖率",
      "en": "MS1 peptide mass coverage"
    },
    "applicability": {
      "zh": "一般适用；仍需结合具体品种评估",
      "en": "Generally applicable; product-specific assessment still required"
    },
    "purpose": {
      "zh": "以肽段母离子质量匹配支持序列覆盖，是序列证据的一部分。",
      "en": "Support sequence coverage with peptide precursor-mass matching, as part of the sequence evidence."
    },
    "detectionIndicators": {
      "zh": "覆盖率%、匹配肽段、肽图",
      "en": "Coverage %, matched peptides, peptide map"
    },
    "similarityMethod": {
      "zh": "定性序列支持＋覆盖率描述",
      "en": "Qualitative sequence support plus coverage description"
    },
    "judgingPrinciple": {
      "zh": "采用候选药与参照药同条件头对头定性/图谱比较；结合理论结构和正交方法解释差异。主要分子形式应对应，差异可由已知糖型或翻译后修饰解释，不应出现无法解释的新分子形式。",
      "en": "Perform head-to-head qualitative/spectral comparison of the candidate and the reference product under identical conditions; interpret differences using the theoretical structure and orthogonal methods. Major molecular forms should correspond; differences should be explainable by known glycoforms or post-translational modifications, and no unexplainable new molecular forms should appear."
    },
    "numericLimit": {
      "zh": "无通用统一数值限度；应关注关键区域和方法盲区",
      "en": "No universal numerical limit; attention should be paid to critical regions and method blind spots"
    },
    "remark": {
      "zh": "“一级质谱”不是独立质量属性，而是肽图中以母离子质量匹配支持序列覆盖的证据层级。MS1质量匹配不能替代MS/MS序列确认。",
      "en": "\"MS1\" is not an independent quality attribute but an evidence tier within peptide mapping where precursor-mass matching supports sequence coverage. MS1 mass matching cannot replace MS/MS sequence confirmation."
    },
    "methods": [
      {
        "id": "ms1-sequence-coverage-primary-1",
        "name": {
          "zh": "酶切肽图LC-MS（MS1）",
          "en": "Enzymatic peptide mapping LC-MS (MS1)"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "酶切肽图LC-MS（MS1）",
          "en": "Enzymatic peptide mapping LC-MS (MS1)"
        }
      },
      {
        "id": "ms1-sequence-coverage-orthogonal-1",
        "name": {
          "zh": "LC-MS/MS",
          "en": "LC-MS/MS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "LC-MS/MS；增加其他蛋白酶",
          "en": "LC-MS/MS; Additional proteases"
        }
      },
      {
        "id": "ms1-sequence-coverage-orthogonal-2",
        "name": {
          "zh": "增加其他蛋白酶",
          "en": "Additional proteases"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "LC-MS/MS；增加其他蛋白酶",
          "en": "LC-MS/MS; Additional proteases"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "msms-sequence-coverage",
    "category": "primary-structure",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "序列覆盖率/二级质谱",
      "en": "Sequence coverage / MS/MS"
    },
    "itemName": {
      "zh": "MS/MS序列确认覆盖率",
      "en": "MS/MS-confirmed sequence coverage"
    },
    "applicability": {
      "zh": "一般适用；仍需结合具体品种评估",
      "en": "Generally applicable; product-specific assessment still required"
    },
    "purpose": {
      "zh": "通过碎片离子确认肽段序列和修饰位点。",
      "en": "Confirm peptide sequences and modification sites via fragment ions."
    },
    "detectionIndicators": {
      "zh": "MS/MS确认覆盖率、碎片离子谱、修饰位点信息",
      "en": "MS/MS-confirmed coverage, fragment-ion spectra, modification-site information"
    },
    "similarityMethod": {
      "zh": "直接序列比对",
      "en": "Direct sequence alignment"
    },
    "judgingPrinciple": {
      "zh": "氨基酸序列原则上应与参照药相同；关键区需有充分序列证据，不得出现未经解释的氨基酸替换。",
      "en": "The amino acid sequence should in principle be identical to the reference product; critical regions require sufficient sequence evidence, and no unexplained amino acid substitutions are allowed."
    },
    "numericLimit": {
      "zh": "原则上序列一致；CDR和功能关键区应获得明确证据。",
      "en": "In principle the sequence must be identical; clear evidence should be obtained for CDRs and function-critical regions."
    },
    "remark": {
      "zh": "以碎片离子确认肽段序列，证据强于仅依赖MS1质量匹配。",
      "en": "Peptide sequences are confirmed by fragment ions, providing stronger evidence than MS1 mass matching alone."
    },
    "methods": [
      {
        "id": "msms-sequence-coverage-primary-1",
        "name": {
          "zh": "肽图LC-MS/MS",
          "en": "Peptide mapping LC-MS/MS"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "肽图LC-MS/MS",
          "en": "Peptide mapping LC-MS/MS"
        }
      },
      {
        "id": "msms-sequence-coverage-orthogonal-1",
        "name": {
          "zh": "不同酶切策略",
          "en": "Alternative enzymatic digestion strategies"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "不同酶切策略；端基分析",
          "en": "Alternative enzymatic digestion strategies; Terminal analysis"
        }
      },
      {
        "id": "msms-sequence-coverage-orthogonal-2",
        "name": {
          "zh": "端基分析",
          "en": "Terminal analysis"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "不同酶切策略；端基分析",
          "en": "Alternative enzymatic digestion strategies; Terminal analysis"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "ptm-modification-1",
    "category": "ptm-glycosylation",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "见表末补充",
      "en": "See supplementary entries at the end of the table"
    },
    "itemName": {
      "zh": "翻译后修饰—修饰1",
      "en": "Post-translational modification — modification 1"
    },
    "applicability": {
      "zh": "结合具体品种展开",
      "en": "To be developed for the specific product"
    },
    "purpose": {
      "zh": "模板要求按品种填入具体修饰及其位点/丰度。",
      "en": "Template requirement: fill in the specific modifications and their sites/abundance for the product."
    },
    "detectionIndicators": {
      "zh": "修饰位点、相对丰度%、相关图谱",
      "en": "Modification sites, relative abundance %, related spectra"
    },
    "similarityMethod": {
      "zh": "定性鉴定＋定量QR/实际范围",
      "en": "Qualitative identification plus quantitative QR / actual range"
    },
    "judgingPrinciple": {
      "zh": "先确认修饰种类和位点；高/中风险且可定量者可按QR或实际范围比较；与MoA直接相关者可关联功能评价。",
      "en": "First confirm modification types and sites; high/medium-risk quantifiable modifications may be compared by QR or actual range; modifications directly related to the MoA may be linked to functional evaluation."
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。",
      "en": "No universal numerical limit applies to all products. A risk-based quality-range approach may be used: QR = (μR − XσR, μR + XσR); X must be justified according to the risk of the attribute. If a sufficient proportion of batches (e.g. ≥90%) fall within the range, similarity of the attribute can be supported; means, SDs and distributions should also be compared."
    },
    "remark": {
      "zh": "本表补充氧化、脱酰胺等末端修饰常见示例（表末）。",
      "en": "Common terminal-modification examples such as oxidation and deamidation are supplemented at the end of this table."
    },
    "methods": [
      {
        "id": "ptm-modification-1-primary-1",
        "name": {
          "zh": "肽图LC-MS/MS",
          "en": "Peptide mapping LC-MS/MS"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "肽图LC-MS/MS；完整/亚基质谱；必要时专项方法",
          "en": "Peptide mapping LC-MS/MS; Intact/subunit mass spectrometry; Dedicated methods where necessary"
        }
      },
      {
        "id": "ptm-modification-1-primary-2",
        "name": {
          "zh": "完整/亚基质谱",
          "en": "Intact/subunit mass spectrometry"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "肽图LC-MS/MS；完整/亚基质谱；必要时专项方法",
          "en": "Peptide mapping LC-MS/MS; Intact/subunit mass spectrometry; Dedicated methods where necessary"
        }
      },
      {
        "id": "ptm-modification-1-primary-3",
        "name": {
          "zh": "必要时专项方法",
          "en": "Dedicated methods where necessary"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "肽图LC-MS/MS；完整/亚基质谱；必要时专项方法",
          "en": "Peptide mapping LC-MS/MS; Intact/subunit mass spectrometry; Dedicated methods where necessary"
        }
      },
      {
        "id": "ptm-modification-1-orthogonal-1",
        "name": {
          "zh": "电荷/疏水分离、富集后鉴定",
          "en": "Charge/hydrophobicity separation with identification after enrichment"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "电荷/疏水分离、富集后鉴定",
          "en": "Charge/hydrophobicity separation with identification after enrichment"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "ptm-modification-2",
    "category": "ptm-glycosylation",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "见表末补充",
      "en": "See supplementary entries at the end of the table"
    },
    "itemName": {
      "zh": "翻译后修饰—修饰2",
      "en": "Post-translational modification — modification 2"
    },
    "applicability": {
      "zh": "结合具体品种展开",
      "en": "To be developed for the specific product"
    },
    "purpose": {
      "zh": "模板要求按品种填入具体修饰及其位点/丰度。",
      "en": "Template requirement: fill in the specific modifications and their sites/abundance for the product."
    },
    "detectionIndicators": {
      "zh": "修饰位点、相对丰度%、相关图谱",
      "en": "Modification sites, relative abundance %, related spectra"
    },
    "similarityMethod": {
      "zh": "定性鉴定＋定量QR/实际范围",
      "en": "Qualitative identification plus quantitative QR / actual range"
    },
    "judgingPrinciple": {
      "zh": "先确认修饰种类和位点；高/中风险且可定量者可按QR或实际范围比较；与MoA直接相关者可关联功能评价。",
      "en": "First confirm modification types and sites; high/medium-risk quantifiable modifications may be compared by QR or actual range; modifications directly related to the MoA may be linked to functional evaluation."
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。",
      "en": "No universal numerical limit applies to all products. A risk-based quality-range approach may be used: QR = (μR − XσR, μR + XσR); X must be justified according to the risk of the attribute. If a sufficient proportion of batches (e.g. ≥90%) fall within the range, similarity of the attribute can be supported; means, SDs and distributions should also be compared."
    },
    "remark": {
      "zh": "本表补充氧化、脱酰胺等末端修饰常见示例（表末）。",
      "en": "Common terminal-modification examples such as oxidation and deamidation are supplemented at the end of this table."
    },
    "methods": [
      {
        "id": "ptm-modification-2-primary-1",
        "name": {
          "zh": "肽图LC-MS/MS",
          "en": "Peptide mapping LC-MS/MS"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "肽图LC-MS/MS；完整/亚基质谱；必要时专项方法",
          "en": "Peptide mapping LC-MS/MS; Intact/subunit mass spectrometry; Dedicated methods where necessary"
        }
      },
      {
        "id": "ptm-modification-2-primary-2",
        "name": {
          "zh": "完整/亚基质谱",
          "en": "Intact/subunit mass spectrometry"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "肽图LC-MS/MS；完整/亚基质谱；必要时专项方法",
          "en": "Peptide mapping LC-MS/MS; Intact/subunit mass spectrometry; Dedicated methods where necessary"
        }
      },
      {
        "id": "ptm-modification-2-primary-3",
        "name": {
          "zh": "必要时专项方法",
          "en": "Dedicated methods where necessary"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "肽图LC-MS/MS；完整/亚基质谱；必要时专项方法",
          "en": "Peptide mapping LC-MS/MS; Intact/subunit mass spectrometry; Dedicated methods where necessary"
        }
      },
      {
        "id": "ptm-modification-2-orthogonal-1",
        "name": {
          "zh": "电荷/疏水分离、富集后鉴定",
          "en": "Charge/hydrophobicity separation with identification after enrichment"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "电荷/疏水分离、富集后鉴定",
          "en": "Charge/hydrophobicity separation with identification after enrichment"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "cdr-signature-peptides",
    "category": "primary-structure",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "CDR区特征肽段鉴别",
      "en": "Identification of CDR signature peptides"
    },
    "itemName": {
      "zh": "CDR区特征肽确认",
      "en": "Confirmation of CDR signature peptides"
    },
    "applicability": {
      "zh": "主要适用于抗体类产品；非抗体产品需评估适用性",
      "en": "Mainly applicable to antibody products; applicability to non-antibody products needs assessment"
    },
    "purpose": {
      "zh": "确认抗体功能关键序列和特征肽。",
      "en": "Confirm antibody function-critical sequences and signature peptides."
    },
    "detectionIndicators": {
      "zh": "CDR特征肽保留时间、质量和MS/MS序列",
      "en": "Retention time, mass and MS/MS sequence of CDR signature peptides"
    },
    "similarityMethod": {
      "zh": "直接定性比对",
      "en": "Direct qualitative comparison"
    },
    "judgingPrinciple": {
      "zh": "候选药CDR特征肽应与参照药/理论序列一致。",
      "en": "The candidate's CDR signature peptides should be identical to the reference product / theoretical sequence."
    },
    "numericLimit": {
      "zh": "不适用，定性身份确认",
      "en": "Not applicable; qualitative identity confirmation"
    },
    "remark": {
      "zh": "仅抗体类产品适用。",
      "en": "Applicable to antibody products only."
    },
    "methods": [
      {
        "id": "cdr-signature-peptides-primary-1",
        "name": {
          "zh": "靶向肽图LC-MS/MS",
          "en": "Targeted peptide mapping LC-MS/MS"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "靶向肽图LC-MS/MS",
          "en": "Targeted peptide mapping LC-MS/MS"
        }
      },
      {
        "id": "cdr-signature-peptides-orthogonal-1",
        "name": {
          "zh": "多酶切策略",
          "en": "Multi-enzyme digestion strategies"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "多酶切策略；高分辨MS",
          "en": "Multi-enzyme digestion strategies; High-resolution MS"
        }
      },
      {
        "id": "cdr-signature-peptides-orthogonal-2",
        "name": {
          "zh": "高分辨MS",
          "en": "High-resolution MS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "多酶切策略；高分辨MS",
          "en": "Multi-enzyme digestion strategies; High-resolution MS"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "n-c-terminal-sequence",
    "category": "primary-structure",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "C/N端氨基酸序列",
      "en": "C/N-terminal amino acid sequence"
    },
    "itemName": {
      "zh": "N/C端氨基酸序列及末端异质性",
      "en": "N/C-terminal amino acid sequence and terminal heterogeneity"
    },
    "applicability": {
      "zh": "一般适用；仍需结合具体品种评估",
      "en": "Generally applicable; product-specific assessment still required"
    },
    "purpose": {
      "zh": "确认端基序列和剪切/加工形式。",
      "en": "Confirm terminal sequences and clipping/processing forms."
    },
    "detectionIndicators": {
      "zh": "端基序列、焦谷氨酸化、C端Lys保留/缺失比例",
      "en": "Terminal sequences, pyroglutamation, C-terminal Lys retention/loss ratios"
    },
    "similarityMethod": {
      "zh": "定性序列＋定量分布",
      "en": "Qualitative sequence plus quantitative distribution"
    },
    "judgingPrinciple": {
      "zh": "端基序列应一致；可量化末端异质体可结合风险采用QR或实际范围。",
      "en": "Terminal sequences should be identical; quantifiable terminal variants may use QR or actual range in a risk-based manner."
    },
    "numericLimit": {
      "zh": "序列本身→定性；异质体比例→QR",
      "en": "Sequence itself → qualitative; variant proportions → QR"
    },
    "remark": {
      "zh": "指南写作顺序为C/N端；规范表述常写N/C端，含端基序列和加工异质性。",
      "en": "The guideline writes C/N-terminus; the standard wording is usually N/C-terminus, covering terminal sequences and processing heterogeneity."
    },
    "methods": [
      {
        "id": "n-c-terminal-sequence-primary-1",
        "name": {
          "zh": "肽图LC-MS/MS",
          "en": "Peptide mapping LC-MS/MS"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "肽图LC-MS/MS；必要时Edman降解",
          "en": "Peptide mapping LC-MS/MS; Edman degradation where necessary"
        }
      },
      {
        "id": "n-c-terminal-sequence-primary-2",
        "name": {
          "zh": "必要时Edman降解",
          "en": "Edman degradation where necessary"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "肽图LC-MS/MS；必要时Edman降解",
          "en": "Peptide mapping LC-MS/MS; Edman degradation where necessary"
        }
      },
      {
        "id": "n-c-terminal-sequence-orthogonal-1",
        "name": {
          "zh": "完整/亚基质谱",
          "en": "Intact/subunit mass spectrometry"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "完整/亚基质谱",
          "en": "Intact/subunit mass spectrometry"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "free-thiol",
    "category": "primary-structure",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "游离巯基",
      "en": "Free thiols"
    },
    "itemName": {
      "zh": "游离巯基水平",
      "en": "Free thiol level"
    },
    "applicability": {
      "zh": "一般适用；仍需结合具体品种评估",
      "en": "Generally applicable; product-specific assessment still required"
    },
    "purpose": {
      "zh": "评价未配对半胱氨酸和潜在错误折叠/聚集风险。",
      "en": "Assess unpaired cysteines and potential misfolding/aggregation risk."
    },
    "detectionIndicators": {
      "zh": "mol SH/mol protein或相对荧光/含量",
      "en": "mol SH / mol protein, or relative fluorescence/content"
    },
    "similarityMethod": {
      "zh": "定量QR/实际范围",
      "en": "Quantitative QR / actual range"
    },
    "judgingPrinciple": {
      "zh": "与参照药分布总体相似，且不提示候选药增加错误连接或聚集风险。",
      "en": "The distribution should be broadly similar to the reference product and should not suggest increased mislinkage or aggregation risk for the candidate."
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。",
      "en": "No universal numerical limit applies to all products. A risk-based quality-range approach may be used: QR = (μR − XσR, μR + XσR); X must be justified according to the risk of the attribute. If a sufficient proportion of batches (e.g. ≥90%) fall within the range, similarity of the attribute can be supported; means, SDs and distributions should also be compared."
    },
    "remark": {
      "zh": "反映未配对半胱氨酸，可能与错误折叠、二硫键交换或聚集相关。",
      "en": "Reflects unpaired cysteines, which may be associated with misfolding, disulfide scrambling or aggregation."
    },
    "methods": [
      {
        "id": "free-thiol-primary-1",
        "name": {
          "zh": "Ellman试剂法或荧光巯基法",
          "en": "Ellman's reagent assay or fluorescent thiol assay"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "Ellman试剂法或荧光巯基法",
          "en": "Ellman's reagent assay or fluorescent thiol assay"
        }
      },
      {
        "id": "free-thiol-orthogonal-1",
        "name": {
          "zh": "非还原肽图LC-MS/MS",
          "en": "Non-reduced peptide mapping LC-MS/MS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "非还原肽图LC-MS/MS；还原/非还原CE-SDS",
          "en": "Non-reduced peptide mapping LC-MS/MS; Reduced/non-reduced CE-SDS"
        }
      },
      {
        "id": "free-thiol-orthogonal-2",
        "name": {
          "zh": "还原/非还原CE-SDS",
          "en": "Reduced/non-reduced CE-SDS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "非还原肽图LC-MS/MS；还原/非还原CE-SDS",
          "en": "Non-reduced peptide mapping LC-MS/MS; Reduced/non-reduced CE-SDS"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "disulfide-bonds",
    "category": "primary-structure",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "二硫键",
      "en": "Disulfide bonds"
    },
    "itemName": {
      "zh": "二硫键连接图谱",
      "en": "Disulfide linkage map"
    },
    "applicability": {
      "zh": "一般适用；仍需结合具体品种评估",
      "en": "Generally applicable; product-specific assessment still required"
    },
    "purpose": {
      "zh": "确认预期链内/链间二硫键及异常配对。",
      "en": "Confirm expected intra-/inter-chain disulfide bonds and abnormal pairings."
    },
    "detectionIndicators": {
      "zh": "连接肽、预期连接覆盖、异常连接",
      "en": "Linked peptides, coverage of expected linkages, abnormal linkages"
    },
    "similarityMethod": {
      "zh": "直接定性比对",
      "en": "Direct qualitative comparison"
    },
    "judgingPrinciple": {
      "zh": "预期二硫键连接方式应一致；不应出现未经解释的新连接形式。",
      "en": "The expected disulfide linkage pattern should be identical; no unexplained new linkage forms should appear."
    },
    "numericLimit": {
      "zh": "不适用，预期连接方式一致即可",
      "en": "Not applicable; the expected linkage pattern being identical is sufficient"
    },
    "remark": {
      "zh": "需确认预期链内和链间二硫键及异常配对。",
      "en": "Expected intra- and inter-chain disulfide bonds and abnormal pairings must be confirmed."
    },
    "methods": [
      {
        "id": "disulfide-bonds-primary-1",
        "name": {
          "zh": "非还原肽图LC-MS/MS",
          "en": "Non-reduced peptide mapping LC-MS/MS"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "非还原肽图LC-MS/MS",
          "en": "Non-reduced peptide mapping LC-MS/MS"
        }
      },
      {
        "id": "disulfide-bonds-orthogonal-1",
        "name": {
          "zh": "游离巯基",
          "en": "Free thiols"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "游离巯基；还原/非还原CE-SDS",
          "en": "Free thiols; Reduced/non-reduced CE-SDS"
        }
      },
      {
        "id": "disulfide-bonds-orthogonal-2",
        "name": {
          "zh": "还原/非还原CE-SDS",
          "en": "Reduced/non-reduced CE-SDS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "游离巯基；还原/非还原CE-SDS",
          "en": "Free thiols; Reduced/non-reduced CE-SDS"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "far-uv-cd",
    "category": "higher-order-structure",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "圆二色谱/远紫外",
      "en": "Circular dichroism / far-UV"
    },
    "itemName": {
      "zh": "二级结构（远紫外CD）",
      "en": "Secondary structure (far-UV CD)"
    },
    "applicability": {
      "zh": "一般适用；仍需结合具体品种评估",
      "en": "Generally applicable; product-specific assessment still required"
    },
    "purpose": {
      "zh": "从不同角度评价蛋白折叠、构象和稳定性。",
      "en": "Assess protein folding, conformation and stability from different perspectives."
    },
    "detectionIndicators": {
      "zh": "椭圆度-波长谱、二级结构特征",
      "en": "Ellipticity-wavelength spectrum, secondary structure signatures"
    },
    "similarityMethod": {
      "zh": "头对头图谱/曲线比较；必要时定量参数结合实际范围",
      "en": "Head-to-head spectral/curve comparison; quantitative parameters combined with actual ranges where necessary"
    },
    "judgingPrinciple": {
      "zh": "采用候选药与参照药同条件头对头定性/图谱比较；结合理论结构和正交方法解释差异。多个正交方法应共同支持整体构象相似。",
      "en": "Perform head-to-head qualitative/spectral comparison of the candidate and the reference product under identical conditions; interpret differences using the theoretical structure and orthogonal methods. Multiple orthogonal methods should jointly support overall conformational similarity."
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；采用头对头定性或图谱比对。",
      "en": "No universal numerical limit applies to all products; use head-to-head qualitative or spectral comparison."
    },
    "remark": {
      "zh": "肽键是手性生色团，在远紫外区（190-250 nm）有吸收，当其处于α-螺旋、β-折叠等规则排列时，会产生特征性的CD信号",
      "en": "The peptide bond is a chiral chromophore absorbing in the far-UV region (190–250 nm); regular arrangements such as α-helix and β-sheet produce characteristic CD signals"
    },
    "methods": [
      {
        "id": "far-uv-cd-primary-1",
        "name": {
          "zh": "远紫外CD",
          "en": "Far-UV CD"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "远紫外CD",
          "en": "Far-UV CD"
        }
      },
      {
        "id": "far-uv-cd-orthogonal-1",
        "name": {
          "zh": "采用不同原理的正交方法（FT-IR等）",
          "en": "Orthogonal methods based on different principles (FT-IR, etc.)"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "采用不同原理的正交方法（FT-IR等）；必要时高分辨结构技术（X-ray、NMR等）",
          "en": "Orthogonal methods based on different principles (FT-IR, etc.); High-resolution structural techniques where necessary (X-ray, NMR, etc.)"
        }
      },
      {
        "id": "far-uv-cd-orthogonal-2",
        "name": {
          "zh": "必要时高分辨结构技术（X-ray、NMR等）",
          "en": "High-resolution structural techniques where necessary (X-ray, NMR, etc.)"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "采用不同原理的正交方法（FT-IR等）；必要时高分辨结构技术（X-ray、NMR等）",
          "en": "Orthogonal methods based on different principles (FT-IR, etc.); High-resolution structural techniques where necessary (X-ray, NMR, etc.)"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "near-uv-cd",
    "category": "higher-order-structure",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "圆二色谱/近紫外",
      "en": "Circular dichroism / near-UV"
    },
    "itemName": {
      "zh": "三级结构（近紫外CD）",
      "en": "Tertiary structure (near-UV CD)"
    },
    "applicability": {
      "zh": "一般适用；仍需结合具体品种评估",
      "en": "Generally applicable; product-specific assessment still required"
    },
    "purpose": {
      "zh": "从不同角度评价蛋白折叠、构象和稳定性。",
      "en": "Assess protein folding, conformation and stability from different perspectives."
    },
    "detectionIndicators": {
      "zh": "椭圆度-波长谱、芳香残基微环境",
      "en": "Ellipticity-wavelength spectrum, aromatic-residue microenvironment"
    },
    "similarityMethod": {
      "zh": "头对头图谱/曲线比较；必要时定量参数结合实际范围",
      "en": "Head-to-head spectral/curve comparison; quantitative parameters combined with actual ranges where necessary"
    },
    "judgingPrinciple": {
      "zh": "采用候选药与参照药同条件头对头定性/图谱比较；结合理论结构和正交方法解释差异。多个正交方法应共同支持整体构象相似。",
      "en": "Perform head-to-head qualitative/spectral comparison of the candidate and the reference product under identical conditions; interpret differences using the theoretical structure and orthogonal methods. Multiple orthogonal methods should jointly support overall conformational similarity."
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；采用头对头定性或图谱比对。",
      "en": "No universal numerical limit applies to all products; use head-to-head qualitative or spectral comparison."
    },
    "remark": {
      "zh": "近紫外CD主要反映芳香族残基和二硫键周围微环境；其只有被紧紧夹在蛋白内部一个刚性的、不对称的微环境中时，才会在近紫外区（250-350 nm）产生明显的CD信号。",
      "en": "Near-UV CD mainly reflects the microenvironment around aromatic residues and disulfide bonds; a distinct CD signal (250–350 nm) appears only when these are held in a rigid, asymmetric microenvironment inside the protein."
    },
    "methods": [
      {
        "id": "near-uv-cd-primary-1",
        "name": {
          "zh": "近紫外CD",
          "en": "Near-UV CD"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "近紫外CD",
          "en": "Near-UV CD"
        }
      },
      {
        "id": "near-uv-cd-orthogonal-1",
        "name": {
          "zh": "采用不同原理的正交方法（内源荧光光谱）",
          "en": "Orthogonal methods based on different principles (intrinsic fluorescence spectroscopy)"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "采用不同原理的正交方法（内源荧光光谱）；必要时高分辨结构技术（X-ray、NMR等）",
          "en": "Orthogonal methods based on different principles (intrinsic fluorescence spectroscopy); High-resolution structural techniques where necessary (X-ray, NMR, etc.)"
        }
      },
      {
        "id": "near-uv-cd-orthogonal-2",
        "name": {
          "zh": "必要时高分辨结构技术（X-ray、NMR等）",
          "en": "High-resolution structural techniques where necessary (X-ray, NMR, etc.)"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "采用不同原理的正交方法（内源荧光光谱）；必要时高分辨结构技术（X-ray、NMR等）",
          "en": "Orthogonal methods based on different principles (intrinsic fluorescence spectroscopy); High-resolution structural techniques where necessary (X-ray, NMR, etc.)"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "intrinsic-fluorescence",
    "category": "higher-order-structure",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "荧光光谱",
      "en": "Fluorescence spectroscopy"
    },
    "itemName": {
      "zh": "三级结构（内源荧光）",
      "en": "Tertiary structure (intrinsic fluorescence)"
    },
    "applicability": {
      "zh": "一般适用；仍需结合具体品种评估",
      "en": "Generally applicable; product-specific assessment still required"
    },
    "purpose": {
      "zh": "从不同角度评价蛋白折叠、构象和稳定性。",
      "en": "Assess protein folding, conformation and stability from different perspectives."
    },
    "detectionIndicators": {
      "zh": "发射峰位、强度、谱形",
      "en": "Emission peak position, intensity, spectral shape"
    },
    "similarityMethod": {
      "zh": "头对头图谱/曲线比较；必要时定量参数结合实际范围",
      "en": "Head-to-head spectral/curve comparison; quantitative parameters combined with actual ranges where necessary"
    },
    "judgingPrinciple": {
      "zh": "采用候选药与参照药同条件头对头定性/图谱比较；结合理论结构和正交方法解释差异。多个正交方法应共同支持整体构象相似。",
      "en": "Perform head-to-head qualitative/spectral comparison of the candidate and the reference product under identical conditions; interpret differences using the theoretical structure and orthogonal methods. Multiple orthogonal methods should jointly support overall conformational similarity."
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；采用头对头定性或图谱比对。",
      "en": "No universal numerical limit applies to all products; use head-to-head qualitative or spectral comparison."
    },
    "remark": {
      "zh": "反映色氨酸 Trp/酪氨酸 Tyr等荧光基团微环境。",
      "en": "Reflects the microenvironment of fluorophores such as tryptophan (Trp) and tyrosine (Tyr)."
    },
    "methods": [
      {
        "id": "intrinsic-fluorescence-primary-1",
        "name": {
          "zh": "内源荧光光谱",
          "en": "Intrinsic fluorescence spectroscopy"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "内源荧光光谱",
          "en": "Intrinsic fluorescence spectroscopy"
        }
      },
      {
        "id": "intrinsic-fluorescence-orthogonal-1",
        "name": {
          "zh": "采用不同原理的正交方法",
          "en": "Orthogonal methods based on different principles"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "采用不同原理的正交方法；必要时高分辨结构技术",
          "en": "Orthogonal methods based on different principles; High-resolution structural techniques where necessary"
        }
      },
      {
        "id": "intrinsic-fluorescence-orthogonal-2",
        "name": {
          "zh": "必要时高分辨结构技术",
          "en": "High-resolution structural techniques where necessary"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "采用不同原理的正交方法；必要时高分辨结构技术",
          "en": "Orthogonal methods based on different principles; High-resolution structural techniques where necessary"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "thermal-stability",
    "category": "higher-order-structure",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "热稳定性",
      "en": "Thermal stability"
    },
    "itemName": {
      "zh": "热稳定性/热转变",
      "en": "Thermal stability / thermal transitions"
    },
    "applicability": {
      "zh": "一般适用；仍需结合具体品种评估",
      "en": "Generally applicable; product-specific assessment still required"
    },
    "purpose": {
      "zh": "从不同角度评价蛋白折叠、构象和稳定性。",
      "en": "Assess protein folding, conformation and stability from different perspectives."
    },
    "detectionIndicators": {
      "zh": "Tm、热转变峰和曲线",
      "en": "Tm, thermal transition peaks and curves"
    },
    "similarityMethod": {
      "zh": "头对头图谱/曲线比较；必要时定量参数结合实际范围",
      "en": "Head-to-head spectral/curve comparison; quantitative parameters combined with actual ranges where necessary"
    },
    "judgingPrinciple": {
      "zh": "采用候选药与参照药同条件头对头定性/图谱比较；结合理论结构和正交方法解释差异。多个正交方法应共同支持整体构象相似。",
      "en": "Perform head-to-head qualitative/spectral comparison of the candidate and the reference product under identical conditions; interpret differences using the theoretical structure and orthogonal methods. Multiple orthogonal methods should jointly support overall conformational similarity."
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；采用头对头定性或图谱比对。",
      "en": "No universal numerical limit applies to all products; use head-to-head qualitative or spectral comparison."
    },
    "remark": {
      "zh": "-",
      "en": "-"
    },
    "methods": [
      {
        "id": "thermal-stability-primary-1",
        "name": {
          "zh": "DSC（差示扫描量热法）",
          "en": "DSC (differential scanning calorimetry)"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "DSC（差示扫描量热法）；可辅以DSF（差示扫描荧光法）",
          "en": "DSC (differential scanning calorimetry); Optionally supported by DSF (differential scanning fluorimetry)"
        }
      },
      {
        "id": "thermal-stability-primary-2",
        "name": {
          "zh": "可辅以DSF（差示扫描荧光法）",
          "en": "Optionally supported by DSF (differential scanning fluorimetry)"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "DSC（差示扫描量热法）；可辅以DSF（差示扫描荧光法）",
          "en": "DSC (differential scanning calorimetry); Optionally supported by DSF (differential scanning fluorimetry)"
        }
      },
      {
        "id": "thermal-stability-orthogonal-1",
        "name": {
          "zh": "采用不同原理的正交方法",
          "en": "Orthogonal methods based on different principles"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "采用不同原理的正交方法；必要时高分辨结构技术",
          "en": "Orthogonal methods based on different principles; High-resolution structural techniques where necessary"
        }
      },
      {
        "id": "thermal-stability-orthogonal-2",
        "name": {
          "zh": "必要时高分辨结构技术",
          "en": "High-resolution structural techniques where necessary"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "采用不同原理的正交方法；必要时高分辨结构技术",
          "en": "Orthogonal methods based on different principles; High-resolution structural techniques where necessary"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "other-higher-order-structure-methods",
    "category": "higher-order-structure",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "-",
      "en": "-"
    },
    "itemName": {
      "zh": "其他高级结构确证方法（见表末补充）",
      "en": "Other higher-order structure confirmation methods (see supplementary entries)"
    },
    "applicability": {
      "zh": "结合具体品种展开",
      "en": "To be developed based on the specific product"
    },
    "purpose": {
      "zh": "从不同角度评价蛋白折叠、构象和稳定性。",
      "en": "Assess protein folding, conformation and stability from different perspectives."
    },
    "detectionIndicators": {
      "zh": "见表末补充",
      "en": "See supplementary entries at the end of the table"
    },
    "similarityMethod": {
      "zh": "头对头图谱/曲线比较；必要时定量参数结合实际范围",
      "en": "Head-to-head spectral/curve comparison; quantitative parameters combined with actual ranges where necessary"
    },
    "judgingPrinciple": {
      "zh": "采用候选药与参照药同条件头对头定性/图谱比较；结合理论结构和正交方法解释差异。多个正交方法应共同支持整体构象相似。",
      "en": "Perform head-to-head qualitative/spectral comparison of the candidate and the reference product under identical conditions; interpret differences using the theoretical structure and orthogonal methods. Multiple orthogonal methods should jointly support overall conformational similarity."
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；采用头对头定性或图谱比对。",
      "en": "No universal numerical limit applies to all products; use head-to-head qualitative or spectral comparison."
    },
    "remark": {
      "zh": "可用FT-IR、HDX-MS、NMR等补充。 样品浓度、缓冲液和数据处理必须一致。",
      "en": "FT-IR, HDX-MS, NMR, etc. can be used as supplements. Sample concentration, buffer and data processing must be identical."
    },
    "methods": [
      {
        "id": "other-higher-order-structure-methods-primary-1",
        "name": {
          "zh": "见表末补充",
          "en": "See supplementary entries at the end of the table"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "见表末补充",
          "en": "See supplementary entries at the end of the table"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "n-glycosylation-site-occupancy",
    "category": "ptm-glycosylation",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "N-糖基化位点（天冬酰胺Asn，简称N）",
      "en": "N-glycosylation site (asparagine, Asn / N)"
    },
    "itemName": {
      "zh": "N-糖基化位点及占有率",
      "en": "N-glycosylation sites and site occupancy"
    },
    "applicability": {
      "zh": "适用于发生相应糖基化的产品",
      "en": "Applicable to products carrying the corresponding glycosylation"
    },
    "purpose": {
      "zh": "确认糖基化连接位点和该位点的糖基化程度。",
      "en": "Confirm the glycan attachment sites and the degree of glycosylation at each site."
    },
    "detectionIndicators": {
      "zh": "糖基化位点；各糖型相对含量（%）；该位点糖基化占有率（%）",
      "en": "Glycosylation sites; relative content of each glycoform (%); site occupancy (%)"
    },
    "similarityMethod": {
      "zh": "位点定性应与参照药一致＋占有率定量比较",
      "en": "Site identity should qualitatively match the reference, plus quantitative comparison of occupancy"
    },
    "judgingPrinciple": {
      "zh": "糖基化位点应与参照药及预期结构一致。对于典型IgG类单克隆抗体，应重点确认Fc区保守N-糖基化位点（通常为EU编号Asn-297）；如产品存在其他N-或O-糖基化位点，也应分别鉴定并评价占有率",
      "en": "Glycosylation sites should be consistent with the reference product and the expected structure. For typical IgG monoclonal antibodies, the conserved Fc N-glycosylation site (usually Asn-297, EU numbering) should be confirmed; any other N- or O-glycosylation sites should be identified and their occupancy evaluated separately"
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。",
      "en": "No universal numerical limit applies to all products. A risk-based quality-range approach may be used: QR = (μR − XσR, μR + XσR); X must be justified according to the risk of the attribute. If a sufficient proportion of batches (e.g. ≥90%) fall within the range, similarity of the attribute can be supported; means, SDs and distributions should also be compared."
    },
    "remark": {
      "zh": "重点关注非糖基化重链（NGHC）比例；若使用NS0/SP2/0细胞需额外监测NGNA风险。",
      "en": "Pay particular attention to the non-glycosylated heavy chain (NGHC) ratio; NGNA risk requires extra monitoring when NS0/SP2/0 cells are used."
    },
    "methods": [
      {
        "id": "n-glycosylation-site-occupancy-primary-1",
        "name": {
          "zh": "糖肽LC-MS/MS或PNGase F处理前后肽图LC-MS/MS，用于确认具体糖基化位点及占有率",
          "en": "Glycopeptide LC-MS/MS, or peptide mapping LC-MS/MS before/after PNGase F treatment, to confirm specific glycosylation sites and occupancy"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "糖肽LC-MS/MS或PNGase F处理前后肽图LC-MS/MS，用于确认具体糖基化位点及占有率",
          "en": "Glycopeptide LC-MS/MS, or peptide mapping LC-MS/MS before/after PNGase F treatment, to confirm specific glycosylation sites and occupancy"
        }
      },
      {
        "id": "n-glycosylation-site-occupancy-orthogonal-1",
        "name": {
          "zh": "完整/亚基分子量LC-MS（宏观检测脱糖前后的质量偏移，验证整体糖型分布）",
          "en": "Intact/subunit molecular mass LC-MS (macroscopic detection of mass shift before/after deglycosylation, verifying overall glycoform distribution)"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "完整/亚基分子量LC-MS（宏观检测脱糖前后的质量偏移，验证整体糖型分布）；PNGase F处理前后完整分子量比对",
          "en": "Intact/subunit molecular mass LC-MS (macroscopic detection of mass shift before/after deglycosylation, verifying overall glycoform distribution); Intact mass comparison before/after PNGase F treatment"
        }
      },
      {
        "id": "n-glycosylation-site-occupancy-orthogonal-2",
        "name": {
          "zh": "PNGase F处理前后完整分子量比对",
          "en": "Intact mass comparison before/after PNGase F treatment"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "完整/亚基分子量LC-MS（宏观检测脱糖前后的质量偏移，验证整体糖型分布）；PNGase F处理前后完整分子量比对",
          "en": "Intact/subunit molecular mass LC-MS (macroscopic detection of mass shift before/after deglycosylation, verifying overall glycoform distribution); Intact mass comparison before/after PNGase F treatment"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "glycan-g0f",
    "category": "ptm-glycosylation",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "N-糖链类型及比例/G0F",
      "en": "N-glycan types and proportions / G0F"
    },
    "itemName": {
      "zh": "G0F糖型比例",
      "en": "G0F glycoform proportion"
    },
    "applicability": {
      "zh": "适用于发生相应糖基化的产品",
      "en": "Applicable to products carrying the corresponding glycosylation"
    },
    "purpose": {
      "zh": "评价候选药与参照药在无半乳糖、核心岩藻糖化糖型G0F上的相对分布",
      "en": "Assess the relative distribution of the agalactosylated, core-fucosylated glycoform G0F between the candidate and the reference product"
    },
    "detectionIndicators": {
      "zh": "各糖型峰面积百分比（如G0F%、G1F%、G2F%等）；总糖谱图（HILIC色谱图）",
      "en": "Peak area percentage of each glycoform (e.g. G0F%, G1F%, G2F%); total glycan profile (HILIC chromatogram)"
    },
    "similarityMethod": {
      "zh": "头对头图谱比对 + 定量QR法；重点糖型需进行统计学等效性检验",
      "en": "Head-to-head profile comparison plus quantitative QR approach; key glycoforms require statistical equivalence testing"
    },
    "judgingPrinciple": {
      "zh": "主要糖型种类和整体分布应与参照药图谱高度相似；G0F作为主峰，可采用质量范围法：；高风险糖型（如G0、高甘露糖）需更严格评估，并关联Fc功能、PK或免疫风险",
      "en": "Major glycoform species and overall distribution should closely match the reference profile; G0F, as the main peak, may use the quality-range approach; high-risk glycoforms (e.g. G0, high-mannose) require stricter assessment linked to Fc function, PK or immunogenicity risk"
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。",
      "en": "No universal numerical limit applies to all products. A risk-based quality-range approach may be used: QR = (μR − XσR, μR + XσR); X must be justified according to the risk of the attribute. If a sufficient proportion of batches (e.g. ≥90%) fall within the range, similarity of the attribute can be supported; means, SDs and distributions should also be compared."
    },
    "remark": {
      "zh": "G0F是糖谱最高峰；核心岩藻糖水平与FcγRIIIa结合力及ADCC活性呈负相关；需重点关注非岩藻糖基化变体（G0）的比例波动",
      "en": "G0F is the tallest peak in the glycan profile; core fucosylation is inversely correlated with FcγRIIIa binding and ADCC activity; fluctuation of the afucosylated variant (G0) proportion needs close attention"
    },
    "methods": [
      {
        "id": "glycan-g0f-primary-1",
        "name": {
          "zh": "释放N-糖链HILIC-FLD（释放糖链后，用亲水作用色谱分离，荧光检测器定量各糖型峰面积）",
          "en": "Released N-glycan HILIC-FLD (glycans released, separated by hydrophilic-interaction chromatography, quantified by fluorescence detection of glycoform peak areas)"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "释放N-糖链HILIC-FLD（释放糖链后，用亲水作用色谱分离，荧光检测器定量各糖型峰面积）",
          "en": "Released N-glycan HILIC-FLD (glycans released, separated by hydrophilic-interaction chromatography, quantified by fluorescence detection of glycoform peak areas)"
        }
      },
      {
        "id": "glycan-g0f-orthogonal-1",
        "name": {
          "zh": "HILIC-MS（用质谱确认各色谱峰对应的具体糖型身份）",
          "en": "HILIC-MS (MS confirmation of the glycoform identity of each chromatographic peak)"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "HILIC-MS（用质谱确认各色谱峰对应的具体糖型身份）；糖型LC-MS/MS（补充确证，尤其用于区分共洗脱峰）",
          "en": "HILIC-MS (MS confirmation of the glycoform identity of each chromatographic peak); Glycoform LC-MS/MS (supplementary confirmation, especially for co-eluting peaks)"
        }
      },
      {
        "id": "glycan-g0f-orthogonal-2",
        "name": {
          "zh": "糖型LC-MS/MS（补充确证，尤其用于区分共洗脱峰）",
          "en": "Glycoform LC-MS/MS (supplementary confirmation, especially for co-eluting peaks)"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "HILIC-MS（用质谱确认各色谱峰对应的具体糖型身份）；糖型LC-MS/MS（补充确证，尤其用于区分共洗脱峰）",
          "en": "HILIC-MS (MS confirmation of the glycoform identity of each chromatographic peak); Glycoform LC-MS/MS (supplementary confirmation, especially for co-eluting peaks)"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "glycan-g0",
    "category": "ptm-glycosylation",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "N-糖链类型及比例/G0",
      "en": "N-glycan types and proportions / G0"
    },
    "itemName": {
      "zh": "G0糖型比例",
      "en": "G0 glycoform proportion"
    },
    "applicability": {
      "zh": "适用于发生相应糖基化的产品",
      "en": "Applicable to products carrying the corresponding glycosylation"
    },
    "purpose": {
      "zh": "评价候选药与参照药在G0糖型（非岩藻糖基化、无半乳糖修饰）上的相对分布",
      "en": "Assess the relative distribution of the G0 glycoform (afucosylated, agalactosylated) between the candidate and the reference product"
    },
    "detectionIndicators": {
      "zh": "各糖型峰面积百分比（尤其关注G0%、G0F%）；总糖谱图（HILIC色谱图）",
      "en": "Peak area percentage of each glycoform (especially G0%, G0F%); total glycan profile (HILIC chromatogram)"
    },
    "similarityMethod": {
      "zh": "头对头图谱比对 + 定量QR法（参照药均值±Xσ范围，X按风险等级论证）；G0比例须严格控制",
      "en": "Head-to-head profile comparison plus quantitative QR approach (reference mean ± Xσ, X justified by risk tier); the G0 proportion must be strictly controlled"
    },
    "judgingPrinciple": {
      "zh": "G0作为高风险增益糖型，其比例不得显著高于参照药，超标需进行ADCC功能活性验证；主要糖型整体分布应与参照药相似；高风险糖型需更严格评估并关联Fc功能、PK或免疫风险",
      "en": "As a high-risk gain-of-function glycoform, the G0 proportion must not be significantly higher than the reference; exceedance requires ADCC functional verification. Overall glycoform distribution should be similar to the reference; high-risk glycoforms require stricter assessment linked to Fc function, PK or immunogenicity risk"
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。",
      "en": "No universal numerical limit applies to all products. A risk-based quality-range approach may be used: QR = (μR − XσR, μR + XσR); X must be justified according to the risk of the attribute. If a sufficient proportion of batches (e.g. ≥90%) fall within the range, similarity of the attribute can be supported; means, SDs and distributions should also be compared."
    },
    "remark": {
      "zh": "生物类似药应确保G0比例与参照药高度一致；G0比例异常往往是FUT8酶活性改变的信号",
      "en": "A biosimilar should keep the G0 proportion highly consistent with the reference product; abnormal G0 levels often signal altered FUT8 enzyme activity"
    },
    "methods": [
      {
        "id": "glycan-g0-primary-1",
        "name": {
          "zh": "释放N-糖链HILIC-FLD",
          "en": "Released N-glycan HILIC-FLD"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "释放N-糖链HILIC-FLD",
          "en": "Released N-glycan HILIC-FLD"
        }
      },
      {
        "id": "glycan-g0-orthogonal-1",
        "name": {
          "zh": "HILIC-MS",
          "en": "HILIC-MS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "HILIC-MS；糖型LC-MS/MS",
          "en": "HILIC-MS; Glycoform LC-MS/MS"
        }
      },
      {
        "id": "glycan-g0-orthogonal-2",
        "name": {
          "zh": "糖型LC-MS/MS",
          "en": "Glycoform LC-MS/MS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "HILIC-MS；糖型LC-MS/MS",
          "en": "HILIC-MS; Glycoform LC-MS/MS"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "other-n-glycans",
    "category": "ptm-glycosylation",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "N-糖链类型及比例/……",
      "en": "N-glycan types and proportions / others"
    },
    "itemName": {
      "zh": "其他主要/次要N-糖型",
      "en": "Other major/minor N-glycoforms"
    },
    "applicability": {
      "zh": "结合具体品种展开",
      "en": "To be developed based on the specific product"
    },
    "purpose": {
      "zh": "结合具体品种展开",
      "en": "To be developed based on the specific product"
    },
    "detectionIndicators": {
      "zh": "各糖型峰面积%、糖谱",
      "en": "Peak area % of each glycoform, glycan profile"
    },
    "similarityMethod": {
      "zh": "定量QR/实际范围＋图谱比较",
      "en": "Quantitative QR / actual range plus spectral comparison"
    },
    "judgingPrinciple": {
      "zh": "主要糖型种类和整体分布应与参照药相似；高风险糖型需更严格评估，并关联Fc功能、PK或免疫风险。",
      "en": "Major glycoform species and overall distribution should be similar to the reference product; high-risk glycoforms require stricter assessment and should be linked to Fc function, PK or immunogenicity risk."
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。",
      "en": "No universal numerical limit applies to all products. A risk-based quality-range approach may be used: QR = (μR − XσR, μR + XσR); X must be justified according to the risk of the attribute. If a sufficient proportion of batches (e.g. ≥90%) fall within the range, similarity of the attribute can be supported; means, SDs and distributions should also be compared."
    },
    "remark": {
      "zh": "需按产品实际糖谱填写，如G1F、G2F、高甘露糖等。",
      "en": "Fill in according to the product's actual glycan profile, e.g. G1F, G2F, high-mannose species."
    },
    "methods": [
      {
        "id": "other-n-glycans-primary-1",
        "name": {
          "zh": "释放N-糖链HILIC-FLD",
          "en": "Released N-glycan HILIC-FLD"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "释放N-糖链HILIC-FLD；糖型质谱确认",
          "en": "Released N-glycan HILIC-FLD; Glycoform MS confirmation"
        }
      },
      {
        "id": "other-n-glycans-primary-2",
        "name": {
          "zh": "糖型质谱确认",
          "en": "Glycoform MS confirmation"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "释放N-糖链HILIC-FLD；糖型质谱确认",
          "en": "Released N-glycan HILIC-FLD; Glycoform MS confirmation"
        }
      },
      {
        "id": "other-n-glycans-orthogonal-1",
        "name": {
          "zh": "HILIC-MS",
          "en": "HILIC-MS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "HILIC-MS；糖肽LC-MS/MS",
          "en": "HILIC-MS; Glycopeptide LC-MS/MS"
        }
      },
      {
        "id": "other-n-glycans-orthogonal-2",
        "name": {
          "zh": "糖肽LC-MS/MS",
          "en": "Glycopeptide LC-MS/MS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "HILIC-MS；糖肽LC-MS/MS",
          "en": "HILIC-MS; Glycopeptide LC-MS/MS"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "sialic-acid-ngna",
    "category": "ptm-glycosylation",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "唾液酸修饰/NGNA",
      "en": "Sialylation / NGNA"
    },
    "itemName": {
      "zh": "N-羟乙酰神经氨酸（NGNA）",
      "en": "N-glycolylneuraminic acid (NGNA)"
    },
    "applicability": {
      "zh": "适用于发生相应糖基化的产品",
      "en": "Applicable to products carrying the corresponding glycosylation"
    },
    "purpose": {
      "zh": "鉴定并定量NGNA，以监测产品中非人源糖链的水平，从而评估潜在的免疫原性风险。",
      "en": "Identify and quantify NGNA to monitor non-human glycan levels in the product and assess potential immunogenicity risk."
    },
    "detectionIndicators": {
      "zh": "各糖型唾液酸的比例(峰面积%)，或NGNA在总糖链中的含量。",
      "en": "Proportion of each sialylated glycoform (peak area %), or NGNA content within total glycans."
    },
    "similarityMethod": {
      "zh": "定量QR/实际范围＋图谱比较",
      "en": "Quantitative QR / actual range plus spectral comparison"
    },
    "judgingPrinciple": {
      "zh": "若检出NGNA，其含量应与参照药高度一致，并需关联其潜在的Fc功能、PK或免疫风险。",
      "en": "If NGNA is detected, its content should be highly consistent with the reference product and be linked to potential Fc-function, PK or immunogenicity risk."
    },
    "numericLimit": {
      "zh": "无通用统一数值；采用头对头图谱比对 + 质量范围法（QR）进行差异评估",
      "en": "No universal numerical limit; assess differences using head-to-head spectral comparison plus the quality-range (QR) approach"
    },
    "remark": {
      "zh": "NGNA可能涉及非人源糖风险，应关注是否在参照药中存在，并严格比对。唾液酸需经酸水解释放并采用DMB衍生化标记后检测；FLD用于定量，LC-MS用于结构确证。",
      "en": "NGNA may involve non-human glycan risk; check whether it exists in the reference product and compare strictly. Sialic acids are released by acid hydrolysis and labeled by DMB derivatization before detection; FLD for quantification, LC-MS for structural confirmation."
    },
    "methods": [
      {
        "id": "sialic-acid-ngna-primary-1",
        "name": {
          "zh": "释放N-糖链后衍生化HILIC-FLD/LC-MS",
          "en": "Released N-glycan derivatization followed by HILIC-FLD/LC-MS"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "释放N-糖链后衍生化HILIC-FLD/LC-MS",
          "en": "Released N-glycan derivatization followed by HILIC-FLD/LC-MS"
        }
      },
      {
        "id": "sialic-acid-ngna-orthogonal-1",
        "name": {
          "zh": "HILIC-MS",
          "en": "HILIC-MS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "HILIC-MS；糖肽LC-MS/MS等",
          "en": "HILIC-MS; Glycopeptide LC-MS/MS, etc."
        }
      },
      {
        "id": "sialic-acid-ngna-orthogonal-2",
        "name": {
          "zh": "糖肽LC-MS/MS等",
          "en": "Glycopeptide LC-MS/MS, etc."
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "HILIC-MS；糖肽LC-MS/MS等",
          "en": "HILIC-MS; Glycopeptide LC-MS/MS, etc."
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "sialic-acid-nana",
    "category": "ptm-glycosylation",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "唾液酸修饰/NANA",
      "en": "Sialylation / NANA"
    },
    "itemName": {
      "zh": "N-乙酰神经氨酸（NANA）",
      "en": "N-acetylneuraminic acid (NANA)"
    },
    "applicability": {
      "zh": "适用于发生相应糖基化的产品",
      "en": "Applicable to products carrying the corresponding glycosylation"
    },
    "purpose": {
      "zh": "人源型唾液酸的代表性指标，通过头对头比对末端唾液酸化水平（总唾液酸及糖型分布）的相似性",
      "en": "Representative indicator of human-type sialic acid; head-to-head comparison of terminal sialylation levels (total sialic acid and glycoform distribution) for similarity"
    },
    "detectionIndicators": {
      "zh": "总唾液酸化糖型占总N-糖链的百分比；各唾液酸化糖型的相对比例",
      "en": "Percentage of total sialylated glycoforms within total N-glycans; relative proportions of individual sialylated glycoforms"
    },
    "similarityMethod": {
      "zh": "定量QR/实际范围＋图谱比较",
      "en": "Quantitative QR / actual range plus spectral comparison"
    },
    "judgingPrinciple": {
      "zh": "主要糖型种类和整体分布应与参照药相似；高风险糖型需更严格评估，并关联Fc功能、PK或免疫风险。",
      "en": "Major glycoform species and overall distribution should be similar to the reference product; high-risk glycoforms require stricter assessment and should be linked to Fc function, PK or immunogenicity risk."
    },
    "numericLimit": {
      "zh": "无通用统一数值；采用头对头图谱比对 + 质量范围法（QR）进行差异评估",
      "en": "No universal numerical limit; assess differences using head-to-head spectral comparison plus the quality-range (QR) approach"
    },
    "remark": {
      "zh": "常见人源型唾液酸，属于抗体Fc段N-糖链末端的正常修饰；需比较总量及相关糖型分布。",
      "en": "Common human-type sialic acid and a normal terminal modification of antibody Fc N-glycans; total amount and related glycoform distribution should be compared."
    },
    "methods": [
      {
        "id": "sialic-acid-nana-primary-1",
        "name": {
          "zh": "释放N-糖链后衍生化HILIC-FLD/LC-MS",
          "en": "Released N-glycan derivatization followed by HILIC-FLD/LC-MS"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "释放N-糖链后衍生化HILIC-FLD/LC-MS",
          "en": "Released N-glycan derivatization followed by HILIC-FLD/LC-MS"
        }
      },
      {
        "id": "sialic-acid-nana-orthogonal-1",
        "name": {
          "zh": "HILIC-MS",
          "en": "HILIC-MS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "HILIC-MS；糖肽LC-MS/MS等",
          "en": "HILIC-MS; Glycopeptide LC-MS/MS, etc."
        }
      },
      {
        "id": "sialic-acid-nana-orthogonal-2",
        "name": {
          "zh": "糖肽LC-MS/MS等",
          "en": "Glycopeptide LC-MS/MS, etc."
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "HILIC-MS；糖肽LC-MS/MS等",
          "en": "HILIC-MS; Glycopeptide LC-MS/MS, etc."
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "molar-extinction-coefficient",
    "category": "physicochemical",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "摩尔消光系数",
      "en": "Molar extinction coefficient"
    },
    "itemName": {
      "zh": "摩尔消光系数",
      "en": "Molar extinction coefficient"
    },
    "applicability": {
      "zh": "一般适用；仍需结合具体品种评估",
      "en": "Generally applicable; product-specific assessment still required"
    },
    "purpose": {
      "zh": "支持蛋白浓度计算和基本性质表征。",
      "en": "Support protein concentration calculation and basic property characterization."
    },
    "detectionIndicators": {
      "zh": "ε值及测定波长、单位",
      "en": "ε value with measurement wavelength and unit"
    },
    "similarityMethod": {
      "zh": "直接比较/基础参数确认",
      "en": "Direct comparison / confirmation of basic parameters"
    },
    "judgingPrinciple": {
      "zh": "实测值与理论值及参照药结果一致或差异可解释。",
      "en": "Measured values should agree with the theoretical value and the reference results, or the differences should be explainable."
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；不应把仪器吸光度允许误差当作相似性限度。",
      "en": "No universal numerical limit applies to all products; the instrument's allowed absorbance error must not be treated as a similarity limit."
    },
    "remark": {
      "zh": "用于蛋白含量计算和身份/性质说明，通常结合理论计算和实验测定。",
      "en": "Used for protein content calculation and identity/property description, usually combining theoretical calculation with experimental measurement."
    },
    "methods": [
      {
        "id": "molar-extinction-coefficient-primary-1",
        "name": {
          "zh": "UV分光光度法结合蛋白浓度基准方法",
          "en": "UV spectrophotometry combined with a benchmark protein-concentration method"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "UV分光光度法结合蛋白浓度基准方法",
          "en": "UV spectrophotometry combined with a benchmark protein-concentration method"
        }
      },
      {
        "id": "molar-extinction-coefficient-orthogonal-1",
        "name": {
          "zh": "氨基酸分析",
          "en": "Amino acid analysis"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "氨基酸分析；理论序列计算",
          "en": "Amino acid analysis; Theoretical calculation from the sequence"
        }
      },
      {
        "id": "molar-extinction-coefficient-orthogonal-2",
        "name": {
          "zh": "理论序列计算",
          "en": "Theoretical calculation from the sequence"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "氨基酸分析；理论序列计算",
          "en": "Amino acid analysis; Theoretical calculation from the sequence"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "isoelectric-point",
    "category": "physicochemical",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "等电点",
      "en": "Isoelectric point"
    },
    "itemName": {
      "zh": "等电点（pI）",
      "en": "Isoelectric point (pI)"
    },
    "applicability": {
      "zh": "一般适用；仍需结合具体品种评估",
      "en": "Generally applicable; product-specific assessment still required"
    },
    "purpose": {
      "zh": "评价蛋白总体电荷特征和身份。",
      "en": "Assess the overall charge characteristics and identity of the protein."
    },
    "detectionIndicators": {
      "zh": "pI、峰图和异构体分布",
      "en": "pI, peak profile and isoform distribution"
    },
    "similarityMethod": {
      "zh": "图谱比较＋实际范围",
      "en": "Profile comparison plus actual range"
    },
    "judgingPrinciple": {
      "zh": "pI和整体电荷特征应与参照药相似；若为定量结果可结合实际范围。",
      "en": "pI and overall charge characteristics should be similar to the reference; quantitative results may be combined with the actual range."
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。",
      "en": "No universal numerical limit applies to all products. A risk-based quality-range approach may be used: QR = (μR − XσR, μR + XσR); X must be justified according to the risk of the attribute. If a sufficient proportion of batches (e.g. ≥90%) fall within the range, similarity of the attribute can be supported; means, SDs and distributions should also be compared."
    },
    "remark": {
      "zh": "可作为身份和电荷特征参数；与“电荷变异体分布”相关但不等同。",
      "en": "Serves as an identity and charge-characteristic parameter; related to, but not identical with, the charge-variant distribution."
    },
    "methods": [
      {
        "id": "isoelectric-point-primary-1",
        "name": {
          "zh": "icIEF/CIEF",
          "en": "icIEF/CIEF"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "icIEF/CIEF；IEF",
          "en": "icIEF/CIEF; IEF"
        }
      },
      {
        "id": "isoelectric-point-primary-2",
        "name": {
          "zh": "IEF",
          "en": "IEF"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "icIEF/CIEF；IEF",
          "en": "icIEF/CIEF; IEF"
        }
      },
      {
        "id": "isoelectric-point-orthogonal-1",
        "name": {
          "zh": "离子交换色谱",
          "en": "Ion-exchange chromatography"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "离子交换色谱",
          "en": "Ion-exchange chromatography"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "sec-hmw-aggregates",
    "category": "purity-size-variants",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "分子排阻色谱法/聚体",
      "en": "Size-exclusion chromatography / aggregates"
    },
    "itemName": {
      "zh": "高分子量物质/聚集体（HMW）",
      "en": "High-molecular-weight species / aggregates (HMW)"
    },
    "applicability": {
      "zh": "一般适用；仍需结合具体品种评估",
      "en": "Generally applicable; product-specific assessment still required"
    },
    "purpose": {
      "zh": "评价产品中高分子量聚集体（HMW）的含量，以监测产品物理稳定性和免疫原性风险。",
      "en": "Assess the content of high-molecular-weight aggregates (HMW) to monitor physical stability and immunogenicity risk."
    },
    "detectionIndicators": {
      "zh": "HMW峰面积%及图谱",
      "en": "HMW peak area % and chromatogram"
    },
    "similarityMethod": {
      "zh": "定量QR/实际范围＋图谱比较",
      "en": "Quantitative QR / actual range plus spectral comparison"
    },
    "judgingPrinciple": {
      "zh": "候选药不应显示不利增加的聚集体风险；总体分布应受参照药范围支持。",
      "en": "The candidate should not show an unfavorably increased aggregate risk; the overall distribution should be supported by the reference range."
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。",
      "en": "No universal numerical limit applies to all products. A risk-based quality-range approach may be used: QR = (μR − XσR, μR + XσR); X must be justified according to the risk of the attribute. If a sufficient proportion of batches (e.g. ≥90%) fall within the range, similarity of the attribute can be supported; means, SDs and distributions should also be compared."
    },
    "remark": {
      "zh": "指南使用“聚体”；规范化常写聚集体或HMW species。",
      "en": "The guideline uses \"聚体\"; the standardized wording is aggregates or HMW species."
    },
    "methods": [
      {
        "id": "sec-hmw-aggregates-primary-1",
        "name": {
          "zh": "SEC-UV",
          "en": "SEC-UV"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "SEC-UV",
          "en": "SEC-UV"
        }
      },
      {
        "id": "sec-hmw-aggregates-orthogonal-1",
        "name": {
          "zh": "SEC-MALS/AUC/CE-SDS",
          "en": "SEC-MALS/AUC/CE-SDS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "SEC-MALS/AUC/CE-SDS",
          "en": "SEC-MALS/AUC/CE-SDS"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "sec-main-peak-monomer",
    "category": "purity-size-variants",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "分子排阻色谱法/主峰",
      "en": "Size-exclusion chromatography / main peak"
    },
    "itemName": {
      "zh": "SEC主峰/单体",
      "en": "SEC main peak / monomer"
    },
    "applicability": {
      "zh": "一般适用；仍需结合具体品种评估",
      "en": "Generally applicable; product-specific assessment still required"
    },
    "purpose": {
      "zh": "确定候选药与参照药在SEC主峰（单体）纯度上的相似性，间接评估产品中高分子量聚集体和低分子量碎片的整体水平",
      "en": "Determine similarity in SEC main-peak (monomer) purity, indirectly assessing the overall levels of HMW aggregates and LMW fragments"
    },
    "detectionIndicators": {
      "zh": "SEC主峰峰面积百分比（%）、主峰保留时间、图谱",
      "en": "SEC main peak area percentage (%), main peak retention time, chromatogram"
    },
    "similarityMethod": {
      "zh": "定量QR/实际范围＋图谱比较",
      "en": "Quantitative QR / actual range plus spectral comparison"
    },
    "judgingPrinciple": {
      "zh": "单体/主峰分布与参照药总体相似。",
      "en": "Monomer/main-peak distribution should be broadly similar to the reference product."
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。",
      "en": "No universal numerical limit applies to all products. A risk-based quality-range approach may be used: QR = (μR − XσR, μR + XσR); X must be justified according to the risk of the attribute. If a sufficient proportion of batches (e.g. ≥90%) fall within the range, similarity of the attribute can be supported; means, SDs and distributions should also be compared."
    },
    "remark": {
      "zh": "对单抗通常主要对应单体，但应以峰鉴定结果为准。",
      "en": "For mAbs the main peak usually corresponds to the monomer, but peak identification results should prevail."
    },
    "methods": [
      {
        "id": "sec-main-peak-monomer-primary-1",
        "name": {
          "zh": "SEC-UV",
          "en": "SEC-UV"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "SEC-UV",
          "en": "SEC-UV"
        }
      },
      {
        "id": "sec-main-peak-monomer-orthogonal-1",
        "name": {
          "zh": "SEC-MALS/AUC/CE-SDS",
          "en": "SEC-MALS/AUC/CE-SDS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "SEC-MALS/AUC/CE-SDS",
          "en": "SEC-MALS/AUC/CE-SDS"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "sec-lmw-fragments",
    "category": "purity-size-variants",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "分子排阻色谱法/片段",
      "en": "Size-exclusion chromatography / fragments"
    },
    "itemName": {
      "zh": "低分子量物质/片段（LMW）",
      "en": "Low-molecular-weight species / fragments (LMW)"
    },
    "applicability": {
      "zh": "一般适用；仍需结合具体品种评估",
      "en": "Generally applicable; product-specific assessment still required"
    },
    "purpose": {
      "zh": "确定候选药与参照药在低分子量片段（LMW）峰面积及分布上的相似性",
      "en": "Determine similarity in low-molecular-weight fragment (LMW) peak area and distribution between the candidate and the reference product"
    },
    "detectionIndicators": {
      "zh": "LMW峰面积百分比（%）、LMW峰保留时间、全尺寸排阻色谱叠加图谱。",
      "en": "LMW peak area percentage (%), LMW peak retention time, full SEC chromatogram overlay."
    },
    "similarityMethod": {
      "zh": "定量QR/实际范围＋图谱比较",
      "en": "Quantitative QR / actual range plus spectral comparison"
    },
    "judgingPrinciple": {
      "zh": "候选药LMW水平及整体图谱应与参照药相似；若出现参照药图谱中不存在的异常峰，应通过质谱等方法鉴定其结构并评估风险。",
      "en": "The candidate's LMW level and overall profile should be similar to the reference; any abnormal peak absent from the reference profile should be structurally identified (e.g. by MS) and its risk assessed."
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。",
      "en": "No universal numerical limit applies to all products. A risk-based quality-range approach may be used: QR = (μR − XσR, μR + XσR); X must be justified according to the risk of the attribute. If a sufficient proportion of batches (e.g. ≥90%) fall within the range, similarity of the attribute can be supported; means, SDs and distributions should also be compared."
    },
    "remark": {
      "zh": "SEC对部分小片段分离能力有限，可与CE-SDS正交。",
      "en": "SEC has limited resolution for some small fragments and can be used orthogonally with CE-SDS."
    },
    "methods": [
      {
        "id": "sec-lmw-fragments-primary-1",
        "name": {
          "zh": "SEC-UV",
          "en": "SEC-UV"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "SEC-UV",
          "en": "SEC-UV"
        }
      },
      {
        "id": "sec-lmw-fragments-orthogonal-1",
        "name": {
          "zh": "SEC-MALS/AUC/CE-SDS",
          "en": "SEC-MALS/AUC/CE-SDS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "SEC-MALS/AUC/CE-SDS",
          "en": "SEC-MALS/AUC/CE-SDS"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "reduced-ce-sds-hc-lc-purity",
    "category": "purity-size-variants",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "CE-SDS还原电泳法/轻链+重链",
      "en": "Reduced CE-SDS / light + heavy chains"
    },
    "itemName": {
      "zh": "还原CE-SDS重链+轻链纯度",
      "en": "Reduced CE-SDS heavy + light chain purity"
    },
    "applicability": {
      "zh": "主要适用于抗体类产品；非抗体产品需评估适用性",
      "en": "Mainly applicable to antibody products; applicability to non-antibody products needs assessment"
    },
    "purpose": {
      "zh": "确定候选药与参照药在还原条件下轻链（LC）与重链（HC）的峰面积百分比及总纯度，以评估抗体的亚基组成完整性、化学计量比（LC/HC）及非糖基化重链（NGHC）水平",
      "en": "Determine LC and HC peak area percentages and total purity under reducing conditions, assessing subunit integrity, LC/HC stoichiometry and the non-glycosylated heavy chain (NGHC) level"
    },
    "detectionIndicators": {
      "zh": "轻链（LC）峰面积%、重链（HC）峰面积%、总纯度（LC+HC）、轻链/重链峰面积比",
      "en": "Light chain (LC) peak area %, heavy chain (HC) peak area %, total purity (LC+HC), LC/HC peak area ratio"
    },
    "similarityMethod": {
      "zh": "定量QR/实际范围＋图谱比较",
      "en": "Quantitative QR / actual range plus spectral comparison"
    },
    "judgingPrinciple": {
      "zh": "候选药与参照药还原纯度及片段分布相似；新增峰需鉴定来源并评估风险。",
      "en": "Reduced purity and fragment distribution should be similar between candidate and reference; new peaks must be identified and their risk assessed."
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。",
      "en": "No universal numerical limit applies to all products. A risk-based quality-range approach may be used: QR = (μR − XσR, μR + XσR); X must be justified according to the risk of the attribute. If a sufficient proportion of batches (e.g. ≥90%) fall within the range, similarity of the attribute can be supported; means, SDs and distributions should also be compared."
    },
    "remark": {
      "zh": "还原后主要评价重链、轻链及其相关片段。",
      "en": "Under reducing conditions the evaluation focuses on heavy chain, light chain and their related fragments."
    },
    "methods": [
      {
        "id": "reduced-ce-sds-hc-lc-purity-primary-1",
        "name": {
          "zh": "还原CE-SDS",
          "en": "Reduced CE-SDS"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "还原CE-SDS",
          "en": "Reduced CE-SDS"
        }
      },
      {
        "id": "reduced-ce-sds-hc-lc-purity-orthogonal-1",
        "name": {
          "zh": "非还原CE-SDS",
          "en": "Non-reduced CE-SDS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "非还原CE-SDS；SEC；完整分子量LC-MS",
          "en": "Non-reduced CE-SDS; SEC; Intact molecular mass LC-MS"
        }
      },
      {
        "id": "reduced-ce-sds-hc-lc-purity-orthogonal-2",
        "name": {
          "zh": "SEC",
          "en": "SEC"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "非还原CE-SDS；SEC；完整分子量LC-MS",
          "en": "Non-reduced CE-SDS; SEC; Intact molecular mass LC-MS"
        }
      },
      {
        "id": "reduced-ce-sds-hc-lc-purity-orthogonal-3",
        "name": {
          "zh": "完整分子量LC-MS",
          "en": "Intact molecular mass LC-MS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "非还原CE-SDS；SEC；完整分子量LC-MS",
          "en": "Non-reduced CE-SDS; SEC; Intact molecular mass LC-MS"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "reduced-ce-sds-fragments",
    "category": "purity-size-variants",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "CE-SDS还原电泳法/片段",
      "en": "Reduced CE-SDS / fragments"
    },
    "itemName": {
      "zh": "还原CE-SDS片段/杂质",
      "en": "Reduced CE-SDS fragments/impurities"
    },
    "applicability": {
      "zh": "一般适用；仍需结合具体品种评估",
      "en": "Generally applicable; product-specific assessment still required"
    },
    "purpose": {
      "zh": "确定候选药与参照药在还原条件下除轻链和重链主峰外的片段/杂质峰面积及分布上的相似性，以评估产品的亚基结构完整性和对蛋白酶剪切的敏感性",
      "en": "Determine similarity in fragment/impurity peaks (other than the LC/HC main peaks) under reducing conditions, assessing subunit structural integrity and susceptibility to proteolytic clipping"
    },
    "detectionIndicators": {
      "zh": "片段/杂质峰面积百分比（%）、各主要杂质峰的迁移时间、片段分布图谱",
      "en": "Fragment/impurity peak area percentage (%), migration times of major impurity peaks, fragment distribution profile"
    },
    "similarityMethod": {
      "zh": "定量QR/实际范围＋图谱比较",
      "en": "Quantitative QR / actual range plus spectral comparison"
    },
    "judgingPrinciple": {
      "zh": "候选药片段/杂质水平及整体图谱应与参照药相似；若出现参照药图谱中不存在的特有峰，需通过MS或加标实验鉴定其结构并评估风险。",
      "en": "Fragment/impurity levels and the overall profile should be similar to the reference; any candidate-specific peak absent from the reference profile must be structurally identified by MS or spiking experiments and its risk assessed."
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。",
      "en": "No universal numerical limit applies to all products. A risk-based quality-range approach may be used: QR = (μR − XσR, μR + XσR); X must be justified according to the risk of the attribute. If a sufficient proportion of batches (e.g. ≥90%) fall within the range, similarity of the attribute can be supported; means, SDs and distributions should also be compared."
    },
    "remark": {
      "zh": "需明确峰归属及定量方式：通常以迁移时间（MT）进行峰归属；定量方式为峰面积归一化法。",
      "en": "Peak assignment and quantification must be defined: peaks are usually assigned by migration time (MT) and quantified by peak-area normalization."
    },
    "methods": [
      {
        "id": "reduced-ce-sds-fragments-primary-1",
        "name": {
          "zh": "还原CE-SDS",
          "en": "Reduced CE-SDS"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "还原CE-SDS",
          "en": "Reduced CE-SDS"
        }
      },
      {
        "id": "reduced-ce-sds-fragments-orthogonal-1",
        "name": {
          "zh": "SDS-PAGE",
          "en": "SDS-PAGE"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "SDS-PAGE；非还原CE-SDS；SEC",
          "en": "SDS-PAGE; Non-reduced CE-SDS; SEC"
        }
      },
      {
        "id": "reduced-ce-sds-fragments-orthogonal-2",
        "name": {
          "zh": "非还原CE-SDS",
          "en": "Non-reduced CE-SDS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "SDS-PAGE；非还原CE-SDS；SEC",
          "en": "SDS-PAGE; Non-reduced CE-SDS; SEC"
        }
      },
      {
        "id": "reduced-ce-sds-fragments-orthogonal-3",
        "name": {
          "zh": "SEC",
          "en": "SEC"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "SDS-PAGE；非还原CE-SDS；SEC",
          "en": "SDS-PAGE; Non-reduced CE-SDS; SEC"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "non-reduced-ce-sds-main-peak",
    "category": "purity-size-variants",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "CE-SDS非还原电泳法/主峰",
      "en": "Non-reduced CE-SDS / main peak"
    },
    "itemName": {
      "zh": "非还原CE-SDS主峰",
      "en": "Non-reduced CE-SDS main peak"
    },
    "applicability": {
      "zh": "一般适用；仍需结合具体品种评估",
      "en": "Generally applicable; product-specific assessment still required"
    },
    "purpose": {
      "zh": "确定候选药与参照药在非还原条件下完整抗体主峰（~150 kDa）的纯度及峰面积百分比，以评估产品中共价聚集体的水平",
      "en": "Determine purity and peak area percentage of the intact antibody main peak (~150 kDa) under non-reducing conditions, assessing the level of covalent aggregates"
    },
    "detectionIndicators": {
      "zh": "非还原CE-SDS主峰峰面积百分比（%）、主峰迁移时间、全图谱",
      "en": "Non-reduced CE-SDS main peak area percentage (%), main peak migration time, full electropherogram"
    },
    "similarityMethod": {
      "zh": "定量QR/实际范围＋图谱比较",
      "en": "Quantitative QR / actual range plus spectral comparison"
    },
    "judgingPrinciple": {
      "zh": "候选药非还原CE-SDS主峰纯度及整体图谱应与参照药相似；若出现参照药图谱中不存在的、面积超过定量限（LOQ）的新增峰，应优先排除方法伪差，再通过LC-MS/MS或加标实验鉴定其结构，并评估其对ADCC、FcRn结合或免疫原性的潜在影响",
      "en": "Non-reduced main-peak purity and the overall profile should be similar to the reference; for any new peak above LOQ absent from the reference profile, first exclude method artifacts, then identify its structure by LC-MS/MS or spiking, and assess its potential impact on ADCC, FcRn binding or immunogenicity"
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。",
      "en": "No universal numerical limit applies to all products. A risk-based quality-range approach may be used: QR = (μR − XσR, μR + XσR); X must be justified according to the risk of the attribute. If a sufficient proportion of batches (e.g. ≥90%) fall within the range, similarity of the attribute can be supported; means, SDs and distributions should also be compared."
    },
    "remark": {
      "zh": "非还原CE-SDS可检测共价聚集体；与SEC（检测共价+非共价）和还原CE-SDS（检测肽链完整度）联合使用，可形成互补的大小变异体证据。",
      "en": "Non-reduced CE-SDS detects covalent aggregates; combined with SEC (covalent + non-covalent) and reduced CE-SDS (peptide-chain integrity), it provides complementary size-variant evidence."
    },
    "methods": [
      {
        "id": "non-reduced-ce-sds-main-peak-primary-1",
        "name": {
          "zh": "非还原CE-SDS",
          "en": "Non-reduced CE-SDS"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "非还原CE-SDS",
          "en": "Non-reduced CE-SDS"
        }
      },
      {
        "id": "non-reduced-ce-sds-main-peak-orthogonal-1",
        "name": {
          "zh": "SEC",
          "en": "SEC"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "SEC；还原CE-SDS；SDS-PAGE",
          "en": "SEC; Reduced CE-SDS; SDS-PAGE"
        }
      },
      {
        "id": "non-reduced-ce-sds-main-peak-orthogonal-2",
        "name": {
          "zh": "还原CE-SDS",
          "en": "Reduced CE-SDS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "SEC；还原CE-SDS；SDS-PAGE",
          "en": "SEC; Reduced CE-SDS; SDS-PAGE"
        }
      },
      {
        "id": "non-reduced-ce-sds-main-peak-orthogonal-3",
        "name": {
          "zh": "SDS-PAGE",
          "en": "SDS-PAGE"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "SEC；还原CE-SDS；SDS-PAGE",
          "en": "SEC; Reduced CE-SDS; SDS-PAGE"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "non-reduced-ce-sds-fragments",
    "category": "purity-size-variants",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "CE-SDS非还原电泳法/片段",
      "en": "Non-reduced CE-SDS / fragments"
    },
    "itemName": {
      "zh": "非还原CE-SDS片段/杂质",
      "en": "Non-reduced CE-SDS fragments/impurities"
    },
    "applicability": {
      "zh": "一般适用；仍需结合具体品种评估",
      "en": "Generally applicable; product-specific assessment still required"
    },
    "purpose": {
      "zh": "确定候选药与参照药在非还原条件下除完整抗体主峰外共价连接的片段/杂质峰面积及分布上的相似性，以评估产品中二硫键连接异常及共价结构变异体的水平",
      "en": "Determine similarity in covalently linked fragments/impurities (other than the intact main peak) under non-reducing conditions, assessing abnormal disulfide linkage and covalent structural variants"
    },
    "detectionIndicators": {
      "zh": "非还原CE-SDS片段/杂质峰面积百分比（%）、各主要杂质峰的迁移时间、片段分布图谱",
      "en": "Non-reduced CE-SDS fragment/impurity peak area percentage (%), migration times of major impurity peaks, fragment distribution profile"
    },
    "similarityMethod": {
      "zh": "定量QR/实际范围＋图谱比较",
      "en": "Quantitative QR / actual range plus spectral comparison"
    },
    "judgingPrinciple": {
      "zh": "候选药非还原CE-SDS片段/杂质水平及整体图谱应与参照药相似；若出现参照药图谱中不存在的、面积超过定量限（LOQ）的新增峰，应优先排除方法伪差，再通过LC-MS/MS或加标实验鉴定其结构，并评估其对ADCC、FcRn结合或免疫原性的潜在影响",
      "en": "Non-reduced fragment/impurity levels and the overall profile should be similar to the reference; for any new peak above LOQ absent from the reference profile, first exclude method artifacts, then identify its structure by LC-MS/MS or spiking, and assess its potential impact on ADCC, FcRn binding or immunogenicity"
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。",
      "en": "No universal numerical limit applies to all products. A risk-based quality-range approach may be used: QR = (μR − XσR, μR + XσR); X must be justified according to the risk of the attribute. If a sufficient proportion of batches (e.g. ≥90%) fall within the range, similarity of the attribute can be supported; means, SDs and distributions should also be compared."
    },
    "remark": {
      "zh": "非还原CE-SDS检测共价连接的片段/杂质",
      "en": "Non-reduced CE-SDS detects covalently linked fragments/impurities"
    },
    "methods": [
      {
        "id": "non-reduced-ce-sds-fragments-primary-1",
        "name": {
          "zh": "非还原CE-SDS",
          "en": "Non-reduced CE-SDS"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "非还原CE-SDS",
          "en": "Non-reduced CE-SDS"
        }
      },
      {
        "id": "non-reduced-ce-sds-fragments-orthogonal-1",
        "name": {
          "zh": "SEC",
          "en": "SEC"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "SEC；还原CE-SDS；SDS-PAGE",
          "en": "SEC; Reduced CE-SDS; SDS-PAGE"
        }
      },
      {
        "id": "non-reduced-ce-sds-fragments-orthogonal-2",
        "name": {
          "zh": "还原CE-SDS",
          "en": "Reduced CE-SDS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "SEC；还原CE-SDS；SDS-PAGE",
          "en": "SEC; Reduced CE-SDS; SDS-PAGE"
        }
      },
      {
        "id": "non-reduced-ce-sds-fragments-orthogonal-3",
        "name": {
          "zh": "SDS-PAGE",
          "en": "SDS-PAGE"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "SEC；还原CE-SDS；SDS-PAGE",
          "en": "SEC; Reduced CE-SDS; SDS-PAGE"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "acidic-charge-variants",
    "category": "charge-variants",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "电荷变异体/酸区",
      "en": "Charge variants / acidic region"
    },
    "itemName": {
      "zh": "酸性变异体比例",
      "en": "Acidic variant proportion"
    },
    "applicability": {
      "zh": "一般适用；仍需结合具体品种评估",
      "en": "Generally applicable; product-specific assessment still required"
    },
    "purpose": {
      "zh": "作为电荷变异体可比性的关键定量指标，确定候选药与参照药在酸性区电荷变异体的峰面积及分布上的相似性",
      "en": "Key quantitative indicator of charge-variant comparability: determine similarity in acidic-region charge-variant peak areas and distribution"
    },
    "detectionIndicators": {
      "zh": "酸性区峰面积百分比（%）、酸性区各亚峰的保留时间/相对迁移时间、酸性区图谱",
      "en": "Acidic region peak area percentage (%), retention/relative migration times of acidic sub-peaks, acidic-region profile"
    },
    "similarityMethod": {
      "zh": "定量QR/实际范围＋图谱比较",
      "en": "Quantitative QR / actual range plus spectral comparison"
    },
    "judgingPrinciple": {
      "zh": "酸性区分布应与参照药总体相似；若酸性区分布出现显著性偏差，应对酸性区内的关键亚峰进行结构归属",
      "en": "The acidic-region distribution should be broadly similar to the reference; significant deviations require structural assignment of key sub-peaks within the acidic region"
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。",
      "en": "No universal numerical limit applies to all products. A risk-based quality-range approach may be used: QR = (μR − XσR, μR + XσR); X must be justified according to the risk of the attribute. If a sufficient proportion of batches (e.g. ≥90%) fall within the range, similarity of the attribute can be supported; means, SDs and distributions should also be compared."
    },
    "remark": {
      "zh": "“酸区”是多个酸性变异体的总和或区域，需规定峰分组规则。",
      "en": "The \"acidic region\" is the sum/region of multiple acidic variants; peak grouping rules must be specified."
    },
    "methods": [
      {
        "id": "acidic-charge-variants-primary-1",
        "name": {
          "zh": "CEX-HPLC或icIEF",
          "en": "CEX-HPLC or icIEF"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "CEX-HPLC或icIEF",
          "en": "CEX-HPLC or icIEF"
        }
      },
      {
        "id": "acidic-charge-variants-orthogonal-1",
        "name": {
          "zh": "icIEF与CEX正交",
          "en": "icIEF orthogonal to CEX"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "icIEF与CEX正交；峰分离后LC-MS鉴定",
          "en": "icIEF orthogonal to CEX; LC-MS identification after peak fractionation"
        }
      },
      {
        "id": "acidic-charge-variants-orthogonal-2",
        "name": {
          "zh": "峰分离后LC-MS鉴定",
          "en": "LC-MS identification after peak fractionation"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "icIEF与CEX正交；峰分离后LC-MS鉴定",
          "en": "icIEF orthogonal to CEX; LC-MS identification after peak fractionation"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "main-charge-peak",
    "category": "charge-variants",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "电荷变异体/主峰",
      "en": "Charge variants / main peak"
    },
    "itemName": {
      "zh": "主电荷峰比例",
      "en": "Main charge peak proportion"
    },
    "applicability": {
      "zh": "一般适用；仍需结合具体品种评估",
      "en": "Generally applicable; product-specific assessment still required"
    },
    "purpose": {
      "zh": "确定候选药与参照药在电荷变异体主峰（Main Peak）峰面积百分比上的相似性",
      "en": "Determine similarity in the main charge peak (Main Peak) area percentage between the candidate and the reference product"
    },
    "detectionIndicators": {
      "zh": "主峰峰面积百分比（%）、主峰保留时间/等电点、主峰图谱",
      "en": "Main peak area percentage (%), main peak retention time / pI, main-peak profile"
    },
    "similarityMethod": {
      "zh": "定量QR/实际范围＋图谱比较",
      "en": "Quantitative QR / actual range plus spectral comparison"
    },
    "judgingPrinciple": {
      "zh": "主峰和整体电荷分布（酸区+主峰+碱区）应与参照药相似。",
      "en": "The main peak and the overall charge distribution (acidic + main + basic) should be similar to the reference."
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。",
      "en": "No universal numerical limit applies to all products. A risk-based quality-range approach may be used: QR = (μR − XσR, μR + XσR); X must be justified according to the risk of the attribute. If a sufficient proportion of batches (e.g. ≥90%) fall within the range, similarity of the attribute can be supported; means, SDs and distributions should also be compared."
    },
    "remark": {
      "zh": "主峰不是绝对“正确分子”，应结合峰鉴定理解。",
      "en": "The main peak is not necessarily the absolutely \"correct molecule\"; interpret it together with peak identification."
    },
    "methods": [
      {
        "id": "main-charge-peak-primary-1",
        "name": {
          "zh": "CEX-HPLC或icIEF",
          "en": "CEX-HPLC or icIEF"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "CEX-HPLC或icIEF",
          "en": "CEX-HPLC or icIEF"
        }
      },
      {
        "id": "main-charge-peak-orthogonal-1",
        "name": {
          "zh": "icIEF与CEX正交",
          "en": "icIEF orthogonal to CEX"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "icIEF与CEX正交；峰分离后LC-MS鉴定",
          "en": "icIEF orthogonal to CEX; LC-MS identification after peak fractionation"
        }
      },
      {
        "id": "main-charge-peak-orthogonal-2",
        "name": {
          "zh": "峰分离后LC-MS鉴定",
          "en": "LC-MS identification after peak fractionation"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "icIEF与CEX正交；峰分离后LC-MS鉴定",
          "en": "icIEF orthogonal to CEX; LC-MS identification after peak fractionation"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "basic-charge-variants",
    "category": "charge-variants",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "电荷变异体/碱区",
      "en": "Charge variants / basic region"
    },
    "itemName": {
      "zh": "碱性变异体比例",
      "en": "Basic variant proportion"
    },
    "applicability": {
      "zh": "一般适用；仍需结合具体品种评估",
      "en": "Generally applicable; product-specific assessment still required"
    },
    "purpose": {
      "zh": "作为电荷变异体可比性的关键定量指标，确定候选药与参照药在碱区电荷变异体的峰面积及分布上的相似性，评估生产工艺中C端赖氨酸加工、N端焦谷氨酸化等碱性修饰的一致性",
      "en": "Key quantitative indicator of charge-variant comparability: determine similarity in basic-region peak areas and distribution, assessing the consistency of basic modifications such as C-terminal lysine processing and N-terminal pyroglutamation"
    },
    "detectionIndicators": {
      "zh": "碱性区峰面积百分比（%）、碱性区各亚峰的保留时间/相对迁移时间、碱性区图谱",
      "en": "Basic region peak area percentage (%), retention/relative migration times of basic sub-peaks, basic-region profile"
    },
    "similarityMethod": {
      "zh": "定量QR/实际范围＋图谱比较",
      "en": "Quantitative QR / actual range plus spectral comparison"
    },
    "judgingPrinciple": {
      "zh": "候选药碱性区峰面积百分比及整体图谱应与参照药相似；若碱性区分布出现显著性偏差（超出QR范围），应对碱性区内的关键亚峰进行结构归属（如通过肽图LC-MS/MS确认C端赖氨酸残留或N端焦谷氨酸化程度）",
      "en": "Basic-region peak area percentage and the overall profile should be similar to the reference; significant deviations (beyond the QR range) require structural assignment of key basic sub-peaks (e.g. confirming C-terminal lysine retention or N-terminal pyroglutamation by peptide mapping LC-MS/MS)"
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。",
      "en": "No universal numerical limit applies to all products. A risk-based quality-range approach may be used: QR = (μR − XσR, μR + XσR); X must be justified according to the risk of the attribute. If a sufficient proportion of batches (e.g. ≥90%) fall within the range, similarity of the attribute can be supported; means, SDs and distributions should also be compared."
    },
    "remark": {
      "zh": "碱性区通常由C端赖氨酸不完全加工、N端焦谷氨酸化不完全等修饰引起；与酸性区（脱酰胺、唾液酸化）共同构成电荷变异体的完整评价。",
      "en": "The basic region usually arises from incomplete C-terminal lysine processing and incomplete N-terminal pyroglutamation; together with the acidic region (deamidation, sialylation) it completes the charge-variant evaluation."
    },
    "methods": [
      {
        "id": "basic-charge-variants-primary-1",
        "name": {
          "zh": "CEX-HPLC或icIEF",
          "en": "CEX-HPLC or icIEF"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "CEX-HPLC或icIEF",
          "en": "CEX-HPLC or icIEF"
        }
      },
      {
        "id": "basic-charge-variants-orthogonal-1",
        "name": {
          "zh": "icIEF与CEX正交",
          "en": "icIEF orthogonal to CEX"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "icIEF与CEX正交；峰分离后LC-MS鉴定",
          "en": "icIEF orthogonal to CEX; LC-MS identification after peak fractionation"
        }
      },
      {
        "id": "basic-charge-variants-orthogonal-2",
        "name": {
          "zh": "峰分离后LC-MS鉴定",
          "en": "LC-MS identification after peak fractionation"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "icIEF与CEX正交；峰分离后LC-MS鉴定",
          "en": "icIEF orthogonal to CEX; LC-MS identification after peak fractionation"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "target-binding-activity",
    "category": "binding-bioactivity",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "结合活性",
      "en": "Binding activity"
    },
    "itemName": {
      "zh": "靶标/抗原结合活性",
      "en": "Target/antigen binding activity"
    },
    "applicability": {
      "zh": "一般适用；仍需结合具体品种评估",
      "en": "Generally applicable; product-specific assessment still required"
    },
    "purpose": {
      "zh": "确认Fab相关靶标识别和亲和特征。",
      "en": "Confirm Fab-related target recognition and affinity characteristics."
    },
    "detectionIndicators": {
      "zh": "KD、ka、kd或相对结合活性%",
      "en": "KD, ka, kd or relative binding activity %"
    },
    "similarityMethod": {
      "zh": "定量QR；候选药与参照药的结合活性比值应落在预设的等效性范围内",
      "en": "Quantitative QR; the candidate-to-reference binding activity ratio should fall within the predefined equivalence margin"
    },
    "judgingPrinciple": {
      "zh": "结合动力学和/或相对结合活性满足预设标准，且曲线和机制解释一致。",
      "en": "Binding kinetics and/or relative binding activity meet predefined criteria, with consistent curves and mechanistic interpretation."
    },
    "numericLimit": {
      "zh": "无通用统一数值限度；等效性界值需在实验前预设（如80%-125%），并在相同实验条件下进行头对头验证；剂量-响应曲线形状及机制解释应与参照药一致。",
      "en": "No universal numerical limit; the equivalence margin must be predefined before the experiment (e.g. 80%–125%) and verified head-to-head under identical conditions; dose-response curve shape and mechanistic interpretation should be consistent with the reference."
    },
    "remark": {
      "zh": "通常指Fab相关靶标结合；具体方法依作用机制确定。",
      "en": "Usually refers to Fab-related target binding; the specific method depends on the mechanism of action."
    },
    "methods": [
      {
        "id": "target-binding-activity-primary-1",
        "name": {
          "zh": "SPR（表面等离子体共振）/BLI（生物膜层干涉技术）",
          "en": "SPR (surface plasmon resonance) / BLI (biolayer interferometry)"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "SPR（表面等离子体共振）/BLI（生物膜层干涉技术）",
          "en": "SPR (surface plasmon resonance) / BLI (biolayer interferometry)"
        }
      },
      {
        "id": "target-binding-activity-orthogonal-1",
        "name": {
          "zh": "ELISA（用于相对结合活性定量）或基于细胞的结合测定（如流式细胞术）",
          "en": "ELISA (for relative binding-activity quantification) or cell-based binding assays (e.g. flow cytometry)"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "ELISA（用于相对结合活性定量）或基于细胞的结合测定（如流式细胞术）",
          "en": "ELISA (for relative binding-activity quantification) or cell-based binding assays (e.g. flow cytometry)"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "moa-related-bioactivity",
    "category": "binding-bioactivity",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "生物学活性",
      "en": "Biological activity"
    },
    "itemName": {
      "zh": "机制相关生物学活性/相对效价",
      "en": "MoA-related biological activity / relative potency"
    },
    "applicability": {
      "zh": "一般适用；仍需结合具体品种评估",
      "en": "Generally applicable; product-specific assessment still required"
    },
    "purpose": {
      "zh": "评价与临床作用机制相关的体外功能。",
      "en": "Assess in-vitro functions related to the clinical mechanism of action."
    },
    "detectionIndicators": {
      "zh": "相对效价%、EC50/IC50",
      "en": "Relative potency %, EC50/IC50"
    },
    "similarityMethod": {
      "zh": "90%置信区间等效性检验；剂量-响应曲线平行性分析",
      "en": "90% confidence-interval equivalence testing; dose-response curve parallelism analysis"
    },
    "judgingPrinciple": {
      "zh": "候选药与参照药的相对效价应通过预设等效性检验（；若存在多重作用机制（MoA），应对每种相关机制分别进行活性评价，且所有结果均需落在等效性界值内；剂量-响应曲线应呈现平行性，以验证作用机制的一致性。",
      "en": "The candidate's relative potency should pass the predefined equivalence test; if multiple mechanisms of action (MoA) exist, each relevant mechanism must be evaluated separately and all results must fall within the equivalence margin; dose-response curves should be parallel to verify MoA consistency."
    },
    "numericLimit": {
      "zh": "无通用统一数值限度；对与MoA直接相关的生物学活性，应采用预设等效性界值（如80%-125%）进行评价；界值选择需基于产品作用机制及临床相关性论证。",
      "en": "No universal numerical limit; biological activities directly related to the MoA should be evaluated with a predefined equivalence margin (e.g. 80%–125%); margin selection must be justified by the product's MoA and clinical relevance."
    },
    "remark": {
      "zh": "生物学活性反映的是结合靶标后产生的功能性效应（如信号激活、细胞杀伤、增殖抑制等），与结合活性（亲和力）共同构成Fab段功能的完整评价体系。",
      "en": "Biological activity reflects the functional effect after target binding (e.g. signal activation, cell killing, growth inhibition); together with binding activity (affinity) it completes the Fab functional evaluation."
    },
    "methods": [
      {
        "id": "moa-related-bioactivity-primary-1",
        "name": {
          "zh": "机制相关细胞效价试验/酶学功能试验",
          "en": "MoA-related cell-based potency assay / enzymatic functional assay"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "机制相关细胞效价试验/酶学功能试验",
          "en": "MoA-related cell-based potency assay / enzymatic functional assay"
        }
      },
      {
        "id": "moa-related-bioactivity-orthogonal-1",
        "name": {
          "zh": "不同原理的细胞效应检测方法（如报告基因、 细胞增殖抑制、流式细胞术检测）",
          "en": "Cell-based effect assays of different principles (e.g. reporter gene, cell-proliferation inhibition, flow cytometry)"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "不同原理的细胞效应检测方法（如报告基因、 细胞增殖抑制、流式细胞术检测）；或酶学活性检测（若首选为细胞法，则酶学法可作为正交）",
          "en": "Cell-based effect assays of different principles (e.g. reporter gene, cell-proliferation inhibition, flow cytometry); Or enzymatic activity assays (if the primary method is cell-based, the enzymatic assay can serve as orthogonal)"
        }
      },
      {
        "id": "moa-related-bioactivity-orthogonal-2",
        "name": {
          "zh": "或酶学活性检测（若首选为细胞法，则酶学法可作为正交）",
          "en": "Or enzymatic activity assays (if the primary method is cell-based, the enzymatic assay can serve as orthogonal)"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "不同原理的细胞效应检测方法（如报告基因、 细胞增殖抑制、流式细胞术检测）；或酶学活性检测（若首选为细胞法，则酶学法可作为正交）",
          "en": "Cell-based effect assays of different principles (e.g. reporter gene, cell-proliferation inhibition, flow cytometry); Or enzymatic activity assays (if the primary method is cell-based, the enzymatic assay can serve as orthogonal)"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "fcgri-cd64-binding",
    "category": "binding-bioactivity",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "与FcγRI结合力",
      "en": "FcγRI binding"
    },
    "itemName": {
      "zh": "FcγRI（CD64）结合活力",
      "en": "FcγRI (CD64) binding activity"
    },
    "applicability": {
      "zh": "主要适用于抗体类产品；非抗体产品需评估适用性",
      "en": "Mainly applicable to antibody products; applicability to non-antibody products needs assessment"
    },
    "purpose": {
      "zh": "确定候选药与参照药在FcγRI（CD64）结合亲和力（KD）及动力学参数（ka、kd）上的相似性，FcγRI结合可作为Fc受体结合谱的一部分，作为ADCP（抗体依赖性细胞吞噬作用）和免疫复合物清除相关功能的补充证据。",
      "en": "Determine similarity in FcγRI (CD64) binding affinity (KD) and kinetics (ka, kd); FcγRI binding forms part of the Fc-receptor binding profile as supplementary evidence for ADCP (antibody-dependent cellular phagocytosis) and immune-complex clearance functions."
    },
    "detectionIndicators": {
      "zh": "KD、ka、kd或相对结合活性%",
      "en": "KD, ka, kd or relative binding activity %"
    },
    "similarityMethod": {
      "zh": "定量QR分析 + 90%置信区间等效性检验；候选药与参照药的结合活性比值（或KD比值）应落在预设的等效性范围内。",
      "en": "Quantitative QR analysis plus 90% confidence-interval equivalence testing; the candidate-to-reference binding activity ratio (or KD ratio) should fall within the predefined equivalence margin."
    },
    "judgingPrinciple": {
      "zh": "候选药与参照药的结合亲和力（KD、ka、kd）及/或相对结合活性上应呈现相似性；采用QR法或90%置信区间法进行统计学评价，若相对结合活性（或KD比值）的90%置信区间完全落在预设等效性界值内，且动力学谱图与参照药一致，则判定为结合力相似",
      "en": "Candidate and reference should show similarity in binding affinity (KD, ka, kd) and/or relative binding activity; evaluate statistically using the QR approach or the 90% confidence-interval approach. If the 90% CI of the relative binding activity (or KD ratio) falls entirely within the predefined equivalence margin and the kinetic profiles are consistent with the reference product, binding is judged similar"
    },
    "numericLimit": {
      "zh": "无通用统一KD绝对值限度；相对结合活性%应采用预设等效性界值（如80%-125%），在相同实验条件下进行头对头验证；界值需基于方法变异和参照药批间变异进行论证。",
      "en": "No universal absolute KD limit; relative binding activity (%) should use a predefined equivalence margin (e.g. 80%–125%), verified head-to-head under identical experimental conditions; the margin must be justified based on method variability and reference batch-to-batch variability."
    },
    "remark": {
      "zh": "FcγRI（CD64）结合力主要反映抗体介导ADCP（抗体依赖性细胞吞噬作用）和免疫复合物清除的潜力；其关键性取决于产品作用机制（MoA）是否需要巨噬细胞参与清除靶细胞。",
      "en": "FcγRI (CD64) binding mainly reflects the potential to mediate ADCP and immune-complex clearance; its criticality depends on whether the product's MoA requires macrophage-mediated clearance of target cells."
    },
    "methods": [
      {
        "id": "fcgri-cd64-binding-primary-1",
        "name": {
          "zh": "SPR（表面等离子体共振）",
          "en": "SPR (surface plasmon resonance)"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "SPR（表面等离子体共振）",
          "en": "SPR (surface plasmon resonance)"
        }
      },
      {
        "id": "fcgri-cd64-binding-orthogonal-1",
        "name": {
          "zh": "ELISA",
          "en": "ELISA"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "ELISA；BLI；细胞/功能试验（如ADCP）可作为生物学活性补充。",
          "en": "ELISA; BLI; Cell-based/functional assays (e.g. ADCP) as biological-activity supplements."
        }
      },
      {
        "id": "fcgri-cd64-binding-orthogonal-2",
        "name": {
          "zh": "BLI",
          "en": "BLI"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "ELISA；BLI；细胞/功能试验（如ADCP）可作为生物学活性补充。",
          "en": "ELISA; BLI; Cell-based/functional assays (e.g. ADCP) as biological-activity supplements."
        }
      },
      {
        "id": "fcgri-cd64-binding-orthogonal-3",
        "name": {
          "zh": "细胞/功能试验（如ADCP）可作为生物学活性补充。",
          "en": "Cell-based/functional assays (e.g. ADCP) as biological-activity supplements."
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "ELISA；BLI；细胞/功能试验（如ADCP）可作为生物学活性补充。",
          "en": "ELISA; BLI; Cell-based/functional assays (e.g. ADCP) as biological-activity supplements."
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "fcgriia-cd32a-binding",
    "category": "binding-bioactivity",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "与FcγRIIa结合力",
      "en": "FcγRIIa binding"
    },
    "itemName": {
      "zh": "FcγRIIa（CD32a）结合活力",
      "en": "FcγRIIa (CD32a) binding activity"
    },
    "applicability": {
      "zh": "主要适用于抗体类产品；非抗体产品需评估适用性",
      "en": "Mainly applicable to antibody products; applicability to non-antibody products needs assessment"
    },
    "purpose": {
      "zh": "确定候选药与参照药在FcγRIIa（CD32a）结合亲和力（KD）及动力学参数（ka、kd）上的相似性，以评估与ADCP、免疫复合物处理、血小板活化的潜在能力。",
      "en": "Determine similarity in FcγRIIa (CD32a) binding affinity (KD) and kinetics (ka, kd), assessing the potential for ADCP, immune-complex handling and platelet activation."
    },
    "detectionIndicators": {
      "zh": "KD、ka、kd或相对结合活性%",
      "en": "KD, ka, kd or relative binding activity %"
    },
    "similarityMethod": {
      "zh": "定量QR分析 + 90%置信区间等效性检验；候选药与参照药的结合活性比值（或KD比值）应落在预设的等效性范围内。",
      "en": "Quantitative QR analysis plus 90% confidence-interval equivalence testing; the candidate-to-reference binding activity ratio (or KD ratio) should fall within the predefined equivalence margin."
    },
    "judgingPrinciple": {
      "zh": "候选药与参照药的结合亲和力（KD、ka、kd）及/或相对结合活性上应呈现相似性；采用QR法或90%置信区间法进行统计学评价，若相对结合活性（或KD比值）的90%置信区间完全落在预设等效性界值内，且动力学谱图与参照药一致，则判定为结合力相似",
      "en": "Candidate and reference should show similarity in binding affinity (KD, ka, kd) and/or relative binding activity; evaluate statistically using the QR approach or the 90% confidence-interval approach. If the 90% CI of the relative binding activity (or KD ratio) falls entirely within the predefined equivalence margin and the kinetic profiles are consistent with the reference product, binding is judged similar"
    },
    "numericLimit": {
      "zh": "无通用统一KD绝对值限度；相对结合活性%应采用预设等效性界值（如80%-125%），在相同实验条件下进行头对头验证；界值需基于方法变异和参照药批间变异进行论证。",
      "en": "No universal absolute KD limit; relative binding activity (%) should use a predefined equivalence margin (e.g. 80%–125%), verified head-to-head under identical experimental conditions; the margin must be justified based on method variability and reference batch-to-batch variability."
    },
    "remark": {
      "zh": "FcγRIIa（CD32a）是低亲和力活化型Fcγ受体，主要表达于血小板、单核细胞和巨噬细胞；其结合力反映抗体介导免疫复合物清除及血小板活化的潜在风险；是否作为关键属性取决于产品作用机制（MoA）及临床安全性关注点，如FcγRIIa结合与产品作用机制相关，应考虑分别评价131H和131R多态性变体。",
      "en": "FcγRIIa (CD32a) is a low-affinity activating Fcγ receptor expressed mainly on platelets, monocytes and macrophages; its binding reflects the potential for immune-complex clearance and platelet-activation risk. Whether it is a critical attribute depends on the MoA and clinical safety concerns; if relevant to the MoA, the 131H and 131R polymorphic variants should be evaluated separately."
    },
    "methods": [
      {
        "id": "fcgriia-cd32a-binding-primary-1",
        "name": {
          "zh": "SPR（表面等离子体共振）",
          "en": "SPR (surface plasmon resonance)"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "SPR（表面等离子体共振）",
          "en": "SPR (surface plasmon resonance)"
        }
      },
      {
        "id": "fcgriia-cd32a-binding-orthogonal-1",
        "name": {
          "zh": "ELISA",
          "en": "ELISA"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "ELISA；BLI；细胞/功能试验（如血小板活化测定）可作为生物学活性补充。",
          "en": "ELISA; BLI; Cell-based/functional assays (e.g. platelet-activation assay) as biological-activity supplements."
        }
      },
      {
        "id": "fcgriia-cd32a-binding-orthogonal-2",
        "name": {
          "zh": "BLI",
          "en": "BLI"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "ELISA；BLI；细胞/功能试验（如血小板活化测定）可作为生物学活性补充。",
          "en": "ELISA; BLI; Cell-based/functional assays (e.g. platelet-activation assay) as biological-activity supplements."
        }
      },
      {
        "id": "fcgriia-cd32a-binding-orthogonal-3",
        "name": {
          "zh": "细胞/功能试验（如血小板活化测定）可作为生物学活性补充。",
          "en": "Cell-based/functional assays (e.g. platelet-activation assay) as biological-activity supplements."
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "ELISA；BLI；细胞/功能试验（如血小板活化测定）可作为生物学活性补充。",
          "en": "ELISA; BLI; Cell-based/functional assays (e.g. platelet-activation assay) as biological-activity supplements."
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "fcgriib-cd32b-binding",
    "category": "binding-bioactivity",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "与FcγRIIb结合力（KD，M）",
      "en": "FcγRIIb binding (KD, M)"
    },
    "itemName": {
      "zh": "FcγRIIb（CD32b）结合活力",
      "en": "FcγRIIb (CD32b) binding activity"
    },
    "applicability": {
      "zh": "主要适用于抗体类产品；非抗体产品需评估适用性",
      "en": "Mainly applicable to antibody products; applicability to non-antibody products needs assessment"
    },
    "purpose": {
      "zh": "确定候选药与参照药在FcγRIIb（CD32b）结合亲和力（KD）及动力学参数（ka、kd）上的相似性，以评估产品与抑制性Fc受体结合的潜在能力",
      "en": "Determine similarity in FcγRIIb (CD32b) binding affinity (KD) and kinetics (ka, kd), assessing the product's potential to bind the inhibitory Fc receptor"
    },
    "detectionIndicators": {
      "zh": "KD、ka、kd或相对结合活性%",
      "en": "KD, ka, kd or relative binding activity %"
    },
    "similarityMethod": {
      "zh": "定量QR分析 + 90%置信区间等效性检验；候选药与参照药的结合活性比值（或KD比值）应落在预设的等效性范围内。",
      "en": "Quantitative QR analysis plus 90% confidence-interval equivalence testing; the candidate-to-reference binding activity ratio (or KD ratio) should fall within the predefined equivalence margin."
    },
    "judgingPrinciple": {
      "zh": "候选药与参照药的结合亲和力（KD、ka、kd）及/或相对结合活性上应呈现相似性；采用QR法或90%置信区间法进行统计学评价，若相对结合活性（或KD比值）的90%置信区间完全落在预设等效性界值内，且动力学谱图与参照药一致，则判定为结合力相似",
      "en": "Candidate and reference should show similarity in binding affinity (KD, ka, kd) and/or relative binding activity; evaluate statistically using the QR approach or the 90% confidence-interval approach. If the 90% CI of the relative binding activity (or KD ratio) falls entirely within the predefined equivalence margin and the kinetic profiles are consistent with the reference product, binding is judged similar"
    },
    "numericLimit": {
      "zh": "无通用统一KD绝对值限度；相对结合活性%应采用预设等效性界值（如80%-125%），在相同实验条件下进行头对头验证；界值需基于方法变异和参照药批间变异进行论证。",
      "en": "No universal absolute KD limit; relative binding activity (%) should use a predefined equivalence margin (e.g. 80%–125%), verified head-to-head under identical experimental conditions; the margin must be justified based on method variability and reference batch-to-batch variability."
    },
    "remark": {
      "zh": "FcγRIIb（CD32b）是目前已知唯一的抑制性Fcγ受体，主要表达于B细胞、树突状细胞、巨噬细胞等，在调控B细胞活化、维持免疫耐受及抑制炎症反应中发挥关键作用",
      "en": "FcγRIIb (CD32b) is the only known inhibitory Fcγ receptor, expressed mainly on B cells, dendritic cells and macrophages, playing key roles in regulating B-cell activation, maintaining immune tolerance and suppressing inflammation"
    },
    "methods": [
      {
        "id": "fcgriib-cd32b-binding-primary-1",
        "name": {
          "zh": "SPR（表面等离子体共振）",
          "en": "SPR (surface plasmon resonance)"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "SPR（表面等离子体共振）",
          "en": "SPR (surface plasmon resonance)"
        }
      },
      {
        "id": "fcgriib-cd32b-binding-orthogonal-1",
        "name": {
          "zh": "ELISA",
          "en": "ELISA"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "ELISA；BLI；细胞水平结合实验可作为补充。",
          "en": "ELISA; BLI; Cell-level binding assays as supplements."
        }
      },
      {
        "id": "fcgriib-cd32b-binding-orthogonal-2",
        "name": {
          "zh": "BLI",
          "en": "BLI"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "ELISA；BLI；细胞水平结合实验可作为补充。",
          "en": "ELISA; BLI; Cell-level binding assays as supplements."
        }
      },
      {
        "id": "fcgriib-cd32b-binding-orthogonal-3",
        "name": {
          "zh": "细胞水平结合实验可作为补充。",
          "en": "Cell-level binding assays as supplements."
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "ELISA；BLI；细胞水平结合实验可作为补充。",
          "en": "ELISA; BLI; Cell-level binding assays as supplements."
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "fcgriiia-cd16a-binding",
    "category": "binding-bioactivity",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "与FcγRIIIa结合力（KD，M）",
      "en": "FcγRIIIa binding (KD, M)"
    },
    "itemName": {
      "zh": "FcγRIIIa（CD16a）结合活力",
      "en": "FcγRIIIa (CD16a) binding activity"
    },
    "applicability": {
      "zh": "主要适用于抗体类产品；非抗体产品需评估适用性",
      "en": "Mainly applicable to antibody products; applicability to non-antibody products needs assessment"
    },
    "purpose": {
      "zh": "确定候选药与参照药在FcγRIIIa（CD16a）结合亲和力（KD）及动力学参数（ka、kd）上的相似性，以评估产品介导ADCC（抗体依赖性细胞介导的细胞毒作用）的潜在能力",
      "en": "Determine similarity in FcγRIIIa (CD16a) binding affinity (KD) and kinetics (ka, kd), assessing the product's potential to mediate ADCC (antibody-dependent cell-mediated cytotoxicity)"
    },
    "detectionIndicators": {
      "zh": "KD、ka、kd或相对结合活性%",
      "en": "KD, ka, kd or relative binding activity %"
    },
    "similarityMethod": {
      "zh": "定量QR分析 + 90%置信区间等效性检验；候选药与参照药的结合活性比值（或KD比值）应落在预设的等效性范围内。",
      "en": "Quantitative QR analysis plus 90% confidence-interval equivalence testing; the candidate-to-reference binding activity ratio (or KD ratio) should fall within the predefined equivalence margin."
    },
    "judgingPrinciple": {
      "zh": "候选药与参照药的结合亲和力（KD、ka、kd）及/或相对结合活性上应呈现相似性；采用QR法或90%置信区间法进行统计学评价，若相对结合活性（或KD比值）的90%置信区间完全落在预设等效性界值内，且动力学谱图与参照药一致，则判定为结合力相似。应分别评价158V和158F变体；并结合无岩藻糖糖型及ADCC功能数据综合解释。",
      "en": "Candidate and reference should show similarity in binding affinity (KD, ka, kd) and/or relative binding activity; evaluate statistically using the QR approach or the 90% confidence-interval approach. If the 90% CI of the relative binding activity (or KD ratio) falls entirely within the predefined equivalence margin and the kinetic profiles are consistent with the reference product, binding is judged similar. The 158V and 158F variants should be evaluated separately, interpreted together with afucosylated glycoform and ADCC functional data."
    },
    "numericLimit": {
      "zh": "无通用统一KD绝对值限度；相对结合活性%应采用预设等效性界值，在相同实验条件下进行头对头验证；若使用不同FcγRIIIa多态性变体，应分别设定等效性界值并独立评价",
      "en": "No universal absolute KD limit; relative binding activity (%) should use a predefined equivalence margin verified head-to-head under identical conditions; if different FcγRIIIa polymorphic variants are used, equivalence margins should be set and evaluated independently for each"
    },
    "remark": {
      "zh": "FcγRIIIa（CD16a）是表达于NK细胞表面的低亲和力活化型Fcγ受体，是介导ADCC效应的核心受体；核心岩藻糖水平与FcγRIIIa结合力及ADCC活性呈负相关；同时需关注FcγRIIIa基因多态性（158V/F）对结合力的影响",
      "en": "FcγRIIIa (CD16a) is a low-affinity activating Fcγ receptor on NK cells and the core receptor mediating ADCC; core fucosylation is inversely correlated with FcγRIIIa binding and ADCC activity; the impact of the FcγRIIIa 158V/F polymorphism on binding also needs attention"
    },
    "methods": [
      {
        "id": "fcgriiia-cd16a-binding-primary-1",
        "name": {
          "zh": "SPR（表面等离子体共振）",
          "en": "SPR (surface plasmon resonance)"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "SPR（表面等离子体共振）",
          "en": "SPR (surface plasmon resonance)"
        }
      },
      {
        "id": "fcgriiia-cd16a-binding-orthogonal-1",
        "name": {
          "zh": "ELISA",
          "en": "ELISA"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "ELISA；BLI；细胞水平结合实验可作为补充。",
          "en": "ELISA; BLI; Cell-level binding assays as supplements."
        }
      },
      {
        "id": "fcgriiia-cd16a-binding-orthogonal-2",
        "name": {
          "zh": "BLI",
          "en": "BLI"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "ELISA；BLI；细胞水平结合实验可作为补充。",
          "en": "ELISA; BLI; Cell-level binding assays as supplements."
        }
      },
      {
        "id": "fcgriiia-cd16a-binding-orthogonal-3",
        "name": {
          "zh": "细胞水平结合实验可作为补充。",
          "en": "Cell-level binding assays as supplements."
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "ELISA；BLI；细胞水平结合实验可作为补充。",
          "en": "ELISA; BLI; Cell-level binding assays as supplements."
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "fcrn-binding",
    "category": "binding-bioactivity",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "与FcRn的结合力（KD，M）",
      "en": "FcRn binding (KD, M)"
    },
    "itemName": {
      "zh": "FcRn（新生儿Fc受体）结合活力",
      "en": "FcRn (neonatal Fc receptor) binding activity"
    },
    "applicability": {
      "zh": "主要适用于抗体类产品；非抗体产品需评估适用性",
      "en": "Mainly applicable to antibody products; applicability to non-antibody products needs assessment"
    },
    "purpose": {
      "zh": "确定候选药与参照药在FcRn结合亲和力（KD）及动力学参数（ka、kd）上的相似性，以评估产品在体内被FcRn介导的再循环保护机制所“挽救”的效率，从而间接预测其血清半衰期（PK）的相似性",
      "en": "Determine similarity in FcRn binding affinity (KD) and kinetics (ka, kd), assessing how efficiently the product is \"rescued\" by FcRn-mediated recycling in vivo, thereby indirectly predicting serum half-life (PK) similarity"
    },
    "detectionIndicators": {
      "zh": "KD、ka、kd或相对结合活性（%）",
      "en": "KD, ka, kd or relative binding activity (%)"
    },
    "similarityMethod": {
      "zh": "同上，重点比较酸性条件下的结合特征以及接近中性条件下的解离/低结合行为，确认候选药与参照药具有相似的pH依赖性。",
      "en": "As above, focusing on binding characteristics under acidic conditions and dissociation/low binding near neutral pH, confirming that candidate and reference share similar pH dependence."
    },
    "judgingPrinciple": {
      "zh": "候选药与参照药的结合亲和力（KD、ka、kd）及/或相对结合活性上应呈现相似性；采用QR法或90%置信区间法进行统计学评价，若相对结合活性（或KD比值）的90%置信区间完全落在预设等效性界值内，且动力学谱图与参照药一致，则判定为结合力相似",
      "en": "Candidate and reference should show similarity in binding affinity (KD, ka, kd) and/or relative binding activity; evaluate statistically using the QR approach or the 90% confidence-interval approach. If the 90% CI of the relative binding activity (or KD ratio) falls entirely within the predefined equivalence margin and the kinetic profiles are consistent with the reference product, binding is judged similar"
    },
    "numericLimit": {
      "zh": "无通用统一KD绝对值限度；相对结合活性%应采用预设等效性界值，在相同实验条件下进行头对头验证；pH 6.0和pH 7.4两个条件需分别设定等效性界值并独立评价。",
      "en": "No universal absolute KD limit; relative binding activity (%) should use a predefined equivalence margin verified head-to-head under identical conditions; equivalence margins for pH 6.0 and pH 7.4 must be set and evaluated independently."
    },
    "remark": {
      "zh": "FcRn与抗体Fc段的结合具有严格的pH依赖性——在酸性（pH 6.0）条件下结合，在中性（pH 7.4）条件下释放。该pH依赖性的结合-释放循环是抗体被从胞内体“挽救”回血液循环、避免被溶酶体降解的关键机制。",
      "en": "FcRn-Fc binding is strictly pH-dependent — binding at acidic pH 6.0 and release at neutral pH 7.4. This pH-dependent bind-release cycle is the key mechanism by which antibodies are rescued from endosomes back into circulation, avoiding lysosomal degradation."
    },
    "methods": [
      {
        "id": "fcrn-binding-primary-1",
        "name": {
          "zh": "SPR（表面等离子体共振）",
          "en": "SPR (surface plasmon resonance)"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "SPR（表面等离子体共振）",
          "en": "SPR (surface plasmon resonance)"
        }
      },
      {
        "id": "fcrn-binding-orthogonal-1",
        "name": {
          "zh": "BLI",
          "en": "BLI"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "BLI；FcRn亲和层析；TR-FRET（时间分辨荧光能量转移）；细胞水平的FcRn再循环报告基因测定可作为功能正交补充。",
          "en": "BLI; FcRn affinity chromatography; TR-FRET (time-resolved fluorescence energy transfer); Cell-based FcRn recycling reporter-gene assay as a functional orthogonal supplement."
        }
      },
      {
        "id": "fcrn-binding-orthogonal-2",
        "name": {
          "zh": "FcRn亲和层析",
          "en": "FcRn affinity chromatography"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "BLI；FcRn亲和层析；TR-FRET（时间分辨荧光能量转移）；细胞水平的FcRn再循环报告基因测定可作为功能正交补充。",
          "en": "BLI; FcRn affinity chromatography; TR-FRET (time-resolved fluorescence energy transfer); Cell-based FcRn recycling reporter-gene assay as a functional orthogonal supplement."
        }
      },
      {
        "id": "fcrn-binding-orthogonal-3",
        "name": {
          "zh": "TR-FRET（时间分辨荧光能量转移）",
          "en": "TR-FRET (time-resolved fluorescence energy transfer)"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "BLI；FcRn亲和层析；TR-FRET（时间分辨荧光能量转移）；细胞水平的FcRn再循环报告基因测定可作为功能正交补充。",
          "en": "BLI; FcRn affinity chromatography; TR-FRET (time-resolved fluorescence energy transfer); Cell-based FcRn recycling reporter-gene assay as a functional orthogonal supplement."
        }
      },
      {
        "id": "fcrn-binding-orthogonal-4",
        "name": {
          "zh": "细胞水平的FcRn再循环报告基因测定可作为功能正交补充。",
          "en": "Cell-based FcRn recycling reporter-gene assay as a functional orthogonal supplement."
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "BLI；FcRn亲和层析；TR-FRET（时间分辨荧光能量转移）；细胞水平的FcRn再循环报告基因测定可作为功能正交补充。",
          "en": "BLI; FcRn affinity chromatography; TR-FRET (time-resolved fluorescence energy transfer); Cell-based FcRn recycling reporter-gene assay as a functional orthogonal supplement."
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "c1q-binding",
    "category": "binding-bioactivity",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "与C1q的结合力",
      "en": "C1q binding"
    },
    "itemName": {
      "zh": "C1q结合活力",
      "en": "C1q binding activity"
    },
    "applicability": {
      "zh": "主要适用于抗体类产品；非抗体产品需评估适用性；尤其适用于依赖CDC效应（补体依赖性细胞毒性）的产品",
      "en": "Mainly applicable to antibody products (non-antibody products need assessment); especially relevant for products relying on CDC (complement-dependent cytotoxicity)"
    },
    "purpose": {
      "zh": "确定候选药与参照药在C1q结合亲和力（KD）及结合特征上的相似性，以评估产品介导补体依赖性细胞毒性（CDC）的潜在能力",
      "en": "Determine similarity in C1q binding affinity (KD) and binding characteristics, assessing the product's potential to mediate complement-dependent cytotoxicity (CDC)"
    },
    "detectionIndicators": {
      "zh": "KD、相对结合活性（%）或相对结合响应",
      "en": "KD, relative binding activity (%) or relative binding response"
    },
    "similarityMethod": {
      "zh": "定量QR分析 + 90%置信区间等效性检验；候选药与参照药的结合活性比值（或KD比值）应落在预设的等效性范围内。",
      "en": "Quantitative QR analysis plus 90% confidence-interval equivalence testing; the candidate-to-reference binding activity ratio (or KD ratio) should fall within the predefined equivalence margin."
    },
    "judgingPrinciple": {
      "zh": "候选药与参照药的结合亲和力（KD、ka、kd）及/或相对结合活性上应呈现相似性；采用QR法或90%置信区间法进行统计学评价，若相对结合活性（或KD比值）的90%置信区间完全落在预设等效性界值内，且结合谱图与参照药一致，则判定为结合力相似",
      "en": "Candidate and reference should show similarity in binding affinity (KD, ka, kd) and/or relative binding activity; evaluate statistically using the QR approach or the 90% confidence-interval approach. If the 90% CI of the relative binding activity (or KD ratio) falls entirely within the predefined equivalence margin and the binding profiles are consistent with the reference product, binding is judged similar"
    },
    "numericLimit": {
      "zh": "无通用统一KD绝对值限度；相对结合活性%应采用预设等效性界值，在相同实验条件下进行头对头验证",
      "en": "No universal absolute KD limit; relative binding activity (%) should use a predefined equivalence margin, verified head-to-head under identical experimental conditions"
    },
    "remark": {
      "zh": "C1q是补体经典激活途径的起始分子，其与抗体Fc段CH2结构域的结合是CDC效应的核心触发步骤；该结合力可受Fc糖型、构象和聚集状态影响，需结合具体产品数据解释；在方法开发和结果解读时，务必同步参考SEC-HPLC的聚集体数据以排除假阳性干扰；该指标对于MoA依赖于CDC的抗体药物尤为关键",
      "en": "C1q initiates the classical complement pathway; its binding to the Fc CH2 domain is the core trigger of CDC. Binding can be affected by Fc glycoforms, conformation and aggregation state and must be interpreted with product-specific data; SEC-HPLC aggregate data should be consulted in parallel to exclude false positives. This attribute is especially critical for antibodies whose MoA depends on CDC"
    },
    "methods": [
      {
        "id": "c1q-binding-primary-1",
        "name": {
          "zh": "SPR（表面等离子体共振）",
          "en": "SPR (surface plasmon resonance)"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "SPR（表面等离子体共振）",
          "en": "SPR (surface plasmon resonance)"
        }
      },
      {
        "id": "c1q-binding-orthogonal-1",
        "name": {
          "zh": "ELISA",
          "en": "ELISA"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "ELISA；C1q沉积试验；补体活性测定（如CDC报告基因试验）可作为功能正交补充",
          "en": "ELISA; C1q deposition assay; Complement activity assay (e.g. CDC reporter-gene assay) as a functional orthogonal supplement"
        }
      },
      {
        "id": "c1q-binding-orthogonal-2",
        "name": {
          "zh": "C1q沉积试验",
          "en": "C1q deposition assay"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "ELISA；C1q沉积试验；补体活性测定（如CDC报告基因试验）可作为功能正交补充",
          "en": "ELISA; C1q deposition assay; Complement activity assay (e.g. CDC reporter-gene assay) as a functional orthogonal supplement"
        }
      },
      {
        "id": "c1q-binding-orthogonal-3",
        "name": {
          "zh": "补体活性测定（如CDC报告基因试验）可作为功能正交补充",
          "en": "Complement activity assay (e.g. CDC reporter-gene assay) as a functional orthogonal supplement"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "ELISA；C1q沉积试验；补体活性测定（如CDC报告基因试验）可作为功能正交补充",
          "en": "ELISA; C1q deposition assay; Complement activity assay (e.g. CDC reporter-gene assay) as a functional orthogonal supplement"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "adcc",
    "category": "binding-bioactivity",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "ADCC",
      "en": "ADCC"
    },
    "itemName": {
      "zh": "抗体依赖的细胞介导细胞毒作用",
      "en": "Antibody-dependent cell-mediated cytotoxicity"
    },
    "applicability": {
      "zh": "主要适用于依赖ADCC作为作用机制（MoA）的抗体类产品。",
      "en": "Mainly applicable to antibody products whose mechanism of action (MoA) relies on ADCC."
    },
    "purpose": {
      "zh": "确定候选药与参照药在介导ADCC效应上的相似性，以评估产品Fc段效应功能的可比性",
      "en": "Determine similarity in mediating ADCC, assessing comparability of the product's Fc effector function"
    },
    "detectionIndicators": {
      "zh": "相对效价（%）（首选）、EC50或最大杀伤率（Emax）",
      "en": "Relative potency (%) (preferred), EC50 or maximum lysis (Emax)"
    },
    "similarityMethod": {
      "zh": "等效性检验（如90%置信区间法）",
      "en": "Equivalence testing (e.g. the 90% confidence-interval approach)"
    },
    "judgingPrinciple": {
      "zh": "候选药的ADCC相对效价应与参照药相似，其90%置信区间应完全落在预设的等效性界值内",
      "en": "The candidate's ADCC relative potency should be similar to the reference, with its 90% confidence interval entirely within the predefined equivalence margin"
    },
    "numericLimit": {
      "zh": "无通用统一数值；需根据方法学验证和参照药历史批次数据，预设合理的等效性界值并予以论证",
      "en": "No universal numerical limit; a reasonable equivalence margin must be predefined and justified based on method validation and historical reference batch data"
    },
    "remark": {
      "zh": "ADCC活性与Fc段的糖基化修饰及聚集体（HMW）水平密切相关；仅在ADCC为作用机制或重要效应功能时作为高风险属性。",
      "en": "ADCC activity is closely related to Fc glycosylation and aggregate (HMW) levels; it is a high-risk attribute only when ADCC is the MoA or an important effector function."
    },
    "methods": [
      {
        "id": "adcc-primary-1",
        "name": {
          "zh": "基于报告基因的ADCC活性检测方法或基于靶细胞和效应细胞（如NK细胞或PBMC）的经典ADCC功能试验",
          "en": "Reporter-gene-based ADCC assay, or classical ADCC functional assay with target cells and effector cells (e.g. NK cells or PBMC)"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "基于报告基因的ADCC活性检测方法或基于靶细胞和效应细胞（如NK细胞或PBMC）的经典ADCC功能试验",
          "en": "Reporter-gene-based ADCC assay, or classical ADCC functional assay with target cells and effector cells (e.g. NK cells or PBMC)"
        }
      },
      {
        "id": "adcc-orthogonal-1",
        "name": {
          "zh": "FcγRIIIa结合试验和无岩藻糖糖型分析",
          "en": "FcγRIIIa binding assay and afucosylated glycoform analysis"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "FcγRIIIa结合试验和无岩藻糖糖型分析",
          "en": "FcγRIIIa binding assay and afucosylated glycoform analysis"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "cdc",
    "category": "binding-bioactivity",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "CDC",
      "en": "CDC"
    },
    "itemName": {
      "zh": "补体依赖性细胞毒性",
      "en": "Complement-dependent cytotoxicity"
    },
    "applicability": {
      "zh": "主要适用于抗体类产品；尤其适用于依赖CDC作为关键作用机制（MoA）的抗体类产品。",
      "en": "Mainly applicable to antibody products, especially those relying on CDC as a key mechanism of action (MoA)."
    },
    "purpose": {
      "zh": "通过头对头比对确定候选药与参照药在介导CDC效应上的相似性，以评估产品Fc段在补体激活通路上的功能可比性。",
      "en": "Head-to-head comparison of CDC activity between candidate and reference, assessing comparability of Fc function in complement activation."
    },
    "detectionIndicators": {
      "zh": "相对效价（%）（首选）、EC50或Emax",
      "en": "Relative potency (%) (preferred), EC50 or Emax"
    },
    "similarityMethod": {
      "zh": "等效性检验（如90%置信区间法）",
      "en": "Equivalence testing (e.g. the 90% confidence-interval approach)"
    },
    "judgingPrinciple": {
      "zh": "候选药的CDC相对效价应与参照药相似，其90%置信区间应完全落在预设的等效性界值",
      "en": "The candidate's CDC relative potency should be similar to the reference, with its 90% confidence interval entirely within the predefined equivalence margin"
    },
    "numericLimit": {
      "zh": "无通用统一数值；需根据方法学验证和参照药历史批次数据，预设合理的等效性界值并予以论证",
      "en": "No universal numerical limit; a reasonable equivalence margin must be predefined and justified based on method validation and historical reference batch data"
    },
    "remark": {
      "zh": "仅在补体效应为作用机制时作为高风险属性；CDC活性与Fc段的半乳糖基化（G1F/G2F）及唾液酸化（NANA）水平密切相关，同时对样品中聚集体（HMW）高度敏感",
      "en": "A high-risk attribute only when complement effector function is the MoA; CDC activity is closely related to Fc galactosylation (G1F/G2F) and sialylation (NANA) levels and is highly sensitive to aggregates (HMW)"
    },
    "methods": [
      {
        "id": "cdc-primary-1",
        "name": {
          "zh": "基于靶细胞的CDC活性检测法",
          "en": "Target-cell-based CDC activity assay"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "基于靶细胞的CDC活性检测法",
          "en": "Target-cell-based CDC activity assay"
        }
      },
      {
        "id": "cdc-orthogonal-1",
        "name": {
          "zh": "C1q结合力",
          "en": "C1q binding"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "C1q结合力；不同补体来源的交叉验证；不同靶细胞系的验证",
          "en": "C1q binding; Cross-validation with different complement sources; Verification with different target cell lines"
        }
      },
      {
        "id": "cdc-orthogonal-2",
        "name": {
          "zh": "不同补体来源的交叉验证",
          "en": "Cross-validation with different complement sources"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "C1q结合力；不同补体来源的交叉验证；不同靶细胞系的验证",
          "en": "C1q binding; Cross-validation with different complement sources; Verification with different target cell lines"
        }
      },
      {
        "id": "cdc-orthogonal-3",
        "name": {
          "zh": "不同靶细胞系的验证",
          "en": "Verification with different target cell lines"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "C1q结合力；不同补体来源的交叉验证；不同靶细胞系的验证",
          "en": "C1q binding; Cross-validation with different complement sources; Verification with different target cell lines"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "other-moa-related-functions",
    "category": "binding-bioactivity",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "-",
      "en": "-"
    },
    "itemName": {
      "zh": "其他机制相关功能",
      "en": "Other MoA-related functions"
    },
    "applicability": {
      "zh": "结合具体品种展开",
      "en": "To be developed based on the specific product"
    },
    "purpose": {
      "zh": "覆盖参照药全部已知和潜在重要作用机制",
      "en": "Cover all known and potentially important mechanisms of action of the reference product"
    },
    "detectionIndicators": {
      "zh": "-",
      "en": "-"
    },
    "similarityMethod": {
      "zh": "-",
      "en": "-"
    },
    "judgingPrinciple": {
      "zh": "所有关键功能均应得到相似性支持；不能只选择最容易通过的单一功能。",
      "en": "All key functions must be supported by similarity evidence; one must not select only the single easiest-to-pass function."
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；评价项目和标准必须结合MoA及临床相关性预先确定",
      "en": "No universal numerical limit applies to all products; evaluation items and criteria must be predefined based on the MoA and clinical relevance"
    },
    "remark": {
      "zh": "可包括中和、酶活、受体激活/阻断、细胞表面结合等",
      "en": "May include neutralization, enzymatic activity, receptor activation/blockade, cell-surface binding, etc."
    },
    "methods": [],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "other-product-related-impurities",
    "category": "process-product-impurities",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "-",
      "en": "-"
    },
    "itemName": {
      "zh": "其他产品相关物质/杂质",
      "en": "Other product-related substances/impurities"
    },
    "applicability": {
      "zh": "结合具体品种展开",
      "en": "To be developed based on the specific product"
    },
    "purpose": {
      "zh": "识别前体、降解物、错误折叠体、聚集体和其他分子变异体。",
      "en": "Identify precursors, degradation products, misfolded species, aggregates and other molecular variants."
    },
    "detectionIndicators": {
      "zh": "杂质种类、峰图、相对含量和结构鉴定",
      "en": "Impurity species, peak profiles, relative content and structural identification"
    },
    "similarityMethod": {
      "zh": "定量QR/实际范围＋新杂质决策",
      "en": "Quantitative QR / actual range plus decision process for new impurities"
    },
    "judgingPrinciple": {
      "zh": "已知杂质总体可比；与风险正相关的杂质不应不利升高；新杂质必须鉴定和风险论证。",
      "en": "Known impurities should be broadly comparable; impurities positively correlated with risk must not be unfavorably elevated; new impurities must be identified and their risk justified."
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。 如出现参照药未见的新峰/新成分，应先排除方法伪差，再鉴定、定量并评价对活性、安全性和免疫原性的影响。",
      "en": "No universal numerical limit applies to all products. A risk-based quality-range approach may be used: QR = (μR − XσR, μR + XσR); X must be justified according to the risk of the attribute. If a sufficient proportion of batches (e.g. ≥90%) fall within the range, similarity of the attribute can be supported; means, SDs and distributions should also be compared. If a new peak/component absent from the reference appears, first exclude method artifacts, then identify, quantify and evaluate its impact on activity, safety and immunogenicity."
    },
    "remark": {
      "zh": "需按产品实际降解和变异途径展开，包括新增峰和未知杂质；对任何与参照药谱图不一致的新增峰，均应进行结构鉴定和风险评估。",
      "en": "Develop according to the product's actual degradation and variant pathways, including new peaks and unknown impurities; any new peak inconsistent with the reference profile requires structural identification and risk assessment."
    },
    "methods": [
      {
        "id": "other-product-related-impurities-primary-1",
        "name": {
          "zh": "依据性质采用SEC、CE-SDS、IEX、HIC、肽图LC-MS等",
          "en": "SEC, CE-SDS, IEX, HIC, peptide-mapping LC-MS, etc., depending on the nature of the species"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "依据性质采用SEC、CE-SDS、IEX、HIC、肽图LC-MS等",
          "en": "SEC, CE-SDS, IEX, HIC, peptide-mapping LC-MS, etc., depending on the nature of the species"
        }
      },
      {
        "id": "other-product-related-impurities-orthogonal-1",
        "name": {
          "zh": "对新增峰进行结构鉴定（如LC-MS/MS、肽图）",
          "en": "Structural identification of new peaks (e.g. LC-MS/MS, peptide mapping)"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "对新增峰进行结构鉴定（如LC-MS/MS、肽图）；必要时进行杂质分离",
          "en": "Structural identification of new peaks (e.g. LC-MS/MS, peptide mapping); Impurity isolation where necessary"
        }
      },
      {
        "id": "other-product-related-impurities-orthogonal-2",
        "name": {
          "zh": "必要时进行杂质分离",
          "en": "Impurity isolation where necessary"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "对新增峰进行结构鉴定（如LC-MS/MS、肽图）；必要时进行杂质分离",
          "en": "Structural identification of new peaks (e.g. LC-MS/MS, peptide mapping); Impurity isolation where necessary"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "protein-a-residual",
    "category": "process-product-impurities",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "蛋白A残留",
      "en": "Protein A residue"
    },
    "itemName": {
      "zh": "Protein A残留量",
      "en": "Residual Protein A"
    },
    "applicability": {
      "zh": "主要适用于使用Protein A亲和层析工艺的抗体类产品",
      "en": "Mainly applicable to antibody products manufactured with a Protein A affinity chromatography process"
    },
    "purpose": {
      "zh": "通过定量检测最终产品（原料药/制剂）中的Protein A残留量，确认下游纯化工艺（尤其是亲和层析步骤）能够稳定、有效地将其清除至可接受水平，以控制免疫原性风险",
      "en": "Quantify residual Protein A in the final product (drug substance/drug product) to confirm that the downstream purification process (especially affinity chromatography) clears it stably and effectively to an acceptable level, controlling immunogenicity risk"
    },
    "detectionIndicators": {
      "zh": "Protein A残留量（ng/mg蛋白，或ppm）",
      "en": "Residual Protein A (ng/mg protein, or ppm)"
    },
    "similarityMethod": {
      "zh": "每批均需低于预设的放行限度；同时监测多批次数据，评估工艺清除能力的一致性（CQA）",
      "en": "Each batch must be below the predefined release limit; monitor multi-batch data to assess the consistency of process clearance capability (CQA)."
    },
    "judgingPrinciple": {
      "zh": "候选药每批的Protein A残留量必须低于经安全性、工艺能力、临床暴露和方法性能支持的产品特异放行限度，以确保纯化工艺的稳健性；若批次间出现显著波动，需启动偏差调查，评估层析柱寿命或清洗条件的潜在影响",
      "en": "Every batch must be below a product-specific release limit supported by safety, process capability, clinical exposure and method performance, ensuring purification robustness; significant batch-to-batch fluctuation triggers a deviation investigation into column lifetime or cleaning conditions"
    },
    "numericLimit": {
      "zh": "具体限度需依据方法学验证（检测限LOD、定量限LOQ）及临床批/毒理批数据设定，并确保对人体安全无风险",
      "en": "Specific limits are set based on method validation (LOD, LOQ) and clinical/toxicology batch data, ensuring no risk to human safety"
    },
    "remark": {
      "zh": "Protein A残留属于外源性蛋白杂质，是工艺相关杂质的核心监控项之一；其清除效率直接影响产品的免疫原性风险。若产品使用非Protein A工艺，则此项目不适用。",
      "en": "Residual Protein A is an exogenous protein impurity and a core process-related impurity to monitor; its clearance directly affects immunogenicity risk. Not applicable if a non-Protein-A process is used."
    },
    "methods": [
      {
        "id": "protein-a-residual-primary-1",
        "name": {
          "zh": "ELISA（酶联免疫吸附测定法）",
          "en": "ELISA (enzyme-linked immunosorbent assay)"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "ELISA（酶联免疫吸附测定法）",
          "en": "ELISA (enzyme-linked immunosorbent assay)"
        }
      },
      {
        "id": "protein-a-residual-orthogonal-1",
        "name": {
          "zh": "LC-MS/MS（对疑似高残留样品或方法学验证时，作为结构确证）",
          "en": "LC-MS/MS (for structural confirmation of suspected high-residue samples or during method validation)"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "LC-MS/MS（对疑似高残留样品或方法学验证时，作为结构确证）",
          "en": "LC-MS/MS (for structural confirmation of suspected high-residue samples or during method validation)"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "residual-dna",
    "category": "process-product-impurities",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "外源性DNA残留",
      "en": "Residual exogenous DNA"
    },
    "itemName": {
      "zh": "外源性DNA残留量",
      "en": "Residual exogenous DNA content"
    },
    "applicability": {
      "zh": "适用于所有使用细胞基质生产的生物制品。",
      "en": "Applicable to all biologics produced using cell substrates."
    },
    "purpose": {
      "zh": "定量检测最终产品中的宿主细胞DNA残留，确认下游纯化工艺的清除能力，以控制潜在的致瘤性、传染性和免疫原性风险",
      "en": "Quantify residual host-cell DNA in the final product to confirm downstream clearance capability, controlling potential tumorigenicity, infectivity and immunogenicity risks"
    },
    "detectionIndicators": {
      "zh": "宿主细胞残留DNA含量（pg/剂或ng/mg）及DNA片段大小分布",
      "en": "Residual host-cell DNA content (pg/dose or ng/mg) and DNA fragment size distribution"
    },
    "similarityMethod": {
      "zh": "每批均需低于预设的放行限度；同时监测多批次数据，评估工艺清除能力的一致性（CQA）",
      "en": "Each batch must be below the predefined release limit; monitor multi-batch data to assess the consistency of process clearance capability (CQA)."
    },
    "judgingPrinciple": {
      "zh": "每批产品的残留DNA含量必须低于法定限度；若出现显著波动，需启动偏差调查。",
      "en": "Residual DNA in every batch must be below the statutory limit; significant fluctuation triggers a deviation investigation."
    },
    "numericLimit": {
      "zh": "参照《中国药典》2020年版三部通则（3407）及相关国际指导原则（ICH Q5A、FDA guidance）",
      "en": "Refer to Chinese Pharmacopoeia 2020 Volume III general chapter 3407 and relevant international guidelines (ICH Q5A, FDA guidance)"
    },
    "remark": {
      "zh": "该杂质属于工艺相关杂质的关键监控项，清除效率直接影响产品的安全性",
      "en": "A key process-related impurity to monitor; clearance efficiency directly affects product safety"
    },
    "methods": [
      {
        "id": "residual-dna-primary-1",
        "name": {
          "zh": "定量PCR（qPCR）法",
          "en": "Quantitative PCR (qPCR)"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "定量PCR（qPCR）法",
          "en": "Quantitative PCR (qPCR)"
        }
      },
      {
        "id": "residual-dna-orthogonal-1",
        "name": {
          "zh": "DNA探针杂交法、荧光染色法",
          "en": "DNA probe hybridization, fluorescent staining"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "DNA探针杂交法、荧光染色法",
          "en": "DNA probe hybridization, fluorescent staining"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "residual-hcp",
    "category": "process-product-impurities",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "宿主蛋白残留",
      "en": "Residual host cell protein"
    },
    "itemName": {
      "zh": "宿主细胞蛋白（HCP）残留量",
      "en": "Residual host cell protein (HCP)"
    },
    "applicability": {
      "zh": "适用于所有使用细胞基质生产的生物制品。",
      "en": "Applicable to all biologics produced using cell substrates."
    },
    "purpose": {
      "zh": "定量检测最终产品（原液/制剂）中的HCP残留，确认下游纯化工艺的清除能力，以控制产品的免疫原性风险和质量风险",
      "en": "Quantify residual HCP in the drug substance/product to confirm downstream clearance capability, controlling immunogenicity and quality risks"
    },
    "detectionIndicators": {
      "zh": "HCP残留量（ng/mg 或 ppm）",
      "en": "Residual HCP (ng/mg or ppm)"
    },
    "similarityMethod": {
      "zh": "每批均需低于预设的放行限度；同时监测多批次数据，评估工艺清除能力的一致性（CQA）",
      "en": "Each batch must be below the predefined release limit; monitor multi-batch data to assess the consistency of process clearance capability (CQA)."
    },
    "judgingPrinciple": {
      "zh": "每批产品的HCP残留量必须低于放行限度；若出现显著波动或接近警戒限，需启动偏差调查",
      "en": "HCP in every batch must be below the release limit; significant fluctuation or approaching the alert limit triggers a deviation investigation"
    },
    "numericLimit": {
      "zh": "参照《中国药典》2020年版通则（如3412）、ICH Q6B及USP<1132>等指导原则。",
      "en": "Refer to Chinese Pharmacopoeia 2020 general chapters (e.g. 3412), ICH Q6B and USP <1132>."
    },
    "remark": {
      "zh": "HCP属于工艺相关杂质的关键监控项。申报资料中除提供检测结果外，还应包括试剂盒的抗体覆盖率验证数据和工艺清除率评估报告",
      "en": "HCP is a key process-related impurity to monitor. Besides test results, the dossier should include antibody-coverage validation data for the assay kit and a process clearance evaluation report"
    },
    "methods": [
      {
        "id": "residual-hcp-primary-1",
        "name": {
          "zh": "ELISA（酶联免疫吸附测定法）",
          "en": "ELISA (enzyme-linked immunosorbent assay)"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "ELISA（酶联免疫吸附测定法）",
          "en": "ELISA (enzyme-linked immunosorbent assay)"
        }
      },
      {
        "id": "residual-hcp-orthogonal-1",
        "name": {
          "zh": "LC-MS/MS（液相色谱-串联质谱法）",
          "en": "LC-MS/MS (liquid chromatography–tandem mass spectrometry)"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "LC-MS/MS（液相色谱-串联质谱法）",
          "en": "LC-MS/MS (liquid chromatography–tandem mass spectrometry)"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "other-process-related-impurities",
    "category": "process-product-impurities",
    "isSupplementary": false,
    "guidelineTerm": {
      "zh": "-",
      "en": "-"
    },
    "itemName": {
      "zh": "其他工艺相关杂质",
      "en": "Other process-related impurities"
    },
    "applicability": {
      "zh": "结合具体品种展开",
      "en": "To be developed based on the specific product"
    },
    "purpose": {
      "zh": "基于产品特定的生产工艺和原料组成，采用经充分验证的分析方法，对培养基、纯化介质、滤膜及包材等引入的工艺相关杂质进行系统性鉴定、定量与清除评估，以确保其残留水平控制在可接受的安全限度内",
      "en": "Based on the product-specific process and raw materials, systematically identify, quantify and assess clearance of process-related impurities introduced by media, purification resins, filters and packaging using fully validated methods, ensuring residues stay within acceptable safety limits"
    },
    "detectionIndicators": {
      "zh": "-",
      "en": "-"
    },
    "similarityMethod": {
      "zh": "安全风险控制；不以严格匹配参照药为唯一目标",
      "en": "Safety risk control; strict matching to the reference product is not the sole objective"
    },
    "judgingPrinciple": {
      "zh": "工艺相关杂质通常因生产工艺不同而不要求与参照药定性相同；核心是采用适用方法充分控制，并证明不会增加安全性/免疫原性风险",
      "en": "Process-related impurities generally need not qualitatively match the reference because processes differ; the core is adequate control with suitable methods and demonstrating no increased safety/immunogenicity risk"
    },
    "numericLimit": {
      "zh": "具体质量标准依产品、工艺、药典/法规和安全性论证",
      "en": "Specific specifications depend on the product, process, pharmacopoeia/regulations and safety justification"
    },
    "remark": {
      "zh": "按培养基、试剂、层析介质、滤膜和包材等确定。",
      "en": "Determined by media, reagents, chromatography resins, filters, packaging materials, etc."
    },
    "methods": [
      {
        "id": "other-process-related-impurities-primary-1",
        "name": {
          "zh": "产品/工艺特异方法",
          "en": "Product/process-specific methods"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "产品/工艺特异方法",
          "en": "Product/process-specific methods"
        }
      },
      {
        "id": "other-process-related-impurities-orthogonal-1",
        "name": {
          "zh": "采用不同原理方法或工艺清除/风险评估支持",
          "en": "Methods of different principles, or support from process-clearance/risk assessment"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "采用不同原理方法或工艺清除/风险评估支持",
          "en": "Methods of different principles, or support from process-clearance/risk assessment"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "methionine-tryptophan-oxidation",
    "category": "ptm-glycosylation",
    "isSupplementary": true,
    "guidelineTerm": {
      "zh": "氧化（P3，结构总结示例）",
      "en": "Oxidation (P3, structural summary example)"
    },
    "itemName": {
      "zh": "甲硫氨酸/色氨酸等氧化",
      "en": "Oxidation of methionine/tryptophan residues"
    },
    "applicability": {
      "zh": "补充项；是否纳入取决于品种、工艺、作用机制和风险",
      "en": "Supplementary item; inclusion depends on product, process, mechanism of action and risk"
    },
    "purpose": {
      "zh": "对候选药与参照药中甲硫氨酸（Met）及色氨酸（Trp）等易氧化残基的氧化位点及相对丰度进行比对，以评估氧化修饰谱的相似性",
      "en": "Compare oxidation sites and relative abundance of oxidation-prone residues such as methionine (Met) and tryptophan (Trp), assessing similarity of the oxidation profile"
    },
    "detectionIndicators": {
      "zh": "氧化位点的相对丰度（%）；关键热点（如Met-252、Met-428）的氧化水平；氧化肽段的MS/MS鉴定谱图。",
      "en": "Relative abundance (%) of oxidation sites; oxidation levels at key hotspots (e.g. Met-252, Met-428); MS/MS spectra of oxidized peptides."
    },
    "similarityMethod": {
      "zh": "定量QR/实际范围＋功能关联",
      "en": "Quantitative QR / actual range plus functional correlation"
    },
    "judgingPrinciple": {
      "zh": "候选药与参照药在氧化位点分布上应总体相似；对于非关键位点的氧化水平差异，若其不影响抗原结合亲和力（SPR/BLI）及Fc效应功能（ADCC/CDC/FcRn结合），可视为可接受",
      "en": "Oxidation-site distribution should be broadly similar between candidate and reference; differences at non-critical sites are acceptable if they do not affect antigen-binding affinity (SPR/BLI) or Fc effector functions (ADCC/CDC/FcRn binding)"
    },
    "numericLimit": {
      "zh": "无统一的生物类似药“相似性”数值；具体质量标准依产品、工艺、药典/法规和安全性论证。",
      "en": "No unified biosimilar \"similarity\" value; specific specifications depend on the product, process, pharmacopoeia/regulations and safety justification."
    },
    "remark": {
      "zh": "属于常见的化学降解途径，其风险等级取决于发生位点：CDR区氧化可能直接降低亲和力；Fc区Met-252/428氧化可能缩短半衰期。检测策略应结合产品MoA及稳定性数据设计，非强制放行项，但在出现异常降解趋势时需重点关注。",
      "en": "A common chemical degradation pathway whose risk depends on location: CDR oxidation may directly reduce affinity; Fc Met-252/428 oxidation may shorten half-life. The testing strategy should reflect the MoA and stability data; not a mandatory release test, but requires attention when abnormal degradation trends appear."
    },
    "methods": [
      {
        "id": "methionine-tryptophan-oxidation-primary-1",
        "name": {
          "zh": "肽图LC-MS/MS",
          "en": "Peptide mapping LC-MS/MS"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "肽图LC-MS/MS",
          "en": "Peptide mapping LC-MS/MS"
        }
      },
      {
        "id": "methionine-tryptophan-oxidation-orthogonal-1",
        "name": {
          "zh": "非还原/还原CE-SDS",
          "en": "Non-reduced/reduced CE-SDS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "非还原/还原CE-SDS；完整分子量LC-MS；氧化强制降解试验结合功能活性测定",
          "en": "Non-reduced/reduced CE-SDS; Intact molecular mass LC-MS; Forced oxidative degradation combined with functional activity testing"
        }
      },
      {
        "id": "methionine-tryptophan-oxidation-orthogonal-2",
        "name": {
          "zh": "完整分子量LC-MS",
          "en": "Intact molecular mass LC-MS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "非还原/还原CE-SDS；完整分子量LC-MS；氧化强制降解试验结合功能活性测定",
          "en": "Non-reduced/reduced CE-SDS; Intact molecular mass LC-MS; Forced oxidative degradation combined with functional activity testing"
        }
      },
      {
        "id": "methionine-tryptophan-oxidation-orthogonal-3",
        "name": {
          "zh": "氧化强制降解试验结合功能活性测定",
          "en": "Forced oxidative degradation combined with functional activity testing"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "非还原/还原CE-SDS；完整分子量LC-MS；氧化强制降解试验结合功能活性测定",
          "en": "Non-reduced/reduced CE-SDS; Intact molecular mass LC-MS; Forced oxidative degradation combined with functional activity testing"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "asn-deamidation",
    "category": "ptm-glycosylation",
    "isSupplementary": true,
    "guidelineTerm": {
      "zh": "脱酰胺（P3，结构总结示例）",
      "en": "Deamidation (P3, structural summary example)"
    },
    "itemName": {
      "zh": "Asn脱酰胺及异构化",
      "en": "Asn deamidation and isomerization"
    },
    "applicability": {
      "zh": "补充项；是否纳入取决于品种、工艺、作用机制和风险",
      "en": "Supplementary item; inclusion depends on product, process, mechanism of action and risk"
    },
    "purpose": {
      "zh": "对候选药与参照药中天冬酰胺（Asn）的脱酰胺位点及相对丰度进行头对头比对，以评估脱酰胺修饰谱的相似性",
      "en": "Head-to-head comparison of asparagine (Asn) deamidation sites and relative abundance, assessing similarity of the deamidation profile"
    },
    "detectionIndicators": {
      "zh": "各Asn位点的脱酰胺相对丰度（%）；关键热点（如CDR区Asn）的脱酰胺水平；对应的电荷变异体（酸性峰）面积变化（%）；脱酰胺肽段的MS/MS鉴定谱图",
      "en": "Relative deamidation abundance (%) at each Asn site; levels at key hotspots (e.g. CDR Asn); change in corresponding acidic charge-variant peak area (%); MS/MS spectra of deamidated peptides"
    },
    "similarityMethod": {
      "zh": "定量QR/实际范围＋电荷峰归因",
      "en": "Quantitative QR / actual range plus charge-peak attribution"
    },
    "judgingPrinciple": {
      "zh": "与参照药在脱酰胺位点分布及关键热点丰度上应总体相似；脱酰胺引起的电荷变异体变化（酸性峰增加）应与参照药的电荷分布趋势一致",
      "en": "Deamidation-site distribution and key hotspot abundance should be broadly similar to the reference; charge-variant changes caused by deamidation (increased acidic peaks) should follow the reference charge-distribution trend"
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。",
      "en": "No universal numerical limit applies to all products. A risk-based quality-range approach may be used: QR = (μR − XσR, μR + XσR); X must be justified according to the risk of the attribute. If a sufficient proportion of batches (e.g. ≥90%) fall within the range, similarity of the attribute can be supported; means, SDs and distributions should also be compared."
    },
    "remark": {
      "zh": "脱酰胺是天冬酰胺（Asn）侧链水解为天冬氨酸（Asp）或异天冬氨酸（isoAsp）的化学修饰，质量增加1 Da，同时引入一个负电荷，是酸性电荷变异体的主要来源之一。 其风险等级取决于发生位点",
      "en": "Deamidation hydrolyzes the Asn side chain to aspartate (Asp) or isoaspartate (isoAsp), adding 1 Da and one negative charge — a major source of acidic charge variants. Its risk depends on the site of occurrence"
    },
    "methods": [
      {
        "id": "asn-deamidation-primary-1",
        "name": {
          "zh": "肽图LC-MS/MS（还原肽图）",
          "en": "Peptide mapping LC-MS/MS (reduced peptide map)"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "肽图LC-MS/MS（还原肽图）",
          "en": "Peptide mapping LC-MS/MS (reduced peptide map)"
        }
      },
      {
        "id": "asn-deamidation-orthogonal-1",
        "name": {
          "zh": "icIEF/CEX-HPLC",
          "en": "icIEF/CEX-HPLC"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "icIEF/CEX-HPLC；完整分子量LC-MS",
          "en": "icIEF/CEX-HPLC; Intact molecular mass LC-MS"
        }
      },
      {
        "id": "asn-deamidation-orthogonal-2",
        "name": {
          "zh": "完整分子量LC-MS",
          "en": "Intact molecular mass LC-MS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "icIEF/CEX-HPLC；完整分子量LC-MS",
          "en": "icIEF/CEX-HPLC; Intact molecular mass LC-MS"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "n-terminal-pyroglutamate",
    "category": "ptm-glycosylation",
    "isSupplementary": true,
    "guidelineTerm": {
      "zh": "N末端焦谷氨酸化（P3，结构总结示例）",
      "en": "N-terminal pyroglutamation (P3, structural summary example)"
    },
    "itemName": {
      "zh": "N端焦谷氨酸形成",
      "en": "N-terminal pyroglutamate formation"
    },
    "applicability": {
      "zh": "补充项；是否纳入取决于品种、工艺、作用机制和风险",
      "en": "Supplementary item; inclusion depends on product, process, mechanism of action and risk"
    },
    "purpose": {
      "zh": "确认N端加工的一致性，并将该修饰水平作为细胞培养工艺稳健性及产品身份标识的一部分",
      "en": "Confirm consistency of N-terminal processing; use this modification level as part of cell-culture process robustness and product identity"
    },
    "detectionIndicators": {
      "zh": "各N端焦谷氨酸化位点（重链/轻链）及相对丰度（%）；完整分子量质谱中对应的质量偏移（-17 Da）",
      "en": "N-terminal pyroglutamation sites (heavy/light chain) and relative abundance (%); corresponding mass shift (−17 Da) in intact mass spectra"
    },
    "similarityMethod": {
      "zh": "定量QR/实际范围",
      "en": "Quantitative QR / actual range"
    },
    "judgingPrinciple": {
      "zh": "候选药与参照药在N端焦谷氨酸化位点及丰度上应总体相似；若差异较大，需结合抗原结合活性（SPR/BLI）数据确认其是否影响结合功能；若该修饰发生在CDR区，需更严格比对并评估功能影响。",
      "en": "Pyroglutamation sites and abundance should be broadly similar to the reference; larger differences require antigen-binding (SPR/BLI) data to confirm no functional impact; if the modification occurs in a CDR, stricter comparison and functional assessment are needed."
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。",
      "en": "No universal numerical limit applies to all products. A risk-based quality-range approach may be used: QR = (μR − XσR, μR + XσR); X must be justified according to the risk of the attribute. If a sufficient proportion of batches (e.g. ≥90%) fall within the range, similarity of the attribute can be supported; means, SDs and distributions should also be compared."
    },
    "remark": {
      "zh": "N端焦谷氨酸化是抗体轻重链N端谷氨酰胺（Q）或谷氨酸（E）在环化酶（QC酶）催化下环化形成焦谷氨酸（pyroGlu）的常见翻译后修饰，质量变化为-17 Da（Q→pE）或-18 Da（E→pE）。该修饰主要发生于细胞培养阶段，属于“加工型修饰”而非降解途径，通常不影响功能，但会封闭N端氨基，使Edman降解法无法直接测序。需重点关注该修饰是否发生在CDR区（若N端Q/E位于CDR区，则可能影响抗原结合）。",
      "en": "N-terminal pyroglutamation is a common PTM in which N-terminal glutamine (Q) or glutamate (E) cyclizes to pyroglutamate (pyroGlu) under QC enzyme catalysis, with a mass change of −17 Da (Q→pE) or −18 Da (E→pE). It occurs mainly during cell culture, is a \"processing\" modification rather than degradation, usually does not affect function, but blocks the N-terminal amine so Edman degradation cannot sequence directly. Check whether it occurs within a CDR (N-terminal Q/E in a CDR may affect antigen binding)."
    },
    "methods": [
      {
        "id": "n-terminal-pyroglutamate-primary-1",
        "name": {
          "zh": "肽图LC-MS/MS（还原肽图）",
          "en": "Peptide mapping LC-MS/MS (reduced peptide map)"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "肽图LC-MS/MS（还原肽图）",
          "en": "Peptide mapping LC-MS/MS (reduced peptide map)"
        }
      },
      {
        "id": "n-terminal-pyroglutamate-orthogonal-1",
        "name": {
          "zh": "完整/亚基LC-MS",
          "en": "Intact/subunit LC-MS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "完整/亚基LC-MS",
          "en": "Intact/subunit LC-MS"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "c-terminal-lysine-processing",
    "category": "ptm-glycosylation",
    "isSupplementary": true,
    "guidelineTerm": {
      "zh": "C端赖氨酸缺失/保留（P3，结构总结示例）",
      "en": "C-terminal lysine loss/retention (P3, structural summary example)"
    },
    "itemName": {
      "zh": "重链C端Lys加工",
      "en": "Heavy chain C-terminal Lys processing"
    },
    "applicability": {
      "zh": "补充项；是否纳入取决于品种、工艺、作用机制和风险",
      "en": "Supplementary item; inclusion depends on product, process, mechanism of action and risk"
    },
    "purpose": {
      "zh": "对候选药与参照药中重链C端赖氨酸（Lys，K）的缺失/保留状态进行头对头比对，以评估C端加工的异质性是否一致",
      "en": "Head-to-head comparison of heavy chain C-terminal lysine (Lys, K) loss/retention, assessing whether C-terminal processing heterogeneity is consistent"
    },
    "detectionIndicators": {
      "zh": "0K、1K、2K三种形式的相对比例（%）；C端含K或缺失K的肽段峰面积比（用于肽图确认）；对应的电荷变异体（碱性峰）面积变化（%）",
      "en": "Relative proportions (%) of the 0K, 1K and 2K forms; peak-area ratio of C-terminal K-containing vs K-lost peptides (peptide-map confirmation); change in corresponding basic charge-variant peak area (%)"
    },
    "similarityMethod": {
      "zh": "定量QR/实际范围",
      "en": "Quantitative QR / actual range"
    },
    "judgingPrinciple": {
      "zh": "候选药与参照药在C端K缺失/保留的分布（0K/1K/2K比例）上应总体相似",
      "en": "The distribution of C-terminal K loss/retention (0K/1K/2K ratios) should be broadly similar between candidate and reference"
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。",
      "en": "No universal numerical limit applies to all products. A risk-based quality-range approach may be used: QR = (μR − XσR, μR + XσR); X must be justified according to the risk of the attribute. If a sufficient proportion of batches (e.g. ≥90%) fall within the range, similarity of the attribute can be supported; means, SDs and distributions should also be compared."
    },
    "remark": {
      "zh": "C端赖氨酸（K）缺失是IgG重链C末端的常见加工修饰，由宿主细胞来源的羧肽酶样加工导致。 该修饰不直接影响Fc效应功能，但会改变抗体的电荷分布（降低pI，影响碱性峰），是电荷变异体分析中碱性峰的主要来源之一。其缺失比例主要反映细胞培养工艺的“成熟度”。",
      "en": "C-terminal lysine loss is a common IgG heavy-chain processing modification caused by host-cell carboxypeptidase-like activity. It does not directly affect Fc effector function but changes charge distribution (lower pI, basic peaks) and is a main source of basic charge variants; the loss ratio mainly reflects cell-culture process \"maturity\"."
    },
    "methods": [
      {
        "id": "c-terminal-lysine-processing-primary-1",
        "name": {
          "zh": "完整/还原亚基分子量LC-MS",
          "en": "Intact/reduced subunit molecular mass LC-MS"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "完整/还原亚基分子量LC-MS；电荷变异体分析（CEX-HPLC或icIEF）",
          "en": "Intact/reduced subunit molecular mass LC-MS; Charge-variant analysis (CEX-HPLC or icIEF)"
        }
      },
      {
        "id": "c-terminal-lysine-processing-primary-2",
        "name": {
          "zh": "电荷变异体分析（CEX-HPLC或icIEF）",
          "en": "Charge-variant analysis (CEX-HPLC or icIEF)"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "完整/还原亚基分子量LC-MS；电荷变异体分析（CEX-HPLC或icIEF）",
          "en": "Intact/reduced subunit molecular mass LC-MS; Charge-variant analysis (CEX-HPLC or icIEF)"
        }
      },
      {
        "id": "c-terminal-lysine-processing-orthogonal-1",
        "name": {
          "zh": "肽图LC-MS/MS（还原肽图）",
          "en": "Peptide mapping LC-MS/MS (reduced peptide map)"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "肽图LC-MS/MS（还原肽图）",
          "en": "Peptide mapping LC-MS/MS (reduced peptide map)"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "ft-ir-secondary-structure",
    "category": "higher-order-structure",
    "isSupplementary": true,
    "guidelineTerm": {
      "zh": "FT-IR",
      "en": "FT-IR"
    },
    "itemName": {
      "zh": "FT-IR二级结构正交分析",
      "en": "FT-IR orthogonal secondary-structure analysis"
    },
    "applicability": {
      "zh": "补充项；是否纳入取决于品种、工艺、作用机制和风险",
      "en": "Supplementary item; inclusion depends on product, process, mechanism of action and risk"
    },
    "purpose": {
      "zh": "对候选药与参照药的二级结构进行头对头光谱叠加比对，通过分析酰胺I带的峰形、峰位及相对强度，评估两者在蛋白质骨架氢键模式及二级结构组成上的相似性，作为远紫外CD的正交补充证据。",
      "en": "Head-to-head spectral overlay of secondary structure: analyze amide I band shape, position and relative intensity to assess similarity of backbone hydrogen bonding and secondary-structure composition, as orthogonal evidence to far-UV CD."
    },
    "detectionIndicators": {
      "zh": "酰胺I带的原始光谱叠加图；二阶导数谱或去卷积谱的峰位及峰面积比；二级结构含量估算值（α-螺旋、β-折叠等的相对百分比）",
      "en": "Raw amide I band spectral overlay; peak positions and area ratios of second-derivative or deconvoluted spectra; estimated secondary-structure content (relative % of α-helix, β-sheet, etc.)"
    },
    "similarityMethod": {
      "zh": "头对头图谱比较",
      "en": "Head-to-head spectral comparison"
    },
    "judgingPrinciple": {
      "zh": "候选药与参照药的FT-IR酰胺I带光谱应高度重叠；二阶导数谱的峰形及峰位应总体一致",
      "en": "The FT-IR amide I band spectra of candidate and reference should overlap closely; second-derivative peak shapes and positions should be broadly consistent"
    },
    "numericLimit": {
      "zh": "无通用统一数值限度；高级结构图谱相似性通常采用定性/半定量图谱比对，辅以相关系数法（如软件计算光谱重叠度）作为辅助参考",
      "en": "No universal numerical limit; higher-order structure spectral similarity is usually assessed by qualitative/semi-quantitative comparison, aided by correlation-coefficient approaches (e.g. software-calculated spectral overlap) as supportive reference"
    },
    "remark": {
      "zh": "与远紫外CD互补：CD对α-螺旋敏感，FT-IR对β-折叠更敏感；酰胺I带（1600-1700 cm-1，C=O伸缩振动）是分析二级结构的核心区域，其二阶导数谱可有效分辨重叠的二级结构组成。",
      "en": "Complementary to far-UV CD: CD is sensitive to α-helix, FT-IR is more sensitive to β-sheet; the amide I band (1600–1700 cm⁻¹, C=O stretching) is the core region for secondary-structure analysis, and its second-derivative spectrum resolves overlapping components."
    },
    "methods": [
      {
        "id": "ft-ir-secondary-structure-primary-1",
        "name": {
          "zh": "FT-IR光谱",
          "en": "FT-IR spectroscopy"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "FT-IR光谱",
          "en": "FT-IR spectroscopy"
        }
      },
      {
        "id": "ft-ir-secondary-structure-orthogonal-1",
        "name": {
          "zh": "远紫外CD",
          "en": "Far-UV CD"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "远紫外CD",
          "en": "Far-UV CD"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "hdx-ms-nmr-high-resolution",
    "category": "higher-order-structure",
    "isSupplementary": true,
    "guidelineTerm": {
      "zh": "HDX-MS/NMR等高分辨方法",
      "en": "High-resolution methods such as HDX-MS/NMR"
    },
    "itemName": {
      "zh": "位点特异高级结构",
      "en": "Site-specific higher-order structure"
    },
    "applicability": {
      "zh": "补充项；是否纳入取决于品种、工艺、作用机制和风险",
      "en": "Supplementary item; inclusion depends on product, process, mechanism of action and risk"
    },
    "purpose": {
      "zh": "在常规光谱方法无法完全排除候选药与参照药之间高级结构差异的情况下，采用HDX-MS或NMR等高分辨方法对两者进行头对头比对，以在位点特异或原子分辨率水平上确认二级/三级结构的一致性，并识别潜在的构象差异区域。",
      "en": "When conventional spectroscopy cannot fully exclude higher-order structure differences, use HDX-MS or NMR for head-to-head comparison at site-specific or atomic resolution, confirming secondary/tertiary structure consistency and identifying potential conformational-difference regions."
    },
    "detectionIndicators": {
      "zh": "各肽段在不同时间点的氘掺入百分比（%D）及氘掺入速率曲线（D-plot）；候选药与参照药的氘掺入差异图（△D，即差值图）。\n2D HSQC谱图中甲基信号峰的化学位移（δ）；候选药与参照药图谱的叠加及化学位移差异（△δ）分析。",
      "en": "Deuterium uptake (%D) per peptide at each time point and uptake curves (D-plots); deuterium-uptake difference maps (ΔD) between candidate and reference.\nChemical shifts (δ) of methyl signals in 2D HSQC spectra; overlay of candidate and reference spectra with chemical-shift difference (Δδ) analysis."
    },
    "similarityMethod": {
      "zh": "头对头图谱叠加 + 统计学差异阈值",
      "en": "Head-to-head spectral overlay plus statistical difference thresholds"
    },
    "judgingPrinciple": {
      "zh": "若HDX-MS或NMR图谱与参照药高度重合（无显著差异区域），则判定高级结构在溶液构象及动态上高度一致；若出现显著性差异，需将该区域定位至三维结构（如Fab或Fc区），并结合抗原结合活性及Fc效应功能数据，评估其对产品作用机制（MoA）的潜在影响",
      "en": "If HDX-MS or NMR profiles overlap closely with the reference (no significant difference regions), higher-order structure is judged highly consistent in solution conformation and dynamics; significant differences must be mapped onto the 3D structure (e.g. Fab or Fc region) and assessed for MoA impact together with antigen-binding and Fc effector-function data"
    },
    "numericLimit": {
      "zh": "无通用统一数值限度；差异阈值需基于方法学验证（如HDX-MS的重复性）及参照药批间变异性进行预设",
      "en": "No universal numerical limit; difference thresholds must be predefined based on method validation (e.g. HDX-MS repeatability) and reference batch-to-batch variability"
    },
    "remark": {
      "zh": "两种方法的实验条件必须头对头",
      "en": "The experimental conditions of both methods must be head-to-head"
    },
    "methods": [
      {
        "id": "hdx-ms-nmr-high-resolution-primary-1",
        "name": {
          "zh": "HDX-MS（氢氘交换质谱）",
          "en": "HDX-MS (hydrogen-deuterium exchange mass spectrometry)"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "HDX-MS（氢氘交换质谱）",
          "en": "HDX-MS (hydrogen-deuterium exchange mass spectrometry)"
        }
      },
      {
        "id": "hdx-ms-nmr-high-resolution-primary-2",
        "name": {
          "zh": "甲基NMR（甲基核磁共振）",
          "en": "Methyl NMR (methyl nuclear magnetic resonance)"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "甲基NMR（甲基核磁共振）",
          "en": "Methyl NMR (methyl nuclear magnetic resonance)"
        }
      },
      {
        "id": "hdx-ms-nmr-high-resolution-orthogonal-1",
        "name": {
          "zh": "抗原结合活性（SPR/BLI）、功能活性（ADCC/CDC等）用于将检测到的构象差异（若有）与功能变化进行关联分析",
          "en": "Antigen-binding activity (SPR/BLI) and functional activity (ADCC/CDC, etc.) used to correlate detected conformational differences (if any) with functional changes"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "抗原结合活性（SPR/BLI）、功能活性（ADCC/CDC等）用于将检测到的构象差异（若有）与功能变化进行关联分析",
          "en": "Antigen-binding activity (SPR/BLI) and functional activity (ADCC/CDC, etc.) used to correlate detected conformational differences (if any) with functional changes"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "galactosylation-g1f-g2f",
    "category": "ptm-glycosylation",
    "isSupplementary": true,
    "guidelineTerm": {
      "zh": "G1F等半乳糖化糖型（P3，结构总结示例）",
      "en": "Galactosylated glycoforms such as G1F (P3, structural summary example)"
    },
    "itemName": {
      "zh": "常见IgG N-糖型（半乳糖基化糖型比例）",
      "en": "Common IgG N-glycoforms (galactosylated glycoform proportions)"
    },
    "applicability": {
      "zh": "补充项；是否纳入取决于品种、工艺、作用机制和风险",
      "en": "Supplementary item; inclusion depends on product, process, mechanism of action and risk"
    },
    "purpose": {
      "zh": "确定候选药与参照药中G1F（含1个半乳糖）及G2F（含2个半乳糖）等半乳糖化N-糖型的比例及分布，以评估Fc段末端半乳糖基化修饰的一致性，从而间接控制其对CDC活性及抗体构象稳定性的潜在影响。",
      "en": "Determine the proportions and distribution of galactosylated N-glycoforms such as G1F (one galactose) and G2F (two galactoses), assessing the consistency of Fc terminal galactosylation and indirectly controlling its impact on CDC activity and conformational stability."
    },
    "detectionIndicators": {
      "zh": "G1F、G2F分别占N-总糖链的相对比例（%）及合计比例；G1F/G2F的峰面积比值；HILIC-FLD糖谱叠加图",
      "en": "Relative proportions (%) of G1F and G2F within total N-glycans and their sum; G1F/G2F peak-area ratio; HILIC-FLD glycan profile overlay"
    },
    "similarityMethod": {
      "zh": "定量QR/实际范围＋图谱比较",
      "en": "Quantitative QR / actual range plus spectral comparison"
    },
    "judgingPrinciple": {
      "zh": "候选药与参照药在半乳糖化糖型（G1F、G2F）的分布及（G1F+G2F）总比例上应总体相似；若差异超出QR范围，需评估其对CDC活性及热稳定性（Tm，尤其CH2结构域）的潜在影响，并结合功能数据（CDC效价）进行风险论证",
      "en": "Distribution of galactosylated glycoforms (G1F, G2F) and their total (G1F+G2F) should be broadly similar to the reference; differences beyond the QR range require assessment of impact on CDC activity and thermal stability (Tm, especially the CH2 domain), with risk justification supported by CDC potency data"
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。",
      "en": "No universal numerical limit applies to all products. A risk-based quality-range approach may be used: QR = (μR − XσR, μR + XσR); X must be justified according to the risk of the attribute. If a sufficient proportion of batches (e.g. ≥90%) fall within the range, similarity of the attribute can be supported; means, SDs and distributions should also be compared."
    },
    "remark": {
      "zh": "G1F和G2F是Fc段N-糖链的主要半乳糖基化糖型；半乳糖位于N-糖链的末端，影响CDC活性（半乳糖越多，CDC通常越强）及CH2结构域的热稳定性（Tm值）",
      "en": "G1F and G2F are the major galactosylated Fc N-glycoforms; terminal galactose affects CDC activity (more galactose usually means stronger CDC) and CH2-domain thermal stability (Tm)"
    },
    "methods": [
      {
        "id": "galactosylation-g1f-g2f-primary-1",
        "name": {
          "zh": "释放N-糖链HILIC-FLD/LC-MS",
          "en": "Released N-glycan HILIC-FLD/LC-MS"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "释放N-糖链HILIC-FLD/LC-MS",
          "en": "Released N-glycan HILIC-FLD/LC-MS"
        }
      },
      {
        "id": "galactosylation-g1f-g2f-orthogonal-1",
        "name": {
          "zh": "完整/亚基分子量LC-MS",
          "en": "Intact/subunit molecular mass LC-MS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "完整/亚基分子量LC-MS；糖肽LC-MS/MS",
          "en": "Intact/subunit molecular mass LC-MS; Glycopeptide LC-MS/MS"
        }
      },
      {
        "id": "galactosylation-g1f-g2f-orthogonal-2",
        "name": {
          "zh": "糖肽LC-MS/MS",
          "en": "Glycopeptide LC-MS/MS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "完整/亚基分子量LC-MS；糖肽LC-MS/MS",
          "en": "Intact/subunit molecular mass LC-MS; Glycopeptide LC-MS/MS"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "high-mannose-glycans",
    "category": "ptm-glycosylation",
    "isSupplementary": true,
    "guidelineTerm": {
      "zh": "高甘露糖糖型",
      "en": "High-mannose glycoforms"
    },
    "itemName": {
      "zh": "Man5/Man6等高甘露糖糖型比例",
      "en": "Proportions of high-mannose glycoforms (Man5/Man6, etc.)"
    },
    "applicability": {
      "zh": "补充项；是否纳入取决于品种、工艺、作用机制和风险",
      "en": "Supplementary item; inclusion depends on product, process, mechanism of action and risk"
    },
    "purpose": {
      "zh": "确定候选药与参照药中Man5、Man6等高甘露糖型占N-总糖链的相对比例",
      "en": "Determine the relative proportions of high-mannose glycoforms such as Man5 and Man6 within total N-glycans"
    },
    "detectionIndicators": {
      "zh": "各高甘露糖型占N-总糖链的相对比例（%）；高甘露糖型总量 HILIC-FLD糖谱中高甘露糖型峰的面积及叠加图谱占N-总糖链的合计比例（%）； HILIC-FLD糖谱中高甘露糖型峰的面积及叠加图谱",
      "en": "Relative proportion (%) of each high-mannose glycoform within total N-glycans; total high-mannose content (%); high-mannose peak areas and overlay in the HILIC-FLD glycan profile"
    },
    "similarityMethod": {
      "zh": "定量QR/实际范围＋图谱比较",
      "en": "Quantitative QR / actual range plus spectral comparison"
    },
    "judgingPrinciple": {
      "zh": "候选药与参照药在高甘露糖型（Man5/Man6等）的分布及总量上应总体相似",
      "en": "Distribution and total amount of high-mannose glycoforms (Man5/Man6, etc.) should be broadly similar between candidate and reference"
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。",
      "en": "No universal numerical limit applies to all products. A risk-based quality-range approach may be used: QR = (μR − XσR, μR + XσR); X must be justified according to the risk of the attribute. If a sufficient proportion of batches (e.g. ≥90%) fall within the range, similarity of the attribute can be supported; means, SDs and distributions should also be compared."
    },
    "remark": {
      "zh": "高甘露糖型比例升高会加速抗体在体内的清除，导致血清半衰期（PK）缩短；Man5是目前最受关注的高甘露糖型",
      "en": "Elevated high-mannose glycoforms accelerate in-vivo clearance and shorten serum half-life (PK); Man5 is currently the most-watched high-mannose glycoform"
    },
    "methods": [
      {
        "id": "high-mannose-glycans-primary-1",
        "name": {
          "zh": "释放N-糖链HILIC-FLD/LC-MS",
          "en": "Released N-glycan HILIC-FLD/LC-MS"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "释放N-糖链HILIC-FLD/LC-MS",
          "en": "Released N-glycan HILIC-FLD/LC-MS"
        }
      },
      {
        "id": "high-mannose-glycans-orthogonal-1",
        "name": {
          "zh": "完整/亚基分子量LC-MS",
          "en": "Intact/subunit molecular mass LC-MS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "完整/亚基分子量LC-MS",
          "en": "Intact/subunit molecular mass LC-MS"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  },
  {
    "id": "core-fucosylation",
    "category": "ptm-glycosylation",
    "isSupplementary": true,
    "guidelineTerm": {
      "zh": "岩藻糖化/无岩藻糖糖型",
      "en": "Fucosylated / afucosylated glycoforms"
    },
    "itemName": {
      "zh": "核心岩藻糖水平",
      "en": "Core fucosylation level"
    },
    "applicability": {
      "zh": "补充项；是否纳入取决于品种、工艺、作用机制和风险",
      "en": "Supplementary item; inclusion depends on product, process, mechanism of action and risk"
    },
    "purpose": {
      "zh": "确定候选药与参照药在Fc段N-糖链核心岩藻糖基化水平上的相似性，以评估岩藻糖基化修饰对FcγRIIIa结合亲和力及ADCC活性的潜在影响",
      "en": "Determine similarity in the core fucosylation level of Fc N-glycans, assessing the impact of fucosylation on FcγRIIIa binding affinity and ADCC activity"
    },
    "detectionIndicators": {
      "zh": "有岩藻糖糖型占N-总糖链的合计比例（%）；无岩藻糖糖型占N-总糖链的合计比例（%）；岩藻糖基化指数（如有岩藻糖糖型总面积 / 无岩藻糖糖型总面积）；HILIC-FLD糖谱叠加图及岩藻糖基化相关峰群的分布",
      "en": "Total proportion (%) of fucosylated glycoforms; total proportion (%) of afucosylated glycoforms; fucosylation index (e.g. fucosylated / afucosylated total areas); HILIC-FLD glycan profile overlay and distribution of fucosylation-related peak clusters"
    },
    "similarityMethod": {
      "zh": "定量QR/实际范围＋图谱比较",
      "en": "Quantitative QR / actual range plus spectral comparison"
    },
    "judgingPrinciple": {
      "zh": "候选药与参照药在核心岩藻糖基化总体水平（即有岩藻糖/无岩藻糖糖型的相对比例）上应总体相似",
      "en": "The overall core fucosylation level (relative proportion of fucosylated vs afucosylated glycoforms) should be broadly similar between candidate and reference"
    },
    "numericLimit": {
      "zh": "无通用于所有品种的统一数值限度；可按风险采用质量范围法：QR=(μR−XσR, μR+XσR)；X需按属性风险论证；足够批次（如90%以上）落入可支持该属性相似，同时比较均值、SD和分布。",
      "en": "No universal numerical limit applies to all products. A risk-based quality-range approach may be used: QR = (μR − XσR, μR + XσR); X must be justified according to the risk of the attribute. If a sufficient proportion of batches (e.g. ≥90%) fall within the range, similarity of the attribute can be supported; means, SDs and distributions should also be compared."
    },
    "remark": {
      "zh": "核心岩藻糖（Fucose）连接于N-糖链根部（GlcNAc），通过空间位阻效应影响Fc段与FcγRIIIa（CD16a）的结合亲和力，是ADCC活性的关键调控因素",
      "en": "Core fucose attaches to the innermost GlcNAc of the N-glycan and, via steric hindrance, modulates Fc binding to FcγRIIIa (CD16a) — a key regulator of ADCC activity"
    },
    "methods": [
      {
        "id": "core-fucosylation-primary-1",
        "name": {
          "zh": "释放N-糖链HILIC-FLD/LC-MS",
          "en": "Released N-glycan HILIC-FLD/LC-MS"
        },
        "type": "primary",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "释放N-糖链HILIC-FLD/LC-MS",
          "en": "Released N-glycan HILIC-FLD/LC-MS"
        }
      },
      {
        "id": "core-fucosylation-orthogonal-1",
        "name": {
          "zh": "完整/亚基分子量LC-MS",
          "en": "Intact/subunit molecular mass LC-MS"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "完整/亚基分子量LC-MS；FcγRIIIa结合力（SPR）； ADCC报告基因活性测定",
          "en": "Intact/subunit molecular mass LC-MS; FcγRIIIa binding (SPR); ADCC reporter-gene activity assay"
        }
      },
      {
        "id": "core-fucosylation-orthogonal-2",
        "name": {
          "zh": "FcγRIIIa结合力（SPR）",
          "en": "FcγRIIIa binding (SPR)"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "完整/亚基分子量LC-MS；FcγRIIIa结合力（SPR）； ADCC报告基因活性测定",
          "en": "Intact/subunit molecular mass LC-MS; FcγRIIIa binding (SPR); ADCC reporter-gene activity assay"
        }
      },
      {
        "id": "core-fucosylation-orthogonal-3",
        "name": {
          "zh": "ADCC报告基因活性测定",
          "en": "ADCC reporter-gene activity assay"
        },
        "type": "orthogonal",
        "contentPlaceholder": true,
        "rawSourceText": {
          "zh": "完整/亚基分子量LC-MS；FcγRIIIa结合力（SPR）； ADCC报告基因活性测定",
          "en": "Intact/subunit molecular mass LC-MS; FcγRIIIa binding (SPR); ADCC reporter-gene activity assay"
        }
      }
    ],
    "analysisPlaceholder": {
      "candidateDataSlot": true,
      "referenceDataSlot": true,
      "resultSlot": true
    }
  }
];
