"""Persistent API and third-party mass-spectrometry engine orchestrator."""

from __future__ import annotations

import hashlib
import json
import os
import queue
import re
import subprocess
import sys
import tempfile
import threading
import traceback
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterator

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, PlainTextResponse, StreamingResponse
from pydantic import BaseModel

from backend.ai_gateway import generate_report
from backend.chat_gateway import ChatGatewayError, ensure_configured, normalize_messages, stream_chat_reply
from backend.docx_report import build_project_report
from backend.external_engines import ENGINES, all_engine_statuses, choose_mass_engine, engine_status, resolve_executable
from backend.result_summary import mass_brief_explanation, ptm_brief_explanation
from backend.submission_parser import parse_submission_files
from worker.analyze import compare_peaks
from worker.ptm_interval import PTMInputError, analyze_ptm_files

ROOT = Path(__file__).resolve().parents[1]


def configured_external_work_root() -> Path:
    """Resolve the existing ASCII-safe engine work root before app startup loads env."""
    configured = os.getenv("EXTERNAL_ENGINE_WORK_ROOT")
    env_path = ROOT / ".env.local"
    if not configured and env_path.is_file():
        for raw_line in env_path.read_text(encoding="utf-8-sig").splitlines():
            if raw_line.strip().startswith("EXTERNAL_ENGINE_WORK_ROOT="):
                configured = raw_line.split("=", 1)[1].strip().strip('"').strip("'")
                break
    return Path(configured).resolve() if configured else (ROOT / ".runtime").resolve()


JOBS_DIR = configured_external_work_root() / "mass-jobs-v2"
PTM_JOBS_DIR = ROOT / ".runtime" / "ptm-jobs"
PTM_RAW_JOBS_DIR = ROOT / ".runtime" / "ptm-openms-sage-jobs"
REPORTS_DIR = ROOT / ".runtime" / "reports"
SUBMISSIONS_DIR = ROOT / ".runtime" / "submissions"
UNIDEC_CLI_SCRIPT = ROOT / "worker" / "unidec_cli.py"
FLASHDECONV_CLI_SCRIPT = ROOT / "worker" / "flashdeconv_cli.py"
OPENMS_SAGE_CLI_SCRIPT = ROOT / "worker" / "openms_sage_cli.py"
ALLOWED_METHODS = {
    "intact-mass",
    "deglycosylated-intact-mass",
    "light-chain-mass",
    "heavy-chain-mass",
    "deglycosylated-heavy-chain-mass",
}
MASS_ENGINE_SUFFIXES = {"unidec": {".txt", ".dat"}, "flashdeconv": {".mzml"}}
ATTACHMENT_SUFFIXES = {
    ".pdf", ".docx", ".xlsx", ".csv", ".tsv", ".png", ".jpg", ".jpeg", ".tif", ".tiff",
    ".mzml", ".mgf", ".fasta", ".fa", ".idxml", ".mzid", ".mzidentml", ".json", ".yaml", ".yml",
}
MAX_FILE_BYTES = 250 * 1024 * 1024
task_queue: queue.Queue[str | None] = queue.Queue()
ptm_raw_queue: queue.Queue[str | None] = queue.Queue()


def engine_timeout_seconds() -> int:
    try:
        return min(max(int(os.getenv("EXTERNAL_ENGINE_TIMEOUT_SECONDS", os.getenv("UNIDEC_TIMEOUT_SECONDS", "600"))), 10), 7200)
    except ValueError:
        return 600


def run_cli(command: list[str], *, cwd: Path, env: dict[str, str], timeout: int) -> subprocess.CompletedProcess[str]:
    """Run a bounded external command and terminate it if the deadline is exceeded."""
    creationflags = subprocess.CREATE_NEW_PROCESS_GROUP if os.name == "nt" else 0
    process = subprocess.Popen(
        command, cwd=str(cwd), env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        text=True, creationflags=creationflags, start_new_session=os.name != "nt",
    )
    try:
        stdout, stderr = process.communicate(timeout=timeout)
    except subprocess.TimeoutExpired as error:
        if os.name == "nt":
            subprocess.run(["taskkill", "/PID", str(process.pid), "/T", "/F"], capture_output=True, check=False)
        else:
            process.kill()
        stdout, stderr = process.communicate(timeout=10)
        raise TimeoutError(f"外部专业引擎执行超过{timeout}秒，任务已终止，避免进程持续卡死") from error
    return subprocess.CompletedProcess(command, process.returncode, stdout, stderr)


def load_local_environment() -> None:
    env_path = ROOT / ".env.local"
    if not env_path.is_file():
        return
    for raw_line in env_path.read_text(encoding="utf-8-sig").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_local_environment()

# Import after .env.local is loaded because the task root is configurable.
from backend.local_engine_tasks import (
    MODULES as LOCAL_ENGINE_MODULES,
    STATUS_CONTRACT_VERSION as LOCAL_TASK_STATUS_CONTRACT_VERSION,
    STATUS_SEMANTICS as LOCAL_TASK_STATUS_SEMANTICS,
    task_manager,
)
from backend.calculation_router import router as calculation_router
from backend.calculation_tasks import calculation_task_manager


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def safe_filename(name: str) -> str:
    clean = re.sub(r"[^A-Za-z0-9._-]+", "_", Path(name).name)
    return clean[:120] or "file"


