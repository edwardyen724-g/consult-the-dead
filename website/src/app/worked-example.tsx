"use client";

import { useEffect, useRef, useState } from "react";

interface Speaker {
  name: string;
  tag: string;
  body: string;
  color: string;
}

const speakers: Speaker[] = [
  {
    name: "SUN TZU",
    tag: "what terrain the fight is being decided on",
    body:
      "The rival faction committed to cloning living creators and their labor. That terrain is already on fire with backlash. Our terrain — frameworks extracted from the public-domain dead — is empty. Ship what you have, open source, with no roadmap. Let them burn themselves out on ground we do not need to hold.",
    color: "var(--color-suntzu)",
  },
  {
    name: "MACHIAVELLI",
    tag: "where fortuna's wind is blowing",
    body:
      "Neutrality is death. A narrative window opened when the backlash began; it closes in weeks. Ship the one working mode this week as a capability demonstration, not a moral appeal. Display the contrast. Let readers draw the conclusion themselves.",
    color: "var(--color-machiavelli)",
  },
  {
    name: "LEONARDO",
    tag: "what the dissection reveals",
    body:
      "My single most expensive lesson: private investigation does not compound until it touches other minds. I died with notebooks that nobody read for three hundred years. The constraint — one working mode — is not a weakness to hide. It is the underpainting of the Last Supper. Ship it.",
    color: "var(--color-leonardo)",
  },
];

const synthesisBody =
  "Three independent frameworks converge: ship debate mode open source this week, frame the constraint as positioning, do not attack the clones — stand orthogonal. The money is downstream of the position, and the position only exists if you ship now.";

const decisionLine =
  "Should we launch our half-built product open source now, or keep building before we ship?";

// Approximate token granularity: split on spaces but keep the spaces.
function tokenize(text: string): string[] {
  return text.split(/(\s+)/).filter((t) => t.length > 0);
}

const TOKEN_DELAY_MS = 10; // user-tuned: faster pace (~12-14s total)

type Phase =
  | { kind: "idle" }
  | { kind: "decision"; tokens: number }
  | { kind: "speaker"; index: number; tokens: number; pulseAt: number }
  | { kind: "synthesis"; tokens: number }
  | { kind: "done" };

