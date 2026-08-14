/**
 * Open-source tools surveyed for each detection method, keyed by
 * `DetectionMethod.id`.
 *
 * SCOPE: 一级结构（primary-structure）大类，11 个检测项目 / 33 条方法条目。
 * 其余 7 个大类尚未调研，其方法 id 不出现在本文件中，页面据此显示「未调研」。
 *
 * 调研与部署实录：docs/tool-survey/01-primary-structure.md
 * 运行日志与输出：docs/tool-survey/evidence/、tools-poc/output/
 *
 * RULES when extending this file:
 *   1. `deploymentLevel` 只能写本机实测达到的层级。未装过的一律 "L0"。
 *      把 L0/L1 的工具描述为「可用」「已验证」是本文件最严重的错误。
 *   2. 每个非 L0 的条目必须给出 `evidencePaths`，指向可复现的日志或输出。
 *   3. `notSupported` 不得留空敷衍。读者高估工具能力的代价高于低估。
 *   4. `repositoryStats` 必须带 `queriedOn`；没有日期的 star 数不是证据。
 *   5. 没有找到工具时用 `gapNote` 明写「未找到」，不得用相关但不对口的工具凑数。
 *
 * 免责声明（与站点其他部分一致）：
 *   「工具能运行」≠「方法学已验证」≠「符合 GxP / 21 CFR Part 11」；
 *   「两组数据数值接近」≠「生物类似性成立」。
 *
 * TODO: 校对英文 (all `en` strings are machine-translation placeholders).
 */
import type { MethodTool, MethodToolSurvey } from "@/types/models";

/** 本大类的调研日期。所有 repositoryStats 均以该日期通过 GitHub 公开 API 核实。 */
const SURVEYED_ON = "2026-08-14";

// ---------------------------------------------------------------------------
// 工具定义。同一工具会被多条方法引用，因此集中定义一次。
// ---------------------------------------------------------------------------

const UNIDEC: MethodTool = {
  id: "unidec",
  name: "UniDec",
  repositoryUrl: "https://github.com/michaelmarty/UniDec",
  license: "NOASSERTION（README 声明为修改版 BSD 3-Clause，允许商业使用与再分发）",
  stack: "Python 引擎 + C 内核（随 pip 包提供 unidec.exe）",
  capabilityLevels: ["A", "B", "D", "F"],
  deploymentLevel: "L4",
  summary: {
    zh: "贝叶斯电荷态去卷积，把 ESI 多电荷谱还原为零电荷分子质量，直接产出本项目所需的「去卷积完整质量（Da）」。",
    en: "Bayesian charge deconvolution that converts multiply-charged ESI spectra into zero-charge molecular masses, producing the deconvoluted intact mass (Da) this item requires.",
  },
  notSupported: {
    zh: "不做肽段鉴定与序列确认；不读取厂商原始格式（需先用 ProteoWizard 转换）；不提供任何相似性统计判定；C 内核无法处理含非 ASCII 字符的文件路径。",
    en: "Does not identify peptides or confirm sequences; does not read vendor raw formats (conversion via ProteoWizard is required first); provides no similarity statistics; its C kernel cannot handle file paths containing non-ASCII characters.",
  },
  deploymentEvidence: {
    zh: "本机实测：安装 47 s；官方自带测试谱 test_1.txt 去卷积得到单一 12000.00 Da 物种，R²=0.9997。以 UniProt P02769 理论氧化态质量 66398.19 Da 正演的合成电荷态包络谱为输入，回收质量 66398.00 Da，偏差 −0.19 Da（−2.8 ppm）；候选药与参照药头对头质量差还原为 +162.00 Da，与人为引入的己糖差异 +162.05 Da 相符。注意：L2 未建立，因为 pip 包未随附权威的预期去卷积结果，正确性改由合成谱的已知真值验证。",
    en: "Verified locally: 47 s install; deconvolution of the bundled official test spectrum test_1.txt yields a single 12000.00 Da species at R²=0.9997. Using a synthetic charge-state envelope forward-simulated from the UniProt P02769 theoretical oxidised mass of 66398.19 Da, the recovered mass is 66398.00 Da, a deviation of −0.19 Da (−2.8 ppm); the head-to-head mass difference is resolved as +162.00 Da against the +162.05 Da hexose difference introduced deliberately. Note: L2 was not established because the pip package ships no authoritative expected deconvolution result; correctness was instead verified against the known ground truth of the synthetic spectrum.",
  },
  evidencePaths: [
    "docs/tool-survey/evidence/install_unidec.log",
    "docs/tool-survey/evidence/run_s08b.log",
    "docs/tool-survey/evidence/run_s09a.log",
    "tools-poc/output/s09a_intact_mass_chain.json",
  ],
  recommendation: "preferred",
  repositoryStats: { stars: 90, forks: 28, lastPushedOn: "2026-08-03", queriedOn: SURVEYED_ON },
};

