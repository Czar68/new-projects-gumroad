#!/usr/bin/env node
/**
 * Verifies observed-vs-baseline seam: core comparator + CLI writes deterministic artifact.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

const { compareObservedVsBaseline } = require("../scripts/compare_observed_vs_baseline_core.js");
const { validateObservedLaunchObject } = require("../scripts/observed_launch_loader.js");

const FIX = path.join(process.cwd(), "tests", "fixtures", "observed_vs_baseline");

function die(msg) {
  process.stderr.write(String(msg) + "\n");
  process.exit(1);
}

function loadJson(name) {
  const p = path.join(FIX, name);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function assert(cond, msg) {
  if (!cond) die(msg);
}

function main() {
  const launchPlan = loadJson("launch_plan.json");
  const baselineWith = loadJson("post_launch_baseline.json");
  const baselineWithout = loadJson("post_launch_baseline_no_expectations.json");

  const observedExactRaw = loadJson("observed_exact.json");
  const observed = validateObservedLaunchObject(observedExactRaw);

  const r1 = compareObservedVsBaseline(observed, launchPlan, baselineWith);
  assert(r1.status.launchFidelityStatus === "exact_match", "expected exact_match");
  assert(r1.status.earlyOutcomeStatus === "above_baseline", "expected early above_baseline");
  assert(r1.status.overallStatus === "above_baseline", "expected overall above_baseline");
  assert(r1.identity.runId === "fixture_run_1", "identity runId");
  assert(Array.isArray(r1.reasons), "reasons array");

  const r2 = compareObservedVsBaseline(observed, launchPlan, baselineWithout);
  assert(r2.status.earlyOutcomeStatus === "insufficient_data", "no expectations => insufficient_data");
  assert(r2.status.overallStatus === "insufficient_outcome_data", "overall insufficient_outcome_data");

  const observedMat = validateObservedLaunchObject(loadJson("observed_material.json"));
  const r3 = compareObservedVsBaseline(observedMat, launchPlan, baselineWith);
  assert(r3.status.launchFidelityStatus === "material_drift", "material drift");
  assert(r3.status.overallStatus === "material_drift", "overall material_drift");

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ovb-"));
  const productRoot = tmp;
  const runDir = path.join(tmp, "fixture_run_1");
  fs.mkdirSync(runDir, { recursive: true });
  fs.writeFileSync(path.join(productRoot, "launch_plan.json"), JSON.stringify(launchPlan), "utf8");
  fs.writeFileSync(path.join(productRoot, "post_launch_baseline.json"), JSON.stringify(baselineWith), "utf8");
  const observedPath = path.join(runDir, "observed_in.json");
  fs.writeFileSync(observedPath, JSON.stringify(observedExactRaw), "utf8");

  const cli = path.join(process.cwd(), "scripts", "compare-observed-vs-baseline.js");
  execFileSync(process.execPath, [cli, "--observed", observedPath, "--run-dir", runDir, "--product-root", productRoot], {
    stdio: "pipe",
    encoding: "utf8",
  });

  const outPath = path.join(runDir, "observed-vs-baseline.json");
  assert(fs.existsSync(outPath), "CLI should write observed-vs-baseline.json");
  const written = JSON.parse(fs.readFileSync(outPath, "utf8"));
  assert(written.status.overallStatus === "above_baseline", "artifact overallStatus");

  fs.rmSync(tmp, { recursive: true, force: true });

  process.stdout.write("OK: observed-vs-baseline seam\n");
}

main();
