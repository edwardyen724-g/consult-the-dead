/**
 * Tests for the shared Agora origin allowlist helper.
 *
 * Coverage targets:
 *  - Every production host: consultthedead.com, www.consultthedead.com,
 *    agora.consultthedead.com
 *  - Local dev ports: localhost:3000, 127.0.0.1:3000, localhost:3001
 *  - Vercel preview deployment regex — valid and invalid patterns
 *  - Rejected origins: arbitrary hosts, HTTPS→HTTP downgrade, wrong team slug
 *  - Missing Origin header → false
 *  - AGORA_ALLOWED_ORIGINS set membership
 *  - VERCEL_PREVIEW_ORIGIN_REGEX standalone correctness
 */
import { describe, expect, it } from "vitest";
import {
  AGORA_ALLOWED_ORIGINS,
  isAllowedOrigin,
  VERCEL_PREVIEW_ORIGIN_REGEX,
} from "./originAllowlist";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Minimal NextRequest stub — only the headers.get() path is exercised.
// ---------------------------------------------------------------------------
function makeRequest(origin: string | null): NextRequest {
  const headers = new Headers();
  if (origin !== null) {
    headers.set("origin", origin);
  }
  return {
    headers,
  } as unknown as NextRequest;
}

// ============================================================
// AGORA_ALLOWED_ORIGINS set membership
// ============================================================
describe("AGORA_ALLOWED_ORIGINS", () => {
  it("contains all three production domains", () => {
    expect(AGORA_ALLOWED_ORIGINS.has("https://consultthedead.com")).toBe(true);
    expect(AGORA_ALLOWED_ORIGINS.has("https://www.consultthedead.com")).toBe(true);
    expect(AGORA_ALLOWED_ORIGINS.has("https://agora.consultthedead.com")).toBe(true);
  });

  it("contains local dev origins", () => {
    expect(AGORA_ALLOWED_ORIGINS.has("http://localhost:3000")).toBe(true);
    expect(AGORA_ALLOWED_ORIGINS.has("http://127.0.0.1:3000")).toBe(true);
    expect(AGORA_ALLOWED_ORIGINS.has("http://localhost:3001")).toBe(true);
  });

  it("does NOT contain plain http versions of production domains", () => {
    expect(AGORA_ALLOWED_ORIGINS.has("http://consultthedead.com")).toBe(false);
    expect(AGORA_ALLOWED_ORIGINS.has("http://www.consultthedead.com")).toBe(false);
    expect(AGORA_ALLOWED_ORIGINS.has("http://agora.consultthedead.com")).toBe(false);
  });
});

// ============================================================
// VERCEL_PREVIEW_ORIGIN_REGEX
// ============================================================
describe("VERCEL_PREVIEW_ORIGIN_REGEX", () => {
  it("matches valid Vercel preview deployment URLs", () => {
    expect(
      VERCEL_PREVIEW_ORIGIN_REGEX.test(
        "https://website-abc123-edwardyen724-gs-projects.vercel.app"
      )
    ).toBe(true);
    expect(
      VERCEL_PREVIEW_ORIGIN_REGEX.test(
        "https://website-xyz-edwardyen724-gs-projects.vercel.app"
      )
    ).toBe(true);
    expect(
      VERCEL_PREVIEW_ORIGIN_REGEX.test(
        "https://website-a1b2c3d4-edwardyen724-gs-projects.vercel.app"
      )
    ).toBe(true);
  });

  it("does NOT match HTTP (non-HTTPS) preview URLs", () => {
    expect(
      VERCEL_PREVIEW_ORIGIN_REGEX.test(
        "http://website-abc123-edwardyen724-gs-projects.vercel.app"
      )
    ).toBe(false);
  });

  it("does NOT match wrong team slug", () => {
    expect(
      VERCEL_PREVIEW_ORIGIN_REGEX.test(
        "https://website-abc123-otherteam-projects.vercel.app"
      )
    ).toBe(false);
  });

  it("does NOT match arbitrary Vercel subdomain patterns", () => {
    expect(
      VERCEL_PREVIEW_ORIGIN_REGEX.test("https://something-else.vercel.app")
    ).toBe(false);
    expect(
      VERCEL_PREVIEW_ORIGIN_REGEX.test(
        "https://website-abc123-edwardyen724-gs-projects.vercel.app.evil.com"
      )
    ).toBe(false);
  });

  it("requires website- prefix", () => {
    expect(
      VERCEL_PREVIEW_ORIGIN_REGEX.test(
        "https://abc123-edwardyen724-gs-projects.vercel.app"
      )
    ).toBe(false);
  });
});

// ============================================================
// isAllowedOrigin — allowed cases
// ============================================================
describe("isAllowedOrigin — allowed origins", () => {
  it("allows https://consultthedead.com", () => {
    expect(isAllowedOrigin(makeRequest("https://consultthedead.com"))).toBe(true);
  });

  it("allows https://www.consultthedead.com", () => {
    expect(
      isAllowedOrigin(makeRequest("https://www.consultthedead.com"))
    ).toBe(true);
  });

  it("allows https://agora.consultthedead.com", () => {
    expect(
      isAllowedOrigin(makeRequest("https://agora.consultthedead.com"))
    ).toBe(true);
  });

  it("allows http://localhost:3000", () => {
    expect(isAllowedOrigin(makeRequest("http://localhost:3000"))).toBe(true);
  });

  it("allows http://127.0.0.1:3000", () => {
    expect(isAllowedOrigin(makeRequest("http://127.0.0.1:3000"))).toBe(true);
  });

  it("allows http://localhost:3001", () => {
    expect(isAllowedOrigin(makeRequest("http://localhost:3001"))).toBe(true);
  });

  it("allows a Vercel preview deployment URL", () => {
    expect(
      isAllowedOrigin(
        makeRequest(
          "https://website-abc123def456-edwardyen724-gs-projects.vercel.app"
        )
      )
    ).toBe(true);
  });
});

// ============================================================
// isAllowedOrigin — rejected cases
// ============================================================
describe("isAllowedOrigin — rejected origins", () => {
  it("rejects missing Origin header", () => {
    expect(isAllowedOrigin(makeRequest(null))).toBe(false);
  });

  it("rejects an empty Origin string", () => {
    expect(isAllowedOrigin(makeRequest(""))).toBe(false);
  });

  it("rejects HTTP downgrade of production domain", () => {
    expect(isAllowedOrigin(makeRequest("http://consultthedead.com"))).toBe(
      false
    );
  });

  it("rejects arbitrary external domain", () => {
    expect(isAllowedOrigin(makeRequest("https://evil.com"))).toBe(false);
  });

  it("rejects subdomain injection of our domain", () => {
    expect(
      isAllowedOrigin(makeRequest("https://evil.consultthedead.com"))
    ).toBe(false);
  });

  it("rejects wrong Vercel team in preview URL", () => {
    expect(
      isAllowedOrigin(
        makeRequest(
          "https://website-abc123-otherteam-projects.vercel.app"
        )
      )
    ).toBe(false);
  });

  it("rejects localhost on an unexpected port", () => {
    expect(isAllowedOrigin(makeRequest("http://localhost:4000"))).toBe(false);
  });

  it("rejects null origin literally sent as the string 'null'", () => {
    expect(isAllowedOrigin(makeRequest("null"))).toBe(false);
  });
});
