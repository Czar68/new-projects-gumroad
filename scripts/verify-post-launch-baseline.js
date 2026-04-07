#!/usr/bin/env node
/**
 * Validates outputs/props_ev_blueprint/post_launch_baseline.json and cross-checks launch_plan.json.
 */

const fs = require("fs");
const path = require("path");

const PRODUCT_ID = "props_ev_blueprint";
const OUTPUT_ROOT = path.join(process.cwd(), "outputs", PRODUCT_ID);
const BASELINE_PATH = path.join(OUTPUT_ROOT, "post_launch_baseline.json");
const LAUNCH_PLAN_PATH = path.join(OUTPUT_ROOT, "launch_plan.json");

function die(msg) {
  process.stderr.write(String(msg) + "\n");
  process.exit(1);
}

function parseArgs() {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write("Usage: node scripts/verify-post-launch-baseline.js\n");
    process.exit(0);
  }
}

function isStringArray(x) {
  return Array.isArray(x) && x.every((s) => typeof s === "string");
}

function main() {
  parseArgs();

  if (!fs.existsSync(BASELINE_PATH)) {
    die(`Missing ${path.relative(process.cwd(), BASELINE_PATH)}. Run: npm run export:gumroad:post-launch-baseline`);
  }

  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8"));
  } catch (e) {
    die(`Invalid JSON: ${e.message}`);
  }

  let launchPlanDoc = null;
  if (fs.existsSync(LAUNCH_PLAN_PATH)) {
    try {
      launchPlanDoc = JSON.parse(fs.readFileSync(LAUNCH_PLAN_PATH, "utf8"));
    } catch {
      launchPlanDoc = null;
    }
  }

  const required = [
    "generatedFromLaunchPlan",
    "eligibleForTracking",
    "run",
    "gate",
    "baseline",
    "trackingTargets",
    "comparisonChecklist",
    "blockedReasons",
  ];
  for (const k of required) {
    if (!(k in doc)) die(`Missing top-level key: ${k}`);
  }

  if (doc.generatedFromLaunchPlan !== true) {
    die("generatedFromLaunchPlan must be true");
  }

  if (typeof doc.eligibleForTracking !== "boolean") {
    die("eligibleForTracking must be boolean");
  }

  const run = doc.run;
  if (!run || typeof run !== "object") die("run must be object");
  if (run.rank !== 1) die("run.rank must be 1");
  if (typeof run.runId !== "string") die("run.runId must be string");
  if (typeof run.listingSlug !== "string") die("run.listingSlug must be string");
  if (run.recommendation !== "hold" && run.recommendation !== "test" && run.recommendation !== "publish_ready") {
    die("run.recommendation must be hold | test | publish_ready");
  }

  const gate = doc.gate;
  if (!gate || typeof gate !== "object") die("gate must be object");
  if (gate.status !== "blocked" && gate.status !== "needs_review" && gate.status !== "approved") {
    die("gate.status must be blocked | needs_review | approved");
  }
  if (typeof gate.approvedForManualPublish !== "boolean") {
    die("gate.approvedForManualPublish must be boolean");
  }

  const baseline = doc.baseline;
  if (!baseline || typeof baseline !== "object") die("baseline must be object");
  if (baseline.currency !== "USD") die("baseline.currency must be USD");

  for (const key of ["launchPrice", "targetPrice", "anchorPrice"]) {
    const v = baseline[key];
    if (v !== null && (typeof v !== "number" || !Number.isInteger(v))) {
      die(`baseline.${key} must be null or integer`);
    }
  }

  if (typeof baseline.deliverableCount !== "number" || !Number.isInteger(baseline.deliverableCount)) {
    die("baseline.deliverableCount must be integer");
  }
  if (typeof baseline.imageCount !== "number" || !Number.isInteger(baseline.imageCount)) {
    die("baseline.imageCount must be integer");
  }
  if (baseline.title !== null && typeof baseline.title !== "string") die("baseline.title must be string or null");
  if (baseline.summary !== null && typeof baseline.summary !== "string") die("baseline.summary must be string or null");

  const tt = doc.trackingTargets;
  if (!tt || typeof tt !== "object") die("trackingTargets must be object");
  const ttKeys = [
    "trackListingPublished",
    "trackDisplayedPrice",
    "trackDisplayedTitle",
    "trackDisplayedSummary",
    "trackDeliverableCount",
    "trackImageCount",
  ];
  for (const k of ttKeys) {
    if (!(k in tt)) die(`trackingTargets.${k} is required`);
    if (typeof tt[k] !== "boolean") die(`trackingTargets.${k} must be boolean`);
  }

  if (!isStringArray(doc.comparisonChecklist) || doc.comparisonChecklist.length === 0) {
    die("comparisonChecklist must be non-empty array of strings");
  }
  if (!Array.isArray(doc.blockedReasons) || !doc.blockedReasons.every((s) => typeof s === "string")) {
    die("blockedReasons must be array of strings");
  }

  if (launchPlanDoc && typeof launchPlanDoc.eligibleForLaunchPlan === "boolean") {
    if (doc.eligibleForTracking && !launchPlanDoc.eligibleForLaunchPlan) {
      die("eligibleForTracking cannot be true when launch_plan.json eligibleForLaunchPlan is false");
    }
  }

  if (doc.eligibleForTracking && !gate.approvedForManualPublish) {
    die("eligibleForTracking cannot be true when gate.approvedForManualPublish is false");
  }

  if (doc.eligibleForTracking) {
    if (baseline.title === null) die("eligible tracking requires non-null baseline.title");
    if (baseline.launchPrice === null) die("eligible tracking requires non-null baseline.launchPrice");
  }

  if (!doc.eligibleForTracking && doc.blockedReasons.length === 0) {
    die("When not eligible, blockedReasons must be non-empty");
  }

  process.stdout.write(`OK: ${path.relative(process.cwd(), BASELINE_PATH)}\n`);
}

main();
