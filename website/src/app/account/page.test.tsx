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
  ManageSubscriptionButton: () => <button type="button">Manage subscription</button>,
}));

vi.mock("@/components/ApiKeySettings", () => ({
  ApiKeySettings: () => <section data-testid="api-key-settings" />,
}));

vi.mock("@/lib/agon/rateLimit", () => ({
  getUsage: getUsageMock,
}));

vi.mock("@/lib/api-key-mask", () => ({
  maskApiKey: (key: string) => key,
}));

beforeEach(() => {
  currentUserMock.mockReset();
  getUsageMock.mockReset();
});

describe("AccountPage", () => {
  it("uses the exact free-quota reset copy instead of tomorrow language", async () => {
    currentUserMock.mockResolvedValue({
      id: "user-1",
      firstName: "Ada",
      lastName: "Lovelace",
      primaryEmailAddressId: "email-1",
      emailAddresses: [
        {
          id: "email-1",
          emailAddress: "ada@example.com",
        },
      ],
      publicMetadata: {},
      privateMetadata: {},
    });
    getUsageMock.mockResolvedValue({
      used: 3,
      limit: 3,
      remaining: 0,
      period: "day",
    });

    const html = renderToStaticMarkup(
      await AccountPage({ searchParams: Promise.resolve({}) }),
    );

    expect(html).toContain("You’ve used all 3 free debates today.");
    expect(html).toContain("return when the free quota resets at midnight UTC");
    expect(html).not.toContain("check back tomorrow");
  });

  it("redirects unauthenticated visitors", async () => {
    currentUserMock.mockResolvedValue(null);

    await expect(AccountPage({ searchParams: Promise.resolve({}) })).rejects.toThrow(
      "REDIRECT:/sign-in",
    );
  });
});
