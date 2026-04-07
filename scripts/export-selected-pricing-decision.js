#!/usr/bin/env node
/**
 * Deterministic offline pricing decision for the selected Gumroad listing run.
 * Reads outputs/props_ev_blueprint/selected_handoff.json (or handoff_bundle copy),
 * loads gumroad_listing_package.json, derives pricing-decision.json under the run folder.
 */

const fs = require("fs");
const path = require("path");

const PRODUCT_ID = "props_ev_blueprint";
const OUTPUT_ROOT = path.join(process.cwd(), "outputs", PRODUCT_ID);
const HANDOFF_JSON = "selected_handoff.json";
const ARTIFACT_NAME = "pricing-decision.json";
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

function readHandoffJson() {
  const primary = path.join(OUTPUT_ROOT, HANDOFF_JSON);
  if (fs.existsSync(primary)) {
    try {
      return { handoff: JSON.parse(fs.readFileSync(primary, "utf8")), source: posixRel(path.relative(process.cwd(), primary)) };
    } catch (e) {
      die(`Invalid JSON in ${posixRel(path.relative(process.cwd(), primary))}: ${e.message}`);
    }
  }
  const bundleCopy = path.join(OUTPUT_ROOT, "handoff_bundle", HANDOFF_JSON);
  if (fs.existsSync(bundleCopy)) {
    try {
      return { handoff: JSON.parse(fs.readFileSync(bundleCopy, "utf8")), source: posixRel(path.relative(process.cwd(), bundleCopy)) };
    } catch (e) {
      die(`Invalid JSON in ${posixRel(path.relative(process.cwd(), bundleCopy))}: ${e.message}`);
    }
  }
  die(
    `Missing ${HANDOFF_JSON} under outputs/${PRODUCT_ID}/ or outputs/${PRODUCT_ID}/handoff_bundle/. Run: npm run listing:handoff`
  );
}

function countImageFilesRecursive(runDirAbs) {
  let n = 0;
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
      else if (e.isFile() && /\.(png|jpe?g|gif|webp|svg)$/i.test(e.name)) n++;
    }
  }
  walk(runDirAbs);
  return n;
}

function listingSlugFrom(pkg) {
  const hint = pkg.taxonomy && typeof pkg.taxonomy.slugHint === "string" ? pkg.taxonomy.slugHint.trim() : "";
  if (hint.length > 0) return hint;
  const pid = pkg.product && pkg.product.productId ? String(pkg.product.productId) : PRODUCT_ID;
  return pid.replace(/_/g, "-");
}

function computeCompletenessScore(inputs) {
  let score = 0;
  if (inputs.hasTitle) score += 20;
  if (inputs.hasDescription) score += 20;
  if (inputs.hasCoverImage) score += 15;
  if (inputs.hasDeliverables) score += 10;
  score += Math.min(25, inputs.deliverableCount * 5);
  score += Math.min(10, inputs.imageCount * 5);
  return score;
}

function tierFromScore(score) {
  if (score < 45) return "low";
  if (score < 75) return "mid";
  return "high";
}

function strategyFromTier(tier) {
  if (tier === "low") return "volume";
  if (tier === "mid") return "balanced";
  return "premium";
}

function computePrices(inputs, score) {
  const dc = inputs.deliverableCount;
  const targetPrice = 19 + Math.min(50, Math.floor(score * 0.45));
  let floorPrice = Math.max(9, targetPrice - 15 - Math.floor(dc / 2));
  let launchPrice = Math.min(targetPrice, Math.max(floorPrice + 1, targetPrice - 5));
  if (launchPrice > targetPrice) launchPrice = targetPrice;
  if (floorPrice > launchPrice) floorPrice = launchPrice;
  let anchorPrice = targetPrice + 10 + Math.min(20, dc * 2);
  if (anchorPrice < targetPrice) anchorPrice = targetPrice;
  return {
    floorPrice: Math.round(floorPrice),
    targetPrice: Math.round(targetPrice),
    launchPrice: Math.round(launchPrice),
    anchorPrice: Math.round(anchorPrice),
  };
}

function strongCompletenessGate(inputs, gumroad) {
  const longLen =
    gumroad && typeof gumroad.longDescriptionMarkdown === "string" ? gumroad.longDescriptionMarkdown.trim().length : 0;
  const sumLen = gumroad && typeof gumroad.summaryPlain === "string" ? gumroad.summaryPlain.trim().length : 0;
  return (
    inputs.hasTitle &&
    inputs.hasDescription &&
    inputs.hasCoverImage &&
    inputs.hasDeliverables &&
    inputs.deliverableCount >= 6 &&
    longLen >= 200 &&
    sumLen >= 10
  );
}

