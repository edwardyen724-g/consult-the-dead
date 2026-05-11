/**
 * Pure library used by ./pull-metrics.ts. Holds the report-shape types
 * plus the Stripe / Vercel fetch + classify logic. No process-level
 * side effects, no top-level fetch calls — everything is dependency-
 * injected via the Fetcher and Clock interfaces so unit tests can
 * exercise the full flow without network.
 *
 * The CLI shim lives in ./pull-metrics.ts (the file AR runs). See the
 * package README for usage and env-var contract.
 */

export interface PayingUsers {
  total: number;
  monthly: number;
  annual: number;
  founding: number;
}

export interface AcquisitionChannel {
  utm_source: string;
  sessions: number;
  conversions: number;
}

export interface NotableChannel {
  utm_source: string;
  reason: string;
  sessions: number;
  conversions: number;
}

export interface FounderCheckpointReport {
  generatedAt: string;
  paying_users: PayingUsers | null;
  acquisition_channels: AcquisitionChannel[];
  notable_channels: NotableChannel[];
  missing_credentials?: string[];
  errors?: string[];
}

export interface EnvLike {
  STRIPE_SECRET_KEY?: string;
  STRIPE_PRICE_MONTHLY?: string;
  STRIPE_PRICE_ANNUAL?: string;
  STRIPE_PRICE_FOUNDING?: string;
  VERCEL_TOKEN?: string;
  VERCEL_PROJECT_ID?: string;
  VERCEL_TEAM_ID?: string;
}

export type Fetcher = (
  url: string,
  init?: { method?: string; headers?: Record<string, string>; body?: string }
) => Promise<{
  ok: boolean;
  status: number;
  statusText: string;
  json: () => Promise<unknown>;
  text: () => Promise<string>;
}>;

export interface Clock {
  nowISO(): string;
}

export const REQUIRED_ENV_FOR_LIVE = [
  "STRIPE_SECRET_KEY",
  "STRIPE_PRICE_MONTHLY",
  "STRIPE_PRICE_ANNUAL",
  "VERCEL_TOKEN",
  "VERCEL_PROJECT_ID",
] as const;

/**
 * Returns the list of required env-var names that are unset/empty in `env`.
 * STRIPE_PRICE_FOUNDING and VERCEL_TEAM_ID are optional and never reported.
 */
export function checkMissingCredentials(env: EnvLike): string[] {
  const missing: string[] = [];
  for (const key of REQUIRED_ENV_FOR_LIVE) {
    const v = env[key];
    if (typeof v !== "string" || v.trim().length === 0) missing.push(key);
  }
  return missing;
}

/**
 * Empty stub report — used when credentials are missing OR every fetch
 * fails. Always returns a fully-populated, schema-conforming object so
 * downstream consumers (AR markdown template) can rely on shape.
 */
export function buildStubReport(
  generatedAt: string,
  missingCredentials: string[],
  errors: string[] = []
): FounderCheckpointReport {
  const out: FounderCheckpointReport = {
    generatedAt,
    paying_users: null,
    acquisition_channels: [],
    notable_channels: [],
  };
  if (missingCredentials.length > 0) out.missing_credentials = missingCredentials;
  if (errors.length > 0) out.errors = errors;
  return out;
}

interface StripeSubscriptionItem {
  price?: {
    id?: string;
    recurring?: { interval?: string };
  };
}

interface StripeSubscription {
  id: string;
  status: string;
  items?: { data?: StripeSubscriptionItem[] };
}

interface StripeListPage {
  data: StripeSubscription[];
  has_more: boolean;
}

/**
 * Classify a Stripe subscription as monthly | annual | founding | other.
 * Priority: explicit price-id env-var match > recurring.interval heuristic.
 */
export function classifySubscription(
  sub: StripeSubscription,
  env: EnvLike
): "monthly" | "annual" | "founding" | "other" {
  const item = sub.items?.data?.[0];
  const priceId = item?.price?.id;
  if (priceId) {
    if (env.STRIPE_PRICE_FOUNDING && priceId === env.STRIPE_PRICE_FOUNDING) return "founding";
    if (env.STRIPE_PRICE_ANNUAL && priceId === env.STRIPE_PRICE_ANNUAL) return "annual";
    if (env.STRIPE_PRICE_MONTHLY && priceId === env.STRIPE_PRICE_MONTHLY) return "monthly";
  }
  const interval = item?.price?.recurring?.interval;
  if (interval === "year") return "annual";
  if (interval === "month") return "monthly";
  return "other";
}

