# Reel Analytics Summary Template

**Purpose:** first-pass human review template for Phase 5 Instagram Insights reports.

**Scope:** summarize each reel in a consistent format so the team can compare posts without re-reading the raw analytics payload.

**Primary reference:** [`docs/runbooks/instagram-scheduler-runbook.md`](instagram-scheduler-runbook.md)

Use this template when the Insights scaffold produces a report for newly posted reels.

## Review Cadence

- Check the report once each morning for any reel published in the last 72 hours.
- Re-check the same reel after 7 days if it is still collecting meaningful traffic or if the first review suggested a content follow-up.
- Fold the weekly summary into the content planning review so the next batch can reuse the strongest reel patterns.

## Per-Reel Fields

Capture the following fields for every reel in the report:

- reel slug
- source article or decision page
- publish date
- post URL
- views
- reach
- likes
- comments
- saves
- shares
- average watch time, if available
- completion or retention signal, if available
- follower delta, if available
- short qualitative note
- recommended follow-up action

## Review Template

```text
Reel:
Source:
Published:
URL:

Performance
- Views:
- Reach:
- Likes:
- Comments:
- Saves:
- Shares:
- Avg watch time:
- Completion/retention:
- Follower delta:

Review
- What stood out:
- What to repeat:
- What to change:
- Next action:
```

## Review Rules

- Compare reels against one another before declaring a winner.
- Treat saves, shares, and strong retention as the highest-signal metrics for content reuse.
- Treat low reach with high retention as a distribution problem, not automatically a content failure.
- Keep the summary short enough that Edward can scan it in a few minutes and move on to the next action.
