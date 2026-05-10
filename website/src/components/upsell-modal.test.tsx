/**
 * Unit tests for <UpsellModal/> — the free-tier exhaustion conversion modal.
 *
 * Vitest is configured with `environment: "node"` (no jsdom), so we don't
 * pull in @testing-library/react. Instead we call the function component
 * directly and walk the returned React element tree, locating buttons by
 * `data-testid` and invoking their `onClick` handlers. This mirrors the
 * dual-runner pattern in share-id.test.ts: the file works under vitest AND
 * under `npx tsx ./upsell-modal.test.tsx` for hand-running during dev.
 */

import {
  UpsellModal,
  UPSELL_HEADLINE,
  UPSELL_SUBHEAD,
  TIER_EXHAUSTION_UTM_CAMPAIGN,
  STRIPE_CHECKOUT_BASE_PATH,
  buildUpgradeCheckoutUrl,
  buildUpgradePayload,
  type UpsellUpgradePayload,
} from './upsell-modal'

// ──────────────────────────────────────────────────────────────────────────
//  describe / it / expect shim — works under vitest globals OR plain tsx
// ──────────────────────────────────────────────────────────────────────────

type TestFn = () => void
type Suite = { name: string; tests: { name: string; fn: TestFn }[] }
const suites: Suite[] = []
let currentSuite: Suite | null = null

function describeFallback(name: string, body: () => void) {
  currentSuite = { name, tests: [] }
  body()
  suites.push(currentSuite)
  currentSuite = null
}
function itFallback(name: string, fn: TestFn) {
  if (!currentSuite) throw new Error('it() called outside describe()')
  currentSuite.tests.push({ name, fn })
}
function expectFallback<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) {
        throw new Error(`Expected ${String(actual)} to be ${String(expected)}`)
      }
    },
    toEqual(expected: unknown) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(
          `Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`,
        )
      }
    },
    toBeTruthy() {
      if (!actual) throw new Error(`Expected ${String(actual)} to be truthy`)
    },
    toContain(needle: string) {
      if (typeof actual !== 'string') {
        throw new Error('toContain expects a string actual')
      }
      if (!actual.includes(needle)) {
        throw new Error(`Expected "${actual}" to contain "${needle}"`)
      }
    },
    toMatch(pattern: RegExp) {
      if (typeof actual !== 'string') throw new Error('toMatch expects a string')
      if (!pattern.test(actual)) {
        throw new Error(`Expected "${actual}" to match ${pattern}`)
      }
    },
  }
}

const g = globalThis as unknown as {
  describe?: typeof describeFallback
  it?: typeof itFallback
  expect?: typeof expectFallback
}
const describe = g.describe ?? describeFallback
const it = g.it ?? itFallback
const expect = g.expect ?? expectFallback

// ──────────────────────────────────────────────────────────────────────────
//  Tiny React element walker — finds buttons by data-testid
// ──────────────────────────────────────────────────────────────────────────

interface ElementLike {
  type?: unknown
  props?: Record<string, unknown> & { children?: unknown }
}

function isElementLike(node: unknown): node is ElementLike {
  return (
    typeof node === 'object' &&
    node !== null &&
    'props' in (node as Record<string, unknown>)
  )
}

function walk(node: unknown, visit: (el: ElementLike) => void): void {
  if (node == null || node === false) return
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit)
    return
  }
  if (!isElementLike(node)) return
  visit(node)
  if (node.props && 'children' in node.props) {
    walk(node.props.children, visit)
  }
}

function findByTestId(root: unknown, id: string): ElementLike | null {
  let found: ElementLike | null = null
  walk(root, (el) => {
    if (found) return
    if (el.props && el.props['data-testid'] === id) found = el
  })
  return found
}

function collectText(node: unknown, acc: string[] = []): string[] {
  if (node == null || node === false) return acc
  if (typeof node === 'string' || typeof node === 'number') {
    acc.push(String(node))
    return acc
  }
  if (Array.isArray(node)) {
    for (const c of node) collectText(c, acc)
    return acc
  }
  if (isElementLike(node)) {
    if (node.props && 'children' in node.props) {
      collectText(node.props.children, acc)
    }
  }
  return acc
}

function elementText(el: ElementLike | null): string {
  if (!el) return ''
  return collectText(el).join(' ')
}

