# Steve Jobs — Stage 1 Incident Review Notes

**Date:** 2026-05-11  
**Reviewer:** Feedback Agent (task 27062c01)  
**Status:** ✅ Frozen — Stage 1 complete  
**Corpus:** 30 incidents curated; 29 frozen after review (incident-005 pruned — see §Pruned)

---

## Stage 1 Validation Summary

| Gate | Result | Score | Status |
|------|--------|-------|--------|
| Tier 1 — Behavioral divergence | 4/5 scenarios diverged from generic responses | 80% | ✅ PASS |
| Tier 2 — Construct traceability | 40/45 reasoning steps traced to constructs; no contradictions | 89% | ✅ PASS |
| Tier 3 — Human-review packet | 5 A/B scenario pairs prepared for blind evaluation | — | ✅ Ready |

Threshold: Tier 1 ≥ 3/5 divergent; Tier 2 ≥ 85% traceability; Tier 3 packet issued before advancing to Stage 2.

---

## Frozen Incident Set (29 incidents)

After review, incident-005 (Microsoft advertising restraint) was pruned: the source evidence was a 10-word aside with no visible reasoning — all CDM probes were fully inferential. The same cognitive pattern (partnership restraint) is captured more richly in incident-001 (Gates call). Renumbering: incident-006..030 → incident-005..029.

The remaining 29 incidents form the frozen Stage 1 set. **Top 10 highest-signal incidents** (recommended primary CDM probe reconstruction targets):

| Rank | ID (post-freeze) | Title | Signal | Core Principle |
|------|-----------------|-------|--------|---------------|
| 1 | incident-001 | Gates call — repair Apple-Microsoft relationship | HIGH | Reframe zero-sum competition; cooperate from a position of clarity |
| 2 | incident-006¹ | Refuse to show AT&T iPhone before signing | HIGH | Withhold the product to invert negotiating power |
| 3 | incident-007¹ | No physical keyboard — no internal debate | HIGH | Kill internal debate to force paradigm commitment |
| 4 | incident-013¹ | Pivot from tablet-first to iPhone-first | HIGH | Sequence innovations strategically — delay a ready product for higher leverage |
| 5 | incident-026¹ | Reject market research for discontinuous innovation | HIGH | Customers cannot envision the unbuilt — vision precedes validation |
| 6 | incident-008¹ | Reframe Apple TV as DVD player for internet | HIGH | Borrow simpler mental models from adjacent product categories to unlock adoption |
| 7 | incident-010¹ | Restrict third-party iPhone apps for security | HIGH | Reputation for reliability outweighs short-term ecosystem growth |
| 8 | incident-028¹ | Mac team signs inside of cases | HIGH | Computing as artistic medium — identity shapes product integrity |
| 9 | incident-015¹ | Position Apple's privacy stance as industry differentiator | HIGH | Own a values dimension competitors will not; make ethics structural |
| 10 | incident-029¹ | Target software hobbyists (1000× larger market) | HIGH | Precise segmentation via numeric mental model; first-mover market definition |

¹ ID is post-pruning number (original IDs were one higher for incident-006 through incident-029).

---

## Signal Assessment — All 29 Incidents

