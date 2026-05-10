/**
 * /api/library/[id] — single-agon endpoint.
 *
 * GET (public, no Clerk required)
 *   Resolves `[id]` against the `share_id` column first (the public handle
 *   produced by lib/share-id.ts) and returns a public-safe JSON view.
 *
 *   For backwards compatibility with the existing authenticated /library
 *   client (which fetches by primary-key UUID), if a Clerk session is present
 *   AND the segment is not a share_id, the route falls back to the
 *   owner-scoped lookup.
 *
 *   Public-safe field set returned to anonymous callers:
 *
 *       id, share_id, topic, mind_slugs, rounds, turns, consensus, research,
 *       created_at
 *
 *   Explicitly NOT exposed:
 *
 *       clerk_user_id, updated_at
 *
 *   Default stance for any new column on the `agons` table: PRIVATE. Update
 *   `PublicAgonRecord` in lib/db/client.ts deliberately when broadening it.
 *
 * DELETE (authenticated only, scoped to owner)
 *   Unchanged: only the row's owner can delete it.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db/client';
import { looksLikeShareId } from '@/lib/share-id';

export const runtime = 'nodejs';

async function loadPublicAgon(id: string) {
  try {
    return await db.getPublicAgonByShareId(id);
  } catch {
    // Public share lookups should fail closed. The public page and OG image
    // route already degrade to 404 / generic output on database errors so we
    // keep the API route aligned with that contract here.
    return null;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || typeof id !== 'string' || id.length === 0) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  try {
    // Public path: look up by share_id and return only the public-safe set.
    if (looksLikeShareId(id)) {
      const agon = await loadPublicAgon(id);
      if (!agon) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json({ agon });
    }

    // Authenticated UUID path: existing /library client uses this to load
    // its own rows. Strict ownership check on clerk_user_id.
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const agon = await db.getAgon(id, userId);
    if (!agon) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ agon });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Database error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const deleted = await db.deleteAgon(id, userId);
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Database error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
