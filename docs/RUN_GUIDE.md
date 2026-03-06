# New-Projects — Run Guide

```bash
npm run dry      # artifacts/last_run.json
npm run verify   # master status
npm run nightly  # nightly_maint.ps1 -Force
npm run status   # run_selective -Mode status
```

From **master_auto:** `.\scripts\auto_mode.ps1 -Mode nightly -Force -Subset "new-projects"`
