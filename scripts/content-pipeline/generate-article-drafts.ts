#!/usr/bin/env tsx

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export type TopicType = "decision" | "insight" | "method";

export interface TopicRecord {
  slug: string;
  type: TopicType;
  searchVolumeEstimate: "high" | "medium" | "low";
  primaryQuery: string;
  secondaryQueries: string[];
  recommendedCouncil: string[];
  hookAngles: string[];
  status: "queued" | "drafting" | "shipped" | "killed";
  shippedAt?: string | null;
}

export interface FrameworkIncidentSummary {
  id: string;
  decision: string;
}

export interface FrameworkConstructSummary {
  construct: string;
  behavioralImplication: string;
}

export interface FrameworkSummary {
  slug: string;
  person: string;
  title: string;
  accentColor?: string;
  incident: FrameworkIncidentSummary;
  construct: FrameworkConstructSummary;
}

export interface ArticleDraftArtifact {
  slug: string;
  title: string;
  type: TopicType;
  sourceTopic: TopicRecord;
  generatedAt: string;
  routePath: string;
  articleUrl: string;
  intro: string;
  internalCta: string;
  frameworkCitations: FrameworkSummary[];
  searchConsolePayload: {
    url: string;
    type: "URL_UPDATED";
  };
}

export interface DraftOutputs {
  markdownPath: string;
  searchConsolePath: string;
}

export interface DraftOptions {
  siteBaseUrl?: string;
  generatedAt?: string;
}

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DEFAULT_TOPICS_PATH = path.join(ROOT_DIR, "topics.yaml");
const DEFAULT_OUTPUT_DIR = path.join(ROOT_DIR, "output", "content-pipeline");
const DEFAULT_SITE_BASE_URL = "https://consultthedead.com";
const FALLBACK_COUNCIL = ["marcus-aurelius", "niccolo-machiavelli", "sun-tzu"];
const ACRONYMS = new Map([
  ["ai", "AI"],
  ["api", "API"],
  ["cdm", "CDM"],
  ["cta", "CTA"],
  ["geo", "GEO"],
  ["lp", "LP"],
  ["mrr", "MRR"],
  ["seo", "SEO"],
  ["vc", "VC"],
  ["vp", "VP"],
  ["oda", "ODA"],
  ["ooda", "OODA"],
]);
const LOWERCASE_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "by",
  "for",
  "in",
  "into",
  "of",
  "on",
  "or",
  "over",
  "the",
  "to",
  "vs",
  "vs.",
  "with",
]);
const TOPIC_KEY_ALIASES: Record<string, keyof TopicRecord> = {
  hook_angles: "hookAngles",
  primary_query: "primaryQuery",
  recommended_council: "recommendedCouncil",
  search_volume_estimate: "searchVolumeEstimate",
  secondary_queries: "secondaryQueries",
  shipped_at: "shippedAt",
};

function normalizeTopicKey(rawKey: string): keyof TopicRecord {
  return (TOPIC_KEY_ALIASES[rawKey] ?? rawKey) as keyof TopicRecord;
}

function stripComment(line: string): string {
  let inSingle = false;
  let inDouble = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }
    if (char === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }
    if (char === "#" && !inSingle && !inDouble) {
      return line.slice(0, index).trimEnd();
    }
  }

  return line.trimEnd();
}

