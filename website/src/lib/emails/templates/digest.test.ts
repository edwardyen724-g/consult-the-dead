import { describe, expect, it } from 'vitest'
import { DIGEST_EMAIL_ID, renderDigest } from './digest'

const baseVars = {
  firstName: 'Sasha',
  featuredAgonTopic: 'Should I raise prices on my $18K MRR product?',
  featuredConsensusExcerpt:
    'Raise selectively on new contracts; hold existing accounts steady for one quarter while you measure churn.',
  featuredAgonShareId: 'abhishek-chakravarty',
  newMindName: 'Lincoln',
  newMindTagline: 'Steady-hand operator under pressure',
  newMindHowArguesBlurb:
    'Lincoln argues from the center of gravity — what holds the union of the decision together when everyone else is splintering.',
  agonsRemaining: 3,
  unsubscribeUrl: 'https://www.consultthedead.com/unsubscribe?token=abc',
}

describe('renderDigest subject', () => {
  it('uses Variant A by default with topic', () => {
    expect(renderDigest(baseVars).subject).toBe(
      "This week's most-debated question: Should I raise prices on my $18K MRR product?",
    )
  })

  it('truncates very long topics in the subject', () => {
    const long = 'x'.repeat(200)
    const r = renderDigest({ ...baseVars, featuredAgonTopic: long })
    // Subject prefix is 38 chars; we cap topic at 80 → total under ~120.
    expect(r.subject.length).toBeLessThanOrEqual(38 + 80)
    expect(r.subject.endsWith('…')).toBe(true)
  })
})

describe('renderDigest body', () => {
  it('greets by first name', () => {
    expect(renderDigest(baseVars).text).toContain('Hi Sasha,')
  })

  it('includes the featured agon topic verbatim in the body', () => {
    expect(renderDigest(baseVars).text).toContain(baseVars.featuredAgonTopic)
  })

  it('truncates featured consensus at 200 chars', () => {
    const r = renderDigest({
      ...baseVars,
      featuredConsensusExcerpt: 'y'.repeat(500),
    })
    const m = r.text.match(/What the council said: ([^\n]+)/)
    expect(m).not.toBeNull()
    expect(m![1].length).toBeLessThanOrEqual(200)
  })

  it('emits featured debate URL with digest UTM tags', () => {
    const r = renderDigest(baseVars)
    const m = r.text.match(/Read the full debate:\s*(\S+)/)
    expect(m).not.toBeNull()
    const url = new URL(m![1])
    expect(url.pathname).toBe('/agora/a/abhishek-chakravarty')
    expect(url.searchParams.get('utm_source')).toBe('email')
    expect(url.searchParams.get('utm_campaign')).toBe('digest')
    expect(url.searchParams.get('utm_content')).toBe(DIGEST_EMAIL_ID)
  })

  it('emits Run-an-agon CTA with digest UTM tags', () => {
    const r = renderDigest(baseVars)
    const m = r.text.match(/Run an agon:\s*(\S+)/)
    expect(m).not.toBeNull()
    expect(new URL(m![1]).searchParams.get('utm_campaign')).toBe('digest')
  })

  it('contains the unsubscribe URL verbatim (CAN-SPAM)', () => {
    const r = renderDigest(baseVars)
    expect(r.text).toContain(baseVars.unsubscribeUrl)
    expect(r.html).toContain(baseVars.unsubscribeUrl)
  })

  it('html-escapes hostile featured topic input', () => {
    const r = renderDigest({
      ...baseVars,
      featuredAgonTopic: '<img src=x onerror=alert(1)>',
    })
    expect(r.html).not.toContain('<img src=x onerror=alert(1)>')
    expect(r.html).toContain('&lt;img src=x onerror=alert(1)&gt;')
  })
})

describe('renderDigest new-mind block', () => {
  it('includes new-mind block when newMindName supplied', () => {
    const r = renderDigest(baseVars)
    expect(r.text).toContain('New mind this week: Lincoln')
    expect(r.text).toContain('Add Lincoln to a debate:')
  })

  it('drops new-mind block entirely when newMindName missing', () => {
    const r = renderDigest({ ...baseVars, newMindName: null, newMindTagline: null, newMindHowArguesBlurb: null })
    expect(r.text).not.toContain('New mind this week')
    expect(r.text).not.toContain('Add Lincoln')
  })

  it('omits tagline / blurb lines individually when not provided', () => {
    const r = renderDigest({
      ...baseVars,
      newMindTagline: null,
      newMindHowArguesBlurb: null,
    })
    expect(r.text).toContain('New mind this week: Lincoln')
    expect(r.text).not.toContain('How Lincoln argues:')
  })
})

describe('renderDigest agons-remaining copy', () => {
  it('"unlimited" prints the BYO-key line', () => {
    expect(
      renderDigest({ ...baseVars, agonsRemaining: 'unlimited' }).text,
    ).toContain('unlimited debates today (BYO key)')
  })

  it('numeric > 1 pluralises', () => {
    expect(renderDigest({ ...baseVars, agonsRemaining: 2 }).text).toContain(
      'You have 2 free debates left today',
    )
  })

  it('numeric === 1 uses singular', () => {
    expect(renderDigest({ ...baseVars, agonsRemaining: 1 }).text).toContain(
      'You have 1 free debate left today',
    )
  })

  it('null falls through to generic line', () => {
    expect(renderDigest({ ...baseVars, agonsRemaining: null }).text).toContain(
      'Your free debates reset daily.',
    )
  })
})

describe('renderDigest greeting fallback', () => {
  it('falls back to "Hi there"', () => {
    expect(renderDigest({ ...baseVars, firstName: '' }).text).toContain(
      'Hi there,',
    )
  })
})
