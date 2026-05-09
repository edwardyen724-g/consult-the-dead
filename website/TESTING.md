# Testing — Consult The Dead / website

## Quick start

```bash
# Run all unit tests once
npm test

# Run tests in watch mode (re-runs on save)
npm run test:watch

# Run tests with a coverage report
npm run coverage
```

All three commands use [vitest](https://vitest.dev/) (v4+) and require only
`npm install` in `website/` — no additional setup.

---

## Test structure

```
website/
├── vitest.config.ts             ← test runner config (coverage, aliases, env)
├── src/
│   ├── lib/
│   │   ├── share-id.test.ts     ← share-ID helper (legacy standalone-runnable shim)
│   │   ├── __tests__/
│   │   │   └── analytics.test.ts  ← analytics.ts helper
│   │   └── agon/
│   │       └── agonEngine.test.ts ← canonical SDK mock reference (see below)
│   └── ...
└── TESTING.md                   ← this file
```

### `agonEngine.test.ts` — canonical mock reference

`src/lib/agon/agonEngine.test.ts` is the **canonical reference** for any
future dev agent writing tests that depend on `@anthropic-ai/sdk` or
`@tavily/core`. It demonstrates:

- **`vi.hoisted()` + `vi.mock()` pattern** — the only way to get refs to
  mock functions that work both inside the factory and in test bodies, since
  `vi.mock()` calls are hoisted before imports are resolved.
- **Constructing `Anthropic` as a mock class** — must use a regular function
  (not an arrow function) in `vi.fn()`, because arrow functions cannot be
  called with `new`. See the `MockAnthropicCtor` pattern in that file.
- **Async-generator stream mock** — `messages.stream()` is consumed with
  `for await`; the mock returns an `AsyncGenerator` via a plain `async
  function*` helper.
- **`messages.create()` mock** — returns a plain `Promise<{ content }>`,
  easy to override per-test with `mockResolvedValueOnce`.
- **Tavily factory mock** — `tavily({ apiKey })` is mocked as a factory that
  returns a client-shaped object with `search` and `extract` mock functions.
- **`TAVILY_API_KEY` env gating** — delete `process.env.TAVILY_API_KEY` in
  `beforeEach` to test the no-Tavily code path without any extra mocking.

Copy that file's header comment and `vi.hoisted()` block as the starting
template when writing tests for any file in `src/lib/agon/`.

---

## Coverage gate and `src/app/**` exclusion policy

### Current thresholds

Thresholds are set to **0% across all metrics** in `vitest.config.ts`. This
is intentional — the gate starts permissive and will be raised incrementally
as coverage backfill proceeds per the roadmap.

```
coverage.thresholds = { lines: 0, branches: 0, functions: 0, statements: 0 }
```

The CTO target is **≥ 95%** for all non-excluded files once the backfill
tasks land.

### `src/app/**` is excluded from coverage — policy rationale

`vitest.config.ts` explicitly excludes `src/app/**` from the coverage report:

```typescript
exclude: [
  "src/**/*.d.ts",
  "src/**/*.test.ts",
  "src/**/*.test.tsx",
  "src/app/**",      // Next.js route handlers — integration-tested by Playwright
  "src/middleware.ts",
],
```

**Why the exclusion exists:** Next.js route handlers in `src/app/api/` are
tightly coupled to the Next.js request/response pipeline. Unit-testing them
requires mocking `NextRequest`, `NextResponse`, cookies, headers, and the
Node.js HTTP layer — high setup cost for low signal, because the real failure
modes (auth errors, DB timeouts, streaming edge cases) are best caught by
integration tests.

**The enforced policy is: keep the exclusion, and extract business logic.**

Route handlers that contain non-trivial branching logic (e.g. `/api/library`,
`/api/stripe/*`, `/api/agon/*`) **must** extract that logic into
dependency-injected helpers in `src/lib/` so it can be unit-tested there.
Route handlers themselves become thin wrappers — parse input, call the helper,
return the response — and are covered by Playwright integration tests.

**Concrete rule for dev agents:**

> If you add branching logic to a route handler that warrants a test,
> extract it into a `src/lib/<feature>/` helper and add a vitest test for
> the helper. Do **not** add business logic directly to the handler that
> has no test coverage path.

**Thin, deterministic routes** (e.g. `/api/health` which is a static JSON
wrapper) do not require extraction and are waived by the exclusion rule.

**Route-handler coverage waiver:** Any PR that adds a new route handler
without a corresponding `src/lib/` helper test is accepted under this waiver,
provided the PR description explains why the handler is thin (< 10 LOC of
logic, no branching).

---

## Running a single test file

```bash
node_modules/.bin/vitest run src/lib/agon/agonEngine.test.ts
```

Or with watch:

```bash
node_modules/.bin/vitest src/lib/agon/agonEngine.test.ts
```

## CI / pre-merge gate

`npm test` (vitest run) is the required gate before every PR merge. Coverage
thresholds are advisory (currently 0%) and will be tightened via a dedicated
task once the coverage backfill series lands.

The Playwright suite (`tests/`) runs separately and is not part of the vitest
coverage report.
