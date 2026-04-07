#!/usr/bin/env node
/**
 * Deterministic offline post-launch tracking baseline from launch_plan.json (+ release_gate.json for read-only alignment).
 * No network; copies fields only; does not recompute upstream logic.
 */

const fs = require("fs");
const path = require("path");

const PRODUCT_ID = "props_ev_blueprint";
const OUTPUT_ROOT = path.join(process.cwd(), "outputs", PRODUCT_ID);
const LAUNCH_PLAN_PATH = path.join(OUTPUT_ROOT, "launch_plan.json");
const RELEASE_GATE_PATH = path.join(OUTPUT_ROOT, "release_gate.json");
const ARTIFACT_NAME = "post_launch_baseline.json";

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

function parseArgs() {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(
      "Usage: node scripts/export-post-launch-baseline.js\n" +
        "Reads launch_plan.json and release_gate.json; writes post_launch_baseline.json.\n"
    );
    process.exit(0);
  }
}

const CHECKLIST_ELIGIBLE = [
  "Confirm the Gumroad listing is published and reachable.",
  "Confirm the displayed product title matches baseline.title.",
  "Confirm the displayed summary matches baseline.summary.",
  "Confirm the displayed price matches baseline.launchPrice (USD).",
  "Confirm the deliverable count matches baseline.deliverableCount.",
  "Confirm the image count matches baseline.imageCount.",
];

const CHECKLIST_NOT_ELIGIBLE = [
  "Post-launch tracking is not baselined; review blockedReasons and launch_plan.json.",
];

function mergeBlockedFromLaunchPlan(launchPlanDoc) {
  const raw = Array.isArray(launchPlanDoc.blockedReasons) ? launchPlanDoc.blockedReasons.filter((x) => typeof x === "string") : [];
  return raw.slice().sort((a, b) => a.localeCompare(b));
}

function main() {
  parseArgs();

  if (!fs.existsSync(LAUNCH_PLAN_PATH)) {
    die(`Missing ${posixRel(path.relative(process.cwd(), LAUNCH_PLAN_PATH))}. Run: npm run export:gumroad:launch-plan`);
  }
  if (!fs.existsSync(RELEASE_GATE_PATH)) {
    die(`Missing ${posixRel(path.relative(process.cwd(), RELEASE_GATE_PATH))}. Run: npm run export:gumroad:release-gate`);
  }

  let launchPlanDoc;
  try {
    launchPlanDoc = JSON.parse(fs.readFileSync(LAUNCH_PLAN_PATH, "utf8"));
  } catch (e) {
    die(`Invalid JSON in launch_plan.json: ${e.message}`);
  }

  try {
    JSON.parse(fs.readFileSync(RELEASE_GATE_PATH, "utf8"));
  } catch (e) {
    die(`Invalid JSON in release_gate.json: ${e.message}`);
  }

  const lpEligible = launchPlanDoc.eligibleForLaunchPlan === true;
  const eligibleForTracking = lpEligible;

  const runSrc = launchPlanDoc.run && typeof launchPlanDoc.run === "object" ? launchPlanDoc.run : {};
  const run = {
    rank: typeof runSrc.rank === "number" && Number.isInteger(runSrc.rank) ? runSrc.rank : 1,
    runId: typeof runSrc.runId === "string" ? runSrc.runId : "",
    listingSlug: typeof runSrc.listingSlug === "string" ? runSrc.listingSlug : "",
    recommendation:
      runSrc.recommendation === "hold" || runSrc.recommendation === "test" || runSrc.recommendation === "publish_ready"
        ? runSrc.recommendation
        : "hold",
  };

  const gateSrc = launchPlanDoc.gate && typeof launchPlanDoc.gate === "object" ? launchPlanDoc.gate : {};
  const status =
    gateSrc.status === "blocked" || gateSrc.status === "needs_review" || gateSrc.status === "approved" ? gateSrc.status : "blocked";
  const approvedForManualPublish = gateSrc.approvedForManualPublish === true;
  const gate = {
    status,
    approvedForManualPublish,
  };

  const pricing = launchPlanDoc.pricing && typeof launchPlanDoc.pricing === "object" ? launchPlanDoc.pricing : {};
  const product = launchPlanDoc.product && typeof launchPlanDoc.product === "object" ? launchPlanDoc.product : {};
  const assets = launchPlanDoc.assets && typeof launchPlanDoc.assets === "object" ? launchPlanDoc.assets : {};

  const launchPrice = typeof pricing.launchPrice === "number" && Number.isInteger(pricing.launchPrice) ? pricing.launchPrice : null;
  const targetPrice = typeof pricing.targetPrice === "number" && Number.isInteger(pricing.targetPrice) ? pricing.targetPrice : null;
  const anchorPrice = typeof pricing.anchorPrice === "number" && Number.isInteger(pricing.anchorPrice) ? pricing.anchorPrice : null;

  const deliverableCount =
    typeof assets.deliverableCount === "number" && Number.isInteger(assets.deliverableCount) ? assets.deliverableCount : 0;
  const imageCount = typeof assets.imageCount === "number" && Number.isInteger(assets.imageCount) ? assets.imageCount : 0;

  const title = typeof product.title === "string" ? product.title : null;
  const summary = typeof product.summary === "string" ? product.summary : null;

  const baseline = {
    currency: "USD",
    launchPrice,
    targetPrice,
    anchorPrice,
    deliverableCount,
    imageCount,
    title,
    summary,
  };

  const track = eligibleForTracking;
  const trackingTargets = {
    trackListingPublished: track,
    trackDisplayedPrice: track,
    trackDisplayedTitle: track,
    trackDisplayedSummary: track,
    trackDeliverableCount: track,
    trackImageCount: track,
  };

  let blockedReasons;
  if (eligibleForTracking) {
    blockedReasons = [];
  } else {
    blockedReasons = mergeBlockedFromLaunchPlan(launchPlanDoc);
    if (blockedReasons.length === 0) {
      blockedReasons = ["Launch plan is not eligible for launch; post-launch baseline is not active."];
    }
  }

  const comparisonChecklist = eligibleForTracking ? CHECKLIST_ELIGIBLE.slice() : CHECKLIST_NOT_ELIGIBLE.slice();

  const body = {
    generatedFromLaunchPlan: true,
    eligibleForTracking,
    run,
    gate,
    baseline,
    trackingTargets,
    comparisonChecklist,
    blockedReasons,
  };

  const outPath = path.join(OUTPUT_ROOT, ARTIFACT_NAME);
  fs.writeFileSync(outPath, stableJson(body), "utf8");

  process.stdout.write(`Post-launch baseline written: ${posixRel(path.relative(process.cwd(), outPath))}\n`);
}

main();
