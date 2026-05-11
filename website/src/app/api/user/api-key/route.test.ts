import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE, GET, POST } from "./route";

const { authMock, clerkClientMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  clerkClientMock: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: authMock,
  clerkClient: clerkClientMock,
}));

function makeClerk() {
  const getUser = vi.fn();
  const updateUserMetadata = vi.fn();
  const clerk = {
    users: {
      getUser,
      updateUserMetadata,
    },
  };
  clerkClientMock.mockResolvedValue(clerk as never);
  return { clerk, getUser, updateUserMetadata };
}

function makeJsonRequest(json: () => Promise<unknown>) {
  return { json } as never;
}

beforeEach(() => {
  authMock.mockReset();
  clerkClientMock.mockReset();
});

describe("/api/user/api-key", () => {
  it("rejects unauthenticated GET requests", async () => {
    authMock.mockResolvedValue({ userId: null });

    const response = await GET();

    expect(response.status).toBe(401);
    expect(clerkClientMock).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("reports hasKey=true when the user has a stored key", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });
    const { getUser } = makeClerk();
    getUser.mockResolvedValue({
      privateMetadata: { anthropic_api_key: "sk-ant-abcdefghijklmnopqrstuvwxyz" },
    });

    const response = await GET();
    const body = await response.json();

    expect(body).toEqual({ hasKey: true });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(getUser).toHaveBeenCalledWith("user_123");
  });

  it("reports hasKey=false when no stored key is present", async () => {
    authMock.mockResolvedValue({ userId: "user_456" });
    const { getUser } = makeClerk();
    getUser.mockResolvedValue({ privateMetadata: {} });

    const response = await GET();
    const body = await response.json();

    expect(body).toEqual({ hasKey: false });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("rejects malformed POST JSON", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });
    makeClerk();

    const response = await POST(
      makeJsonRequest(async () => {
        throw new Error("bad json");
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid JSON body" });
  });

  it("rejects Anthropic keys that fail validation", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });
    const { updateUserMetadata } = makeClerk();

    const response = await POST(
      makeJsonRequest(async () => ({ key: "sk-prod-1234567890" })),
    );

    expect(response.status).toBe(400);
    expect(updateUserMetadata).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        error: expect.stringContaining("sk-ant-"),
      }),
    );
  });

  it("persists a valid key after trimming whitespace", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });
    const { updateUserMetadata } = makeClerk();
    const rawKey = `  sk-ant-${"x".repeat(20)}  `;

    const response = await POST(
      makeJsonRequest(async () => ({ key: rawKey })),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(updateUserMetadata).toHaveBeenCalledWith("user_123", {
      privateMetadata: { anthropic_api_key: `sk-ant-${"x".repeat(20)}` },
    });
  });

  it("rejects unauthenticated DELETE requests", async () => {
    authMock.mockResolvedValue({ userId: null });

    const response = await DELETE();

    expect(response.status).toBe(401);
    expect(clerkClientMock).not.toHaveBeenCalled();
  });

  it("clears the stored key on DELETE", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });
    const { updateUserMetadata } = makeClerk();

    const response = await DELETE();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(updateUserMetadata).toHaveBeenCalledWith("user_123", {
      privateMetadata: { anthropic_api_key: null },
    });
  });
});