const PYOPENMS: MethodTool = {
  id: "pyopenms",
  name: "pyOpenMS (OpenMS)",
  repositoryUrl: "https://github.com/OpenMS/OpenMS",
  license: "NOASSERTION（发行包内声明 BSD 3-Clause，分发前需法务复核）",
  stack: "Python 绑定 + C++ 库（PyPI 提供 Windows/Linux/macOS 预编译 wheel）",
  capabilityLevels: ["A", "B", "C", "D", "F"],
  deploymentLevel: "L4",
  summary: {
    zh: "质谱数据处理基础库：读写 mzML/mzXML/idXML、体外酶切、理论质量与理论碎片谱计算、肽段匹配与序列覆盖率统计。",
    en: "Foundational mass spectrometry library: reads and writes mzML/mzXML/idXML, performs in-silico digestion, computes theoretical masses and fragment spectra, and matches peptides to compute sequence coverage.",
  },
  notSupported: {
    zh: "不是开箱即用的肽图流水线，需要自行编排；不含生物类似药专用的相似性判定或质量范围计算；C++ 内核无法处理含非 ASCII 字符的 share 目录路径。",
    en: "Not an out-of-the-box peptide mapping pipeline; orchestration must be written by the user. Contains no biosimilar-specific similarity decision logic or quality-range calculation. Its C++ core cannot handle a share directory path containing non-ASCII characters.",
  },
  deploymentEvidence: {
    zh: "本机实测：与 numpy/scipy/pyteomics 一并安装耗时 63 s，版本 3.5.0。官方文档示例 6 项断言全部通过（分子式 C44H67N13O15、单同位素质量 1017.4879641373 Da 与文档精确一致），达 L2。进一步用于 BSA 成熟链体外酶切，得到 118 条理论肽段，模拟母离子匹配后序列覆盖率 99.31%，且人为引入的 G327A 单氨基酸替换使覆盖该位点的 3 条肽段全部落为未匹配，达 L4。",
    en: "Verified locally: installed together with numpy/scipy/pyteomics in 63 s, version 3.5.0. All six assertions against the official documentation example pass (formula C44H67N13O15 and monoisotopic mass 1017.4879641373 Da match the documentation exactly), reaching L2. Further applied to in-silico digestion of the BSA mature chain, yielding 118 theoretical peptides and 99.31% sequence coverage after simulated precursor matching; a deliberately introduced G327A substitution left all three peptides spanning that site unmatched, reaching L4.",
  },
  evidencePaths: [
    "docs/tool-survey/evidence/install_core.log",
    "docs/tool-survey/evidence/run_s08.log",
    "docs/tool-survey/evidence/run_s09b.log",
    "tools-poc/output/s08_pyopenms_official_example.json",
    "tools-poc/output/s09b_peptide_map_coverage.json",
  ],
  recommendation: "preferred",
  repositoryStats: { stars: 611, forks: 432, lastPushedOn: "2026-08-13", queriedOn: SURVEYED_ON },
};

const PYTEOMICS: MethodTool = {
  id: "pyteomics",
  name: "Pyteomics",
  repositoryUrl: "https://github.com/levitsky/pyteomics",
  license: "Apache-2.0",
  stack: "纯 Python",
  capabilityLevels: ["A", "B"],
  deploymentLevel: "L1",
  summary: {
    zh: "轻量纯 Python 蛋白质组学工具箱，读取 mzML/MGF/FASTA、计算肽段质量与酶切，可在不引入 C++ 依赖时替代 pyOpenMS 的部分基础功能。",
    en: "Lightweight pure-Python proteomics toolkit that reads mzML/MGF/FASTA and computes peptide masses and digestion, able to replace part of pyOpenMS's basic functionality without pulling in C++ dependencies.",
  },
  notSupported: {
    zh: "无去卷积算法；无搜库引擎；不提供相似性判定。",
    en: "No deconvolution algorithm, no database search engine, and no similarity decision logic.",
  },
  deploymentEvidence: {
    zh: "本机实测：安装成功（版本 5.0.1），但本轮未用它跑任何分析链路，因此只到 L1。许可证为 Apache-2.0，是本大类候选中许可证最清晰的一个，若日后需要规避 OpenMS 的许可证不确定性，它是首要替代方向。",
    en: "Verified locally: installed successfully (version 5.0.1), but it was not used to run any analysis chain in this round, so it only reaches L1. Its Apache-2.0 licence is the clearest among the candidates in this category, making it the primary fallback should the licence uncertainty around OpenMS need to be avoided.",
  },
  evidencePaths: ["docs/tool-survey/evidence/install_core.log"],
  recommendation: "alternative",
  repositoryStats: { stars: 161, forks: 45, lastPushedOn: "2026-07-22", queriedOn: SURVEYED_ON },
};

