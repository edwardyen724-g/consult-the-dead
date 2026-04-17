"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ConsensusGraph, type ConsensusNodeKey } from "@/components/ConsensusGraph";

export interface MindOption {
  slug: string;
  name: string;
  era: string;
  domain: string;
  lens: string;
  incidentCount: number;
  colorVar: string;
}

type Stage = "topic" | "research" | "council" | "agon" | "consensus";

const STAGE_ORDER: Stage[] = ["topic", "research", "council", "agon", "consensus"];
const STAGE_LABELS: Record<Stage, string> = {
  topic: "TOPIC",
  research: "RESEARCH",
  council: "COUNCIL",
  agon: "AGON",
  consensus: "CONSENSUS",
};

const MIND_MIN = 2;
const MIND_MAX = 5;
const DEFAULT_COUNCIL_SIZE = 3;

const EXAMPLE_TOPICS = [
  "Should I raise VC or bootstrap?",
  "Should we open-source our core product?",
  "My industry is being automated — pivot into AI, or double down on domain depth?",
];

// Cheap keyword heuristic to suggest a starting council.
function suggestCouncil(topic: string, minds: MindOption[]): string[] {
  const t = topic.toLowerCase();
  const hits: Record<string, number> = {};

  const keywords: Record<string, string[]> = {
    "niccolo-machiavelli": ["power", "politics", "negotiate", "leverage", "competitor", "rival"],
    "sun-tzu": ["strategy", "compete", "terrain", "market", "timing", "win"],
    "marie-curie": ["evidence", "data", "research", "test", "validate", "study"],
    "isaac-newton": ["first principles", "system", "rebuild", "proof", "fundamental"],
    "leonardo-da-vinci": ["design", "creative", "cross", "combine", "invent", "prototype"],
    "nikola-tesla": ["vision", "future", "invent", "technology", "breakthrough"],
    "marcus-aurelius": ["duty", "virtue", "stoic", "long term", "integrity", "reputation"],
  };

  for (const mind of minds) {
    const kws = keywords[mind.slug] ?? [];
    let score = 0;
    for (const kw of kws) if (t.includes(kw)) score += 1;
    hits[mind.slug] = score;
  }

  const scored = minds
    .map((m) => ({ slug: m.slug, score: hits[m.slug] ?? 0 }))
    .sort((a, b) => b.score - a.score);

  const topScoring = scored.filter((s) => s.score > 0).map((s) => s.slug);
  if (topScoring.length >= DEFAULT_COUNCIL_SIZE) {
    return topScoring.slice(0, DEFAULT_COUNCIL_SIZE);
  }

  const fallback: string[] = [...topScoring];
  const defaults = ["niccolo-machiavelli", "sun-tzu", "marie-curie"];
  for (const d of defaults) {
    if (fallback.length >= DEFAULT_COUNCIL_SIZE) break;
    if (!fallback.includes(d) && minds.some((m) => m.slug === d)) {
      fallback.push(d);
    }
  }
  while (fallback.length < DEFAULT_COUNCIL_SIZE && fallback.length < minds.length) {
    const next = minds.find((m) => !fallback.includes(m.slug));
    if (!next) break;
    fallback.push(next.slug);
  }
  return fallback;
}

