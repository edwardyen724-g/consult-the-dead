import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { FrameworkSlug } from "@/lib/frameworks";
import { ALLOWED_SLUGS } from "@/lib/frameworks";
import { runAgon } from "@/lib/agon/agonEngine";
import { checkRateLimit, getClientIp } from "@/lib/agon/rateLimit";
import { bumpCounter, bumpMind, logTopic } from "@/lib/agon/metrics";
import type { AgonEvent } from "@/lib/agon/types";

export const runtime = "nodejs";
export const maxDuration = 300;

interface AgonRequestBody {
  topic?: string;
  mindSlugs?: string[];
  rounds?: number;
  research?: boolean;
}

const ALLOWED_ORIGINS = new Set<string>([
  "https://consultthedead.com",
  "https://www.consultthedead.com",
  "https://agora.consultthedead.com",
  // Local dev — Next default port and common alternates.
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
]);

function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  // Allow Vercel preview deployments under our team so we can test
  // before promoting to prod.
  if (/^https:\/\/website-[a-z0-9-]+-edwardyen724-gs-projects\.vercel\.app$/.test(origin)) {
    return true;
  }
  return false;
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return jsonError(
      403,
      "This API is only available from consultthedead.com. If you'd like to integrate with the Agora directly, please reach out."
    );
  }

  let body: AgonRequestBody;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const topic = (body.topic ?? "").trim();
  const mindSlugsRaw = Array.isArray(body.mindSlugs) ? body.mindSlugs : [];
  const rounds = Number.isFinite(body.rounds) ? Math.max(1, Math.min(5, body.rounds!)) : 3;

  if (topic.length < 10) {
    return jsonError(400, "Topic must be at least 10 characters");
  }
  if (topic.length > 2000) {
    // Cap input size — long topics inflate per-turn token cost and can
    // be used to drain budget. 2k chars is plenty for any real decision.
    return jsonError(400, "Topic must be 2000 characters or fewer");
  }

  const { userId, sessionClaims } = await auth();
  const publicMetadata = sessionClaims?.publicMetadata as Record<string, unknown> | undefined;
  const isPro = publicMetadata?.subscription_tier === "pro";

  const allowedSet = new Set<string>(ALLOWED_SLUGS);
  const mindSlugs = mindSlugsRaw.filter((s): s is FrameworkSlug =>
    allowedSet.has(s)
  );

  const mindMax = isPro ? 5 : 3;
  if (mindSlugs.length < 2 || mindSlugs.length > mindMax) {
    return jsonError(400, isPro ? "Pick 2 to 5 minds" : "Pick 2 to 3 minds");
  }

  const clientKey = request.headers.get("x-api-key");
  const apiKey = clientKey || process.env.ANTHROPIC_API_KEY || null;
  const usingServerKey = !clientKey && !!apiKey;

  if (!apiKey) {
    return jsonError(
      401,
      "No API key available. Add your Anthropic API key in settings, or contact the site owner."
    );
  }

  if (usingServerKey) {
    const ip = getClientIp(request);

    const result = await checkRateLimit({ userId, isPro, ip });
    if (!result.allowed) {
      const metricKey =
        result.reason === "global" ? "rate_limited_global" :
        result.reason === "pro"    ? "rate_limited_pro" :
        result.reason === "user"   ? "rate_limited_user" :
                                     "rate_limited_ip";
      bumpCounter(metricKey);

      const message =
        result.reason === "global"
          ? "The free tier is at capacity for today. Add your own Anthropic API key for unlimited use, or check back tomorrow."
          : result.reason === "pro"
          ? "You've reached your 100 agon monthly limit. Manage your subscription from your account page."
          : "You've used all 3 free agons for today. Add your own Anthropic API key for unlimited use.";

      return new Response(
        JSON.stringify({ error: message, rateLimited: true }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // Past validation + rate limit. Record an "agon started" event.
  bumpCounter("agons_started");
  if (!usingServerKey) bumpCounter("byo_key_used");
  for (const slug of mindSlugs) bumpMind(slug);
  logTopic({ topic, minds: mindSlugs, byo: !usingServerKey, ts: Date.now() });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: AgonEvent) => {
        const payload = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      let completed = false;
      try {
        for await (const event of runAgon({
          apiKey,
          topic,
          mindSlugs,
          rounds,
          research: null,
          isPro,
        })) {
          send(event);
          if (event.type === "agon_done") completed = true;
        }
        if (completed) bumpCounter("agons_completed");
      } catch (err) {
        bumpCounter("agons_errored");
        send({
          type: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

function jsonError(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
