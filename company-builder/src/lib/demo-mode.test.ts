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

  it('builds a research briefing without a focus cue', async () => {
    const response = createDemoResearchResponse({
      topic: 'How should we improve onboarding?',
    });

    const events = await readEvents(response);
    const sources = events[0].sources as { title: string; url: string }[];
    expect(sources).toHaveLength(1);
    expect(sources[0].title).toContain('How should we improve onboarding?');
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

  it('covers the role-specific fallback language for the full debate loop', async () => {
    const response = createDemoDebateResponse({
      topic: 'How should we prioritize growth?',
      minds: [
        { slug: 'steve-jobs', name: 'Steve Jobs', role: 'Chief Executive Officer' },
        { slug: 'susan-wojcicki', name: 'Susan Wojcicki', role: 'VP Marketing' },
        { slug: 'benioff', name: 'Marc Benioff', role: 'Sales Leader' },
        { slug: 'warren-buffett', name: 'Warren Buffett', role: 'Chief Finance Officer' },
        { slug: 'elon-musk', name: 'Elon Musk', role: 'Operations Lead' },
        { slug: 'satyanadella', name: 'Satya Nadella', role: 'Product Lead' },
        { slug: 'andrew-grove', name: 'Andrew Grove', role: 'Strategy Director' },
        { slug: 'ed-catmull', name: 'Ed Catmull', role: 'Technology Lead' },
      ],
      companyName: 'Northstar Labs',
      companyMission: 'ship a focused product people want',
      rounds: 1,
      researchBriefing: 'The market rewards simple, reversible moves.',
      researchSources: [{ title: 'Market note', url: 'https://consultthedead.com/demo/research/growth' }],
      documents: ['briefing memo'],
    });

    const events = await readEvents(response);
    const contentByMind = new Map(
      events
        .filter((event) => event.type === 'message_complete')
        .map((event) => [String(event.mindName), String(event.content)])
    );

    expect(contentByMind.get('Steve Jobs')).toContain('easiest to reverse and easiest to explain');
    expect(contentByMind.get('Susan Wojcicki')).toContain('crisp user promise and a narrow audience');
    expect(contentByMind.get('Marc Benioff')).toContain('crisp user promise and a narrow audience');
    expect(contentByMind.get('Warren Buffett')).toContain('best risk-adjusted return and the cleanest exit ramp');
    expect(contentByMind.get('Elon Musk')).toContain('reduces coordination and keeps the system legible');
    expect(contentByMind.get('Satya Nadella')).toContain('makes the main decision unmistakable to the user');
    expect(contentByMind.get('Andrew Grove')).toContain('compounds differentiation over time');
    expect(contentByMind.get('Ed Catmull')).toContain('preserves flexibility and observability');
  });
});
