/**
 * Unit tests for the CTA attribution helper.
 *
 * This file follows the repo's dual-runner pattern so it can run under
 * Vitest and under plain `tsx` when needed.
 */

import { buildCtaEventProps } from './cta-attribution'

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

describe('buildCtaEventProps', () => {
  it('serializes source, campaign, and content into the canonical utm_* keys', () => {
    expect(
      buildCtaEventProps({
        source: 'home',
        campaign: 'hero_primary',
        content: 'primary_button',
      }),
    ).toEqual({
      utm_source: 'home',
      utm_campaign: 'hero_primary',
      utm_content: 'primary_button',
    })
  })

  it('trims whitespace and drops empty UTM fields', () => {
    expect(
      buildCtaEventProps({
        source: '  pricing  ',
        campaign: '   ',
        content: '\n',
      }),
    ).toEqual({
      utm_source: 'pricing',
    })
  })

  it('preserves extra event metadata while keeping canonical UTM fields authoritative', () => {
    expect(
      buildCtaEventProps({
        source: 'share',
        campaign: 'share_card',
        content: 'footer_cta',
        extra: {
          plan: 'pro',
          utm_source: 'legacy-source',
          utm_campaign: 'legacy-campaign',
          utm_content: 'legacy-content',
          omitted: undefined,
        },
      }),
    ).toEqual({
      plan: 'pro',
      utm_source: 'share',
      utm_campaign: 'share_card',
      utm_content: 'footer_cta',
    })
  })

  it('returns a fresh object and works with source-only CTAs', () => {
    const a = buildCtaEventProps({ source: 'pricing' })
    const b = buildCtaEventProps({ source: 'pricing' })

    expect(a === b).toBe(false)
    expect(a).toEqual({ utm_source: 'pricing' })
    expect(b).toEqual({ utm_source: 'pricing' })
  })

  it('drops a blank source instead of emitting an invalid utm_source', () => {
    expect(
      buildCtaEventProps({
        source: '   ',
        campaign: 'hero_secondary',
        extra: { clicked: true },
      }),
    ).toEqual({
      clicked: true,
      utm_campaign: 'hero_secondary',
    })
  })
})

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
    console.log(`✓ cta-attribution: ${total} tests passed`)
  } else {
    process.exit(1)
  }
}
