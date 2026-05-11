/**
 * /sitemap.xml — public sitemap for SEO crawlers.
 *
 * Composition:
 *   - Top-level pages (home, /essay, /frameworks, /insights)
 *   - Per-framework pages (`ALLOWED_SLUGS`)
 *   - Per-insight pages (`INSIGHT_ENTRIES`)
 *   - Per-public-agon pages — `clerk_user_id='system'` rows from the
 *     `agons` table, plus any future `is_public=true` rows. The 30
 *     outreach-email slugs (seed task 69b1c08d) land here so Google
 *     Search Console can submit + crawl them; this is the SEO half
 *     of the founder distribution directive.
 *
 * The DB fetch is wrapped in a try/catch — a transient Postgres error
 * must NEVER take down /sitemap.xml entirely. Frameworks + insights are
 * static and crawler value is preserved even if the agons fetch fails.
 *
 * Revalidation: hourly. A fresh seed run shows up in the sitemap
 * within 60 minutes, which is well inside Google Search Console's
 * crawl cadence.
 */
import type { MetadataRoute } from "next";

import { ALLOWED_SLUGS } from "@/lib/frameworks";
import { INSIGHT_ENTRIES } from "@/lib/insights";
import { MIND_SLUGS } from "@/lib/mind-content";

import { buildSitemapEntries, fetchPublicAgonRows, type PublicAgonRow } from "@/lib/sitemap-data";

const SITE_URL = "https://www.consultthedead.com";

export const revalidate = 3600; // 1h

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let publicAgons: PublicAgonRow[] = [];
  try {
    publicAgons = await fetchPublicAgonRows();
  } catch (err) {
    console.error("[sitemap] failed to fetch public agon rows:", err);
  }

  const now = new Date();
  const mindPages: MetadataRoute.Sitemap = MIND_SLUGS.map((slug) => ({
    url: `${SITE_URL}/minds/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...buildSitemapEntries({
      siteUrl: SITE_URL,
      allowedSlugs: ALLOWED_SLUGS,
      insightEntries: INSIGHT_ENTRIES,
      publicAgons,
      now,
    }),
    ...mindPages,
  ];
}
