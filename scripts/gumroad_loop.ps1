# Gumroad loop: audit current -> test -> package -> (optional) generate next
# Run from repo root: .\scripts\gumroad_loop.ps1 [-AuditOnly] [-GenerateNextOnly]

param(
    [switch]$AuditOnly,
    [switch]$GenerateNextOnly
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$reportPath = "artifacts\daily_report.md"
New-Item -ItemType Directory -Force -Path "artifacts" | Out-Null

function Get-AuditSummary {
    $current = "Props EV Blueprint v1.1"
    $checks = @(
        @{ Name = "README_SHIPPABLE.md"; Path = "README_SHIPPABLE.md" },
        @{ Name = "GUMROAD_LAUNCH_PLAN"; Path = "docs\GUMROAD_LAUNCH_PLAN.md" },
        @{ Name = "AUDIT_CURRENT_STATE"; Path = "docs\AUDIT_CURRENT_STATE.md" },
        @{ Name = "Sheet link file"; Path = "PROPS_EV_SHEET_LINK.txt" },
        @{ Name = "DAY1_SALES_TRACKING"; Path = "DAY1_SALES_TRACKING.csv" },
        @{ Name = "PHASE10"; Path = "PHASE10_FINAL_LOCKDOWN_AND_GUMROAD_LIVE.md" },
        @{ Name = "Screenshots spec"; Path = "screenshots\README.md" },
        @{ Name = "Demo script"; Path = "demo\demo_video_script.md" }
    )
    $ok = 0
    $missing = @()
    foreach ($c in $checks) {
        if (Test-Path $c.Path) {
            $ok++
        } else {
            $missing += $c.Name
        }
    }
    return @{
        Project = $current
        Pass    = $ok
        Total   = $checks.Count
        Missing = $missing
    }
}

function Write-DailyReport {
    param(
        $Audit,
        [bool]$SmokePass
    )

    $date = Get-Date -Format "yyyy-MM-dd HH:mm"
    $content = @"
# Daily report - Gumroad loop
**Generated:** $date

## Current project
- **Name:** $($Audit.Project)
- **Audit:** $($Audit.Pass)/$($Audit.Total) items present
- **Smoke test:** $(if ($SmokePass) { "PASS" } else { "FAIL" })
- **Missing:** $($Audit.Missing -join ", ")

## Next project
- **Spec:** docs/NEXT_PROJECT_SPEC.md (E-commerce Profit & Pricing)
- **Data:** data/example_data.csv, tests/golden_output.csv

## Gumroad checklist
- Sheet finalized (Instructions + protection): manual
- PDF playbook exported: manual
- Gumroad product live + test purchase: manual
- See docs/AUDIT_CURRENT_STATE.md for full checklist.
"@

    $content | Out-File -FilePath $reportPath -Encoding utf8
    Write-Host "Report: $reportPath"
}

#a Main
$audit = Get-AuditSummary
Write-Host "Audit: $($audit.Project) - $($audit.Pass)/$($audit.Total)"
if ($audit.Missing.Count -gt 0) {
    Write-Host "Missing: $($audit.Missing -join ', ')"
}

if ($GenerateNextOnly) {
    $nextChecks = @(
        "docs\NEXT_PROJECT_SPEC.md",
        "data\example_data.csv",
        "tests\golden_output.csv",
        "tests\golden_output_spec.md"
    )

    foreach ($f in $nextChecks) {
        if (Test-Path $f) {
            Write-Host "OK: $f"
        } else {
            Write-Host "MISSING: $f"
        }
    }

    Write-Host "Generate-next check done."
    exit 0
}

if ($AuditOnly) {
    Write-DailyReport -Audit $audit -SmokePass $false
    exit 0
}

# Run smoke test
& "$root\tests\final_smoke_test.ps1" 2>&1 | ForEach-Object { Write-Host $_ }
$smokeResult = $LASTEXITCODE

Write-DailyReport -Audit $audit -SmokePass ($smokeResult -eq 0)

if ($smokeResult -ne 0) {
    Write-Host "Loop FAIL: smoke test failed."
    exit 1
}

# Package: list deliverables (no zip by default)
Write-Host "Package (deliverables): README_SHIPPABLE.md, Playbook PDF, PROPS_EV_SHEET_LINK.txt, SHEET_CERTIFIED_v1.1.md, screenshots (see screenshots/README.md)."
Write-Host "Loop complete: audit + test passed."
exit 0