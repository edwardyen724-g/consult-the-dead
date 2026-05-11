/**
 * Vitest contract tests for the founder-checkpoint metrics-pull library.
 *
 * These tests assert the JSON-shape contract AR depends on, with all
 * Stripe/Vercel I/O mocked via an injected Fetcher. No live API calls.
 *
 * The CLI shim (./pull-metrics.ts) is intentionally NOT imported here —
 * importing it would trigger its top-level main() bootstrap. The shim
 * is excluded from the coverage scope and is exercised by AR's manual
 * smoke run on 2026-05-19.
 *
 * Run:
 *   bash scripts/founder-checkpoint/run-tests.sh
 *   bash scripts/founder-checkpoint/run-tests.sh --coverage
 */
import { describe, it, expect } from "vitest";
import {
  buildReport,
  buildStubReport,
  checkMissingCredentials,
  classifySubscription,
  defaultClock,
  detectNotableChannels,
  fetchStripeSubscriptions,
  fetchVercelChannels,
  tallyPayingUsers,
  REQUIRED_ENV_FOR_LIVE,
  type EnvLike,
  type Fetcher,
  type FounderCheckpointReport,
  type Clock,
} from "./metrics";

const fixedClock: Clock = { nowISO: () => "2026-05-19T12:00:00.000Z" };

const FULL_ENV: EnvLike = {
  STRIPE_SECRET_KEY: "sk_test_xxx",
  STRIPE_PRICE_MONTHLY: "price_monthly_pro",
  STRIPE_PRICE_ANNUAL: "price_annual_pro",
  STRIPE_PRICE_FOUNDING: "price_founding",
  VERCEL_TOKEN: "vc_test_token",
  VERCEL_PROJECT_ID: "prj_abc",
  VERCEL_TEAM_ID: "team_xyz",
};

/** Build a Fetcher that returns canned responses keyed by URL substring. */
function mockFetcher(routes: Array<{ match: string; status?: number; body: unknown }>): Fetcher {
  return async (url) => {
    const route = routes.find((r) => url.includes(r.match));
    if (!route) {
      return {
        ok: false,
        status: 404,
        statusText: "Not Found (no mock route)",
        json: async () => ({}),
        text: async () => "",
      };
    }
    const status = route.status ?? 200;
    const ok = status >= 200 && status < 300;
    const bodyText = typeof route.body === "string" ? route.body : JSON.stringify(route.body);
    return {
      ok,
      status,
      statusText: ok ? "OK" : "Error",
      json: async () => (typeof route.body === "string" ? JSON.parse(route.body) : route.body),
      text: async () => bodyText,
    };
  };
}

const STRIPE_FIXTURE = {
  data: [
    {
      id: "sub_1",
      status: "active",
      items: { data: [{ price: { id: "price_monthly_pro", recurring: { interval: "month" } } }] },
    },
    {
      id: "sub_2",
      status: "active",
      items: { data: [{ price: { id: "price_annual_pro", recurring: { interval: "year" } } }] },
    },
    {
      id: "sub_3",
      status: "active",
      items: { data: [{ price: { id: "price_annual_pro", recurring: { interval: "year" } } }] },
    },
    {
      id: "sub_4",
      status: "active",
      items: { data: [{ price: { id: "price_founding", recurring: { interval: "year" } } }] },
    },
    {
      // Subscription with unknown price id but yearly cadence — should fall
      // back to "annual" via the recurring.interval heuristic.
      id: "sub_5",
      status: "active",
      items: { data: [{ price: { id: "price_unknown", recurring: { interval: "year" } } }] },
    },
    {
      // Canceled subs are excluded from totals.
      id: "sub_canceled",
      status: "canceled",
      items: { data: [{ price: { id: "price_monthly_pro", recurring: { interval: "month" } } }] },
    },
  ],
  has_more: false,
};

const VERCEL_FIXTURE = {
  data: [
    { utm_source: "show_hn", sessions: 1200, conversions: 84 },
    { utm_source: "twitter", sessions: 350, conversions: 11 },
    { utm_source: "(none)", sessions: 980, conversions: 4 },
    { utm_source: "newsletter", sessions: 60, conversions: 7 }, // 11.6% CVR
    { utm_source: "ignored_zero", sessions: 0, conversions: 0 }, // filtered out
  ],
};