const PROTEOWIZARD: MethodTool = {
  id: "proteowizard",
  name: "ProteoWizard (msconvert)",
  repositoryUrl: "https://github.com/ProteoWizard/pwiz",
  license: "Apache-2.0",
  stack: "C++/C#，提供 Windows 命令行工具 msconvert",
  capabilityLevels: ["A"],
  deploymentLevel: "L0",
  summary: {
    zh: "厂商原始格式（Thermo RAW、Waters、Sciex WIFF 等）到 mzML 的事实标准转换工具，是所有后续分析的入口。",
    en: "The de facto standard converter from vendor raw formats (Thermo RAW, Waters, Sciex WIFF, etc.) to mzML, and the entry point for all downstream analysis.",
  },
  notSupported: {
    zh: "只做格式转换与基础过滤，不做任何分析、定量或判定。部分厂商格式的读取依赖厂商提供的闭源 DLL。",
    en: "Performs format conversion and basic filtering only; no analysis, quantitation or decision-making. Reading some vendor formats depends on closed-source vendor DLLs.",
  },
  deploymentEvidence: {
    zh: "未部署。本轮无任何厂商原始数据，装了也无从验证，因此保持 L0（未验证）。仅依据仓库页面与文档判断其定位。",
    en: "Not deployed. No vendor raw data was available in this round, so installing it could not have been verified; it therefore remains L0 (unverified). Its role is judged from the repository page and documentation only.",
  },
  evidencePaths: [],
  recommendation: "alternative",
  repositoryStats: { stars: 315, forks: 121, lastPushedOn: "2026-08-13", queriedOn: SURVEYED_ON },
};

const METAMORPHEUS: MethodTool = {
  id: "metamorpheus",
  name: "MetaMorpheus",
  repositoryUrl: "https://github.com/smith-chem-wisc/MetaMorpheus",
  license: "MIT",
  stack: "C# / .NET，提供 GUI 与命令行",
  capabilityLevels: ["A", "B", "D", "F", "G"],
  deploymentLevel: "L0",
  summary: {
    zh: "端到端的肽段鉴定与修饰发现流水线，内置 G-PTM-D 开放式修饰搜索，可直接产出序列覆盖率与修饰位点报告。",
    en: "An end-to-end peptide identification and modification discovery pipeline with built-in G-PTM-D open modification search, able to produce sequence coverage and modification site reports directly.",
  },
  notSupported: {
    zh: "无生物类似药相似性判定；.NET 技术栈与本项目 Python/TypeScript 栈异构，只能以子进程或容器方式调用；未针对二硫键连接肽做专门搜索。",
    en: "No biosimilar similarity decision logic; its .NET stack is heterogeneous to this project's Python/TypeScript stack and can only be invoked as a subprocess or container; it has no dedicated search for disulfide-linked peptides.",
  },
  deploymentEvidence: {
    zh: "未部署（L0，未验证）。列为备选的理由是许可证清晰（MIT）、维护活跃（最近提交 2026-08-13）、且是少数自带完整肽图流水线的开源项目。若日后需要开放式修饰搜索，应优先验证它。",
    en: "Not deployed (L0, unverified). It is listed as an alternative because its licence is clear (MIT), maintenance is active (most recent push 2026-08-13), and it is one of the few open-source projects shipping a complete peptide mapping pipeline. It should be the first to verify if open modification search is needed later.",
  },
  evidencePaths: [],
  recommendation: "alternative",
  repositoryStats: { stars: 111, forks: 51, lastPushedOn: "2026-08-13", queriedOn: SURVEYED_ON },
};

