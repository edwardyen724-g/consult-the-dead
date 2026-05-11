# Mind Pack Structure — Live Proposal

*Draft: 2026-05-10*

## Overview

Packs are the current browse and discovery layer for the live product. They are not a separate pricing tier yet. The implementation lives in `website/src/lib/packs.ts`, the live-slug filter lives in `website/src/lib/frameworks.ts`, and the rendered routes are:

- `/` homepage pack cards and featured minds
- `/frameworks` the full council index, grouped by pack
- `/agora?pack=<pack-id>` pack-seeded Agora entry
- `/frameworks/[slug]` the individual mind page, with pack chips

A mind can appear in multiple packs. The website only renders the live subset of each pack, so the catalog can safely include aspirational members without showing dead links.

## Live Pack Surface

| Pack id | Display name | Current live members | Queued members | Route hook |
|---|---|---|---|---|
| `stoic-council` | Stoic Council | Marcus Aurelius, Epictetus, Cicero | Seneca | `/`, `/frameworks`, `/agora?pack=stoic-council` |
| `inventors-workshop` | Inventors' Workshop | Thomas Edison, Archimedes, Ada Lovelace, Leonardo da Vinci, Nikola Tesla | None | `/`, `/frameworks`, `/agora?pack=inventors-workshop` |
| `war-room` | War Room | Sun Tzu, Alexander the Great, Catherine the Great, Harriet Tubman, Cleopatra VII | Julius Caesar, Napoleon Bonaparte | `/`, `/frameworks`, `/agora?pack=war-room` |
| `republic` | The Republic | Niccolò Machiavelli, Catherine the Great, Cicero, Cleopatra VII, Benjamin Franklin | Abraham Lincoln, Frederick Douglass | `/`, `/frameworks`, `/agora?pack=republic` |
| `trailblazers` | Trailblazers | Harriet Tubman, Marie Curie | Florence Nightingale, Frederick Douglass | `/`, `/frameworks`, `/agora?pack=trailblazers` |
| `moguls` | The Moguls | John D. Rockefeller, Isaac Newton | Andrew Carnegie, Julius Caesar, Napoleon Bonaparte | `/`, `/frameworks`, `/agora?pack=moguls` |

All six packs are active today because each one has at least one live member.

## What The Live UI Actually Says

- The homepage frames the product as "The Six Councils" and shows one card per active pack.
- The homepage hero currently spotlights Sun Tzu, Niccolò Machiavelli, and Marie Curie.
- Pack cards link into `/agora?pack=<id>` so the user can open a pre-seated council instead of assembling one from scratch.
- `/frameworks` is the canonical browse page for the whole roster.
- `/frameworks/[slug]` shows the pack chips for each individual mind.

## Remaining Extraction Priorities

Prioritize the remaining extractions by pack coverage, not by how famous the figure is.

| Priority | Mind | Packs strengthened | Why it belongs here |
|---|---|---|---|
| 1 | Seneca | Stoic Council | Closest thing to a missing keystone. Stoic Council is already the cleanest philosophy pack; Seneca closes the gap with the smallest lift. |
| 2 | Frederick Douglass | The Republic, Trailblazers | Strong cross-pack leverage and high user value. He deepens two visible packs at once and gives the product a sharper moral-strategic voice. |
| 3 | Florence Nightingale | Trailblazers | Turns Trailblazers from a sparse duo into a real thematic lane with a distinct systems-and-data angle. |
| 4 | Andrew Carnegie | The Moguls | Gives the business pack a true industrial anchor and makes the moguls surface feel less decorative. |
| 5 | Abraham Lincoln | The Republic | High recognition and strong source material, but Republic already has depth, so this is slightly less urgent than the thinner packs above. |
| 6 | Julius Caesar | War Room, The Moguls | Valuable, but it overlaps the existing strategy surfaces and is not the first bottleneck. |
| 7 | Napoleon Bonaparte | War Room, The Moguls | Same overlap profile as Caesar, with more source volume but less incremental pack urgency. |

## Why The Order Looks Like This

- Fill the thinnest live packs first.
- Prefer minds that strengthen more than one visible pack.
- Defer the most overlapping strategist figures until the thinner discovery surfaces stop feeling empty.
- Keep the pack catalog tied to shipped browse behavior; do not invent pack-based pricing until there is actual demand data.

## Pricing Position

Current product pricing is still tier-based:

- Free: 3 agons/day, 2–3 minds, Sonnet, device-local library
- Pro: $30/month or $300/year, 100 agons/month, up to 5 minds, Opus for consensus, persistent library, PDF export, extended research, and optional BYO Anthropic key

Pack pricing should stay deferred until the catalog is much larger and user behavior shows that packs, not councils, are the right buying unit.

## Implementation Notes

- Keep pack metadata centralized in `website/src/lib/packs.ts` until there is a real reason to move it elsewhere.
- Keep live-slug filtering in `website/src/lib/frameworks.ts`.
- If a future PR adds a new public route that changes pack browsing, update the live route map and this proposal in the same change.
- Treat pack names and pack ids as distinct: display names are user-facing, ids are the route and code contract.
