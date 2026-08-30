"""Discovery and governance metadata for third-party mass-spectrometry engines.

BioCompare owns orchestration and regulatory comparison logic only.  Each
professional engine is discovered from an explicit environment variable or
PATH; executables are never downloaded silently by the web service.
"""

from __future__ import annotations

import importlib.metadata
import os
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any


MASS_MODULES = (
    "intact-mass",
    "deglycosylated-intact-mass",
    "light-chain-mass",
    "heavy-chain-mass",
    "deglycosylated-heavy-chain-mass",
)
PTM_MODULES = ("post-translational-modifications",)


@dataclass(frozen=True)
class EngineDefinition:
    key: str
    name: str
    repository: str
    license: str
    execution_mode: str
    module_ids: tuple[str, ...]
    env_vars: tuple[str, ...]
    executables: tuple[str, ...]
    input_formats: tuple[str, ...]
    output_formats: tuple[str, ...]
    role: str
    distribution_note: str
    declared_asset_versions: tuple[tuple[str, str], ...] = ()
    regulatory_validation_requirements: tuple[str, ...] = ()


ENGINES = {
    "unidec": EngineDefinition(
        key="unidec", name="UniDec", repository="https://github.com/michaelmarty/UniDec",
        license="permissive BSD-like license + citation/attribution condition", execution_mode="isolated Python CLI adapter",
        module_ids=MASS_MODULES, env_vars=("UNIDEC_BIN",), executables=("unidec",),
        input_formats=("txt", "dat"), output_formats=("json",),
        role="原始 m/z 强度谱去卷积、质量峰提取",
        distribution_note="可单独安装；BioCompare 记录版本、参数、输入哈希和运行日志。",
        regulatory_validation_requirements=("冻结版本、参数模板和代表性原始谱回归", "确认输出解析与审计追踪完整"),
    ),
    "flashdeconv": EngineDefinition(
        key="flashdeconv", name="OpenMS FLASHDeconv", repository="https://github.com/OpenMS/OpenMS",
        license="BSD-3-Clause", execution_mode="native TOPP command line",
        module_ids=MASS_MODULES, env_vars=("FLASHDECONV_BIN", "OPENMS_BIN_DIR"), executables=("FLASHDeconv",),
        input_formats=("mzML",), output_formats=("tsv", "mzML", "msalign", "feature"),
        role="mzML 顶端/完整蛋白谱去卷积、质量特征提取",
        distribution_note="来自 OpenMS；适合作为 mzML 场景的可替换专业引擎。",
        regulatory_validation_requirements=("完成真实mzML专项回归", "冻结FLASHDeconv版本、参数和输出字段映射"),
    ),
    "openms-sage": EngineDefinition(
        key="openms-sage", name="OpenMS + Sage", repository="https://github.com/OpenMS/OpenMS",
        license="BSD-3-Clause + MIT", execution_mode="TOPP workflow command line",
        module_ids=PTM_MODULES, env_vars=("OPENMS_BIN_DIR", "SAGE_BIN"),
        executables=("FileConverter", "DecoyDatabase", "SageAdapter", "PeptideIndexer", "FalseDiscoveryRate", "ProteomicsLFQ", "sage"),
        input_formats=("mzML", "FASTA"), output_formats=("idXML", "mzTab", "consensusXML", "tsv"),
        role="肽段数据库检索、FDR 控制、肽段/蛋白定量；结果再进入 BioCompare PTM 区间逻辑",
        distribution_note="首选全开源 PTM/MAM 专业处理链；需由部署方安装 OpenMS 与 Sage。",
        declared_asset_versions=(("sage", "0.14.6"),),
        regulatory_validation_requirements=("完成端到端MAM代表性数据验证", "冻结FDR、定量和PTM字段映射"),
    ),
    "fragpipe": EngineDefinition(
        key="fragpipe", name="FragPipe / MSFragger", repository="https://github.com/Nesvilab/FragPipe",
        license="mixed; MSFragger has separate terms", execution_mode="headless workflow command line",
        module_ids=PTM_MODULES, env_vars=("FRAGPIPE_BIN",), executables=("fragpipe",),
        input_formats=("mzML", "raw", "FASTA", "workflow", "manifest"), output_formats=("tsv", "pepXML", "mzML"),
        role="可选的肽段鉴定、开放搜索和 PTM 定量工作流",
        distribution_note="只做用户自备程序的调用适配，不随 BioCompare 再分发；商业/非学术使用须自行确认许可。",
        regulatory_validation_requirements=("完成许可与部署边界正式审查", "完成代表性PTM工作流回归"),
    ),
    "covalent-bonds": EngineDefinition(
        key="covalent-bonds", name="Kojak + xiSEARCH + OpenMS", repository="https://github.com/mhoopmann/kojak",
        license="Kojak Apache-2.0 + xiSEARCH Apache-2.0 + OpenMS BSD-3-Clause", execution_mode="isolated native/Java CLI subprocesses",
        module_ids=("disulfide-map", "free-thiol"), env_vars=("KOJAK_BIN", "JAVA_BIN", "XISEARCH_JAR", "OPENMS_BIN_DIR", "SAGE_BIN"),
        executables=("Kojak", "java", "xiSEARCH.jar", "FileConverter", "sage"),
        input_formats=("mzML", "MGF", "FASTA"), output_formats=("txt", "csv", "pepXML", "json"),
        role="非还原二硫键连接肽检索与可选游离巯基位点证据；平台公式独立完成Ellman定量",
        distribution_note="Kojak、xiSEARCH与Sage均保持独立程序边界；浏览器不运行专业引擎。",
        declared_asset_versions=(("Kojak", "2.1.0"), ("xiSEARCH.jar", "1.8.13"), ("sage", "0.14.6")),
        regulatory_validation_requirements=("使用品种专属预期二硫键配置和真实非还原肽图完成FDR/谱图复核", "冻结IAM/NEM位点定位和相对丰度方法"),
    ),
}


