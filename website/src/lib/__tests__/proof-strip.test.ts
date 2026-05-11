import { describe, expect, it } from "vitest";

import {
  formatProofStripData,
  PROOF_STRIP_FALLBACK,
  type ProofStripData,
} from "../proof-strip";

// ──────────────────────────────────────────────────────────────────────────
//  PROOF_STRIP_FALLBACK
// ──────────────────────────────────────────────────────────────────────────

describe("PROOF_STRIP_FALLBACK", () => {
  it("has subscriberCount of 500", () => {
    expect(PROOF_STRIP_FALLBACK.subscriberCount).toBe(500);
  });

  it("has agoraSessions of 1000", () => {
    expect(PROOF_STRIP_FALLBACK.agoraSessions).toBe(1000);
  });

  it("has a non-empty tagline mentioning founders", () => {
    expect(typeof PROOF_STRIP_FALLBACK.tagline).toBe("string");
    expect((PROOF_STRIP_FALLBACK.tagline ?? "").length).toBeGreaterThan(0);
    expect(PROOF_STRIP_FALLBACK.tagline).toMatch(/founders/i);
  });

  it("produces 3 formatted items when passed through formatProofStripData", () => {
    const items = formatProofStripData(PROOF_STRIP_FALLBACK);
    expect(items).toHaveLength(3);
  });
});

// ──────────────────────────────────────────────────────────────────────────
//  formatProofStripData — full data
// ──────────────────────────────────────────────────────────────────────────

describe("formatProofStripData — full data", () => {
  const full: ProofStripData = {
    subscriberCount: 500,
    agoraSessions: 1000,
    tagline: "Join founders using historical minds to make better decisions",
  };

  it("returns an array of 3 items", () => {
    expect(formatProofStripData(full)).toHaveLength(3);
  });

  it("formats subscriberCount as '500+' with label 'founders subscribed'", () => {
    const items = formatProofStripData(full);
    const item = items.find((i) => i.label === "founders subscribed");
    expect(item).toBeDefined();
    expect(item!.value).toBe("500+");
  });

  it("formats agoraSessions as '1000+' with label 'agon sessions run'", () => {
    const items = formatProofStripData(full);
    const item = items.find((i) => i.label === "agon sessions run");
    expect(item).toBeDefined();
    expect(item!.value).toBe("1000+");
  });

  it("includes tagline with label 'tagline'", () => {
    const items = formatProofStripData(full);
    const item = items.find((i) => i.label === "tagline");
    expect(item).toBeDefined();
    expect(item!.value).toBe(full.tagline);
  });

  it("preserves ordering: subscriberCount, agoraSessions, tagline", () => {
    const items = formatProofStripData(full);
    expect(items[0].label).toBe("founders subscribed");
    expect(items[1].label).toBe("agon sessions run");
    expect(items[2].label).toBe("tagline");
  });
});

// ──────────────────────────────────────────────────────────────────────────
//  formatProofStripData — partial data
// ──────────────────────────────────────────────────────────────────────────

describe("formatProofStripData — partial data", () => {
  it("omits agoraSessions and tagline when only subscriberCount provided", () => {
    const items = formatProofStripData({ subscriberCount: 250 });
    expect(items).toHaveLength(1);
    expect(items[0].label).toBe("founders subscribed");
    expect(items[0].value).toBe("250+");
  });

  it("omits subscriberCount and tagline when only agoraSessions provided", () => {
    const items = formatProofStripData({ agoraSessions: 750 });
    expect(items).toHaveLength(1);
    expect(items[0].label).toBe("agon sessions run");
    expect(items[0].value).toBe("750+");
  });

  it("omits subscriberCount and agoraSessions when only tagline provided", () => {
    const items = formatProofStripData({ tagline: "Some tagline" });
    expect(items).toHaveLength(1);
    expect(items[0].label).toBe("tagline");
    expect(items[0].value).toBe("Some tagline");
  });

  it("handles subscriberCount + agoraSessions without tagline", () => {
    const items = formatProofStripData({ subscriberCount: 100, agoraSessions: 200 });
    expect(items).toHaveLength(2);
    expect(items[0].label).toBe("founders subscribed");
    expect(items[1].label).toBe("agon sessions run");
  });

  it("handles tagline + subscriberCount without agoraSessions", () => {
    const items = formatProofStripData({ subscriberCount: 50, tagline: "Hello" });
    expect(items).toHaveLength(2);
    expect(items[0].label).toBe("founders subscribed");
    expect(items[1].label).toBe("tagline");
  });
});

