/**
 * Expandable provenance shown under every live demo. The point is to let a
 * reader verify that the demo computes real numbers from named sources, rather
 * than playing a pre-scripted animation.
 *
 * Standing rule (implementation-plan.md S14/S15): every live demo MUST carry
 * this panel. A demo without data source, formula and independent check is
 * not allowed to ship.
 */
import type { LocalizedText } from "@/types/models";
import type { LiveDemoKind } from "@/data/live-demos";

export interface LiveDemoProvenance {
  summary: LocalizedText;
  whatItIs: LocalizedText;
  whatItIsNot: LocalizedText;
  dataSource: LocalizedText;
  principle: LocalizedText;
  independentCheck: LocalizedText;
  sourceFiles: string[];
  oracleValues: { label: LocalizedText; value: string }[];
  externalLinks: { label: LocalizedText; href: string }[];
}

const INTACT_MASS_PROVENANCE: LiveDemoProvenance = {
  summary: {
    zh: "展开：数据来源、计算原理、与 pyOpenMS 对照值、本演示不是什么",
    en: "Expand: data source, calculation principle, pyOpenMS oracle values, and what this demo is not",
  },
  whatItIs: {
    zh: "点击「运行演示」后，计算在你正在看的这个浏览器进程里当场执行：用公开氨基酸序列算出理论分子质量，再由电荷态包络的 m/z 间距反推中性质量。改序列或二硫键对数后重新计算，数字会跟着变。这不是预先录好的动画。",
    en: "After you click Run demo, the calculation runs in this browser process: a public amino-acid sequence is converted to a theoretical mass, then the neutral mass is recovered from m/z spacing of a charge-state envelope. Change the sequence or the disulfide count and recompute — the numbers change. This is not a pre-recorded animation.",
  },
  whatItIsNot: {
    zh: "这不是 UniDec 本体，也不是实测质谱。UniDec 8.2.1 已在本机对同一理论质量的合成谱跑通过（回收 66398.00 Da，偏差 −2.8 ppm），证据在 tools-poc；本页为了能在无 Python 的静态站点上当场演示，用同一物理关系（m/z = (M + z·p)/z）在 TypeScript 里复现。谱图为合成数据。不得当作生物类似性结论。",
    en: "This is not UniDec itself, and not a measured mass spectrum. UniDec 8.2.1 was run locally on a synthetic spectrum of the same theoretical mass (recovered 66398.00 Da, −2.8 ppm); that evidence lives in tools-poc. This page reproduces the same physical relation, m/z = (M + z·p)/z, in TypeScript so it can run on a static site without Python. The spectrum is synthetic. It is not a biosimilarity conclusion.",
  },
  dataSource: {
    zh: "序列：UniProt P02769（牛血清白蛋白）成熟链，残基 25–607，583 个氨基酸，35 个半胱氨酸，注释 17 对二硫键。2026-08-14 从 https://rest.uniprot.org/uniprotkb/P02769.fasta 下载，缓存于 tools-poc/data/P02769.fasta，SHA-256 = a42fcd8e4290c9e2be37db7cd97ff45180c1643412834830a6216e65eb5a0db3。氨基酸平均质量与水、氢的平均质量取自本机安装的 pyOpenMS 3.5.0（AASequence.getAverageWeight / EmpiricalFormula），不是手抄近似值。己糖质量差 +162.0528 Da 为人为引入的可解释差异，用于演示判定原则中的「可由已知糖型解释」。",
    en: "Sequence: UniProt P02769 (bovine serum albumin) mature chain, residues 25–607, 583 amino acids, 35 cysteines, 17 annotated disulfides. Downloaded 2026-08-14 from https://rest.uniprot.org/uniprotkb/P02769.fasta, cached at tools-poc/data/P02769.fasta, SHA-256 = a42fcd8e4290c9e2be37db7cd97ff45180c1643412834830a6216e65eb5a0db3. Amino-acid average masses and the average masses of water and hydrogen were dumped from the locally installed pyOpenMS 3.5.0 (AASequence.getAverageWeight / EmpiricalFormula), not handwritten approximations. The +162.0528 Da hexose shift is a deliberately introduced explainable difference, demonstrating the judging principle that a difference may be attributed to a known glycoform.",
  },
  principle: {
    zh: "完整蛋白平均质量 = Σ(游离氨基酸质量) − (残基数 − 1)×H2O。形成一对二硫键失去 2 个氢，氧化态质量 = 还原态 − 17×2×1.00794075 Da。电荷态包络：对 z = 30…60，m/z = (M + z·1.007276467)/z，强度为以 z=45 为中心的高斯包络。中性质量回收不使用生成时写入的电荷标签，而是用相邻峰间距：z ≈ m/z下一峰 / Δ(m/z)，再 M = z·(m/z) − z·p。",
    en: "Intact average mass = Σ(free amino-acid masses) − (residue count − 1)×H2O. Each disulfide loses two hydrogens, so oxidised mass = reduced − 17×2×1.00794075 Da. Charge envelope: for z = 30…60, m/z = (M + z·1.007276467)/z, with a Gaussian intensity envelope centred at z=45. Neutral-mass recovery does not use the charge labels written at generation time; it infers z ≈ m/z_next / Δ(m/z) from adjacent-peak spacing, then M = z·(m/z) − z·p.",
  },
  independentCheck: {
    zh: "预言机不是本页面自己。scripts/verify_live_demo.mjs 用同一公式对照 pyOpenMS 3.5.0 在本机算出的 BSA 还原态 66432.46 Da、氧化态 66398.19 Da；电荷包络回收须落在 ±0.05 Da 内。命令：npm run verify:demo。UniDec 实测日志：docs/tool-survey/evidence/run_s09a.log。",
    en: "The oracle is not this page. scripts/verify_live_demo.mjs checks the same formulas against BSA masses computed locally by pyOpenMS 3.5.0: reduced 66432.46 Da, oxidised 66398.19 Da; charge-envelope recovery must lie within ±0.05 Da. Command: npm run verify:demo. UniDec run log: docs/tool-survey/evidence/run_s09a.log.",
  },
  sourceFiles: [
    "src/lib/live-demo/protein-mass.ts",
    "src/lib/live-demo/charge-deconvolution.ts",
    "src/components/live-demo/IntactMassDemo.tsx",
    "tools-poc/data/P02769.fasta",
    "tools-poc/scripts/s09a_intact_mass_chain.py",
    "scripts/verify_live_demo.mjs",
  ],
  oracleValues: [
    { label: { zh: "pyOpenMS 还原态平均质量", en: "pyOpenMS reduced average mass" }, value: "66432.46 Da" },
    { label: { zh: "pyOpenMS 氧化态平均质量", en: "pyOpenMS oxidised average mass" }, value: "66398.19 Da" },
    { label: { zh: "浏览器演示回收容差", en: "Browser-demo recovery tolerance" }, value: "±0.05 Da" },
    { label: { zh: "UniDec 本机回收（合成谱）", en: "UniDec local recovery (synthetic spectrum)" }, value: "66398.00 Da（−2.8 ppm）" },
  ],
  externalLinks: [
    { label: { zh: "UniProt P02769", en: "UniProt P02769" }, href: "https://www.uniprot.org/uniprotkb/P02769/entry" },
    { label: { zh: "UniProt FASTA（下载源）", en: "UniProt FASTA (download source)" }, href: "https://rest.uniprot.org/uniprotkb/P02769.fasta" },
  ],
};

