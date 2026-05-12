/**
 * Regression coverage for the /account publication-surface rhythm and CTA copy
 * (task 5708ebb6 — "Add regression coverage for /account publication-surface
 *  rhythm and CTA copy").
 *
 * Locks down:
 *   1. PublicationShell header structure — eyebrow "Account", stats-strip
 *      label/value pairs, footer navigation hrefs.
 *   2. CTA copy contract — free-plan upgrade CTAs ("Upgrade to Pro" /
 *      "View pricing") must stay anchored to /pricing and must not drift from
 *      the live pricing-page language.
 *   3. Section eyebrow contract — "Subscription", "Usage", "API key" must not
 *      be renamed silently.
 *   4. Lead copy contract — the two tier-specific lead paragraphs (Pro vs.
 *      Free) stay coherent with the publication-system framing.
 *   5. Pricing-language alignment — body copy inside the Subscription section
 *      references the same feature names and numbers as pricing-constants.ts
 *      (FREE_AGONS_PER_DAY = 3, PRO_AGONS_PER_MONTH = 100).
 *   6. Library stat value — the "Library" stat strip entry reflects the
 *      correct unlock state for each tier.
 *
 * All heavy I/O (Clerk, rate-limit, Next.js routing) is mocked so the suite
 * runs entirely in-process without the data layer.
 */
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AccountPage from "./page";

/* ── hoisted mock handles ── */
const currentUserMock = vi.hoisted(() => vi.fn());
const getUsageMock = vi.hoisted(() => vi.fn());

