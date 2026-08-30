"""Persistent asynchronous orchestration for the three engine batches."""

from __future__ import annotations

import hashlib
import importlib.metadata
import importlib.util
import json
import os
import queue
import re
import shutil
import subprocess
import sys
import threading
import traceback
import uuid
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path
from typing import Any

from backend.calculation_units import UNITS, unit_catalog
from backend.external_engines import engine_status


ROOT = Path(__file__).resolve().parents[1]


def _load_local_environment() -> None:
    path = ROOT / ".env.local"
    if not path.is_file():
        return
    for raw in path.read_text(encoding="utf-8-sig").splitlines():
        line = raw.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_local_environment()
TASK_ROOT = Path(os.getenv("CALCULATION_TASK_ROOT", str(ROOT / ".runtime" / "calculation-jobs"))).resolve()
PROJECT_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9_-]{0,63}")
TASK_RE = re.compile(r"[a-f0-9]{32}")
TERMINAL = {"completed", "quality-blocked", "failed", "timed-out", "interrupted"}


def summarize_error(raw: str) -> str:
    """Return a concise reviewer-facing summary while preserving ``raw`` elsewhere."""
    normalized = (raw or "").strip()
    patterns = (
        (r"precursor|isolation\s+(?:m/?z\s+)?window|母离子|隔离窗口", "质谱数据文件缺少母离子隔离窗口信息，无法搜索；请更换为仪器导出的标准 mzML"),
        (r"表头既不符合|峰面积表缺少|time-signal.*peak-area", "输入表头无法识别；请提供时间-信号曲线，或包含峰名、保留/迁移时间和峰面积百分比的峰面积表"),
        (r"metamorpheus\s+exited|sageadapter|(?:engine|引擎).*(?:exited|退出)|(?:exited|退出).*(?:engine|引擎)", "专业引擎执行失败；可展开查看原始日志，或稍后重试"),
        (r"timed?[ -]?out|timeout|超时|超过任务时限", "计算超时；可减少同时运行的专项数后重试"),
        (r"quality[ _-]?(?:gate|blocked)|质量闸门|未获得目标\s*ptm", "数据未通过质量闸门（FDR 过滤后证据不足）；建议补充更多批次或谱图数据"),
        (r"ai[_ -]?(?:service|api|model|config)|\.env\.local|ai_api_key|api[_ -]?key.*(?:missing|缺失)|服务配置缺失|未配置", "服务配置缺失；请检查 .env.local 并重启后端"),
        (r"\bfdr\b|\bq[ -]?(?:value|值)\b", "统计过滤后无足够鉴定结果；数据量可能不足"),
        (r"unrecognized|not recognized|unsupported (?:file|format)|无法识别|未知格式", "输入文件无法识别；请确认文件格式与命名（候选=C开头，参照=R开头）"),
    )
    for pattern, summary in patterns:
        if re.search(pattern, normalized, flags=re.IGNORECASE):
            return summary
    return "专项计算失败，可展开查看原始日志"


def _package_version(name: str) -> str | None:
    try:
        return importlib.metadata.version(name)
    except importlib.metadata.PackageNotFoundError:
        return None


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def atomic_json(path: Path, value: dict[str, Any]) -> None:
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding="utf-8")
    temporary.replace(path)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


