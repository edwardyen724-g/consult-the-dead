# Daily Reel/Content Ops Checklist

**Purpose:** concise morning checklist for Edward to review the reel, content, and release state before execution starts.

**Scope:** daily handoff for the Phase 5 reel pipeline once the posting flow is stable enough to run from a reusable ops surface.

**Primary references:**

- [`docs/runbooks/reel-analytics-summary-template.md`](reel-analytics-summary-template.md)
- [`docs/runbooks/instagram-scheduler-runbook.md`](instagram-scheduler-runbook.md)
- [`CONTENT_PIPELINE.md`](../../CONTENT_PIPELINE.md)
- [`README.md`](../../README.md)

Use this runbook at the start of the workday to decide whether to ship, queue, pause, or escalate.

## Morning Checklist

1. Check the current release state in `README.md`, `CONTENT_PIPELINE.md`, and the latest release notes.
2. Confirm the reel pipeline has no open blocker, failed export, or scheduler error from the previous day.
3. Review the latest posted or pending reels and note which slugs are ready for follow-up analytics.
4. Check whether any content batch, release note, or docs update is waiting on a morning decision.
5. If a reel or release issue is present, route it to the relevant operational runbook before moving on.
6. Record the decision for the day:
   - ship the next approved reel
   - hold for content or release cleanup
   - escalate a blocker to the owner

## What Edward Should Capture

- reel slug or content batch name
- current posting or publish status
- any blocker affecting release readiness
- the next action for content, analytics, or release follow-up

## Exit Criteria

The morning pass is complete when:

- the content/reel/release state has been checked
- any blocker has been assigned or cleared
- the next action is written down for the day
- the analytics review template is ready if a reel was published
