/**
 * Method SOP body, keyed by DetectionMethod.id.
 *
 * Independent of characterization-items.ts (which is regenerated from Excel).
 * This round fills `principle` only for 一级结构. Remaining SOP fields
 * (sample preparation, instrument parameters, system suitability,
 * data interpretation, similarity-assessment link) stay absent until S17+.
 *
 * Do not invent instrument set-points. Principle text states what the
 * measurement does and how it connects to the framework item, not a
 * transferable method SOP.
 *
 * TODO: 校对英文 (en strings are placeholders).
 */
import type { DetectionMethodContent, LocalizedText } from "@/types/models";

function assign(
  target: Record<string, DetectionMethodContent>,
  methodIds: string[],
  principle: LocalizedText,
): void {
  const content = { principle };
  for (const methodId of methodIds) {
    target[methodId] = content;
  }
}

const byMethodId: Record<string, DetectionMethodContent> = {};

assign(
  byMethodId,
  ["intact-mass-primary-1"],
  {
    zh: "完整蛋白经液相色谱脱盐后进入电喷雾电离，形成一系列多电荷离子。高分辨质谱（QTOF 或 Orbitrap）测得的 m/z 包络经电荷态去卷积，还原为零电荷分子质量（Da）。该质量反映蛋白主链、主要糖型与可电离修饰的总和。相似性评价不是「相差若干 Da 即判相似」，而是候选药与参照药同条件头对头比较主要质量峰与峰型，并与理论结构核对：主要分子形式应对应，差异须能由已知糖型或翻译后修饰解释，不得出现无法解释的新分子形式。",
    en: "After LC desalting, the intact protein is electrosprayed as a series of multiply charged ions. High-resolution MS (QTOF or Orbitrap) records the m/z envelope, which charge deconvolution converts to a zero-charge molecular mass (Da). That mass is the sum of the protein backbone, major glycoforms and ionisable modifications. Similarity is not judged as “similar if within X Da”. Candidate and reference are compared head-to-head under identical conditions against the theoretical structure: major molecular forms should correspond; differences must be explainable by known glycoforms or PTMs; no unexplainable new forms should appear.",
  },
);

assign(
  byMethodId,
  ["deglycosylated-intact-mass-primary-1"],
  {
    zh: "先用 PNGase F 等酶释放可切的 N-糖链，再测完整分子质量。去掉糖型异质性后，质量主要反映蛋白主链及不可酶切的修饰（如 C 端 Lys 缺失、焦谷氨酸化）。与未脱糖完整质量对照，可把「主链差异」与「糖链差异」分开。判定仍是头对头图谱比较加理论质量核对，不是固定 Da 限度。",
    en: "N-glycans that the enzyme can release are removed (e.g. with PNGase F) before intact-mass measurement. With glycoform heterogeneity reduced, the mass mainly reflects the protein backbone and uncleavable modifications (C-terminal Lys loss, pyroglutamate). Together with the non-deglycosylated intact mass, backbone differences can be separated from glycan differences. Judging remains head-to-head spectral comparison plus theoretical-mass check, not a fixed Da limit.",
  },
);

assign(
  byMethodId,
  ["light-chain-mass-primary-1"],
  {
    zh: "还原打开链间二硫键后，抗体轻链作为独立亚基进入 LC-MS。轻链通常无 N-糖基化，其质量主要反映氨基酸序列与 N/C 端加工。适用于抗体类产品。判定为与理论轻链质量及参照药轻链谱头对头核对，主要形式应对应。",
    en: "After reduction of inter-chain disulfides, the antibody light chain is measured as a subunit by LC-MS. Light chain is usually not N-glycosylated, so its mass mainly reflects sequence and N/C-terminal processing. Applicable to antibody products. Judging is a head-to-head check against the theoretical light-chain mass and the reference spectrum; major forms should correspond.",
  },
);

assign(
  byMethodId,
  ["non-deglycosylated-heavy-chain-mass-primary-1"],
  {
    zh: "还原后保留重链 N-糖链再测 LC-MS，得到的是重链主链与糖型的合计质量分布。用于同时观察主链完整性与 Fc N-糖异质性。糖型差异常见且须结合糖谱解释，不能单独把某一糖型质量峰的有无当成序列不同。适用于抗体类产品。",
    en: "After reduction, heavy-chain N-glycans are left in place and LC-MS reports the combined mass distribution of backbone plus glycoforms. This views backbone integrity and Fc N-glycan heterogeneity together. Glycoform differences are common and must be interpreted with the glycan profile; presence or absence of one glycoform peak is not by itself a sequence difference. Applicable to antibody products.",
  },
);

