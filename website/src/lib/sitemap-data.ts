/**
 * Pure helpers + DB fetch for the sitemap.ts route.
 *
 * Kept separate so the URL-builder is unit-testable without booting Next.js
 * or hitting Postgres. The sitemap.ts entry point composes the helpers and
 * keeps a minimal `try { fetch } catch { fall back to empty list }` so a
 * transient DB error never breaks /sitemap.xml generation for the rest of
 * the URL-set (frameworks, insights, and the top-level public pages).
 *
 * Public-agon URL emission is the SEO half of the founder distribution
 * directive: the 30 outreach-email landing pages (seed task 69b1c08d) plus
 * any future user-shared agons need to be crawlable so Google Search
 * Console can index them.
 */
import type { MetadataRoute } from "next";

import type { FrameworkSlug } from "@/lib/frameworks";
import type { InsightEntry } from "@/lib/insights";

/* ── DB fetch ────────────────────────────────────────────────────────
   Returns the share_id of every agon that should be publicly indexed.
   The acceptance criterion is `clerk_user_id = 'system' OR is_public
   = TRUE`. Because the `is_public` column may or may not exist at any
   given deployment moment (the seed task 69b1c08d may ship before
   the column migration, or after), the fetch tries the full query
   first and falls back to the system-only query on Postgres error
   42703 (`undefined_column`). This keeps the 30 outreach slugs in
   the sitemap even before the schema is fully migrated.
   ────────────────────────────────────────────────────────────────── */

export interface PublicAgonRow {
  share_id: string;
  updated_at: string | null;
}

/**
 * Minimal structural type for the bound `@vercel/postgres` `sql` tag —
 * narrow enough that a test can pass a stub without importing the SDK,
 * wide enough to match the production tagged-template usage below.
 */
export type SqlClient = <T = unknown>(
  template: TemplateStringsArray,
  ...values: unknown[]
) => Promise<{ rows: T[] }>;

/**
 * Postgres `undefined_column` error code. Used to detect that the
 * `is_public` migration has not yet run so we can transparently fall
 * back to a system-only query. Anything else propagates up.
 */
const PG_UNDEFINED_COLUMN = "42703";

/**
 * SQL passthrough: returns the share_id + updated_at of every agon
 * that should be publicly indexed. Today that's:
 *   - `clerk_user_id = 'system'` (the seed-script slugs from
 *     69b1c08d), AND
 *   - `is_public = TRUE` (future user-shared agons, once that column
 *     migration runs).
 *
 * The `sql` client is injected (default: `@vercel/postgres`) so the
 * unit test can exercise the WHERE/ORDER shape without booting
 * Postgres.
 */
export async function fetchPublicAgonRows(
  sqlClient?: SqlClient,
): Promise<PublicAgonRow[]> {
  const client =
    sqlClient ??
    ((await import("@vercel/postgres")).sql as unknown as SqlClient);

  try {
    const result = await client<PublicAgonRow>`
      SELECT share_id, updated_at
      FROM agons
      WHERE clerk_user_id = 'system'
         OR is_public = TRUE
      ORDER BY share_id
    `;
    return result.rows;
  } catch (err) {
    if (isUndefinedColumnError(err)) {
      // Schema migration for `is_public` hasn't run yet — fall back
      // to the seed-script subset so the 30 outreach URLs still
      // appear in /sitemap.xml.
      const result = await client<PublicAgonRow>`
        SELECT share_id, updated_at
        FROM agons
        WHERE clerk_user_id = 'system'
        ORDER BY share_id
      `;
      return result.rows;
    }
    throw err;
  }
}

/**
 * Detect the Postgres `undefined_column` error code on a thrown
 * value, regardless of whether it surfaces as `err.code`,
 * `err.cause.code`, or in the message. Exported for unit testing.
 */
export function isUndefinedColumnError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: unknown; cause?: { code?: unknown }; message?: unknown };
  if (e.code === PG_UNDEFINED_COLUMN) return true;
  if (e.cause && typeof e.cause === "object" && (e.cause as { code?: unknown }).code === PG_UNDEFINED_COLUMN) {
    return true;
  }
  if (typeof e.message === "string" && e.message.includes("is_public")) {
    return /column .*is_public.* does not exist/i.test(e.message);
  }
  return false;
}

/* ── Pure URL builder ────────────────────────────────────────────────
   Composes the full sitemap entry list from already-fetched data.
   Pure so vitest can exercise every branch without mocks beyond the
   inputs.
   ────────────────────────────────────────────────────────────────── */

export interface BuildSitemapEntriesInput {
  siteUrl: string;
  allowedSlugs: readonly FrameworkSlug[];
  insightEntries: readonly InsightEntry[];
  publicAgons: readonly PublicAgonRow[];
  /**
   * Injected so tests are deterministic. Production passes `new Date()`.
   */
  now: Date;
}

/**
 * Build the full sitemap entry list. Returns a `MetadataRoute.Sitemap`
 * shape so `sitemap.ts` can simply spread it.
 *
 * Rules:
 *   - Top-level public pages (home, /essay, /agora, /pricing,
 *     /frameworks, /insights) come first.
 *   - Per-framework + per-insight pages preserve the existing priorities
 *     (0.7 / 0.8) and changeFrequency ("monthly").
 *   - Public agon pages get changeFrequency: "weekly", priority: 0.7
 *     per the task spec.
 *   - Public agon `lastModified` prefers the row's `updated_at` when
 *     present; falls back to `now` so a row with NULL never breaks
 *     the sitemap.
 *   - Empty `siteUrl` is treated as a programmer error and produces a
 *     leading slash so URLs are still relative-rooted.
 */
export function buildSitemapEntries(
  input: BuildSitemapEntriesInput,
): MetadataRoute.Sitemap {
  const { siteUrl, allowedSlugs, insightEntries, publicAgons, now } = input;
  const origin = siteUrl ?? "";

  const topLevel: MetadataRoute.Sitemap = [
    {
      url: origin,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${origin}/essay`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${origin}/agora`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${origin}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${origin}/frameworks`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${origin}/insights`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const frameworkPages: MetadataRoute.Sitemap = allowedSlugs.map((slug) => ({
    url: `${origin}/frameworks/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const insightPages: MetadataRoute.Sitemap = insightEntries.map((entry) => ({
    url: `${origin}/insights/${entry.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const publicAgonPages: MetadataRoute.Sitemap = publicAgons
    .filter((row) => typeof row.share_id === "string" && row.share_id.length > 0)
    .map((row) => ({
      url: `${origin}/agora/a/${row.share_id}`,
      lastModified: parseLastModified(row.updated_at, now),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [
    ...topLevel,
    ...frameworkPages,
    ...insightPages,
    ...publicAgonPages,
  ];
}

/**
 * Convert a Postgres `updated_at` timestamp into a `Date` suitable for
 * `MetadataRoute.Sitemap.lastModified`. Falls back to `now` when the
 * value is null / unparseable so we never produce `Invalid Date` in
 * the rendered XML.
 */
export function parseLastModified(
  raw: string | null | undefined,
  now: Date,
): Date {
  if (!raw) return now;
  const d = new Date(raw);
  return Number.isFinite(d.getTime()) ? d : now;
}
