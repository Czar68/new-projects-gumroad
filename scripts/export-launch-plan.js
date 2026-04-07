#!/usr/bin/env node
/**
 * Deterministic offline launch plan from release_gate.json + per-run listing/pricing artifacts.
 * No network; reads only existing JSON and on-disk files under the gated run directory.
 */

const fs = require("fs");
const path = require("path");

const PRODUCT_ID = "props_ev_blueprint";
const OUTPUT_ROOT = path.join(process.cwd(), "outputs", PRODUCT_ID);
const RELEASE_GATE_PATH = path.join(OUTPUT_ROOT, "release_gate.json");
const PUBLISH_QUEUE_PATH = path.join(OUTPUT_ROOT, "publish_queue.json");
const ARTIFACT_NAME = "launch_plan.json";
const LISTING_PKG = "gumroad_listing_package.json";
const PRICING_DECISION = "pricing-decision.json";

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

function loadJson(absPath) {
  if (!fs.existsSync(absPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(absPath, "utf8"));
  } catch {
    return null;
  }
}

function collectImagePathsRecursive(runDirAbs) {
  const out = [];
  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.isFile() && /\.(png|jpe?g|gif|webp|svg)$/i.test(e.name)) {
        out.push(posixRel(path.relative(process.cwd(), full)));
      }
    }
  }
  walk(runDirAbs);
  return out.sort((a, b) => a.localeCompare(b));
}

function deliverablePathsFromPackage(pkg, runDirAbs) {
  const files = pkg && pkg.deliverables && Array.isArray(pkg.deliverables.files) ? pkg.deliverables.files : [];
  const paths = [];
  for (const f of files) {
    if (!f || typeof f.path !== "string") continue;
    const rel = f.path.trim();
    if (!rel) continue;
    const abs = path.join(runDirAbs, rel);
    try {
      if (fs.statSync(abs).isFile()) {
        paths.push(posixRel(path.relative(process.cwd(), abs)));
      }
    } catch {
      /* skip missing */
    }
  }
  return paths.sort((a, b) => a.localeCompare(b));
}

function productFromListingPackage(pkg) {
  let title = null;
  let summary = null;
  let descriptionSource = null;

  if (!pkg || typeof pkg !== "object") {
    return { title, summary, descriptionSource };
  }

  const gumroad = pkg.gumroad && typeof pkg.gumroad === "object" ? pkg.gumroad : {};

  if (typeof gumroad.title === "string" && gumroad.title.trim().length > 0) {
    title = gumroad.title.trim();
  }

  if (typeof gumroad.shortDescription === "string" && gumroad.shortDescription.trim().length > 0) {
    summary = gumroad.shortDescription.trim();
  } else if (typeof gumroad.summaryPlain === "string" && gumroad.summaryPlain.trim().length > 0) {
    summary = gumroad.summaryPlain.trim();
  }

  if (typeof gumroad.longDescriptionMarkdown === "string" && gumroad.longDescriptionMarkdown.trim().length > 0) {
    descriptionSource = "gumroad_listing_package.json (gumroad.longDescriptionMarkdown)";
  } else if (typeof gumroad.shortDescription === "string" && gumroad.shortDescription.trim().length > 0) {
    descriptionSource = "gumroad_listing_package.json (gumroad.shortDescription)";
  } else if (typeof gumroad.summaryPlain === "string" && gumroad.summaryPlain.trim().length > 0) {
    descriptionSource = "gumroad_listing_package.json (gumroad.summaryPlain)";
  }

  return { title, summary, descriptionSource };
}

function pricingFromArtifacts(releaseGateDoc, pricingDoc) {
  const cur = { currency: "USD", launchPrice: null, targetPrice: null, anchorPrice: null };

  const rg = releaseGateDoc && releaseGateDoc.pricing && typeof releaseGateDoc.pricing === "object" ? releaseGateDoc.pricing : null;
  if (rg) {
    if (typeof rg.launchPrice === "number" && Number.isInteger(rg.launchPrice)) cur.launchPrice = rg.launchPrice;
    if (typeof rg.targetPrice === "number" && Number.isInteger(rg.targetPrice)) cur.targetPrice = rg.targetPrice;
    if (typeof rg.anchorPrice === "number" && Number.isInteger(rg.anchorPrice)) cur.anchorPrice = rg.anchorPrice;
  }

  const pd = pricingDoc && pricingDoc.pricing && typeof pricingDoc.pricing === "object" ? pricingDoc.pricing : null;
  if (pd) {
    if (cur.launchPrice === null && typeof pd.launchPrice === "number" && Number.isInteger(pd.launchPrice)) {
      cur.launchPrice = pd.launchPrice;
    }
    if (cur.targetPrice === null && typeof pd.targetPrice === "number" && Number.isInteger(pd.targetPrice)) {
      cur.targetPrice = pd.targetPrice;
    }
    if (cur.anchorPrice === null && typeof pd.anchorPrice === "number" && Number.isInteger(pd.anchorPrice)) {
      cur.anchorPrice = pd.anchorPrice;
    }
  }

  return cur;
}

