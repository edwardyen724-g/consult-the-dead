import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.unmock('@vercel/analytics/server')

describe('trackEvent', () => {
  beforeEach(() => {
    vi.resetModules()
    delete process.env.NODE_ENV
  })

  it('no-ops outside production', async () => {
    process.env.NODE_ENV = 'test'
    const track = vi.fn()

    vi.doMock('@vercel/analytics/server', () => ({ track }))

    const { trackEvent } = await import('./analytics')

    await expect(trackEvent('paid_subscription', { plan: 'monthly' })).resolves.toBe(false)
    expect(track).not.toHaveBeenCalled()
  })

  it('forwards events in production', async () => {
    process.env.NODE_ENV = 'production'
    const track = vi.fn().mockResolvedValue(undefined)

    vi.doMock('@vercel/analytics/server', () => ({ track }))

    const { trackEvent } = await import('./analytics')

    await expect(trackEvent('paid_subscription', {
      plan: 'annual',
      utm_campaign: 'pricing',
      utm_content: 'hero',
    })).resolves.toBe(true)

    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith('paid_subscription', {
      plan: 'annual',
      utm_campaign: 'pricing',
      utm_content: 'hero',
    })
  })

  it('drops undefined props before forwarding', async () => {
    process.env.NODE_ENV = 'production'
    const track = vi.fn().mockResolvedValue(undefined)

    vi.doMock('@vercel/analytics/server', () => ({ track }))

    const { trackEvent } = await import('./analytics')

    await expect(trackEvent('paid_subscription', {
      plan: 'annual',
      utm_campaign: undefined,
      utm_content: 'hero',
    })).resolves.toBe(true)

    expect(track).toHaveBeenCalledWith('paid_subscription', {
      plan: 'annual',
      utm_content: 'hero',
    })
  })
  it('reuses the cached analytics module promise across calls', async () => {
    process.env.NODE_ENV = 'production'
    const track = vi.fn().mockResolvedValue(undefined)
    let loadCount = 0

    vi.doMock('@vercel/analytics/server', () => {
      loadCount += 1
      return { track }
    })

    const { trackEvent } = await import('./analytics')

    await trackEvent('paid_subscription', { plan: 'monthly' })
    await trackEvent('paid_subscription', { plan: 'annual' })

    expect(loadCount).toBe(1)
    expect(track).toHaveBeenCalledTimes(2)
  })

  it('does not throw when the analytics module has no track export', async () => {
    process.env.NODE_ENV = 'production'

    vi.doMock('@vercel/analytics/server', () => ({ track: undefined }))

    const { trackEvent } = await import('./analytics')

    await expect(trackEvent('paid_subscription')).resolves.toBe(false)
  })

  it('does not throw when the analytics module import fails', async () => {
    process.env.NODE_ENV = 'production'

    vi.doMock('@vercel/analytics/server', () => {
      throw new Error('boom')
    })

    const { trackEvent } = await import('./analytics')

    await expect(trackEvent('paid_subscription')).resolves.toBe(false)
  })

  it('does not throw when the analytics module import fails', async () => {
    process.env.NODE_ENV = 'production'

    vi.doMock('@vercel/analytics/server', () => {
      throw new Error('boom')
    })

    const { trackEvent } = await import('./analytics')

    await expect(trackEvent('paid_subscription')).resolves.toBeUndefined()
  })
})
