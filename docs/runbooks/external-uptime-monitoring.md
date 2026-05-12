# External Uptime Monitoring Runbook

**Purpose**: Set up and verify external uptime monitoring for the `/api/health` endpoint using a third-party monitoring service (e.g., UptimeRobot, Updown.io, Statuspage, etc.).

**Frequency**: Run once when configuring external monitoring, then as-needed when rotating monitoring providers or alert contacts.

---

## Prerequisites

- **Endpoint**: `/api/health` must be deployed and responding with HTTP 200 + JSON health status
- **Monitoring Service Account**: Active account with UptimeRobot, Updown.io, or equivalent service
- **Alerting Channel**: Email, Slack, or PagerDuty contact configured in the monitoring service

---

## Step 1 — Verify /api/health is accessible

### From local machine

```bash
# Test the production endpoint
curl -sf https://consultthedead.com/api/health | jq .

# Or a preview URL if testing on staging
BASE_URL=https://your-preview.vercel.app
curl -sf "$BASE_URL/api/health" | jq .
```

**Expected response**:
```json
{
  "status": "ok",
  "commit": "a1b2c3d4e5f6...",
  "uptime": 123.45,
  "env": "production"
}
```

**Pass criteria**:
- HTTP 200 response
- `status` field equals `"ok"`
- `commit` is a non-empty git SHA (not `"dev"` or `"unknown"`)
- `uptime` is a positive number in seconds
- `env` field indicates the deployment environment

### From monitoring service dashboard

1. Log into your monitoring service (UptimeRobot, Updown.io, etc.)
2. Create a new monitor with these settings:
   - **Monitor Type**: HTTP(S)
   - **URL**: `https://consultthedead.com/api/health`
   - **Method**: `GET`
   - **Expected HTTP Code**: `200`
   - **Check Interval**: `5` or `10` minutes (adjust based on plan)
   - **Timeout**: `30 seconds`
   - **Retries**: `2` (retry failed checks twice before alerting)

---

## Step 2 — Configure alerting

### Alert Channels

Set up at least one alert channel:

1. **Email** (basic) — sends uptime alerts to one or more email addresses
2. **Slack** (recommended for team notification) — integrates with Slack channels
3. **PagerDuty** — for on-call escalations
4. **SMS/Phone** — for critical outages (optional)

### Alert Rules

Configure notifications for:
- **Down**: Monitor goes down (immediately after retries)
- **Up**: Monitor comes back up (after 2+ consecutive OK checks)
- **Monthly Summary**: Uptime report (usually auto-sent by service)

### Recommended recipients

- **Down alerts**: #devops or team Slack channel, CTO email
- **Daily/Weekly summaries**: Team email alias

---

## Step 3 — Trigger a test alert

### Option A — Temporarily disable the endpoint

1. In `website/src/app/api/health/route.ts`, change the response to HTTP 500:
   ```ts
   export async function GET() {
     return Response.json({ status: "error" }, { status: 500 });
   }
   ```
2. Deploy the change (or test locally with `BASE_URL=http://127.0.0.1:3000 npm run dev`)
3. Wait 5–15 minutes for the monitoring service to detect the failure
4. Check that an alert fires in Slack, email, or PagerDuty
5. **Revert the change immediately** and re-deploy
6. Confirm the "Up" alert fires once the endpoint recovers (wait 2–5 minutes)

### Option B — Test alert feature in the monitoring service UI

Most services (UptimeRobot, Updown.io) have a "Send test alert" button. Use this if you prefer not to modify the endpoint:

1. Go to the monitor settings in the service dashboard
2. Click "Send test alert" or "Test notification"
3. Verify the alert arrives in your configured channel
4. This confirms the integration is wired correctly without affecting production

---

## Step 4 — Document the monitoring setup

Create or update a `MONITORING.md` file in the repo root with:

```markdown
## External Uptime Monitoring

- **Service**: [UptimeRobot / Updown.io / etc.]
- **Endpoint**: https://consultthedead.com/api/health
- **Check Interval**: 5 minutes
- **Status Page**: [URL to public status page, if available]
- **Alert Channels**:
  - Slack: #devops
  - Email: team@consultthedead.com
- **Last Verified**: [Date of last successful test]
```

Also update `docs/runbooks/index.md` to include a reference to this runbook.

---

## Step 5 — Verify the Monitoring Dashboard

1. Log into your monitoring service
2. Confirm the monitor shows **"Up"** status
3. View the **Uptime report** (should show 100% or near-100% for a newly created monitor)
4. Check the **Response time** graph — should show consistent sub-second responses
5. Review **Recent checks** — verify checks are occurring at the configured interval
6. Confirm **Alert history** shows the test alert (if you triggered one in Step 3)

---

## Step 6 — Set up a public status page (optional)

If you want to share uptime status with users:

1. Many monitoring services (UptimeRobot, Statuspage) provide public status pages
2. Configure a custom domain if desired (e.g., `status.consultthedead.com`)
3. Customize the page branding and messaging
4. Share the public URL in your footer or help docs
5. Example: `https://consultthedead.statuspage.io` or `https://status.consultthedead.com`

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Monitor shows "Down" immediately after setup | Endpoint not accessible from internet | Check Vercel deployment, firewall rules, CORS if applicable |
| Monitor shows "Timeout" | Response takes >30s or endpoint unresponsive | Check Vercel Function logs, database connectivity, API rate limits |
| Alerts not arriving | Alert channel not configured or integration broken | Verify Slack/email webhook URL in monitoring service, test manually |
| False positives (intermittent down) | Flaky endpoint or rate limiting | Add retries (e.g., check 3x before alerting), investigate root cause |
| No uptime history after 24 hours | Monitor not actually running | Check monitoring service dashboard, verify URL is correct, check if trial expired |

---

## Maintenance

- **Weekly**: Check the monitoring dashboard for uptime ≥ 99.5%
- **Monthly**: Review alert history for patterns or recurring issues
- **Quarterly**: Update alert contacts and verify notification channels still work
- **After deployments**: Run a quick manual health check via curl

---

## Related Docs

- [Sentry Smoke Test](sentry-smoke-test.md) — Error monitoring setup
- [Production Runbooks Index](index.md) — All operational runbooks
- `website/src/app/api/health/route.ts` — Health endpoint implementation