// ──────────────────────────────────────────────────────────────────────────
//  formatProofStripData — empty / zero input
// ──────────────────────────────────────────────────────────────────────────

describe("formatProofStripData — empty/zero input", () => {
  it("returns empty array for empty object", () => {
    expect(formatProofStripData({})).toHaveLength(0);
  });

  it("includes subscriberCount=0 (zero is valid)", () => {
    const items = formatProofStripData({ subscriberCount: 0 });
    expect(items).toHaveLength(1);
    expect(items[0].value).toBe("0+");
  });

  it("includes agoraSessions=0 (zero is valid)", () => {
    const items = formatProofStripData({ agoraSessions: 0 });
    expect(items).toHaveLength(1);
    expect(items[0].value).toBe("0+");
  });

  it("omits tagline when empty string", () => {
    const items = formatProofStripData({ tagline: "" });
    expect(items).toHaveLength(0);
  });

  it("omits tagline when whitespace-only string", () => {
    const items = formatProofStripData({ tagline: "   " });
    expect(items).toHaveLength(0);
  });
});

// ──────────────────────────────────────────────────────────────────────────
//  formatProofStripData — defensive: invalid numeric input
// ──────────────────────────────────────────────────────────────────────────

describe("formatProofStripData — invalid numeric input (silently omitted)", () => {
  it("omits subscriberCount when negative", () => {
    const items = formatProofStripData({ subscriberCount: -1, agoraSessions: 100 });
    expect(items.find((i) => i.label === "founders subscribed")).toBeUndefined();
    expect(items.find((i) => i.label === "agon sessions run")).toBeDefined();
  });

  it("omits agoraSessions when negative", () => {
    const items = formatProofStripData({ subscriberCount: 100, agoraSessions: -5 });
    expect(items.find((i) => i.label === "agon sessions run")).toBeUndefined();
    expect(items.find((i) => i.label === "founders subscribed")).toBeDefined();
  });

  it("omits subscriberCount when NaN", () => {
    const items = formatProofStripData({ subscriberCount: Number.NaN });
    expect(items.find((i) => i.label === "founders subscribed")).toBeUndefined();
  });

  it("omits subscriberCount when Infinity", () => {
    const items = formatProofStripData({ subscriberCount: Infinity });
    expect(items.find((i) => i.label === "founders subscribed")).toBeUndefined();
  });

  it("omits agoraSessions when NaN", () => {
    const items = formatProofStripData({ agoraSessions: Number.NaN });
    expect(items.find((i) => i.label === "agon sessions run")).toBeUndefined();
  });
});

// ──────────────────────────────────────────────────────────────────────────
//  formatProofStripData — value shape contract
// ──────────────────────────────────────────────────────────────────────────

describe("formatProofStripData — value shape", () => {
  it("always appends '+' to numeric values", () => {
    const items = formatProofStripData({ subscriberCount: 42, agoraSessions: 99 });
    for (const item of items) {
      if (item.label !== "tagline") {
        expect(item.value).toMatch(/\d+\+$/);
      }
    }
  });

  it("returns plain objects with exactly 'label' and 'value' keys", () => {
    const items = formatProofStripData(PROOF_STRIP_FALLBACK);
    for (const item of items) {
      expect(Object.keys(item).sort()).toEqual(["label", "value"]);
    }
  });

  it("returns a fresh array on each call", () => {
    const a = formatProofStripData(PROOF_STRIP_FALLBACK);
    const b = formatProofStripData(PROOF_STRIP_FALLBACK);
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});
