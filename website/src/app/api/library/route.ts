/**
 * /api/library — Agon save endpoint.
 *
 * GET (authenticated only)
 *   Returns the calling user's saved agons. Requires a Clerk session.
 *
 * POST (authenticated OR anonymous)
 *   Saves an agon and returns `{ id, shareId, url }`.
 *
 *   - Authenticated callers: row is associated with their Clerk user id and
 *     shows up in /library. Pro subscription required (existing behavior).
 *   - Anonymous callers: row is saved with `clerk_user_id = NULL` so the
 *     public share URL still works. No subscription gate (the share path
 *     is the only way the row is reachable). Anyone with the `shareId` can
 *     read it via GET /api/library/[id].
 *
 * Public-safe field set (returned by the unauthenticated GET /api/library/[id]
 * sibling route — see ./[id]/route.ts):
 *
 *     id, share_id, topic, mind_slugs, rounds, turns, consensus, research,
 *     created_at
 *
 * Explicitly NOT exposed to anonymous readers:
 *
 *     clerk_user_id  — owner identity
 *     updated_at     — internal mutation noise
 *
 * If you add new columns to the agons table, decide explicitly whether they
 * belong in the public set and update both this header and `PublicAgonRecord`
 * in lib/db/client.ts. Default stance: PRIVATE.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db/client';
import type { ConsensusResult } from '@/lib/agon/types';

export const runtime = 'nodejs';

function isPro(sessionClaims: Record<string, unknown> | null | undefined): boolean {
  const meta = sessionClaims?.publicMetadata as Record<string, unknown> | undefined;
  return meta?.subscription_tier === 'pro';
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const agons = await db.getUserAgons(userId);
    return NextResponse.json({ agons });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Database error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { userId, sessionClaims } = await auth();

  // Authenticated → existing Pro-only "save to library" flow.
  // Unauthenticated → anonymous share-only save (no library, no quota gate).
  if (userId && !isPro(sessionClaims as Record<string, unknown>)) {
    return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 });
  }

  let body: {
    topic?: string;
    mindSlugs?: string[];
    rounds?: number;
    turns?: unknown;
    consensus?: ConsensusResult | null;
    research?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { topic, mindSlugs, rounds = 3, turns = [], consensus = null, research = null } = body;

  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    return NextResponse.json({ error: 'topic is required' }, { status: 400 });
  }
  if (!Array.isArray(mindSlugs) || mindSlugs.length < 1) {
    return NextResponse.json({ error: 'mindSlugs is required' }, { status: 400 });
  }

  try {
    const { id, shareId } = await db.saveAgon({
      userId: userId ?? null,
      topic: topic.trim(),
      mindSlugs,
      rounds: Number(rounds),
      turns,
      consensus,
      research,
    });
    return NextResponse.json({
      id,
      shareId,
      url: `/agora/a/${shareId}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Database error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