export function AgoraApp({ minds }: { minds: MindOption[] }) {
  const [stage, setStage] = useState<Stage>("topic");
  const [topic, setTopic] = useState("");
  const [researchEnabled, setResearchEnabled] = useState(true);
  const [council, setCouncil] = useState<string[]>([]);
  const [consensusNode, setConsensusNode] = useState<ConsensusNodeKey | null>(null);

  const visibleStages: Stage[] = useMemo(() => {
    return researchEnabled
      ? STAGE_ORDER
      : STAGE_ORDER.filter((s) => s !== "research");
  }, [researchEnabled]);

  function beginAgon() {
    const trimmed = topic.trim();
    if (trimmed.length < 10) return;
    const suggested = suggestCouncil(trimmed, minds);
    setCouncil(suggested);
    setStage(researchEnabled ? "research" : "council");
  }

  function advanceFromResearch() {
    setStage("council");
  }

  function advanceFromCouncil() {
    if (council.length < MIND_MIN || council.length > MIND_MAX) return;
    setStage("agon");
  }

  function advanceFromAgon() {
    setStage("consensus");
  }

  function reset() {
    setStage("topic");
    setTopic("");
    setCouncil([]);
    setConsensusNode(null);
  }

  function toggleMind(slug: string) {
    setCouncil((curr) => {
      if (curr.includes(slug)) return curr.filter((s) => s !== slug);
      if (curr.length >= MIND_MAX) return curr;
      return [...curr, slug];
    });
  }

  const selectedMinds = council
    .map((slug) => minds.find((m) => m.slug === slug))
    .filter((m): m is MindOption => !!m);

  return (
    <main
      style={{
        minHeight: "calc(100vh - 80px)",
        padding: "48px 24px 96px",
        background: "var(--bg)",
        color: "var(--fg)",
      }}
    >
      <div style={{ maxWidth: "920px", margin: "0 auto" }}>
        <div
          className="font-mono uppercase"
          style={{
            fontSize: "11px",
            letterSpacing: "0.18em",
            color: "var(--fg-dim)",
            marginBottom: "8px",
          }}
        >
          Consult The Dead — the Agora
        </div>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            fontSize: "clamp(28px, 4vw, 44px)",
            lineHeight: 1.15,
            letterSpacing: "-0.015em",
            marginBottom: "36px",
          }}
        >
          What decision are you carrying?
        </h1>

        <ProgressBar stage={stage} visibleStages={visibleStages} />

        <div style={{ marginTop: "40px" }}>
          {stage === "topic" && (
            <TopicStage
              topic={topic}
              setTopic={setTopic}
              researchEnabled={researchEnabled}
              setResearchEnabled={setResearchEnabled}
              onSubmit={beginAgon}
            />
          )}

          {stage === "research" && (
            <ResearchStage topic={topic} onContinue={advanceFromResearch} />
          )}

          {stage === "council" && (
            <CouncilStage
              minds={minds}
              council={council}
              toggleMind={toggleMind}
              onContinue={advanceFromCouncil}
            />
          )}

          {stage === "agon" && (
            <AgonStage
              topic={topic}
              selectedMinds={selectedMinds}
              onContinue={advanceFromAgon}
            />
          )}

          {stage === "consensus" && (
            <ConsensusStage
              topic={topic}
              selectedMinds={selectedMinds}
              consensusNode={consensusNode}
              setConsensusNode={setConsensusNode}
              onReset={reset}
            />
          )}
        </div>

        <div
          style={{
            marginTop: "96px",
            paddingTop: "24px",
            borderTop: "1px solid var(--hairline)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
          className="font-mono uppercase"
        >
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "0.08em",
              color: "var(--fg-dim)",
            }}
          >
            Phase 1 preview — the agon engine is wired in Phase 2
          </div>
          <Link
            href="/"
            style={{
              fontSize: "11px",
              letterSpacing: "0.08em",
              color: "var(--fg-dim)",
              textDecoration: "none",
            }}
          >
            ← back to the landing
          </Link>
        </div>
      </div>
    </main>
  );
}

/* ── Progress bar ── */

