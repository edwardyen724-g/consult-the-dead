# Funnel Surface Rollout Runbook — Quiz CTA and Footer CTAs

**Shipped**: 2026-05-11
**PRs**: [#121 (header quiz CTA)](https://github.com/edwardyen724-g/consult-the-dead/pull/121), [#125 (footer CTAs)](https://github.com/edwardyen724-g/consult-the-dead/pull/125)

Use this runbook when:

- verifying that the funnel CTAs are live after deployment
- smoke-testing the quiz entry and footer conversion surfaces
- rolling back if either surface causes regressions

---

## Objective

Two funnel surfaces were added or promoted to convert anonymous visitors into free-tier signups and free-tier users into paid Pro subscribers:

1. **Quiz CTA in the global header** — the "Find Your Mind" nav link now routes to `/quiz?entry=guided` (the full guided quiz funnel) instead of bare `/quiz`, and is styled in amber to stand out from the dim plain-text nav links. A second amber pill button "Take the Quiz →" was also added to the right-hand nav cluster with UTM tracking.

2. **Footer quiz and pricing CTAs** — the shared footer gained a ProofStrip for social proof and two new CTAs: "Take the Guided Quiz →" (routes to `/quiz` with footer UTM params) and "View Pricing" (routes to `/pricing` with footer UTM params). Together they give visitors a second chance to enter the funnel or evaluate Pro on every page that uses the shared footer.

---

## Quiz CTA Header

**Component file**: `website/src/components/Header.tsx`

**Exported constants**:

| Constant | Value | Purpose |
|---|---|---|
| `HEADER_QUIZ_ENTRY_HREF` | `/quiz?entry=guided` | "Find Your Mind" nav link — guided funnel entry |
| `HEADER_QUIZ_CTA_HREF` | `/quiz?utm_source=header&utm_medium=nav&utm_campaign=guided_entry` | "Take the Quiz →" pill button in the right-hand cluster |

**What changed in PR #121**:

- `HEADER_QUIZ_ENTRY_HREF` switched from `buildQuizEntryHref("direct")` → `buildQuizEntryHref("guided")`, making the value `/quiz?entry=guided` instead of `/quiz`.
- `QUIZ_CTA_NAV_STYLE` added: amber color (`var(--amber)`) + medium font weight applied to the "Find Your Mind" link, differentiating it from the dim-text nav links.
- A separate "Take the Quiz →" pill button (`HEADER_QUIZ_CTA_HREF`) with an amber border style remains in the right-hand cluster, unchanged from PR #118.

**How to verify it is live**:

```bash
BASE_URL="https://www.consultthedead.com"

# Fetch the homepage HTML and confirm the guided-entry href is present
curl -sS "$BASE_URL" | grep -o 'entry=guided' | head -3

# Confirm the UTM-tagged pill button href is present
curl -sS "$BASE_URL" | grep -o 'utm_source=header.*utm_campaign=guided_entry' | head -3
```

**Expected visual behavior**:

- Desktop: the center nav row shows "Find Your Mind" in amber (distinct from the other dim-text links). A second "Take the Quiz →" amber pill appears in the right cluster beside "Enter".
- Mobile: the hamburger overlay shows "Find Your Mind" in amber with all other links unchanged.
- Both links navigate to `/quiz` — the guided-entry link adds `?entry=guided`; the pill button adds UTM params.

---

## Footer CTAs

**Component file**: `website/src/components/Footer.tsx`

**Exported constants** (added in PR #125):

| Constant | Value | Purpose |
|---|---|---|
| `FOOTER_QUIZ_CTA_HREF` | `/quiz?utm_source=footer&utm_medium=cta&utm_campaign=guided_entry` | "Take the Guided Quiz →" CTA |
| `FOOTER_PRICING_CTA_HREF` | `/pricing?utm_source=footer&utm_medium=cta&utm_campaign=upgrade` | "View Pricing" CTA |

**What was added in PR #125**:

- `ProofStrip` (with `loading={false}`) rendered above the CTAs for social proof.
- "Take the Guided Quiz →" link — amber pill-border style, `data-testid="footer-quiz-cta"`, `aria-label="Take the guided quiz to find your council"`.
- "View Pricing" link — hairline border style, `data-testid="footer-pricing-cta"`, `aria-label="View Pro pricing"`.

**How to verify it is live**:

```bash
BASE_URL="https://www.consultthedead.com"

# Check any page with the shared footer; /frameworks is a stable candidate
curl -sS "$BASE_URL/frameworks" | grep -o 'utm_source=footer' | head -3
curl -sS "$BASE_URL/frameworks" | grep -o 'utm_campaign=guided_entry' | head -1
curl -sS "$BASE_URL/frameworks" | grep -o 'utm_campaign=upgrade' | head -1
```

---

## Smoke Check Sequence

Run these steps in order after any deployment that touches Header.tsx, Footer.tsx, or `/quiz` routing.

### 1. Header quiz CTA — guided entry

1. Open `https://www.consultthedead.com` in a fresh incognito window.
2. Confirm the header nav has "Find Your Mind" rendered in amber (not the dim muted color of the other links).
3. Click "Find Your Mind". Confirm the URL becomes `https://www.consultthedead.com/quiz?entry=guided` and the quiz page loads.
4. Go back. Click "Take the Quiz →" (amber pill, right-hand cluster). Confirm the URL contains `utm_source=header` and `utm_campaign=guided_entry`.

### 2. Header quiz CTA — mobile overlay

1. Resize the browser to ≤768 px (or use DevTools device emulation).
2. Open the hamburger menu.
3. Confirm "Find Your Mind" appears in amber in the overlay.
4. Confirm all other nav links (The Agora, The Council, Pricing, About) remain in dim/muted text.
5. Tap "Find Your Mind" and confirm the URL is `/quiz?entry=guided`.

### 3. Footer quiz CTA

1. Navigate to `https://www.consultthedead.com/frameworks` (or any page with the shared footer).
2. Scroll to the footer.
3. Confirm "Take the Guided Quiz →" is present with an amber pill border.
4. Click it. Confirm the URL contains `utm_source=footer&utm_medium=cta&utm_campaign=guided_entry`.

### 4. Footer pricing CTA

1. From the same footer, confirm "View Pricing" is present with a hairline border.
2. Click it. Confirm the URL is `/pricing` with `utm_source=footer&utm_medium=cta&utm_campaign=upgrade`.

### 5. ProofStrip in footer

1. In the footer, confirm the ProofStrip section renders (social proof strip) above the CTA buttons.
2. Confirm no loading spinner is visible (it should render with `loading={false}`).

### 6. Quiz landing page integrity

1. Navigate to `https://www.consultthedead.com/quiz?entry=guided`.
2. Confirm the quiz page renders the guided-entry variant (decision-type selector visible).
3. Pick any decision type and any route. Confirm the result links to `/agora?minds=...` with the expected slugs pre-filled.

---

## Rollback Procedure

### Header quiz CTA rollback

If the header amber styling or `?entry=guided` routing causes regressions (broken quiz, wrong styling, navigation errors):

1. Revert the changes to `website/src/components/Header.tsx`:
   - Change `HEADER_QUIZ_ENTRY_HREF` back to `buildQuizEntryHref("direct")` (yields `/quiz`).
   - Remove `QUIZ_CTA_NAV_STYLE` and restore `NAV_LINK_STYLE` on the "Find Your Mind" link.
2. Update the contract test in `website/src/app/quiz/page.test.ts` and `website/src/components/__tests__/Header.test.tsx` to assert `buildQuizEntryHref("direct")` / `/quiz`.
3. Commit, push, and redeploy.

```bash
# Verify rollback is live
curl -sS "https://www.consultthedead.com" | grep -o 'href="/quiz"' | head -3
# Should return href="/quiz" (no ?entry=guided)
```

### Footer CTAs rollback

If the footer CTAs cause layout regressions or the ProofStrip introduces render errors:

1. Remove the quiz CTA block, pricing CTA block, and ProofStrip import from `website/src/components/Footer.tsx`.
2. Remove the exported constants `FOOTER_QUIZ_CTA_HREF` and `FOOTER_PRICING_CTA_HREF`.
3. Delete or skip `website/src/components/Footer.test.tsx` if it was introduced alongside PR #125.
4. Commit, push, and redeploy.

```bash
# Verify rollback is live
curl -sS "https://www.consultthedead.com/frameworks" | grep -o 'utm_source=footer'
# Should return no output
```

### When to escalate

- If rolling back the header CTA breaks the quiz page entirely, check whether `buildQuizEntryHref` in `website/src/lib/ctr-experiment.ts` is intact.
- If the ProofStrip removal causes TypeScript errors, ensure the `ProofStrip` import is also removed from Footer.tsx.
- If either rollback commit fails CI, run `pnpm --dir website exec vitest run` locally to identify the failing tests before pushing.
