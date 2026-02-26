# Nightly maintenance: PREP -> chat prompt (manual paste in Cursor) -> verify + commit
# Agent CLI headless is broken; use Cursor chat with artifacts/chat_prompt.md
param([switch]$Force)
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (Test-Path "$PSScriptRoot\_auto_window.ps1") {
    . "$PSScriptRoot\_auto_window.ps1"
    if (-not (Test-AutoWindow -Force:$Force)) { Write-Output "Outside window. Use -Force."; exit 0 }
}

$ts = Get-Date -Format "yyyyMMdd-HHmmss"
New-Item -ItemType Directory -Force -Path "artifacts","artifacts\logs" | Out-Null

# PREP: artifacts from master nightly (optional dry-run verify)
try {
    if (Test-Path "$PSScriptRoot\verify_wiring.ps1") {
        & "$PSScriptRoot\verify_wiring.ps1" -DryRun 2>$null
    }
} catch { }

$promptFile = "docs\prompts\nightly_improvement.md"
$prompt = if (Test-Path $promptFile) { Get-Content $promptFile -Raw -Encoding utf8 } else { "# Nightly improvement`nApply backlog fixes and document FIXED in nightly_cursor_report.md." }
$reportPath = "artifacts\nightly_cursor_report.md"
$researchPath = "artifacts\research_log.md"
$part1 = if (Test-Path $reportPath) { Get-Content $reportPath -Raw -Encoding utf8 -ErrorAction SilentlyContinue } else { "" }
$part2 = if (Test-Path $researchPath) { Get-Content $researchPath -Raw -Encoding utf8 -ErrorAction SilentlyContinue } else { "" }
$context = ($part1, $part2) -join "`n"
$fullPrompt = "$prompt`n`nCONTEXT:`n$context"

# Write prompt to file for agent (avoids escaping issues)
$promptOut = "artifacts\cursor_agent_prompt_$ts.txt"
Set-Content -Path $promptOut -Value $fullPrompt -Encoding utf8 -NoNewline

# Skip broken agent CLI → direct chat output
$outputPath = "artifacts\cursor_agent_output.md"
$chatPrompt = @"
BACKLOG TASK (auto-generated):

Read projects.json → backlog

Read artifacts/nightly_cursor_report.md

Read research_log.md

Make ONE concrete change (1 file max).

Run verify_wiring.ps1

If passes: FIXED: [backlog item]

Output ONLY: git commands to stage/commit.

STOP after 1 file + verify.
"@
$chatPrompt | Out-File -FilePath "artifacts\chat_prompt.md" -Encoding utf8
@{ status = "waiting_for_manual_chat"; promptFile = "artifacts/chat_prompt.md"; outputFile = "artifacts/cursor_agent_output.md" } | ConvertTo-Json | Set-Content -Path "artifacts\chat_completion_status.json" -Encoding utf8
Write-Host "OPEN Cursor chat and paste artifacts/chat_prompt.md"
Write-Host "Agent will write output to artifacts/cursor_agent_output.md manually"

# VERIFY + COMMIT (completion = output has FIXED|complete|research|done OR git has changes)
$content = if (Test-Path $outputPath) { Get-Content $outputPath -Raw -ErrorAction SilentlyContinue } else { "" }
$outputIndicatesDone = $content -and ($content -match "FIXED|complete|research|done")
$gitHasChanges = (git status --porcelain 2>$null) -match "\S"
if ($outputIndicatesDone -or $gitHasChanges) {
    if (Test-Path "$PSScriptRoot\verify_wiring.ps1") {
        & "$PSScriptRoot\verify_wiring.ps1" -Flow all
    }
    if ($gitHasChanges) {
        git add .
        git commit -m "Nightly: chat workflow backlog"
        Write-Output "✅ Chat workflow complete: $(git log -1 --oneline)"
    } else {
        Write-Output "✅ Output ready (no git changes to commit)"
    }
} else {
    Write-Output "⚠️ Waiting for manual chat: paste artifacts/chat_prompt.md → write $outputPath"
}

# AFTER ACTION WEBHOOK (idempotent)
try {
    $fixed = if (Test-Path artifacts\cursor_agent_output.md) { (Select-String -Path artifacts\cursor_agent_output.md -Pattern "FIXED" -AllMatches -ErrorAction SilentlyContinue).Matches.Count } else { 0 }
    if ($null -eq $fixed) { $fixed = 0 }
    $backlog_left = 0
    if (Test-Path "projects.json") { try { $j = Get-Content "projects.json" -Raw | ConvertFrom-Json; if ($j.backlog) { $backlog_left = $j.backlog.Count } } catch {} }
    $output_tail = (Get-Content artifacts\cursor_agent_output.md -Tail 5 -ErrorAction SilentlyContinue) -join "`n"
    $git_commits = try { (git log --oneline -5 2>$null) -join "`n" } catch { "No commits" }
    $report = @{
        timestamp   = (Get-Date -Format o)
        project     = (Split-Path (Get-Location) -Leaf)
        fixed       = $fixed
        backlog_left = $backlog_left
        output_tail = $output_tail
        git_commits = $git_commits
        webhook_reply_url = $env:WEBHOOK_REPLY_URL
    } | ConvertTo-Json -Compress
    Invoke-RestMethod -Uri "https://api.perplexity.ai/webhook/master-auto" -Method POST -Body $report -ContentType "application/json"
    $telegramScript = Join-Path (Split-Path $PSScriptRoot -Parent) "..\master_auto\scripts\telegram_bot.py"
    if ($env:TELEGRAM_TOKEN -and (Test-Path $telegramScript)) { try { & python $telegramScript (Split-Path (Get-Location) -Leaf) $fixed $backlog_left 2>$null } catch { } }
} catch { }

# Final summary (robust logging)
$projectName = Split-Path (Get-Location) -Leaf
Write-Output "=== $projectName ==="
try {
    if (Test-Path "$PSScriptRoot\verify_wiring.ps1") {
        & "$PSScriptRoot\verify_wiring.ps1" -Flow all 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) { Write-Output "✅ verify_wiring passed" }
    }
} catch { }
if (Test-Path $outputPath) { Write-Output "✅ cursor_agent_output.md present" }
else { Write-Output "⚠️ Paste artifacts/chat_prompt.md in Cursor chat → save output to $outputPath" }
Write-Output "OK Complete"
