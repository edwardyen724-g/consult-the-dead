# The New Agora — Plan

**Status:** approved, ready for Phase 1
**Owner:** Edward
**Last updated:** 2026-04-18

---

## 1. Why a new app, not a refactor of company-builder

Company-builder was built around a metaphor — "assemble a company of historical figures" with CEO/CFO/researcher titles, an org chart, draggable tiles, multi-panel canvas. That metaphor was a creative scaffold for "assemble your advisors," but it adds friction the actual value doesn't need. It also has known bugs we've decided not to fix.

The actual value is simpler: **a person has a hard question; they want a small council of historically-grounded reasoning frameworks to argue it out and hand back a consensus.** No company. No roles. No tiles to drag.

The landing page demo at [website/src/app/worked-example.tsx](website/src/app/worked-example.tsx) is, accidentally, the UX spec for this:

```
TOPIC  →  RESEARCH  →  AGON  →  CONSENSUS
```

The new Agora is that demo, made interactive.

**Company-builder is being hidden from the website.** Not deleted — just no longer linkable from the marketing site. All forward motion happens in Agora.

---

## 2. The flow

A single-page experience with sequential stages inside `/agora`. No tabs, no panels, no sidebar. The user is on rails — each stage finishes and reveals the next.

### Stage 1 — TOPIC

- One textarea. Placeholder: *"What decision are you carrying?"*
- Primary CTA: *"Begin the Agon"* (see §Naming below).
- Optional below-the-fold: 3 example decisions that autofill.

### Stage 2 — RESEARCH (toggleable)

- Tavily-backed pass that gathers context **actually relevant to the user's submitted topic**. No mock lines, no filler. If Tavily returns nothing useful, show "No external context needed — proceeding to the agon" and move on.
- UI: 3-5 research lines stream in, each citing real source titles/URLs. Collapse to a one-line summary after.
- **Toggle behavior:** user can disable research entirely at Stage 1. If they leave it on, it runs to completion — **it cannot be fast-forwarded mid-stream.** The research is genuine work, not a loading animation. Skipping is an up-front decision, not a mid-flight escape.

### Stage 3 — COUNCIL SELECTION

- Horizontal row of **mind cards** (not chips). Each card: name, dates, one-line lens, color accent, framework incident count.
- User picks **2-5 minds.** Hard cap at 5 for v1 (see §Open questions for reasoning).
- System suggests a council based on the topic (cheap heuristic on question text — strategy keywords → Sun Tzu / Machiavelli; evidence keywords → Curie / Newton; etc.). Pre-selects 3. User can swap any in or out.
- **Why cards beat chips here:** cards give the user *enough context to pick well* — one-liner lens + dates make the mind's perspective legible. Chips (compact name pills) work for tagging known entities; they fail when the user is choosing advisors they need to understand first.
- Primary CTA: *"Begin the Agon."*

### Stage 4 — THE AGON

See §Agon structure below for the argument schema. Summary:
- 3 rounds, each mind speaks once per round.
- Each turn: **150-250 words**, structured (position → warrant → engagement → implication).
- Streamed token-by-token per turn.
- Visual: vertical thread, color-coded per mind (reuse existing `--color-machiavelli` etc. CSS vars). Mind name, round number, and turn anchor on each block.

### Stage 5 — CONSENSUS

- After round 3, the convergence pass produces the 5-node synthesis: **POINTS / TENSIONS / ACTION / STEPS / RISKS.**
- Render as the graph from the landing demo, labeled.
- **Interactive nodes:** hover or click a node to expand an inline 1-2 line explanation of *what specifically drove that node's content* — e.g. "POINTS: Sun Tzu and Curie both flagged X; Machiavelli conceded Y in round 3." This teases the depth without overwhelming.
- Below the graph: full paragraph synthesis per node (this is where the detail lives).
- Downloadable as PDF with everything: topic, council, full debate, consensus, per-node paragraphs.
- CTAs: *"Share this agon"* (saves + generates shareable link, see §Persistence) and *"Begin another."*

---

## 3. Agon structure — what a turn should contain

