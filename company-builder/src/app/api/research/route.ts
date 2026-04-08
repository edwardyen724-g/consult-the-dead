import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';

interface ResearchRequest {
  topic: string;
  focus?: string;
}

interface HNHit {
  title: string;
  url: string;
  objectID: string;
  points: number;
  num_comments: number;
  created_at: string;
}

interface GitHubRepo {
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  topics: string[];
}

function getApiKey(): string | null {
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY;
  }
  try {
    const envPath = join(process.cwd(), '.env');
    const content = readFileSync(envPath, 'utf-8');
    const match = content.match(/ANTHROPIC_API_KEY=(.+)/);
    if (match) return match[1].trim();
  } catch { /* ignore */ }
  try {
    const envPath = join(process.cwd(), '..', '.env');
    const content = readFileSync(envPath, 'utf-8');
    const match = content.match(/ANTHROPIC_API_KEY=(.+)/);
    if (match) return match[1].trim();
  } catch { /* ignore */ }
  return null;
}

async function fetchHackerNews(query: string): Promise<{ stories: HNHit[]; raw: string }> {
  try {
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=10`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { stories: [], raw: 'HackerNews API returned an error.' };
    const data = await res.json();
    const stories: HNHit[] = (data.hits ?? []).map((h: Record<string, unknown>) => ({
      title: h.title as string,
      url: (h.url as string) || `https://news.ycombinator.com/item?id=${h.objectID}`,
      objectID: h.objectID as string,
      points: h.points as number,
      num_comments: h.num_comments as number,
      created_at: h.created_at as string,
    }));

    const raw = stories
      .map((s, i) => `${i + 1}. "${s.title}" (${s.points} pts, ${s.num_comments} comments) — ${s.url}`)
      .join('\n');

    return { stories, raw: raw || 'No HackerNews stories found.' };
  } catch {
    return { stories: [], raw: 'Failed to fetch HackerNews data.' };
  }
}

