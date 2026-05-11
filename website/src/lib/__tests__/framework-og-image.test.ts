/**
 * Unit tests for framework OG/Twitter image URL helpers.
 *
 * The file uses a minimal describe/it/expect shim so it can run both
 * under vitest and directly via `npx tsx` if needed.
 */
import {
  DEFAULT_FRAMEWORK_OG_IMAGE_ORIGIN,
  FRAMEWORK_OG_IMAGE_HEIGHT,
  FRAMEWORK_OG_IMAGE_SIZE,
  FRAMEWORK_OG_IMAGE_WIDTH,
  buildFrameworkOgImagePath,
  buildFrameworkOgImageUrl,
  extractFrameworkSlugFromFrameworkUrl,
} from "../framework-og-image";

type TestFn = () => void;
type Suite = { name: string; tests: { name: string; fn: TestFn }[] };
const suites: Suite[] = [];
let currentSuite: Suite | null = null;

function describeFallback(name: string, body: () => void) {
  currentSuite = { name, tests: [] };
  body();
  suites.push(currentSuite);
  currentSuite = null;
}

function itFallback(name: string, fn: TestFn) {
  if (!currentSuite) throw new Error("it() called outside describe()");
  currentSuite.tests.push({ name, fn });
}

function expectFallback<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) {
        throw new Error(`Expected ${String(actual)} to be ${String(expected)}`);
      }
    },
    toEqual(expected: T) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(
          `Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`,
        );
      }
    },
    toBeNull() {
      if (actual !== null) {
        throw new Error(`Expected ${String(actual)} to be null`);
      }
    },
    toBeTruthy() {
      if (!actual) throw new Error(`Expected ${String(actual)} to be truthy`);
    },
    toBeFalsy() {
      if (actual) throw new Error(`Expected ${String(actual)} to be falsy`);
    },
  };
}

const g = globalThis as unknown as {
  describe?: typeof describeFallback;
  it?: typeof itFallback;
  expect?: typeof expectFallback;
};
const describe = g.describe ?? describeFallback;
const it = g.it ?? itFallback;
const expect = g.expect ?? expectFallback;

describe("framework OG image constants", () => {
  it("uses the canonical 1200x630 summary_large_image size", () => {
    expect(FRAMEWORK_OG_IMAGE_WIDTH).toBe(1200);
    expect(FRAMEWORK_OG_IMAGE_HEIGHT).toBe(630);
    expect(FRAMEWORK_OG_IMAGE_SIZE).toEqual({
      width: 1200,
      height: 630,
    });
  });

  it("uses the canonical site origin", () => {
    expect(DEFAULT_FRAMEWORK_OG_IMAGE_ORIGIN).toBe(
      "https://www.consultthedead.com",
    );
  });
});

describe("buildFrameworkOgImagePath", () => {
  it("returns the route-segment path for a valid framework slug", () => {
    expect(buildFrameworkOgImagePath("isaac-newton")).toBe(
      "/frameworks/isaac-newton/opengraph-image",
    );
  });

  it("rejects unknown slugs and malformed path input", () => {
    expect(buildFrameworkOgImagePath("made-up-mind")).toBeNull();
    expect(buildFrameworkOgImagePath("evil/../escape")).toBeNull();
    expect(buildFrameworkOgImagePath("with space")).toBeNull();
  });

  it("trims whitespace before validation", () => {
    expect(buildFrameworkOgImagePath("  marie-curie  ")).toBe(
      "/frameworks/marie-curie/opengraph-image",
    );
  });

  it("returns null for empty and non-string input", () => {
    expect(buildFrameworkOgImagePath("")).toBeNull();
    expect(buildFrameworkOgImagePath("   ")).toBeNull();
    expect(buildFrameworkOgImagePath(undefined as unknown as string)).toBeNull();
    expect(buildFrameworkOgImagePath(null as unknown as string)).toBeNull();
  });
});

describe("buildFrameworkOgImageUrl", () => {
  it("builds an absolute URL with the default origin", () => {
    expect(buildFrameworkOgImageUrl("nikola-tesla")).toBe(
      "https://www.consultthedead.com/frameworks/nikola-tesla/opengraph-image",
    );
  });

  it("supports custom origins and trims trailing slashes", () => {
    expect(
      buildFrameworkOgImageUrl("ada-lovelace", "https://staging.example.com/"),
    ).toBe("https://staging.example.com/frameworks/ada-lovelace/opengraph-image");
    expect(buildFrameworkOgImageUrl("ada-lovelace", "consultthedead.com")).toBe(
      "https://consultthedead.com/frameworks/ada-lovelace/opengraph-image",
    );
  });

  it("returns null for invalid slugs and empty origins", () => {
    expect(buildFrameworkOgImageUrl("made-up-mind")).toBeNull();
    expect(buildFrameworkOgImageUrl("isaac-newton", "")).toBeNull();
    expect(buildFrameworkOgImageUrl("isaac-newton", "   ")).toBeNull();
  });
});

describe("extractFrameworkSlugFromFrameworkUrl", () => {
  it("extracts from a path-only framework URL", () => {
    expect(
      extractFrameworkSlugFromFrameworkUrl("/frameworks/marie-curie"),
    ).toBe("marie-curie");
  });

  it("extracts from absolute OG and Twitter image URLs", () => {
    expect(
      extractFrameworkSlugFromFrameworkUrl(
        "https://www.consultthedead.com/frameworks/isaac-newton/opengraph-image",
      ),
    ).toBe("isaac-newton");
    expect(
      extractFrameworkSlugFromFrameworkUrl(
        "https://www.consultthedead.com/frameworks/isaac-newton/twitter-image",
      ),
    ).toBe("isaac-newton");
  });

  it("normalizes bare slugs to rooted paths", () => {
    expect(extractFrameworkSlugFromFrameworkUrl("frameworks/epictetus")).toBe(
      "epictetus",
    );
  });

  it("returns null for wrong path shapes and invalid slugs", () => {
    expect(extractFrameworkSlugFromFrameworkUrl("/agora/a/abc")).toBeNull();
    expect(extractFrameworkSlugFromFrameworkUrl("/frameworks/unknown")).toBeNull();
    expect(extractFrameworkSlugFromFrameworkUrl("/frameworks/")).toBeNull();
  });

  it("returns null for malformed percent-encoding and empty input", () => {
    expect(extractFrameworkSlugFromFrameworkUrl("/frameworks/%E0%A4%A")).toBeNull();
    expect(extractFrameworkSlugFromFrameworkUrl("")).toBeNull();
    expect(extractFrameworkSlugFromFrameworkUrl("   ")).toBeNull();
    expect(
      extractFrameworkSlugFromFrameworkUrl(undefined as unknown as string),
    ).toBeNull();
  });
});

if (typeof g.expect === "undefined" && typeof process !== "undefined") {
  let failed = 0;
  for (const suite of suites) {
    for (const t of suite.tests) {
      try {
        t.fn();
      } catch (err) {
        failed++;
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`✗ ${suite.name} > ${t.name}: ${msg}`);
      }
    }
  }
  if (failed === 0) {
    console.log(
      `✓ framework-og-image: ${suites.reduce((n, s) => n + s.tests.length, 0)} tests passed`,
    );
  } else {
    process.exit(1);
  }
}
