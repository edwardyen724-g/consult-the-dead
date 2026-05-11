import { describe, expect, it, vi } from 'vitest'

// AuthLanding uses next/link and @clerk/nextjs — mock both
vi.mock('next/link', () => ({
  default: (props: Record<string, unknown>) => ({ type: 'a', props }),
}))

vi.mock('@clerk/nextjs', () => ({
  SignIn: () => <div data-testid="clerk-sign-in" />,
}))

import SignInPage, { metadata } from './page'

describe('SignInPage metadata', () => {
  it('exports a metadata object', () => {
    expect(metadata).toBeDefined()
  })

  it('sets title to "Sign In — Consult The Dead"', () => {
    expect(metadata.title).toBe('Sign In — Consult The Dead')
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

describe('SignInPage', () => {
  it('renders without throwing', () => {
    expect(() => SignInPage({})).not.toThrow()
  })

  it('returns a React element', () => {
    const el = SignInPage({})
    expect(el).toBeDefined()
    expect(typeof el).toBe('object')
  })
})
