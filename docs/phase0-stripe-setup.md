# Phase 0 — Stripe Product & Price Setup

**Created:** 2026-04-23
**Owner:** Edward
**Time to complete:** ~10 minutes in Stripe Dashboard

---

## Decision: Use your existing Stripe account or create a new one?

**Recommendation: Create a second Stripe account for Consult The Dead.**

Why:
- Your existing account is under "Lispresso AI." Customers would see "LISPRESSO AI" on their credit card statement for Agora Pro charges — confusing and unprofessional.
- Statement descriptors are account-level for subscriptions. You can't set "CONSULT THE DEAD" per-product on the Lispresso account without Stripe Connect (unnecessary complexity).
- A second account is free (Stripe allows multiple accounts for the same person), gives you clean financial reporting, and customers see the right brand.
- You said you don't want to register a new company — you don't have to. You can create a second Stripe account as a sole proprietor / DBA under your personal name. No new entity required.

---

## Step-by-step setup (in Stripe Dashboard)

### Step 1: Create a new Stripe account

1. Go to dashboard.stripe.com
2. Click your account name (top-left) → "New account"
3. Account name: **Consult The Dead**
4. Country: wherever you're based
5. Business type: **Individual / Sole proprietor**
6. Complete identity verification (same personal info, different business name)

### Step 2: Set statement descriptor

1. Go to **Settings → Business → Public details**
2. Statement descriptor: **CONSULTTHEDEAD** (max 22 chars, no spaces, uppercase)
3. Shortened descriptor: **CTD** (for short-form statements)
4. Public business name: **Consult The Dead**
5. Support email: edwardyen724@gmail.com (or a dedicated support@ address)
6. Support URL: https://consultthedead.com

### Step 3: Create the Product

1. Go to **Product Catalog → Add Product**
2. Product name: **Agora Pro**
3. Description: "Unlimited structured debates from history's sharpest minds. Up to 5 advisors, Opus-quality synthesis, persistent library, PDF export."
4. Add **two prices:**

| Price | Amount | Billing | Notes |
|-------|--------|---------|-------|
| Monthly | $30.00 | Recurring / Monthly | Default option on pricing page |
| Annual | $300.00 | Recurring / Yearly | "2 months free" — highlight on pricing page |

5. Leave tax behavior as "Inclusive" or "Exclusive" based on your preference (see tax note below)

### Step 4: Enable Customer Portal

1. Go to **Settings → Billing → Customer Portal**
2. Toggle ON: "Allow customers to update subscriptions" and "Allow customers to cancel subscriptions"
3. Add both prices (Monthly and Annual) so customers can switch between them
4. Set cancellation policy: cancel at end of billing period (not immediately)
5. Business name in portal: **Consult The Dead**

### Step 5: Enable Checkout (no-code test)

1. Go to **Product Catalog → Agora Pro → Monthly price**
2. Click "Create payment link"
3. This gives you a hosted checkout URL you can use immediately for testing
4. Later, the code integration replaces this with programmatic Checkout Sessions

### Step 6: Tax — Decision: DEFERRED (2026-04-23)

**Decision:** Do not enable Stripe Tax at launch.

**Rationale:** At launch, Consult The Dead has fewer than 50 subscribers and no confirmed customers in VAT/GST-mandatory jurisdictions. Manual tax handling (no collection, no remittance) is legally permissible below economic-nexus thresholds in most US states and below the EU/UK digital-services VAT registration thresholds.

**Revisit triggers — either one flips the decision to ENABLED:**

1. **MRR reaches $2,000** — at this level, nexus risk in high-volume US states (CA, TX, NY) becomes non-trivial, and Stripe Tax's 0.5% fee (~$10/mo at that MRR) is a cost-effective hedge. Check: Stripe Dashboard → Revenue → MRR.
2. **First confirmed subscriber in EU, UK, Australia, Canada, or Norway** — all five require digital-services tax collection regardless of revenue volume (EU VAT, UK VAT, AU GST, Canadian GST/HST, Norwegian MVA). Check: Stripe Dashboard → Customers → filter by country.

**Action when a trigger fires:** Settings → Tax → Get started → follow the wizard (~5 minutes). No code changes needed; Stripe handles collection and reporting.

---

## What to save after setup

You'll need these values for the code integration (Phase 1 of the Monetization Playbook):

| Value | Where to find it | Used by |
|-------|-----------------|---------|
| `STRIPE_SECRET_KEY` | Settings → API Keys → Secret key | Server-side API calls |
| `STRIPE_PUBLISHABLE_KEY` | Settings → API Keys → Publishable key | Client-side Checkout redirect |
| `STRIPE_WEBHOOK_SECRET` | Developers → Webhooks → Signing secret | Webhook signature verification |
| `STRIPE_PRICE_MONTHLY` | Product Catalog → Agora Pro → Monthly → Price ID (starts with `price_`) | Checkout Session creation |
| `STRIPE_PRICE_ANNUAL` | Product Catalog → Agora Pro → Annual → Price ID (starts with `price_`) | Checkout Session creation |

Add these to your `.env.local` (never commit to git).

---

## Summary

| Setting | Value |
|---------|-------|
| Account name | Consult The Dead |
| Business type | Individual / Sole proprietor |
| Statement descriptor | CONSULTTHEDEAD |
| Product name | Agora Pro |
| Monthly price | $30/month |
| Annual price | $300/year |
| Customer Portal | Enabled (self-serve cancel + plan switch) |
| Tax | DEFERRED — revisit at $2,000 MRR or first EU/UK/AU/CA/NO subscriber |
