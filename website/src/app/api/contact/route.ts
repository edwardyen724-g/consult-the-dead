import { sql, type VercelPoolClient } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ContactBody = {
  name?: string;
  email?: string;
  decision?: string;
};

type ThrottleBucket = {
  count: number;
  resetAt: number;
};

type DbClient = VercelPoolClient;
type DatabaseThrottleResult = {
  allowed: boolean;
  source: "ip" | "email" | null;
  remaining: number;
};

const CONTACT_IP_LIMIT = 5;
const CONTACT_EMAIL_LIMIT = 3;
const CONTACT_IP_WINDOW_MS = 60 * 60 * 1000;
const CONTACT_EMAIL_WINDOW_MS = 24 * 60 * 60 * 1000;
const DISCORD_TIMEOUT_MS = 5_000;

const localThrottle = new Map<string, ThrottleBucket>();

function jsonError(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status });
}

function normalizeInput(value: string | undefined, maxLength: number) {
  return (value ?? "").trim().slice(0, maxLength);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "unknown";
}

function throttleKey(kind: "ip" | "email", value: string) {
  return `contact:${kind}:${value.toLowerCase()}`;
}

function consumeLocalThrottle(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = localThrottle.get(key);
  if (!bucket || bucket.resetAt <= now) {
    const freshBucket = { count: 1, resetAt: now + windowMs };
    localThrottle.set(key, freshBucket);
    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      resetAt: freshBucket.resetAt,
    };
  }

  const nextCount = bucket.count + 1;
  bucket.count = nextCount;

  return {
    allowed: nextCount <= limit,
    remaining: Math.max(0, limit - nextCount),
    resetAt: bucket.resetAt,
  };
}

