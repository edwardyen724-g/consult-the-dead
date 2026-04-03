import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { frameworkToSystemPrompt } from '@/lib/frameworkPrompt';

const FRAMEWORKS_DIR = join(process.cwd(), '..', 'frameworks');

interface DebateMind {
  slug: string;
  name: string;
  role: string;
}

interface DebateRequest {
  topic: string;
  minds: DebateMind[];
  companyName: string;
  companyMission: string;
  rounds: number;
}

function loadFramework(slug: string): Record<string, unknown> | null {
  try {
    const path = join(FRAMEWORKS_DIR, slug, 'framework.json');
    const raw = readFileSync(path, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getApiKey(): string | null {
  // First try process.env (Next.js should load .env)
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY;
  }
  // Fallback: read .env file directly
  try {
    const envPath = join(process.cwd(), '.env');
    const content = readFileSync(envPath, 'utf-8');
    const match = content.match(/ANTHROPIC_API_KEY=(.+)/);
    if (match) return match[1].trim();
  } catch { /* ignore */ }
  // Try parent directory
  try {
    const envPath = join(process.cwd(), '..', '.env');
    const content = readFileSync(envPath, 'utf-8');
    const match = content.match(/ANTHROPIC_API_KEY=(.+)/);
    if (match) return match[1].trim();
  } catch { /* ignore */ }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body: DebateRequest = await request.json();
    const { topic, minds, companyName, companyMission, rounds = 3 } = body;

    if (!topic || !minds || minds.length < 2) {
      return new Response(JSON.stringify({ error: 'Need topic and at least 2 minds' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Load framework system prompts
    const mindPrompts = new Map<string, string>();
    for (const mind of minds) {
      const framework = loadFramework(mind.slug);
      if (framework) {
        mindPrompts.set(mind.slug, frameworkToSystemPrompt(framework));
      } else {
        mindPrompts.set(
          mind.slug,
          `You are ${mind.name}. Reason as they would — with their historical knowledge, values, thinking patterns, and personality. Speak in first person. Be opinionated and specific.`
        );
      }
    }

    const anthropic = new Anthropic({ apiKey });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const allMessages: { mindSlug: string; mindName: string; content: string; round: number }[] = [];

        try {
          for (let round = 1; round <= rounds; round++) {
            for (const mind of minds) {
              const systemPrompt = mindPrompts.get(mind.slug) || '';

              const conversationSoFar = allMessages
                .map((m) => `${m.mindName} (Round ${m.round}): ${m.content}`)
                .join('\n\n');

              const otherMinds = minds
                .filter((m) => m.slug !== mind.slug)
                .map((m) => `${m.name} (${m.role})`)
                .join(', ');

              const userPrompt = `You are ${mind.name}, serving as ${mind.role} at ${companyName}.
The company's mission: ${companyMission}.

You are in a debate with: ${otherMinds}.
Topic: ${topic}

${conversationSoFar ? `Conversation so far:\n${conversationSoFar}\n\n` : ''}Respond as ${mind.name} would — in their voice, with their reasoning style, drawing on their domain expertise. Be substantive. Take a position. Disagree if you would disagree. Concede if convinced. Be yourself.

This is round ${round} of ${rounds}. ${round === 1 ? 'Open with your initial position.' : round === rounds ? 'This is the final round — make your strongest closing argument.' : 'Address what others have said and develop your position.'}

Keep your response to 2-3 paragraphs. Do NOT use the reasoning protocol headers (FRAME, CATEGORIZE, etc.) — just speak naturally as ${mind.name} would in a conversation.`;

              // Send "speaking" event
              const speakingEvent = `data: ${JSON.stringify({
                type: 'speaking',
                mindSlug: mind.slug,
                mindName: mind.name,
                round,
              })}\n\n`;
              controller.enqueue(encoder.encode(speakingEvent));

              // Call Claude
              let fullContent = '';
              const messageStream = anthropic.messages.stream({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 800,
                system: systemPrompt,
                messages: [{ role: 'user', content: userPrompt }],
              });

              for await (const event of messageStream) {
                if (
                  event.type === 'content_block_delta' &&
                  'delta' in event &&
                  event.delta.type === 'text_delta'
                ) {
                  const text = event.delta.text;
                  fullContent += text;

                  const chunkEvent = `data: ${JSON.stringify({
                    type: 'chunk',
                    mindSlug: mind.slug,
                    text,
                  })}\n\n`;
                  controller.enqueue(encoder.encode(chunkEvent));
                }
              }

              allMessages.push({
                mindSlug: mind.slug,
                mindName: mind.name,
                content: fullContent,
                round,
              });

              const completeEvent = `data: ${JSON.stringify({
                type: 'message_complete',
                mindSlug: mind.slug,
                mindName: mind.name,
                content: fullContent,
                round,
              })}\n\n`;
              controller.enqueue(encoder.encode(completeEvent));
            }
          }

          const doneEvent = `data: ${JSON.stringify({ type: 'debate_complete' })}\n\n`;
          controller.enqueue(encoder.encode(doneEvent));
        } catch (err) {
          const errorEvent = `data: ${JSON.stringify({
            type: 'error',
            message: err instanceof Error ? err.message : 'Unknown error',
          })}\n\n`;
          controller.enqueue(encoder.encode(errorEvent));
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
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
