"""Asynchronous, project-isolated execution of local UniDec and FragPipe.

This service never calls a Web API.  It accepts only registered BioCompare
modules, resolves an administrator-configured local executable, and starts it
with ``shell=False`` (except Windows .bat/.cmd launchers, which require the
operating-system command processor).
"""

from __future__ import annotations

import json
import hashlib
import os
import queue
import re
import shutil
import subprocess
import threading
import time
import traceback
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from backend.external_engines import engine_status, resolve_executable
from backend.ptm_upstream_contract import FragPipePTMEvidence, evaluate_fragpipe_ptm_evidence


ROOT = Path(__file__).resolve().parents[1]
TASK_ROOT = Path(os.getenv("LOCAL_ENGINE_TASK_ROOT", str(ROOT / ".runtime" / "local-engine-tasks"))).resolve()
TERMINAL_STATES = {"completed", "quality-blocked", "awaiting_downstream", "failed", "timed_out", "cancelled", "interrupted"}
STATUS_CONTRACT_VERSION = "2.0"
STATUS_SEMANTICS = {
    "staging": "正在保存和校验输入，尚未进入队列。",
    "queued": "输入已冻结，等待工作线程。",
    "running": "外部程序进程正在执行。",
    "cancelling": "已接收取消请求，正在终止进程树。",
    "cancelled": "任务由用户取消，不能视为计算失败或质量阻断。",
    "completed": "外部计算和本模块要求的结果登记均完成。",
    "awaiting_downstream": "上游程序完成，但仍需下游质量和业务流程。",
    "quality-blocked": "程序执行完成，但质量门槛或必需产物未满足。",
    "failed": "程序、输入、系统或适配器发生执行错误。",
    "timed_out": "超过时间限制，进程树已终止或已记录终止失败证据。",
    "interrupted": "后端重启时发现非终态任务，执行完整性无法确认。",
}
PROJECT_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9_-]{0,63}")
TASK_RE = re.compile(r"[a-f0-9]{32}")
CMD_UNSAFE_RE = re.compile(r"[\r\n\x00\"%\^!&|<>()]")


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _atomic_json(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding="utf-8")
    temporary.replace(path)


def _safe_relative(path: Path, root: Path) -> str:
    return path.resolve().relative_to(root.resolve()).as_posix()


def _sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _safe_extra_arguments(value: Any) -> list[str]:
    """Reject user-controlled command fragments.

    FragPipe commonly uses a Windows .bat launcher, which ultimately passes
    through cmd.exe.  Even quoting is not a sufficient security boundary for
    every cmd metacharacter/expansion mode, so the public task contract accepts
    no free-form command arguments.  New options must be added as named,
    validated server-side fields.
    """
    if value is None or value == []:
        return []
    raise ValueError("禁止提交 additionalArgs；如需新增引擎参数，必须在后端建立具名字段和白名单校验")


def _kill_process_tree(process: subprocess.Popen[str], reason: str) -> dict[str, Any]:
    evidence = {
        "at": utc_now(), "pid": process.pid, "reason": reason, "method": None,
        "exitCode": None, "terminationConfirmed": False,
    }
    if process.poll() is not None:
        evidence.update({"method": "already-exited", "exitCode": process.returncode, "terminationConfirmed": True})
        return evidence
    if os.name == "nt":
        terminated = subprocess.run(
            ["taskkill", "/PID", str(process.pid), "/T", "/F"],
            capture_output=True,
            text=True,
            check=False,
        )
        evidence.update({
            "method": "taskkill-tree", "terminationCommandExitCode": terminated.returncode,
            "terminationMessage": (terminated.stdout or terminated.stderr or "").strip()[:1000],
        })
    else:
        process.kill()
        evidence["method"] = "process-kill"
    return evidence