/**
 * Tally an array of Stripe subscriptions into the PayingUsers shape.
 */
export function tallyPayingUsers(
  subs: StripeSubscription[],
  env: EnvLike
): PayingUsers {
  const tally: PayingUsers = { total: 0, monthly: 0, annual: 0, founding: 0 };
  for (const sub of subs) {
    if (sub.status !== "active" && sub.status !== "trialing") continue;
    tally.total += 1;
    const bucket = classifySubscription(sub, env);
    if (bucket === "monthly") tally.monthly += 1;
    else if (bucket === "annual") tally.annual += 1;
    else if (bucket === "founding") tally.founding += 1;
  }
  return tally;
}

/**
 * Fetch *all* active subscriptions from Stripe via the REST API. Walks
 * pagination via `starting_after` until `has_more` is false. Throws on
 * any non-2xx response — the caller is responsible for catching and
 * folding the error into the report's `errors` field.
 */
export async function fetchStripeSubscriptions(
  apiKey: string,
  fetcher: Fetcher
): Promise<StripeSubscription[]> {
  const all: StripeSubscription[] = [];
  let startingAfter: string | undefined;
  // Hard cap to prevent runaway loops if the API returns unbounded has_more.
  for (let page = 0; page < 50; page++) {
    const params = new URLSearchParams({
      status: "active",
      limit: "100",
      "expand[]": "data.items.data.price",
    });
    if (startingAfter) params.set("starting_after", startingAfter);
    const url = `https://api.stripe.com/v1/subscriptions?${params.toString()}`;
    const res = await fetcher(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Stripe-Version": "2024-10-28.acacia",
      },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`stripe ${res.status} ${res.statusText}: ${body.slice(0, 200)}`);
    }
    const json = (await res.json()) as StripeListPage;
    if (!json || !Array.isArray(json.data)) {
      throw new Error("stripe: malformed list response (no data array)");
    }
    all.push(...json.data);
    if (!json.has_more || json.data.length === 0) break;
    startingAfter = json.data[json.data.length - 1].id;
  }
  return all;
}

interface VercelInsightRow {
  utm_source?: string | null;
  source?: string | null;
  visitors?: number;
  sessions?: number;
  views?: number;
  conversions?: number;
}

interface VercelInsightResponse {
  data?: VercelInsightRow[];
  rows?: VercelInsightRow[];
}

/**
 * Fetch top utm_source rows for the last `lookbackDays` days from
 * Vercel Web Analytics. Vercel's analytics API surface is not
 * exhaustively public-stable, so this implementation:
 *   1. Calls the documented insights endpoint.
 *   2. Tolerates either `data` or `rows` array shapes.
 *   3. Coerces session/conversion numbers; missing fields default to 0.
 *
 * If the response is malformed or returns 4xx/5xx, throws — caller
 * folds into `errors`.
 */
export async function fetchVercelChannels(
  token: string,
  projectId: string,
  teamId: string | undefined,
  fetcher: Fetcher,
  lookbackDays = 30,
  clock: Clock = defaultClock
): Promise<AcquisitionChannel[]> {
  const now = new Date(clock.nowISO()).getTime();
  const since = new Date(now - lookbackDays * 24 * 60 * 60 * 1000).toISOString();
  const until = new Date(now).toISOString();
  const params = new URLSearchParams({
    projectId,
    from: since,
    to: until,
    breakdown: "utm_source",
  });
  if (teamId) params.set("teamId", teamId);
  const url = `https://api.vercel.com/v1/web/insights/breakdown?${params.toString()}`;
  const res = await fetcher(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`vercel ${res.status} ${res.statusText}: ${body.slice(0, 200)}`);
  }
  const json = (await res.json()) as VercelInsightResponse;
  const rows = json?.data ?? json?.rows ?? [];
  if (!Array.isArray(rows)) {
    throw new Error("vercel: malformed response (no data/rows array)");
  }
  return rows
    .map((r) => {
      const source = (r.utm_source ?? r.source ?? "(none)") as string;
      const sessions = numOr(r.sessions ?? r.visitors ?? r.views, 0);
      const conversions = numOr(r.conversions, 0);
      return { utm_source: source || "(none)", sessions, conversions };
    })
    .filter((c) => c.sessions > 0 || c.conversions > 0)
    .sort((a, b) => b.sessions - a.sessions);
}

