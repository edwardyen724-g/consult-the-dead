"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ReadingProgress } from "./ReadingProgress";
import type { Article, FrameworkConfig } from "@/lib/content";

export function ArticleClient({
  article,
  framework,
}: {
  article: Article;
  framework: FrameworkConfig | null;
}) {
  const accentColor = framework?.accent_color || "#C45D3E";

  return (
    <>
      <ReadingProgress color={accentColor} />

      <motion.article
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="py-16"
      >
        {/* Article Header */}
        <header className="max-w-[680px] mx-auto px-6 mb-14">
          {framework && (
            <nav className="mb-10">
              <Link
                href={`/frameworks/${framework.id}`}
                className="text-sm text-muted dark:text-muted-dark hover:text-accent dark:hover:text-accent-dark transition-colors inline-flex items-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 12l-4-4 4-4" />
                </svg>
                {framework.archetype_name}
              </Link>
            </nav>
          )}

          {/* Framework framing element */}
          {framework && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="flex items-center gap-3 mb-8"
            >
              <span
                className="w-1.5 h-6 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted dark:text-muted-dark">
                {framework.archetype_name} Analysis
              </span>
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="font-serif text-3xl md:text-4xl font-light leading-tight text-ink dark:text-ink-light mb-5"
          >
            {article.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="font-serif text-lg md:text-xl text-muted dark:text-muted-dark leading-relaxed italic mb-8"
          >
            {article.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-4 text-[11px] text-muted dark:text-muted-dark pb-8 border-b border-border dark:border-border-dark"
          >
            <span>{article.reading_time_minutes} min read</span>
            <span className="w-1 h-1 rounded-full bg-border dark:bg-border-dark" />
            <span>
              {new Date(article.published_date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {framework && (
              <>
                <span className="w-1 h-1 rounded-full bg-border dark:bg-border-dark" />
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                  {framework.archetype_name}
                </span>
              </>
            )}
          </motion.div>
        </header>

        {/* Article Body */}
        <div className="max-w-[680px] mx-auto px-6 article-body">
          {article.body.map((block, i) => {
            if (block.type === "heading") {
              return (
                <motion.h2
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5 }}
                  className="font-serif text-2xl font-normal text-ink dark:text-ink-light"
                >
                  {block.content}
                </motion.h2>
              );
            }

            return (
              <p
                key={i}
                className="text-[18px] md:text-[19px] leading-[1.75] text-ink/90 dark:text-ink-light font-sans"
              >
                {block.content}
              </p>
            );
          })}
        </div>

        {/* End of article */}
        <div className="max-w-[680px] mx-auto px-6 mt-20">
          {/* End marker */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-border dark:bg-border-dark" />
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <div className="flex-1 h-px bg-border dark:bg-border-dark" />
          </div>

          {framework && (
            <div className="flex items-center justify-between">
              <Link
                href={`/frameworks/${framework.id}`}
                className="text-sm text-accent dark:text-accent-dark hover:text-accent-hover transition-colors inline-flex items-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 12l-4-4 4-4" />
                </svg>
                Back to {framework.archetype_name}
              </Link>
              <span className="text-[11px] text-muted/50 dark:text-muted-dark/50 italic font-serif">
                Framework-generated analysis
              </span>
            </div>
          )}
        </div>
      </motion.article>
    </>
  );
}