const FRAGPIPE: MethodTool = {
  id: "fragpipe",
  name: "FragPipe (MSFragger)",
  repositoryUrl: "https://github.com/Nesvilab/FragPipe",
  license: "NOASSERTION（MSFragger 内核为学术免费、商业需授权，非 OSI 开源）",
  stack: "Java 图形界面 + 多个独立可执行组件",
  capabilityLevels: ["A", "B", "C", "D", "F", "G"],
  deploymentLevel: "L0",
  summary: {
    zh: "速度领先的肽段鉴定平台，社区认可度高（314 star），适合大规模肽图数据。",
    en: "A leading-performance peptide identification platform with strong community recognition (314 stars), suited to large-scale peptide mapping data.",
  },
  notSupported: {
    zh: "核心搜库引擎 MSFragger 非 OSI 开源，商业使用需单独授权，与本项目「可能对外发布」的定位冲突；组件众多、体积大，不适合作为可嵌入的库。",
    en: "Its core search engine MSFragger is not OSI open source and commercial use requires a separate licence, which conflicts with this project's possible external release; it has many bulky components and is unsuitable as an embeddable library.",
  },
  deploymentEvidence: {
    zh: "未部署（L0，未验证）。因许可证限制列为条件方案，未投入安装工作量。",
    en: "Not deployed (L0, unverified). Listed as a conditional option because of licence restrictions; no installation effort was invested.",
  },
  evidencePaths: [],
  recommendation: "conditional",
  repositoryStats: { stars: 314, forks: 48, lastPushedOn: "2026-08-07", queriedOn: SURVEYED_ON },
};

const PLINK2: MethodTool = {
  id: "plink2",
  name: "pLink 2 (pLink-SS)",
  repositoryUrl: "https://github.com/pFindStudio/pLink2",
  license: "无许可证文件（学术免费，商业条款不明）",
  stack: "C++ / Windows 桌面程序",
  capabilityLevels: ["B", "D"],
  deploymentLevel: "L0",
  summary: {
    zh: "交联肽搜索引擎，其 pLink-SS 模块是文献中最常被引用的二硫键连接肽鉴定工具，可从 HCD 谱直接鉴定二硫键并给出 FDR 估计。",
    en: "A cross-linked peptide search engine whose pLink-SS module is the most frequently cited tool in the literature for identifying disulfide-linked peptides, able to identify disulfide bonds directly from HCD spectra with FDR estimation.",
  },
  notSupported: {
    zh: "无许可证文件，商业使用条款不明；Windows 桌面程序，只能通过导出文件对接，不能嵌入网页；仓库 star 数低且开放 issue 较多。",
    en: "Has no licence file and unclear commercial terms; as a Windows desktop program it can only be integrated via exported files and cannot be embedded in a web page; the repository has few stars and a relatively large number of open issues.",
  },
  deploymentEvidence: {
    zh: "未部署（L0，未验证）。未部署的原因是：仓库无许可证文件，按本项目准入规则属高风险，需先完成许可证澄清才应投入安装工作量。领域内公认度高，因此仍如实列出，不因 star 数低而略过。",
    en: "Not deployed (L0, unverified). The reason is that the repository has no licence file, which makes it high risk under this project's admission rules; licence clarification should precede any installation effort. It is nonetheless listed honestly given its strong recognition in the field, rather than skipped for having few stars.",
  },
  evidencePaths: [],
  recommendation: "conditional",
  repositoryStats: { stars: 25, forks: 1, lastPushedOn: "2025-01-11", queriedOn: SURVEYED_ON },
};

const DIBBY: MethodTool = {
  id: "dibby",
  name: "dibby",
  repositoryUrl: "https://github.com/Eugleo/dibby",
  license: "无许可证文件",
  stack: "Python / Jupyter Notebook",
  capabilityLevels: ["B", "H"],
  deploymentLevel: "L0",
  summary: {
    zh: "针对已知蛋白的二硫键定位工具，从 HCD 碎片谱匹配交联片段。",
    en: "A tool for locating disulfide bonds in a known protein by matching cross-linked fragments from HCD spectra.",
  },
  notSupported: {
    zh: "无许可证、无 Release、最后提交 2021-11-21、单人维护、README 自述为研究原型且计划重写，不具备生产使用条件。",
    en: "No licence, no releases, last push 2021-11-21, single maintainer, and its README describes it as a research prototype slated for a rewrite; it is not fit for production use.",
  },
  deploymentEvidence: {
    zh: "未部署（L0，未验证）。列出它是为了如实反映「二硫键定位缺少可用开源工具」这一现状，而不是推荐使用。",
    en: "Not deployed (L0, unverified). It is listed to faithfully reflect the shortage of usable open-source tools for disulfide localisation, not as a recommendation.",
  },
  evidencePaths: [],
  recommendation: "not-recommended",
  repositoryStats: { stars: 1, forks: 0, lastPushedOn: "2021-11-21", queriedOn: SURVEYED_ON },
};

