# Changelog

All notable changes to this repository are documented in this file.

The project does not currently use semantic releases, so this changelog records major repository milestones and user-visible changes in reverse chronological order.

## 2026-05-12

### Added
- Framework chat CLI subcommand (PR #237): exposes the packaged `framework chat` command.
- Pricing contract verifier script (PR #238): adds the contract-verification script and tests.
- Quiz featured-pack shortcut (PR #242): adds the step-2 shortcut for featured packs.
- Beehiiv email capture in the consensus stage (PR #244): captures email in `ShareAgonPanel`.
- Consulted-minds collection feedback strip (PR #246): adds the new feedback strip on the library surface.
- Outreach Wave 1 send brief (PR #247): documents the launch brief and send cadence.
- Collection-feedback contract coverage (PR #249): expands regression coverage around the feedback surface.
- Consensus graph extraction (PR #251): extracts the shared consensus graph component.
- Founder-checkpoint metrics cadence (PR #254): documents the report cadence and inputs.
- Onboarding friction release note (PR #255): captures smoke evidence and promotes the release note.
- Agora plan and pricing reconciliation (PR #257): aligns the monetization docs with shipped product state.
- Quota 429 retry headers, legacy forge cleanup, Stripe test flow, and pricing proof contract sync (PR #261): updates the docs and proof artifacts around the shipped contract work.
- Changelog backfill for the 2026-05-11 wave (PR #262): backfills the prior-day merged PR entries.
- Changelog backfill for post-May-12 merge wave (PR #286): adds entries for PRs #279 (StreamingDemo above fold), #281 (Phase 1 insight launch trio), #282 (/decisions surface), and #284 (CODEOWNERS + frameworks CI guard).
- Library upgrade interstitial enrichment (PR #265): adds the feature list and ghost preview rows.
- Per-mind SEO metadata (PR #267): adds proper title and OG metadata to the per-mind landing pages.
- Live social proof agon-count stat (PR #268): adds the pricing-hero stat.
- Inline Pro upgrade CTA in rate-limit banner (PR #264): Agora rate-limit error banner now includes a direct Pro upgrade CTA.
- Share button wired to /api/library (PR #269): Agora share button now persists share URLs via `/api/library` for stable link sharing.
- Trust badge near Pro CTA (PR #270): pricing page adds a trust badge adjacent to the Pro CTA button, with supporting test coverage.
- Checkout success redirect and Pro welcome banner (PR #272): successful Stripe checkout now redirects to `/agora` and surfaces a Pro welcome banner.
- Quota-exhaustion CTA sharpened to 7-day free trial copy (PR #273): Agora quota-exhaustion state now leads with the 7-day free trial messaging.
- Value proposition header on sign-up page (PR #274): Clerk sign-up form is now preceded by a value proposition header summarising the product.
- CTR research baseline sync (PR #277): `docs/ctr-research-notes.md` updated to mark LibraryProofStrip and transcript-share as shipped baseline and tighten open gaps.
- Design research retention helpers shipped baseline (PR #278): `docs/design-research.md` updated to reflect shipped retention helpers and document remaining open gaps.
- Homepage StreamingDemo moved above the fold (PR #279): the streaming demo section now appears immediately after the hero, before the packs grid, so it earns attention before the first scroll — CTR experiment 3.
- Phase 1 insight launch trio (PR #281): first three high-intent insight pages published under `/insights` from the Phase 1 queue; annotation blueprints added and index tests extended for the new entries.
- `/decisions` surface and first two Phase 1 pages (PR #282): static `/decisions/[slug]` route with indexable metadata, Article JSON-LD, and a "start your own agon" CTA; `should-i-raise-vc-or-bootstrap` and `should-i-quit-my-job-to-start-a-company` published with 100% route coverage.
- CODEOWNERS and frameworks CI guard (PR #284): `.github/CODEOWNERS` now requires owner review for `frameworks/` changes; a new `frameworks-guard` workflow blocks PRs that modify framework files outside a `wanman/*` capsule branch.
- Founder-checkpoint metrics-pull credentials wired (PR #283): `.env.local` and `.env.*.local` are now gitignored to prevent accidental credential commits; `VERCEL_PROJECT_ID` and `VERCEL_TEAM_ID` are pre-filled in `.env.local` (verified via Vercel MCP); metrics-pull script now accepts `--env-file` for clean CI invocation.
- Pro checkout/success page (PR #285): dedicated `/checkout/success` server page replaces the minimal query-param banner — shows personalized "You're now Pro" confirmation, Pro feature summary (Opus, 100 agons/month, 5-mind council, persistent library, PDF export), 3-step onboarding checklist, and a primary first-agon CTA; Stripe `success_url` updated accordingly.
- Post-signup drip sequence (PR #287): three Resend emails scheduled via cron — Day 1 council-selection guide (drives free users back to Agora), Day 3 daily-reset reminder with Pro upsell (7-day trial), and Day 7 social-proof email with anonymized Pro library debates and final trial CTA.
- Agora funnel telemetry (PR #288): four Vercel Analytics events instrument the email-capture funnel — `consensus_stage_reached`, `email_capture_shown`, `email_capture_submitted`, `email_capture_dismissed`; new `EmailCaptureModal` overlay shown once per consensus session for free users submits to `/api/newsletter/subscribe` (best-effort, fire-and-forget).
- Framework Forge LLM guardrails (PR #87): added prompt input validation before the Anthropic request, normalized request/response construction and extraction, explicit wrapper errors for request and response failures, and 20 unit tests covering all validation and response-handling paths — `framework_forge/llm.py` at 100% coverage.
- Publication system convergence (PR #227): converged `/account` and `/library` into one shared publication shell with aligned eyebrow, hero, stat-strip, section-card, and footer-CTA rhythm; regression coverage added for account shell, library shell, archive section, upgrade prompt, redirect path, and footer CTA placement.
- SEO listicle insight pages (PR #271): published three high-intent `/insights/` pages (`stoics-on-failure`, `steve-jobs-on-product`, `founders-on-pricing`) with `generateMetadata()`, canonical metadata, and sitemap inclusion; Steve Jobs framework extracted and added to `frameworks.ts` and `globals.css`.
- Decisions five-page expansion (PR #292): added five shipped decision entries (fire cofounder, pivot-or-persist, job offer, sell startup, shut down startup) to `website/content/decisions.ts` with full route regression coverage.
- RSS feed canonical metadata hardening (PR #295): rewired `/feed.xml` to build from the shared RSS helper, included public debate and insight entries with canonical debate/insight URLs and shipped cache headers, and strengthened the route test against the shared feed serializer with a frozen clock.
- Agora public share page conversion lead-in (PR #296): added a desktop read-only conversion lead-in above the public share CTA on `/agora/a/[id]` to drive new agon creation from share traffic; canonical share URL, footer attribution, and UTM share contract unchanged.
- Root-level website script proxies (PR #297): added root-level `build`, `lint`, and `test` scripts in `package.json` that proxy to the existing `website` package entrypoints so repo-level automation can run from one place.
- Sentry smoke-test runbook expanded (PR #299/#304): added exact env vars (`SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`) to prerequisites, documented the `/monitoring` tunnel route and ad-blocker resilience, replaced vague verification steps with two concrete client-side paths and an exact server-side `Sentry.captureException` pattern, added per-section capture expectations (Issues, Performance, Session Replay), curl tunnel probe, and expanded troubleshooting table with 4 new rows.
- Debates routes documented in README route table (PR #300): `/debates` and `/debates/[slug]` added to the README route table — both routes had been shipped but were not yet documented.
- Monetization playbook reconciled with shipped surfaces (PR #301): `MARKETING_STRATEGY.md` updated with all Phase 0 shipped items (Stripe checkout/success, Resend drip, Beehiiv email capture, Vercel funnel telemetry, Wave 1 outreach, `/decisions` surface) and resolved open decisions; `WAVE1_SEND_BRIEF.md` follow-up send date corrected from Saturday to Monday.
- Quota-countdown nudge for last free agon (PR #302): free users with exactly 1 agon remaining today now see the same amber border, amber-mist background, and 7-day free trial CTA as the exhausted (0-remaining) state — upgrade signal surfaces one step earlier so users feel scarcity before lockout.
- Insights branch coverage gaps closed (PR #303): added collision tests for `accentForSlug("isaac-newton")` and `accentForSlug(default)`, and a direct unit test for the `formatPublishedDate` catch branch; branch coverage on `insights/[slug]/page.tsx` rises from 88.88% to ≥92.59%.
- Coverage gate policy updated with exception records (PR #306): added the formal Exception Records section to `docs/coverage-gate-policy.md` with the two branch-coverage exceptions from PR #271 (`insights/[slug]/page.tsx` and `lib/frameworks.ts`), including follow-up task IDs and target dates.
- Proof strip live count regression coverage (PR #305): added 9 regression tests locking `PricingPage` `ProofStrip` and `LibraryProofStrip` against stale/zero-count display regressions after the live analytics wiring in PR #298 — covers zero-count rendering, partial merge, loading→populated transitions, and exact strip item count.

### Fixed
- Quota 429 retry headers changelog note (PR #230): records the quota contract headers in the changelog.
- Stripe Tax deferral docs (PR #231): clarifies the deferral in the phase 0 setup guide.
- Canonical and `og:url` lock (PR #232): prevents framework detail metadata drift.
- Stripe welcome email personalization (PR #239): uses the user's first name in the welcome email.
- 4th-mind upsell trigger hardening (PR #241): fixes the free-to-Pro conversion trigger.
- Shared-agon CTA label fix (PR #243): aligns the public CTA label with the founder directive.
- Placeholder citation validator regression tests (PR #248): covers the edge cases that were missing.
- Pricing preview metadata gate re-verification (PR #260): confirms there is no drift.
- Seneca portrait gap note removal (PR #263): removes the resolved gap note from the release docs.
- Epictetus and Rockefeller bipolar_constructs inlined (PR #245): embeds `bipolar_constructs` data directly in the framework files, removing the external dependency.
- Share CTA button label aligned with founder directive (PR #250): corrects the share CTA label to match the founder-approved copy.
- Duplicate quotaResetAt resolved, test assertions aligned, retry hints surfaced (PR #256): fixes the duplicate field bug in quota responses, aligns test assertions, and surfaces retry hint headers.
- UTM params forwarded from URL to Stripe checkout POST body (PR #276): pricing CTA now carries UTM attribution through into the Stripe checkout session.
- Pricing proof strip now boots from live stats (task a4301d84): `/pricing` server-seeds the proof row from `getPricingStats()` and refreshes from `/api/stats`, so the counters no longer start from a frozen baseline when live data is available.

## 2026-05-11

### Added
- Library proof strip (PR #184): Pro Library page now shows a live engagement strip — total saved debates and a per-week activity streak — computed from each user's real saved-agon data. `LibraryProofStrip` component (100% test coverage, 22 tests) replaces the earlier inline grid implementation.
- Homepage OG/Twitter preview images (PR #185): homepage now generates dynamic Open Graph and Twitter/X social preview cards at `opengraph-image.tsx` / `twitter-image.tsx` so share links render rich cards everywhere.
- Insights hero panel and denser index cards (PR #200): `/insights` now opens with a hero summary panel showing key stats (total insights, recent activity, top mind), and insight index cards are visually denser for quicker scanning.
- Galileo Galilei framework (PR #203): Galileo's CDM-derived thinking framework is extracted and added to the frameworks library — separating the observable from the doctrinal, accepting institutional defeat to preserve the work.
- Beehiiv email capture in consensus stage (PR #244): the Agora `ShareAgonPanel` now shows a Beehiiv email capture form at the consensus stage, converting engaged free users into the newsletter list before they leave.
- Quiz featured-pack shortcut (PR #242): Step 2 of the guided quiz now surfaces a featured-pack shortcut so users can jump straight to a curated council without scrolling the full pack list.
- Pricing contract verifier script (PR #238): `npm run verify:pricing` exercises the live `/api/stats` and `/pricing` contract; can be run in CI and as a post-deploy gate.
- Framework chat CLI subcommand (PR #237): `framework-forge chat` exposes interactive framework chat as a packaged CLI subcommand; documented in the quickstart.
- UTM stamper on /sign-up (PR #194): Clerk signup now stamps UTM parameters into a `free_signup` analytics event server-side so attribution is preserved from ad click through to first agon.
- Company-builder loading/error polish (PR #198): the company-builder app shell gained a loading skeleton, an error boundary with retry, and focus management so the surface degrades gracefully under slow or failed API responses.
- BYO API key settings improvements (PR #202): account-page BYO API key card now validates key format on entry, masks stored keys (shows last 4 chars), and surfaces clear error states for invalid or revoked keys.
- Research-route smoke script (PR #197): `scripts/smoke-research-route.ts` validates the `/api/agon` research phase end-to-end against live infrastructure.
- Listicle URLs in sitemap (PR #204): the 5 long-tail listicle routes are now emitted in `sitemap.ts` (changefreq=monthly, priority=0.6) so they are crawlable from the XML sitemap.
- Homepage hero vertical rhythm (PR #208): tighter vertical spacing and reduced dead space in the homepage hero for a crisper above-the-fold layout.
- Agora mobile layout, empty states, and error boundary (PR #179): regression coverage for Agora responsive layout, zero-agon empty state, and error-boundary recovery paths.
- Steve Jobs Tier 3 validation packet (PR #181): Framework Forge generates the Tier 3 A/B review packet for the Steve Jobs framework, completing all three automated validation tiers.
- Quota 429 retry headers: `/api/agon`, `/api/generate-analysis`, and `/api/contact` now expose machine-readable retry guidance for throttled requests via `Retry-After` and `X-RateLimit-Reset`; `/api/generate-analysis` also keeps `X-RateLimit-Remaining` on successful server-key responses so the live behavior matches the quota contract docs.
- Auth Noindex Metadata (PR #147): `/sign-in` and `/sign-up` now export route metadata that sets `robots: noindex, nofollow`; the sign-up page was split into a server shell plus client widget so the metadata export stays in an RSC.
- Framework detail OG/Twitter preview images: `/frameworks/[slug]/opengraph-image.tsx` and `/frameworks/[slug]/twitter-image.tsx` now generate dynamic social card images so framework shares render richer previews on Twitter/X, LinkedIn, and iMessage. Contract tests added (PR #120).
- Frameworks Index OG/Twitter Preview Image (PR #146): `/frameworks/opengraph-image` and `/frameworks/twitter-image` now serve static social preview cards for the frameworks index, and the `/frameworks` page owns the matching Open Graph and Twitter metadata.
- `/listicles/[slug]` — 5 long-tail SEO pages (PR #18): startup-pivot, career-change, leadership-crisis, investing-risk, product-strategy. Each pre-fills the Agora council with suggested minds via UTM CTA.
- `/minds/[id]` — 25 per-mind landing pages (PR #116): one SEO-optimized page per active framework (Newton, Curie, Machiavelli, Tesla, da Vinci, Sun Tzu, Aurelius, Franklin, Cicero, Epictetus, Edison, Archimedes, Rockefeller, Tubman, Lovelace, Catherine, Alexander, Cleopatra, Lincoln, Carnegie, Nightingale, Douglass, Caesar, Napoleon, Seneca). Each page includes how-they-argue, sample quotes, and UTM-linked /agora CTA.
- Free-tier upsell modal on Agora (PR #114): when free user hits 3/day cap, modal surfaces 3 CTAs (BYO key / Pro upgrade / come back tomorrow).
- Dynamic Open Graph and Twitter/X preview images for framework detail pages (PR #110): `/frameworks/[slug]/opengraph-image` and `/frameworks/[slug]/twitter-image` routes now serve per-mind share cards with portrait artwork, perceptual lens excerpt, bipolar construct chips, and validation tier badge. Follows the same static-params pattern as mind share cards; all public framework slugs are prerendered at build time.
- `/packs` themed pack catalog (PR #90): browse curated mind packs by domain (stoics, inventors, strategists, etc.) with guided-quiz CTA and social-proof strip.
- `/explore` public agon gallery: crawlable grid of public debate records with chip-strip filtering and search; serves as SEO surface alongside per-agon share pages.
- `/feed.xml` RSS feed: source-backed route returning public debates and insights as valid RSS 2.0; includes regression coverage.
- Header quiz CTA (PR #118): promoted Agora entry button to guided quiz mode (`/quiz?utm_source=header`) with amber accent styling.
- Guided quiz entry across packs and footer CTAs: consistent amber-pill CTAs linking to `/quiz` with page-specific UTM parameters.

### Fixed
- Agora 4th-mind upsell trigger (PR #241): cap banner now fires from the correct `liftCap` state with sharper copy; regression tests lock the behaviour across free and pro paths.
- Shared-agon CTA label (PR #243): public shared-agon page CTA button label aligned with founder directive (consistent verb and framing).
- Stripe welcome email greeting (PR #239): welcome email now personalises the greeting with the user's first name pulled from the Stripe customer object.
- Framework canonical URL drift (PR #232): framework detail page `canonical` and `og:url` are locked to `buildFrameworkCanonicalUrl` — prevents the homepage URL leaking into framework `<head>` on SSR.
- Outbound email sender switched from Resend sandbox (`onboarding@resend.dev`) to verified branded domain (`notifications@consultthedead.com`) — emails now deliver to any recipient address in production.

## 2026-05-10

### Changed
- Agora Consultation Entry — Loading/Error Boundary Contract (PR #105): `/agora/loading.tsx` ships the guided loading skeleton for suspended Agora routes, and `/agora/a/[id]/page.tsx` now degrades missing or failed share lookups to `notFound()` instead of exposing a raw error.
- Agora Guided Progress Cue (PR #105): `AgoraLoading` is the full-screen themed loading cue for Agora routes, backed by the shared `@keyframes pulse` animation in `globals.css`.

## 2026-05-09

### Changed

- Shipped the Agora session-history fix so debate progress is backed by browser `sessionStorage`, empty topic-only visits stay out of the snapshot, and meaningful progress round-trips within the current session.
- Confirmed the final Agora chat-API compatibility stance: the live flow stays on the `/api/agon` contract rather than reviving a separate `/api/chat` surface.
- Reconciled the Phase 1 Framework Forge plan with the current implementation state and documented that the Steve Jobs extraction path is complete at the tooling and test level.
- Documented the repo's current release-state posture in the README so the framework forge and product docs stay aligned.
- Reconciled the launch-facing Agora story across the README, pricing doc, marketing strategy, and changelog: Free is 3 agons/day, BYO key is unlimited, Pro is $30/month or $300/year founding-member pricing, and Pro today includes Opus consensus synthesis, a persistent searchable library, PDF export, extended research, founder support, and up to 5 minds per agon.

## 2026-05-08

### Added

- Added the public-read API for shared agons so published results can be viewed without requiring the authoring flow.
- Wired the Agora research toggle end-to-end so debate flows can use the research step before discussion.

### Fixed

- Synced the Agora pricing page with the BYO-key tier model and corrected the FAQ copy.
- Cleaned up the remaining src-level lint errors blocking the quality gate.

## 2026-05-07

### Added

- Added the share-this-agon helper and the ShareAgonPanel component for public sharing of completed agons.
- Added live usage visibility in the account page and Agora footer, including pro-state rendering.

### Changed

- Hardened Agora print styling for Save-as-PDF export.
- Updated the Agora plan to match the live free/pro mind-cap policy.

## 2026-04-22

### Added

- Completed the initial Agora launch playbook research and captured the direction for follow-on acquisition work.

### Fixed

- Renamed the demo stage label from DEBATES to AGON across the product surface.
