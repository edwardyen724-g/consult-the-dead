import { NextRequest } from "next/server";
import { readMetrics } from "@/lib/agon/metrics";

export const runtime = "nodejs";

/* Admin-only metrics endpoint. Protected by ADMIN_TOKEN env var so the
   scheduled reporter (and you) can pull aggregate usage data without
   exposing it publicly. */
export async function GET(request: NextRequest) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    return jsonError(503, "ADMIN_TOKEN not configured");
  }

  const headerToken = request.headers.get("x-admin-token");
  if (!headerToken || headerToken !== adminToken) {
    return jsonError(403, "Forbidden");
  }

  const url = new URL(request.url);
  const daysParam = url.searchParams.get("days");
  const days = Math.max(1, Math.min(30, parseInt(daysParam ?? "7", 10) || 7));

  const metrics = await readMetrics(days);

  return new Response(
    JSON.stringify(
      {
        days,
        generatedAt: new Date().toISOString(),
        metrics,
      },
      null,
      2
    ),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}

function jsonError(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