const PEPTIDE_MAP_PROVENANCE: LiveDemoProvenance = {
  summary: {
    zh: "展开：数据来源、胰蛋白酶切规则、覆盖率算法、本演示不是什么",
    en: "Expand: data source, trypsin cleavage rule, coverage algorithm, and what this demo is not",
  },
  whatItIs: {
    zh: "点击「运行演示」后，浏览器按胰蛋白酶规则（K/R 后切开，P 前不切，允许 1 个漏切，最短 6 残基）把序列切成理论肽段，用肽段自身的理论单同位素质量当作「观测」母离子，计算序列覆盖率；再在第 327 位引入 G→A，检查覆盖该位点的肽段是否全部变为未匹配。改序列后重算，肽段表会变。",
    en: "After you click Run demo, the browser digests the sequence with trypsin (cleave after K/R unless followed by P, one missed cleavage, minimum 6 residues), treats each peptide's own theoretical monoisotopic mass as the 'observed' precursor, and computes sequence coverage. It then introduces G→A at position 327 and checks that peptides spanning that site become unmatched. Change the sequence and recompute — the peptide table changes.",
  },
  whatItIsNot: {
    zh: "这不是 pyOpenMS 搜库，也不是 LC-MS/MS 实测。酶切规则与 pyOpenMS ProteaseDigestion(Trypsin) 对齐；本页为静态站点复现同一规则。观测质量是由理论质量直接充当的合成数据（完美检出），未加仪器误差、未做碎片离子确认。框架 characterization-items.ts 第 482 行已写明：MS1 质量匹配不能替代 MS/MS 序列确认。",
    en: "This is not a pyOpenMS database search and not a measured LC-MS/MS run. The cleavage rule is aligned with pyOpenMS ProteaseDigestion(Trypsin); this page reproduces that rule for a static site. Observed masses are synthetic (the theoretical mass used as a perfect detection), with no instrument error and no fragment-ion confirmation. characterization-items.ts line 482 already states that MS1 mass matching cannot replace MS/MS sequence confirmation.",
  },
  dataSource: {
    zh: "序列来源与完整质量演示相同：UniProt P02769 成熟链，2026-08-14 下载，SHA-256 见上。默认替换位点 G327 是该成熟链上的真实甘氨酸，不是虚构残基编号。",
    en: "Sequence source is the same as the intact-mass demo: UniProt P02769 mature chain, downloaded 2026-08-14, SHA-256 as above. The default substitution site G327 is a real glycine on that mature chain, not a fictional residue number.",
  },
  principle: {
    zh: "覆盖率 = 被至少一条匹配肽段覆盖的残基数 / 序列长度。匹配容差 10 ppm。候选药的「观测」质量来自突变后序列的酶切结果，但比对用的是参照药/理论序列的肽段表——这与真实肽图以参照序列为基准找缺口的做法一致。",
    en: "Coverage = residues covered by at least one matched peptide / sequence length. Match tolerance is 10 ppm. The candidate's 'observed' masses come from digesting the mutated sequence, but they are matched against the reference/theoretical peptide table — the same logic as a real peptide map looking for gaps against the reference sequence.",
  },
  independentCheck: {
    zh: "酶切与质量公式在 src/lib/live-demo/trypsin-digest.ts 与 protein-mass.ts。Python 对照链路 tools-poc/scripts/s09b_peptide_map_coverage.py 在同一条 BSA 序列上得到 118 条理论肽段、99.31% 覆盖率（含 15% 随机未检出）；本页默认用完美检出，覆盖率会更高。日志：docs/tool-survey/evidence/run_s09b.log。",
    en: "Digestion and mass formulas live in src/lib/live-demo/trypsin-digest.ts and protein-mass.ts. The Python counterpart tools-poc/scripts/s09b_peptide_map_coverage.py yielded 118 theoretical peptides and 99.31% coverage on the same BSA sequence (with 15% random drop-out); this page defaults to perfect detection, so coverage is higher. Log: docs/tool-survey/evidence/run_s09b.log.",
  },
  sourceFiles: [
    "src/lib/live-demo/trypsin-digest.ts",
    "src/lib/live-demo/protein-mass.ts",
    "src/components/live-demo/PeptideMapDemo.tsx",
    "tools-poc/scripts/s09b_peptide_map_coverage.py",
    "scripts/verify_live_demo.mjs",
  ],
  oracleValues: [
    { label: { zh: "序列长度", en: "Sequence length" }, value: "583 aa" },
    { label: { zh: "默认替换", en: "Default substitution" }, value: "G327A" },
    { label: { zh: "匹配容差", en: "Match tolerance" }, value: "10 ppm" },
    { label: { zh: "Python PoC 覆盖率（含未检出）", en: "Python PoC coverage (with drop-out)" }, value: "99.31%" },
  ],
  externalLinks: [
    { label: { zh: "UniProt P02769", en: "UniProt P02769" }, href: "https://www.uniprot.org/uniprotkb/P02769/entry" },
  ],
};

