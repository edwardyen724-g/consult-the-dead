/**
 * Unit tests for the Clerk webhook handler — covering both the funnel
 * `free_signup` instrumentation (capsule 3c20ad0a) and the welcome email
 * wiring via sendWelcome from @/lib/emails (task 94fddecc).
 *
 * Strategy: vitest `vi.mock` is used to stub svix (signature verification),
 * @clerk/nextjs/server, stripe, the welcome-email side effect, and the
 * analytics helper. We then POST fabricated svix headers + a JSON body to
 * the route's `POST` handler and assert how `trackEvent` and `sendWelcome`
 * were invoked.
 *
 * Coverage gate:
 *   1. Happy path — UTM present in publicMetadata → trackEvent called with
 *      {plan:'free', clerk_user_id, utm_source, utm_campaign} populated.
 *   2. Missing-UTM path — no UTM anywhere → trackEvent still called with
 *      utm_source=null, utm_campaign=null (so Vercel still records the
 *      free_signup event; just unattributed).
 *   3. trackEvent failure — analytics throws → webhook still returns 200
 *      (telemetry must never fail the webhook).
 *   4. Unsafe-metadata fallback — UTM in unsafe_metadata when publicMetadata
 *      is empty.
 *   5. Non-user.created events do NOT fire trackEvent.
 *   6. Invalid svix signature returns 400 (regression-guard for the existing
 *      verify path).
 *   7. sendWelcome is called with email + firstName on user.created.
 *   8. sendWelcome failure does not break the webhook (still 200).
 *   9. sendWelcome is NOT called for non-user.created events.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ──────────────────────────────────────────────────────────────────────────
//  Module mocks — must be declared before importing the route handler.
//  vi.mock() is hoisted to file-top, so factory bodies cannot reference
//  module-scope vars. vi.hoisted() lets us share spies between the hoisted
//  mocks and the test bodies.
// ──────────────────────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => ({
  verifyMock: vi.fn(),
  stripeCustomersCreate: vi.fn(),
  updateUserMetadataMock: vi.fn(),
  sendWelcomeMock: vi.fn(),
  trackEventMock: vi.fn(),
}));

vi.mock("svix", () => ({
  Webhook: class {
    verify = mocks.verifyMock;
  },
}));

vi.mock("stripe", () => ({
  default: class {
    customers = { create: mocks.stripeCustomersCreate };
  },
}));

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: vi.fn(async () => ({
    users: { updateUserMetadata: mocks.updateUserMetadataMock },
  })),
}));

vi.mock("@/lib/emails", () => ({
  sendWelcome: mocks.sendWelcomeMock,
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: mocks.trackEventMock,
}));

const {
  verifyMock,
  stripeCustomersCreate,
  updateUserMetadataMock,
  sendWelcomeMock,
  trackEventMock,
} = mocks;

// Now import the handler under test.
import { POST } from "./route";

// ──────────────────────────────────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────────────────────────────────

interface UserCreatedFixtureOpts {
  clerkUserId?: string;
  email?: string;
  firstName?: string | null;
  publicMetadata?: Record<string, unknown>;
  unsafeMetadata?: Record<string, unknown>;
}

function userCreatedEvent(opts: UserCreatedFixtureOpts = {}) {
  const {
    clerkUserId = "user_test_abc",
    email = "buyer@example.com",
    firstName = "Sam",
    publicMetadata,
    unsafeMetadata,
  } = opts;
  return {
    type: "user.created",
    data: {
      id: clerkUserId,
      email_addresses: [{ id: "ea_1", email_address: email }],
      primary_email_address_id: "ea_1",
      first_name: firstName,
      last_name: "Quill",
      public_metadata: publicMetadata,
      unsafe_metadata: unsafeMetadata,
    },
  };
}

function makeRequest(body: unknown): Request {
  return new Request("https://example.com/api/webhooks/clerk", {
    method: "POST",
    headers: {
      "svix-id": "sv_1",
      "svix-timestamp": "1700000000",
      "svix-signature": "v1,sig",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  process.env.CLERK_WEBHOOK_SIGNING_SECRET = "whsec_test";
  process.env.STRIPE_SECRET_KEY = "sk_test";
  verifyMock.mockReset();
  stripeCustomersCreate.mockReset().mockResolvedValue({ id: "cus_test_123" });
  updateUserMetadataMock.mockReset().mockResolvedValue({});
  sendWelcomeMock.mockReset().mockResolvedValue({ ok: true, messageId: "msg_1", dryRun: false });
  trackEventMock.mockReset().mockResolvedValue(true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ──────────────────────────────────────────────────────────────────────────
//  Tests
// ──────────────────────────────────────────────────────────────────────────

describe("POST /api/webhooks/clerk — free_signup funnel instrumentation", () => {
  it("happy path: fires trackEvent('free_signup', {...}) with UTMs from publicMetadata", async () => {
    const fixture = userCreatedEvent({
      clerkUserId: "user_happy",
      publicMetadata: {
        utm_source: "listicle",
        utm_campaign: "longtail_seo",
      },
    });
    verifyMock.mockReturnValue(fixture);

    const res = await POST(makeRequest(fixture) as never);

    expect(res.status).toBe(200);
    expect(trackEventMock).toHaveBeenCalledTimes(1);
    expect(trackEventMock).toHaveBeenCalledWith("free_signup", {
      plan: "free",
      clerk_user_id: "user_happy",
      utm_source: "listicle",
      utm_campaign: "longtail_seo",
    });
  });

  it("missing-UTM path: still fires trackEvent with null utm fields", async () => {
    const fixture = userCreatedEvent({ clerkUserId: "user_no_utm" });
    verifyMock.mockReturnValue(fixture);

    const res = await POST(makeRequest(fixture) as never);

    expect(res.status).toBe(200);
    expect(trackEventMock).toHaveBeenCalledTimes(1);
    expect(trackEventMock).toHaveBeenCalledWith("free_signup", {
      plan: "free",
      clerk_user_id: "user_no_utm",
      utm_source: null,
      utm_campaign: null,
    });
  });

  it("falls back to unsafe_metadata when public_metadata is absent", async () => {
    const fixture = userCreatedEvent({
      clerkUserId: "user_unsafe",
      unsafeMetadata: { utm_source: "twitter", utm_campaign: "launch" },
    });
    verifyMock.mockReturnValue(fixture);

    const res = await POST(makeRequest(fixture) as never);

    expect(res.status).toBe(200);
    expect(trackEventMock).toHaveBeenCalledWith("free_signup", {
      plan: "free",
      clerk_user_id: "user_unsafe",
      utm_source: "twitter",
      utm_campaign: "launch",
    });
  });

  it("public_metadata wins over unsafe_metadata when both are present", async () => {
    const fixture = userCreatedEvent({
      clerkUserId: "user_both",
      publicMetadata: { utm_source: "listicle" },
      unsafeMetadata: { utm_source: "twitter", utm_campaign: "should_lose" },
    });
    verifyMock.mockReturnValue(fixture);

    await POST(makeRequest(fixture) as never);

    expect(trackEventMock).toHaveBeenCalledWith("free_signup", {
      plan: "free",
      clerk_user_id: "user_both",
      utm_source: "listicle",
      utm_campaign: null,
    });
  });

  it("does not let trackEvent failure break the webhook (still 200, customer created)", async () => {
    trackEventMock.mockRejectedValueOnce(new Error("vercel analytics down"));
    const fixture = userCreatedEvent({ clerkUserId: "user_track_fail" });
    verifyMock.mockReturnValue(fixture);

    const res = await POST(makeRequest(fixture) as never);

    expect(res.status).toBe(200);
    // Stripe customer + Clerk metadata update must still have completed.
    expect(stripeCustomersCreate).toHaveBeenCalledTimes(1);
    expect(updateUserMetadataMock).toHaveBeenCalledTimes(1);
  });

  it("does not fire trackEvent for non-user.created events", async () => {
    const fixture = {
      type: "user.updated",
      data: { id: "user_update", email_addresses: [], primary_email_address_id: "" },
    };
    verifyMock.mockReturnValue(fixture);

    const res = await POST(makeRequest(fixture) as never);

    expect(res.status).toBe(200);
    expect(trackEventMock).not.toHaveBeenCalled();
    expect(stripeCustomersCreate).not.toHaveBeenCalled();
  });

  it("returns 400 on invalid svix signature and never fires trackEvent", async () => {
    verifyMock.mockImplementation(() => {
      throw new Error("bad signature");
    });

    const res = await POST(makeRequest({ type: "user.created" }) as never);

    expect(res.status).toBe(400);
    expect(trackEventMock).not.toHaveBeenCalled();
    expect(stripeCustomersCreate).not.toHaveBeenCalled();
  });

  it("returns 400 when svix headers are missing", async () => {
    const req = new Request("https://example.com/api/webhooks/clerk", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await POST(req as never);

    expect(res.status).toBe(400);
    expect(verifyMock).not.toHaveBeenCalled();
    expect(trackEventMock).not.toHaveBeenCalled();
  });
});

describe("POST /api/webhooks/clerk — sendWelcome wiring (task 94fddecc)", () => {
  it("calls sendWelcome with email and firstName on user.created", async () => {
    const fixture = userCreatedEvent({
      clerkUserId: "user_welcome",
      email: "alice@example.com",
      firstName: "Alice",
    });
    verifyMock.mockReturnValue(fixture);

    const res = await POST(makeRequest(fixture) as never);

    expect(res.status).toBe(200);
    expect(sendWelcomeMock).toHaveBeenCalledTimes(1);
    expect(sendWelcomeMock).toHaveBeenCalledWith("alice@example.com", {
      firstName: "Alice",
    });
  });

  it("calls sendWelcome with firstName null when not provided", async () => {
    const fixture = userCreatedEvent({
      clerkUserId: "user_no_name",
      email: "noname@example.com",
      firstName: null,
    });
    verifyMock.mockReturnValue(fixture);

    const res = await POST(makeRequest(fixture) as never);

    expect(res.status).toBe(200);
    expect(sendWelcomeMock).toHaveBeenCalledWith("noname@example.com", {
      firstName: null,
    });
  });

  it("does not let sendWelcome failure break the webhook (still 200)", async () => {
    sendWelcomeMock.mockRejectedValueOnce(new Error("Resend API down"));
    const fixture = userCreatedEvent({ clerkUserId: "user_email_fail" });
    verifyMock.mockReturnValue(fixture);

    const res = await POST(makeRequest(fixture) as never);

    expect(res.status).toBe(200);
    // Stripe customer + Clerk metadata update must still have completed.
    expect(stripeCustomersCreate).toHaveBeenCalledTimes(1);
    expect(updateUserMetadataMock).toHaveBeenCalledTimes(1);
  });

  it("does NOT call sendWelcome for non-user.created events", async () => {
    const fixture = {
      type: "user.updated",
      data: { id: "user_update", email_addresses: [], primary_email_address_id: "" },
    };
    verifyMock.mockReturnValue(fixture);

    const res = await POST(makeRequest(fixture) as never);

    expect(res.status).toBe(200);
    expect(sendWelcomeMock).not.toHaveBeenCalled();
  });
});