def _configured_path(definition: EngineDefinition, executable: str) -> str | None:
    direct_env = {
        "unidec": "UNIDEC_BIN", "FLASHDeconv": "FLASHDECONV_BIN",
        "fragpipe": "FRAGPIPE_BIN", "sage": "SAGE_BIN", "Kojak": "KOJAK_BIN",
        "java": "JAVA_BIN", "xiSEARCH.jar": "XISEARCH_JAR",
    }.get(executable)
    if direct_env and os.getenv(direct_env):
        value = Path(os.environ[direct_env]).expanduser()
        return str(value) if value.is_file() else None
    if executable == "unidec":
        scripts_dir = Path(sys.executable).resolve().parent
        for filename in ("unidec.exe", "unidec"):
            candidate = scripts_dir / filename
            if candidate.is_file():
                return str(candidate)
    openms_dir = os.getenv("OPENMS_BIN_DIR")
    if openms_dir and executable not in {"unidec", "fragpipe", "sage"}:
        for suffix in (".exe", ""):
            candidate = Path(openms_dir).expanduser() / f"{executable}{suffix}"
            if candidate.is_file():
                return str(candidate)
    return shutil.which(executable) or shutil.which(f"{executable}.exe")


def _detection_source(executable: str, path: str | None) -> str | None:
    """Describe why an executable was considered detected without hiding uncertainty."""
    if not path:
        return None
    direct_env = {
        "unidec": "UNIDEC_BIN", "FLASHDeconv": "FLASHDECONV_BIN",
        "fragpipe": "FRAGPIPE_BIN", "sage": "SAGE_BIN", "Kojak": "KOJAK_BIN",
        "java": "JAVA_BIN", "xiSEARCH.jar": "XISEARCH_JAR",
    }.get(executable)
    if direct_env and os.getenv(direct_env):
        return f"environment:{direct_env}"
    if executable not in {"unidec", "fragpipe", "sage"} and os.getenv("OPENMS_BIN_DIR"):
        return "environment:OPENMS_BIN_DIR"
    if executable == "unidec" and Path(path).resolve().parent == Path(sys.executable).resolve().parent:
        return "python-environment"
    return "PATH"


def resolve_executable(engine_key: str, executable: str | None = None) -> str | None:
    definition = ENGINES[engine_key]
    name = executable or definition.executables[0]
    return _configured_path(definition, name)


def _version(command: list[str]) -> str | None:
    try:
        run = subprocess.run(command, capture_output=True, text=True, timeout=4, check=False)
        lines = (run.stdout or run.stderr or "").strip().splitlines()
        preferred = next((line.strip() for line in lines if line.strip().lower().startswith("version:")), None)
        return (preferred or (lines[0].strip() if lines else ""))[:180] or None
    except (OSError, subprocess.SubprocessError):
        return None


def _semantic_version(value: str | None) -> str | None:
    if not value:
        return None
    match = re.search(r"(?<!\d)(\d+\.\d+\.\d+)(?!\d)", value)
    return match.group(1) if match else None


def _online_configuration(definition: EngineDefinition) -> dict[str, Any]:
    env_path = Path(__file__).resolve().parents[1] / ".env.local"
    file_keys: set[str] = set()
    if env_path.is_file():
        for raw_line in env_path.read_text(encoding="utf-8-sig").splitlines():
            line = raw_line.strip()
            if line and not line.startswith("#") and "=" in line:
                file_keys.add(line.split("=", 1)[0].strip())
    configured = [name for name in definition.env_vars if bool(os.getenv(name))]
    return {
        "localEnvironmentFilePresent": env_path.is_file(),
        "localEnvironmentFileLoaded": bool(set(configured) & file_keys),
        "requiredVariables": list(definition.env_vars),
        "configuredVariables": configured,
        "missingVariables": [name for name in definition.env_vars if name not in configured],
        "onlineConfigurationLoaded": bool(configured),
    }


