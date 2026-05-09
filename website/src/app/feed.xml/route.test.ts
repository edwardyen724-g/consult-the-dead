import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("GET /feed.xml", () => {
  it("returns RSS XML with public debate and insight links", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "application/rss+xml; charset=utf-8",
    );

    const xml = await response.text();
    expect(xml).toContain("<rss version=\"2.0\">");
    expect(xml).toContain("<title>Consult The Dead — Debates and Insights</title>");
    expect(xml).toContain("https://www.consultthedead.com/feed.xml");
    expect(xml).toContain("https://www.consultthedead.com/debates/");
    expect(xml).toContain("https://www.consultthedead.com/insights/");
  });
});