async function fetchGitHub(query: string): Promise<{ repos: GitHubRepo[]; raw: string }> {
  try {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=10`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'GreatMinds-Research/1.0' },
    });
    if (!res.ok) return { repos: [], raw: 'GitHub API returned an error.' };
    const data = await res.json();
    const repos: GitHubRepo[] = (data.items ?? []).map((r: Record<string, unknown>) => ({
      full_name: r.full_name as string,
      html_url: r.html_url as string,
      description: r.description as string | null,
      stargazers_count: r.stargazers_count as number,
      language: r.language as string | null,
      topics: (r.topics as string[]) ?? [],
    }));

    // Filter out spam repos (descriptions > 500 chars are usually abuse)
    const cleanRepos = repos.filter((r) => !r.description || r.description.length < 500);

    const raw = cleanRepos
      .map(
        (r, i) =>
          `${i + 1}. ${r.full_name} (${r.stargazers_count.toLocaleString()} stars, ${r.language ?? 'N/A'}) — ${(r.description ?? 'No description').slice(0, 200)} — ${r.html_url}`
      )
      .join('\n');

    return { repos: cleanRepos, raw: raw || 'No GitHub repositories found.' };
  } catch {
    return { repos: [], raw: 'Failed to fetch GitHub data.' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ResearchRequest = await request.json();
    const { topic, focus } = body;

    if (!topic) {
      return new Response(JSON.stringify({ error: 'Topic is required' }), {
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

    // Extract search-friendly keywords from the conversational topic
    const anthropic = new Anthropic({ apiKey });
    let searchTerms: string[];
    try {
      const keywordResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: `Extract 3-4 short technical search queries (2-4 words each) from this topic for searching HackerNews and GitHub. Return ONLY a JSON array of strings, nothing else.\n\nTopic: ${topic}${focus ? `\nFocus: ${focus}` : ''}\n\nExample output: ["AI agents framework", "developer tools startup", "LLM orchestration"]`,
        }],
      });
      const rawText = keywordResponse.content[0].type === 'text' ? keywordResponse.content[0].text : '[]';
      const parsed = JSON.parse(rawText.replace(/```json\n?|\n?```/g, '').trim());
      searchTerms = Array.isArray(parsed) ? parsed.slice(0, 4) : [topic];
    } catch {
      searchTerms = focus ? [focus, topic.split(' ').slice(0, 4).join(' ')] : [topic.split(' ').slice(0, 4).join(' ')];
    }

    // Fetch from real APIs using extracted search terms (parallel, merge results)
    const allHnStories: HNHit[] = [];
    const allGhRepos: GitHubRepo[] = [];
    const seenHnIds = new Set<string>();
    const seenGhNames = new Set<string>();

    await Promise.all(
      searchTerms.map(async (query) => {
        const [hn, gh] = await Promise.all([fetchHackerNews(query), fetchGitHub(query)]);
        hn.stories.forEach((s) => { if (!seenHnIds.has(s.objectID)) { seenHnIds.add(s.objectID); allHnStories.push(s); } });
        gh.repos.forEach((r) => { if (!seenGhNames.has(r.full_name)) { seenGhNames.add(r.full_name); allGhRepos.push(r); } });
      })
    );

    // Sort by relevance (points for HN, stars for GH) and take top 10
    allHnStories.sort((a, b) => b.points - a.points);
    allGhRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);
    const topHnStories = allHnStories.slice(0, 10);
    const topGhRepos = allGhRepos.slice(0, 10);

    const hnRaw = topHnStories.length > 0
      ? topHnStories.map((s, i) => `${i + 1}. "${s.title}" (${s.points} pts, ${s.num_comments} comments) — ${s.url}`).join('\n')
      : 'No HackerNews stories found.';
    const ghRaw = topGhRepos.length > 0
      ? topGhRepos.map((r, i) => `${i + 1}. ${r.full_name} (${r.stargazers_count.toLocaleString()} stars, ${r.language ?? 'N/A'}) — ${(r.description ?? 'No description').slice(0, 200)} — ${r.html_url}`).join('\n')
      : 'No GitHub repositories found.';

    const hnResult = { stories: topHnStories, raw: hnRaw };
    const ghResult = { repos: topGhRepos, raw: ghRaw };

    // Collect sources
    const sources = [
      ...hnResult.stories.map((s) => ({ title: s.title, url: s.url, snippet: `${s.points} points, ${s.num_comments} comments` })),
      ...ghResult.repos.map((r) => ({ title: r.full_name, url: r.html_url, snippet: (r.description ?? '').slice(0, 200) })),
    ];

    // Synthesize with Claude (reuses anthropic client from keyword extraction)

    const synthesisPrompt = `You are a technology research analyst. Synthesize the following real-time data into a structured briefing for a strategic debate.

TOPIC: ${topic}
${focus ? `FOCUS AREA: ${focus}` : ''}

=== HACKERNEWS TOP STORIES ===
${hnResult.raw}

=== GITHUB TRENDING REPOSITORIES ===
${ghResult.raw}

Produce a structured briefing with these sections:
1. **Key Trends** — What patterns emerge from the data? What topics are getting the most attention?
2. **Emerging Technologies** — What new tools, frameworks, or approaches are gaining traction?
3. **Market Opportunities** — Based on the data, where are the gaps or unmet needs?
4. **Competitive Landscape** — Who are the major players and what are they building?
5. **Key Data Points** — Specific numbers, stats, or metrics worth noting in a debate.

Be specific. Reference actual projects and discussions from the data. Keep the briefing concise but substantive (aim for 400-600 words).`;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send sources first
          const sourcesEvent = `data: ${JSON.stringify({ type: 'research_sources', sources })}\n\n`;
          controller.enqueue(encoder.encode(sourcesEvent));

          // Stream the synthesis
          const messageStream = anthropic.messages.stream({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1200,
            messages: [{ role: 'user', content: synthesisPrompt }],
          });

          for await (const event of messageStream) {
            if (
              event.type === 'content_block_delta' &&
              'delta' in event &&
              event.delta.type === 'text_delta'
            ) {
              const chunkEvent = `data: ${JSON.stringify({ type: 'research_chunk', text: event.delta.text })}\n\n`;
              controller.enqueue(encoder.encode(chunkEvent));
            }
          }

          const doneEvent = `data: ${JSON.stringify({ type: 'research_complete' })}\n\n`;
          controller.enqueue(encoder.encode(doneEvent));
        } catch (err) {
          const errorEvent = `data: ${JSON.stringify({
            type: 'error',
            message: err instanceof Error ? err.message : 'Research synthesis failed',
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
