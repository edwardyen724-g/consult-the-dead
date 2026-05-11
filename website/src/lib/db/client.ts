import { sql } from '@vercel/postgres';
import type { ConsensusResult } from '@/lib/agon/types';
import { generateShareId } from '@/lib/share-id';

export interface AgonRecord {
  id: string;
  clerk_user_id: string | null;
  share_id: string;
  topic: string;
  mind_slugs: string[];
  rounds: number;
  turns: unknown;
  consensus: ConsensusResult | null;
  research: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Public-safe shape returned by the unauthenticated GET /api/library/[id]
 * endpoint. Excludes `clerk_user_id` and any other owner-identifying field.
 *
 * Keeping this as a distinct type (rather than `Omit<AgonRecord, 'clerk_user_id'>`)
 * makes the boundary explicit and forces a deliberate decision when adding
 * future columns to the table.
 */
export interface PublicAgonRecord {
  id: string;
  share_id: string;
  topic: string;
  mind_slugs: string[];
  rounds: number;
  turns: unknown;
  consensus: ConsensusResult | null;
  research: string | null;
  created_at: string;
}

const SHARE_ID_MAX_ATTEMPTS = 5;

interface SaveAgonParams {
  /** Clerk user id when authenticated; null/undefined for anonymous saves. */
  userId: string | null | undefined;
  topic: string;
  mindSlugs: string[];
  rounds: number;
  turns: unknown;
  consensus: ConsensusResult | null;
  research?: string | null;
}

interface SaveAgonResult {
  id: string;
  shareId: string;
}

export const db = {
  /**
   * Insert a new agon. Returns both the internal UUID and the public share_id.
   *
   * `userId === null` is allowed and corresponds to an anonymous save (used by
   * the public-share path). Authenticated callers still pass their Clerk id so
   * the row shows up in their /library list.
   *
   * Re-tries with a fresh share_id on UNIQUE collisions — generation is wide
   * enough (~1.1e15) that this almost never fires, but the retry keeps us
   * correct on the unlucky path.
   */
  async saveAgon(params: SaveAgonParams): Promise<SaveAgonResult> {
    // TEXT[] must be passed as a PostgreSQL array literal string — @vercel/postgres
    // only accepts Primitive values in tagged template slots.
    const mindSlugsLiteral = `{${params.mindSlugs.join(',')}}`;
    const userIdParam = params.userId ?? null;
    const turnsJson = JSON.stringify(params.turns);
    const consensusJson = params.consensus ? JSON.stringify(params.consensus) : null;
    const research = params.research ?? null;

    let lastErr: unknown = null;
    for (let attempt = 0; attempt < SHARE_ID_MAX_ATTEMPTS; attempt++) {
      const shareId = generateShareId();
      try {
        const result = await sql`
          INSERT INTO agons (clerk_user_id, share_id, topic, mind_slugs, rounds, turns, consensus, research)
          VALUES (
            ${userIdParam},
            ${shareId},
            ${params.topic},
            ${mindSlugsLiteral}::text[],
            ${params.rounds},
            ${turnsJson},
            ${consensusJson},
            ${research}
          )
          RETURNING id, share_id
        `;
        const row = result.rows[0] as { id: string; share_id: string };
        return { id: row.id, shareId: row.share_id };
      } catch (err) {
        // Postgres unique_violation = 23505. Retry with a fresh share_id;
        // re-throw anything else.
        const code = (err as { code?: string } | null)?.code;
        if (code !== '23505') throw err;
        lastErr = err;
      }
    }
    throw lastErr ?? new Error('Failed to allocate unique share_id');
  },

  async getUserAgons(userId: string, limit = 20, offset = 0): Promise<AgonRecord[]> {
    const result = await sql`
      SELECT id, clerk_user_id, share_id, topic, mind_slugs, rounds, consensus, research, created_at, updated_at
      FROM agons
      WHERE clerk_user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return result.rows as AgonRecord[];
  },

  /**
   * Authenticated lookup by primary key. Scoped to the calling user.
   */
  async getAgon(id: string, userId: string): Promise<AgonRecord | null> {
    const result = await sql`
      SELECT *
      FROM agons
      WHERE id = ${id} AND clerk_user_id = ${userId}
    `;
    return (result.rows[0] as AgonRecord) ?? null;
  },

  /**
   * Public-read lookup by share_id. Returns only the public-safe field set —
   * no clerk_user_id, no updated_at noise. Returns null when the id does not
   * resolve.
   */
  async getPublicAgonByShareId(shareId: string): Promise<PublicAgonRecord | null> {
    const result = await sql`
      SELECT id, share_id, topic, mind_slugs, rounds, turns, consensus, research, created_at
      FROM agons
      WHERE share_id = ${shareId}
      LIMIT 1
    `;
    return (result.rows[0] as PublicAgonRecord) ?? null;
  },

  /**
   * Public list for the /explore gallery. Returns the public-safe field set
   * for every agon row that should be discoverable in the gallery:
   *
   *   - `clerk_user_id IS NULL`        → anonymously-saved share rows, AND
   *   - `clerk_user_id = 'system'`     → seed rows from the outreach script
   *                                      (see scripts/seed-outreach-agons.ts).
   *
   * `is_public = TRUE` rows are also included once that column migration
   * runs in production. The query falls back to the system+anonymous subset
   * if the column does not yet exist (Postgres `42703 undefined_column`),
   * so /explore stays usable across the schema-migration window.
   *
   * `limit` defaults to 200 so the v1 gallery (≈30 seed rows) is fully
   * client-filterable without pagination, but a hostile growth in saved
   * shares still can't blow the route's response payload.
   */
  async getPublicAgons({ limit = 200 }: { limit?: number } = {}): Promise<PublicAgonRecord[]> {
    const cappedLimit = Math.max(1, Math.min(1000, Math.trunc(limit) || 200));
    try {
      const result = await sql`
        SELECT id, share_id, topic, mind_slugs, rounds, turns, consensus, research, created_at
        FROM agons
        WHERE clerk_user_id IS NULL
           OR clerk_user_id = 'system'
           OR is_public = TRUE
        ORDER BY created_at DESC
        LIMIT ${cappedLimit}
      `;
      return result.rows as PublicAgonRecord[];
    } catch (err) {
      // Postgres `undefined_column` (42703) — the `is_public` migration
      // hasn't run yet. Fall back to the system + anonymous subset so the
      // 30 outreach rows still surface in /explore. Anything else surfaces
      // up to the route handler.
      const code = (err as { code?: string } | null)?.code;
      const message = (err as { message?: string } | null)?.message ?? '';
      const isUndefinedColumn =
        code === '42703' || /column .*is_public.* does not exist/i.test(message);
      if (!isUndefinedColumn) throw err;
      const fallback = await sql`
        SELECT id, share_id, topic, mind_slugs, rounds, turns, consensus, research, created_at
        FROM agons
        WHERE clerk_user_id IS NULL
           OR clerk_user_id = 'system'
        ORDER BY created_at DESC
        LIMIT ${cappedLimit}
      `;
      return fallback.rows as PublicAgonRecord[];
    }
  },

  async deleteAgon(id: string, userId: string): Promise<boolean> {
    const result = await sql`
      DELETE FROM agons
      WHERE id = ${id} AND clerk_user_id = ${userId}
      RETURNING id
    `;
    return result.rows.length > 0;
  },
};
