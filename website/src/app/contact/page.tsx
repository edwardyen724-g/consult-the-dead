import Link from "next/link";
import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Custom framework extraction — Consult The Dead",
  description:
    "Extract a decision framework from a figure not in the public set.",
};

export default function ContactPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--fg)",
        padding: "120px 24px 96px",
      }}
    >
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--fg-dim)",
            textDecoration: "none",
          }}
        >
          &larr; Consult The Dead
        </Link>

        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            fontSize: "clamp(28px, 4vw, 44px)",
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
            marginTop: "64px",
          }}
        >
          Custom framework extraction
        </h1>

        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "19px",
            lineHeight: 1.65,
            maxWidth: "62ch",
            marginTop: "32px",
          }}
        >
          You have a figure — a founder, a dead mentor, a domain expert with a
          documented record — that you want extracted as a decision framework.
          We do this for clients. The work begins with documented critical
          incidents from their life and ends with a framework you can interrogate
          alongside the public set. Reply below and describe the figure and the
          decision type you want them applied to.
        </p>

        <ContactForm />
      </div>
    </div>
  );
}
