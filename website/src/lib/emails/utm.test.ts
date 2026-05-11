import { describe, expect, it } from 'vitest'
import { buildUtmUrl } from './utm'

describe('buildUtmUrl', () => {
  it('appends utm_source=email + campaign + content to a clean base URL', () => {
    const out = buildUtmUrl({
      baseUrl: 'https://www.consultthedead.com/agora',
      campaign: 'welcome',
      emailId: 'welcome_v1',
    })
    const url = new URL(out)
    expect(url.searchParams.get('utm_source')).toBe('email')
    expect(url.searchParams.get('utm_campaign')).toBe('welcome')
    expect(url.searchParams.get('utm_content')).toBe('welcome_v1')
  })

  it('preserves pre-existing query params on the base URL', () => {
    const out = buildUtmUrl({
      baseUrl: 'https://www.consultthedead.com/agora?ref=share',
      campaign: 'recap',
      emailId: 'recap_v1',
    })
    const url = new URL(out)
    expect(url.searchParams.get('ref')).toBe('share')
    expect(url.searchParams.get('utm_campaign')).toBe('recap')
  })

  it('overwrites attacker-controlled utm_source on the base URL', () => {
    const out = buildUtmUrl({
      baseUrl: 'https://www.consultthedead.com/agora?utm_source=hostile',
      campaign: 'nudge',
      emailId: 'nudge_v1',
    })
    expect(new URL(out).searchParams.get('utm_source')).toBe('email')
  })

  it('merges extraParams (e.g. ?topic=...) before UTM keys', () => {
    const out = buildUtmUrl({
      baseUrl: 'https://www.consultthedead.com/agora',
      campaign: 'nudge',
      emailId: 'nudge_v1',
      extraParams: { topic: 'Should I raise prices?' },
    })
    const url = new URL(out)
    expect(url.searchParams.get('topic')).toBe('Should I raise prices?')
    expect(url.searchParams.get('utm_campaign')).toBe('nudge')
  })

  it('URL-encodes extraParam values', () => {
    const out = buildUtmUrl({
      baseUrl: 'https://www.consultthedead.com/agora',
      campaign: 'nudge',
      emailId: 'nudge_v1',
      extraParams: { topic: 'a&b=c' },
    })
    expect(out).toContain('topic=a%26b%3Dc')
  })

  it('emits all four campaign values verbatim (welcome, recap, nudge, digest)', () => {
    const campaigns = ['welcome', 'recap', 'nudge', 'digest'] as const
    for (const c of campaigns) {
      const out = buildUtmUrl({
        baseUrl: 'https://www.consultthedead.com/x',
        campaign: c,
        emailId: `${c}_v1`,
      })
      expect(new URL(out).searchParams.get('utm_campaign')).toBe(c)
      expect(new URL(out).searchParams.get('utm_content')).toBe(`${c}_v1`)
    }
  })

  it('throws on invalid base URL', () => {
    expect(() =>
      buildUtmUrl({ baseUrl: 'not-a-url', campaign: 'welcome', emailId: 'welcome_v1' }),
    ).toThrow()
  })
})
