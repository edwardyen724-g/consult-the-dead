"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ConsensusGraph, type ConsensusNodeKey } from "@/components/ConsensusGraph";
import type { AgonEvent, ConsensusResult } from "@/lib/agon/types";

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

const STAGE_ROMAN: Record<Stage, string> = {
  topic: "I", research: "II", council: "III", agon: "IV", consensus: "V",
};
const STAGE_SUBTITLE: Record<Stage, string> = {
  topic: "The Question", research: "Research", council: "Council Selection",
  agon: "The Agon", consensus: "Consensus",
};

function toRoman(n: number): string {
  const map: [number, string][] = [[3,"III"],[2,"II"],[1,"I"]];
  for (const [v, s] of map) if (n >= v) return s;
  return String(n);
}

const MIND_MIN = 2;
const MIND_MAX = 5;
const DEFAULT_COUNCIL_SIZE = 3;
const TOTAL_ROUNDS = 3;
const API_KEY_STORAGE = "ctd-anthropic-key";

const EXAMPLE_TOPICS = [
  "Should I raise VC or bootstrap?",
  "Should we open-source our core product?",
  "My industry is being automated — pivot into AI, or double down on domain depth?",
];

interface RoundTurn {
  mindSlug: string;
  mindName: string;
  round: number;
  text: string;
  done: boolean;
}

interface AgonState {
  stage: Stage;
  topic: string;
  apiKey: string;
  researchEnabled: boolean;
  council: string[];
  turns: RoundTurn[];
  activeRound: number | null;
  activeMindSlug: string | null;
  consensus: ConsensusResult | null;
  consensusLoading: boolean;
  consensusNode: ConsensusNodeKey | null;
  error: string | null;
  rateLimited: boolean;
}

const INITIAL_STATE: AgonState = {
  stage: "topic",
  topic: "",
  apiKey: "",
  researchEnabled: false,
  council: [],
  turns: [],
  activeRound: null,
  activeMindSlug: null,
  consensus: null,
  consensusLoading: false,
  consensusNode: null,
  error: null,
  rateLimited: false,
};

function suggestCouncil(topic: string, minds: MindOption[]): string[] {
  const t = topic.toLowerCase();
  const keywords: Record<string, string[]> = {
    "niccolo-machiavelli": ["power", "politics", "negotiate", "leverage", "competitor", "rival"],
    "sun-tzu": ["strategy", "compete", "terrain", "market", "timing", "win"],
    "marie-curie": ["evidence", "data", "research", "test", "validate", "study"],
    "isaac-newton": ["first principles", "system", "rebuild", "proof", "fundamental"],
    "leonardo-da-vinci": ["design", "creative", "cross", "combine", "invent", "prototype"],
    "nikola-tesla": ["vision", "future", "invent", "technology", "breakthrough"],
    "marcus-aurelius": ["duty", "virtue", "stoic", "long term", "integrity", "reputation"],
  };

  const scored = minds
    .map((m) => ({
      slug: m.slug,
      score: (keywords[m.slug] ?? []).reduce((acc, kw) => acc + (t.includes(kw) ? 1 : 0), 0),
    }))
    .sort((a, b) => b.score - a.score);

  const topScoring = scored.filter((s) => s.score > 0).map((s) => s.slug);
  if (topScoring.length >= DEFAULT_COUNCIL_SIZE) {
    return topScoring.slice(0, DEFAULT_COUNCIL_SIZE);
  }

  const fallback = [...topScoring];
  for (const d of ["niccolo-machiavelli", "sun-tzu", "marie-curie"]) {
    if (fallback.length >= DEFAULT_COUNCIL_SIZE) break;
    if (!fallback.includes(d) && minds.some((m) => m.slug === d)) fallback.push(d);
  }
  while (fallback.length < DEFAULT_COUNCIL_SIZE && fallback.length < minds.length) {
    const next = minds.find((m) => !fallback.includes(m.slug));
    if (!next) break;
    fallback.push(next.slug);
  }
  return fallback;
}

