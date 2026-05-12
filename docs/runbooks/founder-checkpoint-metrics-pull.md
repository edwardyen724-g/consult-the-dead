# Founder-Checkpoint Metrics Pull

**Purpose**: Restore and verify the live founder-checkpoint report used by the CEO/AR loop.

**Scope**: `scripts/founder-checkpoint/pull-metrics.ts` and the live Vercel/Stripe credentials it needs.

---

## Required Environment Variables

Set these in the live runtime that executes the script, and mirror them in Vercel Project Settings -> Environment Variables for the production deployment if the script runs from Vercel-hosted automation:

| Variable | Required | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | yes | Stripe secret or restricted key with subscription read access |
| `STRIPE_PRICE_MONTHLY` | yes | Price id for the Pro monthly plan |
| `STRIPE_PRICE_ANNUAL` | yes | Price id for the Pro annual plan |
| `STRIPE_PRICE_FOUNDING` | no | Optional founding-member price id; the script falls back to interval heuristics if omitted |
| `VERCEL_TOKEN` | yes | Vercel personal token with `analytics:read` — create at vercel.com/account/tokens |
| `VERCEL_PROJECT_ID` | yes | **Pre-filled in `.env.local`**: `prj_iQYbEgVqfduf2e50f65Nca1bTdDH` (consultthedead.com) |
| `VERCEL_TEAM_ID` | no | **Pre-filled in `.env.local`**: `team_KH6YPajpz9M5WUbb9IKUKvu6` |

The report stays in stub mode if any of the required variables are missing.

`VERCEL_PROJECT_ID` and `VERCEL_TEAM_ID` are already set in the root `.env.local`.
To go live, you only need to fill in the four secrets:
`VERCEL_TOKEN`, `STRIPE_SECRET_KEY`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL`.

---

## Restore Checklist

1. Confirm the production Stripe account contains the Pro monthly and annual prices that match `STRIPE_PRICE_MONTHLY` and `STRIPE_PRICE_ANNUAL`.
2. Confirm the Vercel token has analytics read access for the project in `VERCEL_PROJECT_ID`.
3. Add the variables above to the live environment and to Vercel production env vars if applicable.
4. Run the pull loading credentials from root `.env.local`:

```bash
# From repo root — reads .env.local automatically via tsx --env-file
tsx --env-file .env.local scripts/founder-checkpoint/pull-metrics.ts | jq .
```

5. Confirm the response includes a non-null `paying_users` object and a populated `paying_users.total`.

---

## Pass Criteria

- `paying_users` is not `null`.
- `paying_users.total` is present and numeric.
- `acquisition_channels` and `notable_channels` are populated when Vercel analytics has data.
- `missing_credentials` is absent.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `missing_credentials` includes Stripe or Vercel keys | Live env is missing one or more required vars | Add the missing env vars to the live runtime and to Vercel production settings |
| `stripe: 401` or `stripe: 403` in `errors` | Key lacks subscription-read access or is the wrong account | Replace `STRIPE_SECRET_KEY` with the correct live Stripe key |
| `vercel: 401` or `vercel: 403` in `errors` | Token lacks analytics access or project id is wrong | Replace `VERCEL_TOKEN` and confirm `VERCEL_PROJECT_ID` |
| `paying_users.total` is `0` unexpectedly | Stripe prices do not match the plan ids or all subscriptions are inactive | Reconcile the price ids and active subscriptions in Stripe |

