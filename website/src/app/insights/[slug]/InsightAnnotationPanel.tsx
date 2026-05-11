"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import {
  splitPassageByExcerpt,
  type InsightAnnotatedPassage,
} from "@/lib/insights";

interface InsightAnnotationPanelProps {
  passages: InsightAnnotatedPassage[];
}

export function InsightAnnotationPanel({
  passages,
}: InsightAnnotationPanelProps) {
  const [compact, setCompact] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const update = () => setCompact(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  if (passages.length === 0) return null;

  const activePassage = passages[activeIndex] ?? passages[0];

  return (
    <section style={{ marginTop: 56, marginBottom: 64 }}>
      <p style={sectionLabelStyle}>ANNOTATED PASSAGES</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: compact ? "1fr" : "minmax(0, 1.18fr) minmax(240px, 0.82fr)",
          gap: 20,
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {passages.map((passage, index) => {
            const selected = index === activeIndex;
            const segments = splitPassageByExcerpt(
              passage.text,
              passage.excerpt,
            );

            return (
              <button
                key={passage.label}
                type="button"
                aria-pressed={selected}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
                style={{
                  textAlign: "left",
                  padding: "18px 20px",
                  borderRadius: 10,
                  border: `1px solid ${selected ? "var(--amber)" : "var(--hairline)"}`,
                  background: selected
                    ? "rgba(213, 163, 64, 0.06)"
                    : "rgba(255, 255, 255, 0.02)",
                  cursor: "pointer",
                  transition: "border-color 0.2s ease, background-color 0.2s ease",
                }}
              >
                <p style={chipStyle}>{passage.label}</p>
                <p style={passageStyle}>
                  {segments.map((segment, segmentIndex) =>
                    segment.highlighted ? (
                      <mark
                        key={segmentIndex}
                        style={highlightStyle}
                      >
                        {segment.text}
                      </mark>
                    ) : (
                      <span key={segmentIndex}>{segment.text}</span>
                    ),
                  )}
                </p>
              </button>
            );
          })}
        </div>

        <aside
          style={{
            border: "1px solid var(--hairline)",
            borderRadius: 10,
            padding: 20,
            background: "rgba(255, 255, 255, 0.03)",
            position: compact ? "static" : "sticky",
            top: compact ? "auto" : 24,
          }}
        >
          <p style={sectionLabelStyle}>CONSTRUCT LINK</p>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 22,
              fontWeight: 400,
              lineHeight: 1.25,
              color: "var(--fg)",
              marginBottom: 12,
            }}
          >
            {activePassage.construct.construct}
          </h2>
          <p style={detailStyle}>Excerpt: “{activePassage.excerpt}”</p>
          <p style={{ ...detailStyle, color: "var(--fg)" }}>{activePassage.detail}</p>
        </aside>
      </div>
    </section>
  );
}

const sectionLabelStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--fg-dim)",
  marginBottom: 14,
};

const chipStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--amber)",
  marginBottom: 10,
};

const passageStyle: CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 17,
  lineHeight: 1.65,
  color: "var(--fg)",
};

const detailStyle: CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 15,
  lineHeight: 1.6,
  color: "var(--fg-dim)",
  marginBottom: 12,
};

const highlightStyle: CSSProperties = {
  background: "rgba(213, 163, 64, 0.18)",
  color: "var(--fg)",
  padding: "0 2px",
  borderRadius: 3,
};
