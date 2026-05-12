# DevOps Post-Wave 1 Checklist & Next Tasks

**Created**: 2026-05-13  
**Focus**: DevOps tasks to execute after Wave 1 send (May 13, 2026)  
**Owner**: DevOps Agent  

---

## Immediate Tasks (May 13-14)

### Task 1: Complete Wave 1 Send Execution Log

**What**: Fill in the WAVE1_SEND_EXECUTION_LOG_2026-05-13.md with monitoring data  
**When**: During and after May 13 send (7:45am-12:00pm ET)  
**Deliverable**: Completed execution log with health metrics, error data, and incident log  

**Checklist**:
- [ ] Pre-send health checks documented
- [ ] 5-minute interval health checks during send (8:00am-11:00am ET)
- [ ] Error rate tracking (if Sentry configured)
- [ ] Email delivery issues logged
- [ ] Post-send verification completed
- [ ] Summary report written

---

### Task 2: Analyze Wave 1 Send Results (May 14)

**What**: Review execution log and identify any patterns or issues  
**When**: Morning of May 14 (after send window closes)  
**Output**: 
- Wave 1 monitoring summary document
- Any critical issues requiring CTO attention
- Recommendations for Wave 2 send

**Questions to Answer**:
- [ ] Was `/api/health` consistently healthy?
- [ ] Were response times acceptable?
- [ ] Any email delivery issues?
- [ ] Any unexpected traffic patterns?
- [ ] Was Sentry error rate normal? (if configured)
- [ ] Any database performance issues?

---

## Pending CTO Credentials (Blocking Tasks)

### High Priority: Set SENTRY_DSN Environment Variables

**Task ID**: 1cf0c2a8  
**Status**: In Progress (blocked)  
**Impact**: Error monitoring during sends, production observability  

**What DevOps Needs**:
1. 5 environment variables from Sentry project:
   - `NEXT_PUBLIC_SENTRY_DSN`
   - `SENTRY_DSN`
   - `SENTRY_ORG`
   - `SENTRY_PROJECT`
   - `SENTRY_AUTH_TOKEN`

2. Once provided, DevOps will:
   - [ ] Set environment variables in Vercel dashboard (Production)
   - [ ] Trigger application redeploy
   - [ ] Run smoke test: `docs/runbooks/sentry-smoke-test.md`
   - [ ] Verify error capture working
   - [ ] Update production monitoring dashboard

**Benefit**: Real-time error tracking for all production issues  
**Runbook**: `output/CTO_HANDOFF_DEVOPS_BLOCKERS_2026-05-12.md`

---

### High Priority: Set Up External Uptime Monitoring

**Task ID**: 2750d5f4  
**Status**: In Progress (blocked)  
**Impact**: Production uptime alerting, SLA compliance, incident detection  

**What DevOps Needs**:
1. CTO to choose and configure a monitoring provider:
   - **Recommended**: UptimeRobot (free tier available)
   - **Alternatives**: Updown.io, Better Uptime, Statuspage.io
   
2. Monitor configuration:
   - URL: `https://consultthedead.com/api/health`
   - Method: GET
   - Expected status: 200
   - Check interval: 5-10 minutes
   - Alerts: Email + Slack (if available)

3. Once provider is set up, DevOps will:
   - [ ] Verify monitor is showing "Up" status
   - [ ] Trigger test alert
   - [ ] Verify alert delivery works
   - [ ] Document setup: `docs/runbooks/external-uptime-monitoring.md`
   - [ ] Add monitoring dashboard link to oncall runbooks

**Benefit**: Automatic incident detection 24/7, downtime alerts to team  
**Runbook**: `output/CTO_HANDOFF_DEVOPS_BLOCKERS_2026-05-12.md`

---

## Medium Priority: Post-Wave 1 Analysis Tasks

### Task 3: Performance Baseline Capture (May 15)

**What**: Document production performance metrics post-Wave 1  
**Why**: Establish baseline for comparing Wave 2 send performance  
**Output**: `output/PERFORMANCE_BASELINE_POST_WAVE1.md`

**Metrics to Capture**:
- Average response time: /api/health
- Average response time: /debates pages
- Database query time (if observable)
- Error rate (from Sentry, once configured)
- Memory/CPU usage (from Vercel metrics)
- Network throughput

**Commands**:
```bash
# Response time check (run multiple times)
curl -w "Response time: %{time_total}s\n" https://consultthedead.com/api/health

# Check Vercel deployment metrics (via dashboard)
# Vercel → consultthedead project → Analytics
```

