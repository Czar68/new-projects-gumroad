#!/usr/bin/env node
/**
 * Manifest-driven factory: single product `props_ev_blueprint`.
 * Writes run-scoped outputs under outputs/props_ev_blueprint/<run_id>/ and appends state/runs.jsonl
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PRODUCT_ID = "props_ev_blueprint";
const MANIFEST_PATH = path.join("manifests", `${PRODUCT_ID}.json`);
const OUTPUT_ROOT = path.join("outputs", PRODUCT_ID);
const STATE_DIR = "state";
const RUNS_PATH = path.join(STATE_DIR, "runs.jsonl");

function readManifest() {
  const abs = path.join(process.cwd(), MANIFEST_PATH);
  const raw = fs.readFileSync(abs, "utf8");
  return JSON.parse(raw);
}

function assertManifest(m) {
  if (m.productId !== PRODUCT_ID) {
    throw new Error(`Expected productId ${PRODUCT_ID}, got ${m.productId}`);
  }
}

function makeRunId() {
  const iso = new Date().toISOString().replace(/[:.]/g, "-");
  const suffix = crypto.randomBytes(4).toString("hex");
  return `${iso}_${suffix}`;
}

function writeUtf8(filePath, body) {
  fs.writeFileSync(filePath, body, { encoding: "utf8" });
}

function buildTemplateContent(m) {
  return `# ${m.title}

## What you get

${m.description}

## Who it is for

${m.audience}

## How to use your copy

1. Open the blueprint link in a browser while signed into Google.
2. Use **File → Make a copy** and save it to your Drive with a name you recognize.
3. Set your bankroll and fair percentages in the sheet, then add rows for each prop you track.
4. Extend the sheet as you add books, markets, or seasons—your copy stays under your control.

## Feature highlights

${m.keyFeatures.map((x) => `- ${x}`).join("\n")}

## Voice and positioning

${m.brandVoice}

## Source blueprint

${m.sheetUrl}
`;
}

function buildListing(m) {
  return `# ${m.title}

${m.tagline}

## Summary

${m.description}

## Highlights

${m.listingBullets.map((b) => `- ${b}`).join("\n")}

## Blueprint

Open the Google Sheet blueprint here: ${m.sheetUrl}

After purchase, make your own copy from **File → Make a copy** so you own the data in your Drive.
`;
}

function buildMarketing(m) {
  return `# Marketing campaign — ${m.title}

## Core message

${m.tagline}

## Audience

${m.audience}

## Hooks to test

${m.campaignHooks.map((h, i) => `${i + 1}. ${h}`).join("\n\n")}

## Supporting points

${m.keyFeatures.map((f) => `- ${f}`).join("\n")}

## Call to action

Copy the blueprint, name your sheet, and run every prop through the same EV structure this season.
`;
}

function buildVideoScript(m) {
  return `# Video script — ${m.title}

**Runtime target:** 60–90 seconds

## Beats

${m.videoBeats.map((b, i) => `### Scene ${i + 1}\n${b}\n`).join("\n")}

## On-screen note

Display the sheet URL briefly: ${m.sheetUrl}

## Outro

Remind viewers they duplicate the master into their Drive and customize bankroll and fair percentages.
`;
}

function buildPhotoDescription(m) {
  return `# Photo and thumbnail direction — ${m.title}

## Scenes

${m.photoScenes.map((s, i) => `${i + 1}. ${s}`).join("\n\n")}

## Style

Clean, credible, spreadsheet-forward. Natural light or soft desk lamp; avoid cluttered betting slips as the hero—let the sheet be the focus.

## Brand alignment

${m.brandVoice}
`;
}

function appendRunRecord(record) {
  const line = JSON.stringify(record) + "\n";
  fs.mkdirSync(path.join(process.cwd(), STATE_DIR), { recursive: true });
  fs.appendFileSync(path.join(process.cwd(), RUNS_PATH), line, "utf8");
}

function main() {
  const manifest = readManifest();
  assertManifest(manifest);

  const runId = makeRunId();
  const runDir = path.join(process.cwd(), OUTPUT_ROOT, runId);
  fs.mkdirSync(runDir, { recursive: true });

  const generatedAt = new Date().toISOString();
  const snapshot = {
    ...manifest,
    _factory: {
      runId,
      generatedAt,
      generator: "scripts/factory_generate.js",
      manifestPath: MANIFEST_PATH,
    },
  };

  writeUtf8(path.join(runDir, "template_content.md"), buildTemplateContent(manifest));
  writeUtf8(path.join(runDir, "listing.md"), buildListing(manifest));
  writeUtf8(path.join(runDir, "marketing_campaign.md"), buildMarketing(manifest));
  writeUtf8(path.join(runDir, "video_script.md"), buildVideoScript(manifest));
  writeUtf8(path.join(runDir, "photo_description.md"), buildPhotoDescription(manifest));
  writeUtf8(
    path.join(runDir, "manifest.snapshot.json"),
    JSON.stringify(snapshot, null, 2) + "\n"
  );

  const relativeRunDir = path.join(OUTPUT_ROOT, runId).split(path.sep).join("/");
  appendRunRecord({
    runId,
    productId: PRODUCT_ID,
    outputDir: relativeRunDir,
    createdAt: generatedAt,
    manifestPath: MANIFEST_PATH.split(path.sep).join("/"),
  });

  process.stdout.write(`Factory run complete: ${relativeRunDir}\n`);
  process.stdout.write(`Appended run to ${RUNS_PATH}\n`);
}

main();
