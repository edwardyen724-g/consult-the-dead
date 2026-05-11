export interface DemoResearchRequest {
  topic: string;
  focus?: string;
}

export interface DemoDebateMind {
  slug: string;
  name: string;
  role: string;
}

export interface DemoDebateRequest {
  topic: string;
  minds: DemoDebateMind[];
  companyName: string;
  companyMission: string;
  rounds: number;
  researchBriefing?: string;
  researchSources?: { title: string; url: string }[];
  documents?: string[];
}

interface DemoEvent {
  type: string;
  [key: string]: unknown;
}

const DEMO_SOURCE_BASE = 'https://consultthedead.com/demo';
const DEMO_NOTE = 'Demo mode is active because no Anthropic API key is configured.';

function encodeEvent(controller: ReadableStreamDefaultController<Uint8Array>, encoder: TextEncoder, event: DemoEvent) {
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
}

function chunkText(text: string, size = 110): string[] {
  const normalized = text.trim();
  if (!normalized) return [];

  const chunks: string[] = [];
  for (let index = 0; index < normalized.length; index += size) {
    chunks.push(normalized.slice(index, index + size));
  }
  return chunks;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'topic';
}

function roleFocus(role: string): { angle: string; risk: string; recommendation: string } {
  const normalized = role.toLowerCase();

  if (normalized.includes('technology')) {
    return {
      angle: 'technical simplicity, architecture load, and implementation drag',
      risk: 'the plan introduces brittle systems or hidden maintenance cost',
      recommendation: 'ship the smallest version that preserves flexibility and observability',
    };
  }
  if (normalized.includes('marketing') || normalized.includes('sales')) {
    return {
      angle: 'customer pull, narrative clarity, and distribution leverage',
      risk: 'the company builds something clever that is hard to explain or sell',
      recommendation: 'frame the decision around a crisp user promise and a narrow audience',
    };
  }
  if (normalized.includes('finance')) {
    return {
      angle: 'capital efficiency, downside protection, and optionality',
      risk: 'the initiative burns budget without a measurable payback path',
      recommendation: 'prefer the path with the best risk-adjusted return and the cleanest exit ramp',
    };
  }
  if (normalized.includes('operations')) {
    return {
      angle: 'execution rhythm, process load, and operational bottlenecks',
      risk: 'the team creates a workflow that can not be sustained at scale',
      recommendation: 'choose the option that reduces coordination and keeps the system legible',
    };
  }
  if (normalized.includes('product')) {
    return {
      angle: 'user value, decision clarity, and tradeoff discipline',
      risk: 'the team tries to do too much and loses the core use case',
      recommendation: 'ship the version that makes the main decision unmistakable to the user',
    };
  }
  if (normalized.includes('strategy')) {
    return {
      angle: 'positioning, competitive advantage, and second-order effects',
      risk: 'the move is locally attractive but strategically indistinct',
      recommendation: 'pick the path that compounds differentiation over time',
    };
  }

  return {
    angle: 'decision quality, hidden constraints, and long-term resilience',
    risk: 'the company mistakes motion for progress',
    recommendation: 'favor the option that is easiest to reverse and easiest to explain',
  };
}

function buildResearchBriefing({ topic, focus }: DemoResearchRequest): string {
  const focusLine = focus ? ` Focus the team on ${focus}.` : '';
  return [
    `${DEMO_NOTE}`,
    `Topic: ${topic}.${focusLine}`,
    '',
    'Key trends: The strongest teams are moving toward smaller, faster decisions with explicit ownership. The demo path should make the debate feel immediate instead of waiting on external services.',
    'Key players: The important actors are the product team, the technical owner, and whoever must live with the tradeoffs after launch.',
    'Opportunities and gaps: A local fallback is useful when first-time users want to try the flow before wiring credentials. That lowers friction and keeps the product self-serve.',
    'Risks and challenges: The main risk is that a no-key user sees a dead end. The fallback should preserve the full debate contract so the experience still feels real.',
    'Key data points: Demo responses should remain short, deterministic, and readable. If the topic is specific, the fallback should still echo the topic, the focus, and the decision tension.',
  ].join('\n\n');
}

function buildResearchSources(topic: string, focus?: string): { title: string; url: string }[] {
  const topicSlug = slugify(topic);
  const focusSlug = focus ? slugify(focus) : null;

  return [
    {
      title: `Local demo briefing: ${topic}`,
      url: `${DEMO_SOURCE_BASE}/research/${topicSlug}`,
    },
    ...(focusSlug
      ? [
          {
            title: `Focus cue: ${focus}`,
            url: `${DEMO_SOURCE_BASE}/focus/${focusSlug}`,
          },
        ]
      : []),
  ];
}

