# Consult The Dead

> Multi-framework decision support, extracted from documented historical incidents. Not a persona. Not a clone.

This repo holds Consult The Dead: a Next.js debate app under [`/company-builder`](./company-builder) that runs your decisions through multiple historical-figure decision frameworks in parallel, and the extracted frameworks themselves under [`/frameworks`](./frameworks). Each framework is built from documented incidents using the Critical Decision Method, not scraped from speeches or letters.

The landing page lives in [`/website`](./website). The framework-extraction pipeline lives in [`/framework_forge`](./framework_forge).

## Routes

| Route | Type | Description |
|-------|------|-------------|
| `/agora` | Live product | Debate surface — pose a decision, seat 2–5 minds |
| `/frameworks/[slug]` | Public, static | Individual framework detail pages |
| `/listicles/[slug]` | Public, static-generated, SEO | 5 long-tail SEO pages (startup-pivot, career-change, leadership-crisis, investing-risk, product-strategy); each pre-fills the Agora council via UTM CTA |
| `/minds/[id]` | Public, static-generated, SEO | 27 per-mind landing pages (one per active framework); each includes how-they-argue, sample quotes, and UTM-linked /agora CTA |
| `/packs` | Public | Themed pack catalog — browse curated mind packs by domain with guided-quiz CTA |
| `/quiz` | Public | Guided quiz entry — step-by-step council selection with featured-pack shortcuts; UTM-stamped Agora entry |
| `/explore` | Public | Agon gallery — crawlable grid of public debate records |
| `/debates` | Public, static-generated | Sample debate index — browse pre-built debate records by topic; each links to a detail page at `/debates/[slug]` |
| `/insights` | Public, static-generated, SEO | Index of all insight articles (single-figure and head-to-head collision pieces) |
| `/insights/[slug]` | Public, static-generated, SEO | Individual insight article — "What Would X Say About Y" (single-figure) and "X vs Y on Z" (collision); ships with reel script and framework annotation layer |
| `/decisions` | Public, static-generated | Index of all 75 published decision pages (e.g. "Should I raise VC or bootstrap?"); each card links to its decision detail page |
| `/decisions/[slug]` | Public, static-generated | Individual decision page with debate, council recommendation, and Agora CTA |
| `/feed.xml` | Public | RSS feed for public debates and insights |
| `/pricing` | Public | Plan comparison and upgrade flow |
| `/library` | Pro, authenticated | Saved agon library |


## Framework Forge

The extraction pipeline that builds historical-figure frameworks lives in [`/framework_forge`](./framework_forge). It is a Python CLI tool that takes source material, reconstructs critical incidents using the Critical Decision Method, derives bipolar constructs and a perceptual lens, and validates the resulting framework through three automated tiers.

### CLI commands

Install the project (`pip install -e .[dev]`), add `ANTHROPIC_API_KEY` to `.env`, then use either:

```bash
framework-forge <command> ...
# or
python -m framework_forge.cli <command> ...
```

| Command | Stage | Key flags | Output |
|---------|-------|-----------|--------|
| `discover-sources` | 1 | `--person`, `--output` | `frameworks/<person>/sources/bibliography.json` |
| `fetch-sources` | 1b | `--bibliography`, `--output-dir` | `frameworks/<person>/sources/texts/*.txt` |
| `identify-incidents` | 2 | `--person`, `--source-dir`, `--output` | `frameworks/<person>/incidents/candidates.json` |
| `reconstruct` | 2b | `--person`, `--incidents-file`, `--output` | `frameworks/<person>/incidents/incidents.json` |
| `build` | 3-6 | `--person`, `--framework-dir`, `--domain` | `constructs.json`, `framework.json` |
| `validate` | 7 | `--framework`, `--person`, `--domain`, `--mode` | `validation/tier1_results.json`, `tier2_results.json`, `tier3_materials/review_packet.json` |

`--mode` for `validate` is one of `tier1`, `tier2`, `full` (runs all three tiers), or `floor-check` (historical alignment check).

### Pipeline output layout

```
frameworks/
└── <person>/
    ├── framework.json
    ├── constructs.json
    ├── incidents/
    │   ├── candidates.json
    │   └── incidents.json
    ├── sources/
    │   ├── bibliography.json
    │   └── texts/
    │       └── *.txt
    └── validation/
        ├── tier1_results.json
        ├── tier2_results.json
        ├── floor-check_results.json   (only when --mode floor-check is run)
        └── tier3_materials/
            └── review_packet.json
```

### Validation tiers

- **Floor check** (`floor-check`): Retrodicts the thinker's known historical decisions. The framework must achieve ≥ 50 % alignment to pass. Run this first to confirm the extracted framework is grounded in the source material.
- **Tier 1 — Baseline Differentiation** (`tier1`): Generates scenarios, produces framework vs. generic-expert responses, and scores divergence. Passes when ≥ 4 of 5 scenarios are meaningfully divergent.
- **Tier 2 — Internal Consistency** (`tier2`): Audits that framework responses trace back to documented constructs and that the perceptual lens is applied consistently. Passes at ≥ 80 % traceability with no contradictions.
- **Tier 3 prep** (run automatically with `full`): Generates `review_packet.json` — randomized A/B response pairs for blind human review. A human evaluator picks which response better matches how the thinker would actually reason.

See [`docs/framework-forge-quickstart.md`](./docs/framework-forge-quickstart.md) for a step-by-step example sequence.

Licensed under the MIT License. See [LICENSE](./LICENSE).
