#!/usr/bin/env node
/**
 * Verifies outputs/props_ev_blueprint/release_gate.json
 */

const fs = require("fs");
const path = require("path");

const PRODUCT_ID = "props_ev_blueprint";
const OUTPUT_ROOT = path.join(process.cwd(), "outputs", PRODUCT_ID);
const GATE_PATH = path.join(OUTPUT_ROOT, "release_gate.json");

const STATUSES = new Set(["blocked", "needs_review", "approved"]);

const CHECK_KEYS = [
  "hasPublishReadyRecommendation",
  "hasTitle",
  "hasDescription",
  "hasCoverImage",
  "hasDeliverables",
  "hasValidPricingDecision",
  "hasLaunchPrice",
  "hasTargetPrice",
  "hasAnchorPrice",
];

function die(msg) {
  process.stderr.write(String(msg) + "\n");
  process.exit(1);
}

function posixRel(p) {
  return p.split(path.sep).join("/");
}

function parseArgs() {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write("Usage: node scripts/verify-release-gate.js\n");
    process.exit(0);
  }
}

function assertStringArray(name, arr) {
  if (!Array.isArray(arr)) die(`${name} must be an array`);
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] !== "string") die(`${name}[${i}] must be a string`);
  }
}

function main() {
  parseArgs();

  if (!fs.existsSync(GATE_PATH)) {
    die(`Missing ${posixRel(path.relative(process.cwd(), GATE_PATH))}. Run: npm run export:gumroad:release-gate`);
  }

  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(GATE_PATH, "utf8"));
  } catch (e) {
    die(`Invalid JSON in release_gate.json: ${e.message}`);
  }

  if (doc.evaluatedFromPublishQueue !== true) die("evaluatedFromPublishQueue must be true");

  if (!doc.topRankedRun || typeof doc.topRankedRun !== "object") die("missing topRankedRun");
  if (doc.topRankedRun.rank !== 1) die(`topRankedRun.rank must be 1, got ${doc.topRankedRun.rank}`);
  if (typeof doc.topRankedRun.runId !== "string" || doc.topRankedRun.runId.trim() === "") die("topRankedRun.runId must be non-empty");
  if (typeof doc.topRankedRun.listingSlug !== "string" || doc.topRankedRun.listingSlug.trim() === "") {
    die("topRankedRun.listingSlug must be non-empty");
  }
  const rec = doc.topRankedRun.recommendation;
  if (rec !== "hold" && rec !== "test" && rec !== "publish_ready") {
    die(`topRankedRun.recommendation invalid: ${JSON.stringify(rec)}`);
  }

  if (!doc.gate || typeof doc.gate !== "object") die("missing gate");
  if (!STATUSES.has(doc.gate.status)) die(`gate.status must be blocked|needs_review|approved, got ${JSON.stringify(doc.gate.status)}`);
  if (typeof doc.gate.approvedForManualPublish !== "boolean") die("gate.approvedForManualPublish must be boolean");

  if (doc.gate.approvedForManualPublish !== (doc.gate.status === "approved")) {
    die("approvedForManualPublish must be true iff gate.status is approved");
  }

  if (!doc.checks || typeof doc.checks !== "object") die("missing checks");
  for (const k of CHECK_KEYS) {
    if (typeof doc.checks[k] !== "boolean") die(`checks.${k} must be boolean`);
  }

  assertStringArray("blockingReasons", doc.blockingReasons);
  assertStringArray("reviewReasons", doc.reviewReasons);

  if (!doc.pricing || typeof doc.pricing !== "object") die("missing pricing object");
  for (const k of ["launchPrice", "targetPrice", "anchorPrice"]) {
    const v = doc.pricing[k];
    if (v !== null && (typeof v !== "number" || !Number.isInteger(v))) {
      die(`pricing.${k} must be null or an integer, got ${JSON.stringify(v)}`);
    }
  }

  const allChecksTrue = CHECK_KEYS.every((k) => doc.checks[k] === true);

  if (doc.gate.status === "approved" && !allChecksTrue) {
    die("gate.status is approved but not all checks are true");
  }

  process.stdout.write(`OK: ${posixRel(path.relative(process.cwd(), GATE_PATH))}\n`);
}

main();
