import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "content");

export interface FrameworkConfig {
  id: string;
  archetype_name: string;
  archetype_title: string;
  domain: string;
  accent_color: string;
  description: string;
  perceptual_lens: {
    statement: string;
    what_they_notice_first: string;
    what_they_ignore: string;
  };
  bipolar_constructs: Array<{
    construct: string;
    positive_pole: string;
    negative_pole: string;
    behavioral_implication: string;
  }>;
  articles: string[];
  framework_source: string;
}

export interface Article {
  id: string;
  title: string;
  subtitle: string;
  framework_id: string;
  published_date: string;
  reading_time_minutes: number;
  body: Array<{
    type: "paragraph" | "heading";
    content: string;
  }>;
}

export function getAllFrameworks(): FrameworkConfig[] {
  const frameworksDir = path.join(CONTENT_DIR, "frameworks");
  if (!fs.existsSync(frameworksDir)) return [];

  const entries = fs.readdirSync(frameworksDir, { withFileTypes: true });
  const frameworks: FrameworkConfig[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const configPath = path.join(frameworksDir, entry.name, "config.json");
    if (!fs.existsSync(configPath)) continue;

    const raw = fs.readFileSync(configPath, "utf-8");
    frameworks.push(JSON.parse(raw));
  }

  return frameworks;
}

export function getFramework(id: string): FrameworkConfig | null {
  const configPath = path.join(CONTENT_DIR, "frameworks", id, "config.json");
  if (!fs.existsSync(configPath)) return null;

  const raw = fs.readFileSync(configPath, "utf-8");
  return JSON.parse(raw);
}

export function getArticle(id: string): Article | null {
  const articlePath = path.join(CONTENT_DIR, "articles", `${id}.json`);
  if (!fs.existsSync(articlePath)) return null;

  const raw = fs.readFileSync(articlePath, "utf-8");
  return JSON.parse(raw);
}

export function getArticlesForFramework(frameworkId: string): Article[] {
  const framework = getFramework(frameworkId);
  if (!framework) return [];

  return framework.articles
    .map((articleId) => getArticle(articleId))
    .filter((a): a is Article => a !== null);
}
