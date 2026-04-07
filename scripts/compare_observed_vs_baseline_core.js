#!/usr/bin/env node
/**
 * Deterministic observed-vs-baseline comparison (single listing).
 * Reads structured inputs only; no network; no wall-clock fields except those in inputs.
 */

/**
 * @typedef {object} ObservedLaunch
 * @property {string} runId
 * @property {string} listingKey
 * @property {string} gumroadProductUrl
 * @property {string} launchedAt
 * @property {string} plannedTitle
 * @property {number} plannedPrice
 * @property {string} actualTitle
 * @property {number} actualPrice
 * @property {boolean} titleChanged
 * @property {boolean} priceChanged
 * @property {boolean} descriptionChanged
 * @property {boolean} assetChanged
 * @property {string[]} manualAdjustments
 * @property {string[]} launchIssues
 * @property {string} snapshotAt
 * @property {number|null|undefined} views
 * @property {number} salesCount
 * @property {number} grossRevenue
 * @property {number|null|undefined} refundCount
 * @property {number|null|undefined} conversionRate
 * @property {string|null|undefined} qualitativeNotes
 */

const CONVERSION_EPS = 1e-9;

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

/**
 * Deterministic title comparison: trim + Unicode NFC.
 * @param {string} s
 */
function normTitle(s) {
  return String(s).trim().normalize("NFC");
}

/**
 * @param {unknown} lp
 * @returns {{ title: string | null, launchPrice: number | null, runId: string, listingSlug: string }}
 */
function launchPlanFields(lp) {
  if (!lp || typeof lp !== "object") {
    return { title: null, launchPrice: null, runId: "", listingSlug: "" };
  }
  const o = /** @type {Record<string, unknown>} */ (lp);
  const run = o.run && typeof o.run === "object" ? /** @type {Record<string, unknown>} */ (o.run) : {};
  const product = o.product && typeof o.product === "object" ? /** @type {Record<string, unknown>} */ (o.product) : {};
  const pricing = o.pricing && typeof o.pricing === "object" ? /** @type {Record<string, unknown>} */ (o.pricing) : {};
  const title = typeof product.title === "string" ? product.title : null;
  const launchPrice =
    typeof pricing.launchPrice === "number" && Number.isInteger(pricing.launchPrice) ? pricing.launchPrice : null;
  const runId = typeof run.runId === "string" ? run.runId : "";
  const listingSlug = typeof run.listingSlug === "string" ? run.listingSlug : "";
  return { title, launchPrice, runId, listingSlug };
}

/**
 * Optional outcome thresholds: may be present if hand-edited into post_launch_baseline.json
 * without changing the exporter.
 * @param {unknown} baselineDoc
 */
function baselineOutcomeThresholds(baselineDoc) {
  const base =
    baselineDoc && typeof baselineDoc === "object" && baselineDoc !== null && "baseline" in baselineDoc
      ? /** @type {Record<string, unknown>} */ (baselineDoc).baseline
      : null;
  if (!base || typeof base !== "object") {
    return {
      expectedSalesMin: null,
      expectedRevenueMin: null,
      expectedConversionRate: null,
    };
  }
  const b = /** @type {Record<string, unknown>} */ (base);
  const expectedSalesMin =
    typeof b.expectedSalesMin === "number" && Number.isInteger(b.expectedSalesMin) && b.expectedSalesMin >= 0
      ? b.expectedSalesMin
      : null;
  const expectedRevenueMin =
    typeof b.expectedRevenueMin === "number" && Number.isInteger(b.expectedRevenueMin) ? b.expectedRevenueMin : null;
  const expectedConversionRate =
    typeof b.expectedConversionRate === "number" && !Number.isNaN(b.expectedConversionRate)
      ? b.expectedConversionRate
      : null;
  return { expectedSalesMin, expectedRevenueMin, expectedConversionRate };
}

/**
 * @typedef {"insufficient_data"|"above_baseline"|"within_baseline"|"below_baseline"} MetricOutcome
 */

/**
 * @param {string} label
 * @param {number|null} threshold
 * @param {number} observedValue
 * @returns {{ status: MetricOutcome, reason: string|null }}
 */
