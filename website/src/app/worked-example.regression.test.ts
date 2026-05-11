/**
 * Regression lockdown suite for the streaming-demo copy and pacing constants.
 *
 * These tests lock down the EXACT values — any accidental edit to copy,
 * timing constants, or the streaming sequence will cause an immediate failure.
 *
 * Before changing a value here: update the source constant, run the suite to
 * confirm the regression fires, then update the assertion below to match.
 */
import {
  STREAMING_DEMO_PACING,
  STREAMING_DEMO_PROOF_POINTS,
  STREAMING_DEMO_QUESTION,
  RESEARCH_LINES,
  ADVISORS,
  CONSENSUS_FULL_TEXT,
} from "./worked-example";

// ---------------------------------------------------------------------------
// Pacing constants — exact value lockdown
// ---------------------------------------------------------------------------

describe("STREAMING_DEMO_PACING — exact value lockdown", () => {
  it("initialResearchDelayMs is exactly 120", () => {
    expect(STREAMING_DEMO_PACING.initialResearchDelayMs).toBe(120);
  });

  it("researchLineDelayMs is exactly 820", () => {
    expect(STREAMING_DEMO_PACING.researchLineDelayMs).toBe(820);
  });

  it("researchToDebateDelayMs is exactly 260", () => {
    expect(STREAMING_DEMO_PACING.researchToDebateDelayMs).toBe(260);
  });

  it("debateEntryDelayMs is exactly 120", () => {
    expect(STREAMING_DEMO_PACING.debateEntryDelayMs).toBe(120);
  });

  it("roundLabelHoldMs is exactly 460", () => {
    expect(STREAMING_DEMO_PACING.roundLabelHoldMs).toBe(460);
  });

  it("debateRoundPauseMs is exactly 220", () => {
    expect(STREAMING_DEMO_PACING.debateRoundPauseMs).toBe(220);
  });

  it("closerPauseMs is exactly 380", () => {
    expect(STREAMING_DEMO_PACING.closerPauseMs).toBe(380);
  });

  it("consensusLeadInMs is exactly 320", () => {
    expect(STREAMING_DEMO_PACING.consensusLeadInMs).toBe(320);
  });

  it("consensusRenderDelayMs is exactly 240", () => {
    expect(STREAMING_DEMO_PACING.consensusRenderDelayMs).toBe(240);
  });

  it("consensusWrapMs is exactly 700", () => {
    expect(STREAMING_DEMO_PACING.consensusWrapMs).toBe(700);
  });

  it("has exactly 10 pacing keys — no accidental additions or removals", () => {
    expect(Object.keys(STREAMING_DEMO_PACING)).toHaveLength(10);
  });
});

// ---------------------------------------------------------------------------
// Demo question — exact copy lockdown
// ---------------------------------------------------------------------------

describe("STREAMING_DEMO_QUESTION — exact copy lockdown", () => {
  it("matches the exact approved question string", () => {
    expect(STREAMING_DEMO_QUESTION).toBe(
      "If you had 90 days to become harder to replace, would you pivot into AI skills, deepen your domain moat, or redesign the work itself?",
    );
  });
});

// ---------------------------------------------------------------------------
// Proof points — exact copy lockdown
// ---------------------------------------------------------------------------

describe("STREAMING_DEMO_PROOF_POINTS — exact copy lockdown", () => {
  it("has exactly 3 proof points", () => {
    expect(STREAMING_DEMO_PROOF_POINTS).toHaveLength(3);
  });

  it("proof point 0: Research first — exact title and detail", () => {
    expect(STREAMING_DEMO_PROOF_POINTS[0].title).toBe("Research first");
    expect(STREAMING_DEMO_PROOF_POINTS[0].detail).toBe(
      "The council opens with live signals, not hot takes.",
    );
  });

  it("proof point 1: Three minds — exact title and detail", () => {
    expect(STREAMING_DEMO_PROOF_POINTS[1].title).toBe("Three minds");
    expect(STREAMING_DEMO_PROOF_POINTS[1].detail).toBe(
      "Machiavelli, Curie, and Sun Tzu disagree on purpose.",
    );
  });

  it("proof point 2: One next move — exact title and detail", () => {
    expect(STREAMING_DEMO_PROOF_POINTS[2].title).toBe("One next move");
    expect(STREAMING_DEMO_PROOF_POINTS[2].detail).toBe(
      "Every run ends with a concrete recommendation.",
    );
  });
});

