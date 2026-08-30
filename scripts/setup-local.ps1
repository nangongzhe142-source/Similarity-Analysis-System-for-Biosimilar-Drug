$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$CodexDependencies = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies"
$Python = Join-Path $CodexDependencies "python\python.exe"
$NodeDir = Join-Path $CodexDependencies "node\bin"
$Pnpm = Join-Path $CodexDependencies "bin\fallback\pnpm.cmd"

$env:Path = "$NodeDir;$env:Path"
Set-Location -LiteralPath $ProjectRoot
if (-not (Test-Path -LiteralPath ".venv\Scripts\python.exe")) {
  & $Python -m venv .venv
}
& $Pnpm install
& ".venv\Scripts\python.exe" -m pip install --upgrade pip
& ".venv\Scripts\python.exe" -m pip install "unidec==8.2.1"
& ".venv\Scripts\python.exe" -m pip install "fastapi==0.135.1" "uvicorn==0.41.0" "python-multipart==0.0.22" "pypdf==6.1.1"
Write-Host "Setup complete. Run scripts\start-local.ps1 to start the system."
