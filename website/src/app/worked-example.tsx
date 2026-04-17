"use client";

import { useEffect, useRef, useState } from "react";

// =================== CONTENT ===================

const QUESTION =
  "My industry is being automated faster than I expected. Should I pivot hard into AI skills now, or double down on being irreplaceable in my domain?";

const RESEARCH_LINES = [
  '→ searching: "AI job displacement trends 2026"',
  '→ found: "The Great Reskilling" — Harvard Business Review',
  '→ scanning HackerNews: "Ask HN: Has anyone pivoted to AI mid-career?" (847 pts)',
  "→ pulling: Bureau of Labor Statistics Q1 2026 automation data",
  "→ synthesizing research briefing...",
];

interface AdvisorData {
  name: string;
  color: string;
  lens: string;
  rounds: [string, string, string];
}

const ADVISORS: AdvisorData[] = [
  {
    name: "MACHIAVELLI",
    color: "var(--color-machiavelli)",
    lens: "on power and who controls the transition",
    rounds: [
      "AI is a power shift, not a tool. Whoever masters it first writes the terms. Those who hesitate will negotiate from weakness.",
      "Curie's data confirms my point — early movers capture the power positions. Evidence is retrospective; positioning is always real-time.",
      "Power flows to whoever defines the new category. You cannot negotiate terms you did not shape. Move before the window closes.",
    ],
  },
  {
    name: "CURIE",
    color: "var(--color-curie)",
    lens: "on what the evidence actually shows",
    rounds: [
      "Domain expertise compounds over decades. AI fluency takes months. Every study of successful career transitions shows the same pattern: depth first, tools second.",
      "Machiavelli mistakes narrative control for durable advantage. The researchers who changed their fields were domain-first, without exception.",
      "Depth is the only compounding asset in this transition. Surface AI skills depreciate in months. Domain expertise only grows scarcer.",
    ],
  },
  {
    name: "SUN TZU",
    color: "var(--color-suntzu)",
    lens: "on where the high ground shifts",
    rounds: [
      "AI is a weapon. Your domain is terrain. The decisive ground is where only someone with your depth and AI fluency can operate.",
      "Neither power nor data locates the chokepoint. The strategist finds the narrow ground both sides need — then holds it.",
      "The strategist chooses terrain, not weapons. Find the ground where depth plus AI fluency creates a position nobody else can occupy.",
    ],
  },
];

const CONSENSUS_FULL_TEXT = `CONSENSUS POINTS
All three agree the "pivot or stay" framing is a false choice. The real question is positioning — finding where domain depth and AI capability intersect to create genuinely defensible ground.

RECOMMENDED ACTION
Do not abandon your domain. Identify the problems within it that AI cannot yet solve alone — and become the person who directs AI to solve them. Build the hybrid role: AI-augmented domain expert.

IMMEDIATE NEXT STEPS
• Map the 3 tasks in your work that still require judgment only you can provide
• Spend 4 hours/week building AI fluency in tools specific to your domain
• Produce one concrete output combining both — share it publicly this month`;

// =================== GRAPH CONSTANTS ===================

const GRAPH_SIZE = 260;
const CX = 130;
const CY = 130;
const ORBIT_R = 95;
const CENTER_R = 30;
const NODE_R = 16;

// Labels for the 5 outer nodes, clockwise from top
const NODE_LABELS = ["POINTS", "TENSIONS", "ACTION", "STEPS", "RISKS"];

// =================== UTILITIES ===================

