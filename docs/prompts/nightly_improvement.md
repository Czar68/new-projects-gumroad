# NIGHTLY IMPROVEMENT (Template)

- Read latest artifacts/nightly_report_*.md
- Fix 1–2 top issues, always with tests
- Run scripts/nightly_maint.ps1 -Force
- Run scripts/verify_wiring.ps1 -Flow all
- Write artifacts/nightly_cursor_report.md, stage changes
