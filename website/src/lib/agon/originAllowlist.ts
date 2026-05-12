/**
 * Shared origin allowlist for all Agora-facing API and ingest routes.
 *
 * Centralizes the three production hosts and the common local-dev ports so
 * that every route handler pulls from one source of truth.  The Vercel
 * preview-deployment regex lives here too so it never drifts between routes.
 */
import type { NextRequest } from "next/server";

/**
 * Production and local-dev origins accepted by all Agora routes.
 * Add new entries here only — do not repeat this set in individual routes.
 */
export const AGORA_ALLOWED_ORIGINS = new Set<string>([
  // Production domains
  "https://consultthedead.com",
  "https://www.consultthedead.com",
  "https://agora.consultthedead.com",
  // Local dev — Next.js default port and common alternates
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
]);

/**
 * Regex for Vercel preview deployments under the project team.
 * Accepts any preview URL with the pattern:
 *   https://website-<hash>-edwardyen724-gs-projects.vercel.app
 */
export const VERCEL_PREVIEW_ORIGIN_REGEX =
  /^https:\/\/website-[a-z0-9-]+-edwardyen724-gs-projects\.vercel\.app$/;

/**
 * Returns true when the request's Origin header is on the allowlist.
 *
 * Allows:
 *   - Every entry in AGORA_ALLOWED_ORIGINS
 *   - Vercel preview deployment URLs matching VERCEL_PREVIEW_ORIGIN_REGEX
 *
 * Returns false for requests with no Origin header (e.g. server-to-server
 * calls without an explicit header, cURL without -H Origin) because all
 * browser-initiated Agora requests always send Origin.
 */
export function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  if (AGORA_ALLOWED_ORIGINS.has(origin)) return true;
  return VERCEL_PREVIEW_ORIGIN_REGEX.test(origin);
}
