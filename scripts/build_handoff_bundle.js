#!/usr/bin/env node
/**
 * Deterministic handoff bundle: reads selected_handoff.json, copies listing package +
 * deliverables into outputs/props_ev_blueprint/handoff_bundle/ for one selected run.
 */

const fs = require("fs");
const path = require("path");

const PRODUCT_ID = "props_ev_blueprint";
const OUTPUT_ROOT = path.join(process.cwd(), "outputs", PRODUCT_ID);
const HANDOFF_JSON = "selected_handoff.json";
const LISTING_PKG_NAME = "gumroad_listing_package.json";
const BUNDLE_DIR_NAME = "handoff_bundle";
const MANIFEST_NAME = "bundle_manifest.json";
const README_NAME = "README.md";
const DELIVERABLES_DIR = "deliverables";

function die(msg) {
  process.stderr.write(String(msg) + "\n");
  process.exit(1);
}

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

function posixRel(p) {
  return p.split(path.sep).join("/");
}

function resolveSafeUnderRunDir(runDirAbs, relPosix) {
  const normalized = String(relPosix).replace(/\\/g, "/").replace(/^\/+/, "");
  if (normalized.includes("..")) {
    die(`Deliverable path must not contain '..': ${relPosix}`);
  }
  const abs = path.resolve(runDirAbs, ...normalized.split("/").filter(Boolean));
  const runResolved = path.resolve(runDirAbs);
  const rel = path.relative(runResolved, abs);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    die(`Deliverable path escapes run directory: ${relPosix}`);
  }
  return abs;
}

function parseArgs() {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(
      "Usage: node scripts/build_handoff_bundle.js\n" +
        "Reads outputs/props_ev_blueprint/selected_handoff.json and writes " +
        "outputs/props_ev_blueprint/handoff_bundle/ (single stable directory).\n"
    );
    process.exit(0);
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFileTo(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function main() {
  parseArgs();

  const handoffPath = path.join(OUTPUT_ROOT, HANDOFF_JSON);
  if (!fs.existsSync(handoffPath)) {
    die(`Missing ${posixRel(path.relative(process.cwd(), handoffPath))}. Run: npm run listing:handoff`);
  }

  let handoff;
  try {
    handoff = JSON.parse(fs.readFileSync(handoffPath, "utf8"));
  } catch (e) {
    die(`Invalid JSON in ${HANDOFF_JSON}: ${e.message}`);
  }

  if (!handoff.selected_run_id || typeof handoff.output_dir !== "string") {
    die(`${HANDOFF_JSON}: missing selected_run_id or output_dir`);
  }

  const pkgRel = handoff.gumroad_listing_package_path;
  if (!pkgRel || typeof pkgRel !== "string") {
    die(`${HANDOFF_JSON}: missing gumroad_listing_package_path`);
  }

  const pkgAbs = path.join(process.cwd(), pkgRel.split("/").join(path.sep));
  if (!fs.existsSync(pkgAbs)) {
    die(`Listing package missing: ${pkgRel}`);
  }

  let listingPkg;
  try {
    listingPkg = JSON.parse(fs.readFileSync(pkgAbs, "utf8"));
  } catch (e) {
    die(`Invalid JSON in listing package: ${e.message}`);
  }

  const runDirAbs = path.join(process.cwd(), handoff.output_dir.split("/").join(path.sep));
  if (!fs.existsSync(runDirAbs)) {
    die(`Run output directory missing: ${handoff.output_dir}`);
  }

  const files = listingPkg.deliverables && Array.isArray(listingPkg.deliverables.files)
    ? listingPkg.deliverables.files.slice()
    : [];
  files.sort((a, b) => String(a.path).localeCompare(String(b.path)));

  const deliverableEntries = [];
  for (const entry of files) {
    if (!entry || typeof entry.path !== "string") {
      die("deliverables.files entry missing path");
    }
    const srcAbs = resolveSafeUnderRunDir(runDirAbs, entry.path);
    if (!fs.existsSync(srcAbs)) {
      die(`Required deliverable file missing on disk: ${entry.path} (expected under ${handoff.output_dir})`);
    }
    const destRelPosix = posixRel(path.join(DELIVERABLES_DIR, entry.path.replace(/\\/g, "/")));
    deliverableEntries.push({
      bundle_relative_path: destRelPosix,
      role: entry.role != null ? entry.role : null,
      source_relative_to_run: entry.path.replace(/\\/g, "/"),
    });
  }

  const bundleRoot = path.join(OUTPUT_ROOT, BUNDLE_DIR_NAME);
  fs.rmSync(bundleRoot, { recursive: true, force: true });
  ensureDir(path.join(bundleRoot, DELIVERABLES_DIR));

  for (const entry of files) {
    const srcAbs = resolveSafeUnderRunDir(runDirAbs, entry.path);
    const destUnderBundle = path.join(bundleRoot, DELIVERABLES_DIR, ...entry.path.split("/").filter(Boolean));
    copyFileTo(srcAbs, destUnderBundle);
  }

  copyFileTo(handoffPath, path.join(bundleRoot, HANDOFF_JSON));
  copyFileTo(pkgAbs, path.join(bundleRoot, LISTING_PKG_NAME));

  const manifestBody = {
    bundle_version: "1",
    copy_policy: {
      deliverables:
        "copy_all_paths_listed_in_gumroad_listing_package_deliverables_files_from_run_output_dir_or_fail_if_missing",
    },
    deliverables: deliverableEntries,
    gumroad_listing_package_file: LISTING_PKG_NAME,
    product_id: PRODUCT_ID,
    selected_handoff_file: HANDOFF_JSON,
    selected_run_id: handoff.selected_run_id,
  };

  fs.writeFileSync(path.join(bundleRoot, MANIFEST_NAME), stableJson(manifestBody), "utf8");

  const title =
    listingPkg.gumroad && listingPkg.gumroad.title ? listingPkg.gumroad.title : PRODUCT_ID;
  const checklist = Array.isArray(listingPkg.operatorChecklist) ? listingPkg.operatorChecklist : [];

  const readmeLines = [];
  readmeLines.push(`# Handoff bundle: ${title}`);
  readmeLines.push("");
  readmeLines.push("## Selected run");
  readmeLines.push("");
  readmeLines.push(`- run_id: ${handoff.selected_run_id}`);
  readmeLines.push(`- source output_dir: ${handoff.output_dir}`);
  readmeLines.push("");
  readmeLines.push("## Manual Gumroad entry checklist");
  readmeLines.push("");
  for (let i = 0; i < checklist.length; i++) {
    readmeLines.push(`${i + 1}. ${checklist[i]}`);
  }
  readmeLines.push("");
  readmeLines.push("## Bundle layout");
  readmeLines.push("");
  readmeLines.push(`- ${HANDOFF_JSON} — selection summary (copy of repo artifact).`);
  readmeLines.push(`- ${LISTING_PKG_NAME} — compiled listing package for this run.`);
  readmeLines.push(`- ${MANIFEST_NAME} — deterministic manifest (paths, copy policy).`);
  readmeLines.push(`- ${DELIVERABLES_DIR}/ — copies of deliverable files from the run folder.`);
  readmeLines.push("");

  fs.writeFileSync(path.join(bundleRoot, README_NAME), readmeLines.join("\n") + "\n", "utf8");

  const relBundle = posixRel(path.relative(process.cwd(), bundleRoot));
  process.stdout.write(`Handoff bundle written: ${relBundle}/\n`);
  process.stdout.write(`Run: ${handoff.selected_run_id}\n`);
}

main();
