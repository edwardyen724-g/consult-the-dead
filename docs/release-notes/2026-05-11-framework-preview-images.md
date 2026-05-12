# Framework Detail Preview Images — Release Note (2026-05-11)

**PR (feature):** #110, #71  
**PR (regression coverage):** #176 (`wanman/framework-detail-canonical-url`)  
**Area:** `/frameworks/[slug]` — Open Graph and Twitter/X preview image routes  
**Status:** Shipped to production 2026-05-11

---

## What Shipped

Dynamic OG/Twitter preview images for every framework detail page. Sharing
`/frameworks/[slug]` now surfaces a framework-specific social card rather than
inheriting the generic site-level image.

### New Routes (per slug)

| Route pattern | File | Output |
|---|---|---|
| `/frameworks/[slug]/opengraph-image` | `website/src/app/frameworks/[slug]/opengraph-image.tsx` | Dynamic 1200×630 OG card per framework |
| `/frameworks/[slug]/twitter-image` | `website/src/app/frameworks/[slug]/twitter-image.tsx` | Re-exports the OG composition for Twitter/X parity |

Both routes run in `nodejs` runtime and revalidate hourly.

### Card Content

Each card renders framework-specific data from the framework record:

- Mind name and domain
- Perceptual-lens excerpt
- Construct count and incident count
- Consistent dark parchment visual identity

If the framework record is missing (e.g. unknown slug), the image handler
falls back to the generic Consult The Dead card rather than throwing.

### Updated Page Metadata

`website/src/app/frameworks/[slug]/page.tsx` publishes matching
`openGraph` and `twitter` metadata so the share contract is owned by the
route instead of inherited from the root layout.

---

## Route Coverage

The following slugs are pre-rendered from `ALLOWED_SLUGS` at build time
(`dynamicParams` is `false`):

- `/frameworks/isaac-newton`
- `/frameworks/marie-curie`
- `/frameworks/sun-tzu`
- `/frameworks/seneca`
- (all other entries in `ALLOWED_SLUGS`)

Each slug gets both an `opengraph-image` and a `twitter-image` route.

---

## Live Verification Path

### Option A — OpenGraph.xyz (no tooling required)

1. Open https://www.opengraph.xyz/ in a browser.
2. Paste `https://www.consultthedead.com/frameworks/isaac-newton` into the
   URL field and press Enter.
3. Expected: a custom social card showing Isaac Newton's name, domain, and a
   perceptual-lens excerpt — **not** the generic homepage image.
4. Repeat for a second slug (e.g. `marie-curie`) to confirm the card content
   varies by slug.

### Option B — curl meta-tag check

```bash
curl -s 'https://www.consultthedead.com/frameworks/isaac-newton' | grep 'og:image'
# Expect: <meta property="og:image" content="…/frameworks/isaac-newton/opengraph-image" />
```

### Option C — direct image route

```bash
curl -I 'https://www.consultthedead.com/frameworks/isaac-newton/opengraph-image'
# Expect: HTTP/2 200, Content-Type: image/png

curl -I 'https://www.consultthedead.com/frameworks/isaac-newton/twitter-image'
# Expect: HTTP/2 200, Content-Type: image/png
```

### Canonical URL alignment check (related fix)

The fix in PR #176 ensures the canonical URL is slug-scoped. Confirm it
matches the OG URL:

```bash
curl -s 'https://www.consultthedead.com/frameworks/marie-curie' \
  | grep -E 'canonical|og:url'
# Expect both to read: https://www.consultthedead.com/frameworks/marie-curie
```

---

## Regression Coverage

**PR #176** (`wanman/framework-detail-canonical-url`) adds **7 regression
tests** in `website/src/app/frameworks/[slug]/page.canonical.test.ts` that
lock the canonical URL contract so the bug (homepage URL emitted instead of
the slug-scoped URL) cannot silently return.

| Test path | What it covers |
|---|---|
| Happy path | `generateMetadata()` emits `https://www.consultthedead.com/frameworks/<slug>` |
| Fallback branch | Returns hardcoded canonical when `buildFrameworkCanonicalUrl` returns null |
| 404 path | No `alternates` emitted for unknown slugs |
| OG URL alignment | `alternates.canonical` matches `openGraph.url` |
| (3 additional variant assertions) | Slug substitution correctness across `isaac-newton`, `marie-curie`, `sun-tzu` |

To run locally:

```bash
cd website
npx vitest run page.canonical
# Expect: 7/7 passed
```

---

## Known Gaps (at time of release)

- ~~**Seneca portrait asset**~~ — **Resolved.** `/portraits/seneca-portrait.png`
  was restored (task 2d2162d0). The Seneca card now renders the portrait-led
  composition correctly. No remaining rollback triggers for this release.

---

## Relationship to Other Preview-Image Routes

| Surface | Route | Notes |
|---|---|---|
| Framework detail | `/frameworks/[slug]/opengraph-image` | This release — dynamic per slug |
| Frameworks index | `/frameworks/opengraph-image` | Static branded card (PR #146, see [`2026-05-11-frameworks-index-og-image.md`](2026-05-11-frameworks-index-og-image.md)) |
| Essay page | `/essay/opengraph-image` | Static branded card (PR #160) |
| Mind pages | `/minds/[id]/opengraph-image` | Dynamic per mind (PR #167) |
