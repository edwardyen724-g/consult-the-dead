import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const mockCreate = vi.fn();
  const mockStream = vi.fn();
  const mockSearch = vi.fn();
  const mockTavilyFactory = vi.fn();
  const mockFetch = vi.fn();

  interface MockAnthropicInstance {
    messages: {
      create: typeof mockCreate;
      stream: typeof mockStream;
    };
  }

  const MockAnthropic = vi.fn(function MockAnthropicCtor(this: MockAnthropicInstance) {
    this.messages = {
      create: mockCreate,
      stream: mockStream,
    };
  });

  return {
    MockAnthropic,
    mockCreate,
    mockStream,
    mockSearch,
    mockTavilyFactory,
    mockFetch,
  };
});

let POST: typeof import('../src/app/api/research/route').POST;

vi.mock('@anthropic-ai/sdk', () => ({ default: mocks.MockAnthropic }));
vi.mock('@tavily/core', () => ({ tavily: mocks.mockTavilyFactory }));

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function makeRequest(topic = 'Should we launch the new product line this quarter?'): Request {
  return new Request('https://example.com/api/research', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ topic, focus: 'distribution strategy' }),
  });
}

function parseEvents(text: string): Array<{ type: string; [key: string]: unknown }> {
  return text
    .split('\n\n')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const dataLine = chunk.split('\n').find((line) => line.startsWith('data: '));
      if (!dataLine) {
        throw new Error(`Missing SSE payload: ${chunk}`);
      }
      return JSON.parse(dataLine.slice(6));
    });
}

function configureSuccessfulUpstreams() {
  mocks.mockSearch.mockImplementation(async (query: string) => {
    if (query === 'alpha search') {
      return {
        results: [
          {
            title: 'Web Alpha',
            url: 'https://web.example/alpha',
            content: 'alpha content',
            score: 20,
          },
          {
            title: 'Web Beta',
            url: 'https://web.example/beta',
            content: 'beta content',
            score: 10,
          },
        ],
      };
    }

    if (query === 'beta search') {
      return {
        results: [
          {
            title: 'Web Gamma',
            url: 'https://web.example/gamma',
            content: 'gamma content',
            score: 15,
          },
        ],
      };
    }

    return { results: [] };
  });

  mocks.mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
    const url = String(input);

    if (url.includes('hn.algolia.com')) {
      const query = new URL(url).searchParams.get('query');
      if (query === 'alpha search') {
        return jsonResponse({
          hits: [
            {
              title: 'HN Duplicate of Web Gamma',
              url: 'https://web.example/gamma',
              objectID: 'hn-dup',
              points: 99,
              num_comments: 12,
              created_at: '2026-05-10T00:00:00.000Z',
            },
            {
              title: 'HN High',
              url: 'https://hn.example/high',
              objectID: 'hn-high',
              points: 50,
              num_comments: 5,
              created_at: '2026-05-10T00:00:00.000Z',
            },
          ],
        });
      }

      if (query === 'beta search') {
        return jsonResponse({
          hits: [
            {
              title: 'HN Low',
              url: 'https://hn.example/low',
              objectID: 'hn-low',
              points: 40,
              num_comments: 3,
              created_at: '2026-05-10T00:00:00.000Z',
            },
          ],
        });
      }

      return jsonResponse({ hits: [] });
    }

    if (url.includes('api.github.com/search/repositories')) {
      const query = new URL(url).searchParams.get('q');
      if (query === 'alpha search') {
        return jsonResponse({
          items: [
            {
              full_name: 'repo/high',
              html_url: 'https://gh.example/high',
              description: 'High repo',
              stargazers_count: 90,
              language: 'TypeScript',
              topics: ['ai'],
            },
            {
              full_name: 'repo/high',
              html_url: 'https://gh.example/high-dup',
              description: 'Duplicate repo name',
              stargazers_count: 80,
              language: 'TypeScript',
              topics: ['ai'],
            },
          ],
        });
      }

      if (query === 'beta search') {
        return jsonResponse({
          items: [
            {
              full_name: 'repo/low',
              html_url: 'https://gh.example/low',
              description: 'Low repo',
              stargazers_count: 70,
              language: 'TypeScript',
              topics: ['ml'],
            },
          ],
        });
      }

      return jsonResponse({ items: [] });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });
}

