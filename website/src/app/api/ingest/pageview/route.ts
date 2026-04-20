import { NextRequest } from "next/server";
import { bumpPageview } from "@/lib/agon/metrics";

export const runtime = "nodejs";

const ALLOWED_ORIGINS = new Set<string>([
  "https://consultthedead.com",
  "https://www.consultthedead.com",
  "https://agora.consultthedead.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
]);

function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  if (
    /^https:\/\/website-[a-z0-9-]+-edwardyen724-gs-projects\.vercel\.app$/.test(
      origin
    )
  ) {
    return true;
  }
  return false;
}

interface PageviewBody {
  path?: string;
  referrer?: string;
}

/* Normalize a referrer URL down to its hostname. Filters out
   same-origin referrers (we only care about external sources) and
   aggregates common aggregator variants. Returns null when no useful
   referrer host is present. */
function normalizeReferrer(raw: string | undefined): string | null {
  if (!raw) return null;
  let host: string;
  try {
    host = new URL(raw).hostname.toLowerCase();
  } catch {
    return null;
  }
  if (!host) return null;
  if (
    host === "consultthedead.com" ||
    host === "www.consultthedead.com" ||
    host === "agora.consultthedead.com"
  ) {
    return null;
  }
  // Collapse common subdomain variants.
  if (host.startsWith("www.")) host = host.slice(4);
  if (host.endsWith(".google.com")) host = "google.com";
  if (host.endsWith(".bing.com")) host = "bing.com";
  return host;
}

/* Constrain the path to our site's surface area. Strips query strings
   (which can contain PII-adjacent tokens) and limits length. */
function normalizePath(raw: string | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  if (!raw.startsWith("/")) return null;
  const noQuery = raw.split("?")[0].split("#")[0];
  return noQuery.slice(0, 200);
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return new Response(null, { status: 204 }); // silently drop, don't leak the rule
  }

  let body: PageviewBody;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 204 });
  }

  const path = normalizePath(body.path);
  if (!path) return new Response(null, { status: 204 });

  const referrerHost = normalizeReferrer(body.referrer);

  bumpPageview(path, referrerHost);

  return new Response(null, { status: 204 });
}
