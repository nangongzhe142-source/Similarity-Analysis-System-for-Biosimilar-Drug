# -*- coding: utf-8 -*-
"""
English machine-translation placeholders for the generated data files.
All strings here are TODO: 校对英文 (pending human review).

Keys are (excel_row_number, field_name) so that lookups never depend on
exact Chinese string matching. Repeated boilerplate is defined once as a
constant and reused.
"""

# ---------------------------------------------------------------------------
# Shared boilerplate constants
# ---------------------------------------------------------------------------

APP_GENERAL_PAREN = "Generally applicable (product-specific assessment still required)"
APP_GENERAL = "Generally applicable; product-specific assessment still required"
APP_MAB = "Mainly applicable to antibody products; applicability to non-antibody products needs assessment"
APP_PRODUCT_SPECIFIC = "To be developed based on the specific product"
APP_GLYCO = "Applicable to products carrying the corresponding glycosylation"
APP_SUPP = "Supplementary item; inclusion depends on product, process, mechanism of action and risk"

SIM_QUAL_MASS = "Qualitative/spectral comparison plus verification against the theoretical mass"
SIM_QR = "Quantitative QR / actual range"
SIM_QR_SPECTRA = "Quantitative QR / actual range plus spectral comparison"
SIM_HOS = "Head-to-head spectral/curve comparison; quantitative parameters combined with actual ranges where necessary"
SIM_BIND_QR_CI = ("Quantitative QR analysis plus 90% confidence-interval equivalence testing; "
                  "the candidate-to-reference binding activity ratio (or KD ratio) should fall "
                  "within the predefined equivalence margin.")
SIM_BATCH_LIMIT = ("Each batch must be below the predefined release limit; monitor multi-batch "
                   "data to assess the consistency of process clearance capability (CQA).")
SIM_EQUIV_CI = "Equivalence testing (e.g. the 90% confidence-interval approach)"

PRIN_MOLFORM = ("Perform head-to-head qualitative/spectral comparison of the candidate and the reference "
                "product under identical conditions; interpret differences using the theoretical structure "
                "and orthogonal methods. Major molecular forms should correspond; differences should be "
                "explainable by known glycoforms or post-translational modifications, and no unexplainable "
                "new molecular forms should appear.")
PRIN_HOS = ("Perform head-to-head qualitative/spectral comparison of the candidate and the reference "
            "product under identical conditions; interpret differences using the theoretical structure "
            "and orthogonal methods. Multiple orthogonal methods should jointly support overall "
            "conformational similarity.")
PRIN_GLYCO_GENERAL = ("Major glycoform species and overall distribution should be similar to the reference "
                      "product; high-risk glycoforms require stricter assessment and should be linked to Fc "
                      "function, PK or immunogenicity risk.")
PRIN_BINDING = ("Candidate and reference should show similarity in binding affinity (KD, ka, kd) and/or "
                "relative binding activity; evaluate statistically using the QR approach or the 90% "
                "confidence-interval approach. If the 90% CI of the relative binding activity (or KD ratio) "
                "falls entirely within the predefined equivalence margin and the kinetic profiles are "
                "consistent with the reference product, binding is judged similar")

LIMIT_QR = ("No universal numerical limit applies to all products. A risk-based quality-range approach may "
            "be used: QR = (μR − XσR, μR + XσR); X must be justified according to the risk of the attribute. "
            "If a sufficient proportion of batches (e.g. ≥90%) fall within the range, similarity of the "
            "attribute can be supported; means, SDs and distributions should also be compared.")
LIMIT_MASS = ("No universal numerical limit applies to all products; instrument mass accuracy is a "
              "method-performance characteristic, not a \"similar if within X Da\" decision line")
LIMIT_HOS = "No universal numerical limit applies to all products; use head-to-head qualitative or spectral comparison."
LIMIT_SIALIC = ("No universal numerical limit; assess differences using head-to-head spectral comparison "
                "plus the quality-range (QR) approach")
LIMIT_KD_MARGIN_8025 = ("No universal absolute KD limit; relative binding activity (%) should use a predefined "
                        "equivalence margin (e.g. 80%–125%), verified head-to-head under identical experimental "
                        "conditions; the margin must be justified based on method variability and reference "
                        "batch-to-batch variability.")
LIMIT_KD_MARGIN = ("No universal absolute KD limit; relative binding activity (%) should use a predefined "
                   "equivalence margin, verified head-to-head under identical experimental conditions")
LIMIT_EQUIV_HIST = ("No universal numerical limit; a reasonable equivalence margin must be predefined and "
                    "justified based on method validation and historical reference batch data")

REMARK_DASH = "-"

METHOD_PEPTIDE_MAP_MSMS = "Peptide mapping LC-MS/MS"
METHOD_CROSS_CONFIRM = "Cross-confirmation among intact/deglycosylated/subunit results"
METHOD_ORTHO_PRINCIPLE = "Orthogonal methods based on different principles"
METHOD_HIGHRES_IF_NEEDED = "High-resolution structural techniques where necessary"
METHOD_HILIC_MS = "HILIC-MS"
METHOD_GLYCOPEPTIDE_MSMS = "Glycopeptide LC-MS/MS"
METHOD_RELEASED_GLYCAN_HILIC = "Released N-glycan HILIC-FLD"
METHOD_SEC_UV = "SEC-UV"
METHOD_SEC_MALS = "SEC-MALS/AUC/CE-SDS"
METHOD_REDUCED_CESDS = "Reduced CE-SDS"
METHOD_NONREDUCED_CESDS = "Non-reduced CE-SDS"
METHOD_CEX_ICIEF = "CEX-HPLC or icIEF"
METHOD_ICIEF_CEX_ORTHO = "icIEF orthogonal to CEX"
METHOD_PEAK_LCMS_ID = "LC-MS identification after peak fractionation"
METHOD_SPR = "SPR (surface plasmon resonance)"
METHOD_INTACT_SUBUNIT_LCMS = "Intact/subunit molecular mass LC-MS"
METHOD_REDUCED_PEPTIDE_MAP = "Peptide mapping LC-MS/MS (reduced peptide map)"
METHOD_RELEASED_GLYCAN_HILIC_LCMS = "Released N-glycan HILIC-FLD/LC-MS"

# ---------------------------------------------------------------------------
# Per-row field translations for sheet "2.特性鉴定"
# Field keys: guidelineTerm, itemName, applicability, purpose,
#             detectionIndicators, similarityMethod, judgingPrinciple,
#             numericLimit, remark
# ---------------------------------------------------------------------------

FIELD_EN: dict[tuple[int, str], str] = {}


def _row(row_number: int, **fields: str) -> None:
    for field_name, english_text in fields.items():
        FIELD_EN[(row_number, field_name)] = english_text


_row(2,
     guidelineTerm="Intact molecular mass",
     itemName="Intact molecular mass (intact mass)",
     applicability=APP_GENERAL_PAREN,
     purpose="Confirm the overall molecular composition and major molecular forms.",
     detectionIndicators="Deconvoluted intact mass (Da), major mass peaks, peak profile",
     similarityMethod=SIM_QUAL_MASS,
     judgingPrinciple=PRIN_MOLFORM,
     numericLimit=LIMIT_MASS,
     remark="In the mass spectrometry context, \"molecular weight\" is usually reported as the deconvoluted molecular mass (Da).")

_row(3,
     guidelineTerm="Deglycosylated molecular mass",
     itemName="Deglycosylated intact molecular mass",
     applicability=APP_GENERAL_PAREN,
     purpose="Confirm the protein backbone mass after removing the influence of N-glycans.",
     detectionIndicators="Deglycosylated intact mass (Da)",
     similarityMethod=SIM_QUAL_MASS,
     judgingPrinciple=PRIN_MOLFORM,
     numericLimit=LIMIT_MASS,
     remark="Refers to measuring the intact protein mass after releasing N-glycans, reducing the impact of glycoform heterogeneity on the intact mass.")

_row(4,
     guidelineTerm="Light chain molecular mass",
     itemName="Light chain molecular mass",
     applicability=APP_MAB,
     purpose="Confirm antibody light chain composition and terminal processing.",
     detectionIndicators="Light chain mass (Da)",
     similarityMethod=SIM_QUAL_MASS,
     judgingPrinciple=PRIN_MOLFORM,
     numericLimit=LIMIT_MASS,
     remark="Not applicable to non-antibody products or products without a light chain.")

_row(5,
     guidelineTerm="Non-deglycosylated heavy chain molecular mass",
     itemName="Non-deglycosylated heavy chain molecular mass",
     applicability=APP_MAB,
     purpose="Observe heavy chain backbone and glycan heterogeneity simultaneously.",
     detectionIndicators="Heavy chain mass distribution (Da)",
     similarityMethod=SIM_QUAL_MASS,
     judgingPrinciple=PRIN_MOLFORM,
     numericLimit=LIMIT_MASS,
     remark="Measured with heavy-chain glycans retained, reflecting the joint contribution of heavy chain backbone and glycoforms.")

