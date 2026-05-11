/**
 * Conversion-CTA strip rendered on the public /agora/a/[id] page.
 *
 * Two render slots, controlled by the `variant` prop:
 *
 *   - `variant="inline"`  — full-width above-the-fold panel for desktop
 *                           and tablet. Visually obvious so the visitor
 *                           understands they can "make their own"
 *                           without scrolling.
 *   - `variant="sticky"`  — bottom-of-viewport bar visible on mobile
 *                           only (≤ 720px). Stays in view while the
 *                           visitor reads the agon, but yields to the
 *                           transcript on larger screens (the inline
 *                           panel covers desktop, no need to double up
 *                           and risk obscuring content).
 *
 * Both variants:
 *   - carry `data-print="hide"` so the existing globals.css @media
 *     print rules drop them from any saved-as-PDF export of the agon;
 *   - link to the share-CTA href built from `share-cta-link.ts` so the
 *     UTM contract (`utm_source=share, utm_campaign=agon_share,
 *     utm_content=<share_id>`) is locked in at the helper level and
 *     not duplicated here;
 *   - render server-side (no React state) so the page can stay a pure
 *     server component — the public agon page does not ship Clerk or
 *     other client-only providers.
 *
 * Why two components in one file: the inline panel and the sticky bar
 * share enough copy + styling that splitting them across files added
 * noise. The page.tsx wiring imports `ShareCtaStrip` and renders both
 * variants in their respective slots; mobile/desktop visibility is
 * handled by inline media queries on each variant root.
 */
import Link from "next/link";

import {
  SHARE_CTA_BUTTON_LABEL,
  SHARE_CTA_HEADLINE,
  SHARE_CTA_SUBLINE,
  buildShareCtaHref,
} from "@/lib/share-cta-link";

export type ShareCtaVariant = "inline" | "sticky";

export interface ShareCtaStripProps {
  /** Public share_id of the agon being rendered. */
  shareId: string;
  /** "inline" for the desktop panel, "sticky" for mobile bottom bar. */
  variant: ShareCtaVariant;
}

/**
 * Inline className used by the sticky variant. The sticky variant
 * collapses on screens >720px so the desktop inline panel is the
 * sole CTA on that breakpoint. The inline variant collapses on
 * screens ≤720px so the sticky bar carries the message on mobile
 * (and we never stack two CTAs on top of the agon content).
 *
 * We render the breakpoint rule via a `<style>` tag scoped to the
 * component because Tailwind v4 in this codebase doesn't have the
 * arbitrary `[data-print="hide"]` selectors set up for media
 * queries — and the public agon page is the only consumer, so a
 * scoped style block is the cheapest way to keep the CSS local.
 */
const RESPONSIVE_STYLES = `
.sct-inline { display: block; }
.sct-sticky { display: none; }
@media (max-width: 720px) {
  .sct-inline { display: none; }
  .sct-sticky { display: block; }
  /* Reserve space at the bottom of the page so the sticky bar
     never obscures the trailing "Run your own agon →" CTA / footer
     attribution on mobile. The 112px figure leaves room for the
     bar (~64px tall) plus a 48px buffer for the safe-area inset.
     Scoped via :has(.sct-sticky) so this rule only fires on pages
     that actually render the sticky variant — it never leaks to
     other surfaces if the stylesheet is reused. */
  main:has(.sct-sticky) { padding-bottom: 112px !important; }
}
@media print {
  /* Sticky bar uses position:fixed which the global print CSS
     already hides via the [style*="position:fixed"] selector. The
     inline panel is data-print="hide" which is also caught. Belt-
     and-braces here so a future refactor that drops the inline
     style still keeps both variants out of the printed PDF. */
  .sct-inline, .sct-sticky { display: none !important; }
}
`;

export function ShareCtaStrip({ shareId, variant }: ShareCtaStripProps) {
  const href = buildShareCtaHref(shareId);
  if (variant === "inline") return <InlinePanel href={href} />;
  return <StickyBar href={href} />;
}

