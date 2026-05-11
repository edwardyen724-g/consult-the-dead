import {
  getInsightEntry,
  getInsightPublishedAt,
  getInsightUrl,
  INSIGHT_ENTRIES,
  isCollisionInsightEntry,
  type InsightEntry,
} from "@/lib/insights";

export const revalidate = 3600;

type FeedItem = {
  title: string;
  description: string;
  link: string;
  guid: string;
  pubDate: Date;
};

const SITE_URL = "https://www.consultthedead.com";

export async function GET() {
  const items = buildFeedItems();
  const xml = buildRssXml(items);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

function buildFeedItems(): FeedItem[] {
  const insightItems = INSIGHT_ENTRIES.map((entry) => buildInsightFeedItem(entry));

  return insightItems.sort((a, b) => {
    const timeDelta = b.pubDate.getTime() - a.pubDate.getTime();
    if (timeDelta !== 0) return timeDelta;
    return a.title.localeCompare(b.title);
  });
}

function buildInsightFeedItem(entry: InsightEntry): FeedItem {
  const entryCopy = getInsightEntry(entry.slug) ?? entry;
  const frameworkHint = isCollisionInsightEntry(entryCopy)
    ? ` Featuring ${entryCopy.collisionFrameworkSlugs.join(" vs. ")}.`
    : "";

  return {
    title: entryCopy.title,
    description: `${entryCopy.description} ${entryCopy.hookQuestion}${frameworkHint}`.trim(),
    link: getInsightUrl(entryCopy.slug),
    guid: getInsightUrl(entryCopy.slug),
    pubDate: getInsightPublishedAt(entryCopy),
  };
}

function buildRssXml(items: FeedItem[]): string {
  const lastBuildDate = items[0]?.pubDate ?? new Date();
  const itemXml = items
    .map(
      (item) => `<item>
  <title>${escapeXml(item.title)}</title>
  <link>${escapeXml(item.link)}</link>
  <guid isPermaLink="true">${escapeXml(item.guid)}</guid>
  <pubDate>${item.pubDate.toUTCString()}</pubDate>
  <description>${escapeXml(item.description)}</description>
</item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Consult The Dead</title>
    <link>${SITE_URL}</link>
    <description>Insight articles from historical decision frameworks.</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>
    ${itemXml}
  </channel>
</rss>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
