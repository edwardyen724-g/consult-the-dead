import Anthropic from "@anthropic-ai/sdk";
import { auth, currentUser } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ALLOWED_SLUGS, type FrameworkSlug } from "@/lib/frameworks";
import { bumpCounter, bumpMind, logTopic } from "@/lib/agon/metrics";
import { frameworkToSystemPrompt } from "@/lib/agon/frameworkPrompt";
import { loadFrameworkRaw } from "@/lib/agon/loadFramework";
import { checkRateLimit, getClientIp } from "@/lib/agon/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 120;

const ANALYSIS_MODEL = "claude-sonnet-4-6";
const ANALYSIS_MAX_TOKENS = 1200;
const MIN_TOPIC_LENGTH = 10;
const MAX_TOPIC_LENGTH = 2000;

const ALLOWED_ORIGINS = new Set<string>([
  "https://consultthedead.com",
  "https://www.consultthedead.com",
  "https://agora.consultthedead.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
]);

interface GenerateAnalysisRequestBody {
  frameworkSlug?: string;
  topic?: string;
}

function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  if (/^https:\/\/website-[a-z0-9-]+-edwardyen724-gs-projects\.vercel\.app$/.test(origin)) {
    return true;
  }
  return false;
}

function jsonError(status: number, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

function isSupportedFrameworkSlug(slug: string): slug is FrameworkSlug {
  return (ALLOWED_SLUGS as readonly string[]).includes(slug);
}

function buildAnalysisPrompt(topic: string, person: string): string {
  return `The user is asking ${person} to think through a real decision.

THE QUESTION:
${topic}

Write a 400-600 word analysis in first person as ${person}. Stay grounded in the framework above. Name specific perceptual cues, constructs, or documented incidents when you explain your reasoning. Give a decisive recommendation, explain why it follows from the framework, and do not use headings, bullet points, markdown, or meta commentary.`;
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return jsonError(
      403,
      "This API is only available from consultthedead.com. If you'd like to integrate with Ask This Mind directly, please reach out."
    );
  }

  let body: GenerateAnalysisRequestBody;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const frameworkSlug = typeof body.frameworkSlug === "string" ? body.frameworkSlug.trim() : "";
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";

  if (!frameworkSlug) {
    return jsonError(400, "frameworkSlug is required");
  }
  if (!isSupportedFrameworkSlug(frameworkSlug)) {
    return jsonError(400, "Unknown framework");
  }
  if (topic.length < MIN_TOPIC_LENGTH) {
    return jsonError(400, "Topic must be at least 10 characters");
  }
  if (topic.length > MAX_TOPIC_LENGTH) {
    return jsonError(400, "Topic must be 2000 characters or fewer");
  }

  const rawFramework = loadFrameworkRaw(frameworkSlug);
  if (!rawFramework) {
    return jsonError(404, "Framework not found");
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

  const { userId } = await auth();
  const user = await currentUser();
  const isPro = user?.publicMetadata?.subscription_tier === "pro";

  let quotaRemaining: number | undefined;
  if (usingServerKey) {
    const ip = getClientIp(request);
    const rateCheck = await checkRateLimit({ userId, isPro, ip });
    if (!rateCheck.allowed) {
      const message =
        rateCheck.reason === "global"
          ? "The free tier is at capacity for today. Add your own Anthropic API key for unlimited use, or check back tomorrow."
          : rateCheck.reason === "pro"
          ? "You've reached your 100 analysis monthly limit. Manage your subscription from your account page."
          : "You've used all 3 free analyses for today. Add your own Anthropic API key for unlimited use.";

      return jsonError(429, message, { rateLimited: true });
    }

    quotaRemaining = rateCheck.remaining;
  }

  bumpCounter("analysis_started");
  bumpMind(frameworkSlug);
  logTopic({ topic, minds: [frameworkSlug], byo: !usingServerKey, ts: Date.now() });

  const anthropic = new Anthropic({ apiKey });
  const systemPrompt = frameworkToSystemPrompt(rawFramework);
  const analysisPrompt = buildAnalysisPrompt(topic, rawFramework.meta?.person ?? frameworkSlug);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let errored = false;
      let analysis = "";
      try {
        const send = (event: Record<string, unknown>) => {
          const payload = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        };

        send({
          type: "analysis_started",
          frameworkSlug,
          frameworkName: rawFramework.meta?.person ?? frameworkSlug,
        });

        const response = anthropic.messages.stream({
          model: ANALYSIS_MODEL,
          max_tokens: ANALYSIS_MAX_TOKENS,
          system: systemPrompt,
          messages: [{ role: "user", content: analysisPrompt }],
        });

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            "delta" in event &&
            event.delta.type === "text_delta"
          ) {
            analysis += event.delta.text;
            send({ type: "analysis_chunk", frameworkSlug, text: event.delta.text });
          }
        }

        bumpCounter("analysis_completed");
        send({
          type: "analysis_done",
          frameworkSlug,
          frameworkName: rawFramework.meta?.person ?? frameworkSlug,
          analysis,
          remaining: quotaRemaining,
        });
      } catch (err) {
        errored = true;
        bumpCounter("analysis_errored");
        controller.error(err);
      } finally {
        if (!errored) {
          controller.close();
        }
      }
    },
  });

  const headers: Record<string, string> = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  };
  if (quotaRemaining !== undefined) {
    headers["X-RateLimit-Remaining"] = String(quotaRemaining);
  }

  return new Response(stream, { headers });
}
