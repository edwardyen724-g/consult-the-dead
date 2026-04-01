import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle, getFramework } from "@/lib/content";
import fs from "fs";
import path from "path";

export async function generateStaticParams() {
  const articlesDir = path.join(process.cwd(), "content", "articles");
  if (!fs.existsSync(articlesDir)) return [];

  const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith(".json"));
  return files.map((f) => ({ id: f.replace(".json", "") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = getArticle(id);
  if (!article) return {};
  return {
    title: article.title,
    description: article.subtitle,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = getArticle(id);
  if (!article) notFound();

  const framework = getFramework(article.framework_id);

  return (
    <article className="py-16">
      {/* Article Header */}
      <header className="max-w-[680px] mx-auto px-6 mb-12">
        {framework && (
          <nav className="mb-8">
            <Link
              href={`/frameworks/${framework.id}`}
              className="text-sm text-muted dark:text-muted-dark hover:text-accent transition-colors"
            >
              &larr; {framework.archetype_name}
            </Link>
          </nav>
        )}

        <h1 className="font-serif text-3xl md:text-4xl font-light leading-tight text-ink dark:text-ink-light mb-4">
          {article.title}
        </h1>

        <p className="font-serif text-lg md:text-xl text-muted dark:text-muted-dark leading-relaxed italic mb-6">
          {article.subtitle}
        </p>

        <div className="flex items-center gap-4 text-xs text-muted dark:text-muted-dark pb-8 border-b border-border dark:border-border-dark">
          <span>{article.reading_time_minutes} min read</span>
          <span>
            {new Date(article.published_date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {framework && (
            <span
              className="inline-flex items-center gap-1.5"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: framework.accent_color }}
              />
              {framework.archetype_name}
            </span>
          )}
        </div>
      </header>

      {/* Article Body */}
      <div className="max-w-[680px] mx-auto px-6">
        {article.body.map((block, i) => {
          if (block.type === "heading") {
            return (
              <h2
                key={i}
                className="font-serif text-2xl font-normal text-ink dark:text-ink-light mt-12 mb-6"
              >
                {block.content}
              </h2>
            );
          }

          return (
            <p
              key={i}
              className="text-[18px] md:text-[19px] leading-[1.75] text-ink/90 dark:text-ink-light/90 mb-6 font-sans"
            >
              {block.content}
            </p>
          );
        })}
      </div>

      {/* End of article */}
      <div className="max-w-[680px] mx-auto px-6 mt-16 pt-8 border-t border-border dark:border-border-dark">
        {framework && (
          <Link
            href={`/frameworks/${framework.id}`}
            className="text-sm text-accent hover:text-accent-hover transition-colors"
          >
            &larr; Back to {framework.archetype_name}
          </Link>
        )}
      </div>
    </article>
  );
}
