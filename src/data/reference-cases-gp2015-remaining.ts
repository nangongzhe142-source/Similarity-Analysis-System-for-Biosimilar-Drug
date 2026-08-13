/**
 * GP2015 reference cases for the remaining A-class characterization items
 * (26 items across 6 categories). Merged into reference-cases.ts.
 *
 * TODO: 校对英文
 */
import type { ReferenceCase } from "@/types/models";
import {
  GLYCAN_NAMING_CAVEAT,
  MEAN_AND_RANGE_ROWS_LABEL,
  TIER_2_QUALITY_RANGE_CRITERION,
  TIER_3_DESCRIPTIVE_CRITERION,
  TRANSLATION_ONLY_CAVEAT,
  gp2015Source,
  gp2015Verification,
} from "@/data/reference-cases-shared";

/** Per-lot acidic variants from Table 4-39 (CZE). */
function table439Rows(
  column: "acidic" | "main" | "basic",
  values: Array<{ lot: string; candidate: string; ref: string }>,
) {
  const labels = {
    acidic: { zh: "酸性变异体 [%]", en: "Acidic variants [%]" },
    main: { zh: "主电荷峰 [%]", en: "Main peak [%]" },
    basic: { zh: "碱性变异体 [%]", en: "Basic variants [%]" },
  };
  return {
    caption: {
      zh: `表 4-39 ${labels[column].zh}（CZE，节选逐批）`,
      en: `Table 4-39 ${labels[column].en} (CZE, excerpt per lot)`,
    },
    rows: values.map((row) => ({
      label: { zh: row.lot, en: row.lot },
      candidateValue: row.candidate,
      referenceUsValue: row.ref,
      referenceEuValue: row.ref,
    })),
  };
}

