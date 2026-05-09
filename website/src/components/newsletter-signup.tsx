import type { CSSProperties } from 'react'
import { NEWSLETTER_API_PATH } from '@/lib/newsletter'

export interface NewsletterSignupProps {
  headline?: string
  body?: string
  eyebrow?: string
  placeholder?: string
  buttonLabel?: string
  source?: string
  medium?: string
  campaign?: string
  content?: string
  referringSite?: string
  newsletterListIds?: string[]
  redirectTo?: string
  className?: string
}

const shellStyle: CSSProperties = {
  display: 'grid',
  gap: '18px',
  border: '1px solid var(--hairline)',
  borderRadius: '8px',
  background: 'var(--surface)',
  padding: '24px',
}

const eyebrowStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--fg-faint)',
}

const headlineStyle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'clamp(1.25rem, 2.4vw, 1.85rem)',
  lineHeight: 1.2,
  margin: 0,
  color: 'var(--fg)',
}

const bodyStyle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '15px',
  lineHeight: 1.65,
  color: 'var(--fg-dim)',
  margin: 0,
  maxWidth: '58ch',
}

const formStyle: CSSProperties = {
  display: 'grid',
  gap: '12px',
}

const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid var(--hairline)',
  borderRadius: '6px',
  background: 'var(--bg)',
  color: 'var(--fg)',
  padding: '14px 16px',
  fontFamily: 'var(--font-serif)',
  fontSize: '16px',
}

const buttonStyle: CSSProperties = {
  border: '1px solid var(--amber)',
  borderRadius: '999px',
  background: 'var(--amber)',
  color: 'var(--bg)',
  padding: '12px 18px',
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  justifySelf: 'start',
}

const noteStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--fg-faint)',
}

function normalizeField(value?: string): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export function buildNewsletterFormFields({
  source = 'website',
  medium = 'web',
  campaign,
  content,
  referringSite,
  redirectTo = '/',
}: Pick<
  NewsletterSignupProps,
  'source' | 'medium' | 'campaign' | 'content' | 'referringSite' | 'redirectTo'
>) {
  return {
    source: normalizeField(source) ?? 'website',
    medium: normalizeField(medium) ?? 'web',
    campaign: normalizeField(campaign),
    content: normalizeField(content),
    referringSite: normalizeField(referringSite),
    redirectTo: normalizeField(redirectTo) ?? '/',
  }
}

export function NewsletterSignup({
  headline = 'Get the council notes by email',
  body = 'Join the newsletter for product updates, essays, and release notes when the product changes in a way worth reading about.',
  eyebrow = 'Newsletter',
  placeholder = 'you@example.com',
  buttonLabel = 'Subscribe',
  source = 'website',
  medium = 'web',
  campaign = 'newsletter_capture',
  content,
  referringSite,
  newsletterListIds,
  redirectTo = '/',
  className,
}: NewsletterSignupProps) {
  const hiddenFields = buildNewsletterFormFields({
    source,
    medium,
    campaign,
    content,
    referringSite,
    redirectTo,
  })

  return (
    <section style={shellStyle} aria-label={headline} className={className}>
      <div style={eyebrowStyle}>{eyebrow}</div>
      <div style={{ display: 'grid', gap: '8px' }}>
        <h2 style={headlineStyle}>{headline}</h2>
        <p style={bodyStyle}>{body}</p>
      </div>

      <form method="post" action={NEWSLETTER_API_PATH} style={formStyle}>
        <input type="hidden" name="source" value={hiddenFields.source} />
        <input type="hidden" name="medium" value={hiddenFields.medium} />
        {hiddenFields.campaign && (
          <input type="hidden" name="campaign" value={hiddenFields.campaign} />
        )}
        {hiddenFields.content && (
          <input type="hidden" name="content" value={hiddenFields.content} />
        )}
        {hiddenFields.referringSite && (
          <input type="hidden" name="referringSite" value={hiddenFields.referringSite} />
        )}
        <input type="hidden" name="redirectTo" value={hiddenFields.redirectTo} />
        {newsletterListIds?.map((id) => (
          <input key={id} type="hidden" name="newsletterListIds" value={id} />
        ))}
        <label style={{ display: 'grid', gap: '8px' }}>
          <span style={noteStyle}>Email address</span>
          <input
            type="email"
            placeholder={placeholder}
            autoComplete="email"
            inputMode="email"
            required
            style={inputStyle}
            aria-label="Email address"
            name="email"
          />
        </label>

        <button type="submit" style={buttonStyle}>
          {buttonLabel}
        </button>
      </form>

      <div aria-live="polite" style={noteStyle}>
        Posts to {NEWSLETTER_API_PATH} and forwards the result to Beehiiv.
      </div>
    </section>
  )
}
