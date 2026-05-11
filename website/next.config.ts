import type { NextConfig } from "next";
import path from "path";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  } as Record<string, unknown>,
  async rewrites() {
    return {
      beforeFiles: [
        // When a request hits the agora.consultthedead.com subdomain,
        // serve the /agora route as the index. The marketing landing
        // page stays at consultthedead.com.
        {
          source: "/",
          has: [
            {
              type: "host",
              value: "agora.consultthedead.com",
            },
          ],
          destination: "/agora",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

// Wrap with Sentry so the SDK is injected into the Next.js build pipeline.
// When NEXT_PUBLIC_SENTRY_DSN / SENTRY_DSN are absent the SDK no-ops at
// runtime (see sentry.client.config.ts / sentry.server.config.ts), so the
// app builds and runs cleanly without any Sentry project configured.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Suppress build-time warnings when auth token is absent (local dev / CI
  // without sentry credentials).
  silent: !process.env.SENTRY_AUTH_TOKEN,

  // Route browser Sentry requests through Next.js to avoid ad-blockers.
  tunnelRoute: "/monitoring",

  // Reduce client bundle size by removing SDK logger statements.
  disableLogger: true,
});