export function AgoraApp({ minds, isPro }: { minds: MindOption[]; isPro: boolean }) {
  const [state, setState] = useState<AgonState>(INITIAL_STATE);
  const abortRef = useRef<AbortController | null>(null);

  // Restore API key from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(API_KEY_STORAGE);
      if (saved) setState((s) => ({ ...s, apiKey: saved }));
    } catch {
      // ignore
    }
  }, []);

  // Cancel any in-flight stream when component unmounts
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const visibleStages: Stage[] = useMemo(() => {
    return state.researchEnabled
      ? STAGE_ORDER
      : STAGE_ORDER.filter((s) => s !== "research");
  }, [state.researchEnabled]);

  function setApiKey(key: string) {
    setState((s) => ({ ...s, apiKey: key }));
    try {
      if (key) localStorage.setItem(API_KEY_STORAGE, key);
      else localStorage.removeItem(API_KEY_STORAGE);
    } catch {
      // ignore
    }
  }

  function beginFromTopic() {
    const trimmed = state.topic.trim();
    if (trimmed.length < 10) return;
    const suggested = suggestCouncil(trimmed, minds);
    setState((s) => ({
      ...s,
      council: suggested,
      stage: s.researchEnabled ? "research" : "council",
    }));
  }

  function toggleMind(slug: string) {
    const mindMax = isPro ? MIND_MAX : 3;
    setState((s) => {
      if (s.council.includes(slug)) {
        return { ...s, council: s.council.filter((x) => x !== slug) };
      }
      if (s.council.length >= mindMax) return s;
      return { ...s, council: [...s.council, slug] };
    });
  }

  async function startAgon() {
    if (state.council.length < MIND_MIN || state.council.length > (isPro ? MIND_MAX : 3)) return;

    setState((s) => ({
      ...s,
      stage: "agon",
      turns: [],
      activeRound: null,
      activeMindSlug: null,
      consensus: null,
      consensusLoading: false,
      error: null,
      rateLimited: false,
    }));

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (state.apiKey.trim()) headers["x-api-key"] = state.apiKey.trim();

      const res = await fetch("/api/agon", {
        method: "POST",
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          topic: state.topic.trim(),
          mindSlugs: state.council,
          rounds: TOTAL_ROUNDS,
          research: false,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        setState((s) => ({
          ...s,
          error: errBody.error ?? `Request failed: ${res.status}`,
          rateLimited: !!errBody.rateLimited,
          stage: "council",
        }));
        return;
      }

      if (!res.body) {
        setState((s) => ({ ...s, error: "No response stream", stage: "council" }));
        return;
      }

      await consumeSse(res.body, (event) => handleAgonEvent(event));
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") return;
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "Network error",
      }));
    }
  }

  function handleAgonEvent(event: AgonEvent) {
    setState((s) => {
      switch (event.type) {
        case "round_start":
          return { ...s, activeRound: event.round };
        case "turn_start": {
          const turns = [
            ...s.turns,
            {
              mindSlug: event.mindSlug,
              mindName: event.mindName,
              round: event.round,
              text: "",
              done: false,
            },
          ];
          return {
            ...s,
            turns,
            activeMindSlug: event.mindSlug,
            activeRound: event.round,
          };
        }
        case "turn_chunk": {
          const turns = [...s.turns];
          const last = turns[turns.length - 1];
          if (last && last.mindSlug === event.mindSlug && !last.done) {
            turns[turns.length - 1] = { ...last, text: last.text + event.text };
          }
          return { ...s, turns };
        }
        case "turn_done": {
          const turns = s.turns.map((t) =>
            t.round === event.round && t.mindSlug === event.mindSlug && !t.done
              ? { ...t, text: event.content, done: true }
              : t
          );
          return { ...s, turns, activeMindSlug: null };
        }
        case "consensus_started":
          return { ...s, consensusLoading: true, stage: "consensus" };
        case "consensus_done":
          return {
            ...s,
            consensus: event.consensus,
            consensusLoading: false,
          };
        case "agon_done":
          return s;
        case "error":
          return {
            ...s,
            error: event.message,
            rateLimited: !!event.rateLimited,
            consensusLoading: false,
          };
        default:
          return s;
      }
    });
  }

  function reset() {
    abortRef.current?.abort();
    setState((s) => ({
      ...INITIAL_STATE,
      apiKey: s.apiKey,
    }));
  }

  const selectedMinds = state.council
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
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <StageHeader stage={state.stage} />

        {state.error && (
          <div
            style={{
              marginBottom: "32px",
              border: "1px solid var(--red)",
              borderRadius: "4px",
              padding: "12px 16px",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--fg-dim)",
              lineHeight: 1.5,
            }}
          >
            <span style={{ marginRight: "10px", color: "var(--red)" }}>
              {state.rateLimited ? "RATE LIMIT" : "ERROR"}
            </span>
            {state.error}
          </div>
        )}

        <div>
          {state.stage === "topic" && (
            <TopicStage
              topic={state.topic}
              setTopic={(t) => setState((s) => ({ ...s, topic: t }))}
              apiKey={state.apiKey}
              setApiKey={setApiKey}
              onSubmit={beginFromTopic}
            />
          )}

          {state.stage === "research" && (
            <ResearchPlaceholder
              topic={state.topic}
              onContinue={() => setState((s) => ({ ...s, stage: "council" }))}
            />
          )}

          {state.stage === "council" && (
            <CouncilStage
              topic={state.topic}
              minds={minds}
              council={state.council}
              isPro={isPro}
              toggleMind={toggleMind}
              onContinue={startAgon}
            />
          )}

          {state.stage === "agon" && (
            <AgonStage
              topic={state.topic}
              selectedMinds={selectedMinds}
              turns={state.turns}
              activeMindSlug={state.activeMindSlug}
              activeRound={state.activeRound}
            />
          )}

          {state.stage === "consensus" && (
            <ConsensusStage
              topic={state.topic}
              selectedMinds={selectedMinds}
              consensus={state.consensus}
              loading={state.consensusLoading}
              consensusNode={state.consensusNode}
              setConsensusNode={(n) =>
                setState((s) => ({ ...s, consensusNode: n }))
              }
              turns={state.turns}
              onReset={reset}
              isPro={isPro}
            />
          )}
        </div>

        <div
          data-print="hide"
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
            Free tier: 3 agons / day · BYO key for unlimited
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

