/**
 * Reference cases attached to characterization items.
 *
 * Keyed by `CharacterizationItem.id` so that this file stays independent of
 * `characterization-items.ts` (which is regenerated from the Excel workbook).
 * Adding a case never requires touching the generated data or the page code.
 *
 * SOURCE OF TRUTH for the current pilot content:
 *   生物类似药审批报告/翻译/output/17_etanercept_szzs/  (中文译文, 22 chunks)
 *   原文: 生物类似药审批报告/17.etanercept-szzs(1).docx
 *   = FDA multi-disciplinary review of Sandoz GP2015 (etanercept-szzs, Erelzi),
 *     BLA 761042 — GP2015 vs US-licensed Enbrel vs EU-approved Enbrel.
 *
 * RULES when extending this file:
 *   1. Never fabricate a measured value. Every number must be traceable to the
 *      cited source. If no number exists, use evidenceLevel "illustrative".
 *   2. Never upgrade `evidenceLevel` to make a case look stronger.
 *      - "regulatory-verified"  = reviewer statistics table (mean + lots + range)
 *      - "regulatory-narrative" = real values from the review narrative only
 *      - "illustrative"         = schematic explanation, NOT real data
 *   3. Copy values verbatim, including units, lot counts and range notation.
 *   4. `dataCaveat` is mandatory for real cases. Record everything that limits
 *      the strength of the values — expired lots, regulator redactions, declared
 *      method variability, which batch set the numbers belong to. A correct
 *      number stripped of its qualifying context is a rigour failure.
 *   5. `verification.verifiableValues` must list distinctive value strings that
 *      appear verbatim in the cited chunks. Run `npm run verify:cases` after any
 *      edit; it greps every entry and fails the build on a miss.
 *   6. Set `hasUnresolvedOcrDamage: true` whenever a value comes from a passage
 *      the translation flagged as OCR-damaged, until it is reconciled with the
 *      source PDF. Such cases are shown with a prominent warning.
 *
 * KNOWN LIMITS of this data set as a whole (see also the site-wide disclaimer):
 *   - Values were transcribed from the Chinese translation, NOT from the English
 *     original. `englishSourceCheck` is "not-checked" for every case below.
 *   - The source document itself is incomplete: many tables are marked
 *     「原文未复制」, several passages are OCR-unreadable, and FDA redacted
 *     commercially confidential content under (b)(4).
 *   - Mapping translation terminology onto the framework's 61 items involves
 *     inference in places (notably glycan naming); such inferences are recorded
 *     in `methodDeviationNote` or `dataCaveat`.
 *
 * TODO: 校对英文 (all `en` strings are machine-translation placeholders).
 */
import type { ReferenceCase } from "@/types/models";
import { gp2015RemainingReferenceCases } from "@/data/reference-cases-gp2015-remaining";
import {
  MEAN_AND_RANGE_ROWS_LABEL,
  TIER_1_CRITERION,
  TIER_2_NO_STATISTICS_CRITERION,
  TIER_3_DESCRIPTIVE_CRITERION,
  gp2015Source,
  gp2015Verification,
} from "@/data/reference-cases-shared";

