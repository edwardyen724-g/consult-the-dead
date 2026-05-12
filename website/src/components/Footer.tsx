import Link from "next/link";
import { buildQuizEntryHref } from "@/lib/ctr-experiment";

export const FOOTER_QUIZ_CTA_HREF = buildQuizEntryHref("footer");

export const FOOTER_PRICING_CTA_HREF =
  "/pricing?utm_source=footer&utm_medium=cta&utm_campaign=upgrade";

export function Footer() {
  return (
    <footer className="mt-auto">
      <div className="max-w-5xl mx-auto px-6">
        {/* Crafted horizontal rule */}
        <div className="hr-crafted" />

        <div className="py-10 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Site identity */}
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm text-muted" style={{ letterSpacing: "0.06em" }}>
              <span className="font-medium">Great</span>
              <span className="font-light ml-0.5">Minds</span>
            </span>
            <span className="text-border mx-1">/</span>
            <span className="text-[11px] text-muted italic">
              A Library of Living Minds
            </span>
          </div>

          {/* Disclaimer */}
          <p className="text-[11px] leading-[1.7] text-muted/70 max-w-lg" style={{ letterSpacing: "0.01em" }}>
            The frameworks presented on this site are analytical models derived
            from publicly available information. They represent one
            interpretation of documented decisions and behaviors, not definitive
            psychological profiles. Not affiliated with, endorsed by, or
            connected to any individual whose public decisions may have informed
            these frameworks.
          </p>
        </div>

        {/* Conversion CTAs */}
        <div className="pb-6">
          <div
            data-testid="footer-ctas"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              justifyContent: "center",
            }}
          >
            <Link
              href={FOOTER_QUIZ_CTA_HREF}
              data-testid="footer-quiz-cta"
              aria-label="Take the guided quiz to find your mind"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "6px 12px",
                borderRadius: "4px",
                border: "1px solid var(--amber)",
                color: "var(--amber)",
                background: "transparent",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Take the Guided Quiz →
            </Link>
            <Link
              href={FOOTER_PRICING_CTA_HREF}
              data-testid="footer-pricing-cta"
              aria-label="View pricing plans"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "6px 12px",
                borderRadius: "4px",
                border: "1px solid var(--hairline)",
                color: "var(--fg-dim)",
                background: "transparent",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              View Pricing
            </Link>
          </div>
        </div>

        {/* Legal links */}
        <div className="pb-8 flex items-center gap-5">
          <Link
            href="/terms"
            className="font-mono text-[10px] uppercase tracking-widest text-muted/60 hover:text-muted transition-colors"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="font-mono text-[10px] uppercase tracking-widest text-muted/60 hover:text-muted transition-colors"
          >
            Privacy
          </Link>
          <span className="font-mono text-[10px] text-muted/40">
            © {new Date().getFullYear()} Consult The Dead
          </span>
        </div>
      </div>
    </footer>
  );
}
