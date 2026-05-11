/**
 * Browser smoke tests for framework preview-image routes.
 *
 * Covers:
 *  1. Framework page loads (status 200, title contains the person's name)
 *  2. /frameworks/[slug]/opengraph-image returns 200 with content-type image/*
 *  3. /frameworks/[slug]/twitter-image  returns 200 with content-type image/*
 *  4. An invalid slug returns a non-500 response (200 or 404; branded fallback is acceptable)
 *
 * These tests run against BASE_URL (defaults to https://consultthedead.com).
 * Override with `BASE_URL=http://localhost:3000 pnpm playwright test` for local runs.
 */
import { expect, test } from "playwright/test";

const VALID_SLUG = "isaac-newton";

// ---------------------------------------------------------------------------
// 1. Framework page renders correctly
// ---------------------------------------------------------------------------

test("framework page loads with status 200 and correct title", async ({
  page,
}) => {
  const response = await page.goto(`/frameworks/${VALID_SLUG}`, {
    waitUntil: "domcontentloaded",
  });

  expect(response?.status()).toBe(200);

  const title = await page.title();
  // Title should mention the person's name (case-insensitive).
  expect(title.toLowerCase()).toContain("newton");
});

// ---------------------------------------------------------------------------
// 2 & 3. Preview-image routes return image responses
// ---------------------------------------------------------------------------

test("opengraph-image route returns 200 with image content-type", async ({
  request,
}) => {
  const response = await request.get(
    `/frameworks/${VALID_SLUG}/opengraph-image`,
  );

  expect(response.status()).toBe(200);

  const contentType = response.headers()["content-type"] ?? "";
  expect(contentType).toMatch(/^image\//);
});

test("twitter-image route returns 200 with image content-type", async ({
  request,
}) => {
  const response = await request.get(
    `/frameworks/${VALID_SLUG}/twitter-image`,
  );

  expect(response.status()).toBe(200);

  const contentType = response.headers()["content-type"] ?? "";
  expect(contentType).toMatch(/^image\//);
});

// ---------------------------------------------------------------------------
// 4. Invalid slug — must not return a 5xx error
// ---------------------------------------------------------------------------

test("opengraph-image for an invalid slug returns 200 or 404 (not 5xx)", async ({
  request,
}) => {
  const response = await request.get(
    "/frameworks/not-a-real-person/opengraph-image",
  );

  const status = response.status();
  // A branded fallback card (200) or a standard not-found (404) are both
  // acceptable outcomes.  A 5xx would indicate an unhandled server error.
  expect(status).toBeGreaterThanOrEqual(200);
  expect(status).toBeLessThan(500);
});
