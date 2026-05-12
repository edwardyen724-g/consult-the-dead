# Smoke Runbook: Pricing Page Copy Verification

**Feature area:** `/pricing` — tier copy, feature matrix, OG metadata, upsell surfaces  
**Canonical source of truth:** [`docs/pricing.md`](../pricing.md)  
**Pricing page source:** `website/src/app/pricing/page.tsx`  
**Date written:** 2026-05-11

---

## Overview

This runbook lets any agent or engineer verify that the live pricing page copy is accurate and consistent with the finalized pricing contract after a deploy. Run it after any deployment that touches:

- `website/src/app/pricing/`
- `website/src/components/` (upsell banners, upgrade CTAs)
- Any copy or constants referencing price, agon count, or tier names

---

## 1. What to Verify (Canonical Pricing Contract)

All values below come from [`docs/pricing.md`](../pricing.md) and are the single source of truth.

### Free Tier

| Field | Canonical Value |
|---|---|
| Consultations (agons) per day | **3 / day** (per IP) |
| Council size | 2–3 minds |
| Synthesis model | Claude Sonnet |
| Debate library | Device localStorage only (not server-persisted) |
| PDF export | Not included |
| Extended research | Not included |
| Bring your own key | Yes — unlimited agons when using own Anthropic key |
| Account requirement | Anonymous; no signup required |

### Pro Tier

| Field | Canonical Value |
|---|---|
| Monthly price | **$30/month** |
| Annual price | **$300/year** ($25/month billed annually) |
| Consultations (agons) per month | **100 / month** |
| Council size | 2–5 minds |
| Synthesis model | **Claude Opus** (consensus pass) |
| Debate library | Persistent, server-synced, searchable |
| PDF export | Included |
| Extended research | Included (Tavily-backed) |
| Bring your own key | Optional override |
| Account requirement | Private, synced via Clerk auth |
| Founder support | 48-hour email response from Edward |
| Free trial | 7-day free trial |

### Bring Your Own Key (BYO)

| Field | Canonical Value |
|---|---|
| Where it appears | `/agora` settings drawer |
| What it does | Bypasses daily agon cap; user enters their `sk-ant-…` Anthropic key |
| Key storage | Browser `localStorage` only — never written to server logs or database |
| Tier it belongs to | Available on Free tier |

### Feature Flags by Tier

| Feature | Free | BYO Key | Pro |
|---|---|---|---|
| Agons per period | 3/day | Unlimited | 100/month |
| Council size | Up to 3 minds | Up to 3 minds | Up to 5 minds |
| Synthesis model | Sonnet | Sonnet | Opus |
| Debate library persistence | localStorage only | localStorage only | Server-synced |
| PDF export | — | — | ✓ |
| Extended Tavily research | — | — | ✓ |
| Founder support (48h) | — | — | ✓ |
| Shareable agon URLs | — | — | ✓ (backend shipped) |

### Founding-Member Note

Annual Pro subscribers who sign up **before Q3 2026** lock in $300/yr for life. After Q3 2026 the annual rate rises to $360/yr. Monthly ($30/mo) is unaffected.

---

## 2. Live Site Checks

Set the base URL once, then run each check:

```bash
BASE_URL="https://www.consultthedead.com"
```

### 2.1 Pricing heading and price mentions

```bash
# Check that price strings are present on the pricing page
curl -s "${BASE_URL}/pricing" | grep -i "per month\|per year\|free\|30\|300\|25"
```

Expected: Output should contain `$30`, `$300`, `$25`, and at least one mention of `free`.

### 2.2 Agon / consultation counts

```bash
# Verify free-tier daily cap and Pro monthly cap are both stated
curl -s "${BASE_URL}/pricing" | grep -i "3 / day\|3/day\|three.*day\|100.*month\|100 / month"
```

Expected: At least one match for the 3/day free limit and one for the 100/month Pro limit.

### 2.3 Tier names

```bash
# Verify tier names appear on the page
curl -s "${BASE_URL}/pricing" | grep -i "Pro\|Free\|Bring Your Own Key\|BYO"
```

Expected: All three tier identifiers present.

### 2.4 Founding-member / annual pricing note

