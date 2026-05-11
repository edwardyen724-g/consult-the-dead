/**
 * Pure helpers for the public /agora/a/[id] page.
 *
 * Kept separate from page.tsx so they can be exercised by the
 * vitest-compatible test shim (same pattern as src/lib/share-id.test.ts)
 * without spinning up React or Next.js.
 *
 * Nothing here imports React, Next, or the database — purely data shaping.
 */
import type { ConsensusResult } from "@/lib/agon/types";

/* ── UTM forwarding ────────────────────────────────────────────────
   Per marketing playbook §3 (line 214): the public agon page MUST
   forward utm_campaign + utm_content from the incoming URL onto the
   "Run your own agon →" CTA so the conversion attribution chain
   survives the page boundary.

   Only those two UTM keys are forwarded. Anything else (utm_source,
   gclid, fbclid, …) is intentionally dropped: the playbook only
   commits to campaign + content, and quietly forwarding everything
   would risk leaking referrer data we did not promise to preserve.
   ─────────────────────────────────────────────────────────────── */

type SpValue = string | string[] | null | undefined;

function firstString(value: SpValue): string {
  if (value == null) return "";
  if (Array.isArray(value)) {
    const v = value[0];
    return typeof v === "string" ? v : "";
  }
  return typeof value === "string" ? value : "";
}

/**
 * Build the CTA href for the public page, forwarding the two UTM keys
 * the marketing playbook commits to. Returns `/agora` (no querystring)
 * when neither UTM key is present.
 *
 * Both Next.js searchParams (`string | string[]`) and plain values are
 * accepted so this can be called either from the server component or
 * from a test that constructs values by hand.
 */
export function buildAgoraCtaHref(
  utmCampaign: SpValue,
  utmContent: SpValue,
): string {
  const params = new URLSearchParams();
  const c = firstString(utmCampaign).trim();
  const ct = firstString(utmContent).trim();
  if (c) params.set("utm_campaign", c);
  if (ct) params.set("utm_content", ct);
  const qs = params.toString();
  return qs ? `/agora?${qs}` : "/agora";
}

/* ── AgonRecord normalization ───────────────────────────────────── */

/**
 * Public-page-friendly turn shape. Kept structurally compatible with
 * the `RoundTurn` saved by AgoraApp.tsx (handleSave) — `done` is
 * dropped because the public view always shows completed text.
 */
export interface NormalizedTurn {
  mindSlug: string;
  mindName: string;
  round: number;
  text: string;
}

/**
 * Defensive parser for the `turns` JSON column (typed `unknown`).
 *
 * Accepts:
 *   - the live AgoraApp shape: `{ mindSlug, mindName, round, text, done }`
 *   - the seed-script shape:    `{ mindSlug, mindName, round, content }`
 *
 * Anything that does not look like an array of turn-shaped objects is
 * coerced to an empty array — the page falls back to a friendly empty
 * state rather than throwing.
 */
export function normalizeTurns(raw: unknown): NormalizedTurn[] {
  if (!Array.isArray(raw)) return [];
  const out: NormalizedTurn[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const t = item as Record<string, unknown>;
    const mindSlug = typeof t.mindSlug === "string" ? t.mindSlug : "";
    const mindName = typeof t.mindName === "string" ? t.mindName : mindSlug;
    const round = typeof t.round === "number" && Number.isFinite(t.round)
      ? Math.trunc(t.round)
      : 0;
    const text =
      typeof t.text === "string"
        ? t.text
        : typeof t.content === "string"
          ? t.content
          : "";
    if (!mindSlug || !text) continue;
    out.push({ mindSlug, mindName, round, text });
  }
  return out;
}

/**
 * Group turns by round, sorted ascending. Each round preserves the
 * order in which the turns were emitted (council-seat order from the
 * agon engine).
 */
export function groupTurnsByRound(
  turns: NormalizedTurn[],
): { round: number; turns: NormalizedTurn[] }[] {
  const map = new Map<number, NormalizedTurn[]>();
  for (const t of turns) {
    const arr = map.get(t.round) ?? [];
    arr.push(t);
    map.set(t.round, arr);
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([round, list]) => ({ round, turns: list }));
}

/* ── Roman numerals (used for round headers, matches AgoraApp) ── */