function decideRecommendation(inputs, score, strongOk) {
  if (!inputs.hasTitle || !inputs.hasDeliverables || inputs.deliverableCount === 0) {
    return "hold";
  }
  if (strongOk && score >= 80) return "publish_ready";
  if (score >= 45) return "test";
  return "hold";
}

function buildReasons(inputs, score, recommendation, pricing) {
  const negative = [];
  if (!inputs.hasTitle) negative.push("Gumroad title is missing or empty in listing package.");
  if (!inputs.hasDescription) {
    negative.push("Long description and/or summary text below required length thresholds.");
  }
  if (!inputs.hasCoverImage) {
    negative.push("Cover guidance artifact (photo_description.md) missing or under 40 characters under run output.");
  }
  if (!inputs.hasDeliverables) {
    negative.push("Listing package has no deliverables.files entries.");
  } else if (inputs.deliverableCount < 6) {
    negative.push(`Deliverable file count is ${inputs.deliverableCount}; full factory package lists six files.`);
  }
  negative.sort((a, b) => a.localeCompare(b));

  let outcomeLine;
  if (recommendation === "publish_ready") {
    outcomeLine =
      "Offline gate: title, description lengths, cover guidance, six deliverables, and score allow publish_ready.";
  } else if (recommendation === "test") {
    outcomeLine = "Listing supports offline price experiments; address gaps before treating as publish-ready.";
  } else {
    outcomeLine = "Hold: add missing listing signals or raise completeness before pricing tests or publish.";
  }

  const tail = [
    `Completeness score is ${score} (test threshold 45, publish_ready requires score 80 and all core fields).`,
    outcomeLine,
    `Derived integer USD prices: floor ${pricing.floorPrice}, launch ${pricing.launchPrice}, target ${pricing.targetPrice}, anchor ${pricing.anchorPrice}.`,
  ];

  return negative.concat(tail);
}

function parseArgs() {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(
      "Usage: node scripts/export-selected-pricing-decision.js\n" +
        "Writes outputs/props_ev_blueprint/<run_id>/pricing-decision.json from selected handoff + listing package.\n"
    );
    process.exit(0);
  }
}

function main() {
  parseArgs();

  const { handoff, source } = readHandoffJson();
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

  const gumroad = listingPkg.gumroad && typeof listingPkg.gumroad === "object" ? listingPkg.gumroad : {};
  const title = typeof gumroad.title === "string" ? gumroad.title.trim() : "";
  const longMd = typeof gumroad.longDescriptionMarkdown === "string" ? gumroad.longDescriptionMarkdown : "";
  const summaryPlain = typeof gumroad.summaryPlain === "string" ? gumroad.summaryPlain : "";
  const hasTitle = title.length > 0;
  const hasDescription = longMd.trim().length >= 100 && summaryPlain.trim().length >= 10;
  const photoPath = path.join(runDirAbs, PHOTO_DESC);
  const hasCoverImage = fileExistsNonEmpty(photoPath) && fs.readFileSync(photoPath, "utf8").trim().length >= 40;

  const files = listingPkg.deliverables && Array.isArray(listingPkg.deliverables.files) ? listingPkg.deliverables.files : [];
  const deliverableCount = files.length;
  const hasDeliverables = deliverableCount > 0;
  const imageCount = countImageFilesRecursive(runDirAbs);

  const inputs = {
    hasTitle,
    hasDescription,
    hasCoverImage,
    hasDeliverables,
    deliverableCount,
    imageCount,
  };

  const score = computeCompletenessScore(inputs);
  const strongOk = strongCompletenessGate(inputs, gumroad);
  const tier = tierFromScore(score);
  const strategy = strategyFromTier(tier);
  const pricing = computePrices(inputs, score);
  const recommendation = decideRecommendation(inputs, score, strongOk);
  const reasons = buildReasons(inputs, score, recommendation, pricing);

  const body = {
    runId: handoff.selected_run_id,
    listingSlug: listingSlugFrom(listingPkg),
    currency: "USD",
    pricing,
    positioning: {
      tier,
      strategy,
    },
    decision: {
      recommendation,
      reasons,
    },
    inputs,
  };

  const outPath = path.join(runDirAbs, ARTIFACT_NAME);
  fs.writeFileSync(outPath, stableJson(body), "utf8");

  const relOut = posixRel(path.relative(process.cwd(), outPath));
  process.stdout.write(`Pricing decision written: ${relOut}\n`);
  process.stdout.write(`Handoff source: ${source}\n`);
}

main();
