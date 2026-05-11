/**
 * seed-outreach-agons — one-shot script that hydrates the agons table
 * with the 30 outreach debate transcripts from docs/outreach-debates/*.md
 * so /agora/a/<slug> resolves for every recipient URL in the outreach
 * email batch (per docs/output/debate-transcript-publishing-playbook.md).
 *
 * Why `id = share_id = <slug>` (e.g. `abhishek-chakravarty`):
 *   - The outreach emails reference URLs of the form /agora/a/<slug>.
 *     The public page at app/agora/a/[id]/page.tsx looks up by share_id
 *     directly via db.getPublicAgonByShareId, bypassing the looksLikeShareId
 *     format guard on the API route — this is intentional, see the
 *     comment block at the top of that page.tsx.
 *   - The agons table's `id` column is `TEXT PRIMARY KEY DEFAULT
 *     gen_random_uuid()::text`, which accepts arbitrary slug values. We
 *     pin `id` to the slug so a re-run upserts the same row (ON CONFLICT
 *     (id) DO UPDATE) — no orphaned duplicates if the script runs twice.
 *   - `clerk_user_id = 'system'` keeps these rows out of every real user's
 *     /library list while still satisfying ON CONFLICT semantics.
 *
 * Idempotency:
 *   - Each row is inserted with ON CONFLICT (id) DO UPDATE, so re-running
 *     the script after editing a transcript file refreshes the row in
 *     place. The created_at timestamp is preserved on update; updated_at
 *     is bumped to NOW().
 *
 * NOT auto-run on build. Invoke explicitly:
 *
 *     # from repo root
 *     POSTGRES_URL=... npx tsx website/scripts/seed-outreach-agons.ts
 *
 *     # or from website/
 *     cd website && POSTGRES_URL=... npx tsx scripts/seed-outreach-agons.ts
 *
 * Both invocations work — `findDebatesDir` probes both candidate paths.
 *
 * Acceptance check after run:
 *
 *     curl https://www.consultthedead.com/agora/a/abhishek-chakravarty
 *
 *     # /api/library/<slug> currently returns 404 because looksLikeShareId
 *     # in lib/share-id.ts filters out hyphens. That's a follow-up edit
 *     # tracked separately (see PR body). The /agora/a/[id] page does NOT
 *     # depend on that regex and renders the row correctly.
 */
import fs from "node:fs";
import path from "node:path";

import { sql } from "@vercel/postgres";

import { parseOutreachMd } from "@/lib/parseOutreachMd";
import type { FrameworkSlug } from "@/lib/frameworks";

/* ── Pure helpers (unit-tested) ─────────────────────────────── */

/**
 * Strip the .md suffix from a filename to derive the slug used as both
 * `id` and `share_id` in the agons row.
 *
 * The seed dir only contains `<slug>.md` files; this is intentionally
 * a thin helper so the test suite can pin the contract.
 */
export function slugFromFilename(filename: string): string {
  return filename.replace(/\.md$/i, "");
}

/**
 * Locate `docs/outreach-debates/` regardless of whether the script is
 * invoked from the repo root or from `website/`. Throws if the
 * directory is missing — failing loudly is preferable to silently
 * seeding an empty set.
 */