def job_dir(job_id: str) -> Path:
    if not re.fullmatch(r"[a-f0-9]{32}", job_id):
        raise HTTPException(status_code=404, detail="任务不存在")
    return JOBS_DIR / job_id


def ptm_job_dir(job_id: str) -> Path:
    if not re.fullmatch(r"[a-f0-9]{32}", job_id):
        raise HTTPException(status_code=404, detail="PTM任务不存在")
    return PTM_JOBS_DIR / job_id


def ptm_raw_job_dir(job_id: str) -> Path:
    if not re.fullmatch(r"[a-f0-9]{32}", job_id):
        raise HTTPException(status_code=404, detail="OpenMS/Sage PTM任务不存在")
    return PTM_RAW_JOBS_DIR / job_id


def read_json(path: Path) -> dict[str, Any]:
    if not path.is_file():
        raise HTTPException(status_code=404, detail="任务或结果不存在")
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding="utf-8")
    temp.replace(path)


def update_job(job_id: str, **changes: Any) -> dict[str, Any]:
    state_path = job_dir(job_id) / "job.json"
    state = read_json(state_path)
    state.update(changes)
    state["updatedAt"] = now()
    event = changes.get("message")
    if event:
        state.setdefault("events", []).append({"at": state["updatedAt"], "message": event, "progress": state.get("progress", 0)})
    write_json(state_path, state)
    return state


def update_ptm_raw_job(job_id: str, **changes: Any) -> dict[str, Any]:
    state_path = ptm_raw_job_dir(job_id) / "job.json"
    state = read_json(state_path)
    state.update(changes)
    state["updatedAt"] = now()
    if changes.get("message"):
        state.setdefault("events", []).append({"at": state["updatedAt"], "message": changes["message"], "progress": state.get("progress", 0)})
    write_json(state_path, state)
    return state


async def save_upload(upload: UploadFile, target: Path) -> dict[str, Any]:
    digest = hashlib.sha256()
    total = 0
    target.parent.mkdir(parents=True, exist_ok=True)
    with target.open("wb") as output:
        while chunk := await upload.read(1024 * 1024):
            total += len(chunk)
            if total > MAX_FILE_BYTES:
                output.close()
                target.unlink(missing_ok=True)
                raise HTTPException(status_code=413, detail=f"文件超过 {MAX_FILE_BYTES // 1024 // 1024} MB 限制")
            digest.update(chunk)
            output.write(chunk)
    await upload.close()
    return {"name": upload.filename or target.name, "storedName": target.name, "size": total, "sha256": digest.hexdigest()}


def process_job(job_id: str) -> None:
    folder = job_dir(job_id)
    log_path = folder / "worker.log"
    try:
        state = update_job(job_id, status="running", stage="preparing", progress=20, message="输入文件校验完成，正在准备外部专业引擎任务")
        manifest = read_json(folder / "manifest.json")
        engine_key = state["engineKey"]
        engine_name = ENGINES[engine_key].name
        result_path = folder / "professional-engine-result.json"
        adapter_script = UNIDEC_CLI_SCRIPT if engine_key == "unidec" else FLASHDECONV_CLI_SCRIPT
        command = [
            sys.executable, str(adapter_script),
            "--candidate", str(folder / manifest["candidate"]["storedName"]),
            "--reference", str(folder / manifest["reference"]["storedName"]),
            "--output", str(result_path),
            "--method", state["methodKey"],
            "--tolerance-da", str(state["parameters"]["toleranceDa"]),
            "--mass-lower", str(state["parameters"]["massLower"]),
            "--mass-upper", str(state["parameters"]["massUpper"]),
        ]
        write_json(folder / "analysis-request.json", {"engineKey": engine_key, "engineName": engine_name, "command": command[1:], "timeoutSeconds": engine_timeout_seconds()})
        update_job(job_id, stage="professional-engine", progress=38, message=f"正在通过{engine_name} CLI执行核心运算，最长等待{engine_timeout_seconds()}秒")
        env = {**os.environ, "MPLCONFIGDIR": str(ROOT / ".runtime" / "matplotlib")}
        run = run_cli(command, cwd=ROOT, env=env, timeout=engine_timeout_seconds())
        log_path.write_text((run.stdout or "") + "\n" + (run.stderr or ""), encoding="utf-8")
        if run.returncode != 0:
            raise RuntimeError(f"{engine_name} CLI退出码{run.returncode}：{(run.stderr or run.stdout or '无错误信息')[-1800:]}")
        if not result_path.is_file() or result_path.stat().st_size == 0:
            raise RuntimeError(f"{engine_name} CLI已退出，但没有生成有效结果文件")

        result = read_json(result_path)
        update_job(job_id, stage="report", progress=78, message=f"{engine_name}专业结果已保存，正在生成客观结果摘要")
        ai_report = generate_report(result)
        write_json(folder / "ai-report.json", ai_report)
        result["briefExplanation"] = mass_brief_explanation(result)
        full_result = {"professionalResult": result, "aiReport": ai_report, "briefExplanation": result["briefExplanation"]}
        write_json(folder / "result.json", full_result)
        input_artifacts = [
            {"name": "A药原始谱", "file": manifest["candidate"]["storedName"], "url": f"/jobs/{job_id}/files/{manifest['candidate']['storedName']}"},
            {"name": "B药原始谱", "file": manifest["reference"]["storedName"], "url": f"/jobs/{job_id}/files/{manifest['reference']['storedName']}"},
        ]
        input_artifacts.extend(
            {"name": f"补充材料：{item['name']}", "file": item["storedName"], "url": f"/jobs/{job_id}/files/{item['storedName']}"}
            for item in manifest.get("attachments", [])
        )
        update_job(
            job_id, status="completed", stage="completed", progress=100,
            message="专业分析和摘要生成完成",
            resultUrl=f"/jobs/{job_id}/result",
            artifacts=input_artifacts + [
                {"name": f"{engine_name}专业结果", "file": "professional-engine-result.json", "url": f"/jobs/{job_id}/artifacts/professional-engine-result.json"},
                {"name": "AI精简报告", "file": "ai-report.json", "url": f"/jobs/{job_id}/artifacts/ai-report.json"},
                {"name": "完整结果包", "file": "result.json", "url": f"/jobs/{job_id}/artifacts/result.json"},
                {"name": "运行日志", "file": "worker.log", "url": f"/jobs/{job_id}/artifacts/worker.log"},
            ],
        )
    except Exception as error:
        log_path.write_text(traceback.format_exc(), encoding="utf-8")
        update_job(job_id, status="failed", stage="failed", progress=100, message="分析任务失败", error=str(error)[:2000])