// ---------------------------------------------------------------------------
// 方法分组。同一技术主线下的方法共享同一组工具。
// ---------------------------------------------------------------------------

/** 主线 A：完整/亚基质谱去卷积。 */
const INTACT_AND_SUBUNIT_MASS_METHOD_IDS = [
  "intact-mass-primary-1",
  "intact-mass-orthogonal-2",
  "deglycosylated-intact-mass-primary-1",
  "deglycosylated-intact-mass-orthogonal-2",
  "light-chain-mass-primary-1",
  "light-chain-mass-orthogonal-2",
  "non-deglycosylated-heavy-chain-mass-primary-1",
  "non-deglycosylated-heavy-chain-mass-orthogonal-2",
  "deglycosylated-heavy-chain-mass-primary-1",
  "deglycosylated-heavy-chain-mass-orthogonal-2",
  "n-c-terminal-sequence-orthogonal-1",
];

/** 主线 B：肽图 LC-MS/MS。 */
const PEPTIDE_MAPPING_METHOD_IDS = [
  "intact-mass-orthogonal-1",
  "deglycosylated-intact-mass-orthogonal-1",
  "light-chain-mass-orthogonal-1",
  "non-deglycosylated-heavy-chain-mass-orthogonal-1",
  "deglycosylated-heavy-chain-mass-orthogonal-1",
  "ms1-sequence-coverage-primary-1",
  "ms1-sequence-coverage-orthogonal-1",
  "ms1-sequence-coverage-orthogonal-2",
  "msms-sequence-coverage-primary-1",
  "msms-sequence-coverage-orthogonal-1",
  "msms-sequence-coverage-orthogonal-2",
  "cdr-signature-peptides-primary-1",
  "cdr-signature-peptides-orthogonal-1",
  "cdr-signature-peptides-orthogonal-2",
  "n-c-terminal-sequence-primary-1",
  "free-thiol-orthogonal-1",
];

const INTACT_MASS_TOOLS = [UNIDEC, PYOPENMS, PROTEOWIZARD];
const PEPTIDE_MAPPING_TOOLS = [PYOPENMS, METAMORPHEUS, PYTEOMICS, FRAGPIPE];

