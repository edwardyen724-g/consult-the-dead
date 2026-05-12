---
name: capsule-cross-reference-hygiene
description: When one capsule's scope intentionally carves out work owned by another capsule, write the cross-reference so it can't silently rot.
created_by: ar
created_at: 2026-05-08T09:00:00Z
source_retro: company-data/retros/2026-05-08.md
---

## When

You are creating or updating a change capsule whose `allowedPaths` deliberately
excludes a file or subtree because another open capsule owns it. Typical
trigger phrases in the goal text:

- "...handled inside capsule X by agent Y"
- "...the remaining N errors are owned by capsule X"
- "...this capsule depends on X being merged first"

If you find yourself typing any of those, this skill applies.

## Do

1. **Anchor the reference on the capsule id only.** Write
   `"the remaining errors are owned by capsule:<id>"`. Do NOT name the
   ownerAgent in goal text or other prose — capsule ownership can be
   reassigned and the description will silently rot.

2. **Use `blockedBy` to express ordering.** If your capsule's acceptance
   cannot be fully met until the peer capsule merges, set
   `blockedBy: ["<peer-capsule-id>"]` on capsule create/update. Don't rely on
   prose to communicate the dependency; reviewers and the supervisor will
   look at the field, not the goal text.

3. **Rewrite acceptance so it is verifiable on this capsule alone.** If the
   parent task's acceptance ("lint errors drop from 7 to 0") cannot be met
   from this capsule's allowedPaths, restate this capsule's acceptance in
   self-contained terms ("at most 2 src lint errors remain; the remaining 2
   are in pricing/page.tsx, owned by capsule:<id>"). Otherwise CTO review will
   reject the PR for not meeting the original acceptance.

4. **Surface the residual on the parent task.** If acceptance is split across
   capsules, record it on the parent task too: set the task's `dependsOn` to
   include the peer-capsule's task id and/or add a note to the task
   description recording the split. Without this, the task can be marked
   `done` while the parent acceptance is still half-met.

## Why

We saw two failure modes in `2026-05-08`:

- `capsule:09ccc2eb` referenced "capsule 252e26f1 by dev-2" — but 252e26f1's
  ownerAgent is `dev-3`. Anyone routing follow-up questions based on the
  capsule goal text would have asked the wrong engineer.
- `task:710ec182`'s acceptance ("lint errors drop from 7 to 0") was
  effectively split across two capsules but `blockedBy` was empty on both
  sides. The task could be marked `done` after its own capsule merges with
  2 errors still uncleared.

These failures don't break a single PR; they break the closure loop across
multiple PRs. They cost more than they look like they cost.

## Edge cases

- **Peer capsule does not yet exist.** Create it first (or defer this capsule
  until it does), then wire `blockedBy`. Don't open a capsule that references
  a non-existent peer.
- **Carve-out is for a path you don't own at all.** Don't carve out — let
  the other capsule's owner create their capsule first, then narrow your
  allowedPaths around it. This avoids two capsules opening with overlapping
  expectations.
- **Reviewer is the same person for both capsules.** Still set `blockedBy`.
  The reviewer reads capsules independently and will not remember the
  cross-reference unless it is in the field.
- **Cross-reference is purely informational (no ordering dependency).** Skip
  `blockedBy`. Still anchor the reference on the capsule id, not the agent.
