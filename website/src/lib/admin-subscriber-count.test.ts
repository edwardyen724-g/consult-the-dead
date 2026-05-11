import { describe, expect, it, vi } from "vitest";
import { countProSubscribers, isProSubscriber } from "./admin-subscriber-count";

function buildUsers(count: number, proIndices: Set<number>) {
  return Array.from({ length: count }, (_, index) => ({
    publicMetadata: proIndices.has(index)
      ? { subscription_tier: "pro" }
      : { subscription_tier: "free" },
  }));
}

describe("admin subscriber count helpers", () => {
  it("detects pro subscribers from Clerk public metadata", () => {
    expect(isProSubscriber({ publicMetadata: { subscription_tier: "pro" } })).toBe(true);
    expect(isProSubscriber({ publicMetadata: { subscription_tier: "free" } })).toBe(false);
    expect(isProSubscriber({ publicMetadata: {} })).toBe(false);
    expect(isProSubscriber({})).toBe(false);
  });

  it("counts every Clerk user with subscription_tier=pro across pages", async () => {
    const getUserList = vi
      .fn()
      .mockResolvedValueOnce({ data: buildUsers(100, new Set([0, 7, 50, 99])) })
      .mockResolvedValueOnce({ data: buildUsers(100, new Set([1, 33, 88])) })
      .mockResolvedValueOnce({
        data: [
          { publicMetadata: { subscription_tier: "pro" } },
          { publicMetadata: { subscription_tier: "free" } },
          { publicMetadata: {} },
        ],
      });

    const total = await countProSubscribers({
      users: {
        getUserList,
      },
    });

    expect(total).toBe(8);
    expect(getUserList).toHaveBeenNthCalledWith(1, { limit: 100, offset: 0 });
    expect(getUserList).toHaveBeenNthCalledWith(2, { limit: 100, offset: 100 });
    expect(getUserList).toHaveBeenNthCalledWith(3, { limit: 100, offset: 200 });
  });
});
