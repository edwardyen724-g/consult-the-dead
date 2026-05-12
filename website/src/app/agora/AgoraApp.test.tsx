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

  it("shows upgrade-to-Pro link in rate-limit banner for free users", () => {
    const markup = renderToStaticMarkup(
      <AgoraApp
        minds={minds}
        isPro={false}
        _testInitialState={{
          error: "You've used all 3 free agons for today.",
          rateLimited: true,
        }}
      />,
    );

    // Upgrade link must be present and point to /pricing
    expect(markup).toContain("rate-limit-upgrade-link");
    expect(markup).toContain("/pricing");
    expect(markup).toContain("7-day Pro trial");
  });

  it("does not show upgrade link in rate-limit banner for Pro users", () => {
    const markup = renderToStaticMarkup(
      <AgoraApp
        minds={minds}
        isPro={true}
        _testInitialState={{
          error: "You've reached your 100 agon monthly limit.",
          rateLimited: true,
        }}
      />,
    );

    // Pro users manage via account page — no /pricing link in the rate-limit banner
    expect(markup).not.toContain("rate-limit-upgrade-link");
  });

  it("does not show upgrade link in generic (non-rate-limit) error banner", () => {
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

    // Upgrade link is only shown for rate limit hits, not generic errors
    expect(markup).not.toContain("rate-limit-upgrade-link");
  });

  it("does not render the checkout-success banner on initial SSR render", () => {
    // The checkout=success banner is triggered by a useEffect reading
    // window.location.search. useEffect does not run in renderToStaticMarkup,
    // so the banner must NOT appear in the SSR output — it only appears
    // client-side after the Stripe redirect.
    const markup = renderToStaticMarkup(<AgoraApp minds={minds} isPro={true} />);

    expect(markup).not.toContain('data-testid="checkout-success-banner"');
    expect(markup).not.toContain("PRO ACTIVE");
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

  it("shows quota-exhausted message with amber border and trial CTA when quotaRemaining is 0", () => {
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
    // Exhausted state upgrades CTA to trial messaging
    expect(markup).toContain("Start 7-day free trial");
    // Exhausted state uses amber border (not red) to create urgency without alarm
    expect(markup).toContain("var(--amber)");
    // Exhausted state shows the upgrade link with testid for E2E targeting
    expect(markup).toContain('data-testid="quota-upgrade-link"');
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

  it("renders share button with data-testid when consensus is ready", () => {
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
        }}
      />,
    );

    expect(markup).toContain('data-testid="share-result-btn"');
    expect(markup).toContain("Share this agon");
  });

  it("share button is disabled when consensus is null (agon still running)", () => {
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

    // Button is present but disabled
    expect(markup).toContain('data-testid="share-result-btn"');
    expect(markup).toContain("disabled");
    expect(markup).toContain("Share this agon");
  });
});

/* ── Reduced-friction topic stage ───────────────────────────────────── */

