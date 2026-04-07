#!/usr/bin/env node
/**
 * Deterministic offline release gate for rank-1 run from publish_queue.json.
 * Reads gumroad_listing_package.json and pricing-decision.json under the run directory when present.
 */

const fs = require("fs");
const path = require("path");

const PRODUCT_ID = "props_ev_blueprint";
const OUTPUT_ROOT = path.join(process.cwd(), "outputs", PRODUCT_ID);
const QUEUE_PATH = path.join(OUTPUT_ROOT, "publish_queue.json");
const ARTIFACT_NAME = "release_gate.json";
const LISTING_PKG = "gumroad_listing_package.json";
const PRICING_DECISION = "pricing-decision.json";
const PHOTO_DESC = "photo_description.md";

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

function fileExistsNonEmpty(fp) {
  try {
    const st = fs.statSync(fp);
    return st.isFile() && st.size > 0;
  } catch {
    return false;
  }
}

function loadJsonOptional(absPath) {
  if (!fs.existsSync(absPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(absPath, "utf8"));
  } catch {
    return null;
  }
}

function deriveSignalsFromPackage(pkg, runDirAbs) {
  const empty = {
    hasTitle: false,
    hasDescription: false,
    hasCoverImage: false,
    hasDeliverables: false,
  };
  if (!pkg || typeof pkg !== "object") return empty;

  const gumroad = pkg.gumroad && typeof pkg.gumroad === "object" ? pkg.gumroad : {};
  const title = typeof gumroad.title === "string" ? gumroad.title.trim() : "";
  const longMd = typeof gumroad.longDescriptionMarkdown === "string" ? gumroad.longDescriptionMarkdown : "";
  const summaryPlain = typeof gumroad.summaryPlain === "string" ? gumroad.summaryPlain : "";
  const hasTitle = title.length > 0;
  const hasDescription = longMd.trim().length >= 100 && summaryPlain.trim().length >= 10;
  const photoPath = path.join(runDirAbs, PHOTO_DESC);
  const hasCoverImage = fileExistsNonEmpty(photoPath) && fs.readFileSync(photoPath, "utf8").trim().length >= 40;

  const files = pkg.deliverables && Array.isArray(pkg.deliverables.files) ? pkg.deliverables.files : [];
  const deliverableCount = files.length;
  const hasDeliverables = deliverableCount > 0;

  return {
    hasTitle,
    hasDescription,
    hasCoverImage,
    hasDeliverables,
  };
}

function isValidPricingDecisionDoc(doc) {
  if (!doc || typeof doc !== "object") return false;
  const d = doc.decision;
  if (!d || typeof d !== "object") return false;
  const r = d.recommendation;
  if (r !== "hold" && r !== "test" && r !== "publish_ready") return false;
  if (!doc.pricing || typeof doc.pricing !== "object") return false;
  const p = doc.pricing;
  const a = ["launchPrice", "targetPrice", "anchorPrice"];
  for (const k of a) {
    if (typeof p[k] !== "number" || !Number.isInteger(p[k])) return false;
  }
  return true;
}

function positivePrice(n) {
  return typeof n === "number" && Number.isInteger(n) && n > 0;
}

function isPlaceholderListingSlug(slug) {
  return typeof slug === "string" && slug.startsWith("pending-");
}

function parseArgs() {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(
      "Usage: node scripts/export-release-gate.js\n" +
        "Reads publish_queue.json and writes release_gate.json for rank 1.\n"
    );
    process.exit(0);
  }
}

