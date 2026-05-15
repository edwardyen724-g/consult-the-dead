# Phase 4 Reel Gate Update

**Date:** 2026-05-15  
**Status:** Verified

## Summary

The Phase 4 reel evaluation gate is now aligned with the corrected duration formula. The reel scripts are measuring the full spoken payload, the 30-80s gate is passing, and F5-TTS synthesis is the next step.

## Verified State

- `estimatedDurationSeconds` now reflects the actual spoken segments.
- The post-fix reel evaluation passes the 30-80s duration gate.
- The next Phase 4 action is actual F5-TTS synthesis against the approved pilot set.

## Why This Matters

This closes the evaluation mismatch that made the earlier reel numbers unreliable. The phase can now move forward from dry-run validation to voice synthesis without re-litigating the duration math.

## Next Step

Run the F5-TTS synthesis pass on the approved pilot reels and carry the result into the release-state index once the synthesis check is complete.
