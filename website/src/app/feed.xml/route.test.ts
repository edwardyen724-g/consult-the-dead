import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("GET /feed.xml", () => {
  it("returns RSS XML with insight links", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "application/rss+xml; charset=utf-8",
    );
    expect(response.headers.get("cache-control")).toBe(
      "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    );

    const xml = await response.text();
    expect(xml).toContain("<rss version=\"2.0\">");
    expect(xml).toContain("<title>Consult The Dead</title>");
    expect(xml).toContain("<link>https://www.consultthedead.com</link>");
    expect(xml).toContain("https://www.consultthedead.com/insights/");
  });
});
