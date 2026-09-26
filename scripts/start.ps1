param([switch]$NoBrowser,[switch]$NoModel)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
if (-not (Test-Path '.venv/Scripts/python.exe') -or -not (Test-Path 'dist/index.html')) { throw 'Run ./scripts/setup.ps1 first.' }
if (Test-Path '.env') {
  foreach ($line in Get-Content -LiteralPath '.env') {
    if ($line -match '^([A-Z_]+)=(.*)$') { [Environment]::SetEnvironmentVariable($Matches[1],$Matches[2].Trim(),'Process') }
  }
}
New-Item -ItemType Directory -Force '.local' | Out-Null
$registry = Join-Path $projectRoot '.local/processes.json'
$owned = @()
if (Test-Path $registry) { $owned = @(Get-Content -LiteralPath $registry -Raw | ConvertFrom-Json) }
function Health($url) { try { return Invoke-RestMethod -Uri $url -TimeoutSec 2 } catch { return $null } }
function PortBusy($port) { return [bool](Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue) }
function Launch($name,$exe,$arguments) {
  $proc = Start-Process -FilePath $exe -ArgumentList $arguments -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $projectRoot ".local/$name.out.log") -RedirectStandardError (Join-Path $projectRoot ".local/$name.err.log")
  $script:owned += [pscustomobject]@{name=$name;pid=$proc.Id;startTicks=$proc.StartTime.ToUniversalTime().Ticks;root=$projectRoot}
  ConvertTo-Json -InputObject @($script:owned) | Set-Content -LiteralPath $registry
}
if (-not $NoModel) {
  $modelPath = if ($env:MODEL_PATH) { $env:MODEL_PATH } else { 'models/Qwen3-8B-Q5_K_M.gguf' }
  $runtime = if ($env:LLAMA_SERVER) { $env:LLAMA_SERVER } else { 'llama-server.exe' }
  $device = if ($env:MODEL_DEVICE) { $env:MODEL_DEVICE } else { 'Vulkan0' }
  if (-not (Health 'http://127.0.0.1:8080/health') -and -not (PortBusy 8080) -and (Test-Path $modelPath)) {
    if (Get-Command $runtime -ErrorAction SilentlyContinue) {
      $absoluteModel = (Resolve-Path -LiteralPath $modelPath).Path
      Launch 'model' $runtime @('-m',('"'+$absoluteModel+'"'),'--alias','Qwen3-8B-Q5_K_M','--host','127.0.0.1','--port','8080','--ctx-size','8192','--parallel','1','--gpu-layers','99','--device',$device,'--split-mode','none','--main-gpu','0','--reasoning','off','--cors-origins','http://127.0.0.1:8000','--no-webui')
    } else { Write-Warning 'llama-server is missing. Manual workflow remains available. See LOCAL_AI_SETUP.md.' }
  }
}
$backendHealth = Health 'http://127.0.0.1:8000/health'
if (-not $backendHealth) {
  if (PortBusy 8000) { throw 'Port 8000 is occupied by an unknown service. Stop it yourself or use another project configuration.' }
  Launch 'backend' (Join-Path $projectRoot '.venv/Scripts/python.exe') @('-m','uvicorn','backend.main:app','--host','127.0.0.1','--port','8000','--no-access-log')
} elseif ($backendHealth.service -ne 'packproof') { throw 'Port 8000 is not PackProof. It will not be terminated.' }
if (-not (PortBusy 4173)) {
  Launch 'frontend' (Join-Path $projectRoot '.venv/Scripts/python.exe') @('scripts/serve-offline.py','--no-browser')
} else {
  try { $page = Invoke-WebRequest 'http://127.0.0.1:4173' -TimeoutSec 3; if ($page.Content -notmatch 'PackProof') { throw 'wrong app' } }
  catch { throw 'Port 4173 is occupied by another service. It will not be terminated.' }
}
for ($i=0; $i -lt 30; $i++) {
  $status = Health 'http://127.0.0.1:8000/health'
  if ($status -and (PortBusy 4173)) { break }
  Start-Sleep -Milliseconds 500
}
if (-not $status) { throw 'Backend did not become healthy. Inspect .local/backend.err.log.' }
Write-Host ('PackProof running: http://127.0.0.1:4173/#/app | AI ready: ' + $status.aiReady)
Write-Host 'Pitch: http://127.0.0.1:4173/#/pitch | Model may still be loading. Refresh the app to update status.'
if (-not $NoBrowser) { Start-Process 'http://127.0.0.1:4173/#/app' }
