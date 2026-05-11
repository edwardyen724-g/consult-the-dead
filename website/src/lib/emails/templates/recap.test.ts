import { describe, expect, it } from 'vitest'
import { renderRecap, RECAP_EMAIL_ID } from './recap'

const baseVars = {
  firstName: 'Ada',
  agonTopic: 'Should I raise prices on my $18K MRR product?',
  councilNames: ['Machiavelli', 'Marie Curie', 'Sun Tzu'],
  consensusExcerpt:
    'Raise selectively on new contracts; hold existing accounts steady for one quarter while you measure churn.',
  agonShareId: 'abhishek-chakravarty',
  agonsRemaining: 2,
}

describe('renderRecap subject', () => {
  it('uses Variant B (council names) when councilNames are present', () => {
    const r = renderRecap(baseVars)
    expect(r.subject).toBe(
      'Machiavelli, Marie Curie, Sun Tzu just argued your question — read the verdict',
    )
  })

  it('falls back to Variant A when councilNames is empty', () => {
    const r = renderRecap({ ...baseVars, councilNames: [] })
    expect(r.subject).toBe("Here's what your council decided")
  })
})

describe('renderRecap body', () => {
  it('greets by first name', () => {
    expect(renderRecap(baseVars).text).toContain('Hi Ada,')
  })

  it('falls back to "Hi there" without first name', () => {
    expect(renderRecap({ ...baseVars, firstName: null }).text).toContain(
      'Hi there,',
    )
  })

  it('includes the topic verbatim when within 120 chars', () => {
    expect(renderRecap(baseVars).text).toContain(baseVars.agonTopic)
  })

  it('truncates topic at 120 chars with ellipsis', () => {
    const longTopic =
      'Should I raise prices before retention is proven, considering churn risk on the existing book of 18 large enterprise accounts that lock in 12 month commitments and renegotiate annually?'
    const r = renderRecap({ ...baseVars, agonTopic: longTopic })
    const m = r.text.match(/Your question: ([^\n]+)/)
    expect(m).not.toBeNull()
    expect(m![1].length).toBeLessThanOrEqual(120)
    expect(m![1].endsWith('…')).toBe(true)
  })

  it('truncates consensus excerpt at 160 chars', () => {
    const longConsensus = 'x'.repeat(500)
    const r = renderRecap({ ...baseVars, consensusExcerpt: longConsensus })
    const m = r.text.match(/Verdict: ([^\n]+)/)
    expect(m).not.toBeNull()
    expect(m![1].length).toBeLessThanOrEqual(160)
    expect(m![1].endsWith('…')).toBe(true)
  })

  it('joins council names with ", "', () => {
    expect(renderRecap(baseVars).text).toContain(
      'Council: Machiavelli, Marie Curie, Sun Tzu',
    )
  })
})

describe('renderRecap UTM links', () => {
  it('emits debate URL with recap UTM tags', () => {
    const r = renderRecap(baseVars)
    const m = r.text.match(/Read the full debate:\s*(\S+)/)
    expect(m).not.toBeNull()
    const url = new URL(m![1])
    expect(url.pathname).toBe('/agora/a/abhishek-chakravarty')
    expect(url.searchParams.get('utm_source')).toBe('email')
    expect(url.searchParams.get('utm_campaign')).toBe('recap')
    expect(url.searchParams.get('utm_content')).toBe(RECAP_EMAIL_ID)
  })

  it('emits run-another-agon URL with recap UTM tags', () => {
    const r = renderRecap(baseVars)
    const m = r.text.match(/Run another agon:\s*(\S+)/)
    expect(m).not.toBeNull()
    const url = new URL(m![1])
    expect(url.pathname).toBe('/agora')
    expect(url.searchParams.get('utm_campaign')).toBe('recap')
  })

  it('URL-encodes the share id segment', () => {
    const r = renderRecap({ ...baseVars, agonShareId: 'with space/here' })
    expect(r.text).toContain('/agora/a/with%20space%2Fhere?')
  })
})

describe('renderRecap remaining-debates copy', () => {
  it('"unlimited" prints the BYO-key line', () => {
    const r = renderRecap({ ...baseVars, agonsRemaining: 'unlimited' })
    expect(r.text).toContain('unlimited debates today (BYO key)')
  })

  it('numeric > 1 pluralises "debates"', () => {
    expect(renderRecap({ ...baseVars, agonsRemaining: 2 }).text).toContain(
      'You have 2 free debates left today',
    )
  })

  it('numeric === 1 uses singular "debate"', () => {
    expect(renderRecap({ ...baseVars, agonsRemaining: 1 }).text).toContain(
      'You have 1 free debate left today',
    )
  })

  it('numeric <= 0 uses the cap-reached line', () => {
    expect(renderRecap({ ...baseVars, agonsRemaining: 0 }).text).toContain(
      "You've used today's free debates",
    )
  })

  it('null falls through to the generic prompt', () => {
    expect(renderRecap({ ...baseVars, agonsRemaining: null }).text).toContain(
      "What's your next question?",
    )
  })
})

describe('renderRecap html', () => {
  it('html-escapes hostile topic input', () => {
    const r = renderRecap({
      ...baseVars,
      agonTopic: '<script>alert(1)</script>',
    })
    expect(r.html).not.toContain('<script>alert(1)</script>')
    expect(r.html).toContain('&lt;script&gt;')
  })
})
