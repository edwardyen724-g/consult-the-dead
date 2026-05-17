import { getAllDebateSlugs, getDebate } from "@/lib/debates";
import { INSIGHT_ENTRIES } from "@/lib/insights";
import {
  buildFeedMetadata,
  buildPublicFeedItems,
  serializeRssFeed,
} from "@/lib/rss-feed";
import { getActiveDecisions } from "../../../content/decisions";

export const revalidate = 3600;

const SITE_URL = "https://www.consultthedead.com";

export async function GET() {
  const now = new Date();
  const debates = getAllDebateSlugs()
    .map((slug) => getDebate(slug))
    .filter((debate): debate is NonNullable<typeof debate> => debate !== null);
  const metadata = buildFeedMetadata(SITE_URL);
  const items = buildPublicFeedItems({
    siteUrl: SITE_URL,
    debates,
    insightEntries: INSIGHT_ENTRIES,
    decisionEntries: getActiveDecisions(now),
    now,
  });
  const xml = serializeRssFeed({
    metadata,
    items,
    now,
  });

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