/**
 * Stylesheet for both variants. Page.tsx renders this once near the
 * top so the responsive show/hide rules apply to both `<ShareCtaStrip>`
 * instances on the page without duplicating the `<style>` tag.
 */
export function ShareCtaStyles() {
  // dangerouslySetInnerHTML is fine here — content is static and not
  // user-supplied. Using it (vs. a child string) avoids React's whitespace
  // normalization which can break some CSS engines.
  return <style dangerouslySetInnerHTML={{ __html: RESPONSIVE_STYLES }} />;
}

/* ────────────────────────────────────────────────────────────────
   Inline panel (desktop / tablet)
   ──────────────────────────────────────────────────────────────── */

function InlinePanel({ href }: { href: string }) {
  return (
    <div
      className="sct-inline"
      data-print="hide"
      data-cta="share-strip-inline"
      style={{
        margin: "0 0 32px",
        padding: "20px 24px",
        background: "var(--surface)",
        border: "1px solid var(--hairline)",
        borderLeft: "3px solid var(--amber)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
      }}
    >
      <div style={{ flex: "1 1 360px", minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.05rem",
            fontWeight: 500,
            color: "var(--fg)",
            lineHeight: 1.35,
          }}
        >
          {SHARE_CTA_HEADLINE}
          <span
            style={{
              color: "var(--fg-dim)",
              fontWeight: 400,
              marginLeft: 8,
            }}
          >
            — {SHARE_CTA_SUBLINE}
          </span>
        </div>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "0.92rem",
            color: "var(--fg-dim)",
            marginTop: 4,
            lineHeight: 1.45,
          }}
        >
          Pick a council of three minds and watch them argue your
          decision. No signup needed.
        </div>
      </div>
      <Link
        href={href}
        data-cta="share-strip-inline-button"
        className="font-mono"
        style={{
          flex: "0 0 auto",
          background: "#2a2018",
          color: "#f0ead8",
          border: "none",
          borderRadius: 0,
          fontSize: "12px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          padding: "14px 28px",
          textDecoration: "none",
          whiteSpace: "nowrap",
        }}
      >
        {SHARE_CTA_BUTTON_LABEL}
      </Link>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Sticky bottom bar (mobile)
   ──────────────────────────────────────────────────────────────── */

function StickyBar({ href }: { href: string }) {
  return (
    <div
      className="sct-sticky"
      data-print="hide"
      data-cta="share-strip-sticky"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 60,
        background: "var(--bg)",
        borderTop: "1px solid var(--hairline)",
        padding: "10px 14px calc(10px + env(safe-area-inset-bottom, 0px))",
        boxShadow: "0 -6px 18px rgba(0, 0, 0, 0.18)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
      }}
    >
      <div
        style={{
          flex: "1 1 auto",
          minWidth: 0,
          fontFamily: "var(--font-serif)",
          fontSize: "0.9rem",
          color: "var(--fg)",
          lineHeight: 1.3,
        }}
      >
        <div style={{ fontWeight: 500 }}>{SHARE_CTA_HEADLINE}</div>
        <div style={{ color: "var(--fg-dim)", fontSize: "0.78rem" }}>
          {SHARE_CTA_SUBLINE}
        </div>
      </div>
      <Link
        href={href}
        data-cta="share-strip-sticky-button"
        className="font-mono"
        style={{
          flex: "0 0 auto",
          background: "#2a2018",
          color: "#f0ead8",
          border: "none",
          borderRadius: 0,
          fontSize: "11px",
          letterSpacing: "0.13em",
          textTransform: "uppercase",
          padding: "11px 16px",
          textDecoration: "none",
          whiteSpace: "nowrap",
        }}
      >
        {SHARE_CTA_BUTTON_LABEL}
      </Link>
    </div>
  );
}