// Lightweight spy: tracks call count + last args, runs without vitest.
function spy<F extends (...args: never[]) => unknown>() {
  const fn = ((...args: Parameters<F>) => {
    fn.calls.push(args)
    return undefined
  }) as ((...args: Parameters<F>) => unknown) & {
    calls: Parameters<F>[]
    callCount: () => number
    lastArgs: () => Parameters<F> | undefined
    reset: () => void
  }
  fn.calls = []
  fn.callCount = () => fn.calls.length
  fn.lastArgs = () => fn.calls[fn.calls.length - 1]
  fn.reset = () => {
    fn.calls = []
  }
  return fn
}

// Render the component as a plain React tree.
function render() {
  const onAddKey = spy<() => void>()
  const onUpgrade = spy<(payload: UpsellUpgradePayload) => void>()
  const onDismiss = spy<() => void>()
  // Calling the component as a function is fine: it has no hooks/state.
  const tree = (UpsellModal as unknown as (
    props: Parameters<typeof UpsellModal>[0],
  ) => unknown)({ onAddKey, onUpgrade, onDismiss })
  return { tree, onAddKey, onUpgrade, onDismiss }
}

// ──────────────────────────────────────────────────────────────────────────
//  Helper-level tests
// ──────────────────────────────────────────────────────────────────────────

describe('TIER_EXHAUSTION_UTM_CAMPAIGN', () => {
  it("equals 'tier_exhaustion'", () => {
    expect(TIER_EXHAUSTION_UTM_CAMPAIGN).toBe('tier_exhaustion')
  })
})

describe('buildUpgradeCheckoutUrl', () => {
  it('returns the canonical Stripe-checkout path with the tier_exhaustion UTM', () => {
    expect(buildUpgradeCheckoutUrl()).toBe(
      '/api/stripe/checkout?utm_campaign=tier_exhaustion',
    )
  })

  it('starts with the configured Stripe-checkout base path', () => {
    const url = buildUpgradeCheckoutUrl()
    expect(url.startsWith(STRIPE_CHECKOUT_BASE_PATH)).toBeTruthy()
  })

  it('embeds the campaign constant verbatim (no hard-coded drift)', () => {
    expect(buildUpgradeCheckoutUrl()).toContain(TIER_EXHAUSTION_UTM_CAMPAIGN)
  })
})

describe('buildUpgradePayload', () => {
  it('returns { utm_campaign, checkoutUrl } with the tier_exhaustion tag', () => {
    expect(buildUpgradePayload()).toEqual({
      utm_campaign: 'tier_exhaustion',
      checkoutUrl: '/api/stripe/checkout?utm_campaign=tier_exhaustion',
    })
  })

  it('returns a fresh object on each call (no shared mutable singleton)', () => {
    const a = buildUpgradePayload()
    const b = buildUpgradePayload()
    // Different references, structurally equal.
    expect(a === b).toBe(false)
    expect(a).toEqual(b)
  })
})

// ──────────────────────────────────────────────────────────────────────────
//  Component-level tests
// ──────────────────────────────────────────────────────────────────────────

describe('<UpsellModal/> rendering', () => {
  it('renders the headline copy', () => {
    const { tree } = render()
    const headline = findByTestId(tree, 'upsell-modal') // dialog wrapper
    expect(headline !== null).toBe(true)
    const text = collectText(tree).join(' ')
    expect(text).toContain(UPSELL_HEADLINE)
  })

  it('renders the marketing-voice subhead', () => {
    const { tree } = render()
    const text = collectText(tree).join(' ')
    expect(text).toContain(UPSELL_SUBHEAD)
  })

  it('renders all 3 CTAs by data-testid', () => {
    const { tree } = render()
    const addKey = findByTestId(tree, 'upsell-add-key')
    const upgrade = findByTestId(tree, 'upsell-upgrade')
    const dismiss = findByTestId(tree, 'upsell-dismiss')
    expect(addKey !== null).toBe(true)
    expect(upgrade !== null).toBe(true)
    expect(dismiss !== null).toBe(true)
  })

  it('marks the upgrade CTA with the tier_exhaustion UTM data attribute', () => {
    const { tree } = render()
    const upgrade = findByTestId(tree, 'upsell-upgrade')
    expect(upgrade !== null).toBe(true)
    expect(upgrade!.props!['data-utm-campaign']).toBe(TIER_EXHAUSTION_UTM_CAMPAIGN)
  })

  it('renders each CTA as an HTML <button>', () => {
    const { tree } = render()
    for (const id of ['upsell-add-key', 'upsell-upgrade', 'upsell-dismiss']) {
      const el = findByTestId(tree, id)
      expect(el!.type).toBe('button')
    }
  })

  it('CTAs carry distinct, human-readable labels', () => {
    const { tree } = render()
    const addKey = elementText(findByTestId(tree, 'upsell-add-key'))
    const upgrade = elementText(findByTestId(tree, 'upsell-upgrade'))
    const dismiss = elementText(findByTestId(tree, 'upsell-dismiss'))
    expect(addKey).toContain('Anthropic API key')
    expect(upgrade).toContain('Upgrade to Pro')
    expect(dismiss).toContain('Free-tier limits reset each day at UTC midnight')
  })

  it('exposes a dialog role for accessibility', () => {
    const { tree } = render()
    const dialog = findByTestId(tree, 'upsell-modal')
    expect(dialog!.props!.role).toBe('dialog')
    expect(dialog!.props!['aria-modal']).toBe('true')
  })
})

