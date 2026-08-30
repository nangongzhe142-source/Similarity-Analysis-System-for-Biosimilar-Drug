"""Declarative engine-to-business-module registry.

Adding a future adapter starts with one registry entry.  GPL/R tools are always
declared as isolated subprocesses so their source is never linked into the web
application process.
"""

from __future__ import annotations

from typing import Any


ADAPTERS: list[dict[str, Any]] = [
    {"moduleCodes": ["COV-02"], "tools": ["OpenMS", "Kojak", "xiSEARCH", "pyteomics"], "adapter": "disulfide-crosslink-map", "execution": "isolated-cli-subprocess", "status": "implemented", "qualityBoundary": "Native search completion is not bond confirmation; parsed evidence, configured expected bonds and orthogonal review are required."},
    {"moduleCodes": ["COV-01"], "tools": ["BioCompare Ellman formula", "Sage", "pyteomics"], "adapter": "free-thiol", "execution": "server-formula-and-optional-cli", "status": "implemented", "qualityBoundary": "Ellman quantitation is deterministic; IAM/NEM site identification remains an optional MS evidence route."},
    {"moduleCodes": ["PTM-01", "PTM-02", "PTM-03", "PTM-04"], "tools": ["MetaMorpheus", "FlashLFQ", "pyteomics", "UniDec"], "adapter": "metamorpheus-ptm-map", "execution": "isolated-cli-subprocess", "status": "implemented", "optionalSlots": ["UniDec subunit/intact-mass orthogonal evidence", "Sage open search"]},
    {"moduleCodes": ["SEQ-01"], "tools": ["OpenMS", "pyteomics"], "adapter": "openms-pyteomics-xic", "execution": "server-python-and-cli", "status": "implemented"},
    {"moduleCodes": ["SEQ-02"], "tools": ["Sage", "OpenMS", "pyteomics"], "adapter": "sage-sequence-coverage", "execution": "server-python-and-cli", "status": "implemented", "orthogonalSlot": "MetaMorpheus"},
    {"moduleCodes": ["SEQ-03"], "tools": ["Sage", "pyteomics"], "adapter": "sage-cdr-evidence", "execution": "server-python-and-cli", "status": "implemented"},
    {"moduleCodes": ["SEQ-04"], "tools": ["Sage", "pyteomics"], "adapter": "sage-terminal-evidence", "execution": "server-python-and-cli", "status": "implemented", "optionalSlots": ["TopPIC", "UniDec"]},
    {"moduleCodes": ["GLY-01"], "tools": ["GlycReSoft"], "adapter": "glycresoft-glycopeptide", "execution": "isolated-cli", "status": "engine-ready-business-mapping-planned"},
    {"moduleCodes": ["GLY-02", "GLY-03", "GLY-04", "GLY-05", "GLY-06"], "tools": ["chromConverter", "hplc-py", "glypy"], "adapter": "glycan-chromatography", "execution": "isolated-subprocess-worker", "status": "implemented", "optionalConfirmation": "GlycReSoft upstream result"},
    {"moduleCodes": ["GLY-07", "GLY-08", "GLY-09"], "tools": ["chromConverter", "hplc-py", "glypy"], "adapter": "glycan-chromatography", "execution": "isolated-subprocess-worker", "status": "registered"},
    {"moduleCodes": ["PUR-01", "PUR-02", "PUR-03", "PUR-04", "PUR-05", "PUR-06", "PUR-07"], "tools": ["chromConverter", "HappyTools", "hplc-py"], "adapter": "purity-chromatography", "execution": "Rscript-and-Python-subprocess-worker", "status": "implemented", "qualityBoundary": "CEVal is manual-review-only; new peaks above LOQ are routed to MS identification"},
    {"moduleCodes": ["CHG-01", "CHG-02", "CHG-03"], "tools": ["chromConverter", "hplc-py", "HappyTools"], "adapter": "numerical-chromatography", "execution": "isolated-cli", "status": "registered"},
    {"moduleCodes": ["PHY-01", "PHY-02"], "tools": ["Biopython", "peptides"], "adapter": "sequence-physchem", "execution": "server-python", "status": "registered"},
    {"moduleCodes": ["BIO-01", "BIO-04", "BIO-05", "BIO-06", "BIO-07", "BIO-08", "BIO-09"], "tools": ["Anabel"], "adapter": "binding-kinetics", "execution": "isolated-rscript-subprocess", "status": "registered"},
    {"moduleCodes": ["BIO-02", "BIO-03", "BIO-10", "BIO-11"], "tools": ["drc"], "adapter": "four-parameter-potency", "execution": "isolated-rscript-subprocess", "status": "registered"},
    {"moduleCodes": ["IMP-02", "IMP-04"], "tools": ["ELISAtools"], "adapter": "elisa", "execution": "isolated-rscript-subprocess", "status": "registered"},
    {"moduleCodes": ["IMP-03"], "tools": ["qpcR"], "adapter": "qpcr", "execution": "isolated-rscript-subprocess", "status": "registered"},
    {"moduleCodes": ["HOS-01", "HOS-02"], "tools": ["cdspecR"], "adapter": "circular-dichroism", "execution": "isolated-rscript-subprocess", "status": "registered"},
    {"moduleCodes": ["HOS-03", "HOS-06"], "tools": ["SpectroChemPy"], "adapter": "spectroscopy", "execution": "isolated-python-cli", "status": "registered"},
    {"moduleCodes": ["HOS-07"], "tools": ["PyHDX"], "adapter": "hdx-ms", "execution": "isolated-python-cli", "status": "registered"},
    {"moduleCodes": ["HOS-05"], "tools": ["nmrglue"], "adapter": "methyl-nmr", "execution": "isolated-python-cli", "status": "registered"},
]


EXCLUDED_TOOLS = [
    {"tool": "pGlyco3", "reason": "许可约束，不纳入本平台自动部署或调用"},
    {"tool": "ChiraKit", "reason": "学术许可限制，不用于预期商用/监管场景"},
    {"tool": "MoltenProt", "reason": "学术许可限制，不用于预期商用/监管场景"},
]


def adapter_catalog() -> dict[str, Any]:
    return {"adapters": ADAPTERS, "excludedTools": EXCLUDED_TOOLS}
