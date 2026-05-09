import { NextResponse } from "next/server";
import { getPricingStats } from "@/lib/pricing/stats";

export const runtime = "nodejs";

export async function GET() {
  try {
    const stats = await getPricingStats();
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json(
      { error: "Unable to load pricing stats" },
      { status: 503 },
    );
  }
}