describe('<UpsellModal/> handlers', () => {
  it('clicking add-key fires onAddKey exactly once', () => {
    const { tree, onAddKey, onUpgrade, onDismiss } = render()
    const btn = findByTestId(tree, 'upsell-add-key')!
    ;(btn.props!.onClick as () => void)()
    expect(onAddKey.callCount()).toBe(1)
    expect(onUpgrade.callCount()).toBe(0)
    expect(onDismiss.callCount()).toBe(0)
  })

  it('clicking upgrade fires onUpgrade exactly once with the tier_exhaustion payload', () => {
    const { tree, onAddKey, onUpgrade, onDismiss } = render()
    const btn = findByTestId(tree, 'upsell-upgrade')!
    ;(btn.props!.onClick as () => void)()
    expect(onUpgrade.callCount()).toBe(1)
    expect(onAddKey.callCount()).toBe(0)
    expect(onDismiss.callCount()).toBe(0)
    const args = onUpgrade.lastArgs()!
    expect(args[0]).toEqual({
      utm_campaign: 'tier_exhaustion',
      checkoutUrl: '/api/stripe/checkout?utm_campaign=tier_exhaustion',
    })
  })

  it('clicking dismiss fires onDismiss exactly once', () => {
    const { tree, onAddKey, onUpgrade, onDismiss } = render()
    const btn = findByTestId(tree, 'upsell-dismiss')!
    ;(btn.props!.onClick as () => void)()
    expect(onDismiss.callCount()).toBe(1)
    expect(onAddKey.callCount()).toBe(0)
    expect(onUpgrade.callCount()).toBe(0)
  })

  it('clicking add-key does not invoke the upgrade builder (handlers are independent)', () => {
    const { tree, onUpgrade } = render()
    const btn = findByTestId(tree, 'upsell-add-key')!
    ;(btn.props!.onClick as () => void)()
    expect(onUpgrade.callCount()).toBe(0)
  })
})

describe('<UpsellModal/> layout', () => {
  it('uses a vertical CTA stack as the default (mobile-first)', () => {
    const { tree } = render()
    const row = findByTestId(tree, 'upsell-cta-row')
    expect(row !== null).toBe(true)
    const style = (row!.props!.style as { flexDirection?: string } | undefined)
    expect(style?.flexDirection).toBe('column')
  })

  it('ships an inline @media rule that flips to a horizontal row >= 720px', () => {
    const { tree } = render()
    let mediaRule = ''
    walk(tree, (el) => {
      if (el.type === 'style') {
        mediaRule += collectText(el.props?.children).join('')
      }
    })
    expect(mediaRule).toContain('@media (min-width: 720px)')
    expect(mediaRule).toContain('flex-direction: row')
  })
})

// ──────────────────────────────────────────────────────────────────────────
//  Direct-run footer (no-op under vitest)
// ──────────────────────────────────────────────────────────────────────────

if (typeof g.expect === 'undefined' && typeof process !== 'undefined') {
  let failed = 0
  let total = 0
  for (const suite of suites) {
    for (const t of suite.tests) {
      total++
      try {
        t.fn()
      } catch (err) {
        failed++
        const msg = err instanceof Error ? err.message : String(err)
        console.error(`✗ ${suite.name} > ${t.name}: ${msg}`)
      }
    }
  }
  if (failed === 0) {
    console.log(`✓ upsell-modal: ${total} tests passed`)
  } else {
    process.exit(1)
  }
}