// ---------------------------------------------------------------------------
// Research lines — sequence and exact copy lockdown
// ---------------------------------------------------------------------------

describe("RESEARCH_LINES — streaming sequence and exact copy lockdown", () => {
  it("has exactly 5 research lines", () => {
    expect(RESEARCH_LINES).toHaveLength(5);
  });

  it("line 0 — search query: AI job displacement", () => {
    expect(RESEARCH_LINES[0]).toBe(
      '→ searching: "AI job displacement trends 2026"',
    );
  });

  it("line 1 — found: Harvard Business Review", () => {
    expect(RESEARCH_LINES[1]).toBe(
      '→ found: "The Great Reskilling" — Harvard Business Review',
    );
  });

  it("line 2 — scanning HackerNews with point count", () => {
    expect(RESEARCH_LINES[2]).toBe(
      '→ scanning HackerNews: "Ask HN: Has anyone pivoted to AI mid-career?" (847 pts)',
    );
  });

  it("line 3 — pulling BLS data", () => {
    expect(RESEARCH_LINES[3]).toBe(
      "→ pulling: Bureau of Labor Statistics Q1 2026 automation data",
    );
  });

  it("line 4 — synthesizing (closing line)", () => {
    expect(RESEARCH_LINES[4]).toBe("→ synthesizing research briefing...");
  });

  it("all lines start with the → arrow prefix", () => {
    for (const line of RESEARCH_LINES) {
      expect(line.startsWith("→ ")).toBe(true);
    }
  });

  it("synthesis line is the final line in the sequence", () => {
    expect(RESEARCH_LINES[RESEARCH_LINES.length - 1]).toContain("synthesizing");
  });
});

// ---------------------------------------------------------------------------
// Advisors — council composition, ordering, and copy lockdown
// ---------------------------------------------------------------------------

describe("ADVISORS — council composition and sequence lockdown", () => {
  it("has exactly 3 advisors in the council", () => {
    expect(ADVISORS).toHaveLength(3);
  });

  it("advisor 0 is MACHIAVELLI in position 0 (debate order is stable)", () => {
    expect(ADVISORS[0].name).toBe("MACHIAVELLI");
  });

  it("advisor 1 is CURIE in position 1", () => {
    expect(ADVISORS[1].name).toBe("CURIE");
  });

  it("advisor 2 is SUN TZU in position 2", () => {
    expect(ADVISORS[2].name).toBe("SUN TZU");
  });

  it("each advisor has exactly 3 debate rounds", () => {
    for (const advisor of ADVISORS) {
      expect(advisor.rounds).toHaveLength(3);
    }
  });

  it("MACHIAVELLI lens — exact copy", () => {
    expect(ADVISORS[0].lens).toBe("on power and who controls the transition");
  });

  it("CURIE lens — exact copy", () => {
    expect(ADVISORS[1].lens).toBe("on what the evidence actually shows");
  });

  it("SUN TZU lens — exact copy", () => {
    expect(ADVISORS[2].lens).toBe("on where the high ground shifts");
  });

  it("MACHIAVELLI round 1 — opens with power-shift framing", () => {
    expect(ADVISORS[0].rounds[0]).toBe(
      "AI is a power shift, not a tool. Whoever masters it first writes the terms. Those who hesitate will negotiate from weakness.",
    );
  });

  it("MACHIAVELLI round 2 — references Curie's data (cross-advisor call-back)", () => {
    expect(ADVISORS[0].rounds[1]).toBe(
      "Curie's data confirms my point — early movers capture the power positions. Evidence is retrospective; positioning is always real-time.",
    );
  });

  it("MACHIAVELLI round 3 — closes on defining the new category", () => {
    expect(ADVISORS[0].rounds[2]).toBe(
      "Power flows to whoever defines the new category. You cannot negotiate terms you did not shape. Move before the window closes.",
    );
  });

  it("CURIE round 1 — opens with domain-expertise-first thesis", () => {
    expect(ADVISORS[1].rounds[0]).toBe(
      "Domain expertise compounds over decades. AI fluency takes months. Every study of successful career transitions shows the same pattern: depth first, tools second.",
    );
  });

  it("CURIE round 2 — rebuts Machiavelli on narrative vs durable advantage", () => {
    expect(ADVISORS[1].rounds[1]).toBe(
      "Machiavelli mistakes narrative control for durable advantage. The researchers who changed their fields were domain-first, without exception.",
    );
  });

  it("CURIE round 3 — closes on depth as the only compounding asset", () => {
    expect(ADVISORS[1].rounds[2]).toBe(
      "Depth is the only compounding asset in this transition. Surface AI skills depreciate in months. Domain expertise only grows scarcer.",
    );
  });

  it("SUN TZU round 1 — frames AI as weapon, domain as terrain", () => {
    expect(ADVISORS[2].rounds[0]).toBe(
      "AI is a weapon. Your domain is terrain. The decisive ground is where only someone with your depth and AI fluency can operate.",
    );
  });

  it("SUN TZU round 2 — identifies chokepoint the other two miss", () => {
    expect(ADVISORS[2].rounds[1]).toBe(
      "Neither power nor data locates the chokepoint. The strategist finds the narrow ground both sides need — then holds it.",
    );
  });

  it("SUN TZU round 3 — closes on choosing terrain not weapons", () => {
    expect(ADVISORS[2].rounds[2]).toBe(
      "The strategist chooses terrain, not weapons. Find the ground where depth plus AI fluency creates a position nobody else can occupy.",
    );
  });

  it("color CSS variables are present for all advisors", () => {
    expect(ADVISORS[0].color).toBe("var(--color-machiavelli)");
    expect(ADVISORS[1].color).toBe("var(--color-curie)");
    expect(ADVISORS[2].color).toBe("var(--color-suntzu)");
  });
});

