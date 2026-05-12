import { NextRequest } from "next/server";
import { bumpPageview } from "@/lib/agon/metrics";
import { isAllowedOrigin } from "@/lib/agon/originAllowlist";

export const runtime = "nodejs";

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
