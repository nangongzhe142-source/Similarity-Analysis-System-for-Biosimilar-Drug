# -*- coding: utf-8 -*-
"""Export wire-format field manifests and JSON Schema for contract tests."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

from pydantic import BaseModel
from pydantic.fields import FieldInfo

SERVICE_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SERVICE_ROOT))

from app.models.analysis_contract import (  # noqa: E402
    CONTRACT_MODELS,
    AnalysisJobSnapshot,
    AnalysisResult,
)


def wire_name(field_name: str, field: FieldInfo) -> str:
    if field.alias is not None:
        return str(field.alias)
    return field_name


def field_kind(annotation: Any) -> str:
    origin = getattr(annotation, "__origin__", None)
    if origin is list:
        return "array"
    if origin is dict:
        return "object"
    if isinstance(annotation, type) and issubclass(annotation, BaseModel):
        return "object"
    if hasattr(annotation, "__members__"):
        return "enum"
    return "scalar"


def manifest_for(model: type[BaseModel]) -> dict[str, dict[str, Any]]:
    entries: dict[str, dict[str, Any]] = {}
    for name, field in model.model_fields.items():
        alias = wire_name(name, field)
        nested = None
        annotation = field.annotation
        origin = getattr(annotation, "__origin__", None)
        if origin is list:
            args = getattr(annotation, "__args__", ())
            if args and isinstance(args[0], type) and issubclass(args[0], BaseModel):
                nested = args[0].__name__
        elif isinstance(annotation, type) and issubclass(annotation, BaseModel):
            nested = annotation.__name__
        entries[alias] = {
            "pythonName": name,
            "required": field.is_required(),
            "kind": field_kind(annotation),
            "nested": nested,
        }
    return entries


def export_manifest() -> dict[str, dict[str, dict[str, Any]]]:
    return {model_name: manifest_for(model) for model_name, model in CONTRACT_MODELS.items()}


def export_schemas() -> dict[str, dict[str, Any]]:
    return {
        "analysisResult": AnalysisResult.model_json_schema(mode="serialization"),
        "analysisJobSnapshot": AnalysisJobSnapshot.model_json_schema(mode="serialization"),
    }


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print("usage: export_contract_schema.py manifest|schemas|write", file=sys.stderr)
        return 2

    command = argv[1]
    if command == "manifest":
        print(json.dumps(export_manifest(), indent=2, ensure_ascii=False))
        return 0

    if command == "schemas":
        print(json.dumps(export_schemas(), indent=2, ensure_ascii=False))
        return 0

    if command == "write":
        contracts_dir = SERVICE_ROOT / "contracts"
        contracts_dir.mkdir(parents=True, exist_ok=True)
        schemas = export_schemas()
        (contracts_dir / "analysis-result.schema.json").write_text(
            json.dumps(schemas["analysisResult"], indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
        (contracts_dir / "analysis-job-snapshot.schema.json").write_text(
            json.dumps(schemas["analysisJobSnapshot"], indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
        (contracts_dir / "field-manifest.json").write_text(
            json.dumps(export_manifest(), indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
        print(f"wrote 3 files under {contracts_dir}")
        return 0

    print(f"unknown command: {command}", file=sys.stderr)
    return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