def process_ptm_raw_job(job_id: str) -> None:
    folder = ptm_raw_job_dir(job_id)
    log_path = folder / "worker.log"
    try:
        state = update_ptm_raw_job(job_id, status="running", stage="staging", progress=18, message="正在校验并暂存mzML与FASTA")
        manifest = read_json(folder / "manifest.json")
        status = engine_status("openms-sage")
        if not status["technicalConnectivityValidated"]:
            raise RuntimeError(f"OpenMS/Sage技术调用不可用，缺少：{'、'.join(status['missingExecutables']) or '版本探测失败'}")
        decoy_database = resolve_executable("openms-sage", "DecoyDatabase")
        sage_adapter = resolve_executable("openms-sage", "SageAdapter")
        sage = resolve_executable("openms-sage", "sage")
        file_converter = resolve_executable("openms-sage", "FileConverter")
        if not all((decoy_database, sage_adapter, sage, file_converter)):
            raise RuntimeError("OpenMS/Sage工作流缺少DecoyDatabase、SageAdapter、FileConverter或sage")
        openms_root = Path(file_converter).resolve().parents[1]
        openms_data_path = openms_root / "share" / "OpenMS"
        if not openms_data_path.is_dir():
            raise RuntimeError(f"未找到OPENMS_DATA_PATH：{openms_data_path}")
        artifact_dir = folder / "artifacts"
        artifact_dir.mkdir(exist_ok=True)
        work_root = Path(os.getenv("EXTERNAL_ENGINE_WORK_ROOT", str(Path(tempfile.gettempdir()) / "BioCompareEngineJobs")))
        command = [
            sys.executable, str(OPENMS_SAGE_CLI_SCRIPT),
            "--fasta", str(folder / manifest["fasta"]["storedName"]),
            "--result-dir", str(artifact_dir), "--work-root", str(work_root),
            "--decoy-database", decoy_database, "--sage-adapter", sage_adapter,
            "--sage", sage, "--openms-data-path", str(openms_data_path),
            "--interval-method", state["parameters"]["intervalMethod"],
            "--min-reference-lots", str(state["parameters"]["minReferenceLots"]),
            "--q-threshold", str(state["parameters"]["qValueThreshold"]),
            "--precursor-tolerance-da", str(state["parameters"]["precursorToleranceDa"]),
            "--fragment-tolerance-da", str(state["parameters"]["fragmentToleranceDa"]),
            "--threads", str(state["parameters"]["threads"]),
        ]
        for item in manifest["referenceMzml"]:
            command.extend(["--reference", str(folder / item["storedName"])])
        for item in manifest["candidateMzml"]:
            command.extend(["--candidate", str(folder / item["storedName"])])
        write_json(folder / "analysis-request.json", {
            "engineKey": "openms-sage", "command": command[1:],
            "timeoutSeconds": engine_timeout_seconds(), "engineStatus": status,
        })
        update_ptm_raw_job(job_id, stage="openms-sage", progress=35, message=f"正在调用OpenMS DecoyDatabase和SageAdapter/Sage，超时上限{engine_timeout_seconds()}秒")
        run = run_cli(command, cwd=ROOT, env=dict(os.environ), timeout=engine_timeout_seconds())
        log_path.write_text((run.stdout or "") + "\n" + (run.stderr or ""), encoding="utf-8")
        if run.returncode != 0:
            raise RuntimeError(f"OpenMS/Sage工作流退出码{run.returncode}：{(run.stderr or run.stdout or '无错误信息')[-1800:]}")
        workflow_result_path = artifact_dir / "openms-sage-result.json"
        if not workflow_result_path.is_file():
            raise RuntimeError("OpenMS/Sage工作流没有生成结果清单")
        workflow_result = read_json(workflow_result_path)
        artifact_names = [name for name in workflow_result.get("artifacts", []) if (artifact_dir / name).is_file()]
        artifacts = [
            {"name": name, "file": name, "url": f"/ptm/openms-sage/jobs/{job_id}/artifacts/{name}"}
            for name in artifact_names
        ]
        artifacts.extend([
            {"name": "OpenMS/Sage完整结果", "file": "openms-sage-result.json", "url": f"/ptm/openms-sage/jobs/{job_id}/artifacts/openms-sage-result.json"},
            {"name": "运行日志", "file": "worker.log", "url": f"/ptm/openms-sage/jobs/{job_id}/artifacts/worker.log"},
            {"name": "调用参数审计", "file": "analysis-request.json", "url": f"/ptm/openms-sage/jobs/{job_id}/artifacts/analysis-request.json"},
        ])
        if workflow_result.get("outcome") == "quality_blocked" or not workflow_result.get("comparison"):
            quality = workflow_result.get("externalWorkflow", {}).get("qualityGate", {})
            write_json(folder / "quality-gate-result.json", workflow_result)
            update_ptm_raw_job(
                job_id, status="quality-blocked", stage="quality-gate", progress=100,
                message="专业搜索已完成，但数据未通过PTM质量闸门",
                error=quality.get("message", "严格FDR后没有足够的可定量修饰位点"),
                qualityGate=quality, resultUrl=f"/ptm/openms-sage/jobs/{job_id}/quality-gate-result", artifacts=artifacts,
            )
            return
        comparison = workflow_result["comparison"]
        comparison.update({
            "taskId": job_id, "upstreamProfessionalEngine": "openms-sage",
            "externalWorkflow": workflow_result["externalWorkflow"],
            "processingBoundary": "OpenMS/Sage负责数据库检索、目标诱饵FDR和专业结果；BioCompare仅执行字段适配、多批参照区间与客观标记。",
            "resultUrl": f"/ptm/openms-sage/jobs/{job_id}/result",
            "briefExplanation": ptm_brief_explanation(comparison),
        })
        write_json(folder / "result.json", comparison)
        update_ptm_raw_job(
            job_id, status="completed", stage="completed", progress=100,
            message="OpenMS/Sage专业处理与BioCompare区间标记完成",
            resultUrl=f"/ptm/openms-sage/jobs/{job_id}/result", artifacts=artifacts,
        )
    except Exception as error:
        log_path.write_text(traceback.format_exc(), encoding="utf-8")
        update_ptm_raw_job(job_id, status="failed", stage="failed", progress=100, message="OpenMS/Sage PTM任务失败", error=str(error)[:2000])


