/**
 * GET /api/explore — public gallery feed for /explore.
 *
 * Returns up to 200 public-safe AgonRecords (anonymous-save rows +
 * `clerk_user_id='system'` seed rows + future `is_public=TRUE` rows)
 * for the client-rendered gallery to filter against. No auth required.
 *
 * Rationale for client-side filtering:
 *   - v1 seed is ≈30 rows; payload is small enough to ship in one
 *     response without pagination.
 *   - The gallery's chip + search filters need to react instantly,
 *     and the filter logic lives in src/lib/explore-filter.ts (vitest-
 *     covered). Round-tripping every filter to the server would add
 *     latency without product benefit at this scale.
 *
 * Server-side guard: limit hard-capped to 200 inside db.getPublicAgons.
 * If the table grows past that, this endpoint will need pagination —
 * the cap fails closed so a hostile growth never blows the response.
 *
 * Cache headers: `public, s-maxage=300, stale-while-revalidate=900`
 * lets Vercel's edge serve the gallery for 5min while revalidating in
 * the background up to 15min — crawlers and re-visitors hit cache, a
 * fresh seed run shows up within 5min.
 */
import { NextResponse } from 'next/server';

import { db, type PublicAgonRecord } from '@/lib/db/client';

export const runtime = 'nodejs';
// Always re-evaluate on the server so a freshly-seeded agon shows up;
// the edge-cache headers below provide the actual short-lived caching.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const agons: PublicAgonRecord[] = await db.getPublicAgons({ limit: 200 });
    return NextResponse.json(
      { agons },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
        },
      },
    );
  } catch (err) {
    // Log + return an empty list so /explore degrades gracefully on a
    // transient DB blip rather than 500-ing the whole gallery surface.
    console.error('[api/explore] failed to load public agons:', err);
    return NextResponse.json(
      { agons: [], error: 'Failed to load public agons' },
      { status: 500 },
    );
  }
}
