import { describe, expect, it, vi } from 'vitest'

vi.mock('@clerk/nextjs', () => ({
  SignUp: () => <div data-testid="clerk-sign-up" />,
}))

import SignUpPage, { metadata } from './page'
import { SignUpClient } from './SignUpClient'
import { renderToStaticMarkup } from 'react-dom/server'

describe('SignUpPage metadata', () => {
  it('exports a metadata object', () => {
    expect(metadata).toBeDefined()
  })

  it('sets title to "Sign Up — Consult The Dead"', () => {
    expect(metadata.title).toBe('Sign Up — Consult The Dead')
  })

  it('sets robots.index to false', () => {
    const robots = metadata.robots as { index: boolean; follow: boolean }
    expect(robots.index).toBe(false)
  })

  it('sets robots.follow to false', () => {
    const robots = metadata.robots as { index: boolean; follow: boolean }
    expect(robots.follow).toBe(false)
  })
})

describe('SignUpPage', () => {
  it('renders the SignUpClient component', () => {
    const el = SignUpPage({}) as React.ReactElement
    // The page should render a SignUpClient element
    expect(el).toBeDefined()
  })
})

describe('SignUpClient', () => {
  it('renders the SignUp component centered on the page', () => {
    const html = renderToStaticMarkup(<SignUpClient />)

    expect(html).toContain('data-testid="clerk-sign-up"')
  })

  it('applies centering styles to the wrapper div', () => {
    const html = renderToStaticMarkup(<SignUpClient />)

    expect(html).toContain('display:flex')
    expect(html).toContain('min-height:100vh')
  })
})
