/**
 * Sentry edge-runtime configuration.
 *
 * Runs in Next.js Edge middleware and Edge API routes (e.g. /api/agon routes
 * executed at the CDN edge).  Uses SENTRY_DSN (server-only secret).  When
 * absent the SDK no-ops cleanly so the app builds and runs without a Sentry
 * project configured.
 *
 * Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // Server-only secret — not embedded in the client bundle.
  // Falls back to the public DSN so local dev works with a single variable.
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Capture 10% of transactions for performance monitoring.
  tracesSampleRate: 0.1,

  // Only send errors in production to avoid noise during development.
  enabled: process.env.NODE_ENV === "production",

  debug: false,
});