function main() {
  parseArgs();

  if (!fs.existsSync(QUEUE_PATH)) {
    die(`Missing ${posixRel(path.relative(process.cwd(), QUEUE_PATH))}. Run: npm run export:gumroad:publish-queue`);
  }

  let queueDoc;
  try {
    queueDoc = JSON.parse(fs.readFileSync(QUEUE_PATH, "utf8"));
  } catch (e) {
    die(`Invalid JSON in publish_queue.json: ${e.message}`);
  }

  const queue = Array.isArray(queueDoc.queue) ? queueDoc.queue : [];
  const top = queue.find((x) => x && x.rank === 1) || null;

  if (top) {
    if (typeof top.runId !== "string" || top.runId.trim() === "") {
      die("publish_queue.json rank 1 row must have a non-empty runId");
    }
    if (typeof top.listingSlug !== "string" || top.listingSlug.trim() === "") {
      die("publish_queue.json rank 1 row must have a non-empty listingSlug");
    }
  }

  const EMPTY_TOP = {
    rank: 1,
    runId: "_empty_publish_queue_",
    listingSlug: "_empty_publish_queue_",
    recommendation: "hold",
  };

  const topRankedRun = top
    ? {
        rank: top.rank,
        runId: typeof top.runId === "string" ? top.runId : "",
        listingSlug: typeof top.listingSlug === "string" ? top.listingSlug : "",
        recommendation:
          top.recommendation === "hold" || top.recommendation === "test" || top.recommendation === "publish_ready"
            ? top.recommendation
            : "hold",
      }
    : EMPTY_TOP;

  const runDirAbs = path.join(OUTPUT_ROOT, topRankedRun.runId);
  const pkgPath = path.join(runDirAbs, LISTING_PKG);
  const pricingPath = path.join(runDirAbs, PRICING_DECISION);

  const pkg = loadJsonOptional(pkgPath);
  const pricingDoc = loadJsonOptional(pricingPath);

  const sig = deriveSignalsFromPackage(pkg, runDirAbs);
  const hasValidPricingDecision = isValidPricingDecisionDoc(pricingDoc);

  let launchPrice = null;
  let targetPrice = null;
  let anchorPrice = null;
  if (hasValidPricingDecision) {
    const p = pricingDoc.pricing;
    launchPrice = p.launchPrice;
    targetPrice = p.targetPrice;
    anchorPrice = p.anchorPrice;
  }

  const hasPublishReadyRecommendation = topRankedRun.recommendation === "publish_ready";
  const hasLaunchPrice = positivePrice(launchPrice);
  const hasTargetPrice = positivePrice(targetPrice);
  const hasAnchorPrice = positivePrice(anchorPrice);

  const checks = {
    hasPublishReadyRecommendation,
    hasTitle: sig.hasTitle,
    hasDescription: sig.hasDescription,
    hasCoverImage: sig.hasCoverImage,
    hasDeliverables: sig.hasDeliverables,
    hasValidPricingDecision,
    hasLaunchPrice,
    hasTargetPrice,
    hasAnchorPrice,
  };

  const blockingReasons = [];
  const reviewReasons = [];

  if (!top) {
    blockingReasons.push("publish_queue.json has no row with rank 1.");
  }
  if (top && topRankedRun.recommendation !== "publish_ready") {
    blockingReasons.push(`Queue recommendation is ${topRankedRun.recommendation}; publish_ready is required for manual release approval.`);
  }
  if (!sig.hasTitle) {
    blockingReasons.push("Listing package missing non-empty Gumroad title or listing package absent.");
  }
  if (!sig.hasDescription) {
    blockingReasons.push("Long description summary thresholds not met (or listing package absent).");
  }
  if (!sig.hasDeliverables) {
    blockingReasons.push("Listing package has no deliverables.files entries or listing package absent.");
  }
  if (!hasValidPricingDecision) {
    blockingReasons.push("pricing-decision.json missing, unreadable, or invalid for this run.");
  }
  if (!hasLaunchPrice) {
    blockingReasons.push("launchPrice missing or not a positive integer from pricing-decision.json.");
  }
  if (!hasTargetPrice) {
    blockingReasons.push("targetPrice missing or not a positive integer from pricing-decision.json.");
  }
  if (!hasAnchorPrice) {
    blockingReasons.push("anchorPrice missing or not a positive integer from pricing-decision.json.");
  }

  const isBlocked = blockingReasons.length > 0;

  if (!isBlocked) {
    if (!sig.hasCoverImage) {
      reviewReasons.push("Cover guidance signal absent (photo_description.md missing or too short); review before manual publish.");
    }
    if (isPlaceholderListingSlug(topRankedRun.listingSlug)) {
      reviewReasons.push("listingSlug uses placeholder pending-* form; confirm real slug before manual publish.");
    }
  }

  const needsReview = !isBlocked && reviewReasons.length > 0;
  const approved = !isBlocked && !needsReview;

  let status;
  if (isBlocked) status = "blocked";
  else if (needsReview) status = "needs_review";
  else status = "approved";

  const approvedForManualPublish = status === "approved";

  const body = {
    evaluatedFromPublishQueue: true,
    topRankedRun,
    gate: {
      status,
      approvedForManualPublish,
    },
    checks,
    blockingReasons: blockingReasons.slice().sort((a, b) => a.localeCompare(b)),
    reviewReasons: reviewReasons.slice().sort((a, b) => a.localeCompare(b)),
    pricing: {
      launchPrice,
      targetPrice,
      anchorPrice,
    },
  };

  const outPath = path.join(OUTPUT_ROOT, ARTIFACT_NAME);
  fs.writeFileSync(outPath, stableJson(body), "utf8");

  process.stdout.write(`Release gate written: ${posixRel(path.relative(process.cwd(), outPath))}\n`);
}

main();