describe("checkMissingCredentials", () => {
  it("returns every required key when env is empty", () => {
    expect(checkMissingCredentials({})).toEqual([...REQUIRED_ENV_FOR_LIVE]);
  });

  it("returns empty list when all required keys are present", () => {
    expect(checkMissingCredentials(FULL_ENV)).toEqual([]);
  });

  it("treats whitespace-only env values as missing", () => {
    expect(
      checkMissingCredentials({ ...FULL_ENV, STRIPE_SECRET_KEY: "   " })
    ).toContain("STRIPE_SECRET_KEY");
  });

  it("ignores optional keys (FOUNDING, TEAM_ID)", () => {
    const partial: EnvLike = { ...FULL_ENV };
    delete partial.STRIPE_PRICE_FOUNDING;
    delete partial.VERCEL_TEAM_ID;
    expect(checkMissingCredentials(partial)).toEqual([]);
  });
});

describe("buildStubReport", () => {
  it("conforms to the report schema with empty arrays + null paying_users", () => {
    const r = buildStubReport("2026-05-19T00:00:00.000Z", ["STRIPE_SECRET_KEY"]);
    expect(r.generatedAt).toBe("2026-05-19T00:00:00.000Z");
    expect(r.paying_users).toBeNull();
    expect(r.acquisition_channels).toEqual([]);
    expect(r.notable_channels).toEqual([]);
    expect(r.missing_credentials).toEqual(["STRIPE_SECRET_KEY"]);
    expect(r.errors).toBeUndefined();
  });

  it("omits missing_credentials when none provided and includes errors when given", () => {
    const r = buildStubReport("2026-05-19T00:00:00.000Z", [], ["boom"]);
    expect(r.missing_credentials).toBeUndefined();
    expect(r.errors).toEqual(["boom"]);
  });
});

describe("classifySubscription", () => {
  it("matches explicit founding price id", () => {
    expect(
      classifySubscription(
        { id: "x", status: "active", items: { data: [{ price: { id: "price_founding" } }] } },
        FULL_ENV
      )
    ).toBe("founding");
  });

  it("matches annual price id", () => {
    expect(
      classifySubscription(
        { id: "x", status: "active", items: { data: [{ price: { id: "price_annual_pro" } }] } },
        FULL_ENV
      )
    ).toBe("annual");
  });

  it("matches monthly price id", () => {
    expect(
      classifySubscription(
        { id: "x", status: "active", items: { data: [{ price: { id: "price_monthly_pro" } }] } },
        FULL_ENV
      )
    ).toBe("monthly");
  });

  it("falls back to recurring.interval when price id is unknown", () => {
    expect(
      classifySubscription(
        {
          id: "x",
          status: "active",
          items: { data: [{ price: { id: "unknown", recurring: { interval: "month" } } }] },
        },
        FULL_ENV
      )
    ).toBe("monthly");
    expect(
      classifySubscription(
        {
          id: "x",
          status: "active",
          items: { data: [{ price: { id: "unknown", recurring: { interval: "year" } } }] },
        },
        FULL_ENV
      )
    ).toBe("annual");
  });

  it("returns 'other' when nothing matches", () => {
    expect(classifySubscription({ id: "x", status: "active" }, FULL_ENV)).toBe("other");
    expect(
      classifySubscription(
        { id: "x", status: "active", items: { data: [{ price: { id: "??", recurring: { interval: "week" } } }] } },
        FULL_ENV
      )
    ).toBe("other");
  });
});

describe("tallyPayingUsers", () => {
  it("counts active+trialing only and splits by plan", () => {
    const t = tallyPayingUsers(STRIPE_FIXTURE.data, FULL_ENV);
    // 1 monthly + 2 annual + 1 founding + 1 fallback-annual = 5; canceled excluded.
    expect(t.total).toBe(5);
    expect(t.monthly).toBe(1);
    expect(t.annual).toBe(3); // 2 explicit + 1 fallback
    expect(t.founding).toBe(1);
  });

  it("counts trialing as paying", () => {
    const t = tallyPayingUsers(
      [
        {
          id: "tr",
          status: "trialing",
          items: { data: [{ price: { id: "price_monthly_pro" } }] },
        },
      ],
      FULL_ENV
    );
    expect(t.total).toBe(1);
    expect(t.monthly).toBe(1);
  });

  it("returns zeroed shape for empty input", () => {
    expect(tallyPayingUsers([], FULL_ENV)).toEqual({ total: 0, monthly: 0, annual: 0, founding: 0 });
  });

  it("counts subscriptions classified as 'other' toward total but not any plan bucket", () => {
    const t = tallyPayingUsers(
      [
        // Unknown price id with weekly cadence — falls into "other".
        {
          id: "weird",
          status: "active",
          items: { data: [{ price: { id: "p_unknown", recurring: { interval: "week" } } }] },
        },
      ],
      FULL_ENV
    );
    expect(t).toEqual({ total: 1, monthly: 0, annual: 0, founding: 0 });
  });
});

