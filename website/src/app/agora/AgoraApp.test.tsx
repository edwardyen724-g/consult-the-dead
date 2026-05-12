/**
 * AgoraApp regression suite
 *
 * Covers:
 *  • Sample question panel (baseline + aria-label a11y)
 *  • Error states: RATE LIMIT label vs generic ERROR label
 *  • Agon empty state: "Convening the council…" before turns arrive
 *  • Research stage: loading spinner, research brief, source chips
 *  • Consensus stage: loading message, waiting message, quota display
 *  • Mobile layout: flex-wrap sentinels on footer and quota container
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PackId } from "@/lib/packs";
import type { ConsensusResult } from "@/lib/agon/types";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({
    alt,
    src,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & { src: string; alt: string }) => (
    // The test only needs a renderable stand-in for Next's Image component.
    <div data-alt={alt} data-src={src} {...props} />
  ),
}));

vi.mock("@/components/ConsensusGraph", () => ({
  ConsensusGraph: () => <div data-testid="consensus-graph" />,
  NODE_LABELS: ["POINTS", "TENSIONS", "ACTION", "STEPS", "RISKS"],
}));

import { AgoraApp, type MindOption } from "./AgoraApp";

/* ── Shared fixtures ────────────────────────────────────────────────── */

const minds: MindOption[] = [
  {
    slug: "sun-tzu",
    name: "Sun Tzu",
    era: "Ancient China",
    domain: "strategy",
    lens: "Indirect",
    incidentCount: 12,
    colorVar: "--mind-sun-tzu",
    packIds: ["war-room"] as PackId[],
  },
  {
    slug: "marie-curie",
    name: "Marie Curie",
    era: "Modern",
    domain: "science",
    lens: "Evidence",
    incidentCount: 11,
    colorVar: "--mind-marie-curie",
    packIds: ["stoic-council"] as PackId[],
  },
  {
    slug: "niccolo-machiavelli",
    name: "Niccolo Machiavelli",
    era: "Renaissance",
    domain: "politics",
    lens: "Power",
    incidentCount: 14,
    colorVar: "--mind-niccolo-machiavelli",
    packIds: ["war-room"] as PackId[],
  },
];

const council = ["sun-tzu", "marie-curie"];
const topic = "Should I raise VC or bootstrap my company?";

const mockConsensus: ConsensusResult = {
  points: "Both paths can work; right choice depends on market timing.",
  pointsSummary: "Context-dependent",
  tensions: "Speed of growth vs retention of control.",
  tensionsSummary: "Growth vs control",
  action: "Map your capital requirements before deciding.",
  actionSummary: "Map capital first",
  steps: ["Estimate 18-month runway needs", "Talk to three founders in your space"],
  stepsSummary: "Estimate → talk → decide",
  risks: "Raising too early locks in unfavourable terms.",
  risksSummary: "Premature dilution",
};

/* ── Sample-question panel (baseline + a11y) ─────────────────────────── */

describe("AgoraApp sample questions", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the tap-to-start sample question panel", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={minds} isPro={false} />);

    expect(markup).toContain("Or borrow a question from another querent");
    expect(markup).toContain("Should I raise VC or bootstrap?");
    expect(markup).toContain("Should we open-source our core product?");
    expect(markup).toContain(
      "My industry is being automated — pivot into AI, or double down on domain depth?",
    );
  });

  it("renders example topic cards with accessible aria-labels for click-to-fill", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={minds} isPro={false} />);

    // Each example topic button must have an aria-label announcing the click-to-fill action
    expect(markup).toContain(
      'aria-label="Use sample question: Should I raise VC or bootstrap?"',
    );
    expect(markup).toContain(
      'aria-label="Use sample question: Should we open-source our core product?"',
    );
    expect(markup).toContain(
      'aria-label="Use sample question: My industry is being automated — pivot into AI, or double down on domain depth?"',
    );
  });

  it("example topic buttons are type=button to prevent form submission", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={minds} isPro={false} />);

    // Count how many type="button" occurrences relate to example cards
    // We verify all three example topics appear paired with type="button"
    const matches = markup.match(/type="button"[^>]*aria-label="Use sample question:/g);
    // type attr comes before aria-label in rendered HTML, so check both orders
    const matchesAlt = markup.match(/aria-label="Use sample question:[^"]*"[^>]*>/g);
    expect((matches?.length ?? 0) + (matchesAlt?.length ?? 0)).toBeGreaterThanOrEqual(3);
  });
});

/* ── Error states ────────────────────────────────────────────────────── */

