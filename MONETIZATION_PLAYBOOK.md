# Monetization Playbook

**Status:** Source of truth for monetization + GTM execution, April 2026 → April 2027.
**Last updated:** 2026-05-10
**Owner:** Edward
**Supersedes:** monetization sections of [MARKETING_STRATEGY.md](MARKETING_STRATEGY.md) and §9 + §11 of [AGORA_PLAN.md](AGORA_PLAN.md). Content cadence in [CONTENT_PIPELINE.md](CONTENT_PIPELINE.md) is **reprioritized, not replaced** — see §9 below.

---

## 1. Strategic decision

**The Retool pattern, not the Red Hat pattern.**

After evaluating how Red Hat, GitLab, WinRAR, Superhuman, and Retool actually got started (not where they are today), the audience-first / open-source-first model is not what any of them did. Red Hat was a catalog business from day 1. GitLab tried donations and abandoned them. Superhuman was always paid. Retool hit $1-2M ARR via cold email **before** public launch.

At April 2026 state — solo founder, zero inbound, no runway to burn — the highest-probability path is:

1. **Charge from day 1** for a defined SKU (Agora Pro, $30/mo)
2. **Cold outreach to a specific ICP** until PMF signal is clear
3. **Content + case studies compound AFTER first paying customers exist**, not before

This reverses the content-led / audience-first framing from the 2026-04-19 project status. Content engine still runs (see §9) but it is no longer the *primary* acquisition channel in months 1-6.

**Why the Red Hat pattern was rejected:** its moats (compliance audit risk, regulated-industry certification, 24/7 SLA support) are not accessible to a solo founder. "The Red Hat model only worked for Red Hat" — per Open Core Ventures. Open-source without the compliance wedge is pure distribution cost with no capture.

**Revenue ceiling honesty check:** back-of-envelope TAM for "decision support via historical frameworks" lands at ~$15-20M ARR in the current product shape. Reaching $40M requires either horizontal product expansion (weekly-use tool, not just hard-moment tool) or an enterprise wedge with much higher ACV. Do not pretend otherwise.

---

## 2. Product definition — "Agora Pro" ($30/mo)

The bundle:

| Feature | Free | Pro ($30/mo) |
|---|---|---|
| Agons per period | 3/day/IP (~90/mo), anonymous | **100/mo** on our key, account-scoped |
| Council size | 2-3 minds | Up to **5 minds** |
| Model quality | Sonnet throughout | Sonnet debate + **Opus consensus synthesis** |
| Debate history | localStorage, device-bound | **Persistent synced library**, searchable, taggable |
| Sharing | Read-only link | Private by default, optional share |
| PDF export | — | Full debate + consensus, clean format |
| Research depth | Short Tavily pass | Extended: more sources, longer window |
| New frameworks | Released publicly | **Early access 2 weeks ahead** |
| Founder access | — | Direct email to Edward for decision-framing (48h response) |

**Upgrade hooks (why someone clicks "upgrade"):**
1. Hit the free limit AND want more → usage cap
2. Want to save a debate for reference → persistence
3. Want to share with co-founder / board → PDF export
4. Want deeper research on the topic → extended mode

**Pricing:**
- Monthly: $30
- Annual: $300 (2 months free, captures cash upfront, reduces churn optics)

**Unit economics:** cost ceiling ~$0.30/agon × 100 cap = $30. Thin margin on heavy users, subsidized by light ones. Standard SaaS shape. After 30-50 paying customers we'll have real data to repackage.

**Out of scope for Pro v1** (defer until asked):
- Team seats / shared library
- SSO, audit logs, enterprise features
- API access
- Custom framework storage / Forge submissions
- White-label

---

## 3. Gap analysis — current → chargeable

**Current state (verified 2026-04-22):**
- Rate limit is IP-based (3/day/IP, global 60/day), Redis-backed ✓
- Contact form → Discord webhook ✓
- `src/app/agora/AgoraApp.tsx` is 1432 lines, single file, no account concept
- `.env` requires only `ANTHROPIC_API_KEY`
- **Zero auth, zero Stripe, zero persistence beyond localStorage**
- AGORA_PLAN.md §11 explicitly listed auth/login/Stripe as v1 non-goals — **this playbook reverses that decision**

