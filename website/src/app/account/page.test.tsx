import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AccountPage from "./page";

const currentUserMock = vi.hoisted(() => vi.fn());
const getUsageMock = vi.hoisted(() => vi.fn());

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

vi.mock("@/components/ManageSubscriptionButton", () => ({
  ManageSubscriptionButton: () => <button>Manage subscription</button>,
}));

vi.mock("@/components/ApiKeySettings", () => ({
  ApiKeySettings: ({ initialMaskedKey }: { initialMaskedKey: string | null }) => (
    <div data-testid="api-key-settings">{initialMaskedKey ?? "none"}</div>
  ),
}));

vi.mock("@/lib/agon/rateLimit", () => ({
  getUsage: getUsageMock,
}));

beforeEach(() => {
  currentUserMock.mockReset();
  getUsageMock.mockReset();
});

describe("AccountPage", () => {
  it("renders the unified publication shell for Pro users", async () => {
    currentUserMock.mockResolvedValue({
      id: "user-1",
      firstName: "Ada",
      lastName: "Lovelace",
      primaryEmailAddressId: "email-1",
      emailAddresses: [{ id: "email-1", emailAddress: "ada@example.com" }],
      publicMetadata: { subscription_tier: "pro" },
      privateMetadata: { anthropic_api_key: "sk-ant-test1234" },
    });
    getUsageMock.mockResolvedValue({
      used: 12,
      limit: 100,
      period: "month",
      remaining: 88,
    });

    const html = renderToStaticMarkup(
      await AccountPage({ searchParams: Promise.resolve({}) }),
    );

    expect(html).toContain("Account");
    expect(html).toContain("Ada Lovelace");
    expect(html).toContain("Pro access active");
    expect(html).toContain("Manage subscription");
    expect(html).toContain("Quota window");
    expect(html).toContain("Bring your own Anthropic key");
    expect(html).toContain("sk-ant-***...***1234");
    expect(html).toContain('href="/agora"');
    expect(html).toContain('href="/library"');
  });

  it("renders the free plan upgrade flow and checkout success banner", async () => {
    currentUserMock.mockResolvedValue({
      id: "user-2",
      firstName: "Grace",
      lastName: "Hopper",
      primaryEmailAddressId: "email-2",
      emailAddresses: [{ id: "email-2", emailAddress: "grace@example.com" }],
      publicMetadata: {},
      privateMetadata: {},
    });
    getUsageMock.mockResolvedValue({
      used: 3,
      limit: 3,
      period: "day",
      remaining: 0,
    });

    const html = renderToStaticMarkup(
      await AccountPage({ searchParams: Promise.resolve({ checkout: "success" }) }),
    );

    expect(html).toContain("Welcome to Pro. Your subscription is active.");
    expect(html).toContain("Free access active");
    expect(html).toContain("Upgrade to Pro");
    expect(html).toContain("View pricing");
    expect(html).toContain("You have used all 3 free debates today.");
    expect(html).toContain("none");
  });

  it("falls back to the primary email and singular quota copy when no display name is set", async () => {
    currentUserMock.mockResolvedValue({
      id: "user-3",
      firstName: undefined,
      lastName: undefined,
      emailAddresses: [{ id: "email-3", emailAddress: "fallback@example.com" }],
      publicMetadata: {},
      privateMetadata: {},
    });
    getUsageMock.mockResolvedValue({
      used: 2,
      limit: 3,
      period: "day",
      remaining: 1,
    });

    const html = renderToStaticMarkup(
      await AccountPage({ searchParams: Promise.resolve({}) }),
    );

    expect(html).toContain("fallback@example.com");
    expect(html).toContain("1 debate remaining this day.");
    expect(html).toContain("Free access active");
  });

  it("renders the Pro cap-reached message when no quota remains", async () => {
    currentUserMock.mockResolvedValue({
      id: "user-4",
      firstName: "Ava",
      lastName: "Taylor",
      primaryEmailAddressId: "email-4",
      emailAddresses: [{ id: "email-4", emailAddress: "ava@example.com" }],
      publicMetadata: { subscription_tier: "pro" },
      privateMetadata: {},
    });
    getUsageMock.mockResolvedValue({
      used: 100,
      limit: 100,
      period: "month",
      remaining: 0,
    });

    const html = renderToStaticMarkup(
      await AccountPage({ searchParams: Promise.resolve({}) }),
    );

    expect(html).toContain("Monthly cap reached");
    expect(html).toContain("You have used all 100 debates this month.");
  });

  it("redirects unauthenticated users", async () => {
    currentUserMock.mockResolvedValue(null);

    await expect(
      AccountPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow("REDIRECT:/sign-in");
  });
});
