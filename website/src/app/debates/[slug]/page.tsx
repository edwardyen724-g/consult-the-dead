import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllDebateSlugs, getDebate } from '@/lib/debates'
import type { Metadata } from 'next'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return getAllDebateSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const debate = getDebate(slug)
  if (!debate) return {}
  return {
    title: `${debate.name} — Agora Debate`,
    robots: { index: false, follow: false },
  }
}

const ADVISOR_COLOR: Record<string, string> = {
  'Niccolò Machiavelli': 'var(--color-machiavelli)',
  'Sun Tzu':             'var(--color-suntzu)',
  'Marie Curie':         'var(--color-curie)',
  'Marcus Aurelius':     'var(--color-aurelius)',
  'Leonardo da Vinci':   'var(--color-leonardo)',
  'Isaac Newton':        'var(--color-newton)',
  'Nikola Tesla':        'var(--color-tesla)',
  'Albert Einstein':     'var(--color-einstein)',
}

function advisorColor(name: string): string {
  return ADVISOR_COLOR[name] ?? 'var(--fg-dim)'
}

// Minimal markdown → HTML: bold, italic, list items, paragraphs
function renderMarkdown(text: string): string {
  const paragraphs = text.split(/\n\n+/)
  return paragraphs.map(para => {
    const trimmed = para.trim()
    if (!trimmed) return ''

    // Bullet list
    if (/^- /m.test(trimmed)) {
      const items = trimmed
        .split('\n')
        .filter(l => l.startsWith('- '))
        .map(l => `<li>${inlineMarkdown(l.slice(2))}</li>`)
        .join('')
      return `<ul style="margin:0 0 0 1.2em;padding:0;display:flex;flex-direction:column;gap:6px;">${items}</ul>`
    }

    return `<p style="margin:0 0 1em;">${inlineMarkdown(trimmed)}</p>`
  }).join('')
}

function inlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
}

export default async function DebatePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const debate = getDebate(slug)
  if (!debate) notFound()

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--fg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '740px', margin: '0 auto', padding: '64px 24px 120px' }}>

        {/* Back link */}
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

        {/* Header */}
        <div style={{ marginBottom: '56px' }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--fg-dim)',
            margin: '0 0 10px',
          }}>
            Agora Debate · {debate.date}
          </p>

          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.12em',
            color: 'var(--amber)',
            textTransform: 'uppercase',
            margin: '0 0 20px',
          }}>
            For {debate.forContext}
          </p>

          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
            fontWeight: 400,
            fontStyle: 'italic',
            lineHeight: 1.4,
            letterSpacing: '-0.01em',
            color: 'var(--fg)',
            margin: '0 0 28px',
          }}>
            "{debate.topic}"
          </h1>

          {/* Council */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {debate.council.map(advisor => (
              <span
                key={advisor}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '3px 10px',
                  border: `1px solid ${advisorColor(advisor)}`,
                  borderRadius: '3px',
                  color: advisorColor(advisor),
                }}
              >
                {advisor}
              </span>
            ))}
          </div>
        </div>

        {/* Rounds */}
        {debate.rounds.map(round => (
          <section key={round.number} style={{ marginBottom: '56px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '32px',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--fg-dim)',
              }}>
                Round {round.number}
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--hairline)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
              {round.speeches.map(speech => (
                <div key={speech.advisor}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: advisorColor(speech.advisor),
                    marginBottom: '14px',
                  }}>
                    {speech.advisor}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1rem',
                      lineHeight: 1.75,
                      color: 'var(--fg)',
                    }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(speech.content) }}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Consensus */}
        {debate.consensus.length > 0 && (
          <section style={{
            borderTop: '1px solid var(--hairline)',
            paddingTop: '48px',
            marginBottom: '72px',
          }}>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--fg-dim)',
              margin: '0 0 36px',
            }}>
              Council Consensus
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
              {debate.consensus.map(section => (
                <div key={section.title}>
                  <h2 style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--amber)',
                    margin: '0 0 14px',
                    fontWeight: 400,
                  }}>
                    {section.title}
                  </h2>
                  <div
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1rem',
                      lineHeight: 1.75,
                      color: 'var(--fg)',
                    }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(section.content) }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div style={{
          border: '1px solid var(--hairline)',
          borderRadius: '8px',
          padding: '32px',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.05rem',
            fontStyle: 'italic',
            color: 'var(--fg-dim)',
            margin: '0 0 24px',
            lineHeight: 1.6,
          }}>
            This debate was run for {debate.name.split(' ')[0]}'s specific decision.
            Bring your own — the council argues differently every time.
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
            Run your own decision →
          </Link>
        </div>

      </div>
    </main>
  )
}
