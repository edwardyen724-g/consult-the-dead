#!/usr/bin/env -S npx tsx
/**
 * Founder-checkpoint metrics pull (Stripe + Vercel Analytics) — CLI entry.
 *
 * Used by the AR agent on the mid-month and end-of-month founder retro
 * (next deadline: 2026-05-19). Reads paying-subscriber counts from Stripe
 * and the top acquisition channels (utm_source) from Vercel Web
 * Analytics plus a founder-facing attribution summary, then prints a
 * structured JSON report on stdout.
 *
 * Usage:
 *   tsx scripts/founder-checkpoint/pull-metrics.ts
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY        Stripe restricted/secret key with subs:read
 *   STRIPE_PRICE_MONTHLY     Stripe price id for the Pro monthly plan
 *   STRIPE_PRICE_ANNUAL      Stripe price id for the Pro annual plan
 *   STRIPE_PRICE_FOUNDING    (optional) Stripe price id for founding member
 *   VERCEL_TOKEN             Vercel personal token with analytics:read
 *   VERCEL_PROJECT_ID        Vercel project id (prj_...)
 *   VERCEL_TEAM_ID           (optional) Vercel team id (team_...) for team scope
 *
 * Behaviour when env is missing:
 *   Does NOT throw. Emits a stub JSON document with `missing_credentials`
 *   so AR can dry-run against staging and immediately see which secrets
 *   need plumbing.
 *
 * Out of scope: this script is read-only and emits to stdout. It does
 * not write to disk, mutate state, or send notifications. Composition
 * (e.g. piping into the markdown checkpoint template) is AR's job.
 */
import { buildReport, type EnvLike, type FounderCheckpointReport } from "./metrics";

// Library re-exports kept for backwards-compat in case anything imports
// from `pull-metrics`. Tests target ./metrics directly.
export * from "./metrics";

/* c8 ignore start -- CLI bootstrap; coverage gate runs on ./metrics.ts.
 * Behaviour is exercised by AR on 2026-05-19 and via the documented
 * smoke-test in README.md. */
async function main(): Promise<void> {
  const env = process.env as EnvLike;
  const report = await buildReport(env);
  // Pretty-printed so AR can paste straight into markdown if desired.
  process.stdout.write(JSON.stringify(report, null, 2) + "\n");
}

main().catch((err) => {
  // Last-resort: if even the wrapper throws, emit an error stub so AR
  // still gets parseable JSON on stdout and a clear signal on stderr.
  process.stderr.write(`pull-metrics: fatal: ${(err as Error).stack ?? err}\n`);
  const fallback: FounderCheckpointReport = {
    generatedAt: new Date().toISOString(),
    paying_users: null,
    channel_attribution: [],
    acquisition_channels: [],
    notable_channels: [],
    errors: [`fatal: ${(err as Error).message}`],
  };
  process.stdout.write(JSON.stringify(fallback, null, 2) + "\n");
  process.exit(1);
});
/* c8 ignore stop */