describe("fetchStripeSubscriptions", () => {
  it("walks pagination via starting_after until has_more=false", async () => {
    const calls: string[] = [];
    const fetcher: Fetcher = async (url) => {
      calls.push(url);
      const isFirst = !url.includes("starting_after");
      const body = isFirst
        ? {
            data: [{ id: "sub_a", status: "active", items: { data: [] } }],
            has_more: true,
          }
        : { data: [{ id: "sub_b", status: "active", items: { data: [] } }], has_more: false };
      return {
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => body,
        text: async () => JSON.stringify(body),
      };
    };
    const subs = await fetchStripeSubscriptions("sk_test", fetcher);
    expect(subs.map((s) => s.id)).toEqual(["sub_a", "sub_b"]);
    expect(calls.length).toBe(2);
    expect(calls[1]).toContain("starting_after=sub_a");
  });

  it("throws on non-2xx with status + message body", async () => {
    const fetcher = mockFetcher([{ match: "subscriptions", status: 401, body: "unauth" }]);
    await expect(fetchStripeSubscriptions("sk_bad", fetcher)).rejects.toThrow(/stripe 401/);
  });

  it("throws when response lacks data array", async () => {
    const fetcher = mockFetcher([{ match: "subscriptions", body: { not_data: true } }]);
    await expect(fetchStripeSubscriptions("sk_test", fetcher)).rejects.toThrow(/malformed/);
  });

  it("tolerates res.text() rejection in stripe error path (defensive catch)", async () => {
    const fetcher: Fetcher = async () => ({
      ok: false,
      status: 502,
      statusText: "Bad Gateway",
      json: async () => ({}),
      text: async () => {
        throw new Error("body read failed");
      },
    });
    await expect(fetchStripeSubscriptions("sk_test", fetcher)).rejects.toThrow(/stripe 502/);
  });

  it("stops when an empty page slips through has_more=true", async () => {
    let n = 0;
    const fetcher: Fetcher = async () => {
      n += 1;
      const body = { data: [], has_more: true };
      return {
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => body,
        text: async () => JSON.stringify(body),
      };
    };
    const subs = await fetchStripeSubscriptions("sk_test", fetcher);
    expect(subs).toEqual([]);
    expect(n).toBe(1);
  });
});

