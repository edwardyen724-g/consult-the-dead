# Auth Noindex Metadata — Release Note (2026-05-11)

**PR:** #147  
**Area:** `/sign-in`, `/sign-up` — metadata, server component conversion  
**Status:** Shipped to production 2026-05-11

---

## What Shipped

### `robots: noindex, nofollow` on Auth Pages

Both the sign-in and sign-up routes now emit `robots: { index: false, follow: false }` via Next.js route-level metadata. Search engines will no longer index or crawl these pages.

**Affected routes:**
- `/sign-in` → `website/src/app/sign-in/[[...sign-in]]/page.tsx`
- `/sign-up` → `website/src/app/sign-up/[[...sign-up]]/page.tsx`

**Resulting `<meta>` tag in rendered HTML:**
```html
<meta name="robots" content="noindex, nofollow" />
```

### Server Component Conversion

Next.js requires `export const metadata` to live in a server component (RSC). Both auth pages have been converted:

**Sign-in (`/sign-in`):**
- `page.tsx` converted from a client component to a server component.
- `AuthLanding` already carries its own `'use client'` directive, so no behavior changes on the client side.

**Sign-up (`/sign-up`):**
- The Clerk `<SignUp />` widget extracted into a new `SignUpClient.tsx` client component.
- `page.tsx` shell is now a server component that exports `metadata`.
- `SignUpClient.tsx` is rendered inside the server page shell — the visual output and behavior are unchanged.

---

## Why

Auth pages (sign-in, sign-up) should not appear in search results. Including them in the index wastes crawl budget, can confuse users who find auth pages via search, and exposes implementation details about the auth provider (Clerk) to search engine crawlers. The `noindex, nofollow` directive is the standard fix.

The server component conversion is a prerequisite — Next.js will not export `metadata` from a client component.

---

## Verification

### Check the live meta tag

```bash
# Verify sign-in page
curl -s https://consultthedead.com/sign-in | grep -i 'robots'
# Expected output contains:
# <meta name="robots" content="noindex,nofollow"/>

# Verify sign-up page
curl -s https://consultthedead.com/sign-up | grep -i 'robots'
# Expected output contains:
# <meta name="robots" content="noindex,nofollow"/>
```

### Check page source in browser

1. Open `https://consultthedead.com/sign-in` in a browser.
2. View page source (`Cmd+U` / `Ctrl+U`).
3. Search for `robots` — confirm `content="noindex,nofollow"` is present.

### Verify auth pages still work

1. Navigate to `/sign-in` — Clerk sign-in widget should render normally.
2. Navigate to `/sign-up` — Clerk sign-up widget should render normally.
3. Complete a sign-in or sign-up flow end-to-end to confirm no regression.

### Automated tests

```bash
cd website
npx vitest run \
  "src/app/sign-in/[[...sign-in]]/page.test.tsx" \
  "src/app/sign-up/[[...sign-up]]/page.test.tsx"
```

Test coverage:
- `SignInPage` metadata: `title`, `robots.index === false`, `robots.follow === false`
- `SignUpPage` metadata: `title`, `robots.index === false`, `robots.follow === false`
- `SignUpClient` renders Clerk `<SignUp />` with centering styles

---

## Server Component Conversion Pattern

For future auth-adjacent routes that need metadata, the `SignUpClient` extraction pattern is the template:

```
sign-up/
  page.tsx          ← server component; exports metadata; renders <SignUpClient />
  SignUpClient.tsx   ← 'use client'; renders Clerk <SignUp /> with layout styles
```

This keeps the metadata export in RSC while preserving the Clerk widget's client-side interactivity requirement.