function numOr(v: unknown, fallback: number): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const parsed = Number(v);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

/**
 * Highlight channels worth flagging in the founder retro:
 *   - sessions >= 500 (meaningful volume)
 *   - conversion rate >= 5% (efficient, even if low volume)
 *   - utm_source matching distribution-lever campaigns we care about
 */
export function detectNotableChannels(channels: AcquisitionChannel[]): NotableChannel[] {
  const out: NotableChannel[] = [];
  const distributionLevers = new Set([
    "show_hn",
    "hn",
    "hackernews",
    "producthunt",
    "twitter",
    "reddit",
    "linkedin",
    "agon_share",
    "share",
    "mind_page",
    "listicle",
  ]);
  for (const c of channels) {
    const reasons: string[] = [];
    const cvRate = c.sessions > 0 ? c.conversions / c.sessions : 0;
    if (c.sessions >= 500) reasons.push(`high volume (${c.sessions} sessions)`);
    if (cvRate >= 0.05 && c.conversions > 0) {
      reasons.push(`high CVR (${(cvRate * 100).toFixed(1)}%)`);
    }
    if (distributionLevers.has(c.utm_source.toLowerCase())) {
      reasons.push("distribution-lever channel");
    }
    if (reasons.length > 0) {
      out.push({
        utm_source: c.utm_source,
        sessions: c.sessions,
        conversions: c.conversions,
        reason: reasons.join("; "),
      });
    }
  }
  return out;
}

/** Default Clock implementation that reads the system clock. */
export const defaultClock: Clock = {
  nowISO: () => new Date().toISOString(),
};

/* c8 ignore start -- thin wrapper over global fetch; exercised at runtime
 * when AR runs the CLI live. Substituted via the Fetcher injection point
 * in every unit test. */
/** Default Fetcher implementation that wraps the global `fetch`. */
export const defaultFetcher: Fetcher = async (url, init) => {
  const res = await fetch(url, init as RequestInit | undefined);
  return {
    ok: res.ok,
    status: res.status,
    statusText: res.statusText,
    json: () => res.json(),
    text: () => res.text(),
  };
};
/* c8 ignore stop */

/**
 * End-to-end report builder. Always resolves (never throws) and always
 * returns a schema-conforming object — partial failures land in
 * `errors[]` so AR sees what didn't load.
 */
export async function buildReport(
  env: EnvLike,
  fetcher: Fetcher = defaultFetcher,
  clock: Clock = defaultClock
): Promise<FounderCheckpointReport> {
  const generatedAt = clock.nowISO();
  const missing = checkMissingCredentials(env);
  if (missing.length > 0) {
    return buildStubReport(generatedAt, missing);
  }

  const errors: string[] = [];
  let payingUsers: PayingUsers | null = null;
  try {
    const subs = await fetchStripeSubscriptions(env.STRIPE_SECRET_KEY!, fetcher);
    payingUsers = tallyPayingUsers(subs, env);
  } catch (err) {
    errors.push(`stripe: ${(err as Error).message}`);
  }

  let channels: AcquisitionChannel[] = [];
  try {
    channels = await fetchVercelChannels(
      env.VERCEL_TOKEN!,
      env.VERCEL_PROJECT_ID!,
      env.VERCEL_TEAM_ID,
      fetcher,
      30,
      clock
    );
  } catch (err) {
    errors.push(`vercel: ${(err as Error).message}`);
  }

  const report: FounderCheckpointReport = {
    generatedAt,
    paying_users: payingUsers,
    acquisition_channels: channels,
    notable_channels: detectNotableChannels(channels),
  };
  if (errors.length > 0) report.errors = errors;
  return report;
}

// CLI bootstrap lives in ./pull-metrics.ts so this module remains a
// pure library — easy to import from tests and from any future
// orchestration without process-level side effects.
