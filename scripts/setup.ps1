param([switch]$SkipBuild)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
if (Test-Path '.local/processes.json') {
  $services = @(Get-Content '.local/processes.json' -Raw | ConvertFrom-Json)
  foreach ($service in $services) {
    $running = Get-Process -Id $service.pid -ErrorAction SilentlyContinue
    if ($service.name -eq 'frontend' -and $running -and $running.StartTime.ToUniversalTime().Ticks -eq $service.startTicks) {
      throw 'PackProof is running. Run ./scripts/stop.ps1 before setup so Windows can replace dependency files.'
    }
  }
}
foreach ($command in @('node','npm.cmd','python')) {
  if (-not (Get-Command $command -ErrorAction SilentlyContinue)) { throw "Missing $command. Install Node.js 22 LTS and Python 3.12, then reopen PowerShell." }
}
$nodeMajor = [int]((& node --version).TrimStart('v').Split('.')[0])
if ($nodeMajor -lt 22) { throw 'Node.js 22 or newer is required.' }
& python -c "import sys; assert sys.version_info >= (3, 11), 'Python 3.11+ required'"
if ($LASTEXITCODE -ne 0) { throw 'Python 3.11 or newer is required; tested with 3.12.' }
if (-not (Test-Path '.venv/Scripts/python.exe')) { & python -m venv .venv }
& ./.venv/Scripts/python.exe -m pip install -r backend/requirements.txt
if ($LASTEXITCODE -ne 0) { throw 'Python dependency installation failed. Check internet access.' }
& npm.cmd ci --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { throw 'Frontend dependency installation failed.' }
if (-not (Test-Path '.env')) { Copy-Item -LiteralPath '.env.example' -Destination '.env' }
if (-not $SkipBuild) {
  & npm.cmd run build
  if ($LASTEXITCODE -ne 0) { throw 'Production build failed.' }
}
Write-Host 'Setup complete. Run ./scripts/start.ps1. See LOCAL_AI_SETUP.md for the optional model download.'
