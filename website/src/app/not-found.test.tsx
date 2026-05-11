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
  it('renders the dead-link recovery copy and the re-entry links', () => {
    const html = renderToStaticMarkup(<NotFound />)

    expect(html).toContain('This link has gone cold.')
    expect(html).toContain('404')
    expect(html).toContain('Open the Library')
    expect(html).toContain('Return to the Agora')
    expect(html).toContain('href="/library"')
    expect(html).toContain('href="/agora"')
  })

  it('keeps the stale-share guidance visible', () => {
    const html = renderToStaticMarkup(<NotFound />)

    expect(html).toContain('stale share')
    expect(html).toContain('Library')
    expect(html).toContain('Agora')
  })
})
