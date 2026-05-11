"use client";

import { useState } from "react";

import type { FrameworkSlug } from "@/lib/frameworks";

const ANALYSIS_ENDPOINT = "/api/generate-analysis";
const MIN_TOPIC_LENGTH = 10;
const MAX_TOPIC_LENGTH = 2000;

export type AskThisMindStatus = "idle" | "loading" | "success" | "error";

export interface FrameworkTransparencyPanelProps {
  frameworkSlug: FrameworkSlug;
  frameworkName: string;
  constructCount: number;
  incidentCount: number;
  blindSpotCount: number;
  validationLine: string | null;
  defaultOpen?: boolean;
  initialTopic?: string;
  initialAnalysis?: string;
  initialStatus?: AskThisMindStatus;
  initialError?: string;
}

export interface AskThisMindSubmissionArgs {
  frameworkSlug: FrameworkSlug;
  topic: string;
  fetchImpl?: typeof fetch;
  onStatusChange?: (status: AskThisMindStatus) => void;
  onAnalysis?: (analysis: string) => void;
  onError?: (message: string) => void;
  onSuccess?: () => void;
}

export function buildAskThisMindPayload(frameworkSlug: FrameworkSlug, topic: string) {
  return {
    frameworkSlug,
    topic: topic.trim(),
  };
}

export function validateAskThisMindTopic(topic: string): string | null {
  const trimmed = topic.trim();
  if (trimmed.length < MIN_TOPIC_LENGTH) {
    return "Topic must be at least 10 characters";
  }
  if (trimmed.length > MAX_TOPIC_LENGTH) {
    return "Topic must be 2000 characters or fewer";
  }
  return null;
}

export function parseAskThisMindEventStream(text: string): string {
  let analysis = "";

  for (const chunk of text.split("\n\n")) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    const dataLine = trimmed
      .split("\n")
      .find((line) => line.startsWith("data: "));
    if (!dataLine) continue;

    try {
      const event = JSON.parse(dataLine.slice(6)) as
        | { type: "analysis_started" }
        | { type: "analysis_chunk"; text: string }
        | { type: "analysis_done"; analysis: string };

      if (event.type === "analysis_chunk") {
        analysis += event.text;
      } else if (event.type === "analysis_done") {
        analysis = event.analysis;
      }
    } catch {
      // Ignore malformed events. The API should not emit them, but the
      // form should fail soft rather than masking the rest of the stream.
    }
  }

  return analysis.trim();
}

export async function submitAskThisMindAnalysis({
  frameworkSlug,
  topic,
  fetchImpl = fetch,
  onStatusChange,
  onAnalysis,
  onError,
  onSuccess,
}: AskThisMindSubmissionArgs): Promise<string> {
  const validationError = validateAskThisMindTopic(topic);
  if (validationError) {
    onStatusChange?.("error");
    onError?.(validationError);
    throw new Error(validationError);
  }

  onStatusChange?.("loading");

  const response = await fetchImpl(ANALYSIS_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(buildAskThisMindPayload(frameworkSlug, topic)),
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const errorResponse = response.clone();
      const data = (await errorResponse.json()) as { error?: unknown };
      if (typeof data.error === "string" && data.error.trim()) {
        message = data.error;
      }
    } catch {
      const fallback = await response.clone().text().catch(() => "");
      if (fallback.trim()) message = fallback.trim();
    }
    onStatusChange?.("error");
    onError?.(message);
    throw new Error(message);
  }

  const streamText = await response.text();
  const analysis = parseAskThisMindEventStream(streamText);
  onAnalysis?.(analysis);
  onStatusChange?.("success");
  onSuccess?.();
  return analysis;
}

