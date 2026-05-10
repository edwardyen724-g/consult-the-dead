# Consult The Dead

> Multi-framework decision support, extracted from documented historical incidents. Not a persona. Not a clone.

This repo holds Consult The Dead: a Next.js debate app under [`/company-builder`](./company-builder) that runs your decisions through multiple historical-figure decision frameworks in parallel, and the extracted frameworks themselves under [`/frameworks`](./frameworks). Each framework is built from documented incidents using the Critical Decision Method, not scraped from speeches or letters.

The landing page lives in [`/website`](./website). The framework-extraction pipeline lives in [`/framework_forge`](./framework_forge).

The public website now exposes the framework detail preview contract through slug-scoped route files:

- `/frameworks/[slug]`
- `/frameworks/[slug]/opengraph-image`
- `/frameworks/[slug]/twitter-image`

Those preview-image routes are generated from the same framework record as the detail page and should stay aligned with `website/src/lib/frameworks.ts` (`ALLOWED_SLUGS`, metadata counts, and the live roster).

## Pricing

| Tier | Cost | Agons | Council | Model |
|------|------|-------|---------|-------|
| **Free** | $0 | 3 / day | 2–3 minds | Sonnet |
| **BYO key** | $0 (your Anthropic key) | Unlimited | 2–3 minds | Sonnet |
| **Pro** | $30 / mo · $25 / mo annual | 100 / month | Up to 5 minds | Opus consensus |

Pro also includes persistent library, PDF export, extended research, and 48h founder support. See [/pricing](/pricing) for full feature comparison and to upgrade.

---

Licensed under the MIT License. See [LICENSE](./LICENSE).
