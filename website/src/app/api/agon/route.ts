import { NextRequest } from "next/server";
import type { FrameworkSlug } from "@/lib/frameworks";
import { ALLOWED_SLUGS } from "@/lib/frameworks";
import { runAgon } from "@/lib/agon/agonEngine";
import {
  checkFreeRateLimit,
  incrementFreeUsage,
  getClientIp,
} from "@/lib/agon/rateLimit";
import type { AgonEvent } from "@/lib/agon/types";

export const runtime = "nodejs";
export const maxDuration = 300;

interface AgonRequestBody {
  topic?: string;
  mindSlugs?: string[];
  rounds?: number;
  research?: boolean;
}

export async function POST(request: NextRequest) {
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

  const allowedSet = new Set<string>(ALLOWED_SLUGS);
  const mindSlugs = mindSlugsRaw.filter((s): s is FrameworkSlug =>
    allowedSet.has(s)
  );

  if (mindSlugs.length < 2 || mindSlugs.length > 5) {
    return jsonError(400, "Pick 2 to 5 minds");
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
    const { allowed } = checkFreeRateLimit(ip);
    if (!allowed) {
      return new Response(
        JSON.stringify({
          error:
            "You've used all 3 free agons for today. Add your own Anthropic API key for unlimited use.",
          rateLimited: true,
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    incrementFreeUsage(ip);
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: AgonEvent) => {
        const payload = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      try {
        for await (const event of runAgon({
          apiKey,
          topic,
          mindSlugs,
          rounds,
          research: null, // research wiring lands in Phase 3
        })) {
          send(event);
        }
      } catch (err) {
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
