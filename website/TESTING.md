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

## Coverage gate and release policy

The canonical release-gate policy lives in
[`../docs/coverage-gate-policy.md`](../docs/coverage-gate-policy.md).

### Current thresholds

`vitest.config.ts` currently enforces **95%** coverage thresholds for lines,
branches, functions, and statements on the tracked coverage set.

### Testing guidance

- Run `npm run coverage` before merging any PR that touches covered code.
- Run `npm run build` before shipping release-facing changes.
- If you add branching logic to a route handler, extract it into a
  dependency-injected helper in `src/lib/` and cover that helper with vitest.
- Keep route handlers thin when possible; if a handler is intentionally thin,
  say so in the PR description.

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

`npm run coverage` is the required coverage gate before every PR merge.
`npm test` is still the fastest non-coverage test command for local iteration.

The Playwright suite (`tests/`) runs separately and is not part of the vitest
coverage report.
