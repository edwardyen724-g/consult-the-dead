import { describe, expect, it } from 'vitest'
import { NUDGE_EMAIL_ID, NUDGE_PROMPTS, renderNudge } from './nudge'

describe('renderNudge', () => {
  it('emits Variant A subject', () => {
    expect(renderNudge().subject).toBe(
      "You haven't asked them anything yet",
    )
  })

  it('greets by first name with fallback', () => {
    expect(renderNudge({ firstName: 'Lin' }).text).toContain('Hi Lin,')
    expect(renderNudge().text).toContain('Hi there,')
  })

  it('includes all 5 canonical prompts in order', () => {
    const text = renderNudge().text
    NUDGE_PROMPTS.forEach((q, i) => {
      const m = text.match(new RegExp(`${i + 1}\\. ${escapeRegex(q)}`))
      expect(m, `expected prompt ${i + 1} to be present: ${q}`).not.toBeNull()
    })
  })

  it('each prompt has its own UTM-tagged URL with topic= query param', () => {
    const text = renderNudge().text
    const urlMatches = text.match(/https:\/\/www\.consultthedead\.com\/agora\?[^\s]+/g) ?? []
    // Expect at least 5 prompt links + 1 CTA = 6 URLs.
    expect(urlMatches.length).toBeGreaterThanOrEqual(NUDGE_PROMPTS.length + 1)

    // All prompt URLs should carry topic= AND nudge UTMs.
    const promptUrls = urlMatches.filter((u) => u.includes('topic='))
    expect(promptUrls).toHaveLength(NUDGE_PROMPTS.length)

    for (const u of promptUrls) {
      const url = new URL(u)
      expect(url.searchParams.get('utm_source')).toBe('email')
      expect(url.searchParams.get('utm_campaign')).toBe('nudge')
      expect(url.searchParams.get('utm_content')).toBe(NUDGE_EMAIL_ID)
      expect(url.searchParams.get('topic')).not.toBeNull()
    }
  })

  it('emits a generic Pick-one-and-start CTA without topic= but with UTM', () => {
    const text = renderNudge().text
    const m = text.match(/Pick one and start:\s*(\S+)/)
    expect(m).not.toBeNull()
    const url = new URL(m![1])
    expect(url.searchParams.get('topic')).toBeNull()
    expect(url.searchParams.get('utm_campaign')).toBe('nudge')
    expect(url.searchParams.get('utm_content')).toBe(NUDGE_EMAIL_ID)
  })

  it('html contains an ordered list of prompt links', () => {
    const html = renderNudge().html
    expect(html).toContain('<ol')
    NUDGE_PROMPTS.forEach((q) => {
      expect(html).toContain(escapeForHtmlContains(q))
    })
  })
})

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function escapeForHtmlContains(s: string): string {
  // Mirror the renderer's HTML escaping so we can match the rendered output.
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