/* ────────────── SSE consumer ────────────── */

async function consumeSse(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: AgonEvent) => void
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const block = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);

      for (const line of block.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const json = line.slice(5).trim();
        if (!json) continue;
        try {
          const event = JSON.parse(json) as AgonEvent;
          onEvent(event);
        } catch {
          // Ignore malformed lines
        }
      }
    }
  }
}

/* ────────────── Stage header ────────────── */

function StageHeader({ stage }: { stage: Stage }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        paddingBottom: "16px",
        borderBottom: "1px solid var(--hairline)",
        marginBottom: "48px",
      }}
    >
      <span
        className="font-mono"
        style={{
          fontSize: "10px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--fg-faint)",
        }}
      >
        The Agora · Vol. I
      </span>
      <span
        className="font-mono"
        style={{
          fontSize: "10px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--fg-dim)",
        }}
      >
        Stage {STAGE_ROMAN[stage]} — {STAGE_SUBTITLE[stage]}
      </span>
    </div>
  );
}

/* ────────────── Stage 1: Topic ────────────── */

function TopicStage({
  topic,
  setTopic,
  apiKey,
  setApiKey,
  onSubmit,
}: {
  topic: string;
  setTopic: (t: string) => void;
  apiKey: string;
  setApiKey: (k: string) => void;
  onSubmit: () => void;
}) {
  const [showKey, setShowKey] = useState(false);
  const valid = topic.trim().length >= 10;
  const wordCount = topic.trim() ? topic.trim().split(/\s+/).length : 0;

  return (
    <div>
      {/* Centered editorial heading */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <p
          className="font-mono"
          style={{
            fontSize: "10px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--fg-faint)",
            margin: "0 0 20px",
          }}
        >
          Consult the Dead
        </p>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            fontSize: "clamp(2.2rem, 5vw, 3.2rem)",
            fontStyle: "italic",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: "var(--fg)",
            margin: 0,
          }}
        >
          What decision are you carrying?
        </h1>
      </div>

      {/* Textarea with red left border */}
      <div style={{ position: "relative", marginBottom: "10px" }}>
        <textarea
          id="agora-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="My industry is being automated faster than I expected. Should I pivot hard into AI skills now, or double down on being irreplaceable in my domain?"
          rows={5}
          style={{
            width: "100%",
            background: "var(--surface)",
            border: "none",
            borderLeft: "3px solid var(--red)",
            color: "var(--fg)",
            fontFamily: "var(--font-serif)",
            fontSize: "18px",
            fontStyle: "italic",
            lineHeight: 1.6,
            padding: "20px 20px 44px",
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <div
          className="font-mono"
          style={{
            position: "absolute",
            bottom: "12px",
            right: "14px",
            fontSize: "9px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--fg-faint)",
            pointerEvents: "none",
          }}
        >
          {wordCount} Words · Draft 1
        </div>
      </div>

      <div
        className="font-mono"
        style={{
          fontSize: "11px",
          letterSpacing: "0.04em",
          color: "var(--fg-faint)",
          lineHeight: 1.6,
          marginBottom: "32px",
        }}
      >
        We log your decision and council selection so we can learn what to
        build next. We do <em>not</em> store your name, email, or IP.
      </div>

      <button
        onClick={onSubmit}
        disabled={!valid}
        className="font-mono"
        style={{
          background: valid ? "#2a2018" : "transparent",
          color: valid ? "#f0ead8" : "var(--fg-dim)",
          border: valid ? "none" : "1px solid var(--hairline)",
          borderRadius: 0,
          fontSize: "12px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          padding: "16px 36px",
          cursor: valid ? "pointer" : "not-allowed",
          transition: "all 200ms ease-out",
        }}
      >
        Begin the Agon →
      </button>

      {/* Example questions */}
      <div style={{ marginTop: "56px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "var(--hairline)" }} />
          <span
            className="font-mono"
            style={{
              fontSize: "10px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--fg-faint)",
              whiteSpace: "nowrap",
            }}
          >
            ◆ Or borrow a question from another querent
          </span>
          <div style={{ flex: 1, height: "1px", background: "var(--hairline)" }} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          {EXAMPLE_TOPICS.map((ex, i) => (
            <button
              key={ex}
              onClick={() => setTopic(ex)}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--hairline)",
                borderRadius: 0,
                textAlign: "left",
                cursor: "pointer",
                padding: "20px",
                color: "var(--fg)",
                fontFamily: "inherit",
                transition: "border-color 200ms ease-out",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--fg-dim)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--hairline)"; }}
            >
              <div
                className="font-mono"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.18em",
                  color: "var(--fg-faint)",
                  marginBottom: "10px",
                }}
              >
                {["I", "II", "III"][i]}
              </div>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "15px",
                  fontStyle: "italic",
                  lineHeight: 1.5,
                  color: "var(--fg-dim)",
                  margin: 0,
                }}
              >
                {ex}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* API key */}
      <div style={{ marginTop: "64px", paddingTop: "24px", borderTop: "1px solid var(--hairline)" }}>
        <button
          onClick={() => setShowKey((v) => !v)}
          className="font-mono"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--fg-dim)",
            fontSize: "11px",
            letterSpacing: "0.08em",
            cursor: "pointer",
            textTransform: "uppercase",
            padding: 0,
          }}
        >
          {showKey ? "− hide " : "+ "}your own anthropic key {apiKey ? "(saved)" : "(optional)"}
        </button>
        {showKey && (
          <div style={{ marginTop: "12px" }}>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              style={{
                width: "100%",
                maxWidth: "480px",
                background: "transparent",
                border: "1px solid var(--hairline)",
                borderRadius: "4px",
                color: "var(--fg)",
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                padding: "10px 12px",
                outline: "none",
              }}
            />
            <div
              className="font-mono"
              style={{
                fontSize: "11px",
                letterSpacing: "0.04em",
                color: "var(--fg-dim)",
                marginTop: "8px",
                lineHeight: 1.5,
              }}
            >
              Stored only in your browser. Skips the daily free-tier limit.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────── Stage 2: Research (Phase 3 placeholder) ────────────── */

function ResearchPlaceholder({
  topic,
  onContinue,
}: {
  topic: string;
  onContinue: () => void;
}) {
  return (
    <div>
      <PreviewBanner>
        Research-against-real-sources lands in Phase 3. For now, jump straight
        to the council.
      </PreviewBanner>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "17px",
          lineHeight: 1.55,
          color: "var(--fg-dim)",
          marginTop: "32px",
          fontStyle: "italic",
        }}
      >
        &ldquo;{topic}&rdquo;
      </p>
      <div style={{ marginTop: "32px" }}>
        <button
          onClick={onContinue}
          className="font-mono"
          style={{
            background: "var(--amber)",
            color: "var(--bg)",
            border: "1px solid var(--amber)",
            borderRadius: "4px",
            fontSize: "12px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            padding: "14px 28px",
            cursor: "pointer",
          }}
        >
          Pick the Council →
        </button>
      </div>
    </div>
  );
}