export function StreamingDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });

  // Trigger once when scrolled into view.
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      startedRef.current = true;
      setPhase({ kind: "done" });
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            setPhase({ kind: "decision", tokens: 0 });
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.25 },
    );

    io.observe(root);
    return () => io.disconnect();
  }, []);

  // Drive the streaming state machine.
  useEffect(() => {
    if (phase.kind === "idle" || phase.kind === "done") return;

    const decisionTokens = tokenize(decisionLine);

    let timer: number | undefined;

    if (phase.kind === "decision") {
      if (phase.tokens < decisionTokens.length) {
        timer = window.setTimeout(() => {
          setPhase({ kind: "decision", tokens: phase.tokens + 1 });
        }, TOKEN_DELAY_MS);
      } else {
        timer = window.setTimeout(() => {
          setPhase({ kind: "speaker", index: 0, tokens: 0, pulseAt: Date.now() });
        }, 450);
      }
    } else if (phase.kind === "speaker") {
      const speaker = speakers[phase.index];
      const speakerTokens = tokenize(speaker.body);
      if (phase.tokens < speakerTokens.length) {
        timer = window.setTimeout(() => {
          setPhase({
            kind: "speaker",
            index: phase.index,
            tokens: phase.tokens + 1,
            pulseAt: phase.pulseAt,
          });
        }, TOKEN_DELAY_MS);
      } else if (phase.index + 1 < speakers.length) {
        timer = window.setTimeout(() => {
          setPhase({
            kind: "speaker",
            index: phase.index + 1,
            tokens: 0,
            pulseAt: Date.now(),
          });
        }, 550);
      } else {
        timer = window.setTimeout(() => {
          setPhase({ kind: "synthesis", tokens: 0 });
        }, 600);
      }
    } else if (phase.kind === "synthesis") {
      const synthTokens = tokenize(synthesisBody);
      if (phase.tokens < synthTokens.length) {
        timer = window.setTimeout(() => {
          setPhase({ kind: "synthesis", tokens: phase.tokens + 1 });
        }, TOKEN_DELAY_MS);
      } else {
        setPhase({ kind: "done" });
      }
    }

    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [phase]);

  // Visibility helpers.
  const decisionDone =
    phase.kind === "speaker" ||
    phase.kind === "synthesis" ||
    phase.kind === "done";
  const decisionTokens = tokenize(decisionLine);
  const decisionShown =
    phase.kind === "idle"
      ? 0
      : decisionDone
        ? decisionTokens.length
        : phase.kind === "decision"
          ? phase.tokens
          : 0;

  function speakerState(i: number): {
    visible: boolean;
    text: string;
    streaming: boolean;
    pulseKey: number;
  } {
    const speaker = speakers[i];
    const tokens = tokenize(speaker.body);

    if (phase.kind === "speaker") {
      if (i < phase.index) {
        return { visible: true, text: speaker.body, streaming: false, pulseKey: 0 };
      }
      if (i === phase.index) {
        return {
          visible: true,
          text: tokens.slice(0, phase.tokens).join(""),
          streaming: phase.tokens < tokens.length,
          pulseKey: phase.pulseAt,
        };
      }
      return { visible: false, text: "", streaming: false, pulseKey: 0 };
    }

    if (phase.kind === "synthesis" || phase.kind === "done") {
      return { visible: true, text: speaker.body, streaming: false, pulseKey: 0 };
    }

    return { visible: false, text: "", streaming: false, pulseKey: 0 };
  }

  const synthTokens = tokenize(synthesisBody);
  const synthVisible = phase.kind === "synthesis" || phase.kind === "done";
  const synthText =
    phase.kind === "done"
      ? synthesisBody
      : phase.kind === "synthesis"
        ? synthTokens.slice(0, phase.tokens).join("")
        : "";
  const synthStreaming =
    phase.kind === "synthesis" && phase.tokens < synthTokens.length;

  return (
    <div ref={containerRef} className="mx-auto" style={{ maxWidth: "880px" }}>
      <div
        className="font-mono uppercase"
        style={{
          fontSize: "12px",
          letterSpacing: "0.08em",
          color: "var(--fg-dim)",
        }}
      >
        The decision
      </div>
      <p
        className="mt-4"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(24px, 3vw, 32px)",
          lineHeight: 1.25,
          letterSpacing: "-0.01em",
          minHeight: "2.5em",
        }}
      >
        {decisionTokens.slice(0, decisionShown).join("")}
        {phase.kind === "decision" && decisionShown < decisionTokens.length && (
          <span className="gm-caret" aria-hidden="true">
            ▍
          </span>
        )}
      </p>

      <hr
        style={{
          border: "none",
          borderTop: "1px solid var(--hairline)",
          margin: "48px 0",
        }}
      />

      <div className="space-y-16">
        {speakers.map((s, i) => {
          const state = speakerState(i);
          if (!state.visible) {
            return (
              <div key={s.name} style={{ minHeight: "1px" }} aria-hidden="true" />
            );
          }
          return (
            <div key={s.name}>
              <div
                key={`name-${state.pulseKey}`}
                className={`font-mono uppercase ${state.streaming ? "gm-name-pulse" : ""}`}
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                  color: s.color,
                }}
              >
                {s.name}
              </div>
              <div
                className="mt-2 italic"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "15px",
                  color: s.color,
                  opacity: 0.6,
                }}
              >
                {s.tag}
              </div>
              <p
                className="mt-4"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "19px",
                  lineHeight: 1.65,
                  maxWidth: "62ch",
                }}
              >
                {state.text}
                {state.streaming && (
                  <span className="gm-caret" aria-hidden="true">
                    ▍
                  </span>
                )}
              </p>
            </div>
          );
        })}

        {synthVisible && (
          <div>
            <div
              className="font-mono uppercase"
              style={{
                fontSize: "12px",
                letterSpacing: "0.08em",
                color: "var(--amber)",
              }}
            >
              Synthesis
            </div>
            <p
              className="mt-4"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "19px",
                lineHeight: 1.65,
                maxWidth: "62ch",
              }}
            >
              {synthText}
              {synthStreaming && (
                <span className="gm-caret" aria-hidden="true">
                  ▍
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Keep the old export name as an alias so any stray imports still resolve.
export const WorkedExample = StreamingDemo;
