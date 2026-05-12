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

describe("PacksPage", () => {
  it("surfaces live collection feedback from public saved debates", async () => {
    getAllFrameworksMock.mockReturnValue([
      { slug: "sun-tzu" },
      { slug: "epictetus" },
      { slug: "cicero" },
    ]);
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
});