Research-backed (formal debate + multi-agent LLM debate literature). The goal: turns long enough to make a real point, short enough to stay readable across 9-15 turns total.

### Turn length: 150-250 words

Shorter collapses into generic agreement cascades (Du et al., 2023). Longer becomes unreadable in a streaming UI. Formal debate uses longer turns (6-8 min constructives, ~900 words) because the audience has time and attention; in a web debate, 150-250 words is the sweet spot where a claim + warrant + real engagement fits.

### Required components per turn

1. **POSITION** (1 sentence) — the framework's stance on the user's specific decision.
2. **WARRANT FROM FRAMEWORK** (2-3 sentences) — *why* this framework demands that stance. Must cite a specific principle, bipolar construct, or documented incident from the figure's framework.json. This is the anti-filler mechanism — if the warrant could be pasted into any framework's mouth, it's generic.
3. **ENGAGEMENT** (2-3 sentences, rounds 2-3 only) — name another mind by name and either concede a specific point, sharpen a specific disagreement, or expose a hidden assumption. Without this, round 2 and 3 collapse into restatement.
4. **ACTIONABLE IMPLICATION** (1 sentence) — what the user should actually do if this turn's logic wins.

### Round arc

- **Round 1:** pure position + warrant. Each mind establishes what they see.
- **Round 2:** engagement mandatory. Each mind must address at least one other mind by name.
- **Round 3:** concessions + sharpening. Each mind states what they've updated on and what they still hold firm.

### Anti-patterns to reject

- Hedging ("it depends"), restating the user's question, generic virtue-signaling, symmetric both-sides-ism.
- Turns that could be moved to a different mind without edits — that's a signal the warrant was generic.
- Round 2/3 turns without a named reference to another mind.

### Research inputs

Sources reviewed: Lincoln-Douglas / policy / Oxford-style debate norms (turn length 900-1000+ words but with 5-8 min of live delivery time); Toulmin model (claim + grounds + warrant as the non-negotiable trio); Du et al. 2023 "Improving Factuality and Reasoning through Multiagent Debate"; Liang et al. Society of Mind; Irving et al. (Anthropic/DeepMind debate). Convergent finding: engagement that names and critiques prior turns is what separates useful multi-agent debate from generic parallel responses.

---

## 4. Naming — what to call things

The product is "the Agora." The Greeks didn't say "debate." Research surfaced these candidates:

| Term | Literal meaning | Vibe |
|---|---|---|
| **Begin the Agon** | begin the contest (ἀγών = contest of speeches) | punchy, on-brand, ties to *agora* etymologically |
| Open the Agon | open the contest | slightly more ceremonial |
| Convene the Council | call the *boulē* | deliberative, senatorial |
| Call the Agora | summon the assembly | civic, inclusive |
| Summon the Voices | invoke the speakers | mythic, evocative |

**Adopted:** **"Begin the Agon"** for the primary CTA button at Stage 1 and Stage 3. Two words, hard consonants, historically accurate (the *agōn logōn* was the ancient contest of speeches), avoids the overused "debate," and reinforces that the product is a contest of reasoning.

Stage 4 is internally called "THE AGON" (rather than "DEBATE"). The landing page demo's stage header "DEBATES" should be renamed to "AGON" in a later pass for consistency, but that's cosmetic polish — not blocking.

---

## 5. What we keep, drop, and reuse — with independence rules

Critical rule from Edward: **anything Agora needs must live outside `company-builder/`.** If `company-builder/` is ever deleted, Agora must still work.

