import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(circle at top, rgba(198, 154, 68, 0.14), transparent 28%), var(--bg)",
        color: "var(--fg)",
        padding: "72px 24px 96px",
      }}
    >
      <div style={shellStyle}>
        <p style={eyebrowStyle}>404</p>
        <h1 style={titleStyle}>This link has gone cold.</h1>
        <p style={bodyStyle}>
          The route may have moved, expired, or never existed. If you were following a stale
          share, start again from the Library or return to the Agora.
        </p>

        <div style={linkRowStyle}>
          <Link href="/library" style={primaryLinkStyle}>
            Open the Library
          </Link>
          <Link href="/agora" style={secondaryLinkStyle}>
            Return to the Agora
          </Link>
        </div>
      </div>
    </main>
  );
}

const shellStyle: React.CSSProperties = {
  maxWidth: 640,
  textAlign: "center",
};

const eyebrowStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "var(--fg-dim)",
  marginBottom: 18,
};

const titleStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: "clamp(32px, 6vw, 52px)",
  fontWeight: 400,
  lineHeight: 1.08,
  marginBottom: 18,
};

const bodyStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 18,
  lineHeight: 1.7,
  color: "var(--fg-dim)",
  marginBottom: 32,
};

const linkRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: 12,
  flexWrap: "wrap",
};

const primaryLinkStyle: React.CSSProperties = {
  display: "inline-block",
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  padding: "12px 22px",
  background: "var(--amber)",
  color: "var(--bg)",
  textDecoration: "none",
  borderRadius: 999,
};

const secondaryLinkStyle: React.CSSProperties = {
  display: "inline-block",
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  padding: "12px 22px",
  border: "1px solid var(--hairline)",
  color: "var(--fg)",
  textDecoration: "none",
  borderRadius: 999,
  background: "var(--surface)",
};