def _windows_launcher(command: list[str]) -> list[str]:
    """Wrap a trusted .bat/.cmd path without enabling arbitrary shell input."""
    if os.name == "nt" and Path(command[0]).suffix.lower() in {".bat", ".cmd"}:
        unsafe = [value for value in command if CMD_UNSAFE_RE.search(str(value))]
        if unsafe:
            raise ValueError("Windows批处理路径或参数包含cmd元字符，已拒绝执行；请使用不含元字符的受控安装路径")
        # Every argument is quoted, delayed expansion is disabled, and no
        # public free-form arguments reach this boundary.
        command_line = " ".join(f'"{value}"' for value in command)
        return [os.environ.get("COMSPEC", "cmd.exe"), "/d", "/v:off", "/s", "/c", f'"{command_line}"']
    return command


class TaskCancelled(RuntimeError):
    pass


@dataclass(frozen=True)
class ModuleDefinition:
    key: str
    code: str
    name: str
    engine: str
    accepted_suffixes: tuple[str, ...]


MODULES: dict[str, ModuleDefinition] = {
    "intact-mass": ModuleDefinition("intact-mass", "IM-01", "完整分子量比对", "unidec", (".txt", ".dat", ".conf")),
    "deglycosylated-intact-mass": ModuleDefinition("deglycosylated-intact-mass", "DM-02", "脱糖完整分子量比对", "unidec", (".txt", ".dat", ".conf")),
    "light-chain-mass": ModuleDefinition("light-chain-mass", "LC-03", "轻链分子量比对", "unidec", (".txt", ".dat", ".conf")),
    "heavy-chain-mass": ModuleDefinition("heavy-chain-mass", "HC-04", "未脱糖重链分子量比对", "unidec", (".txt", ".dat", ".conf")),
    "deglycosylated-heavy-chain-mass": ModuleDefinition("deglycosylated-heavy-chain-mass", "DHC-05", "脱糖重链分子量比对", "unidec", (".txt", ".dat", ".conf")),
    "post-translational-modifications": ModuleDefinition(
        "post-translational-modifications", "PTM-06", "翻译后修饰位点定量比对", "fragpipe",
        (".mzml", ".raw", ".fasta", ".fa", ".workflow", ".manifest", ".txt", ".tsv"),
    ),
}


