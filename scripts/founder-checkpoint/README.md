# Founder-checkpoint metrics pull

A small Node/TypeScript script that pulls the two business metrics the
AR agent's mid- and end-of-month founder retros depend on:

1. **Paying-user counts** from Stripe, split into Pro monthly / Pro
   annual / founding-member buckets.
2. **Top acquisition channels by `utm_source`** from Vercel Web
   Analytics for the trailing 30 days.
3. **Founder-channel attribution** that groups the raw sources into the
   founder-facing share / outreach / newsletter / organic buckets so the
   retro can see which paths are actually moving revenue.

The script emits a single JSON document on stdout with a stable
schema. It never throws — when env-vars are missing or an upstream
API fails, it degrades to a stub document with `missing_credentials`
and/or `errors` populated so the operator can fix one thing at a
time.

## Usage

```bash
# Live pull — loads credentials from root .env.local.
# Fill in STRIPE_SECRET_KEY, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_ANNUAL,
# and VERCEL_TOKEN in .env.local first (see Environment section below).
# VERCEL_PROJECT_ID and VERCEL_TEAM_ID are already pre-filled in .env.local.
tsx --env-file .env.local scripts/founder-checkpoint/pull-metrics.ts | jq .

# Dry-run / smoke (no env vars; emits a stub with missing_credentials).
env -i PATH="$PATH" tsx scripts/founder-checkpoint/pull-metrics.ts
```

## Environment

| Var                     | Required | Notes |
|-------------------------|----------|-------|
| `STRIPE_SECRET_KEY`     | yes      | Restricted/secret key with `subscriptions:read` |
| `STRIPE_PRICE_MONTHLY`  | yes      | Stripe price id for the Pro monthly plan |
| `STRIPE_PRICE_ANNUAL`   | yes      | Stripe price id for the Pro annual plan |
| `STRIPE_PRICE_FOUNDING` | no       | Stripe price id for founding member; falls back to recurring-interval heuristic if unset |
| `VERCEL_TOKEN`          | yes      | Vercel personal token with `analytics:read` |
| `VERCEL_PROJECT_ID`     | yes      | Project id (`prj_…`) |
| `VERCEL_TEAM_ID`        | no       | Team id (`team_…`) — only needed for team-scoped projects |

## Output schema

```jsonc
{
  "generatedAt": "2026-05-19T16:00:00.000Z",
  "paying_users": { "total": 42, "monthly": 18, "annual": 20, "founding": 4 },
  "channel_attribution": [
    { "channel": "share", "utm_sources": ["share"], "sessions": 1200, "conversions": 84 },
    { "channel": "outreach", "utm_sources": ["outreach"], "sessions": 350, "conversions": 11 },
    { "channel": "newsletter", "utm_sources": ["newsletter"], "sessions": 60, "conversions": 7 },
    { "channel": "organic", "utm_sources": ["(none)"], "sessions": 980, "conversions": 4 },
    { "channel": "other", "utm_sources": ["show_hn"], "sessions": 220, "conversions": 18 }
  ],
  "acquisition_channels": [
    { "utm_source": "show_hn",  "sessions": 1200, "conversions": 84 },
    { "utm_source": "twitter",  "sessions":  350, "conversions": 11 },
    { "utm_source": "(none)",   "sessions":  980, "conversions":  4 }
  ],
  "notable_channels": [
    { "utm_source": "show_hn",  "sessions": 1200, "conversions": 84,
      "reason": "high volume (1200 sessions); distribution-lever channel" }
  ],
  // Only present when env vars are missing:
  "missing_credentials": ["STRIPE_SECRET_KEY", "VERCEL_TOKEN"],
  // Only present when an upstream call failed:
  "errors": ["stripe: 401 Unauthorized: ..."]
}
```

In stub mode (`missing_credentials.length > 0`) `paying_users` is
`null`, `channel_attribution` / `acquisition_channels` / `notable_channels`
are empty, and the document is otherwise valid.

## Tests

The pure logic in `metrics.ts` is unit-tested. All Stripe/Vercel
network IO is dependency-injected via the `Fetcher` type, so tests
run with no live API calls.

```bash
# tests only
bash scripts/founder-checkpoint/run-tests.sh

# tests + v8 coverage report
bash scripts/founder-checkpoint/run-tests.sh --coverage
```

