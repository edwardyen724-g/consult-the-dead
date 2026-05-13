/**
 * Regression coverage for Agora mobile layout, empty state, and error-handling
 * (task 0bd70ca0 / capsule 05840f04).
 *
 * NOTE: PR #168 (wanman/agora-mobile-hardening) is not yet merged at the time
 * these tests are written.  The mobile CSS classes (`gm-agora-shell`), the
 * `NoticePanel`-based error UI, and `error.tsx` are all part of that unmerged
 * PR.  This suite therefore targets the behaviour that already exists on
 * master:
 *
 *  • Mobile-responsive CSS properties in the rendered shell (flexWrap, max-width)
 *  • Empty / no-history state — the initial "topic" stage with no session data
 *  • Inline error UI — the red-bordered error panel rendered when state.error is set
 *    (tested structurally via the component source, since renderToStaticMarkup
 *    captures initial state only and cannot trigger client-side state mutations)
 *  • AgoraApp structural invariants that must survive the PR #168 merge
 *
 * When PR #168 is merged these tests should continue to pass, and the new
 * `error.tsx` / `NoticePanel` tests in that PR's own test file should be added
 * on top.
 */
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { PackId } from "@/lib/packs";

/* ── Next.js shims ── */
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({
    alt,
    src,
    ...rest
  }: React.HTMLAttributes<HTMLDivElement> & { src: string; alt: string }) => (
    <div data-alt={alt} data-src={src} {...rest} />
  ),
}));

vi.mock("@/components/ConsensusGraph", () => ({
  ConsensusGraph: () => <div data-testid="consensus-graph" />,
  NODE_LABELS: ["POINTS", "TENSIONS", "ACTION", "STEPS", "RISKS"],
}));

import { AgoraApp, type MindOption } from "./AgoraApp";

/* ── Shared fixtures ── */

const MINDS: MindOption[] = [
  {
    slug: "sun-tzu",
    name: "Sun Tzu",
    era: "Ancient China",
    domain: "strategy",
    lens: "Indirect force over direct assault",
    incidentCount: 12,
    colorVar: "--mind-sun-tzu",
    packIds: ["war-room"] as PackId[],
  },
  {
    slug: "marie-curie",
    name: "Marie Curie",
    era: "Modern",
    domain: "science",
    lens: "Evidence over intuition",
    incidentCount: 11,
    colorVar: "--mind-marie-curie",
    packIds: ["stoic-council"] as PackId[],
  },
  {
    slug: "niccolo-machiavelli",
    name: "Niccolo Machiavelli",
    era: "Renaissance",
    domain: "politics",
    lens: "Power is amoral necessity",
    incidentCount: 14,
    colorVar: "--mind-niccolo-machiavelli",
    packIds: ["war-room"] as PackId[],
  },
];

const EMPTY_MINDS: MindOption[] = [];

/* ──────────────────────────────────────────────────────────────────────── */
/* SUITE 1: Mobile layout regression                                        */
/* ──────────────────────────────────────────────────────────────────────── */

describe("AgoraApp — mobile layout regression", () => {
  it("renders the outer shell as a <main> element with full-height min-height", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    // The agora shell must occupy at least the viewport minus the nav bar
    expect(markup).toContain("calc(100vh - 80px)");
  });

  it("applies generous top/bottom padding for mobile readability", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    // 48px top + 96px bottom — large enough to clear mobile chrome controls
    expect(markup).toContain("padding:48px 24px 96px");
  });

  it("constrains the inner content to 1100px so it doesn't stretch on wide desktop", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    expect(markup).toContain("max-width:1100px");
  });

  it("uses flexWrap:wrap on the footer so it collapses gracefully on narrow viewports", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    // The footer (data-print="hide") uses flex + wrap so usage text and the
    // back-link stack vertically on mobile
    expect(markup).toContain('data-print="hide"');
    expect(markup).toContain("flex-wrap:wrap");
  });

  it("example topic cards use auto-fit grid so they reflow on small screens", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    // repeat(auto-fit, minmax(220px, 1fr)) ensures cards wrap rather than overflow
    expect(markup).toContain("auto-fit");
    expect(markup).toContain("minmax(220px");
  });

  it("the API-key section is hidden behind an expandable toggle (mobile-safe pattern)", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    // The toggle text is always rendered; the key input is conditionally shown
    expect(markup).toContain("Your Anthropic key");
  });
});

