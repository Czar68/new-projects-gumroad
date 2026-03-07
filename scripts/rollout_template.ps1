# Rollout template — master_auto / orchestration entry point
# When master_auto runs "rollout" for this project: smoke test + daily report.
param([switch]$DryRun)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

New-Item -ItemType Directory -Force -Path "artifacts" | Out-Null

# 1. Run smoke test
$exitCode = 0
& "$root\tests\final_smoke_test.ps1" 2>&1 | Tee-Object -Variable smokeOut | Write-Host
$exitCode = $LASTEXITCODE

# 2. Run loop (audit + report)
& "$root\scripts\gumroad_loop.ps1" -AuditOnly 2>&1 | Write-Host

# 3. Output for master_auto
if ($DryRun) {
    Write-Output "Rollout dry run: smoke exit $exitCode; report in artifacts/daily_report.md"
}
if ($exitCode -ne 0) {
    exit 1
}
exit 0
