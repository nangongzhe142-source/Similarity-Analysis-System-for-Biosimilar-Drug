# -*- coding: utf-8 -*-
"""FastAPI application factory."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.errors import register_exception_handlers
from app.api.routes import router
from app.api.service import JobService
from app.config import Settings, get_settings
from app.jobs.queue import JobQueue
from app.jobs.store import JobStore


def create_app(settings: Settings | None = None) -> FastAPI:
    runtime_settings = settings or get_settings()
    store = JobStore(runtime_settings.workspace_root)
    queue = JobQueue(store, runtime_settings)
    service = JobService(store, queue)

    @asynccontextmanager
    async def lifespan(_app: FastAPI):
        queue.start()
        yield
        await queue.shutdown()

    app = FastAPI(
        title="Biosimilar Analysis Service",
        version="0.1.0",
        lifespan=lifespan,
        response_model_by_alias=True,
    )
    app.state.settings = runtime_settings
    app.state.job_store = store
    app.state.job_queue = queue
    app.state.job_service = service

    app.add_middleware(
        CORSMiddleware,
        allow_origins=runtime_settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)
    app.include_router(router)
    return app


app = create_app()
