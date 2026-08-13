// AUTO-GENERATED FILE — do not edit by hand.
// Source of truth: 生物类似药评价指导原则/V0.1生物类似药药学比对研究质量属性、检测方法及相似性评价原则汇总表(1).xlsx
//   sheet: 1.法规框架 (read via openpyxl with data_only=True)
// Regenerate with: python scripts/generate_data.py
// NOTE: all `en` strings are machine-translation placeholders.
// TODO: 校对英文 (review the English translations).
import type { RegulatoryFramework } from "@/types/models";

export const regulatoryFramework: RegulatoryFramework = {
  "sourceTitle": {
    "zh": "生物类似药首次申报临床试验药学资料撰写指导原则",
    "en": "Guideline for Preparing CMC Documentation for Initial Clinical Trial Applications of Biosimilars"
  },
  "requirements": [
    {
      "id": "requirement-1",
      "ctdSection": "3.2.S.1.2/1.3",
      "subject": {
        "zh": "原料药基本信息",
        "en": "General information on the drug substance"
      },
      "requirement": {
        "zh": "提供氨基酸序列，明确糖基化位点或其他主要翻译后修饰（如有）和相对分子量，提供分子结构示意图；以及原料药的物理、化学以及其他相关性质，包括外观、pI值、消光系数、生物学性质（作用机制）等",
        "en": "Provide the amino acid sequence, identify glycosylation sites or other major post-translational modifications (if any) and the relative molecular mass, with a schematic molecular structure; also provide the physical, chemical and other relevant properties of the drug substance, including appearance, pI, extinction coefficient and biological properties (mechanism of action)."
      },
      "pageReference": "P2–3",
      "remark": {
        "zh": "基本信息≠完整特性鉴定；这里是结构与性质概述。",
        "en": "General information ≠ complete characterization; this is an overview of structure and properties."
      }
    },
    {
      "id": "requirement-2",
      "ctdSection": "3.2.S.3",
      "subject": {
        "zh": "结构和理化性质",
        "en": "Structure and physicochemical properties"
      },
      "requirement": {
        "zh": "提供一级、二级和高级结构、理化性质、翻译后修饰、生物学活性、纯度和免疫化学性质（如适用）的详细信息。",
        "en": "Provide detailed information on primary, secondary and higher-order structure, physicochemical properties, post-translational modifications, biological activity, purity and immunochemical properties (where applicable)."
      },
      "pageReference": "P12",
      "remark": {
        "zh": "",
        "en": ""
      }
    },
    {
      "id": "requirement-3",
      "ctdSection": "3.2.S.3",
      "subject": {
        "zh": "杂质",
        "en": "Impurities"
      },
      "requirement": {
        "zh": "提供产品相关杂质和工艺相关杂质研究，包括来源、检测方法以及代表性批次结果或安全性评估。",
        "en": "Provide studies of product-related and process-related impurities, including origin, analytical methods, and representative batch results or safety assessments."
      },
      "pageReference": "P13–16",
      "remark": {
        "zh": "产品相关杂质需比较结构/水平；工艺相关杂质由候选药工艺决定。",
        "en": "Product-related impurities require comparison of structure/levels; process-related impurities are determined by the candidate's process."
      }
    },
    {
      "id": "requirement-4",
      "ctdSection": "3.2.S.4",
      "subject": {
        "zh": "原料药质量控制",
        "en": "Drug substance quality control"
      },
      "requirement": {
        "zh": "列表提供质量标准（包括考察项目，可接受标准及分析方法）、分析方法、方法验证/确认信息、批分析和质量标准制定依据。",
        "en": "Provide, in tabular form, the specification (test items, acceptance criteria and analytical methods), analytical procedures, method validation/verification information, batch analyses and the justification of the specification."
      },
      "pageReference": "P16–18",
      "remark": {
        "zh": "质量标准限度≠分析方法性能标准≠相似性评价标准。",
        "en": "Specification limits ≠ analytical method performance criteria ≠ similarity assessment criteria."
      }
    },
    {
      "id": "requirement-5",
      "ctdSection": "3.2.S.7",
      "subject": {
        "zh": "原料药稳定性",
        "en": "Drug substance stability"
      },
      "requirement": {
        "zh": "提供长期、加速、影响因素、运输稳定性（如有）及贮存条件/有效期，并分析变化趋势、降解途径和速率。",
        "en": "Provide long-term, accelerated, stress and shipping stability (if any), storage conditions/shelf life, and analyze trends, degradation pathways and rates."
      },
      "pageReference": "P20–21",
      "remark": {
        "zh": "本品稳定性研究≠候选药与参照药稳定性相似性研究。",
        "en": "The product's own stability study ≠ candidate-vs-reference stability similarity study."
      }
    },
    {
      "id": "requirement-6",
      "ctdSection": "3.2.P.5",
      "subject": {
        "zh": "制剂质量控制",
        "en": "Drug product quality control"
      },
      "requirement": {
        "zh": "提供候选药制剂质量标准（包括考察项目、可接受标准以及分析方法），并与参照药质量标准对比；如有差异，进一步说明。",
        "en": "Provide the candidate drug product specification (test items, acceptance criteria and analytical methods) and compare it with the reference specification; explain any differences further."
      },
      "pageReference": "P28–31",
      "remark": {
        "zh": "",
        "en": ""
      }
    },
    {
      "id": "requirement-7",
      "ctdSection": "3.2.P.8",
      "subject": {
        "zh": "制剂稳定性",
        "en": "Drug product stability"
      },
      "requirement": {
        "zh": "提供制剂长期、加速、影响因素、运输稳定性（如有）和有效期支持资料。",
        "en": "Provide long-term, accelerated, stress and shipping stability (if any) of the drug product and supporting data for shelf life."
      },
      "pageReference": "P33–34",
      "remark": {
        "zh": "制剂稳定性同时受处方、包装系统和使用方式影响；与原料药稳定性分开整理。",
        "en": "Drug product stability is also affected by formulation, packaging system and mode of use; keep it separate from drug substance stability."
      }
    },
    {
      "id": "requirement-8",
      "ctdSection": "3.2.R.3/3.2.R.4",
      "subject": {
        "zh": "区域性附件",
        "en": "Regional annexes"
      },
      "requirement": {
        "zh": "提供分析方法验证/确认报告及稳定性研究典型图谱。",
        "en": "Provide analytical method validation/verification reports and representative stability chromatograms."
      },
      "pageReference": "P38",
      "remark": {
        "zh": "方法验证报告是证据附件，不是单独质量属性。",
        "en": "Method validation reports are evidence annexes, not standalone quality attributes."
      }
    },
    {
      "id": "requirement-9",
      "ctdSection": "3.2.R.6",
      "subject": {
        "zh": "生物类似药相似性分析报告",
        "en": "Biosimilar similarity analysis report"
      },
      "requirement": {
        "zh": "包括研究样品、评价方法、表征研究相似性、批分析相似性、稳定性相似性及差异影响分析。",
        "en": "Includes study samples, evaluation methods, characterization similarity, batch-analysis similarity, stability similarity and analysis of the impact of differences."
      },
      "pageReference": "P38–42",
      "remark": {
        "zh": "相似性结论必须建立在多层证据汇总上，不能只看单项是否落入范围。",
        "en": "The similarity conclusion must be built on the totality of multi-level evidence, not on whether a single item falls within range."
      }
    }
  ],
  "relations": [
    {
      "id": "relation-1",
      "ctdSection": "3.2.S.2",
      "subject": {
        "zh": "原料药生产",
        "en": "Drug substance manufacturing"
      },
      "relation": "indirectly-related"
    },
    {
      "id": "relation-2",
      "ctdSection": "3.2.S.5",
      "subject": {
        "zh": "对照品或标准品",
        "en": "Reference standards or materials"
      },
      "relation": "supportive"
    },
    {
      "id": "relation-3",
      "ctdSection": "3.2.S.6",
      "subject": {
        "zh": "容器密封系统",
        "en": "Container closure system"
      },
      "relation": "supportive"
    },
    {
      "id": "relation-4",
      "ctdSection": "3.2.P.1",
      "subject": {
        "zh": "制剂描述和组成",
        "en": "Description and composition of the drug product"
      },
      "relation": "supportive"
    },
    {
      "id": "relation-5",
      "ctdSection": "3.2.P.2",
      "subject": {
        "zh": "制剂开发",
        "en": "Pharmaceutical development"
      },
      "relation": "indirectly-related"
    },
    {
      "id": "relation-6",
      "ctdSection": "3.2.P.3",
      "subject": {
        "zh": "制剂生产",
        "en": "Drug product manufacturing"
      },
      "relation": "indirectly-related"
    },
    {
      "id": "relation-7",
      "ctdSection": "3.2.P.4",
      "subject": {
        "zh": "辅料控制",
        "en": "Control of excipients"
      },
      "relation": "supportive"
    },
    {
      "id": "relation-8",
      "ctdSection": "3.2.P.6",
      "subject": {
        "zh": "对照品或标准品",
        "en": "Reference standards or materials"
      },
      "relation": "supportive"
    },
    {
      "id": "relation-9",
      "ctdSection": "3.2.P.7",
      "subject": {
        "zh": "容器密封系统",
        "en": "Container closure system"
      },
      "relation": "supportive"
    }
  ]
};