async function ensureSubmissionTableOnClient(client: DbClient) {
  await client.sql`
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      decision TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      user_agent TEXT,
      delivery_state TEXT NOT NULL DEFAULT 'queued',
      delivery_error TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}

async function countRecentIpSubmissions(client: DbClient, ip: string) {
  const result = await client.sql`
    SELECT COUNT(*)::int AS count
    FROM contact_submissions
    WHERE ip_address = ${ip}
      AND created_at >= now() - interval '1 hour'
  `;
  return ((result.rows[0] as { count?: number } | undefined)?.count ?? 0) as number;
}

async function countRecentEmailSubmissions(client: DbClient, email: string) {
  const result = await client.sql`
    SELECT COUNT(*)::int AS count
    FROM contact_submissions
    WHERE email = ${email}
      AND created_at >= now() - interval '1 day'
  `;
  return ((result.rows[0] as { count?: number } | undefined)?.count ?? 0) as number;
}

async function lockThrottleBuckets(client: DbClient, ip: string, email: string) {
  await client.sql`
    SELECT pg_advisory_xact_lock(hashtext(${throttleKey("ip", ip)})::bigint)
  `;
  await client.sql`
    SELECT pg_advisory_xact_lock(hashtext(${throttleKey("email", email)})::bigint)
  `;
}

async function checkDatabaseThrottle(
  client: DbClient,
  ip: string,
  email: string,
): Promise<DatabaseThrottleResult> {
  const ipCount = await countRecentIpSubmissions(client, ip);
  const emailCount = await countRecentEmailSubmissions(client, email);
  return {
    allowed: ipCount < CONTACT_IP_LIMIT && emailCount < CONTACT_EMAIL_LIMIT,
    source:
      ipCount >= CONTACT_IP_LIMIT
        ? ("ip" as const)
        : emailCount >= CONTACT_EMAIL_LIMIT
          ? ("email" as const)
          : null,
    remaining:
      ipCount >= CONTACT_IP_LIMIT
        ? 0
        : emailCount >= CONTACT_EMAIL_LIMIT
          ? 0
          : Math.min(CONTACT_IP_LIMIT - ipCount, CONTACT_EMAIL_LIMIT - emailCount),
  };
}

async function storeSubmission(
  client: DbClient,
  params: {
    name: string;
    email: string;
    decision: string;
    ip: string;
    userAgent: string;
  },
) {
  const result = await client.sql`
    INSERT INTO contact_submissions (
      name,
      email,
      decision,
      ip_address,
      user_agent,
      delivery_state
    )
    VALUES (
      ${params.name},
      ${params.email},
      ${params.decision},
      ${params.ip},
      ${params.userAgent},
      'queued'
    )
    RETURNING id
  `;

  return (result.rows[0] as { id?: string } | undefined)?.id ?? null;
}

async function runDatabaseThrottle<T>(
  handler: (client: DbClient) => Promise<T>,
) {
  const client = await sql.connect();
  try {
    await client.sql`BEGIN`;
    const result = await handler(client);
    await client.sql`COMMIT`;
    return result;
  } catch (error) {
    try {
      await client.sql`ROLLBACK`;
    } catch {
      // Best-effort rollback. The request still fails, but the connection is
      // released below either way.
    }
    throw error;
  } finally {
    client.release();
  }
}

class ContactThrottleExceeded extends Error {
  constructor(
    public readonly throttle: DatabaseThrottleResult,
  ) {
    super("Contact throttle exceeded");
    this.name = "ContactThrottleExceeded";
    Object.setPrototypeOf(this, ContactThrottleExceeded.prototype);
  }
}

async function updateSubmissionState(
  id: string | null,
  state: "delivered" | "stored_only" | "failed",
  error: string | null,
) {
  if (!id) return;
  try {
    await sql`
      UPDATE contact_submissions
      SET delivery_state = ${state},
          delivery_error = ${error}
      WHERE id = ${id}
    `;
  } catch {
    // The submission is already stored. This update is best-effort only.
  }
}

export function __resetContactThrottleForTests() {
  localThrottle.clear();
}

async function postDiscordWebhook(payload: Record<string, unknown>) {
  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) {
    return { sent: false, reason: "missing_webhook" as const };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DISCORD_TIMEOUT_MS);

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return {
        sent: false,
        reason: "webhook_failed" as const,
        status: response.status,
        body,
      };
    }

    return { sent: true as const };
  } catch (error) {
    return {
      sent: false,
      reason: (error instanceof DOMException && error.name === "AbortError")
        ? ("webhook_timeout" as const)
        : ("webhook_threw" as const),
      error,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return jsonError(400, "Invalid request");
  }

  const name = normalizeInput(body.name, 200);
  const email = normalizeInput(body.email, 200).toLowerCase();
  const decision = normalizeInput(body.decision, 1500);

  if (!name || !email || !decision) {
    return jsonError(400, "Missing fields");
  }

  if (!isValidEmail(email)) {
    return jsonError(400, "Invalid email");
  }

  const ip = getClientIp(request);
  const userAgent = normalizeInput(request.headers.get("user-agent") ?? undefined, 500);
  let storedSubmissionId: string | null = null;
  let stored = false;
  let throttleError = false;

  try {
    storedSubmissionId = await runDatabaseThrottle(async (client) => {
      await ensureSubmissionTableOnClient(client);
      await lockThrottleBuckets(client, ip, email);
      const dbThrottleResult = await checkDatabaseThrottle(client, ip, email);
      if (!dbThrottleResult.allowed) {
        throw new ContactThrottleExceeded(dbThrottleResult);
      }
      return storeSubmission(client, {
        name,
        email,
        decision,
        ip,
        userAgent,
      });
    });
    stored = true;
  } catch (error) {
    if (error instanceof ContactThrottleExceeded) {
      const message =
        error.throttle.source === "email"
          ? "That email has already been used for several recent contact requests. Please wait before trying again."
          : "You're sending contact requests too quickly. Please wait a bit and try again.";
      return jsonError(429, message);
    }
    console.error("[contact] database throttle unavailable; falling back to local throttle", error);
    throttleError = true;
  }

  if (throttleError) {
    const ipKey = throttleKey("ip", ip);
    const emailKey = throttleKey("email", email);
    const ipThrottle = consumeLocalThrottle(
      ipKey,
      CONTACT_IP_LIMIT,
      CONTACT_IP_WINDOW_MS,
    );
    const emailThrottle = consumeLocalThrottle(
      emailKey,
      CONTACT_EMAIL_LIMIT,
      CONTACT_EMAIL_WINDOW_MS,
    );
    if (!ipThrottle.allowed || !emailThrottle.allowed) {
      return jsonError(
        429,
        "You're sending contact requests too quickly. Please wait a bit and try again.",
      );
    }
  }

  const payload = {
    username: "Consult The Dead",
    embeds: [
      {
        title: "New contact submission",
        color: 0xd4a574,
        fields: [
          { name: "Name", value: name, inline: true },
          { name: "Email", value: email, inline: true },
          { name: "Decision", value: decision },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const delivery = await postDiscordWebhook(payload);

  if (delivery.sent) {
    await updateSubmissionState(storedSubmissionId, "delivered", null);
    return NextResponse.json({
      ok: true,
      stored,
      delivered: true,
    });
  }

  if (stored) {
    const reason =
      delivery.reason === "missing_webhook"
        ? "Discord webhook not configured"
        : delivery.reason === "webhook_timeout"
          ? "Discord webhook timed out"
          : "Discord webhook failed";
    console.error("[contact] webhook unavailable; submission preserved", {
      reason,
      status: "status" in delivery ? delivery.status : undefined,
    });
    await updateSubmissionState(storedSubmissionId, "stored_only", reason);
    return NextResponse.json({
      ok: true,
      stored: true,
      delivered: false,
      warning: "Your message was saved, but Discord delivery is currently unavailable.",
    });
  }

  console.error("[contact] contact submission lost because both storage and webhook delivery failed", {
    delivery,
  });
  return jsonError(
    503,
    "We could not save your message right now. Please email us directly and try again later.",
  );
}