_row(6,
     guidelineTerm="Deglycosylated heavy chain molecular mass",
     itemName="Deglycosylated heavy chain molecular mass",
     applicability=APP_MAB,
     purpose="Distinguish heavy chain backbone differences from glycan differences.",
     detectionIndicators="Deglycosylated heavy chain mass (Da)",
     similarityMethod=SIM_QUAL_MASS,
     judgingPrinciple=PRIN_MOLFORM,
     numericLimit=LIMIT_MASS,
     remark="Distinguishes protein backbone differences from glycan differences.")

_row(7,
     guidelineTerm="Sequence coverage / MS1",
     itemName="MS1 peptide mass coverage",
     applicability=APP_GENERAL,
     purpose="Support sequence coverage with peptide precursor-mass matching, as part of the sequence evidence.",
     detectionIndicators="Coverage %, matched peptides, peptide map",
     similarityMethod="Qualitative sequence support plus coverage description",
     judgingPrinciple=PRIN_MOLFORM,
     numericLimit="No universal numerical limit; attention should be paid to critical regions and method blind spots",
     remark="\"MS1\" is not an independent quality attribute but an evidence tier within peptide mapping where precursor-mass matching supports sequence coverage. MS1 mass matching cannot replace MS/MS sequence confirmation.")

_row(8,
     guidelineTerm="Sequence coverage / MS/MS",
     itemName="MS/MS-confirmed sequence coverage",
     applicability=APP_GENERAL,
     purpose="Confirm peptide sequences and modification sites via fragment ions.",
     detectionIndicators="MS/MS-confirmed coverage, fragment-ion spectra, modification-site information",
     similarityMethod="Direct sequence alignment",
     judgingPrinciple="The amino acid sequence should in principle be identical to the reference product; critical regions require sufficient sequence evidence, and no unexplained amino acid substitutions are allowed.",
     numericLimit="In principle the sequence must be identical; clear evidence should be obtained for CDRs and function-critical regions.",
     remark="Peptide sequences are confirmed by fragment ions, providing stronger evidence than MS1 mass matching alone.")

_row(9,
     guidelineTerm="Post-translational modification — modification 1",
     itemName="See supplementary entries at the end of the table",
     applicability="To be developed for the specific product",
     purpose="Template requirement: fill in the specific modifications and their sites/abundance for the product.",
     detectionIndicators="Modification sites, relative abundance %, related spectra",
     similarityMethod="Qualitative identification plus quantitative QR / actual range",
     judgingPrinciple="First confirm modification types and sites; high/medium-risk quantifiable modifications may be compared by QR or actual range; modifications directly related to the MoA may be linked to functional evaluation.",
     numericLimit=LIMIT_QR,
     remark="Common terminal-modification examples such as oxidation and deamidation are supplemented at the end of this table.")

_row(10,
     guidelineTerm="Post-translational modification — modification 2")

_row(11,
     guidelineTerm="Identification of CDR signature peptides",
     itemName="Confirmation of CDR signature peptides",
     applicability=APP_MAB,
     purpose="Confirm antibody function-critical sequences and signature peptides.",
     detectionIndicators="Retention time, mass and MS/MS sequence of CDR signature peptides",
     similarityMethod="Direct qualitative comparison",
     judgingPrinciple="The candidate's CDR signature peptides should be identical to the reference product / theoretical sequence.",
     numericLimit="Not applicable; qualitative identity confirmation",
     remark="Applicable to antibody products only.")

_row(12,
     guidelineTerm="C/N-terminal amino acid sequence",
     itemName="N/C-terminal amino acid sequence and terminal heterogeneity",
     applicability=APP_GENERAL,
     purpose="Confirm terminal sequences and clipping/processing forms.",
     detectionIndicators="Terminal sequences, pyroglutamation, C-terminal Lys retention/loss ratios",
     similarityMethod="Qualitative sequence plus quantitative distribution",
     judgingPrinciple="Terminal sequences should be identical; quantifiable terminal variants may use QR or actual range in a risk-based manner.",
     numericLimit="Sequence itself → qualitative; variant proportions → QR",
     remark="The guideline writes C/N-terminus; the standard wording is usually N/C-terminus, covering terminal sequences and processing heterogeneity.")

_row(13,
     guidelineTerm="Free thiols",
     itemName="Free thiol level",
     applicability=APP_GENERAL,
     purpose="Assess unpaired cysteines and potential misfolding/aggregation risk.",
     detectionIndicators="mol SH / mol protein, or relative fluorescence/content",
     similarityMethod=SIM_QR,
     judgingPrinciple="The distribution should be broadly similar to the reference product and should not suggest increased mislinkage or aggregation risk for the candidate.",
     numericLimit=LIMIT_QR,
     remark="Reflects unpaired cysteines, which may be associated with misfolding, disulfide scrambling or aggregation.")

_row(14,
     guidelineTerm="Disulfide bonds",
     itemName="Disulfide linkage map",
     applicability=APP_GENERAL,
     purpose="Confirm expected intra-/inter-chain disulfide bonds and abnormal pairings.",
     detectionIndicators="Linked peptides, coverage of expected linkages, abnormal linkages",
     similarityMethod="Direct qualitative comparison",
     judgingPrinciple="The expected disulfide linkage pattern should be identical; no unexplained new linkage forms should appear.",
     numericLimit="Not applicable; the expected linkage pattern being identical is sufficient",
     remark="Expected intra- and inter-chain disulfide bonds and abnormal pairings must be confirmed.")

_row(15,
     guidelineTerm="Circular dichroism / far-UV",
     itemName="Secondary structure (far-UV CD)",
     applicability=APP_GENERAL,
     purpose="Assess protein folding, conformation and stability from different perspectives.",
     detectionIndicators="Ellipticity-wavelength spectrum, secondary structure signatures",
     similarityMethod=SIM_HOS,
     judgingPrinciple=PRIN_HOS,
     numericLimit=LIMIT_HOS,
     remark="The peptide bond is a chiral chromophore absorbing in the far-UV region (190–250 nm); regular arrangements such as α-helix and β-sheet produce characteristic CD signals")

_row(16,
     guidelineTerm="Circular dichroism / near-UV",
     itemName="Tertiary structure (near-UV CD)",
     applicability=APP_GENERAL,
     purpose="Assess protein folding, conformation and stability from different perspectives.",
     detectionIndicators="Ellipticity-wavelength spectrum, aromatic-residue microenvironment",
     similarityMethod=SIM_HOS,
     judgingPrinciple=PRIN_HOS,
     numericLimit=LIMIT_HOS,
     remark="Near-UV CD mainly reflects the microenvironment around aromatic residues and disulfide bonds; a distinct CD signal (250–350 nm) appears only when these are held in a rigid, asymmetric microenvironment inside the protein.")

_row(17,
     guidelineTerm="Fluorescence spectroscopy",
     itemName="Tertiary structure (intrinsic fluorescence)",
     applicability=APP_GENERAL,
     purpose="Assess protein folding, conformation and stability from different perspectives.",
     detectionIndicators="Emission peak position, intensity, spectral shape",
     similarityMethod=SIM_HOS,
     judgingPrinciple=PRIN_HOS,
     numericLimit=LIMIT_HOS,
     remark="Reflects the microenvironment of fluorophores such as tryptophan (Trp) and tyrosine (Tyr).")

_row(18,
     guidelineTerm="Thermal stability",
     itemName="Thermal stability / thermal transitions",
     applicability=APP_GENERAL,
     purpose="Assess protein folding, conformation and stability from different perspectives.",
     detectionIndicators="Tm, thermal transition peaks and curves",
     similarityMethod=SIM_HOS,
     judgingPrinciple=PRIN_HOS,
     numericLimit=LIMIT_HOS,
     remark=REMARK_DASH)

_row(19,
     guidelineTerm="-",
     itemName="Other higher-order structure confirmation methods (see supplementary entries)",
     applicability=APP_PRODUCT_SPECIFIC,
     purpose="Assess protein folding, conformation and stability from different perspectives.",
     detectionIndicators="See supplementary entries at the end of the table",
     similarityMethod=SIM_HOS,
     judgingPrinciple=PRIN_HOS,
     numericLimit=LIMIT_HOS,
     remark="FT-IR, HDX-MS, NMR, etc. can be used as supplements. Sample concentration, buffer and data processing must be identical.")

_row(20,
     guidelineTerm="N-glycosylation site (asparagine, Asn / N)",
     itemName="N-glycosylation sites and site occupancy",
     applicability=APP_GLYCO,
     purpose="Confirm the glycan attachment sites and the degree of glycosylation at each site.",
     detectionIndicators="Glycosylation sites; relative content of each glycoform (%); site occupancy (%)",
     similarityMethod="Site identity should qualitatively match the reference, plus quantitative comparison of occupancy",
     judgingPrinciple="Glycosylation sites should be consistent with the reference product and the expected structure. For typical IgG monoclonal antibodies, the conserved Fc N-glycosylation site (usually Asn-297, EU numbering) should be confirmed; any other N- or O-glycosylation sites should be identified and their occupancy evaluated separately",
     numericLimit=LIMIT_QR,
     remark="Pay particular attention to the non-glycosylated heavy chain (NGHC) ratio; NGNA risk requires extra monitoring when NS0/SP2/0 cells are used.")

