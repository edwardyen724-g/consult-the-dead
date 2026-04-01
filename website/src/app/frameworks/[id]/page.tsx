import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getFramework,
  getAllFrameworks,
  getArticlesForFramework,
} from "@/lib/content";

export async function generateStaticParams() {
  const frameworks = getAllFrameworks();
  return frameworks.map((fw) => ({ id: fw.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const framework = getFramework(id);
  if (!framework) return {};
  return {
    title: `${framework.archetype_name} \u2014 ${framework.archetype_title}`,
    description: framework.perceptual_lens.statement,
  };
}

export default async function FrameworkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const framework = getFramework(id);
  if (!framework) notFound();

  const articles = getArticlesForFramework(id);

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Breadcrumb */}
      <nav className="mb-12">
        <Link
          href="/"
          className="text-sm text-muted dark:text-muted-dark hover:text-accent transition-colors"
        >
          &larr; The Library
        </Link>
      </nav>

      {/* Framework Header */}
      <header className="mb-16">
        <div className="flex items-center gap-3 mb-4">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: framework.accent_color }}
          />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted dark:text-muted-dark">
            {framework.domain}
          </span>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-light text-ink dark:text-ink-light mb-2">
          {framework.archetype_name}
        </h1>
        <p className="text-lg text-muted dark:text-muted-dark mb-8">
          {framework.archetype_title}
        </p>
        <p className="text-base leading-relaxed text-ink/90 dark:text-ink-light/90 max-w-2xl">
          {framework.description}
        </p>
      </header>

      {/* Perceptual Lens */}
      <section className="mb-16">
        <h2 className="font-sans text-xs font-semibold uppercase tracking-widest text-muted dark:text-muted-dark mb-6">
          Perceptual Lens
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
              What they notice first
            </h3>
            <p className="text-sm leading-relaxed text-ink/80 dark:text-ink-light/80">
              {framework.perceptual_lens.what_they_notice_first}
            </p>
          </div>
          <div className="p-6 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
              What they ignore
            </h3>
            <p className="text-sm leading-relaxed text-ink/80 dark:text-ink-light/80">
              {framework.perceptual_lens.what_they_ignore}
            </p>
          </div>
        </div>
      </section>

      {/* Constructs */}
      <section className="mb-16">
        <h2 className="font-sans text-xs font-semibold uppercase tracking-widest text-muted dark:text-muted-dark mb-6">
          Core Constructs
        </h2>
        <div className="space-y-4">
          {framework.bipolar_constructs.map((construct, i) => (
            <details
              key={i}
              className="group p-6 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark"
            >
              <summary className="cursor-pointer list-none flex items-start justify-between">
                <span className="font-serif text-base text-ink dark:text-ink-light pr-4">
                  {construct.construct}
                </span>
                <span className="text-muted dark:text-muted-dark group-open:rotate-45 transition-transform text-lg flex-shrink-0">
                  +
                </span>
              </summary>
              <div className="mt-4 pt-4 border-t border-border dark:border-border-dark space-y-3">
                <p className="text-sm text-ink/80 dark:text-ink-light/80">
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                    Positive pole:
                  </span>{" "}
                  {construct.positive_pole}
                </p>
                <p className="text-sm text-ink/80 dark:text-ink-light/80">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted dark:text-muted-dark">
                    Negative pole:
                  </span>{" "}
                  {construct.negative_pole}
                </p>
                <p className="text-sm text-ink/70 dark:text-ink-light/70 italic">
                  {construct.behavioral_implication}
                </p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Articles */}
      {articles.length > 0 && (
        <section>
          <h2 className="font-sans text-xs font-semibold uppercase tracking-widest text-muted dark:text-muted-dark mb-6">
            Articles
          </h2>
          <div className="space-y-4">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.id}`}
                className="group block p-6 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark hover:border-accent/40 dark:hover:border-accent/40 transition-all duration-300"
              >
                <h3 className="font-serif text-xl text-ink dark:text-ink-light group-hover:text-accent transition-colors mb-2">
                  {article.title}
                </h3>
                <p className="text-sm text-muted dark:text-muted-dark mb-3 leading-relaxed">
                  {article.subtitle}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted dark:text-muted-dark">
                  <span>{article.reading_time_minutes} min read</span>
                  <span>
                    {new Date(article.published_date).toLocaleDateString(
                      "en-US",
                      { month: "long", day: "numeric", year: "numeric" }
                    )}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
