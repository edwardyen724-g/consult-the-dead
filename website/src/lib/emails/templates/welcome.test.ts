import { describe, expect, it } from 'vitest'
import { renderWelcome, WELCOME_EMAIL_ID } from './welcome'

describe('renderWelcome', () => {
  it('produces the canonical subject line', () => {
    const r = renderWelcome({ firstName: 'Edward' })
    expect(r.subject).toBe('Your council is assembled.')
  })

  it('greets by first name when supplied', () => {
    const r = renderWelcome({ firstName: 'Edward' })
    expect(r.text).toContain('Hi Edward,')
    expect(r.html).toContain('Hi Edward,')
  })

  it('falls back to "Hi there" when first name is empty / null / undefined', () => {
    expect(renderWelcome({ firstName: '' }).text).toContain('Hi there,')
    expect(renderWelcome({ firstName: null }).text).toContain('Hi there,')
    expect(renderWelcome({ firstName: undefined }).text).toContain('Hi there,')
    expect(renderWelcome().text).toContain('Hi there,')
  })

  it('trims whitespace-only first names', () => {
    expect(renderWelcome({ firstName: '   ' }).text).toContain('Hi there,')
  })

  it('emits the example agon link with welcome UTM tags', () => {
    const r = renderWelcome()
    const m = r.text.match(/https:\/\/www\.consultthedead\.com\/agora\/a\/abhishek-chakravarty[^\s]+/)
    expect(m).not.toBeNull()
    const url = new URL(m![0])
    expect(url.searchParams.get('utm_source')).toBe('email')
    expect(url.searchParams.get('utm_campaign')).toBe('welcome')
    expect(url.searchParams.get('utm_content')).toBe(WELCOME_EMAIL_ID)
  })

  it('emits the primary CTA to /agora with welcome UTM tags', () => {
    const r = renderWelcome()
    const m = r.text.match(/Open the Agora:\s*(\S+)/)
    expect(m).not.toBeNull()
    const url = new URL(m![1])
    expect(url.pathname).toBe('/agora')
    expect(url.searchParams.get('utm_source')).toBe('email')
    expect(url.searchParams.get('utm_campaign')).toBe('welcome')
    expect(url.searchParams.get('utm_content')).toBe(WELCOME_EMAIL_ID)
  })

  it('html version also includes both UTM-tagged links', () => {
    const r = renderWelcome()
    expect(r.html).toMatch(
      /href="https:\/\/www\.consultthedead\.com\/agora\?[^"]*utm_campaign=welcome[^"]*"/,
    )
    expect(r.html).toMatch(
      /href="https:\/\/www\.consultthedead\.com\/agora\/a\/abhishek-chakravarty\?[^"]*utm_campaign=welcome[^"]*"/,
    )
  })

  it('html-escapes user-controlled greeting input (no XSS)', () => {
    const r = renderWelcome({ firstName: '<script>alert(1)</script>' })
    expect(r.html).not.toContain('<script>alert(1)</script>')
    expect(r.html).toContain('&lt;script&gt;')
  })

  it('signs off as Edward', () => {
    expect(renderWelcome().text).toContain('— Edward')
    expect(renderWelcome().html).toContain('— Edward')
  })
})
