# Coverage Gate Policy

This is the canonical release-gate reference for Consult The Dead.
If any other doc disagrees, update the other doc to match this one.

## What enforces the gate

- `.github/workflows/ci.yml` runs `lint`, `npm run coverage`, and `npm run build`
  on every push and pull request.
- `website/vitest.config.ts` is the source of truth for coverage thresholds.
- `GOAL_FOUNDER.md` sets the CTO review bar: the coverage gate stays at 95%, and
  bug-fix-only PRs that do not move conversion or unblock conversion work go to
  the back of the queue.

## Current coverage target

The active vitest thresholds are:

```ts
thresholds: {
  lines: 95,
  branches: 95,
  functions: 95,
  statements: 95,
}
```

The tracked coverage set in `website/vitest.config.ts` currently includes:

- `src/app/pricing/layout.tsx`
- `src/lib/pricing-copy.ts`

Coverage exclusions currently cover:

- `src/**/*.d.ts`
- `src/**/*.test.ts`
- `src/**/*.test.tsx`
- `src/middleware.ts`

## Merge standard

A PR is release-ready only when:

1. `npm run coverage` passes.
2. `npm run build` passes.
3. The PR does not lower coverage below 95% on any tracked surface.
4. The PR description explains any intentional coverage or test-scope tradeoff.

## PR checklist

Use this checklist in the PR description until a formal template is added:

- [ ] I ran `npm run coverage` locally.
- [ ] I ran the relevant targeted tests for the change.
- [ ] I did not introduce new uncovered logic in a tracked file.
- [ ] If I changed route or handler logic, I extracted branching behavior into a
  testable helper in `src/lib/`.
- [ ] If this is a thin deterministic route handler, I documented why it is safe
  to keep thin instead of adding helper coverage.
- [ ] If this PR needs a coverage exception, I linked the follow-up task that
  restores the gate.

## Exception process

There are only two acceptable exception paths:

1. **Thin-handler waiver**: route handlers that are genuinely thin wrappers
   may stay thin and rely on integration coverage, but branching logic must be
   extracted into `src/lib/` helpers.
2. **Explicit CTO waiver**: if a PR must ship with a temporary coverage gap,
   the PR description must state the reason, the exact file or threshold impact,
   and the follow-up work that restores the gate. The CTO must approve the
   exception before merge.

Silent waivers are not allowed. If the gate cannot be met, the work is not
release-ready yet.
