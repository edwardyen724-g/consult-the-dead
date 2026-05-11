# Design Direction Research — Consult The Dead

**Created:** 2026-04-24
**Purpose:** Inform website redesign decision before cold email outreach

---

## Recommendation: Direction A "Reading Room" (with dark mode toggle)

### Research Findings

**1. Premium perception through rarity**
Most AI tools use dark + monospace (Direction B). Most SaaS is clean white + sans-serif. A warm parchment editorial aesthetic is genuinely unusual — creating immediate visual differentiation. Research shows distinctive visual identity drives 30-40% higher engagement and 25% better brand recall vs generic designs.

**2. Serif = trust for high-stakes decisions**
Serif typography signals institutional credibility and authority. Mailchimp saw 33% increase in user engagement after switching to refined contemporary serif. For a product asking founders to trust an AI council with serious decisions, this matters.

**3. Warm colors build connection**
Soft warm neutrals (parchment) with amber/rust accents create professional flow without sacrificing trust. Feels inviting vs. the clinical coldness of dark terminal UIs, but doesn't feel unprofessional.

**4. The "Reading Room" paradox works for advisory tools**
Direction A feels slow and deliberate — exactly right for a product where users expect thoughtful debate. This contrasts with ChatGPT (white+clean) and Bloomberg clones (dark+monospace).

**5. Dark mode toggle as a hybrid**
80% of users prefer having dark mode as an option, 65% actively use it. Build Direction A as default, offer a sophisticated dark mode toggle ("The Late Study" — which already exists in the current site). Best of both worlds.

### Why NOT Direction B (Observatory)
Too crowded. Every analytics tool, every AI copilot, every data platform uses dark + monospace. You'd blend in with Perplexity, Linear, and a dozen others. Direction B makes you look like "another AI tool." Direction A makes you look like "a council of advisors from history" — which is what you actually are.

### Why NOT Direction C alone
C appears to be a hybrid. The research supports going with A's warm editorial identity as the primary brand, with dark mode as an option rather than splitting the difference.

---

## Implementation Plan

1. **Direction A remains the primary visual system** — warm parchment, serif editorial, red-ink ornamental accents.
2. **Reading Room baseline is already shipped in the shell** — the token palette and typography live in `website/src/app/globals.css`, the app shell boots `defaultTheme="light"` in `website/src/app/layout.tsx`, and the theme toggle already exposes "The Reading Room" / "The Late Study" for user preference.
3. **AI-generated portraits** remain the next system-level asset for mind cards, using a consistent classical painterly style.
4. **Landing / pricing / account hero work** stays tracked as active execution, not reopened as backlog.
5. **Remaining page-level redesign order:**
   1. Agora browse and council-selection surfaces
   2. Consensus, debate, and results surfaces
   3. Library and frameworks archive surfaces
   4. Sign-in, sign-up, and account management surfaces
   5. Terms, privacy, and other low-traffic utility pages
   6. Debate/outreach pages and secondary editorial pages
6. **Tech packs** stay deferred until the page system is stable enough to support them without another structural pass.

## Execution Notes

- Treat the shell baseline as complete unless a future task explicitly changes tokens, layout chrome, or theme behavior.
- Use the prioritized page order above when converting design research into implementation capsules.
- Do not create a fresh task for landing, pricing, or account hero treatment unless a concrete implementation gap appears in those in-flight surfaces.

## Edward's Preferences
- Liked Direction A and C's color palette
- Open to going with gut vs research
- Wants redesign before cold emails (avoids breaking live site during outreach)
- Interested in AI portraits on mind cards
- Interested in tech packs (scientist, strategist, etc.) — deferred

## Sources
- Dark Mode Statistics 2025-2026 (forms.app)
- SaaS Typography Best Practices (fullstop360)
- Custom Illustration ROI for SaaS (orbix.studio)
- Warm vs Cool Color Psychology 2026 (landingpageflow.com)
- SaaS UX Design Best Practices (designmodo.com)