function compareIntegerThreshold(label, threshold, observedValue) {
  if (threshold === null) {
    return {
      status: "insufficient_data",
      reason: `Baseline does not define ${label}; cannot compare.`,
    };
  }
  if (observedValue > threshold) {
    return { status: "above_baseline", reason: null };
  }
  if (observedValue < threshold) {
    return {
      status: "below_baseline",
      reason: `Observed ${label} (${observedValue}) is below baseline expectation (${threshold}).`,
    };
  }
  return { status: "within_baseline", reason: null };
}

/**
 * @param {number|null} expectedRate
 * @param {number|null|undefined} observedRate
 */
function compareConversion(expectedRate, observedRate) {
  if (expectedRate === null) {
    return {
      status: "insufficient_data",
      reason: "Baseline does not define expectedConversionRate; cannot compare conversion.",
    };
  }
  if (observedRate === null || observedRate === undefined) {
    return {
      status: "insufficient_data",
      reason: "Observed conversionRate is null; cannot compare to baseline expectation.",
    };
  }
  const diff = observedRate - expectedRate;
  if (Math.abs(diff) <= CONVERSION_EPS) {
    return { status: "within_baseline", reason: null };
  }
  if (observedRate > expectedRate) {
    return { status: "above_baseline", reason: null };
  }
  return {
    status: "below_baseline",
    reason: `Observed conversion (${String(observedRate)}) is below baseline expectation (${String(expectedRate)}).`,
  };
}

/**
 * @param {Array<{ status: MetricOutcome }>} parts
 */
function aggregateEarlyOutcomeStatus(parts) {
  const compared = parts.filter((p) => p.status !== "insufficient_data");
  if (compared.length === 0) {
    return "insufficient_data";
  }
  if (compared.some((p) => p.status === "below_baseline")) {
    return "below_baseline";
  }
  if (compared.some((p) => p.status === "above_baseline")) {
    return "above_baseline";
  }
  return "within_baseline";
}

/**
 * @param {ObservedLaunch} observed
 * @param {unknown} launchPlanDoc
 * @param {unknown} baselineDoc
 */