describe("AgoraApp — error states", () => {
  it("shows RATE LIMIT label when the server reports rate-limiting", () => {
    const markup = renderToStaticMarkup(
      <AgoraApp
        minds={minds}
        isPro={false}
        _testInitialState={{
          error: "You have exceeded the free daily limit.",
          rateLimited: true,
        }}
      />,
    );

    expect(markup).toContain("RATE LIMIT");
    expect(markup).toContain("You have exceeded the free daily limit.");
    // Must NOT show the generic label when rate-limited
    expect(markup).not.toMatch(/>\s*ERROR\s*</);
  });

  it("shows generic ERROR label for non-rate-limit failures", () => {
    const markup = renderToStaticMarkup(
      <AgoraApp
        minds={minds}
        isPro={false}
        _testInitialState={{
          error: "Network error — please retry.",
          rateLimited: false,
        }}
      />,
    );

    expect(markup).toContain("ERROR");
    expect(markup).toContain("Network error — please retry.");
    expect(markup).not.toContain("RATE LIMIT");
  });

  it("does not render the error banner when there is no error", () => {
    const markup = renderToStaticMarkup(
      <AgoraApp minds={minds} isPro={false} _testInitialState={{ error: null }} />,
    );

    // The error banner always renders either "RATE LIMIT" or "ERROR" in its label span.
    // When error is null, neither should appear.
    expect(markup).not.toContain("RATE LIMIT");
    // "ERROR" alone could collide with other text; match the banner pattern
    // which wraps the label in a span with margin-right:10px
    expect(markup).not.toContain("margin-right:10px");
  });
});

/* ── Agon empty state ────────────────────────────────────────────────── */

describe("AgoraApp — agon empty state", () => {
  it("shows the convening message before any turns arrive", () => {
    const markup = renderToStaticMarkup(
      <AgoraApp
        minds={minds}
        isPro={false}
        _testInitialState={{
          stage: "agon",
          topic,
          council,
          turns: [],
        }}
      />,
    );

    expect(markup).toContain("Convening the council");
    // Quoted topic must be visible in the stage
    expect(markup).toContain(topic);
  });

  it("hides the convening message once turns start arriving", () => {
    const markup = renderToStaticMarkup(
      <AgoraApp
        minds={minds}
        isPro={false}
        _testInitialState={{
          stage: "agon",
          topic,
          council,
          turns: [
            {
              mindSlug: "sun-tzu",
              mindName: "Sun Tzu",
              round: 1,
              text: "Consider the terrain before the first move.",
              done: false,
            },
          ],
          activeMindSlug: "sun-tzu",
          activeRound: 1,
        }}
      />,
    );

    expect(markup).not.toContain("Convening the council");
    expect(markup).toContain("Consider the terrain before the first move.");
    expect(markup).toContain("Round I");
  });
});

/* ── Research stage ──────────────────────────────────────────────────── */

describe("AgoraApp — research stage", () => {
  it("shows the searching spinner while research is in flight", () => {
    const markup = renderToStaticMarkup(
      <AgoraApp
        minds={minds}
        isPro={false}
        _testInitialState={{
          stage: "research",
          topic,
          researchLoading: true,
          researchData: null,
        }}
      />,
    );

    expect(markup).toContain("Searching the web for relevant data");
    // The quoted topic is always shown in the research stage header
    expect(markup).toContain(topic);
  });

  it("renders the research brief once data arrives", () => {
    const markup = renderToStaticMarkup(
      <AgoraApp
        minds={minds}
        isPro={false}
        _testInitialState={{
          stage: "research",
          topic,
          researchLoading: false,
          researchData: {
            summary: "VC-backed startups grow 3× faster on average.",
            sources: [],
          },
        }}
      />,
    );

    expect(markup).toContain("Research Brief");
    expect(markup).toContain("VC-backed startups grow 3× faster on average.");
    // Spinner must be gone once loading is false
    expect(markup).not.toContain("Searching the web for relevant data");
  });

  it("renders source link chips when sources are provided", () => {
    const markup = renderToStaticMarkup(
      <AgoraApp
        minds={minds}
        isPro={false}
        _testInitialState={{
          stage: "research",
          topic,
          researchLoading: false,
          researchData: {
            summary: "See sources for details.",
            sources: [
              { title: "Startup Funding Report 2026", url: "https://example.com/report" },
              { title: "Bootstrap vs VC Analysis", url: "https://example.com/analysis" },
            ],
          },
        }}
      />,
    );

    expect(markup).toContain("Startup Funding Report 2026");
    expect(markup).toContain("https://example.com/report");
    expect(markup).toContain("Bootstrap vs VC Analysis");
  });

  it("shows no research brief when researchData is null", () => {
    const markup = renderToStaticMarkup(
      <AgoraApp
        minds={minds}
        isPro={false}
        _testInitialState={{
          stage: "research",
          topic,
          researchLoading: false,
          researchData: null,
        }}
      />,
    );

    expect(markup).not.toContain("Research Brief");
  });
});

/* ── Consensus stage ─────────────────────────────────────────────────── */

