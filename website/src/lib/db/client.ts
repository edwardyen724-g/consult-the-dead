import { neon } from '@neondatabase/serverless';
import type { ConsensusResult } from '@/lib/agon/types';

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url || url.includes('PLACEHOLDER')) {
    throw new Error(
      'DATABASE_URL is not configured. Create a Neon database at neon.tech and add the connection string to your environment variables.'
    );
  }
  return neon(url);
}

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
    const sql = getSql();
    const rows = await sql`
      INSERT INTO agons (clerk_user_id, topic, mind_slugs, rounds, turns, consensus, research)
      VALUES (
        ${params.userId},
        ${params.topic},
        ${params.mindSlugs},
        ${params.rounds},
        ${JSON.stringify(params.turns)},
        ${params.consensus ? JSON.stringify(params.consensus) : null},
        ${params.research ?? null}
      )
      RETURNING id
    `;
    return (rows[0] as { id: string }).id;
  },

  async getUserAgons(userId: string, limit = 20, offset = 0): Promise<AgonRecord[]> {
    const sql = getSql();
    const rows = await sql`
      SELECT id, clerk_user_id, topic, mind_slugs, rounds, consensus, research, created_at, updated_at
      FROM agons
      WHERE clerk_user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return rows as AgonRecord[];
  },

  async getAgon(id: string, userId: string): Promise<AgonRecord | null> {
    const sql = getSql();
    const rows = await sql`
      SELECT *
      FROM agons
      WHERE id = ${id} AND clerk_user_id = ${userId}
    `;
    return (rows[0] as AgonRecord) ?? null;
  },

  async deleteAgon(id: string, userId: string): Promise<boolean> {
    const sql = getSql();
    const rows = await sql`
      DELETE FROM agons
      WHERE id = ${id} AND clerk_user_id = ${userId}
      RETURNING id
    `;
    return rows.length > 0;
  },
};
