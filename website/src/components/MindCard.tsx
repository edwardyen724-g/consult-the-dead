interface MindCardProps {
  name: string
  dates: string
  lens: string
  colorVar: string
  invocations?: number
  size?: 'sm' | 'md'
}

export function MindCard({ name, dates, lens, colorVar, invocations, size = 'md' }: MindCardProps) {
  const initials = name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const pad = size === 'sm' ? '14px 16px' : '20px'

  return (
    <div style={{
      border: '1px solid var(--hairline)',
      borderRadius: '6px',
      padding: pad,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      background: 'var(--surface)',
    }}>
      {/* Engraved portrait */}
      <svg width="100%" viewBox="0 0 72 72" style={{ display: 'block', maxHeight: '88px' }}>
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

      {/* Info */}
      <div>
        <div style={{
          fontFamily: 'var(--font-serif)',
          fontSize: size === 'sm' ? '0.9rem' : '1rem',
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
      </div>

      {invocations !== undefined && (
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