| Aspect | Decision | Action |
|---|---|---|
| Debate API logic from [company-builder/src/app/api/debate/route.ts](company-builder/src/app/api/debate/route.ts) | **Port**, don't reference | Extract pure functions into `website/src/lib/agon/` — streaming orchestration, convergence pass, prompt builders |
| Framework JSON at [frameworks/](frameworks/) | **Reuse** (already at repo root, not inside company-builder) | Import directly |
| Rate limiter from [company-builder/src/lib/rateLimit.ts](company-builder/src/lib/rateLimit.ts) | **Port** | Rewrite at `website/src/lib/rateLimit.ts` |
| BYO key / server key logic | **Port** | Rewrite in Agora, don't share with company-builder |
| Company canvas, MindNode, ConnectionEdge, CompanyBar, DetailPanel, MindLibrary sidebar | **Drop** | Not needed |
| CEO/CFO/researcher titles, org chart concept | **Drop** entirely | — |
| Drag-and-drop | **Drop** | — |
| Landing page demo visual language (stage header, research lines, thread, consensus graph) | **Reuse visually, extract structurally** | Pull the consensus graph from [worked-example.tsx](website/src/app/worked-example.tsx) into a shared `<ConsensusGraph />` component at `website/src/components/` — used by both the landing demo and the live Agora |

After Phase 2, `company-builder/` has zero inbound dependencies from the website.

---

## 6. Where it lives

**Decision: inside `website/` as `website/src/app/agora/`, served on the `agora.consultthedead.com` subdomain.**

Rationale (short version): the product is now small enough that marketing site and product can share one Next.js app — one deploy, one build, one codebase. But the user-facing URL stays as the subdomain `agora.consultthedead.com`, matching the existing mental model and any brand/marketing links people already have.

