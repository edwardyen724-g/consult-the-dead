import { createClient, type RedisClientType } from "redis";

/* ───────────────────────────── Limits ─────────────────────────────
 * Per-IP daily cap: how many free agons a single IP can run in a day.
 *   Tuned with the principle that a curious visitor should be able to
 *   run a few different decisions before having to add a key.
 *
 * Global daily budget: a hard ceiling on free-tier agons across ALL
 *   IPs in a given UTC day. Protects the server-side Anthropic key
 *   from being drained by an attacker rotating IPs (VPN, proxy pool).
 *   At ~$0.30/agon, 60 agons ≈ $18/day worst case.
 * ────────────────────────────────────────────────────────────────── */
const FREE_LIMIT_PER_DAY = 3;
const GLOBAL_DAILY_BUDGET = 60;

const TTL_SECONDS = 36 * 3600; // safe margin past midnight UTC

export type RateRejectReason = "ip" | "global";

export interface RateCheck {
  allowed: boolean;
  remaining: number;
  reason?: RateRejectReason;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function ipKey(ip: string, date: string): string {
  return `agon:rl:ip:${ip}:${date}`;
}

function globalKey(date: string): string {
  return `agon:rl:global:${date}`;
}

function redisUrl(): string | undefined {
  // Vercel's Redis Cloud marketplace integration sets this var when
  // the prefix is KV_REST_API. Falls back to bare REDIS_URL for local
  // dev / other Redis providers.
  return process.env.KV_REST_API_REDIS_URL || process.env.REDIS_URL;
}

/* Cached client across serverless warm invocations. We only attempt
   to connect once per process; on cold starts a new connect is paid. */
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
          // Don't retry forever — fail fast so we fall back to memory.
          reconnectStrategy: (retries) => (retries > 2 ? false : 250 * retries),
          connectTimeout: 3000,
        },
      });
      client.on("error", () => {
        // Swallow; getClient() returns null on failed connect.
      });
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

/* In-memory fallback used when Redis is unavailable (local dev or
   transient outage). Resets on process restart. */
const memMap = new Map<string, number>();

function memIncrement(key: string): number {
  const next = (memMap.get(key) ?? 0) + 1;
  memMap.set(key, next);
  return next;
}

function memDecrement(key: string): void {
  const curr = memMap.get(key) ?? 0;
  memMap.set(key, Math.max(0, curr - 1));
}

async function checkAndIncrementMem(ip: string): Promise<RateCheck> {
  const date = today();
  const ipK = ipKey(ip, date);
  const gK = globalKey(date);

  const ipCount = memIncrement(ipK);
  if (ipCount > FREE_LIMIT_PER_DAY) {
    memDecrement(ipK);
    return { allowed: false, remaining: 0, reason: "ip" };
  }
  const globalCount = memIncrement(gK);
  if (globalCount > GLOBAL_DAILY_BUDGET) {
    memDecrement(gK);
    memDecrement(ipK);
    return { allowed: false, remaining: 0, reason: "global" };
  }
  return { allowed: true, remaining: FREE_LIMIT_PER_DAY - ipCount };
}

/* Atomic check-and-increment for both per-IP and global counters.
   Returns { allowed: false } and rolls back the counter if the cap
   would be exceeded. */
export async function checkAndIncrement(ip: string): Promise<RateCheck> {
  const date = today();
  const ipK = ipKey(ip, date);
  const gK = globalKey(date);

  const client = await getClient();
  if (!client) {
    return checkAndIncrementMem(ip);
  }

  try {
    const ipCount = await client.incr(ipK);
    if (ipCount === 1) await client.expire(ipK, TTL_SECONDS);
    if (ipCount > FREE_LIMIT_PER_DAY) {
      await client.decr(ipK);
      return { allowed: false, remaining: 0, reason: "ip" };
    }

    const globalCount = await client.incr(gK);
    if (globalCount === 1) await client.expire(gK, TTL_SECONDS);
    if (globalCount > GLOBAL_DAILY_BUDGET) {
      await client.decr(gK);
      await client.decr(ipK);
      return { allowed: false, remaining: 0, reason: "global" };
    }

    return { allowed: true, remaining: FREE_LIMIT_PER_DAY - ipCount };
  } catch {
    // Redis hiccup — fall back to memory rather than blocking the user.
    return checkAndIncrementMem(ip);
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "127.0.0.1";
}
