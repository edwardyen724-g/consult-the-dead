import { createClient, type RedisClientType } from "redis";

/* Anonymous usage metrics for the agon. We instrument enough to learn
   what decisions people bring and where they drop off, without storing
   any PII (no names, emails, IPs, user agents). */

const TTL_DAYS = 30;
const TTL_SECONDS = TTL_DAYS * 24 * 3600;

// Cap how many topic strings we keep per day so a viral spike can't
// explode Redis memory. 1000 / day is plenty for early-stage traffic.
const TOPICS_PER_DAY_CAP = 1000;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function counterKey(date: string, name: string): string {
  return `metrics:${date}:${name}`;
}

function topicsKey(date: string): string {
  return `metrics:${date}:topics`;
}

function redisUrl(): string | undefined {
  return process.env.KV_REST_API_REDIS_URL || process.env.REDIS_URL;
}

let cachedClient: RedisClientType | null = null;
let cachedClientPromise: Promise<RedisClientType | null> | null = null;

async function getClient(): Promise<RedisClientType | null> {
  if (cachedClient && cachedClient.isOpen) return cachedClient;
  if (cachedClientPromise) return cachedClientPromise;
  const url = redisUrl();
  if (!url) return null;
  cachedClientPromise = (async () => {
    try {
      const client: RedisClientType = createClient({
        url,
        socket: {
          reconnectStrategy: (retries) => (retries > 2 ? false : 250 * retries),
          connectTimeout: 3000,
        },
      });
      client.on("error", () => {});
      await client.connect();
      cachedClient = client;
      return client;
    } catch {
      cachedClient = null;
      cachedClientPromise = null;
      return null;
    }
  })();
  return cachedClientPromise;
}

/* Fire-and-forget counter increment. Failures are silent — metrics
   shouldn't break the user-facing path. */
export function bumpCounter(name: string, by = 1): void {
  void (async () => {
    const client = await getClient();
    if (!client) return;
    try {
      const k = counterKey(today(), name);
      const n = await client.incrBy(k, by);
      if (n === by) await client.expire(k, TTL_SECONDS);
    } catch {
      // swallow
    }
  })();
}

export function bumpMind(slug: string): void {
  bumpCounter(`mind:${slug}`);
}

interface TopicLogEntry {
  topic: string;
  minds: string[];
  byo: boolean;
  ts: number;
}

/* Log the user's decision text + selected council. Strictly anonymous —
   no IP, no user agent, no fingerprint. The privacy disclosure on the
   topic stage covers this. */
export function logTopic(entry: TopicLogEntry): void {
  void (async () => {
    const client = await getClient();
    if (!client) return;
    try {
      const k = topicsKey(today());
      // Truncate topic to 500 chars to keep memory bounded; the agon
      // engine already enforces 2000 max.
      const safe: TopicLogEntry = {
        topic: entry.topic.slice(0, 500),
        minds: entry.minds.slice(0, 5),
        byo: !!entry.byo,
        ts: Date.now(),
      };
      await client.lPush(k, JSON.stringify(safe));
      await client.lTrim(k, 0, TOPICS_PER_DAY_CAP - 1);
      await client.expire(k, TTL_SECONDS);
    } catch {
      // swallow
    }
  })();
}

/* ───────────────────────────── Read API ───────────────────────────── */

export interface DayMetrics {
  date: string;
  counters: Record<string, number>;
  topics: TopicLogEntry[];
}

function dateNDaysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

export async function readMetrics(days: number): Promise<DayMetrics[]> {
  const client = await getClient();
  if (!client) return [];

  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) dates.push(dateNDaysAgo(i));

  // Known counter names we care about. We probe a fixed set rather than
  // SCAN-ning so the report is shape-stable.
  const baseCounters = [
    "agons_started",
    "agons_completed",
    "agons_errored",
    "byo_key_used",
    "rate_limited_ip",
    "rate_limited_global",
  ];
  const mindCounters = [
    "isaac-newton",
    "marie-curie",
    "niccolo-machiavelli",
    "nikola-tesla",
    "leonardo-da-vinci",
    "sun-tzu",
    "marcus-aurelius",
  ].map((s) => `mind:${s}`);
  const allCounterNames = [...baseCounters, ...mindCounters];

  const out: DayMetrics[] = [];
  for (const date of dates) {
    const counterKeys = allCounterNames.map((n) => counterKey(date, n));
    const values = await client.mGet(counterKeys);
    const counters: Record<string, number> = {};
    allCounterNames.forEach((name, i) => {
      const v = values[i];
      counters[name] = v ? parseInt(v, 10) || 0 : 0;
    });

    let topics: TopicLogEntry[] = [];
    try {
      const raw = await client.lRange(topicsKey(date), 0, -1);
      topics = raw
        .map((s) => {
          try {
            return JSON.parse(s) as TopicLogEntry;
          } catch {
            return null;
          }
        })
        .filter((e): e is TopicLogEntry => !!e);
    } catch {
      topics = [];
    }

    out.push({ date, counters, topics });
  }
  return out;
}
