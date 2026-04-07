#!/usr/bin/env node
/**
 * Load and validate a manually captured observed launch JSON record (single listing).
 * Fails loudly on missing required fields or invalid types.
 */

const fs = require("fs");
const path = require("path");

const REQUIRED_TOP = [
  "runId",
  "listingKey",
  "gumroadProductUrl",
  "launchedAt",
  "plannedTitle",
  "plannedPrice",
  "actualTitle",
  "actualPrice",
  "titleChanged",
  "priceChanged",
  "descriptionChanged",
  "assetChanged",
  "manualAdjustments",
  "launchIssues",
  "snapshotAt",
  "salesCount",
  "grossRevenue",
];

function die(msg) {
  process.stderr.write(String(msg) + "\n");
  process.exit(1);
}

function isInteger(n) {
  return typeof n === "number" && Number.isInteger(n);
}

function assertStringArray(label, value) {
  if (!Array.isArray(value) || !value.every((x) => typeof x === "string")) {
    die(`${label} must be an array of strings`);
  }
}

/**
 * @param {unknown} raw - parsed JSON
 * @returns {object} validated observed launch record
 */
function validateObservedLaunchObject(raw) {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    die("Observed launch record must be a JSON object");
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  for (const k of REQUIRED_TOP) {
    if (!(k in o)) {
      die(`Missing required field: ${k}`);
    }
  }
  const allowed = new Set([
    ...REQUIRED_TOP,
    "views",
    "refundCount",
    "conversionRate",
    "qualitativeNotes",
  ]);
  for (const k of Object.keys(o)) {
    if (!allowed.has(k)) {
      die(`Unknown field (contract is strict): ${k}`);
    }
  }

  if (typeof o.runId !== "string" || o.runId.trim().length === 0) die("runId must be a non-empty string");
  if (typeof o.listingKey !== "string" || o.listingKey.trim().length === 0) die("listingKey must be a non-empty string");
  if (typeof o.gumroadProductUrl !== "string" || o.gumroadProductUrl.trim().length === 0) {
    die("gumroadProductUrl must be a non-empty string");
  }
  if (typeof o.launchedAt !== "string" || o.launchedAt.length === 0) die("launchedAt must be a non-empty string");
  if (typeof o.snapshotAt !== "string" || o.snapshotAt.length === 0) die("snapshotAt must be a non-empty string");

  if (typeof o.plannedTitle !== "string") die("plannedTitle must be a string");
  if (typeof o.actualTitle !== "string") die("actualTitle must be a string");
  if (!isInteger(o.plannedPrice)) die("plannedPrice must be an integer");
  if (!isInteger(o.actualPrice)) die("actualPrice must be an integer");

  for (const b of ["titleChanged", "priceChanged", "descriptionChanged", "assetChanged"]) {
    if (typeof o[b] !== "boolean") die(`${b} must be boolean`);
  }

  assertStringArray("manualAdjustments", o.manualAdjustments);
  assertStringArray("launchIssues", o.launchIssues);

  if (!isInteger(o.salesCount) || o.salesCount < 0) die("salesCount must be a non-negative integer");
  if (!isInteger(o.grossRevenue)) die("grossRevenue must be an integer");

  if ("views" in o && o.views !== null && (!isInteger(o.views) || o.views < 0)) {
    die("views must be null or non-negative integer");
  }
  if ("refundCount" in o && o.refundCount !== null && (!isInteger(o.refundCount) || o.refundCount < 0)) {
    die("refundCount must be null or non-negative integer");
  }
  if ("conversionRate" in o && o.conversionRate !== null) {
    if (typeof o.conversionRate !== "number" || Number.isNaN(o.conversionRate)) {
      die("conversionRate must be null or a number");
    }
  }
  if ("qualitativeNotes" in o && o.qualitativeNotes !== null && typeof o.qualitativeNotes !== "string") {
    die("qualitativeNotes must be null or string");
  }

  return {
    runId: o.runId.trim(),
    listingKey: o.listingKey.trim(),
    gumroadProductUrl: o.gumroadProductUrl.trim(),
    launchedAt: o.launchedAt,
    plannedTitle: o.plannedTitle,
    plannedPrice: o.plannedPrice,
    actualTitle: o.actualTitle,
    actualPrice: o.actualPrice,
    titleChanged: o.titleChanged,
    priceChanged: o.priceChanged,
    descriptionChanged: o.descriptionChanged,
    assetChanged: o.assetChanged,
    manualAdjustments: o.manualAdjustments.slice(),
    launchIssues: o.launchIssues.slice(),
    snapshotAt: o.snapshotAt,
    views: "views" in o ? o.views : undefined,
    salesCount: o.salesCount,
    grossRevenue: o.grossRevenue,
    refundCount: "refundCount" in o ? o.refundCount : undefined,
    conversionRate: "conversionRate" in o ? o.conversionRate : undefined,
    qualitativeNotes: "qualitativeNotes" in o ? o.qualitativeNotes : undefined,
  };
}

/**
 * @param {string} absPath
 */
function loadObservedLaunchFromFile(absPath) {
  if (!fs.existsSync(absPath)) {
    die(`Observed launch file not found: ${absPath}`);
  }
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(absPath, "utf8"));
  } catch (e) {
    die(`Invalid JSON in observed launch file: ${/** @type {Error} */ (e).message}`);
  }
  return validateObservedLaunchObject(raw);
}

function posixRel(p) {
  return p.split(path.sep).join("/");
}

module.exports = {
  validateObservedLaunchObject,
  loadObservedLaunchFromFile,
  posixRel,
};