/* ────────────── Stage 3: Council ────────────── */

function CouncilStage({
  topic,
  minds,
  council,
  isPro,
  toggleMind,
  onContinue,
}: {
  topic: string;
  minds: MindOption[];
  council: string[];
  isPro: boolean;
  toggleMind: (slug: string) => void;
  onContinue: () => void;
}) {
  const mindMax = isPro ? MIND_MAX : 3;
  const count = council.length;
  const valid = count >= MIND_MIN && count <= mindMax;
  const unselected = minds.filter((m) => !council.includes(m.slug));

  return (
    <div>
      {/* Topic display */}
      <div style={{ marginBottom: "40px" }}>
        <p
          className="font-mono"
          style={{
            fontSize: "10px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--fg-faint)",
            margin: "0 0 10px",
          }}
        >
          The Question
        </p>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "18px",
            fontStyle: "italic",
            lineHeight: 1.5,
            color: "var(--fg)",
            margin: 0,
            maxWidth: "60ch",
          }}
        >
          &ldquo;{topic}&rdquo;
        </p>
      </div>

      <h2
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 400,
          fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)",
          letterSpacing: "-0.01em",
          lineHeight: 1.2,
          color: "var(--fg)",
          margin: "0 0 36px",
        }}
      >
        Summon the council.
      </h2>

      {/* Horizontal mind card row */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          overflowX: "auto",
          paddingBottom: "8px",
          marginBottom: "20px",
        }}
      >
        {minds.map((mind) => {
          const selected = council.includes(mind.slug);
          const initials = mind.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
          return (
            <button
              key={mind.slug}
              onClick={() => toggleMind(mind.slug)}
              style={{
                flexShrink: 0,
                width: "176px",
                textAlign: "left",
                background: selected ? "var(--amber-wash)" : "var(--surface)",
                border: `1px solid ${selected ? "var(--amber)" : "var(--hairline)"}`,
                borderRadius: 0,
                padding: "16px",
                cursor: "pointer",
                transition: "all 200ms ease-out",
                color: "var(--fg)",
                fontFamily: "inherit",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                position: "relative",
              }}
            >
              {selected && (
                <div
                  className="font-mono"
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    fontSize: "8px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--amber)",
                    background: "var(--amber-wash)",
                    padding: "2px 6px",
                    border: "1px solid var(--amber)",
                  }}
                >
                  Seated
                </div>
              )}

              {/* Engraved portrait */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "4px" }}>
                <svg width="80" height="80" viewBox="0 0 80 80" style={{ display: "block" }}>
                  <rect width="80" height="80" fill="var(--bg)" />
                  <line x1="0" y1="20" x2="20" y2="0" stroke={mind.colorVar} strokeWidth="0.4" opacity="0.25" />
                  <line x1="0" y1="40" x2="40" y2="0" stroke={mind.colorVar} strokeWidth="0.4" opacity="0.25" />
                  <line x1="0" y1="60" x2="60" y2="0" stroke={mind.colorVar} strokeWidth="0.4" opacity="0.25" />
                  <line x1="0" y1="80" x2="80" y2="0" stroke={mind.colorVar} strokeWidth="0.4" opacity="0.25" />
                  <line x1="20" y1="80" x2="80" y2="20" stroke={mind.colorVar} strokeWidth="0.4" opacity="0.25" />
                  <line x1="40" y1="80" x2="80" y2="40" stroke={mind.colorVar} strokeWidth="0.4" opacity="0.25" />
                  <line x1="60" y1="80" x2="80" y2="60" stroke={mind.colorVar} strokeWidth="0.4" opacity="0.25" />
                  <rect x="2" y="2" width="76" height="76" fill="none" stroke={mind.colorVar} strokeWidth="0.8" opacity="0.5" />
                  <rect x="6" y="6" width="68" height="68" fill="none" stroke={mind.colorVar} strokeWidth="0.3" opacity="0.3" />
                  <text x="40" y="48" textAnchor="middle" fill={mind.colorVar}
                    style={{ fontFamily: "var(--font-serif)", fontSize: "26px", fontWeight: 300 }}>
                    {initials}
                  </text>
                </svg>
              </div>

              <div style={{ fontFamily: "var(--font-serif)", fontSize: "14px", color: "var(--fg)", lineHeight: 1.2 }}>
                {mind.name}
              </div>
              <div
                className="font-mono"
                style={{ fontSize: "9px", letterSpacing: "0.1em", color: "var(--fg-faint)", textTransform: "uppercase" }}
              >
                {mind.era}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "12px",
                  fontStyle: "italic",
                  lineHeight: 1.4,
                  color: "var(--fg-dim)",
                  flex: 1,
                }}
              >
                {mind.lens}
              </div>
              <div
                className="font-mono"
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.1em",
                  color: "var(--fg-faint)",
                  textTransform: "uppercase",
                  borderTop: "1px solid var(--hairline)",
                  paddingTop: "6px",
                }}
              >
                {mind.incidentCount} invocations
              </div>
            </button>
          );
        })}
      </div>

      {/* Also available */}
      {unselected.length > 0 && (
        <p
          className="font-mono"
          style={{
            fontSize: "10px",
            letterSpacing: "0.1em",
            color: "var(--fg-faint)",
            textTransform: "uppercase",
            margin: "0 0 8px",
          }}
        >
          Also available:{" "}
          <span style={{ color: "var(--fg-dim)" }}>
            {unselected.map((m) => m.name).join(", ")}
          </span>
        </p>
      )}

      {!isPro && (
        <div
          className="font-mono"
          style={{
            marginTop: "12px",
            marginBottom: "8px",
            fontSize: "11px",
            letterSpacing: "0.06em",
            color: "var(--fg-dim)",
          }}
        >
          Free plan: up to 3 minds.{" "}
          <Link href="/pricing" style={{ color: "var(--amber)", textDecoration: "none" }}>
            Upgrade to Pro
          </Link>{" "}
          for all 5.
        </div>
      )}

      <div
        style={{
          marginTop: "32px",
          display: "flex",
          alignItems: "center",
          gap: "24px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={onContinue}
          disabled={!valid}
          className="font-mono"
          style={{
            background: valid ? "#2a2018" : "transparent",
            color: valid ? "#f0ead8" : "var(--fg-dim)",
            border: valid ? "none" : "1px solid var(--hairline)",
            borderRadius: 0,
            fontSize: "12px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            padding: "16px 36px",
            cursor: valid ? "pointer" : "not-allowed",
            transition: "all 200ms ease-out",
          }}
        >
          Call the Council →
        </button>
        <div
          className="font-mono"
          style={{
            fontSize: "11px",
            letterSpacing: "0.08em",
            color: "var(--fg-dim)",
          }}
        >
          {count} selected · {MIND_MIN}–{mindMax} required
        </div>
      </div>
    </div>
  );
}