@lru_cache(maxsize=1)
def engine_readiness() -> dict[str, Any]:
    openms = engine_status("openms-sage")
    rscript = os.getenv("RSCRIPT_BIN") or shutil.which("Rscript")
    hplc = importlib.util.find_spec("hplc") is not None
    glypy = importlib.util.find_spec("glypy") is not None
    happytools_root = Path(os.getenv("HAPPYTOOLS_ROOT", "")) if os.getenv("HAPPYTOOLS_ROOT") else None
    happytools_detected = bool(happytools_root and (happytools_root / "HappyTools" / "bin" / "chromatogram.py").is_file())
    glycresoft = os.getenv("GLYCRESOFT_BIN") or shutil.which("glycresoft")
    dotnet = os.getenv("DOTNET_BIN") or shutil.which("dotnet")
    kojak = os.getenv("KOJAK_BIN")
    java = os.getenv("JAVA_BIN") or shutil.which("java")
    xisearch = os.getenv("XISEARCH_JAR")
    metamorpheus = os.getenv("METAMORPHEUS_CMD")
    metamorpheus_version = None
    if dotnet and metamorpheus and Path(metamorpheus).is_file():
        try:
            probe = subprocess.run([dotnet, metamorpheus, "--version"], capture_output=True, text=True, timeout=15, check=False)
            output = (probe.stdout or "") + "\n" + (probe.stderr or "")
            version_match = re.search(r"^CMD\s+([^\s]+)", output, flags=re.MULTILINE)
            if version_match:
                release = os.getenv("METAMORPHEUS_RELEASE_VERSION", "1.1.7")
                metamorpheus_version = f"MetaMorpheus {release} / CMD {version_match.group(1)}"
        except (OSError, subprocess.SubprocessError):
            pass
    chromconverter_version = None
    if rscript:
        try:
            probe = subprocess.run(
                [rscript, "-e", "suppressPackageStartupMessages(library(chromConverter));cat(as.character(packageVersion('chromConverter')))"],
                capture_output=True, text=True, timeout=10, check=False, env=dict(os.environ),
            )
            if probe.returncode == 0:
                chromconverter_version = (probe.stdout or "").strip() or None
        except (OSError, subprocess.SubprocessError):
            pass
    glycresoft_version = None
    if glycresoft:
        try:
            glycresoft_environment = dict(os.environ)
            if os.getenv("GLYCRESOFT_APPDATA"):
                Path(os.environ["GLYCRESOFT_APPDATA"]).mkdir(parents=True, exist_ok=True)
                glycresoft_environment["APPDATA"] = os.environ["GLYCRESOFT_APPDATA"]
            environment_python = Path(glycresoft).with_name("python.exe")
            command = [str(environment_python), "-c", "import importlib.metadata as m; print(m.version('glycresoft'))"] if environment_python.is_file() else [glycresoft, "--version"]
            probe = subprocess.run(command, capture_output=True, text=True, timeout=10, check=False, env=glycresoft_environment)
            if probe.returncode == 0:
                glycresoft_version = (probe.stdout or probe.stderr or "").strip().splitlines()[-1]
        except (OSError, subprocess.SubprocessError):
            pass
    try:
        hplc_version = importlib.metadata.version("hplc-py") if hplc else None
    except importlib.metadata.PackageNotFoundError:
        hplc_version = None
    return {
        "covalentBonds": {
            "pipeline": "OpenMS → Kojak + xiSEARCH → BioCompare evidence mapping",
            "technicalReady": all(value and Path(value).is_file() for value in (kojak, java, xisearch)),
            "kojakPath": kojak, "javaPath": java, "xiSearchJar": xisearch,
            "sageTechnicalReady": openms["technicalConnectivityValidated"],
            "ellmanFormulaReady": True,
            "note": "外部程序仅在服务端子进程运行；原生搜索成功不自动等同于二硫键确认。",
        },
        "batch1": {"pipeline": "OpenMS/Sage", "technicalReady": openms["technicalConnectivityValidated"], "details": openms},
        "ptmPeptideMap": {
            "pipeline": "MetaMorpheus → FlashLFQ → Pyteomics",
            "technicalReady": bool(metamorpheus_version), "dotnetPath": dotnet,
            "metamorpheusPath": metamorpheus, "metamorpheusVersion": metamorpheus_version,
            "unidecVersion": _package_version("unidec"), "pyteomicsVersion": _package_version("pyteomics"),
            "note": "UniDec仅在提供完整/亚基质量谱时作为正交去卷积证据；标准肽图不能替代该输入。",
        },
        "batch2": {
            "pipeline": "chromConverter → HappyTools → hplc-py",
            "technicalReadyForCanonicalCsv": hplc,
            "technicalReadyForPurityCsv": hplc and happytools_detected,
            "technicalReadyForVendorRaw": hplc and happytools_detected and bool(rscript) and bool(chromconverter_version),
            "hplcPyDetected": hplc, "hplcPyVersion": hplc_version,
            "happyToolsDetected": happytools_detected, "happyToolsPath": str(happytools_root) if happytools_root else None,
            "rscriptDetected": bool(rscript), "rscriptPath": rscript,
            "chromConverterDetected": bool(chromconverter_version), "chromConverterVersion": chromconverter_version,
            "note": "CSV可绕过格式转换，但厂商原始文件必须配置Rscript及chromConverter。",
        },
        "batch3": {
            "pipeline": "GlycReSoft → glypy",
            "technicalReady": bool(glycresoft_version) and glypy,
            "glycresoftDetected": bool(glycresoft), "glycresoftPath": glycresoft,
            "glycresoftVersion": glycresoft_version, "glypyDetected": glypy,
        },
    }


