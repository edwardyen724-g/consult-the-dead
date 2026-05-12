# Pre-Deployment Checklist

**Purpose**: Verify code quality, test coverage, build integrity, and deployment readiness before promoting to production.

**Expected Duration**: 5-10 minutes (automated gates) + manual runbook execution

---

## Phase 1: Code Quality (Automated)

- [ ] Run `npm run lint` in `website/` → All files pass (0 errors, pre-existing warnings OK)
- [ ] Run `npm run coverage` → Coverage ≥ 95%
- [ ] Run `npm run build` → Build completes without errors

## Phase 2: Framework Validation

- [ ] Check if `frameworks/` files modified
- [ ] If YES: Run `python -m framework_forge.validation.placeholder_citations frameworks/<slug>`
- [ ] If NO: Skip this phase

## Phase 3: Release Notes & Docs

- [ ] Release note file exists in `docs/release-notes/` (date-stamped)
- [ ] README and runbooks updated if applicable
- [ ] No broken links or stale procedures

## Phase 4: Environment Variables

- [ ] All production env vars set in Vercel dashboard
- [ ] `ANTHROPIC_API_KEY`, `SENTRY_DSN`, `CLERK_SECRET_KEY` configured
- [ ] No env vars logged in CI output

## Phase 5: Smoke Tests

- [ ] Select runbooks based on changed files
- [ ] Run against Vercel PR preview
- [ ] Document results in PR

## Phase 6: Sign-Off

- [ ] All phases 1-5 complete
- [ ] PR approved by CTO
- [ ] Coverage gate ≥95% achieved

---

**Checklist**: 7 phases, 15-30 minutes typical  
**Reference**: [Release & Rollback Playbook](release-and-rollback-playbook.md), [Runbooks Index](runbooks/index.md)