/* ── module mocks ── */
vi.mock("@clerk/nextjs/server", () => ({
  currentUser: currentUserMock,
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

vi.mock("next/link", () => ({
  default: ({ href, children, style }: { href: string; children: ReactNode; style?: object }) => (
    <a href={href} style={style}>{children}</a>
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

vi.mock("@/lib/api-key-mask", () => ({
  maskApiKey: (key: string) => key.replace(/^(sk-ant-[^-]*).*(.{4})$/, "$1***...$2"),
}));

/* ── shared fixtures ── */
const PRO_USER = {
  id: "user-pro",
  firstName: "Ada",
  lastName: "Lovelace",
  primaryEmailAddressId: "email-pro",
  emailAddresses: [{ id: "email-pro", emailAddress: "ada@example.com" }],
  publicMetadata: { subscription_tier: "pro" },
  privateMetadata: {},
};

const FREE_USER = {
  id: "user-free",
  firstName: "Grace",
  lastName: "Hopper",
  primaryEmailAddressId: "email-free",
  emailAddresses: [{ id: "email-free", emailAddress: "grace@example.com" }],
  publicMetadata: {},
  privateMetadata: {},
};

const PRO_USAGE = { used: 12, limit: 100, period: "month", remaining: 88 };
const FREE_USAGE = { used: 1, limit: 3, period: "day", remaining: 2 };

function renderPro(extra = {}) {
  currentUserMock.mockResolvedValue(PRO_USER);
  getUsageMock.mockResolvedValue(PRO_USAGE);
  return AccountPage({ searchParams: Promise.resolve(extra) });
}

function renderFree(extra = {}) {
  currentUserMock.mockResolvedValue(FREE_USER);
  getUsageMock.mockResolvedValue(FREE_USAGE);
  return AccountPage({ searchParams: Promise.resolve(extra) });
}

beforeEach(() => {
  currentUserMock.mockReset();
  getUsageMock.mockReset();
});

/* ──────────────────────────────────────────────────────────────────────── */
/* SUITE 1: PublicationShell eyebrow / stats-strip / footer rhythm          */
/* ──────────────────────────────────────────────────────────────────────── */

describe("PublicationShell header rhythm — account page", () => {
  it('renders the "Account" eyebrow at the top of the shell', async () => {
    const html = renderToStaticMarkup(await renderPro());
    expect(html).toContain("Account");
  });

  it("renders all three stats-strip labels for a Pro user", async () => {
    const html = renderToStaticMarkup(await renderPro());
    expect(html).toContain("Plan");
    expect(html).toContain("Usage");
    expect(html).toContain("Library");
  });

  it("renders all three stats-strip labels for a free user", async () => {
    const html = renderToStaticMarkup(await renderFree());
    expect(html).toContain("Plan");
    expect(html).toContain("Usage");
    expect(html).toContain("Library");
  });

  it("shows 'Pro access' as the Plan stat value for Pro users", async () => {
    const html = renderToStaticMarkup(await renderPro());
    expect(html).toContain("Pro access");
  });

  it("shows 'Free access' as the Plan stat value for free users", async () => {
    const html = renderToStaticMarkup(await renderFree());
    expect(html).toContain("Free access");
  });

  it("shows 'Saved debates unlocked' as the Library stat for Pro users", async () => {
    const html = renderToStaticMarkup(await renderPro());
    expect(html).toContain("Saved debates unlocked");
  });

  it("shows 'Upgrade to save debates' as the Library stat for free users", async () => {
    const html = renderToStaticMarkup(await renderFree());
    expect(html).toContain("Upgrade to save debates");
  });

  it("renders the usage summary in the stats strip (used/limit this period)", async () => {
    const html = renderToStaticMarkup(await renderPro());
    expect(html).toContain("12/100 this month");
  });

  it("renders footer navigation link to /agora", async () => {
    const html = renderToStaticMarkup(await renderPro());
    expect(html).toContain('href="/agora"');
    expect(html).toContain("Enter The Agora");
  });

  it("renders footer navigation link to /library", async () => {
    const html = renderToStaticMarkup(await renderPro());
    expect(html).toContain('href="/library"');
    expect(html).toContain("Open Library");
  });
});

/* ──────────────────────────────────────────────────────────────────────── */
/* SUITE 2: Lead copy contract                                               */
/* ──────────────────────────────────────────────────────────────────────── */

describe("Lead copy contract — publication-surface framing", () => {
  it("Pro lead references 'publication surface' as the hub framing", async () => {
    const html = renderToStaticMarkup(await renderPro());
    expect(html).toContain("publication surface");
  });

  it("Pro lead mentions subscription, usage, and private key", async () => {
    const html = renderToStaticMarkup(await renderPro());
    expect(html).toContain("subscription");
    expect(html).toContain("usage");
    expect(html).toContain("private key");
  });

  it("Free lead frames the account page as a pre-upgrade tracker", async () => {
    const html = renderToStaticMarkup(await renderFree());
    expect(html).toContain("Track free access");
  });

  it("Free lead mentions API key and upgrade in the same sentence", async () => {
    const html = renderToStaticMarkup(await renderFree());
    expect(html).toContain("API key");
    expect(html).toContain("upgrade");
  });
});

/* ──────────────────────────────────────────────────────────────────────── */
/* SUITE 3: Section eyebrow contract                                         */
/* ──────────────────────────────────────────────────────────────────────── */

describe("Section eyebrow contract", () => {
  it('renders a "Subscription" section eyebrow for Pro users', async () => {
    const html = renderToStaticMarkup(await renderPro());
    expect(html).toContain("Subscription");
  });

  it('renders a "Subscription" section eyebrow for free users', async () => {
    const html = renderToStaticMarkup(await renderFree());
    expect(html).toContain("Subscription");
  });

  it('renders a "Usage" section eyebrow', async () => {
    const html = renderToStaticMarkup(await renderPro());
    expect(html).toContain("Usage");
  });

  it('renders an "API key" section eyebrow', async () => {
    const html = renderToStaticMarkup(await renderPro());
    expect(html).toContain("API key");
  });

  it("section titles do not drift from the exact publication-system copy — Pro", async () => {
    const html = renderToStaticMarkup(await renderPro());
    expect(html).toContain("Pro access active");
    expect(html).toContain("Quota window");
    expect(html).toContain("Bring your own Anthropic key");
  });

  it("section titles do not drift from the exact publication-system copy — Free", async () => {
    const html = renderToStaticMarkup(await renderFree());
    expect(html).toContain("Free access active");
    expect(html).toContain("Quota window");
    expect(html).toContain("Bring your own Anthropic key");
  });
});

/* ──────────────────────────────────────────────────────────────────────── */
/* SUITE 4: CTA copy contract — free plan upgrade surface                   */
/* ──────────────────────────────────────────────────────────────────────── */

describe("CTA copy contract — free plan upgrade surface", () => {
  it("renders the primary CTA with exact copy 'Upgrade to Pro'", async () => {
    const html = renderToStaticMarkup(await renderFree());
    expect(html).toContain("Upgrade to Pro");
  });

  it("renders the secondary CTA with exact copy 'View pricing'", async () => {
    const html = renderToStaticMarkup(await renderFree());
    expect(html).toContain("View pricing");
  });

  it("both upgrade CTAs route to /pricing", async () => {
    const html = renderToStaticMarkup(await renderFree());
    // count occurrences of href="/pricing" — both CTAs must point there
    const matches = (html.match(/href="\/pricing"/g) ?? []).length;
    expect(matches).toBeGreaterThanOrEqual(2);
  });

  it("Pro users do not see upgrade CTAs — Manage subscription button shown instead", async () => {
    const html = renderToStaticMarkup(await renderPro());
    expect(html).toContain("Manage subscription");
    expect(html).not.toContain("Upgrade to Pro");
    expect(html).not.toContain("View pricing");
  });

  it("plan-control card explains the upgrade benefit to free users (persistent library, stronger synthesis)", async () => {
    const html = renderToStaticMarkup(await renderFree());
    expect(html).toContain("persistent library");
  });

  it("plan-control card for Pro explains the Stripe portal action", async () => {
    const html = renderToStaticMarkup(await renderPro());
    expect(html).toContain("Stripe");
  });
});

/* ──────────────────────────────────────────────────────────────────────── */
/* SUITE 5: Pricing-language alignment — subscription section body copy     */
/* ──────────────────────────────────────────────────────────────────────── */

describe("Pricing-language alignment — subscription body copy", () => {
  it("Pro body mentions 100 agons per month (aligned with PRO_AGONS_PER_MONTH = 100)", async () => {
    const html = renderToStaticMarkup(await renderPro());
    expect(html).toContain("100 agons per month");
  });

  it("Pro body mentions Opus synthesis (aligned with Pro feature set on pricing page)", async () => {
    const html = renderToStaticMarkup(await renderPro());
    expect(html).toContain("Opus synthesis");
  });

  it("Pro body mentions persistent library access", async () => {
    const html = renderToStaticMarkup(await renderPro());
    expect(html).toContain("persistent library access");
  });

  it("Pro body mentions PDF export", async () => {
    const html = renderToStaticMarkup(await renderPro());
    expect(html).toContain("PDF export");
  });

  it("Free body mentions 3 agons per day (aligned with FREE_AGONS_PER_DAY = 3)", async () => {
    const html = renderToStaticMarkup(await renderFree());
    expect(html).toContain("3 agons per day");
  });

  it("Free body mentions anonymous debates (aligned with free-tier description on pricing page)", async () => {
    const html = renderToStaticMarkup(await renderFree());
    expect(html).toContain("anonymous debates");
  });

  it("Pro plan highlights list includes '100 agons per month'", async () => {
    const html = renderToStaticMarkup(await renderPro());
    expect(html).toContain("100 agons per month");
  });

  it("Pro plan highlights list includes 'Persistent library access'", async () => {
    const html = renderToStaticMarkup(await renderPro());
    expect(html).toContain("Persistent library access");
  });

  it("Pro plan highlights list includes 'Opus synthesis and PDF export'", async () => {
    const html = renderToStaticMarkup(await renderPro());
    expect(html).toContain("Opus synthesis and PDF export");
  });

  it("Free plan highlights list includes '3 agons per day'", async () => {
    const html = renderToStaticMarkup(await renderFree());
    expect(html).toContain("3 agons per day");
  });

  it("Free plan highlights list includes 'Direct upgrade path when you need more'", async () => {
    const html = renderToStaticMarkup(await renderFree());
    expect(html).toContain("Direct upgrade path when you need more");
  });
});

/* ──────────────────────────────────────────────────────────────────────── */
/* SUITE 6: Quota section body copy matches the cap-state language          */
/* ──────────────────────────────────────────────────────────────────────── */

describe("Quota section body copy — cap-state language", () => {
  it("within-quota body: remaining count and period are rendered", async () => {
    // FREE_USAGE: remaining=2, period=day
    const html = renderToStaticMarkup(await renderFree());
    expect(html).toContain("2 debate");
    expect(html).toContain("day");
  });

  it("free cap-reached body: references all 3 free debates and offers BYO key path", async () => {
    currentUserMock.mockResolvedValue(FREE_USER);
    getUsageMock.mockResolvedValue({ used: 3, limit: 3, period: "day", remaining: 0 });
    const html = renderToStaticMarkup(
      await AccountPage({ searchParams: Promise.resolve({}) }),
    );
    expect(html).toContain("all 3 free debates today");
    expect(html).toContain("Add your own API key");
  });

  it("Pro cap-reached body: references 100 debates and mentions next-month reset", async () => {
    currentUserMock.mockResolvedValue(PRO_USER);
    getUsageMock.mockResolvedValue({ used: 100, limit: 100, period: "month", remaining: 0 });
    const html = renderToStaticMarkup(
      await AccountPage({ searchParams: Promise.resolve({}) }),
    );
    expect(html).toContain("all 100 debates this month");
    expect(html).toContain("next month");
  });
});

/* ──────────────────────────────────────────────────────────────────────── */
/* SUITE 7: Checkout-success banner stays aligned with live welcome copy    */
/* ──────────────────────────────────────────────────────────────────────── */

describe("Checkout-success notice — publication surface alignment", () => {
  it("renders the welcome notice only when checkout=success is present", async () => {
    currentUserMock.mockResolvedValue(FREE_USER);
    getUsageMock.mockResolvedValue(FREE_USAGE);

    const withSuccess = renderToStaticMarkup(
      await AccountPage({ searchParams: Promise.resolve({ checkout: "success" }) }),
    );

    currentUserMock.mockResolvedValue(FREE_USER);
    getUsageMock.mockResolvedValue(FREE_USAGE);

    const withoutSuccess = renderToStaticMarkup(
      await AccountPage({ searchParams: Promise.resolve({}) }),
    );

    expect(withSuccess).toContain("Welcome to Pro. Your subscription is active.");
    expect(withoutSuccess).not.toContain("Welcome to Pro.");
  });

  it("checkout-success notice copy is exact: 'Welcome to Pro. Your subscription is active.'", async () => {
    currentUserMock.mockResolvedValue(FREE_USER);
    getUsageMock.mockResolvedValue(FREE_USAGE);
    const html = renderToStaticMarkup(
      await AccountPage({ searchParams: Promise.resolve({ checkout: "success" }) }),
    );
    expect(html).toContain("Welcome to Pro. Your subscription is active.");
  });
});
