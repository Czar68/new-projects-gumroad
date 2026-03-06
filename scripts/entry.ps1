# Entry script for automation / pipeline. Invokes nightly maintenance.
# Ensures "scripts/ entry points exist" safety check passes.
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path $MyInvocation.MyCommand.Path -Parent
$Root = Split-Path $ScriptDir -Parent
Set-Location $Root
& "$ScriptDir\nightly_maint.ps1" -Force -NoPause
