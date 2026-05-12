# Release & Rollback Playbook

**Purpose**: Guide CTO through production releases and emergency rollback.

---

## Release Steps

1. Merge PR to `main` (all CI checks must pass)
2. Vercel auto-deploys (3-5 minutes)
3. Verify `/api/health` returns `200 OK`
4. Run smoke tests against production
5. Check Sentry for error spikes

**Typical Window**: 15-25 minutes

---

## Emergency Rollback

### Via Vercel Dashboard (Fastest)
1. Go to https://vercel.com/consult-the-dead/deployments
2. Find previous stable deployment
3. Click "..." menu → "Promote to Production"
4. Verify `/api/health` returns `200 OK`

**Duration**: < 2 minutes

### Via Git (If Dashboard Fails)
```bash
git revert HEAD
git push origin main
# Vercel redeploys automatically
```

---

## Monitoring (72 Hours)

**Hour 0-6** (critical):
- Check Sentry error spike (>200% = consider rollback)
- Monitor `/api/health` every 2 minutes
- Check Vercel response time (p95 < 500ms)

**Hour 6-24**:
- Daily spot-checks of Sentry and feature smoke tests
- Verify database backups

**Hour 24-72**:
- Standard monitoring resumes
- If stable, declare release complete

---

**Decision Matrix**:
- 🔴 Critical (data loss, security): IMMEDIATE ROLLBACK
- 🟠 High (feature broken, 10%+ errors): ROLLBACK likely
- 🟡 Medium (<5% errors): Assess + fix forward or rollback
- 🟢 Low (minor UX glitch): Fix forward

---

**Reference**: [Pre-Deployment Checklist](pre-deployment-checklist.md)
