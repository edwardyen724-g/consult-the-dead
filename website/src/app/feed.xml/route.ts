import { getAllDebateSlugs, getDebate } from "@/lib/debates";
import { INSIGHT_ENTRIES } from "@/lib/insights";
import {
  buildFeedMetadata,
  buildPublicFeedItems,
  serializeRssFeed,
} from "@/lib/feed";

export const runtime = "nodejs";
export const revalidate = 3600;

const SITE_URL = "https://www.consultthedead.com";

export async function GET() {
  const debates = getAllDebateSlugs()
    .map((slug) => getDebate(slug))
    .filter((debate): debate is NonNullable<typeof debate> => debate !== null);

  const now = new Date();
  const xml = serializeRssFeed({
    metadata: buildFeedMetadata(SITE_URL),
    items: buildPublicFeedItems({
      siteUrl: SITE_URL,
      debates,
      insightEntries: INSIGHT_ENTRIES,
      now,
    }),
    now,
  });

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
