import { createClient, type RedisClientType } from "redis";

/* ───────────────────────────── Limits ─────────────────────────────
 * IP daily cap     — anonymous visitors, scoped by IP + UTC date.
 * User daily cap   — authenticated free users, scoped by userId + date.
 * Pro monthly cap  — pro subscribers, scoped by userId + YYYY-MM.
 * Global daily     — hard ceiling across all free-tier agons per day;
 *                    protects the server key from IP-rotation attacks.
 *                    Pro agons do not consume from this budget.
 * ────────────────────────────────────────────────────────────────── */
const FREE_LIMIT_PER_DAY = 3;
const PRO_LIMIT_PER_MONTH = 100;
const GLOBAL_DAILY_BUDGET = 60;

const TTL_DAILY = 36 * 3600;       // safe margin past midnight UTC
const TTL_MONTHLY = 35 * 24 * 3600; // safe margin past end of month

export type RateRejectReason = "ip" | "user" | "pro" | "global";

export interface RateCheck {
  allowed: boolean;
  remaining: number;
  reason?: RateRejectReason;
}

export interface RateLimitContext {
  userId?: string | null;
  isPro: boolean;
  ip: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function thisMonth(): string {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

function ipKey(ip: string, date: string): string {
  return `agon:rl:ip:${ip}:${date}`;
}

function userKey(userId: string, date: string): string {
  return `agon:rl:user:${userId}:${date}`;
}

function proKey(userId: string, month: string): string {
  return `agon:rl:pro:${userId}:${month}`;
}

function globalKey(date: string): string {
  return `agon:rl:global:${date}`;
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

/* In-memory fallback for when Redis is unavailable. Resets on cold start. */
const memMap = new Map<string, number>();

function memInc(key: string): number {
  const v = (memMap.get(key) ?? 0) + 1;
  memMap.set(key, v);
  return v;
}

function memDec(key: string): void {
  memMap.set(key, Math.max(0, (memMap.get(key) ?? 0) - 1));
}

async function redisIncExpire(
  client: RedisClientType,
  key: string,
  ttl: number
): Promise<number> {
  const n = await client.incr(key);
  if (n === 1) await client.expire(key, ttl);
  return n;
}

/* ── Pro path: monthly cap only, no global budget consumed ── */
async function checkProLimit(userId: string): Promise<RateCheck> {
  const pk = proKey(userId, thisMonth());
  const client = await getClient();

  if (!client) {
    const n = memInc(pk);
    if (n > PRO_LIMIT_PER_MONTH) { memDec(pk); return { allowed: false, remaining: 0, reason: "pro" }; }
    return { allowed: true, remaining: PRO_LIMIT_PER_MONTH - n };
  }

  try {
    const n = await redisIncExpire(client, pk, TTL_MONTHLY);
    if (n > PRO_LIMIT_PER_MONTH) {
      await client.decr(pk);
      return { allowed: false, remaining: 0, reason: "pro" };
    }
    return { allowed: true, remaining: PRO_LIMIT_PER_MONTH - n };
  } catch {
    const n = memInc(pk);
    if (n > PRO_LIMIT_PER_MONTH) { memDec(pk); return { allowed: false, remaining: 0, reason: "pro" }; }
    return { allowed: true, remaining: PRO_LIMIT_PER_MONTH - n };
  }
}

/* ── Free path: per-subject daily limit + global budget ── */
async function checkFreeLimit(
  limitKey: string,
  rejectReason: "ip" | "user"
): Promise<RateCheck> {
  const date = today();
  const gK = globalKey(date);
  const client = await getClient();

  if (!client) {
    const n = memInc(limitKey);
    if (n > FREE_LIMIT_PER_DAY) { memDec(limitKey); return { allowed: false, remaining: 0, reason: rejectReason }; }
    const g = memInc(gK);
    if (g > GLOBAL_DAILY_BUDGET) { memDec(gK); memDec(limitKey); return { allowed: false, remaining: 0, reason: "global" }; }
    return { allowed: true, remaining: FREE_LIMIT_PER_DAY - n };
  }

  try {
    const n = await redisIncExpire(client, limitKey, TTL_DAILY);
    if (n > FREE_LIMIT_PER_DAY) {
      await client.decr(limitKey);
      return { allowed: false, remaining: 0, reason: rejectReason };
    }
    const g = await redisIncExpire(client, gK, TTL_DAILY);
    if (g > GLOBAL_DAILY_BUDGET) {
      await client.decr(gK);
      await client.decr(limitKey);
      return { allowed: false, remaining: 0, reason: "global" };
    }
    return { allowed: true, remaining: FREE_LIMIT_PER_DAY - n };
  } catch {
    const n = memInc(limitKey);
    if (n > FREE_LIMIT_PER_DAY) { memDec(limitKey); return { allowed: false, remaining: 0, reason: rejectReason }; }
    const g = memInc(gK);
    if (g > GLOBAL_DAILY_BUDGET) { memDec(gK); memDec(limitKey); return { allowed: false, remaining: 0, reason: "global" }; }
    return { allowed: true, remaining: FREE_LIMIT_PER_DAY - n };
  }
}

/* ── Main export ── */
export async function checkRateLimit(ctx: RateLimitContext): Promise<RateCheck> {
  const { userId, isPro, ip } = ctx;

  if (isPro && userId) {
    return checkProLimit(userId);
  }

  const date = today();
  if (userId) {
    return checkFreeLimit(userKey(userId, date), "user");
  }
  return checkFreeLimit(ipKey(ip, date), "ip");
}

/* ── Read-only usage query (does NOT increment) ── */
export interface UsageInfo {
  used: number;
  limit: number;
  remaining: number;
  period: "month" | "day";
}

export async function getUsage(ctx: { userId?: string | null; isPro: boolean; ip: string }): Promise<UsageInfo> {
  const { userId, isPro, ip } = ctx;

  if (isPro && userId) {
    const pk = proKey(userId, thisMonth());
    const client = await getClient();
    let used = 0;
    if (client) {
      try {
        const val = await client.get(pk);
        used = val ? parseInt(val, 10) : 0;
      } catch {
        used = memMap.get(pk) ?? 0;
      }
    } else {
      used = memMap.get(pk) ?? 0;
    }
    return { used, limit: PRO_LIMIT_PER_MONTH, remaining: Math.max(0, PRO_LIMIT_PER_MONTH - used), period: "month" };
  }

  const date = today();
  const key = userId ? userKey(userId, date) : ipKey(ip, date);
  const client = await getClient();
  let used = 0;
  if (client) {
    try {
      const val = await client.get(key);
      used = val ? parseInt(val, 10) : 0;
    } catch {
      used = memMap.get(key) ?? 0;
    }
  } else {
    used = memMap.get(key) ?? 0;
  }
  return { used, limit: FREE_LIMIT_PER_DAY, remaining: Math.max(0, FREE_LIMIT_PER_DAY - used), period: "day" };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "127.0.0.1";
}
