# Self-Documenting Project State

Single source of truth for current objective, pipeline, recent changes, dependencies, and next steps. **Update this file whenever you (Cursor) perform a major refactor or complete a task.**

---

## CURRENT_OBJECTIVE

Reusable baseline automation for new repos (cursor rules, scripts, master_auto registration) and Props EV Blueprint Gumroad product. Current focus: keep wiring verified (run_main.ps1 / verify_wiring.ps1), complete Gumroad launch checklist (sheet finalization, PDF, product page, test purchase).

---

## PIPELINE_STATUS

| Source | Summary |
|--------|--------|
| **artifacts/last_run.json** | `flow`: main, `status`: dry_run_ok, last run timestamp in file. |
| **Verification** | Run `scripts/verify_wiring.ps1` to assert last_run.json; do not claim "functional" or "wired" until it passes. |

---

## FILES_MODIFIED

*(Last 3–5 major files refactored or central to recent work. Replace with actual list after each significant change.)*

1. **docs/PROJECT_STATE.md** — Created; Self-Documenting State (this file).
2. **.cursor/rules/07-project-state.mdc** — Created; rule to update PROJECT_STATE after major refactors.
3. **scripts/run_main.ps1** — Main entry; writes artifacts/last_run.json (DryRun or full).
4. **scripts/verify_wiring.ps1** — Asserts artifacts/last_run.json.
5. **.cursor/rules/** — 00-global, 05-project-overview, 10-nightly, 07-project-state.

---

## CRITICAL_DEPENDENCIES

| Type | Item | Notes |
|------|------|--------|
| **Env** | `MASTER_AUTO_ROOT` | Optional; default `C:\dev\master_auto` for register_master.ps1. |
| **Env** | `CURSOR_API_KEY` | Required for install_cli.ps1 (cursor.com/settings); store in .env. |
| **Env** | `USERPROFILE`, `TEMP` | Used by install_cli.ps1 for CLI path and zip extract. |
| **Artifacts** | `artifacts/last_run.json` | Must exist and match expected shape for verify_wiring.ps1. |
| **Sheet schema** | Props EV columns A–K | Fair %, Line, Odds, Implied Prob, Edge%, EV%, Kelly, Recommendation (K), Notes; Dashboard uses column K; protect formula columns. No 36-column requirement in this repo. |

---

## TODO

*(Immediate next logical steps. Replace after each run or task.)*

1. Run `scripts/verify_wiring.ps1` after any change that affects main flow or artifacts.
2. Complete Gumroad launch: sheet Instructions tab, protection A1:K52, PDF export, product page, test purchase.
3. On each major refactor or task completion: update this file (CURRENT_OBJECTIVE, FILES_MODIFIED, TODO, PIPELINE_STATUS as needed) per .cursor/rules/07-project-state.mdc.
