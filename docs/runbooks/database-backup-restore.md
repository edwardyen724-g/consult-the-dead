# Database Backup & Restore Runbook

> Operational guide for database backup and recovery procedures in production.

**Last Updated**: 2026-05-13  
**Owner**: DevOps  
**Severity**: High (production data protection)  
**Contact**: @devops in #eng-coordination

---

## Overview

This runbook covers:
- Automated backup procedures for the production database
- Manual snapshot creation
- Recovery and restore verification
- Testing restore procedures without impacting production

### Database Setup

The application uses **Vercel Postgres** (via `@vercel/postgres` SDK) for production data storage.

- **Connection**: Managed by Vercel (credentials in `DATABASE_URL` env var)
- **Backups**: Automatically handled by Vercel (included in Pro plan)
- **Restore Point**: Last 30 days available (Vercel default)

---

## Automated Backups (Vercel-Managed)

### How It Works

1. **Vercel Postgres** automatically backs up your database to Vercel's infrastructure
2. Backups occur **daily** (configurable via Vercel dashboard)
3. Retention: **30 days** of backup history
4. All backups are encrypted at rest

### Verification

To verify backups are enabled:

1. Go to [Vercel Dashboard](https://vercel.com) → your project
2. Navigate to **Storage** → **Postgres**
3. Check the **Backups** tab
4. Confirm **Automatic Backups** are enabled
5. Review recent backup timestamps

### Checking Backup Status

```bash
# Via Vercel CLI (if installed):
vercel env list  # Verify DATABASE_URL is set
# Then check Vercel dashboard for backup history
```

---

## Manual Snapshot Creation

Before major deployments or risky data migrations, create a manual snapshot.

### Steps

1. **Go to Vercel Dashboard**
   - Navigate to your project → **Storage** → **Postgres**

2. **Create Manual Backup**
   - Click the **Backups** tab
   - Click **Create Backup** or **Create Snapshot**
   - Confirm (takes 5-10 seconds)
   - Note the backup timestamp

3. **Verify Snapshot**
   - New backup appears in the backup list
   - Status should show "Ready" or "Completed"
   - Include the backup ID in deployment notes

### Example Snapshot Naming

If documenting in release notes:
```
Database snapshot: 2026-05-13T14:30:00Z (pre-schema-migration)
Vercel Backup ID: <backup-id-from-dashboard>
```

---

## Recovery Procedures

### Scenario 1: Point-in-Time Recovery (Last Hours)

**Use Case**: Accidental data deletion, bad migration, or test data contamination

**Steps**:

1. **Stop the Application** (to prevent further writes)
   ```bash
   # Vercel: Temporarily disable the API via Vercel dashboard or set
   # DATABASE_URL to a temporary read-only connection
   ```

2. **Identify Restore Point**
   - Go to Vercel Dashboard → **Storage** → **Postgres** → **Backups**
   - Find the backup timestamp before the incident
   - Note the backup timestamp (e.g., 2026-05-13T10:00:00Z)

3. **Request Restore** (via Vercel Support or CLI)
   ```bash
   # Note: Vercel Postgres restore is typically managed via:
   # - Vercel Dashboard manual restore button
   # - Vercel Support ticket for targeted recovery
   
   # Contact devops: For guidance on which backup to restore
   ```

4. **Verify Restore**
   - Connect to the restored database (new DATABASE_URL will be provided)
   - Run smoke tests to confirm data integrity
   - Test core queries: `SELECT COUNT(*) FROM users;`
   - Verify schema matches expectations

5. **Cutover to Restored DB**
   - Update `DATABASE_URL` environment variable in Vercel
   - Redeploy application
   - Monitor logs for any connection errors

### Scenario 2: Full Database Failure

**Use Case**: Corruption, infrastructure failure, or data loss incident

**Steps**:

1. **Declare Incident**
   - Post in #eng-incidents Slack channel
   - Include: timestamp of failure, last known good backup timestamp
   - Assign SEV-2 (high impact)

2. **Contact Vercel Support**
   - Provide: project ID, affected database name, desired restore point
   - Request: full database restore (may take 15-30 minutes)
   - Get confirmation of restore ETA

3. **Prepare Fallback**
   - While restore is in progress, document the issue
   - Prepare rollback plan if restore fails

4. **Verify Restored Database**
   - Once restored, run full smoke test suite
   - Verify critical paths: user signup, debate creation, pricing checkout
   - Check schema: `\d` (in psql) or query system tables
   - Run application smoke tests (see [Agora First-Agon Smoke](agora-first-agon-smoke.md))

5. **Document Incident**
   - Record: failure time, root cause, recovery time (RTO), restore point age (RPO)
   - Create postmortem

---

## Testing Restore Procedures (Without Production Impact)

### Dry-Run: Test Restore (Staging)

To test recovery procedures without risking production:

1. **Create Staging Database** (if not already present)
   ```bash
   # Via Vercel dashboard:
   # - Create a new Postgres database in the same project (or separate project)
   # - Label it: `staging` or `test-restore`
   ```

2. **Snapshot Production Backup**
   - In Vercel Dashboard, create a manual backup of production DB

3. **Restore Snapshot to Staging**
   - Request restore to staging database (via Vercel support if needed)
   - OR create a read-only replica for testing

4. **Run Smoke Tests Against Restored Data**
   ```bash
   # Set DATABASE_URL to the restored staging DB
   # Run test suite
   npm run test --env=staging
   # Verify core queries work
   ```

5. **Clean Up Test Database**
   - Delete staging copy after verification
   - Document results in incident log

---

## Backup & Restore Checklist

### Before Major Deployments

- [ ] Create manual backup snapshot
- [ ] Record backup ID and timestamp
- [ ] Note backup ID in PR description or release notes
- [ ] Verify backup shows as "Ready" in Vercel dashboard

### After Backup Restore

- [ ] Database connectivity confirmed
- [ ] Schema validates (table count, column types)
- [ ] Core application queries work (user lookup, debate queries)
- [ ] Email service has access (test welcome email send)
- [ ] Payment system can read pricing data
- [ ] No orphaned foreign keys or data inconsistencies
- [ ] Application logs show no `DATABASE_CONNECTION_ERROR`
- [ ] At least one full user journey tested (signup → debate → pricing)

---

## Disaster Recovery Contacts

| Situation | Owner | Channel |
|-----------|-------|---------|
| Backup verification | DevOps | #devops |
| Restore request | CTO | #eng-incidents |
| Vercel infrastructure | Vercel Support | Vercel dashboard support |
| Data recovery escalation | CEO | #critical-incidents |

---

## References

- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Database Disaster Recovery Plan](../disaster-recovery-plan.md) (if available)
- [Environment Variables Reference](../environment-variables.md) — DATABASE_URL setup
- [Production Release & Rollback Playbook](../release-and-rollback-playbook.md)

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2026-05-13 | 1.0 | Initial runbook creation; covers Vercel Postgres backup procedures |
