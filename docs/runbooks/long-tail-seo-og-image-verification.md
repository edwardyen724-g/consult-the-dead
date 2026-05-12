# Long-Tail SEO OG Image Verification Runbook

**Purpose:** verify the `/minds/[id]` and `/listicles/[slug]` Open Graph and
Twitter image contracts after merging PRs #167 and #170.

**Canonical sources:**

- `website/src/app/minds/[id]/opengraph-image.tsx`
- `website/src/app/minds/[id]/twitter-image.tsx`
- `website/src/app/listicles/[slug]/opengraph-image.tsx`
- `website/src/app/listicles/[slug]/twitter-image.tsx`

Use this runbook when:

- validating the minds or listicles OG/Twitter rollout in staging or production
- preparing a release-state note for either surface
- confirming SSG pre-render coverage after a slug roster change

---

## Quick-reference: known slugs

**Minds (25 total, all SSG)**

Pick any of the 19 slugs with portrait PNGs for the portrait-branch path:
`ada-lovelace`, `alexander-the-great`, `archimedes`, `benjamin-franklin`,
`catherine-the-great`, `cicero`, `cleopatra-vii`, `epictetus`,
`harriet-tubman`, `isaac-newton`, `john-d-rockefeller`, `leonardo-da-vinci`,
`marcus-aurelius`, `marie-curie`, `niccolo-machiavelli`, `nikola-tesla`,
`seneca`, `sun-tzu`, `thomas-edison`

Pick any slug outside the portrait set to hit the portrait-absent branch
(e.g. `confucius`).

**Listicles (5 total, all SSG)**

`startup-pivot`, `career-change`, `leadership-crisis`, `investing-risk`,
`product-strategy`

---

## 1. Build verification — SSG marker

After `next build`, confirm the relevant routes appear as `●` (SSG) and not
`ƒ` (Dynamic):

```
Route                                            Size     Type
───────────────────────────────────────────────────────────────
/minds/[id]/opengraph-image                      ...      ●
/minds/[id]/twitter-image                        ...      ●
/listicles/[slug]/opengraph-image                ...      ●
/listicles/[slug]/twitter-image                  ...      ●
```

Each SSG route should enumerate all slugs in the static-params list (25 for
minds, 5 for listicles).

---

## 2. HTTP smoke tests

Run from a shell with `$BASE_URL` set to `https://www.consultthedead.com` or
your staging origin.

### 2a. Minds — portrait slug

```bash
BASE_URL="https://www.consultthedead.com"
SLUG="isaac-newton"

curl -sSf -D /tmp/minds-og.headers  -o /tmp/minds-og.png \
  "$BASE_URL/minds/$SLUG/opengraph-image"
curl -sSf -D /tmp/minds-twit.headers -o /tmp/minds-twit.png \
  "$BASE_URL/minds/$SLUG/twitter-image"

# Inspect content-type
grep -i "content-type" /tmp/minds-og.headers /tmp/minds-twit.headers

# Confirm dimensions are 1200×630 (macOS)
sips -g pixelWidth -g pixelHeight /tmp/minds-og.png /tmp/minds-twit.png

# Hash both — they should match (twitter-image re-exports the OG impl)
shasum -a 256 /tmp/minds-og.png /tmp/minds-twit.png
```

### 2b. Minds — portrait-absent slug

```bash
SLUG="confucius"

curl -sSf -D /tmp/minds-noportrait-og.headers -o /tmp/minds-noportrait-og.png \
  "$BASE_URL/minds/$SLUG/opengraph-image"
grep -i "content-type" /tmp/minds-noportrait-og.headers
```

Expect: HTTP 200, `content-type: image/png`, 1200×630 card rendered without
the portrait panel.

### 2c. Minds — unknown slug (fallback)

```bash
SLUG="definitely-not-a-mind"

curl -sSf -o /tmp/minds-fallback-og.png \
  "$BASE_URL/minds/$SLUG/opengraph-image"
```

Expect: HTTP 200, generic dark-parchment fallback card (not a 404 or
blank image). `dynamicParams = false` means Next.js never calls the
image handler for a truly unknown slug; the test environment should
verify the fallback branch via the unit test.

### 2d. Listicles

```bash
SLUG="startup-pivot"

curl -sSf -D /tmp/listicles-og.headers  -o /tmp/listicles-og.png \
  "$BASE_URL/listicles/$SLUG/opengraph-image"
curl -sSf -D /tmp/listicles-twit.headers -o /tmp/listicles-twit.png \
  "$BASE_URL/listicles/$SLUG/twitter-image"

grep -i "content-type" /tmp/listicles-og.headers /tmp/listicles-twit.headers
shasum -a 256 /tmp/listicles-og.png /tmp/listicles-twit.png
```

---

## 3. HTML metadata verification

Check that the page HTML declares the correct metadata for each surface.

```bash
# Minds
curl -sS "$BASE_URL/minds/isaac-newton" \
  | grep -E 'og:image|twitter:card|twitter:image'

# Listicles
curl -sS "$BASE_URL/listicles/startup-pivot" \
  | grep -E 'og:image|twitter:card|twitter:image'
```

Expected assertions:

- `og:image` contains the canonical `/minds/[id]/opengraph-image` or
  `/listicles/[slug]/opengraph-image` path
- `twitter:card` is `summary_large_image` (minds pages; verify against the
  page.tsx metadata update in PR #167)
- `twitter:image` matches the corresponding twitter-image route

---

## 4. Social debugger verification

Use at least one social scraper after DNS has propagated:

| Tool | URL |
|---|---|
| Open Graph Debugger (Meta) | https://developers.facebook.com/tools/debug/ |
| Card Validator (Twitter/X) | https://cards-dev.twitter.com/validator |
| LinkedIn Post Inspector | https://www.linkedin.com/post-inspector/ |

Test with:

- `https://www.consultthedead.com/minds/marcus-aurelius`
- `https://www.consultthedead.com/listicles/startup-pivot`

Pass criteria: both tools show the 1200×630 card (not a blank/generic
social preview), with the correct title and description from page metadata.

---

## 5. Pass criteria summary

| Check | /minds/[id] | /listicles/[slug] |
|---|---|---|
| HTTP 200 on OG route | ✓ | ✓ |
| HTTP 200 on Twitter route | ✓ | ✓ |
| `content-type: image/png` | ✓ | ✓ |
| OG hash == Twitter hash (same composition) | ✓ | ✓ |
| Dimensions 1200×630 | ✓ | ✓ |
| SSG marker (`●`) in build output | ✓ (25 slugs) | ✓ (5 slugs) |
| `twitter:card = summary_large_image` in HTML | ✓ | verify |
| Social debugger shows rich preview | ✓ | ✓ |

---

## 6. Alt text reference

| Route | `alt` export |
|---|---|
| `/minds/[id]/opengraph-image.tsx` | `A mind profile card from Consult The Dead` |
| `/listicles/[slug]/opengraph-image.tsx` | `Consult The Dead listicle share card` |

---

## 7. Rollback

If an image route returns a non-200 or the social preview regresses:

1. Identify which PR introduced the change (PR #167 for minds, PR #170 for
   listicles).
2. Revert the corresponding `opengraph-image.tsx` / `twitter-image.tsx` to
   the previous implementation.
3. If the regression is in metadata only (missing `og:image` tag), revert
   the `generateMetadata` change in `page.tsx`.
4. Re-run `next build` and repeat step 1 of this runbook to confirm the SSG
   marker is restored.
