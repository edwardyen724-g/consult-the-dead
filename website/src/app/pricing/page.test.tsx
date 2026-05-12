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
  mockUseState.mockImplementationOnce(() => [initialStats, setStats]);

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
    expect(html).toContain("Checkout unlocks Opus, the persistent library, PDF export, and deeper research.");
    expect(html).toContain("You&#x27;ll see a prompt to upgrade to Pro or add your own key.");
    expect(html).toContain("Best for people who are already using the product weekly.");
  });

  it("renders the trust badge near the Pro CTA", () => {
    const { tree } = renderPricingClient("annual", false);
    const html = renderToStaticMarkup(tree as ReactElement);

    expect(html).toContain('data-testid="pro-cta-trust-badge"');
    expect(html).toContain("Used by indie hackers, founders, and researchers");
  });

  it("renders the pricing stats strip with valid stat values", () => {
    const { tree } = renderPricingClient("annual", false);
    const html = renderToStaticMarkup(tree as ReactElement);

    expect(html).toContain('data-testid="pricing-stats"');
    expect(html).toContain("18 minds");
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
    expect(html).toContain("18 minds");
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
    expect(html).toContain("18 minds");
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

    // useEffect should have been called once with a function and empty deps
    expect(mockUseEffect).toHaveBeenCalledTimes(1);
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
    mockUseState.mockImplementationOnce(() => [PRICING_STATS_DEFAULT, setStats]);

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
    expect(mockUseEffect).toHaveBeenCalledTimes(1);
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
    mockUseState.mockImplementationOnce(() => [PRICING_STATS_DEFAULT, setStats]);

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
    mockUseState.mockImplementationOnce(() => [PRICING_STATS_DEFAULT, setStats]);

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
    mockUseState.mockImplementationOnce(() => [PRICING_STATS_DEFAULT, setStats]);

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

    expect(mockGetPricingStats).toHaveBeenCalledTimes(1);
    expect(tree.props.initialStats).toEqual(liveStats);
  });

  it("falls back to the static pricing defaults when live stats are unavailable", async () => {
    mockGetPricingStats.mockRejectedValueOnce(new Error("stats unavailable"));

    const tree = (await PricingPage()) as { props: { initialStats: PricingStats } };

    expect(tree.props.initialStats).toEqual(PRICING_STATS_DEFAULT);
  });
});
