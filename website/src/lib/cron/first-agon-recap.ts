import { clerkClient } from "@clerk/nextjs/server";
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { sendFirstAgonRecap } from "@/lib/email";

export type FirstAgonRecapRow = {
  id: string;
  clerk_user_id: string | null;
  share_id: string | null;
  topic: string;
  mind_slugs: string[];
  rounds: number;
  turns: unknown;
  consensus: unknown;
  research: string | null;
  created_at: string;
  recap_sent_at: string | null;
};

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function getCronSecret() {
  const secret = process.env.CRON_SECRET;
  return typeof secret === "string" && secret.length > 0 ? secret : null;
}

export function isAuthorizedCronRequest(request: Request) {
  // Accept Vercel's native cron header (sent on GET requests from the cron scheduler).
  if (request.headers.get("x-vercel-cron") === "1") return true;

  const secret = getCronSecret();
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

export function getUtcDayWindow(now = new Date()) {
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setUTCDate(todayStart.getUTCDate() - 1);

  return { yesterdayStart, todayStart };
}

async function fetchFirstAgonRecapCandidates(now = new Date()): Promise<FirstAgonRecapRow[]> {
  const { yesterdayStart, todayStart } = getUtcDayWindow(now);

  const result = await sql<FirstAgonRecapRow>`
    WITH first_agons AS (
      SELECT DISTINCT ON (clerk_user_id)
        id,
        clerk_user_id,
        share_id,
        topic,
        mind_slugs,
        rounds,
        turns,
        consensus,
        research,
        created_at,
        recap_sent_at
      FROM agons
      WHERE clerk_user_id IS NOT NULL
      ORDER BY clerk_user_id, created_at ASC, id ASC
    )
    SELECT *
    FROM first_agons
    WHERE created_at >= ${yesterdayStart.toISOString()}
      AND created_at < ${todayStart.toISOString()}
    ORDER BY created_at ASC, clerk_user_id ASC
  `;

  return result.rows;
}

async function markRecapSent(agonId: string) {
  try {
    await sql`
      UPDATE agons
      SET recap_sent_at = now()
      WHERE id = ${agonId}
    `;
  } catch {
    // Best effort. If the deployment has not applied the recap_sent_at
    // migration yet, the email send still succeeded and the cron can be
    // retried once the schema is in place.
  }
}

export async function runFirstAgonRecapCron(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return unauthorized();
  }

  const [candidates, clerk] = await Promise.all([
    fetchFirstAgonRecapCandidates(),
    clerkClient(),
  ]);

  let sent = 0;
  let skipped = 0;

  for (const agon of candidates) {
    if (agon.recap_sent_at) {
      skipped += 1;
      continue;
    }

    if (!agon.clerk_user_id) {
      skipped += 1;
      continue;
    }

    const user = await clerk.users.getUser(agon.clerk_user_id);
    await sendFirstAgonRecap(user, agon);
    await markRecapSent(agon.id);
    sent += 1;
  }

  return NextResponse.json({ sent, skipped });
}
