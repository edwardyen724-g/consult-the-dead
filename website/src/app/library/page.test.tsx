import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LibraryPage, {
  ProLibrary,
  UpgradePrompt,
  GhostLibraryRows,
  getConsultedMindSlugs,
  formatMindSlug,
} from "./page";

const currentUserMock = vi.hoisted(() => vi.fn());
const getUserAgonsMock = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs/server", () => ({
  currentUser: currentUserMock,
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/lib/db/client", () => ({
  db: {
    getUserAgons: getUserAgonsMock,
  },
}));

function makeAgon(overrides: { id: string }) {
  return {
    id: overrides.id,
    clerk_user_id: "user-1",
    share_id: `share-${overrides.id}`,
    topic: `Topic ${overrides.id}`,
    mind_slugs: ["sun-tzu"],
    rounds: 1,
    turns: [],
    consensus: null,
    research: null,
    created_at: "2026-05-01T00:00:00.000Z",
    updated_at: "2026-05-01T00:00:00.000Z",
  };
}

vi.mock("./LibraryClient", () => ({
  LibraryClient: ({ agons }: { agons: Array<{ id: string }> }) => (
    <div data-testid="library-client">{agons.length} agons</div>
  ),
}));

beforeEach(() => {
  currentUserMock.mockReset();
  getUserAgonsMock.mockReset();
});

