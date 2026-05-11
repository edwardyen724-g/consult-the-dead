import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  anthropicCreateMock,
  anthropicStreamMock,
  tavilyMock,
  fetchMock,
} = vi.hoisted(() => ({
  anthropicCreateMock: vi.fn(),
  anthropicStreamMock: vi.fn(),
  tavilyMock: vi.fn(),
  fetchMock: vi.fn(),
}));

vi.mock('@anthropic-ai/sdk', () => ({
  default: class AnthropicMock {
    messages = {
      create: anthropicCreateMock,
      stream: anthropicStreamMock,
    };
  },
}));

vi.mock('@tavily/core', () => ({
  tavily: tavilyMock,
}));

import { POST } from './route';

type SseEvent = {
  type: string;
  [key: string]: unknown;
};

function makeRequest(body: Record<string, unknown>) {
  return new Request('https://example.com/api/research', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

function makeStream(...chunks: string[]) {
  return (async function* () {
    for (const text of chunks) {
      yield {
        type: 'content_block_delta',
        delta: {
          type: 'text_delta',
          text,
        },
      };
    }
  })();
}

function parseSse(text: string): SseEvent[] {
  return text
    .trim()
    .split('\n\n')
    .filter(Boolean)
    .flatMap((event) =>
      event
        .split('\n')
        .filter((line) => line.startsWith('data: '))
        .map((line) => JSON.parse(line.slice('data: '.length)) as SseEvent),
    );
}

function getPrompt() {
  const call = anthropicStreamMock.mock.calls.at(-1);
  if (!call) {
    throw new Error('Expected anthropic stream to be called');
  }

  const payload = call[0] as { messages: Array<{ content: string }> };
  return payload.messages[0].content;
}

async function readResponse(response: Response) {
  const body = await response.text();
  expect(response.status, body).toBe(200);
  return body;
}

async function readJson(response: Response) {
  return {
    status: response.status,
    body: await response.json(),
  };
}

beforeEach(() => {
  process.env.ANTHROPIC_API_KEY = 'sk-test';
  process.env.TAVILY_API_KEY = 'tv-test';

  anthropicCreateMock.mockReset();
  anthropicStreamMock.mockReset();
  tavilyMock.mockReset();
  fetchMock.mockReset();

  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('POST /api/research', () => {
  it('returns 400 when the topic is missing', async () => {
    const response = await POST(makeRequest({ focus: 'tooling' }) as never);

    const { status, body } = await readJson(response);
    expect(status).toBe(400);
    expect(body).toEqual({ error: 'Topic is required' });
  });

  it('returns 500 when the Anthropic key is missing', async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const response = await POST(makeRequest({ topic: 'Research the market' }) as never);

    const { status, body } = await readJson(response);
    expect(status).toBe(500);
    expect(body).toEqual({ error: 'ANTHROPIC_API_KEY not configured' });
  });

  it('falls back to topic-derived queries when keyword extraction fails', async () => {
    anthropicCreateMock.mockRejectedValueOnce(new Error('keyword extraction failed'));
    anthropicStreamMock.mockReturnValue(makeStream('Fallback briefing.'));

    tavilyMock.mockReturnValue({
      search: vi.fn(async () => ({
        results: [
          {
            title: 'Fallback Web',
            url: 'https://example.com/fallback-web',
            content: 'fallback result',
            score: 5,
          },
        ],
      })),
    });

    const response = await POST(makeRequest({ topic: 'Fallback topic', focus: 'focus area' }) as never);

    const events = parseSse(await readResponse(response));
    expect(events[0]).toEqual({
      type: 'research_sources',
      sources: [
        {
          title: 'Fallback Web',
          url: 'https://example.com/fallback-web',
          snippet: 'fallback result',
        },
      ],
    });
    expect(events).toContainEqual({
      type: 'research_chunk',
      text: 'Fallback briefing.',
    });

    const prompt = getPrompt();
    expect(prompt).toContain('=== WEB SEARCH RESULTS ===');
    expect(prompt).not.toContain('=== HACKERNEWS DISCUSSIONS ===');
    expect(prompt).not.toContain('=== GITHUB REPOSITORIES ===');
    expect(prompt).toContain('TOPIC: Fallback topic');
    expect(prompt).toContain('FOCUS AREA: focus area');
  });

  it('surfaces a streamed error event when the synthesis step fails', async () => {
    anthropicCreateMock.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            queries: ['stream failure'],
            category: 'general',
          }),
        },
      ],
    });
    anthropicStreamMock.mockReturnValue(
      (async function* () {
        yield {
          type: 'content_block_delta',
          delta: {
            type: 'text_delta',
            text: 'partial chunk',
          },
        };
        throw new Error('stream broke');
      })(),
    );

    tavilyMock.mockReturnValue({
      search: vi.fn(async () => ({
        results: [],
      })),
    });

    const response = await POST(makeRequest({ topic: 'Stream failure topic' }) as never);

    const events = parseSse(await readResponse(response));
    expect(events).toContainEqual({
      type: 'research_chunk',
      text: 'partial chunk',
    });
    expect(events.at(-1)).toEqual({
      type: 'error',
      message: 'stream broke',
    });
  });

  it('falls back to an empty briefing when web, HN, and GitHub fetches all fail', async () => {
    anthropicCreateMock.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            queries: ['failure case', 'fallback case'],
            category: 'tech',
          }),
        },
      ],
    });
    anthropicStreamMock.mockReturnValue(makeStream('Recovered briefing.'));

    tavilyMock.mockReturnValue({
      search: vi.fn(async () => {
        throw new Error('tavily down');
      }),
    });

    fetchMock.mockRejectedValue(new Error('network down'));

    const response = await POST(makeRequest({ topic: 'Failure handling topic' }) as never);

    const events = parseSse(await readResponse(response));
    expect(events).toEqual([
      {
        type: 'research_sources',
        sources: [],
      },
      {
        type: 'research_chunk',
        text: 'Recovered briefing.',
      },
      {
        type: 'research_complete',
      },
    ]);

    const prompt = getPrompt();
    expect(prompt).toContain('=== NOTE ===');
    expect(prompt).toContain('No external data sources were available.');
  });

  it('returns a 500 JSON error when the request body cannot be parsed', async () => {
    const response = await POST(
      new Request('https://example.com/api/research', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: '{',
      }) as never,
    );

    const { status, body } = await readJson(response);
    expect(status).toBe(500);
    expect(body).toEqual({
      error: expect.stringContaining('JSON'),
    });
  });

  it('keeps web results first and dedupes HN and GitHub sources when HN hits exist', async () => {
    anthropicCreateMock.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            queries: ['ai agents', 'developer tools'],
            category: 'tech',
          }),
        },
      ],
    });
    anthropicStreamMock.mockReturnValue(makeStream('Tech briefing.'));

    tavilyMock.mockReturnValue({
      search: vi.fn(async (query: string) => {
        if (query === 'ai agents') {
          return {
            results: [
              {
                title: 'Web One',
                url: 'https://example.com/web-one',
                content: 'first web result',
                score: 10,
              },
              {
                title: 'Shared Web',
                url: 'https://example.com/shared-web',
                content: 'shared web result',
                score: 8,
              },
            ],
          };
        }

        return {
          results: [
            {
              title: 'Web Two',
              url: 'https://example.com/web-two',
              content: 'second web result',
              score: 9,
            },
            {
              title: 'Shared Web',
              url: 'https://example.com/shared-web',
              content: 'duplicate shared web result',
              score: 7,
            },
          ],
        };
      }),
    });

    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('hn.algolia.com')) {
        const parsed = new URL(url);
        const query = parsed.searchParams.get('query');
        const hits =
          query === 'ai agents'
            ? [
                {
                  title: 'HN One',
                  url: 'https://news.ycombinator.com/item?id=1',
                  objectID: '1',
                  points: 100,
                  num_comments: 20,
                  created_at: '2026-05-11T00:00:00.000Z',
                },
                {
                  title: 'HN Shared',
                  url: 'https://news.ycombinator.com/item?id=shared',
                  objectID: 'shared',
                  points: 75,
                  num_comments: 12,
                  created_at: '2026-05-11T00:00:00.000Z',
                },
              ]
            : [
                {
                  title: 'HN Shared',
                  url: 'https://news.ycombinator.com/item?id=shared',
                  objectID: 'shared',
                  points: 75,
                  num_comments: 12,
                  created_at: '2026-05-11T00:00:00.000Z',
                },
                {
                  title: 'HN Two',
                  url: 'https://news.ycombinator.com/item?id=2',
                  objectID: '2',
                  points: 90,
                  num_comments: 16,
                  created_at: '2026-05-11T00:00:00.000Z',
                },
              ];

        return {
          ok: true,
          json: async () => ({ hits }),
        } as Response;
      }

      if (url.includes('api.github.com/search/repositories')) {
        const parsed = new URL(url);
        const query = parsed.searchParams.get('q');
        const items =
          query === 'ai agents'
            ? [
                {
                  full_name: 'org/repo-one',
                  html_url: 'https://github.com/org/repo-one',
                  description: 'repo one',
                  stargazers_count: 100,
                  language: 'TypeScript',
                  topics: ['ai'],
                },
                {
                  full_name: 'org/shared-repo',
                  html_url: 'https://github.com/org/shared-repo',
                  description: 'shared repo',
                  stargazers_count: 50,
                  language: 'TypeScript',
                  topics: ['agent'],
                },
              ]
            : [
                {
                  full_name: 'org/shared-repo',
                  html_url: 'https://github.com/org/shared-repo',
                  description: 'shared repo duplicate',
                  stargazers_count: 45,
                  language: 'TypeScript',
                  topics: ['agent'],
                },
                {
                  full_name: 'org/repo-two',
                  html_url: 'https://github.com/org/repo-two',
                  description: 'repo two',
                  stargazers_count: 75,
                  language: 'JavaScript',
                  topics: ['tooling'],
                },
              ];

        return {
          ok: true,
          json: async () => ({ items }),
        } as Response;
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    const response = await POST(makeRequest({ topic: 'Research the market', focus: 'tooling' }) as never);

    const events = parseSse(await readResponse(response));

    expect(events[0]).toEqual({
      type: 'research_sources',
      sources: [
        {
          title: 'Web One',
          url: 'https://example.com/web-one',
          snippet: 'first web result',
        },
        {
          title: 'Web Two',
          url: 'https://example.com/web-two',
          snippet: 'second web result',
        },
        {
          title: 'Shared Web',
          url: 'https://example.com/shared-web',
          snippet: 'shared web result',
        },
        {
          title: 'HN One',
          url: 'https://news.ycombinator.com/item?id=1',
          snippet: '100 points, 20 comments',
        },
        {
          title: 'HN Two',
          url: 'https://news.ycombinator.com/item?id=2',
          snippet: '90 points, 16 comments',
        },
        {
          title: 'HN Shared',
          url: 'https://news.ycombinator.com/item?id=shared',
          snippet: '75 points, 12 comments',
        },
        {
          title: 'org/repo-one',
          url: 'https://github.com/org/repo-one',
          snippet: 'repo one',
        },
        {
          title: 'org/repo-two',
          url: 'https://github.com/org/repo-two',
          snippet: 'repo two',
        },
        {
          title: 'org/shared-repo',
          url: 'https://github.com/org/shared-repo',
          snippet: 'shared repo',
        },
      ],
    });
    expect(events.at(-1)).toEqual({ type: 'research_complete' });

    const prompt = getPrompt();
    expect(prompt).toContain('=== WEB SEARCH RESULTS ===');
    expect(prompt).toContain('=== HACKERNEWS DISCUSSIONS ===');
    expect(prompt).toContain('=== GITHUB REPOSITORIES ===');
    expect(prompt.indexOf('=== WEB SEARCH RESULTS ===')).toBeLessThan(prompt.indexOf('=== HACKERNEWS DISCUSSIONS ==='));
    expect(prompt.indexOf('=== HACKERNEWS DISCUSSIONS ===')).toBeLessThan(prompt.indexOf('=== GITHUB REPOSITORIES ==='));
  });

  it('omits the HN section when HN hits are absent and still streams web results', async () => {
    anthropicCreateMock.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            queries: ['market research'],
            category: 'business',
          }),
        },
      ],
    });
    anthropicStreamMock.mockReturnValue(makeStream('Business briefing.'));

    tavilyMock.mockReturnValue({
      search: vi.fn(async () => ({
        results: [
          {
            title: 'Web Only',
            url: 'https://example.com/web-only',
            content: 'a web result',
            score: 12,
          },
        ],
      })),
    });

    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('hn.algolia.com')) {
        return {
          ok: true,
          json: async () => ({ hits: [] }),
        } as Response;
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    const response = await POST(makeRequest({ topic: 'Research the market', focus: 'startups' }) as never);

    const events = parseSse(await readResponse(response));

    expect(events[0]).toEqual({
      type: 'research_sources',
      sources: [
        {
          title: 'Web Only',
          url: 'https://example.com/web-only',
          snippet: 'a web result',
        },
      ],
    });
    expect(events).toContainEqual({
      type: 'research_chunk',
      text: 'Business briefing.',
    });
    expect(events.at(-1)).toEqual({ type: 'research_complete' });

    const prompt = getPrompt();
    expect(prompt).toContain('=== WEB SEARCH RESULTS ===');
    expect(prompt).not.toContain('=== HACKERNEWS DISCUSSIONS ===');
    expect(prompt).not.toContain('=== GITHUB REPOSITORIES ===');
  });

  it('streams a valid briefing when no external sources are available', async () => {
    delete process.env.TAVILY_API_KEY;

    anthropicCreateMock.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            queries: ['general topic'],
            category: 'general',
          }),
        },
      ],
    });
    anthropicStreamMock.mockReturnValue(makeStream('Fallback briefing.'));

    const response = await POST(makeRequest({ topic: 'Research a broad topic' }) as never);

    const events = parseSse(await readResponse(response));

    expect(events).toEqual([
      {
        type: 'research_sources',
        sources: [],
      },
      {
        type: 'research_chunk',
        text: 'Fallback briefing.',
      },
      {
        type: 'research_complete',
      },
    ]);

    const prompt = getPrompt();
    expect(prompt).toContain('=== NOTE ===');
    expect(prompt).toContain('No external data sources were available.');
  });
});
