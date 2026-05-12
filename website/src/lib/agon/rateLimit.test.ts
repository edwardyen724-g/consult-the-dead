/**
 * Comprehensive coverage for website/src/lib/agon/rateLimit.ts
 *
 * Sections:
 *   1. quotaResetAt          — daily and pro branches with date edge-cases
 *   2. getClientIp           — header fallback chain
 *   3. checkRateLimit        — in-memory (no Redis) all allowed/denied paths
 *   4. getUsage              — in-memory all paths
 *   5. checkRateLimit        — Redis-connected (success, denied, error fallback,
 *                              cache-hit, concurrent cachedClientPromise, connect-throw)
 *   6. getUsage              — Redis-connected (value, null, error fallback)
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ─── Redis mock ────────────────────────────────────────────────────────────────
// A single shared mock client object keeps the reference stable across
// vi.resetModules() calls so each test can configure incr/get/etc. via mockReset.
const mockRedisClient = {
  isOpen: true,
  on: vi.fn(),
  connect: vi.fn().mockResolvedValue(undefined),
  incr: vi.fn(),
  expire: vi.fn().mockResolvedValue(1),
  decr: vi.fn().mockResolvedValue(undefined),
  get: vi.fn(),
};

vi.mock("redis", () => ({
  createClient: vi.fn(() => mockRedisClient),
}));

// ─── Static imports (used for in-memory test sections 1-4) ────────────────────
// REDIS_URL is not set in these sections, so getClient() returns null immediately
// and the in-memory Map branches are exercised.
import {
  checkRateLimit,
  getClientIp,
  getUsage,
  quotaResetAt,
  type RateRejectReason,
} from "./rateLimit";

// ══════════════════════════════════════════════════════════════════════════════
// 1. quotaResetAt
// ══════════════════════════════════════════════════════════════════════════════
describe("quotaResetAt", () => {
  afterEach(() => vi.useRealTimers());

  it("returns the next UTC midnight for daily quota reasons (ip, user, global)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-11T10:15:30Z"));

    for (const reason of ["ip", "user", "global"] satisfies RateRejectReason[]) {
      expect(quotaResetAt(reason)).toBe(Date.UTC(2026, 4, 12, 0, 0, 0) / 1000);
    }
  });

  it("returns the first day of the next month at 00:00 UTC for pro", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-11T10:15:30Z"));

    expect(quotaResetAt("pro")).toBe(Date.UTC(2026, 5, 1, 0, 0, 0) / 1000);
  });

  it("handles December → January year rollover for pro", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-12-15T23:59:59Z"));

    expect(quotaResetAt("pro")).toBe(Date.UTC(2027, 0, 1, 0, 0, 0) / 1000);
  });

  it("handles month-end rollover for daily buckets (Jan 31 → Feb 1)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-31T22:00:00Z"));

    expect(quotaResetAt("ip")).toBe(Date.UTC(2026, 1, 1, 0, 0, 0) / 1000);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 2. getClientIp
// ══════════════════════════════════════════════════════════════════════════════
describe("getClientIp", () => {
  function req(headers: Record<string, string>): Request {
    return new Request("https://example.com", { headers });
  }

  it("extracts the first IP from x-forwarded-for when multiple IPs are listed", () => {
    expect(getClientIp(req({ "x-forwarded-for": "1.2.3.4, 5.6.7.8, 9.10.11.12" }))).toBe(
      "1.2.3.4"
    );
  });

  it("extracts a single IP from x-forwarded-for", () => {
    expect(getClientIp(req({ "x-forwarded-for": "9.10.11.12" }))).toBe("9.10.11.12");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    expect(getClientIp(req({ "x-real-ip": "4.5.6.7" }))).toBe("4.5.6.7");
  });

  it("returns 127.0.0.1 when no IP headers are present", () => {
    expect(getClientIp(req({}))).toBe("127.0.0.1");
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. checkRateLimit — in-memory fallback (no REDIS_URL → getClient → null)
// ══════════════════════════════════════════════════════════════════════════════
describe("checkRateLimit (in-memory, no Redis)", () => {
  beforeEach(() => {
    delete process.env.REDIS_URL;
    delete process.env.KV_REST_API_REDIS_URL;
  });

  // ── Pro path ─────────────────────────────────────────────────────────────

  it("allows a pro user who is under the monthly cap", async () => {
    const result = await checkRateLimit({
      userId: "pro-mem-ok-1",
      isPro: true,
      ip: "10.0.0.1",
    });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(99); // PRO_LIMIT_PER_MONTH(100) - 1
    expect(result.reason).toBeUndefined();
  });

  it("denies a pro user who has consumed all 100 monthly requests", async () => {
    const userId = "pro-mem-exhausted-1";
    for (let i = 0; i < 100; i++) {
      await checkRateLimit({ userId, isPro: true, ip: "10.0.0.2" });
    }
    const result = await checkRateLimit({ userId, isPro: true, ip: "10.0.0.2" });
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.reason).toBe("pro");
  });

  // ── Free authenticated-user path ─────────────────────────────────────────

  it("allows an authenticated free user under the daily limit", async () => {
    const result = await checkRateLimit({
      userId: "free-user-mem-ok-1",
      isPro: false,
      ip: "10.0.1.1",
    });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2); // FREE_LIMIT_PER_DAY(3) - 1
  });

  it("denies an authenticated free user who has used all 3 daily requests", async () => {
    const userId = "free-user-mem-exhausted-1";
    for (let i = 0; i < 3; i++) {
      await checkRateLimit({ userId, isPro: false, ip: "10.0.1.2" });
    }
    const result = await checkRateLimit({ userId, isPro: false, ip: "10.0.1.2" });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("user");
  });

  // ── Free anonymous-IP path ────────────────────────────────────────────────

  it("allows an anonymous IP user under the daily limit", async () => {
    const result = await checkRateLimit({ isPro: false, ip: "10.0.2.1" });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("denies an anonymous IP user who has used all 3 daily requests", async () => {
    const ip = "10.0.2.2";
    for (let i = 0; i < 3; i++) {
      await checkRateLimit({ isPro: false, ip });
    }
    const result = await checkRateLimit({ isPro: false, ip });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("ip");
  });

  // ── Global budget path ────────────────────────────────────────────────────

  it("denies when the global free-tier daily budget (60 req/day) is exhausted", async () => {
    // Use a far-future fake date so this test's global counter is isolated from
    // the date-based keys used by the other in-memory tests above.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2099-12-25T12:00:00Z"));
    try {
      // 60 distinct IPs each make 1 request → global counter reaches 60
      for (let i = 0; i < 60; i++) {
        await checkRateLimit({ isPro: false, ip: `10.${Math.floor(i / 255)}.${i % 255 + 1}.1` });
      }
      // The 61st unique IP should be blocked by the global cap
      const result = await checkRateLimit({ isPro: false, ip: "99.99.99.99" });
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("global");
    } finally {
      vi.useRealTimers();
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 4. getUsage — in-memory (no REDIS_URL)
// ══════════════════════════════════════════════════════════════════════════════
describe("getUsage (in-memory, no Redis)", () => {
  beforeEach(() => {
    delete process.env.REDIS_URL;
    delete process.env.KV_REST_API_REDIS_URL;
  });

  it("reports 0 used for a brand-new pro user", async () => {
    const result = await getUsage({ userId: "pro-usage-new-1", isPro: true, ip: "10.1.0.1" });
    expect(result.period).toBe("month");
    expect(result.used).toBe(0);
    expect(result.remaining).toBe(100);
    expect(result.limit).toBe(100);
  });

  it("reports accurate usage after a pro user makes requests", async () => {
    const userId = "pro-usage-active-1";
    await checkRateLimit({ userId, isPro: true, ip: "10.1.0.2" });
    await checkRateLimit({ userId, isPro: true, ip: "10.1.0.2" });
    const result = await getUsage({ userId, isPro: true, ip: "10.1.0.2" });
    expect(result.period).toBe("month");
    expect(result.used).toBe(2);
    expect(result.remaining).toBe(98);
  });

  it("reports 0 used for a brand-new authenticated free user", async () => {
    const result = await getUsage({
      userId: "free-usage-new-1",
      isPro: false,
      ip: "10.1.1.1",
    });
    expect(result.period).toBe("day");
    expect(result.used).toBe(0);
    expect(result.remaining).toBe(3);
    expect(result.limit).toBe(3);
  });

  it("reports accurate usage after a free user makes a request", async () => {
    const userId = "free-usage-active-1";
    await checkRateLimit({ userId, isPro: false, ip: "10.1.1.2" });
    const result = await getUsage({ userId, isPro: false, ip: "10.1.1.2" });
    expect(result.period).toBe("day");
    expect(result.used).toBe(1);
    expect(result.remaining).toBe(2);
  });

  it("reports accurate usage for an anonymous IP user", async () => {
    const ip = "10.1.2.1";
    await checkRateLimit({ isPro: false, ip });
    const result = await getUsage({ isPro: false, ip });
    expect(result.period).toBe("day");
    expect(result.used).toBe(1);
    expect(result.remaining).toBe(2);
  });

  it("reports 0 used for a brand-new anonymous IP user", async () => {
    const result = await getUsage({ isPro: false, ip: "10.1.2.99" });
    expect(result.period).toBe("day");
    expect(result.used).toBe(0);
    expect(result.remaining).toBe(3);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 5. checkRateLimit — Redis-connected path
//    Each test calls vi.resetModules() in beforeEach so the module singleton
//    (cachedClient / cachedClientPromise / memMap) is fresh per test.
// ══════════════════════════════════════════════════════════════════════════════
describe("checkRateLimit (Redis-connected path)", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.REDIS_URL = "redis://mock";
    // Reset all mock fn call state and restore stable defaults
    mockRedisClient.on.mockReset();
    mockRedisClient.connect.mockReset();
    mockRedisClient.incr.mockReset();
    mockRedisClient.expire.mockReset();
    mockRedisClient.decr.mockReset();
    mockRedisClient.get.mockReset();
    mockRedisClient.connect.mockResolvedValue(undefined);
    mockRedisClient.expire.mockResolvedValue(1);
    mockRedisClient.decr.mockResolvedValue(undefined);
  });

  afterEach(() => {
    delete process.env.REDIS_URL;
  });

  // ── Pro path ─────────────────────────────────────────────────────────────

  it("allows a pro user via Redis when under the monthly cap", async () => {
    mockRedisClient.incr.mockResolvedValue(5); // 5th request this month
    const { checkRateLimit: check } = await import("./rateLimit");
    const result = await check({ userId: "pro-redis-ok", isPro: true, ip: "20.0.0.1" });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(95); // 100 - 5
  });

  it("denies a pro user via Redis when the monthly cap is exceeded", async () => {
    mockRedisClient.incr.mockResolvedValue(101); // over the 100 limit
    const { checkRateLimit: check } = await import("./rateLimit");
    const result = await check({ userId: "pro-redis-denied", isPro: true, ip: "20.0.0.2" });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("pro");
    // The counter must be rolled back
    expect(mockRedisClient.decr).toHaveBeenCalledTimes(1);
  });

  it("falls back to in-memory when Redis incr throws during the pro check", async () => {
    mockRedisClient.incr.mockRejectedValue(new Error("Redis connection error"));
    const { checkRateLimit: check } = await import("./rateLimit");
    const result = await check({ userId: "pro-redis-err", isPro: true, ip: "20.0.0.3" });
    // In-memory fallback allows the first request
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(99);
  });

  // ── Free user path ────────────────────────────────────────────────────────

  it("allows a free authenticated user via Redis when under per-user limit", async () => {
    // First incr: per-user counter → 1 (TTL set via expire)
    // Second incr: global counter → 10
    mockRedisClient.incr
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(10);
    const { checkRateLimit: check } = await import("./rateLimit");
    const result = await check({ userId: "free-redis-user-ok", isPro: false, ip: "20.0.1.1" });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2); // FREE_LIMIT_PER_DAY(3) - 1
    // expire called once for the user key (n===1); global key got n=10 so no expire
    expect(mockRedisClient.expire).toHaveBeenCalledTimes(1);
  });

  it("denies a free authenticated user via Redis when per-user cap exceeded", async () => {
    mockRedisClient.incr.mockResolvedValueOnce(4); // > FREE_LIMIT_PER_DAY(3)
    const { checkRateLimit: check } = await import("./rateLimit");
    const result = await check({ userId: "free-redis-user-denied", isPro: false, ip: "20.0.1.2" });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("user");
    expect(mockRedisClient.decr).toHaveBeenCalledTimes(1); // rollback user counter
  });

  // ── Free IP path ──────────────────────────────────────────────────────────

  it("allows a free anonymous IP user via Redis when under both limits", async () => {
    mockRedisClient.incr
      .mockResolvedValueOnce(2)  // per-IP counter → 2 (≤ 3)
      .mockResolvedValueOnce(20); // global counter → 20 (≤ 60)
    const { checkRateLimit: check } = await import("./rateLimit");
    const result = await check({ isPro: false, ip: "20.0.2.1" });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1); // 3 - 2
  });

  it("denies when the global free-tier budget is exhausted via Redis", async () => {
    mockRedisClient.incr
      .mockResolvedValueOnce(1)  // per-IP counter → 1 (≤ 3, OK)
      .mockResolvedValueOnce(61); // global counter → 61 (> 60)
    const { checkRateLimit: check } = await import("./rateLimit");
    const result = await check({ isPro: false, ip: "20.0.2.2" });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("global");
    // Both global and IP counters must be rolled back
    expect(mockRedisClient.decr).toHaveBeenCalledTimes(2);
  });

  it("falls back to in-memory when Redis incr throws during the free check", async () => {
    mockRedisClient.incr.mockRejectedValue(new Error("Redis unavailable"));
    const { checkRateLimit: check } = await import("./rateLimit");
    const result = await check({ isPro: false, ip: "20.0.2.3" });
    // In-memory fallback allows the first request
    expect(result.allowed).toBe(true);
  });

  // ── getClient() caching paths ─────────────────────────────────────────────

  it("reuses the cached Redis client for sequential calls within the same module", async () => {
    mockRedisClient.incr.mockResolvedValue(1);
    const { checkRateLimit: check } = await import("./rateLimit");

    // First call: creates and caches the client (connect called once)
    await check({ userId: "cache-test-1", isPro: false, ip: "20.0.3.1" });
    // Second call: hits the `if (cachedClient && cachedClient.isOpen)` early-return
    await check({ userId: "cache-test-2", isPro: false, ip: "20.0.3.2" });

    // connect() should have been invoked exactly once despite two check() calls
    expect(mockRedisClient.connect).toHaveBeenCalledTimes(1);
  });

  it("returns the same in-flight connection promise for concurrent getClient() calls", async () => {
    // Suspend the connect() so the cachedClientPromise is set but not yet resolved
    // when the second concurrent call also enters getClient().
    let resolveConnect!: () => void;
    mockRedisClient.connect.mockImplementation(
      () => new Promise<void>((r) => { resolveConnect = r; })
    );
    mockRedisClient.incr.mockResolvedValue(1);

    const { checkRateLimit: check } = await import("./rateLimit");

    // Both calls start synchronously; the second one will see cachedClientPromise
    // already set by the first.
    const p1 = check({ isPro: false, ip: "20.0.3.10" });
    const p2 = check({ isPro: false, ip: "20.0.3.11" });

    // Now unblock the connection
    resolveConnect();
    await Promise.all([p1, p2]);

    // connect() called only once despite two concurrent checks sharing the same promise
    expect(mockRedisClient.connect).toHaveBeenCalledTimes(1);
  });

  it("returns null (in-memory fallback) when Redis connect() throws", async () => {
    mockRedisClient.connect.mockRejectedValue(new Error("ECONNREFUSED"));
    const { checkRateLimit: check } = await import("./rateLimit");
    // getClient() should swallow the error and return null → in-memory branch
    const result = await check({ isPro: false, ip: "20.0.3.20" });
    expect(result.allowed).toBe(true); // in-memory allows first request
  });

  it("error handler registered via client.on('error') is callable and silent", async () => {
    mockRedisClient.incr.mockResolvedValue(1);
    const { checkRateLimit: check } = await import("./rateLimit");
    // Establish the connection so client.on("error", ...) is called
    await check({ isPro: false, ip: "20.0.4.1" });

    // Find the registered error handler
    const onCall = mockRedisClient.on.mock.calls.find((c) => c[0] === "error");
    const errorHandler = onCall?.[1] as (err: Error) => void;
    expect(errorHandler).toBeDefined();

    // The handler should be a no-op — calling it should not throw
    expect(() => errorHandler(new Error("test redis error"))).not.toThrow();
  });

  it("uses KV_REST_API_REDIS_URL when REDIS_URL is absent", async () => {
    // Swap to the alternative env var so the redisUrl() OR branch is covered
    delete process.env.REDIS_URL;
    process.env.KV_REST_API_REDIS_URL = "redis://kv-mock";
    mockRedisClient.incr.mockResolvedValue(1);
    const { checkRateLimit: check } = await import("./rateLimit");
    const result = await check({ isPro: false, ip: "20.0.4.2" });
    expect(result.allowed).toBe(true);
    delete process.env.KV_REST_API_REDIS_URL;
  });

  it("denies in the catch block when pro monthly cap is exhausted (Redis down)", async () => {
    // All Redis calls throw → every request goes through the in-memory catch fallback.
    mockRedisClient.incr.mockRejectedValue(new Error("Redis down"));
    const { checkRateLimit: check } = await import("./rateLimit");
    const userId = "catch-pro-exhausted";
    // Exhaust the in-memory fallback limit (100 requests)
    for (let i = 0; i < 100; i++) {
      await check({ userId, isPro: true, ip: "20.0.5.1" });
    }
    const result = await check({ userId, isPro: true, ip: "20.0.5.1" });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("pro");
  });

  it("denies in the catch block when free per-user limit is exhausted (Redis down)", async () => {
    mockRedisClient.incr.mockRejectedValue(new Error("Redis down"));
    const { checkRateLimit: check } = await import("./rateLimit");
    const userId = "catch-user-exhausted";
    for (let i = 0; i < 3; i++) {
      await check({ userId, isPro: false, ip: "20.0.5.2" });
    }
    const result = await check({ userId, isPro: false, ip: "20.0.5.2" });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("user");
  });

  it("denies in the catch block when global budget is exhausted (Redis down)", async () => {
    mockRedisClient.incr.mockRejectedValue(new Error("Redis down"));
    const { checkRateLimit: check } = await import("./rateLimit");
    // 60 unique IPs exhaust the global budget via in-memory catch fallback
    for (let i = 0; i < 60; i++) {
      await check({ isPro: false, ip: `20.0.6.${i + 1}` });
    }
    const result = await check({ isPro: false, ip: "20.0.6.200" });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("global");
  });

  it("reconnectStrategy returns false after >2 retries and a delay otherwise", async () => {
    // Verify the reconnect strategy options passed to createClient cover both
    // branches of the `retries > 2 ? false : 250 * retries` ternary.
    mockRedisClient.incr.mockResolvedValue(1);
    const { checkRateLimit: check } = await import("./rateLimit");
    await check({ isPro: false, ip: "20.0.7.1" }); // triggers createClient

    // Retrieve the reconnectStrategy from the options createClient was called with
    const redisMod = await import("redis");
    const createClientFn = redisMod.createClient as ReturnType<typeof vi.fn>;
    const callOptions = createClientFn.mock.calls.at(-1)?.[0] as {
      socket?: { reconnectStrategy?: (retries: number) => number | false };
    };
    const strategy = callOptions?.socket?.reconnectStrategy;
    expect(strategy).toBeTypeOf("function");

    // Both branches of the ternary inside the strategy:
    expect(strategy!(0)).toBe(0);    // ≤2 retries → delay (0 * 250 = 0)
    expect(strategy!(2)).toBe(500);  // ≤2 retries → delay (2 * 250 = 500)
    expect(strategy!(3)).toBe(false); // >2 retries → stop reconnecting
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 6. getUsage — Redis-connected path
// ══════════════════════════════════════════════════════════════════════════════
describe("getUsage (Redis-connected path)", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.REDIS_URL = "redis://mock";
    mockRedisClient.on.mockReset();
    mockRedisClient.connect.mockReset();
    mockRedisClient.incr.mockReset();
    mockRedisClient.expire.mockReset();
    mockRedisClient.decr.mockReset();
    mockRedisClient.get.mockReset();
    mockRedisClient.connect.mockResolvedValue(undefined);
    mockRedisClient.expire.mockResolvedValue(1);
  });

  afterEach(() => {
    delete process.env.REDIS_URL;
  });

  it("returns pro usage read from Redis", async () => {
    mockRedisClient.get.mockResolvedValue("45");
    const { getUsage: usage } = await import("./rateLimit");
    const result = await usage({ userId: "pro-usage-redis-1", isPro: true, ip: "30.0.0.1" });
    expect(result.period).toBe("month");
    expect(result.used).toBe(45);
    expect(result.remaining).toBe(55);
    expect(result.limit).toBe(100);
  });

  it("returns 0 used when Redis returns null for a pro user", async () => {
    mockRedisClient.get.mockResolvedValue(null);
    const { getUsage: usage } = await import("./rateLimit");
    const result = await usage({ userId: "pro-usage-redis-2", isPro: true, ip: "30.0.0.2" });
    expect(result.used).toBe(0);
    expect(result.remaining).toBe(100);
  });

  it("falls back to in-memory (0 used) when Redis get() throws on the pro path", async () => {
    mockRedisClient.get.mockRejectedValue(new Error("Redis error"));
    const { getUsage: usage } = await import("./rateLimit");
    const result = await usage({ userId: "pro-usage-redis-err", isPro: true, ip: "30.0.0.3" });
    expect(result.period).toBe("month");
    expect(result.used).toBe(0); // memMap is empty for the fresh module
    expect(result.remaining).toBe(100);
  });

  it("returns free authenticated-user usage read from Redis", async () => {
    mockRedisClient.get.mockResolvedValue("2");
    const { getUsage: usage } = await import("./rateLimit");
    const result = await usage({
      userId: "free-usage-redis-1",
      isPro: false,
      ip: "30.0.1.1",
    });
    expect(result.period).toBe("day");
    expect(result.used).toBe(2);
    expect(result.remaining).toBe(1);
    expect(result.limit).toBe(3);
  });

  it("returns free IP usage read from Redis when userId is absent", async () => {
    mockRedisClient.get.mockResolvedValue("1");
    const { getUsage: usage } = await import("./rateLimit");
    const result = await usage({ isPro: false, ip: "30.0.2.1" });
    expect(result.period).toBe("day");
    expect(result.used).toBe(1);
    expect(result.remaining).toBe(2);
  });

  it("falls back to in-memory (0 used) when Redis get() throws on the free path", async () => {
    mockRedisClient.get.mockRejectedValue(new Error("Redis error"));
    const { getUsage: usage } = await import("./rateLimit");
    const result = await usage({ isPro: false, ip: "30.0.2.2" });
    expect(result.period).toBe("day");
    expect(result.used).toBe(0);
    expect(result.remaining).toBe(3);
  });
});
