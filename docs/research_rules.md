# Research rules (nightly flow)

1. **RESEARCH** — Use `research_log.md` + `projects.json` `backlog[0]`. Document findings in research_log.
2. **IMPLEMENT** — Change exactly one file (plus its test if any). No scope creep.
3. **VERIFY** — Run `scripts\verify_wiring.ps1`; must pass.
4. **FIXED** — In `artifacts/nightly_cursor_report.md` mark the backlog item and file as FIXED.
5. **STAGE** — `git add .`
6. **STOP** — Do not start the next backlog item.
