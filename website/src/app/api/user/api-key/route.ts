/**
 * /api/user/api-key — BYO Anthropic API key persistence.
 *
 * GET    Returns `{ hasKey: boolean }` for the signed-in user. NEVER returns
 *        the raw key — the client only ever needs to know whether one is on
 *        file (so the UI can show a masked placeholder vs. an empty field).
 *
 * POST   Persists a user-supplied Anthropic key into Clerk privateMetadata
 *        under `anthropic_api_key`. Validates the `sk-ant-` prefix + minimum
 *        length via {@link isValidAnthropicKeyFormat} and returns 400 when the
 *        body is malformed. Body shape: `{ key: string }`.
 *
 * DELETE Clears the user's stored key (sets `anthropic_api_key: null`).
 *
 * Storage: `privateMetadata` (NOT `publicMetadata`). Public metadata is
 * embedded in the Clerk session token and would round-trip the key to the
 * browser on every request — we never want that. Private metadata is
 * server-only and only touched by trusted code paths (this route, the
 * /api/agon route reading the key as a fallback, and the /account server
 * page rendering the masked display).
 *
 * The /api/agon route already accepts an `x-api-key` header from the client;
 * the read-side wiring (AgoraApp.tsx auto-pulling the key from server-side
 * privateMetadata into that header) is a follow-up micro-task — see capsule
 * 33f9a1c1's note in the parent task description.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { isValidAnthropicKeyFormat } from "@/lib/api-key-mask";

export const runtime = "nodejs";

/** Clerk privateMetadata key — keep in sync with /account page reader. */
const METADATA_KEY = "anthropic_api_key" as const;

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const stored = user.privateMetadata?.[METADATA_KEY];
  const hasKey = typeof stored === "string" && stored.length > 0;

  // Cache-Control: never. The auth state is per-user and browsers + edge
  // caches must not retain it.
  return NextResponse.json(
    { hasKey },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { key?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const candidate = typeof body.key === "string" ? body.key.trim() : body.key;

  if (!isValidAnthropicKeyFormat(candidate)) {
    return NextResponse.json(
      {
        error:
          "API key must start with sk-ant- and be at least 27 characters. Generate a key in console.anthropic.com → Settings → API Keys.",
      },
      { status: 400 },
    );
  }

  const clerk = await clerkClient();
  await clerk.users.updateUserMetadata(userId, {
    privateMetadata: { [METADATA_KEY]: candidate },
  });

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clerk = await clerkClient();
  // Setting to `null` removes the field from privateMetadata in Clerk's API.
  await clerk.users.updateUserMetadata(userId, {
    privateMetadata: { [METADATA_KEY]: null },
  });

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