function parseScalar(rawValue: string): string | null | string[] {
  const value = rawValue.trim();

  if (value === "null" || value === "~") {
    return null;
  }

  if (value === "[]") {
    return [];
  }

  if (value.startsWith("[") && value.endsWith("]")) {
    return parseInlineArray(value.slice(1, -1));
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function parseInlineArray(rawValue: string): string[] {
  const items: string[] = [];
  let current = "";
  let inSingle = false;
  let inDouble = false;

  for (let index = 0; index < rawValue.length; index += 1) {
    const char = rawValue[index];
    if (char === "'" && !inDouble) {
      inSingle = !inSingle;
      current += char;
      continue;
    }
    if (char === '"' && !inSingle) {
      inDouble = !inDouble;
      current += char;
      continue;
    }
    if (char === "," && !inSingle && !inDouble) {
      const parsed = parseScalar(current);
      if (typeof parsed === "string" && parsed.length > 0) {
        items.push(parsed);
      }
      current = "";
      continue;
    }
    current += char;
  }

  const parsed = parseScalar(current);
  if (typeof parsed === "string" && parsed.length > 0) {
    items.push(parsed);
  }

  return items;
}

function normalizeTopicRecord(record: Partial<TopicRecord>): TopicRecord {
  if (!record.slug || !record.type || !record.searchVolumeEstimate || !record.primaryQuery) {
    throw new Error(`Invalid topic record: ${JSON.stringify(record)}`);
  }

  return {
    slug: record.slug,
    type: record.type,
    searchVolumeEstimate: record.searchVolumeEstimate,
    primaryQuery: record.primaryQuery,
    secondaryQueries: record.secondaryQueries ?? [],
    recommendedCouncil: record.recommendedCouncil ?? [],
    hookAngles: record.hookAngles ?? [],
    status: record.status ?? "queued",
    shippedAt: record.shippedAt ?? null,
  };
}

export function parseTopicsYaml(source: string): TopicRecord[] {
  const topics: TopicRecord[] = [];
  let current: Partial<TopicRecord> | null = null;
  let currentListKey: keyof TopicRecord | null = null;

  const flush = () => {
    if (current) {
      topics.push(normalizeTopicRecord(current));
    }
    current = null;
    currentListKey = null;
  };

  for (const rawLine of source.split(/\r?\n/)) {
    const line = stripComment(rawLine);
    if (!line.trim()) {
      continue;
    }

    const trimmed = line.trim();
    const indent = rawLine.match(/^(\s*)/)?.[1].length ?? 0;

    if (indent > 0 && trimmed.startsWith("- ") && currentListKey) {
      const existing = current[currentListKey];
      const parsed = parseScalar(trimmed.slice(2));
      if (!Array.isArray(existing)) {
        current[currentListKey] = [];
      }
      if (typeof parsed === "string") {
        (current[currentListKey] as string[]).push(parsed);
      }
      continue;
    }

    if (indent === 0 && trimmed.startsWith("- ")) {
      if (current) {
        flush();
      }

      current = {};
      currentListKey = null;
      const inlineEntry = trimmed.slice(2).trim();
      if (!inlineEntry) {
        continue;
      }

      const colonIndex = inlineEntry.indexOf(":");
      if (colonIndex === -1) {
        throw new Error(`Malformed topic entry: ${inlineEntry}`);
      }

      const key = normalizeTopicKey(inlineEntry.slice(0, colonIndex).trim());
      const rawValue = inlineEntry.slice(colonIndex + 1);
      const parsed = parseScalar(rawValue);
      if (Array.isArray(parsed)) {
        current[key] = parsed as never;
      } else {
        current[key] = parsed as never;
      }
      continue;
    }

    if (!current) {
      continue;
    }

    const keyValueMatch = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*):(?:\s*(.*))?$/);
    if (!keyValueMatch) {
      continue;
    }

    const [, rawKey, rawValue = ""] = keyValueMatch;
    const key = normalizeTopicKey(rawKey);
    const parsed = parseScalar(rawValue);

    if (Array.isArray(parsed)) {
      current[key] = parsed as never;
      currentListKey = null;
      continue;
    }

    if (parsed === null) {
      current[key] = null as never;
      currentListKey = null;
      continue;
    }

    if (rawValue.trim() === "") {
      current[key] = [] as never;
      currentListKey = key;
      continue;
    }

    current[key] = parsed as never;
    currentListKey = null;
  }

  if (current) {
    flush();
  }

  return topics;
}

export async function loadTopicsFromFile(topicsPath = DEFAULT_TOPICS_PATH): Promise<TopicRecord[]> {
  const source = await fs.readFile(topicsPath, "utf8");
  return parseTopicsYaml(source);
}

export function slugToTitle(slug: string): string {
  const words = slug
    .split("-")
    .filter(Boolean)
    .map((word, index, allWords) => {
      const normalized = word.toLowerCase();
      const acronym = ACRONYMS.get(normalized);
      if (acronym) {
        return acronym;
      }
      if (normalized === "i") {
        return "I";
      }
      if (index !== 0 && index !== allWords.length - 1 && LOWERCASE_WORDS.has(normalized)) {
        return normalized;
      }
      return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    });

  return words.join(" ");
}

