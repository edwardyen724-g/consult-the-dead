import { clerkClient } from "@clerk/nextjs/server";
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { sendDay2Nudge } from "@/lib/email";

export type ClerkUser = {
  id: string;
  emailAddresses: Array<{ id: string; emailAddress: string }>;
  primaryEmailAddressId?: string | null;
  firstName?: string | null;
  createdAt: number; // epoch ms from Clerk
};

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function getCronSecret() {
  const secret = process.env.CRON_SECRET;
  return typeof secret === "string" && secret.length > 0 ? secret : null;
}

export function isAuthorizedCronRequest(request: Request) {
  const secret = getCronSecret();
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

/**
 * Returns a UTC window for users who signed up "2 days ago":
 *   [now - 3 days, now - 2 days)
 *
 * Running daily, this catches anyone whose Clerk createdAt fell in the
 * 24-hour period two days before the current UTC day.
 */
export function getDay2Window(now = new Date()) {
  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const twoDaysAgoStart = new Date(todayStart);
  twoDaysAgoStart.setUTCDate(todayStart.getUTCDate() - 2);
  const threeDaysAgoStart = new Date(todayStart);
  threeDaysAgoStart.setUTCDate(todayStart.getUTCDate() - 3);

  return { windowStart: threeDaysAgoStart, windowEnd: twoDaysAgoStart };
}

/**
 * Returns the set of clerk_user_ids that have at least one agon (i.e. have
 * run their first debate). Used to suppress the nudge for active users.
 */
async function fetchUsersWithAgons(clerkIds: string[]): Promise<Set<string>> {
  if (clerkIds.length === 0) return new Set();

  // Build a literal list for the IN clause. @vercel/postgres tagged templates
  // don't support array parameters, so we use a hand-built ANY(ARRAY[...]).
  const idList = clerkIds.map((id) => `'${id.replace(/'/g, "''")}'`).join(",");

  const result = await sql.query(
    `SELECT DISTINCT clerk_user_id FROM agons WHERE clerk_user_id = ANY(ARRAY[${idList}])`
  );

  return new Set(result.rows.map((r: { clerk_user_id: string }) => r.clerk_user_id));
}

/**
 * Mark that the day-2 nudge was sent for a Clerk user by recording the
 * timestamp in a separate nudge_sends log table (best-effort — the table may
 * not exist yet if the migration hasn't run, in which case we swallow the
 * error so the email send still counts).
 */
async function markNudgeSent(clerkUserId: string) {
  try {
    await sql`
      INSERT INTO email_sends (clerk_user_id, email_type, sent_at)
      VALUES (${clerkUserId}, 'day2_nudge', now())
      ON CONFLICT DO NOTHING
    `;
  } catch {
    // Best effort. Swallow schema-not-ready errors.
  }
}

/**
 * Returns clerk_user_ids that already received the day-2 nudge. Used for
 * idempotency: if the cron fires twice in the same window, we skip users
 * already sent.
 */
async function fetchAlreadySentNudge(clerkIds: string[]): Promise<Set<string>> {
  if (clerkIds.length === 0) return new Set();

  const idList = clerkIds.map((id) => `'${id.replace(/'/g, "''")}'`).join(",");
  try {
    const result = await sql.query(
      `SELECT DISTINCT clerk_user_id FROM email_sends WHERE clerk_user_id = ANY(ARRAY[${idList}]) AND email_type = 'day2_nudge'`
    );
    return new Set(result.rows.map((r: { clerk_user_id: string }) => r.clerk_user_id));
  } catch {
    // Table doesn't exist yet — treat as empty (allow sends, skip idempotency).
    return new Set();
  }
}

export async function runDay2NudgeCron(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return unauthorized();
  }

  const { windowStart, windowEnd } = getDay2Window();
  const clerk = await clerkClient();

  // Clerk's userList accepts createdAtAfter / createdAtBefore in epoch ms.
  const clerkUsers = await clerk.users.getUserList({
    createdAtAfter: windowStart.getTime(),
    createdAtBefore: windowEnd.getTime(),
    limit: 500,
  });

  const candidates = clerkUsers.data as ClerkUser[];

  if (candidates.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0 });
  }

  const candidateIds = candidates.map((u) => u.id);

  const [usersWithAgons, alreadySent] = await Promise.all([
    fetchUsersWithAgons(candidateIds),
    fetchAlreadySentNudge(candidateIds),
  ]);

  let sent = 0;
  let skipped = 0;

  for (const user of candidates) {
    // Skip users who already ran a debate — they don't need a nudge.
    if (usersWithAgons.has(user.id)) {
      skipped += 1;
      continue;
    }

    // Idempotency: skip if we already sent this user a day-2 nudge.
    if (alreadySent.has(user.id)) {
      skipped += 1;
      continue;
    }

    await sendDay2Nudge(user);
    await markNudgeSent(user.id);
    sent += 1;
  }

  return NextResponse.json({ sent, skipped });
}
