import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi, afterEach } from 'vitest'
import { buildNewsletterSignupPayload } from '@/lib/newsletter'
import {
  buildNewsletterFormFields,
  NewsletterSignup,
} from './newsletter-signup'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('buildNewsletterSignupPayload', () => {
  it('normalizes the email and fills in defaults', () => {
    expect(
      buildNewsletterSignupPayload({
        email: '  Ada@Example.com ',
        source: ' landing-page ',
        campaign: ' launch ',
        content: ' hero ',
      }),
    ).toEqual({
      email: 'ada@example.com',
      source: 'landing-page',
      medium: 'web',
      campaign: 'launch',
      content: 'hero',
      referringSite: undefined,
      reactivateExisting: false,
      sendWelcomeEmail: false,
      newsletterListIds: undefined,
    })
  })
})

describe('buildNewsletterFormFields', () => {
  it('fills in the default newsletter form metadata', () => {
    expect(buildNewsletterFormFields({})).toEqual({
      source: 'website',
      medium: 'web',
      campaign: undefined,
      content: undefined,
      referringSite: undefined,
      redirectTo: '/',
    })
  })

  it('trims explicit tracking fields', () => {
    expect(
      buildNewsletterFormFields({
        source: ' homepage ',
        medium: ' web ',
        campaign: ' spring_launch ',
        content: ' hero ',
        referringSite: ' https://consultthedead.com ',
        redirectTo: ' /pricing ',
      }),
    ).toEqual({
      source: 'homepage',
      medium: 'web',
      campaign: 'spring_launch',
      content: 'hero',
      referringSite: 'https://consultthedead.com',
      redirectTo: '/pricing',
    })
  })

  it('falls back cleanly when callers pass blank tracking strings', () => {
    expect(
      buildNewsletterFormFields({
        source: '   ',
        medium: '   ',
        campaign: '   ',
        content: '   ',
        referringSite: '   ',
        redirectTo: '   ',
      }),
    ).toEqual({
      source: 'website',
      medium: 'web',
      campaign: undefined,
      content: undefined,
      referringSite: undefined,
      redirectTo: '/',
    })
  })
})

describe('NewsletterSignup', () => {
  it('renders a reusable capture form with Beehiiv-aware copy', () => {
    const html = renderToStaticMarkup(
      <NewsletterSignup
        headline="Stay in the loop"
        body="Receive the next release note."
        eyebrow="Mailing list"
        buttonLabel="Join"
        newsletterListIds={['nl_1', 'nl_2']}
      />,
    )

    expect(html).toContain('Stay in the loop')
    expect(html).toContain('Receive the next release note.')
    expect(html).toContain('Mailing list')
    expect(html).toContain('method="post"')
    expect(html).toContain('action="/api/newsletter"')
    expect(html).toContain('name="redirectTo"')
    expect(html).toContain('name="source"')
    expect(html).toContain('newsletterListIds')
    expect(html).toContain('type="email"')
    expect(html).toContain('Join')
  })

  it('renders optional tracking fields when provided', () => {
    const html = renderToStaticMarkup(
      <NewsletterSignup
        campaign=" spring_launch "
        content=" hero "
        referringSite=" https://consultthedead.com "
        redirectTo="/pricing"
      />,
    )

    expect(html).toContain('name="campaign" value="spring_launch"')
    expect(html).toContain('name="content" value="hero"')
    expect(html).toContain(
      'name="referringSite" value="https://consultthedead.com"',
    )
    expect(html).toContain('name="redirectTo" value="/pricing"')
  })
})
