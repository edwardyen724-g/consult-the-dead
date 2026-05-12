import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PacksPage from "./page";

const getAllFrameworksMock = vi.hoisted(() => vi.fn());
const getPublicAgonsMock = vi.hoisted(() => vi.fn());

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/lib/frameworks", () => ({
  getAllFrameworks: getAllFrameworksMock,
}));

vi.mock("@/lib/db/client", () => ({
  db: {
    getPublicAgons: getPublicAgonsMock,
  },
}));

beforeEach(() => {
  getAllFrameworksMock.mockReset();
  getPublicAgonsMock.mockReset();
});

function makeFrameworks() {
  return [
    { slug: "sun-tzu" },
    { slug: "epictetus" },
    { slug: "cicero" },
  ];
}

describe("PacksPage", () => {
  it("surfaces live collection feedback from public saved debates", async () => {
    getAllFrameworksMock.mockReturnValue(makeFrameworks());
    getPublicAgonsMock.mockResolvedValue([
      {
        share_id: "share-1",
        topic: "Pricing move",
        mind_slugs: ["sun-tzu"],
        created_at: "2026-05-01T00:00:00.000Z",
      },
      {
        share_id: "share-2",
        topic: "Hiring decision",
        mind_slugs: ["epictetus", "cicero"],
        created_at: "2026-05-02T00:00:00.000Z",
      },
    ]);

    const html = renderToStaticMarkup(await PacksPage());

    expect(getPublicAgonsMock).toHaveBeenCalledWith({ limit: 200 });
    expect(html).toContain("Collection feedback");
    expect(html).toContain("3 minds consulted so far");
    expect(html).toContain("2 saved debates");
    expect(html).toContain("Growing with every return");
    expect(html).not.toContain("Join founders using historical minds to make better decisions");
  });

  it("hides collection feedback when there are no public agons", async () => {
    getAllFrameworksMock.mockReturnValue(makeFrameworks());
    getPublicAgonsMock.mockResolvedValue([]);

    const html = renderToStaticMarkup(await PacksPage());

    expect(html).not.toContain('data-testid="collection-feedback"');
    expect(html).not.toContain("minds consulted so far");
    // Quiz CTA still renders without collection feedback.
    // utm_source param has no ampersand so no HTML-encoding issue.
    expect(html).toContain("utm_source=packs");
  });

  it("uses singular forms for a single mind and a single debate", async () => {
    getAllFrameworksMock.mockReturnValue(makeFrameworks());
    getPublicAgonsMock.mockResolvedValue([
      {
        share_id: "share-1",
        topic: "One debate",
        mind_slugs: ["sun-tzu"],
        created_at: "2026-05-01T00:00:00.000Z",
      },
    ]);

    const html = renderToStaticMarkup(await PacksPage());

    expect(html).toContain("1 mind consulted so far");
    expect(html).toContain("1 saved debate");
    expect(html).not.toContain("1 minds consulted");
    expect(html).not.toContain("1 saved debates");
  });

  it("deduplicates minds across debates for the consulted count", async () => {
    getAllFrameworksMock.mockReturnValue(makeFrameworks());
    getPublicAgonsMock.mockResolvedValue([
      { share_id: "s1", topic: "A", mind_slugs: ["sun-tzu", "cicero"], created_at: "" },
      { share_id: "s2", topic: "B", mind_slugs: ["sun-tzu"], created_at: "" },
    ]);

    const html = renderToStaticMarkup(await PacksPage());

    // sun-tzu appears twice but counts once → 2 unique minds, 2 debates
    expect(html).toContain("2 minds consulted so far");
    expect(html).toContain("2 saved debates");
  });

  it("always renders the quiz CTA regardless of collection feedback state", async () => {
    getAllFrameworksMock.mockReturnValue(makeFrameworks());
    getPublicAgonsMock.mockResolvedValue([]);

    const html = renderToStaticMarkup(await PacksPage());

    // Both hero and bottom CTAs link to the quiz entry.
    // Count occurrences of the utm_source param (present in both anchor hrefs).
    expect(html.split("utm_source=packs").length - 1).toBeGreaterThanOrEqual(2);
  });
});
