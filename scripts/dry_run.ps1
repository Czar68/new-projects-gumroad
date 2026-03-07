# Minimal dry run for npm run dry: ensure artifacts + last_run.json (contract for master_auto).
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
New-Item -ItemType Directory -Force -Path "artifacts" | Out-Null
$ts = Get-Date -Format "yyyyMMdd-HHmmss"
'{"flow":"new-projects","status":"dry_ok","ts":"' + $ts + '"}' | Out-File "artifacts\last_run.json" -Encoding utf8
Write-Output "Dry run OK. artifacts\last_run.json created."
exit 0