function tokenize(text: string): string[] {
  return text.split(/(\s+)/).filter((t) => t.length > 0);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// =================== TYPES ===================

type DemoStage = "waiting" | "research" | "debates" | "consensus" | "done";

interface ResearchLine {
  text: string;
  active: boolean;
}

interface AdvisorDisplay {
  text: string;
  streaming: boolean;
  opacity: number;
  pulseKey: number;
  visible: boolean;
}

interface DemoState {
  stage: DemoStage;
  researchLines: ResearchLine[];
  roundLabel: string | null;
  advisors: AdvisorDisplay[];
  graphStarted: boolean;
  consensusText: string;
  ctaVisible: boolean;
}

const INITIAL_STATE: DemoState = {
  stage: "waiting",
  researchLines: [],
  roundLabel: null,
  advisors: ADVISORS.map(() => ({
    text: "",
    streaming: false,
    opacity: 1,
    pulseKey: 0,
    visible: false,
  })),
  graphStarted: false,
  consensusText: "",
  ctaVisible: false,
};

const REDUCED_MOTION_STATE: DemoState = {
  stage: "done",
  researchLines: RESEARCH_LINES.map((text) => ({ text, active: false })),
  roundLabel: null,
  advisors: ADVISORS.map((a) => ({
    text: a.rounds[2],
    streaming: false,
    opacity: 1,
    pulseKey: 0,
    visible: true,
  })),
  graphStarted: true,
  consensusText: CONSENSUS_FULL_TEXT,
  ctaVisible: true,
};

// =================== PROGRESS HEADER ===================

const STAGE_NAMES = ["TOPIC", "RESEARCH", "DEBATES", "CONSENSUS"];
const STAGE_DURATIONS_MS = [0, 7000, 13000, 8000];

function stageToIndex(stage: DemoStage): number {
  const map: Record<DemoStage, number> = {
    waiting: 0,
    research: 1,
    debates: 2,
    consensus: 3,
    done: 3,
  };
  return map[stage];
}

function GrowingUnderline({ durationMs }: { durationMs: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.width = "0%";
    el.style.transition = "none";
    void el.offsetWidth;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = `width ${durationMs}ms linear`;
        el.style.width = "100%";
      });
    });
  }, [durationMs]);
  return (
    <div
      ref={ref}
      style={{
        height: "2px",
        background: "var(--amber)",
        width: "0%",
        marginTop: "3px",
      }}
    />
  );
}

