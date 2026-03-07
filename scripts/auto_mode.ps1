param(
  [ValidateSet("nightly","main","verify","all")] [string]$Mode = "nightly",
  [switch]$Force
)
$master = "C:\dev\master_auto\scripts\master_auto.ps1"
if (Test-Path $master) {
  & $master -Mode $Mode -Projects (Convert-Path ".") -Force:$Force
  exit $LASTEXITCODE
}
switch ($Mode) {
  "nightly" { & "$PSScriptRoot\nightly_maint.ps1" -Force:$Force }
  "main"    { & "$PSScriptRoot\run_main.ps1" -Force:$Force }
  "verify"  { & "$PSScriptRoot\verify_wiring.ps1" -Flow all }
  "all"     {
    & "$PSScriptRoot\nightly_maint.ps1" -Force:$Force
    & "$PSScriptRoot\run_main.ps1" -Force:$Force
    & "$PSScriptRoot\verify_wiring.ps1" -Flow all
  }
}
