/**
 * Sentry server-side (Node.js / Edge runtime) configuration.
 *
 * Runs on the server for every serverless invocation.
 * SENTRY_DSN is a server-only secret (no NEXT_PUBLIC_ prefix — never exposed
 * to the browser bundle).  When absent the SDK no-ops, keeping the build and
 * runtime clean in CI and local dev without a Sentry project configured.
 *
 * Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // Server-side uses SENTRY_DSN (secret, not embedded in client bundle).
  // Falls back to the public DSN so local dev works with a single variable.
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Capture 10% of transactions for performance monitoring.
  tracesSampleRate: 0.1,

  // Only send errors in production to avoid noise during development.
  enabled: process.env.NODE_ENV === "production",

  debug: false,
});