_row(21,
     guidelineTerm="N-glycan types and proportions / G0F",
     itemName="G0F glycoform proportion",
     applicability=APP_GLYCO,
     purpose="Assess the relative distribution of the agalactosylated, core-fucosylated glycoform G0F between the candidate and the reference product",
     detectionIndicators="Peak area percentage of each glycoform (e.g. G0F%, G1F%, G2F%); total glycan profile (HILIC chromatogram)",
     similarityMethod="Head-to-head profile comparison plus quantitative QR approach; key glycoforms require statistical equivalence testing",
     judgingPrinciple="Major glycoform species and overall distribution should closely match the reference profile; G0F, as the main peak, may use the quality-range approach; high-risk glycoforms (e.g. G0, high-mannose) require stricter assessment linked to Fc function, PK or immunogenicity risk",
     numericLimit=LIMIT_QR,
     remark="G0F is the tallest peak in the glycan profile; core fucosylation is inversely correlated with FcγRIIIa binding and ADCC activity; fluctuation of the afucosylated variant (G0) proportion needs close attention")

_row(22,
     guidelineTerm="N-glycan types and proportions / G0",
     itemName="G0 glycoform proportion",
     applicability=APP_GLYCO,
     purpose="Assess the relative distribution of the G0 glycoform (afucosylated, agalactosylated) between the candidate and the reference product",
     detectionIndicators="Peak area percentage of each glycoform (especially G0%, G0F%); total glycan profile (HILIC chromatogram)",
     similarityMethod="Head-to-head profile comparison plus quantitative QR approach (reference mean ± Xσ, X justified by risk tier); the G0 proportion must be strictly controlled",
     judgingPrinciple="As a high-risk gain-of-function glycoform, the G0 proportion must not be significantly higher than the reference; exceedance requires ADCC functional verification. Overall glycoform distribution should be similar to the reference; high-risk glycoforms require stricter assessment linked to Fc function, PK or immunogenicity risk",
     numericLimit=LIMIT_QR,
     remark="A biosimilar should keep the G0 proportion highly consistent with the reference product; abnormal G0 levels often signal altered FUT8 enzyme activity")

_row(23,
     guidelineTerm="N-glycan types and proportions / others",
     itemName="Other major/minor N-glycoforms",
     applicability=APP_PRODUCT_SPECIFIC,
     purpose="To be developed based on the specific product",
     detectionIndicators="Peak area % of each glycoform, glycan profile",
     similarityMethod=SIM_QR_SPECTRA,
     judgingPrinciple=PRIN_GLYCO_GENERAL,
     numericLimit=LIMIT_QR,
     remark="Fill in according to the product's actual glycan profile, e.g. G1F, G2F, high-mannose species.")

_row(24,
     guidelineTerm="Sialylation / NGNA",
     itemName="N-glycolylneuraminic acid (NGNA)",
     applicability=APP_GLYCO,
     purpose="Identify and quantify NGNA to monitor non-human glycan levels in the product and assess potential immunogenicity risk.",
     detectionIndicators="Proportion of each sialylated glycoform (peak area %), or NGNA content within total glycans.",
     similarityMethod=SIM_QR_SPECTRA,
     judgingPrinciple="If NGNA is detected, its content should be highly consistent with the reference product and be linked to potential Fc-function, PK or immunogenicity risk.",
     numericLimit=LIMIT_SIALIC,
     remark="NGNA may involve non-human glycan risk; check whether it exists in the reference product and compare strictly. Sialic acids are released by acid hydrolysis and labeled by DMB derivatization before detection; FLD for quantification, LC-MS for structural confirmation.")

_row(25,
     guidelineTerm="Sialylation / NANA",
     itemName="N-acetylneuraminic acid (NANA)",
     applicability=APP_GLYCO,
     purpose="Representative indicator of human-type sialic acid; head-to-head comparison of terminal sialylation levels (total sialic acid and glycoform distribution) for similarity",
     detectionIndicators="Percentage of total sialylated glycoforms within total N-glycans; relative proportions of individual sialylated glycoforms",
     similarityMethod=SIM_QR_SPECTRA,
     judgingPrinciple=PRIN_GLYCO_GENERAL,
     numericLimit=LIMIT_SIALIC,
     remark="Common human-type sialic acid and a normal terminal modification of antibody Fc N-glycans; total amount and related glycoform distribution should be compared.")

_row(26,
     guidelineTerm="Molar extinction coefficient",
     itemName="Molar extinction coefficient",
     applicability=APP_GENERAL,
     purpose="Support protein concentration calculation and basic property characterization.",
     detectionIndicators="ε value with measurement wavelength and unit",
     similarityMethod="Direct comparison / confirmation of basic parameters",
     judgingPrinciple="Measured values should agree with the theoretical value and the reference results, or the differences should be explainable.",
     numericLimit="No universal numerical limit applies to all products; the instrument's allowed absorbance error must not be treated as a similarity limit.",
     remark="Used for protein content calculation and identity/property description, usually combining theoretical calculation with experimental measurement.")

_row(27,
     guidelineTerm="Isoelectric point",
     itemName="Isoelectric point (pI)",
     applicability=APP_GENERAL,
     purpose="Assess the overall charge characteristics and identity of the protein.",
     detectionIndicators="pI, peak profile and isoform distribution",
     similarityMethod="Profile comparison plus actual range",
     judgingPrinciple="pI and overall charge characteristics should be similar to the reference; quantitative results may be combined with the actual range.",
     numericLimit=LIMIT_QR,
     remark="Serves as an identity and charge-characteristic parameter; related to, but not identical with, the charge-variant distribution.")

_row(28,
     guidelineTerm="Size-exclusion chromatography / aggregates",
     itemName="High-molecular-weight species / aggregates (HMW)",
     applicability=APP_GENERAL,
     purpose="Assess the content of high-molecular-weight aggregates (HMW) to monitor physical stability and immunogenicity risk.",
     detectionIndicators="HMW peak area % and chromatogram",
     similarityMethod=SIM_QR_SPECTRA,
     judgingPrinciple="The candidate should not show an unfavorably increased aggregate risk; the overall distribution should be supported by the reference range.",
     numericLimit=LIMIT_QR,
     remark="The guideline uses \"聚体\"; the standardized wording is aggregates or HMW species.")

_row(29,
     guidelineTerm="Size-exclusion chromatography / main peak",
     itemName="SEC main peak / monomer",
     applicability=APP_GENERAL,
     purpose="Determine similarity in SEC main-peak (monomer) purity, indirectly assessing the overall levels of HMW aggregates and LMW fragments",
     detectionIndicators="SEC main peak area percentage (%), main peak retention time, chromatogram",
     similarityMethod=SIM_QR_SPECTRA,
     judgingPrinciple="Monomer/main-peak distribution should be broadly similar to the reference product.",
     numericLimit=LIMIT_QR,
     remark="For mAbs the main peak usually corresponds to the monomer, but peak identification results should prevail.")

_row(30,
     guidelineTerm="Size-exclusion chromatography / fragments",
     itemName="Low-molecular-weight species / fragments (LMW)",
     applicability=APP_GENERAL,
     purpose="Determine similarity in low-molecular-weight fragment (LMW) peak area and distribution between the candidate and the reference product",
     detectionIndicators="LMW peak area percentage (%), LMW peak retention time, full SEC chromatogram overlay.",
     similarityMethod=SIM_QR_SPECTRA,
     judgingPrinciple="The candidate's LMW level and overall profile should be similar to the reference; any abnormal peak absent from the reference profile should be structurally identified (e.g. by MS) and its risk assessed.",
     numericLimit=LIMIT_QR,
     remark="SEC has limited resolution for some small fragments and can be used orthogonally with CE-SDS.")

_row(31,
     guidelineTerm="Reduced CE-SDS / light + heavy chains",
     itemName="Reduced CE-SDS heavy + light chain purity",
     applicability=APP_MAB,
     purpose="Determine LC and HC peak area percentages and total purity under reducing conditions, assessing subunit integrity, LC/HC stoichiometry and the non-glycosylated heavy chain (NGHC) level",
     detectionIndicators="Light chain (LC) peak area %, heavy chain (HC) peak area %, total purity (LC+HC), LC/HC peak area ratio",
     similarityMethod=SIM_QR_SPECTRA,
     judgingPrinciple="Reduced purity and fragment distribution should be similar between candidate and reference; new peaks must be identified and their risk assessed.",
     numericLimit=LIMIT_QR,
     remark="Under reducing conditions the evaluation focuses on heavy chain, light chain and their related fragments.")

_row(32,
     guidelineTerm="Reduced CE-SDS / fragments",
     itemName="Reduced CE-SDS fragments/impurities",
     applicability=APP_GENERAL,
     purpose="Determine similarity in fragment/impurity peaks (other than the LC/HC main peaks) under reducing conditions, assessing subunit structural integrity and susceptibility to proteolytic clipping",
     detectionIndicators="Fragment/impurity peak area percentage (%), migration times of major impurity peaks, fragment distribution profile",
     similarityMethod=SIM_QR_SPECTRA,
     judgingPrinciple="Fragment/impurity levels and the overall profile should be similar to the reference; any candidate-specific peak absent from the reference profile must be structurally identified by MS or spiking experiments and its risk assessed.",
     numericLimit=LIMIT_QR,
     remark="Peak assignment and quantification must be defined: peaks are usually assigned by migration time (MT) and quantified by peak-area normalization.")

