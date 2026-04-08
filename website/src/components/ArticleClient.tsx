"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
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
  const articleRef = useRef<HTMLDivElement>(null);

  // Track which heading section is active for the margin construct indicator
  const [activeHeadingIndex, setActiveHeadingIndex] = useState(-1);

  // Collect heading indices from the body
  const headings = article.body
    .map((block, i) => (block.type === "heading" ? { index: i, content: block.content } : null))
    .filter(Boolean) as { index: number; content: string }[];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-heading-index"));
            if (!isNaN(idx)) setActiveHeadingIndex(idx);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    const headingEls = document.querySelectorAll("[data-heading-index]");
    headingEls.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <ReadingProgress color={accentColor} />

      <motion.article
        ref={articleRef}
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
                className="text-sm text-muted hover:text-accent transition-colors inline-flex items-center gap-1.5"
                style={{ minHeight: "44px", display: "inline-flex", alignItems: "center" }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 12l-4-4 4-4" />
                </svg>
                {framework.archetype_name}
              </Link>
            </nav>
          )}

          {/* Framework Lens Intro — "Through the lens of..." */}
          {framework && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="relative mb-10 p-6 rounded-lg overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${accentColor}08 0%, ${accentColor}04 50%, transparent 100%)`,
                borderLeft: `2px solid ${accentColor}`,
              }}
            >
              <p className="font-serif text-base leading-relaxed italic text-ink">
                Through the lens of{" "}
                <span style={{ color: accentColor }} className="font-medium not-italic">
                  {framework.archetype_name}
                </span>
                {" "}&mdash; {framework.perceptual_lens.statement.charAt(0).toLowerCase() + framework.perceptual_lens.statement.slice(1)}
              </p>
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] font-light leading-tight text-ink mb-5"
          >
            {article.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="font-serif text-lg md:text-xl text-muted leading-relaxed italic mb-8"
          >
            {article.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="flex items-center gap-4 text-[11px] text-muted pb-8"
          >
            <span>{article.reading_time_minutes} min read</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>
              {new Date(article.published_date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {framework && (
              <>
                <span className="w-1 h-1 rounded-full bg-border" />
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

          {/* Crafted divider */}
          <div className="hr-crafted" />
        </header>

        {/* Article Body with margin construct indicator */}
        <div className="relative max-w-[900px] mx-auto px-6">
          <div className="flex gap-0">
            {/* Left margin — construct tracker (desktop only) */}
            {framework && headings.length > 0 && (
              <div className="hidden lg:block w-[180px] shrink-0 relative">
                <div className="sticky top-24">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted mb-3">
                      Reading through
                    </p>
                    {headings.map((h, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          const el = document.querySelector(`[data-heading-index="${i}"]`);
                          el?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="block text-left w-full text-xs leading-relaxed transition-all duration-300 py-1"
                        style={{
                          color: activeHeadingIndex === i ? accentColor : undefined,
                          opacity: activeHeadingIndex === i ? 1 : 0.5,
                          borderLeft: activeHeadingIndex === i ? `2px solid ${accentColor}` : "2px solid transparent",
                          paddingLeft: "8px",
                        }}
                      >
                        {h.content}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Article content column */}
            <div className="flex-1 max-w-[680px] mx-auto article-body">
              {article.body.map((block, i) => {
                if (block.type === "heading") {
                  const headingIdx = headings.findIndex((h) => h.index === i);
                  return (
                    <motion.h2
                      key={i}
                      data-heading-index={headingIdx}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.5 }}
                      className="font-serif text-2xl font-normal text-ink"
                      style={{ marginTop: "3em", marginBottom: "0.75em" }}
                    >
                      {block.content}
                    </motion.h2>
                  );
                }

                return (
                  <p
                    key={i}
                    className="text-[18px] md:text-[19px] leading-[1.75] text-ink font-sans"
                    style={{ marginBottom: "1.5em", letterSpacing: "-0.01em" }}
                  >
                    {block.content}
                  </p>
                );
              })}
            </div>
          </div>
        </div>

        {/* End of article */}
        <div className="max-w-[680px] mx-auto px-6 mt-20">
          <div className="hr-crafted mb-8" />

          {framework && (
            <div className="flex items-center justify-between flex-wrap gap-4">
              <Link
                href={`/frameworks/${framework.id}`}
                className="text-sm text-accent hover:text-accent-hover transition-colors inline-flex items-center gap-1.5"
                style={{ minHeight: "44px", display: "inline-flex", alignItems: "center" }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 12l-4-4 4-4" />
                </svg>
                Back to {framework.archetype_name}
              </Link>
              <span className="text-[11px] text-muted italic font-serif">
                Framework-generated analysis
              </span>
            </div>
          )}
        </div>
      </motion.article>
    </>
  );
}
