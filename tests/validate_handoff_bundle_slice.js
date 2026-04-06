#!/usr/bin/env node
/**
 * Validates outputs/props_ev_blueprint/handoff_bundle/: layout, determinism, idempotent bundler.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const PRODUCT_ID = "props_ev_blueprint";
const OUTPUT_ROOT = path.join(process.cwd(), "outputs", PRODUCT_ID);
const HANDOFF_PATH = path.join(OUTPUT_ROOT, "selected_handoff.json");
const BUNDLE_ROOT = path.join(OUTPUT_ROOT, "handoff_bundle");
const BUNDLE_SCRIPT = path.join(process.cwd(), "scripts", "build_handoff_bundle.js");

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
    if (FORBIDDEN_KEY_NAMES.has(k)) die(`Forbidden key in bundle JSON: ${k}`);
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

function listFilesSorted(relDir, baseRel) {
  const dir = path.join(relDir, baseRel);
  if (!fs.existsSync(dir)) return [];
  const names = fs.readdirSync(dir).sort((a, b) => a.localeCompare(b));
  const out = [];
  for (const name of names) {
    const full = path.join(dir, name);
    const rel = baseRel ? `${baseRel}/${name}` : name;
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      out.push(...listFilesSorted(relDir, rel));
    } else {
      out.push(rel.split(path.sep).join("/"));
    }
  }
  return out;
}

function hashBundleTree(bundleRoot) {
  const rels = listFilesSorted(bundleRoot, "").sort((a, b) => a.localeCompare(b));
  const h = crypto.createHash("sha256");
  for (const rel of rels) {
    const full = path.join(bundleRoot, ...rel.split("/"));
    h.update(rel);
    h.update("\0");
    h.update(fs.readFileSync(full));
    h.update("\0");
  }
  return h.digest("hex");
}

function main() {
  if (!fs.existsSync(HANDOFF_PATH)) {
    die(`Missing ${HANDOFF_PATH}. Run: npm run listing:handoff`);
  }

  execFileSync(process.execPath, [BUNDLE_SCRIPT], { stdio: "inherit", cwd: process.cwd() });

  const need = [
    "bundle_manifest.json",
    "deliverables",
    "gumroad_listing_package.json",
    "README.md",
    "selected_handoff.json",
  ];
  for (const name of need) {
    const p = path.join(BUNDLE_ROOT, name);
    if (!fs.existsSync(p)) die(`Missing bundle path: ${p}`);
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(path.join(BUNDLE_ROOT, "bundle_manifest.json"), "utf8"));
  } catch (e) {
    die(`Invalid bundle_manifest.json: ${e.message}`);
  }

  assertNoForbiddenKeys(manifest);
  assertSortedKeysAtLevel(manifest, "$");

  if (manifest.bundle_version !== "1") die('Expected bundle_version === "1"');
  if (manifest.product_id !== PRODUCT_ID) die(`Expected product_id ${PRODUCT_ID}`);
  if (!manifest.copy_policy || !manifest.copy_policy.deliverables) die("manifest.copy_policy.deliverables required");

  let handoff;
  try {
    handoff = JSON.parse(fs.readFileSync(HANDOFF_PATH, "utf8"));
  } catch (e) {
    die(`Invalid selected_handoff.json: ${e.message}`);
  }

  if (manifest.selected_run_id !== handoff.selected_run_id) {
    die(`manifest.selected_run_id !== selected_handoff.selected_run_id`);
  }

  if (!Array.isArray(manifest.deliverables)) die("manifest.deliverables must be an array");
  for (const d of manifest.deliverables) {
    const rel = d.bundle_relative_path;
    if (!rel) die("deliverable entry missing bundle_relative_path");
    const fp = path.join(BUNDLE_ROOT, rel.split("/").join(path.sep));
    if (!fs.existsSync(fp)) die(`Manifest lists missing file: ${rel}`);
  }

  const h1 = hashBundleTree(BUNDLE_ROOT);
  execFileSync(process.execPath, [BUNDLE_SCRIPT], { stdio: "inherit", cwd: process.cwd() });
  const h2 = hashBundleTree(BUNDLE_ROOT);
  if (h1 !== h2) die("handoff bundle is not idempotent (tree hash changed on second run)");

  process.stdout.write("Handoff bundle slice validation passed.\n");
}

main();