// ---------------------------------------------------------------------------
// Consensus text — section headers and copy lockdown
// ---------------------------------------------------------------------------

describe("CONSENSUS_FULL_TEXT — section structure and copy lockdown", () => {
  it("opens with CONSENSUS POINTS section header", () => {
    expect(CONSENSUS_FULL_TEXT.startsWith("CONSENSUS POINTS")).toBe(true);
  });

  it("contains RECOMMENDED ACTION section", () => {
    expect(CONSENSUS_FULL_TEXT).toContain("RECOMMENDED ACTION");
  });

  it("contains IMMEDIATE NEXT STEPS section", () => {
    expect(CONSENSUS_FULL_TEXT).toContain("IMMEDIATE NEXT STEPS");
  });

  it("consensus points body — exact copy", () => {
    expect(CONSENSUS_FULL_TEXT).toContain(
      'All three agree the "pivot or stay" framing is a false choice. The real question is positioning — finding where domain depth and AI capability intersect to create genuinely defensible ground.',
    );
  });

  it("recommended action body — exact copy", () => {
    expect(CONSENSUS_FULL_TEXT).toContain(
      "Do not abandon your domain. Identify the problems within it that AI cannot yet solve alone — and become the person who directs AI to solve them. Build the hybrid role: AI-augmented domain expert.",
    );
  });

  it("immediate next steps — 3 bullet items present", () => {
    expect(CONSENSUS_FULL_TEXT).toContain(
      "• Map the 3 tasks in your work that still require judgment only you can provide",
    );
    expect(CONSENSUS_FULL_TEXT).toContain(
      "• Spend 4 hours/week building AI fluency in tools specific to your domain",
    );
    expect(CONSENSUS_FULL_TEXT).toContain(
      "• Produce one concrete output combining both — share it publicly this month",
    );
  });

  it("sections appear in the correct order: CONSENSUS → RECOMMENDED → NEXT STEPS", () => {
    const consensusPos = CONSENSUS_FULL_TEXT.indexOf("CONSENSUS POINTS");
    const recommendedPos = CONSENSUS_FULL_TEXT.indexOf("RECOMMENDED ACTION");
    const nextStepsPos = CONSENSUS_FULL_TEXT.indexOf("IMMEDIATE NEXT STEPS");

    expect(consensusPos).toBeLessThan(recommendedPos);
    expect(recommendedPos).toBeLessThan(nextStepsPos);
  });
});
