/**
 * Unit tests for the OG image URL helpers (capsule bdcb79ca, task fd349805).
 *
 * Run via vitest:
 *   cd website && npm run test
 *
 * Or directly via tsx (uses the same describe/it shim pattern as
 * src/lib/share-id.test.ts):
 *   npx tsx website/src/lib/og-image-url.test.ts
 */
import {
  DEFAULT_OG_IMAGE_ORIGIN,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  buildOgImagePath,
  buildOgImageUrl,
  extractShareIdFromAgoraUrl,
} from "./og-image-url";

/* ── describe/it/expect shim ────────────────────────────────────── */

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
    toBeNull() {
      if (actual !== null)
        throw new Error(`Expected ${String(actual)} to be null`);
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

/* ── constants ───────────────────────────────────────────────────── */

describe("OG image constants", () => {
  it("uses 1200x630 (Twitter / Facebook recommended summary_large_image)", () => {
    expect(OG_IMAGE_WIDTH).toBe(1200);
    expect(OG_IMAGE_HEIGHT).toBe(630);
  });

  it("uses the canonical site origin", () => {
    expect(DEFAULT_OG_IMAGE_ORIGIN).toBe("https://www.consultthedead.com");
  });
});

/* ── buildOgImagePath ────────────────────────────────────────────── */

describe("buildOgImagePath", () => {
  it("returns the route-segment path for a valid slug", () => {
    expect(buildOgImagePath("abhishek-chakravarty")).toBe(
      "/agora/a/abhishek-chakravarty/opengraph-image",
    );
  });

  it("accepts the share-id alphabet (lowercase + digits + hyphen + underscore)", () => {
    expect(buildOgImagePath("a1b2c3d4")).toBe(
      "/agora/a/a1b2c3d4/opengraph-image",
    );
    expect(buildOgImagePath("snake_case_ok")).toBe(
      "/agora/a/snake_case_ok/opengraph-image",
    );
    expect(buildOgImagePath("UPPER-allowed")).toBe(
      "/agora/a/UPPER-allowed/opengraph-image",
    );
  });

  it("trims surrounding whitespace before validation", () => {
    expect(buildOgImagePath("   ali-rohde   ")).toBe(
      "/agora/a/ali-rohde/opengraph-image",
    );
  });

  it("returns null for empty / whitespace-only input", () => {
    expect(buildOgImagePath("")).toBeNull();
    expect(buildOgImagePath("    ")).toBeNull();
  });

  it("returns null for non-string input", () => {
    expect(buildOgImagePath(undefined as unknown as string)).toBeNull();
    expect(buildOgImagePath(null as unknown as string)).toBeNull();
    expect(buildOgImagePath(42 as unknown as string)).toBeNull();
  });

  it("returns null for inputs containing path separators or unsafe chars", () => {
    expect(buildOgImagePath("evil/../escape")).toBeNull();
    expect(buildOgImagePath("with space")).toBeNull();
    expect(buildOgImagePath("question?mark")).toBeNull();
    expect(buildOgImagePath("hash#frag")).toBeNull();
    expect(buildOgImagePath("dot.in.id")).toBeNull();
  });
});

/* ── buildOgImageUrl ─────────────────────────────────────────────── */

describe("buildOgImageUrl", () => {
  it("returns the absolute URL using the default origin", () => {
    expect(buildOgImageUrl("abhishek-chakravarty")).toBe(
      "https://www.consultthedead.com/agora/a/abhishek-chakravarty/opengraph-image",
    );
  });

  it("respects an explicit origin", () => {
    expect(buildOgImageUrl("ali-rohde", "https://staging.example.com")).toBe(
      "https://staging.example.com/agora/a/ali-rohde/opengraph-image",
    );
  });

  it("strips a trailing slash from the supplied origin", () => {
    expect(buildOgImageUrl("ali-rohde", "https://example.com/")).toBe(
      "https://example.com/agora/a/ali-rohde/opengraph-image",
    );
    expect(buildOgImageUrl("ali-rohde", "https://example.com///")).toBe(
      "https://example.com/agora/a/ali-rohde/opengraph-image",
    );
  });

  it("auto-prepends https:// when the origin is missing a scheme", () => {
    expect(buildOgImageUrl("ali-rohde", "consultthedead.com")).toBe(
      "https://consultthedead.com/agora/a/ali-rohde/opengraph-image",
    );
  });

  it("preserves an http:// origin verbatim (for local dev)", () => {
    expect(buildOgImageUrl("ali-rohde", "http://localhost:3000")).toBe(
      "http://localhost:3000/agora/a/ali-rohde/opengraph-image",
    );
  });

  it("returns null when the share id fails validation", () => {
    expect(buildOgImageUrl("evil/../escape")).toBeNull();
    expect(buildOgImageUrl("")).toBeNull();
  });

  it("returns null when the origin is empty after normalization", () => {
    expect(buildOgImageUrl("ali-rohde", "")).toBeNull();
    expect(buildOgImageUrl("ali-rohde", "    ")).toBeNull();
    expect(buildOgImageUrl("ali-rohde", "/")).toBeNull();
  });
});

/* ── extractShareIdFromAgoraUrl ──────────────────────────────────── */

describe("extractShareIdFromAgoraUrl", () => {
  it("extracts from a path-only string", () => {
    expect(extractShareIdFromAgoraUrl("/agora/a/abhishek-chakravarty")).toBe(
      "abhishek-chakravarty",
    );
  });

  it("extracts from an absolute URL", () => {
    expect(
      extractShareIdFromAgoraUrl(
        "https://www.consultthedead.com/agora/a/ali-rohde",
      ),
    ).toBe("ali-rohde");
  });

  it("extracts from the OG image route variant", () => {
    expect(
      extractShareIdFromAgoraUrl(
        "https://www.consultthedead.com/agora/a/ali-rohde/opengraph-image",
      ),
    ).toBe("ali-rohde");
  });

  it("strips a trailing slash before matching", () => {
    expect(extractShareIdFromAgoraUrl("/agora/a/ali-rohde/")).toBe("ali-rohde");
  });

  it("decodes URL-encoded share ids", () => {
    expect(extractShareIdFromAgoraUrl("/agora/a/abhishek%2Dchakravarty")).toBe(
      "abhishek-chakravarty",
    );
  });

  it("normalizes a bare slug to a path-rooted match", () => {
    expect(extractShareIdFromAgoraUrl("agora/a/ali-rohde")).toBe("ali-rohde");
  });

  it("returns null for the wrong path shape", () => {
    expect(extractShareIdFromAgoraUrl("/library/abc")).toBeNull();
    expect(extractShareIdFromAgoraUrl("/agora/something-else")).toBeNull();
    expect(extractShareIdFromAgoraUrl("/")).toBeNull();
    expect(extractShareIdFromAgoraUrl("/agora/a/")).toBeNull();
  });

  it("returns null for a share id that fails the alphabet check after decoding", () => {
    expect(extractShareIdFromAgoraUrl("/agora/a/with%20space")).toBeNull();
    expect(
      extractShareIdFromAgoraUrl("/agora/a/" + encodeURIComponent("evil/x")),
    ).toBeNull();
  });

  it("returns null for malformed percent-encoding", () => {
    // `%E0%A4%A` is an incomplete escape — decodeURIComponent will throw.
    expect(extractShareIdFromAgoraUrl("/agora/a/%E0%A4%A")).toBeNull();
  });

  it("returns null for non-string / empty / whitespace inputs", () => {
    expect(extractShareIdFromAgoraUrl("")).toBeNull();
    expect(extractShareIdFromAgoraUrl("   ")).toBeNull();
    expect(extractShareIdFromAgoraUrl(undefined as unknown as string)).toBeNull();
    expect(extractShareIdFromAgoraUrl(null as unknown as string)).toBeNull();
  });
});

/* ── Direct-run harness ──────────────────────────────────────────── */

if (typeof g.expect === "undefined" && typeof process !== "undefined") {
  let failed = 0;
  let passed = 0;
  for (const suite of suites) {
    for (const t of suite.tests) {
      try {
        t.fn();
        passed++;
      } catch (err) {
        failed++;
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`✗ ${suite.name} > ${t.name}: ${msg}`);
      }
    }
  }
  if (failed === 0) {
    console.log(`✓ og-image-url: ${passed} tests passed`);
  } else {
    console.error(`${failed} test(s) failed (${passed} passed)`);
    process.exit(1);
  }
}
