# Branch-Coverage Exception Registry

This file is the permanent, auditable record of every approved deviation from the
branch-coverage gate defined in [`docs/coverage-gate-policy.md`](coverage-gate-policy.md).

An entry here does **not** mean the gap is acceptable forever — each row carries an
owner and a target date for follow-up closure.  When a gap is closed the row should
be marked **RESOLVED** (do not delete it; history is useful).

---

## Active Exceptions

| File / Module | Uncovered Branch Path | Why Skipped | Follow-up Task | Owner | Target Date | Status |
|---|---|---|---|---|---|---|
| `website/src/app/insights/[slug]/page.tsx` | `accentForSlug("isaac-newton")` fallback; `formatPublishedDate` catch branch | Pre-existing defensive paths exercised by the shared insight page; new SEO listicle tests cover launched pages directly while uncovered branches belong to older collision/date fallbacks | `219eebec-f47b-469b-83d2-60eadb19552c` (PR #303) | dev | 2026-05-19 | **RESOLVED** — PR #303 merged 2026-05-12 |
| `website/src/lib/frameworks.ts` | `ERA_FALLBACK` lookup; construct-count default fallback; incident fallback in `getFramework()` | Pre-existing fallback branches in the framework loader; new SEO listicle tests cover the added Steve Jobs record but remaining misses are legacy sparse-data branches | `c2eb93e7-255e-4a84-b371-1bd74cf4e233` | dev | 2026-05-19 | **RESOLVED** — merged PR #314 (cc7c3fd3); frameworks.ts at 100% branch coverage |
| `scripts/send-outreach.ts` (lines 502–516) | `if (isDirectInvocation(...))` direct-execution guard | Only fires when the script is invoked via `tsx` at runtime; cannot be exercised inside Vitest's module environment without spawning a child process | — | — | — | **PERMANENT** — CLI bootstrap; not in scope for unit tests |
| `scripts/founder-checkpoint/pull-metrics.ts` (lines 37–61) | `main()` CLI bootstrap (including the `catch` fallback path) | CLI entry point; unit-test coverage gate runs on `./metrics.ts` directly.  Smoke-tested by AR at runtime (see README) | — | — | — | **PERMANENT** — CLI bootstrap; not in scope for unit tests |
| `scripts/founder-checkpoint/metrics.ts` (lines 334–348) | `defaultFetcher` global-fetch wrapper | Thin adapter over the global `fetch` API; every unit test substitutes via the `Fetcher` injection point.  Exercised at runtime when AR runs the CLI live | — | — | — | **PERMANENT** — runtime-only adapter; injected out in all unit tests |

---

## Resolved Exceptions

| File / Module | Uncovered Branch Path | Closed By | Closed Date |
|---|---|---|---|
| `website/src/app/insights/[slug]/page.tsx` | `accentForSlug("isaac-newton")` fallback; `formatPublishedDate` catch branch | PR #303 (merged 2026-05-12) | 2026-05-12 |
| `website/src/lib/frameworks.ts` | `ERA_FALLBACK` lookup; construct-count default fallback; incident fallback in `getFramework()` | PR #314 (cc7c3fd3, merged) | 2026-05-15 |

---

## How to Add an Exception

1. **Get CTO approval first.**  Per the coverage gate policy, only the CTO (or an
   explicitly delegated reviewer) may approve a temporary exception.

2. **Add a row to the "Active Exceptions" table** with all required fields:

   | Column | What to put here |
   |---|---|
   | File / Module | Repo-relative path, plus line range if the ignore is narrow |
   | Uncovered Branch Path | The exact condition or code path that is not hit by tests |
   | Why Skipped | One or two sentences — be specific enough that a future reader can evaluate whether the skip is still justified |
   | Follow-up Task | Task/issue ID with a link if available; use `—` only for **PERMANENT** entries |
   | Owner | GitHub username of the person who will close the gap |
   | Target Date | ISO date (`YYYY-MM-DD`); use `—` only for **PERMANENT** entries |
   | Status | `OPEN`, `IN PROGRESS — <PR link>`, `PERMANENT`, or `RESOLVED` |

3. **Reference this registry in your PR body.**  The PR template checklist requires
   a link to the specific row.

4. **Close the gap by the target date.**  When the follow-up work lands, update the
   row's Status to `RESOLVED`, then move the row to the "Resolved Exceptions" table
   and record the closing PR/commit.

5. **Use `/* c8 ignore start */ … /* c8 ignore stop */` or `/* v8 ignore */`
   comments sparingly** and only for code paths that genuinely cannot be exercised
   inside the unit-test environment (e.g. CLI bootstrap guards, OS-level adapters).
   Every such comment must have a corresponding row in this registry.