assign(
  byMethodId,
  ["deglycosylated-heavy-chain-mass-primary-1"],
  {
    zh: "先脱 N-糖再还原，测定重链主链质量，把糖链贡献从重链质量中拿掉。与未脱糖重链质量对照，可判断差异来自主链（序列、末端加工、非糖修饰）还是糖型。适用于抗体类产品。判定同完整质量：主要形式对应，差异可解释。",
    en: "N-glycans are removed before reduction, so the measured mass is the heavy-chain backbone with the glycan contribution taken off. Compared with the non-deglycosylated heavy-chain mass, a difference can be assigned to backbone (sequence, termini, non-glycan PTMs) or to glycoforms. Applicable to antibody products. Judging is the same as for intact mass: major forms correspond; differences are explainable.",
  },
);

assign(
  byMethodId,
  [
    "intact-mass-orthogonal-2",
    "deglycosylated-intact-mass-orthogonal-2",
    "light-chain-mass-orthogonal-2",
    "non-deglycosylated-heavy-chain-mass-orthogonal-2",
    "deglycosylated-heavy-chain-mass-orthogonal-2",
  ],
  {
    zh: "完整、脱糖与亚基（轻链/重链）三套质量不是三套独立结论，而是同一分子的正交切片。完整质量受糖型拖累时，脱糖质量应仍与理论主链相符；轻、重链质量和应能解释完整分子。若某一层次出现无法在其他层次找到对应的新质量物种，则不能用「仪器误差」打发，必须用肽图或其他正交方法解释。",
    en: "Intact, deglycosylated and subunit (light/heavy chain) masses are orthogonal slices of the same molecule, not three independent conclusions. When glycoforms clutter the intact mass, the deglycosylated mass should still match the theoretical backbone; light- and heavy-chain masses together should account for the intact molecule. A new mass species that has no counterpart at the other levels cannot be dismissed as instrument error; it must be explained by peptide mapping or another orthogonal method.",
  },
);

assign(
  byMethodId,
  ["n-c-terminal-sequence-orthogonal-1"],
  {
    zh: "完整或亚基水平的质量可以提示末端加工（如重链 C 端 Lys 缺失约 128 Da、N 端焦谷氨酸化约 −18 Da），但不能给出残基顺序。它作为肽图端基分析的正交印证：质量位移应与肽图定量到的末端异质体比例方向一致，而不应单独作为序列证据。",
    en: "Intact or subunit mass can hint at terminal processing (heavy-chain C-terminal Lys loss of about 128 Da, N-terminal pyroglutamate of about −18 Da) but does not give residue order. It orthogonally supports peptide-map terminal analysis: the mass shift should agree in direction with the terminal-variant fractions quantified by the peptide map, and must not stand alone as sequence evidence.",
  },
);

const PEPTIDE_MAP_LCMSMS: LocalizedText = {
  zh: "蛋白经专一性蛋白酶（常用胰蛋白酶）切成肽段，经反相液相色谱分离后做高分辨 MS1 与依赖数据的 MS/MS。MS1 给出肽段精确质量，MS/MS 的 b/y 碎片离子确认氨基酸顺序和修饰位点。覆盖率是序列证据的量化描述，不是相似性的数值限度。框架要求氨基酸序列原则上与参照药相同，CDR 与功能关键区须有充分序列证据，不得出现未经解释的氨基酸替换。",
  en: "The protein is cleaved with a specific protease (commonly trypsin), peptides are separated by reversed-phase LC, and high-resolution MS1 plus data-dependent MS/MS are recorded. MS1 gives accurate peptide masses; b/y fragment ions in MS/MS confirm sequence and modification sites. Coverage quantifies sequence evidence; it is not a numerical similarity limit. The framework requires the amino-acid sequence to be identical in principle to the reference product, with sufficient evidence in CDRs and function-critical regions and no unexplained substitutions.",
};

assign(
  byMethodId,
  [
    "intact-mass-orthogonal-1",
    "deglycosylated-intact-mass-orthogonal-1",
    "light-chain-mass-orthogonal-1",
    "non-deglycosylated-heavy-chain-mass-orthogonal-1",
    "deglycosylated-heavy-chain-mass-orthogonal-1",
    "msms-sequence-coverage-primary-1",
  ],
  PEPTIDE_MAP_LCMSMS,
);

