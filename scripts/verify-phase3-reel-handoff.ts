#!/usr/bin/env tsx
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const docPath = resolve(
  process.cwd(),
  "docs/plans/2026-05-12-phase3-reel-automation-handoff.md",
);

const doc = readFileSync(docPath, "utf8");

const requiredSections = [
  "# Phase 3 Reel Automation Handoff",
  "## 2. Template rules",
  "## 3. Handoff criteria",
  "## 4. Minimum automation contract",
  "## 5. Review workflow",
  "## 6. Exit criteria for Phase 3",
];

const requiredPhrases = [
  "25-40 seconds",
  "first 5 pilot reels",
  "same voice chain",
  "one-tap approval",
  "hook.voiceover",
  "hook.caption",
  "councilPass[]",
  "estimatedDurationSeconds",
  "dry-run path must produce a JSON artifact to stdout",
  "fail fast on unknown slugs",
];

for (const section of requiredSections) {
  if (!doc.includes(section)) {
    throw new Error(`Missing required section: ${section}`);
  }
}

for (const phrase of requiredPhrases) {
  if (!doc.includes(phrase)) {
    throw new Error(`Missing required contract phrase: ${phrase}`);
  }
}

if (!doc.includes("scripts/reel-scripts/generate-reel-scripts.ts")) {
  throw new Error("Missing canonical generator reference");
}

if (!doc.includes("MARKETING_STRATEGY.md") || !doc.includes("CONTENT_PIPELINE.md")) {
  throw new Error("Missing canonical marketing references");
}

console.log("Phase 3 reel automation handoff contract verified.");