export function routePathForTopicType(type: TopicType): string {
  if (type === "decision") {
    return "decisions";
  }
  if (type === "method") {
    return "methods";
  }
  return "insights";
}

export function selectTopicRecord(
  topics: readonly TopicRecord[],
  selector?: { slug?: string; record?: TopicRecord },
): TopicRecord {
  if (selector?.record) {
    return selector.record;
  }

  if (selector?.slug) {
    const match = topics.find((topic) => topic.slug === selector.slug);
    if (!match) {
      throw new Error(`Unknown topic slug: ${selector.slug}`);
    }
    return match;
  }

  const queued = topics.find((topic) => topic.status === "queued");
  if (!queued) {
    throw new Error("No queued topic records available");
  }

  return queued;
}

function chooseFrameworkSlugs(topic: TopicRecord): string[] {
  const slugs = topic.recommendedCouncil.length > 0 ? topic.recommendedCouncil : FALLBACK_COUNCIL;
  return [...new Set(slugs)];
}

async function readFrameworkSummary(frameworkSlug: string): Promise<FrameworkSummary> {
  const frameworkPath = path.join(ROOT_DIR, "frameworks", frameworkSlug, "framework.json");
  const source = await fs.readFile(frameworkPath, "utf8");
  const framework = JSON.parse(source) as {
    meta?: { person?: string; accent_color?: string };
    bipolar_constructs?: Array<{ construct?: string; behavioral_implication?: string }>;
    critical_incident_database?: Array<{ id?: string; decision?: string }>;
  };

  const person = framework.meta?.person ?? frameworkSlug;
  const construct = framework.bipolar_constructs?.[0];
  const incident = framework.critical_incident_database?.[0];

  if (!construct || !construct.construct || !construct.behavioral_implication) {
    throw new Error(`Framework ${frameworkSlug} is missing a construct summary`);
  }

  if (!incident || !incident.id || !incident.decision) {
    throw new Error(`Framework ${frameworkSlug} is missing an incident summary`);
  }

  return {
    slug: frameworkSlug,
    person,
    title: person,
    accentColor: framework.meta?.accent_color,
    construct: {
      construct: construct.construct,
      behavioralImplication: construct.behavioral_implication,
    },
    incident: {
      id: incident.id,
      decision: incident.decision,
    },
  };
}

function buildIntro(topic: TopicRecord, title: string, frameworkNames: string[]): string {
  if (topic.type === "decision") {
    return [
      `The question “${topic.primaryQuery}” is a control problem disguised as a finance question.`,
      `This draft treats it as a choice between speed, optionality, and the kind of constraint that matters six months from now, then grounds the answer in the documented reasoning patterns of ${frameworkNames.join(", ")}.`,
    ].join(" ");
  }

  if (topic.type === "method") {
    return [
      `${title} only matters if it is operational, not decorative.`,
      `This draft explains the method through the constructs and incidents that make it reusable, using ${frameworkNames.join(", ")} as the citation spine.`,
    ].join(" ");
  }

  return [
    `The useful answer to “${topic.primaryQuery}” is not a slogan.`,
    `This draft reconstructs the pattern from documented incidents in ${frameworkNames.join(", ")}, so the reader gets a real framework rather than a quote-card summary.`,
  ].join(" ");
}

function buildInternalCta(slug: string): string {
  return `[Run your own version in the Agora](/agora?utm_source=content_engine&utm_medium=article_draft&utm_campaign=content_engine_article_draft&utm_content=${slug})`;
}

export async function buildArticleDraft(
  topic: TopicRecord,
  options: DraftOptions = {},
): Promise<ArticleDraftArtifact> {
  const routePath = routePathForTopicType(topic.type);
  const title = slugToTitle(topic.slug);
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const siteBaseUrl = options.siteBaseUrl ?? DEFAULT_SITE_BASE_URL;
  const articleUrl = `${siteBaseUrl.replace(/\/$/, "")}/${routePath}/${topic.slug}`;
  const frameworkSummaries = await Promise.all(chooseFrameworkSlugs(topic).map(readFrameworkSummary));
  const intro = buildIntro(topic, title, frameworkSummaries.map((summary) => summary.person));
  const internalCta = buildInternalCta(topic.slug);
  const searchConsolePayload = {
    url: articleUrl,
    type: "URL_UPDATED" as const,
  };

  return {
    slug: topic.slug,
    title,
    type: topic.type,
    sourceTopic: topic,
    generatedAt,
    routePath,
    articleUrl,
    intro,
    internalCta,
    frameworkCitations: frameworkSummaries,
    searchConsolePayload,
  };
}

