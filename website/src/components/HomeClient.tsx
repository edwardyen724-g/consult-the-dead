"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { FrameworkConfig } from "@/lib/content";

export function HomeClient({ frameworks }: { frameworks: FrameworkConfig[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-5xl mx-auto px-6"
    >
      {/* Editorial Hero */}
      <section className="pt-20 pb-24 md:pt-28 md:pb-32">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent mb-6"
        >
          A Library of Living Minds
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="font-serif text-4xl md:text-5xl lg:text-6xl font-light leading-[1.15] text-ink mb-8 max-w-3xl"
        >
          Cognitive frameworks from{" "}
          <span className="italic">history&apos;s most distinctive</span>{" "}
          decision-makers
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="text-base md:text-lg text-muted max-w-xl leading-relaxed"
        >
          Each framework maps how a particular mind perceives the world &mdash;
          what it notices first, what it consistently ignores, and the reasoning
          patterns that made it extraordinary.
        </motion.p>
      </section>

      {/* Framework Gallery */}
      <section className="pb-24">
        <div className="flex items-center gap-4 mb-10">
          <h2 className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            Frameworks
          </h2>
          <div className="flex-1 h-px bg-border dark:bg-border-dark" />
          <span className="text-[11px] text-muted/60/60 tabular-nums">
            {frameworks.length} {frameworks.length === 1 ? "mind" : "minds"}
          </span>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
          className="space-y-8"
        >
          {frameworks.map((fw) => (
            <motion.div
              key={fw.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: "easeOut" },
                },
              }}
            >
              <FrameworkCard framework={fw} />
            </motion.div>
          ))}
        </motion.div>

        {frameworks.length === 0 && (
          <p className="text-muted text-center py-12 font-serif italic">
            The library awaits its first mind.
          </p>
        )}
      </section>
    </motion.div>
  );
}

function FrameworkCard({ framework: fw }: { framework: FrameworkConfig }) {
  return (
    <Link href={`/frameworks/${fw.id}`} className="group block">
      <article
        className="relative p-5 md:p-8 lg:p-10 rounded-xl border border-border overflow-hidden
          bg-surface
          hover:shadow-lg dark:hover:shadow-2xl
          transition-all duration-500 ease-out
          hover:-translate-y-0.5"
        style={{
          borderLeftWidth: "4px",
          borderLeftColor: fw.accent_color,
        }}
      >
        {/* Subtle background accent */}
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${fw.accent_color} 0%, transparent 70%)`,
            transform: "translate(30%, -30%)",
          }}
        />

        <div className="relative z-10">
          {/* Top row: domain + articles count */}
          <div className="flex items-center justify-between mb-5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
              {fw.domain}
            </span>
            <span className="text-[11px] text-muted/60/60">
              {fw.articles.length} {fw.articles.length === 1 ? "article" : "articles"}
            </span>
          </div>

          {/* Framework name */}
          <h3
            className="font-serif text-2xl md:text-3xl font-normal text-ink mb-2 group-hover:text-accent dark:group-hover:text-accent-dark transition-colors duration-300"
          >
            {fw.archetype_name}
          </h3>
          <p className="text-sm text-muted mb-6 italic font-serif">
            {fw.archetype_title}
          </p>

          {/* Perceptual lens as pull quote */}
          <blockquote
            className="pl-5 text-sm leading-relaxed text-ink font-serif italic"
            style={{
              borderLeft: `2px solid ${fw.accent_color}40`,
            }}
          >
            &ldquo;{fw.perceptual_lens.statement}&rdquo;
          </blockquote>

          {/* Hover reveal */}
          <div className="mt-8 flex items-center gap-2 text-xs font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-400">
            <span style={{ color: fw.accent_color }}>
              Explore this mind
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke={fw.accent_color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:translate-x-1 transition-transform duration-300"
            >
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </div>
        </div>
      </article>
    </Link>
  );
}