def queue_worker() -> None:
    while True:
        job_id = task_queue.get()
        try:
            if job_id is None:
                return
            process_job(job_id)
        finally:
            task_queue.task_done()


def ptm_raw_queue_worker() -> None:
    while True:
        job_id = ptm_raw_queue.get()
        try:
            if job_id is None:
                return
            process_ptm_raw_job(job_id)
        finally:
            ptm_raw_queue.task_done()


@asynccontextmanager
async def lifespan(_: FastAPI):
    JOBS_DIR.mkdir(parents=True, exist_ok=True)
    PTM_JOBS_DIR.mkdir(parents=True, exist_ok=True)
    PTM_RAW_JOBS_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    SUBMISSIONS_DIR.mkdir(parents=True, exist_ok=True)
    thread = threading.Thread(target=queue_worker, name="biocompare-job-worker", daemon=True)
    ptm_thread = threading.Thread(target=ptm_raw_queue_worker, name="biocompare-openms-sage-worker", daemon=True)
    thread.start()
    ptm_thread.start()
    task_manager.start()
    calculation_task_manager.start()
    yield
    task_queue.put(None)
    ptm_raw_queue.put(None)
    task_manager.stop()
    calculation_task_manager.stop()


app = FastAPI(title="BioCompare Analysis API", version="0.2.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
app.include_router(calculation_router)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    contextSummary: str | None = None


@app.post("/api/chat")
def api_chat(payload: ChatRequest) -> StreamingResponse:
    try:
        ensure_configured()
        context_summary = (payload.contextSummary or "").strip()[:2000]
        messages = normalize_messages([message.model_dump() for message in payload.messages], context_summary)
    except ChatGatewayError as error:
        status = 503 if "未配置" in str(error) else 400
        raise HTTPException(status_code=status, detail=str(error)) from error

    def event_stream() -> Iterator[str]:
        try:
            for delta in stream_chat_reply(messages):
                yield f"data: {json.dumps({'delta': delta}, ensure_ascii=False)}\n\n"
        except ChatGatewayError as error:
            yield f"data: {json.dumps({'error': str(error)}, ensure_ascii=False)}\n\n"
        yield f"data: {json.dumps({'meta': {'model': os.getenv('AI_MODEL', '').strip(), 'contextChars': len(context_summary)}}, ensure_ascii=False)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/health")
def health() -> dict[str, Any]:
    try:
        import importlib.metadata
        unidec_version = importlib.metadata.version("unidec")
        unidec_available = True
    except Exception:
        unidec_version = None
        unidec_available = False
    return {
        "status": "online", "apiVersion": app.version,
        "unidec": {"available": unidec_available, "version": unidec_version},
        "unidecCli": {"available": UNIDEC_CLI_SCRIPT.is_file(), "timeoutSeconds": engine_timeout_seconds()},
        "externalEngines": all_engine_statuses(),
        "ptmIntervalEngine": {"available": True, "version": "0.1.0"},
        "ai": {"configured": bool(os.getenv("AI_API_KEY") and os.getenv("AI_MODEL")), "model": os.getenv("AI_MODEL")},
        "queueDepth": task_queue.qsize(), "checkedAt": now(),
    }


