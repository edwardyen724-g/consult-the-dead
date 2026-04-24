import Link from "next/link";

export function Footer() {
  return (
    <footer style={{ marginTop: "auto", borderTop: "1px solid var(--hairline)" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>

        <div style={{
          padding: "40px 0 24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px", flexWrap: "wrap" }}>
            <span style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "16px",
              color: "var(--fg-dim)",
              letterSpacing: "0.01em",
            }}>
              Consult The Dead
            </span>
            <span style={{ color: "var(--hairline)" }}>/</span>
            <span style={{
              fontFamily: "var(--font-serif)",
              fontSize: "13px",
              color: "var(--fg-faint)",
              fontStyle: "italic",
            }}>
              A Library of Living Minds
            </span>
          </div>

          <p style={{
            fontFamily: "var(--font-serif)",
            fontSize: "12px",
            lineHeight: 1.7,
            color: "var(--fg-faint)",
            maxWidth: "560px",
          }}>
            The frameworks presented on this site are analytical models derived
            from publicly available information. They represent one
            interpretation of documented decisions and behaviors, not definitive
            psychological profiles. Not affiliated with, endorsed by, or
            connected to any individual whose public decisions may have informed
            these frameworks.
          </p>
        </div>

        <div style={{
          paddingBottom: "32px",
          display: "flex",
          alignItems: "center",
          gap: "24px",
        }}>
          <Link
            href="/terms"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "12px",
              fontVariant: "small-caps",
              letterSpacing: "0.06em",
              color: "var(--fg-faint)",
              textDecoration: "none",
              transition: "color 200ms ease-out",
            }}
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "12px",
              fontVariant: "small-caps",
              letterSpacing: "0.06em",
              color: "var(--fg-faint)",
              textDecoration: "none",
              transition: "color 200ms ease-out",
            }}
          >
            Privacy
          </Link>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.06em",
            color: "var(--fg-faint)",
            opacity: 0.6,
          }}>
            © {new Date().getFullYear()} Consult The Dead
          </span>
        </div>
      </div>
    </footer>
  );
}