function buildSurveyMap(): Record<string, MethodToolSurvey> {
  const surveys: Record<string, MethodToolSurvey> = {};

  for (const methodId of INTACT_AND_SUBUNIT_MASS_METHOD_IDS) {
    surveys[methodId] = { tools: INTACT_MASS_TOOLS, surveyedOn: SURVEYED_ON };
  }
  for (const methodId of PEPTIDE_MAPPING_METHOD_IDS) {
    surveys[methodId] = { tools: PEPTIDE_MAPPING_TOOLS, surveyedOn: SURVEYED_ON };
  }

  // 二硫键连接图谱的首选方法：技术上仍是非还原肽图，但需要交联肽搜索能力，
  // 通用肽图工具无法胜任，因此单独成组并明写缺口。
  surveys["disulfide-bonds-primary-1"] = {
    tools: [PLINK2, DIBBY, PYOPENMS],
    gapNote: {
      zh: "缺口：二硫键连接肽鉴定没有「维护活跃 + 许可证清晰 + 已验证」三者兼备的开源工具。领域内公认的 pLink-SS 无许可证文件，dibby 已停更三年余，pyOpenMS 只能提供理论质量与酶切支持、不含交联肽搜索算法。本项目若要覆盖该分析点，需先完成 pLink 2 的许可证澄清，或自研交联肽匹配模块。",
      en: "Gap: no open-source tool for identifying disulfide-linked peptides combines active maintenance, a clear licence and verification. The field-recognised pLink-SS has no licence file, dibby has been dormant for over three years, and pyOpenMS offers only theoretical mass and digestion support without a cross-linked peptide search algorithm. Covering this analysis point requires either clarifying the pLink 2 licence or developing a cross-linked peptide matching module in-house.",
    },
    surveyedOn: SURVEYED_ON,
  };

  // 游离巯基首选方法为化学显色/荧光法，产出直接是标量数值，不涉及质谱软件。
  surveys["free-thiol-primary-1"] = {
    tools: [],
    gapNote: {
      zh: "未找到可用开源工具。Ellman 试剂法（DTNB，412 nm）与荧光巯基法的计算本身只是标准曲线拟合，不需要专门软件；真正需要工具的是后续的质量范围判定，而本轮调研未找到维护中的生物类似药 quality range 开源实现（唯一相关的 R 包 nicoballarini/tailTest 仅 1 star、最后提交 2019-04-17、无许可证文件，不满足准入）。该判定逻辑已由本项目用 numpy/scipy 自研并实测通过，见 tools-poc/scripts/s09c_free_thiol_quality_range.py 与 tools-poc/output/s09c_free_thiol_quality_range.json：以 20 个合成参照药批次得到 QR=[0.7548, 1.0884]，相似情景 12/12 批次落入、偏移情景仅 4/12 落入，判定逻辑具备区分能力。",
      en: "No usable open-source tool was found. The Ellman assay (DTNB, 412 nm) and fluorescent thiol assays require only standard-curve fitting and no dedicated software; what genuinely needs tooling is the downstream quality-range decision, and this round found no maintained open-source implementation for biosimilar quality ranges (the only related R package, nicoballarini/tailTest, has 1 star, a last push of 2019-04-17 and no licence file, failing admission). That decision logic has been implemented in-house with numpy/scipy and verified locally; see tools-poc/scripts/s09c_free_thiol_quality_range.py and tools-poc/output/s09c_free_thiol_quality_range.json: from 20 synthetic reference lots QR=[0.7548, 1.0884], with 12/12 candidate lots inside under the similar scenario and only 4/12 under the shifted scenario, showing the logic discriminates.",
    },
    surveyedOn: SURVEYED_ON,
  };

  // Edman 降解是仪器化学法，不存在对应的数据分析软件。
  surveys["n-c-terminal-sequence-primary-2"] = {
    tools: [],
    gapNote: {
      zh: "不适用软件工具。Edman 降解为仪器化学测序法，结果由测序仪直接给出，不存在需要开源软件处理的原始数据环节。该方法在框架中的定位是「必要时」使用的补充手段，其结果应与肽图 LC-MS/MS 相互印证。",
      en: "Software tools are not applicable. Edman degradation is an instrumental chemical sequencing method whose results come directly from the sequencer, with no raw-data step requiring open-source software. Within the framework it is positioned as a supplementary means used 'where necessary', and its results should cross-confirm with peptide mapping LC-MS/MS.",
    },
    surveyedOn: SURVEYED_ON,
  };

  // 二硫键的正交方法之一是游离巯基，指向同一框架内的另一个项目。
  surveys["disulfide-bonds-orthogonal-1"] = {
    tools: [],
    gapNote: {
      zh: "该正交方法即框架中的「游离巯基水平」项目（free-thiol），工具情况见该项目的首选方法条目，此处不重复列出。",
      en: "This orthogonal method is the framework's own 'free thiol level' item (free-thiol); see the tool entry under that item's primary method rather than duplicating it here.",
    },
    surveyedOn: SURVEYED_ON,
  };

  // 还原/非还原 CE-SDS 属于第 5 大类（纯度与大小变异体）的技术，本轮未调研。
  for (const methodId of ["free-thiol-orthogonal-2", "disulfide-bonds-orthogonal-2"]) {
    surveys[methodId] = {
      tools: [],
      gapNote: {
        zh: "本轮未调研。还原/非还原 CE-SDS 属于「纯度与大小变异体」大类的核心技术，其电泳图谱积分工具将在该大类推进时统一调研，避免在此处给出未经验证的结论。",
        en: "Not surveyed in this round. Reduced/non-reduced CE-SDS is a core technique of the 'purity and size variants' category; tools for integrating its electropherograms will be surveyed together when that category is addressed, rather than stating unverified conclusions here.",
      },
      surveyedOn: SURVEYED_ON,
    };
  }

  return surveys;
}

/** 按 `DetectionMethod.id` 索引的工具调研结果。 */
export const methodToolSurveysByMethodId: Record<string, MethodToolSurvey> = buildSurveyMap();

export function getMethodToolSurvey(methodId: string): MethodToolSurvey | undefined {
  return methodToolSurveysByMethodId[methodId];
}
