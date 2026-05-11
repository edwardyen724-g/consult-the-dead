import { describe, expect, it } from 'vitest';
import { createDemoDebateResponse, createDemoResearchResponse } from './demo-mode';

async function readEvents(response: Response): Promise<Record<string, unknown>[]> {
  const body = await response.text();
  return body
    .trim()
    .split('\n\n')
    .filter((line) => line.startsWith('data: '))
    .map((line) => JSON.parse(line.slice(6)) as Record<string, unknown>);
}

describe('demo mode fallback', () => {
  it('streams a research briefing contract when Anthropic is unavailable', async () => {
    const response = createDemoResearchResponse({
      topic: 'Should we launch a design system?',
      focus: 'product velocity',
    });

    expect(response.headers.get('content-type')).toBe('text/event-stream');

    const events = await readEvents(response);
    expect(events[0].type).toBe('research_sources');
    expect(events.at(-1)?.type).toBe('research_complete');

    const sources = events[0].sources as { title: string; url: string }[];
    expect(sources[0].title).toContain('Should we launch a design system?');
    expect(sources[0].url).toContain('/research/');
    const researchText = events
      .filter((event) => event.type === 'research_chunk')
      .map((event) => String(event.text))
      .join(' ');
    expect(researchText).toContain('Demo mode is active');
  });

  it('streams a full debate contract and convergence summary without an API key', async () => {
    const response = createDemoDebateResponse({
      topic: 'Should we hire a second engineer now?',
      minds: [
        { slug: 'steve-jobs', name: 'Steve Jobs', role: 'Chief Executive Officer' },
        { slug: 'maria-curie', name: 'Marie Curie', role: 'Chief Technology Officer' },
      ],
      companyName: 'Northstar Labs',
      companyMission: 'ship a focused product people want',
      rounds: 2,
      documents: ['roadmap draft'],
    });

    expect(response.headers.get('content-type')).toBe('text/event-stream');

    const events = await readEvents(response);
    expect(events.some((event) => event.type === 'speaking')).toBe(true);
    expect(events.some((event) => event.type === 'message_complete')).toBe(true);
    expect(events.some((event) => event.type === 'convergence_started')).toBe(true);
    expect(events.some((event) => event.type === 'convergence_complete')).toBe(true);
    expect(events.at(-1)?.type).toBe('debate_complete');

    const final = events.find((event) => event.type === 'convergence_complete') as { content?: string };
    expect(final.content).toContain('Northstar Labs');
    expect(final.content).toContain('Immediate Next Steps');
  });
});
