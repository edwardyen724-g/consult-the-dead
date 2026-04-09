import Link from "next/link";
import { StreamingDemo } from "./worked-example";
import { FooterToggle } from "./footer-toggle";
import { FanDiagram } from "./fan-diagram";
import { CouncilForm } from "./council-form";

const COL = "720px";

export default function HomePage() {
  return (
    <div style={{ background: "var(--bg)", color: "var(--fg)" }}>
      {/* ACT 1 — HERO */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: COL, margin: "0 auto" }}>
          <div
            className="font-mono uppercase"
            style={{
              fontSize: "13px",
              letterSpacing: "0.08em",
              color: "var(--fg-dim)",
            }}
          >
            Consult The Dead
          </div>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 400,
              fontSize: "clamp(40px, 6vw, 88px)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              marginTop: "32px",
            }}
          >
            You have a decision. History has a council.
          </h1>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 400,
              fontSize: "clamp(18px, 2.2vw, 26px)",
              lineHeight: 1.45,
              letterSpacing: "-0.005em",
              color: "var(--fg-dim)",
              marginTop: "40px",
              maxWidth: "62ch",
            }}
          >
            Machiavelli on the politics. Sun Tzu on the terrain. Curie on the
            evidence. Leonardo on what you&rsquo;re not seeing. Newton on what
            must be proven. All at once. For your hardest question.
          </p>
        </div>
      </section>

      {/* ACT 2 — THE PROBLEM */}
      <section style={{ padding: "0 24px", marginTop: "128px" }}>
        <div style={{ maxWidth: COL, margin: "0 auto" }}>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "21px",
              lineHeight: 1.65,
              maxWidth: "62ch",
            }}
          >
            Most decisions get one voice: yours, or a single tool agreeing with
            what you already think, or a friend who doesn&rsquo;t want to hurt
            your feelings. When the stakes are real, one voice is never enough.
            You already know this. That&rsquo;s why the decision is still on
            your desk.
          </p>
        </div>
      </section>

      {/* ACT 3 — THE SVG */}
      <section style={{ padding: "0 24px", marginTop: "160px" }}>
        <div style={{ maxWidth: COL, margin: "0 auto" }}>
          <FanDiagram />
        </div>
      </section>

      {/* ACT 4 — THE DEMO */}
      <section style={{ padding: "0 24px", marginTop: "192px" }}>
        <StreamingDemo />
      </section>

      {/* ACT 5 — THE CTA */}
      <section style={{ padding: "0 24px", marginTop: "192px" }}>
        <div style={{ maxWidth: COL, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 400,
              fontSize: "clamp(36px, 5vw, 64px)",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
            }}
          >
            What decision are you carrying?
          </h2>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "20px",
              lineHeight: 1.5,
              color: "var(--fg-dim)",
              marginTop: "24px",
              maxWidth: "62ch",
            }}
          >
            Describe it below. A council will consider it. You&rsquo;ll get a
            reply within 24 hours.
          </p>

          <div style={{ marginTop: "56px" }}>
            <CouncilForm />
          </div>
        </div>
      </section>

      {/* ACT 6 — FOOTER */}
      <footer
        style={{
          padding: "0 24px",
          marginTop: "192px",
          marginBottom: "64px",
        }}
      >
        <div
          style={{
            maxWidth: COL,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          <div
            className="font-mono uppercase"
            style={{
              fontSize: "11px",
              letterSpacing: "0.08em",
              color: "var(--fg-dim)",
              display: "flex",
              gap: "28px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/essay"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              &rarr; The essay
            </Link>
            <a
              href="https://github.com/edwardyen724-g/consult-the-dead"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              &rarr; The open source
            </a>
          </div>
          <div
            className="font-mono uppercase"
            style={{
              fontSize: "11px",
              letterSpacing: "0.08em",
              color: "var(--fg-dim)",
              display: "inline-flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <span>Consult The Dead. 2026.</span>
            <FooterToggle />
          </div>
        </div>
      </footer>
    </div>
  );
}
