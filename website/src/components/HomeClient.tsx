"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { FrameworkConfig } from "@/lib/content";

export function HomeClient({ frameworks }: { frameworks: FrameworkConfig[] }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.97]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  // We have one framework — make the entire homepage its world
  const fw = frameworks[0];

  return (
    <div className="relative">
      {/* === HERO: Full-viewport immersive lens statement === */}
      <div ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Accent color as spatial element — large radial wash */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="absolute inset-0 pointer-events-none"
        >
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
            style={{
              background: fw
                ? `radial-gradient(circle, ${fw.accent_color}12 0%, ${fw.accent_color}06 35%, transparent 70%)`
                : "none",
            }}
          />
          {/* Secondary glow — bottom right */}
          <div
            className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full"
            style={{
              background: fw
                ? `radial-gradient(circle, ${fw.accent_color}08 0%, transparent 60%)`
                : "none",
            }}
          />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="relative z-10 max-w-4xl mx-auto px-6 text-center"
        >
          {fw ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.8 }}
                className="mb-6"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted">
                  {fw.domain}
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="font-serif text-5xl md:text-6xl lg:text-[4.5rem] font-light leading-[1.1] text-ink mb-10"
              >
                {fw.archetype_name}
              </motion.h1>

              {/* The perceptual lens statement — the centerpiece */}
              <motion.blockquote
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="relative max-w-2xl mx-auto mb-12"
              >
                <div
                  className="absolute left-1/2 -translate-x-1/2 -top-6 w-12 h-[2px] rounded-full"
                  style={{ backgroundColor: fw.accent_color }}
                />
                <p className="font-serif text-xl md:text-2xl leading-[1.6] text-ink italic" style={{ letterSpacing: "-0.01em" }}>
                  &ldquo;{fw.perceptual_lens.statement}&rdquo;
                </p>
              </motion.blockquote>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                <Link
                  href={`/frameworks/${fw.id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium tracking-wide rounded-full border border-border hover:border-accent transition-all duration-300 text-ink hover:text-accent group"
                  style={{ minHeight: "44px" }}
                >
                  Enter the framework
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </Link>
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-serif text-4xl md:text-5xl font-light text-ink mb-6">
                A Library of Living Minds
              </h1>
              <p className="text-lg text-muted">
                The library awaits its first mind.
              </p>
            </motion.div>
          )}

          {/* Scroll indicator */}
          {fw && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="flex flex-col items-center gap-2 text-muted"
              >
                <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {fw && (
        <>
          {/* === SECTION 2: Perceptual Lens — Spotlight / Shadow === */}
          <section className="relative py-24 md:py-32 overflow-hidden">
            <div className="max-w-5xl mx-auto px-6">
              <PerceptualLensSection framework={fw} />
            </div>
          </section>

          {/* === SECTION 3: Constructs as interactive constellation === */}
          <section className="relative py-24 md:py-32">
            <div className="max-w-5xl mx-auto px-6">
              <ConstructsSection framework={fw} />
            </div>
          </section>

          {/* === SECTION 4: Recent Thinking === */}
          <section className="relative py-24 md:py-32">
            <div className="max-w-5xl mx-auto px-6">
              <RecentThinkingSection framework={fw} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

/* ---- Perceptual Lens: Spotlight / Shadow as spatial diptych ---- */
function PerceptualLensSection({ framework: fw }: { framework: FrameworkConfig }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7 }}
    >
      <div className="flex items-center gap-4 mb-12">
        <span
          className="w-2 h-2 rounded-full construct-node-pulse"
          style={{ backgroundColor: fw.accent_color }}
        />
        <h2 className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
          Perceptual Lens
        </h2>
        <div className="flex-1 hr-crafted" />
      </div>

      <div className="grid md:grid-cols-2 gap-0 rounded-xl overflow-hidden border border-border">
        {/* Spotlight side */}
        <div className="relative p-8 md:p-10 bg-surface">
          <div
            className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.05]"
            style={{
              background: `radial-gradient(ellipse at 30% 30%, ${fw.accent_color} 0%, transparent 70%)`,
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={fw.accent_color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: fw.accent_color }}>
                In sharp focus
              </h3>
            </div>
            <p className="text-sm leading-[1.8] text-ink">{fw.perceptual_lens.what_they_notice_first}</p>
          </div>
        </div>

        {/* Shadow side */}
        <div className="relative p-8 md:p-10 bg-ink/[0.03] border-t md:border-t-0 md:border-l border-border">
          <div
            className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: "repeating-linear-gradient(135deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 12px)",
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                <circle cx="12" cy="12" r="10" strokeDasharray="2 3" />
              </svg>
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
                In the periphery
              </h3>
            </div>
            <p className="text-sm leading-[1.8] text-muted">{fw.perceptual_lens.what_they_ignore}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ---- Constructs as visual nodes — not an accordion list ---- */
function ConstructsSection({ framework: fw }: { framework: FrameworkConfig }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7 }}
    >
      <div className="flex items-center gap-4 mb-12">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: fw.accent_color }}
        />
        <h2 className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
          Core Constructs
        </h2>
        <div className="flex-1 hr-crafted" />
        <span className="text-[11px] text-muted tabular-nums">
          {fw.bipolar_constructs.length} dimensions
        </span>
      </div>

      {/* Constructs as a dimensional map — each construct a tension line */}
      <div className="space-y-6">
        {fw.bipolar_constructs.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <Link
              href={`/frameworks/${fw.id}`}
              className="group block relative"
            >
              <div className="flex items-stretch gap-0 rounded-lg overflow-hidden border border-border hover:border-accent/40 transition-all duration-400">
                {/* Accent accent bar */}
                <div
                  className="w-1 shrink-0 transition-all duration-400 group-hover:w-1.5"
                  style={{ backgroundColor: fw.accent_color }}
                />

                {/* Construct content */}
                <div className="flex-1 p-5 md:p-6 bg-surface group-hover:bg-surface/80 transition-colors duration-300">
                  <h3 className="font-serif text-base md:text-lg text-ink mb-3 group-hover:text-accent transition-colors duration-300">
                    {c.construct}
                  </h3>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-sm">
                    <span className="text-ink">
                      <span className="font-semibold text-[10px] uppercase tracking-wider mr-2" style={{ color: fw.accent_color }}>
                        Emergent
                      </span>
                      {c.positive_pole}
                    </span>
                    <span className="hidden md:block text-muted">|</span>
                    <span className="text-muted">
                      <span className="font-semibold text-[10px] uppercase tracking-wider mr-2">
                        Implicit
                      </span>
                      {c.negative_pole}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ---- Recent Thinking — NOT a blog card list ---- */
function RecentThinkingSection({ framework: fw }: { framework: FrameworkConfig }) {
  // Show articles as numbered thought-threads
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7 }}
    >
      <div className="flex items-center gap-4 mb-12">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: fw.accent_color }}
        />
        <h2 className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
          Recent Thinking
        </h2>
        <div className="flex-1 hr-crafted" />
      </div>

      <div className="relative">
        {/* Vertical thread line */}
        <div
          className="absolute left-5 md:left-6 top-0 bottom-0 w-px"
          style={{ backgroundColor: `${fw.accent_color}30` }}
        />

        <div className="space-y-0">
          {fw.articles.map((articleId, i) => (
            <ArticleThread key={articleId} articleId={articleId} index={i} framework={fw} />
          ))}
        </div>
      </div>

      {/* Enter framework CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-16 text-center"
      >
        <Link
          href={`/frameworks/${fw.id}`}
          className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-hover transition-colors group"
          style={{ minHeight: "44px" }}
        >
          Explore the full framework
          <svg
            width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            className="group-hover:translate-x-1 transition-transform duration-300"
          >
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </Link>
      </motion.div>
    </motion.div>
  );
}

function ArticleThread({
  articleId,
  index,
  framework,
}: {
  articleId: string;
  index: number;
  framework: FrameworkConfig;
}) {
  // We don't have the article data here (only IDs from the framework config)
  // Use a clean link with the ID as the identifier
  const titles: Record<string, { title: string; subtitle: string; date: string; mins: number }> = {
    "why-the-ai-hardware-race-is-already-over": {
      title: "Why the AI Hardware Race Is Already Over",
      subtitle: "The revolution isn't in the hardware — it's in the disappearance of hardware altogether.",
      date: "March 15, 2026",
      mins: 6,
    },
    "the-death-of-the-app-store-model": {
      title: "The Death of the App Store Model",
      subtitle: "AI agents don't download apps. The entire distribution model is about to collapse.",
      date: "March 22, 2026",
      mins: 5,
    },
  };

  const info = titles[articleId];
  if (!info) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, duration: 0.5 }}
    >
      <Link
        href={`/articles/${articleId}`}
        className="group flex items-start gap-5 md:gap-7 py-8 relative"
        style={{ minHeight: "44px" }}
      >
        {/* Thread node */}
        <div className="relative z-10 shrink-0 w-10 md:w-12 flex justify-center">
          <span
            className="w-3 h-3 rounded-full border-2 bg-paper group-hover:scale-125 transition-transform duration-300"
            style={{ borderColor: framework.accent_color }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 -mt-1">
          <div className="flex items-center gap-3 mb-2 text-[11px] text-muted">
            <span>{info.date}</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>{info.mins} min read</span>
          </div>
          <h3 className="font-serif text-xl md:text-2xl text-ink group-hover:text-accent transition-colors duration-300 mb-2">
            {info.title}
          </h3>
          <p className="text-sm text-muted leading-relaxed max-w-xl">
            {info.subtitle}
          </p>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex items-center self-center opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            stroke={framework.accent_color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </div>
      </Link>
    </motion.div>
  );
}