_row(33,
     guidelineTerm="Non-reduced CE-SDS / main peak",
     itemName="Non-reduced CE-SDS main peak",
     applicability=APP_GENERAL,
     purpose="Determine purity and peak area percentage of the intact antibody main peak (~150 kDa) under non-reducing conditions, assessing the level of covalent aggregates",
     detectionIndicators="Non-reduced CE-SDS main peak area percentage (%), main peak migration time, full electropherogram",
     similarityMethod=SIM_QR_SPECTRA,
     judgingPrinciple="Non-reduced main-peak purity and the overall profile should be similar to the reference; for any new peak above LOQ absent from the reference profile, first exclude method artifacts, then identify its structure by LC-MS/MS or spiking, and assess its potential impact on ADCC, FcRn binding or immunogenicity",
     numericLimit=LIMIT_QR,
     remark="Non-reduced CE-SDS detects covalent aggregates; combined with SEC (covalent + non-covalent) and reduced CE-SDS (peptide-chain integrity), it provides complementary size-variant evidence.")

_row(34,
     guidelineTerm="Non-reduced CE-SDS / fragments",
     itemName="Non-reduced CE-SDS fragments/impurities",
     applicability=APP_GENERAL,
     purpose="Determine similarity in covalently linked fragments/impurities (other than the intact main peak) under non-reducing conditions, assessing abnormal disulfide linkage and covalent structural variants",
     detectionIndicators="Non-reduced CE-SDS fragment/impurity peak area percentage (%), migration times of major impurity peaks, fragment distribution profile",
     similarityMethod=SIM_QR_SPECTRA,
     judgingPrinciple="Non-reduced fragment/impurity levels and the overall profile should be similar to the reference; for any new peak above LOQ absent from the reference profile, first exclude method artifacts, then identify its structure by LC-MS/MS or spiking, and assess its potential impact on ADCC, FcRn binding or immunogenicity",
     numericLimit=LIMIT_QR,
     remark="Non-reduced CE-SDS detects covalently linked fragments/impurities")

_row(35,
     guidelineTerm="Charge variants / acidic region",
     itemName="Acidic variant proportion",
     applicability=APP_GENERAL,
     purpose="Key quantitative indicator of charge-variant comparability: determine similarity in acidic-region charge-variant peak areas and distribution",
     detectionIndicators="Acidic region peak area percentage (%), retention/relative migration times of acidic sub-peaks, acidic-region profile",
     similarityMethod=SIM_QR_SPECTRA,
     judgingPrinciple="The acidic-region distribution should be broadly similar to the reference; significant deviations require structural assignment of key sub-peaks within the acidic region",
     numericLimit=LIMIT_QR,
     remark="The \"acidic region\" is the sum/region of multiple acidic variants; peak grouping rules must be specified.")

_row(36,
     guidelineTerm="Charge variants / main peak",
     itemName="Main charge peak proportion",
     applicability=APP_GENERAL,
     purpose="Determine similarity in the main charge peak (Main Peak) area percentage between the candidate and the reference product",
     detectionIndicators="Main peak area percentage (%), main peak retention time / pI, main-peak profile",
     similarityMethod=SIM_QR_SPECTRA,
     judgingPrinciple="The main peak and the overall charge distribution (acidic + main + basic) should be similar to the reference.",
     numericLimit=LIMIT_QR,
     remark="The main peak is not necessarily the absolutely \"correct molecule\"; interpret it together with peak identification.")

_row(37,
     guidelineTerm="Charge variants / basic region",
     itemName="Basic variant proportion",
     applicability=APP_GENERAL,
     purpose="Key quantitative indicator of charge-variant comparability: determine similarity in basic-region peak areas and distribution, assessing the consistency of basic modifications such as C-terminal lysine processing and N-terminal pyroglutamation",
     detectionIndicators="Basic region peak area percentage (%), retention/relative migration times of basic sub-peaks, basic-region profile",
     similarityMethod=SIM_QR_SPECTRA,
     judgingPrinciple="Basic-region peak area percentage and the overall profile should be similar to the reference; significant deviations (beyond the QR range) require structural assignment of key basic sub-peaks (e.g. confirming C-terminal lysine retention or N-terminal pyroglutamation by peptide mapping LC-MS/MS)",
     numericLimit=LIMIT_QR,
     remark="The basic region usually arises from incomplete C-terminal lysine processing and incomplete N-terminal pyroglutamation; together with the acidic region (deamidation, sialylation) it completes the charge-variant evaluation.")

_row(38,
     guidelineTerm="Binding activity",
     itemName="Target/antigen binding activity",
     applicability=APP_GENERAL,
     purpose="Confirm Fab-related target recognition and affinity characteristics.",
     detectionIndicators="KD, ka, kd or relative binding activity %",
     similarityMethod="Quantitative QR; the candidate-to-reference binding activity ratio should fall within the predefined equivalence margin",
     judgingPrinciple="Binding kinetics and/or relative binding activity meet predefined criteria, with consistent curves and mechanistic interpretation.",
     numericLimit="No universal numerical limit; the equivalence margin must be predefined before the experiment (e.g. 80%–125%) and verified head-to-head under identical conditions; dose-response curve shape and mechanistic interpretation should be consistent with the reference.",
     remark="Usually refers to Fab-related target binding; the specific method depends on the mechanism of action.")

_row(39,
     guidelineTerm="Biological activity",
     itemName="MoA-related biological activity / relative potency",
     applicability=APP_GENERAL,
     purpose="Assess in-vitro functions related to the clinical mechanism of action.",
     detectionIndicators="Relative potency %, EC50/IC50",
     similarityMethod="90% confidence-interval equivalence testing; dose-response curve parallelism analysis",
     judgingPrinciple="The candidate's relative potency should pass the predefined equivalence test; if multiple mechanisms of action (MoA) exist, each relevant mechanism must be evaluated separately and all results must fall within the equivalence margin; dose-response curves should be parallel to verify MoA consistency.",
     numericLimit="No universal numerical limit; biological activities directly related to the MoA should be evaluated with a predefined equivalence margin (e.g. 80%–125%); margin selection must be justified by the product's MoA and clinical relevance.",
     remark="Biological activity reflects the functional effect after target binding (e.g. signal activation, cell killing, growth inhibition); together with binding activity (affinity) it completes the Fab functional evaluation.")

_row(40,
     guidelineTerm="FcγRI binding",
     itemName="FcγRI (CD64) binding activity",
     applicability=APP_MAB,
     purpose="Determine similarity in FcγRI (CD64) binding affinity (KD) and kinetics (ka, kd); FcγRI binding forms part of the Fc-receptor binding profile as supplementary evidence for ADCP (antibody-dependent cellular phagocytosis) and immune-complex clearance functions.",
     detectionIndicators="KD, ka, kd or relative binding activity %",
     similarityMethod=SIM_BIND_QR_CI,
     judgingPrinciple=PRIN_BINDING,
     numericLimit=LIMIT_KD_MARGIN_8025,
     remark="FcγRI (CD64) binding mainly reflects the potential to mediate ADCP and immune-complex clearance; its criticality depends on whether the product's MoA requires macrophage-mediated clearance of target cells.")

_row(41,
     guidelineTerm="FcγRIIa binding",
     itemName="FcγRIIa (CD32a) binding activity",
     applicability=APP_MAB,
     purpose="Determine similarity in FcγRIIa (CD32a) binding affinity (KD) and kinetics (ka, kd), assessing the potential for ADCP, immune-complex handling and platelet activation.",
     detectionIndicators="KD, ka, kd or relative binding activity %",
     similarityMethod=SIM_BIND_QR_CI,
     judgingPrinciple=PRIN_BINDING,
     numericLimit=LIMIT_KD_MARGIN_8025,
     remark="FcγRIIa (CD32a) is a low-affinity activating Fcγ receptor expressed mainly on platelets, monocytes and macrophages; its binding reflects the potential for immune-complex clearance and platelet-activation risk. Whether it is a critical attribute depends on the MoA and clinical safety concerns; if relevant to the MoA, the 131H and 131R polymorphic variants should be evaluated separately.")

_row(42,
     guidelineTerm="FcγRIIb binding (KD, M)",
     itemName="FcγRIIb (CD32b) binding activity",
     applicability=APP_MAB,
     purpose="Determine similarity in FcγRIIb (CD32b) binding affinity (KD) and kinetics (ka, kd), assessing the product's potential to bind the inhibitory Fc receptor",
     detectionIndicators="KD, ka, kd or relative binding activity %",
     similarityMethod=SIM_BIND_QR_CI,
     judgingPrinciple=PRIN_BINDING,
     numericLimit=LIMIT_KD_MARGIN_8025,
     remark="FcγRIIb (CD32b) is the only known inhibitory Fcγ receptor, expressed mainly on B cells, dendritic cells and macrophages, playing key roles in regulating B-cell activation, maintaining immune tolerance and suppressing inflammation")