function compareObservedVsBaseline(observed, launchPlanDoc, baselineDoc) {
  const lp = launchPlanFields(launchPlanDoc);
  const reasons = [];

  if (lp.runId !== observed.runId) {
    reasons.push(`Observed runId (${observed.runId}) does not match launch_plan.json run.runId (${lp.runId}).`);
  }
  if (lp.listingSlug !== observed.listingKey) {
    reasons.push(
      `Observed listingKey (${observed.listingKey}) does not match launch_plan.json run.listingSlug (${lp.listingSlug}).`,
    );
  }
  if (lp.title !== null && normTitle(observed.plannedTitle) !== normTitle(lp.title)) {
    reasons.push("Observed plannedTitle does not match launch_plan.json product.title (after trim+NFC).");
  }
  if (lp.launchPrice !== null && observed.plannedPrice !== lp.launchPrice) {
    reasons.push(`Observed plannedPrice (${observed.plannedPrice}) does not match launch_plan.json pricing.launchPrice (${lp.launchPrice}).`);
  }

  const plannedTitleN = normTitle(observed.plannedTitle);
  const actualTitleN = normTitle(observed.actualTitle);
  const titleMatch = actualTitleN === plannedTitleN;
  const priceMatch = observed.actualPrice === observed.plannedPrice;

  if (titleMatch !== !observed.titleChanged) {
    reasons.push("Inconsistency: titleChanged flag does not match planned vs actual title equality.");
  }
  if (priceMatch !== !observed.priceChanged) {
    reasons.push("Inconsistency: priceChanged flag does not match planned vs actual price equality.");
  }

  const materialTitleOrPrice = !titleMatch || !priceMatch;
  const materialContent = observed.descriptionChanged || observed.assetChanged;
  const materialIssues = observed.launchIssues.length > 0;

  /** @type {"exact_match"|"minor_drift"|"material_drift"} */
  let launchFidelityStatus;
  if (materialTitleOrPrice || materialContent || materialIssues) {
    launchFidelityStatus = "material_drift";
  } else if (observed.manualAdjustments.length > 0) {
    launchFidelityStatus = "minor_drift";
  } else {
    launchFidelityStatus = "exact_match";
  }

  if (launchFidelityStatus === "material_drift") {
    if (materialTitleOrPrice) {
      if (!titleMatch) {
        reasons.push("Material drift: displayed title differs from planned title.");
      }
      if (!priceMatch) {
        reasons.push("Material drift: displayed price differs from planned price.");
      }
    }
    if (observed.descriptionChanged) {
      reasons.push("Material drift: descriptionChanged is true.");
    }
    if (observed.assetChanged) {
      reasons.push("Material drift: assetChanged is true.");
    }
    for (const issue of observed.launchIssues.slice().sort((a, b) => a.localeCompare(b))) {
      reasons.push(`Launch issue recorded: ${issue}`);
    }
  } else if (launchFidelityStatus === "minor_drift") {
    reasons.push("Minor drift: manualAdjustments is non-empty while title/price/content matched and no launch issues.");
    for (const adj of observed.manualAdjustments.slice().sort((a, b) => a.localeCompare(b))) {
      reasons.push(`Manual adjustment: ${adj}`);
    }
  }

  const changedFields = {
    title: !titleMatch,
    price: !priceMatch,
    description: observed.descriptionChanged,
    asset: observed.assetChanged,
  };

  const thresholds = baselineOutcomeThresholds(baselineDoc);

  const salesPart = compareIntegerThreshold("salesCount", thresholds.expectedSalesMin, observed.salesCount);
  const revenuePart = compareIntegerThreshold("grossRevenue", thresholds.expectedRevenueMin, observed.grossRevenue);
  const convPart = compareConversion(thresholds.expectedConversionRate, observed.conversionRate);

  if (salesPart.reason) {
    reasons.push(salesPart.reason);
  }
  if (revenuePart.reason) {
    reasons.push(revenuePart.reason);
  }
  if (convPart.reason) {
    reasons.push(convPart.reason);
  }

  const earlyParts = [
    { status: salesPart.status },
    { status: revenuePart.status },
    { status: convPart.status },
  ];
  const earlyOutcomeStatus = aggregateEarlyOutcomeStatus(earlyParts);

  /**
   * overallStatus: deterministic composition of launchFidelityStatus + earlyOutcomeStatus.
   * Values: material_drift | minor_drift | below_baseline | above_baseline | within_baseline | insufficient_outcome_data
   * @type {"material_drift"|"minor_drift"|"below_baseline"|"above_baseline"|"within_baseline"|"insufficient_outcome_data"}
   */
  let overallStatus;
  if (launchFidelityStatus === "material_drift") {
    overallStatus = "material_drift";
  } else if (launchFidelityStatus === "minor_drift") {
    overallStatus = "minor_drift";
  } else if (earlyOutcomeStatus === "below_baseline") {
    overallStatus = "below_baseline";
  } else if (earlyOutcomeStatus === "above_baseline") {
    overallStatus = "above_baseline";
  } else if (earlyOutcomeStatus === "within_baseline") {
    overallStatus = "within_baseline";
  } else {
    overallStatus = "insufficient_outcome_data";
  }

  const sortedReasons = reasons.slice().sort((a, b) => a.localeCompare(b));

  return {
    identity: {
      runId: observed.runId,
      listingKey: observed.listingKey,
      gumroadProductUrl: observed.gumroadProductUrl,
    },
    launchFidelity: {
      plannedVersusActualTitle: {
        planned: plannedTitleN,
        actual: actualTitleN,
        match: titleMatch,
      },
      plannedVersusActualPrice: {
        planned: observed.plannedPrice,
        actual: observed.actualPrice,
        match: priceMatch,
      },
      changedFieldsSummary: changedFields,
      manualAdjustmentsSummary: observed.manualAdjustments.slice().sort((a, b) => a.localeCompare(b)),
      launchIssuesSummary: observed.launchIssues.slice().sort((a, b) => a.localeCompare(b)),
    },
    earlyOutcome: {
      salesVersusBaseline: {
        status: salesPart.status,
        observed: observed.salesCount,
        baselineExpectedSalesMin: thresholds.expectedSalesMin,
      },
      revenueVersusBaseline: {
        status: revenuePart.status,
        observed: observed.grossRevenue,
        baselineExpectedRevenueMin: thresholds.expectedRevenueMin,
      },
      conversionVersusBaseline: {
        status: convPart.status,
        observed: observed.conversionRate === undefined ? null : observed.conversionRate,
        baselineExpectedConversionRate: thresholds.expectedConversionRate,
      },
    },
    status: {
      launchFidelityStatus,
      earlyOutcomeStatus,
      overallStatus,
    },
    reasons: sortedReasons,
  };
}

module.exports = {
  compareObservedVsBaseline,
  stableJson,
  normTitle,
  launchPlanFields,
  baselineOutcomeThresholds,
};