export function FrameworkTransparencyPanel({
  frameworkSlug,
  frameworkName,
  constructCount,
  incidentCount,
  blindSpotCount,
  validationLine,
  defaultOpen = false,
  initialTopic = "",
  initialAnalysis = "",
  initialStatus = "idle",
  initialError = "",
}: FrameworkTransparencyPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [topic, setTopic] = useState(initialTopic);
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [status, setStatus] = useState<AskThisMindStatus>(initialStatus);
  const [error, setError] = useState(initialError);

  const personFirstName = frameworkName.split(" ")[0] || frameworkName;
  const isBusy = status === "loading";
  const hasAnalysis = analysis.trim().length > 0;

  return (
    <section
      aria-label="Framework transparency"
      style={{
        border: "1px solid var(--hairline)",
        borderRadius: "8px",
        background: "var(--surface)",
        marginTop: "72px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "16px",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          padding: "24px 24px 20px",
          borderBottom: "1px solid var(--hairline)",
        }}
      >
        <div style={{ maxWidth: "54ch" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--fg-dim)",
              marginBottom: "8px",
            }}
          >
            Framework transparency
          </div>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.35rem",
              fontWeight: 400,
              lineHeight: 1.3,
              margin: 0,
            }}
          >
            See how this mind was extracted, stress-tested, and challenged.
          </h2>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "0.95rem",
              lineHeight: 1.6,
              color: "var(--fg-dim)",
              margin: "10px 0 0",
            }}
          >
            The toggle reveals the source geometry behind the framework and
            lets you ask {personFirstName} a live question without leaving the page.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={`${frameworkSlug}-transparency-panel`}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            padding: "11px 16px",
            borderRadius: "4px",
            background: open ? "var(--amber)" : "transparent",
            color: open ? "var(--bg)" : "var(--fg)",
            border: `1px solid ${open ? "var(--amber)" : "var(--hairline)"}`,
            cursor: "pointer",
          }}
        >
          {open ? "Hide transparency" : "Show transparency"}
        </button>
      </div>

      <div
        id={`${frameworkSlug}-transparency-panel`}
        hidden={!open}
        style={{
          padding: "24px",
          display: "grid",
          gap: "20px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "12px",
          }}
        >
          <MetricCard value={constructCount} label="Constructs" />
          <MetricCard value={incidentCount} label="Incidents" />
          <MetricCard value={blindSpotCount} label="Blind spots" />
        </div>

        {validationLine && (
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              lineHeight: 1.7,
              color: "var(--fg-dim)",
              margin: 0,
              maxWidth: "72ch",
            }}
          >
            {validationLine}
          </p>
        )}

        <form
          onSubmit={(event) => { event.preventDefault(); void submitAskThisMindAnalysis({ frameworkSlug, topic, onStatusChange: setStatus, onAnalysis: setAnalysis, onError: setError, onSuccess: () => setError("") }).catch(() => {}); }}
          style={{ display: "grid", gap: "12px" }}
        >
          <div>
            <label
              htmlFor={`${frameworkSlug}-ask-this-mind`}
              style={{
                display: "block",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--fg-dim)",
                marginBottom: "8px",
              }}
            >
              Ask this mind
            </label>
            <textarea
              id={`${frameworkSlug}-ask-this-mind`}
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder={`Ask ${personFirstName} about a decision, tradeoff, or move you are considering.`}
              rows={5}
              spellCheck={false}
              disabled={isBusy}
              style={{
                width: "100%",
                boxSizing: "border-box",
                fontFamily: "var(--font-serif)",
                fontSize: "15px",
                lineHeight: 1.6,
                padding: "14px 16px",
                borderRadius: "4px",
                border: "1px solid var(--hairline)",
                background: "var(--bg)",
                color: "var(--fg)",
                resize: "vertical",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <button
              type="submit"
              disabled={isBusy || topic.trim().length === 0}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "12px 18px",
                borderRadius: "4px",
                border: "none",
                background: "var(--amber)",
                color: "var(--bg)",
                cursor: isBusy || topic.trim().length === 0 ? "not-allowed" : "pointer",
                opacity: isBusy || topic.trim().length === 0 ? 0.65 : 1,
              }}
            >
              {isBusy ? "Thinking…" : "Ask this mind"}
            </button>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--fg-dim)",
              }}
            >
              10 to 2000 characters
            </span>
          </div>
        </form>

        {error && (
          <p
            role="alert"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              lineHeight: 1.6,
              color: "var(--error, #a83d2b)",
              margin: 0,
            }}
          >
            {error}
          </p>
        )}

        {hasAnalysis && (
          <article
            aria-live="polite"
            style={{
              border: "1px solid var(--hairline)",
              borderRadius: "4px",
              background: "rgba(255,255,255,0.02)",
              padding: "20px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--amber)",
                marginBottom: "12px",
              }}
            >
              Ask This Mind
            </div>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1rem",
                lineHeight: 1.75,
                color: "var(--fg)",
                margin: 0,
                whiteSpace: "pre-wrap",
              }}
            >
              {analysis}
            </p>
          </article>
        )}
      </div>
    </section>
  );
}

function MetricCard({ value, label }: { value: number; label: string }) {
  return (
    <div
      style={{
        background: "var(--bg)",
        border: "1px solid var(--hairline)",
        borderRadius: "4px",
        padding: "18px 16px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "1.9rem",
          color: "var(--amber)",
          lineHeight: 1.1,
          marginBottom: "4px",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--fg-dim)",
        }}
      >
        {label}
      </div>
    </div>
  );
}
