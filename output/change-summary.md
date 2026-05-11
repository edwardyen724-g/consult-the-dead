# Change Summary

Task: `3f3423f8-ef63-43ed-8d8d-dbe0ec807271` - Lock research-route source ordering with explicit regression tests

## Changed Files

- `company-builder/src/app/api/research/route.test.ts`

## What Changed

- Added a dedicated research route regression suite that locks the streamed data-section contract.
- Covered the HN-present path to verify:
  - web results appear first,
  - Hacker News sections are emitted when HN hits exist,
  - GitHub sources are deduped across queries,
  - the streamed prompt keeps the section order web -> HN -> GitHub.
- Covered the HN-absent path to verify web-only streaming keeps the HN section out of the prompt.
- Covered the empty-source fallback path to verify the route still streams a valid briefing with `research_sources`, `research_chunk`, and `research_complete`.
- Added failure-path coverage for:
  - missing topic,
  - missing Anthropic API key,
  - keyword extraction fallback,
  - synthesis-stream failure,
  - request-body parse failure,
  - Tavily/HN/GitHub fetch fallbacks.

## Verification

- `npm run test:coverage`
  - Result: `13 tests passed`
  - `company-builder/src/app/api/research/route.ts` reached `96.29%` statement coverage and `98.63%` line coverage
  - Overall coverage: `97.01%` statements

## Notes

- No route implementation changes were required.
- An unrelated pre-existing modification remains in `website/README.md` and was left untouched.