describe("fetchVercelChannels", () => {
  it("returns sorted, filtered acquisition channels", async () => {
    const fetcher = mockFetcher([{ match: "vercel.com", body: VERCEL_FIXTURE }]);
    const channels = await fetchVercelChannels(
      "tok",
      "prj_abc",
      "team_xyz",
      fetcher,
      30,
      fixedClock
    );
    // ignored_zero is filtered out.
    expect(channels.map((c) => c.utm_source)).toEqual([
      "show_hn",
      "(none)",
      "twitter",
      "newsletter",
    ]);
    for (const c of channels) {
      expect(typeof c.sessions).toBe("number");
      expect(typeof c.conversions).toBe("number");
    }
  });

  it("tolerates response.rows shape as well as response.data", async () => {
    const fetcher = mockFetcher([
      { match: "vercel.com", body: { rows: [{ source: "x", sessions: 5, conversions: 1 }] } },
    ]);
    const c = await fetchVercelChannels("t", "p", undefined, fetcher, 30, fixedClock);
    expect(c).toEqual([{ utm_source: "x", sessions: 5, conversions: 1 }]);
  });

  it("coerces string-typed numeric fields", async () => {
    const fetcher = mockFetcher([
      { match: "vercel.com", body: { data: [{ utm_source: "x", sessions: "42", conversions: "3" }] } },
    ]);
    const c = await fetchVercelChannels("t", "p", undefined, fetcher, 30, fixedClock);
    expect(c[0]).toEqual({ utm_source: "x", sessions: 42, conversions: 3 });
  });

  it("uses default '(none)' when utm_source missing", async () => {
    const fetcher = mockFetcher([
      { match: "vercel.com", body: { data: [{ sessions: 9 }] } },
    ]);
    const c = await fetchVercelChannels("t", "p", undefined, fetcher, 30, fixedClock);
    expect(c[0].utm_source).toBe("(none)");
  });

  it("falls back to visitors and then views when sessions is missing", async () => {
    const fetcher = mockFetcher([
      {
        match: "vercel.com",
        body: {
          data: [
            { utm_source: "via_visitors", visitors: 12, conversions: 1 },
            { utm_source: "via_views", views: 3, conversions: 1 },
          ],
        },
      },
    ]);
    const c = await fetchVercelChannels("t", "p", undefined, fetcher, 30, fixedClock);
    const keyed = Object.fromEntries(c.map((x) => [x.utm_source, x.sessions]));
    expect(keyed.via_visitors).toBe(12);
    expect(keyed.via_views).toBe(3);
  });

  it("returns empty list when response carries neither data nor rows (uses default [])", async () => {
    const fetcher = mockFetcher([{ match: "vercel.com", body: {} }]);
    const c = await fetchVercelChannels("t", "p", undefined, fetcher, 30, fixedClock);
    expect(c).toEqual([]);
  });

  it("treats unparseable string numerics as zero (numOr fallback)", async () => {
    const fetcher = mockFetcher([
      { match: "vercel.com", body: { data: [{ utm_source: "x", sessions: "not-a-number", conversions: 4 }] } },
    ]);
    const c = await fetchVercelChannels("t", "p", undefined, fetcher, 30, fixedClock);
    // sessions=0 and conversions=4 — kept because conversions > 0.
    expect(c[0]).toEqual({ utm_source: "x", sessions: 0, conversions: 4 });
  });

  it("treats null utm_source as '(none)' and coerces empty string source", async () => {
    const fetcher = mockFetcher([
      {
        match: "vercel.com",
        body: { data: [{ utm_source: null, source: "", sessions: 1, conversions: 0 }] },
      },
    ]);
    const c = await fetchVercelChannels("t", "p", undefined, fetcher, 30, fixedClock);
    expect(c[0].utm_source).toBe("(none)");
  });

  it("throws on non-2xx", async () => {
    const fetcher = mockFetcher([{ match: "vercel.com", status: 500, body: "boom" }]);
    await expect(
      fetchVercelChannels("t", "p", undefined, fetcher, 30, fixedClock)
    ).rejects.toThrow(/vercel 500/);
  });

  it("tolerates res.text() rejection in vercel error path (defensive catch)", async () => {
    const fetcher: Fetcher = async () => ({
      ok: false,
      status: 503,
      statusText: "Unavailable",
      json: async () => ({}),
      text: async () => {
        throw new Error("body read failed");
      },
    });
    await expect(
      fetchVercelChannels("t", "p", undefined, fetcher, 30, fixedClock)
    ).rejects.toThrow(/vercel 503/);
  });

  it("throws when response is malformed", async () => {
    const fetcher = mockFetcher([{ match: "vercel.com", body: { data: "not-an-array" } }]);
    await expect(
      fetchVercelChannels("t", "p", undefined, fetcher, 30, fixedClock)
    ).rejects.toThrow(/malformed/);
  });

  it("includes teamId in URL when provided", async () => {
    let captured = "";
    const fetcher: Fetcher = async (url) => {
      captured = url;
      return {
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({ data: [] }),
        text: async () => "{}",
      };
    };
    await fetchVercelChannels("t", "p", "team_zzz", fetcher, 30, fixedClock);
    expect(captured).toContain("teamId=team_zzz");
  });
});

describe("detectNotableChannels", () => {
  it("flags high-volume, high-CVR, and lever channels", () => {
    const notable = detectNotableChannels([
      { utm_source: "show_hn", sessions: 1200, conversions: 84 }, // volume + lever
      { utm_source: "newsletter", sessions: 60, conversions: 7 }, // high CVR
      { utm_source: "noise", sessions: 1, conversions: 0 }, // ignored
    ]);
    const keyed = Object.fromEntries(notable.map((n) => [n.utm_source, n.reason]));
    expect(keyed.show_hn).toMatch(/high volume/);
    expect(keyed.show_hn).toMatch(/distribution-lever/);
    expect(keyed.newsletter).toMatch(/high CVR/);
    expect(keyed.noise).toBeUndefined();
  });

  it("returns empty array when nothing notable", () => {
    expect(detectNotableChannels([{ utm_source: "x", sessions: 10, conversions: 0 }])).toEqual([]);
  });

  it("matches lever names case-insensitively", () => {
    const notable = detectNotableChannels([
      { utm_source: "ProductHunt", sessions: 50, conversions: 2 },
    ]);
    expect(notable[0]?.reason).toMatch(/distribution-lever/);
  });

  it("does not divide by zero when sessions=0 (CVR rule never fires)", () => {
    expect(detectNotableChannels([{ utm_source: "x", sessions: 0, conversions: 100 }])).toEqual([]);
  });
});

