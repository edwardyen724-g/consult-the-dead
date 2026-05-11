import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getAllDebateSlugs, getDebate } from '@/lib/debates'

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

const coverageDebate = {
  slug: 'coverage-debate',
  name: 'Coverage Debate',
  forContext: 'A case for branch coverage',
  topic: 'Should the branch gate accept deliberate edge cases?',
  council: ['Niccolò Machiavelli', 'Unknown Sage'],
  date: '2026-05-11',
  rounds: [
    {
      number: 1,
      speeches: [
        {
          advisor: 'Niccolò Machiavelli',
          content: 'Opening paragraph.\n\n- first point\n- second point',
        },
        {
          advisor: 'Unknown Sage',
          content: '\n\n**Bold claim** and *italic aside*.',
        },
      ],
    },
  ],
  consensus: [],
}

beforeEach(() => {
  notFoundMock.mockClear()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.doUnmock('@/lib/debates')
  vi.resetModules()
})

describe('generateStaticParams', () => {
  it('pre-renders every shipped debate slug', () => {
    expect(generateStaticParams()).toEqual(
      getAllDebateSlugs().map((slug) => ({ slug })),
    )
  })
})

describe('generateMetadata', () => {
  it('emits the debate title and robots directives for a real debate', async () => {
    const slug = getAllDebateSlugs()[0]
    const debate = getDebate(slug)

    expect(debate).not.toBeNull()

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug }),
    })

    expect(metadata).toEqual({
      title: `${debate!.name} — Agora Debate`,
      robots: { index: false, follow: false },
    })
  })

  it('returns an empty metadata object for an invalid slug', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'not-a-real-debate' }),
    })

    expect(metadata).toEqual({})
  })
})

describe('DebatePage', () => {
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

describe('DebatePage branch coverage', () => {
  it('renders bullet lists, inline markdown, and the default advisor color branch', async () => {
    vi.doMock('@/lib/debates', () => ({
      getAllDebateSlugs: vi.fn(() => [coverageDebate.slug]),
      getDebate: vi.fn((slug: string) =>
        slug === coverageDebate.slug ? coverageDebate : null,
      ),
    }))

    vi.resetModules()

    const { default: MockedDebatePage } = await import('./page')
    const html = renderToStaticMarkup(
      await MockedDebatePage({
        params: Promise.resolve({ slug: coverageDebate.slug }),
      }),
    )

    expect(html).toContain('Should the branch gate accept deliberate edge cases?')
    expect(html).toContain('<ul')
    expect(html).toContain('<strong>Bold claim</strong>')
    expect(html).toContain('<em>italic aside</em>')
    expect(html).toContain('Unknown Sage')
    expect(html).toContain('var(--fg-dim)')
    expect(html).not.toContain('Council Consensus')
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