```bash
# Verify founding-member lock-in copy is present
curl -s "${BASE_URL}/pricing" | grep -i "founding\|300.*year\|Q3 2026\|lock"
```

Expected: At least one match referencing the founding-member or $300/year rate.

### 2.5 OG metadata (social sharing)

```bash
# Check og:title and og:description
curl -s "${BASE_URL}/pricing" | grep -i 'og:title\|og:description'
```

Expected: Both tags present. `og:description` content should mention pricing or the product — not be empty or a generic fallback.

### 2.6 Twitter card metadata

```bash
# Check Twitter card tags
curl -s "${BASE_URL}/pricing" | grep -i 'twitter:title\|twitter:description\|twitter:card'
```

Expected: `twitter:card`, `twitter:title`, and `twitter:description` all present.

### 2.7 Canonical URL

```bash
# Verify canonical link tag points to the pricing page
curl -s "${BASE_URL}/pricing" | grep -i 'canonical'
```

Expected: A `<link rel="canonical">` tag present, href pointing to `https://www.consultthedead.com/pricing` (not a relative path or wrong domain).

### 2.8 Upsell surface on /agora (cap hit copy)

```bash
# Verify the upsell banner copy on the agora page references correct Pro details
curl -s "${BASE_URL}/agora" | grep -i "100.*month\|5 minds\|Opus\|upgrade"
```

Expected: The upsell surface references 100 agons/month, 5 minds, and/or Opus — consistent with the Pro tier contract.

---

## 3. Acceptance Criteria Table

Each row maps a pricing claim to the pattern that proves it is live. All checks target `https://www.consultthedead.com/pricing` unless noted.

| Claim | grep / CSS pattern | Required |
|---|---|---|
| Free tier exists | `free` (case-insensitive) | Yes |
| Free daily cap: 3/day | `3 / day` or `3/day` or `three per day` | Yes |
| Pro monthly price: $30/mo | `\$30` or `30/month` or `30 per month` | Yes |
| Pro annual price: $300/yr | `\$300` or `300/year` or `300 per year` | Yes |
| Pro annual per-month rate: $25/mo | `\$25` or `25/month` | Yes |
| Pro agon count: 100/month | `100` adjacent to `month` | Yes |
| Pro synthesis model: Opus | `Opus` | Yes |
| BYO key option | `bring your own key` or `BYO` (case-insensitive) | Yes |
| 7-day free trial | `7-day` or `7 day` or `seven.day` | Yes |
| Founding-member note | `founding` or `Q3 2026` or `lock in` | Yes |
| og:title present | `<meta property="og:title"` | Yes |
| og:description present | `<meta property="og:description"` | Yes |
| twitter:card present | `<meta name="twitter:card"` | Yes |
| canonical URL present | `<link rel="canonical"` | Yes |
| Upsell: 5 minds | `5 minds` on `/agora` | Yes |
| Upsell: 100 agons/month | `100` adjacent to `month` on `/agora` | Yes |

---

## 4. Common Drift Patterns

These are the failure modes seen most often during refactors:

### 4.1 Hardcoded price strings that miss a price update

If Pro pricing ever changes, these locations must all be updated together:

- `website/src/app/pricing/page.tsx` — displayed prices
- `website/src/components/` — any upsell banners or modal copy
- `docs/pricing.md` — canonical reference (update first, then propagate)
- OG/Twitter metadata in the pricing page `<head>` (often forgotten)

**Drift indicator:** `grep -r "\$30\|\$300\|\$25" website/src/` returns results but they disagree on values.

### 4.2 Free limit stated inconsistently across surfaces

The free daily cap (3/day) appears in multiple places:

- The pricing page (`/pricing`)
- The agora cap-hit upsell banner
- Rate limiter constants in `website/src/lib/agon/rateLimit.ts`

If a code refactor changes the constant without updating copy (or vice versa), the user sees one number in the UI and a different behavior at the API.

**Drift indicator:** Run `grep -r "3.*day\|3 per day\|daily.*cap\|MAX_FREE" website/src/` and compare every match.

### 4.3 OG description doesn't match `<h1>` copy