assign(
  byMethodId,
  ["n-c-terminal-sequence-primary-1"],
  {
    zh: "在酶切肽图 LC-MS/MS 中定向解析 N 端肽与 C 端肽：精确质量确定末端形式，MS/MS 碎片确认残基顺序，并可按峰面积估算末端异质体（如 C 端 Lys 保留/缺失、N 端焦谷氨酸化）的相对比例。序列本身按定性一致判定；可量化的末端异质体比例可按属性风险采用质量范围。末端肽过短或离子化差时属方法盲区，需要 Edman 或换酶补充。",
    en: "Within the LC-MS/MS peptide map, the N- and C-terminal peptides are examined specifically: accurate mass fixes the terminal form, MS/MS fragments confirm residue order, and peak areas can estimate relative fractions of terminal variants (C-terminal Lys retention/loss, N-terminal pyroglutamate). Sequence identity is judged qualitatively; quantifiable variant fractions may use a risk-based quality range. Terminal peptides that are very short or ionise poorly are a method blind spot requiring Edman or an alternative digest.",
  },
);

assign(
  byMethodId,
  ["free-thiol-orthogonal-1"],
  {
    zh: "非还原条件下酶切并封闭游离巯基后做 LC-MS/MS，二硫键连接的肽段保持交联状态。含游离半胱氨酸的肽段以封闭衍生物形式被鉴定并可作位点级归属，从而把总量法测得的游离巯基定位到具体半胱氨酸，并同时查看是否存在二硫键错配。样品处理条件（pH、封闭时机）直接影响结果，须与总量法结果一起解释。",
    en: "Digestion under non-reducing conditions with free thiols blocked, followed by LC-MS/MS, keeps disulfide-linked peptides cross-linked. Peptides carrying free cysteines are identified as blocked derivatives, giving site-level assignment, so the bulk free-thiol value can be located to specific cysteines while mispaired disulfides are checked at the same time. Sample handling (pH, timing of blocking) directly affects the result and must be interpreted alongside the bulk assay.",
  },
);

assign(
  byMethodId,
  ["ms1-sequence-coverage-primary-1"],
  {
    zh: "酶切肽图采集 MS1 时，以肽段母离子精确质量与理论酶切肽段匹配，得到质量覆盖率。这是序列证据的较低层级：质量相符支持「该肽段可能存在」，但不能确认残基顺序，也不能排除同质量异构。框架已写明 MS1 质量匹配不能替代 MS/MS 序列确认。关键区（如 CDR）若仅有 MS1 证据，应补做 MS/MS 或更换酶切。",
    en: "In an MS1 peptide map, precursor accurate masses are matched to theoretical digest peptides to give mass coverage. This is a lower evidence tier: a mass match supports that the peptide may be present, but does not confirm residue order and does not exclude isobaric isomers. The framework states that MS1 matching cannot replace MS/MS sequence confirmation. If a critical region (e.g. a CDR) has only MS1 evidence, MS/MS or an alternative digest should be added.",
  },
);

assign(
  byMethodId,
  ["ms1-sequence-coverage-orthogonal-1"],
  {
    zh: "在 MS1 覆盖的基础上采集 MS/MS，用碎片离子确认母离子对应的序列。正交目的是把「质量可能匹配」提升为「序列已确认」，尤其填补仅靠 MS1 时的同质量歧义。",
    en: "MS/MS is acquired on top of MS1 coverage so fragment ions confirm the sequence behind each precursor. The orthogonal purpose is to raise “mass may match” to “sequence confirmed”, especially where MS1 alone leaves isobaric ambiguity.",
  },
);

assign(
  byMethodId,
  ["ms1-sequence-coverage-orthogonal-2"],
  {
    zh: "胰蛋白酶在 K/R 处切开，长疏水肽、连续 K/R 区或末端短肽可能落在方法盲区。换用 Glu-C、Asp-N、Lys-C 或切点不同的酶，产生另一套肽段，专门覆盖胰蛋白酶覆盖不到的区域。覆盖率应报告各酶分别与合并后的结果，并标明仍未覆盖的残基。",
    en: "Trypsin cuts at K/R, so long hydrophobic peptides, stretches of consecutive K/R, or short terminal peptides can fall in blind spots. Glu-C, Asp-N, Lys-C or another enzyme with different specificity yields a second peptide set aimed at those gaps. Coverage should be reported per enzyme and combined, with remaining uncovered residues stated.",
  },
);

