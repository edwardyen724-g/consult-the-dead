import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const fsMock = vi.hoisted(() => ({
  readdirSync: vi.fn(),
  readFileSync: vi.fn(),
}))

vi.mock('fs', () => ({
  default: fsMock,
  readdirSync: fsMock.readdirSync,
  readFileSync: fsMock.readFileSync,
}))

import { getAllDebateSlugs, getDebate } from './debates'

function buildMinimalDebateMarkdown(): string {
  return [
    '# Agora Debate: Minimal Branch Coverage',
    '**For:** A case without a context suffix',
    '**Topic:** Prove the parser fallbacks',
    '**Council:** Ada Lovelace, Alan Turing',
    '**Generated:** 2026-05-11',
  ].join('\n')
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('getAllDebateSlugs', () => {
  it('returns only markdown debate files', () => {
    fsMock.readdirSync.mockReturnValue([
      'alpha.md',
      'README.txt',
      'beta.md',
      'nested',
    ])

    expect(getAllDebateSlugs()).toEqual(['alpha', 'beta'])
  })

  it('returns an empty list when the debates directory cannot be read', () => {
    fsMock.readdirSync.mockImplementation(() => {
      throw new Error('missing directory')
    })

    expect(getAllDebateSlugs()).toEqual([])
  })
})

describe('getDebate', () => {
  it('parses a minimal debate payload without the optional context suffix or body sections', () => {
    fsMock.readFileSync.mockReturnValue(buildMinimalDebateMarkdown())

    expect(getDebate('minimal-branch')).toEqual({
      slug: 'minimal-branch',
      name: 'Minimal Branch Coverage',
      forContext: 'A case without a context suffix',
      topic: 'Prove the parser fallbacks',
      council: ['Ada Lovelace', 'Alan Turing'],
      date: '2026-05-11',
      rounds: [],
      consensus: [],
    })
  })

  it('returns null when the source file cannot be read', () => {
    fsMock.readFileSync.mockImplementation(() => {
      throw new Error('missing file')
    })

    expect(getDebate('missing-branch')).toBeNull()
  })
})
