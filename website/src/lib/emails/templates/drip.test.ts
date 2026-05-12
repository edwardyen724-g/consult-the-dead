/**
 * Tests for the post-signup drip email templates (days 1, 3, 7).
 */
import { describe, expect, it } from 'vitest'
import {
  renderDripDay1,
  renderDripDay3,
  renderDripDay7,
  DRIP_CAMPAIGN,
  DRIP_DAY1_EMAIL_ID,
  DRIP_DAY3_EMAIL_ID,
  DRIP_DAY7_EMAIL_ID,
} from './drip'

// ---- constants ----

describe('drip template constants', () => {
  it('DRIP_CAMPAIGN is "drip"', () => {
    expect(DRIP_CAMPAIGN).toBe('drip')
  })

  it('email IDs are day1, day3, day7', () => {
    expect(DRIP_DAY1_EMAIL_ID).toBe('day1')
    expect(DRIP_DAY3_EMAIL_ID).toBe('day3')
    expect(DRIP_DAY7_EMAIL_ID).toBe('day7')
  })
})

// ---- day 1 ----

describe('renderDripDay1', () => {
  it('returns subject, html, text', () => {
    const result = renderDripDay1()
    expect(result.subject).toBeTruthy()
    expect(result.html).toBeTruthy()
    expect(result.text).toBeTruthy()
  })

  it('subject is about council selection', () => {
    const { subject } = renderDripDay1()
    expect(subject.toLowerCase()).toContain('council')
  })

  it('personalizes greeting with firstName', () => {
    const { text, html } = renderDripDay1({ firstName: 'Alice' })
    expect(text).toContain('Hi Alice')
    expect(html).toContain('Hi Alice')
  })

  it('uses generic greeting when firstName is absent', () => {
    const { text, html } = renderDripDay1()
    expect(text).toContain('Hi there')
    expect(html).toContain('Hi there')
  })

  it('uses generic greeting when firstName is null', () => {
    const { text } = renderDripDay1({ firstName: null })
    expect(text).toContain('Hi there')
  })

  it('uses generic greeting when firstName is empty string', () => {
    const { text } = renderDripDay1({ firstName: '   ' })
    expect(text).toContain('Hi there')
  })

  it('includes UTM-tagged agora link with campaign=drip', () => {
    const { text } = renderDripDay1()
    expect(text).toContain('utm_campaign=drip')
    expect(text).toContain('utm_source=email')
    expect(text).toContain('utm_content=day1')
  })

  it('includes the agora URL in both text and html', () => {
    const { text, html } = renderDripDay1()
    expect(text).toContain('/agora')
    expect(html).toContain('/agora')
  })

  it('mentions example minds in the council guide', () => {
    const { text, html } = renderDripDay1()
    expect(text).toContain('Machiavelli')
    expect(text).toContain('Sun Tzu')
    expect(text).toContain('Marcus Aurelius')
    expect(html).toContain('Machiavelli')
  })

  it('html contains a CTA button linking to the agora', () => {
    const { html } = renderDripDay1()
    expect(html).toContain('Open the Agora')
    expect(html).toContain('href=')
  })

  it('escapes HTML in first name', () => {
    const { html } = renderDripDay1({ firstName: '<script>' })
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })
})

// ---- day 3 ----

describe('renderDripDay3', () => {
  it('returns subject, html, text', () => {
    const result = renderDripDay3()
    expect(result.subject).toBeTruthy()
    expect(result.html).toBeTruthy()
    expect(result.text).toBeTruthy()
  })

  it('subject mentions free debate refresh', () => {
    const { subject } = renderDripDay3()
    expect(subject.toLowerCase()).toContain('free debates')
  })

  it('personalizes greeting with firstName', () => {
    const { text } = renderDripDay3({ firstName: 'Bob' })
    expect(text).toContain('Hi Bob')
  })

  it('uses generic greeting when firstName is absent', () => {
    const { text } = renderDripDay3()
    expect(text).toContain('Hi there')
  })

  it('mentions daily reset of free debates', () => {
    const { text } = renderDripDay3()
    expect(text).toContain('midnight UTC')
    expect(text).toContain('3 free debates')
  })

  it('includes UTM drip campaign params for agora link', () => {
    const { text } = renderDripDay3()
    expect(text).toContain('utm_campaign=drip')
    expect(text).toContain('utm_content=day3')
  })

  it('includes UTM drip campaign params for Pro link', () => {
    const { text } = renderDripDay3()
    expect(text).toContain('/pricing')
    // Pro link also carries drip UTMs
    expect(text.match(/utm_campaign=drip/g)?.length).toBeGreaterThanOrEqual(2)
  })

  it('mentions Pro features', () => {
    const { text, html } = renderDripDay3()
    expect(text).toContain('100 agons per month')
    expect(text).toContain('Claude Opus')
    expect(html).toContain('Claude Opus')
  })

  it('mentions the 7-day trial', () => {
    const { text, html } = renderDripDay3()
    expect(text).toContain('7-day')
    expect(html).toContain('7-day')
  })

  it('html has both Pro CTA and free-debates link', () => {
    const { html } = renderDripDay3()
    expect(html).toContain('Start 7-day free trial')
    expect(html).toContain('Use today')
  })
})

// ---- day 7 ----

describe('renderDripDay7', () => {
  it('returns subject, html, text', () => {
    const result = renderDripDay7()
    expect(result.subject).toBeTruthy()
    expect(result.html).toBeTruthy()
    expect(result.text).toBeTruthy()
  })

  it('subject is about what Pro members debate', () => {
    const { subject } = renderDripDay7()
    expect(subject.toLowerCase()).toContain('pro')
  })

  it('personalizes greeting with firstName', () => {
    const { text } = renderDripDay7({ firstName: 'Carol' })
    expect(text).toContain('Hi Carol')
  })

  it('uses generic greeting when firstName is absent', () => {
    const { text } = renderDripDay7()
    expect(text).toContain('Hi there')
  })

  it('includes social proof debate examples', () => {
    const { text, html } = renderDripDay7()
    expect(text).toContain('$18K MRR')
    expect(text).toContain('$20K MRR')
    expect(text).toContain('13K stars')
    expect(html).toContain('$18K MRR')
  })

  it('mentions historical minds from the council examples', () => {
    const { text } = renderDripDay7()
    expect(text).toContain('Machiavelli')
    expect(text).toContain('Curie')
    expect(text).toContain('Sun Tzu')
    expect(text).toContain('Aurelius')
  })

  it('includes UTM drip campaign params for Pro link', () => {
    const { text } = renderDripDay7()
    expect(text).toContain('utm_campaign=drip')
    expect(text).toContain('utm_content=day7')
    expect(text).toContain('/pricing')
  })

  it('mentions the founding-member pricing anchor', () => {
    const { text, html } = renderDripDay7()
    // Should mention $25/mo and/or $300/yr
    expect(text + html).toMatch(/\$25\/mo|\$300\/yr/)
  })

  it('includes a soft opt-out for non-converters', () => {
    const { text } = renderDripDay7()
    expect(text).toContain('free is working for you')
    expect(text).toContain('no action needed')
  })

  it('html includes the social proof library cards', () => {
    const { html } = renderDripDay7()
    expect(html).toContain('From the library')
    expect(html).toContain('Start 7-day trial')
  })
})
