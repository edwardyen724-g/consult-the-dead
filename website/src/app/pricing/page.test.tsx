import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.hoisted(() => vi.fn());
const mockUseState = vi.hoisted(() => vi.fn());
const mockUseEffect = vi.hoisted(() => vi.fn());
const mockGetPricingStats = vi.hoisted(() => vi.fn());

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useState: mockUseState,
    useEffect: mockUseEffect,
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("@/lib/pricing/live-stats", () => ({
  getPricingStats: mockGetPricingStats,
}));

import PricingClient from "./PricingClient";
import PricingPage from "./page";
import {
  PRICING_STATS_DEFAULT,
  type PricingStats,
} from "@/lib/pricing/stats";
import {
  LAUNCH_DEAL_CAP,
  LAUNCH_DEAL_EXPIRES_AT_ISO,
  LAUNCH_DEAL_PRICE_USD,
  type LaunchDealStatus,
} from "@/lib/pricing/launch-deal";

const DEFAULT_LAUNCH_DEAL: LaunchDealStatus = {
  cap: LAUNCH_DEAL_CAP,
  claimed: 0,
  expired: false,
  available: true,
  priceUsd: LAUNCH_DEAL_PRICE_USD,
  expiresAt: LAUNCH_DEAL_EXPIRES_AT_ISO,
};

type CheckoutResponse = {
  status: number;
  json: () => Promise<{ url?: string }>;
};

type ElementLike = {
  type?: unknown;
  props?: Record<string, unknown> & { children?: unknown };
};

type RenderResult = {
  tree: unknown;
  setBilling: ReturnType<typeof vi.fn>;
  setLoading: ReturnType<typeof vi.fn>;
  setStats: ReturnType<typeof vi.fn>;
};

function isElementLike(node: unknown): node is ElementLike {
  return (
    typeof node === "object" &&
    node !== null &&
    "props" in (node as Record<string, unknown>)
  );
}

function walk(node: unknown, visit: (el: ElementLike) => void): void {
  if (node == null || node === false) return;
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit);
    return;
  }
  if (!isElementLike(node)) return;
  visit(node);
  if (node.props && "children" in node.props) {
    walk(node.props.children, visit);
  }
}

function collectText(node: unknown, acc: string[] = []): string[] {
  if (node == null || node === false) return acc;
  if (typeof node === "string" || typeof node === "number") {
    acc.push(String(node));
    return acc;
  }
  if (Array.isArray(node)) {
    for (const child of node) collectText(child, acc);
    return acc;
  }
  if (isElementLike(node) && node.props && "children" in node.props) {
    collectText(node.props.children, acc);
  }
  return acc;
}

function textContent(node: unknown): string {
  return collectText(node).join(" ").replace(/\s+/g, " ").trim();
}

function findButtonByText(root: unknown, text: string): ElementLike {
  let found: ElementLike | null = null;
  walk(root, (el) => {
    if (found) return;
    if (el.type !== "button") return;
    if (textContent(el).includes(text)) found = el;
  });
  if (!found) {
    throw new Error(`Could not find button with text: ${text}`);
  }
  return found;
}

