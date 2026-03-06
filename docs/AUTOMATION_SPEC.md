# NEW-PROJECTS — Automation Spec (Template #2)

**Project:** new-projects (master_auto orchestration + selective runs)  
**Order in master plan:** 2 of 5  
**Repo:** new-projects

---

## 1. Repo structure (unified template)

```
├── package.json          # npm run pipeline
├── scripts/              # PowerShell
│   ├── nightly_maint.ps1
│   ├── dry_run.ps1       # Contract: artifacts/last_run.json
│   ├── run_selective.ps1 # master_auto exclude-self
│   └── run_research.ps1
├── data/                 # CSV/JSON (as needed)
├── artifacts/            # reports + QA
├── tests/                # CI + cloud agent
├── config/               # .env.example
└── docs/                 # README + RUN_GUIDE + this spec
```

---

## 2. Pipeline stages

| Stage | Script / command | Output contract |
|-------|------------------|-----------------|
| Dry run | `scripts/dry_run.ps1` | `artifacts/last_run.json` |
| Nightly | `scripts/nightly_maint.ps1 -Force` | `artifacts/chat_prompt.md`, exit 0 |
| Status | `scripts/run_selective.ps1 -Mode status` | master_status from master_auto |

**Template sync / run_subset:** Use master_auto `scripts/run_subset.ps1` and `scripts/auto_mode.ps1 -Subset` for selective runs across projects.

---

## 3. Cloud + local

- **Cloud:** Cursor Automations (PR, healthchecks). Secrets in GitHub Secrets.
- **Local:** master_auto → auto_mode.ps1 (10p–1:30a + 7a/noon/6p Mon–Fri); `-Force` / `-Weekend` override.

---

## 4. npm run pipeline

| Command | Purpose |
|---------|--------|
| `npm run dry` | dry_run.ps1 → last_run.json |
| `npm run verify` | run_selective -Mode status |
| `npm run nightly` | nightly_maint.ps1 -Force |
| `npm run status` | master_status |
| `npm run test` | dry_run.ps1 |

---

## 5. Master runner

From **master_auto:** `.\scripts\auto_mode.ps1 -Mode nightly -Force -Subset "new-projects"`  
From this repo: `.\scripts\run_selective.ps1 -Mode full -Force` (runs all other projects, excludes this one).
