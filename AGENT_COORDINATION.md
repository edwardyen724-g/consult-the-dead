# Agent Coordination: Dispatch ↔ Alfred

This file is the coordination contract between Dispatch (Windows desktop, Cowork) and Alfred (Mac Studio, Telegram bot). Both agents should read this file to stay aligned.

## Source of Truth for Website Content

The Agora website (consultthedead.com / The Agora) is the **live source of truth** for:
- Number of historical minds available
- Mind names, descriptions, and categories
- Pack structure and groupings
- Any product features or pricing

**Alfred MUST pull from the live website** (or the `company-builder` codebase in this repo) before making claims about product features, mind count, or available figures. Do NOT cache this information indefinitely — it changes as new minds are extracted and deployed.

### How to stay current

1. **Alfred**: Check the website or this repo's `company-builder/` directory at least daily. The scheduled automation should trigger this, but if in doubt, pull fresh.
2. **Dispatch**: When deploying new minds or website changes, update this file's changelog below so Alfred knows something changed on next sync.

## Website Change Log

| Date | Change | Deployed by |
|------|--------|-------------|
| 2026-05-05 | AGENT_COORDINATION.md created | Dispatch |
| 2026-05-08 | Added Sentry init + GET /api/health liveness probe (observability) | Dispatch |

## Required Environment Variables

New env vars added with the Sentry / observability work (task 38b990e6):

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Optional | Sentry project DSN for error monitoring. App builds/runs without it. |
| `SENTRY_AUTH_TOKEN` | CI-only | Sentry CLI token for sourcemap uploads during `next build`. |

Add these to Vercel project settings → Environment Variables for production monitoring. See `docs/runbooks/sentry-smoke-test.md` for verification steps.

## Communication Protocol

- Dispatch pushes website code changes to GitHub (`edwardyen724-g/greatminds` or related repos)
- Alfred pulls from GitHub to get updates
- If Dispatch makes a significant content change (new minds, new packs, pricing change), it adds a line to the changelog above
- Alfred checks this changelog on each daily sync to know if anything is new

## Current State (last updated by Dispatch)

- Website: consultthedead.com
- Repo: github.com/edwardyen724-g (greatminds, link, openclaw-context)
- Video pipeline: ~/projects/video-pipeline on Mac Studio
- Instagram account: The Agora (pending upload pipeline setup)

## Notes for Alfred

- Do NOT assume mind count from memory. Always verify against live data.
- The website content is generated from frameworks in `greatminds/frameworks/` directory.
- When Edward asks about the product, pull the latest before answering.