@app.get("/external-engines")
def external_engines() -> dict[str, Any]:
    """Return deployment-time availability and governance metadata."""
    return {
        "contractVersion": "2.0",
        "policy": "BioCompare仅负责任务编排、参数组装、输出解析、业务比对、展示和报告；质谱核心运算由外部引擎完成。",
        "statusSemantics": {
            "installed": "所需程序包或可执行组件已安装。",
            "detected": "系统已根据在线配置或PATH找到程序位置。",
            "technicalConnectivityValidated": "已完成最小版本/帮助命令探测，仅证明技术连通。",
            "regulatoryWorkflowValidated": "完整监管用途工作流已经过版本冻结、输入输出和可追溯性验证。",
            "productionAvailable": "技术连通和监管工作流验证均完成后才可为true。",
        },
        "engines": all_engine_statuses(), "checkedAt": now(),
    }


@app.get("/engine-tasks/modules")
def local_engine_modules() -> dict[str, Any]:
    """Expose the fixed business-module registry; arbitrary executables are not accepted."""
    return {
        "statusContractVersion": LOCAL_TASK_STATUS_CONTRACT_VERSION,
        "statusSemantics": LOCAL_TASK_STATUS_SEMANTICS,
        "modules": [
            {
                "key": item.key, "code": item.code, "name": item.name,
                "engineKey": item.engine, "acceptedSuffixes": list(item.accepted_suffixes),
            }
            for item in LOCAL_ENGINE_MODULES.values()
        ]
    }


@app.post("/engine-tasks", status_code=202)
async def create_local_engine_task(
    files: list[UploadFile] = File(...),
    projectId: str = Form(...),
    moduleKey: str = Form(...),
    parametersJson: str = Form("{}"),
) -> dict[str, Any]:
    """Stage an isolated local-engine task and return immediately with a task id."""
    try:
        parameters = json.loads(parametersJson)
        if not isinstance(parameters, dict):
            raise ValueError("parametersJson 必须是JSON对象")
    except (json.JSONDecodeError, ValueError) as error:
        raise HTTPException(status_code=400, detail=f"参数格式错误：{error}") from error
    if not files or len(files) > 100:
        raise HTTPException(status_code=400, detail="请上传1至100个任务文件")
    try:
        state, folder = task_manager.prepare(projectId, moduleKey, parameters)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    metadata = []
    try:
        used_names: set[str] = set()
        for index, upload in enumerate(files):
            original_name = upload.filename or f"input-{index + 1}"
            stored_name = safe_filename(original_name)
            if stored_name in used_names:
                stored_name = f"{index + 1:03d}-{stored_name}"
            used_names.add(stored_name)
            item = await save_upload(upload, folder / "inputs" / stored_name)
            item["originalName"] = original_name
            metadata.append(item)
        return task_manager.enqueue(state["id"], folder, metadata)
    except HTTPException as error:
        task_manager.fail_staging(folder, error)
        raise
    except Exception as error:
        task_manager.fail_staging(folder, error)
        raise HTTPException(status_code=500, detail=f"任务输入保存失败：{str(error)[:500]}") from error


@app.get("/engine-tasks/{task_id}")
def get_local_engine_task(task_id: str, projectId: str) -> dict[str, Any]:
    try:
        return task_manager.get(task_id, projectId)
    except FileNotFoundError as error:
        raise HTTPException(status_code=404, detail="本地引擎任务不存在") from error


@app.get("/engine-tasks/{task_id}/result")
def get_local_engine_task_result(task_id: str, projectId: str) -> dict[str, Any]:
    try:
        folder = task_manager.locate(task_id, projectId)
        return read_json(folder / "result.json")
    except FileNotFoundError as error:
        raise HTTPException(status_code=404, detail="任务结果尚未生成") from error


@app.get("/engine-tasks/{task_id}/logs", response_class=PlainTextResponse)
def get_local_engine_task_log(task_id: str, projectId: str, stream: str = "stdout", tail: int = 300) -> str:
    try:
        return task_manager.read_log(task_id, projectId, stream, tail)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except FileNotFoundError as error:
        raise HTTPException(status_code=404, detail="本地引擎任务不存在") from error


@app.get("/engine-tasks/{task_id}/artifacts/{artifact_path:path}")
def download_local_engine_artifact(task_id: str, artifact_path: str, projectId: str) -> FileResponse:
    try:
        target = task_manager.artifact(task_id, projectId, artifact_path)
    except FileNotFoundError as error:
        raise HTTPException(status_code=404, detail="任务产物不存在") from error
    return FileResponse(target, filename=target.name)


@app.post("/engine-tasks/{task_id}/cancel")
def cancel_local_engine_task(task_id: str, projectId: str) -> dict[str, Any]:
    try:
        return task_manager.cancel(task_id, projectId)
    except FileNotFoundError as error:
        raise HTTPException(status_code=404, detail="本地引擎任务不存在") from error


