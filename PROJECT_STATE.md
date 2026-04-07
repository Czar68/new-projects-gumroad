# Project state

Baseline automation for Gumroad listing pipelines (`props_ev_blueprint`). Primary flows use `scripts/*.ps1` and npm scripts under `package.json`.

## Selected listing pricing decision (offline)

- **Export:** `npm run export:gumroad:selected-pricing-decision` — reads `outputs/props_ev_blueprint/selected_handoff.json` (or `handoff_bundle/selected_handoff.json`), loads the referenced `gumroad_listing_package.json`, writes `outputs/props_ev_blueprint/<run_id>/pricing-decision.json`.
- **Verify:** `npm run verify:gumroad:selected-pricing-decision` — validates shape, enums, price ordering, and non-empty reasons.

Requires a prior selected handoff (`npm run listing:handoff`) and compiled listing package on disk for that run.