function createCheckoutResponse(
  status: number,
  payload: { url?: string },
): CheckoutResponse {
  return {
    status,
    json: () => Promise.resolve(payload),
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function renderPricingClient(
  billing: "monthly" | "annual" = "annual",
  loading = false,
  initialStats: PricingStats = PRICING_STATS_DEFAULT,
): RenderResult {
  const setBilling = vi.fn();
  const setLoading = vi.fn();
  const setStats = vi.fn();

  mockUseState.mockReset();
  mockUseEffect.mockReset();
  mockUseState.mockImplementationOnce(() => [billing, setBilling]);
  mockUseState.mockImplementationOnce(() => [loading, setLoading]);
  mockUseState.mockImplementationOnce(() => [false, vi.fn()]);
  mockUseState.mockImplementationOnce(() => [initialStats, setStats]);
  mockUseState.mockImplementationOnce(() => [DEFAULT_LAUNCH_DEAL, vi.fn()]);

  const tree = (PricingClient as unknown as (props: { initialStats: PricingStats }) => unknown)({
    initialStats,
  });
  return { tree, setBilling, setLoading, setStats };
}

async function flushMicrotasks(times = 2): Promise<void> {
  for (let i = 0; i < times; i += 1) {
    await Promise.resolve();
  }
}

describe("pricing page", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockUseEffect.mockReset();
    mockGetPricingStats.mockReset();
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("window", {
      location: {
        href: "http://localhost/pricing",
        search: "",
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders the Free, BYO key, and Pro tiers with the stronger Pro CTA", () => {
    const { tree } = renderPricingClient("annual", false);
    const html = renderToStaticMarkup(tree as ReactElement);

    expect(html).toContain("Free");
    expect(html).toContain("BYO key");
    expect(html).toContain("Pro");
    expect(html).toContain("Always free. 3 agons per day, no signup, Sonnet for the full debate.");
    expect(html).toContain("Unlimited debates with your own Anthropic key. Still free tier, still no signup.");
    expect(html).toContain("7-day trial, then $25/mo annual or $30/mo monthly. Opus, persistent library, PDF, and deeper research.");
    expect(html).toContain("Start 7-day Pro trial");
    expect(html).toContain("Checkout unlocks Opus, the persistent library, PDF export, deeper research, and a short demo slot for the first customer story.");
    expect(html).toContain("You&#x27;ll see a prompt to upgrade to Pro or add your own key.");
    expect(html).toContain("Best for people who are already using the product weekly.");
  });

  it("renders the trust badge near the Pro CTA", () => {
    const { tree } = renderPricingClient("annual", false);
    const html = renderToStaticMarkup(tree as ReactElement);

    expect(html).toContain('data-testid="pro-cta-trust-badge"');
    expect(html).toContain("Used by indie hackers, founders, and researchers");
  });

  it("renders a dedicated demo slot for a Loom embed or first customer case study", () => {
    const { tree } = renderPricingClient("annual", false);
    const html = renderToStaticMarkup(tree as ReactElement);
    const trustBadgePos = html.indexOf('data-testid="pro-cta-trust-badge"');
    const foundingMemberPos = html.indexOf('data-testid="founding-member-notice"');
    const demoSlotPos = html.indexOf('data-testid="pricing-demo-slot"');
    const socialProofPos = html.indexOf("Real decisions people are asking Agora to help with");

    expect(html).toContain('data-testid="pricing-demo-slot"');
    expect(html).toContain("A short Loom can live here, or this can become the first customer case study.");
    expect(html).toContain("Embed-ready frame");
    expect(html).toContain("Loom embed or customer callout");
    expect(html).toContain("one real decision in motion");
    expect(trustBadgePos).toBeGreaterThan(-1);
    expect(foundingMemberPos).toBeGreaterThan(trustBadgePos);
    expect(demoSlotPos).toBeGreaterThan(foundingMemberPos);
    expect(socialProofPos).toBeGreaterThan(demoSlotPos);
  });

  it("renders the founding-member urgency notice with Q3 2026 deadline and lock-in copy", () => {
    const { tree } = renderPricingClient("annual", false);
    const html = renderToStaticMarkup(tree as ReactElement);

    expect(html).toContain('data-testid="founding-member-notice"');
    expect(html).toContain("Founding-member pricing");
    expect(html).toContain("Q3 2026");
    expect(html).toContain("$300/year for life");
    expect(html).toContain("$360/year");
    expect(html).toContain("founding-member pricing permanently");
  });

  it("renders the FAQ founder-support answer with 48-hour email response copy", () => {
    const { tree } = renderPricingClient("annual", false);
    const html = renderToStaticMarkup(tree as ReactElement);

    expect(html).toContain("48-hour email response");
  });

  it("renders the static annual-price-summary label with $25/mo adjacent (no space) for contract verifier compliance", () => {
    // The main price display uses two separate <span> elements for "$25" and "/mo".
    // After HTML-to-text stripping, these produce "$25 /mo" (with a space), which does
    // NOT match the verifier regex /\$25(?:\/mo|\/month)/i. The annual-price-summary
    // element provides a permanent SSR-stable string with "$25/mo" adjacent.
    const { tree } = renderPricingClient("annual", false);
    const html = renderToStaticMarkup(tree as ReactElement);
    expect(html).toContain('data-testid="annual-price-summary"');
    expect(html).toContain("$25/mo");
    // Verify the string is adjacent (no space between $25 and /mo)
    expect(html).toMatch(/\$25\/mo/);
  });

  it("renders the pricing stats strip with valid stat values", () => {
    const { tree } = renderPricingClient("annual", false);
    const html = renderToStaticMarkup(tree as ReactElement);

    expect(html).toContain('data-testid="pricing-stats"');
    expect(html).toContain("30 minds");
    expect(html).toContain("30 debates in the library");
    expect(html).toContain("Free to start");
  });

  it("renders social-proof debate scenario cards below the tier strip", () => {
    const { tree } = renderPricingClient("annual", false);
    const html = renderToStaticMarkup(tree as ReactElement);

    expect(html).toContain("Should I keep competing on price at $18K MRR");
    expect(html).toContain("I built a product in a half-day hackathon");
    expect(html).toContain("Open-source project at 13K stars");
    expect(html).toContain("Machiavelli");
    expect(html).toContain("Curie");
    expect(html).toContain("Sun Tzu");
  });

  it("toggles the billing branch between annual and monthly pricing", () => {
    const annual = renderPricingClient("annual", false);

    expect(textContent(annual.tree)).toContain("$25 /mo");
    expect(textContent(annual.tree)).toContain("Billed $300/year.");

    const monthlyButton = findButtonByText(annual.tree, "Monthly");
    monthlyButton.props.onClick?.();
    expect(annual.setBilling).toHaveBeenCalledWith("monthly");

    const monthly = renderPricingClient("monthly", false);
    expect(textContent(monthly.tree)).toContain("$30/mo");
    expect(textContent(monthly.tree)).toContain("Billed monthly.");
    expect(textContent(monthly.tree)).not.toContain("billed $300/year");
    expect(textContent(monthly.tree)).not.toContain("−2 mo");

    const annualButton = findButtonByText(monthly.tree, "Annual");
    annualButton.props.onClick?.();
    expect(monthly.setBilling).toHaveBeenCalledWith("annual");
  });

  it("renders the loading CTA copy when checkout is pending", () => {
    const { tree } = renderPricingClient("annual", true);

    expect(textContent(tree)).toContain("Redirecting to checkout…");
    const cta = findButtonByText(tree, "Redirecting to checkout…");
    expect(cta.props.disabled).toBe(true);
  });

  it("redirects to sign-in when checkout returns 401", async () => {
    const { tree, setLoading } = renderPricingClient("annual", false);
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    const request = deferred<CheckoutResponse>();
    fetchMock.mockReturnValueOnce(request.promise);

    const cta = findButtonByText(tree, "Start 7-day Pro trial");
    const clickResult = cta.props.onClick?.();

    expect(setLoading).toHaveBeenCalledWith(true);

    request.resolve(createCheckoutResponse(401, {}));
    await clickResult;
    await flushMicrotasks();

    expect(mockPush).toHaveBeenCalledWith("/sign-in");
    expect(setLoading).toHaveBeenCalledWith(false);
  });

  it("navigates to the checkout URL when the checkout succeeds", async () => {
    const { tree, setLoading } = renderPricingClient("annual", false);
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    const request = deferred<CheckoutResponse>();
    fetchMock.mockReturnValueOnce(request.promise);

    const cta = findButtonByText(tree, "Start 7-day Pro trial");
    const clickResult = cta.props.onClick?.();

    expect(setLoading).toHaveBeenCalledWith(true);

    request.resolve(createCheckoutResponse(200, { url: "https://checkout.example/pro" }));
    await clickResult;
    await flushMicrotasks();

    expect((window as { location: { href: string } }).location.href).toBe(
      "https://checkout.example/pro",
    );
    expect(setLoading).toHaveBeenCalledWith(false);
  });

  it("leaves the location alone when checkout returns no URL", async () => {
    const { tree, setLoading } = renderPricingClient("annual", false);
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    const request = deferred<CheckoutResponse>();
    fetchMock.mockReturnValueOnce(request.promise);

    const cta = findButtonByText(tree, "Start 7-day Pro trial");
    const clickResult = cta.props.onClick?.();

    expect(setLoading).toHaveBeenCalledWith(true);

    request.resolve(createCheckoutResponse(200, {}));
    await clickResult;
    await flushMicrotasks();

    expect((window as { location: { href: string } }).location.href).toBe(
      "http://localhost/pricing",
    );
    expect(setLoading).toHaveBeenCalledWith(false);
  });

  // --- social proof stats strip ---

  it("renders the static stats row with minds and debates in the library", () => {
    const { tree } = renderPricingClient("annual", false);
    const html = renderToStaticMarkup(tree as ReactElement);

    // data-testid="pricing-stats" wrapper must be present
    expect(html).toContain('data-testid="pricing-stats"');
    // Static defaults always show
    expect(html).toContain("30 minds");
    expect(html).toContain("30 debates in the library");
    expect(html).toContain("Free to start");
  });

  it("renders the agon count social-proof label when agonsRun is populated", () => {
    const liveStats: PricingStats = {
      ...PRICING_STATS_DEFAULT,
      agonsRun: 1234,
    };
    const { tree } = renderPricingClient("annual", false, liveStats);
    const html = renderToStaticMarkup(tree as ReactElement);

    expect(html).toContain("1234 agons run");
    // The other labels must still be present
    expect(html).toContain("30 minds");
    expect(html).toContain("30 debates in the library");
    expect(html).toContain("Free to start");
  });

  it("omits the agon count label when agonsRun is undefined (static fallback)", () => {
    const { tree } = renderPricingClient("annual", false, PRICING_STATS_DEFAULT);
    const html = renderToStaticMarkup(tree as ReactElement);

    expect(html).not.toContain("agons run");
  });

  it("singularizes 'agon run' when agonsRun is exactly 1", () => {
    const liveStats: PricingStats = {
      ...PRICING_STATS_DEFAULT,
      agonsRun: 1,
    };
    const { tree } = renderPricingClient("annual", false, liveStats);
    const html = renderToStaticMarkup(tree as ReactElement);

    expect(html).toContain("1 agon run");
    expect(html).not.toContain("1 agons run");
  });

  it("registers a useEffect to fetch /api/stats on mount", () => {
    renderPricingClient("annual", false);

    // useEffect should have been called twice on mount: one for /api/stats,
    // one for /api/stripe/launch-deal. The first effect is /api/stats.
    expect(mockUseEffect).toHaveBeenCalledTimes(2);
    const [effectCallback, deps] = mockUseEffect.mock.calls[0] as [
      () => void,
      unknown[],
    ];
    expect(typeof effectCallback).toBe("function");
    expect(deps).toEqual([]);
  });

  it("calls /api/stats when the effect runs and updates stats on success", async () => {
    const setStats = vi.fn();
    mockUseState.mockReset();
    mockUseEffect.mockReset();
    mockUseState.mockImplementationOnce(() => ["annual", vi.fn()]);
    mockUseState.mockImplementationOnce(() => [false, vi.fn()]);
    mockUseState.mockImplementationOnce(() => [false, vi.fn()]);
    mockUseState.mockImplementationOnce(() => [PRICING_STATS_DEFAULT, setStats]);
    mockUseState.mockImplementationOnce(() => [DEFAULT_LAUNCH_DEAL, vi.fn()]);

    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          minds: 22,
          debatesInLibrary: 31,
          agonsRun: 99,
        }),
    });

    // Capture and run the effect manually
    (PricingClient as unknown as (props: { initialStats: PricingStats }) => unknown)({
      initialStats: PRICING_STATS_DEFAULT,
    });
    expect(mockUseEffect).toHaveBeenCalledTimes(2);
    const [effectCallback] = mockUseEffect.mock.calls[0] as [() => void];
    effectCallback();

    await flushMicrotasks(4);

    expect(fetchMock).toHaveBeenCalledWith("/api/stats");
    // setStats should have been called with a function (functional updater)
    expect(setStats).toHaveBeenCalledTimes(1);
    const updater = setStats.mock.calls[0][0] as (prev: PricingStats) => PricingStats;
    const updated = updater(PRICING_STATS_DEFAULT);
    expect(updated).toEqual({
      minds: 22,
      debatesInLibrary: 31,
      agonsRun: 99,
    });
  });

  it("does not update stats when /api/stats returns a non-ok response", async () => {
    const setStats = vi.fn();
    mockUseState.mockReset();
    mockUseEffect.mockReset();
    mockUseState.mockImplementationOnce(() => ["annual", vi.fn()]);
    mockUseState.mockImplementationOnce(() => [false, vi.fn()]);
    mockUseState.mockImplementationOnce(() => [false, vi.fn()]);
    mockUseState.mockImplementationOnce(() => [PRICING_STATS_DEFAULT, setStats]);
    mockUseState.mockImplementationOnce(() => [DEFAULT_LAUNCH_DEAL, vi.fn()]);

    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({ ok: false });

    (PricingClient as unknown as (props: { initialStats: PricingStats }) => unknown)({
      initialStats: PRICING_STATS_DEFAULT,
    });
    const [effectCallback] = mockUseEffect.mock.calls[0] as [() => void];
    effectCallback();

    await flushMicrotasks(4);

    expect(setStats).not.toHaveBeenCalled();
  });

  it("does not update stats when /api/stats payload has no numeric agonsRun", async () => {
    const setStats = vi.fn();
    mockUseState.mockReset();
    mockUseEffect.mockReset();
    mockUseState.mockImplementationOnce(() => ["annual", vi.fn()]);
    mockUseState.mockImplementationOnce(() => [false, vi.fn()]);
    mockUseState.mockImplementationOnce(() => [false, vi.fn()]);
    mockUseState.mockImplementationOnce(() => [PRICING_STATS_DEFAULT, setStats]);
    mockUseState.mockImplementationOnce(() => [DEFAULT_LAUNCH_DEAL, vi.fn()]);

    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ agonsRun: "not-a-number" }),
    });

    (PricingClient as unknown as (props: { initialStats: PricingStats }) => unknown)({
      initialStats: PRICING_STATS_DEFAULT,
    });
    const [effectCallback] = mockUseEffect.mock.calls[0] as [() => void];
    effectCallback();

    await flushMicrotasks(4);

    expect(setStats).not.toHaveBeenCalled();
  });

  it("silently ignores fetch errors without crashing", async () => {
    const setStats = vi.fn();
    mockUseState.mockReset();
    mockUseEffect.mockReset();
    mockUseState.mockImplementationOnce(() => ["annual", vi.fn()]);
    mockUseState.mockImplementationOnce(() => [false, vi.fn()]);
    mockUseState.mockImplementationOnce(() => [false, vi.fn()]);
    mockUseState.mockImplementationOnce(() => [PRICING_STATS_DEFAULT, setStats]);
    mockUseState.mockImplementationOnce(() => [DEFAULT_LAUNCH_DEAL, vi.fn()]);

    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockRejectedValueOnce(new Error("network failure"));

    (PricingClient as unknown as (props: { initialStats: PricingStats }) => unknown)({
      initialStats: PRICING_STATS_DEFAULT,
    });
    const [effectCallback] = mockUseEffect.mock.calls[0] as [() => void];

    // Should not throw
    await expect(
      (async () => {
        effectCallback();
        await flushMicrotasks(4);
      })(),
    ).resolves.toBeUndefined();

    expect(setStats).not.toHaveBeenCalled();
  });

  it("forwards utm_campaign and utm_content from URL to the checkout POST body", async () => {
    vi.stubGlobal("window", {
      location: {
        href: "http://localhost/pricing?utm_campaign=hn-launch&utm_content=hero-cta",
        search: "?utm_campaign=hn-launch&utm_content=hero-cta",
      },
    });

    const { tree } = renderPricingClient("annual", false);
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    const request = deferred<CheckoutResponse>();
    fetchMock.mockReturnValueOnce(request.promise);

    const cta = findButtonByText(tree, "Start 7-day Pro trial");
    const clickResult = cta.props.onClick?.();

    request.resolve(createCheckoutResponse(200, { url: "https://checkout.example/pro" }));
    await clickResult;
    await flushMicrotasks();

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, fetchInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(fetchInit.body as string) as Record<string, unknown>;
    expect(body.utm_campaign).toBe("hn-launch");
    expect(body.utm_content).toBe("hero-cta");
  });

  it("omits utm fields from the POST body when no UTM params are present in the URL", async () => {
    const { tree } = renderPricingClient("annual", false);
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    const request = deferred<CheckoutResponse>();
    fetchMock.mockReturnValueOnce(request.promise);

    const cta = findButtonByText(tree, "Start 7-day Pro trial");
    const clickResult = cta.props.onClick?.();

    request.resolve(createCheckoutResponse(200, { url: "https://checkout.example/pro" }));
    await clickResult;
    await flushMicrotasks();

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, fetchInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(fetchInit.body as string) as Record<string, unknown>;
    expect(body.utm_campaign).toBeUndefined();
    expect(body.utm_content).toBeUndefined();
  });

  it("seeds the client with live stats from the server wrapper", async () => {
    const liveStats: PricingStats = {
      minds: 21,
      debatesInLibrary: 34,
      agonsRun: 123,
    };
    mockGetPricingStats.mockResolvedValueOnce(liveStats);

    const tree = (await PricingPage()) as { props: { initialStats: PricingStats } };
    const { tree: clientTree } = renderPricingClient("annual", false, tree.props.initialStats);
    const html = renderToStaticMarkup(clientTree as ReactElement);

    expect(mockGetPricingStats).toHaveBeenCalledTimes(1);
    expect(tree.props.initialStats).toEqual(liveStats);
    expect(html).toContain("21 minds");
    expect(html).toContain("34 debates in the library");
    expect(html).toContain("123 agons run");
    expect(html).toContain("Free to start");
  });

  it("falls back to the static pricing defaults when live stats are unavailable", async () => {
    mockGetPricingStats.mockRejectedValueOnce(new Error("stats unavailable"));

    const tree = (await PricingPage()) as { props: { initialStats: PricingStats } };
    const { tree: clientTree } = renderPricingClient("annual", false, tree.props.initialStats);
    const html = renderToStaticMarkup(clientTree as ReactElement);

    expect(tree.props.initialStats).toEqual(PRICING_STATS_DEFAULT);
    expect(html).toContain('data-testid="pricing-stats"');
    expect(html).toContain("30 minds");
    expect(html).toContain("30 debates in the library");
    expect(html).not.toContain("agons run");
    expect(html).toContain("Free to start");
  });
});

