param([switch]$Force,[switch]$DryRun)
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
. "$PSScriptRoot\_auto_window.ps1"
if (-not (Test-AutoWindow -Force:$Force) -and -not $DryRun) { Write-Output "Outside window. Use -Force."; exit 0 }
$ts = Get-Date -Format "yyyyMMdd-HHmmss"
New-Item -ItemType Directory -Force -Path "artifacts","artifacts\logs" | Out-Null
if ($DryRun) { '{"flow":"main","status":"dry_run_ok","ts":"' + $ts + '"}' | Out-File "artifacts\last_run.json" -Encoding utf8; exit 0 }
# TODO: Replace with this repo's real run command(s)
'{"flow":"main","status":"ran","ts":"' + $ts + '"}' | Out-File "artifacts\last_run.json" -Encoding utf8