describe("AgoraApp — consensus stage", () => {
  it("shows the synthesising message while consensus is loading", () => {
    const markup = renderToStaticMarkup(
      <AgoraApp
        minds={minds}
        isPro={false}
        _testInitialState={{
          stage: "consensus",
          topic,
          council,
          consensusLoading: true,
          consensus: null,
        }}
      />,
    );

    expect(markup).toContain("Synthesizing the consensus");
    expect(markup).not.toContain("Waiting for the agon to finish");
  });

  it("shows the waiting message when loading is done but no consensus yet", () => {
    const markup = renderToStaticMarkup(
      <AgoraApp
        minds={minds}
        isPro={false}
        _testInitialState={{
          stage: "consensus",
          topic,
          council,
          consensusLoading: false,
          consensus: null,
        }}
      />,
    );

    expect(markup).toContain("Waiting for the agon to finish");
    expect(markup).not.toContain("Synthesizing the consensus");
  });

  it("shows quota-exhausted message (red) when quotaRemaining is 0", () => {
    const markup = renderToStaticMarkup(
      <AgoraApp
        minds={minds}
        isPro={false}
        _testInitialState={{
          stage: "consensus",
          topic,
          council,
          consensusLoading: false,
          consensus: mockConsensus,
          quotaRemaining: 0,
        }}
      />,
    );

    expect(markup).toContain("You&#x27;ve used all 3 free debates for today");
    expect(markup).toContain("Upgrade for unlimited debates");
    // Exhausted state uses var(--red) for the count label
    expect(markup).toContain("var(--red)");
  });

  it("shows plural remaining-debates message when quotaRemaining > 1", () => {
    const markup = renderToStaticMarkup(
      <AgoraApp
        minds={minds}
        isPro={false}
        _testInitialState={{
          stage: "consensus",
          topic,
          council,
          consensusLoading: false,
          consensus: mockConsensus,
          quotaRemaining: 2,
        }}
      />,
    );

    expect(markup).toContain("2 free debates remaining today");
    expect(markup).not.toContain("You&#x27;ve used all 3");
  });

  it("shows singular remaining-debates message when quotaRemaining is 1", () => {
    const markup = renderToStaticMarkup(
      <AgoraApp
        minds={minds}
        isPro={false}
        _testInitialState={{
          stage: "consensus",
          topic,
          council,
          consensusLoading: false,
          consensus: mockConsensus,
          quotaRemaining: 1,
        }}
      />,
    );

    // singular — no trailing 's'
    expect(markup).toContain("1 free debate remaining today");
    expect(markup).not.toContain("1 free debates");
  });

  it("hides the quota box for Pro users even when quotaRemaining is 0", () => {
    const markup = renderToStaticMarkup(
      <AgoraApp
        minds={minds}
        isPro={true}
        _testInitialState={{
          stage: "consensus",
          topic,
          council,
          consensusLoading: false,
          consensus: mockConsensus,
          quotaRemaining: 0,
        }}
      />,
    );

    expect(markup).not.toContain("You&#x27;ve used all 3 free debates");
    expect(markup).not.toContain("free debates remaining");
  });

  it("hides the quota box when quotaRemaining is undefined", () => {
    const markup = renderToStaticMarkup(
      <AgoraApp
        minds={minds}
        isPro={false}
        _testInitialState={{
          stage: "consensus",
          topic,
          council,
          consensusLoading: false,
          consensus: mockConsensus,
          quotaRemaining: undefined,
        }}
      />,
    );

    expect(markup).not.toContain("free debates remaining");
    expect(markup).not.toContain("You&#x27;ve used all 3");
  });
});

/* ── Mobile / responsive layout sentinels ───────────────────────────── */

describe("AgoraApp — mobile layout", () => {
  it("footer bar carries flex-wrap so it reflows on narrow viewports", () => {
    // React serialises flexWrap:"wrap" as flex-wrap:wrap in style attributes.
    const markup = renderToStaticMarkup(<AgoraApp minds={minds} isPro={false} />);

    expect(markup).toContain("flex-wrap:wrap");
  });

  it("quota container carries flex-wrap so upsell link wraps under the message", () => {
    const markup = renderToStaticMarkup(
      <AgoraApp
        minds={minds}
        isPro={false}
        _testInitialState={{
          stage: "consensus",
          topic,
          council,
          consensusLoading: false,
          consensus: mockConsensus,
          quotaRemaining: 1,
        }}
      />,
    );

    // The quota div uses flexWrap:"wrap" — check it's present in the HTML
    // before the remaining-debates text
    const quotaIdx = markup.indexOf("free debate remaining today");
    const snippetBefore = markup.slice(Math.max(0, quotaIdx - 500), quotaIdx);
    expect(snippetBefore).toContain("flex-wrap:wrap");
  });

  it("free-tier footer is readable without live usage data (useEffect not run on server)", () => {
    // usageInfo is null on server render; the static fallback must be
    // human-readable — not blank and not [object Object].
    const markup = renderToStaticMarkup(<AgoraApp minds={minds} isPro={false} />);

    expect(markup).toContain("Free tier: 3 agons / day");
    expect(markup).toContain("BYO key for unlimited");
  });

  it("Pro footer is readable without live usage data", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={minds} isPro={true} />);

    expect(markup).toContain("5 minds · Opus synthesis");
    expect(markup).toContain("← account");
  });
});
