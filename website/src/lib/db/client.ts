import { sql } from '@vercel/postgres';
import type { ConsensusResult } from '@/lib/agon/types';

export interface AgonRecord {
  id: string;
  clerk_user_id: string;
  topic: string;
  mind_slugs: string[];
  rounds: number;
  turns: unknown;
  consensus: ConsensusResult | null;
  research: string | null;
  created_at: string;
  updated_at: string;
}

export const db = {
  async saveAgon(params: {
    userId: string;
    topic: string;
    mindSlugs: string[];
    rounds: number;
    turns: unknown;
    consensus: ConsensusResult | null;
    research?: string | null;
  }): Promise<string> {
    // TEXT[] must be passed as a PostgreSQL array literal string — @vercel/postgres
    // only accepts Primitive values in tagged template slots.
    const mindSlugsLiteral = `{${params.mindSlugs.join(',')}}`;
    const result = await sql`
      INSERT INTO agons (clerk_user_id, topic, mind_slugs, rounds, turns, consensus, research)
      VALUES (
        ${params.userId},
        ${params.topic},
        ${mindSlugsLiteral}::text[],
        ${params.rounds},
        ${JSON.stringify(params.turns)},
        ${params.consensus ? JSON.stringify(params.consensus) : null},
        ${params.research ?? null}
      )
      RETURNING id
    `;
    return result.rows[0].id as string;
  },

  async getUserAgons(userId: string, limit = 20, offset = 0): Promise<AgonRecord[]> {
    const result = await sql`
      SELECT id, clerk_user_id, topic, mind_slugs, rounds, consensus, research, created_at, updated_at
      FROM agons
      WHERE clerk_user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return result.rows as AgonRecord[];
  },

  async getAgon(id: string, userId: string): Promise<AgonRecord | null> {
    const result = await sql`
      SELECT *
      FROM agons
      WHERE id = ${id} AND clerk_user_id = ${userId}
    `;
    return (result.rows[0] as AgonRecord) ?? null;
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
