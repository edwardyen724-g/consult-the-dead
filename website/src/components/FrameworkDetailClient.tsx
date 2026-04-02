"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ConstructAccordion } from "./ConstructAccordion";
import { ScrollReveal } from "./PageTransition";
import type { FrameworkConfig, Article } from "@/lib/content";

export function FrameworkDetailClient({
  framework,
  articles,
}: {
  framework: FrameworkConfig;
  articles: Article[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-5xl mx-auto px-6 py-16"
    >
      {/* Breadcrumb */}
      <nav className="mb-12">
        <Link
          href="/"
          className="text-sm text-muted hover:text-accent dark:hover:text-accent-dark transition-colors inline-flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 12l-4-4 4-4" />
          </svg>
          The Library
        </Link>
      </nav>

      {/* Framework Header */}
      <header className="mb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex items-center gap-3 mb-5"
        >
          <span
            className="w-2 h-8 rounded-full"
            style={{ backgroundColor: framework.accent_color }}
          />
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            {framework.domain}
          </span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="font-serif text-4xl md:text-5xl font-light text-ink mb-3"
        >
          {framework.archetype_name}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-lg text-muted mb-8 italic font-serif"
        >
          {framework.archetype_title}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="text-base leading-relaxed text-ink max-w-2xl"
          style={{ letterSpacing: "-0.01em" }}
        >
          {framework.description}
        </motion.p>
      </header>

      {/* Perceptual Lens -- Spotlight/Shadow metaphor */}
      <ScrollReveal>
        <section className="mb-20">
          <h2 className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-muted mb-8">
            Perceptual Lens
          </h2>

          <div className="grid md:grid-cols-2 gap-0 rounded-xl overflow-hidden border border-border">
            {/* Spotlight side -- what they notice */}
            <div
              className="relative p-8 md:p-10 bg-surface"
            >
              {/* Radial glow effect */}
              <div
                className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.05]"
                style={{
                  background: `radial-gradient(ellipse at 30% 30%, ${framework.accent_color} 0%, transparent 70%)`,
                }}
              />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  {/* Focus icon */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={framework.accent_color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                  <h3
                    className="text-xs font-semibold uppercase tracking-[0.15em]"
                    style={{ color: framework.accent_color }}
                  >
                    In sharp focus
                  </h3>
                </div>
                <p className="text-sm leading-[1.8] text-ink">
                  {framework.perceptual_lens.what_they_notice_first}
                </p>
              </div>
            </div>

            {/* Shadow side -- what they ignore */}
            <div
              className="relative p-8 md:p-10 bg-ink/[0.03] dark:bg-white/[0.02] border-t md:border-t-0 md:border-l border-border"
            >
              {/* Subtle diagonal lines */}
              <div
                className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]"
                style={{
                  backgroundImage: "repeating-linear-gradient(135deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 12px)",
                }}
              />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  {/* Blur icon */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                    <circle cx="12" cy="12" r="10" strokeDasharray="2 3" />
                  </svg>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
                    In the periphery
                  </h3>
                </div>
                <p className="text-sm leading-[1.8] text-muted">
                  {framework.perceptual_lens.what_they_ignore}
                </p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Constructs */}
      <ScrollReveal>
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
              Core Constructs
            </h2>
            <div className="flex-1 h-px bg-border dark:bg-border-dark" />
            <span className="text-[11px] text-muted/60/60 tabular-nums">
              {framework.bipolar_constructs.length} dimensions
            </span>
          </div>
          <ConstructAccordion
            constructs={framework.bipolar_constructs}
            accentColor={framework.accent_color}
          />
        </section>
      </ScrollReveal>

      {/* Articles */}
      {articles.length > 0 && (
        <ScrollReveal>
          <section className="mb-8">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                Articles
              </h2>
              <div className="flex-1 h-px bg-border dark:bg-border-dark" />
              <span className="text-[11px] text-muted/60/60 tabular-nums">
                {articles.length} {articles.length === 1 ? "piece" : "pieces"}
              </span>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.08 } },
              }}
              className="space-y-4"
            >
              {articles.map((article) => (
                <motion.div
                  key={article.id}
                  variants={{
                    hidden: { opacity: 0, x: -12 },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.4, ease: "easeOut" },
                    },
                  }}
                >
                  <Link
                    href={`/articles/${article.id}`}
                    className="group block p-6 md:p-8 rounded-lg border border-border
                      bg-surface
                      hover:shadow-md dark:hover:shadow-xl
                      hover:-translate-y-px
                      transition-all duration-400"
                  >
                    <h3 className="font-serif text-xl text-ink group-hover:text-accent dark:group-hover:text-accent-dark transition-colors mb-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted mb-4 leading-relaxed">
                      {article.subtitle}
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-muted/70/70">
                      <span>{article.reading_time_minutes} min read</span>
                      <span className="w-1 h-1 rounded-full bg-border dark:bg-border-dark" />
                      <span>
                        {new Date(article.published_date).toLocaleDateString(
                          "en-US",
                          { month: "long", day: "numeric", year: "numeric" }
                        )}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </section>
        </ScrollReveal>
      )}
    </motion.div>
  );
}
