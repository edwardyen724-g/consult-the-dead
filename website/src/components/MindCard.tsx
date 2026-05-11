import Image from 'next/image'

interface PackBadgeData {
  name: string
  colorVar: string
}

interface MindCardProps {
  name: string
  slug?: string
  dates: string
  lens: string
  colorVar: string
  invocations?: number
  size?: 'sm' | 'md'
  packs?: PackBadgeData[]
}

export function MindCard({ name, slug, dates, lens, colorVar, invocations, size = 'md', packs }: MindCardProps) {
  const initials = name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const portraitSrc = slug ? `/portraits/${slug}-portrait.png` : null
  const isCompact = size === 'sm'
  const pad = isCompact ? '10px 11px 11px' : '18px 18px 16px'

  return (
    <div style={{
      border: '1px solid var(--hairline)',
      borderRadius: '8px',
      padding: pad,
      display: 'flex',
      flexDirection: 'column',
      gap: isCompact ? '7px' : '11px',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.02), transparent), var(--surface)',
      boxShadow: '0 1px 0 rgba(0, 0, 0, 0.04)',
      transition: 'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease, background 180ms ease',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        paddingBottom: '8px',
        borderBottom: `1px solid color-mix(in srgb, ${colorVar} 18%, transparent)`,
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '8px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--fg-faint)',
        }}>
          Reading Room
        </span>
        <span aria-hidden="true" style={{
          width: '8px',
          height: '8px',
          borderRadius: '999px',
          background: colorVar,
          boxShadow: `0 0 0 3px color-mix(in srgb, ${colorVar} 12%, transparent)`,
          flexShrink: 0,
        }} />
      </div>

      {/* Portrait or fallback initials */}
      {portraitSrc ? (
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: isCompact ? '3 / 2' : '1',
          maxHeight: isCompact ? '120px' : undefined,
          borderRadius: '6px',
          overflow: 'hidden',
          border: `1px solid color-mix(in srgb, ${colorVar} 16%, transparent)`,
          background: 'var(--bg)',
        }}>
          <Image
            src={portraitSrc}
            alt={`Portrait of ${name}`}
            fill
            sizes={isCompact ? '120px' : '(max-width: 640px) 45vw, 180px'}
            style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
          />
        </div>
      ) : (
        <svg width="100%" viewBox="0 0 72 72" style={{ display: 'block', maxHeight: isCompact ? '88px' : '116px' }}>
          <rect width="72" height="72" fill="transparent" />
          <rect x="3" y="3" width="66" height="66" fill="none" stroke={colorVar} strokeWidth="0.6" opacity="0.4" />
          <rect x="7" y="7" width="58" height="58" fill="none" stroke={colorVar} strokeWidth="0.3" opacity="0.25" />
          <text
            x="36" y="42"
            textAnchor="middle"
            fill={colorVar}
            style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 300, letterSpacing: '-0.02em' }}
          >
            {initials}
          </text>
          <text
            x="36" y="63"
            textAnchor="middle"
            fill={colorVar}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '6px', letterSpacing: '0.2em' }}
            opacity="0.5"
          >
            PORTRAIT
          </text>
        </svg>
      )}

      {/* Info */}
      <div>
        <div style={{
          fontFamily: 'var(--font-serif)',
          fontSize: isCompact ? '0.9rem' : '1rem',
          color: 'var(--fg)',
          lineHeight: 1.2,
        }}>
          {name}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          letterSpacing: '0.1em',
          color: 'var(--fg-faint)',
          marginTop: '3px',
        }}>
          {dates}
        </div>
        {!isCompact && (
          <div style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '0.78rem',
            fontStyle: 'italic',
            color: 'var(--fg-dim)',
            marginTop: '6px',
            lineHeight: 1.45,
          }}>
            {lens}
          </div>
        )}
      </div>

      {!isCompact && packs && packs.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
        }}>
          {packs.map((p) => (
            <span
              key={p.name}
              className="font-mono uppercase"
              style={{
                fontSize: '8px',
                letterSpacing: '0.1em',
                color: p.colorVar,
                border: `1px solid ${p.colorVar}`,
                padding: '1px 5px',
                opacity: 0.75,
              }}
            >
              {p.name}
            </span>
          ))}
        </div>
      )}

      {!isCompact && invocations !== undefined && (
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--fg-faint)',
          borderTop: '1px solid var(--hairline)',
          paddingTop: '8px',
          marginTop: '2px',
        }}>
          {invocations.toLocaleString()} invocations
        </div>
      )}
    </div>
  )
}
