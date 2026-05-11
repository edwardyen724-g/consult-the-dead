import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  clerkClientMock: vi.fn(),
  countProSubscribersMock: vi.fn(),
  readMetricsMock: vi.fn(),
  readTrafficMock: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: mocks.clerkClientMock,
}));

vi.mock("@/lib/admin-subscriber-count", () => ({
  countProSubscribers: mocks.countProSubscribersMock,
}));

vi.mock("@/lib/agon/metrics", () => ({
  readMetrics: mocks.readMetricsMock,
  readTraffic: mocks.readTrafficMock,
}));

import { GET } from "./route";

function makeRequest(url = "https://example.com/api/admin/metrics?days=14") {
  return new Request(url, {
    headers: {
      "x-admin-token": "test-admin-token",
    },
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-05-11T10:00:00.000Z"));
  vi.clearAllMocks();
  process.env.ADMIN_TOKEN = "test-admin-token";

  mocks.clerkClientMock.mockResolvedValue({
    users: {
      getUserList: vi.fn(),
    },
  });
  mocks.readMetricsMock.mockResolvedValue([{ date: "2026-05-10", counters: {}, topics: [] }]);
  mocks.readTrafficMock.mockResolvedValue([{ date: "2026-05-10", totalPageviews: 1, topPaths: [], topReferrers: [] }]);
  mocks.countProSubscribersMock.mockResolvedValue(42);
});

afterEach(() => {
  vi.useRealTimers();
  delete process.env.ADMIN_TOKEN;
});

describe("GET /api/admin/metrics", () => {
  it("returns the existing admin metrics envelope plus the canonical pro subscriber count", async () => {
    const response = await GET(makeRequest() as never);

    expect(response.status).toBe(200);
    expect(mocks.clerkClientMock).toHaveBeenCalledTimes(1);
    expect(mocks.countProSubscribersMock).toHaveBeenCalledTimes(1);
    expect(mocks.readMetricsMock).toHaveBeenCalledWith(14);
    expect(mocks.readTrafficMock).toHaveBeenCalledWith(14);

    const body = (await response.json()) as {
      days: number;
      generatedAt: string;
      pro_subscribers: number;
      metrics: unknown[];
      traffic: unknown[];
    };

    expect(body).toMatchObject({
      days: 14,
      generatedAt: "2026-05-11T10:00:00.000Z",
      pro_subscribers: 42,
      metrics: [{ date: "2026-05-10", counters: {}, topics: [] }],
      traffic: [{ date: "2026-05-10", totalPageviews: 1, topPaths: [], topReferrers: [] }],
    });
  });

  it("rejects requests without the admin token", async () => {
    const response = await GET(
      new Request("https://example.com/api/admin/metrics", {
        headers: {
          "x-admin-token": "wrong-token",
        },
      }) as never
    );

    expect(response.status).toBe(403);
    expect(mocks.clerkClientMock).not.toHaveBeenCalled();
    expect(mocks.countProSubscribersMock).not.toHaveBeenCalled();
    expect(mocks.readMetricsMock).not.toHaveBeenCalled();
    expect(mocks.readTrafficMock).not.toHaveBeenCalled();
  });
});
