import Link from "next/link";
import { getAllFrameworks } from "@/lib/content";

export default function HomePage() {
  const frameworks = getAllFrameworks();

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Hero */}
      <section className="mb-20">
        <h1 className="font-serif text-4xl md:text-5xl font-light leading-tight text-ink dark:text-ink-light mb-6">
          The Library
        </h1>
        <p className="text-lg text-muted dark:text-muted-dark max-w-2xl leading-relaxed">
          Cognitive frameworks derived from history&apos;s most distinctive
          decision-makers. Each framework maps how a particular mind
          perceives the world, what it notices first, and what it
          consistently ignores.
        </p>
      </section>

      {/* Framework Gallery */}
      <section>
        <h2 className="font-sans text-xs font-semibold uppercase tracking-widest text-muted dark:text-muted-dark mb-8">
          Frameworks
        </h2>
        <div className="grid gap-6">
          {frameworks.map((fw) => (
            <Link
              key={fw.id}
              href={`/frameworks/${fw.id}`}
              className="group block"
            >
              <article className="p-6 md:p-8 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark hover:border-accent/40 dark:hover:border-accent/40 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-2xl md:text-3xl font-normal text-ink dark:text-ink-light group-hover:text-accent transition-colors">
                      {fw.archetype_name}
                    </h3>
                    <p className="text-sm text-muted dark:text-muted-dark mt-1">
                      {fw.archetype_title}
                    </p>
                  </div>
                  <span
                    className="inline-block w-3 h-3 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: fw.accent_color }}
                  />
                </div>

                <p className="text-sm text-muted dark:text-muted-dark mb-4">
                  {fw.domain}
                </p>

                <blockquote className="border-l-2 border-accent/30 pl-4 text-sm leading-relaxed text-ink/80 dark:text-ink-light/80 italic font-serif">
                  {fw.perceptual_lens.statement}
                </blockquote>

                <div className="mt-6 text-xs text-accent font-medium uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Explore framework &rarr;
                </div>
              </article>
            </Link>
          ))}
        </div>

        {frameworks.length === 0 && (
          <p className="text-muted dark:text-muted-dark text-center py-12">
            No frameworks available yet.
          </p>
        )}
      </section>
    </div>
  );
}
