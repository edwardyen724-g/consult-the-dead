# DevOps Wave 1 Monitoring Plan — 2026-05-13

**Send Window**: 8:00am–11:00am ET  
**DevOps Watch Window**: 7:45am–12:00pm ET  
**Status**: ✅ Ready to monitor

---

## Pre-Send (7:45am–8:00am ET)

### System Health Check

```bash
# Verify production is healthy before send begins
curl -s https://consultthedead.com/api/health | jq .

# Expected response:
# {
#   "status": "ok",
#   "commit": "<recent-hash>",
#   "uptime": <seconds>,
#   "env": "production"
# }
```

**Check List**:
- [ ] `/api/health` returns HTTP 200
- [ ] `status` field is `"ok"`
- [ ] `commit` is recent (not `"dev"`)
- [ ] `uptime` is positive
- [ ] `env` is `"production"`

### Pre-Send Debate Page Verification

Test the 3 debate pages that will be sent:

```bash
# Test load times and 200 responses
curl -s -w "%{http_code}" https://www.consultthedead.com/debates/abhishek-chakravarty
curl -s -w "%{http_code}" https://www.consultthedead.com/debates/jonathan-chan
curl -s -w "%{http_code}" https://www.consultthedead.com/debates/alex-van-le
```

**Pass Criteria**: All return HTTP 200, load in <2 seconds

---

## During Send (8:00am–11:00am ET)

### What to Monitor

#### 1. API Health (Continuous)

Monitor for any degradation or errors:

```bash
# Run every 5 minutes
while true; do
  echo "$(date): $(curl -s https://consultthedead.com/api/health | jq .status)"
  sleep 300
done
```

**Alert Threshold**: If any response fails or status ≠ `"ok"`, notify immediately

#### 2. Error Rate (Every 10 minutes)

Once Sentry is configured, check the Issues dashboard:
- Expected: 0–1 new issues per hour (normal traffic)
- Alert if: >5 new issues in 10 minutes (indicates problem)

#### 3. Response Time Trend

Monitor that pages load consistently:
- Expected: 800ms–1.5s for debate pages (typical Next.js)
- Alert if: Any page takes >3 seconds consistently

#### 4. Email Delivery (Passive)

Monitor the team inbox for:
- Hard bounces → indicates delivery failure
- Auto-replies → note sender's auto-response
- Invalid email errors → recipient unreachable

---

## Post-Send (11:00am–12:00pm ET)

### Verification Checklist

- [ ] All 10 sends completed (verify in marketing-notes.md)
- [ ] No 500-series errors in production during send window
- [ ] No Sentry Issues related to email/Agora (unless pre-existing)
- [ ] `/api/health` still returning 200 OK
- [ ] Debate pages responsive and fast
- [ ] No database connectivity issues

### Monitoring Window Close

Once post-send verification is complete:
- Note any issues encountered during send
- Update `output/WAVE1_SEND_EXECUTION_LOG.md` with timing and status
- Declare monitoring window closed

---

## If Issues Occur

### Critical Issues (Immediate Action)

**Symptom**: Production is down (HTTP 500 on `/api/health`)  
**Action**:
1. Check Vercel deployment status (dashboard or CLI)
2. Review recent deployments
3. Check CI pipeline for recent failures
4. Notify CTO immediately

**Symptom**: Debate pages not loading (HTTP 500 or timeout)  
**Action**:
1. Check Vercel Function logs
2. Verify database connectivity
3. Check for API rate limit exhaustion
4. Notify CTO + Edward

### Non-Critical Issues (Log & Monitor)

**Symptom**: Elevated error rate in Sentry  
**Action**:
1. Review Issues dashboard for patterns
2. If errors are pre-existing (not related to send), no action needed
3. If new errors appear, investigate stack traces

**Symptom**: Email bounces or delivery failures  
**Action**:
1. Note the specific failures
2. Log in marketing-notes.md for follow-up
3. Not a DevOps issue unless email infrastructure is down

---

## Post-Send Documentation

After send completes, fill in:

- **Execution Log**: `output/WAVE1_SEND_EXECUTION_LOG.md`
  - Timestamp of each send
  - Any issues encountered
  - Email delivery status
  
- **DevOps Handoff**: `output/DEVOPS_WAVE1_MONITORING_RESULTS.md`
  - Health check results
  - Error metrics (Sentry, if available)
  - Response time trends
  - Deployment status
  - Any alerts triggered

---

## Tools & Access

### Vercel Dashboard
- URL: https://vercel.com/consultthedead
- Check: Deployments, Function Logs, Environment Variables

### Sentry (Once Configured)
- URL: https://sentry.io/projects/consult-the-dead
- Check: Issues, Performance, Alerts

### GitHub Actions
- URL: https://github.com/edwardyen724-g/consult-the-dead/actions
- Check: Recent CI runs for failures

### Local Health Check
```bash
cd /Users/haotingyen/projects/consult-the-dead/.wanman/worktree
npm run test        # Verify tests still pass
npm run build       # Verify build succeeds
npm run lint        # Verify no new linting issues
```

---

## Communication Plan

### Escalation Chain
1. **Minor issue** (non-critical, < 5 min impact): Log and monitor
2. **Major issue** (production down, > 5 min impact): Notify CTO immediately
3. **Critical issue** (security, data loss): Notify CTO + CEO immediately

### Status Updates
- **During send**: Real-time updates if issues occur
- **Post-send**: Summary report within 2 hours

---

## Related Documents

- `output/MARKETING_WAVE1_FINAL_CHECKLIST_2026-05-13.md` — Pre-send readiness
- `docs/runbooks/external-uptime-monitoring.md` — Monitoring setup (once provider configured)
- `docs/runbooks/sentry-smoke-test.md` — Sentry verification (once DSN configured)
- `output/CTO_HANDOFF_DEVOPS_BLOCKERS_2026-05-12.md` — Sentry/monitoring setup blockers

---

**Prepared by**: DevOps Agent  
**Status**: Ready to monitor  
**Execution Date**: 2026-05-13  
