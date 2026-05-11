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

describe('debate route demo fallback', () => {
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

  it('streams the demo debate contract when Anthropic is unavailable', async () => {
    const response = await POST(
      new NextRequest('http://localhost/api/debate', {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Should we expand the team?',
          minds: [
            { slug: 'steve-jobs', name: 'Steve Jobs', role: 'Chief Executive Officer' },
            { slug: 'maria-curie', name: 'Marie Curie', role: 'Chief Technology Officer' },
          ],
          companyName: 'Northstar Labs',
          companyMission: 'ship a focused product people want',
          rounds: 2,
          documents: ['roadmap draft'],
        }),
      })
    );

    expect(response.headers.get('content-type')).toBe('text/event-stream');

    const events = await readEventTypes(response);
    expect(events.some((event) => event.type === 'speaking')).toBe(true);
    expect(events.some((event) => event.type === 'message_complete')).toBe(true);
    expect(events.some((event) => event.type === 'convergence_started')).toBe(true);
    expect(events.some((event) => event.type === 'convergence_complete')).toBe(true);
    expect(events.at(-1)?.type).toBe('debate_complete');
  });
});
