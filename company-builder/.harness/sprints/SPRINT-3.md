# Sprint 3: Simulation Engine + Chemistry + Ambience

## Objective
Bring the company to life. Add the debate engine where minds argue using their framework system prompts, the chemistry engine showing compatibility on connections, the canvas ambience layer, and debate history. After this sprint, the tool goes from "org chart" to "living simulation."

## Features to Implement
1. **F07: Run Debate** — Select 2-3 connected minds + enter topic. API route calls Claude with each mind's system prompt. Streamed responses rendered as threaded conversation. Each message color-coded to its mind. Debate panel slides in from bottom or right.
2. **F09: Chemistry Engine** — Predefined pairwise chemistry matrix. On connection creation, compute and display: compatibility score, warmth indicator (tension/neutral/synergy), summary text. Visual: connection line color warmth shifts (cool blue for tension, warm amber for synergy).
3. **F11: Canvas Ambience Layer** — Faint particle drift, colored light pools around each mind that blend where nodes cluster, noise texture overlay, connection lines casting soft reflected glow. Responds to state: idle = calm, debate running = energized.
4. **F12: Debate History Archive** — Collapsible panel listing all past debates. Each entry: timestamp, participants, topic, preview. Click to expand full thread.
5. **Debate API Route** — POST `/api/debate` accepting topic + mind slugs. Loads each mind's framework system prompt. Generates multi-round debate (3-4 rounds). Streams responses.

## Success Criteria
- [ ] "Run Debate" button/action available when 2+ connected minds are selected
- [ ] Debate generates responses from each selected mind with distinct voice/reasoning
- [ ] Debate messages stream in real-time (not all at once)
- [ ] Each message visually attributed to its mind (color, name label)
- [ ] Chemistry summary text appears on connection lines or on hover
- [ ] Connection line visual changes based on chemistry warmth (color temperature)
- [ ] Canvas has visible ambient particles or light effects
- [ ] Ambience responds to simulation state (calmer when idle, energized during debate)
- [ ] Past debates accessible from history panel
- [ ] Debate history persists with save/load
- [ ] Zero console errors

## Technical Requirements
- API route at /api/debate using Anthropic SDK with streaming
- Framework system prompts loaded from /frameworks/{slug}/framework.json
- Chemistry matrix as static data in /data/chemistry.ts
- Canvas ambience via HTML Canvas overlay or CSS animations
- Debate state managed in Zustand store

## Out of Scope
- Mind placement ceremony animation (Sprint 4)
- Connection spark animation (Sprint 4)
- Command palette (Sprint 4)
- Sound design hooks (Sprint 4)