describe("buildReport (stub mode)", () => {
  it("returns stub report with missing_credentials when env is empty", async () => {
    const r = await buildReport({}, mockFetcher([]), fixedClock);
    expect(r.generatedAt).toBe("2026-05-19T12:00:00.000Z");
    expect(r.paying_users).toBeNull();
    expect(r.acquisition_channels).toEqual([]);
    expect(r.notable_channels).toEqual([]);
    expect(r.missing_credentials).toEqual([...REQUIRED_ENV_FOR_LIVE]);
  });
});

describe("buildReport (full happy path)", () => {
  it("emits a fully-populated, schema-conforming report", async () => {
    const fetcher = mockFetcher([
      { match: "api.stripe.com", body: STRIPE_FIXTURE },
      { match: "api.vercel.com", body: VERCEL_FIXTURE },
    ]);
    const report = await buildReport(FULL_ENV, fetcher, fixedClock);

    // Top-level shape contract.
    const expectedKeys = ["generatedAt", "paying_users", "acquisition_channels", "notable_channels"];
    for (const k of expectedKeys) expect(report).toHaveProperty(k);
    expect(report.missing_credentials).toBeUndefined();
    expect(report.errors).toBeUndefined();

    expect(report.generatedAt).toBe("2026-05-19T12:00:00.000Z");

    // paying_users sub-shape.
    expect(report.paying_users).toEqual({
      total: 5,
      monthly: 1,
      annual: 3,
      founding: 1,
    });

    // acquisition_channels — items have the right shape.
    expect(report.acquisition_channels.length).toBeGreaterThan(0);
    for (const c of report.acquisition_channels) {
      expect(c).toEqual(
        expect.objectContaining({
          utm_source: expect.any(String),
          sessions: expect.any(Number),
          conversions: expect.any(Number),
        })
      );
    }

    // notable_channels has a 'reason' string in addition.
    for (const n of report.notable_channels) {
      expect(typeof n.reason).toBe("string");
      expect(n.reason.length).toBeGreaterThan(0);
    }
    expect(report.notable_channels.find((n) => n.utm_source === "show_hn")).toBeTruthy();
  });
});

describe("buildReport (partial failure)", () => {
  it("populates errors[] when stripe fails but vercel succeeds", async () => {
    const fetcher = mockFetcher([
      { match: "api.stripe.com", status: 500, body: "down" },
      { match: "api.vercel.com", body: VERCEL_FIXTURE },
    ]);
    const r = await buildReport(FULL_ENV, fetcher, fixedClock);
    expect(r.paying_users).toBeNull();
    expect(r.acquisition_channels.length).toBeGreaterThan(0);
    expect(r.errors?.[0]).toMatch(/^stripe:/);
  });

  it("populates errors[] when vercel fails but stripe succeeds", async () => {
    const fetcher = mockFetcher([
      { match: "api.stripe.com", body: STRIPE_FIXTURE },
      { match: "api.vercel.com", status: 401, body: "unauth" },
    ]);
    const r = await buildReport(FULL_ENV, fetcher, fixedClock);
    expect(r.paying_users?.total).toBe(5);
    expect(r.acquisition_channels).toEqual([]);
    expect(r.errors?.[0]).toMatch(/^vercel:/);
  });
});

describe("defaultClock", () => {
  it("returns an ISO 8601 timestamp parseable by Date", () => {
    const iso = defaultClock.nowISO();
    expect(typeof iso).toBe("string");
    expect(Number.isNaN(Date.parse(iso))).toBe(false);
  });
});

describe("smoke-stub fixture", () => {
  it("matches the stub-mode output (modulo generatedAt)", async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = await import("node:fs");
    const path = await import("node:path");
    const url = await import("node:url");
    const here = path.dirname(url.fileURLToPath(import.meta.url));
    const fixturePath = path.join(here, "fixtures", "smoke-stub.json");
    const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
    const live = await buildReport({}, mockFetcher([]), fixedClock);
    // Strip the timestamp before comparing — fixture has a fixed value.
    delete (live as Partial<FounderCheckpointReport>).generatedAt;
    delete fixture.generatedAt;
    expect(live).toEqual(fixture);
  });
});

describe("JSON-shape contract (snapshot of stub)", () => {
  it("stub mode is JSON.stringify-able and round-trippable", async () => {
    const r = await buildReport({}, mockFetcher([]), fixedClock);
    const json = JSON.stringify(r);
    const parsed = JSON.parse(json) as FounderCheckpointReport;
    expect(parsed).toEqual(r);
  });
});