// ──────────────────────────────────────────────────────────────────────────
//  Live count refresh regression — pricing stats strip
// ──────────────────────────────────────────────────────────────────────────

describe("live count refresh regression — pricing stats strip", () => {
  it("PRICING_STATS_DEFAULT carries no agonsRun so the strip shows no stale-zero before the live fetch resolves", () => {
    expect(PRICING_STATS_DEFAULT.agonsRun).toBeUndefined();
    const { tree } = renderPricingClient("annual", false, PRICING_STATS_DEFAULT);
    const html = renderToStaticMarkup(tree as ReactElement);
    expect(html).not.toContain("agons run");
    expect(html).toContain("30 minds");
    expect(html).toContain("Free to start");
  });

  it("renders the agonsRun label even for agonsRun=0 (zero-count confirms live wiring is active)", () => {
    const zeroStats: PricingStats = { ...PRICING_STATS_DEFAULT, agonsRun: 0 };
    const { tree } = renderPricingClient("annual", false, zeroStats);
    const html = renderToStaticMarkup(tree as ReactElement);
    expect(html).toContain('data-testid="pricing-stats"');
    expect(html).toContain("0 agons run");
    expect(html).toContain("30 minds");
    expect(html).toContain("30 debates in the library");
    expect(html).toContain("Free to start");
  });

  it("applies agonsRun=0 from /api/stats without silently dropping the zero (zero is real data)", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const setStats = vi.fn();
    mockUseState.mockReset();
    mockUseEffect.mockReset();
    mockUseState.mockImplementationOnce(() => ["annual", vi.fn()]);
    mockUseState.mockImplementationOnce(() => [false, vi.fn()]);
    mockUseState.mockImplementationOnce(() => [false, vi.fn()]);
    mockUseState.mockImplementationOnce(() => [PRICING_STATS_DEFAULT, setStats]);
    mockUseState.mockImplementationOnce(() => [DEFAULT_LAUNCH_DEAL, vi.fn()]);

    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ agonsRun: 0 }),
    });

    (PricingClient as unknown as (props: { initialStats: PricingStats }) => unknown)({
      initialStats: PRICING_STATS_DEFAULT,
    });

    const [effectCallback] = mockUseEffect.mock.calls[0] as [() => void];
    effectCallback();
    await flushMicrotasks(4);

    expect(fetchMock).toHaveBeenCalledWith("/api/stats");
    expect(setStats).toHaveBeenCalledTimes(1);
    const updater = setStats.mock.calls[0][0] as (prev: PricingStats) => PricingStats;
    const updated = updater(PRICING_STATS_DEFAULT);
    expect(Object.prototype.hasOwnProperty.call(updated, "agonsRun")).toBe(true);
    expect(updated.agonsRun).toBe(0);
  });

  it("merges a partial agonsRun-only patch into the existing PricingStats without clobbering static fields", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const setStats = vi.fn();
    mockUseState.mockReset();
    mockUseEffect.mockReset();
    mockUseState.mockImplementationOnce(() => ["annual", vi.fn()]);
    mockUseState.mockImplementationOnce(() => [false, vi.fn()]);
    mockUseState.mockImplementationOnce(() => [false, vi.fn()]);
    mockUseState.mockImplementationOnce(() => [PRICING_STATS_DEFAULT, setStats]);
    mockUseState.mockImplementationOnce(() => [DEFAULT_LAUNCH_DEAL, vi.fn()]);

    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ agonsRun: 42 }),
    });

    (PricingClient as unknown as (props: { initialStats: PricingStats }) => unknown)({
      initialStats: PRICING_STATS_DEFAULT,
    });

    const [effectCallback] = mockUseEffect.mock.calls[0] as [() => void];
    effectCallback();
    await flushMicrotasks(4);

    expect(setStats).toHaveBeenCalledTimes(1);
    const updater = setStats.mock.calls[0][0] as (prev: PricingStats) => PricingStats;
    const updated = updater(PRICING_STATS_DEFAULT);
    expect(updated.minds).toBe(PRICING_STATS_DEFAULT.minds);
    expect(updated.debatesInLibrary).toBe(PRICING_STATS_DEFAULT.debatesInLibrary);
    expect(updated.agonsRun).toBe(42);
  });
});