_row(43,
     guidelineTerm="FcγRIIIa binding (KD, M)",
     itemName="FcγRIIIa (CD16a) binding activity",
     applicability=APP_MAB,
     purpose="Determine similarity in FcγRIIIa (CD16a) binding affinity (KD) and kinetics (ka, kd), assessing the product's potential to mediate ADCC (antibody-dependent cell-mediated cytotoxicity)",
     detectionIndicators="KD, ka, kd or relative binding activity %",
     similarityMethod=SIM_BIND_QR_CI,
     judgingPrinciple=PRIN_BINDING + ". The 158V and 158F variants should be evaluated separately, interpreted together with afucosylated glycoform and ADCC functional data.",
     numericLimit="No universal absolute KD limit; relative binding activity (%) should use a predefined equivalence margin verified head-to-head under identical conditions; if different FcγRIIIa polymorphic variants are used, equivalence margins should be set and evaluated independently for each",
     remark="FcγRIIIa (CD16a) is a low-affinity activating Fcγ receptor on NK cells and the core receptor mediating ADCC; core fucosylation is inversely correlated with FcγRIIIa binding and ADCC activity; the impact of the FcγRIIIa 158V/F polymorphism on binding also needs attention")

_row(44,
     guidelineTerm="FcRn binding (KD, M)",
     itemName="FcRn (neonatal Fc receptor) binding activity",
     applicability=APP_MAB,
     purpose="Determine similarity in FcRn binding affinity (KD) and kinetics (ka, kd), assessing how efficiently the product is \"rescued\" by FcRn-mediated recycling in vivo, thereby indirectly predicting serum half-life (PK) similarity",
     detectionIndicators="KD, ka, kd or relative binding activity (%)",
     similarityMethod="As above, focusing on binding characteristics under acidic conditions and dissociation/low binding near neutral pH, confirming that candidate and reference share similar pH dependence.",
     judgingPrinciple=PRIN_BINDING,
     numericLimit="No universal absolute KD limit; relative binding activity (%) should use a predefined equivalence margin verified head-to-head under identical conditions; equivalence margins for pH 6.0 and pH 7.4 must be set and evaluated independently.",
     remark="FcRn-Fc binding is strictly pH-dependent — binding at acidic pH 6.0 and release at neutral pH 7.4. This pH-dependent bind-release cycle is the key mechanism by which antibodies are rescued from endosomes back into circulation, avoiding lysosomal degradation.")

_row(45,
     guidelineTerm="C1q binding",
     itemName="C1q binding activity",
     applicability="Mainly applicable to antibody products (non-antibody products need assessment); especially relevant for products relying on CDC (complement-dependent cytotoxicity)",
     purpose="Determine similarity in C1q binding affinity (KD) and binding characteristics, assessing the product's potential to mediate complement-dependent cytotoxicity (CDC)",
     detectionIndicators="KD, relative binding activity (%) or relative binding response",
     similarityMethod=SIM_BIND_QR_CI,
     judgingPrinciple=PRIN_BINDING.replace("kinetic profiles", "binding profiles"),
     numericLimit=LIMIT_KD_MARGIN,
     remark="C1q initiates the classical complement pathway; its binding to the Fc CH2 domain is the core trigger of CDC. Binding can be affected by Fc glycoforms, conformation and aggregation state and must be interpreted with product-specific data; SEC-HPLC aggregate data should be consulted in parallel to exclude false positives. This attribute is especially critical for antibodies whose MoA depends on CDC")

_row(46,
     guidelineTerm="ADCC",
     itemName="Antibody-dependent cell-mediated cytotoxicity",
     applicability="Mainly applicable to antibody products whose mechanism of action (MoA) relies on ADCC.",
     purpose="Determine similarity in mediating ADCC, assessing comparability of the product's Fc effector function",
     detectionIndicators="Relative potency (%) (preferred), EC50 or maximum lysis (Emax)",
     similarityMethod=SIM_EQUIV_CI,
     judgingPrinciple="The candidate's ADCC relative potency should be similar to the reference, with its 90% confidence interval entirely within the predefined equivalence margin",
     numericLimit=LIMIT_EQUIV_HIST,
     remark="ADCC activity is closely related to Fc glycosylation and aggregate (HMW) levels; it is a high-risk attribute only when ADCC is the MoA or an important effector function.")

_row(47,
     guidelineTerm="CDC",
     itemName="Complement-dependent cytotoxicity",
     applicability="Mainly applicable to antibody products, especially those relying on CDC as a key mechanism of action (MoA).",
     purpose="Head-to-head comparison of CDC activity between candidate and reference, assessing comparability of Fc function in complement activation.",
     detectionIndicators="Relative potency (%) (preferred), EC50 or Emax",
     similarityMethod=SIM_EQUIV_CI,
     judgingPrinciple="The candidate's CDC relative potency should be similar to the reference, with its 90% confidence interval entirely within the predefined equivalence margin",
     numericLimit=LIMIT_EQUIV_HIST,
     remark="A high-risk attribute only when complement effector function is the MoA; CDC activity is closely related to Fc galactosylation (G1F/G2F) and sialylation (NANA) levels and is highly sensitive to aggregates (HMW)")

_row(48,
     guidelineTerm="-",
     itemName="Other MoA-related functions",
     applicability=APP_PRODUCT_SPECIFIC,
     purpose="Cover all known and potentially important mechanisms of action of the reference product",
     detectionIndicators="-",
     similarityMethod="-",
     judgingPrinciple="All key functions must be supported by similarity evidence; one must not select only the single easiest-to-pass function.",
     numericLimit="No universal numerical limit applies to all products; evaluation items and criteria must be predefined based on the MoA and clinical relevance",
     remark="May include neutralization, enzymatic activity, receptor activation/blockade, cell-surface binding, etc.")

_row(49,
     guidelineTerm="-",
     itemName="Other product-related substances/impurities",
     applicability=APP_PRODUCT_SPECIFIC,
     purpose="Identify precursors, degradation products, misfolded species, aggregates and other molecular variants.",
     detectionIndicators="Impurity species, peak profiles, relative content and structural identification",
     similarityMethod="Quantitative QR / actual range plus decision process for new impurities",
     judgingPrinciple="Known impurities should be broadly comparable; impurities positively correlated with risk must not be unfavorably elevated; new impurities must be identified and their risk justified.",
     numericLimit=LIMIT_QR + " If a new peak/component absent from the reference appears, first exclude method artifacts, then identify, quantify and evaluate its impact on activity, safety and immunogenicity.",
     remark="Develop according to the product's actual degradation and variant pathways, including new peaks and unknown impurities; any new peak inconsistent with the reference profile requires structural identification and risk assessment.")

_row(50,
     guidelineTerm="Protein A residue",
     itemName="Residual Protein A",
     applicability="Mainly applicable to antibody products manufactured with a Protein A affinity chromatography process",
     purpose="Quantify residual Protein A in the final product (drug substance/drug product) to confirm that the downstream purification process (especially affinity chromatography) clears it stably and effectively to an acceptable level, controlling immunogenicity risk",
     detectionIndicators="Residual Protein A (ng/mg protein, or ppm)",
     similarityMethod=SIM_BATCH_LIMIT,
     judgingPrinciple="Every batch must be below a product-specific release limit supported by safety, process capability, clinical exposure and method performance, ensuring purification robustness; significant batch-to-batch fluctuation triggers a deviation investigation into column lifetime or cleaning conditions",
     numericLimit="Specific limits are set based on method validation (LOD, LOQ) and clinical/toxicology batch data, ensuring no risk to human safety",
     remark="Residual Protein A is an exogenous protein impurity and a core process-related impurity to monitor; its clearance directly affects immunogenicity risk. Not applicable if a non-Protein-A process is used.")

_row(51,
     guidelineTerm="Residual exogenous DNA",
     itemName="Residual exogenous DNA content",
     applicability="Applicable to all biologics produced using cell substrates.",
     purpose="Quantify residual host-cell DNA in the final product to confirm downstream clearance capability, controlling potential tumorigenicity, infectivity and immunogenicity risks",
     detectionIndicators="Residual host-cell DNA content (pg/dose or ng/mg) and DNA fragment size distribution",
     similarityMethod=SIM_BATCH_LIMIT,
     judgingPrinciple="Residual DNA in every batch must be below the statutory limit; significant fluctuation triggers a deviation investigation.",
     numericLimit="Refer to Chinese Pharmacopoeia 2020 Volume III general chapter 3407 and relevant international guidelines (ICH Q5A, FDA guidance)",
     remark="A key process-related impurity to monitor; clearance efficiency directly affects product safety")

_row(52,
     guidelineTerm="Residual host cell protein",
     itemName="Residual host cell protein (HCP)",
     applicability="Applicable to all biologics produced using cell substrates.",
     purpose="Quantify residual HCP in the drug substance/product to confirm downstream clearance capability, controlling immunogenicity and quality risks",
     detectionIndicators="Residual HCP (ng/mg or ppm)",
     similarityMethod=SIM_BATCH_LIMIT,
     judgingPrinciple="HCP in every batch must be below the release limit; significant fluctuation or approaching the alert limit triggers a deviation investigation",
     numericLimit="Refer to Chinese Pharmacopoeia 2020 general chapters (e.g. 3412), ICH Q6B and USP <1132>.",
     remark="HCP is a key process-related impurity to monitor. Besides test results, the dossier should include antibody-coverage validation data for the assay kit and a process clearance evaluation report")