function buildMindArgument({
  topic,
  companyName,
  companyMission,
  mind,
  round,
  totalRounds,
  researchBriefing,
  documents,
}: {
  topic: string;
  companyName: string;
  companyMission: string;
  mind: DemoDebateMind;
  round: number;
  totalRounds: number;
  researchBriefing?: string;
  documents?: string[];
}): string {
  const focus = roleFocus(mind.role);
  const docLine = documents && documents.length > 0 ? ` The user attached ${documents.length} reference document${documents.length === 1 ? '' : 's'}, so the answer should respect the supplied context.` : '';
  const researchLine = researchBriefing
    ? ` The research layer already surfaced: ${researchBriefing.slice(0, 220).replace(/\s+/g, ' ')}${researchBriefing.length > 220 ? '...' : ''}`
    : '';

  const firstParagraph = [
    `I am treating ${topic} as a company decision, not a brainstorming prompt.`,
    `From the ${mind.role} seat at ${companyName}, the main question is whether this increases leverage against ${companyMission} without adding avoidable drag.`,
    `My first read is to look at ${focus.angle}.${researchLine}`,
  ].join(' ');

  const secondParagraph = [
    round < totalRounds
      ? `The current draft still needs a sharper constraint: it should stay reversible, easy to explain, and small enough to ship without freezing the rest of the team.`
      : `At the end of the loop, I would choose the path that is easiest to execute, easiest to defend, and most likely to compound over the next six months.`,
    `The thing to avoid is ${focus.risk}.${docLine}`,
  ].join(' ');

  const closing = `Recommendation: ${focus.recommendation}.`;

  return [firstParagraph, secondParagraph, closing].join('\n\n');
}

function buildSynthesis({
  topic,
  companyName,
  companyMission,
  minds,
  researchBriefing,
}: DemoDebateRequest): string {
  const mindNames = minds.map((mind) => mind.name).join(', ');
  const researchLine = researchBriefing
    ? `\n\nResearch context: ${researchBriefing.slice(0, 260).replace(/\s+/g, ' ')}${researchBriefing.length > 260 ? '...' : ''}`
    : '';

  return [
    `## Consensus`,
    `The panel agrees that ${topic} should be decided with a narrow scope, a visible owner, and a path that keeps momentum high.`,
    '',
    `## Tensions`,
    `The tension is between speed and certainty: ${mindNames} all want the decision to work, but each role wants a different kind of safety.`,
    '',
    `## Recommendation`,
    `For ${companyName}, the strongest move is to choose the smallest version that still advances ${companyMission}. That keeps the company learning while avoiding overcommitment.${researchLine}`,
    '',
    `## Immediate Next Steps`,
    `1. Write the decision in one sentence.`,
    `2. Define the owner and the success metric.`,
    `3. Ship the smallest reversible version.`,
    `4. Revisit after the first real signal.`,
    '',
    `## Risks`,
    `The biggest risk is that the team mistakes a polished narrative for validated progress. Keep the fallback honest and keep the live API path untouched when a key is present.`,
  ].join('\n');
}

export function createDemoResearchResponse(request: DemoResearchRequest): Response {
  const encoder = new TextEncoder();
  const sources = buildResearchSources(request.topic, request.focus);
  const briefing = buildResearchBriefing(request);

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      try {
        encodeEvent(controller, encoder, { type: 'research_sources', sources });
        for (const chunk of chunkText(briefing)) {
          encodeEvent(controller, encoder, { type: 'research_chunk', text: chunk });
        }
        encodeEvent(controller, encoder, { type: 'research_complete' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

export function createDemoDebateResponse(request: DemoDebateRequest): Response {
  const encoder = new TextEncoder();
  const totalRounds = Math.max(1, Math.min(request.rounds || 1, 3));
  const briefing = request.researchBriefing?.trim() || buildResearchBriefing({ topic: request.topic });

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      try {
        for (let round = 1; round <= totalRounds; round += 1) {
          for (const mind of request.minds) {
            const content = buildMindArgument({
              topic: request.topic,
              companyName: request.companyName,
              companyMission: request.companyMission,
              mind,
              round,
              totalRounds,
              researchBriefing: briefing,
              documents: request.documents,
            });

            encodeEvent(controller, encoder, {
              type: 'speaking',
              mindSlug: mind.slug,
              mindName: mind.name,
              round,
            });

            for (const chunk of chunkText(content, 90)) {
              encodeEvent(controller, encoder, {
                type: 'chunk',
                mindSlug: mind.slug,
                text: chunk,
              });
            }

            encodeEvent(controller, encoder, {
              type: 'message_complete',
              mindSlug: mind.slug,
              mindName: mind.name,
              content,
              round,
            });
          }
        }

        encodeEvent(controller, encoder, { type: 'convergence_started' });
        const synthesis = buildSynthesis({
          topic: request.topic,
          companyName: request.companyName,
          companyMission: request.companyMission,
          minds: request.minds,
          rounds: totalRounds,
          researchBriefing: briefing,
          researchSources: request.researchSources,
          documents: request.documents,
        });

        for (const chunk of chunkText(synthesis, 100)) {
          encodeEvent(controller, encoder, {
            type: 'convergence_chunk',
            text: chunk,
          });
        }

        encodeEvent(controller, encoder, {
          type: 'convergence_complete',
          content: synthesis,
        });
        encodeEvent(controller, encoder, { type: 'debate_complete' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
