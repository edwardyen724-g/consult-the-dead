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
  const pad = size === 'sm' ? '10px 12px' : '20px'

  return (
    <article
      aria-label={`${name} framework card`}
      style={{
      position: 'relative',
      border: '1px solid var(--hairline)',
      borderRadius: '14px',
      overflow: 'hidden',
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      background: `linear-gradient(180deg, rgba(255, 255, 255, 0.02), var(--surface))`,
      boxShadow: '0 18px 36px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
    }}
    >
      <div
        aria-hidden="true"
        style={{
          height: '4px',
          background: `linear-gradient(90deg, ${colorVar} 0%, ${colorVar} 42%, rgba(0, 0, 0, 0) 100%)`,
          opacity: 0.76,
        }}
      />

      <div style={{
        padding: pad,
        display: 'flex',
        flexDirection: 'column',
        gap: size === 'sm' ? '6px' : '10px',
      }}>
      {/* Portrait or fallback initials */}
        {portraitSrc ? (
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: size === 'sm' ? '3 / 2' : '1',
            maxHeight: size === 'sm' ? '120px' : undefined,
            borderRadius: '10px',
            overflow: 'hidden',
            border: `1px solid ${colorVar}`,
            background: 'var(--bg-deep)',
          }}>
          <Image
            src={portraitSrc}
            alt={`Portrait of ${name}`}
            fill
            sizes={size === 'sm' ? '120px' : '(max-width: 640px) 45vw, 180px'}
            style={{ objectFit: 'cover', objectPosition: 'center 18%' }}
          />
        </div>
      ) : (
        <svg width="100%" viewBox="0 0 72 72" style={{ display: 'block', maxHeight: '88px' }}>
          <rect width="72" height="72" fill="transparent" />
          <rect x="3" y="3" width="66" height="66" rx="4" fill="none" stroke={colorVar} strokeWidth="0.6" opacity="0.42" />
          <rect x="7" y="7" width="58" height="58" rx="3" fill="none" stroke={colorVar} strokeWidth="0.3" opacity="0.25" />
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
          fontSize: size === 'sm' ? '0.92rem' : '1.04rem',
          letterSpacing: '-0.015em',
          color: 'var(--fg)',
          lineHeight: 1.2,
        }}>
          {name}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--fg-faint)',
          marginTop: '4px',
        }}>
          {dates}
        </div>
        {size !== 'sm' && (
          <div style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '0.78rem',
            fontStyle: 'italic',
            color: 'var(--fg-dim)',
            marginTop: '8px',
            lineHeight: 1.45,
          }}>
            {lens}
          </div>
        )}
      </div>

      {size !== 'sm' && packs && packs.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          marginTop: '2px',
          paddingTop: '10px',
          borderTop: '1px solid var(--hairline)',
        }}>
          {packs.map((p) => (
            <span
              key={p.name}
              className="font-mono uppercase"
              style={{
                fontSize: '8px',
                letterSpacing: '0.12em',
                color: p.colorVar,
                border: `1px solid ${p.colorVar}`,
                padding: '2px 6px',
                opacity: 0.8,
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '999px',
              }}
            >
              {p.name}
            </span>
          ))}
        </div>
      )}

      {size !== 'sm' && invocations !== undefined && (
        <div style={{
          marginTop: '2px',
          paddingTop: '10px',
          borderTop: '1px solid var(--hairline)',
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--fg-faint)',
        }}>
          {invocations.toLocaleString()} invocations
        </div>
      )}
      </div>
    </article>
  )
}
