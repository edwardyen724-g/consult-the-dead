#!/usr/bin/env tsx
/**
 * generate-all-reels.ts
 *
 * Generates a verdict-reel JSON artifact for every insight slug registered in
 * INSIGHT_ENTRIES, writing each file to scripts/reel-scripts/reels/<slug>.reel.json.
 *
 * Called automatically by the reel-auto-generate GitHub Actions workflow on every
 * merge to master that touches website/src/lib/insights.ts.  Can also be run
 * manually at any time — the output is deterministic and idempotent.
 *
 * Usage:
 *   npx tsx scripts/reel-scripts/generate-all-reels.ts [--verbose] [--dry-run]
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { INSIGHT_ENTRIES } from "../../website/src/lib/insights.js";
import {
  buildVerdictReelScript,
  renderVerdictReelScript,
} from "./generate-reel-scripts.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REELS_DIR = join(__dirname, "reels");

function parseArgs(argv: string[]): { verbose: boolean; dryRun: boolean } {
  return {
    verbose: argv.includes("--verbose") || argv.includes("-v"),
    dryRun: argv.includes("--dry-run"),
  };
}

export function generateAllReels(options: {
  verbose?: boolean;
  dryRun?: boolean;
  reelsDir?: string;
}): { generated: string[]; errors: Array<{ slug: string; error: string }> } {
  const reelsDir = options.reelsDir ?? REELS_DIR;
  const generated: string[] = [];
  const errors: Array<{ slug: string; error: string }> = [];

  if (!options.dryRun) {
    mkdirSync(reelsDir, { recursive: true });
  }

  for (const entry of INSIGHT_ENTRIES) {
    const { slug } = entry;
    try {
      const script = buildVerdictReelScript(slug);
      const json = renderVerdictReelScript(script);
      const outPath = join(reelsDir, `${slug}.reel.json`);

      if (!options.dryRun) {
        writeFileSync(outPath, json + "\n", "utf-8");
      }

      generated.push(slug);

      if (options.verbose) {
        process.stdout.write(`  ✓ ${slug}\n`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push({ slug, error: message });
      if (options.verbose) {
        process.stderr.write(`  ✗ ${slug}: ${message}\n`);
      }
    }
  }

  return { generated, errors };
}

const isMainModule = (() => {
  const entryPath = process.argv[1];
  if (!entryPath) return false;
  try {
    return join(entryPath) === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
})();

if (isMainModule) {
  const { verbose, dryRun } = parseArgs(process.argv.slice(2));

  if (dryRun) {
    process.stdout.write("Dry run — no files will be written.\n");
  } else {
    process.stdout.write(`Writing reel scripts to: ${REELS_DIR}\n`);
  }

  const { generated, errors } = generateAllReels({ verbose, dryRun });

  process.stdout.write(
    `\n${dryRun ? "Would generate" : "Generated"} ${generated.length} reel script${generated.length === 1 ? "" : "s"}`,
  );
  if (errors.length > 0) {
    process.stdout.write(`, ${errors.length} error${errors.length === 1 ? "" : "s"}`);
    for (const { slug, error } of errors) {
      process.stderr.write(`  ✗ ${slug}: ${error}\n`);
    }
    process.exitCode = 1;
  } else {
    process.stdout.write(".");
  }
  process.stdout.write("\n");
}
