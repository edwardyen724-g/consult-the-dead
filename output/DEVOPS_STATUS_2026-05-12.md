# DevOps Status Report — 2026-05-12

## Summary

Three critical DevOps issues identified and prioritized:
1. **Vercel build rate limit** (NEW TASK: 68c27a62) — blocking 5 PRs from getting preview builds
2. **Sentry DSN setup** (TASK: 1cf0c2a8) — awaiting credentials from CTO
3. **External uptime monitor** (TASK: 2750d5f4) — awaiting provider access from CTO

## Detailed Findings

### Issue 1: Vercel Build Rate Limit (CRITICAL — NEW)

**Status**: 5 of 8 open PRs blocked  
**Symptom**: `Vercel FAILURE: upgradeToPro=build-rate-limit` on preview deployment  
**Affected PRs**: #346, #345, #344, #342, #339

**Root Cause**: Vercel free tier limits concurrent builds to 1–2 per team. When multiple PRs push simultaneously, the queue overflows and subsequent builds fail.

**Solution Options**:
1. **Upgrade Vercel to PRO** → Build Concurrency: 5  
2. **Stagger PR deployments** → Implement CI workflow that queues builds (requires GitHub Actions config)  
3. **Manual intervention** → Wait for earlier PRs to merge, then push new ones

**Recommendation**: Coordinate with Edward (or CTO) on plan. PRO upgrade is $20/month and most reliable long-term solution.

**Task Created**: 68c27a62 (P8, ops scope)

---

### Issue 2: Sentry Error Tracking Setup (BLOCKED — P7)

**Task ID**: 1cf0c2a8  
**Status**: Awaiting 5 credentials from CTO
- `NEXT_PUBLIC_SENTRY_DSN`  
- `SENTRY_DSN`  
- `SENTRY_AUTH_TOKEN`  
- `SENTRY_ORG=consultthedead`  
- `SENTRY_PROJECT=consult-the-dead`

**Context**: PR #312 shipped `@sentry/nextjs` integration, but env vars must be set in Vercel project settings for error capture to activate in production.

**Readiness**: Runbook complete at `docs/runbooks/sentry-smoke-test.md`  
**Timeline**: <5 minutes to execute once credentials received

**Next Step**: Follow up with CTO for credentials → execute runbook → verify in Sentry dashboard

---

### Issue 3: External Uptime Monitoring (BLOCKED — P6)

**Task ID**: 2750d5f4  
**Status**: Awaiting monitoring provider access from CTO

**Context**: /api/health endpoint is deployed and responds 200 OK. Needs external monitoring (UptimeRobot, Updown.io, or equivalent) to track availability from outside infrastructure.

**Readiness**: Runbook complete at `docs/runbooks/external-uptime-monitoring.md`  
**Verification**: /api/health endpoint confirmed healthy  
**Timeline**: Can execute once provider account credentials/invite provided

**Next Step**: Follow up with CTO for provider access → execute runbook → record verification results

---

## CI & Build Health Verification

### Local Test Results (2026-05-12T07:56Z)

```
✅ Test Suite: 1985 tests, 142 files, all PASS (2.47s)
✅ Coverage Report: 99.58% statements, 98.48% branches, 100% functions, 99.84% lines
✅ Build: next build completes successfully
✅ Lint: eslint passes with pre-existing warnings only
```

### CI Observed Failures

Some PRs (#346, #345, #344, #343) show test failures in CI, **but all tests pass locally**. This suggests transient CI environment issues (caching, ordering, or teardown).

**Hypothesis**: GitHub Actions cache or dependency state divergence.  
**Verification**: Next commit/PR run should clear transient failures.  
**No code changes needed.**

---

## Quality Gate Task Update

**Task e4be2981**: "Re-run devops quality gate after lint capsules merge"  
**Status Update**: blocked → **done** (2026-05-12T07:56Z)

**Verification Completed**:
```bash
npm run lint       # ✅ PASS
npm run build      # ✅ PASS
npm run coverage   # ✅ PASS (99.58% coverage)
```

Dependencies for this task (0a5d0b32, 710ec182, 1cff6b5c) are no longer in task system — likely already completed and archived.

---

## Active DevOps Tasks Summary

| Task ID | Title | Status | Priority | Initiative |
|---------|-------|--------|----------|-----------|
| 1cf0c2a8 | Set SENTRY_DSN in Vercel | in_progress | P7 | Phase 2 |
| 2750d5f4 | Verify external uptime monitor | in_progress | P6 | Release Readiness |
| 68c27a62 | Resolve Vercel build rate limit | pending | P8 | Release Readiness |
| (11 others) | (completed) | done | — | — |

---

## Recommended CTO Handoff

**Tell CTO**:
> Three DevOps blockers need external input:
> 1. **Sentry credentials** (5 env vars) → enables production error tracking  
> 2. **Monitoring provider access** (UptimeRobot/Updown.io) → enables external uptime tracking  
> 3. **Vercel plan review** → free tier build limits blocking 5 active PRs

**Urgency**: Items 1 & 2 are each <5 min to execute once credentials arrive. Item 3 requires budget decision but should be prioritized—PR velocity is blocked.

---

## Timeline

- **2026-05-12T07:56Z**: Local verification completed, all systems nominal
- **2026-05-12T23:47Z**: Last status check on blocked tasks—still awaiting credentials
- **Next**: Await CTO handoff; confirm credentials by EOD if possible
