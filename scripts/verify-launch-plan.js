#!/usr/bin/env node
/**
 * Validates outputs/props_ev_blueprint/launch_plan.json shape and consistency rules.
 */

const fs = require("fs");
const path = require("path");

const PRODUCT_ID = "props_ev_blueprint";
const LAUNCH_PLAN_PATH = path.join(process.cwd(), "outputs", PRODUCT_ID, "launch_plan.json");

function die(msg) {
  process.stderr.write(String(msg) + "\n");
  process.exit(1);
}

function parseArgs() {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write("Usage: node scripts/verify-launch-plan.js\n");
    process.exit(0);
  }
}

function isStringArray(x) {
  return Array.isArray(x) && x.every((s) => typeof s === "string");
}

function main() {
  parseArgs();

  if (!fs.existsSync(LAUNCH_PLAN_PATH)) {
    die(`Missing ${path.relative(process.cwd(), LAUNCH_PLAN_PATH)}. Run: npm run export:gumroad:launch-plan`);
  }

  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(LAUNCH_PLAN_PATH, "utf8"));
  } catch (e) {
    die(`Invalid JSON: ${e.message}`);
  }

  const required = [
    "generatedFromReleaseGate",
    "eligibleForLaunchPlan",
    "run",
    "gate",
    "product",
    "pricing",
    "assets",
    "manualPublishChecklist",
    "blockedReasons",
  ];
  for (const k of required) {
    if (!(k in doc)) die(`Missing top-level key: ${k}`);
  }

  if (doc.generatedFromReleaseGate !== true) {
    die("generatedFromReleaseGate must be true");
  }

  if (typeof doc.eligibleForLaunchPlan !== "boolean") {
    die("eligibleForLaunchPlan must be boolean");
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

  const product = doc.product;
  if (!product || typeof product !== "object") die("product must be object");
  if (product.title !== null && typeof product.title !== "string") die("product.title must be string or null");
  if (product.summary !== null && typeof product.summary !== "string") die("product.summary must be string or null");
  if (product.descriptionSource !== null && typeof product.descriptionSource !== "string") {
    die("product.descriptionSource must be string or null");
  }

  const pricing = doc.pricing;
  if (!pricing || typeof pricing !== "object") die("pricing must be object");
  if (pricing.currency !== "USD") die("pricing.currency must be USD");

  for (const key of ["launchPrice", "targetPrice", "anchorPrice"]) {
    const v = pricing[key];
    if (v !== null && (typeof v !== "number" || !Number.isInteger(v))) {
      die(`pricing.${key} must be null or integer`);
    }
  }

  const assets = doc.assets;
  if (!assets || typeof assets !== "object") die("assets must be object");
  if (typeof assets.deliverableCount !== "number" || !Number.isInteger(assets.deliverableCount)) {
    die("assets.deliverableCount must be integer");
  }
  if (typeof assets.imageCount !== "number" || !Number.isInteger(assets.imageCount)) {
    die("assets.imageCount must be integer");
  }
  if (!isStringArray(assets.deliverablePaths)) die("assets.deliverablePaths must be array of strings");
  if (!isStringArray(assets.imagePaths)) die("assets.imagePaths must be array of strings");

  if (!isStringArray(doc.manualPublishChecklist) || doc.manualPublishChecklist.length === 0) {
    die("manualPublishChecklist must be non-empty array of strings");
  }
  if (!Array.isArray(doc.blockedReasons) || !doc.blockedReasons.every((s) => typeof s === "string")) {
    die("blockedReasons must be array of strings");
  }

  if (doc.eligibleForLaunchPlan && !gate.approvedForManualPublish) {
    die("eligibleForLaunchPlan cannot be true when gate.approvedForManualPublish is false");
  }

  if (doc.eligibleForLaunchPlan) {
    if (product.title === null) die("eligible plan requires non-null product.title");
    if (pricing.launchPrice === null) die("eligible plan requires non-null pricing.launchPrice");
    if (assets.deliverableCount === 0) die("eligible plan requires assets.deliverableCount > 0");
  }

  if (!doc.eligibleForLaunchPlan && doc.blockedReasons.length === 0) {
    die("When not eligible, blockedReasons must be non-empty");
  }

  process.stdout.write(`OK: ${path.relative(process.cwd(), LAUNCH_PLAN_PATH)}\n`);
}

main();
