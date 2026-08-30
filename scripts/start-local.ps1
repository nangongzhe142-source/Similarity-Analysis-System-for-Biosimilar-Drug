$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$CodexDependencies = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies"
$NodeDir = Join-Path $CodexDependencies "node\bin"
$Node = Join-Path $NodeDir "node.exe"
$Pnpm = Join-Path $CodexDependencies "bin\fallback\pnpm.cmd"
$Python = Join-Path $ProjectRoot ".venv\Scripts\python.exe"
$NextCli = Join-Path $ProjectRoot "node_modules\next\dist\bin\next"
$RuntimeDir = Join-Path $ProjectRoot ".runtime"
$EnvFile = Join-Path $ProjectRoot ".env.local"

if (-not (Test-Path -LiteralPath $Pnpm)) {
  throw "Workspace Node.js runtime was not found."
}
if (-not (Test-Path -LiteralPath $Python)) {
  throw "Project Python environment was not found. Run scripts\setup-local.ps1 first."
}
if (-not (Test-Path -LiteralPath $NextCli)) {
  throw "Next.js dependencies were not found. Run scripts\setup-local.ps1 first."
}

$env:Path = "$NodeDir;$env:Path"
$env:PYTHON_EXECUTABLE = $Python
$env:MPLCONFIGDIR = Join-Path $RuntimeDir "matplotlib"
if (Test-Path -LiteralPath $EnvFile) {
  foreach ($Line in Get-Content -LiteralPath $EnvFile) {
    $Trimmed = $Line.Trim()
    if (-not $Trimmed -or $Trimmed.StartsWith("#") -or -not $Trimmed.Contains("=")) { continue }
    $Name, $Value = $Trimmed.Split("=", 2)
    [Environment]::SetEnvironmentVariable($Name.Trim(), $Value.Trim(), "Process")
  }
}
Set-Location -LiteralPath $ProjectRoot
New-Item -ItemType Directory -Path $RuntimeDir -Force | Out-Null

$BackendOnline = $false
try {
  $Health = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -TimeoutSec 1
  $BackendOnline = $Health.status -eq "online"
} catch { }
if (-not $BackendOnline) {
  Start-Process -FilePath $Python -ArgumentList @("-m", "uvicorn", "backend.service:app", "--host", "127.0.0.1", "--port", "8000") -WorkingDirectory $ProjectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $RuntimeDir "backend.out.log") -RedirectStandardError (Join-Path $RuntimeDir "backend.err.log")
}

$FrontendOnline = $false
try {
  $Page = Invoke-WebRequest -Uri "http://127.0.0.1:3000" -UseBasicParsing -TimeoutSec 1
  $FrontendOnline = $Page.StatusCode -eq 200
} catch { }
if (-not $FrontendOnline) {
  Start-Process -FilePath $Node -ArgumentList @($NextCli, "dev", "--hostname", "127.0.0.1", "--port", "3000") -WorkingDirectory $ProjectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $RuntimeDir "frontend.out.log") -RedirectStandardError (Join-Path $RuntimeDir "frontend.err.log")
}

for ($Attempt = 0; $Attempt -lt 30; $Attempt++) {
  try {
    $Page = Invoke-WebRequest -Uri "http://127.0.0.1:3000" -UseBasicParsing -TimeoutSec 1
    $Health = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -TimeoutSec 1
    if ($Page.StatusCode -eq 200 -and $Health.status -eq "online") {
      Start-Process -FilePath "explorer.exe" -ArgumentList "http://localhost:3000"
      Write-Host "BioCompare is running at http://localhost:3000"
      exit 0
    }
  } catch { }
  Start-Sleep -Milliseconds 500
}

Write-Host "Startup did not finish in time. Check .runtime\frontend.err.log and .runtime\backend.err.log."
exit 1
