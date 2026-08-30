from __future__ import annotations

import json
import sys
import time
import urllib.error
import urllib.request
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FIXTURES = ROOT / "validation" / "dual-input-modes" / "fixtures"
BASE_URL = "http://127.0.0.1:8000"


def request_json(url: str, *, data: bytes | None = None, content_type: str | None = None) -> dict:
    headers = {"Content-Type": content_type} if content_type else {}
    request = urllib.request.Request(url, data=data, headers=headers)
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def multipart(fields: dict[str, str], paths: list[Path]) -> tuple[bytes, str]:
    boundary = f"----BioCompare{uuid.uuid4().hex}"
    chunks: list[bytes] = []
    for name, value in fields.items():
        chunks.extend(
            [
                f"--{boundary}\r\n".encode(),
                f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode(),
                value.encode("utf-8"),
                b"\r\n",
            ]
        )
    for path in paths:
        chunks.extend(
            [
                f"--{boundary}\r\n".encode(),
                f'Content-Disposition: form-data; name="files"; filename="{path.name}"\r\n'.encode(),
                b"Content-Type: application/octet-stream\r\n\r\n",
                path.read_bytes(),
                b"\r\n",
            ]
        )
    chunks.append(f"--{boundary}--\r\n".encode())
    return b"".join(chunks), f"multipart/form-data; boundary={boundary}"


def submit(module_code: str) -> dict:
    paths = [
        FIXTURES / "sequence-reference-peptides.csv",
        FIXTURES / "sequence-candidate-peptides.csv",
        FIXTURES / "sequence-antibody.fasta",
    ]
    body, content_type = multipart(
        {
            "projectId": "biocompare",
            "moduleCode": module_code,
            "inputManifestJson": json.dumps(
                [
                    {"role": "reference", "lotId": "R01"},
                    {"role": "candidate", "lotId": "C01"},
                    {"role": "fasta"},
                ]
            ),
            "parametersJson": json.dumps({"qValueThreshold": 0.01}),
        },
        paths,
    )
    job_id = request_json(f"{BASE_URL}/api/jobs", data=body, content_type=content_type)["id"]

    for _ in range(120):
        status = request_json(f"{BASE_URL}/api/jobs/{job_id}")
        if status["status"] in {"completed", "failed", "quality-blocked"}:
            break
        time.sleep(0.5)
    else:
        raise RuntimeError(f"{module_code} timed out: {job_id}")

    if status["status"] != "completed":
        raise RuntimeError(json.dumps(status, ensure_ascii=False, indent=2))
    return {"jobId": job_id, "result": request_json(f"{BASE_URL}/api/jobs/{job_id}/result")}


if __name__ == "__main__":
    module = sys.argv[1] if len(sys.argv) > 1 else "SEQ-01"
    print(json.dumps(submit(module), ensure_ascii=False, indent=2))
