# Overnight auto mode

Run the full overnight flow (nightly maint + main + verify) regardless of time window:

```powershell
.\scripts\auto_mode.ps1 -Mode all -Force
```

- **nightly:** `nightly_maint.ps1` — git status snapshot, optional npm test, nightly report.
- **main:** `run_main.ps1` — writes `artifacts/last_run.json`.
- **verify:** `verify_wiring.ps1` — asserts wiring; must pass.

If `C:\dev\master_auto\scripts\master_auto.ps1` exists, `auto_mode.ps1` delegates to it with this project path.

**Single mode:** `-Mode nightly` or `-Mode main` or `-Mode verify` (each with `-Force` if outside the 22:00–13:30 window).
