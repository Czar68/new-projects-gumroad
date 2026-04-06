#!/usr/bin/env node
/**
 * Validates outputs/props_ev_blueprint/selected_handoff.json: shape, determinism,
 * default selection rule vs inventory, idempotent selector runs.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const PRODUCT_ID = "props_ev_blueprint";
const OUTPUT_ROOT = path.join(process.cwd(), "outputs", PRODUCT_ID);
const INVENTORY_PATH = path.join(OUTPUT_ROOT, "listing_inventory.json");
const HANDOFF_PATH = path.join(OUTPUT_ROOT, "selected_handoff.json");
const SELECT_SCRIPT = path.join(process.cwd(), "scripts", "select_handoff_run.js");

const FORBIDDEN_KEY_NAMES = new Set([
  "createdAt",
  "generatedAt",
  "random",
  "timestamp",
  "updatedAt",
  "uuid",
]);

function die(msg) {
  process.stderr.write(String(msg) + "\n");
  process.exit(1);
}

function collectKeys(obj, acc) {
  if (obj === null || typeof obj !== "object") return;
  if (Array.isArray(obj)) {
    for (const item of obj) collectKeys(item, acc);
    return;
  }
  for (const k of Object.keys(obj)) {
    acc.add(k);
    collectKeys(obj[k], acc);
  }
}

function assertNoForbiddenKeys(obj) {
  const keys = new Set();
  collectKeys(obj, keys);
  for (const k of keys) {
    if (FORBIDDEN_KEY_NAMES.has(k)) die(`Forbidden key in handoff JSON: ${k}`);
  }
}

function assertSortedKeysAtLevel(obj, pathStr) {
  if (obj === null || typeof obj !== "object") return;
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => assertSortedKeysAtLevel(item, `${pathStr}[${i}]`));
    return;
  }
  const keys = Object.keys(obj);
  const sorted = keys.slice().sort();
  if (keys.join(",") !== sorted.join(",")) {
    die(`Object keys not lexicographically sorted at ${pathStr}`);
  }
  for (const k of keys) {
    assertSortedKeysAtLevel(obj[k], `${pathStr}.${k}`);
  }
}

function lexicographicGreatest(ids) {
  const s = ids.slice().sort((a, b) => a.localeCompare(b));
  return s[s.length - 1];
}

function expectedDefaultSelection(inv) {
  const ready = inv.runs.filter((r) => r.handoff_ready === true);
  if (ready.length === 0) return null;
  return lexicographicGreatest(ready.map((r) => r.run_id));
}

function sha256File(fp) {
  const h = crypto.createHash("sha256");
  h.update(fs.readFileSync(fp));
  return h.digest("hex");
}

function main() {
  if (!fs.existsSync(INVENTORY_PATH)) {
    die(`Missing ${INVENTORY_PATH}. Run: npm run listing:inventory`);
  }

  let inv;
  try {
    inv = JSON.parse(fs.readFileSync(INVENTORY_PATH, "utf8"));
  } catch (e) {
    die(`Invalid listing_inventory.json: ${e.message}`);
  }

  const expectedId = expectedDefaultSelection(inv);
  if (!expectedId) {
    die("No handoff_ready runs in inventory; cannot validate handoff selector.");
  }

  execFileSync(process.execPath, [SELECT_SCRIPT], { stdio: "inherit", cwd: process.cwd() });

  if (!fs.existsSync(HANDOFF_PATH)) die(`Missing ${HANDOFF_PATH}`);

  let handoff;
  try {
    handoff = JSON.parse(fs.readFileSync(HANDOFF_PATH, "utf8"));
  } catch (e) {
    die(`Invalid JSON in selected_handoff.json: ${e.message}`);
  }

  assertNoForbiddenKeys(handoff);
  assertSortedKeysAtLevel(handoff, "$");

  if (handoff.selection_rule !== "lexicographic_greatest_handoff_ready") {
    die(`Expected selection_rule lexicographic_greatest_handoff_ready, got ${handoff.selection_rule}`);
  }

  if (handoff.selected_run_id !== expectedId) {
    die(`Expected selected_run_id ${expectedId}, got ${handoff.selected_run_id}`);
  }

  if (handoff.handoff_ready !== true) die("Expected handoff_ready === true");

  const need = [
    "gumroad_listing_package_path",
    "handoff_ready",
    "listing_package_excerpt",
    "output_dir",
    "selected_run_id",
    "selection_rule",
  ];
  for (const k of need) {
    if (!(k in handoff)) die(`Missing field: ${k}`);
  }

  const pkgAbs = path.join(process.cwd(), handoff.gumroad_listing_package_path.split("/").join(path.sep));
  if (!fs.existsSync(pkgAbs)) die(`gumroad_listing_package_path does not exist: ${pkgAbs}`);

  const ex = handoff.listing_package_excerpt;
  if (!ex.gumroad || !ex.gumroad.title) die("listing_package_excerpt.gumroad.title required");
  if (!ex.pricing) die("listing_package_excerpt.pricing required");
  if (!ex.taxonomy) die("listing_package_excerpt.taxonomy required");
  if (!Array.isArray(ex.operator_checklist) || ex.operator_checklist.length === 0) {
    die("listing_package_excerpt.operator_checklist must be non-empty array");
  }
  if (!ex.deliverables || !Array.isArray(ex.deliverables.files)) {
    die("listing_package_excerpt.deliverables.files required");
  }

  const h1 = sha256File(HANDOFF_PATH);
  execFileSync(process.execPath, [SELECT_SCRIPT], { stdio: "inherit", cwd: process.cwd() });
  const h2 = sha256File(HANDOFF_PATH);
  if (h1 !== h2) die("handoff selector is not idempotent (hash changed on second run)");

  process.stdout.write("Handoff selector slice validation passed.\n");
}

main();
