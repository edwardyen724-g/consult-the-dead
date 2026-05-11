"use client";

import type { ReactNode } from "react";

export interface NoticePanelProps {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  accentVar?: string;
  className?: string;
}

export function NoticePanel({
  eyebrow,
  title,
  children,
  actions,
  accentVar = "var(--amber)",
  className,
}: NoticePanelProps) {
  return (
    <section
      className={className}
      style={{
        width: "100%",
        border: `1px solid ${accentVar}`,
        borderLeft: `3px solid ${accentVar}`,
        borderRadius: "4px",
        background: "var(--surface)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <style>{`
        @media (max-width: 640px) {
          .gm-notice-actions {
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .gm-notice-actions > * {
            width: 100% !important;
          }
        }
      `}</style>
      {eyebrow && (
        <div
          className="font-mono uppercase"
          style={{
            fontSize: "10px",
            letterSpacing: "0.16em",
            color: accentVar,
          }}
        >
          {eyebrow}
        </div>
      )}
      <h2
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(1.15rem, 3vw, 1.55rem)",
          fontStyle: "italic",
          lineHeight: 1.25,
          color: "var(--fg)",
          margin: 0,
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "0.95rem",
          lineHeight: 1.65,
          color: "var(--fg-dim)",
        }}
      >
        {children}
      </div>
      {actions && (
        <div
          className="gm-notice-actions"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
          }}
        >
          {actions}
        </div>
      )}
    </section>
  );
}