_row(53,
     guidelineTerm="-",
     itemName="Other process-related impurities",
     applicability=APP_PRODUCT_SPECIFIC,
     purpose="Based on the product-specific process and raw materials, systematically identify, quantify and assess clearance of process-related impurities introduced by media, purification resins, filters and packaging using fully validated methods, ensuring residues stay within acceptable safety limits",
     detectionIndicators="-",
     similarityMethod="Safety risk control; strict matching to the reference product is not the sole objective",
     judgingPrinciple="Process-related impurities generally need not qualitatively match the reference because processes differ; the core is adequate control with suitable methods and demonstrating no increased safety/immunogenicity risk",
     numericLimit="Specific specifications depend on the product, process, pharmacopoeia/regulations and safety justification",
     remark="Determined by media, reagents, chromatography resins, filters, packaging materials, etc.")

_row(54,
     guidelineTerm="Oxidation (P3, structural summary example)",
     itemName="Oxidation of methionine/tryptophan residues",
     applicability=APP_SUPP,
     purpose="Compare oxidation sites and relative abundance of oxidation-prone residues such as methionine (Met) and tryptophan (Trp), assessing similarity of the oxidation profile",
     detectionIndicators="Relative abundance (%) of oxidation sites; oxidation levels at key hotspots (e.g. Met-252, Met-428); MS/MS spectra of oxidized peptides.",
     similarityMethod="Quantitative QR / actual range plus functional correlation",
     judgingPrinciple="Oxidation-site distribution should be broadly similar between candidate and reference; differences at non-critical sites are acceptable if they do not affect antigen-binding affinity (SPR/BLI) or Fc effector functions (ADCC/CDC/FcRn binding)",
     numericLimit="No unified biosimilar \"similarity\" value; specific specifications depend on the product, process, pharmacopoeia/regulations and safety justification.",
     remark="A common chemical degradation pathway whose risk depends on location: CDR oxidation may directly reduce affinity; Fc Met-252/428 oxidation may shorten half-life. The testing strategy should reflect the MoA and stability data; not a mandatory release test, but requires attention when abnormal degradation trends appear.")

_row(55,
     guidelineTerm="Deamidation (P3, structural summary example)",
     itemName="Asn deamidation and isomerization",
     applicability=APP_SUPP,
     purpose="Head-to-head comparison of asparagine (Asn) deamidation sites and relative abundance, assessing similarity of the deamidation profile",
     detectionIndicators="Relative deamidation abundance (%) at each Asn site; levels at key hotspots (e.g. CDR Asn); change in corresponding acidic charge-variant peak area (%); MS/MS spectra of deamidated peptides",
     similarityMethod="Quantitative QR / actual range plus charge-peak attribution",
     judgingPrinciple="Deamidation-site distribution and key hotspot abundance should be broadly similar to the reference; charge-variant changes caused by deamidation (increased acidic peaks) should follow the reference charge-distribution trend",
     numericLimit=LIMIT_QR,
     remark="Deamidation hydrolyzes the Asn side chain to aspartate (Asp) or isoaspartate (isoAsp), adding 1 Da and one negative charge — a major source of acidic charge variants. Its risk depends on the site of occurrence")

_row(56,
     guidelineTerm="N-terminal pyroglutamation (P3, structural summary example)",
     itemName="N-terminal pyroglutamate formation",
     applicability=APP_SUPP,
     purpose="Confirm consistency of N-terminal processing; use this modification level as part of cell-culture process robustness and product identity",
     detectionIndicators="N-terminal pyroglutamation sites (heavy/light chain) and relative abundance (%); corresponding mass shift (−17 Da) in intact mass spectra",
     similarityMethod=SIM_QR,
     judgingPrinciple="Pyroglutamation sites and abundance should be broadly similar to the reference; larger differences require antigen-binding (SPR/BLI) data to confirm no functional impact; if the modification occurs in a CDR, stricter comparison and functional assessment are needed.",
     numericLimit=LIMIT_QR,
     remark="N-terminal pyroglutamation is a common PTM in which N-terminal glutamine (Q) or glutamate (E) cyclizes to pyroglutamate (pyroGlu) under QC enzyme catalysis, with a mass change of −17 Da (Q→pE) or −18 Da (E→pE). It occurs mainly during cell culture, is a \"processing\" modification rather than degradation, usually does not affect function, but blocks the N-terminal amine so Edman degradation cannot sequence directly. Check whether it occurs within a CDR (N-terminal Q/E in a CDR may affect antigen binding).")

_row(57,
     guidelineTerm="C-terminal lysine loss/retention (P3, structural summary example)",
     itemName="Heavy chain C-terminal Lys processing",
     applicability=APP_SUPP,
     purpose="Head-to-head comparison of heavy chain C-terminal lysine (Lys, K) loss/retention, assessing whether C-terminal processing heterogeneity is consistent",
     detectionIndicators="Relative proportions (%) of the 0K, 1K and 2K forms; peak-area ratio of C-terminal K-containing vs K-lost peptides (peptide-map confirmation); change in corresponding basic charge-variant peak area (%)",
     similarityMethod=SIM_QR,
     judgingPrinciple="The distribution of C-terminal K loss/retention (0K/1K/2K ratios) should be broadly similar between candidate and reference",
     numericLimit=LIMIT_QR,
     remark="C-terminal lysine loss is a common IgG heavy-chain processing modification caused by host-cell carboxypeptidase-like activity. It does not directly affect Fc effector function but changes charge distribution (lower pI, basic peaks) and is a main source of basic charge variants; the loss ratio mainly reflects cell-culture process \"maturity\".")

_row(58,
     guidelineTerm="FT-IR",
     itemName="FT-IR orthogonal secondary-structure analysis",
     applicability=APP_SUPP,
     purpose="Head-to-head spectral overlay of secondary structure: analyze amide I band shape, position and relative intensity to assess similarity of backbone hydrogen bonding and secondary-structure composition, as orthogonal evidence to far-UV CD.",
     detectionIndicators="Raw amide I band spectral overlay; peak positions and area ratios of second-derivative or deconvoluted spectra; estimated secondary-structure content (relative % of α-helix, β-sheet, etc.)",
     similarityMethod="Head-to-head spectral comparison",
     judgingPrinciple="The FT-IR amide I band spectra of candidate and reference should overlap closely; second-derivative peak shapes and positions should be broadly consistent",
     numericLimit="No universal numerical limit; higher-order structure spectral similarity is usually assessed by qualitative/semi-quantitative comparison, aided by correlation-coefficient approaches (e.g. software-calculated spectral overlap) as supportive reference",
     remark="Complementary to far-UV CD: CD is sensitive to α-helix, FT-IR is more sensitive to β-sheet; the amide I band (1600–1700 cm⁻¹, C=O stretching) is the core region for secondary-structure analysis, and its second-derivative spectrum resolves overlapping components.")

_row(59,
     guidelineTerm="High-resolution methods such as HDX-MS/NMR",
     itemName="Site-specific higher-order structure",
     applicability=APP_SUPP,
     purpose="When conventional spectroscopy cannot fully exclude higher-order structure differences, use HDX-MS or NMR for head-to-head comparison at site-specific or atomic resolution, confirming secondary/tertiary structure consistency and identifying potential conformational-difference regions.",
     detectionIndicators="Deuterium uptake (%D) per peptide at each time point and uptake curves (D-plots); deuterium-uptake difference maps (ΔD) between candidate and reference.",
     similarityMethod="Head-to-head spectral overlay plus statistical difference thresholds",
     judgingPrinciple="If HDX-MS or NMR profiles overlap closely with the reference (no significant difference regions), higher-order structure is judged highly consistent in solution conformation and dynamics; significant differences must be mapped onto the 3D structure (e.g. Fab or Fc region) and assessed for MoA impact together with antigen-binding and Fc effector-function data",
     numericLimit="No universal numerical limit; difference thresholds must be predefined based on method validation (e.g. HDX-MS repeatability) and reference batch-to-batch variability",
     remark="The experimental conditions of both methods must be head-to-head")

_row(60,
     detectionIndicators="Chemical shifts (δ) of methyl signals in 2D HSQC spectra; overlay of candidate and reference spectra with chemical-shift difference (Δδ) analysis.")

_row(61,
     guidelineTerm="Galactosylated glycoforms such as G1F (P3, structural summary example)",
     itemName="Common IgG N-glycoforms (galactosylated glycoform proportions)",
     applicability=APP_SUPP,
     purpose="Determine the proportions and distribution of galactosylated N-glycoforms such as G1F (one galactose) and G2F (two galactoses), assessing the consistency of Fc terminal galactosylation and indirectly controlling its impact on CDC activity and conformational stability.",
     detectionIndicators="Relative proportions (%) of G1F and G2F within total N-glycans and their sum; G1F/G2F peak-area ratio; HILIC-FLD glycan profile overlay",
     similarityMethod=SIM_QR_SPECTRA,
     judgingPrinciple="Distribution of galactosylated glycoforms (G1F, G2F) and their total (G1F+G2F) should be broadly similar to the reference; differences beyond the QR range require assessment of impact on CDC activity and thermal stability (Tm, especially the CH2 domain), with risk justification supported by CDC potency data",
     numericLimit=LIMIT_QR,
     remark="G1F and G2F are the major galactosylated Fc N-glycoforms; terminal galactose affects CDC activity (more galactose usually means stronger CDC) and CH2-domain thermal stability (Tm)")