The wrapper borrows the `vitest` binary already installed for the
Next.js website workspace, so this folder doesn't need its own
`node_modules`. Coverage gate target: 100% on `metrics.ts` (achieved).

The CLI shim (`pull-metrics.ts`) is exercised by the smoke fixture
described below, not by vitest.

## Smoke fixture

`fixtures/smoke-stub.json` is a checked-in copy of the JSON the
script emits when all env vars are unset. It exists so AR can
diff a fresh run against a known-good stub and quickly confirm
the report-shape contract has not regressed:

```bash
diff <(env -i PATH="$PATH" tsx scripts/founder-checkpoint/pull-metrics.ts \
        | jq 'del(.generatedAt)') \
     <(jq 'del(.generatedAt)' scripts/founder-checkpoint/fixtures/smoke-stub.json)
```

(The `del(.generatedAt)` is required because the timestamp is
always fresh.)

## Biweekly metrics report (`ctd-biweekly-metrics-report`)

### Cadence

Every two weeks — mid-month (≈day 15) and end-of-month (≈day 28–31). The
AR agent triggers `pull-metrics.ts` as the data-collection step of its
founder retro and embeds the resulting JSON in the checkpoint summary it
sends to the CEO.

### Inputs

| Input | Source | What it feeds |
|-------|--------|---------------|
| Stripe subscriptions | `STRIPE_SECRET_KEY` + price ids | `paying_users` breakdown (monthly / annual / founding) |
| Vercel Web Analytics (trailing 30 days) | `VERCEL_TOKEN` + `VERCEL_PROJECT_ID` | `acquisition_channels` ranked by sessions; `notable_channels` flagged by heuristics |

The report does **not** pull Instagram Insights or agon-usage counters yet —
those are planned for Phase 4 once the Graph API is wired. The CONTENT_PIPELINE.md
§5 KPI hierarchy owns the full tracking plan; this script is responsible only
for the two upstream APIs listed above.

### Report contract

The AR agent reads the JSON emitted to stdout. The contract fields it depends on:

| Field | Type | Description |
|-------|------|-------------|
| `generatedAt` | ISO 8601 | Timestamp of the pull; AR strips this when diffing against the smoke stub |
| `paying_users.total` | number | Headline subscriber count for the retro |
| `paying_users.monthly` / `.annual` / `.founding` | number | Plan-level breakdown |
| `channel_attribution` | array | Deterministic founder-facing summary of share / outreach / newsletter / organic / other sources |
| `acquisition_channels` | array | All UTM sources with sessions + conversions, sorted by sessions descending |
| `notable_channels` | array | Subset of channels flagged as distribution levers (high volume or high conversion) |
| `missing_credentials` | string[] (optional) | Present in stub mode — lists which env vars are unset |
| `errors` | string[] (optional) | Present when an upstream call failed; report is still valid, just partial |

### Running for a retro

```bash
# Live run — loads credentials from root .env.local (VERCEL_PROJECT_ID and
# VERCEL_TEAM_ID are already set; fill in STRIPE_* and VERCEL_TOKEN).
tsx --env-file .env.local scripts/founder-checkpoint/pull-metrics.ts | jq .

# Compare against the known-good stub shape (catches schema regressions).
diff <(env -i PATH="$PATH" tsx scripts/founder-checkpoint/pull-metrics.ts \
        | jq 'del(.generatedAt)') \
     <(jq 'del(.generatedAt)' scripts/founder-checkpoint/fixtures/smoke-stub.json)
```

### What this report is NOT responsible for

- Content-pipeline KPIs (Instagram reach, 3-second view rate, saves) — owned by
  CONTENT_PIPELINE.md §5 and the marketing agent's review cycle.
- Agon-level usage metrics (sessions per user, council depth) — tracked separately
  in Vercel event logs; not yet ingested here.
- Revenue projections — derived by the AR agent from `paying_users`, not computed
  in this script.

---

## File layout

```
scripts/founder-checkpoint/
├── README.md                    # this file
├── metrics.ts                   # pure library (testable; coverage target)
├── pull-metrics.ts              # CLI entrypoint AR runs (re-exports metrics.ts)
├── pull-metrics.test.ts         # vitest contract tests on metrics.ts
├── run-tests.sh                 # vitest wrapper (uses website's vitest binary)
└── fixtures/
    └── smoke-stub.json          # known-good stub-mode output for diffing
```
