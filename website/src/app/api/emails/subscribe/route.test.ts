/**
 * Tests for POST /api/emails/subscribe
 *
 * Covers:
 *  - Valid email → 200 ok
 *  - Already-subscribed → 200 ok (treated as success)
 *  - Missing email field → 400
 *  - Invalid email format → 400
 *  - Missing JSON body → 400
 *  - Beehiiv env vars not configured → 503
 *  - Beehiiv API returns non-200 → 502
 *  - Correct payload forwarded to subscribeToBeehiiv
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BeehiivSubscribeResult } from "@/lib/emails/beehiiv";

// ──────────────────────────────────────────────────────────────────────────
// Hoisted mock state
// ──────────────────────────────────────────────────────────────────────────

const state = vi.hoisted(() => ({
  result: null as BeehiivSubscribeResult | null,
  lastInput: null as { email: string; utmSource?: string } | null,
  shouldThrow: false,
}));

vi.mock("@/lib/emails/beehiiv", () => ({
  subscribeToBeehiiv: vi.fn(async (input: { email: string; utmSource?: string }) => {
    state.lastInput = input;
    if (state.shouldThrow) throw new Error("network fail");
    return state.result;
  }),
}));

// ──────────────────────────────────────────────────────────────────────────
// Helper
// ──────────────────────────────────────────────────────────────────────────

async function callRoute(body: unknown): Promise<Response> {
  const { POST } = await import("./route");
  const request = new Request("http://localhost/api/emails/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return POST(request);
}

// ──────────────────────────────────────────────────────────────────────────
// Fixtures
// ──────────────────────────────────────────────────────────────────────────

const SUCCESS: BeehiivSubscribeResult = {
  ok: true,
  alreadySubscribed: false,
  subscriberId: "sub_abc123",
  error: null,
};

const ALREADY_SUBSCRIBED: BeehiivSubscribeResult = {
  ok: true,
  alreadySubscribed: true,
  subscriberId: "sub_abc123",
  error: null,
};

const ENV_NOT_CONFIGURED: BeehiivSubscribeResult = {
  ok: false,
  alreadySubscribed: false,
  subscriberId: null,
  error: "BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID not configured",
};

const API_ERROR: BeehiivSubscribeResult = {
  ok: false,
  alreadySubscribed: false,
  subscriberId: null,
  error: "Beehiiv API error (422)",
};

// ──────────────────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────────────────

describe("POST /api/emails/subscribe", () => {
  beforeEach(() => {
    state.result = null;
    state.lastInput = null;
    state.shouldThrow = false;
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("validation", () => {
    it("returns 400 when body is not valid JSON", async () => {
      const { POST } = await import("./route");
      const request = new Request("http://localhost/api/emails/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not json{{{",
      });
      const res = await POST(request);
      expect(res.status).toBe(400);
      const body = (await res.json()) as { ok: boolean; error: string };
      expect(body.ok).toBe(false);
      expect(body.error).toBe("Invalid JSON");
    });

    it("returns 400 when email is missing", async () => {
      state.result = SUCCESS;
      const res = await callRoute({});
      expect(res.status).toBe(400);
      const body = (await res.json()) as { ok: boolean; error: string };
      expect(body.ok).toBe(false);
      expect(body.error).toBe("Missing email");
    });

    it("returns 400 when email is an empty string", async () => {
      state.result = SUCCESS;
      const res = await callRoute({ email: "   " });
      expect(res.status).toBe(400);
      const body = (await res.json()) as { ok: boolean; error: string };
      expect(body.ok).toBe(false);
      expect(body.error).toBe("Missing email");
    });

    it("returns 400 when email format is invalid", async () => {
      state.result = SUCCESS;
      const res = await callRoute({ email: "not-an-email" });
      expect(res.status).toBe(400);
      const body = (await res.json()) as { ok: boolean; error: string };
      expect(body.ok).toBe(false);
      expect(body.error).toBe("Invalid email");
    });
  });

  describe("success paths", () => {
    it("returns 200 ok when Beehiiv subscription succeeds", async () => {
      state.result = SUCCESS;
      const res = await callRoute({ email: "user@example.com" });
      expect(res.status).toBe(200);
      const body = (await res.json()) as { ok: boolean };
      expect(body.ok).toBe(true);
    });

    it("forwards the normalized email and default utmSource to subscribeToBeehiiv", async () => {
      state.result = SUCCESS;
      await callRoute({ email: "  User@Example.COM  " });
      expect(state.lastInput?.email).toBe("user@example.com");
      expect(state.lastInput?.utmSource).toBe("agora");
    });

    it("forwards an explicit utmSource when provided", async () => {
      state.result = SUCCESS;
      await callRoute({ email: "user@example.com", utmSource: "sidebar" });
      expect(state.lastInput?.utmSource).toBe("sidebar");
    });

    it("returns 200 when email is already subscribed", async () => {
      state.result = ALREADY_SUBSCRIBED;
      const res = await callRoute({ email: "existing@example.com" });
      expect(res.status).toBe(200);
      const body = (await res.json()) as { ok: boolean };
      expect(body.ok).toBe(true);
    });
  });

  describe("error paths", () => {
    it("returns 503 when Beehiiv env vars are not configured", async () => {
      state.result = ENV_NOT_CONFIGURED;
      const res = await callRoute({ email: "user@example.com" });
      expect(res.status).toBe(503);
      const body = (await res.json()) as { ok: boolean; error: string };
      expect(body.ok).toBe(false);
      expect(body.error).toBe("Subscription service unavailable");
    });

    it("returns 502 when Beehiiv API returns an error", async () => {
      state.result = API_ERROR;
      const res = await callRoute({ email: "user@example.com" });
      expect(res.status).toBe(502);
      const body = (await res.json()) as { ok: boolean; error: string };
      expect(body.ok).toBe(false);
      expect(body.error).toBe("Subscription service error");
    });
  });
});