| ID (post-freeze) | Original ID | Signal | Notes |
|-----------------|-------------|--------|-------|
| incident-001 | incident-001 | HIGH | Direct quote, explicit reasoning. Canonical Jobs-at-his-most-strategic. |
| incident-002 | incident-002 | MED | Good conductor-model principle; reasoning somewhat abstracted from source. |
| incident-003 | incident-003 | HIGH | Non-obvious decision: deliberately erase heritage to force forward orientation. |
| incident-004 | incident-004 | MED | Useful epistemic principle; decision is a rhetorical stance, not a resource-allocation moment. |
| incident-005 | incident-006 | HIGH | Strategic expectation management with explicit iPod trajectory mental model. |
| incident-006 | incident-007 | HIGH | Power-inversion principle with clear mechanism and outcome. |
| incident-007 | incident-008 | HIGH | Absolute conviction as decision style; rare inside view of how Jobs killed internal debate. |
| incident-008 | incident-009 | HIGH | Non-obvious reframe: adopting simpler mental model from a lower-status product category. |
| incident-009 | incident-010 | MED | Memorable brand-positioning principle; underlying logic is real but reconstructed. |
| incident-010 | incident-011 | HIGH | Reputation for reliability > short-term ecosystem growth. |
| incident-011 | incident-012 | HIGH | Treats technical decisions as personal reputation battles. Landmark outcome documented. |
| incident-012 | incident-013 | MED | Interesting admission ("maybe that's why we lost") but principle is somewhat generic. |
| incident-013 | incident-014 | HIGH | Rare admission of strategic sequencing logic — deliberate delay for a higher-leverage entry. |
| incident-014 | incident-015 | MED | Source is fragmented; the incident lacks a single decisive moment. |
| incident-015 | incident-016 | HIGH | Unique Jobs definition of privacy that differs from the industry norm. |
| incident-016 | incident-017 | MED | Foundational role specialization; not directly primary-source attributed. |
| incident-017 | incident-018 | HIGH | Treating a hobbyist showcase as a commercial product. Clear counterfactual. |
| incident-018 | incident-019 | MED | Financial improvisation — clever, but narrow as a distinctive Jobs cognitive pattern. ⚑ Stage 2 candidate |
| incident-019 | incident-020 | HIGH | Fundamental market-definition decision with clear counterfactual. |
| incident-020 | incident-021 | MED | Possible source mismatch tag. Principle (bet on tech superiority) is somewhat generic. ⚑ Stage 2 candidate |
| incident-021 | incident-022 | HIGH | Contrarian retail decision with specific organizing principle (by user intent, not product category). |
| incident-022 | incident-023 | HIGH | Platform adoption > margin optimization is specific and non-generic. |
| incident-023 | incident-024 | MED | CDM reconstruction is mostly speculative; internal reasoning not primary-source documented. ⚑ Stage 2 candidate |
| incident-024 | incident-025 | HIGH | "We were the first company in the world to do that." Clear primary source. |
| incident-025 | incident-026 | HIGH | Entrepreneurship as institutional failure correction, not opportunity seeking. |
| incident-026 | incident-027 | HIGH | Explicit epistemological principle with specific examples. One of Jobs's most documented beliefs. |
| incident-027 | incident-028 | MED | Manufacturing management decision — narrow scope; not a broad decision principle. ⚑ Stage 2 candidate |
| incident-028 | incident-029 | HIGH | Computing as artistic medium. Clear organizational identity principle. |
| incident-029 | incident-030 | HIGH | Precise market segmentation with numeric mental model. |

**Flagged for Stage 2 replacement (4 incidents):** incident-018, incident-020, incident-023, incident-027  
Reason: Weak primary-source attribution or overly narrow / generic principle. Replacing these with Mac-era or 1985 board confrontation incidents would improve source diversity.

---

## Source Coverage Notes

Current sources represented in the frozen set:
- `allthingsd_d5_gates_jobs_official_transcript` — incidents 001–004, 006¹ (pre-freeze 005)
- `allthingsd_d5_solo_2007` — incidents 005–010 (post-freeze 004–009)
- `allthingsd_d8_liveblog` — incidents 011–015 (post-freeze 010–014)
- `computer_history_museum` — incidents 017–024 (post-freeze 016–023)
- `future_of_pc_1990` — incidents 025–030 (post-freeze 024–029)

**Coverage gaps to address in Stage 2:**
1. Mac era (1984–1985): no incidents from the original Mac launch
2. 1985 board confrontation and ouster: a defining moment with no CDM representation
3. Pixar period (1986–1996): organizational leadership under resource constraints absent
4. NeXT recovery and Apple re-acquisition (1997): pivot strategy entirely absent

---

## Construct → Incident Traceability

The 10 constructs in `constructs.json` were derived from the following incident clusters (using original pre-freeze IDs):

| Construct | Source Incidents (pre-freeze ID) |
|-----------|----------------------------------|
| Creating new paradigms vs. Optimizing within existing frameworks | 008, 020, 025, 027 |
| Strategic ecosystem orchestration vs. Tactical competitive positioning | 001, 002, 005, 014 |
| Controlled experience curation vs. Open platform dynamics | 004, 007, 011, 015 |
| Future-focused identity vs. Heritage-preservation mindset | 003, 024, 030 |
| Brand authenticity through directness vs. Diplomatic relationship management | 010, 012, 016 |
| Market creation through vision vs. Market validation through research | 021, 022, 027, 029 |
| Strategic expectation management vs. Transparent progress communication | 006, 009, 023 |
| Experience simplification vs. Feature comprehensiveness | 008, 009, 025, 023 |
| Commercial opportunity recognition vs. Technical achievement focus | 017, 018, 019, 026 |
| Revolutionary capability building vs. Incremental resource optimization | 021, 022, 028 |

---

## Next Steps

- [ ] Merge PR #175 (`wanman/freeze-steve-jobs-incidents`) to apply incident-005 pruning and renumbering
- [ ] Issue Tier 3 review packet to at least 3 human evaluators
- [ ] Use results to advance to Stage 2: CDM probe reconstruction on top-10 incidents
- [ ] Replace 4 flagged Stage 2 candidates with Mac-era / board-confrontation / Pixar incidents
- [ ] Update `constructs.json` source IDs after Stage 2 incidents are added
