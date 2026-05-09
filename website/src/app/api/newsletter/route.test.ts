import { afterEach, describe, expect, it, vi } from 'vitest'
import { POST } from './route'
import {
  BEEHIIV_API_BASE_URL,
  buildNewsletterSignupPayload,
  createBeehiivSubscription,
} from '@/lib/newsletter'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('POST /api/newsletter', () => {
  it('returns 400 for invalid JSON', async () => {
    const response = await POST(new Request('http://localhost/api/newsletter', {
      method: 'POST',
      body: 'not-json',
      headers: { 'Content-Type': 'application/json' },
    }))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'Invalid JSON',
    })
  })

  it('returns 400 for invalid email', async () => {
    const response = await POST(
      new Request('http://localhost/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'not-an-email' }),
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'Valid email required',
    })
  })

  it('creates a Beehiiv subscription with the configured publication and token', async () => {
    vi.stubEnv('BEEHIIV_API_KEY', 'beehiiv-secret')
    vi.stubEnv('BEEHIIV_PUBLICATION_ID', 'pub_123')

    const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toBe(
        `${BEEHIIV_API_BASE_URL}/pub_123/subscriptions`,
      )
      expect(init?.headers).toMatchObject({
        Authorization: 'Bearer beehiiv-secret',
        'Content-Type': 'application/json',
      })
      const body = String(init?.body ?? '')
      expect(body).toContain('"email":"reader@example.com"')
      expect(body).toContain('"utm_source":"homepage"')
      expect(body).toContain('"utm_medium":"web"')
      expect(body).toContain('"utm_content":"hero"')
      expect(body).toContain('"referring_site":"https://consultthedead.com"')
      expect(body).toContain('"newsletter_list_ids":["nl_1","nl_2"]')
      return new Response(
        JSON.stringify({
          data: {
            id: 'sub_abc',
            email: 'reader@example.com',
            status: 'validating',
          },
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    })

    const originalFetch = globalThis.fetch
    globalThis.fetch = fetchImpl as typeof fetch
    try {
      const response = await POST(
        new Request('http://localhost/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'reader@example.com',
          source: 'homepage',
          campaign: 'launch',
          content: 'hero',
          referringSite: 'https://consultthedead.com',
          newsletterListIds: ['nl_1', 'nl_2'],
        }),
      }),
      )

      expect(response.status).toBe(201)
      await expect(response.json()).resolves.toEqual({
        ok: true,
        subscription: {
          id: 'sub_abc',
          email: 'reader@example.com',
          status: 'validating',
        },
      })
      expect(fetchImpl).toHaveBeenCalledTimes(1)
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  it('redirects form submissions back to the requested page on success', async () => {
    vi.stubEnv('BEEHIIV_API_KEY', 'beehiiv-secret')
    vi.stubEnv('BEEHIIV_PUBLICATION_ID', 'pub_123')

    const fetchImpl = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          data: {
            id: 'sub_abc',
            email: 'reader@example.com',
            status: 'validating',
          },
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    })

    const originalFetch = globalThis.fetch
    globalThis.fetch = fetchImpl as typeof fetch
    try {
      const form = new FormData()
      form.set('email', 'reader@example.com')
      form.set('source', 'homepage')
      form.set('medium', 'web')
      form.set('redirectTo', '/pricing')

      const response = await POST(
        new Request('http://localhost/api/newsletter', {
          method: 'POST',
          body: form,
        }),
      )

      expect(response.status).toBe(303)
      expect(response.headers.get('location')).toBe(
        'http://localhost/pricing?newsletter=subscribed',
      )
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  it('falls back to the homepage when a redirect target is off-origin', async () => {
    vi.stubEnv('BEEHIIV_API_KEY', 'beehiiv-secret')
    vi.stubEnv('BEEHIIV_PUBLICATION_ID', 'pub_123')

    const fetchImpl = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          data: {
            id: 'sub_abc',
            email: 'reader@example.com',
            status: 'validating',
          },
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    })

    const originalFetch = globalThis.fetch
    globalThis.fetch = fetchImpl as typeof fetch
    try {
      const form = new FormData()
      form.set('email', 'reader@example.com')
      form.set('redirectTo', 'https://evil.example.com/')

      const response = await POST(
        new Request('http://localhost/api/newsletter', {
          method: 'POST',
          body: form,
        }),
      )

      expect(response.status).toBe(303)
      expect(response.headers.get('location')).toBe(
        'http://localhost/?newsletter=subscribed',
      )
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  it('returns a graceful 503 when Beehiiv config is missing', async () => {
    const response = await POST(
      new Request('http://localhost/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'reader@example.com' }),
      }),
    )

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'Missing Beehiiv configuration',
    })
  })

  it('rejects invalid emails before calling Beehiiv', async () => {
    vi.stubEnv('BEEHIIV_API_KEY', 'beehiiv-secret')
    vi.stubEnv('BEEHIIV_PUBLICATION_ID', 'pub_123')

    const fetchImpl = vi.fn()
    const originalFetch = globalThis.fetch
    globalThis.fetch = fetchImpl as typeof fetch
    try {
      await expect(
        createBeehiivSubscription(
          buildNewsletterSignupPayload({
            email: 'not-an-email',
          }),
        ),
      ).rejects.toThrow('Invalid email')
      expect(fetchImpl).not.toHaveBeenCalled()
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  it('surfaces plain-text Beehiiv failures', async () => {
    vi.stubEnv('BEEHIIV_API_KEY', 'beehiiv-secret')
    vi.stubEnv('BEEHIIV_PUBLICATION_ID', 'pub_123')

    const fetchImpl = vi.fn(async () => {
      return new Response('Beehiiv exploded', { status: 500 })
    })

    await expect(
      createBeehiivSubscription(
        buildNewsletterSignupPayload({
          email: 'reader@example.com',
        }),
        fetchImpl as typeof fetch,
      ),
    ).rejects.toThrow('Beehiiv exploded')
  })
})
