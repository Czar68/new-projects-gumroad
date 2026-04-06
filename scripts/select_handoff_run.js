#!/usr/bin/env node
/**
 * Deterministic handoff selector: reads listing_inventory.json, picks one handoff_ready run,
 * writes outputs/props_ev_blueprint/selected_handoff.json (read-only; no run log changes).
 */

const fs = require("fs");
const path = require("path");

const PRODUCT_ID = "props_ev_blueprint";
const OUTPUT_ROOT = path.join(process.cwd(), "outputs", PRODUCT_ID);
const INVENTORY_PATH = path.join(OUTPUT_ROOT, "listing_inventory.json");
const LISTING_PKG = "gumroad_listing_package.json";
const HANDOFF_ARTIFACT = "selected_handoff.json";

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

function parseArgs() {
  const argv = process.argv.slice(2);
  let runId = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--run-id" && argv[i + 1]) {
      runId = argv[i + 1];
      i++;
      continue;
    }
    if (argv[i] === "--help" || argv[i] === "-h") {
      process.stdout.write(
        "Usage: node scripts/select_handoff_run.js [--run-id <run_id>]\n" +
          "Default: lexicographically greatest run_id among inventory runs with handoff_ready === true.\n" +
          "Requires outputs/props_ev_blueprint/listing_inventory.json (run listing:inventory first).\n"
      );
      process.exit(0);
    }
  }
  return { runId };
}

function readInventory() {
  if (!fs.existsSync(INVENTORY_PATH)) {
    die(`Missing inventory: ${INVENTORY_PATH}. Run: npm run listing:inventory`);
  }
  let inv;
  try {
    inv = JSON.parse(fs.readFileSync(INVENTORY_PATH, "utf8"));
  } catch (e) {
    die(`Invalid JSON in listing_inventory.json: ${e.message}`);
  }
  if (!Array.isArray(inv.runs)) die("listing_inventory.json: missing runs array");
  return inv;
}

function posixJoin(dir, file) {
  return `${dir.replace(/\\/g, "/")}/${file}`;
}

function lexicographicGreatest(runIds) {
  const s = runIds.slice().sort((a, b) => a.localeCompare(b));
  return s[s.length - 1];
}

function buildExcerpt(listingPkg) {
  return {
    deliverables: listingPkg.deliverables,
    gumroad: listingPkg.gumroad,
    operator_checklist: listingPkg.operatorChecklist,
    pricing: listingPkg.pricing,
    taxonomy: listingPkg.taxonomy,
  };
}

function main() {
  const { runId: explicitRunId } = parseArgs();
  const inv = readInventory();

  const ready = inv.runs.filter((r) => r.handoff_ready === true);
  if (ready.length === 0) {
    die("No handoff_ready runs in listing_inventory.json. Compile listing for a valid run first.");
  }

  let selected;
  let selectionRule;

  if (explicitRunId) {
    selected = inv.runs.find((r) => r.run_id === explicitRunId);
    if (!selected) {
      die(`--run-id not found in inventory: ${explicitRunId}`);
    }
    if (!selected.handoff_ready) {
      die(`Run is not handoff_ready: ${explicitRunId}`);
    }
    selectionRule = "explicit_run_id";
  } else {
    const ids = ready.map((r) => r.run_id);
    const greatest = lexicographicGreatest(ids);
    selected = ready.find((r) => r.run_id === greatest);
    selectionRule = "lexicographic_greatest_handoff_ready";
  }

  const outputDir = selected.output_dir.replace(/\\/g, "/");
  const pkgRel = posixJoin(outputDir, LISTING_PKG);
  const pkgAbs = path.join(process.cwd(), outputDir.split("/").join(path.sep), LISTING_PKG);

  if (!fs.existsSync(pkgAbs)) {
    die(`gumroad_listing_package.json missing at ${pkgAbs}`);
  }

  let listingPkg;
  try {
    listingPkg = JSON.parse(fs.readFileSync(pkgAbs, "utf8"));
  } catch (e) {
    die(`Invalid JSON in ${pkgRel}: ${e.message}`);
  }

  const body = {
    gumroad_listing_package_path: pkgRel,
    handoff_ready: true,
    listing_package_excerpt: buildExcerpt(listingPkg),
    output_dir: outputDir,
    selected_run_id: selected.run_id,
    selection_rule: selectionRule,
  };

  fs.mkdirSync(OUTPUT_ROOT, { recursive: true });
  const outPath = path.join(OUTPUT_ROOT, HANDOFF_ARTIFACT);
  fs.writeFileSync(outPath, stableJson(body), "utf8");

  const relOut = path.relative(process.cwd(), outPath).split(path.sep).join("/");
  process.stdout.write(`Handoff summary written: ${relOut}\n`);
  process.stdout.write(`Selected run: ${selected.run_id} (${selectionRule})\n`);
}

main();
