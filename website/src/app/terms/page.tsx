import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms of Service' }

const SECTIONS = [
  {
    heading: 'Service Description',
    body: `Consult The Dead ("the Service") is an AI-powered decision-support tool that runs your decisions through cognitive frameworks derived from historical figures. It is provided by Edward Yen, a sole proprietor operating under the brand "Consult The Dead" ("we," "us," "our"). The Service is for informational and analytical purposes only. It does not constitute legal, financial, medical, or professional advice, and nothing produced by the Service should be treated as such.`,
  },
  {
    heading: 'Account Terms',
    body: `You must be at least 13 years old to use the Service. You are responsible for maintaining the confidentiality of your account credentials. You are responsible for all activity that occurs under your account. We use Clerk for identity management; by creating an account you also agree to Clerk's terms of service. You may not use the Service for any unlawful purpose or to transmit content that is harmful, abusive, or violates the rights of others.`,
  },
  {
    heading: 'Subscriptions and Billing',
    body: `The Service offers a free tier and a paid Pro subscription. Paid subscriptions are processed through Stripe. By subscribing, you authorize Stripe to charge your payment method on a recurring basis at the rate displayed at checkout. Prices are in US dollars. Taxes may apply depending on your jurisdiction. We reserve the right to change pricing with 30 days notice to active subscribers. All payments are subject to Stripe's terms of service.`,
  },
  {
    heading: 'Cancellation and Refunds',
    body: `You may cancel your subscription at any time from your account page. Cancellation takes effect at the end of the current billing period; you retain access until then. We do not offer refunds for partial billing periods. Annual subscribers who cancel within 7 days of initial purchase (and have not used the Service beyond the free tier) may request a full refund by emailing edwardyen724@gmail.com.`,
  },
  {
    heading: 'Intellectual Property',
    body: `You retain full ownership of any content you submit to the Service, including the decisions and topics you submit for analysis ("debates"). We do not claim any rights to your debates. We do not use your debates to train AI models, and we do not share them with third parties except as required to operate the Service (e.g., sending them to Anthropic's API for processing, subject to Anthropic's data handling policies). The Service's software, UI, frameworks, and branding are owned by us and may not be copied or redistributed without written permission.`,
  },
  {
    heading: 'Free Tier and Rate Limits',
    body: `The free tier is provided as-is with no uptime guarantees. We reserve the right to adjust free-tier limits, temporarily suspend free access during periods of high demand, or discontinue the free tier with reasonable notice. Pro subscribers will not be affected by free-tier capacity limits.`,
  },
  {
    heading: 'Limitation of Liability',
    body: `The Service is provided "as is" without warranties of any kind, express or implied. To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to lost profits, lost data, or business interruption, even if advised of the possibility of such damages. Our total liability to you for any claim arising from use of the Service shall not exceed the amount you paid us in the three months preceding the claim.`,
  },
  {
    heading: 'Indemnification',
    body: `You agree to indemnify and hold harmless Consult The Dead and its operator from any claims, damages, or expenses (including reasonable legal fees) arising from your use of the Service, your violation of these Terms, or your violation of any third-party rights.`,
  },
  {
    heading: 'Changes to Terms',
    body: `We may update these Terms from time to time. We will notify active subscribers of material changes by email at least 14 days before they take effect. Continued use of the Service after changes take effect constitutes acceptance of the new Terms. If you do not agree to updated Terms, you may cancel your subscription before they take effect.`,
  },
  {
    heading: 'Governing Law',
    body: `These Terms are governed by the laws of the State of California, without regard to its conflict of law provisions. Any dispute arising from these Terms shall be resolved in the state or federal courts located in California, and you consent to personal jurisdiction in those courts.`,
  },
  {
    heading: 'Contact',
    body: `Questions about these Terms? Email edwardyen724@gmail.com.`,
  },
]

export default function TermsPage() {
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
          Terms of Service
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
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1rem',
                lineHeight: 1.75,
                color: 'var(--fg)',
                margin: 0,
              }}>
                {s.body}
              </p>
            </section>
          ))}
        </div>

      </div>
    </main>
  )
}
