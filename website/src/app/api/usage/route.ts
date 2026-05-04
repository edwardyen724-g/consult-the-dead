import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getUsage, getClientIp } from "@/lib/agon/rateLimit";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  const user = await currentUser();
  const isPro = user?.publicMetadata?.subscription_tier === "pro";
  const ip = getClientIp(request);

  const usage = await getUsage({ userId, isPro, ip });

  return NextResponse.json(usage);
}