assign(
  byMethodId,
  ["msms-sequence-coverage-orthogonal-1"],
  {
    zh: "与单一胰蛋白酶肽图相比，换酶或双酶切改变肽段边界，使原先跨切点、过长或离子化差的区域变成可鉴定肽段。用于提高 MS/MS 确认覆盖率，而不是重复同一张谱。关键区仍无碎片离子证据时，应明确列为方法局限。",
    en: "Relative to a trypsin-only map, an alternative or dual digest changes peptide boundaries so regions that were too long, poorly ionised or split across a cleavage site become identifiable. The aim is higher MS/MS-confirmed coverage, not a repeat of the same spectrum. If a critical region still lacks fragment-ion evidence, that must be stated as a method limitation.",
  },
);

assign(
  byMethodId,
  ["msms-sequence-coverage-orthogonal-2"],
  {
    zh: "端基分析确认 N 端与 C 端残基顺序及加工形式（信号肽切除、焦谷氨酸化、C 端 Lys 保留或缺失）。肽图中的末端肽是主证据；Edman 降解在质谱末端肽弱或存在嵌段修饰时作为补充。序列本身为定性一致；可量化的末端异质体比例可按风险采用质量范围。",
    en: "Terminal analysis confirms N- and C-terminal residue order and processing (signal-peptide removal, pyroglutamate, C-terminal Lys retention or loss). Terminal peptides in the peptide map are the primary evidence; Edman degradation supplements when those peptides are weak or a blocking modification is present. Sequence identity is qualitative; quantifiable terminal-variant fractions may use a risk-based quality range.",
  },
);

assign(
  byMethodId,
  ["cdr-signature-peptides-primary-1"],
  {
    zh: "抗体 CDR 决定抗原结合特异性，是一级结构中不允许含糊的区域。靶向肽图针对覆盖 CDR 的特征肽，核对保留时间、精确质量与 MS/MS 序列是否与参照药/理论序列一致。这是定性身份确认，不适用数值限度。非抗体产品不适用。",
    en: "Antibody CDRs determine antigen-binding specificity and cannot be left ambiguous in primary structure. A targeted peptide map watches CDR-spanning signature peptides for retention time, accurate mass and MS/MS sequence identity with the reference/theoretical sequence. This is qualitative identity confirmation; no numerical limit applies. Not applicable to non-antibody products.",
  },
);

assign(
  byMethodId,
  ["cdr-signature-peptides-orthogonal-1"],
  {
    zh: "单一酶切可能把某条 CDR 切碎成过短肽，或留在过长肽中而离子化差。多酶切产生另一套覆盖 CDR 的肽段，降低「该 CDR 恰好落在方法盲区」的风险。各酶的特征肽均应能指向同一 CDR 序列。",
    en: "A single digest may fragment a CDR into peptides that are too short, or leave it in a peptide too long to ionise well. A multi-enzyme strategy yields another set of CDR-covering peptides and reduces the risk that the CDR sits in a method blind spot. Signature peptides from each enzyme should point to the same CDR sequence.",
  },
);

assign(
  byMethodId,
  ["cdr-signature-peptides-orthogonal-2"],
  {
    zh: "高分辨 MS 把特征肽与同质量干扰肽分开，并支持对修饰位点的精确质量指认。它加强靶向肽图的质量准确度，本身不替代 MS/MS 序列确认。",
    en: "High-resolution MS separates signature peptides from isobaric interferences and supports accurate-mass assignment of modification sites. It strengthens the mass accuracy of the targeted peptide map; it does not replace MS/MS sequence confirmation.",
  },
);

assign(
  byMethodId,
  ["n-c-terminal-sequence-primary-2"],
  {
    zh: "Edman 降解从 N 端逐个切除 PTH-氨基酸并鉴定，给出 N 端残基顺序，不依赖质谱。N 端被焦谷氨酸化或乙酰化封闭时循环无法启动，须先化学或酶法去封闭，或改以肽图为准。框架将其定位为「必要时」的补充，结果应与肽图末端肽相互印证。",
    en: "Edman degradation cleaves PTH-amino acids one by one from the N-terminus and identifies them without mass spectrometry. Pyroglutamate or acetylation blocks the cycle; the terminus must be de-blocked chemically or enzymatically, or the peptide map takes precedence. The framework positions Edman as used “where necessary”; results should cross-check terminal peptides from the peptide map.",
  },
);

