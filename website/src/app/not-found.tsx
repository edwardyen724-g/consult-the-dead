import Link from "next/link";

const QUICK_LINKS = [
  {
    href: "/agora",
    label: "Start a new agon",
    description: "Go back to the consultation hall and begin fresh.",
    primary: true,
  },
  {
    href: "/frameworks",
    label: "Browse the Council",
    description: "Pick a mind and explore the frameworks first.",
  },
  {
    href: "/",
    label: "Return home",
    description: "Head back to the site entrance and reorient.",
  },
];

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px 72px",
        background:
          "radial-gradient(circle at top, rgba(201, 102, 78, 0.16), transparent 36%), radial-gradient(circle at bottom right, rgba(90, 138, 90, 0.12), transparent 30%), linear-gradient(180deg, var(--bg) 0%, var(--bg-deep) 100%)",
      }}
    >
      <style>{`
        @media (max-width: 860px) {
          .gm-not-found-shell > div {
            grid-template-columns: 1fr !important;
          }
          .gm-not-found-shell section {
            border-right: none !important;
            border-bottom: 1px solid var(--hairline) !important;
          }
          .gm-not-found-links {
            flex-direction: column !important;
          }
          .gm-not-found-links a {
            width: 100%;
          }
        }
      `}</style>
      <div
        className="gm-not-found-shell"
        style={{
          width: "100%",
          maxWidth: "960px",
          border: "1px solid var(--hairline)",
          borderRadius: "18px",
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.015))",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.35)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
            gap: "0",
          }}
        >
          <section
            style={{
              padding: "clamp(28px, 5vw, 56px)",
              borderRight: "1px solid var(--hairline)",
            }}
          >
            <p
              style={{
                margin: "0 0 18px",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--fg-faint)",
              }}
            >
              404 / dead link / stale share
            </p>

            <h1
              style={{
                margin: "0 0 18px",
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(2.4rem, 5.6vw, 4.4rem)",
                fontWeight: 400,
                letterSpacing: "-0.03em",
                lineHeight: 0.98,
                maxWidth: "10ch",
              }}
            >
              This path has gone still.
            </h1>

            <p
              style={{
                margin: "0 0 28px",
                maxWidth: "34rem",
                fontFamily: "var(--font-serif)",
                fontSize: "1.12rem",
                lineHeight: 1.7,
                color: "var(--fg-dim)",
              }}
            >
              The link you followed is broken, out of date, or points at a
              share that no longer exists. If this came from an old Agora
              share, the consultation may have moved. You can still get back
              into the product in one click.
            </p>

            <div
              className="gm-not-found-links"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "28px",
              }}
            >
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: "inline-flex",
                    flexDirection: "column",
                    gap: "6px",
                    minWidth: "180px",
                    padding: "16px 18px",
                    borderRadius: "12px",
                    border: link.primary
                      ? "1px solid rgba(201, 102, 78, 0.45)"
                      : "1px solid var(--hairline)",
                    background: link.primary
                      ? "linear-gradient(180deg, rgba(201, 102, 78, 0.18), rgba(201, 102, 78, 0.08))"
                      : "rgba(255, 255, 255, 0.025)",
                    color: "var(--fg)",
                    textDecoration: "none",
                    boxShadow: link.primary
                      ? "0 12px 28px rgba(201, 102, 78, 0.14)"
                      : "none",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "1.02rem",
                      letterSpacing: "-0.015em",
                    }}
                  >
                    {link.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "9px",
                      lineHeight: 1.5,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--fg-faint)",
                    }}
                  >
                    {link.description}
                  </span>
                </Link>
              ))}
            </div>

            <p
              style={{
                margin: 0,
                maxWidth: "38rem",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                lineHeight: 1.7,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--fg-faint)",
              }}
            >
              Dead links happen. The Council still listens.
            </p>
          </section>

          <aside
            style={{
              padding: "clamp(28px, 5vw, 56px)",
              background:
                "linear-gradient(180deg, rgba(0, 0, 0, 0.14), rgba(0, 0, 0, 0.28))",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "28px",
            }}
          >
            <div>
              <div
                aria-hidden="true"
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "999px",
                  border: "1px solid rgba(201, 102, 78, 0.35)",
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(201, 102, 78, 0.38), rgba(201, 102, 78, 0.05) 55%, transparent 72%)",
                  boxShadow: "0 0 0 12px rgba(201, 102, 78, 0.05)",
                  marginBottom: "20px",
                }}
              />

              <p
                style={{
                  margin: "0 0 14px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--fg-faint)",
                }}
              >
                If you were following a share link
              </p>

              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.02rem",
                  lineHeight: 1.8,
                  color: "var(--fg-dim)",
                  maxWidth: "24rem",
                }}
              >
                Open a fresh consultation in the Agora, or browse the Council
                to choose a mind before you start. The old share may be stale,
                but the product is still here.
              </p>
            </div>

            <div
              style={{
                paddingTop: "18px",
                borderTop: "1px solid var(--hairline)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--fg-faint)",
                }}
              >
                Consult The Dead
              </p>
              <p
                style={{
                  margin: "8px 0 0",
                  fontFamily: "var(--font-serif)",
                  fontSize: "0.95rem",
                  lineHeight: 1.7,
                  color: "var(--fg-dim)",
                }}
              >
                Run another agon, pick a framework, or return to the homepage
                without losing your way.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
