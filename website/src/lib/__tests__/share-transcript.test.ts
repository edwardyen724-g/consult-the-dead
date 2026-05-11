/**
 * Regression coverage for share-transcript.ts.
 *
 * Goal: lock the generated share text, canonical URL, and attribution
 * formatting so accidental changes to buildTranscriptShareText surface
 * immediately in CI.
 *
 * Coverage target: ≥95% lines and branches on share-transcript.ts.
 */
import { describe, it, expect } from "vitest";

import {
  ATTRIBUTION_LINE,
  EXCERPT_MAX_CHARS,
  SITE_ORIGIN,
  buildTranscriptShareText,
} from "../share-transcript";

// ─── constants ────────────────────────────────────────────────────────────────

describe("module constants", () => {
  it("SITE_ORIGIN is the canonical production domain", () => {
    expect(SITE_ORIGIN).toBe("https://www.consultthedead.com");
  });

  it("ATTRIBUTION_LINE matches the expected attribution format", () => {
    expect(ATTRIBUTION_LINE).toBe("— via Consult The Dead");
  });

  it("EXCERPT_MAX_CHARS is set to 280 for social-friendly length", () => {
    expect(EXCERPT_MAX_CHARS).toBe(280);
  });
});

// ─── share text format ────────────────────────────────────────────────────────

describe("buildTranscriptShareText — share text format", () => {
  it("includes the title, excerpt, canonical URL, and attribution in order", () => {
    const result = buildTranscriptShareText({
      title: "Should I raise VC or bootstrap?",
      excerpt: "Pursue what you love and the money will follow.",
      shareId: "k7n3pqx9rt",
    });

    const lines = result.text.split("\n");

    // Line 0: title
    expect(lines[0]).toBe(
      "Consult The Dead — Should I raise VC or bootstrap?",
    );
    // Blank separator
    expect(lines[1]).toBe("");
    // Excerpt wrapped in quotes
    expect(lines[2]).toBe(
      '"Pursue what you love and the money will follow."',
    );
    // Blank separator
    expect(lines[3]).toBe("");
    // Canonical URL
    expect(lines[4]).toBe(
      `${SITE_ORIGIN}/agora/a/k7n3pqx9rt`,
    );
    // Blank separator
    expect(lines[5]).toBe("");
    // Attribution
    expect(lines[6]).toBe(ATTRIBUTION_LINE);
  });

  it("wraps the excerpt in double-quote marks", () => {
    const { text } = buildTranscriptShareText({
      title: "Test",
      excerpt: "A notable quote from a historical mind.",
      shareId: "abc23fghjk",
    });

    expect(text).toContain('"A notable quote from a historical mind."');
  });

  it("always ends with the attribution line", () => {
    const { text } = buildTranscriptShareText({
      title: "Any topic",
      excerpt: "Any excerpt",
      shareId: "k7n3pqx9rt",
    });

    const lines = text.split("\n");
    expect(lines[lines.length - 1]).toBe(ATTRIBUTION_LINE);
  });
});

// ─── canonical URL construction ───────────────────────────────────────────────

describe("buildTranscriptShareText — canonical URL", () => {
  it("builds the canonical URL using the production origin and agon path", () => {
    const { canonicalUrl } = buildTranscriptShareText({
      title: "Test",
      shareId: "k7n3pqx9rt",
    });

    expect(canonicalUrl).toBe("https://www.consultthedead.com/agora/a/k7n3pqx9rt");
  });

  it("uses the SITE_ORIGIN constant as the domain", () => {
    const { canonicalUrl } = buildTranscriptShareText({
      shareId: "abc23fghjk",
    });

    expect(canonicalUrl.startsWith(SITE_ORIGIN)).toBe(true);
  });

  it("accepts a custom origin override for previews and tests", () => {
    const { canonicalUrl, text } = buildTranscriptShareText({
      title: "Test",
      shareId: "k7n3pqx9rt",
      origin: "https://preview.consultthedead.com",
    });

    expect(canonicalUrl).toBe(
      "https://preview.consultthedead.com/agora/a/k7n3pqx9rt",
    );
    expect(text).toContain("https://preview.consultthedead.com/agora/a/k7n3pqx9rt");
  });

  it("strips trailing slashes from a custom origin", () => {
    const { canonicalUrl } = buildTranscriptShareText({
      shareId: "k7n3pqx9rt",
      origin: "https://preview.consultthedead.com/",
    });

    expect(canonicalUrl).toBe(
      "https://preview.consultthedead.com/agora/a/k7n3pqx9rt",
    );
    // No double-slash in the path.
    expect(canonicalUrl).not.toContain("//agora");
  });
});

