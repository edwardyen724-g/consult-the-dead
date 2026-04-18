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

export function AgoraApp({ minds }: { minds: MindOption[] }) {
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
    setState((s) => {
      if (s.council.includes(slug)) {
        return { ...s, council: s.council.filter((x) => x !== slug) };
      }
      if (s.council.length >= MIND_MAX) return s;
      return { ...s, council: [...s.council, slug] };
    });
  }

  async function startAgon() {
    if (state.council.length < MIND_MIN || state.council.length > MIND_MAX) return;

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

        <ProgressBar stage={state.stage} visibleStages={visibleStages} />

        {state.error && (
          <div
            style={{
              marginTop: "32px",
              border: "1px solid #c75a5a",
              padding: "12px 16px",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "#e8a5a5",
              lineHeight: 1.5,
            }}
          >
            <span style={{ marginRight: "10px", color: "#c75a5a" }}>
              {state.rateLimited ? "RATE LIMIT" : "ERROR"}
            </span>
            {state.error}
          </div>
        )}

        <div style={{ marginTop: "40px" }}>
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
              minds={minds}
              council={state.council}
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

/* ────────────── Progress bar ────────────── */

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
          Pick the Council →
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
          {showKey ? "− hide" : "+ "}your own anthropic key {apiKey ? " (saved)" : "(optional)"}
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
                color: "var(--fg)",
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                padding: "10px 12px",
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
          gap: "36px",
        }}
      >
        {sortedRounds.map((round) => (
          <div key={round}>
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
              Round {round}
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
}: {
  topic: string;
  selectedMinds: MindOption[];
  consensus: ConsensusResult | null;
  loading: boolean;
  consensusNode: ConsensusNodeKey | null;
  setConsensusNode: (k: ConsensusNodeKey | null) => void;
  turns: RoundTurn[];
  onReset: () => void;
}) {
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
