/**
 * Beehiiv subscribe API contract module.
 *
 * Pure functions for building the request payload and a network function
 * for submitting the subscription. Kept separate from the retention email
 * subsystem (Resend) so the two providers don't bleed into each other.
 */

export interface BeehiivSubscribeInput {
  email: string;
  utmSource?: string;
  reactivate?: boolean;
}

export interface BeehiivSubscribePayload {
  email: string;
  utm_source: string;
  reactivate: boolean;
  send_welcome_email: boolean;
}

export interface BeehiivSubscribeResult {
  ok: boolean;
  alreadySubscribed: boolean;
  subscriberId: string | null;
  error: string | null;
}

/**
 * Pure function — builds the JSON body for the Beehiiv subscriptions endpoint.
 * Trims and lowercases the email, applies defaults for optional fields.
 */
export function buildBeehiivSubscribePayload(
  input: BeehiivSubscribeInput,
): BeehiivSubscribePayload {
  return {
    email: input.email.trim().toLowerCase(),
    utm_source: input.utmSource ?? "agora",
    reactivate: input.reactivate ?? true,
    send_welcome_email: true,
  };
}

/**
 * POSTs to the Beehiiv subscriptions API.
 *
 * Reads BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID from process.env.
 * Returns { ok: false, error: "..." } if either env var is missing.
 */
export async function subscribeToBeehiiv(
  input: BeehiivSubscribeInput,
): Promise<BeehiivSubscribeResult> {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;

  if (!apiKey || !publicationId) {
    return {
      ok: false,
      alreadySubscribed: false,
      subscriberId: null,
      error: "BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID not configured",
    };
  }

  const payload = buildBeehiivSubscribePayload(input);
  const url = `https://api.beehiiv.com/v2/publications/${encodeURIComponent(publicationId)}/subscriptions`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    return {
      ok: false,
      alreadySubscribed: false,
      subscriberId: null,
      error: err instanceof Error ? err.message : "Network error",
    };
  }

  if (res.status === 200 || res.status === 201) {
    let body: { data?: { status?: string; id?: string } } = {};
    try {
      body = (await res.json()) as { data?: { status?: string; id?: string } };
    } catch {
      // Ignore JSON parse errors — treat as success with no metadata
    }
    return {
      ok: true,
      alreadySubscribed: body.data?.status === "active",
      subscriberId: body.data?.id ?? null,
      error: null,
    };
  }

  let errorDetail: string | null = null;
  try {
    const errBody = (await res.json()) as { message?: string };
    errorDetail = errBody.message ?? null;
  } catch {
    // Ignore parse errors
  }

  return {
    ok: false,
    alreadySubscribed: false,
    subscriberId: null,
    error: errorDetail ?? `Beehiiv API error (${res.status})`,
  };
}
