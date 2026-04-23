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
  const { userId, sessionClaims } = await auth();
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
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isPro(sessionClaims as Record<string, unknown>)) {
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
    const id = await db.saveAgon({
      userId,
      topic: topic.trim(),
      mindSlugs,
      rounds: Number(rounds),
      turns,
      consensus,
      research,
    });
    return NextResponse.json({ id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Database error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
