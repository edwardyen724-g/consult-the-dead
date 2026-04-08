import Link from "next/link";
import { WorkedExample } from "./worked-example";
import { FooterToggle } from "./footer-toggle";

const COL = "720px";

export default function HomePage() {
  return (
    <div style={{ background: "var(--bg)", color: "var(--fg)" }}>
      {/* SECTION 1 — Hero */}
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
            Multi-framework decision support, extracted from documented
            historical incidents.
          </h1>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 400,
              fontSize: "clamp(20px, 3vw, 44px)",
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
              color: "var(--fg-dim)",
              marginTop: "32px",
            }}
          >
            Not a persona. Not a clone.
          </p>
        </div>
      </section>

      {/* SECTION 2 — What it is */}
      <section style={{ padding: "0 24px", marginTop: "64px" }}>
        <div style={{ maxWidth: COL, margin: "0 auto" }}>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "19px",
              lineHeight: 1.65,
              maxWidth: "62ch",
            }}
          >
            Five historical decision-makers analyze one of your decisions in
            parallel, then converge on a synthesis. Each framework is extracted
            from documented critical incidents in the figure&rsquo;s life — not
            scraped from speeches, not a style clone. When they agree,
            that&rsquo;s high-confidence signal. When they disagree, those are
            your real tradeoffs.
          </p>
        </div>
      </section>

      {/* SECTION 3 — Hand-drawn SVG diagram */}
      <section style={{ padding: "0 24px", marginTop: "160px" }}>
        <div style={{ maxWidth: COL, margin: "0 auto" }}>
          <FanDiagram />
        </div>
      </section>

      {/* SECTION 4 — Worked example */}
      <section style={{ padding: "0 24px", marginTop: "160px" }}>
        <WorkedExample />
      </section>

      {/* SECTION 5 — Essay link */}
      <section style={{ padding: "0 24px", marginTop: "160px" }}>
        <div style={{ maxWidth: COL, margin: "0 auto" }}>
          <ArrowLink
            href="/essay"
            label="Consulting the Dead, Not Distilling the Living"
            sub="The operation we are doing instead"
          />
        </div>
      </section>

      {/* SECTION 6 — Repo link */}
      <section style={{ padding: "0 24px", marginTop: "128px" }}>
        <div style={{ maxWidth: COL, margin: "0 auto" }}>
          <ArrowLink
            href="https://github.com/edwardyen724-g/consult-the-dead"
            label="Company Builder — open source"
            sub="The debate engine. MIT licensed."
            external
          />
        </div>
      </section>

      {/* SECTION 7 — Contact link */}
      <section style={{ padding: "0 24px", marginTop: "128px" }}>
        <div style={{ maxWidth: COL, margin: "0 auto" }}>
          <ArrowLink
            href="/contact"
            label="Custom framework extraction"
            sub="For domains or figures not in the public set"
          />
        </div>
      </section>

      {/* FOOTER */}
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
            gap: "16px",
          }}
        >
          <div
            className="font-mono uppercase"
            style={{
              fontSize: "12px",
              letterSpacing: "0.08em",
              color: "var(--fg-dim)",
            }}
          >
            Consult The Dead. 2026.
          </div>
          <FooterToggle />
        </div>
      </footer>
    </div>
  );
}

function ArrowLink({
  href,
  label,
  sub,
  external,
}: {
  href: string;
  label: string;
  sub: string;
  external?: boolean;
}) {
  const linkContent = (
    <span
      style={{
        fontFamily: "var(--font-serif)",
        fontSize: "24px",
        color: "var(--fg)",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "baseline",
        gap: "12px",
      }}
    >
      <span aria-hidden="true">&rarr;</span>
      <span>{label}</span>
    </span>
  );

  return (
    <div>
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {linkContent}
        </a>
      ) : (
        <Link href={href}>{linkContent}</Link>
      )}
      <div
        className="font-mono uppercase"
        style={{
          fontSize: "12px",
          letterSpacing: "0.08em",
          color: "var(--fg-dim)",
          marginTop: "10px",
          marginLeft: "32px",
        }}
      >
        {sub}
      </div>
    </div>
  );
}

function FanDiagram() {
  // One hand-drawn SVG: 5 labeled framework arrows fanning into a central decision node.
  // Slight wobble in path coordinates — intentional, not a bug.
  const stroke = "var(--fg)";
  return (
    <svg
      viewBox="0 0 720 360"
      width="100%"
      height="auto"
      role="img"
      aria-label="Five frameworks fanning into one decision node"
      style={{ display: "block", margin: "0 auto", maxWidth: "560px" }}
    >
      {/* central decision circle, slightly wobbly */}
      <path
        d="M 372 282 C 396 280, 414 296, 412 318 C 410 338, 388 348, 368 344 C 346 340, 336 320, 342 302 C 346 290, 358 282, 372 282 Z"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 5 fan-in arrows */}
      {/* Machiavelli (far left) */}
      <path
        d="M 72 56 C 130 110, 220 200, 348 304"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M 340 296 L 360 308 L 338 312"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Sun Tzu (left) */}
      <path
        d="M 200 36 C 232 110, 282 200, 360 296"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M 352 286 L 368 302 L 348 304"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Leonardo (center top) */}
      <path
        d="M 372 28 C 374 100, 376 184, 378 290"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M 370 280 L 378 298 L 388 282"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Newton (right) */}
      <path
        d="M 540 38 C 506 112, 458 198, 392 296"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M 400 286 L 388 302 L 408 304"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Curie (far right) */}
      <path
        d="M 668 60 C 612 116, 522 204, 404 304"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M 412 296 L 400 312 L 422 312"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* labels — mono, small, dim */}
      <g
        fontFamily="var(--font-mono)"
        fontSize="11"
        fill="var(--fg-dim)"
        style={{ letterSpacing: "0.08em" }}
      >
        <text x="40" y="46" textAnchor="start">
          MACHIAVELLI
        </text>
        <text x="200" y="22" textAnchor="middle">
          SUN TZU
        </text>
        <text x="372" y="18" textAnchor="middle">
          LEONARDO
        </text>
        <text x="540" y="24" textAnchor="middle">
          NEWTON
        </text>
        <text x="680" y="50" textAnchor="end">
          CURIE
        </text>
      </g>
    </svg>
  );
}
