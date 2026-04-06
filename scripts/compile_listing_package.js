#!/usr/bin/env node
/**
 * Deterministic offline compiler: validated factory run → Gumroad-ready listing package JSON.
 * Reads outputs under outputs/props_ev_blueprint/<run_id>/ (never raw manifests).
 */

const fs = require("fs");
const path = require("path");

const PRODUCT_ID = "props_ev_blueprint";
const OUTPUT_ROOT = path.join(process.cwd(), "outputs", PRODUCT_ID);
const RUNS_PATH = path.join(process.cwd(), "state", "runs.jsonl");
const ARTIFACT_NAME = "gumroad_listing_package.json";

const REQUIRED_SNAPSHOT_FIELDS = [
  "productId",
  "version",
  "title",
  "tagline",
  "description",
  "sheetUrl",
  "listingBullets",
];

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

function parseArgs() {
  const argv = process.argv.slice(2);
  let runId = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--run-id" && argv[i + 1]) {
      runId = argv[i + 1];
      i++;
      continue;
    }
    if (argv[i] === "--run-dir" && argv[i + 1]) {
      return { runDir: path.resolve(argv[i + 1]), runId: null, explicitDir: true };
    }
    if (argv[i] === "--help" || argv[i] === "-h") {
      process.stdout.write(
        "Usage: node scripts/compile_listing_package.js [--run-id <id> | --run-dir <path>]\n" +
          "Default: latest run from state/runs.jsonl, else lexicographically last directory under outputs/props_ev_blueprint/.\n"
      );
      process.exit(0);
    }
  }
  return { runId, runDir: null, explicitDir: false };
}

function resolveRunDir(parsed) {
  if (parsed.explicitDir && parsed.runDir) {
    if (!fs.existsSync(parsed.runDir)) die(`Missing run directory: ${parsed.runDir}`);
    return { dir: parsed.runDir, source: "--run-dir" };
  }

  if (parsed.runId) {
    const dir = path.join(OUTPUT_ROOT, parsed.runId);
    if (!fs.existsSync(dir)) die(`Missing run directory for --run-id: ${dir}`);
    return { dir, source: "--run-id" };
  }

  const fromLog = readRunsLatest();
  if (fromLog && fromLog.productId === PRODUCT_ID && fromLog.outputDir) {
    const p = path.join(process.cwd(), fromLog.outputDir);
    if (fs.existsSync(p)) return { dir: p, source: "state/runs.jsonl" };
  }

  const dirs = listRunDirs();
  if (dirs.length === 0) {
    die(`No runs found under outputs/${PRODUCT_ID}/ and no valid ${RUNS_PATH} entry.`);
  }
  dirs.sort();
  const latest = dirs[dirs.length - 1];
  return { dir: path.join(OUTPUT_ROOT, latest), source: "directory sort (fallback)" };
}

function assertSnapshot(m) {
  for (const k of REQUIRED_SNAPSHOT_FIELDS) {
    if (m[k] === undefined || m[k] === null) {
      die(`manifest.snapshot.json missing required field: ${k}`);
    }
  }
  if (m.productId !== PRODUCT_ID) {
    die(`Expected productId ${PRODUCT_ID}, got ${m.productId}`);
  }
  if (!Array.isArray(m.listingBullets) || m.listingBullets.length === 0) {
    die("manifest.snapshot.json listingBullets must be a non-empty array");
  }
}

function operatorChecklist(snapshot) {
  const lines = [
    "Choose Gumroad category and tags (not specified in manifest).",
    "Paste or upload deliverable files from this run folder as your product files if applicable.",
    "Proofread listing.md-derived long description in Gumroad editor.",
    "Set USD (or chosen) price in Gumroad; manifest has no price field.",
    "Upload a thumbnail/cover image aligned with photo_description.md.",
    `Verify blueprint link opens: ${snapshot.sheetUrl}`,
  ];
  return lines.slice().sort();
}

function deliverableFiles(runDir) {
  const names = [
    "listing.md",
    "manifest.snapshot.json",
    "marketing_campaign.md",
    "photo_description.md",
    "template_content.md",
    "video_script.md",
  ];
  const out = [];
  for (const n of names) {
    const fp = path.join(runDir, n);
    if (!fs.existsSync(fp)) {
      die(`Validated run missing expected file: ${fp}`);
    }
    out.push({
      path: n,
      role:
        n === "listing.md"
          ? "primary_listing_markdown"
          : n === "template_content.md"
            ? "customer_delivery_copy"
            : n === "manifest.snapshot.json"
              ? "manifest_snapshot"
              : "supporting_marketing_asset",
    });
  }
  return out;
}

function buildPackage(runDir, snapshot, listingMarkdown) {
  const slug = "props-ev-blueprint";
  const pricingNote =
    "Manifest does not include price; set price in Gumroad. Placeholder is deterministic from product version.";
  const taxonomyNote =
    "Manifest does not specify Gumroad category/type; pick manually. Placeholder is deterministic from product version.";

  return {
    compiler: {
      artifact: ARTIFACT_NAME,
      deterministicNote:
        "No wall-clock or random fields; stable key ordering; derived only from validated run files.",
      name: "scripts/compile_listing_package.js",
      schemaVersion: "1",
    },
    deliverables: {
      files: deliverableFiles(runDir),
    },
    gumroad: {
      longDescriptionMarkdown: listingMarkdown,
      shortDescription: snapshot.tagline,
      summaryPlain: snapshot.description,
      title: snapshot.title,
    },
    operatorChecklist: operatorChecklist(snapshot),
    pricing: {
      placeholder: true,
      suggestedUsd: `[PLACEHOLDER — set in Gumroad UI — product version ${snapshot.version}]`,
      note: pricingNote,
    },
    product: {
      productId: snapshot.productId,
      version: snapshot.version,
    },
    taxonomy: {
      categoryPlaceholder: true,
      slugHint: slug,
      note: taxonomyNote,
    },
  };
}

function main() {
  const parsed = parseArgs();
  const { dir: runDir, source } = resolveRunDir(parsed);

  const snapPath = path.join(runDir, "manifest.snapshot.json");
  const listingPath = path.join(runDir, "listing.md");
  if (!fs.existsSync(snapPath)) die(`Missing ${snapPath}`);
  if (!fs.existsSync(listingPath)) die(`Missing ${listingPath}`);

  let snapshot;
  try {
    snapshot = JSON.parse(fs.readFileSync(snapPath, "utf8"));
  } catch (e) {
    die(`Invalid JSON in manifest.snapshot.json: ${e.message}`);
  }

  assertSnapshot(snapshot);

  const listingMarkdown = fs.readFileSync(listingPath, "utf8");
  if (listingMarkdown.trim().length === 0) die("listing.md is empty");

  const body = buildPackage(runDir, snapshot, listingMarkdown);
  const outPath = path.join(runDir, ARTIFACT_NAME);
  fs.writeFileSync(outPath, stableJson(body), "utf8");

  process.stdout.write(`Listing package written: ${outPath}\n`);
  process.stdout.write(`Resolved run via: ${source}\n`);
}

main();
