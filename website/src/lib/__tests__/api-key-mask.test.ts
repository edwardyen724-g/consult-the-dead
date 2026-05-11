/**
 * Tests for src/lib/api-key-mask.ts.
 *
 * Covers:
 *   - maskApiKey: masking shape, last-4 preservation, empty/short/non-string
 *     fallbacks
 *   - isValidAnthropicKeyFormat: prefix + length checks, type guard, common
 *     wrong inputs (empty, null, undefined, sk-prod-*, too-short sk-ant-*)
 *
 * Run with:
 *   cd website && npm test -- api-key-mask
 *
 * Coverage gate (capsule 71f054c2): >=95% on api-key-mask.ts. The module is
 * trivially small but every branch is exercised here so the gate holds.
 */
import { describe, it, expect } from "vitest";
import {
  ANTHROPIC_KEY_MIN_LENGTH,
  ANTHROPIC_KEY_PREFIX,
  isValidAnthropicKeyFormat,
  maskApiKey,
} from "../api-key-mask";

// A well-formed (but not real) key whose length comfortably exceeds the
// minimum. Last four characters are "WXYZ" so we can assert the last-4
// preservation explicitly.
const SAMPLE_KEY = `${ANTHROPIC_KEY_PREFIX}abcdefghij0123456789klmnopWXYZ`;

describe("maskApiKey", () => {
  it("masks a well-formed key as sk-ant-***...***<last4>", () => {
    expect(maskApiKey(SAMPLE_KEY)).toBe(`${ANTHROPIC_KEY_PREFIX}***...***WXYZ`);
  });

  it("preserves the last four characters of any key length >= 4", () => {
    expect(maskApiKey("12345678")).toBe(`${ANTHROPIC_KEY_PREFIX}***...***5678`);
    expect(maskApiKey("abcd")).toBe(`${ANTHROPIC_KEY_PREFIX}***...***abcd`);
  });

  it("returns sk-ant-***...*** (no tail) for keys shorter than 4 chars", () => {
    expect(maskApiKey("abc")).toBe(`${ANTHROPIC_KEY_PREFIX}***...***`);
    expect(maskApiKey("a")).toBe(`${ANTHROPIC_KEY_PREFIX}***...***`);
  });

  it("returns the empty string for empty input", () => {
    expect(maskApiKey("")).toBe("");
  });

  it("returns the empty string for non-string input", () => {
    expect(maskApiKey(undefined)).toBe("");
    expect(maskApiKey(null)).toBe("");
    expect(maskApiKey(12345 as unknown as string)).toBe("");
    expect(maskApiKey({} as unknown as string)).toBe("");
  });

  it("never echoes the middle of the key", () => {
    // Defensive test against a future regression where someone "improves" the
    // mask by including more raw material — the censored core must always be
    // exactly "***...***".
    const masked = maskApiKey(SAMPLE_KEY);
    expect(masked.includes("abcdefghij")).toBe(false);
    expect(masked.includes("0123456789klmnop")).toBe(false);
    expect(masked.startsWith(ANTHROPIC_KEY_PREFIX)).toBe(true);
    expect(masked).toMatch(/^sk-ant-\*{3}\.{3}\*{3}.{0,4}$/);
  });
});

describe("isValidAnthropicKeyFormat", () => {
  it("accepts a well-formed sk-ant- key of sufficient length", () => {
    expect(isValidAnthropicKeyFormat(SAMPLE_KEY)).toBe(true);
  });

  it("rejects keys with the wrong prefix", () => {
    expect(isValidAnthropicKeyFormat(`sk-prod-${"x".repeat(40)}`)).toBe(false);
    expect(isValidAnthropicKeyFormat(`sk_ant_${"x".repeat(40)}`)).toBe(false);
    expect(isValidAnthropicKeyFormat(`SK-ANT-${"x".repeat(40)}`)).toBe(false); // case-sensitive
  });

  it("rejects sk-ant- keys that are too short", () => {
    // exactly prefix length: 0 trailing chars
    expect(isValidAnthropicKeyFormat(ANTHROPIC_KEY_PREFIX)).toBe(false);
    // prefix + a few chars but still under the minimum
    const short = ANTHROPIC_KEY_PREFIX + "abc123";
    expect(short.length).toBeLessThan(ANTHROPIC_KEY_MIN_LENGTH);
    expect(isValidAnthropicKeyFormat(short)).toBe(false);
  });

  it("rejects empty / whitespace input", () => {
    expect(isValidAnthropicKeyFormat("")).toBe(false);
    expect(isValidAnthropicKeyFormat("   ")).toBe(false);
  });

  it("rejects non-string input", () => {
    expect(isValidAnthropicKeyFormat(undefined)).toBe(false);
    expect(isValidAnthropicKeyFormat(null)).toBe(false);
    expect(isValidAnthropicKeyFormat(123)).toBe(false);
    expect(isValidAnthropicKeyFormat({})).toBe(false);
    expect(isValidAnthropicKeyFormat([])).toBe(false);
  });

  it("acts as a TypeScript type guard", () => {
    const candidate: unknown = SAMPLE_KEY;
    if (isValidAnthropicKeyFormat(candidate)) {
      // If this compiles, the guard is narrowing correctly.
      const narrowed: string = candidate;
      expect(narrowed.startsWith(ANTHROPIC_KEY_PREFIX)).toBe(true);
    }
  });

  it("ANTHROPIC_KEY_MIN_LENGTH is the prefix length plus 20", () => {
    // Pin the constant so a future edit doesn't quietly weaken validation.
    expect(ANTHROPIC_KEY_MIN_LENGTH).toBe(ANTHROPIC_KEY_PREFIX.length + 20);
  });
});
