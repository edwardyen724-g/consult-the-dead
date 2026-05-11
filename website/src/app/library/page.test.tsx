import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LibraryPage, { ProLibrary, UpgradePrompt } from "./page";

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
    expect(html).toContain('href="/pricing"');
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
});
