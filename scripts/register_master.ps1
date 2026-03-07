<#
.SYNOPSIS
  Registers this repo with master_auto using MainScript scripts\run_main.ps1
#>
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = (Get-Item $PSScriptRoot).Parent.FullName
$mainScript = "scripts\run_main.ps1"
$masterRoot = if ($env:MASTER_AUTO_ROOT) { $env:MASTER_AUTO_ROOT } else { "C:\dev\master_auto" }
$configPath = Join-Path $masterRoot "registered_projects.json"

if (-not (Test-Path $masterRoot)) {
  New-Item -ItemType Directory -Force -Path $masterRoot | Out-Null
}

$entry = @{
  ProjectPath = $repoRoot
  MainScript  = $mainScript
  Registered  = (Get-Date -Format "o")
}

$existing = @()
if (Test-Path $configPath) {
  try {
    $existing = Get-Content $configPath -Raw | ConvertFrom-Json
    if (-not ($existing -is [Array])) { $existing = @($existing) }
  } catch {
    $existing = @()
  }
}

$updated = $existing | Where-Object { $_.ProjectPath -ne $repoRoot }
$updated += $entry
$updated | ConvertTo-Json -Depth 3 | Set-Content $configPath -Encoding utf8

Write-Output "Registered with master_auto: $configPath"
Write-Output "  ProjectPath: $repoRoot"
Write-Output "  MainScript:  $mainScript"