export function renderArticleDraftMarkdown(draft: ArticleDraftArtifact): string {
  const citationBlock = draft.frameworkCitations
    .map((framework) => {
      return [
        `- **${framework.person}**`,
        `  - Construct: ${framework.construct.construct}`,
        `  - Incident: ${framework.incident.id}`,
        `  - Decision: ${framework.incident.decision}`,
      ].join("\n");
    })
    .join("\n");

  return [
    "---",
    `slug: ${draft.slug}`,
    `title: ${JSON.stringify(draft.title)}`,
    `type: ${draft.type}`,
    `source_topic: ${JSON.stringify(draft.sourceTopic.primaryQuery)}`,
    `generated_at: ${draft.generatedAt}`,
    `search_console_url: ${draft.searchConsolePayload.url}`,
    "---",
    "",
    `# ${draft.title}`,
    "",
    "## Intro",
    draft.intro,
    "",
    "## Internal link CTA",
    draft.internalCta,
    "",
    "## Framework citations",
    citationBlock,
    "",
    "## Search Console payload",
    "```json",
    JSON.stringify(draft.searchConsolePayload, null, 2),
    "```",
    "",
  ].join("\n");
}

export function buildOutputPaths(
  draft: Pick<ArticleDraftArtifact, "slug" | "type">,
  outputDir = DEFAULT_OUTPUT_DIR,
): DraftOutputs {
  const routePath = routePathForTopicType(draft.type);
  return {
    markdownPath: path.join(outputDir, "drafts", routePath, `${draft.slug}.md`),
    searchConsolePath: path.join(outputDir, "search-console", `${draft.slug}.json`),
  };
}

export async function writeDraftArtifacts(
  draft: ArticleDraftArtifact,
  outputDir = DEFAULT_OUTPUT_DIR,
): Promise<DraftOutputs> {
  const outputs = buildOutputPaths(draft, outputDir);
  await fs.mkdir(path.dirname(outputs.markdownPath), { recursive: true });
  await fs.mkdir(path.dirname(outputs.searchConsolePath), { recursive: true });
  await fs.writeFile(outputs.markdownPath, renderArticleDraftMarkdown(draft), "utf8");
  await fs.writeFile(outputs.searchConsolePath, `${JSON.stringify(draft.searchConsolePayload, null, 2)}\n`, "utf8");
  return outputs;
}

export function parseArgv(argv: string[]) {
  const options: {
    slug?: string;
    topicsPath: string;
    outputDir: string;
    dryRun: boolean;
    siteBaseUrl?: string;
  } = {
    topicsPath: DEFAULT_TOPICS_PATH,
    outputDir: DEFAULT_OUTPUT_DIR,
    dryRun: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--slug" && argv[index + 1]) {
      options.slug = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--topics" && argv[index + 1]) {
      options.topicsPath = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--output-dir" && argv[index + 1]) {
      options.outputDir = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--site-base-url" && argv[index + 1]) {
      options.siteBaseUrl = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (arg === "--no-dry-run") {
      options.dryRun = false;
      continue;
    }
  }

  return options;
}

export async function runCli(argv = process.argv.slice(2)): Promise<void> {
  const options = parseArgv(argv);
  const topics = await loadTopicsFromFile(options.topicsPath);
  const topic = selectTopicRecord(topics, { slug: options.slug });
  const draft = await buildArticleDraft(topic, {
    siteBaseUrl: options.siteBaseUrl,
  });
  const outputs = await writeDraftArtifacts(draft, options.outputDir);

  const mode = options.dryRun ? "dry-run" : "write";
  process.stdout.write(
    [
      `[${mode}] topic=${topic.slug}`,
      `markdown=${outputs.markdownPath}`,
      `search_console=${outputs.searchConsolePath}`,
      `url=${draft.articleUrl}`,
    ].join("\n"),
  );
  process.stdout.write("\n");
}

const isMainModule = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMainModule) {
  void runCli();
}