const QUALITY_RANGE_PROVENANCE: LiveDemoProvenance = {
  summary: {
    zh: "展开：批次数据从哪来、QR 公式出处、与 Python PoC 对照值、本演示不是什么",
    en: "Expand: where the lot values come from, the QR formula source, Python PoC oracles, and what this demo is not",
  },
  whatItIs: {
    zh: "点击「运行演示」后，浏览器用你看到的那两列数字当场计算 μR、σR 和 QR=(μR−XσR, μR+XσR)，再数候选药批次落入比例是否 ≥90%。改数字或切换「偏移情景」再算，判定会反转。这是框架 numericLimit 里写明的算法，不是摆设。",
    en: "After you click Run demo, the browser computes μR, σR and QR=(μR−XσR, μR+XσR) from the two columns you can see, then counts whether ≥90% of candidate lots fall inside. Edit the numbers or switch to the shifted scenario and recompute — the decision flips. This is the algorithm written in the framework numericLimit, not decoration.",
  },
  whatItIsNot: {
    zh: "这些批次不是任何真实产品的 Ellman 测定。数值是 tools-poc/scripts/s09c_free_thiol_quality_range.py 用固定种子 20260814 抽的合成数据，原样抄到本页。QR 是描述性区间，不是置信区间，也不是容许区间。落入 QR 不等于生物类似性成立。本轮调研未找到可用的开源 QR 工具，判定逻辑为自研。",
    en: "These lots are not Ellman measurements of any real product. The values were drawn with fixed seed 20260814 by tools-poc/scripts/s09c_free_thiol_quality_range.py and copied here verbatim. QR is a descriptive interval, not a confidence interval and not a tolerance interval. Falling inside QR does not establish biosimilarity. This survey found no usable open-source QR tool; the decision logic is in-house.",
  },
  dataSource: {
    zh: "默认 20 个参照药批次与两组各 12 个候选药批次，逐字来自 tools-poc/output/s09c_free_thiol_quality_range.json（该文件由上述脚本在 2026-08-14 生成）。理论游离巯基 1 mol SH/mol protein 来自 UniProt P02769 注释：35 个半胱氨酸 − 17×2 = 1 个未配对半胱氨酸，仅用于给合成数据一个物理上合理的中心，不是实测。",
    en: "The default 20 reference lots and two sets of 12 candidate lots are copied verbatim from tools-poc/output/s09c_free_thiol_quality_range.json (generated by the script above on 2026-08-14). The theoretical 1 mol SH/mol protein comes from UniProt P02769 annotation: 35 cysteines − 17×2 = 1 unpaired cysteine. It only centres the synthetic data on a physically plausible value; it is not a measurement.",
  },
  principle: {
    zh: "公式原文在 src/data/characterization-items.ts 第 1026 行：QR=(μR−XσR, μR+XσR)，足够批次（如 90% 以上）落入可支持该属性相似。μR、σR 为参照药样本均值与样本标准差（除以 n−1）。默认 X=3，框架要求 X 须按属性风险论证，本演示未做该论证。",
    en: "The formula is at src/data/characterization-items.ts line 1026: QR=(μR−XσR, μR+XσR); a sufficient fraction of lots (e.g. ≥90%) inside can support similarity of the attribute. μR and σR are the reference sample mean and sample standard deviation (divide by n−1). Default X=3; the framework requires X to be justified by attribute risk, which this demo does not do.",
  },
  independentCheck: {
    zh: "scripts/verify_live_demo.mjs 用同一列参照药数字核对 QR 下沿 0.7548、上沿 1.0884，并断言相似情景 12/12 落入、偏移情景 4/12 落入。命令：npm run verify:demo。Python 运行日志：docs/tool-survey/evidence/run_s09c.log。",
    en: "scripts/verify_live_demo.mjs checks the same reference lots against QR bounds 0.7548 and 1.0884, and asserts 12/12 inside in the similar scenario and 4/12 in the shifted scenario. Command: npm run verify:demo. Python log: docs/tool-survey/evidence/run_s09c.log.",
  },
  sourceFiles: [
    "src/lib/live-demo/quality-range.ts",
    "src/data/live-demos.ts",
    "src/components/live-demo/QualityRangeDemo.tsx",
    "src/data/characterization-items.ts",
    "tools-poc/scripts/s09c_free_thiol_quality_range.py",
    "tools-poc/output/s09c_free_thiol_quality_range.json",
    "scripts/verify_live_demo.mjs",
  ],
  oracleValues: [
    { label: { zh: "参照药 μR", en: "Reference μR" }, value: "0.9216" },
    { label: { zh: "参照药 σR", en: "Reference σR" }, value: "0.0556" },
    { label: { zh: "QR（X=3）", en: "QR (X=3)" }, value: "[0.7548, 1.0884]" },
    { label: { zh: "相似情景落入", en: "Similar scenario inside QR" }, value: "12/12" },
    { label: { zh: "偏移情景落入", en: "Shifted scenario inside QR" }, value: "4/12" },
  ],
  externalLinks: [],
};

const provenanceByKind: Record<LiveDemoKind, LiveDemoProvenance> = {
  "intact-mass": INTACT_MASS_PROVENANCE,
  "peptide-map": PEPTIDE_MAP_PROVENANCE,
  "quality-range": QUALITY_RANGE_PROVENANCE,
};

export function getLiveDemoProvenance(kind: LiveDemoKind): LiveDemoProvenance {
  return provenanceByKind[kind];
}
