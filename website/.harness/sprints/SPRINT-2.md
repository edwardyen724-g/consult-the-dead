# Sprint 2: Interactive Agora + API Layer

## Objective
Document the shipped debate flow rather than the original one-mind chat spec. The live experience is the streamed Agora, the save/share pipeline, and the API/rate-limit contract that supports it.

## Features to Implement
1. **Interactive debate surface** - The shipped `/agora` page lets users select minds, choose packs, and run a streamed decision flow.
2. **Debate API route** - `/api/agon` streams debate events, validates origin, enforces rate limits, and supports BYO Anthropic keys.
3. **Session and persistence contract** - The live save/share flow stores completed agons through `/api/library` and exposes read-only public shares at `/agora/a/[id]`.
4. **Framework system prompts** - The debate engine already loads per-framework prompts from the framework data layer.
5. **Rate limiting** - The shipped contract is free-tier daily limits plus Pro/BYO-key allowances, not the original 10-message session cap.

## Success Criteria (Evaluator will verify these)
- [x] `/agora` renders a live decision flow with framework name, lens, and mind selection state
- [x] User can start a streamed debate and receive incremental events from the API
- [x] The response reflects the selected minds' reasoning patterns rather than generic chat
- [x] Completed debates can be saved and later opened through the library/share flow
- [x] Public share pages exist for read-only debate transcripts
- [x] Rate limiting is enforced for free users and relaxed for Pro / BYO-key flows
- [x] The debate UI stays minimal enough to read as a written exchange
- [x] Mobile behavior is part of the shipped baseline
- [ ] There is still no generic `/api/chat` endpoint with `messages[]` and `sessionStorage` history
- [ ] The old `Ask The Innovator...` placeholder is obsolete because the shipped product is Agora-first

## Technical Requirements
- Next.js streaming route at `/api/agon`
- Anthropic SDK integration, origin checks, and structured event streaming
- Filesystem-backed framework prompt loading
- Save/share routes for library persistence and public transcript access
- Rate limiting is keyed to user / IP / plan, not browser session history

## Design Requirements
- Debate surfaces use the same restrained reading typography as the insight pages
- The interaction should remain transcript-first, not a chat bubble UI
- The shipped layout already favors written exchange over messaging chrome

## Out of Scope
- The bootstrap-only `/api/chat` and sessionStorage history spec
- Topic submission, transparency toggle, and annotation layers (Sprint 3)
- Collision articles (Sprint 4)
