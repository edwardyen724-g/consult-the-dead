/**
 * GET /api/health
 *
 * Lightweight liveness probe for Vercel serverless. Returns a JSON object
 * with the deployment commit, uptime, and environment. No DB, no Anthropic
 * calls — target response time <50 ms.
 *
 * Used by:
 *  - Vercel health checks
 *  - Smoke tests after deploys (see docs/runbooks/sentry-smoke-test.md)
 *  - Uptime monitors (UptimeRobot, Better Uptime, etc.)
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Vercel sets VERCEL_GIT_COMMIT_SHA at build time for every deployment.
// In local dev it is undefined, so we fall back to "dev".
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev",
      uptime: process.uptime(),
      env: process.env.NODE_ENV,
    },
    { status: 200 }
  );
}
