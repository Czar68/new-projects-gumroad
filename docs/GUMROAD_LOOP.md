# Gumroad loop — how to run

**Goal:** Finish current spreadsheet product → ship on Gumroad → generate and spec the next high-volume idea in a continuous loop.

---

## What the loop does

1. **Audit current project** — Check README_SHIPPABLE, launch plan, audit doc, sheet link file, tracking, Phase 10, screenshots spec, demo script. Writes summary to `artifacts/daily_report.md`.
2. **Test** — Run `tests/final_smoke_test.ps1`. Fail blocks "package."
3. **Package** — List deliverables for Gumroad (no zip by default).
4. **Generate next (optional)** — Ensure `docs/NEXT_PROJECT_SPEC.md`, `data/example_data.csv`, `tests/golden_output.csv` exist (next product: E-commerce Profit & Pricing).

---

## Commands (from repo root)

| Command | Action |
|---------|--------|
| `npm run dry` | Smoke test only (safe; no publish). |
| `npm run test` / `npm run smoke` | Same as dry; runs final_smoke_test.ps1. |
| `npm run loop` | Full loop: audit → smoke test → report → package list. |
| `npm run loop:audit` | Audit only; write daily_report.md. |
| `npm run loop:next` | Check next-project spec + data only. |

**PowerShell (no npm):**

```powershell
.\tests\final_smoke_test.ps1
.\scripts\gumroad_loop.ps1
.\scripts\gumroad_loop.ps1 -AuditOnly
.\scripts\gumroad_loop.ps1 -GenerateNextOnly
```

---

## Weekly automation

- **File:** `.cursor/automations/gumroad-idea.yaml`
- **Schedule:** Weekly (e.g. Sunday 22:00). Runs `npm run loop`.
- **Manual:** Run `npm run loop` or `npm run loop:next` anytime to refresh audit and next-project assets.

---

## After loop runs

- **artifacts/daily_report.md** — Current project status, smoke pass/fail, missing items, next project name.
- Use **docs/AUDIT_CURRENT_STATE.md** for full Gumroad checklist and final test steps.
- Use **docs/NEXT_PROJECT_SPEC.md** to build the next sheet (E-commerce Profit & Pricing).