@app.post("/ptm/analyze")
async def analyze_ptm(
    reference: UploadFile = File(...),
    candidate: UploadFile = File(...),
    intervalMethod: str = Form("observed-range"),
    minReferenceLots: int = Form(3),
    upstreamEngine: str = Form("external-professional-result"),
) -> dict[str, Any]:
    allowed_suffixes = {".csv", ".tsv"}
    for upload in (reference, candidate):
        suffix = Path(upload.filename or "").suffix.lower()
        if suffix not in allowed_suffixes:
            raise HTTPException(status_code=415, detail="PTM区间引擎当前仅接受CSV或TSV定量表")
    if intervalMethod not in {"observed-range", "mean-3sd", "robust-mad"}:
        raise HTTPException(status_code=400, detail="不支持的参照区间方法")
    if not 2 <= minReferenceLots <= 100:
        raise HTTPException(status_code=400, detail="最低参照药批次数必须在2至100之间")
    if upstreamEngine not in {"openms-sage", "fragpipe-msfragger", "external-professional-result"}:
        raise HTTPException(status_code=400, detail="不支持的PTM上游专业引擎标识")

    task_id = uuid.uuid4().hex
    folder = PTM_JOBS_DIR / task_id
    folder.mkdir(parents=True, exist_ok=False)
    reference_suffix = Path(reference.filename or "reference.csv").suffix.lower()
    candidate_suffix = Path(candidate.filename or "candidate.csv").suffix.lower()
    reference_path = folder / f"reference{reference_suffix}"
    candidate_path = folder / f"candidate{candidate_suffix}"
    reference_meta = await save_upload(reference, reference_path)
    candidate_meta = await save_upload(candidate, candidate_path)
    try:
        result = analyze_ptm_files(reference_path, candidate_path, intervalMethod, minReferenceLots)
    except PTMInputError as error:
        write_json(folder / "error.json", {"error": str(error), "createdAt": now()})
        raise HTTPException(status_code=422, detail=str(error)) from error
    result.update({
        "taskId": task_id,
        "upstreamProfessionalEngine": upstreamEngine,
        "processingBoundary": "上游专业程序负责肽段鉴定与修饰定量；BioCompare仅执行多批参照区间和监管业务标记。",
        "files": {"reference": reference_meta, "candidate": candidate_meta},
        "resultUrl": f"/ptm/results/{task_id}",
        "briefExplanation": ptm_brief_explanation(result),
    })
    write_json(folder / "result.json", result)
    return result


@app.get("/ptm/results/{task_id}")
def get_ptm_result(task_id: str) -> dict[str, Any]:
    return read_json(ptm_job_dir(task_id) / "result.json")


@app.post("/ptm/openms-sage/jobs", status_code=202)
async def create_openms_sage_ptm_job(
    referenceMzml: list[UploadFile] = File(...),
    candidateMzml: list[UploadFile] = File(...),
    fasta: UploadFile = File(...),
    intervalMethod: str = Form("observed-range"),
    minReferenceLots: int = Form(3),
    qValueThreshold: float = Form(0.01),
    precursorToleranceDa: float = Form(0.05),
    fragmentToleranceDa: float = Form(0.3),
    threads: int = Form(4),
) -> dict[str, Any]:
    """Queue a real OpenMS/Sage search followed by BioCompare PTM interval marking."""
    status = engine_status("openms-sage")
    if not status["technicalConnectivityValidated"]:
        raise HTTPException(status_code=503, detail=f"OpenMS/Sage技术调用不可用，缺少：{'、'.join(status['missingExecutables']) or '版本探测失败'}")
    if not referenceMzml or not candidateMzml:
        raise HTTPException(status_code=400, detail="必须上传参照药和候选药mzML")
    if len(referenceMzml) > 50 or len(candidateMzml) > 50:
        raise HTTPException(status_code=413, detail="参照药或候选药单次最多上传50个mzML")
    if not 2 <= minReferenceLots <= 50:
        raise HTTPException(status_code=400, detail="最低参照药批次数必须在2至50之间")
    if len(referenceMzml) < minReferenceLots:
        raise HTTPException(status_code=422, detail=f"仅上传{len(referenceMzml)}个参照药运行，低于预设最低批次数{minReferenceLots}")
    if intervalMethod not in {"observed-range", "mean-3sd", "robust-mad"}:
        raise HTTPException(status_code=400, detail="不支持的参照区间方法")
    if not 0 < qValueThreshold <= 0.01:
        raise HTTPException(status_code=400, detail="正式OpenMS/Sage任务的谱图q值阈值必须在0至0.01之间")
    if not 0.001 <= precursorToleranceDa <= 5 or not 0.001 <= fragmentToleranceDa <= 5:
        raise HTTPException(status_code=400, detail="前体和碎片质量容差必须在0.001至5 Da之间")
    if not 1 <= threads <= 32:
        raise HTTPException(status_code=400, detail="线程数必须在1至32之间")
    for upload in [*referenceMzml, *candidateMzml]:
        if Path(upload.filename or "").suffix.lower() != ".mzml":
            raise HTTPException(status_code=415, detail=f"OpenMS/Sage谱图输入仅接受mzML：{upload.filename}")
    if Path(fasta.filename or "").suffix.lower() not in {".fasta", ".fa"}:
        raise HTTPException(status_code=415, detail="蛋白数据库仅接受FASTA或FA文件")

    job_id = uuid.uuid4().hex
    folder = PTM_RAW_JOBS_DIR / job_id
    folder.mkdir(parents=True, exist_ok=False)
    reference_meta = []
    candidate_meta = []
    for index, upload in enumerate(referenceMzml, start=1):
        reference_meta.append(await save_upload(upload, folder / f"reference-{index:03d}.mzML"))
    for index, upload in enumerate(candidateMzml, start=1):
        candidate_meta.append(await save_upload(upload, folder / f"candidate-{index:03d}.mzML"))
    fasta_suffix = Path(fasta.filename or "database.fasta").suffix.lower()
    fasta_meta = await save_upload(fasta, folder / f"database{fasta_suffix}")
    manifest = {"referenceMzml": reference_meta, "candidateMzml": candidate_meta, "fasta": fasta_meta}
    write_json(folder / "manifest.json", manifest)
    state = {
        "id": job_id, "status": "queued", "stage": "queued", "progress": 8,
        "methodKey": "post-translational-modifications", "engineKey": "openms-sage", "engineName": "OpenMS + Sage",
        "parameters": {
            "intervalMethod": intervalMethod, "minReferenceLots": minReferenceLots,
            "qValueThreshold": qValueThreshold, "precursorToleranceDa": precursorToleranceDa,
            "fragmentToleranceDa": fragmentToleranceDa, "threads": threads,
        },
        "files": manifest, "createdAt": now(), "updatedAt": now(),
        "message": "mzML与FASTA已保存，OpenMS/Sage任务进入队列",
        "events": [{"at": now(), "message": "mzML与FASTA已保存，OpenMS/Sage任务进入队列", "progress": 8}],
        "regulatoryStatus": "technical-pilot-only",
    }
    write_json(folder / "job.json", state)
    ptm_raw_queue.put(job_id)
    return state


