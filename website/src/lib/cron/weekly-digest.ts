import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sendWeeklyDigest, type WeeklyDigestConfig } from "@/lib/email";

export type ClerkUser = {
  id: string;
  emailAddresses: Array<{ id: string; emailAddress: string }>;
  primaryEmailAddressId?: string | null;
  firstName?: string | null;
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
 * Reads the featured digest metadata from environment variables.
 * Returns null if any required variable is missing (caller must skip send in
 * that case to avoid sending a structurally broken digest email).
 */
export function getDigestConfig(): WeeklyDigestConfig | null {
  const featuredTopic = process.env.FEATURED_AGON_TOPIC;
  const featuredConsensus = process.env.FEATURED_AGON_CONSENSUS;
  const featuredShareId = process.env.FEATURED_AGON_SHARE_ID;

  if (!featuredTopic || !featuredConsensus || !featuredShareId) {
    return null;
  }

  return {
    featuredTopic,
    featuredConsensus,
    featuredShareId,
    newMindName: process.env.NEW_MIND_NAME ?? null,
    newMindTagline: process.env.NEW_MIND_TAGLINE ?? null,
    newMindHowArgues: process.env.NEW_MIND_HOW_ARGUES ?? null,
  };
}

export async function runWeeklyDigestCron(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return unauthorized();
  }

  const config = getDigestConfig();
  if (!config) {
    return NextResponse.json(
      {
        error:
          "Missing required digest env vars: FEATURED_AGON_TOPIC, FEATURED_AGON_CONSENSUS, FEATURED_AGON_SHARE_ID",
      },
      { status: 500 }
    );
  }

  const clerk = await clerkClient();

  // Fetch up to 500 users. For larger user lists this should be paginated;
  // this limit is safe for the current scale and mirrors first-agon-recap.
  const clerkUsers = await clerk.users.getUserList({ limit: 500 });
  const candidates = clerkUsers.data as ClerkUser[];

  let sent = 0;
  let skipped = 0;

  for (const user of candidates) {
    const primaryEmail =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
        ?.emailAddress ?? user.emailAddresses[0]?.emailAddress;

    if (!primaryEmail) {
      skipped += 1;
      continue;
    }

    await sendWeeklyDigest(user, config);
    sent += 1;
  }

  return NextResponse.json({ sent, skipped });
}
