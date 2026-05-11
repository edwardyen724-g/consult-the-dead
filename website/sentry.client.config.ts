/**
 * Sentry client-side configuration.
 *
 * Runs in the browser.  NEXT_PUBLIC_SENTRY_DSN is injected at build time;
 * if it is absent the SDK is still imported but simply no-ops, so the app
 * builds and runs normally without a DSN (useful for local dev, CI, and
 * staging environments that have not yet wired up Sentry).
 *
 * Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Capture 10% of transactions for performance monitoring.
  // Bump to 1.0 (100%) during initial rollout, then tune down.
  tracesSampleRate: 0.1,

  // Enable session replay at 1% for normal sessions, 100% on errors.
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,

  // Only send errors in production to avoid noise during development.
  enabled: process.env.NODE_ENV === "production",

  // Surface the Sentry debug overlay in development when DSN is set.
  debug: false,
});