class LocalEngineTaskManager:
    """Persistent task state plus bounded background worker threads."""

    def __init__(self) -> None:
        self._queue: queue.Queue[str | None] = queue.Queue()
        self._threads: list[threading.Thread] = []
        self._state_lock = threading.RLock()
        self._processes: dict[str, subprocess.Popen[str]] = {}
        self._cancel_requested: set[str] = set()
        self._started = False

    def start(self) -> None:
        with self._state_lock:
            if self._started:
                return
            TASK_ROOT.mkdir(parents=True, exist_ok=True)
            self._mark_abandoned_tasks()
            worker_count = min(max(int(os.getenv("LOCAL_ENGINE_WORKERS", "2")), 1), 8)
            for index in range(worker_count):
                thread = threading.Thread(target=self._worker, name=f"local-engine-worker-{index + 1}", daemon=True)
                thread.start()
                self._threads.append(thread)
            self._started = True

    def stop(self) -> None:
        with self._state_lock:
            if not self._started:
                return
            for _ in self._threads:
                self._queue.put(None)
            self._started = False

    def prepare(self, project_id: str, module_key: str, parameters: dict[str, Any]) -> tuple[dict[str, Any], Path]:
        if not PROJECT_RE.fullmatch(project_id):
            raise ValueError("projectId 仅允许1-64位字母、数字、下划线和连字符")
        module = MODULES.get(module_key)
        if not module:
            raise ValueError("未知分析模块")
        _safe_extra_arguments(parameters.get("additionalArgs"))
        task_id = uuid.uuid4().hex
        folder = TASK_ROOT / project_id / module.key / task_id
        for name in ("inputs", "work", "outputs", "logs"):
            (folder / name).mkdir(parents=True, exist_ok=False)
        state = {
            "id": task_id, "projectId": project_id, "moduleKey": module.key,
            "moduleCode": module.code, "moduleName": module.name, "engineKey": module.engine,
            "statusContractVersion": STATUS_CONTRACT_VERSION,
            "status": "staging", "stage": "upload", "progress": 5,
            "parameters": parameters, "files": [], "createdAt": utc_now(), "updatedAt": utc_now(),
            "message": "独立任务目录已创建，正在保存输入文件", "events": [],
        }
        state["events"].append({"at": state["createdAt"], "status": "staging", "message": state["message"]})
        _atomic_json(folder / "task.json", state)
        return state, folder

    def enqueue(self, task_id: str, folder: Path, files: list[dict[str, Any]]) -> dict[str, Any]:
        state = self._read(folder)
        if state.get("id") != task_id or folder.name != task_id:
            raise ValueError("任务身份与目录不一致")
        if folder.parent.parent.name != state.get("projectId"):
            raise ValueError("任务项目身份与隔离目录不一致")
        validated_files = self._validate_input_manifest(folder, files)
        state.update({
            "files": validated_files, "status": "queued", "stage": "queued", "progress": 10,
            "message": "输入已保存，等待本地引擎工作线程", "updatedAt": utc_now(),
        })
        state["events"].append({"at": state["updatedAt"], "status": "queued", "message": state["message"]})
        _atomic_json(folder / "task.json", state)
        self._queue.put(str(folder))
        return state

    def _validate_input_manifest(self, folder: Path, files: list[dict[str, Any]]) -> list[dict[str, Any]]:
        if not files or len(files) > 100:
            raise ValueError("任务输入清单必须包含1至100个文件")
        input_root = (folder / "inputs").resolve()
        validated: list[dict[str, Any]] = []
        seen: set[str] = set()
        for item in files:
            stored_name = item.get("storedName")
            if not isinstance(stored_name, str) or not stored_name or Path(stored_name).name != stored_name or "/" in stored_name or "\\" in stored_name:
                raise ValueError("输入清单包含不安全的storedName")
            if stored_name in seen:
                raise ValueError("输入清单包含重复storedName")
            seen.add(stored_name)
            path = (input_root / stored_name).resolve()
            if not path.is_relative_to(input_root) or not path.is_file():
                raise ValueError(f"输入文件不存在或越界：{stored_name}")
            size = path.stat().st_size
            digest = _sha256_file(path)
            if item.get("size") != size or item.get("sha256") != digest:
                raise ValueError(f"输入文件大小或SHA-256与清单不一致：{stored_name}")
            validated.append({**item, "storedName": stored_name, "size": size, "sha256": digest})
        return validated

    def fail_staging(self, folder: Path, error: Exception) -> None:
        if not (folder / "task.json").is_file():
            return
        self._update(folder, status="failed", stage="upload", progress=100, message="输入文件保存失败", error=str(error)[:2000])

    def locate(self, task_id: str, project_id: str) -> Path:
        if not TASK_RE.fullmatch(task_id):
            raise FileNotFoundError(task_id)
        if not PROJECT_RE.fullmatch(project_id):
            raise FileNotFoundError(task_id)
        matches = list((TASK_ROOT / project_id).glob(f"*/{task_id}/task.json"))
        if len(matches) != 1:
            raise FileNotFoundError(task_id)
        folder = matches[0].parent
        state = self._read(folder)
        if (
            state.get("id") != task_id or state.get("projectId") != project_id
            or state.get("moduleKey") != folder.parent.name
        ):
            raise FileNotFoundError(task_id)
        return folder

    def get(self, task_id: str, project_id: str) -> dict[str, Any]:
        return self._read(self.locate(task_id, project_id))

    def read_log(self, task_id: str, project_id: str, stream: str, tail: int) -> str:
        if stream not in {"stdout", "stderr"}:
            raise ValueError("stream 仅支持 stdout 或 stderr")
        path = self.locate(task_id, project_id) / "logs" / f"{stream}.log"
        if not path.is_file():
            return ""
        lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
        return "\n".join(lines[-min(max(tail, 1), 2000):])

    def artifact(self, task_id: str, project_id: str, relative_path: str) -> Path:
        folder = self.locate(task_id, project_id)
        candidate = (folder / relative_path).resolve()
        if not candidate.is_relative_to(folder.resolve()) or not candidate.is_file():
            raise FileNotFoundError(relative_path)
        state = self._read(folder)
        registered = {item.get("path") for item in state.get("artifacts", []) if isinstance(item, dict)}
        resolved_relative = _safe_relative(candidate, folder)
        if state.get("status") not in {"completed", "quality-blocked", "awaiting_downstream"}:
            raise FileNotFoundError(relative_path)
        if resolved_relative not in registered:
            raise FileNotFoundError(relative_path)
        registered_item = next(
            item for item in state.get("artifacts", [])
            if isinstance(item, dict) and item.get("path") == resolved_relative
        )
        if registered_item.get("size") != candidate.stat().st_size or registered_item.get("sha256") != _sha256_file(candidate):
            raise FileNotFoundError(relative_path)
        return candidate

    def cancel(self, task_id: str, project_id: str) -> dict[str, Any]:
        """Idempotently cancel a queued or running task and retain evidence."""
        folder = self.locate(task_id, project_id)
        with self._state_lock:
            state = self._read(folder)
            if state.get("status") in TERMINAL_STATES:
                self._cancel_requested.discard(task_id)
                return state
            requested_at = utc_now()
            self._cancel_requested.add(task_id)
            process = self._processes.get(task_id)
            if not process:
                return self._update(
                    folder, status="cancelled", stage="cancelled", progress=100,
                    message="任务在外部进程启动前已取消", cancellationRequestedAt=requested_at,
                    cancelledAt=utc_now(), terminationEvidence={
                        "at": utc_now(), "reason": "user-cancel", "method": "cancel-before-process-start", "pid": None,
                    },
                )
            self._update(
                folder, status="cancelling", stage="cancelling", progress=state.get("progress", 30),
                message="已接收取消请求，正在终止外部进程树", cancellationRequestedAt=requested_at,
            )
            evidence = _kill_process_tree(process, "user-cancel")
            self._update(folder, terminationEvidence=evidence)
            return self._read(folder)

    def _worker(self) -> None:
        while True:
            value = self._queue.get()
            try:
                if value is None:
                    return
                self._execute(Path(value))
            finally:
                self._queue.task_done()

    def _execute(self, folder: Path) -> None:
        try:
            state = self._read(folder)
            if state.get("status") == "cancelled" or state["id"] in self._cancel_requested:
                return
            module = MODULES[state["moduleKey"]]
            timeout = min(max(int(state["parameters"].get("timeoutSeconds", os.getenv("LOCAL_ENGINE_TIMEOUT_SECONDS", "7200"))), 10), 86400)
            staged = self._stage_work_files(folder, state["files"], module)
            command = self._build_command(module, staged, folder, state["parameters"])
            audit_command = [str(value) for value in command]
            engine_snapshot = engine_status(module.engine)
            command_record = {
                "contractVersion": STATUS_CONTRACT_VERSION,
                "taskIdentity": {"taskId": state["id"], "projectId": state["projectId"], "moduleKey": module.key},
                "engine": module.engine, "command": audit_command, "cwd": str(folder / "work"),
                "engineVersion": engine_snapshot.get("version"),
                "resolvedExecutables": engine_snapshot.get("resolvedExecutables", {}),
                "timeoutSeconds": timeout, "createdAt": utc_now(),
                "inputs": [
                    {"storedName": item.get("storedName"), "size": item.get("size"), "sha256": item.get("sha256")}
                    for item in state["files"]
                ],
            }
            command_record["commandSha256"] = hashlib.sha256(
                json.dumps(audit_command, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
            ).hexdigest()
            _atomic_json(folder / "command.json", command_record)
            self._update(folder, status="running", stage="engine", progress=30, message=f"正在本地调用 {module.engine} 专业程序")
            return_code = self._run_process(folder, command, timeout)
            if return_code != 0:
                stderr = self.read_log(state["id"], state["projectId"], "stderr", 80)
                raise RuntimeError(f"{module.engine} 退出码 {return_code}：{stderr[-1800:] or '详见日志'}")
            artifacts = self._collect_artifacts(folder, {item["storedName"] for item in state["files"]})
            output_count = sum(1 for item in artifacts if item["path"].startswith("outputs/"))
            ptm_stage_contract: dict[str, Any] | None = None
            if module.engine == "fragpipe":
                ptm_stage_contract = evaluate_fragpipe_ptm_evidence(FragPipePTMEvidence(
                    upstream_execution_completed=True,
                    output_artifacts_detected=output_count > 0,
                )).to_dict()
                comparison_status = "awaiting_downstream" if output_count else "quality-blocked"
                comparison_message = (
                    "FragPipe上游程序执行完成，等待FDR、PTM定位、XIC定量和多批参照区间分析"
                    if output_count else
                    "FragPipe返回成功但未登记到输出文件，已进入质量阻断，不能开展PTM位点定量比对"
                )
                progress = 75 if output_count else 100
            else:
                comparison_status = "completed"
                comparison_message = "本地专业引擎计算完成"
                progress = 100
            result = {
                "taskId": state["id"], "projectId": state["projectId"], "moduleKey": module.key,
                "engineKey": module.engine, "status": comparison_status,
                "upstreamExecutionStatus": "completed", "resultRoot": str(folder / "outputs"),
                "artifacts": artifacts, "completedAt": utc_now(),
                "boundary": "第三方程序负责质谱核心计算；BioCompare负责本地调度、状态、日志和结果路径登记。",
            }
            if module.engine == "fragpipe":
                result.update({
                    "ptmComparisonCompleted": False,
                    "downstreamRequired": [
                        "目标-诱饵FDR控制", "PTM位点定位概率质量闸门", "修饰/未修饰肽段XIC定量",
                        "FragPipe结果字段适配", "多批参照药PTM区间构建与候选药客观标记",
                    ],
                    "downstreamBoundary": (
                        "FragPipe执行成功不等于PTM位点定量比对完成；只有下游质量闸门和区间引擎完成后，"
                        "才能形成客观偏离标记，且不得自动给出相似性结论。"
                    ),
                    "recommendedDownstream": {
                        "preferredValidatedPath": "现有OpenMS+Sage /ptm/openms-sage/jobs 路径保持不变",
                        "fragPipeAdapterStatus": "待实现FragPipe输出到统一PTM定量表的受控适配器",
                        "intervalEndpoint": "/ptm/analyze",
                    },
                    "ptmStageContract": ptm_stage_contract,
                })
            audit = {
                "contractVersion": STATUS_CONTRACT_VERSION,
                "taskIdentity": {"taskId": state["id"], "projectId": state["projectId"], "moduleKey": module.key},
                "engine": {"key": module.engine, "version": engine_snapshot.get("version")},
                "commandSha256": command_record["commandSha256"],
                "inputFiles": command_record["inputs"],
                "registeredArtifacts": [
                    {"path": item["path"], "size": item["size"], "sha256": item["sha256"]}
                    for item in artifacts
                ],
                "execution": {"returnCode": return_code, "completedAt": utc_now()},
            }
            _atomic_json(folder / "audit.json", audit)
            artifacts.append(self._artifact_entry(folder, folder / "audit.json", state["projectId"]))
            _atomic_json(folder / "result.json", result)
            self._update(
                folder, status=comparison_status,
                stage="downstream-quality-gate" if module.engine == "fragpipe" else "completed",
                progress=progress, message=comparison_message,
                resultPath=str(folder / "result.json"), artifacts=artifacts,
            )
        except TaskCancelled as error:
            termination = self._read(folder).get("terminationEvidence", {})
            confirmed = bool(termination.get("terminationConfirmed"))
            self._update(
                folder, status="cancelled" if confirmed else "interrupted",
                stage="cancelled" if confirmed else "termination-unconfirmed", progress=100,
                message=(
                    "本地专业引擎任务已取消，进程树已确认终止"
                    if confirmed else "已请求取消，但未能确认进程树退出，任务标记为中断"
                ),
                error=None, cancelledAt=utc_now() if confirmed else None, cancellationReason=str(error),
            )
        except TimeoutError as error:
            self._append_traceback(folder)
            self._update(folder, status="timed_out", stage="engine", progress=100, message="本地专业引擎执行超时并已终止", error=str(error))
        except Exception as error:
            self._append_traceback(folder)
            self._update(folder, status="failed", stage="failed", progress=100, message="本地专业引擎任务失败", error=str(error)[:2000])
        finally:
            try:
                task_id = self._read(folder).get("id")
                with self._state_lock:
                    self._processes.pop(str(task_id), None)
                    self._cancel_requested.discard(str(task_id))
            except (OSError, ValueError):
                pass

    def _stage_work_files(self, folder: Path, files: list[dict[str, Any]], module: ModuleDefinition) -> dict[str, Path]:
        staged: dict[str, Path] = {}
        for item in files:
            source = folder / "inputs" / item["storedName"]
            if source.suffix.lower() not in module.accepted_suffixes:
                raise ValueError(f"{module.name}不接受文件格式：{source.suffix}")
            target = folder / "work" / item["storedName"]
            shutil.copy2(source, target)
            staged[item["storedName"]] = target
        if not staged:
            raise ValueError("任务没有输入文件")
        return staged

    def _build_command(self, module: ModuleDefinition, staged: dict[str, Path], folder: Path, parameters: dict[str, Any]) -> list[str]:
        additional = _safe_extra_arguments(parameters.get("additionalArgs"))
        if module.engine == "unidec":
            # The pip console entry named ``unidec`` starts the GUI.  Headless
            # execution must point UNIDEC_BIN at the native core executable,
            # whose supported contract is: unidec.exe <configuration-file>.
            configured = os.getenv("UNIDEC_BIN")
            executable = str(Path(configured).expanduser()) if configured and Path(configured).expanduser().is_file() else None
            if not executable:
                raise RuntimeError("未找到 UniDec Core；请将 UNIDEC_BIN 配置为本地核心 unidec.exe，而非GUI启动器")
            config_name = parameters.get("configFile")
            config_path = staged.get(str(config_name)) if config_name else next(iter(staged.values())) if len(staged) == 1 else None
            if not config_path:
                raise ValueError("UniDec 多文件任务必须通过 configFile 指定已上传的配置文件")
            return [executable, str(config_path), *additional]
        executable = resolve_executable("fragpipe")
        if not executable:
            raise RuntimeError("未找到 FragPipe；请配置 FRAGPIPE_BIN（fragpipe.bat/fragpipe/可执行启动器）")
        workflow = staged.get(str(parameters.get("workflowFile", "")))
        manifest = staged.get(str(parameters.get("manifestFile", "")))
        if not workflow or workflow.suffix.lower() != ".workflow":
            raise ValueError("FragPipe 任务必须通过 workflowFile 指定已上传的 .workflow 文件")
        if not manifest or manifest.suffix.lower() not in {".manifest", ".txt", ".tsv"}:
            raise ValueError("FragPipe 任务必须通过 manifestFile 指定已上传的清单文件")
        command = [
            executable, "--headless", "--workflow", str(workflow), "--manifest", str(manifest),
            "--workdir", str(folder / "outputs"), *additional,
        ]
        return _windows_launcher(command)

    def _run_process(self, folder: Path, command: list[str], timeout: int) -> int:
        stdout_path = folder / "logs" / "stdout.log"
        stderr_path = folder / "logs" / "stderr.log"
        creationflags = subprocess.CREATE_NEW_PROCESS_GROUP if os.name == "nt" else 0
        process = subprocess.Popen(
            command, cwd=str(folder / "work"), env=dict(os.environ), stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            text=True, encoding="utf-8", errors="replace", bufsize=1, creationflags=creationflags,
            start_new_session=os.name != "nt", shell=False,
        )
        task_id = self._read(folder)["id"]
        with self._state_lock:
            self._processes[task_id] = process
            cancel_requested = task_id in self._cancel_requested
        self._update(folder, pid=process.pid, startedAt=utc_now(), message=f"本地进程已启动，PID={process.pid}")
        if cancel_requested:
            evidence = _kill_process_tree(process, "user-cancel-race")
            try:
                evidence["exitCode"] = process.wait(timeout=15)
                evidence["terminationConfirmed"] = True
            except subprocess.TimeoutExpired:
                evidence["terminationConfirmed"] = False
            self._update(folder, terminationEvidence=evidence)
            raise TaskCancelled("取消请求早于外部进程完成启动")

        def pump(source: Any, target: Path) -> None:
            with target.open("a", encoding="utf-8") as output:
                for line in iter(source.readline, ""):
                    output.write(line)
                    output.flush()
            source.close()

        stdout_thread = threading.Thread(target=pump, args=(process.stdout, stdout_path), daemon=True)
        stderr_thread = threading.Thread(target=pump, args=(process.stderr, stderr_path), daemon=True)
        stdout_thread.start(); stderr_thread.start()
        try:
            return_code = process.wait(timeout=timeout)
            if task_id in self._cancel_requested:
                current = self._read(folder).get("terminationEvidence", {})
                current.update({"exitCode": return_code, "terminationConfirmed": True, "confirmedAt": utc_now()})
                self._update(folder, terminationEvidence=current)
                raise TaskCancelled("用户取消并终止外部进程树")
            return return_code
        except subprocess.TimeoutExpired as error:
            evidence = _kill_process_tree(process, "timeout")
            try:
                evidence["exitCode"] = process.wait(timeout=15)
                evidence["terminationConfirmed"] = True
            except subprocess.TimeoutExpired:
                evidence["terminationConfirmed"] = False
            self._update(folder, terminationEvidence=evidence)
            outcome = "进程树已确认终止" if evidence["terminationConfirmed"] else "已请求终止但未能确认进程退出"
            raise TimeoutError(f"执行超过 {timeout} 秒，{outcome}") from error
        finally:
            stdout_thread.join(timeout=5); stderr_thread.join(timeout=5)

    def _artifact_entry(self, folder: Path, path: Path, project_id: str) -> dict[str, Any]:
        relative = _safe_relative(path, folder)
        return {
            "path": relative, "size": path.stat().st_size, "sha256": _sha256_file(path),
            "url": f"/engine-tasks/{folder.name}/artifacts/{relative}?projectId={project_id}",
        }

    def _collect_artifacts(self, folder: Path, staged_input_names: set[str]) -> list[dict[str, Any]]:
        artifacts = []
        project_id = folder.parent.parent.name
        for root_name in ("work", "outputs", "logs"):
            root = folder / root_name
            for path in root.rglob("*"):
                if path.is_file():
                    # A work copy of an uploaded input is not a generated
                    # artifact and must never enter the download whitelist.
                    if root_name == "work" and path.parent == root and path.name in staged_input_names:
                        continue
                    artifacts.append(self._artifact_entry(folder, path, project_id))
        artifacts.append(self._artifact_entry(folder, folder / "command.json", project_id))
        return artifacts

    def _read(self, folder: Path) -> dict[str, Any]:
        return json.loads((folder / "task.json").read_text(encoding="utf-8"))

    def _update(self, folder: Path, **changes: Any) -> dict[str, Any]:
        with self._state_lock:
            state = self._read(folder)
            state.update(changes)
            state["updatedAt"] = utc_now()
            if "message" in changes:
                state.setdefault("events", []).append({"at": state["updatedAt"], "status": state["status"], "message": changes["message"]})
            _atomic_json(folder / "task.json", state)
            return state

    def _append_traceback(self, folder: Path) -> None:
        path = folder / "logs" / "backend-error.log"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(traceback.format_exc(), encoding="utf-8")

    def _mark_abandoned_tasks(self) -> None:
        for path in TASK_ROOT.glob("*/*/*/task.json"):
            try:
                state = json.loads(path.read_text(encoding="utf-8"))
                if state.get("status") in {"staging", "queued", "running", "cancelling"}:
                    interrupted_at = utc_now()
                    state.update({
                        "status": "interrupted", "stage": "recovery", "progress": 100,
                        "message": "后端重启时任务尚未结束，已标记为中断，请重新提交", "updatedAt": interrupted_at,
                        "terminationEvidence": {
                            "at": interrupted_at, "reason": "backend-restart-detected",
                            "method": "state-recovery-only", "previousPid": state.get("pid"),
                            "warning": "无法仅凭历史PID安全确认或终止旧进程；不得将该任务恢复为完成。",
                        },
                    })
                    state.setdefault("events", []).append({"at": state["updatedAt"], "status": "interrupted", "message": state["message"]})
                    _atomic_json(path, state)
            except (OSError, ValueError):
                continue


task_manager = LocalEngineTaskManager()
