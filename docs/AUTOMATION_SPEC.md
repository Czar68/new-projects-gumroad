# Automation spec (master_auto pattern)

**Applies to:** Current project (Props EV Blueprint), next project (E-commerce Profit & Pricing). Fits orchestration that runs nightly/weekly across multiple sheet products.

---

## Project type: `spreadsheet`

- **Artifacts:** Google Sheet (link), optional PDF playbook, PROPS_EV_SHEET_LINK.txt or equivalent.
- **No build step.** Validation = file checklist + optional data/formula checks.

---

## Pipeline steps (gumroad_loop.ps1)

| Step | Action |
|------|--------|
| **Audit** | List project; check README_SHIPPABLE, GUMROAD_LAUNCH_PLAN, sheet link file, PLAYBOOK/PDF, screenshots spec. Output: AUDIT_CURRENT_STATE or summary. |
| **Test** | Run tests/final_smoke_test.ps1. Fail blocks "package". |
| **Package** | Zip or list deliverables for Gumroad (PDF + link file + certified doc). Optional: version tag. |
| **Generate next** | If -GenerateNextOnly or weekly cron: ensure docs/NEXT_PROJECT_SPEC.md + data/example_data.csv + tests/golden_output* exist; optionally scaffold next product folder. |

---

## master_auto integration

- **rollout_template.ps1:** If master_auto calls a "rollout" script, this repo supports: (1) run smoke test, (2) report status (Gumroad checklist pass/fail). Template: `scripts/rollout_template.ps1` (stub) that invokes tests/final_smoke_test.ps1 and writes artifacts/daily_report.md.
- **daily_report.md:** Written by loop or rollout. Fields: project name, date, audit status, smoke pass/fail, Gumroad checklist items done/pending, next project spec name.

---

## Cron (weekly idea generation)

- **.cursor/automations/gumroad-idea.yaml:** Trigger weekly; run `scripts/gumroad_loop.ps1 -GenerateNextOnly` or full loop. Ensures next-project spec and starter data exist.

---

## Commands

- `npm run dry` — Smoke test + no publish (safe run).
- `npm run test` / `npm run smoke` — Final smoke test only.
- `npm run loop` — Full loop: audit → test → package → (optional) generate next.
- `npm run loop:audit` — Audit current only.
- `npm run loop:next` — Generate/refresh next project spec + data only.
