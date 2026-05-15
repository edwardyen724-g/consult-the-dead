# Instagram Reel Post Scheduler Runbook

**Purpose:** operator guide for the cron-backed reel post scheduler and its failure modes  
**Canonical code paths:** [`scripts/instagram/post_scheduler.py`](../../scripts/instagram/post_scheduler.py), [`scripts/instagram/scheduler_config.py`](../../scripts/instagram/scheduler_config.py), [`scripts/instagram/upload_reel.py`](../../scripts/instagram/upload_reel.py)

Use this runbook when:

- enabling or disabling the scheduler
- recovering from a 429 or other upload failure
- checking whether an MP4 was already posted
- verifying that the daily post cap is doing its job

## Contract

The scheduler is intentionally conservative:

- default cron expression: `0 9 * * 2,4`
- default daily post cap: `1`
- default 429 policy: retry up to `3` attempts with exponential backoff capped at `1800s`
- default backoff seed: `300s`

The scheduler scans `output/reels/` for approved MP4s. An MP4 is considered approved when:

- the filename already carries the approval marker (`*.approved.mp4`), or
- a sibling JSON sidecar contains `{ "approved": true }`

Each posted reel is persisted in `output/reels/post-scheduler-state.json` with:

- the file path and digest
- the published `media_id`
- the Instagram `container_id`
- the post status, retry window, and next eligible attempt time

Duplicate-post protection is file-based and digest-based:

- a record with `status: posted` and the same file digest is skipped on later runs
- a failed record with a future `next_attempt_at` is skipped until that time

## 429 Handling

When Instagram returns HTTP 429, the scheduler:

1. records the failure in the state file
2. uses the larger of the `Retry-After` hint and the configured backoff seed
3. sleeps, retries, and stops once the configured retry budget is exhausted
4. leaves the file eligible for a later manual or cron retry instead of reposting it

If the retry budget is exhausted, the scheduler fails closed and does not advance to other reels in that run.

## Required Environment

| Variable | Purpose |
|---|---|
| `INSTAGRAM_ACCESS_TOKEN` | Token used by the scheduler run |
| `INSTAGRAM_USER_ID` | Instagram-scoped user ID |
| `INSTAGRAM_REEL_OUTPUT_DIR` | Override the reel scan directory |
| `INSTAGRAM_REEL_POST_STATE_PATH` | Override the scheduler state file |
| `INSTAGRAM_REEL_POST_CRON` | Override the cron expression |
| `INSTAGRAM_REEL_MAX_POSTS_PER_DAY` | Override the daily cap |
| `INSTAGRAM_REEL_429_INITIAL_BACKOFF_SECONDS` | Override the first retry delay |
| `INSTAGRAM_REEL_429_BACKOFF_MULTIPLIER` | Override the retry growth factor |
| `INSTAGRAM_REEL_429_MAX_BACKOFF_SECONDS` | Override the backoff ceiling |
| `INSTAGRAM_REEL_429_MAX_ATTEMPTS` | Override the retry budget |
| `INSTAGRAM_REEL_PUBLIC_BASE_URL` | Public origin used to build the video URL |
| `INSTAGRAM_REEL_PUBLIC_PATH_PREFIX` | Public path prefix for reel MP4s |

## Preflight

1. Confirm the reel export exists in `output/reels/` and is approved.
2. Confirm the state file does not already contain a `posted` record for the same path and digest.
3. Confirm the scheduler env vars match the current daily cap and retry policy.
4. Confirm the reel URL is publicly reachable from the configured base URL.

## Smoke Check

The scheduler has no dedicated CLI wrapper yet. Run it from Python:

```bash
python - <<'PY'
from scripts.instagram.post_scheduler import run_from_env

result = run_from_env()
print(result)
PY
```

Pass criteria:

- approved reels are posted once
- already-posted reels are skipped
- 429s are retried within the configured budget
- the state file records `media_id`, `container_id`, and the retry metadata

## Manual Recovery

If a run misbehaves:

1. Open `output/reels/post-scheduler-state.json` and inspect the record for the reel.
2. If the reel was already posted, keep the `posted` record and do not repost it.
3. If the reel hit a 429, wait for `next_attempt_at` or clear the failed record after confirming the API window has reset.
4. If the reel should be reposted after a real content change, update or replace the MP4 so the digest changes, then rerun the scheduler.
5. Re-run the smoke check after any manual state edit.