beforeAll(async () => {
  ({ POST } = await import('../src/app/api/research/route'));
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', mocks.mockFetch);
  process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
  process.env.TAVILY_API_KEY = 'test-tavily-key';

  mocks.mockCreate.mockResolvedValue({
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          queries: ['alpha search', 'beta search'],
          category: 'tech',
        }),
      },
    ],
  });

  mocks.mockTavilyFactory.mockReturnValue({
    search: mocks.mockSearch,
  });

  mocks.mockStream.mockReturnValue(
    (async function* () {
      yield {
        type: 'content_block_delta' as const,
        delta: { type: 'text_delta' as const, text: 'First chunk. ' },
      };
      yield {
        type: 'content_block_delta' as const,
        delta: { type: 'text_delta' as const, text: 'Second chunk.' },
      };
    })()
  );

  configureSuccessfulUpstreams();
});

describe('POST /api/research', () => {
  it('emits research_sources before chunks and orders web, HN, and GitHub sources deterministically', async () => {
    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(200);
    const events = parseEvents(await response.text());

    expect(events.map((event) => event.type)).toEqual([
      'research_sources',
      'research_chunk',
      'research_chunk',
      'research_complete',
    ]);

    const sourcesEvent = events[0] as { type: 'research_sources'; sources: Array<{ title: string; url: string }> };
    expect(sourcesEvent.sources.map((source) => ({ title: source.title, url: source.url }))).toEqual([
      { title: 'Web Alpha', url: 'https://web.example/alpha' },
      { title: 'Web Gamma', url: 'https://web.example/gamma' },
      { title: 'Web Beta', url: 'https://web.example/beta' },
      { title: 'HN High', url: 'https://hn.example/high' },
      { title: 'HN Low', url: 'https://hn.example/low' },
      { title: 'repo/high', url: 'https://gh.example/high' },
      { title: 'repo/low', url: 'https://gh.example/low' },
    ]);

    expect(events[1]).toMatchObject({
      type: 'research_chunk',
      text: 'First chunk. ',
    });
    expect(events[2]).toMatchObject({
      type: 'research_chunk',
      text: 'Second chunk.',
    });
  });

  it('emits a stable error event when a source fetch fails but still streams the synthesis response', async () => {
    mocks.mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('hn.algolia.com')) {
        throw new Error('HN is down');
      }

      if (url.includes('api.github.com/search/repositories')) {
        return jsonResponse({
          items: [
            {
              full_name: 'repo/high',
              html_url: 'https://gh.example/high',
              description: 'High repo',
              stargazers_count: 90,
              language: 'TypeScript',
              topics: ['ai'],
            },
          ],
        });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(200);
    const events = parseEvents(await response.text());

    expect(events.map((event) => event.type)).toEqual([
      'research_sources',
      'error',
      'research_chunk',
      'research_chunk',
      'research_complete',
    ]);
    expect(events[1]).toMatchObject({
      type: 'error',
      message: 'One or more research source requests failed',
    });
  });

  it('emits a stable error event when the synthesis stream fails', async () => {
    mocks.mockStream.mockReturnValueOnce(
      (async function* () {
        yield {
          type: 'content_block_delta' as const,
          delta: { type: 'text_delta' as const, text: 'Only chunk. ' },
        };
        throw new Error('anthropic synthesis exploded');
      })()
    );

    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(200);
    const events = parseEvents(await response.text());

    expect(events.map((event) => event.type)).toEqual([
      'research_sources',
      'research_chunk',
      'error',
    ]);
    expect(events[2]).toMatchObject({
      type: 'error',
      message: 'Research synthesis failed',
    });
  });
});
