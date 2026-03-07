# Final smoke test — Props EV Blueprint (Gumroad shippable)
# Run from repo root: .\tests\final_smoke_test.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }
Set-Location $root

$fail = 0

# 1. Shippable docs exist
$docs = @(
    "README_SHIPPABLE.md",
    "docs\GUMROAD_LAUNCH_PLAN.md",
    "docs\AUDIT_CURRENT_STATE.md",
    "INSTRUCTIONS_TAB_CONTENT.md",
    "PROTECTION_STEPS.md",
    "SHEET_CERTIFIED_v1.1.md",
    "GUMROAD_UPSELL_COPY.md",
    "PRICING_TIERS.md",
    "PHASE10_FINAL_LOCKDOWN_AND_GUMROAD_LIVE.md"
)
foreach ($f in $docs) {
    if (-not (Test-Path $f)) { Write-Host "FAIL: missing $f"; $fail++ }
    else { Write-Host "OK: $f" }
}

# 2. Delivery assets (placeholders OK for smoke; user replaces with real)
if (-not (Test-Path "PROPS_EV_SHEET_LINK.txt")) { Write-Host "FAIL: missing PROPS_EV_SHEET_LINK.txt"; $fail++ }
else { Write-Host "OK: PROPS_EV_SHEET_LINK.txt" }
# PDF may not exist until user exports
if (Test-Path "Props-EV-Blueprint-Playbook.pdf") { Write-Host "OK: Playbook PDF present" }
else { Write-Host "SKIP: Playbook PDF (export when ready)" }

# 3. Launch + tracking
if (-not (Test-Path "DAY1_SALES_TRACKING.csv")) { Write-Host "FAIL: missing DAY1_SALES_TRACKING.csv"; $fail++ }
else { Write-Host "OK: DAY1_SALES_TRACKING.csv" }
if (-not (Test-Path "PHASE5_ACQUIRERS_AND_LAUNCH.md")) { Write-Host "FAIL: missing PHASE5_ACQUIRERS_AND_LAUNCH.md"; $fail++ }
else { Write-Host "OK: PHASE5_ACQUIRERS_AND_LAUNCH.md" }

# 4. Screenshots spec
if (-not (Test-Path "screenshots\README.md")) { Write-Host "FAIL: missing screenshots/README.md"; $fail++ }
else { Write-Host "OK: screenshots/README.md" }

# 5. Demo script
if (-not (Test-Path "demo\demo_video_script.md")) { Write-Host "FAIL: missing demo/demo_video_script.md"; $fail++ }
else { Write-Host "OK: demo/demo_video_script.md" }

if ($fail -gt 0) {
    Write-Host "`nSMOKE TEST FAILED: $fail missing item(s)"
    exit 1
}
Write-Host "`nSMOKE TEST PASSED - Gumroad checklist ready."
exit 0
