# Agent Coordination: Dispatch ↔ Alfred

This file is the coordination contract between Dispatch (Windows desktop, Cowork) and Alfred (Mac Studio, Telegram bot). Both agents should read this file to stay aligned.

## Source of Truth for Website Content

The Agora website (consultthedead.com/agora) is the **live source of truth** for:
- Number of historical minds available
- Mind names, descriptions, and categories
- Pack structure and groupings
- Any product features or pricing

**Alfred MUST pull from the live website** (or the `website/` directory in this repo) before making claims about product features, mind count, or available figures. Do NOT cache this information indefinitely — it changes as new minds are extracted and deployed.

> **Note:** The `company-builder/` directory is unlinked from the live site. The active product is **The Agora** at `consultthedead.com/agora`, built from the `website/` Next.js app.

### How to stay current

1. **Alfred**: Check the website or this repo's `website/` directory at least daily. The scheduled automation should trigger this, but if in doubt, pull fresh.
2. **Dispatch**: When deploying new minds or website changes, update this file's changelog below so Alfred knows something changed on next sync.

## Website Change Log

| Date | Change | Deployed by |
|------|--------|-------------|
| 2026-05-05 | AGENT_COORDINATION.md created | Dispatch |
| 2026-05-07 | Clerk auth + Stripe subscriptions live; Agora is primary product surface | Dispatch |
| 2026-05-07 | 26 frameworks in library (18 live on /agora); 8 pipeline/aspirational | Dispatch |
| 2026-05-07 | Pricing: Free 3/day · BYO-key unlimited · Pro $30/mo or $300/yr | Dispatch |
| 2026-05-08 | Canonical pricing doc added at docs/pricing.md | Marketing |

## Communication Protocol

- Dispatch pushes website code changes to GitHub (`edwardyen724-g/greatminds` or related repos)
- Alfred pulls from GitHub to get updates
- If Dispatch makes a significant content change (new minds, new packs, pricing change), it adds a line to the changelog above
- Alfred checks this changelog on each daily sync to know if anything is new

## Current State (last updated: 2026-05-08)

### Product
- **Live product**: The Agora — [consultthedead.com/agora](https://consultthedead.com/agora)
- **Pricing page**: [consultthedead.com/pricing](https://consultthedead.com/pricing)
- **Canonical pricing doc**: `docs/pricing.md` in this repo

### Tech Stack
- Framework: Next.js (App Router), React 19, TypeScript, Tailwind v4
- Auth: **Clerk** (sign-in, sign-up, `currentUser()` checks, `publicMetadata.subscription_tier`)
- Payments: **Stripe** (monthly + annual subscriptions, 7-day free trial, Svix webhooks)
- Database: Vercel Postgres + Redis (rate limiting)
- AI: Anthropic Claude SDK — Sonnet for free tier, Opus for Pro consensus synthesis
- Research: Tavily-backed research stage (optional per debate)

### Minds / Frameworks
- **26 total** frameworks in `frameworks/` directory
- **18 live** on The Agora (ALLOWED_SLUGS in `website/src/lib/frameworks.ts`)
- Einstein hidden pending Hebrew University trademark review
- 8 additional pipeline frameworks: Abraham Lincoln, Andrew Carnegie, Archimedes, Benjamin Franklin, Florence Nightingale, Frederick Douglass, Julius Caesar, Napoleon Bonaparte

### Council Packs (6)
1. Stoic Council — Marcus Aurelius, Epictetus, Cicero, Seneca
2. Inventors' Workshop — Edison, Archimedes, Lovelace, Da Vinci, Tesla
3. War Room — Sun Tzu, Alexander, Catherine, Tubman, Cleopatra, Caesar, Napoleon
4. The Republic — Machiavelli, Catherine, Cicero, Cleopatra, Franklin, Lincoln, Douglass
5. Trailblazers — Tubman, Nightingale, Douglass, Curie
6. The Moguls — Rockefeller, Carnegie, Newton, Caesar, Napoleon

### Pricing (as of 2026-05-08)
- **Free** — $0, 3 agons/day, 2–3 minds, Sonnet, anonymous (no signup)
- **BYO Key** — free tier + unlimited debates using your own Anthropic `sk-ant-…` key
- **Pro** — $30/month or $300/year (founding-member rate; increases to $360/yr after Q3 2026)
  - 100 agons/month, 2–5 minds, Opus consensus, persistent library, PDF export, extended research, founder support
  - 7-day free trial included

### Debate Flow (5 stages)
1. **TOPIC** — user enters decision question
2. **RESEARCH** — optional Tavily research (toggleable)
3. **COUNCIL** — select 2–5 minds from 18 available
4. **AGON** — 3-round streamed debate
5. **CONSENSUS** — 5-node synthesis graph (points/tensions/action/steps/risks)

## Notes for Alfred

- Do NOT assume mind count from memory. Always verify against live data or this file.
- The active product is `website/` (Next.js), **not** `company-builder/`. Do not reference company-builder for current product state.
- Pricing source of truth: `docs/pricing.md` in this repo — always quote from there.
- When Edward asks about the product, pull the latest before answering.
- Einstein is NOT live — do not mention it as available.