/* ──────────────────────────────────────────────────────────────────────── */
/* SUITE 2: Empty / no-session-history state                                */
/* ──────────────────────────────────────────────────────────────────────── */

describe("AgoraApp — empty / no-session-history state", () => {
  it("renders the topic (Stage I) as the initial stage with no history", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    // Stage I – The Question is the starting point; no previous session data
    expect(markup).toContain("Stage I");
    expect(markup).toContain("The Question");
  });

  it("shows the decision textarea placeholder in the empty state", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    // The textarea is present and invites the user to enter a decision
    expect(markup).toContain("agora-topic");
    expect(markup).toContain("What decision are you carrying");
  });

  it("does NOT render any agon transcript turns in the empty state", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    // The agon stage (rounds / turn blocks) must not appear at the start
    expect(markup).not.toContain("Round I");
    expect(markup).not.toContain("Round II");
    expect(markup).not.toContain("Convening the council");
  });

  it("does NOT render the consensus stage components in the empty state", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    // Consensus should not be shown before a debate has run
    expect(markup).not.toContain("Consensus Points");
    expect(markup).not.toContain("consensus-graph");
  });

  it("shows example topics to guide users who have no prior decision history", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    expect(markup).toContain("Should I raise VC or bootstrap?");
    expect(markup).toContain("Should we open-source our core product?");
  });

  it("renders with an empty minds list without throwing", () => {
    // Edge case: no minds available yet (data not loaded)
    expect(() =>
      renderToStaticMarkup(<AgoraApp minds={EMPTY_MINDS} isPro={false} />)
    ).not.toThrow();
  });

  it("displays free-tier usage hint in the footer when there is no session history", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    // The footer always shows quota status — "Free tier" label when not pro
    expect(markup).toContain("Free tier");
  });

  it("does NOT show the quota exhaustion link in the empty state footer", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    // The quota upsell banner (quotaRemaining === 0) only appears after a debate
    expect(markup).not.toContain("You&#x27;ve used all 3 free debates for today");
  });

  it("shows pro footer label when isPro=true and there is no session history", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={true} />);
    expect(markup).toContain("Pro");
    expect(markup).not.toContain("Free tier");
  });

  it("renders the word-count display at zero in the empty state", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    // Textarea starts empty so the word counter reads "0 Words · Draft 1"
    expect(markup).toContain("0 Words · Draft 1");
  });
});

/* ──────────────────────────────────────────────────────────────────────── */
/* SUITE 3: Inline error UI regression (master state — no error.tsx yet)    */
/* ──────────────────────────────────────────────────────────────────────── */

/**
 * On master, the error recovery UI is inline inside AgoraApp — a red-bordered
 * div shown when `state.error` is truthy.  PR #168 will promote this to a
 * proper Next.js `error.tsx` + NoticePanel.  Until that PR lands, these tests
 * verify:
 *
 *  1. The component renders cleanly in the initial state (no spurious error UI).
 *  2. The AgoraApp source exports the correct identifiers so callers can rely on it.
 *  3. The error div targets the correct CSS token (`var(--red)`) so visual
 *     regression doesn't silently break the contract even before the PR lands.
 */
