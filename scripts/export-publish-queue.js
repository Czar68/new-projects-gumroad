#!/usr/bin/env node
/**
 * Deterministic offline publish queue from listing_inventory.json + per-run artifacts.
 * Reads gumroad_listing_package.json and pricing-decision.json when present; writes publish_queue.json.
 */

const fs = require("fs");
const path = require("path");

const PRODUCT_ID = "props_ev_blueprint";
const OUTPUT_ROOT = path.join(process.cwd(), "outputs", PRODUCT_ID);
const INVENTORY_PATH = path.join(OUTPUT_ROOT, "listing_inventory.json");
const ARTIFACT_NAME = "publish_queue.json";
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

function listingSlugFromPackage(pkg) {
  if (!pkg || typeof pkg !== "object") return "";
  const hint = pkg.taxonomy && typeof pkg.taxonomy.slugHint === "string" ? pkg.taxonomy.slugHint.trim() : "";
  if (hint.length > 0) return hint;
  const pid = pkg.product && pkg.product.productId ? String(pkg.product.productId) : PRODUCT_ID;
  return pid.replace(/_/g, "-");
}

function slugFallback(runId) {
  return `pending-${runId.replace(/[^a-zA-Z0-9-]+/g, "-")}`;
}

function deriveSignalsFromPackage(pkg, runDirAbs) {
  const empty = {
    hasTitle: false,
    hasDescription: false,
    hasCoverImage: false,
    hasDeliverables: false,
    deliverableCount: 0,
    imageCount: 0,
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
  const imageCount = countImageFilesRecursive(runDirAbs);

  return {
    hasTitle,
    hasDescription,
    hasCoverImage,
    hasDeliverables,
    deliverableCount,
    imageCount,
  };
}

function signalsFromPricingInputs(inputs) {
  if (!inputs || typeof inputs !== "object") return null;
  const k = ["hasTitle", "hasDescription", "hasCoverImage", "hasDeliverables", "deliverableCount", "imageCount"];
  for (const name of k) {
    if (name.startsWith("has")) {
      if (typeof inputs[name] !== "boolean") return null;
    } else if (typeof inputs[name] !== "number" || !Number.isInteger(inputs[name]) || inputs[name] < 0) {
      return null;
    }
  }
  return {
    hasTitle: inputs.hasTitle,
    hasDescription: inputs.hasDescription,
    hasCoverImage: inputs.hasCoverImage,
    hasDeliverables: inputs.hasDeliverables,
    deliverableCount: inputs.deliverableCount,
    imageCount: inputs.imageCount,
  };
}

function bandValue(rec) {
  if (rec === "publish_ready") return 3;
  if (rec === "test") return 2;
  return 1;
}

function boolSum(signals) {
  let n = 0;
  if (signals.hasTitle) n++;
  if (signals.hasDescription) n++;
  if (signals.hasCoverImage) n++;
  if (signals.hasDeliverables) n++;
  return n;
}

function pricingPosture(pricing) {
  const launch = pricing.launchPrice;
  const target = pricing.targetPrice;
  const anchor = pricing.anchorPrice;
  if (!Number.isInteger(launch) || !Number.isInteger(target) || !Number.isInteger(anchor)) return 0;
  return target * 100 + Math.max(0, anchor - launch);
}

function readInventory() {
  if (!fs.existsSync(INVENTORY_PATH)) {
    die(`Missing inventory: ${posixRel(path.relative(process.cwd(), INVENTORY_PATH))}. Run: npm run listing:inventory`);
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

function loadJsonOptional(absPath) {
  if (!fs.existsSync(absPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(absPath, "utf8"));
  } catch {
    return null;
  }
}

function recommendationFromPricing(pricingDoc) {
  if (!pricingDoc || typeof pricingDoc !== "object") return null;
  const d = pricingDoc.decision;
  if (!d || typeof d !== "object") return null;
  const r = d.recommendation;
  if (r === "hold" || r === "test" || r === "publish_ready") return r;
  return null;
}

function compareRows(a, b) {
  const ba = bandValue(a.recommendation);
  const bb = bandValue(b.recommendation);
  if (ba !== bb) return bb - ba;

  if (a.hasPricingArtifact !== b.hasPricingArtifact) {
    return (b.hasPricingArtifact ? 1 : 0) - (a.hasPricingArtifact ? 1 : 0);
  }

  const sa = boolSum(a.signals) + a.signals.deliverableCount + a.signals.imageCount;
  const sb = boolSum(b.signals) + b.signals.deliverableCount + b.signals.imageCount;
  if (sa !== sb) return sb - sa;

  if (a.signals.deliverableCount !== b.signals.deliverableCount) {
    return b.signals.deliverableCount - a.signals.deliverableCount;
  }

  if (a.signals.imageCount !== b.signals.imageCount) {
    return b.signals.imageCount - a.signals.imageCount;
  }

  const pa = a._pricingPosture;
  const pb = b._pricingPosture;
  if (pa !== pb) return pb - pa;

  return a.runId.localeCompare(b.runId);
}

function buildReasons(hasPricingArtifact, recommendation, signals, pricingBlock, derivedFrom) {
  const reasons = [];
  if (hasPricingArtifact) {
    reasons.push(`Recommendation ${recommendation} taken from existing ${PRICING_DECISION}.`);
  } else {
    reasons.push(`No ${PRICING_DECISION}; recommendation defaulted to hold and queue rank penalized versus runs with pricing artifacts.`);
  }
  reasons.push(
    `Signals (${derivedFrom}): title=${signals.hasTitle}, description=${signals.hasDescription}, cover=${signals.hasCoverImage}, deliverables=${signals.hasDeliverables}, deliverableCount=${signals.deliverableCount}, imageCount=${signals.imageCount}.`
  );
  if (hasPricingArtifact) {
    reasons.push(
      `Pricing posture from ${PRICING_DECISION}: launch ${pricingBlock.launchPrice}, target ${pricingBlock.targetPrice}, anchor ${pricingBlock.anchorPrice} USD.`
    );
  } else {
    reasons.push("Pricing fields set to 0 without pricing-decision.json.");
  }
  return reasons;
}

function parseArgs() {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(
      "Usage: node scripts/export-publish-queue.js\n" +
        "Reads outputs/props_ev_blueprint/listing_inventory.json and writes publish_queue.json.\n"
    );
    process.exit(0);
  }
}

function main() {
  parseArgs();

  const inv = readInventory();
  const rows = [];

  for (const run of inv.runs) {
    if (typeof run.run_id !== "string" || !run.output_dir) continue;

    const runId = run.run_id;
    const runDirAbs = path.join(process.cwd(), run.output_dir.split("/").join(path.sep));
    const pkgPath = path.join(runDirAbs, LISTING_PKG);
    const pricingPath = path.join(runDirAbs, PRICING_DECISION);

    const pkg = loadJsonOptional(pkgPath);
    const pricingDoc = loadJsonOptional(pricingPath);
    const hasPricingArtifact = pricingDoc != null && recommendationFromPricing(pricingDoc) != null;

    const fromPricingInputs = pricingDoc ? signalsFromPricingInputs(pricingDoc.inputs) : null;
    let signals;
    let derivedFrom;
    if (fromPricingInputs) {
      signals = fromPricingInputs;
      derivedFrom = PRICING_DECISION;
    } else {
      signals = deriveSignalsFromPackage(pkg, runDirAbs);
      derivedFrom = pkg ? LISTING_PKG + "+run_dir" : "inventory_only";
    }

    let recommendation;
    if (hasPricingArtifact) {
      recommendation = recommendationFromPricing(pricingDoc);
    } else {
      recommendation = "hold";
    }

    let pricingBlock;
    if (pricingDoc && pricingDoc.pricing && typeof pricingDoc.pricing === "object") {
      const p = pricingDoc.pricing;
      pricingBlock = {
        launchPrice: Math.round(Number(p.launchPrice)),
        targetPrice: Math.round(Number(p.targetPrice)),
        anchorPrice: Math.round(Number(p.anchorPrice)),
      };
      if (
        !Number.isInteger(pricingBlock.launchPrice) ||
        !Number.isInteger(pricingBlock.targetPrice) ||
        !Number.isInteger(pricingBlock.anchorPrice)
      ) {
        pricingBlock = { launchPrice: 0, targetPrice: 0, anchorPrice: 0 };
      }
    } else {
      pricingBlock = { launchPrice: 0, targetPrice: 0, anchorPrice: 0 };
    }

    const listingSlug = listingSlugFromPackage(pkg) || slugFallback(runId);

    const _pricingPosture = hasPricingArtifact ? pricingPosture(pricingBlock) : 0;

    const reasons = buildReasons(hasPricingArtifact, recommendation, signals, pricingBlock, derivedFrom);

    rows.push({
      runId,
      listingSlug,
      recommendation,
      signals,
      pricing: pricingBlock,
      hasPricingArtifact,
      _pricingPosture,
      reasons,
    });
  }

  rows.sort(compareRows);

  const totalRuns = rows.length;
  const queue = rows.map((row, index) => {
    const rank = index + 1;
    const bools = boolSum(row.signals);
    const priorityScore =
      (totalRuns - rank + 1) * 10000000 +
      bools * 100000 +
      row.signals.deliverableCount * 1000 +
      row.signals.imageCount * 100 +
      (row.hasPricingArtifact ? 50 : 0) +
      bandValue(row.recommendation);

    return {
      rank,
      runId: row.runId,
      listingSlug: row.listingSlug,
      recommendation: row.recommendation,
      priorityScore,
      pricing: {
        launchPrice: row.pricing.launchPrice,
        targetPrice: row.pricing.targetPrice,
        anchorPrice: row.pricing.anchorPrice,
      },
      signals: row.signals,
      reasons: row.reasons,
    };
  });

  let publishReadyCount = 0;
  let testCount = 0;
  let holdCount = 0;
  for (const q of queue) {
    if (q.recommendation === "publish_ready") publishReadyCount++;
    else if (q.recommendation === "test") testCount++;
    else holdCount++;
  }

  const body = {
    generatedFromInventory: true,
    currency: "USD",
    summary: {
      totalRunsEvaluated: totalRuns,
      publishReadyCount,
      testCount,
      holdCount,
    },
    queue,
  };

  const outPath = path.join(OUTPUT_ROOT, ARTIFACT_NAME);
  fs.writeFileSync(outPath, stableJson(body), "utf8");

  process.stdout.write(`Publish queue written: ${posixRel(path.relative(process.cwd(), outPath))}\n`);
}

main();