@app.get("/ptm/openms-sage/jobs/{job_id}")
def get_openms_sage_ptm_job(job_id: str) -> dict[str, Any]:
    return read_json(ptm_raw_job_dir(job_id) / "job.json")


@app.get("/ptm/openms-sage/jobs/{job_id}/result")
def get_openms_sage_ptm_result(job_id: str) -> dict[str, Any]:
    return read_json(ptm_raw_job_dir(job_id) / "result.json")


@app.get("/ptm/openms-sage/jobs/{job_id}/quality-gate-result")
def get_openms_sage_quality_gate_result(job_id: str) -> dict[str, Any]:
    return read_json(ptm_raw_job_dir(job_id) / "quality-gate-result.json")


@app.get("/ptm/openms-sage/jobs/{job_id}/artifacts/{filename}")
def download_openms_sage_artifact(job_id: str, filename: str) -> FileResponse:
    allowed = {
        "reference-ptm.csv", "candidate-ptm.csv", "results.sage.tsv", "openms-sage-fdr01.idXML",
        "workflow.json", "openms-sage-result.json", "worker.log", "analysis-request.json",
    }
    if filename not in allowed:
        raise HTTPException(status_code=404, detail="OpenMS/Sage产物不存在")
    folder = ptm_raw_job_dir(job_id)
    target = folder / filename if filename in {"worker.log", "analysis-request.json"} else folder / "artifacts" / filename
    if not target.is_file():
        raise HTTPException(status_code=404, detail="OpenMS/Sage产物尚未生成")
    return FileResponse(target, filename=f"{job_id}-{filename}")


@app.post("/demo")
def run_demo(payload: dict[str, Any]) -> dict[str, Any]:
    candidate = payload.get("candidatePeaks")
    reference = payload.get("referencePeaks")
    if not isinstance(candidate, list) or not isinstance(reference, list):
        raise HTTPException(status_code=400, detail="示例峰表格式无效")
    result = compare_peaks(candidate, reference, float(payload.get("toleranceDa", 2.0)))
    result.update({
        "runId": uuid.uuid4().hex[:12], "status": "completed",
        "engine": {"name": "BioCompare deterministic peak matcher", "version": "0.2.0"},
        "methodKey": payload.get("methodKey", "intact-mass"), "generatedAt": now(),
        "warnings": ["当前示例使用已去卷积峰表，不代表真实仪器测量。"],
        "trace": {"mode": "peak-list-demo"},
        "disclaimer": "本结果仅用于研发阶段初筛，不构成药学相似性或监管结论。",
    })
    return {"professionalResult": result, "aiReport": generate_report(result)}


@app.post("/reports/export-docx")
def export_docx(payload: dict[str, Any]) -> FileResponse:
    modules = payload.get("modules")
    if not isinstance(modules, list):
        raise HTTPException(status_code=422, detail="报告数据缺少modules列表")
    if len(modules) > 50:
        raise HTTPException(status_code=422, detail="单份报告最多汇总50个专项")
    report_id = uuid.uuid4().hex
    target = REPORTS_DIR / f"biocompare-{report_id}.docx"
    try:
        build_project_report(payload, target)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Word报告生成失败：{str(error)[:500]}") from error
    return FileResponse(
        target,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=f"BioCompare-整体结果-{datetime.now().strftime('%Y%m%d-%H%M%S')}.docx",
    )


@app.post("/project-materials/inspect")
async def inspect_project_materials(files: list[UploadFile] = File(...)) -> dict[str, Any]:
    if not files:
        raise HTTPException(status_code=400, detail="请至少上传一个申报材料文件")
    if len(files) > 100:
        raise HTTPException(status_code=413, detail="单次最多上传100个文件")
    allowed = {".csv", ".tsv", ".xlsx", ".pdf", ".docx", ".png", ".jpg", ".jpeg", ".tif", ".tiff", ".mzml", ".fasta", ".fa"}
    submission_id = uuid.uuid4().hex
    folder = SUBMISSIONS_DIR / submission_id
    folder.mkdir(parents=True, exist_ok=False)
    stored: list[tuple[Path, str]] = []
    metadata = []
    for index, upload in enumerate(files):
        original_name = upload.filename or f"material-{index + 1}"
        suffix = Path(original_name).suffix.lower()
        if suffix not in allowed:
            raise HTTPException(status_code=415, detail=f"暂不支持的申报材料格式：{suffix or '无扩展名'}")
        target = folder / f"{index + 1:03d}-{safe_filename(original_name)}"
        metadata.append(await save_upload(upload, target))
        stored.append((target, original_name))
    try:
        result = parse_submission_files(stored)
    except Exception as error:
        write_json(folder / "error.json", {"error": str(error), "createdAt": now()})
        raise HTTPException(status_code=422, detail=f"申报材料解析失败：{str(error)[:500]}") from error
    result.update({"submissionId": submission_id, "generatedAt": now(), "originalFiles": metadata})
    # normalizedContent is kept in the response for browser-side File creation;
    # the persisted manifest records the same deterministic routing decision.
    write_json(folder / "inspection.json", result)
    return result


