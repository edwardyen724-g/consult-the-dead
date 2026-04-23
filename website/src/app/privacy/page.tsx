import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy Policy' }

const SECTIONS = [
  {
    heading: 'Who We Are',
    body: `Consult The Dead is operated by Edward Yen, a sole proprietor. This Privacy Policy explains what data we collect when you use consultthedead.com, how we use it, and your rights regarding it. Questions? Email edwardyen724@gmail.com.`,
  },
  {
    heading: 'Data We Collect',
    body: [
      'Account data — When you sign up, Clerk collects your email address and (optionally) your name. We receive a Clerk user ID and store your subscription tier in your Clerk profile.',
      'Payment data — Stripe handles all payment processing. We store a Stripe customer ID in your Clerk profile to link your account to your subscription. We never see or store raw card numbers.',
      'Debate content — The topics and decisions you submit to the Agora are sent to Anthropic\'s API for processing. Pro subscribers\' debates are stored in your private library. Free-tier debates are not stored after your session ends.',
      'Usage data — We collect anonymous pageview events (page URL, timestamp, referrer) via our own ingest endpoint and Vercel Analytics. No personal identifiers are attached to these events.',
      'Session data — Clerk sets a session cookie to keep you signed in. This is strictly necessary for authentication and cannot be opted out of while signed in.',
    ],
  },
  {
    heading: 'How We Use Your Data',
    body: `We use your data solely to provide and improve the Service: authenticating you, processing payments, delivering AI-generated analysis, and maintaining your debate library. We do not build advertising profiles, sell your data to third parties, or use your content for any purpose other than fulfilling your requests.`,
  },
  {
    heading: 'What We Do Not Do',
    body: [
      'We do not sell your personal data to any third party.',
      'We do not use your debates or submitted content to train AI models — ours or anyone else\'s.',
      'We do not share your data with third parties except as required to operate the Service (Clerk for auth, Stripe for payments, Anthropic for AI processing, Vercel for hosting and analytics).',
      'We do not send marketing emails without your explicit opt-in.',
    ],
  },
  {
    heading: 'Third-Party Services',
    body: `The Service relies on the following third parties, each with their own privacy practices:
• Clerk (auth) — clerk.com/privacy
• Stripe (payments) — stripe.com/privacy
• Anthropic (AI processing) — anthropic.com/privacy
• Vercel (hosting and analytics) — vercel.com/legal/privacy-policy

When you use the Service, data relevant to each service's function is transmitted to that service. We recommend reviewing their policies.`,
  },
  {
    heading: 'Cookies',
    body: `We use a Clerk session cookie (strictly necessary, no opt-out while signed in) and Vercel Analytics, which uses no persistent cookies or cross-site tracking. We do not use advertising cookies or third-party tracking pixels.`,
  },
  {
    heading: 'Data Retention',
    body: `Account data is retained for as long as your account exists. If you delete your account, Clerk removes your identity data within 30 days. Pro debate library entries are deleted when you close your account or explicitly delete them. Anonymous usage events (pageviews) are retained for up to 12 months in aggregate form. Payment records are retained for 7 years as required by financial regulations.`,
  },
  {
    heading: 'Your Rights',
    body: `Depending on your location, you may have the right to access, correct, delete, or export your personal data. To exercise any of these rights, email edwardyen724@gmail.com. We will respond within 30 days. California residents may have additional rights under CCPA; contact us to learn more.`,
  },
  {
    heading: 'Security',
    body: `We use industry-standard practices: HTTPS everywhere, Clerk's managed auth (which handles secure session management and hashed credentials), and Stripe's PCI-compliant payment processing. No system is perfectly secure; if you believe your account has been compromised, contact us immediately.`,
  },
  {
    heading: 'Changes to This Policy',
    body: `We may update this policy as the Service evolves. Material changes will be communicated to registered users by email at least 14 days before taking effect. The current effective date is always shown at the top of this page.`,
  },
]

export default function PrivacyPage() {
  return (
    <main style={{ background: 'var(--bg)', color: 'var(--fg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '72px 24px 120px' }}>

        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--fg-dim)',
          marginBottom: '12px',
        }}>
          Legal
        </p>

        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: 400,
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
          marginBottom: '12px',
        }}>
          Privacy Policy
        </h1>

        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--fg-dim)',
          marginBottom: '64px',
          letterSpacing: '0.05em',
        }}>
          Effective April 23, 2026
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {SECTIONS.map((s) => (
            <section key={s.heading}>
              <h2 style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--fg-dim)',
                marginBottom: '14px',
              }}>
                {s.heading}
              </h2>
              {Array.isArray(s.body) ? (
                <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {s.body.map((item, i) => (
                    <li key={i} style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1rem',
                      lineHeight: 1.75,
                      color: 'var(--fg)',
                      paddingLeft: '1.25em',
                      position: 'relative',
                    }}>
                      <span style={{ position: 'absolute', left: 0, color: 'var(--fg-dim)' }}>—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1rem',
                  lineHeight: 1.75,
                  color: 'var(--fg)',
                  margin: 0,
                  whiteSpace: 'pre-line',
                }}>
                  {s.body}
                </p>
              )}
            </section>
          ))}
        </div>

      </div>
    </main>
  )
}
