#!/usr/bin/env node

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

type ArticleKind = "single" | "collision";

type CliOptions = {
  framework?: string;
  topic?: string;
  slug?: string;
  type: ArticleKind;
  collisionFrameworks: string[];
  output?: string;
  dryRun: boolean;
};

type GeneratedArticle = {
  type: ArticleKind;
  slug: string;
  title: string;
  description: string;
  decision_type: string;
  hook_question: string;
  framework_slug: string;
  collision_frameworks?: [string, string];
  target_keywords: string[];
  published_at: string;
  updated_at: string;
  canonical_url: string;
};

const ROOT = path.resolve(process.cwd());
const DEFAULT_MODEL = "claude-sonnet-4-6";

async function main() {
  const options = parseArgs(process.argv.slice(2));
  validateArgs(options);

  const article = await generateArticle(options);
  const outputPath = path.resolve(ROOT, options.output ?? `content/articles/${article.slug}.json`);
  const payload = `${JSON.stringify(article, null, 2)}\n`;

  if (options.dryRun) {
    process.stdout.write(payload);
    return;
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, payload, "utf8");
  console.log(`Wrote ${outputPath}`);
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    type: "single",
    collisionFrameworks: [],
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg) continue;
    switch (arg) {
      case "--framework":
        options.framework = argv[++i];
        break;
      case "--topic":
        options.topic = argv[++i];
        break;
      case "--slug":
        options.slug = argv[++i];
        break;
      case "--type":
        options.type = (argv[++i] as ArticleKind) ?? "single";
        break;
      case "--collision-frameworks":
        options.collisionFrameworks = (argv[++i] ?? "")
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean);
        break;
      case "--output":
        options.output = argv[++i];
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      default:
        throw new Error(`Unknown flag: ${arg}`);
    }
  }

  return options;
}

function validateArgs(options: CliOptions) {
  if (!options.topic?.trim()) {
    throw new Error("Missing --topic");
  }
  if (options.type === "collision") {
    if (options.collisionFrameworks.length !== 2) {
      throw new Error("Collision articles require --collision-frameworks slug-a,slug-b");
    }
  } else if (!options.framework?.trim()) {
    throw new Error("Missing --framework");
  }
}

async function generateArticle(options: CliOptions): Promise<GeneratedArticle> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is required to generate an article");
  }

  const client = new Anthropic({ apiKey });
  const slug =
    options.slug?.trim() ||
    buildSlug(options.type, options.framework, options.collisionFrameworks, options.topic);
  const system = [
    "You generate publication-ready article metadata for Consult The Dead.",
    "Return only a JSON object with no surrounding prose or code fences.",
    "Every string value must be concise, specific, and non-generic.",
    "Use snake_case keys.",
  ].join(" ");
  const user = [
    `TYPE: ${options.type}`,
    `SLUG: ${slug}`,
    `TOPIC: ${options.topic?.trim()}`,
    options.framework ? `PRIMARY_FRAMEWORK: ${options.framework.trim()}` : null,
    options.collisionFrameworks.length === 2
      ? `COLLISION_FRAMEWORKS: ${options.collisionFrameworks.join(", ")}`
      : null,
    "",
    "Generate these keys:",
    "- type",
    "- slug",
    "- title",
    "- description",
    "- decision_type",
    "- hook_question",
    "- framework_slug",
    "- collision_frameworks (only for collision articles)",
    "- target_keywords (array of 3 to 5 search phrases)",
    "",
    "Constraints:",
    "- The article must read like a Consult The Dead insight article.",
    "- For collision articles, explicitly frame the tension between both frameworks.",
    "- Keep the title sharp and publication-ready.",
    "- Keep the description under 220 characters.",
  ]
    .filter(Boolean)
    .join("\n");

  const response = await client.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 1200,
    system,
    messages: [{ role: "user", content: user }],
  });

  const text = response.content
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("")
    .trim();

  const parsed = parseArticleJson(text);
  const now = new Date().toISOString();
  return {
    type: parsed.type ?? options.type,
    slug: parsed.slug ?? slug,
    title: parsed.title!,
    description: parsed.description!,
    decision_type: parsed.decision_type!,
    hook_question: parsed.hook_question!,
    framework_slug: parsed.framework_slug ?? options.framework ?? options.collisionFrameworks[0] ?? "",
    collision_frameworks:
      parsed.collision_frameworks ??
      (options.type === "collision"
        ? [options.collisionFrameworks[0]!, options.collisionFrameworks[1]!]
        : undefined),
    target_keywords: Array.isArray(parsed.target_keywords) ? parsed.target_keywords : [],
    published_at: parsed.published_at ?? now.slice(0, 10),
    updated_at: parsed.updated_at ?? now,
    canonical_url: parsed.canonical_url ?? `https://www.consultthedead.com/insights/${slug}`,
  };
}

function parseArticleJson(raw: string): Partial<GeneratedArticle> {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  }
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end < 0 || end <= start) {
    throw new Error("Claude did not return valid JSON");
  }
  const parsed = JSON.parse(cleaned.slice(start, end + 1)) as Partial<GeneratedArticle>;
  if (!parsed.title || !parsed.description || !parsed.decision_type || !parsed.hook_question) {
    throw new Error("Claude returned incomplete article metadata");
  }
  return parsed;
}

function buildSlug(
  type: ArticleKind,
  framework: string | undefined,
  collisionFrameworks: string[],
  topic: string | undefined,
): string {
  const seed =
    type === "collision"
      ? `${collisionFrameworks.join("-vs-")}-${topic ?? ""}`
      : `${framework ?? ""}-${topic ?? ""}`;
  return (
    seed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-")
      .slice(0, 80) || "untitled-article"
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
