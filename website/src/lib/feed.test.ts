import { describe, expect, it } from "vitest";

import type { Debate } from "@/lib/debates";
import type { InsightEntry } from "@/lib/insights";

import {
  buildFeedMetadata,
  buildPublicFeedItems,
  escapeXml,
  parseRssDate,
  RSS_FEED_DESCRIPTION,
  RSS_FEED_LANGUAGE,
  RSS_FEED_TITLE,
  serializeRssFeed,
} from "./feed";

const FIXED_NOW = new Date("2026-05-08T12:00:00.000Z");

function makeDebate(
  partial: Partial<Debate> & Pick<Debate, "slug" | "name" | "forContext" | "topic" | "date">,
): Debate {
  return {
    rounds: [],
    consensus: [],
    council: [],
    ...partial,
  };
}

function makeInsight(
  partial: Partial<InsightEntry> &
    Pick<InsightEntry, "slug" | "title" | "description" | "frameworkSlug">,
): InsightEntry {
  return {
    targetKeywords: [],
    decisionType: "strategy",
    hookQuestion: "Hook question",
    ...partial,
  };
}

describe("feed helpers", () => {
  it("normalizes the site URL and exposes feed metadata", () => {
    const metadata = buildFeedMetadata("https://www.consultthedead.com/");

    expect(metadata).toEqual({
      title: RSS_FEED_TITLE,
      description: RSS_FEED_DESCRIPTION,
      link: "https://www.consultthedead.com",
      language: RSS_FEED_LANGUAGE,
      feedUrl: "https://www.consultthedead.com/feed.xml",
    });
  });

  it("falls back to the canonical site URL when the site URL is blank", () => {
    const metadata = buildFeedMetadata("");
    const items = buildPublicFeedItems({
      siteUrl: "",
      now: FIXED_NOW,
      debates: [
        makeDebate({
          slug: "fallback-debate",
          name: "Fallback Debate",
          forContext: "For Fallback",
          topic: "Fallback topic",
          date: "2026-04-02",
        }),
      ],
      insightEntries: [
        makeInsight({
          slug: "fallback-insight",
          title: "Fallback insight",
          description: "Fallback description",
          frameworkSlug: "isaac-newton",
        }),
      ],
    });

    expect(metadata.link).toBe("https://www.consultthedead.com");
    expect(metadata.feedUrl).toBe("https://www.consultthedead.com/feed.xml");
    expect(items.map((item) => item.link)).toEqual([
      "https://www.consultthedead.com/debates/fallback-debate",
      "https://www.consultthedead.com/insights/fallback-insight",
    ]);
  });

  it("orders debates newest-first and keeps insights in source order", () => {
    const items = buildPublicFeedItems({
      siteUrl: "https://www.consultthedead.com/",
      now: FIXED_NOW,
      debates: [
        makeDebate({
          slug: "older-debate",
          name: "Older Debate",
          forContext: "For Older",
          topic: "Older topic",
          date: "2026-04-01",
        }),
        makeDebate({
          slug: "newer-debate",
          name: "Newer Debate",
          forContext: "For Newer",
          topic: "Newer topic",
          date: "2026-04-02",
        }),
      ],
      insightEntries: [
        makeInsight({
          slug: "first-insight",
          title: "First insight",
          description: "First description",
          frameworkSlug: "isaac-newton",
        }),
        makeInsight({
          slug: "second-insight",
          title: "Second insight",
          description: "Second description",
          frameworkSlug: "marie-curie",
        }),
      ],
    });

    expect(items.map((item) => item.link)).toEqual([
      "https://www.consultthedead.com/debates/newer-debate",
      "https://www.consultthedead.com/debates/older-debate",
      "https://www.consultthedead.com/insights/first-insight",
      "https://www.consultthedead.com/insights/second-insight",
    ]);
  });

  it("falls back to the injected now value for an invalid debate date", () => {
    const items = buildPublicFeedItems({
      siteUrl: "https://www.consultthedead.com",
      now: FIXED_NOW,
      debates: [
        makeDebate({
          slug: "broken-date",
          name: "Broken Date",
          forContext: "For Broken",
          topic: "Broken topic",
          date: "not-a-date",
        }),
      ],
      insightEntries: [],
    });

    expect(items[0].pubDate.toISOString()).toBe(FIXED_NOW.toISOString());
  });

  it("escapes RSS content and serializes a valid RSS document", () => {
    const xml = serializeRssFeed({
      metadata: {
        title: 'Consult & The <Dead> "Feed"',
        description: "Public debates & insights <for> founders",
        link: "https://www.consultthedead.com",
        language: "en-us",
        feedUrl: "https://www.consultthedead.com/feed.xml",
      },
      now: FIXED_NOW,
      items: [
        {
          title: 'Alpha & Beta <Round>',
          description: "Use & reuse <these> 'details'",
          link: "https://www.consultthedead.com/debates/alpha?x=1&y=2",
          guid: "https://www.consultthedead.com/debates/alpha",
          pubDate: FIXED_NOW,
        },
      ],
    });

    expect(escapeXml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&apos;");
    expect(xml).toContain("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
    expect(xml).toContain("<rss version=\"2.0\">");
    expect(xml).toContain("<title>Consult &amp; The &lt;Dead&gt; &quot;Feed&quot;</title>");
    expect(xml).toContain("<link>https://www.consultthedead.com</link>");
    expect(xml).toContain("<language>en-us</language>");
    expect(xml).toContain(`<lastBuildDate>${FIXED_NOW.toUTCString()}</lastBuildDate>`);
    expect(xml).toContain("<guid isPermaLink=\"true\">https://www.consultthedead.com/debates/alpha</guid>");
    expect(xml).toContain("<description>Use &amp; reuse &lt;these&gt; &apos;details&apos;</description>");
    expect(xml).toContain("https://www.consultthedead.com/debates/alpha?x=1&amp;y=2");
  });

  it("parses valid RSS dates and preserves the fallback on invalid ones", () => {
    expect(parseRssDate("2026-04-22T00:00:00.000Z", FIXED_NOW).toISOString()).toBe(
      "2026-04-22T00:00:00.000Z",
    );
    expect(parseRssDate("definitely-not-a-date", FIXED_NOW).toISOString()).toBe(
      FIXED_NOW.toISOString(),
    );
  });
});