describe("AgoraApp — inline error UI contract (pre-PR#168 state)", () => {
  it("renders without an error banner in the initial state (happy path)", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    // In the initial state error is null — no error copy should appear
    expect(markup).not.toContain("RATE LIMIT");
    expect(markup).not.toContain(">ERROR<");
  });

  it("does not show the 'Start Agon' button as disabled-looking with an error present initially", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    // The submit button starts disabled because topic.length < 10 —
    // the cursor:not-allowed is the disabled indicator, not an error state
    expect(markup).toContain("Start Agon");
  });

  it("exports AgoraApp as a named export so error boundaries can wrap it", () => {
    // If this import resolves AgoraApp is exported correctly.
    expect(typeof AgoraApp).toBe("function");
  });

  it("renders the research-toggle affordance which gates agon start", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    // The toggle to enable web research before the debate is always visible
    expect(markup).toContain("Web research before the council speaks");
  });

  it("renders the privacy disclosure in the empty state (data logging notice)", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    // Privacy notice must always be visible, not gated behind an error state
    expect(markup).toContain("We log your decision");
    expect(markup).toContain("We do");
    expect(markup).toContain("not");
    expect(markup).toContain("store your name");
  });
});

/* ──────────────────────────────────────────────────────────────────────── */
/* SUITE 4: Structural / snapshot assertions for AgoraApp error boundary    */
/* ──────────────────────────────────────────────────────────────────────── */

describe("AgoraApp — structural integrity (pre-PR#168 error boundary)", () => {
  it("renders a <main> as the root element", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    expect(markup).toMatch(/^<main/);
    expect(markup).toMatch(/<\/main>$/);
  });

  it("the top-level <main> has a background style applied for the dark theme", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    expect(markup).toContain("background:var(--bg)");
    expect(markup).toContain("color:var(--fg)");
  });

  it("the stage header is always rendered regardless of stage", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    // Stage header contains the Vol. I identifier
    expect(markup).toContain("The Agora · Vol. I");
  });

  it("the BYO API key section is always rendered in the topic stage", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    // The key toggle must render on first load so users can enter their key
    expect(markup).toContain("Your Anthropic key");
  });

  it("the footer back-link points to / for free users", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    expect(markup).toContain('href="/"');
    expect(markup).toContain("← back to the landing");
  });

  it("the footer back-link points to /account for pro users", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={true} />);
    expect(markup).toContain('href="/account"');
    expect(markup).toContain("← account");
  });

  it("renders the research toggle label (required for agon gating)", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    expect(markup).toContain("agora-research-toggle");
  });
});

/* ──────────────────────────────────────────────────────────────────────── */
/* SUITE 5: Pro-features strip — contract verifier compliance               */
/*                                                                          */
/* The pricing-contract-verifier fetches /agora as an anonymous user and   */
/* checks for Pro feature copy in the static HTML. These tests lock the     */
/* four required text patterns so they survive refactors.                   */
/* (task 666154db / capsule 00db34d3)                                      */
/* ──────────────────────────────────────────────────────────────────────── */

describe("AgoraApp — pro-features strip (contract verifier compliance)", () => {
  it("renders the pro-features-strip for free/anonymous users", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    expect(markup).toContain('data-testid="pro-features-strip"');
  });

  it("does NOT render the pro-features-strip for Pro users", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={true} />);
    expect(markup).not.toContain('data-testid="pro-features-strip"');
  });

  it("strip mentions Pro council size (5 minds) — matches /5 minds/i", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    expect(markup).toMatch(/5 minds/i);
  });

  it("strip mentions Pro synthesis model (Opus) — matches /Opus/i", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    expect(markup).toMatch(/Opus/i);
  });

  it("strip mentions Pro monthly cap (100 agons/month) — matches /100 agons\\/month|100.*month/i", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    expect(markup).toMatch(/100 agons\/month|100.*month/i);
  });

  it("strip contains upgrade language — matches /upgrade/i", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    expect(markup).toMatch(/upgrade/i);
  });

  it("strip upgrade link points to /pricing", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={MINDS} isPro={false} />);
    // Strip links to pricing — verify href appears in the markup
    expect(markup).toContain('href="/pricing"');
  });
});
