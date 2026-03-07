param([switch]$Force)
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
. "$PSScriptRoot\_auto_window.ps1"
if (-not (Test-AutoWindow -Force:$Force)) { Write-Output "Outside window. Use -Force."; exit 0 }
$ts = Get-Date -Format "yyyyMMdd-HHmmss"
New-Item -ItemType Directory -Force -Path "artifacts","artifacts\logs" | Out-Null
$ea = $ErrorActionPreference; $ErrorActionPreference = 'Continue'; git status --porcelain 2>$null | Out-File "artifacts\git_status_$ts.txt"; $ErrorActionPreference = $ea
if (Test-Path "package.json") {
  try { npm test --silent 2>&1 | Out-File "artifacts\logs\npm_test_$ts.out.txt" } catch { }
}
$report = "# Nightly Report ($ts)`n- Logs: artifacts\logs\`n- Next: docs\prompts\nightly_improvement.md"
$report | Out-File "artifacts\nightly_report_$ts.md" -Encoding utf8