assign(
  byMethodId,
  ["free-thiol-primary-1"],
  {
    zh: "Ellman 试剂（DTNB）与游离巯基反应生成 TNB²⁻，在约 412 nm 定量，结果以 mol SH/mol protein 表示；荧光巯基试剂原理相同、灵敏度更高。该值反映未配对半胱氨酸，可能与错误折叠、二硫键错配或聚集风险相关。相似性评价采用定量质量范围：QR = (μR − X·σR, μR + X·σR)，X 须按属性风险论证；足够比例（如 ≥90%）的候选药批次落入可支持该属性相似，同时比较均值、标准差与分布。无通用的「低于某 mol 即相似」限度。",
    en: "Ellman's reagent (DTNB) reacts with free thiols to TNB²⁻, quantified near 412 nm as mol SH/mol protein; fluorescent thiol reagents use the same idea at higher sensitivity. The value reflects unpaired cysteines and may relate to misfolding, disulfide scrambling or aggregation risk. Similarity uses a quantitative quality range: QR = (μR − X·σR, μR + X·σR), with X justified by attribute risk. A sufficient fraction (e.g. ≥90%) of candidate lots inside can support similarity of the attribute; means, SDs and distributions are compared as well. There is no universal “similar if below X mol” limit.",
  },
);

assign(
  byMethodId,
  ["free-thiol-orthogonal-2", "disulfide-bonds-orthogonal-2"],
  {
    zh: "还原 CE-SDS 打开二硫键后按多肽链大小分离；非还原 CE-SDS 保留共价连接，完整 IgG、半抗、轻链丢失体等以不同迁移时间出现。游离巯基升高或二硫键错配时，非还原图谱上常伴随完整分子主峰下降、片段或半抗升高。电泳给出的是大小物种分布，不能定位是哪一对半胱氨酸连接错误，须与游离巯基定量或非还原肽图交叉解释。",
    en: "Reduced CE-SDS separates polypeptide chains by size after disulfides are opened; non-reduced CE-SDS keeps covalent links, so intact IgG, half-antibody and light-chain-deficient species migrate differently. Elevated free thiols or mispaired disulfides often coincide with a lower intact main peak and higher fragments or half-antibody on the non-reduced trace. Electrophoresis reports size-species distribution and cannot locate which cysteine pair is wrong; it must be read with free-thiol quantitation or a non-reduced peptide map.",
  },
);

assign(
  byMethodId,
  ["disulfide-bonds-primary-1"],
  {
    zh: "非还原条件下酶切，二硫键连接的肽段以交联肽形式进入 LC-MS/MS。鉴定预期的链内、链间连接肽，并查找不在理论连接图上的异常配对。样品处理须控制 pH 与游离巯基封闭，降低消化过程中的二硫键重排。判定为预期连接方式一致，不应出现未经解释的新连接形式；这是定性图谱比对，不适用数值限度。",
    en: "Digestion under non-reducing conditions keeps disulfide-linked peptides as cross-linked species for LC-MS/MS. Expected intra- and inter-chain linked peptides are identified, and pairings absent from the theoretical map are sought. Sample handling must control pH and block free thiols to limit scrambling during digestion. Judging is that the expected linkage pattern is the same, with no unexplained new linkages; this is qualitative spectral comparison, not a numerical limit.",
  },
);

assign(
  byMethodId,
  ["disulfide-bonds-orthogonal-1"],
  {
    zh: "游离巯基是二硫键连接图谱的正交量：若连接方式与参照药一致且无未配对半胱氨酸增加，游离巯基应总体相似。游离巯基升高而连接图仍「看起来完整」，可能提示部分分子发生了交换或断裂，二者必须一起解释，不能只用其中一项下结论。",
    en: "Free thiol is orthogonal to the disulfide map: if linkages match the reference and unpaired cysteines have not increased, free thiol should be broadly similar. High free thiol with a map that “looks complete” may mean a subset of molecules has exchanged or broken; the two results must be interpreted together, not either one alone.",
  },
);

export const methodContentByMethodId: Record<string, DetectionMethodContent> = byMethodId;

export function getMethodContent(methodId: string): DetectionMethodContent | undefined {
  return methodContentByMethodId[methodId];
}

export const METHOD_SOP_FIELDS_PENDING = [
  "samplePreparation",
  "instrumentParameters",
  "systemSuitability",
  "dataInterpretation",
  "similarityAssessmentLink",
] as const;