def engine_status(engine_key: str) -> dict[str, Any]:
    definition = ENGINES[engine_key]
    found = {name: _configured_path(definition, name) for name in definition.executables}
    if engine_key == "unidec":
        try:
            package_version = importlib.metadata.version("unidec")
        except importlib.metadata.PackageNotFoundError:
            package_version = None
        installed = bool(package_version)
        version = package_version
        command_path = found["unidec"] or (sys.executable if installed else None)
        technical_connectivity_validated = installed
    else:
        installed = all(found.values())
        first_path = next((path for path in found.values() if path), None)
        if engine_key == "openms-sage" and found.get("FileConverter") and found.get("sage"):
            openms_version = _version([found["FileConverter"], "--help"])
            sage_version = _version([found["sage"], "--version"])
            version = f"{openms_version}; {sage_version}"
            technical_connectivity_validated = installed and bool(openms_version and sage_version)
        else:
            version = _version([first_path, "--version"]) if first_path else None
            technical_connectivity_validated = installed and bool(version)
        command_path = first_path
    detected = installed and bool(command_path)
    regulatory_workflow_validated = False
    production_available = technical_connectivity_validated and regulatory_workflow_validated
    declared_versions = dict(definition.declared_asset_versions)
    components = []
    version_mismatches = []
    for name, path in found.items():
        reported_text = None
        if path:
            if name == "FileConverter":
                reported_text = _version([path, "--help"])
            elif name == "sage":
                reported_text = _version([path, "--version"])
        reported_version = _semantic_version(reported_text)
        asset_version = declared_versions.get(name)
        consistent = None if not asset_version or not reported_version else asset_version == reported_version
        components.append({
            "name": name, "path": path, "detected": bool(path),
            "detectionSource": _detection_source(name, path),
            "reportedVersion": reported_version, "reportedVersionText": reported_text,
            "declaredAssetVersion": asset_version, "versionConsistent": consistent,
        })
        if consistent is False:
            version_mismatches.append({
                "component": name, "declaredAssetVersion": asset_version,
                "reportedProgramVersion": reported_version,
                "message": f"{name}资产标记版本{asset_version}，但程序自报版本{reported_version}；须核对资产来源和部署记录。",
            })
    return {
        "contractVersion": "2.0", "key": definition.key, "name": definition.name,
        "installed": installed, "detected": detected,
        "technicalConnectivityValidated": technical_connectivity_validated,
        "regulatoryWorkflowValidated": regulatory_workflow_validated,
        "productionAvailable": production_available,
        "available": production_available,
        "availableDeprecated": "available为兼容字段，等同productionAvailable；不得用于表示仅探测到程序。",
        "version": version, "commandPath": command_path,
        "requiredExecutables": list(definition.executables),
        "resolvedExecutables": found,
        "missingExecutables": [name for name, path in found.items() if not path],
        "repository": definition.repository, "license": definition.license,
        "executionMode": definition.execution_mode, "moduleIds": list(definition.module_ids),
        "inputFormats": list(definition.input_formats), "outputFormats": list(definition.output_formats),
        "role": definition.role, "distributionNote": definition.distribution_note,
        "onlineConfiguration": _online_configuration(definition),
        "detectionEvidence": components,
        "versionMismatches": version_mismatches,
        "regulatoryValidationRequirements": list(definition.regulatory_validation_requirements),
        "regulatoryValidationGaps": list(definition.regulatory_validation_requirements) if not regulatory_workflow_validated else [],
        "validationNote": "技术连通验证不等于监管工作流验证；生产可用必须同时满足两者。",
    }


def all_engine_statuses() -> list[dict[str, Any]]:
    return [engine_status(key) for key in ENGINES]


def choose_mass_engine(requested: str, suffixes: set[str]) -> str:
    if requested not in {"auto", "unidec", "flashdeconv"}:
        raise ValueError("分子量任务仅支持 auto、unidec 或 flashdeconv")
    if requested == "auto":
        requested = "flashdeconv" if suffixes == {".mzml"} else "unidec"
    status = engine_status(requested)
    if not status["technicalConnectivityValidated"]:
        missing = "、".join(status["missingExecutables"]) or "Python包"
        raise RuntimeError(f"外部引擎 {status['name']} 未安装或不可用（缺少：{missing}）")
    return requested