---

### Task 4: Security & Access Audit (May 16)

**What**: Verify production access controls and secrets management  
**Why**: Ensure sensitive data (API keys, credentials) are not exposed  
**Output**: `output/SECURITY_AUDIT_2026-05-13.md`

**Audit Checklist**:
- [ ] No API keys in code or git history
- [ ] Environment variables not logged in CI
- [ ] Production secrets not in application logs
- [ ] Sentry is capturing errors (not sensitive data)
- [ ] Email credentials not exposed in logs
- [ ] Database credentials properly scoped
- [ ] Rate limiting in place on sensitive endpoints

---

## Low Priority: Infrastructure & Monitoring Improvements

### Task 5: Document Production Observability Stack (May 20)

**What**: Create comprehensive guide for production monitoring  
**Why**: Help team understand what data is available for incident response  
**Output**: `docs/runbooks/production-observability-guide.md`

**Sections**:
- Tools available (Vercel dashboard, Sentry, eventually UptimeRobot)
- How to check: CPU, memory, database connections, error rates
- How to interpret metrics and spot anomalies
- Alerting setup and thresholds
- Incident escalation procedures

---

### Task 6: Load Testing Preparation (May 25)

**What**: Document and prepare load testing for Wave 2+ sends  
**Why**: Ensure infrastructure can handle increased traffic from outreach  
**Output**: `docs/runbooks/load-testing-prep.md`

**Scope**:
- Estimate expected traffic from 10-person Wave 1 send
- Compare against Vercel Pro plan limits
- Identify bottlenecks (database, API, static assets)
- Document load testing tools and procedures
- Create baseline for Wave 2 readiness assessment

---

## Long-Term: Phase 2 DevOps Roadmap

### Post-Wave 1 Retrospective (May 30)

**What**: Team retro on Wave 1 send, deployment, and monitoring  
**Who**: DevOps + CTO + Marketing  
**Goals**:
- What went well?
- What could improve?
- Any production issues encountered?
- Recommendations for Wave 2+?

**Outputs**:
- Updated runbooks based on learnings
- New tasks for infrastructure improvements
- Updated SLAs/reliability targets

---

## Status Tracking

| Task | Assigned | Priority | Status | Due | Notes |
|------|----------|----------|--------|-----|-------|
| Wave 1 Execution Log | DevOps | P10 | In Progress | May 13 | Real-time during send |
| Wave 1 Results Analysis | DevOps | P9 | Pending | May 14 | Post-send analysis |
| Sentry Setup (CTO blocker) | CTO | P9 | Blocked | ASAP | Credentials needed |
| Uptime Monitor Setup (CTO blocker) | CTO | P9 | Blocked | ASAP | Provider config needed |
| Performance Baseline | DevOps | P8 | Pending | May 15 | After send stabilizes |
| Security Audit | DevOps | P8 | Pending | May 16 | Post-send verification |
| Observability Guide | DevOps | P7 | Pending | May 20 | Documentation |
| Load Testing Prep | DevOps | P7 | Pending | May 25 | For Wave 2 planning |

---

## Communication Plan

### Real-Time During Send (May 13)
- **DevOps**: Monitoring production every 5 minutes
- **Marketing**: Executing send, reporting status
- **CTO**: Standby for critical issues

**Escalation**: If `/api/health` returns error → notify CTO immediately

### Post-Send Summary (May 14, 2pm ET)
- **DevOps**: Present execution log and analysis
- **Marketing**: Share send results, reply tracking
- **CEO/CTO**: Assess Wave 1 success, approve Wave 2 timing

### Weekly Standups (May 15, 22, 29)
- **DevOps**: Infrastructure health, Sentry/monitoring status
- **Marketing**: Wave 1 replies, Wave 2 readiness
- **Dev**: Any production fixes or optimizations

---

## Related Documents

- `output/DEVOPS_WAVE1_MONITORING_PLAN_2026-05-13.md` — Detailed monitoring procedures
- `output/WAVE1_SEND_EXECUTION_LOG_2026-05-13.md` — Log template (fill during send)
- `output/CTO_HANDOFF_DEVOPS_BLOCKERS_2026-05-12.md` — CTO action items (Sentry, monitoring)
- `docs/runbooks/sentry-smoke-test.md` — Sentry verification procedures
- `docs/runbooks/external-uptime-monitoring.md` — Uptime monitoring setup

---

**Created by**: DevOps Agent | **Updated**: 2026-05-13 | **Status**: Ready
