# Research log

## backlog[0]: Fill 05-project-overview.mdc

**Source:** projects.json backlog[0]

**Research:**
- Entry scripts: scripts/run_main.ps1 (main), scripts/verify_wiring.ps1, scripts/nightly_maint.ps1, scripts/register_master.ps1
- Key artifacts: artifacts/last_run.json, artifacts/nightly_report_*.md
- Primary flow: run_main.ps1 (dry or full) → last_run.json; verify_wiring.ps1 asserts wiring
- Mission: Reusable baseline automation for new repos (cursor rules, scripts, nightly + master_auto registration)

**Implement:** Update .cursor/rules/05-project-overview.mdc with above.
