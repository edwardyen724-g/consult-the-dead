/**
 * Sentry server-side (Node.js / Edge runtime) configuration.
 *
 * Runs on the server for every serverless invocation.
 * NEXT_PUBLIC_SENTRY_DSN is optional — if absent the SDK no-ops, keeping
 * the build green in CI and local dev without any Sentry project set up.
 *
 * Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Capture 10% of transactions for performance monitoring.
  tracesSampleRate: 0.1,

  // Only send errors in production to avoid noise during development.
  enabled: process.env.NODE_ENV === "production",

  debug: false,
});
