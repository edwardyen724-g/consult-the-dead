# Email Send Smoke Test — Production Verification

Use this runbook **after deploying** to verify that Resend delivers real email for both email trigger paths:

1. **Clerk welcome** — fires when a new user signs up via Clerk webhook → `POST /api/webhooks/clerk`
2. **Post-checkout receipt** — fires after a successful Stripe subscription checkout → `POST /api/stripe/webhook`

> **When to run**: After first production deploy of the lazy-init Stripe/Resend refactor (capsule 0682e94c) or any time you change `src/lib/email.ts` or either webhook route.

---

## Required Environment Variables

Set these in Vercel (Project → Settings → Environment Variables) before deploying:

| Variable | Where to get it | Notes |
|---|---|---|
| `RESEND_API_KEY` | [Resend dashboard](https://resend.com/api-keys) → API Keys | Must be a **live key** (`re_…`), not the test key, for production sends |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Clerk dashboard → Webhooks → Signing Secret | Used by `POST /api/webhooks/clerk` to verify Svix signatures |
| `STRIPE_SECRET_KEY` | Stripe dashboard → Developers → API Keys | Live secret key (`sk_live_…`) for production |
| `STRIPE_WEBHOOK_SECRET` | Stripe dashboard → Developers → Webhooks → signing secret | Used by `POST /api/stripe/webhook` to verify signatures |
| `STRIPE_PRICE_MONTHLY` | Stripe dashboard → Products → price ID | e.g. `price_1Abc…` |
| `STRIPE_PRICE_ANNUAL` | Stripe dashboard → Products → price ID | e.g. `price_1Def…` |

### EMAIL_FROM

The sender address is currently hardcoded in `src/lib/email.ts`:

```ts
const FROM = 'onboarding@resend.dev'
```

`onboarding@resend.dev` is Resend's shared sandbox domain and **only delivers to your verified email address** while your domain is unverified. To send to any address in production:

1. Add your domain in Resend → Domains (e.g. `consultthedead.com`).
2. Add DNS records as instructed by Resend.
3. Update the constant (or add `EMAIL_FROM` env var) to `notifications@consultthedead.com` or similar.

Until the domain is verified, all smoke tests must use the Resend-account owner email as the recipient.

---

## Path 1 — Clerk Welcome Email

**Trigger**: new user signs up → Clerk fires `user.created` webhook → `POST /api/webhooks/clerk` → `sendWelcomeEmail()`

### Option A: Use Clerk Dashboard (recommended)

1. Open [Clerk Dashboard](https://dashboard.clerk.com) → **Webhooks**.
2. Select the webhook endpoint pointing to `https://www.consultthedead.com/api/webhooks/clerk`.
3. Click **Testing** → **Send test event** → select `user.created`.
4. Fill the payload with a real email address (must be your Resend-verified address until domain is confirmed):
   ```json
   {
     "type": "user.created",
     "data": {
       "id": "user_smoke_test_001",
       "email_addresses": [
         {
           "id": "idn_smoke001",
           "email_address": "your-verified@email.com"
         }
       ],
       "primary_email_address_id": "idn_smoke001",
       "first_name": "Smoke",
       "last_name": "Test"
     }
   }
   ```
5. Click **Send**. Clerk signs the payload with Svix headers automatically.
6. Check your inbox within ~30 seconds.

### Option B: curl with manual Svix signature

Use this if you need to automate or test locally against a tunneled dev server.

```bash
# Prerequisites: jq, openssl, your CLERK_WEBHOOK_SIGNING_SECRET

SIGNING_SECRET="whsec_your_clerk_signing_secret"
WEBHOOK_URL="https://www.consultthedead.com/api/webhooks/clerk"
PAYLOAD='{"type":"user.created","data":{"id":"user_smoke_001","email_addresses":[{"id":"idn_001","email_address":"your-verified@email.com"}],"primary_email_address_id":"idn_001","first_name":"Smoke","last_name":"Test"}}'

SVIX_ID="msg_smoke_$(date +%s)"
SVIX_TS=$(date +%s)

# Svix signs: "<svix-id>.<svix-timestamp>.<body>"
SIGN_PAYLOAD="${SVIX_ID}.${SVIX_TS}.${PAYLOAD}"

# Strip the "whsec_" prefix and base64-decode the secret
SECRET_BASE64="${SIGNING_SECRET#whsec_}"
HMAC=$(echo -n "$SIGN_PAYLOAD" | openssl dgst -sha256 -mac HMAC \
  -macopt "key:$(echo "$SECRET_BASE64" | base64 -d 2>/dev/null || echo "$SECRET_BASE64")" \
  -binary | base64)

curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "svix-id: $SVIX_ID" \
  -H "svix-timestamp: $SVIX_TS" \
  -H "svix-signature: v1,$HMAC" \
  -d "$PAYLOAD"
# Expected: {"received":true}
```

> **Note**: This route also creates a Stripe customer via `stripe.customers.create`. Use a throwaway test customer or clean up afterwards in the Stripe dashboard.

---

## Path 2 — Post-Checkout Subscription Receipt

**Trigger**: user completes Stripe checkout → Stripe fires `checkout.session.completed` → `POST /api/stripe/webhook` → `sendSubscriptionConfirmation()`

### Option A: Stripe CLI (recommended)

Install: `brew install stripe/stripe-cli/stripe`

```bash
# Login once
stripe login

# Forward live events to your production URL (or local tunnel for staging)
stripe listen --forward-to https://www.consultthedead.com/api/stripe/webhook

# In a second terminal — trigger the event
stripe trigger checkout.session.completed
```

The CLI prints the webhook signing secret to use locally (`whsec_…`). For production, the secret is already set via `STRIPE_WEBHOOK_SECRET`.

#### Full flow with a real customer

```bash
# 1. Create a test customer with a real email
CUSTOMER=$(stripe customers create \
  --email "your-verified@email.com" \
  --metadata "clerk_user_id=user_smoke_001" \
  --output json)

CUSTOMER_ID=$(echo "$CUSTOMER" | jq -r '.id')
echo "Customer: $CUSTOMER_ID"

# 2. Create a test subscription (use test price IDs in test mode)
SUBSCRIPTION=$(stripe subscriptions create \
  --customer "$CUSTOMER_ID" \
  --items[0][price]="$STRIPE_PRICE_MONTHLY" \
  --output json)

SUB_ID=$(echo "$SUBSCRIPTION" | jq -r '.id')

# 3. Synthesize a checkout.session.completed event and forward it
stripe trigger checkout.session.completed \
  --override "checkout_session:customer=$CUSTOMER_ID" \
  --override "checkout_session:subscription=$SUB_ID"
```

### Option B: curl with manual Stripe signature

```bash
WEBHOOK_URL="https://www.consultthedead.com/api/stripe/webhook"
STRIPE_WEBHOOK_SECRET="whsec_your_stripe_webhook_secret"

TIMESTAMP=$(date +%s)

# Build a minimal checkout.session.completed payload
# Replace cus_XXX with a real Stripe customer ID that has a clerk_user_id metadata
PAYLOAD=$(cat <<'EOF'
{
  "id": "evt_smoke_001",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_smoke_001",
      "object": "checkout.session",
      "customer": "cus_REPLACE_WITH_REAL_CUSTOMER_ID",
      "subscription": null
    }
  }
}
EOF
)

SIGNED_PAYLOAD="${TIMESTAMP}.${PAYLOAD}"
STRIPE_SIG=$(echo -n "$SIGNED_PAYLOAD" | openssl dgst -sha256 -mac HMAC \
  -macopt "key:${STRIPE_WEBHOOK_SECRET#whsec_}" -hex | awk '{print $2}')

curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "stripe-signature: t=${TIMESTAMP},v1=${STRIPE_SIG}" \
  -d "$PAYLOAD"
# Expected: {"received":true}
```

> **Important**: The webhook handler calls `stripe.customers.retrieve(customerId)` and `stripe.subscriptions.retrieve(subscriptionId)` against the live Stripe API, so `customer` must be a real customer ID with `clerk_user_id` in its metadata.

---

## Verifying Success

| Check | Where to look |
|---|---|
| Email delivered | Recipient inbox (check spam) |
| Resend send log | [Resend dashboard](https://resend.com) → Emails → last 24h |
| Webhook 200 OK | Vercel → Functions → `/api/webhooks/clerk` or `/api/stripe/webhook` → recent invocations |
| No error logs | Vercel → Functions → any `Error` or `catch` output |

### Expected email subjects

- Welcome email: **"Welcome to the Agora"**
- Subscription receipt: **"You're on Pro"**

---

## Common Failure Modes

| Symptom | Likely cause | Fix |
|---|---|---|
| `{"received":true}` but no email | `RESEND_API_KEY` missing or wrong | Check Vercel env vars; confirm key starts with `re_` |
| `Invalid signature` 400 | Wrong signing secret | Re-copy from Clerk/Stripe dashboard; ensure no trailing whitespace |
| Email to inbox fails, Resend shows "Blocked" | Sender domain not verified | Verify domain in Resend or use `onboarding@resend.dev` during testing |
| `STRIPE_SECRET_KEY is not set` 500 | Env var missing in Vercel | Add to all environments (Production, Preview) |
| Clerk route creates duplicate Stripe customer | Smoke test ran against production with real user | Delete the test customer in Stripe dashboard |

---

## Cleanup After Smoke Test

```bash
# Delete the test Stripe customer created during the Clerk welcome test
stripe customers delete cus_REPLACE_WITH_TEST_CUSTOMER_ID
```

In Clerk dashboard: delete any test user created during Path 1 testing to avoid polluting user count.
