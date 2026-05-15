import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getAllDebateSlugs, getDebate } from "@/lib/debates";
import { INSIGHT_ENTRIES } from "@/lib/insights";
import {
  buildFeedMetadata,
  buildPublicFeedItems,
  serializeRssFeed,
} from "@/lib/rss-feed";
import { DECISION_ENTRIES } from "../../../content/decisions";

import { GET } from "./route";

const FIXED_NOW = new Date("2026-05-12T12:00:00.000Z");
const SITE_URL = "https://www.consultthedead.com";

describe("GET /feed.xml", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns canonical RSS XML with public debate, insight, and decision links", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "application/rss+xml; charset=utf-8",
    );
    expect(response.headers.get("cache-control")).toBe(
      "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    );

    const xml = await response.text();
    const debates = getAllDebateSlugs()
      .map((slug) => getDebate(slug))
      .filter((debate): debate is NonNullable<typeof debate> => debate !== null);
    const items = buildPublicFeedItems({
      siteUrl: SITE_URL,
      debates,
      insightEntries: INSIGHT_ENTRIES,
      decisionEntries: DECISION_ENTRIES,
      now: FIXED_NOW,
    });

    expect(items).toHaveLength(
      debates.length + INSIGHT_ENTRIES.length + DECISION_ENTRIES.length,
    );
    expect(items.filter((item) => item.link.includes("/debates/"))).toHaveLength(
      debates.length,
    );
    expect(items.filter((item) => item.link.includes("/insights/"))).toHaveLength(
      INSIGHT_ENTRIES.length,
    );
    expect(items.filter((item) => item.link.includes("/decisions/"))).toHaveLength(
      DECISION_ENTRIES.length,
    );

    const expectedXml = serializeRssFeed({
      metadata: buildFeedMetadata(SITE_URL),
      items,
      now: FIXED_NOW,
    });

    expect(xml).toBe(expectedXml);
  });
});