// ─── attribution line format ──────────────────────────────────────────────────

describe("buildTranscriptShareText — attribution", () => {
  it("returns the ATTRIBUTION_LINE constant in the result object", () => {
    const { attribution } = buildTranscriptShareText({
      title: "Test",
      shareId: "k7n3pqx9rt",
    });

    expect(attribution).toBe(ATTRIBUTION_LINE);
    expect(attribution).toBe("— via Consult The Dead");
  });

  it("includes the attribution line in the formatted text", () => {
    const { text } = buildTranscriptShareText({
      title: "Test",
      excerpt: "An excerpt.",
      shareId: "k7n3pqx9rt",
    });

    expect(text).toContain(ATTRIBUTION_LINE);
  });

  it("includes attribution even when title, excerpt, and shareId are all absent", () => {
    const { text, attribution } = buildTranscriptShareText({});

    expect(text).toContain(ATTRIBUTION_LINE);
    expect(attribution).toBe(ATTRIBUTION_LINE);
  });
});

// ─── edge cases ───────────────────────────────────────────────────────────────

describe("buildTranscriptShareText — edge cases: missing title", () => {
  it("falls back to the default title when title is absent", () => {
    const { title, text } = buildTranscriptShareText({
      excerpt: "A quote.",
      shareId: "k7n3pqx9rt",
    });

    expect(title).toBe("Consult The Dead");
    expect(text.startsWith("Consult The Dead")).toBe(true);
    // Should NOT include the em-dash separator when there is no topic.
    expect(text.split("\n")[0]).toBe("Consult The Dead");
  });

  it("falls back to the default title when title is null", () => {
    const { title } = buildTranscriptShareText({ title: null });

    expect(title).toBe("Consult The Dead");
  });

  it("falls back to the default title when title is an empty string", () => {
    const { title } = buildTranscriptShareText({ title: "" });

    expect(title).toBe("Consult The Dead");
  });

  it("falls back to the default title when title is whitespace-only", () => {
    const { title } = buildTranscriptShareText({ title: "   " });

    expect(title).toBe("Consult The Dead");
  });

  it("still includes excerpt and URL when only title is missing", () => {
    const { text } = buildTranscriptShareText({
      excerpt: "A notable thought.",
      shareId: "k7n3pqx9rt",
    });

    expect(text).toContain('"A notable thought."');
    expect(text).toContain(`${SITE_ORIGIN}/agora/a/k7n3pqx9rt`);
  });
});

describe("buildTranscriptShareText — edge cases: missing excerpt", () => {
  it("omits the excerpt line when excerpt is absent", () => {
    const { text } = buildTranscriptShareText({
      title: "Should I raise VC or bootstrap?",
      shareId: "k7n3pqx9rt",
    });

    const lines = text.split("\n");
    // Without an excerpt the structure should be:
    // title → blank → URL → blank → attribution
    expect(lines[0]).toBe(
      "Consult The Dead — Should I raise VC or bootstrap?",
    );
    expect(lines[1]).toBe("");
    expect(lines[2]).toBe(`${SITE_ORIGIN}/agora/a/k7n3pqx9rt`);
    expect(lines[3]).toBe("");
    expect(lines[4]).toBe(ATTRIBUTION_LINE);
  });

  it("omits the excerpt line when excerpt is null", () => {
    const { text } = buildTranscriptShareText({
      title: "Test",
      excerpt: null,
      shareId: "k7n3pqx9rt",
    });

    expect(text).not.toContain('"');
  });

  it("omits the excerpt line when excerpt is an empty string", () => {
    const { text } = buildTranscriptShareText({
      title: "Test",
      excerpt: "",
      shareId: "k7n3pqx9rt",
    });

    expect(text).not.toContain('"');
  });

  it("omits the excerpt line when excerpt is whitespace-only", () => {
    const { text } = buildTranscriptShareText({
      title: "Test",
      excerpt: "   ",
      shareId: "k7n3pqx9rt",
    });

    expect(text).not.toContain('"');
  });

  it("still includes title, URL, and attribution when only excerpt is missing", () => {
    const { text } = buildTranscriptShareText({
      title: "Should I raise VC or bootstrap?",
      shareId: "k7n3pqx9rt",
    });

    expect(text).toContain(
      "Consult The Dead — Should I raise VC or bootstrap?",
    );
    expect(text).toContain(`${SITE_ORIGIN}/agora/a/k7n3pqx9rt`);
    expect(text).toContain(ATTRIBUTION_LINE);
  });
});

