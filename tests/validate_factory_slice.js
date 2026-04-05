#!/usr/bin/env node
/**
 * Validates the latest props_ev_blueprint factory run: files, non-empty content,
 * placeholder leakage, and common mojibake markers.
 */

const fs = require("fs");
const path = require("path");

const PRODUCT_ID = "props_ev_blueprint";
const OUTPUT_ROOT = path.join(process.cwd(), "outputs", PRODUCT_ID);
const RUNS_PATH = path.join(process.cwd(), "state", "runs.jsonl");

const MD_FILES = [
  "template_content.md",
  "listing.md",
  "marketing_campaign.md",
  "video_script.md",
  "photo_description.md",
];
const SNAPSHOT = "manifest.snapshot.json";

function die(msg) {
  process.stderr.write(String(msg) + "\n");
  process.exit(1);
}

function readRunsLatest() {
  if (!fs.existsSync(RUNS_PATH)) return null;
  const raw = fs.readFileSync(RUNS_PATH, "utf8");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return null;
  try {
    return JSON.parse(lines[lines.length - 1]);
  } catch {
    return null;
  }
}

function listRunDirs() {
  if (!fs.existsSync(OUTPUT_ROOT)) return [];
  return fs
    .readdirSync(OUTPUT_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function resolveLatestRunDir() {
  const fromLog = readRunsLatest();
  if (fromLog && fromLog.productId === PRODUCT_ID && fromLog.outputDir) {
    const p = path.join(process.cwd(), fromLog.outputDir);
    if (fs.existsSync(p)) return { dir: p, source: "state/runs.jsonl" };
  }

  const dirs = listRunDirs();
  if (dirs.length === 0) {
    die(`No runs found under outputs/${PRODUCT_ID}/ and no valid ${RUNS_PATH} entry.`);
  }
  dirs.sort();
  const latest = dirs[dirs.length - 1];
  return { dir: path.join(OUTPUT_ROOT, latest), source: "directory sort (fallback)" };
}

function hasPlaceholderLeakage(text) {
  const lower = text.toLowerCase();
  if (lower.includes("yourusername")) return "yourusername";
  if (/\bTODO\b/i.test(text)) return "TODO";
  if (/\bTBD\b/i.test(text)) return "TBD";
  return null;
}

function hasMojibakeMarkers(text) {
  if (/\uFFFD/.test(text)) return "U+FFFD replacement character";
  if (text.includes("�")) return "replacement marker";
  // Known corrupt sequences from mis-decoded UTF-8 in English copy
  if (/≡ƒ/.test(text)) return "sequence ≡ƒ (encoding corruption)";
  if (/Γöé/.test(text)) return "sequence Γöé (encoding corruption)";
  if (/â€[™"˜]/.test(text)) return "curly-quote mojibake (â€…)";
  return null;
}

function validateFile(runDir, name, isJson) {
  const fp = path.join(runDir, name);
  if (!fs.existsSync(fp)) die(`Missing file: ${fp}`);
  const buf = fs.readFileSync(fp);
  if (buf.length === 0) die(`Empty file: ${fp}`);

  const text = buf.toString("utf8");
  if (text.trim().length === 0) die(`Whitespace-only file: ${fp}`);

  const badPh = hasPlaceholderLeakage(text);
  if (badPh) die(`Placeholder leakage (${badPh}) in ${name}`);

  const badMo = hasMojibakeMarkers(text);
  if (badMo) die(`Possible encoding issue (${badMo}) in ${name}`);

  if (isJson) {
    try {
      JSON.parse(text);
    } catch (e) {
      die(`Invalid JSON in ${name}: ${e.message}`);
    }
  }
}

function main() {
  const { dir: runDir, source } = resolveLatestRunDir();
  process.stdout.write(`Validating latest run: ${runDir}\n`);
  process.stdout.write(`Resolved via: ${source}\n`);

  for (const f of MD_FILES) {
    validateFile(runDir, f, false);
  }
  validateFile(runDir, SNAPSHOT, true);

  process.stdout.write("Factory slice validation passed.\n");
}

main();
