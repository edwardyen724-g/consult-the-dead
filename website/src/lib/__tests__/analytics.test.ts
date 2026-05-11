/**
 * Unit tests for the analytics.ts helper.
 *
 * Written in vitest-compatible style. The vitest framework lands in a
 * sibling capsule (51439f49); until then the file can be executed
 * directly via:
 *
 *     npx tsx website/src/lib/__tests__/analytics.test.ts
 *
 * The shim at the bottom mirrors the share-id.test.ts pattern: when no
 * `expect` global is present, it walks the registered suites and exits
 * non-zero on any failure.
 *
 * Coverage targets (capsule acceptance §1):
 *   - no-ops outside production
 *   - returns false (does NOT throw) when @vercel/analytics is missing
 *   - returns true and forwards args when in production with a working track()
 *   - drops `undefined` props before forwarding
 *   - never surfaces a thrown analytics error to the caller
 */
import {
  trackEvent,
  _setVercelTrackLoaderForTests,
  type AnalyticsPropValue,
} from '../analytics';

type TestFn = () => void | Promise<void>;
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
  if (!currentSuite) throw new Error('it() called outside describe()');
  currentSuite.tests.push({ name, fn });
}
function expectFallback<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) {
        throw new Error(`Expected ${String(actual)} to be ${String(expected)}`);
      }
    },
    toEqual(expected: unknown) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(
          `Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`,
        );
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

const originalNodeEnv = process.env.NODE_ENV;

function setNodeEnv(value: string | undefined) {
  if (value === undefined) {
    delete (process.env as Record<string, string | undefined>).NODE_ENV;
  } else {
    (process.env as Record<string, string | undefined>).NODE_ENV = value;
  }
}

function restore() {
  _setVercelTrackLoaderForTests(null);
  setNodeEnv(originalNodeEnv);
}

describe('trackEvent (analytics.ts)', () => {
  it('returns false in test/dev environments and never loads @vercel/analytics', async () => {
    setNodeEnv('test');
    let loaded = false;
    _setVercelTrackLoaderForTests(async () => {
      loaded = true;
      return null;
    });
    const result = await trackEvent('paid_subscription', { plan: 'monthly' });
    expect(result).toBe(false);
    // Helper must short-circuit before attempting to load the dep.
    expect(loaded).toBe(false);
    restore();
  });

  it('returns false when the @vercel/analytics module cannot be loaded', async () => {
    setNodeEnv('production');
    _setVercelTrackLoaderForTests(async () => null);
    const result = await trackEvent('paid_subscription', { plan: 'annual' });
    expect(result).toBe(false);
    restore();
  });

  it('forwards event name and props when production + dep available', async () => {
    setNodeEnv('production');
    let captured: { name: string; props?: Record<string, AnalyticsPropValue> } | null =
      null;
    _setVercelTrackLoaderForTests(async () => async (name, props) => {
      captured = { name, props };
    });
    const result = await trackEvent('paid_subscription', {
      plan: 'annual',
      utm_campaign: 'launch',
      utm_content: 'pricing-card',
    });
    expect(result).toBe(true);
    expect(captured !== null).toBe(true);
    expect(captured!.name).toBe('paid_subscription');
    expect(JSON.stringify(captured!.props)).toBe(
      JSON.stringify({
        plan: 'annual',
        utm_campaign: 'launch',
        utm_content: 'pricing-card',
      }),
    );
    restore();
  });

  it('drops undefined props before forwarding (no string "undefined" in dashboards)', async () => {
    setNodeEnv('production');
    let captured: Record<string, AnalyticsPropValue> | undefined;
    _setVercelTrackLoaderForTests(async () => async (_name, props) => {
      captured = props;
    });
    const result = await trackEvent('paid_subscription', {
      plan: 'monthly',
      utm_campaign: undefined,
      utm_content: undefined,
    });
    expect(result).toBe(true);
    expect(JSON.stringify(captured)).toBe(JSON.stringify({ plan: 'monthly' }));
    restore();
  });

  it('omits the props arg entirely when every prop is undefined', async () => {
    setNodeEnv('production');
    let receivedArgsLength = -1;
    _setVercelTrackLoaderForTests(
      async () =>
        async (...args: unknown[]) => {
          receivedArgsLength = args.length;
        },
    );
    const result = await trackEvent('paid_subscription', {
      utm_campaign: undefined,
      utm_content: undefined,
    });
    expect(result).toBe(true);
    expect(receivedArgsLength).toBe(1);
    restore();
  });

  it('swallows analytics errors and returns false (never throws to caller)', async () => {
    setNodeEnv('production');
    _setVercelTrackLoaderForTests(async () => async () => {
      throw new Error('vercel-analytics-down');
    });
    let threw = false;
    let result = true;
    try {
      result = await trackEvent('paid_subscription', { plan: 'monthly' });
    } catch {
      threw = true;
    }
    expect(threw).toBe(false);
    expect(result).toBe(false);
    restore();
  });

  it('returns false on empty/invalid event name without loading the dep', async () => {
    setNodeEnv('production');
    let loaded = false;
    _setVercelTrackLoaderForTests(async () => {
      loaded = true;
      return null;
    });
    const result = await trackEvent('', { plan: 'monthly' });
    expect(result).toBe(false);
    expect(loaded).toBe(false);
    restore();
  });

  it('handles missing props arg gracefully (single-arg call to track)', async () => {
    setNodeEnv('production');
    let captured: { name: string; argsLength: number } | null = null;
    _setVercelTrackLoaderForTests(
      async () =>
        async (name: string, ...rest: unknown[]) => {
          // Arrow functions don't bind `arguments`, so use the rest array
          // length to count what the helper actually forwarded.
          captured = { name, argsLength: 1 + rest.length };
        },
    );
    const result = await trackEvent('paid_subscription');
    expect(result).toBe(true);
    expect(captured!.name).toBe('paid_subscription');
    // No props arg should have been passed.
    expect(captured!.argsLength).toBe(1);
    restore();
  });
});

// Direct-execution shim. No-op under vitest (which uses its own runner).
if (typeof g.expect === 'undefined' && typeof process !== 'undefined') {
  (async () => {
    let failed = 0;
    let total = 0;
    for (const suite of suites) {
      for (const t of suite.tests) {
        total++;
        try {
          await t.fn();
        } catch (err) {
          failed++;
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`✗ ${suite.name} > ${t.name}: ${msg}`);
        }
      }
    }
    if (failed === 0) {
      console.log(`✓ analytics: ${total} tests passed`);
    } else {
      console.error(`✗ analytics: ${failed}/${total} failed`);
      process.exit(1);
    }
  })();
}