describe("buildTranscriptShareText — edge cases: missing shareId", () => {
  it("omits the URL line when shareId is absent", () => {
    const { canonicalUrl, text } = buildTranscriptShareText({
      title: "Test",
      excerpt: "An excerpt.",
    });

    expect(canonicalUrl).toBe("");
    expect(text).not.toContain("https://");
  });

  it("omits the URL line when shareId is null", () => {
    const { canonicalUrl } = buildTranscriptShareText({
      title: "Test",
      shareId: null,
    });

    expect(canonicalUrl).toBe("");
  });

  it("still includes title, excerpt, and attribution when only shareId is missing", () => {
    const { text } = buildTranscriptShareText({
      title: "Test",
      excerpt: "An excerpt.",
    });

    expect(text).toContain("Consult The Dead — Test");
    expect(text).toContain('"An excerpt."');
    expect(text).toContain(ATTRIBUTION_LINE);
  });
});

describe("buildTranscriptShareText — excerpt truncation", () => {
  it("truncates a very long excerpt at EXCERPT_MAX_CHARS", () => {
    const longExcerpt = "a very important word ".repeat(50).trim();
    const { text } = buildTranscriptShareText({
      title: "Test",
      excerpt: longExcerpt,
      shareId: "k7n3pqx9rt",
    });

    // Extract the excerpt line (second non-empty block).
    const excerptLine = text.split("\n").find((l) => l.startsWith('"')) ?? "";
    // Strip surrounding quotes before measuring.
    const innerText = excerptLine.slice(1, -1);
    // The inner text (before the closing quote) should not exceed the cap.
    // Account for the ellipsis character (1 char) added at truncation.
    expect(innerText.length).toBeLessThanOrEqual(EXCERPT_MAX_CHARS);
  });

  it("appends a Unicode ellipsis when truncated", () => {
    const longExcerpt = "word ".repeat(100).trim();
    const { text } = buildTranscriptShareText({
      title: "Test",
      excerpt: longExcerpt,
      shareId: "k7n3pqx9rt",
    });

    expect(text).toContain("…");
  });

  it("does not truncate excerpts within the limit", () => {
    const shortExcerpt = "A short quote.";
    const { text } = buildTranscriptShareText({
      title: "Test",
      excerpt: shortExcerpt,
      shareId: "k7n3pqx9rt",
    });

    expect(text).toContain(`"${shortExcerpt}"`);
    expect(text).not.toContain("…");
  });

  it("falls back to hard-slice when no whitespace exists near the truncation point", () => {
    // A single very long token with no spaces — lastSpace will be -1 (< max/2),
    // so the slice fallback branch fires.
    const noSpaceExcerpt = "x".repeat(400);
    const { text } = buildTranscriptShareText({
      title: "Test",
      excerpt: noSpaceExcerpt,
      shareId: "k7n3pqx9rt",
    });

    expect(text).toContain("…");
    const excerptLine = text.split("\n").find((l) => l.startsWith('"')) ?? "";
    const innerText = excerptLine.slice(1, -1);
    expect(innerText.length).toBeLessThanOrEqual(EXCERPT_MAX_CHARS);
  });
});

describe("buildTranscriptShareText — both title and excerpt absent", () => {
  it("degrades gracefully to default title + attribution only", () => {
    const { text, title, canonicalUrl, attribution } = buildTranscriptShareText(
      { shareId: "k7n3pqx9rt" },
    );

    expect(title).toBe("Consult The Dead");
    expect(text).toContain("Consult The Dead");
    expect(text).toContain(`${SITE_ORIGIN}/agora/a/k7n3pqx9rt`);
    expect(text).toContain(ATTRIBUTION_LINE);
    expect(attribution).toBe(ATTRIBUTION_LINE);
    expect(canonicalUrl).toBe(`${SITE_ORIGIN}/agora/a/k7n3pqx9rt`);
  });

  it("degrades to just title + attribution when all optional fields are absent", () => {
    const { text } = buildTranscriptShareText({});

    expect(text).toContain("Consult The Dead");
    expect(text).toContain(ATTRIBUTION_LINE);
    expect(text).not.toContain("https://");
    expect(text).not.toContain('"');
  });
});
