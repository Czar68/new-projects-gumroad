#!/usr/bin/env node
/**
 * CLI: deterministic observed-vs-baseline comparison for one run folder.
 * Reads launch_plan.json and post_launch_baseline.json from the product output root (parent of the run directory by default).
 * Writes outputs/props_ev_blueprint/<run_id>/observed-vs-baseline.json
 */

const fs = require("fs");
const path = require("path");
const { loadObservedLaunchFromFile, posixRel } = require("./observed_launch_loader.js");
const { compareObservedVsBaseline, stableJson, normTitle, launchPlanFields } = require("./compare_observed_vs_baseline_core.js");

const PRODUCT_ID = "props_ev_blueprint";
const DEFAULT_PRODUCT_ROOT = path.join(process.cwd(), "outputs", PRODUCT_ID);

const ARTIFACT_NAME = "observed-vs-baseline.json";

function die(msg) {
  process.stderr.write(String(msg) + "\n");
  process.exit(1);
}

function parseArgs(argv) {
  let runId = null;
  let runDir = null;
  let observedPath = null;
  let productRoot = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--run-id" && argv[i + 1]) {
      runId = argv[++i];
    } else if (a === "--run-dir" && argv[i + 1]) {
      runDir = argv[++i];
    } else if (a === "--observed" && argv[i + 1]) {
      observedPath = argv[++i];
    } else if (a === "--product-root" && argv[i + 1]) {
      productRoot = argv[++i];
    } else if (a === "--help" || a === "-h") {
      process.stdout.write(
        "Usage: node scripts/compare-observed-vs-baseline.js --observed <path/to/observed.json> (--run-dir <dir> | --run-id <id>) [--product-root <dir>]\n" +
          "  Resolves launch_plan.json and post_launch_baseline.json under product root (default: outputs/props_ev_blueprint).\n" +
          "  Writes observed-vs-baseline.json into the run directory.\n",
      );
      process.exit(0);
    }
  }
  if (!observedPath) {
    die("Missing required --observed <path>");
  }
  if (!runDir && runId) {
    runDir = path.join(DEFAULT_PRODUCT_ROOT, runId);
  }
  if (!runDir) {
    die("Provide --run-dir <path/to/run/folder> or --run-id <runId>");
  }
  const runDirAbs = path.resolve(runDir);
  if (!productRoot) {
    productRoot = path.resolve(runDirAbs, "..");
  } else {
    productRoot = path.resolve(productRoot);
  }
  return { observedPath: path.resolve(observedPath), runDirAbs, productRoot };
}

function main() {
  const { observedPath, runDirAbs, productRoot } = parseArgs(process.argv.slice(2));

  const observed = loadObservedLaunchFromFile(observedPath);

  const launchPlanPath = path.join(productRoot, "launch_plan.json");
  const baselinePath = path.join(productRoot, "post_launch_baseline.json");

  if (!fs.existsSync(launchPlanPath)) {
    die(`Missing ${posixRel(path.relative(process.cwd(), launchPlanPath))}. Run: npm run export:gumroad:launch-plan`);
  }
  if (!fs.existsSync(baselinePath)) {
    die(`Missing ${posixRel(path.relative(process.cwd(), baselinePath))}. Run: npm run export:gumroad:post-launch-baseline`);
  }

  let launchPlanDoc;
  let baselineDoc;
  try {
    launchPlanDoc = JSON.parse(fs.readFileSync(launchPlanPath, "utf8"));
  } catch (e) {
    die(`Invalid JSON in launch_plan.json: ${/** @type {Error} */ (e).message}`);
  }
  try {
    baselineDoc = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  } catch (e) {
    die(`Invalid JSON in post_launch_baseline.json: ${/** @type {Error} */ (e).message}`);
  }

  const lp = launchPlanFields(launchPlanDoc);
  if (lp.runId && lp.runId !== observed.runId) {
    die(`Observed runId (${observed.runId}) does not match ${posixRel(path.relative(process.cwd(), launchPlanPath))} run.runId (${lp.runId}).`);
  }
  if (lp.listingSlug && lp.listingSlug !== observed.listingKey) {
    die(
      `Observed listingKey (${observed.listingKey}) does not match ${posixRel(path.relative(process.cwd(), launchPlanPath))} run.listingSlug (${lp.listingSlug}).`,
    );
  }
  if (lp.title !== null && normTitle(observed.plannedTitle) !== normTitle(lp.title)) {
    die("Observed plannedTitle does not match launch_plan.json product.title (trim+NFC).");
  }
  if (lp.launchPrice !== null && observed.plannedPrice !== lp.launchPrice) {
    die(
      `Observed plannedPrice (${observed.plannedPrice}) does not match launch_plan.json pricing.launchPrice (${lp.launchPrice}).`,
    );
  }

  const result = compareObservedVsBaseline(observed, launchPlanDoc, baselineDoc);

  const outPath = path.join(runDirAbs, ARTIFACT_NAME);
  try {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
  } catch (e) {
    die(`Could not create output directory: ${/** @type {Error} */ (e).message}`);
  }
  fs.writeFileSync(outPath, stableJson(result), "utf8");

  process.stdout.write(`Observed vs baseline written: ${posixRel(path.relative(process.cwd(), outPath))}\n`);
}

main();