const CHECKLIST_ELIGIBLE = [
  "Verify product title in Gumroad matches the offline listing package.",
  "Paste the summary and full description from the offline listing package.",
  "Set the Gumroad launch price to the launch USD price in this plan.",
  "Confirm the anchor or reference price matches this plan.",
  "Upload each deliverable file listed in assets.deliverablePaths.",
  "Confirm cover and gallery images using assets.imagePaths as applicable.",
  "Verify the product URL slug matches run.listingSlug before publish.",
];

const CHECKLIST_NOT_ELIGIBLE = [
  "Launch plan is not approved; review blockedReasons and release_gate.json before manual publish.",
];

function mergeBlockedReasons(releaseGateDoc) {
  const a = Array.isArray(releaseGateDoc.blockingReasons) ? releaseGateDoc.blockingReasons.filter((x) => typeof x === "string") : [];
  const b = Array.isArray(releaseGateDoc.reviewReasons) ? releaseGateDoc.reviewReasons.filter((x) => typeof x === "string") : [];
  const merged = [...a, ...b];
  return merged.slice().sort((x, y) => x.localeCompare(y));
}

function parseArgs() {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(
      "Usage: node scripts/export-launch-plan.js\n" +
        "Reads release_gate.json and publish_queue.json; writes launch_plan.json for the gated top run.\n"
    );
    process.exit(0);
  }
}

function main() {
  parseArgs();

  if (!fs.existsSync(RELEASE_GATE_PATH)) {
    die(`Missing ${posixRel(path.relative(process.cwd(), RELEASE_GATE_PATH))}. Run: npm run export:gumroad:release-gate`);
  }

  let releaseGateDoc;
  try {
    releaseGateDoc = JSON.parse(fs.readFileSync(RELEASE_GATE_PATH, "utf8"));
  } catch (e) {
    die(`Invalid JSON in release_gate.json: ${e.message}`);
  }

  const gateObj = releaseGateDoc.gate && typeof releaseGateDoc.gate === "object" ? releaseGateDoc.gate : {};
  const approvedForManualPublish = gateObj.approvedForManualPublish === true;
  const status =
    gateObj.status === "blocked" || gateObj.status === "needs_review" || gateObj.status === "approved" ? gateObj.status : "blocked";

  const top = releaseGateDoc.topRankedRun && typeof releaseGateDoc.topRankedRun === "object" ? releaseGateDoc.topRankedRun : null;
  const run = {
    rank: typeof top?.rank === "number" && Number.isInteger(top.rank) ? top.rank : 1,
    runId: typeof top?.runId === "string" ? top.runId : "",
    listingSlug: typeof top?.listingSlug === "string" ? top.listingSlug : "",
    recommendation:
      top?.recommendation === "hold" || top?.recommendation === "test" || top?.recommendation === "publish_ready"
        ? top.recommendation
        : "hold",
  };

  if (fs.existsSync(PUBLISH_QUEUE_PATH)) {
    try {
      JSON.parse(fs.readFileSync(PUBLISH_QUEUE_PATH, "utf8"));
    } catch (e) {
      die(`Invalid JSON in publish_queue.json: ${e.message}`);
    }
  }

  const runDirAbs = path.join(OUTPUT_ROOT, run.runId);
  const pkgPath = path.join(runDirAbs, LISTING_PKG);
  const pricingPath = path.join(runDirAbs, PRICING_DECISION);

  const pkg = loadJson(pkgPath);
  const pricingDoc = loadJson(pricingPath);

  const product = productFromListingPackage(pkg);
  const pricing = pricingFromArtifacts(releaseGateDoc, pricingDoc);

  let deliverablePaths = [];
  let imagePaths = [];
  if (fs.existsSync(runDirAbs) && fs.statSync(runDirAbs).isDirectory()) {
    deliverablePaths = deliverablePathsFromPackage(pkg, runDirAbs);
    imagePaths = collectImagePathsRecursive(runDirAbs);
  }

  const deliverableCount = deliverablePaths.length;
  const imageCount = imagePaths.length;

  const eligibleForLaunchPlan = approvedForManualPublish;

  let blockedReasons;
  if (eligibleForLaunchPlan) {
    blockedReasons = [];
  } else {
    blockedReasons = mergeBlockedReasons(releaseGateDoc);
    if (blockedReasons.length === 0) {
      blockedReasons = [`Release gate status is ${status}; manual publish is not approved.`];
    }
  }

  const manualPublishChecklist = eligibleForLaunchPlan ? CHECKLIST_ELIGIBLE.slice() : CHECKLIST_NOT_ELIGIBLE.slice();

  const body = {
    generatedFromReleaseGate: true,
    eligibleForLaunchPlan,
    run,
    gate: {
      status,
      approvedForManualPublish,
    },
    product: {
      title: product.title,
      summary: product.summary,
      descriptionSource: product.descriptionSource,
    },
    pricing,
    assets: {
      deliverableCount,
      deliverablePaths,
      imageCount,
      imagePaths,
    },
    manualPublishChecklist,
    blockedReasons,
  };

  const outPath = path.join(OUTPUT_ROOT, ARTIFACT_NAME);
  fs.writeFileSync(outPath, stableJson(body), "utf8");

  process.stdout.write(`Launch plan written: ${posixRel(path.relative(process.cwd(), outPath))}\n`);
}

main();
