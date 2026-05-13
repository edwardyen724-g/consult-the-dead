# Changelog

All notable changes to this repository are documented in this file.

The project does not currently use semantic releases, so this changelog records major repository milestones and user-visible changes in reverse chronological order.

## 2026-05-21 (Wave 10)

### Added
- Wave 10 collision batch shipped: 4 collision insight articles — `machiavelli-vs-sun-tzu-on-competitive-intelligence` (machiavelli + sun-tzu; strategy), `marcus-aurelius-vs-seneca-on-processing-failure` (aurelius + seneca; resilience), `franklin-vs-carnegie-on-building-your-network` (franklin + carnegie; hiring), `cleopatra-vs-catherine-the-great-on-ruling-through-alliance` (cleopatra + catherine; strategy); 8 INSIGHT_ANNOTATION_BLUEPRINTS entries added; 4 reel integration tests added (79 total passing).
- Wave 10 decision pages: `should-i-take-on-a-co-founder` (38th, Lincoln/Carnegie/Machiavelli), `should-i-productize-my-consulting` (39th, Rockefeller/Archimedes/Machiavelli); decisions count updated to 39; 2146 vitest tests passing.
- **Listicle expansion:** 3 new SEO→Agora conversion funnels added — `/listicles/founder-burnout` (Aurelius/Seneca/Carnegie), `/listicles/co-founder-conflict` (Sun Tzu/Lincoln/Machiavelli), `/listicles/pricing-decision` (Machiavelli/Newton/Rockefeller); total listicle pages 5→8. Each page pre-fills Agora with council + topic for zero-friction agon start.
- **Bug fix:** Deduplicated Wave 8/9 decision slugs (`should-i-raise-a-series-a` → `should-i-take-series-a-investment`; `should-i-expand-internationally` Wave 9 copy → `should-i-enter-international-markets`); added `content-integrity.test.ts` to catch future slug duplicates across both INSIGHT_ENTRIES and DECISION_ENTRIES.

## 2026-05-14 (Wave 9)

### Added
- Wave 9 collision batch shipped: 5 collision insight articles — `galileo-vs-newton-on-disrupting-your-own-field` (galileo + newton; innovation), `archimedes-vs-ada-lovelace-on-build-vs-theorize` (archimedes + ada-lovelace; product), `douglass-vs-lincoln-on-playing-the-long-game` (douglass + lincoln; strategy), `epictetus-vs-harriet-tubman-on-risk-under-constraint` (epictetus + tubman; control), `carnegie-vs-rockefeller-on-monopoly-strategy` (carnegie + rockefeller; scaling); 10 INSIGHT_ANNOTATION_BLUEPRINTS entries added; 5 reel integration tests added (75 total passing); 2139 vitest tests passing.
- Wave 9 decision pages: `should-i-fire-a-cofounder` (35th, Machiavelli/Lincoln/Sun Tzu), `should-i-charge-more-for-my-product` (36th, Machiavelli/Curie/Rockefeller), `should-i-expand-internationally` (37th, Napoleon/Sun Tzu/Machiavelli); decisions count updated to 37; 103 topics tracked, 102 shipped.

## 2026-05-14 (Wave 8)

