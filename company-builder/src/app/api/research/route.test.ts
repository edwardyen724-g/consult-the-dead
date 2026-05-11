import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { POST } from './route';

function readEventTypes(response: Response): Promise<Record<string, unknown>[]> {
  return response.text().then((body) =>
    body
      .trim()
      .split('\n\n')
      .filter((line) => line.startsWith('data: '))
      .map((line) => JSON.parse(line.slice(6)) as Record<string, unknown>)
  );
}

describe('research route demo fallback', () => {
  const originalApiKey = process.env.ANTHROPIC_API_KEY;

  beforeEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
  });

  afterEach(() => {
    if (originalApiKey === undefined) {
      delete process.env.ANTHROPIC_API_KEY;
      return;
    }

    process.env.ANTHROPIC_API_KEY = originalApiKey;
  });

  it('streams the demo research contract when Anthropic is unavailable', async () => {
    const response = await POST(
      new NextRequest('http://localhost/api/research', {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Should we launch a design system?',
          focus: 'product velocity',
        }),
      })
    );

    expect(response.headers.get('content-type')).toBe('text/event-stream');

    const events = await readEventTypes(response);
    expect(events[0].type).toBe('research_sources');
    expect(events.some((event) => event.type === 'research_chunk')).toBe(true);
    expect(events.at(-1)?.type).toBe('research_complete');
  });
});
