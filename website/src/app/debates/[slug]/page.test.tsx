import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { debateCanonicalUrl, getAllDebateSlugs, getDebate } from '@/lib/debates'

const { notFoundMock } = vi.hoisted(() => ({
  notFoundMock: vi.fn(() => {
    throw new Error('NOT_FOUND')
  }),
}))

vi.mock('next/navigation', () => ({
  notFound: notFoundMock,
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: React.ReactNode
    [key: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

import {
  default as DebatePage,
  dynamicParams,
  generateMetadata,
  generateStaticParams,
} from './page'
import DebatesIndexPage from '../page'

function escapeText(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#x27;')
}

describe('generateStaticParams', () => {
  it('pre-renders every shipped debate slug', () => {
    expect(generateStaticParams()).toEqual(
      getAllDebateSlugs().map((slug) => ({ slug })),
    )
  })
})

describe('generateMetadata', () => {
  it('emits canonical share metadata for a real debate', async () => {
    const slug = getAllDebateSlugs()[0]
    const debate = getDebate(slug)

    expect(debate).not.toBeNull()

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug }),
    })

    expect(metadata).toMatchObject({
      title: `${debate!.name} — Agora Debate`,
      description: `Browse this sample Agora debate on ${debate!.topic} and see how ${debate!.council.join(', ')} argued the decision.`,
      alternates: {
        canonical: debateCanonicalUrl(slug),
      },
      openGraph: {
        title: `${debate!.name} — Agora Debate`,
        description: `Browse this sample Agora debate on ${debate!.topic} and see how ${debate!.council.join(', ')} argued the decision.`,
        url: debateCanonicalUrl(slug),
        type: 'article',
      },
      twitter: {
        card: 'summary',
        title: `${debate!.name} — Agora Debate`,
        description: `Browse this sample Agora debate on ${debate!.topic} and see how ${debate!.council.join(', ')} argued the decision.`,
      },
      robots: { index: false, follow: false },
    })
  })

  it('returns a Not Found title for an invalid slug', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'not-a-real-debate' }),
    })

    expect(metadata).toEqual({ title: 'Not Found' })
  })
})

describe('DebatePage', () => {
  beforeEach(() => {
    notFoundMock.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders a shipped debate and its council', async () => {
    const slug = getAllDebateSlugs()[0]
    const debate = getDebate(slug)

    expect(debate).not.toBeNull()

    const html = renderToStaticMarkup(
      await DebatePage({ params: Promise.resolve({ slug }) }),
    )

    expect(html).toContain(debate!.name)
    expect(html).toContain(escapeText(debate!.topic))
    for (const advisor of debate!.council) {
      expect(html).toContain(advisor)
    }
    expect(html).toContain('Run your own decision →')
  })

  it('throws the route notFound signal for an invalid slug', async () => {
    await expect(
      DebatePage({ params: Promise.resolve({ slug: 'not-a-real-debate' }) }),
    ).rejects.toThrow('NOT_FOUND')

    expect(notFoundMock).toHaveBeenCalled()
  })
})

describe('debates index', () => {
  it('links each public debate card to its canonical detail route', async () => {
    const html = renderToStaticMarkup(await DebatesIndexPage())

    for (const slug of getAllDebateSlugs()) {
      expect(html).toContain(`href="/debates/${slug}"`)
    }

    expect(html).toContain('Enter The Agora →')
  })
})

describe('route contract', () => {
  it('keeps dynamicParams disabled so unknown slugs 404', () => {
    expect(dynamicParams).toBe(false)
  })
})
