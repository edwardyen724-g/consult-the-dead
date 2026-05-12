# Decisions Five-Page Expansion - Release State (2026-05-12)

## What shipped

PR #292 (`wanman/decisions-five-page-expansion`) added five new entries to
`website/content/decisions.ts` and a route regression test that asserts all
five slugs are present in `generateStaticParams()`.

### New pages

| Slug | Title | Recommended Council |
| --- | --- | --- |
| `should-i-fire-my-cofounder` | Should I Fire My Cofounder? | Machiavelli, Sun Tzu, Marcus Aurelius |
| `should-i-pivot-or-persist` | Should I Pivot or Persist? | Isaac Newton, Marie Curie, Sun Tzu |
| `should-i-take-this-job-offer` | Should I Take This Job Offer? | Marcus Aurelius, Benjamin Franklin, Machiavelli |
| `should-i-sell-my-startup` | Should I Sell My Startup? | Andrew Carnegie, John D. Rockefeller, Machiavelli |
| `should-i-shut-down-my-startup` | Should I Shut Down My Startup? | Marcus Aurelius, Seneca, Sun Tzu |

### Coverage

The accompanying route regression test (`src/app/decisions/[slug]/page.test.tsx`)
covers all five new slugs via `generateStaticParams()`. Post-merge coverage:
Statements 99.45%, Branches 98.2%, Functions 100%, Lines 99.8%.

## SEO Impact

Each page targets a distinct high-intent founder search query:

- **fire-my-cofounder** — `should I fire my cofounder`, `cofounder conflict what to do`
- **pivot-or-persist** — `should I pivot or persist`, `how to know when to pivot a startup`
- **take-this-job-offer** — `should I take this job offer`, `how to evaluate a job offer`
- **sell-my-startup** — `should I sell my startup`, `startup acquisition decision`
- **shut-down-my-startup** — `should I shut down my startup`, `when should I shut down my startup`

These queries sit in the high-intent founder segment alongside the existing
decisions library, expanding surface coverage into cofounder conflict, exit
strategy, and career crossroads.

## Decisions Library Status

With this batch:

| Batch | Pages | Slugs |
| --- | --- | --- |
| Batch 1 (pre-292) | 7 | raise-vc-or-bootstrap, quit-job-to-start-company, raise-a-seed-round, hire-first-employee, join-an-accelerator, hire-cto-or-technical-cofounder, launch-now-or-wait-for-perfect |
| Batch 2 — PR #292 | 5 | fire-my-cofounder, pivot-or-persist, take-this-job-offer, sell-my-startup, shut-down-my-startup |
| **Total live** | **12** | — |

The combined library now covers the major inflection points of the founder
journey: fundraising, hiring, co-founder dynamics, launch timing, exit, and
career pivots.

## Status

PR #292 merged into `master`. Release note filed 2026-05-12.