export const gp2015RemainingReferenceCases: Record<string, ReferenceCase[]> = {
  // -------------------------------------------------------------------------
  // 电荷变异体 (3)
  // -------------------------------------------------------------------------
  "acidic-charge-variants": [
    {
      id: "gp2015-acidic-charge-cze",
      evidenceLevel: "regulatory-verified",
      tier: "tier-2",
      source: gp2015Source(
        "表 4-39（CZE）；cIEF 图 4-98（chunk_14）",
        "Table 4-39 (CZE); cIEF Figure 4-98 (chunk_14)",
      ),
      methodUsed: {
        zh: "毛细管区带电泳（CZE）；正交方法 cIEF",
        en: "Capillary zone electrophoresis (CZE); orthogonal method cIEF",
      },
      headline: {
        zh: "酸性变异体比例存在 minor 差异，审评认定整体仍支持高度相似；差异部分与 C 端赖氨酸及唾液酸化有关。",
        en: "Acidic variant levels show minor differences; the review still found overall support for high similarity, partly attributable to C-terminal lysine and sialylation.",
      },
      dataTables: [
        table439Rows("acidic", [
          { lot: "#B213820 (DS)", candidate: "16.6", ref: "" },
          { lot: "#VB25B3 (DP)", candidate: "17.4", ref: "" },
          { lot: "#G75422 (Enbrel)", candidate: "", ref: "13.5" },
          { lot: "#1035224 (Enbrel)", candidate: "", ref: "12.6" },
        ]),
      ],
      acceptanceCriterion: TIER_2_QUALITY_RANGE_CRITERION,
      reviewerConclusion: {
        zh: "CZE 与 cIEF 显示 GP2015 与 US/EU Enbrel 存在相对 minor 的电荷变异体差异，整体支持高度相似。2D-DIGE 提示酸性变异体差异可由唾液酸化 N-糖链差异及 US Enbrel 更高的 C 端 Lys 解释，审评认为合理。",
        en: "CZE and cIEF showed relatively minor charge-variant differences between GP2015 and US/EU Enbrel, overall supporting high similarity. 2D-DIGE suggested acidic differences can be explained by sialylated N-glycan differences and higher C-terminal Lys in US Enbrel, which the review found reasonable.",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\n参照药 6 批 Enbrel 未在表 4-39 中分列 US/EU。表 4-41（cIEF 各 peak group 丰度）原文未复制。框架首选 CEX-HPLC/icIEF，本案例实际用 CZE。`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\nThe 6 Enbrel lots in Table 4-39 are not split between US and EU. Table 4-41 (cIEF peak group abundances) was not reproduced. The framework's preferred methods are CEX-HPLC/icIEF; this case used CZE.`,
      },
      verification: gp2015Verification(
        ["chunk_14.md"],
        ["#B213820|16.6", "#VB25B3|17.4", "#1035224|12.6", "#G75422|13.5"],
      ),
    },
  ],

  "main-charge-peak": [
    {
      id: "gp2015-main-charge-cze",
      evidenceLevel: "regulatory-verified",
      tier: "tier-2",
      source: gp2015Source("表 4-39（CZE）", "Table 4-39 (CZE)"),
      methodUsed: {
        zh: "毛细管区带电泳（CZE）",
        en: "Capillary zone electrophoresis (CZE)",
      },
      headline: {
        zh: "GP2015 主电荷峰比例高于 US/EU Enbrel，与 C 端赖氨酸及错误桥连变异体在碱性峰中的贡献相关。",
        en: "GP2015 main charge peak is higher than US/EU Enbrel, related to C-terminal lysine and wrongly bridged variants contributing to basic peaks.",
      },
      dataTables: [
        table439Rows("main", [
          { lot: "#B213820 (DS)", candidate: "70.6", ref: "" },
          { lot: "#CS2951 (DP)", candidate: "63.7", ref: "" },
          { lot: "#1035224 (Enbrel)", candidate: "", ref: "46.3" },
          { lot: "#H50892 (Enbrel)", candidate: "", ref: "49.7" },
        ]),
      ],
      acceptanceCriterion: TIER_2_QUALITY_RANGE_CRITERION,
      reviewerConclusion: {
        zh: "主峰 GP2015 高于 US/EU Enbrel；差异部分归因于 C 端赖氨酸水平及 misfolded 峰（错误桥连二硫键变异体）对碱性/主峰归属的影响。整体仍支持高度相似。",
        en: "The main peak of GP2015 is higher than US/EU Enbrel; the difference is partly attributed to C-terminal lysine levels and misfolded peaks (wrongly bridged disulfide variants) affecting basic/main peak assignment. Overall still supports high similarity.",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\nEnbrel 未分列 US/EU。方法为 CZE 而非框架首选 CEX-HPLC/icIEF。`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\nEnbrel lots are not split US/EU. Method is CZE rather than the framework's preferred CEX-HPLC/icIEF.`,
      },
      verification: gp2015Verification(
        ["chunk_14.md"],
        ["#B213820|70.6", "#CS2951|63.7", "#1035224|46.3", "#H50892|49.7"],
      ),
    },
  ],

  "basic-charge-variants": [
    {
      id: "gp2015-basic-charge-cze",
      evidenceLevel: "regulatory-verified",
      tier: "tier-2",
      source: gp2015Source("表 4-39、表 4-40（CpB 处理，chunk_14）", "Table 4-39, Table 4-40 (CpB treatment, chunk_14)"),
      methodUsed: {
        zh: "毛细管区带电泳（CZE）；CpB 处理确证 C 端 Lys 贡献",
        en: "Capillary zone electrophoresis (CZE); CpB treatment to confirm C-terminal Lys contribution",
      },
      headline: {
        zh: "碱性变异体 GP2015 显著低于 Enbrel；CpB 处理后 Enbrel 碱性峰降低但仍偏高，剩余部分来自错误桥连二硫键变异体。",
        en: "Basic variants are significantly lower in GP2015 than Enbrel; after CpB treatment Enbrel basic peaks decrease but remain elevated, with the remainder from wrongly bridged disulfide variants.",
      },
      dataTables: [
        table439Rows("basic", [
          { lot: "#CS2951 (DP)", candidate: "20.4", ref: "" },
          { lot: "#1035224 (Enbrel)", candidate: "", ref: "41.1" },
          { lot: "#G75422 (Enbrel)", candidate: "", ref: "39.4" },
        ]),
        {
          caption: {
            zh: "CpB 处理后碱性变异体 [%]（正文，表 4-40 未复制）",
            en: "Basic variants [%] after CpB (narrative; Table 4-40 not reproduced)",
          },
          rows: [
            {
              label: { zh: "GP2015 DP", en: "GP2015 DP" },
              candidateValue: "15.7–20.6",
              referenceUsValue: "22.8–24.5",
              referenceEuValue: "22.8–24.5",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_2_QUALITY_RANGE_CRITERION,
      reviewerConclusion: {
        zh: "US/EU Enbrel 碱性变异体高于 GP2015。CpB 处理后 US/EU Enbrel 碱性峰从 36.1–41.1% 降至 22.8–24.5%，接近 GP2015 DP（15.7–20.6%），证明 C 端 Lys 有显著贡献；仍偏高的碱性峰来自错误桥连二硫键变异体。C 端 Lys 有无不影响分子生物学功能。",
        en: "US/EU Enbrel basic variants are higher than GP2015. After CpB, US/EU Enbrel basic peaks fell from 36.1–41.1% to 22.8–24.5%, approaching GP2015 DP (15.7–20.6%), demonstrating significant C-terminal Lys contribution; remaining basic peaks come from wrongly bridged disulfide variants. Presence or absence of C-terminal Lys does not affect molecular biological function.",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\nCpB 数据来自正文，表 4-40 未复制。Enbrel CpB 结果未分列 US/EU。`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\nCpB data comes from the narrative; Table 4-40 was not reproduced. Enbrel CpB results are not split US/EU.`,
      },
      verification: gp2015Verification(
        ["chunk_14.md", "chunk_13.md"],
        ["#CS2951|20.4", "#1035224|41.1", "22.8–24.5", "15.7–20.6"],
      ),
    },
  ],

  // -------------------------------------------------------------------------
  // 翻译后修饰与糖基化 (12)
  // -------------------------------------------------------------------------
  "ptm-modification-1": [
    {
      id: "gp2015-glycation",
      evidenceLevel: "regulatory-narrative",
      tier: "tier-3",
      source: gp2015Source("糖化章节（chunk_12）", "Glycation section (chunk_12)"),
      methodUsed: {
        zh: "硼酸亲和色谱",
        en: "Boronate affinity chromatography",
      },
      headline: {
        zh: "GP2015 糖化水平约为 US/EU Enbrel 的一半，属 Tier 3 属性。",
        en: "GP2015 glycation is about half that of US/EU Enbrel; a Tier 3 attribute.",
      },
      dataTables: [
        {
          caption: { zh: "糖化水平 [%]", en: "Glycation level [%]" },
          rows: [
            {
              label: { zh: "GP2015 DS/DP", en: "GP2015 DS/DP" },
              candidateValue: "1.18–1.38",
              referenceUsValue: "2.79–3.81",
              referenceEuValue: "2.79–3.81",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_3_DESCRIPTIVE_CRITERION,
      reviewerConclusion: {
        zh: "US/EU Enbrel 糖化至少为 GP2015 的 2 倍。糖化为 Tier 3 属性，未影响相似性结论。",
        en: "US/EU Enbrel glycation is at least twice GP2015. Glycation is Tier 3 and did not affect the similarity conclusion.",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\n框架首选肽图 LC-MS/MS，本案例用硼酸亲和色谱。参照药未分列 US/EU。`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\nFramework preferred peptide mapping LC-MS/MS; this case used boronate affinity chromatography. Reference not split US/EU.`,
      },
      verification: gp2015Verification(["chunk_12.md"], ["1.18–1.38", "2.79–3.81"]),
    },
  ],

  "ptm-modification-2": [
    {
      id: "gp2015-dkp",
      evidenceLevel: "regulatory-narrative",
      tier: "tier-3",
      source: gp2015Source("N 端降解产物 DKP（chunk_10）", "N-terminal DKP degradation (chunk_10)"),
      methodUsed: { zh: "LC-ESI-MS", en: "LC-ESI-MS" },
      headline: {
        zh: "N 端二酮哌嗪（DKP）水平反映蛋白龄期，GP2015 较新批次低于 Enbrel。",
        en: "N-terminal diketopiperazine (DKP) reflects product age; fresher GP2015 lots are lower than Enbrel.",
      },
      dataTables: [
        {
          caption: { zh: "DKP 水平 [%]", en: "DKP level [%]" },
          rows: [
            {
              label: { zh: "GP2015 DS", en: "GP2015 DS" },
              candidateValue: "<LOQ–0.06",
              referenceUsValue: "0.76–1.29",
              referenceEuValue: "0.64–1.27",
            },
            {
              label: { zh: "GP2015 DP", en: "GP2015 DP" },
              candidateValue: "0.31–1.92",
              referenceUsValue: "0.76–1.29",
              referenceEuValue: "0.64–1.27",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_3_DESCRIPTIVE_CRITERION,
      reviewerConclusion: {
        zh: "DKP 水平反映龄期的论述有数据支持（CS2951 1.92%、DR0917 1.04% 接近有效期）。该属性归为 Tier 3 适当。",
        en: "The age-reflecting DKP argument is supported (CS2951 1.92%, DR0917 1.04% near expiry). Tier 3 classification is appropriate.",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\nDS 贮存温度信息被 (b)(4) 涂黑。`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\nDS storage temperature information was redacted under (b)(4).`,
      },
      verification: gp2015Verification(
        ["chunk_10.md"],
        ["0.31–1.92", "0.76–1.29", "1.92%", "CS2951"],
      ),
    },
  ],

  "glycan-g0f": [
    {
      id: "gp2015-bg0-terminal-glcna",
      evidenceLevel: "regulatory-verified",
      tier: "tier-2",
      source: gp2015Source("末端 GlcNAc bG0 审评员制表（chunk_12）", "Terminal GlcNAc bG0 reviewer table (chunk_12)"),
      methodUsed: { zh: "NP-HPLC", en: "NP-HPLC" },
      methodDeviationNote: GLYCAN_NAMING_CAVEAT,
      headline: {
        zh: "末端 GlcNAc 变异体（bG0）三者均值接近，GP2015 处于 US/EU Enbrel 宽范围中部。",
        en: "Terminal GlcNAc variant (bG0) means are similar; GP2015 sits in the middle of the wide US/EU Enbrel range.",
      },
      dataTables: [
        {
          caption: { zh: "末端 GlcNAc 变异体 bG0 [%]", en: "Terminal GlcNAc variant bG0 [%]" },
          rows: [
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.mean,
              candidateValue: "17.8 (18)",
              referenceUsValue: "17.9 (18)",
              referenceEuValue: "18.1 (33)",
            },
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.range,
              candidateValue: "14.1–21.7",
              referenceUsValue: "4.3–31.5",
              referenceEuValue: "0.9–35.3",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_2_QUALITY_RANGE_CRITERION,
      reviewerConclusion: {
        zh: "US/EU Enbrel GlcNAc 糖链范围宽，GP2015 水平一致且处于全范围中部。",
        en: "US/EU Enbrel GlcNAc glycan range is wide; GP2015 is consistent and in the middle of the full range.",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\n${GLYCAN_NAMING_CAVEAT.zh}`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\n${GLYCAN_NAMING_CAVEAT.en}`,
      },
      verification: gp2015Verification(
        ["chunk_12.md"],
        ["17.8 (18)", "17.9 (18)", "18.1 (33)", "14.1–21.7"],
      ),
    },
  ],

  "other-n-glycans": [
    {
      id: "gp2015-alpha-gal-other-glycans",
      evidenceLevel: "regulatory-verified",
      tier: "tier-2",
      source: gp2015Source("α-半乳糖基化审评员制表；N-糖链定量正文（chunk_12）", "Alpha-gal reviewer table; N-glycan narrative (chunk_12)"),
      methodUsed: { zh: "NP-HPLC-MS（2AB 标记释放糖链）", en: "NP-HPLC-MS (2AB-labelled released glycans)" },
      methodDeviationNote: GLYCAN_NAMING_CAVEAT,
      headline: {
        zh: "α-半乳糖基化在 Enbrel 范围内；全分子 bG2/bG2-F 等糖型存在差异但总体可接受。",
        en: "Alpha-galactosylation is within the Enbrel range; whole-molecule bG2/bG2-F and other glycoforms differ but are overall acceptable.",
      },
      dataTables: [
        {
          caption: { zh: "α-半乳糖基化 N-糖链 [%]", en: "Alpha-galactosylated N-glycans [%]" },
          rows: [
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.mean,
              candidateValue: "1.8 (18)",
              referenceUsValue: "0.55 (18)",
              referenceEuValue: "0.55 (33)",
            },
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.range,
              candidateValue: "-1.39–2.49",
              referenceUsValue: "-1.39–2.49",
              referenceEuValue: "-1.82–3.01",
            },
          ],
        },
        {
          caption: {
            zh: "主要糖型差异（正文范围值，表 4-22 未复制）",
            en: "Major glycoform differences (narrative ranges; Table 4-22 not reproduced)",
          },
          rows: [
            {
              label: { zh: "bG2（总，DP）", en: "bG2 (total, DP)" },
              candidateValue: "41.4–44.1",
              referenceUsValue: "32.5–34.4",
              referenceEuValue: "32.5–34.4",
            },
            {
              label: { zh: "bG2-F（总，DP）", en: "bG2-F (total, DP)" },
              candidateValue: "8.8–10",
              referenceUsValue: "18.5–20.41",
              referenceEuValue: "18.5–20.41",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_2_QUALITY_RANGE_CRITERION,
      reviewerConclusion: {
        zh: "α-半乳糖基化相对丰度在 US/EU Enbrel 范围内。TNFR2 区糖链组成与 Enbrel 不同，但糖链不在结合位点附近，TNF-α 结合无显著差异；PK 相似性已满足，总体糖链结构差异可接受。",
        en: "Alpha-galactosylation relative abundance is within the US/EU Enbrel range. TNFR2-region glycan composition differs from Enbrel, but glycans are not near the binding site and TNF-α binding shows no significant difference; PK similarity was met and overall glycan structural differences are acceptable.",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\n${GLYCAN_NAMING_CAVEAT.zh}\n\n表 4-22/4-23/4-24 原文未复制。`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\n${GLYCAN_NAMING_CAVEAT.en}\n\nTables 4-22/4-23/4-24 were not reproduced.`,
      },
      verification: gp2015Verification(
        ["chunk_12.md"],
        ["1.8 (18)", "0.55 (18)", "41.4–44.1", "18.5–20.41", "8.8–10"],
      ),
    },
  ],

  "sialic-acid-ngna": [
    {
      id: "gp2015-ngna",
      evidenceLevel: "regulatory-verified",
      tier: "tier-2",
      source: gp2015Source("NGNA 审评员制表（chunk_12）", "NGNA reviewer table (chunk_12)"),
      methodUsed: { zh: "DMB 标记 + RP 色谱", en: "DMB labelling + RP chromatography" },
      headline: {
        zh: "NGNA 小差异 unlikely 有临床意义；EU pre-shift 批略高。",
        en: "Small NGNA differences are unlikely clinically significant; EU pre-shift lots slightly higher.",
      },
      dataTables: [
        {
          caption: { zh: "NGNA（mol/mol）", en: "NGNA (mol/mol)" },
          rows: [
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.mean,
              candidateValue: "0.22 (6)",
              referenceUsValue: "0.0 (3)",
              referenceEuValue: "0.14 (5)",
            },
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.range,
              candidateValue: "0.09–0.34",
              referenceUsValue: "0",
              referenceEuValue: "-0.44–0.72",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_2_QUALITY_RANGE_CRITERION,
      reviewerConclusion: {
        zh: "NGNA 在人体具免疫原性；GP2015 与 US/EU Enbrel 的小差异 unlikely 有临床意义。",
        en: "NGNA is immunogenic in humans; small differences between GP2015 and US/EU Enbrel are unlikely clinically significant.",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\nUS Enbrel 仅 3 批。EU pre-shift 批 33469、35828 NGNA 1.2–1.5%（表 4-28 未复制）。`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\nOnly 3 US Enbrel lots. EU pre-shift lots 33469, 35828 NGNA 1.2–1.5% (Table 4-28 not reproduced).`,
      },
      verification: gp2015Verification(
        ["chunk_12.md"],
        ["0.22 (6)", "0.0 (3)", "0.14 (5)", "0.09–0.34"],
      ),
    },
  ],

  "sialic-acid-nana": [
    {
      id: "gp2015-nana-0s1s2s",
      evidenceLevel: "regulatory-verified",
      tier: "tier-2",
      source: gp2015Source("NANA 与 0S/1S/2S 审评员制表（chunk_12）", "NANA and 0S/1S/2S reviewer tables (chunk_12)"),
      methodUsed: {
        zh: "DMB 标记；WAX 分离 0S/1S/2S",
        en: "DMB labelling; WAX separation of 0S/1S/2S",
      },
      headline: {
        zh: "整体 NANA 在质量范围内；0S/1S 亚型略 outside 但未影响 PK。",
        en: "Overall NANA is within the quality range; 0S/1S subtypes slightly outside but did not affect PK.",
      },
      dataTables: [
        {
          caption: { zh: "NANA（mol/mol）", en: "NANA (mol/mol)" },
          rows: [
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.mean,
              candidateValue: "27.10 (6)",
              referenceUsValue: "29.1 (3)",
              referenceEuValue: "29 (5)",
            },
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.range,
              candidateValue: "24.3–29.9",
              referenceUsValue: "23.2–32",
              referenceEuValue: "26–31.8",
            },
          ],
        },
        {
          caption: { zh: "0S [%]（WAX）", en: "0S [%] (WAX)" },
          rows: [
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.mean,
              candidateValue: "57.5 (17)",
              referenceUsValue: "50 (15)",
              referenceEuValue: "51.4 (29)",
            },
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.range,
              candidateValue: "45.2–69.7",
              referenceUsValue: "41.4–58.6",
              referenceEuValue: "40.7–62.1",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_2_QUALITY_RANGE_CRITERION,
      reviewerConclusion: {
        zh: "GP2015 在 2S 与整体 NANA 的质量范围内；0S、1S 略 outside。整体唾液酸化无显著差异，亚型差异未影响 PK（兔 PK 研究支持）。",
        en: "GP2015 is within the quality range for 2S and overall NANA; 0S and 1S slightly outside. Overall sialylation shows no significant difference and subtype differences did not affect PK (rabbit PK study supportive).",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\nEU 2S range 原文 OCR 为 5.5-15.231.8，待 PDF 核对。`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\nEU 2S range OCR in source reads 5.5-15.231.8, pending PDF reconciliation.`,
      },
      verification: gp2015Verification(
        ["chunk_12.md"],
        ["27.10 (6)", "57.5 (17)", "45.2–69.7", "24.3–29.9"],
      ),
    },
  ],

  "methionine-tryptophan-oxidation": [
    {
      id: "gp2015-oxidation-l1",
      evidenceLevel: "regulatory-verified",
      tier: "tier-2",
      source: gp2015Source("氧化 L1 肽段审评员制表（chunk_14）", "Oxidation L1 peptide reviewer table (chunk_14)"),
      methodUsed: {
        zh: "还原肽图 RP-HPLC，以 L1 肽段（1–34）为氧化 surrogate",
        en: "Reduced peptide map RP-HPLC, L1 peptide (1–34) as oxidation surrogate",
      },
      headline: {
        zh: "氧化水平 GP2015 与 US/EU Enbrel 无显著差异。",
        en: "Oxidation levels show no significant difference between GP2015 and US/EU Enbrel.",
      },
      dataTables: [
        {
          caption: { zh: "氧化（L1 肽段）[%]", en: "Oxidation (L1 peptide) [%]" },
          rows: [
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.mean,
              candidateValue: "2.5 (17)",
              referenceUsValue: "2.4 (8)",
              referenceEuValue: "2.6 (15)",
            },
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.range,
              candidateValue: "0.8–4.2",
              referenceUsValue: "0.3–4.6",
              referenceEuValue: "1.5–3.7",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_2_QUALITY_RANGE_CRITERION,
      reviewerConclusion: {
        zh: "GP2015 与 US/EU Enbrel 无显著差异；以 L1 为 surrogate 的 rationale 成立。",
        en: "No significant difference between GP2015 and US/EU Enbrel; the L1 surrogate rationale is accepted.",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\n表 4-38 原文未复制。`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\nTable 4-38 was not reproduced.`,
      },
      verification: gp2015Verification(
        ["chunk_14.md"],
        ["2.5 (17)", "2.4 (8)", "2.6 (15)", "0.8–4.2"],
      ),
    },
  ],

  "asn-deamidation": [
    {
      id: "gp2015-deamidation-pennyk",
      evidenceLevel: "regulatory-verified",
      tier: "tier-2",
      source: gp2015Source("脱酰胺 PENNYK 审评员制表（chunk_14）", "Deamidation PENNYK reviewer table (chunk_14)"),
      methodUsed: {
        zh: "还原肽图，Fc 区 PENNYK 肽段（L20）为脱酰胺 surrogate",
        en: "Reduced peptide map, Fc-region PENNYK peptide (L20) as deamidation surrogate",
      },
      headline: {
        zh: "GP2015 脱酰胺略低于 US/EU Enbrel，处于 US Enbrel 范围内，可接受。",
        en: "GP2015 deamidation is slightly lower than US/EU Enbrel, within the US Enbrel range, acceptable.",
      },
      dataTables: [
        {
          caption: { zh: "脱酰胺（PENNYK）[%]", en: "Deamidation (PENNYK) [%]" },
          rows: [
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.mean,
              candidateValue: "1.85 (13)",
              referenceUsValue: "2.6 (19)",
              referenceEuValue: "2.9 (24)",
            },
            {
              label: {
                zh: "范围（均值 ± 3SD）— 仅 US/EU 可引用",
                en: "Range (mean ± 3SD) — US/EU only citable",
              },
              candidateValue: "见 dataCaveat（OCR 损坏）",
              referenceUsValue: "0.2–5",
              referenceEuValue: "1.4–4.4",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_2_QUALITY_RANGE_CRITERION,
      reviewerConclusion: {
        zh: "GP2015 略低于 US/EU Enbrel，处于 US Enbrel 范围内；差异可能与批次龄期有关，可接受。",
        en: "GP2015 is slightly lower than US/EU Enbrel, within the US Enbrel range; difference may relate to lot age, acceptable.",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\nOCR 损坏：GP2015 的 range 原文为 1.2–1.5，与 mean 1.85 自相矛盾，该 range 不可引用，待回 PDF 核对。表中 mean 1.85 (13) 仍来自审评员制表。\n\n正文另给 GP2015 DP 1.8–2.2% vs US/EU 2.2–3.4%（表 4-37 未复制）。`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\nOCR damage: GP2015 range in source reads 1.2–1.5, contradicting mean 1.85 — that range must not be cited, pending PDF reconciliation. Mean 1.85 (13) still comes from the reviewer table.\n\nNarrative also gives GP2015 DP 1.8–2.2% vs US/EU 2.2–3.4% (Table 4-37 not reproduced).`,
      },
      verification: gp2015Verification(
        ["chunk_14.md"],
        ["1.85 (13)", "2.6 (19)", "2.9 (24)", "0.2–5", "1.4–4.4"],
        true,
      ),
    },
  ],

  "c-terminal-lysine-processing": [
    {
      id: "gp2015-c-terminal-lys-1k",
      evidenceLevel: "regulatory-verified",
      tier: "tier-2",
      source: gp2015Source("C 端 Lys(1K) 审评员制表（chunk_13）", "C-terminal Lys(1K) reviewer table (chunk_13)"),
      methodUsed: {
        zh: "还原肽图定量 + CZE 电荷变异体（CpB 确证）",
        en: "Reduced peptide map quantification + CZE charge variants (CpB confirmation)",
      },
      headline: {
        zh: "GP2015 C 端 Lys 显著低于 Enbrel，不影响分子生物学功能。",
        en: "GP2015 C-terminal Lys is significantly lower than Enbrel; does not affect molecular biological function.",
      },
      dataTables: [
        {
          caption: { zh: "C 端 Lys (1K) [%]", en: "C-terminal Lys (1K) [%]" },
          rows: [
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.mean,
              candidateValue: "1.1",
              referenceUsValue: "16.3",
              referenceEuValue: "13.8",
            },
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.range,
              candidateValue: "-1.94–4.14",
              referenceUsValue: "7.2–25.4",
              referenceEuValue: "0.87–26.6",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_2_QUALITY_RANGE_CRITERION,
      reviewerConclusion: {
        zh: "C 端赖氨酸有无不影响分子生物学功能；mAb C 端 Lys 在体内快速剪切，Fc 融合蛋白极 likely 相同。",
        en: "Presence or absence of C-terminal lysine does not affect molecular biological function; mAb C-terminal Lys is rapidly clipped in vivo, very likely the same for Fc fusion proteins.",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\nmean 行未标注批次数（与糖基化表格式不同）。`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\nMean row lacks lot count (unlike glycan table format).`,
      },
      verification: gp2015Verification(
        ["chunk_13.md"],
        ["1.1", "16.3", "13.8", "-1.94–4.14", "7.2–25.4"],
      ),
    },
  ],

  "galactosylation-g1f-g2f": [
    {
      id: "gp2015-bg2-bg2f",
      evidenceLevel: "regulatory-narrative",
      tier: "tier-2",
      source: gp2015Source("N-糖链定量正文（chunk_12）", "N-glycan quantitative narrative (chunk_12)"),
      methodUsed: { zh: "NP-HPLC-MS（2AB 标记）", en: "NP-HPLC-MS (2AB labelling)" },
      methodDeviationNote: GLYCAN_NAMING_CAVEAT,
      headline: {
        zh: "bG2 高于 Enbrel、bG2-F 低于 Enbrel，Fc 区主要糖型 bG1/bG0 差异较小。",
        en: "bG2 is higher and bG2-F lower than Enbrel; major Fc-region glycoforms bG1/bG0 differ little.",
      },
      dataTables: [
        {
          caption: { zh: "半乳糖基化相关糖型（全分子，DP）[%]", en: "Galactosylation-related glycoforms (whole molecule, DP) [%]" },
          rows: [
            {
              label: { zh: "bG2", en: "bG2" },
              candidateValue: "41.4–44.1",
              referenceUsValue: "32.5–34.4",
              referenceEuValue: "32.5–34.4",
            },
            {
              label: { zh: "bG2-F", en: "bG2-F" },
              candidateValue: "8.8–10",
              referenceUsValue: "18.5–20.41",
              referenceEuValue: "18.5–20.41",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_2_QUALITY_RANGE_CRITERION,
      reviewerConclusion: {
        zh: "Fc 区主要糖型 bG1、bG0 差异较小；总体糖链结构差异可接受。",
        en: "Major Fc-region glycoforms bG1 and bG0 differ little; overall glycan structural differences are acceptable.",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\n${GLYCAN_NAMING_CAVEAT.zh}\n\nbG1 无独立定量；数值为正文范围，非审评员统计表。`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\n${GLYCAN_NAMING_CAVEAT.en}\n\nNo separate bG1 quantification; values are narrative ranges, not reviewer statistics tables.`,
      },
      verification: gp2015Verification(
        ["chunk_12.md"],
        ["41.4–44.1", "32.5–34.4", "8.8–10", "18.5–20.41"],
      ),
    },
  ],

  "high-mannose-glycans": [
    {
      id: "gp2015-mannose5",
      evidenceLevel: "regulatory-narrative",
      tier: "tier-2",
      source: gp2015Source("N-糖链定量正文（chunk_12）", "N-glycan quantitative narrative (chunk_12)"),
      methodUsed: { zh: "NP-HPLC-MS", en: "NP-HPLC-MS" },
      methodDeviationNote: GLYCAN_NAMING_CAVEAT,
      headline: {
        zh: "高甘露糖 mannose-5 US/EU Enbrel 高于 GP2015，PK 相似性已满足，影响 minimal。",
        en: "High-mannose mannose-5 is higher in US/EU Enbrel than GP2015; PK similarity met, impact minimal.",
      },
      dataTables: [
        {
          caption: { zh: "mannose-5 [%]", en: "mannose-5 [%]" },
          rows: [
            {
              label: { zh: "Fc 区（DP）", en: "Fc region (DP)" },
              candidateValue: "0.6–0.9",
              referenceUsValue: "1–10.1",
              referenceEuValue: "1–10.1",
            },
            {
              label: { zh: "TNFR2 区（DP）", en: "TNFR2 region (DP)" },
              candidateValue: "0.2–0.6",
              referenceUsValue: "2.8–4.6",
              referenceEuValue: "2.8–4.6",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_2_QUALITY_RANGE_CRITERION,
      reviewerConclusion: {
        zh: "US/EU Enbrel mannose-5 高于 GP2015；PK 相似性标准已满足，高甘露糖差异影响 minimal。",
        en: "US/EU Enbrel mannose-5 is higher than GP2015; PK similarity criteria met, high-mannose difference impact minimal.",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\n${GLYCAN_NAMING_CAVEAT.zh}\n\n数值为正文范围，分 Fc 区与 TNFR2 区。`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\n${GLYCAN_NAMING_CAVEAT.en}\n\nValues are narrative ranges, split Fc vs TNFR2 region.`,
      },
      verification: gp2015Verification(
        ["chunk_12.md"],
        ["0.6–0.9", "1–10.1", "0.2–0.6", "2.8–4.6"],
      ),
    },
  ],

  "core-fucosylation": [
    {
      id: "gp2015-bgx-minus-f",
      evidenceLevel: "regulatory-verified",
      tier: "tier-2",
      source: gp2015Source("非岩藻糖 bGX(-F) 审评员制表；Fc 区 IR 回复（chunk_12）", "Afucosylated bGX(-F) reviewer table; Fc-region IR response (chunk_12)"),
      methodUsed: { zh: "NP-HPLC（bGX(-F) 求和）", en: "NP-HPLC (bGX(-F) summation)" },
      methodDeviationNote: GLYCAN_NAMING_CAVEAT,
      headline: {
        zh: "全分子非岩藻糖化水平 GP2015 显著低于 Enbrel；Fc 区专项数据解释 ADCC 差异分子基础。",
        en: "Whole-molecule afucosylation is significantly lower in GP2015 than Enbrel; Fc-region data explain the molecular basis of ADCC differences.",
      },
      dataTables: [
        {
          caption: { zh: "非岩藻糖 bGX(-F) 全分子 [%]", en: "Afucosylated bGX(-F) whole molecule [%]" },
          rows: [
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.mean,
              candidateValue: "11.04 (8)",
              referenceUsValue: "20.90 (17)",
              referenceEuValue: "20.89 (33)",
            },
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.range,
              candidateValue: "9.52–12.56",
              referenceUsValue: "17.1–24.70",
              referenceEuValue: "17–22.5",
            },
          ],
        },
        {
          caption: { zh: "Fc 区非岩藻糖（IR#1 回复，表 8-1 未复制）[%]", en: "Fc-region afucosylation (IR#1 response; Table 8-1 not reproduced) [%]" },
          rows: [
            {
              label: { zh: "GP2015 DP", en: "GP2015 DP" },
              candidateValue: "1.9–4.3",
              referenceUsValue: "9.7–15.7",
              referenceEuValue: "9.7–15.7",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_2_QUALITY_RANGE_CRITERION,
      reviewerConclusion: {
        zh: "GP2015 与 US/EU Enbrel 全分子非岩藻糖化有显著差异；Fc 区差异可解释 ADCC 与 FcγRIIIa 结合差异。因 ADCC 非 etanercept MOA，不妨碍高度相似判定。",
        en: "Whole-molecule afucosylation differs significantly between GP2015 and US/EU Enbrel; Fc-region differences explain ADCC and FcγRIIIa binding differences. Since ADCC is not etanercept's MOA, this does not preclude a finding of high similarity.",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\n${GLYCAN_NAMING_CAVEAT.zh}\n\n全分子 11.04% 与 Fc 区 1.9–4.3% 差一个数量级，引用时须注明范围。`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\n${GLYCAN_NAMING_CAVEAT.en}\n\nWhole-molecule 11.04% vs Fc-region 1.9–4.3% differ by an order of magnitude; cite the applicable scope.`,
      },
      verification: gp2015Verification(
        ["chunk_12.md"],
        ["11.04 (8)", "20.90 (17)", "9.52–12.56", "1.9–4.3", "9.7–15.7"],
      ),
    },
  ],

  // -------------------------------------------------------------------------
  // 纯度与大小变异体 (5)
  // -------------------------------------------------------------------------
  "sec-hmw-aggregates": [
    {
      id: "gp2015-sec-aggregation",
      evidenceLevel: "regulatory-verified",
      tier: "tier-2",
      source: gp2015Source("SEC 聚集体审评员制表（chunk_13）", "SEC aggregation reviewer table (chunk_13)"),
      methodUsed: { zh: "SEC-UV", en: "SEC-UV" },
      headline: {
        zh: "GP2015 聚集体低于 US/EU Enbrel，总体上 GP2015 更纯。",
        en: "GP2015 aggregates are lower than US/EU Enbrel; overall GP2015 is purer.",
      },
      dataTables: [
        {
          caption: { zh: "聚集体 (SEC) [%]", en: "Aggregation products (SEC) [%]" },
          rows: [
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.mean,
              candidateValue: "0.37 (19)",
              referenceUsValue: "2.1 (23)",
              referenceEuValue: "2.5 (34)",
            },
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.range,
              candidateValue: "-0.14–0.88",
              referenceUsValue: "0.8–3.4",
              referenceEuValue: "0.6–4.4",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_2_QUALITY_RANGE_CRITERION,
      reviewerConclusion: {
        zh: "一致趋势为 GP2015 高分子量组分低于 US/EU Enbrel，可能与检测时龄期有关；总体上 GP2015 更纯。",
        en: "Consistent trend: GP2015 HMW is lower than US/EU Enbrel, possibly related to age at testing; overall GP2015 is purer.",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\n正文另给 GP2015 0.3–0.8% vs Enbrel 2.8–3.8%（表 4-31 未复制）。AUC 二聚体数据见 sec-hmw 相关正文。`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\nNarrative also gives GP2015 0.3–0.8% vs Enbrel 2.8–3.8% (Table 4-31 not reproduced). AUC dimer data in related narrative.`,
      },
      verification: gp2015Verification(
        ["chunk_13.md"],
        ["0.37 (19)", "2.1 (23)", "2.5 (34)", "-0.14–0.88"],
      ),
    },
  ],

  "sec-main-peak-monomer": [
    {
      id: "gp2015-sec-main-peak",
      evidenceLevel: "regulatory-verified",
      tier: "tier-2",
      source: gp2015Source("SEC 主峰审评员制表（chunk_13）", "SEC main peak reviewer table (chunk_13)"),
      methodUsed: { zh: "SEC-UV", en: "SEC-UV" },
      headline: {
        zh: "SEC 主峰 GP2015 高于 Enbrel；最终练习批不重叠但处于 Enbrel 总体范围内。",
        en: "SEC main peak of GP2015 is higher than Enbrel; final exercise lots do not overlap but fall within Enbrel's overall range.",
      },
      dataTables: [
        {
          caption: { zh: "SEC 主峰/单体 [%]", en: "SEC main peak/monomer [%]" },
          rows: [
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.mean,
              candidateValue: "96.65 (19)",
              referenceUsValue: "94.5 (23)",
              referenceEuValue: "93.70 (34)",
            },
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.range,
              candidateValue: "93.90–99.40",
              referenceUsValue: "90.1–98.9",
              referenceEuValue: "90.7–96.7",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_2_QUALITY_RANGE_CRITERION,
      reviewerConclusion: {
        zh: "最终相似性练习中测试批 % 主峰不重叠，但与全部 US/EU Enbrel 批比较，GP2015 处于总体范围内。",
        en: "In the final similarity exercise the test lots' main peaks do not overlap, but compared with all US/EU Enbrel lots GP2015 falls within the overall range.",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\n正文：GP2015 DS/DP 94.7–96.5% vs Enbrel 92.1–92.3%。`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\nNarrative: GP2015 DS/DP 94.7–96.5% vs Enbrel 92.1–92.3%.`,
      },
      verification: gp2015Verification(
        ["chunk_13.md"],
        ["96.65 (19)", "94.5 (23)", "93.90–99.40"],
      ),
    },
  ],

  "sec-lmw-fragments": [
    {
      id: "gp2015-sec-degradation",
      evidenceLevel: "regulatory-verified",
      tier: "tier-2",
      source: gp2015Source("SEC 降解产物审评员制表（chunk_13）", "SEC degradation reviewer table (chunk_13)"),
      methodUsed: { zh: "SEC-UV", en: "SEC-UV" },
      headline: {
        zh: "LMW 降解产物 GP2015 略低于 Enbrel，变化速率相似。",
        en: "LMW degradation products slightly lower in GP2015 than Enbrel; similar change rate.",
      },
      dataTables: [
        {
          caption: { zh: "降解产物 (SEC) [%]", en: "Degradation products (SEC) [%]" },
          rows: [
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.mean,
              candidateValue: "3.0 (19)",
              referenceUsValue: "3.41 (23)",
              referenceEuValue: "3.8 (34)",
            },
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.range,
              candidateValue: "0.61–5.35",
              referenceUsValue: "-0.3–7.2",
              referenceEuValue: "0.8–6.7",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_2_QUALITY_RANGE_CRITERION,
      reviewerConclusion: {
        zh: "GP2015 LMW 较低，变化速率三者相似（稳定性数据支持）。",
        en: "GP2015 LMW is lower; change rates are similar across the three (stability data supportive).",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\nGP2015 mean 原文 OCR 为 3(19)，译文按 3.0 (19) 处理，待 PDF 核对。`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\nGP2015 mean OCR in source was 3(19); translation reads 3.0 (19), pending PDF reconciliation.`,
      },
      verification: gp2015Verification(
        ["chunk_13.md"],
        ["3.0 (19)", "3.41 (23)", "3.8 (34)", "0.61–5.35"],
      ),
    },
  ],

  "non-reduced-ce-sds-main-peak": [
    {
      id: "gp2015-nr-ce-main",
      evidenceLevel: "regulatory-narrative",
      tier: "tier-3",
      source: gp2015Source("非还原 CE 章节（chunk_13）", "Non-reduced CE section (chunk_13)"),
      methodUsed: {
        zh: "非还原毛细管电泳（CE）",
        en: "Non-reduced capillary electrophoresis (CE)",
      },
      headline: {
        zh: "非还原 CE 主峰 GP2015 略高于 US/EU Enbrel，无显著差异。",
        en: "Non-reduced CE main peak slightly higher in GP2015 than US/EU Enbrel; no significant difference.",
      },
      dataTables: [
        {
          caption: { zh: "非还原 CE 主峰纯度 [%]", en: "Non-reduced CE main peak purity [%]" },
          rows: [
            {
              label: { zh: "GP2015", en: "GP2015" },
              candidateValue: "96.9–98.9",
              referenceUsValue: "96.2–97.7",
              referenceEuValue: "96.2–97.7",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_3_DESCRIPTIVE_CRITERION,
      reviewerConclusion: {
        zh: "正交大小变异体方法无显著差异。",
        en: "Orthogonal size-variant methods show no significant difference.",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\n表 4-34 未复制；框架为 CE-SDS，本案例为 CE。参照药未分列 US/EU。`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\nTable 4-34 not reproduced; framework uses CE-SDS, this case uses CE. Reference not split US/EU.`,
      },
      verification: gp2015Verification(
        ["chunk_13.md"],
        ["96.9–98.9", "96.2–97.7"],
      ),
    },
  ],

  "non-reduced-ce-sds-fragments": [
    {
      id: "gp2015-nr-ce-hmw",
      evidenceLevel: "regulatory-narrative",
      tier: "tier-3",
      source: gp2015Source("非还原 CE 章节（chunk_13）", "Non-reduced CE section (chunk_13)"),
      methodUsed: { zh: "非还原毛细管电泳（CE）", en: "Non-reduced capillary electrophoresis (CE)" },
      headline: {
        zh: "GP2015 高分子量峰低于定量限；Enbrel 含 1.1–2.1% 高分子量峰。",
        en: "GP2015 HMW peak below LOQ; Enbrel contains 1.1–2.1% HMW peak.",
      },
      dataTables: [
        {
          caption: { zh: "非还原 CE 高分子量峰", en: "Non-reduced CE HMW peak" },
          rows: [
            {
              label: { zh: "GP2015", en: "GP2015" },
              candidateValue: "低于定量限",
              referenceUsValue: "1.1–2.1",
              referenceEuValue: "1.1–2.1",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_3_DESCRIPTIVE_CRITERION,
      reviewerConclusion: {
        zh: "低分子量变异体三者相似；非还原 SDS-PAGE 显示 Enbrel 含 290 kDa 条带。",
        en: "LMW variants similar across all three; non-reduced SDS-PAGE shows 290 kDa band in Enbrel.",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\n表 4-34 未复制。`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\nTable 4-34 not reproduced.`,
      },
      verification: gp2015Verification(["chunk_13.md"], ["1.1–2.1", "低于定量限"]),
    },
  ],

  // -------------------------------------------------------------------------
  // 工艺及产品相关杂质 (2)
  // -------------------------------------------------------------------------
  "other-product-related-impurities": [
    {
      id: "gp2015-rpc-post-peak",
      evidenceLevel: "regulatory-verified",
      tier: "tier-2",
      source: gp2015Source("RPC post-peak 审评员制表（chunk_14）", "RPC post-peak reviewer table (chunk_14)"),
      methodUsed: { zh: "反相色谱（RPC，去唾液酸后）", en: "Reverse-phase chromatography (RPC, after desialylation)" },
      headline: {
        zh: "Post-peak 疏水变异体 GP2015 低于 Enbrel，与 TNF-α 中和等效性争议及计算效价模型直接相关。",
        en: "Post-peak hydrophobic variants are lower in GP2015 than Enbrel, directly linked to the TNF-α neutralization equivalence dispute and computed potency model.",
      },
      dataTables: [
        {
          caption: { zh: "RPC post-peak（含 WBV）[%]", en: "RPC post-peak (incl. WBV) [%]" },
          rows: [
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.mean,
              candidateValue: "10.7 (19)",
              referenceUsValue: "16.2 (21)",
              referenceEuValue: "17.5 (26)",
            },
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.range,
              candidateValue: "8.9–12.6",
              referenceUsValue: "10.4–21.9",
              referenceEuValue: "11.5–20.6",
            },
          ],
        },
        {
          caption: { zh: "RPC main peak [%]", en: "RPC main peak [%]" },
          rows: [
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.mean,
              candidateValue: "88.5 (17)",
              referenceUsValue: "83.5 (21)",
              referenceEuValue: "82.1 (26)",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_2_QUALITY_RANGE_CRITERION,
      reviewerConclusion: {
        zh: "Post-peak 含错误桥连二硫键变异体；差异经计算效价模型解释后不妨碍高度相似论证。上市后承诺须开发疏水变异体放行方法（PAS，2017-12-31）。",
        en: "Post-peak contains wrongly bridged disulfide variants; after explanation via the computed potency model the difference does not preclude the high-similarity argument. Post-marketing commitment to develop a hydrophobic variant release method (PAS, 2017-12-31).",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\nPost-peak 与效价相关性部分被 (b)(4) 涂黑。`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\nPost-peak vs potency correlation partly redacted under (b)(4).`,
      },
      verification: gp2015Verification(
        ["chunk_14.md", "chunk_02.md"],
        ["10.7 (19)", "16.2 (21)", "8.9–12.6", "88.5 (17)"],
      ),
    },
  ],

  "residual-hcp": [
    {
      id: "gp2015-hcp-elisa",
      evidenceLevel: "regulatory-verified",
      tier: "not-tiered",
      source: gp2015Source("表 4-54 HCP（chunk_15）", "Table 4-54 HCP (chunk_15)"),
      methodUsed: {
        zh: "GP2015 表达系统专用 ELISA；MS 鉴定",
        en: "GP2015 expression-system-specific ELISA; MS identification",
      },
      headline: {
        zh: "GP2015 HCP 高于 Enbrel 但在同类产品常用范围内；不同表达系统试剂直接比较困难。",
        en: "GP2015 HCP is higher than Enbrel but within the usual range for similar products; direct comparison is difficult with different expression-system reagents.",
      },
      dataTables: [
        {
          caption: { zh: "HCP [ppm] — 表 4-54 逐批", en: "HCP [ppm] — Table 4-54 per lot" },
          rows: [
            {
              label: { zh: "#B213820 (DS)", en: "#B213820 (DS)" },
              candidateValue: "208",
              referenceUsValue: "",
              referenceEuValue: "",
            },
            {
              label: { zh: "#B234005 (DS)", en: "#B234005 (DS)" },
              candidateValue: "244",
              referenceUsValue: "",
              referenceEuValue: "",
            },
            {
              label: { zh: "#1035224 (Enbrel)", en: "#1035224 (Enbrel)" },
              candidateValue: "",
              referenceUsValue: "74",
              referenceEuValue: "74",
            },
            {
              label: { zh: "#1040542 (Enbrel)", en: "#1040542 (Enbrel)" },
              candidateValue: "",
              referenceUsValue: "68",
              referenceEuValue: "68",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_3_DESCRIPTIVE_CRITERION,
      reviewerConclusion: {
        zh: "GP2015 使用专用试剂，HCP 略高可预期；虽高于 US/EU Enbrel，仍在同类产品常用范围内。不同表达系统抗体特异性不同，直接比较困难。",
        en: "GP2015 uses a dedicated reagent, so slightly higher HCP is expected; although higher than US/EU Enbrel, still within the usual range for similar products. Different expression-system antibody specificity makes direct comparison difficult.",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\n工艺相关杂质通常不做头对头等效性检验。Enbrel 6 批未分列 US/EU。专用试剂 vs 通用试剂，数值不可直接等同。`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\nProcess-related impurities are usually not subject to head-to-head equivalence testing. 6 Enbrel lots not split US/EU. Dedicated vs generic reagent — values are not directly interchangeable.`,
      },
      verification: gp2015Verification(
        ["chunk_15.md"],
        ["#B213820|208", "#B234005|244", "#1035224|74", "#1040542|68"],
      ),
    },
  ],

  // -------------------------------------------------------------------------
  // 一级结构 (4)
  // -------------------------------------------------------------------------
  "msms-sequence-coverage": [
    {
      id: "gp2015-msms-100pct",
      evidenceLevel: "regulatory-narrative",
      tier: "tier-3",
      source: gp2015Source("Primary Structure 章节（chunk_10）", "Primary Structure section (chunk_10)"),
      methodUsed: {
        zh: "有限酶切 + MS/MS 肽图（chymotrypsin、trypsin、AspN/GluC 等）",
        en: "Limited proteolysis + MS/MS peptide mapping (chymotrypsin, trypsin, AspN/GluC, etc.)",
      },
      headline: {
        zh: "GP2015 与 US-licensed Enbrel 一级序列相同，MS/MS 覆盖率 100%。",
        en: "GP2015 and US-licensed Enbrel share the same primary sequence with 100% MS/MS coverage.",
      },
      dataTables: [
        {
          caption: { zh: "MS/MS 序列覆盖率", en: "MS/MS sequence coverage" },
          rows: [
            {
              label: { zh: "GP2015.02REF", en: "GP2015.02REF" },
              candidateValue: "100%",
              referenceUsValue: "",
              referenceEuValue: "",
            },
            {
              label: { zh: "US Enbrel lot 1035224", en: "US Enbrel lot 1035224" },
              candidateValue: "",
              referenceUsValue: "100%",
              referenceEuValue: "",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_3_DESCRIPTIVE_CRITERION,
      reviewerConclusion: {
        zh: "结果一致表明 US-licensed Enbrel 与 GP2015 一级序列相同。",
        en: "Results consistently show US-licensed Enbrel and GP2015 have the same primary sequence.",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\n100% 为两者共用表述，非分列数值对比；Figure 4-4/4-7 未复制。`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\n100% is a shared statement for both, not separate comparative values; Figures 4-4/4-7 not reproduced.`,
      },
      verification: gp2015Verification(["chunk_10.md"], ["100%", "1035224", "GP2015.02REF"]),
    },
  ],

  "n-c-terminal-sequence": [
    {
      id: "gp2015-n-c-terminal-heterogeneity",
      evidenceLevel: "regulatory-narrative",
      tier: "tier-3",
      source: gp2015Source("N/C 端异质性（chunk_10、chunk_12）", "N/C-terminal heterogeneity (chunk_10, chunk_12)"),
      methodUsed: {
        zh: "还原肽图 RP-UPLC-MS/MS；LC-ESI-MS（DKP）",
        en: "Reduced peptide map RP-UPLC-MS/MS; LC-ESI-MS (DKP)",
      },
      headline: {
        zh: "N 端剪切变异体差异与产品龄期相关；C 端 Lys GP2015 显著低于 Enbrel。",
        en: "N-terminal clipping variant differences relate to product age; C-terminal Lys is much lower in GP2015 than Enbrel.",
      },
      dataTables: [
        {
          caption: { zh: "N 端变异体 L1(3-34) [%]（DP）", en: "N-terminal variant L1(3-34) [%] (DP)" },
          rows: [
            {
              label: { zh: "GP2015", en: "GP2015" },
              candidateValue: "4.2–5.1",
              referenceUsValue: "6.2–6.4",
              referenceEuValue: "8.6–9.8",
            },
          ],
        },
        {
          caption: { zh: "C 端 Lys (1K) mean [%]", en: "C-terminal Lys (1K) mean [%]" },
          rows: [
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.mean,
              candidateValue: "1.1",
              referenceUsValue: "16.3",
              referenceEuValue: "13.8",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_3_DESCRIPTIVE_CRITERION,
      reviewerConclusion: {
        zh: "N 端差异 likely 源于产品龄期；C 端 Lys 有无不影响分子生物学功能。",
        en: "N-terminal differences likely stem from product age; C-terminal Lys presence does not affect molecular biological function.",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\n表 4-29/4-30 未复制；仅节选 L1(3-34) 与 C 端 Lys。`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\nTables 4-29/4-30 not reproduced; only L1(3-34) and C-terminal Lys excerpted.`,
      },
      verification: gp2015Verification(
        ["chunk_12.md", "chunk_13.md"],
        ["4.2–5.1", "8.6–9.8", "1.1", "16.3"],
      ),
    },
  ],

  "free-thiol": [
    {
      id: "gp2015-free-cys-ellman",
      evidenceLevel: "regulatory-narrative",
      tier: "tier-3",
      source: gp2015Source("Free Cysteines 章节（chunk_10）", "Free Cysteines section (chunk_10)"),
      methodUsed: {
        zh: "Ellman 试剂（DTNB）+ UV/VIS 定量",
        en: "Ellman's reagent (DTNB) + UV/VIS quantification",
      },
      headline: {
        zh: "GP2015 游离 Cys 略低于 Enbrel，Tier 3 属性，不影响整体论证。",
        en: "GP2015 free Cys slightly lower than Enbrel; Tier 3 attribute, does not affect overall argument.",
      },
      dataTables: [
        {
          caption: { zh: "游离 Cys [mol]", en: "Free Cys [mol]" },
          rows: [
            {
              label: { zh: "GP2015 DS", en: "GP2015 DS" },
              candidateValue: "0.13–0.17",
              referenceUsValue: "0.2–0.23",
              referenceEuValue: "0.2–0.23",
            },
            {
              label: { zh: "GP2015 DP", en: "GP2015 DP" },
              candidateValue: "0.08–0.16",
              referenceUsValue: "0.2–0.23",
              referenceEuValue: "0.2–0.23",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_3_DESCRIPTIVE_CRITERION,
      reviewerConclusion: {
        zh: "GP2015 略低于 Enbrel；DS+DP 批次选择逻辑与二硫键分析不一致，但审评认定不影响整体分析相似性论证。",
        en: "GP2015 is slightly lower than Enbrel; DS+DP lot selection logic differs from disulfide analysis, but the review found this does not affect the overall analytical similarity argument.",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\n参照药未分列 US/EU。`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\nReference not split US/EU.`,
      },
      verification: gp2015Verification(
        ["chunk_10.md"],
        ["0.13–0.17", "0.08–0.16", "0.2–0.23"],
      ),
    },
  ],

  "disulfide-bonds": [
    {
      id: "gp2015-t7-disulfide",
      evidenceLevel: "regulatory-verified",
      tier: "tier-2",
      source: gp2015Source("T7 审评员制表；二硫键桥连（chunk_10）", "T7 reviewer table; disulfide bridging (chunk_10)"),
      methodUsed: {
        zh: "非还原肽图（AspN、chymotrypsin、trypsin + RP-HPLC-MS）",
        en: "Non-reduced peptide map (AspN, chymotrypsin, trypsin + RP-HPLC-MS)",
      },
      headline: {
        zh: "错误桥连 T7 肽段 GP2015 低于 Enbrel，与 TNF-α 中和效价差异直接相关（R=0.9143）。",
        en: "Wrongly bridged T7 peptide is lower in GP2015 than Enbrel, directly related to TNF-α neutralization potency difference (R=0.9143).",
      },
      dataTables: [
        {
          caption: { zh: "T7（C78-C88）[%]", en: "T7 (C78-C88) [%]" },
          rows: [
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.mean,
              candidateValue: "1.21 (9)",
              referenceUsValue: "2.5 (13)",
              referenceEuValue: "2.21 (11)",
            },
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.range,
              candidateValue: "1.05–1.37",
              referenceUsValue: "1.07–3.24",
              referenceEuValue: "1.28–3.14",
            },
          ],
        },
        {
          caption: { zh: "正文范围（DS/DP vs Enbrel）", en: "Narrative ranges (DS/DP vs Enbrel)" },
          rows: [
            {
              label: { zh: "T7 水平", en: "T7 level" },
              candidateValue: "1.1–1.4",
              referenceUsValue: "2.5–2.8",
              referenceEuValue: "2.5–2.8",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_2_QUALITY_RANGE_CRITERION,
      reviewerConclusion: {
        zh: "GP2015 与 US-licensed Enbrel T7 水平有差异，但基于 IR 回复可接受；T7 可代表全部 WBV 与效价的相关性（R=0.97 与 C71-C88）。另 3 条额外二硫键对效价影响未提供信息。",
        en: "GP2015 and US-licensed Enbrel differ in T7 level but acceptable based on IR responses; T7 represents WBV-potency correlation (R=0.97 with C71-C88). Information on the other 3 extra disulfide bonds' potency impact was not provided.",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\n表 A 将错误桥连标 Tier 3，正文统计评价用 Tier 2，存在分层不一致。`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\nTable A lists wrongly bridged bonds as Tier 3, but narrative statistical evaluation uses Tier 2 — tiering inconsistency.`,
      },
      verification: gp2015Verification(
        ["chunk_10.md", "chunk_16.md"],
        ["1.21 (9)", "2.5 (13)", "2.21 (11)", "1.05–1.37", "1.1–1.4", "2.5–2.8"],
      ),
    },
  ],

  // -------------------------------------------------------------------------
  // 高级结构 (2)
  // -------------------------------------------------------------------------
  "other-higher-order-structure-methods": [
    {
      id: "gp2015-xray-nmr",
      evidenceLevel: "regulatory-verified",
      tier: "tier-3",
      source: gp2015Source("表 4-15 X-ray r.m.s.；1D-NMR（chunk_11）", "Table 4-15 X-ray r.m.s.; 1D-NMR (chunk_11)"),
      methodUsed: {
        zh: "X 射线晶体学（TNFR2–TNF-α 共结晶）；1D ¹H NMR",
        en: "X-ray crystallography (TNFR2–TNF-α co-crystal); 1D ¹H NMR",
      },
      headline: {
        zh: "X-ray r.m.s. 差异极小（0.21–0.31 Å）；1D-NMR 叠加谱相似。",
        en: "X-ray r.m.s. differences are minimal (0.21–0.31 Å); 1D-NMR overlay spectra are similar.",
      },
      dataTables: [
        {
          caption: { zh: "X-ray r.m.s. [Å] — 表 4-15", en: "X-ray r.m.s. [Å] — Table 4-15" },
          rows: [
            {
              label: { zh: "GP2015 #VB25B3 vs Enbrel #1035224", en: "GP2015 #VB25B3 vs Enbrel #1035224" },
              candidateValue: "0.21 Å",
              referenceUsValue: "0.21 Å",
              referenceEuValue: "",
            },
            {
              label: { zh: "GP2015 #2G27062011 vs Enbrel #1035224", en: "GP2015 #2G27062011 vs Enbrel #1035224" },
              candidateValue: "0.28 Å",
              referenceUsValue: "0.28 Å",
              referenceEuValue: "",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_3_DESCRIPTIVE_CRITERION,
      reviewerConclusion: {
        zh: "模型显示结构相似；1D-NMR 谱图无明显差异。X-ray 仅 TNFR2 部分，非全分子。",
        en: "Models show structural similarity; 1D-NMR spectra show no obvious difference. X-ray covers TNFR2 portion only, not full molecule.",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\nX-ray 仅 TNFR2 与 TNF-α 共结晶；1D-NMR 仅 1 批头对头。`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\nX-ray is TNFR2 co-crystallized with TNF-α only; 1D-NMR is single-lot head-to-head.`,
      },
      verification: gp2015Verification(
        ["chunk_11.md"],
        ["0.21 Å", "0.28 Å", "#VB25B3", "#1035224"],
      ),
    },
  ],

  "ft-ir-secondary-structure": [
    {
      id: "gp2015-ftir-amide",
      evidenceLevel: "regulatory-verified",
      tier: "tier-3",
      source: gp2015Source("表 4-14 Amide I/II 峰位（chunk_11）", "Table 4-14 Amide I/II peak positions (chunk_11)"),
      methodUsed: {
        zh: "FT-IR（换缓冲液后测定 Amide I/II）",
        en: "FT-IR (Amide I/II after buffer exchange)",
      },
      headline: {
        zh: "8 批 GP2015 DP 与 6 批 Enbrel FT-IR 谱叠加无可见差异。",
        en: "FT-IR overlays of 8 GP2015 DP lots and 6 Enbrel lots show no visible difference.",
      },
      dataTables: [
        {
          caption: {
            zh: "Amide I / Amide II 峰位 [cm⁻¹] — 表 4-14（节选）",
            en: "Amide I / Amide II peak positions [cm⁻¹] — Table 4-14 (excerpt)",
          },
          rows: [
            {
              label: { zh: "GP2015 DP #CS2951", en: "GP2015 DP #CS2951" },
              candidateValue: "1643.27 / 1551.28",
              referenceUsValue: "",
              referenceEuValue: "",
            },
            {
              label: { zh: "GP2015 DP #VB25B3", en: "GP2015 DP #VB25B3" },
              candidateValue: "1643.23 / 1551.53",
              referenceUsValue: "",
              referenceEuValue: "",
            },
            {
              label: { zh: "Enbrel #1035224", en: "Enbrel #1035224" },
              candidateValue: "",
              referenceUsValue: "1643.21 / 1551.20",
              referenceEuValue: "1643.21 / 1551.20",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_3_DESCRIPTIVE_CRITERION,
      reviewerConclusion: {
        zh: "FT-IR 谱及二阶导数放大谱叠加无可见/无显著差异。",
        en: "FT-IR and second-derivative magnified overlays show no visible/significant difference.",
      },
      dataCaveat: {
        zh: `${TRANSLATION_ONLY_CAVEAT.zh}\n\nEnbrel 6 批未分列 US/EU；原文第二列表头误写 amide I（译文按 Amide II 处理）。`,
        en: `${TRANSLATION_ONLY_CAVEAT.en}\n\n6 Enbrel lots not split US/EU; source second column header mislabelled amide I (translation treats as Amide II).`,
      },
      verification: gp2015Verification(
        ["chunk_11.md"],
        ["1643.27", "1551.28", "1643.23", "1551.53", "1643.21", "1551.20", "#CS2951"],
      ),
    },
  ],
};
