import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const redisMocks = vi.hoisted(() => {
  const mockClient = {
    connect: vi.fn(),
    incrBy: vi.fn(),
    expire: vi.fn(),
    incr: vi.fn(),
    hIncrBy: vi.fn(),
    hGetAll: vi.fn(),
    mGet: vi.fn(),
    get: vi.fn(),
    lPush: vi.fn(),
    lTrim: vi.fn(),
    lRange: vi.fn(),
    on: vi.fn(),
    isOpen: true,
  };

  const createClientMock = vi.fn(() => mockClient);

  return {
    mockClient,
    createClientMock,
  };
});

vi.mock("redis", () => ({
  createClient: redisMocks.createClientMock,
}));

async function loadMetricsModule() {
  return await import("./metrics");
}

async function flushAsyncWork() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

describe("agon metrics helpers", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-10T12:00:00.000Z"));

    process.env.KV_REST_API_REDIS_URL = "redis://example";
    delete process.env.REDIS_URL;

    redisMocks.mockClient.connect.mockResolvedValue(undefined);
    redisMocks.mockClient.incrBy.mockImplementation(async (_key, by) => by);
    redisMocks.mockClient.expire.mockResolvedValue(1);
  });

  afterEach(() => {
    vi.useRealTimers();
    delete process.env.KV_REST_API_REDIS_URL;
    delete process.env.REDIS_URL;
  });

  it("keys anonymous agon counters by date and counter name, including mind slugs", async () => {
    const { bumpCounter, bumpMind } = await loadMetricsModule();

    bumpCounter("agons_started", 2);
    bumpMind("isaac-newton");
    await flushAsyncWork();

    expect(redisMocks.createClientMock).toHaveBeenCalledTimes(1);
    expect(redisMocks.mockClient.connect).toHaveBeenCalledTimes(1);
    expect(redisMocks.mockClient.incrBy).toHaveBeenCalledWith(
      "metrics:2026-05-10:agons_started",
      2,
    );
    expect(redisMocks.mockClient.incrBy).toHaveBeenCalledWith(
      "metrics:2026-05-10:mind:isaac-newton",
      1,
    );
    expect(redisMocks.mockClient.expire).toHaveBeenCalledWith(
      "metrics:2026-05-10:agons_started",
      expect.any(Number),
    );
    expect(redisMocks.mockClient.expire).toHaveBeenCalledWith(
      "metrics:2026-05-10:mind:isaac-newton",
      expect.any(Number),
    );
  });

  it("swallows Redis write failures in the fire-and-forget path", async () => {
    redisMocks.mockClient.incrBy.mockRejectedValue(new Error("redis down"));

    const { bumpCounter } = await loadMetricsModule();

    expect(() => {
      bumpCounter("agons_started");
    }).not.toThrow();

    await flushAsyncWork();

    expect(redisMocks.mockClient.incrBy).toHaveBeenCalledWith(
      "metrics:2026-05-10:agons_started",
      1,
    );
    expect(redisMocks.mockClient.expire).not.toHaveBeenCalled();
  });
});