function ProgressBar({
  stage,
  visibleStages,
}: {
  stage: Stage;
  visibleStages: Stage[];
}) {
  const activeIdx = visibleStages.indexOf(stage);
  return (
    <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
      {visibleStages.map((s, i) => {
        const isActive = i === activeIdx;
        const isPast = i < activeIdx;
        const opacity = isActive ? 1 : isPast ? 0.55 : 0.35;
        return (
          <div
            key={s}
            style={{ opacity, transition: "opacity 400ms ease-out" }}
          >
            <div
              className="font-mono"
              style={{
                fontSize: "11px",
                letterSpacing: "0.1em",
                color: isActive ? "var(--fg)" : "var(--fg-dim)",
              }}
            >
              {STAGE_LABELS[s]}
            </div>
            <div
              style={{
                height: "2px",
                width: isActive ? "100%" : isPast ? "100%" : "0%",
                background: isActive
                  ? "var(--amber)"
                  : isPast
                    ? "var(--fg-dim)"
                    : "transparent",
                marginTop: "3px",
                transition: "width 400ms ease-out, background 400ms ease-out",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

/* ── Stage 1: Topic ── */

function TopicStage({
  topic,
  setTopic,
  researchEnabled,
  setResearchEnabled,
  onSubmit,
}: {
  topic: string;
  setTopic: (t: string) => void;
  researchEnabled: boolean;
  setResearchEnabled: (v: boolean) => void;
  onSubmit: () => void;
}) {
  const valid = topic.trim().length >= 10;
  return (
    <div>
      <label
        htmlFor="agora-topic"
        className="font-mono uppercase"
        style={{
          fontSize: "11px",
          letterSpacing: "0.08em",
          color: "var(--fg-dim)",
          display: "block",
          marginBottom: "10px",
        }}
      >
        The Decision
      </label>
      <textarea
        id="agora-topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="My industry is being automated faster than I expected. Should I pivot hard into AI skills now, or double down on being irreplaceable in my domain?"
        rows={4}
        style={{
          width: "100%",
          background: "transparent",
          border: "1px solid var(--hairline)",
          color: "var(--fg)",
          fontFamily: "var(--font-serif)",
          fontSize: "18px",
          lineHeight: 1.5,
          padding: "16px",
          resize: "vertical",
        }}
      />

      <div
        style={{
          marginTop: "24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <input
          type="checkbox"
          id="research-toggle"
          checked={researchEnabled}
          onChange={(e) => setResearchEnabled(e.target.checked)}
          style={{ accentColor: "var(--amber)" }}
        />
        <label
          htmlFor="research-toggle"
          className="font-mono"
          style={{
            fontSize: "12px",
            letterSpacing: "0.04em",
            color: "var(--fg-dim)",
            cursor: "pointer",
          }}
        >
          Gather external research before the agon
        </label>
      </div>

      <div style={{ marginTop: "32px" }}>
        <button
          onClick={onSubmit}
          disabled={!valid}
          className="font-mono"
          style={{
            background: valid ? "var(--amber)" : "transparent",
            color: valid ? "var(--bg)" : "var(--fg-dim)",
            border: valid ? "1px solid var(--amber)" : "1px solid var(--hairline)",
            fontSize: "12px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            padding: "14px 28px",
            cursor: valid ? "pointer" : "not-allowed",
            transition: "all 200ms ease-out",
          }}
        >
          Begin the Agon
        </button>
      </div>

      <div style={{ marginTop: "48px" }}>
        <div
          className="font-mono uppercase"
          style={{
            fontSize: "11px",
            letterSpacing: "0.08em",
            color: "var(--fg-dim)",
            marginBottom: "12px",
          }}
        >
          Or try an example
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {EXAMPLE_TOPICS.map((ex) => (
            <button
              key={ex}
              onClick={() => setTopic(ex)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--fg-dim)",
                fontFamily: "var(--font-serif)",
                fontSize: "16px",
                textAlign: "left",
                cursor: "pointer",
                padding: "6px 0",
                transition: "color 200ms ease-out",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--fg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--fg-dim)";
              }}
            >
              → {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Stage 2: Research (Phase 1 placeholder) ── */

function ResearchStage({
  topic,
  onContinue,
}: {
  topic: string;
  onContinue: () => void;
}) {
  return (
    <div>
      <PreviewBanner>
        Phase 2 will stream real Tavily results scoped to your topic. For this
        preview, skip ahead to pick your council.
      </PreviewBanner>

      <div style={{ marginTop: "32px" }}>
        <div
          className="font-mono uppercase"
          style={{
            fontSize: "11px",
            letterSpacing: "0.08em",
            color: "var(--fg-dim)",
            marginBottom: "12px",
          }}
        >
          Researching
        </div>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "18px",
            lineHeight: 1.55,
            color: "var(--fg-dim)",
            fontStyle: "italic",
          }}
        >
          &ldquo;{topic}&rdquo;
        </p>
      </div>

      <div style={{ marginTop: "48px" }}>
        <button
          onClick={onContinue}
          className="font-mono"
          style={{
            background: "var(--amber)",
            color: "var(--bg)",
            border: "1px solid var(--amber)",
            fontSize: "12px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            padding: "14px 28px",
            cursor: "pointer",
          }}
        >
          Summon the Council →
        </button>
      </div>
    </div>
  );
}

/* ── Stage 3: Council ── */

function CouncilStage({
  minds,
  council,
  toggleMind,
  onContinue,
}: {
  minds: MindOption[];
  council: string[];
  toggleMind: (slug: string) => void;
  onContinue: () => void;
}) {
  const count = council.length;
  const valid = count >= MIND_MIN && count <= MIND_MAX;

  return (
    <div>
      <div
        className="font-mono uppercase"
        style={{
          fontSize: "11px",
          letterSpacing: "0.08em",
          color: "var(--fg-dim)",
          marginBottom: "10px",
        }}
      >
        Your Council
      </div>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "17px",
          lineHeight: 1.5,
          color: "var(--fg-dim)",
          marginBottom: "32px",
          maxWidth: "58ch",
        }}
      >
        Choose {MIND_MIN}&ndash;{MIND_MAX} minds. We&rsquo;ve pre-selected a
        council that looks right for your question. Swap anyone in or out.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "16px",
        }}
      >
        {minds.map((mind) => {
          const selected = council.includes(mind.slug);
          return (
            <button
              key={mind.slug}
              onClick={() => toggleMind(mind.slug)}
              style={{
                textAlign: "left",
                background: selected ? "rgba(255, 180, 77, 0.08)" : "transparent",
                border: `1px solid ${selected ? "var(--amber)" : "var(--hairline)"}`,
                padding: "18px",
                cursor: "pointer",
                transition: "all 200ms ease-out",
                color: "var(--fg)",
                fontFamily: "inherit",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                minHeight: "160px",
              }}
            >
              <div
                className="font-mono uppercase"
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.12em",
                  color: mind.colorVar,
                }}
              >
                {mind.name}
              </div>
              <div
                className="font-mono"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.06em",
                  color: "var(--fg-dim)",
                  textTransform: "uppercase",
                }}
              >
                {mind.era} · {mind.domain}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "14px",
                  lineHeight: 1.45,
                  color: "var(--fg-dim)",
                  flex: 1,
                }}
              >
                {mind.lens}
              </div>
              <div
                className="font-mono"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.06em",
                  color: selected ? "var(--amber)" : "var(--fg-dim)",
                  textTransform: "uppercase",
                  marginTop: "4px",
                }}
              >
                {selected ? "✓ On the council" : `${mind.incidentCount} incidents`}
              </div>
            </button>
          );
        })}
      </div>

      <div
        style={{
          marginTop: "40px",
          display: "flex",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={onContinue}
          disabled={!valid}
          className="font-mono"
          style={{
            background: valid ? "var(--amber)" : "transparent",
            color: valid ? "var(--bg)" : "var(--fg-dim)",
            border: valid ? "1px solid var(--amber)" : "1px solid var(--hairline)",
            fontSize: "12px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            padding: "14px 28px",
            cursor: valid ? "pointer" : "not-allowed",
            transition: "all 200ms ease-out",
          }}
        >
          Begin the Agon
        </button>
        <div
          className="font-mono"
          style={{
            fontSize: "11px",
            letterSpacing: "0.08em",
            color: "var(--fg-dim)",
          }}
        >
          {count} selected · {MIND_MIN}&ndash;{MIND_MAX} required
        </div>
      </div>
    </div>
  );
}

/* ── Stage 4: Agon (Phase 1 placeholder) ── */

function AgonStage({
  topic,
  selectedMinds,
  onContinue,
}: {
  topic: string;
  selectedMinds: MindOption[];
  onContinue: () => void;
}) {
  return (
    <div>
      <PreviewBanner>
        Phase 2 will stream real 150&ndash;250-word turns with
        position&nbsp;→&nbsp;warrant&nbsp;→&nbsp;engagement&nbsp;→&nbsp;implication
        structure, per the AGORA_PLAN §3 spec.
      </PreviewBanner>

      <div style={{ marginTop: "32px" }}>
        <div
          className="font-mono uppercase"
          style={{
            fontSize: "11px",
            letterSpacing: "0.08em",
            color: "var(--fg-dim)",
            marginBottom: "10px",
          }}
        >
          The Decision
        </div>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "18px",
            lineHeight: 1.5,
            color: "var(--fg)",
            fontStyle: "italic",
            marginBottom: "36px",
          }}
        >
          &ldquo;{topic}&rdquo;
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "36px",
        }}
      >
        {[1, 2, 3].map((round) => (
          <div key={round}>
            <div
              className="font-mono uppercase"
              style={{
                fontSize: "11px",
                letterSpacing: "0.15em",
                color: "var(--fg-dim)",
                marginBottom: "20px",
              }}
            >
              Round {round}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >
              {selectedMinds.map((mind) => (
                <div key={mind.slug}>
                  <div
                    className="font-mono uppercase"
                    style={{
                      fontSize: "11px",
                      letterSpacing: "0.1em",
                      color: mind.colorVar,
                    }}
                  >
                    {mind.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "14px",
                      fontStyle: "italic",
                      color: mind.colorVar,
                      opacity: 0.6,
                      marginTop: "3px",
                    }}
                  >
                    {mind.lens.length > 90
                      ? mind.lens.slice(0, 90) + "…"
                      : mind.lens}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "16px",
                      lineHeight: 1.6,
                      color: "var(--fg-dim)",
                      marginTop: "10px",
                      fontStyle: "italic",
                    }}
                  >
                    [Turn streams here — Phase 2 wires this to the agon engine]
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "48px" }}>
        <button
          onClick={onContinue}
          className="font-mono"
          style={{
            background: "var(--amber)",
            color: "var(--bg)",
            border: "1px solid var(--amber)",
            fontSize: "12px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            padding: "14px 28px",
            cursor: "pointer",
          }}
        >
          Surface the Consensus →
        </button>
      </div>
    </div>
  );
}

