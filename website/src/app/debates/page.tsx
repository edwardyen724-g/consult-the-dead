import Link from 'next/link'
import { getAllDebateSlugs, getDebate } from '@/lib/debates'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Debates',
  description: 'Browse sample Agora debates — real decisions argued by historical minds.',
  robots: { index: false, follow: false },
}

const ADVISOR_COLOR: Record<string, string> = {
  'Niccolò Machiavelli': 'var(--color-machiavelli)',
  'Sun Tzu':             'var(--color-suntzu)',
  'Marie Curie':         'var(--color-curie)',
  'Marcus Aurelius':     'var(--color-aurelius)',
  'Leonardo da Vinci':   'var(--color-leonardo)',
  'Isaac Newton':        'var(--color-newton)',
  'Nikola Tesla':        'var(--color-tesla)',
}

function advisorColor(name: string): string {
  return ADVISOR_COLOR[name] ?? 'var(--fg-dim)'
}

export default function DebatesIndexPage() {
  const slugs = getAllDebateSlugs()
  const debates = slugs
    .map(slug => getDebate(slug))
    .filter((d): d is NonNullable<typeof d> => d !== null)
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--fg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '64px 24px 120px' }}>

        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--fg-dim)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '48px',
          }}
        >
          ← Consult The Dead
        </Link>

        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--fg-faint)',
          marginBottom: '16px',
        }}>
          Sample Agons
        </p>

        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 400,
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          letterSpacing: '-0.02em',
          lineHeight: 1.15,
          marginBottom: '16px',
        }}>
          {debates.length} debates, argued by the council.
        </h1>

        <p style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: '1.05rem',
          lineHeight: 1.6,
          color: 'var(--fg-dim)',
          margin: '0 0 56px',
          maxWidth: '55ch',
        }}>
          Each debate below was run for a real person&apos;s real decision.
          Read how the council argued — then bring your own.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          {debates.map(debate => (
            <Link
              key={debate.slug}
              href={`/debates/${debate.slug}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--surface)',
                border: '1px solid var(--hairline)',
                padding: '24px 22px 20px',
                textDecoration: 'none',
                color: 'var(--fg)',
                transition: 'border-color 200ms ease-out',
                minHeight: '180px',
              }}
            >
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--amber)',
                marginBottom: '10px',
              }}>
                {debate.forContext}
              </div>

              <div style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '0.95rem',
                lineHeight: 1.45,
                color: 'var(--fg)',
                marginBottom: '16px',
                flex: 1,
              }}>
                &ldquo;{debate.topic.length > 120
                  ? debate.topic.slice(0, 120) + '…'
                  : debate.topic}&rdquo;
              </div>

              <div style={{
                borderTop: '1px solid var(--hairline)',
                paddingTop: '10px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px 8px',
              }}>
                {debate.council.map(advisor => (
                  <span
                    key={advisor}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '8px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: advisorColor(advisor),
                    }}
                  >
                    {advisor}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          marginTop: '72px',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '1rem',
            color: 'var(--fg-dim)',
            marginBottom: '24px',
          }}>
            Ready to bring your own decision?
          </p>
          <Link
            href="/agora"
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              padding: '12px 28px',
              background: 'var(--amber)',
              color: 'var(--bg)',
              textDecoration: 'none',
              borderRadius: '4px',
            }}
          >
            Enter The Agora →
          </Link>
        </div>

      </div>
    </main>
  )
}