export function findDebatesDir(cwd: string = process.cwd()): string {
  const candidates = [
    path.resolve(cwd, "docs", "outreach-debates"),
    path.resolve(cwd, "..", "docs", "outreach-debates"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error(
    `docs/outreach-debates not found. Tried: ${candidates.join(", ")}`,
  );
}

/**
 * Build the row payload from a slug + raw markdown. Pure — exposed for
 * the unit-test suite so the SQL layer doesn't have to be mocked.
 */
export interface SeedRow {
  id: string;
  shareId: string;
  topic: string;
  mindSlugs: FrameworkSlug[];
  rounds: number;
  turnsJson: string;
  consensusJson: string;
  mindSlugsLiteral: string;
}

export function buildSeedRow(slug: string, md: string): SeedRow {
  const parsed = parseOutreachMd(md);
  return {
    id: slug,
    shareId: slug,
    topic: parsed.topic,
    mindSlugs: parsed.mindSlugs,
    rounds: parsed.rounds,
    turnsJson: JSON.stringify(parsed.turns),
    consensusJson: JSON.stringify(parsed.consensus),
    // TEXT[] must be passed as a Postgres array literal. @vercel/postgres
    // tagged-template slots only accept Primitive values.
    mindSlugsLiteral: `{${parsed.mindSlugs.join(",")}}`,
  };
}

/* ── DB write ────────────────────────────────────────────────── */

/**
 * Upsert one row into the agons table. ON CONFLICT (id) DO UPDATE
 * makes the seed safe to re-run after transcript edits.
 *
 * `created_at` is intentionally not in the UPDATE set — preserves the
 * original creation timestamp across re-runs.
 */
async function upsertAgon(row: SeedRow): Promise<void> {
  await sql`
    INSERT INTO agons (
      id, clerk_user_id, share_id, topic, mind_slugs, rounds, turns, consensus, research
    ) VALUES (
      ${row.id},
      'system',
      ${row.shareId},
      ${row.topic},
      ${row.mindSlugsLiteral}::text[],
      ${row.rounds},
      ${row.turnsJson}::jsonb,
      ${row.consensusJson}::jsonb,
      NULL
    )
    ON CONFLICT (id) DO UPDATE SET
      share_id   = EXCLUDED.share_id,
      topic      = EXCLUDED.topic,
      mind_slugs = EXCLUDED.mind_slugs,
      rounds     = EXCLUDED.rounds,
      turns      = EXCLUDED.turns,
      consensus  = EXCLUDED.consensus,
      research   = EXCLUDED.research,
      updated_at = now()
  `;
}

/* ── Entry point ─────────────────────────────────────────────── */

interface SeedSummary {
  ok: number;
  failed: number;
  failures: { slug: string; error: string }[];
}

async function main(): Promise<SeedSummary> {
  if (!process.env.POSTGRES_URL && !process.env.POSTGRES_URL_NON_POOLING) {
    console.error(
      "POSTGRES_URL is not set. Run with `POSTGRES_URL=... npx tsx …`.",
    );
    process.exit(1);
  }

  const debatesDir = findDebatesDir();
  const files = fs
    .readdirSync(debatesDir)
    .filter((f) => f.endsWith(".md"))
    .sort();

  console.log(`Seeding ${files.length} outreach agons from ${debatesDir}`);

  const summary: SeedSummary = { ok: 0, failed: 0, failures: [] };
  for (const file of files) {
    const slug = slugFromFilename(file);
    try {
      const md = fs.readFileSync(path.join(debatesDir, file), "utf-8");
      const row = buildSeedRow(slug, md);
      await upsertAgon(row);
      console.log(`  ✓ ${slug}`);
      summary.ok++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${slug}: ${msg}`);
      summary.failures.push({ slug, error: msg });
      summary.failed++;
    }
  }

  console.log(`\nDone. ${summary.ok} seeded, ${summary.failed} failed.`);
  if (summary.failed > 0) process.exit(1);
  return summary;
}

/**
 * Auto-run guard. The module is designed to be importable by the
 * vitest suite for testing the pure helpers; we only invoke main()
 * when the file is being executed as a script, not when imported.
 *
 * `process.env.VITEST` is set by vitest at runtime. The argv check is
 * a defensive backstop for any other runner that imports this file.
 */
function isInvokedDirectly(): boolean {
  if (process.env.VITEST) return false;
  if (process.env.NODE_ENV === "test") return false;
  const argv1 = process.argv[1];
  if (typeof argv1 !== "string") return false;
  return argv1.endsWith("seed-outreach-agons.ts") || argv1.endsWith("seed-outreach-agons.js");
}

if (isInvokedDirectly()) {
  void main();
}

export { main };