/* ── Stage 5: Consensus (Phase 1 placeholder with interactive graph) ── */

function ConsensusStage({
  topic,
  selectedMinds,
  consensusNode,
  setConsensusNode,
  onReset,
}: {
  topic: string;
  selectedMinds: MindOption[];
  consensusNode: ConsensusNodeKey | null;
  setConsensusNode: (k: ConsensusNodeKey | null) => void;
  onReset: () => void;
}) {
  const placeholderSummaries: Partial<Record<ConsensusNodeKey, string>> = {
    POINTS:
      "What all the minds converged on. Phase 2 extracts this from actual agreement in the agon.",
    TENSIONS:
      "Where the minds split. The load-bearing disagreements the user must decide between.",
    ACTION:
      "The single concrete move the consensus recommends.",
    STEPS:
      "The 3&ndash;5 immediate next steps to test or enact the recommendation.",
    RISKS:
      "What could go wrong, flagged by each mind&apos;s known blind spots.",
  };

  return (
    <div>
      <PreviewBanner>
        Phase 2 produces real consensus from the agon. Hover the nodes now to
        see what each will contain.
      </PreviewBanner>

      <div style={{ marginTop: "32px" }}>
        <div
          className="font-mono uppercase"
          style={{
            fontSize: "11px",
            letterSpacing: "0.08em",
            color: "var(--fg-dim)",
            marginBottom: "10px",
          }}
        >
          Council
        </div>
        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          {selectedMinds.map((mind) => (
            <div
              key={mind.slug}
              className="font-mono uppercase"
              style={{
                fontSize: "11px",
                letterSpacing: "0.1em",
                color: mind.colorVar,
              }}
            >
              {mind.name}
            </div>
          ))}
        </div>

        <div
          className="font-mono uppercase"
          style={{
            fontSize: "11px",
            letterSpacing: "0.08em",
            color: "var(--fg-dim)",
            marginBottom: "10px",
          }}
        >
          The Decision
        </div>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "17px",
            lineHeight: 1.5,
            color: "var(--fg)",
            fontStyle: "italic",
            marginBottom: "48px",
            maxWidth: "58ch",
          }}
        >
          &ldquo;{topic}&rdquo;
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "48px",
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <ConsensusGraph
            started={true}
            summaries={placeholderSummaries}
            onNodeSelect={setConsensusNode}
            selected={consensusNode}
          />
        </div>
        <div style={{ flex: 1, minWidth: "260px" }}>
          <div
            className="font-mono uppercase"
            style={{
              fontSize: "11px",
              letterSpacing: "0.08em",
              color: "var(--amber)",
              marginBottom: "12px",
            }}
          >
            Council Consensus
          </div>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "16px",
              lineHeight: 1.65,
              color: "var(--fg-dim)",
              fontStyle: "italic",
            }}
          >
            [The full synthesis streams here in Phase 2 — points of agreement,
            live tensions, recommended action, next steps, and risks. Click any
            node on the graph to jump to that section.]
          </p>
        </div>
      </div>

      <div style={{ marginTop: "64px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <button
          onClick={onReset}
          className="font-mono"
          style={{
            background: "transparent",
            color: "var(--fg)",
            border: "1px solid var(--hairline)",
            fontSize: "12px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            padding: "14px 28px",
            cursor: "pointer",
          }}
        >
          Begin Another
        </button>
      </div>
    </div>
  );
}

/* ── Shared preview banner ── */

function PreviewBanner({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        border: "1px dashed var(--hairline)",
        padding: "12px 16px",
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        letterSpacing: "0.04em",
        color: "var(--fg-dim)",
        lineHeight: 1.5,
      }}
    >
      <span style={{ color: "var(--amber)", marginRight: "10px" }}>PREVIEW</span>
      {children}
    </div>
  );
}
