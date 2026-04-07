#!/usr/bin/env node
/**
 * Verifies outputs/props_ev_blueprint/<run_id>/pricing-decision.json for the selected handoff run.
 */

const fs = require("fs");
const path = require("path");

const PRODUCT_ID = "props_ev_blueprint";
const OUTPUT_ROOT = path.join(process.cwd(), "outputs", PRODUCT_ID);
const HANDOFF_JSON = "selected_handoff.json";
const ARTIFACT_NAME = "pricing-decision.json";

const RECOMMENDATIONS = new Set(["hold", "test", "publish_ready"]);
const TIERS = new Set(["low", "mid", "high"]);
const STRATEGIES = new Set(["volume", "balanced", "premium"]);

function die(msg) {
  process.stderr.write(String(msg) + "\n");
  process.exit(1);
}

function posixRel(p) {
  return p.split(path.sep).join("/");
}

function readHandoffJson() {
  const primary = path.join(OUTPUT_ROOT, HANDOFF_JSON);
  if (fs.existsSync(primary)) {
    try {
      return JSON.parse(fs.readFileSync(primary, "utf8"));
    } catch (e) {
      die(`Invalid JSON in ${posixRel(path.relative(process.cwd(), primary))}: ${e.message}`);
    }
  }
  const bundleCopy = path.join(OUTPUT_ROOT, "handoff_bundle", HANDOFF_JSON);
  if (fs.existsSync(bundleCopy)) {
    try {
      return JSON.parse(fs.readFileSync(bundleCopy, "utf8"));
    } catch (e) {
      die(`Invalid JSON in ${posixRel(path.relative(process.cwd(), bundleCopy))}: ${e.message}`);
    }
  }
  die(
    `Missing ${HANDOFF_JSON} under outputs/${PRODUCT_ID}/ or handoff_bundle/. Run: npm run listing:handoff`
  );
}

function assertInteger(name, v) {
  if (typeof v !== "number" || !Number.isFinite(v) || !Number.isInteger(v)) {
    die(`${name} must be a finite integer, got ${JSON.stringify(v)}`);
  }
}

function parseArgs() {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(
      "Usage: node scripts/verify-selected-pricing-decision.js\n" +
        "Validates pricing-decision.json for the run in selected handoff.\n"
    );
    process.exit(0);
  }
}

function main() {
  parseArgs();

  const handoff = readHandoffJson();
  if (!handoff.selected_run_id || typeof handoff.output_dir !== "string") {
    die(`${HANDOFF_JSON}: missing selected_run_id or output_dir`);
  }

  const runDirAbs = path.join(process.cwd(), handoff.output_dir.split("/").join(path.sep));
  const artifactPath = path.join(runDirAbs, ARTIFACT_NAME);

  if (!fs.existsSync(artifactPath)) {
    die(`Missing pricing artifact: ${posixRel(path.relative(process.cwd(), artifactPath))}. Run: npm run export:gumroad:selected-pricing-decision`);
  }

  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  } catch (e) {
    die(`Invalid JSON in ${ARTIFACT_NAME}: ${e.message}`);
  }

  if (typeof doc.runId !== "string" || doc.runId.trim() === "") die("runId must be a non-empty string");
  if (doc.runId !== handoff.selected_run_id) die(`runId ${doc.runId} does not match selected handoff ${handoff.selected_run_id}`);

  if (typeof doc.listingSlug !== "string" || doc.listingSlug.trim() === "") die("listingSlug must be a non-empty string");

  if (doc.currency !== "USD") die(`currency must be "USD", got ${JSON.stringify(doc.currency)}`);

  if (!doc.pricing || typeof doc.pricing !== "object") die("missing pricing object");
  const { floorPrice, targetPrice, anchorPrice, launchPrice } = doc.pricing;
  assertInteger("pricing.floorPrice", floorPrice);
  assertInteger("pricing.targetPrice", targetPrice);
  assertInteger("pricing.anchorPrice", anchorPrice);
  assertInteger("pricing.launchPrice", launchPrice);

  if (floorPrice > launchPrice) die("pricing: floorPrice must be <= launchPrice");
  if (launchPrice > targetPrice) die("pricing: launchPrice must be <= targetPrice");
  if (anchorPrice < targetPrice) die("pricing: anchorPrice must be >= targetPrice");

  if (!doc.positioning || typeof doc.positioning !== "object") die("missing positioning object");
  if (!TIERS.has(doc.positioning.tier)) die(`positioning.tier must be low|mid|high, got ${JSON.stringify(doc.positioning.tier)}`);
  if (!STRATEGIES.has(doc.positioning.strategy)) {
    die(`positioning.strategy must be volume|balanced|premium, got ${JSON.stringify(doc.positioning.strategy)}`);
  }

  if (!doc.decision || typeof doc.decision !== "object") die("missing decision object");
  if (!RECOMMENDATIONS.has(doc.decision.recommendation)) {
    die(`decision.recommendation must be hold|test|publish_ready, got ${JSON.stringify(doc.decision.recommendation)}`);
  }

  const reasons = doc.decision.reasons;
  if (!Array.isArray(reasons) || reasons.length === 0) die("decision.reasons must be a non-empty array");
  for (let i = 0; i < reasons.length; i++) {
    if (typeof reasons[i] !== "string" || reasons[i].trim() === "") {
      die(`decision.reasons[${i}] must be a non-empty string`);
    }
  }

  if (!doc.inputs || typeof doc.inputs !== "object") die("missing inputs object");
  const reqBool = ["hasTitle", "hasDescription", "hasCoverImage", "hasDeliverables"];
  for (const k of reqBool) {
    if (typeof doc.inputs[k] !== "boolean") die(`inputs.${k} must be boolean`);
  }
  if (typeof doc.inputs.deliverableCount !== "number" || !Number.isInteger(doc.inputs.deliverableCount) || doc.inputs.deliverableCount < 0) {
    die("inputs.deliverableCount must be a non-negative integer");
  }
  if (typeof doc.inputs.imageCount !== "number" || !Number.isInteger(doc.inputs.imageCount) || doc.inputs.imageCount < 0) {
    die("inputs.imageCount must be a non-negative integer");
  }

  process.stdout.write(`OK: ${posixRel(path.relative(process.cwd(), artifactPath))}\n`);
}

main();
