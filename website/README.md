# Consult The Dead Website

`website/` is the Next.js app for Consult The Dead: a decision-support product that runs a question through historical frameworks, a live Agora debate flow, and a saved debate library.

The site exposes the public home page, council and debate browsers, pricing and account surfaces, and the API routes that power debate execution, billing, saved library items, auth, and telemetry.

## App Surface

- `/` - home page, featured minds, and entry points into the product
- `/agora` - live debate surface where a user poses a decision and seats 2-5 minds
- `/agora/a/[id]` - public share pages for saved agons, including generated social images
- `/quiz` - decision-finder that recommends a council based on the type of problem
- `/frameworks` - index of all live frameworks
- `/frameworks/[slug]` - individual framework detail pages
- `/debates` - sample Agon debates curated from the library
- `/debates/[slug]` - individual sample debate pages
- `/library` - signed-in Pro library for saved agons
- `/pricing` - plan comparison and upgrade flow
- `/account` - subscription status, usage, and BYO key settings
- `/listicles/[slug]` — 5 long-tail SEO pages (startup-pivot, career-change, leadership-crisis, investing-risk, product-strategy); each pre-fills the Agora council via UTM CTA
- `/minds/[id]` — 25 per-mind landing pages (one per active framework); each includes how-they-argue, sample quotes, and UTM-linked /agora CTA
- `/packs` — themed pack catalog; browse curated mind packs by domain (stoics, inventors, strategists, etc.) with guided-quiz CTA and proof strip
- `/explore` — public agon gallery; crawlable grid of public debate records with chip-strip and search
- `/feed.xml` — RSS feed of public debates and insights
- Supporting routes: `/essay`, `/insights`, `/privacy`, `/terms`, `/sign-in`, `/sign-up`

## API Surface

- `/api/health` - liveness probe for deploys and smoke checks
- `/api/agon` - streamed debate execution endpoint
- `/api/library` - list/save agons
- `/api/library/[id]` - fetch a saved agon by share id
- `/api/usage` - current quota and period usage
- `/api/stripe/checkout` - create a checkout session
- `/api/stripe/portal` - open the customer portal
- `/api/stripe/webhook` - Stripe event handler
- `/api/user/api-key` - store or remove a BYO Anthropic key
- `/api/contact` - contact form submission endpoint
- `/api/webhooks/clerk` - Clerk webhook handler
- `/api/admin/metrics` - internal metrics endpoint
- `/api/ingest/pageview` - pageview ingestion hook

## Local Development

Run the website from this directory:

```bash
cd website
npm install
npm run dev
```

Common scripts:

```bash
npm run lint
npm run test
npm run coverage
npm run build
npm run start
```

Open `http://localhost:3000` after `npm run dev` starts.

## Deploy

The production entrypoint is the built Next.js app in `website/`.

For a release build:

```bash
cd website
npm run build
npm run start
```

Deploy the built app to the project host used for this repository, and make sure the deployment environment provides the required Clerk, Anthropic, Stripe, Postgres, Redis, Resend, Tavily, and Sentry settings.