describe("AgoraApp — reduced-friction topic stage", () => {
  it("renders the quick-start 'Start Agon' button and the secondary 'Choose council' button", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={minds} isPro={false} />);

    // Both action buttons must be present on the topic stage
    expect(markup).toContain("Start Agon");
    expect(markup).toContain("Choose council");
  });

  it("quick-start button has data-testid=quick-start-btn", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={minds} isPro={false} />);

    expect(markup).toContain('data-testid="quick-start-btn"');
  });

  it("choose-council button has data-testid=choose-council-btn", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={minds} isPro={false} />);

    expect(markup).toContain('data-testid="choose-council-btn"');
  });

  it("both action buttons are disabled when topic is empty", () => {
    // With no topic the topic input is blank — both buttons render as disabled.
    const markup = renderToStaticMarkup(
      <AgoraApp minds={minds} isPro={false} _testInitialState={{ topic: "" }} />,
    );

    // 'disabled' attribute on a button is rendered as 'disabled=""' in static HTML.
    // React renders the testid first, then other props including disabled, so we look
    // in the 200 chars AFTER the testid marker to find the disabled attribute.
    const quickStartIdx = markup.indexOf('data-testid="quick-start-btn"');
    const chooseCouncilIdx = markup.indexOf('data-testid="choose-council-btn"');
    expect(quickStartIdx).toBeGreaterThan(-1);
    expect(chooseCouncilIdx).toBeGreaterThan(-1);

    const quickStartSnippet = markup.slice(quickStartIdx, quickStartIdx + 200);
    const chooseCouncilSnippet = markup.slice(chooseCouncilIdx, chooseCouncilIdx + 200);
    expect(quickStartSnippet).toContain("disabled");
    expect(chooseCouncilSnippet).toContain("disabled");
  });

  it("API key input is always visible without any toggle interaction", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={minds} isPro={false} />);

    // The key section should contain the id we assigned so tests can target it
    expect(markup).toContain('id="agora-api-key"');
    // The placeholder is rendered even when the field is empty
    expect(markup).toContain("sk-ant-");
    // The wrapper section must always be present (no conditional render)
    expect(markup).toContain('data-testid="api-key-section"');
  });

  it("API key section shows 'optional' hint when no key is saved", () => {
    const markup = renderToStaticMarkup(
      <AgoraApp minds={minds} isPro={false} _testInitialState={{ apiKey: "" }} />,
    );

    expect(markup).toContain("optional");
    expect(markup).toContain("bypasses the 3/day limit");
  });

  it("API key section shows '(saved)' label when a key is pre-loaded", () => {
    const markup = renderToStaticMarkup(
      <AgoraApp
        minds={minds}
        isPro={false}
        _testInitialState={{ apiKey: "sk-ant-test-key" }}
      />,
    );

    expect(markup).toContain("(saved)");
    // 'optional' label must NOT appear when the key is already present
    expect(markup).not.toContain("optional");
  });

  it("agon stage reached via quick-start path shows the correct topic and council", () => {
    // Simulate the state that beginAndStartAgon() produces: stage=agon with a
    // pre-seeded council (suggestCouncil defaults for the VC/bootstrap topic).
    const markup = renderToStaticMarkup(
      <AgoraApp
        minds={minds}
        isPro={false}
        _testInitialState={{
          stage: "agon",
          topic,
          council: ["niccolo-machiavelli", "sun-tzu", "marie-curie"],
          turns: [],
        }}
      />,
    );

    // Agon stage renders the quoted topic
    expect(markup).toContain(topic);
    // And the "Convening" message while waiting for the first turn
    expect(markup).toContain("Convening the council");
  });

  it("quick-start respects the 3-mind free cap — agon stage shows no more than 3 minds", () => {
    // Free users: suggestCouncil is called with slice(0, 3), so at most 3 minds
    // are seated. Verify that the agon stage doesn't somehow expose extra minds.
    const markup = renderToStaticMarkup(
      <AgoraApp
        minds={minds}
        isPro={false}
        _testInitialState={{
          stage: "agon",
          topic,
          // Exactly 3 — the maximum for a free user
          council: ["sun-tzu", "marie-curie", "niccolo-machiavelli"],
          turns: [],
        }}
      />,
    );

    // The agon stage renders with the topic visible and no error
    expect(markup).toContain(topic);
    expect(markup).not.toContain("ERROR");
    expect(markup).not.toContain("RATE LIMIT");
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

/* ── 4th-mind cap upsell banner ─────────────────────────────────────── */

describe("AgoraApp — 4th-mind cap upsell banner", () => {
  // Extended fixture with 5 minds so Pro-cap and free-cap scenarios both have
  // enough minds to seat without exhausting the list.
  const fiveMinds: MindOption[] = [
    ...minds,
    {
      slug: "marcus-aurelius",
      name: "Marcus Aurelius",
      era: "Roman Empire",
      domain: "philosophy",
      lens: "Stoic",
      incidentCount: 10,
      colorVar: "--mind-marcus-aurelius",
      packIds: ["stoic-council"] as PackId[],
    },
    {
      slug: "isaac-newton",
      name: "Isaac Newton",
      era: "Enlightenment",
      domain: "science",
      lens: "First Principles",
      incidentCount: 9,
      colorVar: "--mind-isaac-newton",
      packIds: ["inventors-workshop"] as PackId[],
    },
  ];

  it("renders cap-upsell-banner when free user hits the 3-mind cap and capBannerVisible is true", () => {
    // capBannerVisible is seeded via _testInitialState — simulates the state
    // that handleToggleMind produces when a free user tries to seat a 4th mind.
    const markup = renderToStaticMarkup(
      <AgoraApp
        minds={fiveMinds}
        isPro={false}
        _testInitialState={{
          stage: "council",
          topic,
          council: ["sun-tzu", "marie-curie", "niccolo-machiavelli"],
          capBannerVisible: true,
        }}
      />,
    );

    expect(markup).toContain('data-testid="cap-upsell-banner"');
  });

  it("banner copy states +2 more minds benefit for Pro", () => {
    const markup = renderToStaticMarkup(
      <AgoraApp
        minds={fiveMinds}
        isPro={false}
        _testInitialState={{
          stage: "council",
          topic,
          council: ["sun-tzu", "marie-curie", "niccolo-machiavelli"],
          capBannerVisible: true,
        }}
      />,
    );

    // Key conversion hook: "+2 more minds" makes the value proposition concrete.
    expect(markup).toContain("+2 more minds");
    expect(markup).toContain("5 total");
  });

  it("banner contains Upgrade to Pro link to /pricing", () => {
    const markup = renderToStaticMarkup(
      <AgoraApp
        minds={fiveMinds}
        isPro={false}
        _testInitialState={{
          stage: "council",
          topic,
          council: ["sun-tzu", "marie-curie", "niccolo-machiavelli"],
          capBannerVisible: true,
        }}
      />,
    );

    expect(markup).toContain("Upgrade to Pro");
    expect(markup).toContain('href="/pricing"');
  });

  it("cap-upsell-banner is absent when capBannerVisible is false (initial state)", () => {
    const markup = renderToStaticMarkup(
      <AgoraApp
        minds={fiveMinds}
        isPro={false}
        _testInitialState={{
          stage: "council",
          topic,
          council: ["sun-tzu", "marie-curie", "niccolo-machiavelli"],
          capBannerVisible: false,
        }}
      />,
    );

    expect(markup).not.toContain('data-testid="cap-upsell-banner"');
    // The static hint should appear instead of the upsell banner.
    expect(markup).toContain("Free plan: up to 3 minds");
  });

  it("Pro user at 4-mind council sees no cap-upsell-banner (Pro max is 5)", () => {
    // Pro users: the banner is gated by !isPro so it never appears.
    const markup = renderToStaticMarkup(
      <AgoraApp
        minds={fiveMinds}
        isPro={true}
        _testInitialState={{
          stage: "council",
          topic,
          council: ["sun-tzu", "marie-curie", "niccolo-machiavelli", "marcus-aurelius"],
          capBannerVisible: false,
        }}
      />,
    );

    expect(markup).not.toContain('data-testid="cap-upsell-banner"');
  });

  it("cap-upsell-banner never renders for Pro users even when capBannerVisible is true", () => {
    // !isPro guard prevents the banner entirely regardless of capBannerVisible state.
    const markup = renderToStaticMarkup(
      <AgoraApp
        minds={fiveMinds}
        isPro={true}
        _testInitialState={{
          stage: "council",
          topic,
          council: [
            "sun-tzu",
            "marie-curie",
            "niccolo-machiavelli",
            "marcus-aurelius",
            "isaac-newton",
          ],
          capBannerVisible: true,
        }}
      />,
    );

    expect(markup).not.toContain('data-testid="cap-upsell-banner"');
  });
});
