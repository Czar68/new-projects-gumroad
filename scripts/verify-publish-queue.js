#!/usr/bin/env node
/**
 * Verifies outputs/props_ev_blueprint/publish_queue.json (deterministic publish queue artifact).
 */

const fs = require("fs");
const path = require("path");

const PRODUCT_ID = "props_ev_blueprint";
const OUTPUT_ROOT = path.join(process.cwd(), "outputs", PRODUCT_ID);
const QUEUE_PATH = path.join(OUTPUT_ROOT, "publish_queue.json");
const PRICING_DECISION = "pricing-decision.json";

const RECOMMENDATIONS = new Set(["hold", "test", "publish_ready"]);

function die(msg) {
  process.stderr.write(String(msg) + "\n");
  process.exit(1);
}

function posixRel(p) {
  return p.split(path.sep).join("/");
}

function bandValue(rec) {
  if (rec === "publish_ready") return 3;
  if (rec === "test") return 2;
  return 1;
}

function assertInteger(name, v) {
  if (typeof v !== "number" || !Number.isFinite(v) || !Number.isInteger(v)) {
    die(`${name} must be a finite integer, got ${JSON.stringify(v)}`);
  }
}

function parseArgs() {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write("Usage: node scripts/verify-publish-queue.js\n");
    process.exit(0);
  }
}

function main() {
  parseArgs();

  if (!fs.existsSync(QUEUE_PATH)) {
    die(`Missing ${posixRel(path.relative(process.cwd(), QUEUE_PATH))}. Run: npm run export:gumroad:publish-queue`);
  }

  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(QUEUE_PATH, "utf8"));
  } catch (e) {
    die(`Invalid JSON in publish_queue.json: ${e.message}`);
  }

  if (doc.generatedFromInventory !== true) die("generatedFromInventory must be true");
  if (doc.currency !== "USD") die(`currency must be "USD", got ${JSON.stringify(doc.currency)}`);
  if (!doc.summary || typeof doc.summary !== "object") die("missing summary object");
  if (!Array.isArray(doc.queue)) die("queue must be an array");

  const q = doc.queue;
  const n = q.length;

  const tr = doc.summary.totalRunsEvaluated;
  const pr = doc.summary.publishReadyCount;
  const tc = doc.summary.testCount;
  const hc = doc.summary.holdCount;

  if (typeof tr !== "number" || !Number.isInteger(tr) || tr !== n) {
    die(`summary.totalRunsEvaluated must equal queue length ${n}, got ${tr}`);
  }

  let cpr = 0;
  let ct = 0;
  let ch = 0;
  for (const item of q) {
    if (item.recommendation === "publish_ready") cpr++;
    else if (item.recommendation === "test") ct++;
    else if (item.recommendation === "hold") ch++;
  }
  if (pr !== cpr) die(`summary.publishReadyCount ${pr} does not match queue (${cpr})`);
  if (tc !== ct) die(`summary.testCount ${tc} does not match queue (${ct})`);
  if (hc !== ch) die(`summary.holdCount ${hc} does not match queue (${ch})`);

  for (let i = 0; i < n; i++) {
    const item = q[i];
    const expectedRank = i + 1;
    if (item.rank !== expectedRank) die(`queue[${i}].rank must be ${expectedRank}, got ${item.rank}`);

    if (typeof item.runId !== "string" || item.runId.trim() === "") die(`queue[${i}].runId must be non-empty`);
    if (typeof item.listingSlug !== "string" || item.listingSlug.trim() === "") die(`queue[${i}].listingSlug must be non-empty`);

    if (!RECOMMENDATIONS.has(item.recommendation)) {
      die(`queue[${i}].recommendation must be hold|test|publish_ready, got ${JSON.stringify(item.recommendation)}`);
    }

    assertInteger(`queue[${i}].priorityScore`, item.priorityScore);

    if (!item.pricing || typeof item.pricing !== "object") die(`queue[${i}]: missing pricing object`);
    assertInteger(`queue[${i}].pricing.launchPrice`, item.pricing.launchPrice);
    assertInteger(`queue[${i}].pricing.targetPrice`, item.pricing.targetPrice);
    assertInteger(`queue[${i}].pricing.anchorPrice`, item.pricing.anchorPrice);

    if (!item.signals || typeof item.signals !== "object") die(`queue[${i}]: missing signals object`);
    for (const k of ["hasTitle", "hasDescription", "hasCoverImage", "hasDeliverables"]) {
      if (typeof item.signals[k] !== "boolean") die(`queue[${i}].signals.${k} must be boolean`);
    }
    if (typeof item.signals.deliverableCount !== "number" || !Number.isInteger(item.signals.deliverableCount) || item.signals.deliverableCount < 0) {
      die(`queue[${i}].signals.deliverableCount must be a non-negative integer`);
    }
    if (typeof item.signals.imageCount !== "number" || !Number.isInteger(item.signals.imageCount) || item.signals.imageCount < 0) {
      die(`queue[${i}].signals.imageCount must be a non-negative integer`);
    }

    const reasons = item.reasons;
    if (!Array.isArray(reasons) || reasons.length === 0) die(`queue[${i}].reasons must be a non-empty array`);
    for (let j = 0; j < reasons.length; j++) {
      if (typeof reasons[j] !== "string" || reasons[j].trim() === "") {
        die(`queue[${i}].reasons[${j}] must be a non-empty string`);
      }
    }

    const pricingFile = path.join(OUTPUT_ROOT, item.runId, PRICING_DECISION);
    if (fs.existsSync(pricingFile)) {
      let pd;
      try {
        pd = JSON.parse(fs.readFileSync(pricingFile, "utf8"));
      } catch (e) {
        die(`Invalid pricing-decision.json for ${item.runId}: ${e.message}`);
      }
      if (!pd.pricing || typeof pd.pricing !== "object") {
        die(`pricing-decision.json for ${item.runId} missing pricing object`);
      }
      const pl = pd.pricing.launchPrice;
      const pt = pd.pricing.targetPrice;
      const pa = pd.pricing.anchorPrice;
      if (typeof pl !== "number" || !Number.isInteger(pl)) die(`pricing-decision ${item.runId}: launchPrice invalid`);
      if (typeof pt !== "number" || !Number.isInteger(pt)) die(`pricing-decision ${item.runId}: targetPrice invalid`);
      if (typeof pa !== "number" || !Number.isInteger(pa)) die(`pricing-decision ${item.runId}: anchorPrice invalid`);
      if (item.pricing.launchPrice !== pl || item.pricing.targetPrice !== pt || item.pricing.anchorPrice !== pa) {
        die(`queue pricing for ${item.runId} must match ${PRICING_DECISION} on disk`);
      }
    }
  }

  for (let i = 0; i < n - 1; i++) {
    if (bandValue(q[i].recommendation) < bandValue(q[i + 1].recommendation)) {
      die("queue ordering violates recommendation-band precedence (publish_ready > test > hold)");
    }
  }

  process.stdout.write(`OK: ${posixRel(path.relative(process.cwd(), QUEUE_PATH))}\n`);
}

main();