function ProgressHeader({ stage }: { stage: DemoStage }) {
  const activeIdx = stageToIndex(stage);
  const isWaiting = stage === "waiting";

  return (
    <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
      {STAGE_NAMES.map((name, i) => {
        const isActive = !isWaiting && i === activeIdx;
        const isPast = !isWaiting && i < activeIdx;
        const opacity = isActive ? 1 : isPast ? 0.55 : 0.4;
        return (
          <div
            key={name}
            style={{ opacity, transition: "opacity 500ms ease-out" }}
          >
            <div
              className="font-mono"
              style={{
                fontSize: "11px",
                letterSpacing: "0.1em",
                color: isActive ? "var(--fg)" : "var(--fg-dim)",
              }}
            >
              {name}
            </div>
            {isActive ? (
              <GrowingUnderline
                key={`underline-${stage}`}
                durationMs={STAGE_DURATIONS_MS[i]}
              />
            ) : (
              <div style={{ height: "2px", marginTop: "3px" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// =================== CONSENSUS GRAPH ===================

function ConsensusGraph({ started }: { started: boolean }) {
  const outerNodes = Array.from({ length: 5 }).map((_, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / 5;
    return {
      x: CX + ORBIT_R * Math.cos(angle),
      y: CY + ORBIT_R * Math.sin(angle),
    };
  });

  return (
    <svg
      width={GRAPH_SIZE}
      height={GRAPH_SIZE}
      className={`gm-consensus-graph${started ? " gm-consensus-play" : ""}`}
      aria-hidden="true"
      overflow="visible"
    >
      {outerNodes.map((node, i) => {
        const dx = CX - node.x;
        const dy = CY - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const ux = dx / dist;
        const uy = dy / dist;
        return (
          <line
            key={i}
            x1={node.x + ux * NODE_R}
            y1={node.y + uy * NODE_R}
            x2={CX - ux * CENTER_R}
            y2={CY - uy * CENTER_R}
            stroke="var(--amber)"
            strokeWidth="1"
            className={`gm-consensus-line gm-cline-${i}`}
            opacity="0.65"
          />
        );
      })}

      {outerNodes.map((node, i) => (
        <circle
          key={i}
          cx={node.x}
          cy={node.y}
          r={NODE_R}
          fill="var(--bg)"
          stroke="var(--fg-dim)"
          strokeWidth="1"
          className="gm-consensus-node"
          style={
            { transitionDelay: `${i * 120}ms` } as React.CSSProperties
          }
        />
      ))}

      {outerNodes.map((node, i) => {
        const ux = (node.x - CX) / ORBIT_R;
        const uy = (node.y - CY) / ORBIT_R;
        const lx = node.x + ux * (NODE_R + 7);
        const ly = node.y + uy * (NODE_R + 7);
        const anchor = ux > 0.3 ? "start" : ux < -0.3 ? "end" : "middle";
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor={anchor}
            dominantBaseline="middle"
            className="font-mono gm-consensus-node"
            fill="var(--fg-dim)"
            fontSize="7"
            letterSpacing="0.06em"
            style={
              { transitionDelay: `${i * 120}ms` } as React.CSSProperties
            }
          >
            {NODE_LABELS[i]}
          </text>
        );
      })}

      <circle
        cx={CX}
        cy={CY}
        r={CENTER_R}
        fill="var(--bg)"
        stroke="var(--amber)"
        strokeWidth="1.5"
        className="gm-consensus-center"
      />
      <text
        x={CX}
        y={CY - 4}
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-mono gm-consensus-center"
        fill="var(--amber)"
        fontSize="7"
      >
        CON-
      </text>
      <text
        x={CX}
        y={CY + 6}
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-mono gm-consensus-center"
        fill="var(--amber)"
        fontSize="7"
      >
        SENSUS
      </text>
    </svg>
  );
}

// =================== CONSENSUS DOCUMENT ===================

function ConsensusDoc({
  text,
  streaming,
}: {
  text: string;
  streaming: boolean;
}) {
  if (!text && !streaming) return null;

  const lines = text.split("\n");

  return (
    <div>
      {lines.map((line, i) => {
        const isLast = i === lines.length - 1;
        const isEmpty = line.trim() === "";
        const isHeading =
          !isEmpty &&
          /^[A-Z• ]+$/.test(line.trim()) &&
          line.trim().length > 2 &&
          !line.startsWith("•");

        if (isEmpty) {
          return <div key={i} style={{ height: "14px" }} />;
        }

        const showCaret = isLast && streaming;

        if (isHeading) {
          return (
            <div
              key={i}
              className="font-mono"
              style={{
                fontSize: "11px",
                letterSpacing: "0.08em",
                color: "var(--amber)",
                marginBottom: "6px",
                marginTop: i > 0 ? "4px" : 0,
              }}
            >
              {line}
              {showCaret && (
                <span className="gm-caret" aria-hidden="true">
                  ▍
                </span>
              )}
            </div>
          );
        }

        return (
          <div
            key={i}
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "16px",
              lineHeight: 1.65,
            }}
          >
            {line}
            {showCaret && (
              <span className="gm-caret" aria-hidden="true">
                ▍
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// =================== MAIN COMPONENT ===================

export function StreamingDemo() {
  const [state, setState] = useState<DemoState>(INITIAL_STATE);
  const cancelRef = useRef(false);
  const runningRef = useRef(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setState(REDUCED_MOTION_STATE);
    }
  }, []);

  async function run() {
    if (runningRef.current) return;
    runningRef.current = true;
    cancelRef.current = false;

    const set = (updater: (s: DemoState) => DemoState) => {
      if (!cancelRef.current) setState(updater);
    };

    const check = () => cancelRef.current;

    // Helper: stream tokens for one advisor slot
    async function streamAdvisor(
      ai: number,
      text: string,
      opts: {
        firstSentenceSpeed?: number;
        restSpeed?: number;
        uniformSpeed?: number;
        pauseAfter?: number;
      } = {}
    ) {
      const {
        firstSentenceSpeed = 55,
        restSpeed = 15,
        uniformSpeed,
        pauseAfter = 450,
      } = opts;

      const tokens = tokenize(text);

      // Find first sentence boundary
      let sentenceEnd = tokens.length;
      for (let ti = 0; ti < tokens.length; ti++) {
        const t = tokens[ti].trim();
        if (t.endsWith(".") || t.endsWith("!") || t.endsWith("?")) {
          sentenceEnd = ti + 1;
          break;
        }
      }

      // Show this advisor, pulse name
      set((s) => {
        const advisors = [...s.advisors];
        advisors[ai] = {
          ...advisors[ai],
          text: "",
          streaming: true,
          visible: true,
          pulseKey: Date.now(),
        };
        return { ...s, advisors };
      });

      let accumulated = "";
      for (let ti = 0; ti < tokens.length; ti++) {
        if (check()) return;
        accumulated += tokens[ti];
        const spd =
          uniformSpeed !== undefined
            ? uniformSpeed
            : ti < sentenceEnd
              ? firstSentenceSpeed
              : restSpeed;
        await sleep(spd);
        const snap = accumulated;
        set((s) => {
          const advisors = [...s.advisors];
          advisors[ai] = { ...advisors[ai], text: snap };
          return { ...s, advisors };
        });
      }

      set((s) => {
        const advisors = [...s.advisors];
        advisors[ai] = { ...advisors[ai], streaming: false };
        return { ...s, advisors };
      });

      await sleep(pauseAfter);
    }

    // ---- RESEARCH ----
    await sleep(300);
    set((s) => ({ ...s, stage: "research" }));

    for (let i = 0; i < RESEARCH_LINES.length; i++) {
      if (check()) return;
      await sleep(1250);
      const lineText = RESEARCH_LINES[i];
      set((s) => ({
        ...s,
        researchLines: [
          { text: lineText, active: true },
          ...s.researchLines.map((l) => ({ ...l, active: false })),
        ],
      }));
    }

    await sleep(700);
    if (check()) return;

    // ---- DEBATES ----
    set((s) => ({ ...s, stage: "debates" }));
    await sleep(200);

    // Round 1 — slow, readable
    for (let ai = 0; ai < ADVISORS.length; ai++) {
      if (check()) return;
      set((s) => {
        const advisors = [...s.advisors];
        for (let j = 0; j < ai; j++) {
          advisors[j] = { ...advisors[j], opacity: 0.4 };
        }
        advisors[ai] = { ...advisors[ai], opacity: 1 };
        return { ...s, advisors };
      });
      await streamAdvisor(ai, ADVISORS[ai].rounds[0], {
        firstSentenceSpeed: 55,
        restSpeed: 18,
        pauseAfter: 500,
      });
    }

    // Round 2 indicator
    if (check()) return;
    set((s) => ({ ...s, roundLabel: "ROUND 2" }));
    await sleep(700);
    set((s) => ({ ...s, roundLabel: null }));
    await sleep(200);

    // Round 2 — fast
    for (let ai = 0; ai < ADVISORS.length; ai++) {
      if (check()) return;
      set((s) => {
        const advisors = [...s.advisors];
        for (let j = 0; j < ADVISORS.length; j++) {
          advisors[j] = { ...advisors[j], opacity: j === ai ? 1 : 0.3 };
        }
        return { ...s, advisors };
      });
      await streamAdvisor(ai, ADVISORS[ai].rounds[1], {
        uniformSpeed: 5,
        pauseAfter: 250,
      });
    }

    // Round 3 indicator
    if (check()) return;
    set((s) => ({ ...s, roundLabel: "ROUND 3" }));
    await sleep(700);
    set((s) => ({ ...s, roundLabel: null }));
    await sleep(200);

    // Round 3 — Machiavelli + Curie fast, Sun Tzu readable (the closer)
    for (let ai = 0; ai < ADVISORS.length; ai++) {
      if (check()) return;
      const isCloser = ai === ADVISORS.length - 1;
      set((s) => {
        const advisors = [...s.advisors];
        for (let j = 0; j < ADVISORS.length; j++) {
          advisors[j] = {
            ...advisors[j],
            opacity: j === ai ? 1 : isCloser ? 0.6 : 0.3,
          };
        }
        return { ...s, advisors };
      });
      await streamAdvisor(ai, ADVISORS[ai].rounds[2], {
        uniformSpeed: isCloser ? 30 : 5,
        pauseAfter: isCloser ? 700 : 250,
      });
    }

    // All advisors return to full opacity
    set((s) => ({
      ...s,
      advisors: s.advisors.map((a) => ({ ...a, opacity: 1 })),
    }));
    await sleep(800);
    if (check()) return;

    // ---- CONSENSUS ----
    set((s) => ({ ...s, stage: "consensus", graphStarted: true }));
    await sleep(500);

    const tokens = tokenize(CONSENSUS_FULL_TEXT);
    let accumulated = "";
    for (const token of tokens) {
      if (check()) return;
      accumulated += token;
      await sleep(28);
      const snap = accumulated;
      set((s) => ({ ...s, consensusText: snap }));
    }

    await sleep(1000);
    if (check()) return;

    set((s) => ({ ...s, stage: "done", ctaVisible: true }));
    runningRef.current = false;
  }

  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  const {
    stage,
    researchLines,
    roundLabel,
    advisors,
    graphStarted,
    consensusText,
    ctaVisible,
  } = state;

  const showResearch = stage === "research";
  const showDebates = ["debates", "consensus", "done"].includes(stage);
  const showConsensus = ["consensus", "done"].includes(stage);
  const showButton = stage === "waiting";

  return (
    <div className="mx-auto" style={{ maxWidth: "880px" }}>
      <div
        style={{
          border: "1px solid var(--hairline)",
          padding: "clamp(20px, 4vw, 48px)",
        }}
      >
        {/* Progress header */}
        <ProgressHeader stage={stage} />

        <hr
          style={{
            border: "none",
            borderTop: "1px solid var(--hairline)",
            margin: "20px 0 28px",
          }}
        />

        {/* The question */}
        <div>
          <div
            className="font-mono uppercase"
            style={{
              fontSize: "11px",
              letterSpacing: "0.08em",
              color: "var(--fg-dim)",
              marginBottom: "12px",
            }}
          >
            The Decision
          </div>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(18px, 2.5vw, 26px)",
              lineHeight: 1.35,
              letterSpacing: "-0.01em",
              maxWidth: "58ch",
            }}
          >
            {QUESTION}
          </p>
        </div>

        {/* Content area */}
        <div style={{ marginTop: "32px" }}>
          {/* WAITING: button */}
          {showButton && (
            <button
              onClick={run}
              style={{
                background: "transparent",
                border: "1px solid var(--hairline)",
                color: "var(--fg)",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                letterSpacing: "0.06em",
                padding: "14px 28px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                transition: "border-color 200ms ease-out",
              }}
            >
              <span style={{ color: "var(--amber)" }}>▶</span>
              Convene the council
            </button>
          )}

          {/* RESEARCH: lines (newest at top) */}
          {showResearch && (
            <div style={{ minHeight: "112px" }}>
              {researchLines.map((line, i) => (
                <div
                  key={i}
                  className="font-mono"
                  style={{
                    fontSize: "13px",
                    letterSpacing: "0.02em",
                    lineHeight: 2,
                    color: line.active ? "var(--amber)" : "var(--fg-dim)",
                    opacity: line.active ? 1 : 0.5,
                    transition: "opacity 400ms ease-out, color 400ms ease-out",
                  }}
                >
                  {line.text}
                </div>
              ))}
            </div>
          )}

          {/* DEBATES: advisor blocks */}
          {showDebates && (
            <div>
              {roundLabel && (
                <div
                  className="font-mono"
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.15em",
                    color: "var(--fg-dim)",
                    marginBottom: "20px",
                  }}
                >
                  {roundLabel}
                </div>
              )}

              <div
                style={{ display: "flex", flexDirection: "column", gap: "28px" }}
              >
                {ADVISORS.map((advisor, i) => {
                  const d = advisors[i];
                  if (!d.visible) return null;
                  return (
                    <div
                      key={advisor.name}
                      style={{
                        opacity: d.opacity,
                        transition: "opacity 600ms ease-out",
                      }}
                    >
                      <div
                        key={`name-${d.pulseKey}`}
                        className={`font-mono${d.streaming ? " gm-name-pulse" : ""}`}
                        style={{
                          fontSize: "11px",
                          letterSpacing: "0.1em",
                          color: advisor.color,
                        }}
                      >
                        {advisor.name}
                      </div>
                      <div
                        className="italic"
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: "14px",
                          color: advisor.color,
                          opacity: 0.6,
                          marginTop: "3px",
                        }}
                      >
                        {advisor.lens}
                      </div>
                      <p
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: "18px",
                          lineHeight: 1.6,
                          marginTop: "10px",
                        }}
                      >
                        {d.text}
                        {d.streaming && (
                          <span className="gm-caret" aria-hidden="true">
                            ▍
                          </span>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CONSENSUS: graph + document */}
          {showConsensus && (
            <div style={{ marginTop: "40px" }}>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid var(--hairline)",
                  marginBottom: "36px",
                }}
              />
              <div
                className="font-mono uppercase"
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  color: "var(--fg-dim)",
                  marginBottom: "28px",
                }}
              >
                Council Consensus
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "40px",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  <ConsensusGraph started={graphStarted} />
                </div>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <ConsensusDoc
                    text={consensusText}
                    streaming={stage === "consensus"}
                  />
                </div>
              </div>
            </div>
          )}

          {/* CTA */}
          {(ctaVisible || stage === "done") && (
            <div
              style={{
                marginTop: "32px",
                opacity: ctaVisible ? 1 : 0,
                transition: "opacity 800ms ease-out",
              }}
            >
              <a
                href="#council"
                className="font-mono"
                style={{
                  fontSize: "13px",
                  letterSpacing: "0.04em",
                  color: "var(--fg-dim)",
                  textDecoration: "none",
                  transition: "color 200ms ease-out",
                }}
              >
                → Ask the council about your own decision
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const WorkedExample = StreamingDemo;