How this works at the infra level:
1. Build the Agora at `website/src/app/agora/page.tsx`.
2. In Vercel, add `agora.consultthedead.com` as a domain on the **website** project (it's currently on the company-builder project).
3. Add a Next.js rewrite so requests hitting the `agora.consultthedead.com` host serve `/agora`. Both `agora.consultthedead.com/` and `consultthedead.com/agora` resolve to the same page — the subdomain is the canonical public URL.
4. Remove `agora.consultthedead.com` from the company-builder Vercel project. With no domain bound, company-builder is effectively undeployed.

The existing `/` landing page stays on `consultthedead.com`. The `company-builder/` directory stays in the repo for reference but has no live deployment.

---

## 7. Hide company-builder from the website — done in this pass

Executed 2026-04-18:

- Removed "Enter The Agora" button from [website/src/components/Header.tsx](website/src/components/Header.tsx). Header now shows: Essay · Frameworks · Insights · theme toggle.
- Repointed insights per-framework CTA in [website/src/app/insights/[slug]/page.tsx](website/src/app/insights/[slug]/page.tsx) from `agora.consultthedead.com` to `/#council` (the landing page concierge form). Button copy: *"Submit your decision to the council"*.
- Removed the `WebAppJsonLd` schema emission in [website/src/components/JsonLd.tsx](website/src/components/JsonLd.tsx) that advertised the agora subdomain. Will be reintroduced pointing at `/agora` when Phase 2 ships.

**Still to do at the Vercel level (Edward's dashboard, not code):**

Today, `agora.consultthedead.com` still points at the company-builder project. We have two options:

- **Option 1 (recommended): leave it until Phase 1 is ready.** When Agora Phase 1 ships, move the subdomain from the company-builder project to the website project in the same deploy. Company-builder goes dark in the same moment Agora goes live — no gap, no 404 window.
- **Option 2: take it down now.** Remove the subdomain from company-builder immediately. `agora.consultthedead.com` starts returning 404 until Phase 1 ships. Cleaner but creates a dead window.

Option 1 is the plan. No Vercel action needed until Phase 1 completes.

---

## 8. Implementation phases

### Phase 0 — ship today's work ✅

- Subhead trimmed from 5 figures to 3 (Machiavelli / Sun Tzu / Curie, matches the demo).
- Fan diagram reduced from 5 lines to 3, rebalanced.
- Company-builder unlinked from website (header + insights CTA + JsonLd).
- This plan doc checked in.

**Action:** commit + push these to Vercel.

### Phase 1 — Agora skeleton

- Create `website/src/app/agora/page.tsx`, `website/src/app/agora/layout.tsx`.
- Build the 5-stage client-side state machine, static content only, no API calls.
- Extract `<ConsensusGraph />` into `website/src/components/` and use it in both the landing demo and Agora Stage 5.
- Add "Enter the Agora" link back to Header, pointing to `/agora`.
- Visual continuity with the landing page demo is the first-order requirement.

### Phase 2 — agon engine

- Port streaming orchestration from [company-builder/src/app/api/debate/route.ts](company-builder/src/app/api/debate/route.ts) into `website/src/lib/agon/` as pure functions.
- New SSE route at `website/src/app/api/agon/route.ts`. Contract:
  - `POST { topic, mindSlugs[], rounds: 3, research: boolean }`
  - → stream of `{ type: "research" | "turn" | "consensus", ... }` events
- Rewrite the turn prompt builder to enforce the §3 structure: position / warrant / engagement / implication, 150-250 words, round-specific rules.
- Rewrite the convergence prompt to produce `{ points, tensions, action, steps, risks, pointsExplanation, tensionsExplanation, ... }` so Stage 5's hover/click expansions have real content.
- Rate limiter applied from first deploy.

### Phase 3 — research stage

- Wire Tavily against the user's actual topic. No mock lines.
- Source citations shown inline per research line.
- Toggle: if off, skip entirely; if on, run to completion, no fast-forward.

### Phase 4 — persistence + sharing

- Save each completed agon (topic + council + full debate + consensus) in a lightweight store (Vercel KV or Postgres — cheapest that persists). Anonymous, keyed by short ID.
- Shareable URL: `/agora/a/{id}`. Public read, no auth needed.
- "Revisit" list in localStorage so users see their own prior agons even without an account.

### Phase 5 — polish + launch

- Mobile pass (thread and graph on small screens).
- Copy pass across all stages.
- Empty states + errors (rate-limited, mid-stream failure, Tavily timeout).
- Re-add `WebAppJsonLd` pointing to `/agora`.
- Update [MARKETING_STRATEGY.md](MARKETING_STRATEGY.md) with the live product URL.

---

## 9. Monetization — confirmed model

Same as the original BYO-key approach, now with a planned upgrade path:

- **Free tier:** 3 agons / IP / day, using a server-side Anthropic key. No account required.
- **BYO key:** unlimited. API key entered in a settings drawer (not a blocking modal).
- **Subscription tiers (future, not v1):** monthly plans with progressively higher rate limits on the server-side key, so users don't have to hold an Anthropic account. Pricing and tier breakpoints TBD.

Concierge offer ($29 manual debate from [MARKETING_STRATEGY.md](MARKETING_STRATEGY.md) §6) is **not** an integrated Agora feature. It only makes sense if it delivers meaningfully higher value than the automated flow — e.g. Edward's hand-written synthesis on top, or running the debate with 5 minds + custom research the free tier doesn't do. Keep as an optional landing-page CTA for now; revisit if user feedback shows demand.

---

## 10. Open questions — resolved

| Question | Decision |
|---|---|
| Persist debates? | Yes — save so users can revisit, enables sharing/virality. Ship lean in Phase 4, not v1. |
| Cards vs chips for council select? | **Cards.** User needs context to pick advisors; chips are for known-entity tagging. Lean default: pre-select 3 suggested, user can swap. |
| What happens to company-builder URL? | Hidden from website. Has known bugs, not worth fixing. Agora is the sole product. |
| Mind cap? | **Up to 5** in v1 (originally 3 was just the prototype default). Allowing unlimited would require real research on multi-agent structure optimal sizing — deferred. |
| Concierge integration? | Optional landing-page CTA only, not an Agora feature. Needs to add real value (deeper synthesis, wider council) to justify $29 over the free tier. |

---

## 11. Non-goals for v1

- No accounts, no login, no Stripe subscriptions.
- No editable framework library — the 11 (Einstein hidden pending legal) are what you get.
- No multi-user / collaborative agons.
- No voice, no video, no avatars.
- No "chat with Newton" mode — this is a contest of reasoning, not a chatbot.

---

## 12. Success criteria for v1 launch

- First-time visitor can land → type a question → pick 2-5 minds → read a full agon + consensus in under 3 minutes.
- No API key wall. Free tier works instantly.
- Agon turns meet the §3 structure — no generic filler, every turn has a named framework warrant.
- Consensus nodes are interactive and explain themselves.
- Agons are saved and shareable.
- Company-builder is invisible to visitors.
