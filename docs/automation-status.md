# new-projects — Automation Status & Task Queue

Update after each run. Use for handoff and prioritization.

---

## Suggested initial safe tasks

1. **Create smoke tests for exports** — Add tests/smoke.test.js (or equivalent) that validates export output exists and is non-empty.
2. **Lint all JS** — Run lint across the repo; fix only safe issues; PR changes.
3. **Validate first Gumroad template** — Open template in target format (Excel/Sheets); document any errors.
4. **package.json audit** — Confirm scripts (dry, verify, nightly, status) and dependencies; document in README.

---

## Status row (for master_auto dashboard sync)

| Repo | Last Handoff | Status | Next Task | PRs Open |
|------|--------------|--------|-----------|----------|
| new-projects | [timestamp] | healthy / broken | [from above or handoff] | [#n] |
