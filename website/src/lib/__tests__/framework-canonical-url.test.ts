/**
 * Unit tests for the framework canonical URL helper.
 *
 * Acceptance coverage for task cd236b93 ("Fix framework detail page canonical
 * URL — detail pages emit homepage URL instead of route-scoped URL"):
 *   - buildFrameworkCanonicalUrl("isaac-newton") must NOT return the root URL
 *   - buildFrameworkCanonicalUrl("isaac-newton") must return the slug-scoped URL
 *
 * Run via vitest:
 *   cd website && npm run test
 */
import {
  FRAMEWORK_CANONICAL_ORIGIN,
  buildFrameworkCanonicalUrl,
} from "../framework-canonical-url";

describe("FRAMEWORK_CANONICAL_ORIGIN", () => {
  it("is the production site URL", () => {
    expect(FRAMEWORK_CANONICAL_ORIGIN).toBe("https://www.consultthedead.com");
  });
});

describe("buildFrameworkCanonicalUrl — slug-scoped canonical (core acceptance)", () => {
  it("emits a slug-scoped URL, not the root URL", () => {
    const url = buildFrameworkCanonicalUrl("isaac-newton");
    expect(url).not.toBe("https://www.consultthedead.com");
    expect(url).not.toBe("https://www.consultthedead.com/");
  });

  it("returns the exact route-scoped canonical for isaac-newton", () => {
    expect(buildFrameworkCanonicalUrl("isaac-newton")).toBe(
      "https://www.consultthedead.com/frameworks/isaac-newton",
    );
  });

  it("returns route-scoped canonicals for other allowed slugs", () => {
    expect(buildFrameworkCanonicalUrl("marie-curie")).toBe(
      "https://www.consultthedead.com/frameworks/marie-curie",
    );
    expect(buildFrameworkCanonicalUrl("nikola-tesla")).toBe(
      "https://www.consultthedead.com/frameworks/nikola-tesla",
    );
    expect(buildFrameworkCanonicalUrl("marcus-aurelius")).toBe(
      "https://www.consultthedead.com/frameworks/marcus-aurelius",
    );
  });
});

describe("buildFrameworkCanonicalUrl — origin override", () => {
  it("respects a custom origin", () => {
    expect(
      buildFrameworkCanonicalUrl("isaac-newton", "https://staging.example.com"),
    ).toBe("https://staging.example.com/frameworks/isaac-newton");
  });

  it("strips trailing slashes from the origin", () => {
    expect(
      buildFrameworkCanonicalUrl("isaac-newton", "https://example.com/"),
    ).toBe("https://example.com/frameworks/isaac-newton");
    expect(
      buildFrameworkCanonicalUrl("isaac-newton", "https://example.com///"),
    ).toBe("https://example.com/frameworks/isaac-newton");
  });

  it("auto-prepends https:// when the origin has no scheme", () => {
    expect(
      buildFrameworkCanonicalUrl("isaac-newton", "consultthedead.com"),
    ).toBe("https://consultthedead.com/frameworks/isaac-newton");
  });

  it("preserves an http:// origin (local dev)", () => {
    expect(
      buildFrameworkCanonicalUrl("isaac-newton", "http://localhost:3000"),
    ).toBe("http://localhost:3000/frameworks/isaac-newton");
  });
});

describe("buildFrameworkCanonicalUrl — invalid inputs return null", () => {
  it("returns null for an unknown slug", () => {
    expect(buildFrameworkCanonicalUrl("made-up-mind")).toBeNull();
    expect(buildFrameworkCanonicalUrl("albert-einstein")).toBeNull();
  });

  it("returns null for empty / whitespace-only slugs", () => {
    expect(buildFrameworkCanonicalUrl("")).toBeNull();
    expect(buildFrameworkCanonicalUrl("   ")).toBeNull();
  });

  it("returns null for non-string slug input", () => {
    expect(buildFrameworkCanonicalUrl(undefined as unknown as string)).toBeNull();
    expect(buildFrameworkCanonicalUrl(null as unknown as string)).toBeNull();
    expect(buildFrameworkCanonicalUrl(42 as unknown as string)).toBeNull();
  });

  it("returns null when the origin is empty after normalization", () => {
    expect(buildFrameworkCanonicalUrl("isaac-newton", "")).toBeNull();
    expect(buildFrameworkCanonicalUrl("isaac-newton", "   ")).toBeNull();
    expect(buildFrameworkCanonicalUrl("isaac-newton", "/")).toBeNull();
  });
});
