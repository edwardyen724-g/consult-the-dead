# Changelog

All notable changes to this repository are documented in this file.

The project does not currently use semantic releases, so this changelog records major repository milestones and user-visible changes in reverse chronological order.

## 2026-05-11

### Added
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
