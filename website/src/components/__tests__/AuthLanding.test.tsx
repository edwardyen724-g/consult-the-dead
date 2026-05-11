import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSignIn = vi.hoisted(() => vi.fn())

vi.mock('@clerk/nextjs', () => ({
  SignIn: (props: Record<string, unknown>) => {
    mockSignIn(props)
    return <div data-testid="clerk-sign-in" />
  },
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: ReactNode
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

import { AuthLanding } from '../AuthLanding'
import SignInPage from '@/app/sign-in/[[...sign-in]]/page'

describe('AuthLanding', () => {
  beforeEach(() => {
    mockSignIn.mockClear()
  })

  it('renders the branded shell copy and the route links', () => {
    const html = renderToStaticMarkup(<AuthLanding />)

    expect(html).toContain('Sign in to return to the Agora.')
    expect(html).toContain('3 agons a day')
    expect(html).toContain('Unlimited on your own API key')
    expect(html).toContain('Unlimited with the full library')
    expect(html).toContain('Back to Agora')
    expect(html).toContain('Compare tiers')
    expect(html).toContain('href="/agora"')
    expect(html).toContain('href="/pricing"')
  })

  it('passes the Clerk sign-in route props through to SignIn', () => {
    renderToStaticMarkup(<AuthLanding />)

    expect(mockSignIn).toHaveBeenCalledTimes(1)
    expect(mockSignIn.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        path: '/sign-in',
        routing: 'path',
        signUpUrl: '/sign-up',
        fallbackRedirectUrl: '/agora',
      }),
    )
  })

  it('keeps the route wrapper on the branded shell', () => {
    const html = renderToStaticMarkup(<SignInPage />)

    expect(html).toContain('Sign in to return to the Agora.')
    expect(mockSignIn).toHaveBeenCalledTimes(1)
  })
})
