$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$registry = Join-Path $projectRoot '.local/processes.json'
if (-not (Test-Path $registry)) { Write-Host 'No project-owned processes recorded.'; return }
$owned = @(Get-Content -LiteralPath $registry -Raw | ConvertFrom-Json)
foreach ($item in $owned) {
  if ($item.root -ne $projectRoot) { continue }
  $proc = Get-Process -Id $item.pid -ErrorAction SilentlyContinue
  if ($proc -and $proc.StartTime.ToUniversalTime().Ticks -eq $item.startTicks) {
    # Descendants of the exact recorded process are also project-owned.
    $snapshot = @(Get-CimInstance Win32_Process)
    $descendants = @()
    $parents = @($item.pid)
    while ($parents.Count -gt 0) {
      $children = @($snapshot | Where-Object { $_.ParentProcessId -in $parents -and $_.CreationDate -ge $proc.StartTime })
      $descendants += $children
      $parents = @($children | ForEach-Object ProcessId)
    }
    [array]::Reverse($descendants)
    foreach ($child in $descendants) {
      $currentChild = Get-CimInstance Win32_Process -Filter "ProcessId=$($child.ProcessId)" -ErrorAction SilentlyContinue
      if ($currentChild -and $currentChild.CreationDate -eq $child.CreationDate) { Stop-Process -Id $child.ProcessId -ErrorAction SilentlyContinue }
    }
    Stop-Process -Id $item.pid -ErrorAction SilentlyContinue
    Write-Host "Stopped project service: $($item.name)"
  }
}
Remove-Item -LiteralPath $registry