export function toRoman(n: number): string {
  if (!Number.isFinite(n) || n < 1) return String(n);
  const map: [number, string][] = [
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let remaining = Math.trunc(n);
  let out = "";
  for (const [v, s] of map) {
    while (remaining >= v) {
      out += s;
      remaining -= v;
    }
  }
  return out;
}

/* ── Research field normalization ───────────────────────────────── */

export interface ResearchBibEntry {
  title: string;
  url: string;
}

export interface NormalizedResearch {
  summary: string;
  sources: ResearchBibEntry[];
}

/**
 * Parse the optional `research` column. The DB stores it as either:
 *   - a JSON string: `{ summary: string, sources: [{title, url}] }`
 *   - a plain summary string (legacy)
 *   - null/empty
 *
 * Returns null when there is no presentable research to show.
 */
export function normalizeResearch(raw: string | null | undefined): NormalizedResearch | null {
  if (!raw) return null;
  // Try JSON first.
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") {
      const obj = parsed as Record<string, unknown>;
      const summary = typeof obj.summary === "string" ? obj.summary.trim() : "";
      const sourcesRaw = Array.isArray(obj.sources) ? obj.sources : [];
      const sources: ResearchBibEntry[] = [];
      for (const s of sourcesRaw) {
        if (!s || typeof s !== "object") continue;
        const title = typeof (s as Record<string, unknown>).title === "string"
          ? ((s as Record<string, unknown>).title as string).trim()
          : "";
        const url = typeof (s as Record<string, unknown>).url === "string"
          ? ((s as Record<string, unknown>).url as string).trim()
          : "";
        if (!title || !url) continue;
        sources.push({ title, url });
      }
      if (!summary && sources.length === 0) return null;
      return { summary, sources };
    }
  } catch {
    // not JSON — fall through to plain-string handling
  }
  const text = raw.trim();
  if (!text) return null;
  return { summary: text, sources: [] };
}

/* ── ConsensusResult presence guard ─────────────────────────────── */

/**
 * The DB stores consensus as JSONB. Anonymous saves and the seed
 * script may leave it null. This guard tells the page whether to
 * render the consensus section at all.
 */
export function hasUsableConsensus(c: ConsensusResult | null | undefined): c is ConsensusResult {
  if (!c || typeof c !== "object") return false;
  return (
    typeof c.points === "string" &&
    typeof c.action === "string" &&
    Array.isArray(c.steps)
  );
}

/* ── OG/Twitter description trimming ───────────────────────────── */

/**
 * Build a short OG/Twitter description from the topic. Twitter cards
 * truncate aggressively at ~200 chars; we trim a touch more
 * conservatively and add an ellipsis when needed.
 */
export function buildShareDescription(topic: string, maxLen = 180): string {
  const t = (topic ?? "").trim().replace(/\s+/g, " ");
  if (!t) return "A debate from Consult The Dead — The Agora.";
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen - 1).trimEnd() + "…";
}

/* ── Highlight insight ──────────────────────────────────────────── */

/**
 * Milestone-driven recap: pick the single most shareable insight from
 * the consensus. Priority order:
 *   1. `action`  — the council's recommended course of action
 *   2. `points`  — the key consensus points
 *   3. `tensions` — if nothing else is usable
 *
 * Returns null when there is no consensus or the fields are blank/short
 * (< 20 chars), so the caller can skip the highlight section cleanly.
 *
 * Truncated to 220 chars so the highlight fits comfortably in a
 * pull-quote card without overflow.
 */
export interface HighlightInsight {
  label: string;
  text: string;
}

const HIGHLIGHT_MIN_LEN = 20;
const HIGHLIGHT_MAX_LEN = 220;

export function extractHighlightInsight(
  consensus: ConsensusResult | null | undefined,
): HighlightInsight | null {
  if (!hasUsableConsensus(consensus)) return null;

  const candidates: Array<{ label: string; text: string }> = [
    { label: "Recommended action", text: consensus.action ?? "" },
    { label: "Key insight", text: consensus.points ?? "" },
    { label: "Live tension", text: consensus.tensions ?? "" },
  ];

  for (const { label, text } of candidates) {
    const trimmed = (text ?? "").trim().replace(/\s+/g, " ");
    if (trimmed.length < HIGHLIGHT_MIN_LEN) continue;
    const excerpt =
      trimmed.length <= HIGHLIGHT_MAX_LEN
        ? trimmed
        : trimmed.slice(0, HIGHLIGHT_MAX_LEN - 1).trimEnd() + "…";
    return { label, text: excerpt };
  }

  return null;
}
