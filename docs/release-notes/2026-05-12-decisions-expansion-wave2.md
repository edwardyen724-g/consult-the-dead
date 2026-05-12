# Decisions Expansion Wave 2 — Release Note (2026-05-12)

## Summary

Twelve new decisions pages shipped across four batches (PRs #313, #320, #326, and batch 6 on
2026-05-12), bringing the live decisions library from 9 to 21 pages. Alongside the content
expansion: a sitemap update adds all decisions pages to SEO indexing, a framework validation
pipeline validates 8 new minds, and the live roster grew from 19 to 26 frameworks.

---

## What's New

### Batch 3 — PR #313 (3 pages)

| URL | Recommended Council |
|-----|---------------------|
| `/decisions/should-i-join-an-accelerator` | Machiavelli, Rockefeller, Curie |
| `/decisions/should-i-go-direct-to-consumer` | Franklin, Edison, Rockefeller |
| `/decisions/should-i-relocate-for-growth` | Aurelius, Franklin, Carnegie |

### Batch 4 — PR #320 (3 pages)

| URL | Recommended Council |
|-----|---------------------|
| `/decisions/should-i-acquire-a-company` | Machiavelli, Carnegie, Rockefeller |
| `/decisions/should-i-accept-this-speaking-engagement` | Aurelius, Franklin, Cicero |
| `/decisions/should-i-license-my-technology` | Edison, Franklin, Curie |

### Batch 5 — PR #326 (3 pages)

| URL | Recommended Council |
|-----|---------------------|
| `/decisions/should-i-build-in-public` | Aurelius, Machiavelli, Franklin |
| `/decisions/should-i-charge-from-day-one` | Curie, Rockefeller, Franklin |
| `/decisions/should-i-split-equity-50-50-with-my-cofounder` | Machiavelli, Aurelius, Cicero |

---

## Technical Improvements

### Framework Validation Pipeline — PR #322

- 8 frameworks fully validated with tier 1/2/3 results:
  `abraham-lincoln`, `andrew-carnegie`, `florence-nightingale`, `frederick-douglass`,
  `julius-caesar`, `napoleon-bonaparte`, `seneca`, `steve-jobs`
- Added `ANTHROPIC_BASE_URL` env var support to `framework_forge/llm.py` for OpenRouter proxy
  compatibility, enabling validation runs without direct Anthropic API access.

### Sitemap SEO — PR #321

- `/decisions` index page added with `priority=0.8`
- All `/decisions/[slug]` pages added with `priority=0.8`, `changeFrequency="weekly"`
- Ensures all 18 decisions pages are crawlable and eligible for indexing immediately on deploy.

### Roster Expansion (prior to wave 2)

7 new minds joined the live roster before this wave shipped:

| Handle | Mind |
|--------|------|
| `abraham-lincoln` | Abraham Lincoln |
| `andrew-carnegie` | Andrew Carnegie |
| `florence-nightingale` | Florence Nightingale |
| `frederick-douglass` | Frederick Douglass |
| `julius-caesar` | Julius Caesar |
| `napoleon-bonaparte` | Napoleon Bonaparte |
| `seneca` | Seneca |

Live roster grew from **19 → 26 frameworks**.

---

## Impact Stats (batches 1–5)

| Metric | Before wave 2 | After batches 3–5 |
|--------|--------------|-------------------|
| Decisions pages live | 9 | **18** |
| Live framework roster | 19 | **26** |
| Frameworks validated (pipeline) | 0 | **8** |
| Decisions pages in sitemap | 0 | **19** (index + 18 slugs) |

---

## Batch 6 — Shipped (2026-05-12)

Series A and late-stage founder decisions:

| URL | Recommended Council |
|-----|---------------------|
| `/decisions/should-i-raise-a-series-a` | Curie, Rockefeller, Machiavelli |
| `/decisions/should-i-sign-this-term-sheet` | Machiavelli, Cicero, Aurelius |
| `/decisions/should-i-go-remote-or-in-person` | Aurelius, Franklin, Nightingale |

---

## Impact Stats (updated — batches 1–6)

| Metric | Before batch 6 | After batch 6 |
|--------|----------------|---------------|
| Decisions pages live | 18 | **21** |

### Decisions Library — Full Inventory (21 pages)

| Batch | Slugs |
|-------|-------|
| Batch 1 (pre-292) | `raise-vc-or-bootstrap`, `quit-job-to-start-company`, `raise-a-seed-round`, `hire-first-employee`, `join-an-accelerator`, `hire-cto-or-technical-cofounder`, `launch-now-or-wait-for-perfect` |
| Batch 2 — PR #292 | `fire-my-cofounder`, `pivot-or-persist`, `take-this-job-offer`, `sell-my-startup`, `shut-down-my-startup` |
| Batch 3 — PR #313 | `should-i-join-an-accelerator`, `should-i-go-direct-to-consumer`, `should-i-relocate-for-growth` |
| Batch 4 — PR #320 | `should-i-acquire-a-company`, `should-i-accept-this-speaking-engagement`, `should-i-license-my-technology` |
| Batch 5 — PR #326 | `should-i-build-in-public`, `should-i-charge-from-day-one`, `should-i-split-equity-50-50-with-my-cofounder` |
| Batch 6 (2026-05-12) | `should-i-raise-a-series-a`, `should-i-sign-this-term-sheet`, `should-i-go-remote-or-in-person` |

---

## Status

PRs #313, #320, #321, #322, #326 merged into `master`. Batch 6 shipped 2026-05-12. Release note filed 2026-05-12. Total shipped decisions: **21**.