class CalculationTaskManager:
    def __init__(self) -> None:
        self._queue: queue.Queue[Path | None] = queue.Queue()
        self._started = False

    def start(self) -> None:
        if self._started:
            return
        TASK_ROOT.mkdir(parents=True, exist_ok=True)
        for state_path in TASK_ROOT.glob("*/*/*/task.json"):
            state = json.loads(state_path.read_text(encoding="utf-8"))
            if state.get("status") not in TERMINAL:
                state.update({"status": "interrupted", "stage": "interrupted", "progress": 100, "message": "后端重启，任务执行完整性无法确认", "updatedAt": now()})
                atomic_json(state_path, state)
        workers = min(max(int(os.getenv("CALCULATION_WORKERS", "2")), 1), 4)
        for index in range(workers):
            threading.Thread(target=self._worker, name=f"calculation-worker-{index + 1}", daemon=True).start()
        self._started = True

    def stop(self) -> None:
        if self._started:
            self._queue.put(None)
            self._started = False

    def prepare(self, project_id: str, module_code: str, parameters: dict[str, Any]) -> tuple[dict[str, Any], Path]:
        if not PROJECT_RE.fullmatch(project_id):
            raise ValueError("projectId仅允许1-64位字母、数字、下划线和连字符")
        if module_code not in UNITS:
            raise ValueError("未知计算单元")
        task_id = uuid.uuid4().hex
        folder = TASK_ROOT / project_id / module_code / task_id
        for name in ("inputs", "work", "outputs", "logs"):
            (folder / name).mkdir(parents=True, exist_ok=False)
        state = {
            "id": task_id, "projectId": project_id, "moduleCode": module_code,
            "batch": UNITS[module_code].batch, "pipeline": UNITS[module_code].pipeline,
            "status": "staging", "stage": "upload", "progress": 5,
            "message": "正在保存输入", "parameters": parameters, "files": [],
            "createdAt": now(), "updatedAt": now(), "artifacts": [],
        }
        atomic_json(folder / "task.json", state)
        return state, folder

    def enqueue(self, folder: Path, files: list[dict[str, Any]]) -> dict[str, Any]:
        state = self._read(folder)
        unit = UNITS[state["moduleCode"]]
        roles = {item.get("role") for item in files}
        missing = set(unit.required_roles) - roles
        if missing:
            raise ValueError(f"缺少输入角色：{', '.join(sorted(missing))}")
        for item in files:
            suffix = ".mzml.gz" if item["storedName"].lower().endswith(".mzml.gz") else Path(item["storedName"]).suffix.lower()
            if suffix not in unit.accepted_suffixes:
                raise ValueError(f"{item['storedName']}不是{state['moduleCode']}允许的输入格式")
        state.update({"files": files, "status": "queued", "stage": "queued", "progress": 10, "message": "已进入计算队列", "updatedAt": now()})
        atomic_json(folder / "manifest.json", state)
        atomic_json(folder / "task.json", state)
        self._queue.put(folder)
        return state

    def locate(self, project_id: str, task_id: str) -> Path:
        if not PROJECT_RE.fullmatch(project_id) or not TASK_RE.fullmatch(task_id):
            raise FileNotFoundError(task_id)
        matches = list((TASK_ROOT / project_id).glob(f"*/{task_id}/task.json"))
        if len(matches) != 1:
            raise FileNotFoundError(task_id)
        return matches[0].parent

    def locate_any(self, task_id: str) -> Path:
        """Resolve a globally unique task id for the concise /api/jobs contract."""
        if not TASK_RE.fullmatch(task_id):
            raise FileNotFoundError(task_id)
        matches = list(TASK_ROOT.glob(f"*/*/{task_id}/task.json"))
        if len(matches) != 1:
            raise FileNotFoundError(task_id)
        return matches[0].parent

    def list(self, project_id: str, module_code: str | None = None, limit: int = 100) -> list[dict[str, Any]]:
        if not PROJECT_RE.fullmatch(project_id):
            raise ValueError("projectId仅允许1-64位字母、数字、下划线和连字符")
        if module_code is not None and module_code not in UNITS:
            raise ValueError("未知计算单元")
        pattern = f"{module_code or '*'}/*/task.json"
        states = [json.loads(path.read_text(encoding="utf-8")) for path in (TASK_ROOT / project_id).glob(pattern)]
        states.sort(key=lambda item: item.get("createdAt", ""), reverse=True)
        return states[: min(max(limit, 1), 500)]

    def get(self, project_id: str, task_id: str) -> dict[str, Any]:
        return self._read(self.locate(project_id, task_id))

    def get_any(self, task_id: str) -> dict[str, Any]:
        return self._read(self.locate_any(task_id))

    def result(self, project_id: str, task_id: str) -> dict[str, Any]:
        path = self.locate(project_id, task_id) / "outputs" / "result.json"
        if not path.is_file():
            raise FileNotFoundError(task_id)
        return json.loads(path.read_text(encoding="utf-8"))

    def result_any(self, task_id: str) -> dict[str, Any]:
        path = self.locate_any(task_id) / "outputs" / "result.json"
        if not path.is_file():
            raise FileNotFoundError(task_id)
        return json.loads(path.read_text(encoding="utf-8"))

    def artifact(self, project_id: str, task_id: str, relative: str) -> Path:
        folder = self.locate(project_id, task_id)
        state = self._read(folder)
        item = next((entry for entry in state.get("artifacts", []) if entry.get("path") == relative), None)
        if not item or state.get("status") not in {"completed", "quality-blocked"}:
            raise FileNotFoundError(relative)
        target = (folder / relative).resolve()
        if not target.is_relative_to((folder / "outputs").resolve()) or not target.is_file():
            raise FileNotFoundError(relative)
        if target.stat().st_size != item["size"] or sha256(target) != item["sha256"]:
            raise FileNotFoundError(relative)
        return target

    def _read(self, folder: Path) -> dict[str, Any]:
        return json.loads((folder / "task.json").read_text(encoding="utf-8"))

    def _update(self, folder: Path, **changes: Any) -> dict[str, Any]:
        state = self._read(folder); state.update(changes); state["updatedAt"] = now(); atomic_json(folder / "task.json", state); return state

    def _worker(self) -> None:
        while True:
            folder = self._queue.get()
            try:
                if folder is None:
                    return
                self._execute(folder)
            finally:
                self._queue.task_done()

    def _execute(self, folder: Path) -> None:
        stdout_path, stderr_path = folder / "logs" / "stdout.log", folder / "logs" / "stderr.log"
        try:
            self._update(folder, status="running", stage="professional-engine", progress=25, message="正在调用专业计算链路")
            timeout = min(max(int(self._read(folder)["parameters"].get("taskTimeoutSeconds", 21600)), 60), 86400)
            with stdout_path.open("w", encoding="utf-8") as stdout, stderr_path.open("w", encoding="utf-8") as stderr:
                child_environment = dict(os.environ)
                child_environment.setdefault("MPLCONFIGDIR", str(folder / "work" / "matplotlib"))
                # The task wrapper emits Chinese validation errors on Windows. Force its
                # stdio to UTF-8 so the API can preserve a useful error summary instead
                # of misclassifying a mojibake traceback that happens to mention timeout.
                child_environment["PYTHONUTF8"] = "1"
                child_environment["PYTHONIOENCODING"] = "utf-8"
                completed = subprocess.run(
                    [sys.executable, str(ROOT / "worker" / "batch_pipeline_cli.py"), "--manifest", str(folder / "manifest.json")],
                    cwd=str(ROOT), env=child_environment, stdout=stdout, stderr=stderr, text=True, check=False, timeout=timeout,
                )
            if completed.returncode:
                diagnostic = stderr_path.read_text(encoding="utf-8", errors="replace")[-2000:]
                raise RuntimeError(f"计算链路退出码{completed.returncode}：{diagnostic}")
            result = json.loads((folder / "outputs" / "result.json").read_text(encoding="utf-8"))
            artifacts = []
            for path in sorted((folder / "outputs").rglob("*")):
                if path.is_file():
                    artifacts.append({"path": path.resolve().relative_to(folder.resolve()).as_posix(), "size": path.stat().st_size, "sha256": sha256(path)})
            status = result.get("status", "completed")
            self._update(folder, status=status, stage="complete" if status == "completed" else "quality-gate", progress=100, message="计算单元完成" if status == "completed" else "专业计算完成，但业务质量门槛未满足", artifacts=artifacts, completedAt=now())
        except subprocess.TimeoutExpired:
            raw_error = "task timeout"
            self._update(folder, status="timed-out", stage="timeout", progress=100, message="外部计算超过任务时限", error=raw_error, errorSummary=summarize_error(raw_error))
        except Exception as error:
            stderr_path.write_text((stderr_path.read_text(encoding="utf-8", errors="replace") if stderr_path.is_file() else "") + "\n" + traceback.format_exc(), encoding="utf-8")
            raw_error = str(error)[:2000]
            self._update(folder, status="failed", stage="failed", progress=100, message="计算链路执行失败", error=raw_error, errorSummary=summarize_error(raw_error))


calculation_task_manager = CalculationTaskManager()
