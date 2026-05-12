import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const mockPush = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

import PricingPage from "./page";

describe("pricing page", () => {
  it("renders the Free, BYO key, and Pro tiers with the stronger Pro CTA", () => {
    const html = renderToStaticMarkup(<PricingPage />);

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
});