_row(62,
     guidelineTerm="High-mannose glycoforms",
     itemName="Proportions of high-mannose glycoforms (Man5/Man6, etc.)",
     applicability=APP_SUPP,
     purpose="Determine the relative proportions of high-mannose glycoforms such as Man5 and Man6 within total N-glycans",
     detectionIndicators="Relative proportion (%) of each high-mannose glycoform within total N-glycans; total high-mannose content (%); high-mannose peak areas and overlay in the HILIC-FLD glycan profile",
     similarityMethod=SIM_QR_SPECTRA,
     judgingPrinciple="Distribution and total amount of high-mannose glycoforms (Man5/Man6, etc.) should be broadly similar between candidate and reference",
     numericLimit=LIMIT_QR,
     remark="Elevated high-mannose glycoforms accelerate in-vivo clearance and shorten serum half-life (PK); Man5 is currently the most-watched high-mannose glycoform")

_row(63,
     guidelineTerm="Fucosylated / afucosylated glycoforms",
     itemName="Core fucosylation level",
     applicability=APP_SUPP,
     purpose="Determine similarity in the core fucosylation level of Fc N-glycans, assessing the impact of fucosylation on FcγRIIIa binding affinity and ADCC activity",
     detectionIndicators="Total proportion (%) of fucosylated glycoforms; total proportion (%) of afucosylated glycoforms; fucosylation index (e.g. fucosylated / afucosylated total areas); HILIC-FLD glycan profile overlay and distribution of fucosylation-related peak clusters",
     similarityMethod=SIM_QR_SPECTRA,
     judgingPrinciple="The overall core fucosylation level (relative proportion of fucosylated vs afucosylated glycoforms) should be broadly similar between candidate and reference",
     numericLimit=LIMIT_QR,
     remark="Core fucose attaches to the innermost GlcNAc of the N-glycan and, via steric hindrance, modulates Fc binding to FcγRIIIa (CD16a) — a key regulator of ADCC activity")

# ---------------------------------------------------------------------------
# Detection method translations, keyed by (row, "p"|"o", segment_index)
# ---------------------------------------------------------------------------

METHOD_EN: dict[tuple[int, str, int], str] = {}


def _methods(row_number: int, kind: str, *names: str) -> None:
    for index, english_name in enumerate(names):
        METHOD_EN[(row_number, kind, index)] = english_name


_methods(2, "p", "LC-ESI-MS (high-resolution QTOF/Orbitrap, etc.)")
_methods(2, "o", METHOD_PEPTIDE_MAP_MSMS, METHOD_CROSS_CONFIRM)
_methods(3, "p", "LC-ESI-MS after enzymatic deglycosylation")
_methods(3, "o", METHOD_PEPTIDE_MAP_MSMS, METHOD_CROSS_CONFIRM)
_methods(4, "p", "Reduced/subunit LC-MS")
_methods(4, "o", METHOD_PEPTIDE_MAP_MSMS, METHOD_CROSS_CONFIRM)
_methods(5, "p", "Heavy-chain LC-MS after reduction")
_methods(5, "o", METHOD_PEPTIDE_MAP_MSMS, METHOD_CROSS_CONFIRM)
_methods(6, "p", "LC-MS after deglycosylation and reduction")
_methods(6, "o", METHOD_PEPTIDE_MAP_MSMS, METHOD_CROSS_CONFIRM)
_methods(7, "p", "Enzymatic peptide mapping LC-MS (MS1)")
_methods(7, "o", "LC-MS/MS", "Additional proteases")
_methods(8, "p", METHOD_PEPTIDE_MAP_MSMS)
_methods(8, "o", "Alternative enzymatic digestion strategies", "Terminal analysis")
_methods(9, "p", METHOD_PEPTIDE_MAP_MSMS, "Intact/subunit mass spectrometry", "Dedicated methods where necessary")
_methods(9, "o", "Charge/hydrophobicity separation with identification after enrichment")
_methods(11, "p", "Targeted peptide mapping LC-MS/MS")
_methods(11, "o", "Multi-enzyme digestion strategies", "High-resolution MS")
_methods(12, "p", METHOD_PEPTIDE_MAP_MSMS, "Edman degradation where necessary")
_methods(12, "o", "Intact/subunit mass spectrometry")
_methods(13, "p", "Ellman's reagent assay or fluorescent thiol assay")
_methods(13, "o", "Non-reduced peptide mapping LC-MS/MS", "Reduced/non-reduced CE-SDS")
_methods(14, "p", "Non-reduced peptide mapping LC-MS/MS")
_methods(14, "o", "Free thiols", "Reduced/non-reduced CE-SDS")
_methods(15, "p", "Far-UV CD")
_methods(15, "o", "Orthogonal methods based on different principles (FT-IR, etc.)",
         "High-resolution structural techniques where necessary (X-ray, NMR, etc.)")
_methods(16, "p", "Near-UV CD")
_methods(16, "o", "Orthogonal methods based on different principles (intrinsic fluorescence spectroscopy)",
         "High-resolution structural techniques where necessary (X-ray, NMR, etc.)")
_methods(17, "p", "Intrinsic fluorescence spectroscopy")
_methods(17, "o", METHOD_ORTHO_PRINCIPLE, METHOD_HIGHRES_IF_NEEDED)
_methods(18, "p", "DSC (differential scanning calorimetry)", "Optionally supported by DSF (differential scanning fluorimetry)")
_methods(18, "o", METHOD_ORTHO_PRINCIPLE, METHOD_HIGHRES_IF_NEEDED)
_methods(19, "p", "See supplementary entries at the end of the table")
_methods(20, "p", "Glycopeptide LC-MS/MS, or peptide mapping LC-MS/MS before/after PNGase F treatment, to confirm specific glycosylation sites and occupancy")
_methods(20, "o", "Intact/subunit molecular mass LC-MS (macroscopic detection of mass shift before/after deglycosylation, verifying overall glycoform distribution)",
         "Intact mass comparison before/after PNGase F treatment")
_methods(21, "p", "Released N-glycan HILIC-FLD (glycans released, separated by hydrophilic-interaction chromatography, quantified by fluorescence detection of glycoform peak areas)")
_methods(21, "o", "HILIC-MS (MS confirmation of the glycoform identity of each chromatographic peak)",
         "Glycoform LC-MS/MS (supplementary confirmation, especially for co-eluting peaks)")
_methods(22, "p", METHOD_RELEASED_GLYCAN_HILIC)
_methods(22, "o", METHOD_HILIC_MS, "Glycoform LC-MS/MS")
_methods(23, "p", METHOD_RELEASED_GLYCAN_HILIC, "Glycoform MS confirmation")
_methods(23, "o", METHOD_HILIC_MS, METHOD_GLYCOPEPTIDE_MSMS)
_methods(24, "p", "Released N-glycan derivatization followed by HILIC-FLD/LC-MS")
_methods(24, "o", METHOD_HILIC_MS, "Glycopeptide LC-MS/MS, etc.")
_methods(25, "p", "Released N-glycan derivatization followed by HILIC-FLD/LC-MS")
_methods(25, "o", METHOD_HILIC_MS, "Glycopeptide LC-MS/MS, etc.")
_methods(26, "p", "UV spectrophotometry combined with a benchmark protein-concentration method")
_methods(26, "o", "Amino acid analysis", "Theoretical calculation from the sequence")
_methods(27, "p", "icIEF/CIEF", "IEF")
_methods(27, "o", "Ion-exchange chromatography")
_methods(28, "p", METHOD_SEC_UV)
_methods(28, "o", METHOD_SEC_MALS)
_methods(29, "p", METHOD_SEC_UV)
_methods(29, "o", METHOD_SEC_MALS)
_methods(30, "p", METHOD_SEC_UV)
_methods(30, "o", METHOD_SEC_MALS)
_methods(31, "p", METHOD_REDUCED_CESDS)
_methods(31, "o", METHOD_NONREDUCED_CESDS, "SEC", "Intact molecular mass LC-MS")
_methods(32, "p", METHOD_REDUCED_CESDS)
_methods(32, "o", "SDS-PAGE", METHOD_NONREDUCED_CESDS, "SEC")
_methods(33, "p", METHOD_NONREDUCED_CESDS)
_methods(33, "o", "SEC", METHOD_REDUCED_CESDS, "SDS-PAGE")
_methods(34, "p", METHOD_NONREDUCED_CESDS)
_methods(34, "o", "SEC", METHOD_REDUCED_CESDS, "SDS-PAGE")
_methods(35, "p", METHOD_CEX_ICIEF)
_methods(35, "o", METHOD_ICIEF_CEX_ORTHO, METHOD_PEAK_LCMS_ID)
_methods(36, "p", METHOD_CEX_ICIEF)
_methods(36, "o", METHOD_ICIEF_CEX_ORTHO, METHOD_PEAK_LCMS_ID)
_methods(37, "p", METHOD_CEX_ICIEF)
_methods(37, "o", METHOD_ICIEF_CEX_ORTHO, METHOD_PEAK_LCMS_ID)
_methods(38, "p", "SPR (surface plasmon resonance) / BLI (biolayer interferometry)")
_methods(38, "o", "ELISA (for relative binding-activity quantification) or cell-based binding assays (e.g. flow cytometry)")
_methods(39, "p", "MoA-related cell-based potency assay / enzymatic functional assay")
_methods(39, "o", "Cell-based effect assays of different principles (e.g. reporter gene, cell-proliferation inhibition, flow cytometry)",
         "Or enzymatic activity assays (if the primary method is cell-based, the enzymatic assay can serve as orthogonal)")
