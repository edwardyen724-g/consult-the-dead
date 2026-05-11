import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextResponse } from 'next/server'

const { clerkMiddlewareMock, createRouteMatcherMock } = vi.hoisted(() => ({
  clerkMiddlewareMock: vi.fn(),
  createRouteMatcherMock: vi.fn(),
}))
let protectMock: ReturnType<typeof vi.fn> | undefined

vi.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: (handler: unknown) => {
    clerkMiddlewareMock(handler)

    return async (req: Request) => {
      protectMock = vi.fn()
      await (handler as (auth: { protect: typeof protectMock }, request: Request) => Promise<void>)(
        { protect: protectMock },
        req,
      )
      return NextResponse.next()
    }
  },
  createRouteMatcher: (patterns: string[]) => {
    createRouteMatcherMock(patterns)

    return (req: Request) => {
      const pathname = new URL(req.url).pathname
      return pathname.startsWith('/account') || pathname.startsWith('/library')
    }
  },
}))

import {
  createClerkProxyMiddleware,
  hasClerkPublishableKey,
} from './proxy'

describe('Clerk proxy startup', () => {
  beforeEach(() => {
    clerkMiddlewareMock.mockClear()
    createRouteMatcherMock.mockClear()
    protectMock = undefined
  })

  it('treats either Clerk publishable key env var as configured', () => {
    expect(hasClerkPublishableKey({ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123' })).toBe(true)
    expect(hasClerkPublishableKey({ CLERK_PUBLISHABLE_KEY: 'pk_test_456' })).toBe(true)
    expect(hasClerkPublishableKey({})).toBe(false)
  })

  it('falls back to a no-op middleware when Clerk env is absent', async () => {
    const middleware = createClerkProxyMiddleware({})

    const response = await middleware(new Request('http://localhost/'))

    expect(response).toBeInstanceOf(Response)
    expect(clerkMiddlewareMock).not.toHaveBeenCalled()
    expect(protectMock).toBeUndefined()
  })

  it('protects /account and /library when Clerk env is present', async () => {
    const middleware = createClerkProxyMiddleware({
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
    })

    await middleware(new Request('http://localhost/account'))
    expect(clerkMiddlewareMock).toHaveBeenCalledTimes(1)
    expect(protectMock).toHaveBeenCalledTimes(1)

    protectMock?.mockClear()
    await middleware(new Request('http://localhost/'))
    expect(protectMock).not.toHaveBeenCalled()
  })
})
