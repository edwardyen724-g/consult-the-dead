# Phase 3 Reel Automation Handoff

**Title:** Verdict Reels automation handoff
**Status:** standalone Phase 3 handoff
**Owner:** Edward
**Last updated:** 2026-05-12

This document is the operating handoff for automating the reel format that won in Phase 2. It translates the validated pilot into a minimum contract for script generation, review, and eventual posting automation.

## 1. What Phase 3 owns

Phase 3 automates the part that already proved valuable:

- The winning reel format stays the same: a 25-40 second Verdict Reel with a hook, three council beats, a consensus line, and a clear CTA.
- The reel script generator becomes the source of truth for the output shape.
- Edward keeps creative approval until the automation chain is reliable enough to reduce him to one-tap review.
- The automation must keep the same product voice: product-as-hero, not generic social content.

Phase 3 does **not** redefine the format. It packages the format that already worked into a repeatable contract.

## 2. Template rules

Every generated reel must follow the same skeleton:

1. Hook in the first 0-3 seconds.
2. One sentence setup of the dilemma.
3. Three council passes, one beat per mind.
4. One consensus line that resolves the tension.
5. Final CTA that sends viewers back to the product or article.

Hard rules:

- Length target: 25-40 seconds.
- Captions are mandatory.
- Voiceover is mandatory.
- The reel must use the shipped article or decision page as its source, not ad hoc marketing copy.
- The visual language stays anchored to the product: Agora UI, figure cards, and on-brand kinetic text.
- No AI-avatar talking heads, no stock-footage filler, and no generic motivational framing.

Voice rules:

- The voice path stays provisional until the pilot clears the quality bar.
- Keep the reference voice chain stable across the pilot batch.
- If the voice introduces rework, fall back to the human-approved path before automating further.

## 3. Handoff criteria

Do not move from pilot into automation until all of the following are true:

- The first 5 pilot reels have shipped in the same template.
- The same voice chain was used for all 5 reels.
- No reel required voice-specific rescue edits after export.
- The CTA, captions, and council order stayed consistent across the batch.
- Edward can review a generated script in one pass without re-authoring the format.

If any of those conditions fail, the right move is to fix the pilot chain, not to broaden automation scope.

## 4. Minimum automation contract

The reel generator only needs to guarantee a small, stable contract.

### 4.1 Required inputs

- A shipped insight or decision slug.
- A validated article title and framework slug.
- A known decision type.

### 4.2 Required outputs

The script artifact must include:

- `slug`
- `articleTitle`
- `frameworkSlug`
- `decisionType`
- `estimatedDurationSeconds`
- `hook.voiceover`
- `hook.caption`
- `councilPass[]`
- `consensus`
- `cta`
- `captions[]`

### 4.3 Required behavior

- The generator must emit deterministic output for a given slug.
- The dry-run path must produce a JSON artifact to stdout.
- The command must fail fast on unknown slugs.
- The contract must keep the reel inside the 25-40 second range.
- The generated CTA must point back to the live product or article path, not a future placeholder.

### 4.4 Non-goals for the first automation pass

- No direct Instagram posting yet unless the posting API is already wired and reviewed.
- No format branching by audience segment.
- No template explosion for hooks or council layouts.
- No autonomous creative rewrite of the article source.

## 5. Review workflow

The automation loop should remain human-reviewed until the contract is stable.

1. Generate the script from a shipped slug.
2. Review the hook, council beats, consensus, and CTA.
3. Export the reel with the approved voice chain.
4. Log whether any change was needed to make the script publishable.
5. Only then consider reducing Edward to one-tap approval.

## 6. Exit criteria for Phase 3

Phase 3 is complete when:

- The reel template is locked.
- The generator contract stays stable across shipped slugs.
- The first automation pass can produce publishable scripts without manual rewriting.
- The posting path is either wired or explicitly deferred with a follow-up task.

**Status as of 2026-05-13:** All generator contract criteria are met. The posting path is explicitly deferred to Phase 4 per §6.1 below. Phase 3 is **complete**.

### 6.1 Instagram posting deferral (Phase 4)

The direct Instagram Graph API posting path is deferred. Deferral rationale:

- Meta Business account credentials, FB Page setup, and Dev App OAuth are external prerequisites that require Edward to act outside the codebase.
- The generator produces fully reviewable JSON artifacts (`--dry-run`) and the human review loop is well-defined in §5.
- Posting automation without an explicit quality bar on the first 5 pilot reels risks producing unreviewed content at scale.

**Phase 4 ticket:** Wire Instagram Graph API when the first 5 pilot reels have been exported, reviewed, and confirmed publishable in the same template. See [`MARKETING_STRATEGY.md §Phase 3`](../../MARKETING_STRATEGY.md) and the Phase 4 handoff criteria in that document.

**What Edward needs to do to unblock this:**
1. Create a Meta Business Suite account and attach an Instagram Professional account.
2. Set up a Facebook Developer App with `instagram_content_publish` and `pages_read_engagement` permissions.
3. Complete the OAuth flow and provide the long-lived access token as an environment variable (`META_LONG_LIVED_TOKEN`).
4. Confirm the first 5 reels passed the pilot quality bar (same template, same voice chain, no rescue edits).

## 7. Canonical references

- [`MARKETING_STRATEGY.md`](../../MARKETING_STRATEGY.md)
- [`CONTENT_PIPELINE.md`](../../CONTENT_PIPELINE.md)
- [`scripts/reel-scripts/generate-reel-scripts.ts`](../../scripts/reel-scripts/generate-reel-scripts.ts)
- [`scripts/reel-scripts/reel-scripts.test.ts`](../../scripts/reel-scripts/reel-scripts.test.ts)