The `<h1>` on the pricing page and the `og:description` meta tag can diverge when copy is updated in the component but the metadata string (often in the same file but inside `<head>`) is not touched.

**Drift indicator:** The `og:description` mentions a price or tier name that no longer appears in the visible page body.

### 4.4 Annual price math inconsistency

The pricing page must be internally consistent: $25/month × 12 = $300/year. If a copy edit changes one and not the other, users see contradictory numbers.

**Drift indicator:** Page contains `$25/month` billed annually and `$360/year` simultaneously (or any pair that doesn't multiply correctly).

### 4.5 Upsell surface references stale copy

The `/agora` cap-hit upsell banner has its own copy referencing Pro tier details. If the banner copy is not updated when the pricing contract changes, free users see an offer that doesn't match the checkout flow.

**Drift indicator:** `/agora` upsell banner copy checked against `docs/pricing.md` — any field mismatch.

---

## 5. Runbook Execution

### Manual equivalent (this runbook)

Run the shell commands in Section 2 sequentially. The full suite takes under two minutes:

```bash
BASE_URL="https://www.consultthedead.com"

echo "=== 2.1 Price mentions ==="
curl -s "${BASE_URL}/pricing" | grep -i "per month\|per year\|free\|30\|300\|25"

echo "=== 2.2 Agon counts ==="
curl -s "${BASE_URL}/pricing" | grep -i "3 / day\|3/day\|three.*day\|100.*month\|100 / month"

echo "=== 2.3 Tier names ==="
curl -s "${BASE_URL}/pricing" | grep -i "Pro\|Free\|Bring Your Own Key\|BYO"

echo "=== 2.4 Founding-member copy ==="
curl -s "${BASE_URL}/pricing" | grep -i "founding\|300.*year\|Q3 2026\|lock"

echo "=== 2.5 OG metadata ==="
curl -s "${BASE_URL}/pricing" | grep -i 'og:title\|og:description'

echo "=== 2.6 Twitter metadata ==="
curl -s "${BASE_URL}/pricing" | grep -i 'twitter:title\|twitter:description\|twitter:card'

echo "=== 2.7 Canonical URL ==="
curl -s "${BASE_URL}/pricing" | grep -i 'canonical'

echo "=== 2.8 Agora upsell copy ==="
curl -s "${BASE_URL}/agora" | grep -i "100.*month\|5 minds\|Opus\|upgrade"
```

Any section that returns no output is a failure — cross-reference Section 3 for the specific claim and Section 4 for the likely drift pattern.

### Automated check (shipped)

`scripts/pricing-contract-verifier.ts` exists and is the preferred verification method. Run it from the repo root:

```bash
# Against production (default):
BASE_URL=https://www.consultthedead.com \
npx tsx scripts/pricing-contract-verifier.ts
```

The script:
1. Fetches `/pricing` and `/agora` HTML from `BASE_URL`.
2. Asserts each row in the Section 3 acceptance criteria table.
3. Exits non-zero on any missing match, printing the specific failing check.
4. Imports canonical copy fragments from `website/src/lib/pricing-copy.ts` to verify metadata strings stay in sync with the source of truth.

Run the automated check first after any deploy that touches pricing surfaces. Fall back to the Section 2 manual steps only if the script itself is unavailable (e.g., broken `tsx` environment).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Price grep returns no output | Price not rendered in server-side HTML (client-only render) | Check `pricing/page.tsx` — prices must be in SSR output, not client-only state |
| OG tags missing | `<head>` metadata removed or moved | Check `website/src/app/pricing/page.tsx` `<head>` / Next.js `generateMetadata` export |
| Canonical tag wrong URL | `metadata.alternates.canonical` set to relative path | Set to full absolute URL `https://www.consultthedead.com/pricing` |
| Upsell copy references wrong tier | Banner component not updated with pricing contract | Update `website/src/components/` upsell banner copy and re-deploy |
| Annual price math wrong | Copy edit changed one value but not both | Update both `$25/mo` and `$300/yr` together in `pricing/page.tsx` |
| Founding-member note absent | Section removed during copy refresh | Restore from `docs/pricing.md` § "Founding-Member Pricing" |
