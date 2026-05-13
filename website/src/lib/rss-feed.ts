import type { Debate } from "@/lib/debates";
import type { InsightEntry } from "@/lib/insights";
import type { DecisionEntry } from "../../content/decisions";

export const RSS_FEED_TITLE = "Consult The Dead — Debates, Insights, and Decisions";
export const RSS_FEED_DESCRIPTION =
  "Public debates, insights, and decision pages from Consult The Dead.";
export const RSS_FEED_LANGUAGE = "en-us";

const SITE_URL = "https://www.consultthedead.com";
const INSIGHT_COLLECTION_DATE = new Date("2026-05-03T00:00:00.000Z");

export interface FeedItem {
  title: string;
  description: string;
  link: string;
  guid: string;
  pubDate: Date;
}

export interface FeedMetadata {
  title: string;
  description: string;
  link: string;
  language: string;
  feedUrl: string;
}

export interface BuildPublicFeedItemsInput {
  siteUrl: string;
  debates: readonly Debate[];
  insightEntries: readonly InsightEntry[];
  decisionEntries?: readonly DecisionEntry[];
  now: Date;
}

export interface SerializeRssFeedInput {
  metadata: FeedMetadata;
  items: readonly FeedItem[];
  now: Date;
}

export function buildFeedMetadata(siteUrl: string): FeedMetadata {
  const origin = normalizeSiteUrl(siteUrl);
  return {
    title: RSS_FEED_TITLE,
    description: RSS_FEED_DESCRIPTION,
    link: origin || SITE_URL,
    language: RSS_FEED_LANGUAGE,
    feedUrl: `${origin || SITE_URL}/feed.xml`,
  };
}

export function buildPublicFeedItems(
  input: BuildPublicFeedItemsInput,
): FeedItem[] {
  const origin = normalizeSiteUrl(input.siteUrl) || SITE_URL;

  const debateItems = input.debates
    .map((debate) => {
      const pubDate = parseRssDate(`${debate.date}T00:00:00.000Z`, input.now);
      return {
        title: `Agora Debate: ${debate.name}`,
        description: `${debate.forContext} — ${debate.topic}`,
        link: `${origin}/debates/${debate.slug}`,
        guid: `${origin}/debates/${debate.slug}`,
        pubDate,
      };
    })
    .sort((a, b) => {
      const timeDelta = b.pubDate.getTime() - a.pubDate.getTime();
      if (timeDelta !== 0) return timeDelta;
      return a.title.localeCompare(b.title);
    });

  const insightItems = input.insightEntries.map((entry) => ({
    title: entry.title,
    description: entry.description,
    link: `${origin}/insights/${entry.slug}`,
    guid: `${origin}/insights/${entry.slug}`,
    // Use the article's actual publishedAt date so feed readers and SEO
    // crawlers see the correct freshness signal. Fall back to the original
    // collection date for legacy entries that lack publishedAt.
    pubDate: entry.publishedAt
      ? new Date(`${entry.publishedAt}T00:00:00.000Z`)
      : INSIGHT_COLLECTION_DATE,
  }));

  const decisionItems = (input.decisionEntries ?? []).map((entry) => ({
    title: entry.title,
    description: entry.description,
    link: `${origin}/decisions/${entry.slug}`,
    guid: `${origin}/decisions/${entry.slug}`,
    pubDate: new Date(`${entry.shippedAt}T00:00:00.000Z`),
  }));

  return [...debateItems, ...insightItems, ...decisionItems];
}

export function serializeRssFeed(input: SerializeRssFeedInput): string {
  const { metadata, items, now } = input;

  const channelLines = [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    '<rss version="2.0">',
    "  <channel>",
    `    <title>${escapeXml(metadata.title)}</title>`,
    `    <link>${escapeXml(metadata.link)}</link>`,
    `    <description>${escapeXml(metadata.description)}</description>`,
    `    <language>${escapeXml(metadata.language)}</language>`,
    `    <lastBuildDate>${escapeXml(now.toUTCString())}</lastBuildDate>`,
    ...items.flatMap((item) => [
      "    <item>",
      `      <title>${escapeXml(item.title)}</title>`,
      `      <link>${escapeXml(item.link)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(item.guid)}</guid>`,
      `      <pubDate>${escapeXml(item.pubDate.toUTCString())}</pubDate>`,
      `      <description>${escapeXml(item.description)}</description>`,
      "    </item>",
    ]),
    "  </channel>",
    "</rss>",
  ];

  return channelLines.join("\n");
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function normalizeSiteUrl(siteUrl: string): string {
  return siteUrl.replace(/\/$/, "");
}

export function parseRssDate(raw: string, fallback: Date): Date {
  const parsed = new Date(raw);
  return Number.isFinite(parsed.getTime()) ? parsed : fallback;
}
