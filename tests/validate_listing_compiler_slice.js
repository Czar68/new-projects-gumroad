#!/usr/bin/env node
/**
 * Validates gumroad_listing_package.json from the same run resolution as factory:validate.
 * Ensures shape, referenced files exist, determinism (no forbidden fields), idempotent compile.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const PRODUCT_ID = "props_ev_blueprint";
const OUTPUT_ROOT = path.join(process.cwd(), "outputs", PRODUCT_ID);
const RUNS_PATH = path.join(process.cwd(), "state", "runs.jsonl");
const ARTIFACT = "gumroad_listing_package.json";
const COMPILE_SCRIPT = path.join(process.cwd(), "scripts", "compile_listing_package.js");

const FORBIDDEN_KEY_NAMES = new Set(["createdAt", "generatedAt", "random", "timestamp", "updatedAt", "uuid"]);

function die(msg) {
  process.stderr.write(String(msg) + "\n");
  process.exit(1);
}

function readRunsLatest() {
  if (!fs.existsSync(RUNS_PATH)) return null;
  const raw = fs.readFileSync(RUNS_PATH, "utf8");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return null;
  try {
    return JSON.parse(lines[lines.length - 1]);
  } catch {
    return null;
  }
}

function listRunDirs() {
  if (!fs.existsSync(OUTPUT_ROOT)) return [];
  return fs
    .readdirSync(OUTPUT_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function resolveLatestRunDir() {
  const fromLog = readRunsLatest();
  if (fromLog && fromLog.productId === PRODUCT_ID && fromLog.outputDir) {
    const p = path.join(process.cwd(), fromLog.outputDir);
    if (fs.existsSync(p)) return { dir: p, runId: path.basename(p), source: "state/runs.jsonl" };
  }

  const dirs = listRunDirs();
  if (dirs.length === 0) {
    die(`No runs found under outputs/${PRODUCT_ID}/ and no valid ${RUNS_PATH} entry.`);
  }
  dirs.sort();
  const latest = dirs[dirs.length - 1];
  return { dir: path.join(OUTPUT_ROOT, latest), runId: latest, source: "directory sort (fallback)" };
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
    if (FORBIDDEN_KEY_NAMES.has(k)) {
      die(`Forbidden key in listing package JSON: ${k}`);
    }
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

function sha256File(fp) {
  const h = crypto.createHash("sha256");
  h.update(fs.readFileSync(fp));
  return h.digest("hex");
}

function main() {
  const { dir: runDir, runId, source } = resolveLatestRunDir();
  process.stdout.write(`Validating listing package for run: ${runDir}\n`);
  process.stdout.write(`Resolved via: ${source}\n`);

  const artifactPath = path.join(runDir, ARTIFACT);
  if (!fs.existsSync(artifactPath)) {
    die(`Missing ${artifactPath}. Run: npm run listing:compile`);
  }

  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  } catch (e) {
    die(`Invalid JSON in ${ARTIFACT}: ${e.message}`);
  }

  assertNoForbiddenKeys(pkg);
  assertSortedKeysAtLevel(pkg, "$");

  if (pkg.compiler.schemaVersion !== "1") die("Expected compiler.schemaVersion === \"1\"");

  if (!pkg.gumroad || !pkg.gumroad.title || !pkg.gumroad.shortDescription) {
    die("Missing gumroad.title or gumroad.shortDescription");
  }
  if (!pkg.gumroad.longDescriptionMarkdown || !pkg.gumroad.summaryPlain) {
    die("Missing gumroad.longDescriptionMarkdown or gumroad.summaryPlain");
  }

  if (!pkg.pricing || !pkg.pricing.placeholder) die("Expected pricing.placeholder === true");
  if (!pkg.taxonomy || !pkg.taxonomy.categoryPlaceholder) {
    die("Expected taxonomy.categoryPlaceholder === true");
  }

  if (!pkg.product || pkg.product.productId !== PRODUCT_ID) {
    die(`Expected product.productId === ${PRODUCT_ID}`);
  }

  if (!Array.isArray(pkg.operatorChecklist) || pkg.operatorChecklist.length === 0) {
    die("operatorChecklist must be a non-empty array");
  }

  const files = pkg.deliverables && pkg.deliverables.files;
  if (!Array.isArray(files) || files.length === 0) die("deliverables.files must be non-empty");

  for (const f of files) {
    if (!f.path) die("deliverables.files entry missing path");
    const fp = path.join(runDir, f.path);
    if (!fs.existsSync(fp)) die(`Referenced file missing on disk: ${fp}`);
  }

  const h1 = sha256File(artifactPath);
  execFileSync(process.execPath, [COMPILE_SCRIPT, "--run-id", runId], {
    stdio: "inherit",
    cwd: process.cwd(),
  });
  const h2 = sha256File(artifactPath);
  if (h1 !== h2) die("listing:compile is not idempotent (hash changed on second run)");

  process.stdout.write("Listing compiler slice validation passed.\n");
}

main();
