import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.hoisted(() => vi.fn());
const mockUseState = vi.hoisted(() => vi.fn());

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useState: mockUseState,
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

import PricingPage from "./page";

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

function renderPricingPage(
  billing: "monthly" | "annual" = "annual",
  loading = false,
): RenderResult {
  const setBilling = vi.fn();
  const setLoading = vi.fn();

  mockUseState.mockReset();
  mockUseState.mockImplementationOnce(() => [billing, setBilling]);
  mockUseState.mockImplementationOnce(() => [loading, setLoading]);

  const tree = (PricingPage as unknown as () => unknown)();
  return { tree, setBilling, setLoading };
}

async function flushMicrotasks(times = 2): Promise<void> {
  for (let i = 0; i < times; i += 1) {
    await Promise.resolve();
  }
}

describe("pricing page", () => {
  beforeEach(() => {
    mockPush.mockReset();
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("window", {
      location: {
        href: "http://localhost/pricing",
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders the Free, BYO key, and Pro tiers with the stronger Pro CTA", () => {
    const { tree } = renderPricingPage("annual", false);
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
    expect(html).toContain("If you are already sold on the workflow, the Pro checkout is the shortest path to Opus and the persistent library.");
  });

  it("toggles the billing branch between annual and monthly pricing", () => {
    const annual = renderPricingPage("annual", false);

    expect(textContent(annual.tree)).toContain("$25/mo");
    expect(textContent(annual.tree)).toContain("billed $300/year");

    const monthlyButton = findButtonByText(annual.tree, "Monthly");
    monthlyButton.props.onClick?.();
    expect(annual.setBilling).toHaveBeenCalledWith("monthly");

    const monthly = renderPricingPage("monthly", false);
    expect(textContent(monthly.tree)).toContain("$30/mo");
    expect(textContent(monthly.tree)).toContain("billed monthly");
    expect(textContent(monthly.tree)).not.toContain("billed $300/year");
    expect(textContent(monthly.tree)).not.toContain("−2 mo");

    const annualButton = findButtonByText(monthly.tree, "Annual");
    annualButton.props.onClick?.();
    expect(monthly.setBilling).toHaveBeenCalledWith("annual");
  });

  it("renders the loading CTA copy when checkout is pending", () => {
    const { tree } = renderPricingPage("annual", true);

    expect(textContent(tree)).toContain("Redirecting to checkout…");
    const cta = findButtonByText(tree, "Redirecting to checkout…");
    expect(cta.props.disabled).toBe(true);
  });

  it("redirects to sign-in when checkout returns 401", async () => {
    const { tree, setLoading } = renderPricingPage("annual", false);
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
    const { tree, setLoading } = renderPricingPage("annual", false);
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
    const { tree, setLoading } = renderPricingPage("annual", false);
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
});