_methods(40, "p", METHOD_SPR)
_methods(40, "o", "ELISA", "BLI", "Cell-based/functional assays (e.g. ADCP) as biological-activity supplements.")
_methods(41, "p", METHOD_SPR)
_methods(41, "o", "ELISA", "BLI", "Cell-based/functional assays (e.g. platelet-activation assay) as biological-activity supplements.")
_methods(42, "p", METHOD_SPR)
_methods(42, "o", "ELISA", "BLI", "Cell-level binding assays as supplements.")
_methods(43, "p", METHOD_SPR)
_methods(43, "o", "ELISA", "BLI", "Cell-level binding assays as supplements.")
_methods(44, "p", METHOD_SPR)
_methods(44, "o", "BLI", "FcRn affinity chromatography", "TR-FRET (time-resolved fluorescence energy transfer)",
         "Cell-based FcRn recycling reporter-gene assay as a functional orthogonal supplement.")
_methods(45, "p", METHOD_SPR)
_methods(45, "o", "ELISA", "C1q deposition assay", "Complement activity assay (e.g. CDC reporter-gene assay) as a functional orthogonal supplement")
_methods(46, "p", "Reporter-gene-based ADCC assay, or classical ADCC functional assay with target cells and effector cells (e.g. NK cells or PBMC)")
_methods(46, "o", "FcγRIIIa binding assay and afucosylated glycoform analysis")
_methods(47, "p", "Target-cell-based CDC activity assay")
_methods(47, "o", "C1q binding", "Cross-validation with different complement sources", "Verification with different target cell lines")
_methods(49, "p", "SEC, CE-SDS, IEX, HIC, peptide-mapping LC-MS, etc., depending on the nature of the species")
_methods(49, "o", "Structural identification of new peaks (e.g. LC-MS/MS, peptide mapping)", "Impurity isolation where necessary")
_methods(50, "p", "ELISA (enzyme-linked immunosorbent assay)")
_methods(50, "o", "LC-MS/MS (for structural confirmation of suspected high-residue samples or during method validation)")
_methods(51, "p", "Quantitative PCR (qPCR)")
_methods(51, "o", "DNA probe hybridization, fluorescent staining")
_methods(52, "p", "ELISA (enzyme-linked immunosorbent assay)")
_methods(52, "o", "LC-MS/MS (liquid chromatography–tandem mass spectrometry)")
_methods(53, "p", "Product/process-specific methods")
_methods(53, "o", "Methods of different principles, or support from process-clearance/risk assessment")
_methods(54, "p", METHOD_PEPTIDE_MAP_MSMS)
_methods(54, "o", "Non-reduced/reduced CE-SDS", "Intact molecular mass LC-MS",
         "Forced oxidative degradation combined with functional activity testing")
_methods(55, "p", METHOD_REDUCED_PEPTIDE_MAP)
_methods(55, "o", "icIEF/CEX-HPLC", "Intact molecular mass LC-MS")
_methods(56, "p", METHOD_REDUCED_PEPTIDE_MAP)
_methods(56, "o", "Intact/subunit LC-MS")
_methods(57, "p", "Intact/reduced subunit molecular mass LC-MS", "Charge-variant analysis (CEX-HPLC or icIEF)")
_methods(57, "o", METHOD_REDUCED_PEPTIDE_MAP)
_methods(58, "p", "FT-IR spectroscopy")
_methods(58, "o", "Far-UV CD")
_methods(59, "p", "HDX-MS (hydrogen-deuterium exchange mass spectrometry)")
_methods(59, "o", "Antigen-binding activity (SPR/BLI) and functional activity (ADCC/CDC, etc.) used to correlate detected conformational differences (if any) with functional changes")
_methods(60, "p", "Methyl NMR (methyl nuclear magnetic resonance)")
_methods(61, "p", METHOD_RELEASED_GLYCAN_HILIC_LCMS)
_methods(61, "o", METHOD_INTACT_SUBUNIT_LCMS, METHOD_GLYCOPEPTIDE_MSMS)
_methods(62, "p", METHOD_RELEASED_GLYCAN_HILIC_LCMS)
_methods(62, "o", METHOD_INTACT_SUBUNIT_LCMS)
_methods(63, "p", METHOD_RELEASED_GLYCAN_HILIC_LCMS)
_methods(63, "o", METHOD_INTACT_SUBUNIT_LCMS, "FcγRIIIa binding (SPR)", "ADCC reporter-gene activity assay")

# ---------------------------------------------------------------------------
# Regulatory sheet ("1.法规框架") translations, keyed by (row, field)
# ---------------------------------------------------------------------------

REGULATORY_EN: dict[tuple[int, str], str] = {
    (1, "title"): "Guideline for Preparing CMC Documentation for Initial Clinical Trial Applications of Biosimilars",

    (3, "subject"): "General information on the drug substance",
    (3, "requirement"): ("Provide the amino acid sequence, identify glycosylation sites or other major "
                         "post-translational modifications (if any) and the relative molecular mass, with a "
                         "schematic molecular structure; also provide the physical, chemical and other relevant "
                         "properties of the drug substance, including appearance, pI, extinction coefficient and "
                         "biological properties (mechanism of action)."),
    (3, "remark"): "General information ≠ complete characterization; this is an overview of structure and properties.",

    (4, "subject"): "Structure and physicochemical properties",
    (4, "requirement"): ("Provide detailed information on primary, secondary and higher-order structure, "
                         "physicochemical properties, post-translational modifications, biological activity, "
                         "purity and immunochemical properties (where applicable)."),
    (4, "remark"): "-",

    (5, "subject"): "Impurities",
    (5, "requirement"): ("Provide studies of product-related and process-related impurities, including origin, "
                         "analytical methods, and representative batch results or safety assessments."),
    (5, "remark"): ("Product-related impurities require comparison of structure/levels; process-related "
                    "impurities are determined by the candidate's process."),

    (6, "subject"): "Drug substance quality control",
    (6, "requirement"): ("Provide, in tabular form, the specification (test items, acceptance criteria and "
                         "analytical methods), analytical procedures, method validation/verification information, "
                         "batch analyses and the justification of the specification."),
    (6, "remark"): "Specification limits ≠ analytical method performance criteria ≠ similarity assessment criteria.",

    (7, "subject"): "Drug substance stability",
    (7, "requirement"): ("Provide long-term, accelerated, stress and shipping stability (if any), storage "
                         "conditions/shelf life, and analyze trends, degradation pathways and rates."),
    (7, "remark"): "The product's own stability study ≠ candidate-vs-reference stability similarity study.",

    (8, "subject"): "Drug product quality control",
    (8, "requirement"): ("Provide the candidate drug product specification (test items, acceptance criteria and "
                         "analytical methods) and compare it with the reference specification; explain any "
                         "differences further."),
    (8, "remark"): "-",

    (9, "subject"): "Drug product stability",
    (9, "requirement"): ("Provide long-term, accelerated, stress and shipping stability (if any) of the drug "
                         "product and supporting data for shelf life."),
    (9, "remark"): ("Drug product stability is also affected by formulation, packaging system and mode of use; "
                    "keep it separate from drug substance stability."),

    (10, "subject"): "Regional annexes",
    (10, "requirement"): "Provide analytical method validation/verification reports and representative stability chromatograms.",
    (10, "remark"): "Method validation reports are evidence annexes, not standalone quality attributes.",

    (11, "subject"): "Biosimilar similarity analysis report",
    (11, "requirement"): ("Includes study samples, evaluation methods, characterization similarity, batch-analysis "
                          "similarity, stability similarity and analysis of the impact of differences."),
    (11, "remark"): ("The similarity conclusion must be built on the totality of multi-level evidence, not on "
                     "whether a single item falls within range."),

    (15, "subject"): "Drug substance manufacturing",
    (16, "subject"): "Reference standards or materials",
    (17, "subject"): "Container closure system",
    (18, "subject"): "Description and composition of the drug product",
    (19, "subject"): "Pharmaceutical development",
    (20, "subject"): "Drug product manufacturing",
    (21, "subject"): "Control of excipients",
    (22, "subject"): "Reference standards or materials",
    (23, "subject"): "Container closure system",
}
