# Feedback Report

## 2026-05-11

- Signal: PR #80 (`Add regression coverage for company-builder research API source aggregation and fallback behavior`) merged on 2026-05-10 with `company-builder/src/app/api/research/route.ts` at 95.8% statements but 68.42% branch coverage.
- Risk: reviewers can be misled by a healthy statement-coverage number and miss untested fallback/error branches.
- Action taken: added `docs/runbooks/coverage-gate-policy.md` to make branch coverage a hard review gate and document the exception escalation path.
- Signal: `website/README.md` route inventory drifted behind Sprint 4 polish; reconciled the public route map with the shipped `/agora`, `/debates`, `/frameworks`, and `/insights` dynamic 404 surfaces plus the nested API routes under `/api/*`.
- Signal: `website/README.md` still claimed a shipped `/feed.xml` RSS surface even though `website/src/app/` only exposes `sitemap.ts` and `robots.ts`; updated the README to explicitly defer RSS until a matching route ships.
- Signal: `MARKETING_STRATEGY.md` still had stale `TBD` language for email-subscriber targets and the Instagram handle choice; updated the subscriber row to point at the Beehiiv dashboard source of truth and marked `@consultthedead` as the resolved handle with defensive registrations.
- Signal: `docs/phase0-pricing-page-copy.md` still promised placeholder customer testimonials, but the shipped `/pricing` page uses anonymized scenario cards instead; updated the doc to match release state and added a guardrail note against inventing social proof.
