import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSql = vi.fn();
const mockGetAllFrameworks = vi.fn();
const mockGetActivePackMembers = vi.fn();

vi.mock("@vercel/postgres", () => ({
  sql: mockSql,
}));

vi.mock("@/lib/frameworks", () => ({
  getAllFrameworks: mockGetAllFrameworks,
}));

vi.mock("@/lib/packs", () => ({
  PACKS: [
    { id: "alpha", members: ["a"], colorVar: "var(--red)" },
    { id: "beta", members: ["b"], colorVar: "var(--amber)" },
  ],
  getActivePackMembers: mockGetActivePackMembers,
}));

describe("pricing stats loader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds the canonical payload from live framework, pack, and agon counts", async () => {
    mockGetAllFrameworks.mockReturnValue([
      { slug: "sun-tzu" },
      { slug: "marie-curie" },
      { slug: "niccolo-machiavelli" },
    ]);
    mockGetActivePackMembers.mockImplementation((pack: { id: string }) =>
      pack.id === "alpha" ? ["sun-tzu"] : [],
    );
    mockSql.mockResolvedValue({ rows: [{ count: "42" }] });

    const { getPricingStats } = await import("@/lib/pricing/stats");
    const stats = await getPricingStats();

    expect(stats).toEqual({
      frameworkCount: 3,
      activePackCount: 1,
      agonsRun: 42,
      freeAgonsPerDay: 3,
      proAgonsPerMonth: 100,
      proTrialDays: 7,
      proMonthlyPrice: 30,
      proAnnualPrice: 300,
      foundingMemberAnnualPrice: 300,
    });
  });

  it("returns zero active packs when none of the rostered minds are live", async () => {
    mockGetAllFrameworks.mockReturnValue([]);
    mockGetActivePackMembers.mockReturnValue([]);
    mockSql.mockResolvedValue({ rows: [] });

    const { getPricingStats } = await import("@/lib/pricing/stats");
    const stats = await getPricingStats();

    expect(stats).toMatchObject({
      frameworkCount: 0,
      activePackCount: 0,
      agonsRun: 0,
    });
  });

  it("normalizes invalid count payloads to safe integers", async () => {
    mockGetAllFrameworks.mockReturnValue([{ slug: "sun-tzu" }]);
    mockGetActivePackMembers.mockImplementation((pack: { id: string }) =>
      pack.id === "alpha" ? ["sun-tzu"] : [],
    );
    mockSql.mockResolvedValue({ rows: [{ count: "-7" }] });

    const { getPricingStats, buildPricingStats } = await import("@/lib/pricing/stats");

    await expect(getPricingStats()).resolves.toMatchObject({
      agonsRun: 0,
      frameworkCount: 1,
      activePackCount: 1,
    });

    expect(
      buildPricingStats({
        frameworkCount: Number.NaN,
        activePackCount: -2,
        agonsRun: "19" as unknown as number,
      }),
    ).toEqual({
      frameworkCount: 0,
      activePackCount: 0,
      agonsRun: 19,
      freeAgonsPerDay: 3,
      proAgonsPerMonth: 100,
      proTrialDays: 7,
      proMonthlyPrice: 30,
      proAnnualPrice: 300,
      foundingMemberAnnualPrice: 300,
    });
  });

  it("clamps non-number inputs to zero", async () => {
    const { buildPricingStats } = await import("@/lib/pricing/stats");

    expect(
      buildPricingStats({
        frameworkCount: "foo" as unknown as number,
        activePackCount: {} as unknown as number,
        agonsRun: undefined as unknown as number,
      }),
    ).toEqual({
      frameworkCount: 0,
      activePackCount: 0,
      agonsRun: 0,
      freeAgonsPerDay: 3,
      proAgonsPerMonth: 100,
      proTrialDays: 7,
      proMonthlyPrice: 30,
      proAnnualPrice: 300,
      foundingMemberAnnualPrice: 300,
    });
  });
});

describe("stats route", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns the canonical payload on success", async () => {
    mockGetAllFrameworks.mockReturnValue([{ slug: "sun-tzu" }]);
    mockGetActivePackMembers.mockImplementation((pack: { id: string }) =>
      pack.id === "alpha" ? ["sun-tzu"] : [],
    );
    mockSql.mockResolvedValue({ rows: [{ count: 7 }] });

    const { GET } = await import("@/app/api/stats/route");
    const response = await GET();
    const body = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      frameworkCount: 1,
      activePackCount: 1,
      agonsRun: 7,
      freeAgonsPerDay: 3,
      proAgonsPerMonth: 100,
      proTrialDays: 7,
      proMonthlyPrice: 30,
      proAnnualPrice: 300,
      foundingMemberAnnualPrice: 300,
    });
  });

  it("returns 503 when the loader fails", async () => {
    mockGetAllFrameworks.mockImplementation(() => {
      throw new Error("boom");
    });
    mockSql.mockResolvedValue({ rows: [{ count: 0 }] });

    const { GET } = await import("@/app/api/stats/route");
    const response = await GET();
    const body = (await response.json()) as { error?: string };

    expect(response.status).toBe(503);
    expect(body.error).toBe("Unable to load pricing stats");
  });
});
