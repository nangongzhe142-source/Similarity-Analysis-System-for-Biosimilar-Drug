# Analysis service

FastAPI 后端，服务一级结构方法分析。默认端口 **8765**。网页经 Next.js `/api/analysis` 转发，不要求浏览器直连 8765。

范围、格式、版本与缺口以 [`docs/primary-structure-analysis/16-final-audit.md`](../docs/primary-structure-analysis/16-final-audit.md) 为准。本服务**不是** GxP / 21 CFR Part 11 系统。

## 运行

科学栈安装在仓库的 `tools-poc/.venv`（本目录无独立 venv）。PowerShell 5.1 用 `;` 分隔命令，不要用 `&&`。

```powershell
$venv = "..\tools-poc\.venv\Scripts"
$env:WORKSPACE_ROOT = "$PWD\workspaces"
$env:CORS_ORIGINS = "http://localhost:3000"
& "$venv\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8765
```

健康检查：`GET http://127.0.0.1:8765/health`

Docker Compose 项目名 `bsim-analysis`（避免与宿主 Dify 栈冲突）：

```powershell
docker compose up --build -d
```

## Adapter

| profile | 实现 | 说明 |
|---|---|---|
| `intact-mass` | `IntactMassAdapter` | pyOpenMS + UniDec |
| `ms1-coverage` | `Ms1CoverageAdapter` | 酶切 + MS1 ppm 匹配 |
| `msms-sequence` | `MsmsSequenceAdapter` | Comet 2024.01，FDR 1% |
| `peptide-map` | `PeptideMapAdapter` | TIC 叠加；verdict 固定 REVIEW |
| （全部上传为图片） | `ImageFallbackAdapter` | 按输入格式分派，不是独立 profile |

无 `free-thiol`、`disulfide-map`。`ANALYSIS_ALLOW_STUB_ADAPTER=true` 仅契约测试用。

厂商 RAW：镜像 `chambm/pwiz-skyline-i-agree-to-the-vendor-licenses`，容器内 `mywine msconvert --mzML`。本机已验证 Thermo RAW **作为独立 P6 步骤**；分析 adapter **不**调用 msconvert。上传 RAW/WIFF 会被拒绝，请先导出 mzML 或 TXT/CSV。WIFF 转换未验证。

中文工作区路径：原生工具输入须拷到 ASCII 临时目录（D22）。

## API (v1)

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | 存活 |
| POST | `/v1/jobs` | 创建任务（`autoStart` 可选） |
| POST | `/v1/jobs/{id}/upload/{role}` | 上传 candidate / reference / sequence |
| POST | `/v1/jobs/{id}/start` | 入队 |
| GET | `/v1/jobs/{id}` | 轮询快照 |
| DELETE | `/v1/jobs/{id}` | 取消 |
| GET | `/v1/jobs/{id}/artifacts/{file}` | 下载 PNG/CSV 等产物 |

任务状态：`workspaces/{jobId}/job.json`。`FAILED`（软件错误）与 `verdict = DIFFERENCE_DETECTED`（检出差异）不是同一件事。

## 测试

仓库根目录：

```powershell
npm run verify:primary-analysis
npm run check
```

本目录默认 pytest **排除** `integration`（Docker RAW 转换）：

```powershell
..\tools-poc\.venv\Scripts\python.exe -m pytest tests/ -q
..\tools-poc\.venv\Scripts\python.exe -m pytest tests/ -m integration
```
