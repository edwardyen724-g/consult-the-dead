"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Construct {
  construct: string;
  positive_pole: string;
  negative_pole: string;
  behavioral_implication: string;
}

export function ConstructAccordion({
  constructs,
  accentColor,
}: {
  constructs: Construct[];
  accentColor?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {constructs.map((construct, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className="rounded-lg border border-border bg-surface overflow-hidden transition-colors duration-300"
            style={{
              borderLeftWidth: "3px",
              borderLeftColor: isOpen ? (accentColor || "#C45D3E") : "transparent",
            }}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full text-left p-6 flex items-start justify-between gap-4 group cursor-pointer"
            >
              <span className="font-serif text-base text-ink group-hover:text-accent dark:group-hover:text-accent-dark transition-colors">
                {construct.construct}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="text-muted flex-shrink-0 mt-0.5"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    height: { duration: 0.35, ease: "easeInOut" },
                    opacity: { duration: 0.25, ease: "easeInOut" },
                  }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 pt-0 space-y-3 border-t border-border">
                    <div className="pt-4" />
                    <div className="flex items-baseline gap-3">
                      <span
                        className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                        style={{ color: accentColor || "#C45D3E" }}
                      >
                        Emergent pole
                      </span>
                      <p className="text-sm text-ink">
                        {construct.positive_pole}
                      </p>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted whitespace-nowrap">
                        Implicit pole
                      </span>
                      <p className="text-sm text-ink">
                        {construct.negative_pole}
                      </p>
                    </div>
                    <p className="text-sm text-muted italic pt-1 border-t border-border/50/50 mt-3">
                      {construct.behavioral_implication}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
