# Nightly maintenance: PREP -> agent CLI (headless) -> verify + commit
# REQUIRE: Cursor CLI (winget install Cursor.CLI)
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

# CLI AGENT: headless coding (REQUIRE: winget install Cursor.CLI)
$outputPath = "artifacts\cursor_agent_output.md"
$logPath = "artifacts\agent_full.log"
$promptText = Get-Content $promptOut -Raw

# Force agent context for headless
$env:CURSOR_WORKSPACE_ROOT = (Get-Location).Path
$env:CURSOR_TRUST_WORKSPACE = "true"

# More robust flags: --verbose --debug + explicit model
Write-Host "Running: agent --trust --verbose --debug --print --output-format text --model claude-3.5-sonnet --output $outputPath [prompt: $($promptText.Length) chars]"
$agentOut = & agent --trust --verbose --debug --print --output-format text --model claude-3.5-sonnet --output $outputPath $promptText 2>&1
$agentOut | Out-File -FilePath $logPath -Append -Encoding utf8
$agentExit = $LASTEXITCODE

# Ensure cursor_agent_output.md ALWAYS exists (placeholder if agent failed)
if (-not (Test-Path $outputPath)) {
    $promptPreview = if ($promptText) { $promptText.Substring(0, [Math]::Min(200, $promptText.Length)) } else { "(no prompt)" }
    "Agent failed to write output. Exit code: $agentExit. Prompt used: $promptPreview. Check agent_full.log." | Out-File -FilePath $outputPath -Encoding utf8
}

# VERIFY + COMMIT
if (Test-Path $outputPath) {
    $content = Get-Content $outputPath -Raw -ErrorAction SilentlyContinue
    if ($content -and ($content -match "FIXED|complete")) {
        if (Test-Path "$PSScriptRoot\verify_wiring.ps1") {
            & "$PSScriptRoot\verify_wiring.ps1" -Flow all
        }
        git add .
        git commit -m "CLI Agent: FIXED backlog"
        Write-Output "✅ CLI agent complete: $(git log -1 --oneline)"
    } else {
        Write-Output "⚠️ CLI agent incomplete: $outputPath"
    }
} else {
    Write-Output "⚠️ CLI agent incomplete: $outputPath"
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
if (Test-Path $outputPath) { Write-Output "✅ CLI agent ran (output.md created)" }
if ($agentExit -ne 0) { Write-Output "⚠️ Agent exit code $agentExit (check agent_full.log)" }
Write-Output "OK Complete"
