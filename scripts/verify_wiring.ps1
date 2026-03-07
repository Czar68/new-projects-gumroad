param([ValidateSet("all","main")] [string]$Flow = "all")
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
function Assert-Path($p) { if (-not (Test-Path $p)) { throw "Missing: $p" } }
if ($Flow -in @("all","main")) { & "$PSScriptRoot\run_main.ps1" -DryRun; Assert-Path "artifacts\last_run.json" }
Write-Output "✅ verify_wiring passed for $Flow"
