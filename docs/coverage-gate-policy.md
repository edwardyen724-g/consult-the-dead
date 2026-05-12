# Coverage Gate Policy

This document defines the review rule for code changes that report both branch
and statement coverage.

## Policy

- Treat branch coverage as a required merge gate for any touched file that is
  expected to be test-covered.
- Do not approve a PR just because statement coverage looks healthy if branch
  coverage fails the gate or leaves an important conditional path untested.
- Use statement coverage as supporting evidence only. It does not override a
  branch-coverage miss.

## Review Checklist

Before approving a PR, verify:

1. The touched files are covered by an appropriate test path.
2. Branch coverage is at or above the accepted threshold for the relevant
   helper/module.
3. Any uncovered branch is explained in the PR body, named explicitly, and
   tracked with a follow-up task.
4. The test plan distinguishes between unit coverage and integration-only
   coverage so reviewers do not confuse the two.

## PR Template Checklist

The PR template must force authors to confirm the branch-coverage gate before
review starts.

- The template must call out that branch coverage, not statement coverage, is
  the approval gate.
- The template must require any exception to name the missing branch path,
  follow-up task ID and link, owner, and target date.
- The template must make it obvious when a PR is relying on statement coverage
  while leaving a branch path untested.

## Template Fields

The PR template should include these explicit prompts so authors can fill in the
gate evidence without guessing the required shape:

- a checkbox confirming branch coverage is the approval gate
- a checkbox confirming the touched files meet the branch threshold
- a checkbox confirming any exception is documented with the exact uncovered
  branch path and linked follow-up task
- fields for the missing branch path, reason, follow-up task ID and link,
  owner, and target date
- a test-plan section that separates unit coverage from integration-only
  coverage

## Route Handler Rule

For route handlers and other `src/app/**` entry points, keep business logic in
`src/lib/` helpers where Vitest can measure branches directly. Thin wrappers may
remain in the route file, but any branching logic that matters to correctness
belongs in a helper with explicit unit tests.

## Exception Escalation

Only the CTO or an explicitly delegated reviewer may approve a temporary
exception to the branch-coverage gate.

An exception must include:

- the exact file or helper path
- the reason the branch could not be covered before merge
- the follow-up task ID that will close the gap
- the owner and target date for the follow-up

If those details are missing, the reviewer should block the merge and request
changes.

## Example

PR #80 merged on 2026-05-10 with `company-builder/src/app/api/research/route.ts`
showing 68.42% branch coverage and 95.8% statement coverage. That is the
failure mode this policy is meant to prevent: a PR can look acceptable on
statement coverage while still leaving important branch paths unverified.

## Exception Records

Approved branch-coverage exceptions, ordered by merge date. Each entry is the
permanent record for the CTO approval granted at merge time.

---

### PR #271 — feat(seo): add 3 SEO listicle insight pages for organic traffic

**Merged:** 2026-05-12  
**Approved by:** CTO

#### Exception 1

| Field | Value |
|---|---|
| File | `website/src/app/insights/[slug]/page.tsx` |
| Missing branch paths | `accentForSlug("isaac-newton")` fallback; `formatPublishedDate` catch branch |
| Reason | Pre-existing defensive paths in the shared insight page; the new SEO listicle tests exercise the launched pages directly while the uncovered branches belong to older collision/date fallbacks |
| Follow-up task | `219eebec-f47b-469b-83d2-60eadb19552c` (PR #303 in progress) |
| Owner | dev |
| Target date | 2026-05-19 |
| Status | **IN PROGRESS** — PR #303 open (`wanman/insights-coverage-gap-219eebec`) |

#### Exception 2

| Field | Value |
|---|---|
| File | `website/src/lib/frameworks.ts` |
| Missing branch paths | `ERA_FALLBACK` lookup; construct-count default fallback; incident fallback in `getFramework()` |
| Reason | Pre-existing fallback branches in the framework loader; the new SEO listicle tests cover the added Steve Jobs record, but the remaining misses are legacy sparse-data branches |
| Follow-up task | `c2eb93e7-255e-4a84-b371-1bd74cf4e233` |
| Owner | dev |
| Target date | 2026-05-19 |
| Status | **OPEN** — not yet addressed |