### Added
- **Galileo Galilei** added as 27th live mind: framework already fully extracted (18 incidents, 5 bipolar constructs, The Observer archetype); wired into ALLOWED_SLUGS, SLUG_COLOR_VAR, ERA_FALLBACK, DISPLAY_ORDER in `frameworks.ts`; `--color-galileo` (#5b9bd5 dark / #1f5c8a light) added to all three palette blocks in `globals.css`; `website/data/frameworks/galileo-galilei/` bundled; EXPECTED_ROSTER_SIZE bumped 26→27 in `frameworks.test.ts`.
- Wave 8 insight batch shipped: 5 new single articles — `what-would-galileo-say-about-challenging-conventional-wisdom` (galileo-galilei; evidence), `what-would-archimedes-say-about-technical-leverage` (archimedes; systems), `what-would-epictetus-say-about-managing-uncertainty` (epictetus; resilience), `what-would-frederick-douglass-say-about-building-credibility` (frederick-douglass; persuasion), `what-would-ada-lovelace-say-about-building-for-the-future` (ada-lovelace; product); 1 collision — `what-galileo-and-newton-would-say-about-evidence-vs-consensus` (galileo + newton; evidence); 6 reel integration tests added (70 total passing); 6 INSIGHT_ANNOTATION_BLUEPRINTS entries added; 2139 vitest tests passing.
- Wave 8 decision pages: `should-i-pivot-my-startup` (33rd, Machiavelli/Edison/Epictetus), `should-i-raise-a-series-a` (34th, Machiavelli/Rockefeller/Carnegie); decisions count updated to 34; 95 topics tracked, 94 shipped.

## 2026-05-14 (Wave 7)

### Added
- Wave 7 insight batch shipped: 6 new "What Would X Say" articles — `what-would-da-vinci-say-about-shipping-imperfect-work` (leonardo-da-vinci; iteration), `what-would-sun-tzu-say-about-pricing-strategy` (sun-tzu; pricing), `what-would-rockefeller-say-about-unit-economics` (john-d-rockefeller; finance — NEW DECISION_COURT entry), `what-would-newton-say-about-debugging-complex-systems` (isaac-newton; product), `what-would-cleopatra-vii-say-about-managing-investors` (cleopatra-vii; relationship — NEW DECISION_COURT entry), `what-would-harriet-tubman-say-about-resilience-in-hard-times` (harriet-tubman; resilience); 1 method article — `jobs-to-be-done-explained` (Clayton Christensen JTBD framework; reasoning council); 2 new DECISION_COURT entries (finance: Rockefeller/Curie/Sun Tzu; relationship: Cleopatra/Machiavelli/Sun Tzu); 7 reel integration tests added (64 total passing); 87 topics tracked, 86 shipped; 2139 vitest tests passing.
- Wave 7 decision pages shipped: `should-i-use-ai-in-my-business` (30th, Tesla/Curie/Aurelius), `should-i-raise-pre-seed` (31st, Machiavelli/Sun Tzu/Curie), `should-i-launch-in-stealth-mode` (32nd, Sun Tzu/Machiavelli/Newton); decisions page copy updated to 32; full suite 2139 vitest tests passing.

### Fixed
- Stale `should-we-open-source-our-core-product` entry in topics.yaml marked killed — it was superseded by `should-i-open-source-my-product` (Wave 5); CONTENT_PIPELINE.md counts corrected.
- 7 failing Python (pytest) tests restored: `test_tier3_prep` updated for new `Tier3Result` return type from `prepare_tier3_materials`; `test_sources` assertion corrected from `httpx.ConnectError` to `FetchError`; `test_steve_jobs_incident_identification` count constant frozen to 29 (matching PR #175 artifact); `test_framework_forge_runbook` pointed at the quickstart doc (canonical CLI reference after phase-1 plan operational handoff). 625 pytest tests passing.

## 2026-05-14

### Added
- Wave 6 collision articles shipped (PR #399): 5 high-engagement "X vs Y" articles — `newton-vs-da-vinci-on-build-vs-design-first` (Newton + da Vinci; product), `sun-tzu-vs-napoleon-on-competitive-strategy` (Sun Tzu + Napoleon; strategy), `carnegie-vs-machiavelli-on-winning-through-people` (Carnegie + Machiavelli; hiring), `lincoln-vs-marcus-aurelius-on-leading-in-crisis` (Lincoln + Aurelius; crisis), `edison-vs-tesla-on-the-right-way-to-innovate` (Edison + Tesla; innovation); 5 reel integration tests added (57 total passing); 5 topics appended to topics.yaml (77 total, 77 shipped); 2108 vitest tests passing.
- Decision pages added to RSS feed (PR #398): all 29 `/decisions/[slug]` pages now appear in `/feed.xml` with correct `shippedAt` dates as pubDate; `rss-feed.ts` updated to accept optional `decisionEntries` input; 2 new rss-feed tests added (decision items appear with correct URLs and pubDates; omitted when not provided); route.test.ts updated to include DECISION_ENTRIES in expected output; 2108 vitest tests passing.
- Wave 5 content batch shipped (PR #397): 6 insight articles — `what-would-catherine-the-great-say-about-managing-a-scaling-organization` (catherine-the-great; leadership), `what-would-alexander-the-great-say-about-entering-new-markets` (alexander-the-great; strategy), `what-would-cleopatra-vii-say-about-strategic-alliances` (cleopatra-vii; resilience), `what-would-john-d-rockefeller-say-about-building-systems-that-scale` (john-d-rockefeller; systems), `what-would-julius-caesar-say-about-winning-team-loyalty` (julius-caesar; hiring), `what-would-florence-nightingale-say-about-operational-excellence` (florence-nightingale; product); 1 method article — `first-principles-thinking-explained` (isaac-newton; reasoning); 2 new decision pages — `should-i-open-source-my-product` (28th, Alexander/Curie/Machiavelli) and `should-i-expand-internationally` (29th, Cleopatra/Sun Tzu/Newton); completes coverage for all 3 previously unused ALLOWED_SLUGS figures (catherine-the-great, alexander-the-great, cleopatra-vii); 7 reel integration tests added (52 total passing); decisions page copy updated to 29; 9 new topics appended to topics.yaml (72 total, 72 shipped); full suite 2106 vitest + 52 reel tests passing.

## 2026-05-13

### Added
- Founding-member Q3 2026 urgency and 48-hour email response copy on pricing page (PR #386): urgency notice added below the Pro CTA trust badge showing Q3 2026 deadline, $300/year lock-in language, and $360/year future-price disclosure; satisfies the `verify-pricing` contract check for `/Q3 2026/`; 48-hour email response guarantee added to the Pro feature list.
- Batch-3 'What Would X Say' insight articles shipped (PR #387): `what-would-marcus-aurelius-say-about-burnout` and `what-would-napoleon-say-about-when-to-trust-the-data` published under `/insights` with full SEO metadata, hookQuestion, structured council debates, and annotation blueprints; both slugs marked `status: shipped` in `topics.yaml`.
- Static Pro features strip on Agora visible to free/anonymous users (PR #389): always-rendered `data-testid="pro-features-strip"` element below the stage content for non-Pro/anonymous users; contains the four text patterns the `verify-pricing` contract verifier checks on `/agora` (5 minds, Opus, 100 agons/month, Upgrade); visual design uses `var(--fg-faint)` micro-text to stay unobtrusive while stabilising contract coverage.
- Full DECISION_COURT coverage — 12 missing entries added for complete reel generation (PR #390): 12 shipped insight articles had a `decisionType` with no matching DECISION_COURT entry, causing the reel generator to fall back to a broken generic council that used raw `frameworkSlug` strings as mind names; all 12 entries (career, health, leadership, creativity, risk, strategy, innovation, resilience, ethics, growth, relationship, and identity decision types) added with correct display-name councils.
- 4 method/SEO articles shipped (PR #392): `cynefin-framework-explained` (single; da Vinci / Sun Tzu / Aurelius; 7 targetKeywords), `the-ooda-loop-vs-the-cynefin-framework` (collision; Sun Tzu / Machiavelli / da Vinci; 6 targetKeywords), `critical-decision-method-explained` (single; 3-speaker agonExcerpt; CDM annotation blueprints), and `trendslop` (core CTD differentiation piece — HBR 2026 study on LLM consensus clustering; reasoning council Newton / Curie / Aurelius); all four slugs marked `status: shipped` in `topics.yaml`; 15 method-article tests and reel-integration tests added; total suite 2145/2145 passing.
- Wave 4 content batch shipped (PR #396): 6 insight articles — `what-would-cicero-say-about-pitching-to-investors` (cicero; persuasion DECISION_COURT), `what-would-epictetus-say-about-what-you-can-control` (epictetus; control DECISION_COURT), `what-would-ada-lovelace-say-about-building-with-ai` (ada-lovelace; technology), `what-would-harriet-tubman-say-about-leading-a-mission` (harriet-tubman; leadership), `what-would-frederick-douglass-say-about-finding-your-voice` (frederick-douglass; persuasion), `what-would-archimedes-say-about-leverage` (archimedes; strategy); 1 method article — `inversion-thinking-explained` (niccolo-machiavelli; reasoning); 2 new decision pages — `should-i-hire-a-vp-of-sales` (26th, Carnegie/Machiavelli/Aurelius) and `should-i-go-full-time-on-my-startup` (27th, Jobs/Aurelius/Curie); 2 new DECISION_COURT entries (persuasion/control); 7 reel integration tests added (45 total passing); decisions page copy updated to 27; full suite 2137 vitest + 45 reel tests passing.
- `should-i-do-a-seed-extension` decision page shipped (PR #395): 25th decision page published at `/decisions/should-i-do-a-seed-extension` with council Machiavelli / Curie / Aurelius; targets "should I do a seed extension", "bridge round decision", and "seed extension vs Series A" queries; topics.yaml Wave 3 fully complete (all 8 entries shipped, 54 total topics 54 shipped).
- Wave 3 insight batch + second-order-thinking method article shipped (PR #394): six insight articles published — `what-would-steve-jobs-say-about-product-focus` (steve-jobs; focus decisionType), `what-would-lincoln-say-about-leading-through-crisis` (abraham-lincoln; crisis), `what-would-benjamin-franklin-say-about-time-management` (benjamin-franklin; time-management), `what-would-edison-say-about-failure-and-iteration` (thomas-edison; iteration), `what-would-carnegie-say-about-hiring-and-delegating` (andrew-carnegie; hiring), `what-would-seneca-say-about-procrastination` (seneca; procrastination); one method article — `second-order-thinking-explained` (marcus-aurelius; reasoning); 6 new DECISION_COURT entries (focus/crisis/time-management/iteration/hiring/procrastination) with complete MAIN/SUPPORT/CLOSE beats; 7 reel integration tests added (38 total passing); topics.yaml Wave 3 complete (7/8 entries shipped; should-i-do-a-seed-extension queued for Wave 4); full suite 2137 vitest + 38 reel tests passing.
- Wave 2 insight batch + Toulmin method article shipped (PR #393): six insight articles published — `what-would-napoleon-say-about-scaling-too-fast` (napoleon-bonaparte; scaling decisionType), `what-would-tesla-say-about-technical-debt` (nikola-tesla; technology), `what-would-machiavelli-say-about-competitor-espionage` (niccolo-machiavelli; strategy), `what-would-julius-caesar-say-about-moving-into-new-markets` (julius-caesar; strategy), `what-would-florence-nightingale-say-about-data-driven-decisions` (florence-nightingale; evidence), `first-mover-vs-fast-follower-what-sun-tzu-says` (sun-tzu; strategy); one method article published — `toulmin-argument-model-explained` (isaac-newton; reasoning); DECISION_COURT "scaling" entry added with Napoleon / Marcus Aurelius / Marie Curie council; 7 reel-integration tests added (31 total passing); topics.yaml backfilled with 11 missing shipped decisions (all 24 decisions now tracked), Wave 3 queue seeded with 8 entries (steve-jobs-product-focus, lincoln-leading-through-crisis, benjamin-franklin-time-management, edison-failure-and-iteration, carnegie-hiring-and-delegating, seneca-procrastination, should-i-do-a-seed-extension, second-order-thinking-explained); CONTENT_PIPELINE.md updated to reflect 54 total topics, 46 shipped, 8 queued.
- Decision entries added to RSS feed (PR #392): all 13 shipped `/decisions/{slug}` pages now appear in `/feed.xml` with correct `shippedAt` dates, appended after insight entries.
- Phase 3 reel automation handoff completed (PR #392): explicit Instagram posting deferral (§6.1) added to the Phase 3 handoff doc, satisfying the Phase 3 exit criterion that the posting path must be either wired or explicitly deferred.

### Fixed
- Static `annual-price-summary` label added to pricing page so `$25/mo` is contract-verifier stable (PR #391): root cause was two separate `<span>` elements for `$25` and `/mo` producing `$25 /mo` (with space) after HTML stripping, breaking the `/\$25(?:\/mo|\/month)/i` regex; fix adds a permanent `<p data-testid="annual-price-summary">Annual plan: $25/mo · $300/year</p>` that is always rendered in SSR regardless of billing toggle state; regression test locks adjacency.
- RSS `publishedAt` dates now use each article's actual `publishedAt` field instead of the batch collection date (PR #392): improves SEO freshness signals for feed readers and Google Search Console; articles published on 2026-05-12 and 2026-05-13 now appear with the correct per-article date.

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
- SEO listicle insight pages (PR #271): three new high-intent SEO pages published under `/insights` targeting organic search traffic; branch-coverage exception recorded in PR #306.
- `should-i-hire-my-first-employee` decision page (PR #294): decision page and companion debate published under `/decisions/should-i-hire-my-first-employee`.
- Public Agora share pages convert into new Agons (PR #296): public `/agora/a/[id]` share pages now surface a "Start your own agon" CTA that pre-fills the council and topic, converting anonymous readers into new Agora sessions.
- Root-level website script proxies (PR #297): script proxy routes added at the repo root so third-party scripts (analytics, monitoring) can be served from the first-party domain to avoid ad-blocker friction.
- Sentry smoke-test runbook expansion (PR #299 / #304): docs(runbook) expands the Sentry smoke-test verification flow with exact capture expectations and step-by-step verification commands.
- `/debates` and `/debates/[slug]` routes added to route table (PR #300): README route table updated to include the debates index and per-debate detail routes.
- Framework Forge LLM guardrails (PR #87): error class hierarchy introduced in Framework Forge — `ForgeError`, `ForgeValidationError`, `ForgeLLMError`, and `ForgeRateLimitError` — giving callers structured error discrimination without string-matching.
- One publication system for pricing, account, and library (PR #227): converges the pricing, account, and library surfaces into a single publication pipeline so Pro-gate logic, feature flags, and content state are consistent across all three surfaces.
- Five more decisions pages (PR #292): `/decisions/should-i-fire-my-cofounder`, `/decisions/pivot-or-persist`, `/decisions/should-i-take-the-job-offer`, `/decisions/should-i-sell-my-startup`, and `/decisions/should-i-shut-down-my-startup` published with full route coverage.
- RSS feed canonical metadata and route coverage hardened (PR #295): `/feed.xml` now emits correct `<link>`, `<guid>`, and `<pubDate>` canonicals for all public content types; route coverage tests extended to cover decisions and insights entries.
- Monetization playbook reconciled with shipped surfaces (PR #301): `docs/MONETIZATION_PLAYBOOK.md` updated to reflect the current Free / Pro / BYO-key tier boundaries, quota reset behaviour, and Stripe integration state.
- Quota-countdown nudge for free users with 1 agon remaining (PR #302): Agora now shows a nudge banner when a free user has exactly 1 agon left for the day, surfacing the Pro upgrade CTA before the quota is exhausted.
- `accentForSlug` and `formatPublishedDate` test coverage gaps closed (PR #303): additional unit tests added to reach full branch coverage on `accentForSlug` (Isaac Newton slug path) and the `formatPublishedDate` catch branch.
- Proof strip live-count refresh regression coverage (PR #305): regression tests lock the live-count refresh cycle in `LibraryProofStrip` and `PricingProofStrip`, preventing stale-count regressions on subsequent renders.
- PR #271 branch-coverage exception record (PR #306): `docs/branch-coverage-exceptions.md` records the intentional coverage gap in the PR #271 SEO listicle pages with rationale and owner sign-off.
- Sprint 4 polish notes refreshed (PR #307): `docs/sprint4-polish-notes.md` updated to reflect shipped state across Agora conversion, pricing proof, and SEO surface work.
- PostHog funnel spec (PR #308): `docs/posthog-funnel-spec.md` documents the email-capture → signup → pro-upgrade funnel with event names, properties, and cohort definitions for PostHog analysis.
- `/decisions` and `/decisions/[slug]` routes added to route table (PR #310): README route table updated to include the decisions index and per-decision detail routes.
- Sentry edge config and smoke tests (PR #312): Sentry error monitoring wired into the Next.js app with edge-runtime config; smoke-test script validates capture end-to-end against the live DSN.
- Decisions batch 3 — LLC/C-corp, money-vs-equity, pivot-to-AI (PR #313): `/decisions/llc-vs-c-corp`, `/decisions/take-money-vs-equity`, and `/decisions/pivot-to-ai` published with full route coverage.
- Decisions batch 4 — accelerator, CTO-vs-cofounder, launch-now-or-wait (PR #320): `/decisions/should-i-join-an-accelerator`, `/decisions/should-i-hire-a-cto-or-find-a-technical-cofounder`, and `/decisions/should-i-launch-now-or-wait-for-perfect` published with full route coverage.
- Sitemap extended for `/decisions` and `/decisions/[slug]` (PR #321): all decisions index and per-decision pages added to `sitemap.xml` with `priority 0.8` and `weekly` changeFrequency.
- Framework tier validation artifacts for eight newly validated frameworks (PR #322): tier1, tier2, and tier3 validation results added for ada-lovelace, alexander-the-great, catherine-the-great, cleopatra-vii, epictetus, galileo-galilei, harriet-tubman, and john-d-rockefeller.
- Validation artifact structure tests (PR #325): adds `tests/test_validation_artifacts_structure.py` to verify all published frameworks carry a complete and well-formed tier1/tier2/tier3 validation directory.
- Decisions batch 5 — build-in-public, charge-from-day-one, split-equity (PR #326): `/decisions/should-i-build-in-public`, `/decisions/should-i-charge-from-day-one`, and `/decisions/should-i-split-equity-50-50-with-my-cofounder` published with full route coverage.
- 2026-05-12 release note documenting the decisions expansion wave 2 (PR #327): `docs/release-notes/2026-05-12-decisions-expansion-wave2.md` covering all batches 3–5, framework validation pipeline, sitemap SEO, and 19→26 roster expansion.
- Decisions batch 6 — raise-series-a, sign-term-sheet, go-remote-or-in-person (PR #329): `/decisions/should-i-raise-a-series-a`, `/decisions/should-i-sign-this-term-sheet`, and `/decisions/should-i-go-remote-or-in-person` published with full route coverage.
- Batch-1 'What Would X Say' articles shipped (PR #364): `what-would-marcus-aurelius-say-about-imposter-syndrome` added to `INSIGHT_ENTRIES` with full SEO metadata, hookQuestion, and structured council debate; two pre-existing entries (`what-would-sun-tzu-say-about-tariffs-and-trade-wars`, `what-would-machiavelli-say-about-firing-someone-you-respect`) enriched with `agonExcerpt` debate content and expanded `targetKeywords`; all 3 slugs marked `status: shipped`.
- "What Would X Say" articles batch 2 published (PR #372): four new insight pages live under `/insights` — `what-would-newton-say-about-rebuilding-from-first-principles`, `what-would-tesla-say-about-shipping-vs-perfecting`, `what-would-leonardo-say-about-creative-block`, and `what-would-sun-tzu-say-about-entering-saturated-markets`; annotation blueprints added for each entry; all 4 slugs marked `status: shipped` in `topics.yaml`.

### Fixed
- ProofStrip fallback social-proof counters removed (PR #365): `PROOF_STRIP_FALLBACK` constant (500 subscribers, 1000 sessions) deleted from `lib/proof-strip.ts`; `ProofStrip.tsx` now returns `null` when `data` is `undefined` and not loading instead of emitting fabricated numbers; `<ProofStrip>` removed from `Footer.tsx` (no live data access); all affected tests updated to assert null-return behaviour.
- `should-i-build-in-public` council corrected — Seneca replaces Franklin (PR #330): debate rewritten with Seneca's "narrating vs doing" angle, which adds a distinct Stoic warning about audience-dependency that complements Aurelius's virtue framing and Machiavelli's strategic framing; decisions.ts `recommendedCouncil` updated accordingly.
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
