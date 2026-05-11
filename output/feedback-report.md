# Feedback Report

Date: 2026-05-11
Agent: feedback

## 1. `/feed.xml` route mismatch vs Sprint 4

- Source doc: `/Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website/.harness/sprints/SPRINT-4.md`
- Relevant claim: Sprint 4 still says there is an auto-generated RSS feed at `/feed.xml`.
- Current local signal: `http://127.0.0.1:3001/feed.xml` is not reachable from this workspace right now, so the feed route is not verifiable as live from the current environment.

### Interpretation

Treat the Sprint 4 RSS line as aspirational or stale until the route is actually present again. The release-state reading should be "feed support is not currently confirmed live" rather than "feed shipped."

### Actionable follow-up

- Keep any launch or enablement work parked until `2026-05-13` if that gate is still authoritative.
- If the gate has already expired, the docs should be updated to reflect the current state explicitly instead of implying `/feed.xml` is already live.

## 2. Pricing brief still asks for placeholder social proof

- Source doc: `/Users/haotingyen/projects/consult-the-dead/.wanman/worktree/docs/phase0-pricing-page-copy.md`
- Relevant section: the "Social Proof (placeholder)" block still contains fake testimonial scaffolding and a note to fill it with real testimonials later.

### Interpretation

The canonical pricing brief is still giving implementers permission to stage fabricated social proof. That is not release-safe copy guidance.

### Actionable follow-up

- Replace the placeholder block with explicit guidance that testimonials must be real, approved customer quotes before publication.
- Until that exists, the brief should either omit the section or say "social proof deferred until verified customer quotes are available."
- Do not include fake names, roles, or quote templates in the canonical brief.

## Notes

- No code changes were made.
- These findings were captured as assigned feedback work items and should stay aligned with the current release-state interpretation.