@app.post("/jobs", status_code=202)
async def create_job(
    candidate: UploadFile = File(...),
    reference: UploadFile = File(...),
    attachments: list[UploadFile] | None = File(default=None),
    methodKey: str = Form("intact-mass"),
    engineKey: str = Form("auto"),
    toleranceDa: float = Form(2.0),
    massLower: float = Form(10000.0),
    massUpper: float = Form(250000.0),
) -> dict[str, Any]:
    if methodKey not in ALLOWED_METHODS:
        raise HTTPException(status_code=400, detail="当前方法尚未接入分子量专业引擎任务模板")
    if not 0.01 <= toleranceDa <= 100:
        raise HTTPException(status_code=400, detail="峰匹配容差必须在0.01至100 Da之间")
    if not 100 <= massLower < massUpper <= 2_000_000:
        raise HTTPException(status_code=400, detail="质量搜索范围无效")
    suffixes = {Path(spectrum.filename or "").suffix.lower() for spectrum in (candidate, reference)}
    if len(suffixes) != 1:
        raise HTTPException(status_code=415, detail="候选药与参照药必须使用相同的谱图格式")
    try:
        selected_engine = choose_mass_engine(engineKey, suffixes)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    allowed_suffixes = MASS_ENGINE_SUFFIXES[selected_engine]
    if not suffixes <= allowed_suffixes:
        formats = "、".join(sorted(allowed_suffixes))
        raise HTTPException(status_code=415, detail=f"{ENGINES[selected_engine].name}输入仅接受：{formats}")

    job_id = uuid.uuid4().hex
    folder = JOBS_DIR / job_id
    folder.mkdir(parents=True, exist_ok=False)
    spectrum_suffix = next(iter(suffixes))
    candidate_meta = await save_upload(candidate, folder / f"candidate{spectrum_suffix}")
    reference_meta = await save_upload(reference, folder / f"reference{spectrum_suffix}")
    attachment_meta = []
    for index, attachment in enumerate(attachments or []):
        suffix = Path(attachment.filename or "").suffix.lower()
        if suffix not in ATTACHMENT_SUFFIXES:
            raise HTTPException(status_code=415, detail=f"不支持的附件格式：{suffix or '无扩展名'}")
        target = folder / f"attachment-{index + 1}-{safe_filename(attachment.filename or 'file')}"
        attachment_meta.append(await save_upload(attachment, target))

    manifest = {"candidate": candidate_meta, "reference": reference_meta, "attachments": attachment_meta}
    write_json(folder / "manifest.json", manifest)
    state = {
        "id": job_id, "status": "queued", "stage": "queued", "progress": 10,
        "methodKey": methodKey, "engineKey": selected_engine, "engineName": ENGINES[selected_engine].name,
        "parameters": {"toleranceDa": toleranceDa, "massLower": massLower, "massUpper": massUpper},
        "files": manifest, "createdAt": now(), "updatedAt": now(),
        "message": "文件已安全保存，任务进入队列",
        "events": [{"at": now(), "message": "文件已安全保存，任务进入队列", "progress": 10}],
    }
    write_json(folder / "job.json", state)
    task_queue.put(job_id)
    return state


@app.get("/jobs/{job_id}")
def get_job(job_id: str) -> dict[str, Any]:
    return read_json(job_dir(job_id) / "job.json")


@app.get("/jobs/{job_id}/result")
def get_result(job_id: str) -> dict[str, Any]:
    return read_json(job_dir(job_id) / "result.json")


@app.get("/jobs/{job_id}/artifacts/{filename}")
def download_artifact(job_id: str, filename: str) -> FileResponse:
    allowed = {"professional-engine-result.json", "ai-report.json", "result.json", "worker.log", "analysis-request.json",
               "candidate-flashdeconv-ms1.tsv", "reference-flashdeconv-ms1.tsv"}
    if filename not in allowed:
        raise HTTPException(status_code=404, detail="产物不存在")
    target = job_dir(job_id) / filename
    if not target.is_file():
        raise HTTPException(status_code=404, detail="产物尚未生成")
    return FileResponse(target, filename=f"{job_id}-{filename}")


@app.get("/jobs/{job_id}/files/{filename}")
def download_input(job_id: str, filename: str) -> FileResponse:
    folder = job_dir(job_id)
    manifest = read_json(folder / "manifest.json")
    allowed = {manifest["candidate"]["storedName"], manifest["reference"]["storedName"]}
    allowed.update(item["storedName"] for item in manifest.get("attachments", []))
    if filename not in allowed:
        raise HTTPException(status_code=404, detail="原始文件不存在")
    target = folder / filename
    return FileResponse(target, filename=filename)
