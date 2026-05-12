# Vercel PR Preview Rate Limit — Release Note (2026-05-12)

**PR:** #371  
**Area:** Vercel PR preview / deployment gate  
**Status:** Verified blocker on PR preview; not an application regression

---

## Summary

PR #371's Vercel preview deployment reproduces the free-tier build limit. The preview status
reports `Vercel FAILURE: upgradeToPro=build-rate-limit`, and Vercel also returns
`Resource is limited - try again in 24 hours (code: api-deployments-free-per-day)`. CI passes,
so the blocked gate is Vercel quota, not code health.

---

## Verified Behavior

- The preview deployment fails with the Vercel free-tier build limit message.
- The same PR still passes CI, so the failure is isolated to the preview deployment gate.
- The preview state remains blocked until the quota resets or the project moves off the
  free-tier deployment limit.

---

## Unblock Story

1. Wait for the 24-hour deployment window to reset and rerun the preview.
2. If the failure repeats on a fresh retry, move the team off the free-tier deployment limit.
3. Keep PR #371 blocked until the preview deploys cleanly.

---

## Status

Verified 2026-05-12. This note stays in the release-state index so the preview quota issue and
its unblock path remain visible while the deployment gate is still rate-limited.
