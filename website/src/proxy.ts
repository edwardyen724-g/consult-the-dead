import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/account(.*)',
  '/library(.*)',
])

type ClerkEnv = Partial<Pick<NodeJS.ProcessEnv, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY' | 'CLERK_PUBLISHABLE_KEY'>>
const DEFAULT_CLERK_ENV = process.env as ClerkEnv

export function hasClerkPublishableKey(env: ClerkEnv = DEFAULT_CLERK_ENV): boolean {
  return Boolean(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || env.CLERK_PUBLISHABLE_KEY)
}

export function createClerkProxyMiddleware(env: ClerkEnv = DEFAULT_CLERK_ENV) {
  if (!hasClerkPublishableKey(env)) {
    return () => NextResponse.next()
  }

  return clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth.protect()
    }
  })
}

export default createClerkProxyMiddleware()

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