describe("LibraryPage", () => {
  it("renders the upgrade prompt for free users", async () => {
    const html = renderToStaticMarkup(UpgradePrompt());

    expect(html).toContain("Pro feature");
    expect(html).toContain("Save every debate. Revisit any decision.");
    expect(html).toContain("Upgrade to Pro →");
    expect(html).toContain('href="/pricing?utm_campaign=library_gate"');
  });

  it("renders ghost library rows for free users", () => {
    const html = renderToStaticMarkup(GhostLibraryRows());

    expect(html).toContain('data-testid="ghost-library-rows"');
    const ghostRowMatches = [...html.matchAll(/data-testid="ghost-row"/g)];
    expect(ghostRowMatches.length).toBe(3);
  });

  it("ghost rows have blur and low opacity styling", () => {
    const html = renderToStaticMarkup(GhostLibraryRows());

    expect(html).toContain("filter:blur(2px)");
    expect(html).toContain("opacity:0.3");
  });

  it("upgrade prompt includes all four Pro feature bullets", () => {
    const html = renderToStaticMarkup(UpgradePrompt());

    expect(html).toContain('data-testid="pro-feature-list"');
    expect(html).toContain("Unlimited saved debates");
    expect(html).toContain("Access to all 25+ minds");
    expect(html).toContain("Opus-powered synthesis");
    expect(html).toContain("100 agons/month");
    const itemMatches = [...html.matchAll(/data-testid="pro-feature-item"/g)];
    expect(itemMatches.length).toBe(4);
  });

  it("Pro CTA links to /pricing with utm_campaign=library_gate", () => {
    const html = renderToStaticMarkup(UpgradePrompt());

    expect(html).toContain('href="/pricing?utm_campaign=library_gate"');
  });

  it("upgrade prompt renders ghost rows below the interstitial card", () => {
    const html = renderToStaticMarkup(UpgradePrompt());

    expect(html).toContain('data-testid="ghost-library-rows"');
    // Ghost rows appear after the interstitial card in DOM order
    const cardIdx = html.indexOf("Pro feature");
    const ghostIdx = html.indexOf('data-testid="ghost-library-rows"');
    expect(ghostIdx).toBeGreaterThan(cardIdx);
  });

  it("renders the pro library shell and loads saved agons", async () => {
    currentUserMock.mockResolvedValue({
      id: "user-1",
      publicMetadata: { subscription_tier: "pro" },
    });
    getUserAgonsMock.mockResolvedValue([{ id: "agon-1" }]);

    const html = renderToStaticMarkup(await ProLibrary({ userId: "user-1" }));
    expect(getUserAgonsMock).toHaveBeenCalledWith("user-1");
    expect(html).toContain("1 agons");
    expect(html).toContain('href="/agora"');
  });

  it("redirects unauthenticated users", async () => {
    currentUserMock.mockResolvedValue(null);

    await expect(LibraryPage()).rejects.toThrow("REDIRECT:/sign-in");
  });

  it("shows a running-low nudge when saved agons reach the threshold", async () => {
    const agons = Array.from({ length: 92 }, (_, i) => makeAgon({ id: String(i + 1) }));
    getUserAgonsMock.mockResolvedValue(agons);

    const html = renderToStaticMarkup(await ProLibrary({ userId: "user-1" }));
    expect(html).toContain("Running low");
    expect(html).toContain("8 consultations left this month");
    expect(html).toContain("92/100");
  });

  it("shows a cap-reached nudge when the monthly limit is hit", async () => {
    const agons = Array.from({ length: 100 }, (_, i) => makeAgon({ id: String(i + 1) }));
    getUserAgonsMock.mockResolvedValue(agons);

    const html = renderToStaticMarkup(await ProLibrary({ userId: "user-1" }));
    expect(html).toContain("Monthly limit reached");
    expect(html).toContain("100-agon monthly limit");
  });

  it("suppresses the upsell nudge for users well below the threshold", async () => {
    const agons = Array.from({ length: 5 }, (_, i) => makeAgon({ id: String(i + 1) }));
    getUserAgonsMock.mockResolvedValue(agons);

    const html = renderToStaticMarkup(await ProLibrary({ userId: "user-1" }));
    expect(html).not.toContain("Running low");
    expect(html).not.toContain("Monthly limit reached");
  });

  it("renders a DB error inline without crashing", async () => {
    getUserAgonsMock.mockRejectedValue(new Error("connection refused"));

    const html = renderToStaticMarkup(await ProLibrary({ userId: "user-1" }));
    expect(html).toContain("DB ERROR");
    expect(html).toContain("connection refused");
  });

  it("getConsultedMindSlugs deduplicates and sorts mind slugs across agons", () => {
    const agons = [
      { mind_slugs: ["sun-tzu", "cicero"] },
      { mind_slugs: ["sun-tzu", "archimedes"] },
      { mind_slugs: null },
    ];
    expect(getConsultedMindSlugs(agons)).toEqual(["archimedes", "cicero", "sun-tzu"]);
  });

  it("getConsultedMindSlugs returns empty array for no agons", () => {
    expect(getConsultedMindSlugs([])).toEqual([]);
  });

  it("formatMindSlug converts slug to title case", () => {
    expect(formatMindSlug("sun-tzu")).toBe("Sun Tzu");
    expect(formatMindSlug("niccolo-machiavelli")).toBe("Niccolo Machiavelli");
    expect(formatMindSlug("marie-curie")).toBe("Marie Curie");
  });

  it("shows consulted minds strip when agons have mind_slugs", async () => {
    const agons = [
      makeAgon({ id: "1" }),
      { ...makeAgon({ id: "2" }), mind_slugs: ["marcus-aurelius"] },
    ];
    getUserAgonsMock.mockResolvedValue(agons);
    const html = renderToStaticMarkup(await ProLibrary({ userId: "user-1" }));
    expect(html).toContain('data-testid="consulted-minds-strip"');
    expect(html).toContain("sun-tzu");
    expect(html).toContain("marcus-aurelius");
    expect(html).toContain("2 distinct minds consulted");
  });

  it("hides consulted minds strip when library is empty", async () => {
    getUserAgonsMock.mockResolvedValue([]);
    const html = renderToStaticMarkup(await ProLibrary({ userId: "user-1" }));
    expect(html).not.toContain('data-testid="consulted-minds-strip"');
  });

  it("shows '1 distinct mind consulted' for a single-mind library", async () => {
    getUserAgonsMock.mockResolvedValue([makeAgon({ id: "1" })]);
    const html = renderToStaticMarkup(await ProLibrary({ userId: "user-1" }));
    expect(html).toContain("1 distinct mind consulted");
  });
});
