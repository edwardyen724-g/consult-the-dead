import type { ReactNode } from "react";
import Link from "next/link";

type PublicationShellProps = {
  eyebrow: string;
  title: ReactNode;
  lead: ReactNode;
  stats?: Array<{ label: string; value: ReactNode }>;
  children: ReactNode;
  footerLinks?: Array<{ href: string; label: string }>;
};

type PublicationSectionProps = {
  eyebrow: string;
  title: ReactNode;
  body?: ReactNode;
  children: ReactNode;
  accent?: "default" | "highlight";
};

type PublicationStatStripProps = {
  items: Array<{ label: string; value: ReactNode }>;
};

const shellStyles = {
  main: {
    background: "var(--bg)",
    color: "var(--fg)",
    minHeight: "100vh",
  } as const,
  container: {
    maxWidth: "860px",
    margin: "0 auto",
    padding: "80px 24px 120px",
    boxSizing: "border-box",
    width: "100%",
  } as const,
  eyebrow: {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "var(--fg-dim)",
    margin: "0 0 14px",
  } as const,
  title: {
    fontFamily: "var(--font-serif)",
    fontWeight: 400,
    fontSize: "clamp(2rem, 4.4vw, 3rem)",
    letterSpacing: "-0.02em",
    lineHeight: 1.14,
    margin: "0 0 18px",
  } as const,
  lead: {
    fontFamily: "var(--font-serif)",
    fontSize: "1.05rem",
    lineHeight: 1.65,
    color: "var(--fg-dim)",
    margin: "0 auto",
    maxWidth: "640px",
  } as const,
  footerLinks: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
    marginTop: "52px",
    paddingTop: "24px",
    borderTop: "1px solid var(--hairline)",
  } as const,
  footerLink: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    padding: "10px 20px",
    border: "1px solid var(--hairline)",
    borderRadius: "4px",
    color: "var(--fg)",
    textDecoration: "none",
  } as const,
};

export function PublicationShell({
  eyebrow,
  title,
  lead,
  stats,
  children,
  footerLinks,
}: PublicationShellProps) {
  return (
    <main style={shellStyles.main}>
      <div style={shellStyles.container}>
        <header style={{ textAlign: "center", marginBottom: "40px" }}>
          <p style={shellStyles.eyebrow}>{eyebrow}</p>
          <h1 style={shellStyles.title}>{title}</h1>
          <p style={shellStyles.lead}>{lead}</p>
        </header>

        {stats && stats.length > 0 && <PublicationStatStrip items={stats} />}

        {children}

        {footerLinks && footerLinks.length > 0 && (
          <div style={shellStyles.footerLinks}>
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} style={shellStyles.footerLink}>
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export function PublicationStatStrip({ items }: PublicationStatStripProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(168px, 1fr))",
        gap: "12px",
        padding: "14px 0 18px",
        borderTop: "1px solid var(--hairline)",
        borderBottom: "1px solid var(--hairline)",
        marginBottom: "28px",
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--fg-faint)",
              lineHeight: 1.5,
            }}
          >
            {item.label}
          </span>
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "0.98rem",
              color: "var(--fg)",
              lineHeight: 1.5,
            }}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function PublicationSection({
  eyebrow,
  title,
  body,
  children,
  accent = "default",
}: PublicationSectionProps) {
  const background = accent === "highlight" ? "var(--amber-wash)" : "var(--surface)";

  return (
    <section
      style={{
        border: "1px solid var(--hairline)",
        borderRadius: "8px",
        overflow: "hidden",
        marginBottom: "28px",
        background,
      }}
    >
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid var(--hairline)",
          background: "rgba(255,255,255,0.02)",
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: accent === "highlight" ? "var(--amber)" : "var(--fg-dim)",
              margin: "0 0 8px",
            }}
          >
            {eyebrow}
          </p>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 400,
              fontSize: "1.18rem",
              letterSpacing: "-0.01em",
              margin: 0,
              color: "var(--fg)",
            }}
          >
            {title}
          </h2>
        </div>
      </div>
      <div style={{ padding: "24px" }}>
        {body && (
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "0.95rem",
              color: "var(--fg-dim)",
              margin: "0 0 20px",
              lineHeight: 1.65,
            }}
          >
            {body}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
