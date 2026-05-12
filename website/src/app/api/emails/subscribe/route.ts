/**
 * POST /api/emails/subscribe
 *
 * Accepts an email address and subscribes the visitor to the Beehiiv newsletter.
 * Called by the consensus-stage email capture in <ShareAgonPanel>.
 *
 * Request body: { email: string; utmSource?: string }
 * Response: { ok: true } on success, { ok: false, error: string } on failure.
 *
 * Beehiiv API key and publication ID are read from environment variables:
 *   BEEHIIV_API_KEY
 *   BEEHIIV_PUBLICATION_ID
 */

import { NextResponse } from "next/server";
import { subscribeToBeehiiv } from "@/lib/emails/beehiiv";

export const runtime = "nodejs";

type SubscribeBody = {
  email?: string;
  utmSource?: string;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function jsonError(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(request: Request) {
  let body: SubscribeBody;
  try {
    body = (await request.json()) as SubscribeBody;
  } catch {
    return jsonError(400, "Invalid JSON");
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!email) {
    return jsonError(400, "Missing email");
  }
  if (!isValidEmail(email)) {
    return jsonError(400, "Invalid email");
  }

  const utmSource = typeof body.utmSource === "string" && body.utmSource
    ? body.utmSource
    : "agora";

  const result = await subscribeToBeehiiv({ email, utmSource });

  if (result.ok) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Gracefully handle already-subscribed — surface as ok from the caller's
  // perspective so the user sees the success state rather than an error.
  if (result.alreadySubscribed) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Config error → 503 (server-side mis-configuration, not the caller's fault)
  if (
    result.error === "BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID not configured"
  ) {
    console.error("[subscribe] Beehiiv env vars not configured");
    return jsonError(503, "Subscription service unavailable");
  }

  // Other Beehiiv API errors → 502
  console.error("[subscribe] Beehiiv API error:", result.error);
  return jsonError(502, "Subscription service error");
}
