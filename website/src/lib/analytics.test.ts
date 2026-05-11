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

  it('forwards cleaned props in production', async () => {
    process.env.NODE_ENV = 'production'
    const track = vi.fn().mockResolvedValue(undefined)

    vi.doMock('@vercel/analytics/server', () => ({ track }))

    const { trackEvent } = await import('./analytics')

    await expect(trackEvent('paid_subscription', {
      plan: 'annual',
      utm_campaign: undefined,
      utm_content: 'hero',
    })).resolves.toBe(true)

    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith('paid_subscription', {
      plan: 'annual',
      utm_content: 'hero',
    })
  })

  it('forwards events without props in production', async () => {
    process.env.NODE_ENV = 'production'
    const track = vi.fn().mockResolvedValue(undefined)

    vi.doMock('@vercel/analytics/server', () => ({ track }))

    const { trackEvent } = await import('./analytics')

    await expect(trackEvent('paid_subscription')).resolves.toBe(true)

    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith('paid_subscription')
  })

  it('falls back to the default loader when the test loader is cleared', async () => {
    process.env.NODE_ENV = 'production'
    const track = vi.fn().mockResolvedValue(undefined)

    vi.doMock('@vercel/analytics/server', () => ({ track }))

    const { trackEvent, _setVercelTrackLoaderForTests } = await import('./analytics')
    _setVercelTrackLoaderForTests(async () => track)
    _setVercelTrackLoaderForTests(null)

    await expect(trackEvent('paid_subscription', { plan: 'monthly' })).resolves.toBe(true)

    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith('paid_subscription', { plan: 'monthly' })
  })

  it('returns false when the analytics module has no track export', async () => {
    process.env.NODE_ENV = 'production'

    vi.doMock('@vercel/analytics/server', () => ({ track: undefined }))

    const { trackEvent } = await import('./analytics')

    await expect(trackEvent('paid_subscription')).resolves.toBe(false)
  })

  it('returns false when the analytics track call throws', async () => {
    process.env.NODE_ENV = 'production'
    const track = vi.fn().mockImplementation(() => {
      throw new Error('boom')
    })

    vi.doMock('@vercel/analytics/server', () => ({ track }))

    const { trackEvent } = await import('./analytics')

    await expect(trackEvent('paid_subscription', { plan: 'annual' })).resolves.toBe(false)
    expect(track).toHaveBeenCalledTimes(1)
  })

  it('returns false when the analytics module import fails', async () => {
    process.env.NODE_ENV = 'production'

    vi.doMock('@vercel/analytics/server', () => {
      throw new Error('boom')
    })

    const { trackEvent } = await import('./analytics')

    await expect(trackEvent('paid_subscription')).resolves.toBe(false)
  })
})
