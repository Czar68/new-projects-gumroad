# Project state

Baseline automation for Gumroad listing pipelines (`props_ev_blueprint`). Primary flows use `scripts/*.ps1` and npm scripts under `package.json`.

## Selected listing pricing decision (offline)

- **Export:** `npm run export:gumroad:selected-pricing-decision` — reads `outputs/props_ev_blueprint/selected_handoff.json` (or `handoff_bundle/selected_handoff.json`), loads the referenced `gumroad_listing_package.json`, writes `outputs/props_ev_blueprint/<run_id>/pricing-decision.json`.
- **Verify:** `npm run verify:gumroad:selected-pricing-decision` — validates shape, enums, price ordering, and non-empty reasons.

Requires a prior selected handoff (`npm run listing:handoff`) and compiled listing package on disk for that run.

## Publish queue (offline)

- **Export:** `npm run export:gumroad:publish-queue` — reads `outputs/props_ev_blueprint/listing_inventory.json`, each run’s `gumroad_listing_package.json` and `pricing-decision.json` when present, writes `outputs/props_ev_blueprint/publish_queue.json`.
- **Verify:** `npm run verify:gumroad:publish-queue` — validates shape, summary counts, ranks, band ordering, and pricing alignment when pricing artifacts exist.

Requires `npm run listing:inventory` first. Runs without `pricing-decision.json` are included with recommendation `hold` and penalized in ranking versus comparable runs that have pricing artifacts.

## Release gate (offline, rank 1)

- **Export:** `npm run export:gumroad:release-gate` — reads `outputs/props_ev_blueprint/publish_queue.json`, then the rank-1 run’s `gumroad_listing_package.json` and `pricing-decision.json` when present, writes `outputs/props_ev_blueprint/release_gate.json`.
- **Verify:** `npm run verify:gumroad:release-gate` — validates shape, gate status vs checks, and pricing null/integer rules.

Requires `npm run export:gumroad:publish-queue` first.

## Launch plan (offline, rank 1 from release gate)

- **Export:** `npm run export:gumroad:launch-plan` — reads `outputs/props_ev_blueprint/release_gate.json` and `outputs/props_ev_blueprint/publish_queue.json` (when present), loads the gated run’s `gumroad_listing_package.json` and `pricing-decision.json` when present, writes `outputs/props_ev_blueprint/launch_plan.json`.
- **Verify:** `npm run verify:gumroad:launch-plan` — validates shape, eligibility vs `approvedForManualPublish`, pricing integers, assets, and checklist rules.

Requires `npm run export:gumroad:release-gate` first (and a valid `publish_queue.json` if that file exists on disk).
