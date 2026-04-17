import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { tavily } from '@tavily/core';
import { readFileSync } from 'fs';
import { join } from 'path';

interface ResearchRequest {
  topic: string;
  focus?: string;
}

type TopicCategory = 'tech' | 'business' | 'general';

interface KeywordExtractionResult {
  queries: string[];
  category: TopicCategory;
}

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
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

function getTavilyKey(): string | null {
  if (process.env.TAVILY_API_KEY) {
    return process.env.TAVILY_API_KEY;
  }
  try {
    const envPath = join(process.cwd(), '.env.local');
    const content = readFileSync(envPath, 'utf-8');
    const match = content.match(/TAVILY_API_KEY=(.+)/);
    if (match) return match[1].trim();
  } catch { /* ignore */ }
  try {
    const envPath = join(process.cwd(), '.env');
    const content = readFileSync(envPath, 'utf-8');
    const match = content.match(/TAVILY_API_KEY=(.+)/);
    if (match) return match[1].trim();
  } catch { /* ignore */ }
  return null;
}

async function fetchWebSearch(
  queries: string[],
  tavilyKey: string
): Promise<{ results: TavilyResult[]; raw: string }> {
  try {
    const client = tavily({ apiKey: tavilyKey });
    const allResults: TavilyResult[] = [];
    const seenUrls = new Set<string>();

    await Promise.all(
      queries.map(async (query) => {
        try {
          const response = await client.search(query, {
            searchDepth: 'basic',
            maxResults: 5,
          });
          for (const r of response.results ?? []) {
            if (r.url && !seenUrls.has(r.url)) {
              seenUrls.add(r.url);
              allResults.push({
                title: r.title ?? '',
                url: r.url,
                content: r.content ?? '',
                score: r.score ?? 0,
              });
            }
          }
        } catch {
          // individual query failure — continue
        }
      })
    );

    allResults.sort((a, b) => b.score - a.score);
    const top = allResults.slice(0, 10);

    const raw = top.length > 0
      ? top.map((r, i) => `${i + 1}. "${r.title}" — ${r.content.slice(0, 300)} — ${r.url}`).join('\n')
      : 'No web search results found.';

    return { results: top, raw };
  } catch (err) {
    console.warn('[research] Tavily search failed:', err instanceof Error ? err.message : err);
    return { results: [], raw: 'Web search unavailable.' };
  }
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

    const tavilyKey = getTavilyKey();

    // Step 1: extract search queries AND classify topic category in one call
    const anthropic = new Anthropic({ apiKey });
    let extraction: KeywordExtractionResult;
    try {
      const keywordResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `Analyze this research topic and return a JSON object with two fields:
1. "queries": 3-4 short search queries (2-4 words each) optimized for web search
2. "category": one of "tech" (software, engineering, AI, developer tools), "business" (markets, finance, startups, industries, economics), or "general" (health, lifestyle, career, education, personal decisions, current events)

Return ONLY valid JSON, nothing else.

Topic: ${topic}${focus ? `\nFocus: ${focus}` : ''}

Example output: {"queries": ["AI agents framework", "LLM startup funding", "developer tools market"], "category": "tech"}`,
        }],
      });
      const rawText = keywordResponse.content[0].type === 'text' ? keywordResponse.content[0].text : '{}';
      const parsed = JSON.parse(rawText.replace(/```json\n?|\n?```/g, '').trim());
      extraction = {
        queries: Array.isArray(parsed.queries) ? parsed.queries.slice(0, 4) : [topic.split(' ').slice(0, 4).join(' ')],
        category: (['tech', 'business', 'general'].includes(parsed.category) ? parsed.category : 'general') as TopicCategory,
      };
    } catch {
      extraction = {
        queries: focus ? [focus, topic.split(' ').slice(0, 4).join(' ')] : [topic.split(' ').slice(0, 4).join(' ')],
        category: 'general',
      };
    }

    const { queries, category } = extraction;

    // Step 2: fetch sources based on category routing
    // tech   → Tavily + HN + GitHub
    // business → Tavily + HN
    // general  → Tavily only
    const useHN = category === 'tech' || category === 'business';
    const useGitHub = category === 'tech';

    const [webResult, hnData, ghData] = await Promise.all([
      tavilyKey
        ? fetchWebSearch(queries, tavilyKey)
        : Promise.resolve({ results: [] as TavilyResult[], raw: 'Web search not configured.' }),
      useHN
        ? Promise.all(queries.map(fetchHackerNews))
        : Promise.resolve(null),
      useGitHub
        ? Promise.all(queries.map(fetchGitHub))
        : Promise.resolve(null),
    ]);

    // Merge and deduplicate HN + GitHub results across queries
    const allHnStories: HNHit[] = [];
    const allGhRepos: GitHubRepo[] = [];
    const seenHnIds = new Set<string>();
    const seenGhNames = new Set<string>();

    if (hnData) {
      for (const { stories } of hnData) {
        for (const s of stories) {
          if (!seenHnIds.has(s.objectID)) { seenHnIds.add(s.objectID); allHnStories.push(s); }
        }
      }
    }
    if (ghData) {
      for (const { repos } of ghData) {
        for (const r of repos) {
          if (!seenGhNames.has(r.full_name)) { seenGhNames.add(r.full_name); allGhRepos.push(r); }
        }
      }
    }

    allHnStories.sort((a, b) => b.points - a.points);
    allGhRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);
    const topHnStories = allHnStories.slice(0, 10);
    const topGhRepos = allGhRepos.slice(0, 10);

    const hnRaw = topHnStories.length > 0
      ? topHnStories.map((s, i) => `${i + 1}. "${s.title}" (${s.points} pts, ${s.num_comments} comments) — ${s.url}`).join('\n')
      : null;
    const ghRaw = topGhRepos.length > 0
      ? topGhRepos.map((r, i) => `${i + 1}. ${r.full_name} (${r.stargazers_count.toLocaleString()} stars, ${r.language ?? 'N/A'}) — ${(r.description ?? 'No description').slice(0, 200)} — ${r.html_url}`).join('\n')
      : null;

    // Step 3: build unified sources list (Tavily first, then HN, then GH)
    const seenSourceUrls = new Set<string>();
    const sources: { title: string; url: string; snippet?: string }[] = [];

    for (const r of webResult.results) {
      if (!seenSourceUrls.has(r.url)) {
        seenSourceUrls.add(r.url);
        sources.push({ title: r.title, url: r.url, snippet: r.content.slice(0, 200) });
      }
    }
    for (const s of topHnStories) {
      if (!seenSourceUrls.has(s.url)) {
        seenSourceUrls.add(s.url);
        sources.push({ title: s.title, url: s.url, snippet: `${s.points} points, ${s.num_comments} comments` });
      }
    }
    for (const r of topGhRepos) {
      if (!seenSourceUrls.has(r.html_url)) {
        seenSourceUrls.add(r.html_url);
        sources.push({ title: r.full_name, url: r.html_url, snippet: (r.description ?? '').slice(0, 200) });
      }
    }

    // Step 4: build synthesis prompt with only the sections relevant to available data
    const dataSections: string[] = [];
    if (webResult.results.length > 0) {
      dataSections.push(`=== WEB SEARCH RESULTS ===\n${webResult.raw}`);
    }
    if (hnRaw) {
      dataSections.push(`=== HACKERNEWS DISCUSSIONS ===\n${hnRaw}`);
    }
    if (ghRaw) {
      dataSections.push(`=== GITHUB REPOSITORIES ===\n${ghRaw}`);
    }
    if (dataSections.length === 0) {
      dataSections.push('=== NOTE ===\nNo external data sources were available. Provide a general briefing based on your knowledge.');
    }

    const synthesisPrompt = `You are a strategic research analyst. Synthesize the following real-time data into a structured briefing for a strategic debate.

TOPIC: ${topic}
${focus ? `FOCUS AREA: ${focus}` : ''}
TOPIC CATEGORY: ${category}

${dataSections.join('\n\n')}

Produce a structured briefing with these 5 sections, adapting the headings to fit the topic naturally:

1. **Key Trends** — What patterns and developments dominate this space right now?
2. **Key Players & Landscape** — Who are the major actors, tools, companies, or forces shaping this area?
3. **Opportunities & Gaps** — Where are the unmet needs, underserved angles, or emerging openings?
4. **Risks & Challenges** — What headwinds, obstacles, or counterarguments should a debater be aware of?
5. **Key Data Points** — Specific numbers, stats, or concrete facts worth citing in a debate.

Be specific. Reference actual sources, projects, or data points from the research. Keep the briefing concise but substantive (aim for 400-600 words). If a section isn't well-supported by the data, keep it brief rather than speculating.`;

    // Step 5: stream synthesis back to client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const sourcesEvent = `data: ${JSON.stringify({ type: 'research_sources', sources })}\n\n`;
          controller.enqueue(encoder.encode(sourcesEvent));

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