### Tier 1 — blocks first dollar

| # | Gap | Effort (solo) |
|---|---|---|
| 1 | Auth (Clerk recommended) | 1-2 days |
| 2 | Stripe setup (Checkout + Billing Portal) | 1 day |
| 3 | Stripe webhook handler (`/api/stripe/webhook`) | 1 day |
| 4 | User-scoped rate limit (rewrite of `src/lib/agon/rateLimit.ts`) | 1 day |
| 5 | Pricing page (`/pricing`) | 0.5 day |
| 6 | ToS + Privacy Policy (Termly) | 2 hours |
| 7 | Transactional email (Resend) | 0.5 day |
| 8 | Basic account page (plan, usage, cancel) | 0.5 day |

### Tier 2 — justifies the $30

| # | Gap | Effort |
|---|---|---|
| 9 | Postgres (Neon) + debate persistence | 2 days |
| 10 | Library view (`/library`) | 1 day |
| 11 | PDF export (react-pdf or print CSS) | 1-2 days |
| 12 | Opus-for-consensus flag in `agonEngine.ts` | 0.5 day |
| 13 | 5-mind cap gating for Pro | 0.25 day |
| 14 | Extended research mode for Pro | 1 day |

### Tier 3 — makes sales tractable

| # | Gap | Effort |
|---|---|---|
| 15 | Sample case study / reference agon to link in cold emails | 1 day |
| 16 | 60-second Loom demo embedded on pricing page | 2 hours |
| 17 | Annual plan option | 0.5 day |
| 18 | Concrete "founder email" commitment (address + 48h SLA in writing) | 0 effort, real commitment |

### Tier 4 — defer until signal

Team seats, SSO, API, Forge submission portal, enterprise contracts, white-label. None built until a paying customer asks.

**Total Tier 1 + 2 + 3: ~15-18 working days. Realistic calendar: 5-6 weeks with polish and interruptions.**

---

## 4. Phased build plan

### Phase 0 — Apr 22-23: planning ✅ COMPLETE

- [x] Write target customer list: **30 specific people by name**, with why-they-pay notes → `docs/phase0-target-list.md`
- [x] Draft cold email template (3 variants for A/B) → `docs/phase0-cold-email-templates.md`
- [x] Generate personalized outreach debates for all 30 targets (option 3 hybrid — replaces generic case study) → `docs/outreach-debates/*.md`
- [x] Create Stripe account "consultthedead", define Agora Pro product ($30/mo + $300/yr)
- [x] Choose auth provider → **Clerk** (50K free MAU, ships in 1 day, first-class Next.js 16 + Stripe)
- [x] Write pricing page copy → `docs/phase0-pricing-page-copy.md`

### Phase 1 — Apr 24 – May 5 (~10 working days): payment rails

Sequential, do not parallelize solo:
1. Clerk integration (day 1-2)
2. Stripe Checkout + Customer Portal + webhook (day 3-4)
3. Pricing page + account page (day 5)
4. ToS, Privacy, Resend transactional email (day 6-7)
5. User-scoped rate limit rewrite (day 8-9)
6. End-to-end test: sign up → pay → run agon → cancel → verify limits (day 10)

**Phase 1 milestone:** someone could pay you today and it would work. Product isn't value-complete, but rails are live.

### Phase 2 — Apr 23-24: value justifies the price ✅ COMPLETE

