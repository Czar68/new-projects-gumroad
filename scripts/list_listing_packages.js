#!/usr/bin/env node
/**
 * Deterministic offline inventory: state/runs.jsonl → outputs/props_ev_blueprint/listing_inventory.json
 * Read-only; does not modify factory, compile, or run log behavior.
 */

const fs = require("fs");
const path = require("path");

const PRODUCT_ID = "props_ev_blueprint";
const OUTPUT_ROOT = path.join(process.cwd(), "outputs", PRODUCT_ID);
const RUNS_PATH = path.join(process.cwd(), "state", "runs.jsonl");
const ARTIFACT_REL = path.posix.join("outputs", PRODUCT_ID, "listing_inventory.json");

const MD_FILES = [
  "template_content.md",
  "listing.md",
  "marketing_campaign.md",
  "video_script.md",
  "photo_description.md",
];
const SNAPSHOT = "manifest.snapshot.json";
const LISTING_PKG = "gumroad_listing_package.json";

function sortKeysDeep(value) {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  const out = {};
  for (const k of Object.keys(value).sort()) {
    out[k] = sortKeysDeep(value[k]);
  }
  return out;
}

function stableJson(obj) {
  return JSON.stringify(sortKeysDeep(obj), null, 2) + "\n";
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
      /* skip bad lines */
    }
  }
  return out;
}

function posixRel(p) {
  return p.split(path.sep).join("/");
}

function fileExistsNonEmpty(fp) {
  try {
    const st = fs.statSync(fp);
    return st.isFile() && st.size > 0;
  } catch {
    return false;
  }
}

function readSnapshotProductId(runDir) {
  const fp = path.join(runDir, SNAPSHOT);
  if (!fileExistsNonEmpty(fp)) return null;
  try {
    const j = JSON.parse(fs.readFileSync(fp, "utf8"));
    return typeof j.productId === "string" ? j.productId : null;
  } catch {
    return null;
  }
}

function assessRun(record) {
  const runId = record.runId;
  const outputDirRel =
    typeof record.outputDir === "string" ? record.outputDir.split("/").join(path.sep) : "";
  const outputDirPosix = typeof record.outputDir === "string" ? record.outputDir.split(path.sep).join("/") : "";
  const runDir = path.join(process.cwd(), outputDirRel);

  const snapPath = path.join(runDir, SNAPSHOT);
  const manifestSnapshotExists = fs.existsSync(snapPath);

  let requiredFactoryFilesPresent = manifestSnapshotExists;
  if (!fileExistsNonEmpty(snapPath)) {
    requiredFactoryFilesPresent = false;
  }
  for (const name of MD_FILES) {
    if (!fileExistsNonEmpty(path.join(runDir, name))) {
      requiredFactoryFilesPresent = false;
      break;
    }
  }

  const listingPkgPath = path.join(runDir, LISTING_PKG);
  const gumroadListingPackageExists = fs.existsSync(listingPkgPath);
  const listingCompiled = gumroadListingPackageExists && fileExistsNonEmpty(listingPkgPath);

  const factoryValidatable = requiredFactoryFilesPresent;
  const handoffReady = factoryValidatable && listingCompiled;

  let manifestProductId = null;
  if (fs.existsSync(runDir)) {
    manifestProductId = readSnapshotProductId(runDir);
  }
  const productKey = manifestProductId !== null ? manifestProductId : record.productId || PRODUCT_ID;

  return {
    factory_validatable: factoryValidatable,
    gumroad_listing_package_exists: gumroadListingPackageExists,
    handoff_ready: handoffReady,
    listing_compiled: listingCompiled,
    manifest_snapshot_exists: manifestSnapshotExists,
    output_dir: outputDirPosix || posixRel(path.join("outputs", PRODUCT_ID, runId)),
    product_id: productKey,
    required_factory_files_exist: requiredFactoryFilesPresent,
    run_id: runId,
  };
}

function main() {
  const all = readAllRuns();
  const byRunId = new Map();
  for (const r of all) {
    if (r.productId !== PRODUCT_ID) continue;
    if (typeof r.runId !== "string" || r.runId.length === 0) continue;
    if (typeof r.outputDir !== "string" || r.outputDir.length === 0) continue;
    byRunId.set(r.runId, r);
  }

  const sortedIds = [...byRunId.keys()].sort((a, b) => a.localeCompare(b));
  const runs = sortedIds.map((id) => assessRun(byRunId.get(id)));

  const body = {
    artifact: path.posix.basename(ARTIFACT_REL),
    inventory_version: "1",
    ordering: "lexicographic_by_run_id",
    product_id: PRODUCT_ID,
    runs,
    script: "scripts/list_listing_packages.js",
  };

  fs.mkdirSync(OUTPUT_ROOT, { recursive: true });
  const outPath = path.join(OUTPUT_ROOT, "listing_inventory.json");
  fs.writeFileSync(outPath, stableJson(body), "utf8");

  process.stdout.write(`Listing inventory written: ${posixRel(path.relative(process.cwd(), outPath))}\n`);
  process.stdout.write(`Runs (props_ev_blueprint, from ${RUNS_PATH}): ${runs.length}\n`);
  const ready = runs.filter((x) => x.handoff_ready).length;
  process.stdout.write(`Handoff-ready: ${ready} / ${runs.length}\n`);
}

main();
