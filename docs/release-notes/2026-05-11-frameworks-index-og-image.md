# Frameworks Index OG/Twitter Preview Image — Release Note (2026-05-11)

**PR:** #146  
**Area:** `/frameworks` — Open Graph and Twitter/X preview image routes  
**Status:** Shipped to production 2026-05-11

---

## What Shipped

### New Routes

Two new static preview-image routes for the `/frameworks` index page:

| Route | File | Output |
|-------|------|--------|
| `/frameworks/opengraph-image` | `website/src/app/frameworks/opengraph-image.tsx` | 1200×630 branded OG card |
| `/frameworks/twitter-image` | `website/src/app/frameworks/twitter-image.tsx` | Same composition re-exported for Twitter/X |

Both routes **prerender as static** (`○ Static`) at build time — no runtime cost.

### Updated Metadata

`website/src/app/frameworks/page.tsx` now explicitly wires `openGraph.images` and `twitter.images`, so the share contract is owned by the route rather than inherited from the root layout. This matches the pattern already used by `/frameworks/[slug]/page.tsx`.

---

## Card Design

The OG card uses a **dark parchment palette** consistent with the site's visual identity:

- Background: dark, textured parchment-style
- Headline tagline: **"18 minds, extracted and validated."**
- Layout and structure aligned with the per-slug preview images already in production

The same composition is reused for both OG and Twitter/X previews (`twitter-image.tsx` re-exports the OG component), keeping the two surfaces byte-for-byte aligned.

---

## Build Output

Both routes appear in the Next.js build manifest as static:

```
○ /frameworks/opengraph-image   (Static)
○ /frameworks/twitter-image     (Static)
```

All 903 existing tests passed at the time of merge. `display: "flex"` is used throughout (not `"inline-flex"`, which is not supported by the `@vercel/og` Satori renderer).

---

## Verification

### Open Graph debugger

Check the OG preview for the frameworks index page:

- **Facebook/Meta Sharing Debugger:** https://developers.facebook.com/tools/debug/?q=https%3A%2F%2Fconsultthedead.com%2Fframeworks
- **Twitter Card Validator:** https://cards-dev.twitter.com/validator (paste `https://consultthedead.com/frameworks`)
- **OpenGraph.xyz:** https://www.opengraph.xyz/url/https%3A%2F%2Fconsultthedead.com%2Fframeworks

### Direct image route

Fetch the OG image directly to confirm it returns `image/png`:

```bash
curl -I https://consultthedead.com/frameworks/opengraph-image
# Expect: Content-Type: image/png

curl -I https://consultthedead.com/frameworks/twitter-image
# Expect: Content-Type: image/png
```

### Page metadata

Confirm the frameworks index page wires the image routes in its metadata:

```bash
curl -s https://consultthedead.com/frameworks | grep -i 'og:image\|twitter:image'
# Expect: meta tags pointing to /frameworks/opengraph-image and /frameworks/twitter-image
```

---

## Relationship to Per-Slug Images

The frameworks index image (`/frameworks/opengraph-image`) is a **static branded card** — it does not vary by slug. It fills the gap where the index page previously inherited the generic site-level OG image.

Per-slug images (`/frameworks/[slug]/opengraph-image`) are dynamic cards that render framework-specific data (mind name, domain, perceptual-lens excerpt, construct/incident counts). Those shipped earlier and are documented in [`docs/release-notes/2026-05-11-framework-detail-preview-image.md`](2026-05-11-framework-detail-preview-image.md).
