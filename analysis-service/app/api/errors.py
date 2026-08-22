# -*- coding: utf-8 -*-
"""Safe API error responses — never leak server absolute paths."""

from __future__ import annotations

import logging
import re
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.jobs.state_machine import InvalidJobTransition
from app.jobs.store import JobNotFoundError
from app.models.analysis_contract import LocalizedText
from app.security.ingest import UploadRejectedError

LOGGER = logging.getLogger(__name__)

WINDOWS_ABS_PATH = re.compile(r"[A-Za-z]:\\(?:[^\"'\s]|\\.)+")
UNIX_ABS_PATH = re.compile(r"(?<![A-Za-z0-9_])/(?:tmp|var|app|home|Users)/(?:[^\"'\s]|/)+")


def sanitize_message(message: str) -> str:
    cleaned = WINDOWS_ABS_PATH.sub("<path>/", message)
    cleaned = UNIX_ABS_PATH.sub("<path>/", cleaned)
    return cleaned


def error_body(
    *,
    code: str,
    message: str,
    zh: str,
    en: str,
    status_code: int,
) -> dict[str, Any]:
    return {
        "error": {
            "code": code,
            "message": sanitize_message(message),
            "safeMessage": LocalizedText(zh=zh, en=en).model_dump(by_alias=True),
            "statusCode": status_code,
        }
    }


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(UploadRejectedError)
    async def upload_rejected(_request: Request, exc: UploadRejectedError) -> JSONResponse:
        return JSONResponse(
            status_code=400,
            content=error_body(
                code=exc.code,
                message=str(exc),
                zh="上传文件未通过安全校验。",
                en="The uploaded file failed security validation.",
                status_code=400,
            ),
        )

    @app.exception_handler(JobNotFoundError)
    async def job_not_found(_request: Request, exc: JobNotFoundError) -> JSONResponse:
        return JSONResponse(
            status_code=404,
            content=error_body(
                code="JOB_NOT_FOUND",
                message=f"Job not found: {exc}",
                zh="未找到该分析任务。",
                en="The requested analysis job was not found.",
                status_code=404,
            ),
        )

    @app.exception_handler(InvalidJobTransition)
    async def invalid_transition(
        _request: Request, exc: InvalidJobTransition
    ) -> JSONResponse:
        return JSONResponse(
            status_code=409,
            content=error_body(
                code="INVALID_JOB_TRANSITION",
                message=str(exc),
                zh="任务状态不允许该操作。",
                en="The job is not in a state that allows this operation.",
                status_code=409,
            ),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error(
        _request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content=error_body(
                code="VALIDATION_ERROR",
                message="Request validation failed.",
                zh="请求参数无效。",
                en="The request failed validation.",
                status_code=422,
            ),
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception(
        _request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content=error_body(
                code="HTTP_ERROR",
                message=sanitize_message(str(exc.detail)),
                zh="请求无法完成。",
                en="The request could not be completed.",
                status_code=exc.status_code,
            ),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception(_request: Request, exc: Exception) -> JSONResponse:
        LOGGER.exception("unhandled API error")
        return JSONResponse(
            status_code=500,
            content=error_body(
                code="INTERNAL_ERROR",
                message="Unexpected analysis service error.",
                zh="分析服务遇到未预期的错误。",
                en="The analysis service encountered an unexpected error.",
                status_code=500,
            ),
        )
