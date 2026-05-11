import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@clerk/nextjs', () => ({
  SignUp: () => <div data-testid="clerk-sign-up" />,
}))

import SignUpPage from './page'

describe('SignUpPage', () => {
  it('renders the SignUp component centered on the page', () => {
    const html = renderToStaticMarkup(<SignUpPage />)

    expect(html).toContain('data-testid="clerk-sign-up"')
  })

  it('applies centering styles to the wrapper div', () => {
    const html = renderToStaticMarkup(<SignUpPage />)

    expect(html).toContain('display:flex')
    expect(html).toContain('min-height:100vh')
  })
})
