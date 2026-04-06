#!/usr/bin/env node
/**
 * Validates outputs/props_ev_blueprint/listing_inventory.json: shape, determinism,
 * consistency with state/runs.jsonl, idempotent regeneration.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const PRODUCT_ID = "props_ev_blueprint";
const RUNS_PATH = path.join(process.cwd(), "state", "runs.jsonl");
const INVENTORY_PATH = path.join(process.cwd(), "outputs", PRODUCT_ID, "listing_inventory.json");
const LIST_SCRIPT = path.join(process.cwd(), "scripts", "list_listing_packages.js");

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
    if (FORBIDDEN_KEY_NAMES.has(k)) die(`Forbidden key in inventory JSON: ${k}`);
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

function readAllRuns() {
  if (!fs.existsSync(RUNS_PATH)) return [];
  const raw = fs.readFileSync(RUNS_PATH, "utf8");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const out = [];
  for (const line of lines) {
    try {
      out.push(JSON.parse(line));
    } catch {
      /* skip */
    }
  }
  return out;
}

function expectedRunIds() {
  const all = readAllRuns();
  const byRunId = new Map();
  for (const r of all) {
    if (r.productId !== PRODUCT_ID) continue;
    if (typeof r.runId !== "string" || r.runId.length === 0) continue;
    if (typeof r.outputDir !== "string" || r.outputDir.length === 0) continue;
    byRunId.set(r.runId, r);
  }
  return [...byRunId.keys()].sort((a, b) => a.localeCompare(b));
}

function sha256File(fp) {
  const h = crypto.createHash("sha256");
  h.update(fs.readFileSync(fp));
  return h.digest("hex");
}

function main() {
  execFileSync(process.execPath, [LIST_SCRIPT], { stdio: "inherit", cwd: process.cwd() });

  if (!fs.existsSync(INVENTORY_PATH)) die(`Missing ${INVENTORY_PATH}`);

  let inv;
  try {
    inv = JSON.parse(fs.readFileSync(INVENTORY_PATH, "utf8"));
  } catch (e) {
    die(`Invalid JSON in listing_inventory.json: ${e.message}`);
  }

  assertNoForbiddenKeys(inv);
  assertSortedKeysAtLevel(inv, "$");

  if (inv.inventory_version !== "1") die('Expected inventory_version === "1"');
  if (inv.product_id !== PRODUCT_ID) die(`Expected product_id === ${PRODUCT_ID}`);
  if (inv.ordering !== "lexicographic_by_run_id") die("Expected ordering === lexicographic_by_run_id");

  if (!Array.isArray(inv.runs)) die("Expected runs array");

  const expected = expectedRunIds();
  if (inv.runs.length !== expected.length) {
    die(`runs length ${inv.runs.length} !== expected from ${RUNS_PATH} (${expected.length})`);
  }

  for (let i = 0; i < expected.length; i++) {
    if (inv.runs[i].run_id !== expected[i]) {
      die(`runs[${i}].run_id out of order or mismatch: got ${inv.runs[i].run_id}, expected ${expected[i]}`);
    }
  }

  for (const r of inv.runs) {
    const need = [
      "factory_validatable",
      "gumroad_listing_package_exists",
      "handoff_ready",
      "listing_compiled",
      "manifest_snapshot_exists",
      "output_dir",
      "product_id",
      "required_factory_files_exist",
      "run_id",
    ];
    for (const k of need) {
      if (!(k in r)) die(`run entry missing field: ${k}`);
    }
    if (typeof r.handoff_ready !== "boolean") die("handoff_ready must be boolean");
    if (r.handoff_ready !== (r.factory_validatable && r.listing_compiled)) {
      die("handoff_ready must equal factory_validatable && listing_compiled");
    }
  }

  const h1 = sha256File(INVENTORY_PATH);
  execFileSync(process.execPath, [LIST_SCRIPT], { stdio: "inherit", cwd: process.cwd() });
  const h2 = sha256File(INVENTORY_PATH);
  if (h1 !== h2) die("listing inventory script is not idempotent (hash changed on second run)");

  process.stdout.write("Listing inventory slice validation passed.\n");
}

main();