/* ────────────── Stage 4: Agon (live streaming) ────────────── */

function AgonStage({
  topic,
  selectedMinds,
  turns,
  activeMindSlug,
  activeRound,
}: {
  topic: string;
  selectedMinds: MindOption[];
  turns: RoundTurn[];
  activeMindSlug: string | null;
  activeRound: number | null;
}) {
  const colorBySlug = useMemo(() => {
    const map: Record<string, string> = {};
    for (const m of selectedMinds) map[m.slug] = m.colorVar;
    return map;
  }, [selectedMinds]);

  const turnsByRound = useMemo(() => {
    const map = new Map<number, RoundTurn[]>();
    for (const t of turns) {
      if (!map.has(t.round)) map.set(t.round, []);
      map.get(t.round)!.push(t);
    }
    return map;
  }, [turns]);

  const sortedRounds = Array.from(turnsByRound.keys()).sort((a, b) => a - b);

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

      {turns.length === 0 && (
        <div
          className="font-mono"
          style={{
            fontSize: "12px",
            letterSpacing: "0.08em",
            color: "var(--fg-dim)",
            marginBottom: "24px",
          }}
        >
          Convening the council…
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0",
        }}
      >
        {sortedRounds.map((round, idx) => (
          <div key={round} style={{ borderTop: idx > 0 ? "1px solid var(--hairline)" : "none", paddingTop: idx > 0 ? "36px" : "0", marginBottom: "36px" }}>
            <div
              className="font-mono uppercase"
              style={{
                fontSize: "11px",
                letterSpacing: "0.15em",
                color:
                  round === activeRound ? "var(--amber)" : "var(--fg-dim)",
                marginBottom: "20px",
              }}
            >
              Round {toRoman(round)}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >
              {turnsByRound.get(round)!.map((turn) => {
                const isActive = activeMindSlug === turn.mindSlug && !turn.done;
                return (
                  <div
                    key={`${turn.round}-${turn.mindSlug}`}
                    style={{
                      opacity: turn.done ? 0.85 : 1,
                      transition: "opacity 400ms ease-out",
                    }}
                  >
                    <div
                      className="font-mono uppercase"
                      style={{
                        fontSize: "11px",
                        letterSpacing: "0.1em",
                        color: colorBySlug[turn.mindSlug] ?? "var(--fg)",
                      }}
                    >
                      {turn.mindName}
                    </div>
                    <p
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "16px",
                        lineHeight: 1.65,
                        marginTop: "10px",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {turn.text}
                      {isActive && (
                        <span className="gm-caret" aria-hidden="true">
                          {" "}▍
                        </span>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────── Stage 5: Consensus (real data) ────────────── */

function ConsensusStage({
  topic,
  selectedMinds,
  consensus,
  loading,
  consensusNode,
  setConsensusNode,
  turns,
  onReset,
  isPro,
}: {
  topic: string;
  selectedMinds: MindOption[];
  consensus: ConsensusResult | null;
  loading: boolean;
  consensusNode: ConsensusNodeKey | null;
  setConsensusNode: (k: ConsensusNodeKey | null) => void;
  turns: RoundTurn[];
  onReset: () => void;
  isPro: boolean;
}) {
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSave() {
    if (!consensus) return;
    setSaveState("saving");
    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          mindSlugs: selectedMinds.map((m) => m.slug),
          rounds: TOTAL_ROUNDS,
          turns,
          consensus,
        }),
      });
      setSaveState(res.ok ? "saved" : "error");
    } catch {
      setSaveState("error");
    }
  }

  const summaries = consensus
    ? {
        POINTS: consensus.pointsSummary,
        TENSIONS: consensus.tensionsSummary,
        ACTION: consensus.actionSummary,
        STEPS: consensus.stepsSummary,
        RISKS: consensus.risksSummary,
      }
    : undefined;

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
            summaries={summaries}
            onNodeSelect={setConsensusNode}
            selected={consensusNode}
          />
        </div>
        <div style={{ flex: 1, minWidth: "260px" }}>
          {loading && (
            <div
              className="font-mono"
              style={{
                fontSize: "12px",
                letterSpacing: "0.08em",
                color: "var(--fg-dim)",
              }}
            >
              Synthesizing the consensus…
            </div>
          )}
          {!loading && !consensus && (
            <div
              className="font-mono"
              style={{
                fontSize: "12px",
                letterSpacing: "0.08em",
                color: "var(--fg-dim)",
              }}
            >
              Waiting for the agon to finish…
            </div>
          )}
          {consensus && (
            <ConsensusDoc consensus={consensus} active={consensusNode} />
          )}
        </div>
      </div>

      {turns.length > 0 && (
        <details style={{ marginTop: "64px" }}>
          <summary
            className="font-mono uppercase"
            style={{
              fontSize: "11px",
              letterSpacing: "0.08em",
              color: "var(--fg-dim)",
              cursor: "pointer",
              padding: "8px 0",
            }}
          >
            ▸ Re-read the full agon transcript
          </summary>
          <div
            style={{
              marginTop: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {turns.map((t, i) => {
              const mind = selectedMinds.find((m) => m.slug === t.mindSlug);
              return (
                <div key={i}>
                  <div
                    className="font-mono uppercase"
                    style={{
                      fontSize: "10px",
                      letterSpacing: "0.1em",
                      color: mind?.colorVar ?? "var(--fg)",
                    }}
                  >
                    {t.mindName} · Round {t.round}
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "15px",
                      lineHeight: 1.6,
                      marginTop: "6px",
                      color: "var(--fg-dim)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {t.text}
                  </p>
                </div>
              );
            })}
          </div>
        </details>
      )}

      <div
        data-print="hide"
        style={{ marginTop: "64px", display: "flex", gap: "16px", flexWrap: "wrap" }}
      >
        {isPro ? (
          <button
            onClick={() => downloadReport()}
            disabled={!consensus}
            className="font-mono"
            style={{
              background: consensus ? "var(--amber)" : "transparent",
              color: consensus ? "var(--bg)" : "var(--fg-dim)",
              border: consensus ? "1px solid var(--amber)" : "1px solid var(--hairline)",
              borderRadius: "4px",
              fontSize: "12px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "14px 28px",
              cursor: consensus ? "pointer" : "not-allowed",
            }}
          >
            Download Report (PDF)
          </button>
        ) : (
          <Link
            href="/pricing"
            className="font-mono"
            style={{
              display: "inline-block",
              border: "1px solid var(--hairline)",
              borderRadius: "4px",
              color: "var(--fg-dim)",
              fontSize: "12px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "14px 28px",
              textDecoration: "none",
            }}
          >
            PDF Export — Pro only →
          </Link>
        )}
        {isPro ? (
          saveState === "saved" ? (
            <Link
              href="/library"
              className="font-mono"
              style={{
                display: "inline-block",
                border: "1px solid var(--amber)",
                borderRadius: "4px",
                color: "var(--amber)",
                fontSize: "12px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "14px 28px",
                textDecoration: "none",
              }}
            >
              Saved to Library ✓
            </Link>
          ) : (
            <button
              onClick={handleSave}
              disabled={!consensus || saveState === "saving"}
              className="font-mono"
              style={{
                background: consensus && saveState !== "saving" ? "var(--amber)" : "transparent",
                color: !consensus || saveState === "saving" ? "var(--fg-dim)" : "var(--bg)",
                border: consensus && saveState !== "saving" ? "1px solid var(--amber)" : "1px solid var(--hairline)",
                borderRadius: "4px",
                fontSize: "12px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "14px 28px",
                cursor: !consensus || saveState === "saving" ? "not-allowed" : "pointer",
              }}
            >
              {saveState === "saving"
                ? "Saving…"
                : saveState === "error"
                  ? "Save failed — retry"
                  : "Save to Library"}
            </button>
          )
        ) : (
          <Link
            href="/pricing"
            className="font-mono"
            style={{
              display: "inline-block",
              border: "1px solid var(--hairline)",
              borderRadius: "4px",
              color: "var(--fg-dim)",
              fontSize: "12px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "14px 28px",
              textDecoration: "none",
            }}
          >
            Save to Library — Pro only →
          </Link>
        )}

        <button
          onClick={onReset}
          className="font-mono"
          style={{
            background: "transparent",
            color: "var(--fg)",
            border: "1px solid var(--hairline)",
            borderRadius: "4px",
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

/* Triggers the browser print dialog. The print stylesheet hides nav and
   force-expands the agon transcript so the saved PDF contains the full
   council, the consensus, and every turn. The user picks "Save as PDF"
   in the print dialog (or sends to a real printer). */
function downloadReport() {
  if (typeof window === "undefined") return;
  const detailsEls = Array.from(document.querySelectorAll("details"));
  const priorOpen = detailsEls.map((d) => d.open);
  detailsEls.forEach((d) => {
    d.open = true;
  });
  // Give the browser a tick to apply the open state before opening the
  // print dialog — some browsers snapshot the DOM synchronously.
  window.requestAnimationFrame(() => {
    window.print();
    detailsEls.forEach((d, i) => {
      d.open = priorOpen[i] ?? d.open;
    });
  });
}

/* ────────────── Consensus document ────────────── */

function ConsensusDoc({
  consensus,
  active,
}: {
  consensus: ConsensusResult;
  active: ConsensusNodeKey | null;
}) {
  const sections: { key: ConsensusNodeKey; title: string; body: React.ReactNode }[] = [
    { key: "POINTS", title: "Consensus Points", body: <p>{consensus.points}</p> },
    { key: "TENSIONS", title: "Live Tensions", body: <p>{consensus.tensions}</p> },
    { key: "ACTION", title: "Recommended Action", body: <p>{consensus.action}</p> },
    {
      key: "STEPS",
      title: "Immediate Next Steps",
      body: (
        <ul style={{ paddingLeft: "20px", margin: 0 }}>
          {consensus.steps.map((s, i) => (
            <li key={i} style={{ marginBottom: "6px" }}>{s}</li>
          ))}
        </ul>
      ),
    },
    { key: "RISKS", title: "Risks", body: <p>{consensus.risks}</p> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {sections.map((s) => {
        const highlighted = active === s.key;
        return (
          <div
            key={s.key}
            id={`consensus-${s.key.toLowerCase()}`}
            style={{
              borderLeft: `2px solid ${highlighted ? "var(--amber)" : "transparent"}`,
              paddingLeft: highlighted ? "16px" : "0",
              transition: "all 300ms ease-out",
            }}
          >
            <div
              className="font-mono uppercase"
              style={{
                fontSize: "11px",
                letterSpacing: "0.08em",
                color: "var(--amber)",
                marginBottom: "8px",
              }}
            >
              {s.title}
            </div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "16px",
                lineHeight: 1.65,
                color: "var(--fg)",
              }}
            >
              {s.body}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ────────────── Shared ────────────── */

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