export const referenceCasesByItemId: Record<string, ReferenceCase[]> = {
  // -------------------------------------------------------------------------
  // 结合活性与生物学活性 — 试点大类
  // -------------------------------------------------------------------------

  "target-binding-activity": [
    {
      id: "gp2015-tnf-alpha-binding",
      evidenceLevel: "regulatory-verified",
      tier: "tier-1",
      source: gp2015Source(
        "表 4-55（逐批相对效价）；TNF-α Binding 章节；图 4-117",
        "Table 4-55 (per-lot relative potency); TNF-α Binding section; Figure 4-117",
      ),
      methodUsed: {
        zh: "SPR（表面等离子体共振），以 GP2015.02REF 为参比报告相对结合活性 %",
        en: "SPR (surface plasmon resonance), relative binding activity % against the GP2015.02REF standard",
      },
      headline: {
        zh: "作为 Tier 1 指定方法，GP2015 与 US-licensed Enbrel 满足统计学等效性，并支持以 EU 原研开展研究的科学桥接。",
        en: "As a designated Tier 1 method, GP2015 met statistical equivalence with US-licensed Enbrel, supporting the scientific bridge to studies conducted with the EU reference product.",
      },
      dataTables: [
        {
          caption: {
            zh: "TNF-α 结合相对活性（%，相对 GP2015.02REF）",
            en: "TNF-α binding relative activity (%, relative to GP2015.02REF)",
          },
          rows: [
            {
              label: { zh: "原液（DS）", en: "Drug substance (DS)" },
              candidateValue: "92–98",
              referenceUsValue: "99 / 98 / 92",
              referenceEuValue: "95 / 85 / 95",
            },
            {
              label: { zh: "制剂（DP）", en: "Drug product (DP)" },
              candidateValue: "89–101",
              referenceUsValue: "92–99（汇总）",
              referenceEuValue: "92–99（汇总）",
            },
            {
              label: { zh: "最终相似性练习批次数", en: "Lots in the final similarity exercise" },
              candidateValue: "8 批",
              referenceUsValue: "11 批",
              referenceEuValue: "12 批",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_1_CRITERION,
      reviewerConclusion: {
        zh: "GP2015 与 US-licensed Enbrel 之间满足统计学等效性标准，支持两者高度相似的结论。此外，GP2015 与 EU-approved Enbrel、US-licensed Enbrel 与 EU-approved Enbrel 之间亦满足等效性，因此支持以 EU-approved Enbrel 开展的非临床与临床研究在分析学层面的科学桥接。\n\n审评员另指出一处未解释的现象：与 TNF-α 中和试验不同，结合活性未见 major 差异，提示 US/EU Enbrel 中的错误折叠蛋白不足以改变可测得的结合，但原因「不清楚」。",
        en: "GP2015 met the statistical equivalence criteria against US-licensed Enbrel, supporting the conclusion that the two are highly similar. Equivalence was also met between GP2015 and EU-approved Enbrel, and between US-licensed and EU-approved Enbrel, thereby supporting the analytical scientific bridge to the nonclinical and clinical studies conducted with EU-approved Enbrel.\n\nThe reviewer also noted one unexplained observation: unlike the TNF-α neutralization assay, binding showed no major difference, suggesting that the misfolded protein in US/EU Enbrel is insufficient to alter measurable binding — but the reason is \"not clear\".",
      },
      dataCaveat: {
        zh: "批次来源与效力限制：这 8/11/12 批是申请人在 2016-01-15 回复 IR#2 后补充形成的最终批次集合，初始申报时仅有 3 批 US/EU Enbrel。其中 US Enbrel 有 7 批、EU Enbrel 有 7 批在检测时已过有效期，FDA 在 IR#3（2016-02-26）明确质疑「应在有效期内检测」并要求补充未过期批次。因此本表的参照药数值部分来自过期批次，解读时须计入这一限制。\n\n此外，逐批数值来源表（表 11-16）在译文中未复制，本表中的 8/11/12 批次数来自正文；US/EU 参照药的汇总范围 92–99% 未按美欧分列。",
        en: "Batch provenance and limits on strength: the 8/11/12 lots are the final batch set assembled after the applicant's 2016-01-15 response to IR#2; the original submission contained only 3 lots of US/EU Enbrel. Of these, 7 US Enbrel lots and 7 EU Enbrel lots were tested after their expiry date, and FDA explicitly challenged this in IR#3 (2016-02-26), stating that testing should occur within shelf life and requesting in-date lots. Part of the reference-product data therefore comes from expired lots, which must be factored into interpretation.\n\nIn addition, the per-lot source table (Table 11-16) was not reproduced in the translation; the 8/11/12 lot counts come from the narrative, and the pooled US/EU reference range of 92–99% is not split between the US and EU products.",
      },
      verification: gp2015Verification(
        ["chunk_15.md", "chunk_16.md", "chunk_02.md"],
        [
          "92–98",
          "89–101",
          "92–99%",
          "11 批 US Enbrel",
          "12 批 EU Enbrel",
          "#1035224|99",
          "#H76640|85",
        ],
      ),
    },
  ],

  "moa-related-bioactivity": [
    {
      id: "gp2015-tnf-alpha-neutralization",
      evidenceLevel: "regulatory-verified",
      tier: "tier-1",
      source: gp2015Source(
        "表 4-55；表 1-3、表 2-1/2-2；分析相似性结论章节",
        "Table 4-55; Tables 1-3, 2-1/2-2; analytical similarity conclusions section",
      ),
      methodUsed: {
        zh: "TNF-α 中和报告基因法（RGA）：HEK293 细胞 + NF-κB 依赖性荧光素酶报告基因，孵育 16–24 小时。正交方法为 U937 细胞凋亡抑制试验。",
        en: "TNF-α neutralization reporter gene assay (RGA): HEK293 cells with an NF-κB-dependent luciferase reporter, 16–24 h incubation. The orthogonal method was a U937 apoptosis-inhibition assay.",
      },
      headline: {
        zh: "等效性检验初始未通过，经定位错误桥连二硫键为结构根因并建立计算效价模型后重新分析通过——完整展示了差异如何被论证为可接受。",
        en: "Equivalence testing initially failed; after wrongly bridged disulfide bonds were identified as the structural root cause and a computed potency model was established, re-analysis passed — a complete illustration of how a difference is argued to be acceptable.",
      },
      dataTables: [
        {
          caption: {
            zh: "TNF-α 中和相对效价（%，相对 GP2015.02REF）— 表 4-55 逐批原始数值",
            en: "TNF-α neutralization relative potency (%, relative to GP2015.02REF) — per-lot values from Table 4-55",
          },
          rows: [
            {
              label: { zh: "原液逐批（6 批）", en: "Drug substance, per lot (6 lots)" },
              candidateValue: "103 / 99 / 98 / 102 / 100 / 98",
              referenceUsValue: "",
              referenceEuValue: "",
            },
            {
              label: { zh: "制剂逐批（8 批）", en: "Drug product, per lot (8 lots)" },
              candidateValue: "97 / 98 / 94 / 93 / 94 / 95 / 99 / 99",
              referenceUsValue: "",
              referenceEuValue: "",
            },
            {
              label: { zh: "参照药逐批（各 3 批）", en: "Reference product, per lot (3 lots each)" },
              candidateValue: "",
              referenceUsValue: "86 / 82 / 85",
              referenceEuValue: "85 / 88 / 88",
            },
            {
              label: {
                zh: "极值区间（本站据逐批数值归纳，非原文表述）",
                en: "Min–max interval (derived by this site from the per-lot values, not stated in the source)",
              },
              candidateValue: "原液 98–103；制剂 93–99",
              referenceUsValue: "82–86",
              referenceEuValue: "85–88",
            },
          ],
        },
        {
          caption: {
            zh: "计算效价模型（computed potency model）校正量",
            en: "Computed potency model correction",
          },
          rows: [
            {
              label: {
                zh: "效价校正值（归一化 T7 = 1.6%）",
                en: "Potency correction (T7 normalized to 1.6%)",
              },
              candidateValue: "−3.9%",
              referenceUsValue: "+5.5%",
              referenceEuValue: "+6.1%",
            },
            {
              label: {
                zh: "T7 肽段水平与 RGA 效价的相关性",
                en: "Correlation between T7 peptide level and RGA potency",
              },
              candidateValue: "R = 0.9143（三方合并回归）",
              referenceUsValue: "",
              referenceEuValue: "",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_1_CRITERION,
      reviewerConclusion: {
        zh: "初始分析中 GP2015 与 US-licensed Enbrel 未满足等效性标准，GP2015 平均效价显著高于 US-licensed Enbrel；而 GP2015 与 EU-approved Enbrel、US-licensed 与 EU-approved Enbrel 之间满足等效性。审评过程定位差异根因为反相色谱鉴定的「后峰」疏水变异体：该变异体在 US/EU Enbrel 中含量更高，且含错误桥连二硫键，效价低于主峰。Sandoz 在 TNFR 结构域 5 个半胱氨酸残基上鉴定出 4 种错误桥连二硫键，其中 T7 肽段与中和效价降低相关，建立了结构-功能关系；并以体外温和氧化还原条件证明错误桥连二硫键可重折叠、效价可恢复。据此建立计算效价模型，校正后 GP2015 与 US-licensed Enbrel 满足统计学等效性。此外，所有 GP2015 批次本身即落在 US-licensed Enbrel 的质量范围（均值 ± 3SD）与最小/最大范围内。结论：后峰疏水变异体水平差异不妨碍认定两者高度相似。",
        en: "In the initial analysis GP2015 did not meet the equivalence criteria against US-licensed Enbrel, its mean potency being significantly higher; equivalence was met between GP2015 and EU-approved Enbrel and between US-licensed and EU-approved Enbrel. The review traced the root cause to the reverse-phase \"post peak\" hydrophobic variant, which is more abundant in US/EU Enbrel, carries wrongly bridged disulfide bonds and has lower potency than the main peak. Sandoz identified 4 wrongly bridged disulfide species across 5 cysteine residues of the TNFR domain; the T7 peptide correlated with reduced neutralization potency, establishing a structure-function relationship, and mild in-vitro redox conditions demonstrated that the wrongly bridged bonds can refold with potency recovery. A computed potency model built on this basis brought GP2015 and US-licensed Enbrel into statistical equivalence. In addition, all GP2015 lots already fell within the US-licensed Enbrel quality range (mean ± 3SD) and min/max range. Conclusion: the difference in post-peak hydrophobic variant levels does not preclude a finding of high similarity.",
      },
      dataCaveat: {
        zh: "表中「极值区间」一行是本站根据表 4-55 逐批数值归纳的最小-最大值，审评报告正文并未给出该区间。审评报告对本项目只提供逐批数值，未提供均值、标准差或质量范围，因此不能与其他采用均值 ± 3SD 的项目直接比较。\n\n结论不可独立复算：计算效价模型的核心结构-功能关系式在审评报告中被 FDA 依 (b)(4) 商业秘密条款涂黑，译文对应位置标注为「已涂黑 (b)(4)」。因此「校正后满足等效性」这一结论只能采信审评员与生物统计学审评员（OTS/OB，Meiyu Shen 博士）的判断，无法从公开信息重新验算。\n\n批次集合不同：本案例引用的 −3.9% / +5.5% / +6.1% 校正量对应的是 9 批 GP2015 制剂、13 批 US-licensed Enbrel、11 批 EU-approved Enbrel，与上方效价对比表的批次集合并不相同，两组数字不可混用。模型另假设 100% 与 50% 两种重折叠比例分别计算，敏感性分析的归一化值为 1.6 ± 0.4%（表 1-8 原文未复制）。",
        en: "The \"min-max interval\" row is derived by this site from the per-lot values in Table 4-55; the review narrative does not state that interval. For this item the review provides only per-lot values, with no mean, standard deviation or quality range, so it cannot be compared directly with items that use mean ± 3SD.\n\nThe conclusion cannot be independently recomputed: the core structure-function relationship of the computed potency model was redacted by FDA under the (b)(4) commercial-confidentiality provision, and the translation marks that position as \"redacted (b)(4)\". The finding that equivalence was met after correction therefore rests on the judgement of the product and biostatistics reviewers (OTS/OB, Dr Meiyu Shen) and cannot be recalculated from public information.\n\nDifferent batch sets: the −3.9% / +5.5% / +6.1% corrections cited here correspond to 9 GP2015 drug product lots, 13 US-licensed Enbrel lots and 11 EU-approved Enbrel lots — not the same batch set as the potency comparison table above, so the two sets of figures must not be mixed. The model also computed results under assumed 100% and 50% refolding; the sensitivity analysis normalization value was 1.6 ± 0.4% (Table 1-8 not reproduced).",
      },
      verification: gp2015Verification(
        ["chunk_15.md", "chunk_16.md", "chunk_02.md"],
        [
          "#B213820|103",
          "#B213823|98",
          "#VB50B2|93",
          "#VB25B3|99",
          "#1040542|82",
          "#H76640|88",
          "0.9143",
          "+5.5%",
          "+6.1%",
          "-3.9%",
        ],
      ),
    },
  ],

  "fcgri-cd64-binding": [
    {
      id: "gp2015-fcgri-cd64",
      evidenceLevel: "regulatory-narrative",
      tier: "tier-2",
      source: gp2015Source(
        "FcγR 结合章节正文（表 4-67 原文未复制）",
        "FcγR binding section narrative (Table 4-67 not reproduced in the translation)",
      ),
      methodUsed: { zh: "SPR（表面等离子体共振），报告 KD", en: "SPR (surface plasmon resonance), reporting KD" },
      headline: {
        zh: "候选药与两版参照药的 KD 范围重叠，结合与解离速率相似。",
        en: "The KD ranges of the candidate and both reference products overlap, with similar association and dissociation rates.",
      },
      dataTables: [
        {
          caption: { zh: "FcγRI（CD64）结合亲和力 KD（nM）", en: "FcγRI (CD64) binding affinity KD (nM)" },
          rows: [
            {
              label: { zh: "原液（DS）", en: "Drug substance (DS)" },
              candidateValue: "35.1–42.5",
              referenceUsValue: "35.3–37.1",
              referenceEuValue: "34.7–41.7",
            },
            {
              label: { zh: "制剂（DP）", en: "Drug product (DP)" },
              candidateValue: "32.9–57.3",
              referenceUsValue: "35.3–37.1",
              referenceEuValue: "34.7–41.7",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_2_NO_STATISTICS_CRITERION,
      reviewerConclusion: {
        zh: "候选药与参照药的结合速率与解离速率相似，KD 范围重叠，未提示有意义差异。",
        en: "Association and dissociation rates were similar between candidate and reference, KD ranges overlapped, and no meaningful difference was indicated.",
      },
      dataCaveat: {
        zh: "本案例数值来自审评报告正文的范围值，源表（表 4-67）未在译文中复制，因此没有批次数与质量范围（均值 ± 3SD）。完整度低于有审评员统计表的项目。另需注意：本案例明确声明该属性未做统计学评价，原因是方法变异较大，因此「范围重叠」只是描述性判断，不构成统计学等效性证据。",
        en: "These values come from the review narrative; the source table (Table 4-67) was not reproduced in the translation, so lot counts and the quality range (mean ± 3SD) are unavailable. Completeness is lower than for items backed by a reviewer statistics table. Note also that the case explicitly states no statistical evaluation was performed for this attribute because of high method variability, so \"overlapping ranges\" is only a descriptive judgement and does not constitute evidence of statistical equivalence.",
      },
      verification: gp2015Verification(
        ["chunk_17.md"],
        ["35.1–42.5", "32.9–57.3", "35.3–37.1", "34.7–41.7"],
      ),
    },
  ],

  "fcgriia-cd32a-binding": [
    {
      id: "gp2015-fcgriia-cd32a",
      evidenceLevel: "regulatory-narrative",
      tier: "tier-2",
      source: gp2015Source(
        "FcγR 结合章节正文（表 4-68 原文未复制）",
        "FcγR binding section narrative (Table 4-68 not reproduced in the translation)",
      ),
      methodUsed: { zh: "SPR（表面等离子体共振），报告 KD", en: "SPR (surface plasmon resonance), reporting KD" },
      headline: {
        zh: "KD 范围完全重叠，审评认定无有意义差异。",
        en: "KD ranges overlap completely; the review found no meaningful difference.",
      },
      dataTables: [
        {
          caption: { zh: "FcγRIIa（CD32a）结合亲和力 KD（μM）", en: "FcγRIIa (CD32a) binding affinity KD (μM)" },
          rows: [
            {
              label: { zh: "原液（DS）", en: "Drug substance (DS)" },
              candidateValue: "10.8–14.0",
              referenceUsValue: "11.3–14.4",
              referenceEuValue: "10.1–14.3",
            },
            {
              label: { zh: "制剂（DP）", en: "Drug product (DP)" },
              candidateValue: "11.6–13.8",
              referenceUsValue: "11.3–14.4",
              referenceEuValue: "10.1–14.3",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_2_NO_STATISTICS_CRITERION,
      reviewerConclusion: {
        zh: "候选药与两版参照药的 KD 范围重叠，无有意义差异。",
        en: "KD ranges of the candidate and both reference products overlap; no meaningful difference.",
      },
      dataCaveat: {
        zh: "数值来自审评报告正文范围值，源表（表 4-68）未在译文中复制，无批次数与质量范围。本属性未做统计学评价（方法变异较大），「范围重叠」为描述性判断。",
        en: "Values come from the review narrative; the source table (Table 4-68) was not reproduced, so lot counts and quality range are unavailable. No statistical evaluation was performed for this attribute (high method variability), so \"overlapping ranges\" is a descriptive judgement.",
      },
      verification: gp2015Verification(
        ["chunk_17.md"],
        ["10.8–14.0", "11.6–13.8", "11.3–14.4", "10.1–14.3"],
      ),
    },
  ],

  "fcgriib-cd32b-binding": [
    {
      id: "gp2015-fcgriib-cd32b",
      evidenceLevel: "regulatory-narrative",
      tier: "tier-2",
      source: gp2015Source(
        "FcγR 结合章节正文",
        "FcγR binding section narrative",
      ),
      methodUsed: { zh: "SPR（表面等离子体共振），报告 KD", en: "SPR (surface plasmon resonance), reporting KD" },
      headline: {
        zh: "抑制性 Fcγ 受体结合的 KD 范围重叠，未见差异。",
        en: "KD ranges for binding to the inhibitory Fcγ receptor overlap; no difference observed.",
      },
      dataTables: [
        {
          caption: { zh: "FcγRIIb（CD32b）结合亲和力 KD（μM）", en: "FcγRIIb (CD32b) binding affinity KD (μM)" },
          rows: [
            {
              label: { zh: "原液（DS）", en: "Drug substance (DS)" },
              candidateValue: "27.6–36.0",
              referenceUsValue: "25.8–36.2",
              referenceEuValue: "29.1–36.2",
            },
            {
              label: { zh: "制剂（DP）", en: "Drug product (DP)" },
              candidateValue: "29.1–37.5",
              referenceUsValue: "25.8–36.2",
              referenceEuValue: "29.1–36.2",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_2_NO_STATISTICS_CRITERION,
      reviewerConclusion: {
        zh: "候选药与两版参照药的 KD 范围重叠，未提示差异。",
        en: "KD ranges of the candidate and both reference products overlap; no difference indicated.",
      },
      dataCaveat: {
        zh: "数值来自审评报告正文范围值，无批次数与质量范围。本属性未做统计学评价（方法变异较大），「范围重叠」为描述性判断。译文中该受体的源表编号未明确给出。",
        en: "Values come from the review narrative; lot counts and quality range are unavailable. No statistical evaluation was performed for this attribute (high method variability), so \"overlapping ranges\" is a descriptive judgement. The translation does not give an explicit source table number for this receptor.",
      },
      verification: gp2015Verification(
        ["chunk_17.md"],
        ["27.6–36.0", "29.1–37.5", "25.8–36.2", "29.1–36.2"],
      ),
    },
  ],

  "fcgriiia-cd16a-binding": [
    {
      id: "fcgriiia-illustrative",
      evidenceLevel: "illustrative",
      tier: "not-tiered",
      methodUsed: {
        zh: "SPR：以固定化 FcγRIIIa 受体（分别评价 158V 与 158F 多态性变体）测定结合动力学",
        en: "SPR: binding kinetics against immobilized FcγRIIIa receptor, evaluating the 158V and 158F polymorphic variants separately",
      },
      headline: {
        zh: "示意说明：该项在 GP2015 案例中仅有定性描述，无 KD 数值可引用，因此以典型评价思路和示意图谱说明。",
        en: "Illustration: in the GP2015 case this item has only a qualitative description with no citable KD values, so it is explained with a typical assessment workflow and a schematic figure.",
      },
      dataTables: [],
      qualitativeFinding: {
        zh: "GP2015 案例中的真实定性结论：候选药原液与制剂的 KD 略低于 US/EU Enbrel（即结合略强），该方向与候选药非岩藻糖基化糖链水平较低、以及 ADCC 活性差异的观察一致。审评报告未给出 KD 具体数值（源表未在译文中复制）。",
        en: "The real qualitative finding in the GP2015 case: the KD of the candidate drug substance and drug product was slightly lower than US/EU Enbrel (i.e. slightly stronger binding), consistent with the candidate's lower afucosylated glycan levels and the observed ADCC difference. The review does not report specific KD values (the source table was not reproduced in the translation).",
      },
      acceptanceCriterion: {
        zh: "典型做法：以相对结合活性 % 或 KD 比值的 90% 置信区间落入预设等效性界值判定；若产品作用机制依赖 ADCC，应分别对 158V 与 158F 变体设定界值并独立评价。",
        en: "Typical practice: judge by whether the 90% confidence interval of the relative binding activity (%) or the KD ratio falls within a predefined equivalence margin; if the product's mechanism of action depends on ADCC, margins should be set and evaluated independently for the 158V and 158F variants.",
      },
      reviewerConclusion: {
        zh: "典型评价思路：先确认候选药与参照药的传感图形状（结合相斜率、解离相衰减）一致，再比较 KD、ka、kd；若出现差异，应关联核心岩藻糖水平与 ADCC 功能数据共同解释，而非孤立判定单一指标。",
        en: "Typical assessment workflow: first confirm that the sensorgram shapes (association slope, dissociation decay) of candidate and reference agree, then compare KD, ka and kd; if a difference appears, interpret it together with core fucosylation levels and ADCC functional data rather than judging a single readout in isolation.",
      },
      schematicFigure: {
        variant: "spr-sensorgram",
        caption: {
          zh: "示意图：SPR 传感图头对头叠加（非真实数据）",
          en: "Schematic: head-to-head overlay of SPR sensorgrams (not real data)",
        },
        explanation: {
          zh: "横轴为时间，纵轴为响应值（RU）。进样期响应上升为结合相，切换至缓冲液后下降为解离相。头对头比较时应关注两条曲线的形状是否一致：结合相斜率反映 ka，解离相衰减速率反映 kd，二者共同决定 KD。图中候选药结合略强（曲线略高），对应 KD 略低的情形。",
          en: "The x-axis is time and the y-axis is response (RU). The rise during sample injection is the association phase; the decay after switching to buffer is the dissociation phase. In a head-to-head comparison, focus on whether the two curve shapes agree: the association slope reflects ka and the dissociation decay reflects kd, which together determine KD. Here the candidate binds slightly more strongly (a slightly higher curve), corresponding to a slightly lower KD.",
        },
      },
    },
  ],

  "fcrn-binding": [
    {
      id: "gp2015-fcrn",
      evidenceLevel: "regulatory-narrative",
      tier: "tier-2",
      source: gp2015Source(
        "FcRn 结合章节正文（表 4-69 原文未复制）",
        "FcRn binding section narrative (Table 4-69 not reproduced in the translation)",
      ),
      methodUsed: {
        zh: "SPR，pH 6.0 条件下测定 KD",
        en: "SPR, KD determined at pH 6.0",
      },
      headline: {
        zh: "各产品 FcRn 亲和力无差异；审评同时指出依那西普与 FcRn 的亲和力低于单抗，变异可能更大。",
        en: "No difference in FcRn affinity between products; the review also notes that etanercept binds FcRn more weakly than monoclonal antibodies, so variability may be greater.",
      },
      dataTables: [
        {
          caption: { zh: "FcRn 结合亲和力 KD（μM，pH 6.0）", en: "FcRn binding affinity KD (μM, pH 6.0)" },
          rows: [
            {
              label: { zh: "原液（DS）", en: "Drug substance (DS)" },
              candidateValue: "13.4–17.7",
              referenceUsValue: "13.0–16.1",
              referenceEuValue: "13.6–15.1",
            },
            {
              label: { zh: "制剂（DP）", en: "Drug product (DP)" },
              candidateValue: "14.1–16.5",
              referenceUsValue: "13.0–16.1",
              referenceEuValue: "13.6–15.1",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_2_NO_STATISTICS_CRITERION,
      reviewerConclusion: {
        zh: "各产品之间 FcRn 亲和力无差异。审评员指出，依那西普与 FcRn 的亲和力低于单克隆抗体，因此测定变异可能更大，解读时需考虑这一方法学背景。",
        en: "No difference in FcRn affinity between the products. The reviewer notes that etanercept has lower FcRn affinity than monoclonal antibodies, so assay variability may be greater and this methodological context should be considered in interpretation.",
      },
      dataCaveat: {
        zh: "数值来自审评报告正文范围值，源表（表 4-69）未在译文中复制，无批次数与质量范围。此外本案例仅在 pH 6.0 条件下报告，未见 pH 7.4 条件（释放相）的独立数值，因此不能据此评价 FcRn 再循环的完整过程。审评员自己指出依那西普与 FcRn 的亲和力低于单抗、测定变异可能更大，这进一步限制了「无差异」结论的判别力。",
        en: "Values come from the review narrative; the source table (Table 4-69) was not reproduced, so lot counts and quality range are unavailable. This case also reports only the pH 6.0 condition, with no separate values at pH 7.4 (the release phase), so the complete FcRn recycling process cannot be assessed from it. The reviewer notes that etanercept binds FcRn more weakly than monoclonal antibodies and that assay variability may be greater, which further limits the discriminating power of the \"no difference\" conclusion.",
      },
      verification: gp2015Verification(
        ["chunk_17.md"],
        ["13.4–17.7", "14.1–16.5", "13.0–16.1", "13.6–15.1"],
      ),
    },
  ],

  "c1q-binding": [
    {
      id: "gp2015-c1q",
      evidenceLevel: "regulatory-narrative",
      tier: "not-tiered",
      source: gp2015Source(
        "C1q 结合章节正文（表 4-66 原文未复制）",
        "C1q binding section narrative (Table 4-66 not reproduced in the translation)",
      ),
      methodUsed: {
        zh: "SPR，以 GP2015.02REF 为参比报告相对结合活性 %",
        en: "SPR, relative binding activity % against the GP2015.02REF standard",
      },
      headline: {
        zh: "制剂与参照药处于同一范围；原液数值偏高，审评认定并非产品固有生化性质所致。",
        en: "The drug product falls in the same range as the reference; the drug substance reads higher, which the review attributed to factors other than an intrinsic biochemical property of the product.",
      },
      dataTables: [
        {
          caption: {
            zh: "C1q 相对结合活性（%，相对 GP2015.02REF）",
            en: "C1q relative binding activity (%, relative to GP2015.02REF)",
          },
          rows: [
            {
              label: { zh: "原液（DS）", en: "Drug substance (DS)" },
              candidateValue: "125–141",
              referenceUsValue: "113–115（US/EU 合并）",
              referenceEuValue: "113–115（US/EU 合并）",
            },
            {
              label: { zh: "制剂（DP）", en: "Drug product (DP)" },
              candidateValue: "111–115",
              referenceUsValue: "113–115（US/EU 合并）",
              referenceEuValue: "113–115（US/EU 合并）",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_3_DESCRIPTIVE_CRITERION,
      reviewerConclusion: {
        zh: "制剂与 US/EU Enbrel 处于同一范围。原液数值偏高，但考虑到多数制剂批次即来源于该原液，审评认定该差异并非产品固有的生化性质所致。",
        en: "The drug product falls within the same range as US/EU Enbrel. The drug substance reads higher, but since most drug product lots derive from that same substance, the review concluded the difference does not reflect an intrinsic biochemical property of the product.",
      },
      dataCaveat: {
        zh: "数值来自审评报告正文范围值，源表（表 4-66）未在译文中复制，无批次数与质量范围；参照药未按 US/EU 分列。译文亦未标注该属性的 Tier 分层，本站据此填为「未分层」，而非推测一个等级。\n\n另需注意：C1q 结合对样品聚集体水平高度敏感，解读时应同步参考 SEC 聚集体数据以排除假阳性。审评对原液偏高（125–141%）的解释依据是「多数制剂批次源自该原液」，属推理性论证而非直接实验证据。",
        en: "Values come from the review narrative; the source table (Table 4-66) was not reproduced, so lot counts and quality range are unavailable, and the reference values are not split between US and EU. The translation also does not state a Tier for this attribute, so this site records it as \"not tiered\" rather than guessing one.\n\nNote also that C1q binding is highly sensitive to aggregate levels, so SEC aggregate data should be consulted in parallel to exclude false positives. The review's explanation for the elevated drug substance values (125–141%) rests on the argument that most drug product lots derive from that substance — an inferential rather than a direct experimental justification.",
      },
      verification: gp2015Verification(
        ["chunk_17.md"],
        ["125–141", "111–115", "113–115"],
      ),
    },
  ],

  adcc: [
    {
      id: "adcc-illustrative",
      evidenceLevel: "illustrative",
      tier: "not-tiered",
      methodUsed: {
        zh: "基于报告基因的 ADCC 活性检测，或以靶细胞与效应细胞（NK 细胞或 PBMC）的经典 ADCC 功能试验",
        en: "Reporter-gene-based ADCC assay, or a classical ADCC functional assay with target cells and effector cells (NK cells or PBMC)",
      },
      headline: {
        zh: "示意说明：GP2015 案例中参照药未能直接定量，无法构成头对头数值案例，因此以剂量-反应曲线示意图说明评价方式。",
        en: "Illustration: in the GP2015 case the reference product could not be directly quantified, so no head-to-head numerical case exists; the assessment approach is explained with a schematic dose-response figure.",
      },
      dataTables: [],
      qualitativeFinding: {
        zh: "GP2015 案例中的真实情况：采用 NK3.3 效应细胞与 HEK293-mTNF 靶细胞体系，审评报告明确指出「US/EU Enbrel 未直接定量，因剂量-反应曲线非平行，无法与 GP2015 直接比较」。在原代单核细胞试验中，候选药与参照药均未观察到靶细胞裂解。审评亦指出 ADCC 并非依那西普的作用机制，因此该项不作为高风险属性。",
        en: "The real situation in the GP2015 case: using NK3.3 effector cells with HEK293-mTNF target cells, the review explicitly states that \"US/EU Enbrel was not directly quantified because the dose-response curves were not parallel, precluding direct comparison with GP2015\". In a primary monocyte assay, neither candidate nor reference produced target cell lysis. The review also notes that ADCC is not etanercept's mechanism of action, so this item is not treated as a high-risk attribute.",
      },
      acceptanceCriterion: {
        zh: "典型做法：以相对效价 % 的 90% 置信区间落入预设等效性界值判定，界值需依据方法学验证与参照药历史批次数据论证。前提是候选药与参照药的剂量-反应曲线必须平行——曲线不平行时相对效价在统计学上不成立，这正是本案例无法直接比较的原因。",
        en: "Typical practice: judge by whether the 90% confidence interval of the relative potency (%) falls within a predefined equivalence margin, justified by method validation and historical reference batch data. This presupposes that the candidate and reference dose-response curves are parallel — when they are not, relative potency is not statistically valid, which is precisely why this case could not be compared directly.",
      },
      reviewerConclusion: {
        zh: "典型评价思路：ADCC 活性与 Fc 段糖基化（尤其核心岩藻糖水平）及聚集体水平密切相关，应与 FcγRIIIa 结合数据、无岩藻糖糖型分析结果联合解释。仅当 ADCC 是产品作用机制或重要效应功能时，才作为高风险属性并要求等效性检验。",
        en: "Typical assessment workflow: ADCC activity is closely related to Fc glycosylation (especially core fucosylation) and aggregate levels, and should be interpreted together with FcγRIIIa binding data and afucosylated glycoform analysis. Only when ADCC is the product's mechanism of action or an important effector function is it treated as a high-risk attribute requiring equivalence testing.",
      },
      schematicFigure: {
        variant: "dose-response",
        caption: {
          zh: "示意图：剂量-反应曲线平行性比较（非真实数据）",
          en: "Schematic: dose-response curve parallelism comparison (not real data)",
        },
        explanation: {
          zh: "横轴为浓度对数，纵轴为反应值。相对效价的计算前提是两条曲线平行——即上下平台、斜率一致，仅沿横轴平移。图中实线与虚线平行，可计算水平位移得到相对效价；若曲线斜率或平台不一致（非平行），相对效价在统计学上不成立，只能作定性描述，这正是本案例参照药无法直接定量的原因。",
          en: "The x-axis is log concentration and the y-axis is response. Calculating relative potency presupposes that the two curves are parallel — matching upper and lower plateaus and slopes, differing only by a horizontal shift. Here the solid and dashed curves are parallel, so the horizontal displacement yields the relative potency. If slopes or plateaus differ (non-parallel), relative potency is not statistically valid and only a qualitative description is possible — exactly why the reference product could not be directly quantified in this case.",
        },
      },
    },
  ],

  cdc: [
    {
      id: "gp2015-cdc",
      evidenceLevel: "regulatory-verified",
      tier: "tier-3",
      source: gp2015Source(
        "CDC 审评员制表；图 4-125；总体评价章节",
        "CDC reviewer statistics table; Figure 4-125; overall assessment section",
      ),
      methodUsed: {
        zh: "基于靶细胞的 CDC 活性检测：Jurkat-mTNF-α 细胞（裂解位点缺失）+ 人血清补体 + 化学发光读出",
        en: "Target-cell-based CDC activity assay: Jurkat-mTNF-α cells (cleavage site deleted) with human serum complement and a chemiluminescent readout",
      },
      headline: {
        zh: "候选药诱导 CDC 更强且超出参照药质量范围，但因 CDC 并非依那西普作用机制、且经横向对比其他 TNF 抑制剂后顾虑缓解，最终判定可接受。",
        en: "The candidate induced stronger CDC and exceeded the reference quality range, but since CDC is not etanercept's mechanism of action and cross-comparison with other TNF inhibitors alleviated the concern, it was ultimately deemed acceptable.",
      },
      dataTables: [
        {
          caption: {
            zh: "CDC 相对活性（%）— 审评员统计表",
            en: "CDC relative activity (%) — reviewer statistics table",
          },
          rows: [
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.mean,
              candidateValue: "101.7（7）",
              referenceUsValue: "70（6）",
              referenceEuValue: "82.9（15）",
            },
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.range,
              candidateValue: "84.2–119.3",
              referenceUsValue: "41.9–98.1",
              referenceEuValue: "56.8–109.1",
            },
          ],
        },
        {
          caption: { zh: "原液与制剂实测范围（%）", en: "Measured ranges for drug substance and drug product (%)" },
          rows: [
            {
              label: { zh: "原液（DS）", en: "Drug substance (DS)" },
              candidateValue: "90–111",
              referenceUsValue: "63–90（US/EU 合并）",
              referenceEuValue: "63–90（US/EU 合并）",
            },
            {
              label: { zh: "制剂（DP）", en: "Drug product (DP)" },
              candidateValue: "97–132",
              referenceUsValue: "63–90（US/EU 合并）",
              referenceEuValue: "63–90（US/EU 合并）",
            },
          ],
        },
      ],
      acceptanceCriterion: TIER_3_DESCRIPTIVE_CRITERION,
      reviewerConclusion: {
        zh: "候选药诱导 CDC 较参照药更为有效，制剂数值上限（132%）超出 US-licensed Enbrel 的质量范围上限（98.1%）。审评以信息请求（IR#1）要求提供 EC50 曲线；回复显示英夫利西单抗、阿达木单抗的 CDC 活性强于 GP2015 与 Enbrel，从而缓解了顾虑。同时约 87% 的 EU Enbrel 批次落在 US Enbrel 质量范围内，且 CDC 并非依那西普的作用机制。总体评价认定 GP2015 与 US/EU Enbrel 的 CDC 相似。",
        en: "The candidate induced CDC more potently than the reference, with the drug product upper value (132%) exceeding the upper bound of the US-licensed Enbrel quality range (98.1%). The review issued an information request (IR#1) for EC50 curves; the response showed that infliximab and adalimumab have stronger CDC activity than both GP2015 and Enbrel, which alleviated the concern. About 87% of EU Enbrel lots fell within the US Enbrel quality range, and CDC is not etanercept's mechanism of action. The overall assessment found CDC to be similar between GP2015 and US/EU Enbrel.",
      },
      dataCaveat: {
        zh: "存在实测超范围但仍被接受的情形，务必注意其论证基础：制剂上限 132% 高于 US Enbrel 质量范围上限 98.1%，最终被接受依赖的是两条外部理由——一是横向对比其他 TNF 抑制剂（英夫利西单抗、阿达木单抗）CDC 更强，二是 CDC 并非依那西普的作用机制。这两条都不是「数值落在范围内」的证据，因此本案例不能被引用为「超范围也没关系」的通例。\n\n分层与统计限制：表 A 将 CDC 关键性列为 Moderate、分层为 Tier 3，即不设统计学等效性界值；审评员制表虽给出均值 ± 3SD，但用途是描述性参考而非判定标准。参照药批次数偏少（US 仅 6 批），质量范围的稳定性有限。",
        en: "This is a case where measured values fell outside the range yet were still accepted, so the basis of that acceptance matters: the drug product upper value of 132% exceeds the US Enbrel quality range upper bound of 98.1%, and acceptance rested on two external arguments — that other TNF inhibitors (infliximab, adalimumab) show stronger CDC, and that CDC is not etanercept's mechanism of action. Neither is evidence of \"falling within range\", so this case must not be cited as a general precedent that exceeding the range is acceptable.\n\nTiering and statistical limits: Table A lists CDC criticality as Moderate and assigns Tier 3, meaning no statistical equivalence margin was set; although the reviewer table reports mean ± 3SD, it serves as descriptive reference rather than an acceptance criterion. The reference lot counts are small (only 6 US lots), limiting the stability of the quality range.",
      },
      verification: gp2015Verification(
        ["chunk_17.md", "chunk_19.md"],
        ["101.7 (7)", "84.2–119.3", "41.9–98.1", "56.8–109.1", "82.9 (15)"],
      ),
    },
  ],

  "other-moa-related-functions": [
    {
      id: "gp2015-other-functions",
      evidenceLevel: "regulatory-verified",
      tier: "tier-2",
      source: gp2015Source(
        "TNF-β 中和与凋亡抑制审评员制表（表 4-55）；FcγRIIIb 结合章节正文",
        "TNF-β neutralization and apoptosis inhibition reviewer statistics tables (Table 4-55); FcγRIIIb binding section narrative",
      ),
      methodUsed: {
        zh: "TNF-β（淋巴毒素-α）中和报告基因法；U937 细胞凋亡抑制试验；FcγRIIIb 结合 SPR",
        en: "TNF-β (lymphotoxin-α) neutralization reporter gene assay; U937 apoptosis-inhibition assay; FcγRIIIb binding by SPR",
      },
      headline: {
        zh: "覆盖参照药其他已知机制：候选药均落在参照药质量范围内；但凋亡抑制的趋势与 TNF-α 中和相反，构成一个需要解释的矛盾点。",
        en: "Covering the reference product's other known mechanisms: the candidate fell within the reference quality ranges, but the apoptosis-inhibition trend ran opposite to TNF-α neutralization, presenting a discrepancy requiring explanation.",
      },
      dataTables: [
        {
          caption: {
            zh: "TNF-β 中和相对效价（%）— 审评员统计表（均值 ± 2SD）",
            en: "TNF-β neutralization relative potency (%) — reviewer statistics table (mean ± 2SD)",
          },
          rows: [
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.mean,
              candidateValue: "93.9（8）",
              referenceUsValue: "89.6（5）",
              referenceEuValue: "97.2（6）",
            },
            {
              label: { zh: "范围（均值 ± 2SD）", en: "Range (mean ± 2SD)" },
              candidateValue: "90–97.8",
              referenceUsValue: "59.5–119.7",
              referenceEuValue: "67.8–126.5",
            },
          ],
        },
        {
          caption: {
            zh: "U937 细胞凋亡抑制相对活性（%）— 审评员统计表（均值 ± 2SD）",
            en: "U937 apoptosis inhibition relative activity (%) — reviewer statistics table (mean ± 2SD)",
          },
          rows: [
            {
              label: MEAN_AND_RANGE_ROWS_LABEL.mean,
              candidateValue: "101（8）",
              referenceUsValue: "117.7（11）",
              referenceEuValue: "112（11）",
            },
            {
              label: { zh: "范围（均值 ± 2SD）", en: "Range (mean ± 2SD)" },
              candidateValue: "90–112",
              referenceUsValue: "97–138",
              referenceEuValue: "85–139",
            },
          ],
        },
        {
          caption: { zh: "FcγRIIIb 结合亲和力 KD（μM）", en: "FcγRIIIb binding affinity KD (μM)" },
          rows: [
            {
              label: { zh: "原液（DS）", en: "Drug substance (DS)" },
              candidateValue: "25.7–33.0",
              referenceUsValue: "20.8–29.4",
              referenceEuValue: "25.4–29.3",
            },
            {
              label: { zh: "制剂（DP）", en: "Drug product (DP)" },
              candidateValue: "20.4–35.7",
              referenceUsValue: "20.8–29.4",
              referenceEuValue: "25.4–29.3",
            },
          ],
        },
      ],
      acceptanceCriterion: {
        zh: "本案例对 TNF-β 中和与凋亡抑制采用均值 ± 2SD 质量范围（而非 Tier 1 等效性检验）。审评员明确认为，由于淋巴毒素-α 是否属于依那西普的作用机制尚不明确，不宜将 TNF-β 中和纳入 Tier 1。",
        en: "This case applied a mean ± 2SD quality range to TNF-β neutralization and apoptosis inhibition rather than Tier 1 equivalence testing. The reviewer explicitly held that since it is unclear whether lymphotoxin-α is part of etanercept's mechanism of action, TNF-β neutralization should not be placed in Tier 1.",
      },
      reviewerConclusion: {
        zh: "候选药的 TNF-β 中和效价落在 US Enbrel 质量范围内；FcγRIIIb 结合的细微差异被认定无意义。凋亡抑制试验中候选药活性低于参照药，趋势与 TNF-α 中和试验（候选药高于参照药）相反，构成矛盾点；申请人以方法变异较大及样本量少作为解释。该案例说明：覆盖参照药全部已知与潜在重要作用机制时，不能只选择最容易通过的单一功能，出现相互矛盾的结果需要正面解释。",
        en: "The candidate's TNF-β neutralization potency fell within the US Enbrel quality range, and minor FcγRIIIb binding differences were deemed insignificant. In the apoptosis-inhibition assay the candidate was less active than the reference — the opposite of the TNF-α neutralization result, where the candidate was higher — creating a discrepancy that the applicant explained by high method variability and small sample size. The case illustrates that when covering all known and potentially important mechanisms of the reference product, one cannot select only the single easiest-to-pass function, and contradictory results must be addressed directly.",
      },
      dataCaveat: {
        zh: "本项目在汇总表中为「其他机制相关功能」，内容由品种决定。本案例填入的是依那西普特有的三项功能（TNF-β 中和、凋亡抑制、FcγRIIIb 结合），换品种时需整体替换。FcγRIIIb 数值来自正文范围值，无批次数与质量范围。\n\n统计口径不一致，跨项比较时须注意：TNF-β 中和与凋亡抑制采用的是均值 ± 2SD，而本站其他案例（如 CDC、核心岩藻糖）用的是均值 ± 3SD。± 2SD 的区间明显更窄，两者的「落在范围内」不是同一严格程度，不可直接横向比较。\n\n矛盾结果的解释未经独立验证：凋亡抑制中候选药活性低于参照药，与 TNF-α 中和的方向相反；申请人以「方法变异较大、样本量少」解释，译文未记录审评员对该解释是否明确接受。",
        en: "In the summary table this item is \"other MoA-related functions\", whose content is product-specific. This case fills it with three etanercept-specific functions (TNF-β neutralization, apoptosis inhibition, FcγRIIIb binding); switching products requires replacing them entirely. The FcγRIIIb values come from the narrative and lack lot counts and a quality range.\n\nInconsistent statistical basis — take care when comparing across items: TNF-β neutralization and apoptosis inhibition use mean ± 2SD, whereas other cases on this site (e.g. CDC, core fucosylation) use mean ± 3SD. A ± 2SD interval is materially narrower, so \"within range\" does not mean the same level of stringency and the two cannot be compared directly.\n\nThe explanation of the contradictory result is not independently verified: in apoptosis inhibition the candidate was less active than the reference, the opposite direction to TNF-α neutralization. The applicant attributed this to high method variability and small sample size, and the translation does not record whether the reviewer explicitly accepted that explanation.",
      },
      verification: gp2015Verification(
        ["chunk_16.md", "chunk_17.md"],
        ["93.9 (8)", "89.6 (5)", "97.2 (6)", "117.7 (11)", "25.7–33.0", "20.4–35.7"],
      ),
    },
  ],

  ...gp2015RemainingReferenceCases,
};

export function getReferenceCases(itemId: string): ReferenceCase[] {
  return referenceCasesByItemId[itemId] ?? [];
}

export function hasReferenceCases(itemId: string): boolean {
  return getReferenceCases(itemId).length > 0;
}