7. [x] Neon Postgres + debate persistence — schema, client, API routes, library page, save button all built. Needs Neon account activation (Edward's task: create neon.tech account, run schema.sql, add DATABASE_URL to Vercel)
8. [x] PDF export — gated to Pro only. Free users see "PDF Export — Pro only → /pricing"
9. [x] Opus synthesis flag + 5-mind gating — Pro gets Claude Opus for consensus synthesis + up to 5 minds. Free capped at 3 minds + Sonnet.
10. [x] Outreach debate pages — 30 personalized debates published at consultthedead.com/debates/<slug>, statically generated, noindex, ready for cold emails

**Phase 2 milestone:** Pro tier is genuinely a better product than Free. You'd pay for it yourself.

### Phase 3 — May 19-30 (~10 working days): first sales motion

- [ ] Free 3-month Pro to 5 hand-picked honest-feedback friends (not strangers)
- [ ] Watch them use it. Ask what they'd pay if it disappeared.
- [ ] Iterate on top 3 complaints
- [ ] Cold email wave 1: **10 of the 30 targets** (personalized debates already generated)
- [ ] 15-minute Calendly onboarding call for every reply
- [ ] Case study + Loom video from first user sessions

**Phase 3 milestone:** first paying customer who isn't a friend. Validation signal, not revenue signal.

---

## 5. Post-launch milestones

Calibrated against Retool's real trajectory ($1-2M ARR pre-launch via cold outbound, several million with 4 people), adjusted for Edward's ARPU being ~70x lower.

| Month (from first cold email ~Jun 2026) | Paying customers | MRR | Leading indicators | Meaning |
|---|---|---|---|---|
| **3 (Aug 2026)** | 15-25 | $450-750 | 30-day retention > 70%. Cold email reply > 5%. | On the normal indie SaaS path. |
| **6 (Nov 2026)** | 60-100 | $1.8k-3k | ≥3 customers evangelistic / referring unprompted. | Signal of PMF. |
| **9 (Feb 2027)** | 150-250 | $4.5k-7.5k | First unsolicited team-seat request. First Forge inquiry. | On path to $100k ARR. |
| **12 (May 2027)** | 300-500 | $9k-15k | ≥30% of new customers from content, not cold email. | On path to $1M ARR year 2-3. |
| **18 (Nov 2027)** | 800-1200 | $24k-36k | Shape B inbound (enterprise / private framework) arrives. | Legitimate $2-5M ARR forming. |
| **24 (May 2028)** | 2k+ OR enterprise wedge open | $60k+ | Choose lane: high-volume solo ($1M ARR path) or enterprise ($10M+ ARR path). | On the $20M path. |

---

## 6. Kill criteria — when to pivot or stop, not push harder

- **Month 3:** under 10 paying despite 60+ cold emails → ICP is wrong, not marketing
- **Month 6:** 30-day retention under 40% → product isn't sticky for this persona, library hook doesn't land
- **Month 12:** under $3k MRR → not on $1M ARR path in this shape, real pivot required
- **Consistently:** cold email reply rate under 2% → positioning is off, not volume

Triggering any of these is not failure — it's data. Respond by repricing, repositioning, or pivoting, not by sending more emails.

---

## 7. ICP & outreach plan

### Initial ICP hypothesis (to be validated in Phase 0)

**Primary:** solo operators making high-stakes decisions with limited counsel
- Solo founders (pre-seed to Series A)
- Solo consultants / advisors (executive coaches, management consultants)
- Small PE / VC operators (partners at 1-5 person funds)
- Independent writers / thinkers with paying audiences (Substack, newsletter operators)

**Secondary:** small teams in decision-heavy roles
- 2-5 person product teams at seed/Series A startups
- Indie hedge fund managers
- Solo M&A advisors

**Explicitly NOT in ICP for v1:**
- Enterprise (long sales, needs features Pro doesn't have)
- Casual consumers (won't pay $30/mo for occasional use)
- Claude power users as a category (too diffuse — target by decision-role, not by tool-use)

### Outreach mechanics

- **Channel:** email, personalized. No LinkedIn DMs in wave 1.
- **Volume:** 30 targets in wave 1 across first 2 weeks post-launch. If reply rate > 5%, scale to 60 in wave 2. If < 2%, stop and reposition.
- **Offer:** "Try Pro free for 30 days, no card. Keep if it helps, walk if it doesn't."
- **Meeting:** 15-min Calendly, recorded for case-study material with consent.
- **Source of targets:** Twitter/X followers of specific accounts (Naval, Dan Koe, Patrick Collison, Shane Parrish), indie founder Discords, r/slatestarcodex, direct Edward network, Substack recommendations graph.

### Cold email template (skeleton — finalize in Phase 0)

- Opening: name one specific decision they've publicly wrestled with
- Hook: "I built a tool that runs your decision past 3-5 historical frameworks. Here's one I ran: [link]"
- Ask: 30-day Pro free, 15-min call if it lands
- Close: no pressure, walk-away permission

---

## 8. Repo / IP hygiene (blocking Phase 1)

Before cold emails go out, complete these:

- [ ] **Split the repo.** Current public repo at [edwardyen724-g/consult-the-dead](https://github.com/edwardyen724-g/consult-the-dead) contains `framework_forge/`, `AGORA_PLAN.md`, `MARKETING_STRATEGY.md`, `CONTENT_PIPELINE.md` — move to a private repo.
- [ ] Keep public: `frameworks/`, `website/` (these match the "open methodology, public portfolio" positioning)
- [ ] Use `git filter-repo` to strip strategy docs from public history, not just delete-and-commit
- [ ] Update README.md to reflect new structure (methodology public, product private, frameworks public)
- [ ] Keep `framework_forge/` private until Shape A / Shape B product decisions are made

**Not doing:** making frameworks themselves private. The essay positions them as open portfolio; flipping that contradicts the current brand signal. They stay public as case studies. The revenue is the *hosted Agora*, not the framework files.

---

## 9. How this fits with existing plans

### Amends MARKETING_STRATEGY.md / CONTENT_PIPELINE.md

Content cadence (2-3 articles/week, reels, carousels) is **reprioritized, not replaced**:

- **Months 1-3:** cold outreach is primary. Content is credibility support only — 1 article/week max, focused on reference case study and positioning.
- **Months 3-6:** content ramps as customer experiences become case studies. 2 articles/week + 2-3 reels/week.
- **Months 6-12:** content becomes primary acquisition if month-6 milestone hits. Full cadence per CONTENT_PIPELINE.md.

### Amends AGORA_PLAN.md §11 "non-goals"

The following are no longer v1 non-goals:
- User accounts / login — **now in Phase 1**
- Stripe subscriptions — **now in Phase 1**
- Persistent debate storage — **now in Phase 2**

The following remain non-goals:
- Editable framework library
- Multi-user / collaborative agons
- Voice, video, avatars
- "Chat with X" mode

### Concierge $29 offer

Remains as a landing-page CTA. Not integrated into Pro. If it gets taken up without prompting after launch, revisit as a potential high-touch tier.

### Previous "5 open decisions" from 2026-04-19 project status

1. ~~Voice (real vs ElevenLabs)~~ — resolved: F5-TTS voiceover stack, with Chatterbox fallback.
2. ~~Email capture provider~~ — resolved: Beehiiv for capture; Resend stays reserved for transactional email.
3. ~~`/decisions/{slug}` UX~~ — resolved: pre-loaded cached agons with run-your-own CTA.
4. ~~Instagram handle~~ — resolved: `@consultthedead` with defensive registrations for `@consultthedead_official` and `@theconsultthedead`.
5. ~~Concierge $29 on/off~~ — resolved: keep as optional landing CTA, not Pro feature.

---

## 10. Open decisions (need input)

1. **Target list (Phase 0 deliverable).** Who are the 30 names? Edward owns.
2. **Reference case study topic.** Which real Edward decision is the hero case? Must be recent, specific, and resolve-able on camera.
3. **Whether to keep "greatmind is open source" framing in the essay.** Open-source the *methodology* is defensible. Open-source the *product* contradicts charging for it. Essay needs a rewrite in Phase 2.
4. **Pricing: $30 or $39?** $30 is the mental-model price. $39 is 30% more revenue per user, same perceived value. Test after first 10 customers.

---

## 11. Changelog

- **2026-04-24** — Phase 2 completed overnight. Outreach debate pages live (30 static pages at /debates/<slug>). Opus synthesis + 5-mind gating for Pro. PDF export Pro-gated. Neon Postgres persistence layer built (pending account activation). Playbook timeline updated — Phase 3 (first sales motion) can start immediately.
- **2026-04-23** — Phase 0 + Phase 1 completed in 1 day. Stripe account, Clerk auth, Stripe Checkout, pricing page, account page, ToS/Privacy, Resend email, user-scoped rate limits, Clerk production instance, Google OAuth, DNS — all live. Added 30 personalized outreach debates as a new deliverable (option 3 hybrid replacing generic case study).
- **2026-04-22** — Initial playbook. Strategic shift from audience-first to Retool-pattern. Agora Pro ($30/mo) defined. 6-week build plan. ICP hypothesis. Repo split planned.
