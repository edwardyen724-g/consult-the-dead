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
});
