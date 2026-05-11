import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

import NotFound from './not-found'

describe('NotFound', () => {
  it('renders the dead-link recovery copy and the three re-entry links', () => {
    const html = renderToStaticMarkup(<NotFound />)

    expect(html).toContain('This path has gone still.')
    expect(html).toContain('dead link / stale share')
    expect(html).toContain('Start a new agon')
    expect(html).toContain('Browse the Council')
    expect(html).toContain('Return home')
    expect(html).toContain('Dead links happen. The Council still listens.')
    expect(html).toContain('href="/agora"')
    expect(html).toContain('href="/frameworks"')
    expect(html).toContain('href="/"')
  })

  it('keeps the stale-share guidance and mobile collapse rule visible', () => {
    const html = renderToStaticMarkup(<NotFound />)

    expect(html).toContain('share that no longer exists')
    expect(html).toContain('Open a fresh consultation in the Agora')
    expect(html).toContain('@media (max-width: 860px)')
    expect(html).toContain('.gm-not-found-shell > div')
  })
})
