# -*- coding: utf-8 -*-
"""In-process asyncio job queue with bounded concurrency (D8)."""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any

from app.adapters.base import AdapterContext, AdapterNotImplementedError, IncompleteUploadError
from app.adapters.registry import resolve_adapter
from app.config import Settings
from app.jobs.input_manifest import load_manifest
from app.jobs.state_machine import is_terminal
from app.jobs.store import JobStore
from app.models.analysis_contract import (
    AnalysisJobError,
    AnalysisJobProgress,
    AnalysisJobSnapshot,
    AnalysisJobStatus,
    LocalizedText,
)

LOGGER = logging.getLogger(__name__)


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class JobQueue:
    def __init__(self, store: JobStore, settings: Settings) -> None:
        self.store = store
        self.settings = settings
        self._queue: asyncio.Queue[str] = asyncio.Queue()
        self._workers: list[asyncio.Task[None]] = []
        self._running_tasks: dict[str, asyncio.Task[None]] = {}
        self._cancel_flags: dict[str, asyncio.Event] = {}
        self._semaphore = asyncio.Semaphore(settings.max_concurrent_jobs)

    def start(self, worker_count: int | None = None) -> None:
        if self._workers:
            return
        count = worker_count or self.settings.max_concurrent_jobs
        for index in range(count):
            self._workers.append(asyncio.create_task(self._worker_loop(index)))

    async def shutdown(self) -> None:
        for worker in self._workers:
            worker.cancel()
        if self._workers:
            await asyncio.gather(*self._workers, return_exceptions=True)
        self._workers.clear()

    async def enqueue(self, job_id: str) -> None:
        await self._queue.put(job_id)

    async def cancel(self, job_id: str) -> AnalysisJobSnapshot:
        snapshot = self.store.load(job_id)
        if is_terminal(snapshot.status):
            return snapshot

        cancel_flag = self._cancel_flags.setdefault(job_id, asyncio.Event())
        cancel_flag.set()

        running = self._running_tasks.get(job_id)
        if running is not None:
            running.cancel()

        if snapshot.status in {
            AnalysisJobStatus.QUEUED,
            AnalysisJobStatus.VALIDATING,
            AnalysisJobStatus.RUNNING,
        }:
            return self.store.transition(
                job_id,
                AnalysisJobStatus.CANCELLED,
                updated_at=utc_now(),
                progress=None,
                error=AnalysisJobError(
                    code="CANCELLED_BY_USER",
                    message="Job cancelled by client request.",
                    safe_message=LocalizedText(
                        zh="任务已被用户取消。",
                        en="The job was cancelled by the client.",
                    ),
                ),
                result=None,
            )
        return snapshot

    async def _worker_loop(self, worker_index: int) -> None:
        while True:
            job_id = await self._queue.get()
            try:
                async with self._semaphore:
                    await self._process_job(job_id, worker_index)
            finally:
                self._queue.task_done()

    async def _process_job(self, job_id: str, worker_index: int) -> None:
        cancel_flag = self._cancel_flags.setdefault(job_id, asyncio.Event())
        task = asyncio.current_task()
        if task is not None:
            self._running_tasks[job_id] = task
        try:
            await asyncio.wait_for(
                self._run_job(job_id, worker_index, cancel_flag),
                timeout=self.settings.job_timeout_seconds,
            )
        except AdapterNotImplementedError as exc:
            self._mark_failed(
                job_id,
                code="ADAPTER_NOT_IMPLEMENTED",
                message=str(exc),
                zh="该分析 profile 的适配器尚未实现，无法运行分析。",
                en="No analysis adapter is implemented for this profile yet.",
            )
        except IncompleteUploadError as exc:
            self._mark_failed(
                job_id,
                code="INCOMPLETE_UPLOAD",
                message=str(exc),
                zh="已上传文件，但不足以走该分析方法，系统不会改用合成演示。一张两侧合成图请用 png/jpeg；两份独立谱需按顺序选候选与参照（完整质量还要 FASTA）。",
                en="Files were uploaded but are incomplete for this method; the synthetic demo is not substituted. Use one png/jpeg combined figure, or two separate spectra (intact mass also needs FASTA).",
            )
        except asyncio.TimeoutError:
            self._mark_failed(
                job_id,
                code="JOB_TIMEOUT",
                message="Job exceeded the configured timeout.",
                zh="任务超过允许的运行时间。",
                en="The job exceeded the configured timeout.",
            )
        except asyncio.CancelledError:
            snapshot = self.store.load(job_id)
            if not is_terminal(snapshot.status):
                self.store.transition(
                    job_id,
                    AnalysisJobStatus.CANCELLED,
                    updated_at=utc_now(),
                    progress=None,
                    error=AnalysisJobError(
                        code="CANCELLED_BY_USER",
                        message="Job cancelled during execution.",
                        safe_message=LocalizedText(
                            zh="任务在执行过程中被取消。",
                            en="The job was cancelled during execution.",
                        ),
                    ),
                    result=None,
                )
            raise
        except Exception as exc:  # noqa: BLE001 — last-resort guard; details go to logs only
            LOGGER.exception("unhandled job failure for %s", job_id)
            self._mark_failed(
                job_id,
                code="INTERNAL_ERROR",
                message="Unexpected analysis service error.",
                zh="分析服务遇到未预期的错误。",
                en="The analysis service encountered an unexpected error.",
                detail=str(exc),
            )
        finally:
            self._running_tasks.pop(job_id, None)
            self._cancel_flags.pop(job_id, None)

    async def _run_job(
        self,
        job_id: str,
        worker_index: int,
        cancel_flag: asyncio.Event,
    ) -> None:
        snapshot = self.store.load(job_id)
        if is_terminal(snapshot.status):
            return

        self.store.transition(
            job_id,
            AnalysisJobStatus.VALIDATING,
            updated_at=utc_now(),
            progress=AnalysisJobProgress(
                phase="validating",
                percent=10,
                message=f"worker {worker_index} validating inputs",
            ),
        )
        if cancel_flag.is_set():
            return

        workspace = self.store.workspace_for(job_id)
        self.store.transition(
            job_id,
            AnalysisJobStatus.RUNNING,
            updated_at=utc_now(),
            progress=AnalysisJobProgress(
                phase="running",
                percent=40,
                message=f"worker {worker_index} running adapter",
            ),
        )
        if cancel_flag.is_set():
            return

        adapter = resolve_adapter(snapshot.profile.value, self.settings, workspace)
        manifest = load_manifest(self.store.workspace_root, job_id)
        context = AdapterContext(
            job=self.store.load(job_id),
            workspace=workspace,
            parameters=dict(manifest.parameters),
        )
        result = await adapter.run(context)

        self.store.transition(
            job_id,
            AnalysisJobStatus.SUCCEEDED,
            updated_at=utc_now(),
            progress=AnalysisJobProgress(phase="succeeded", percent=100, message="done"),
            error=None,
            result=result,
        )

    def _mark_failed(
        self,
        job_id: str,
        *,
        code: str,
        message: str,
        zh: str,
        en: str,
        detail: str | None = None,
    ) -> None:
        snapshot = self.store.load(job_id)
        if is_terminal(snapshot.status):
            return
        LOGGER.error("job %s failed: %s %s", job_id, code, detail or message)
        self.store.transition(
            job_id,
            AnalysisJobStatus.FAILED,
            updated_at=utc_now(),
            progress=None,
            error=AnalysisJobError(
                code=code,
                message=message,
                safe_message=LocalizedText(zh=zh, en=en),
            ),
            result=None,
        )
