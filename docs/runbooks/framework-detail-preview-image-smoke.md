# Framework Detail Preview-Image Smoke Runbook

**Purpose:** verify the `/frameworks/[slug]` OG/Twitter preview-image contract
before promoting the release-state note.

**Canonical source of truth:**

- `website/src/app/frameworks/[slug]/opengraph-image.tsx`
- `website/src/app/frameworks/[slug]/twitter-image.tsx`
- `website/src/app/frameworks/[slug]/page.tsx`

Use this runbook when:

- validating a framework detail preview-image rollout
- checking that Twitter/X reuses the Open Graph composition
- preparing the dated release note for promotion

## Smoke Path

Pick a known allowed slug such as `isaac-newton`.

```bash
BASE_URL="https://www.consultthedead.com"
SLUG="isaac-newton"

curl -sS -D /tmp/framework-og.headers -o /tmp/framework-og.png \
  "$BASE_URL/frameworks/$SLUG/opengraph-image"
curl -sS -D /tmp/framework-twitter.headers -o /tmp/framework-twitter.png \
  "$BASE_URL/frameworks/$SLUG/twitter-image"
curl -sS "$BASE_URL/frameworks/$SLUG" | grep -E 'og:title|og:description|twitter:card|twitter:title|twitter:description'

shasum -a 256 /tmp/framework-og.png /tmp/framework-twitter.png
```

## Pass Criteria

- both image routes return HTTP 200
- both responses declare `content-type: image/png`
- the Open Graph and Twitter/X payload hashes match for the same slug
- the framework detail page HTML includes the route-specific social metadata
- the image alt text stays `A framework detail card from Consult The Dead`

## Rollback

If the image contract drifts, back out the route-specific metadata change and
restore the shared preview-image implementation before promoting the note.

