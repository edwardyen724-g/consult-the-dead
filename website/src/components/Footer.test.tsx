/**
 * Tests for the Footer component.
 *
 * Vitest runs in node (no jsdom). We call the component as a plain function
 * and walk the returned React element tree, asserting:
 *   1. Exported CTA href constants carry the required UTM params.
 *   2. Both CTA links render with the correct hrefs and data-testids.
 *   3. The ProofStrip element is present with loading={false}.
 *
 * Mirrors the tree-walking pattern in Header.test.tsx and ProofStrip.test.tsx.
 */

import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

/* ── Mock external dependencies before importing Footer ───────── */

// Next.js Link: a plain pass-through that renders an <a>-like element.
vi.mock("next/link", () => ({
  default: (props: Record<string, unknown>) => ({ type: "a", props }),
}));

import {
  FOOTER_QUIZ_CTA_HREF,
  FOOTER_PRICING_CTA_HREF,
  Footer,
} from "./Footer";
import { ProofStrip } from "./ProofStrip";

/* ── Tree-walking helpers ────────────────────────────────────── */

interface ElementLike {
  type: unknown;
  props: Record<string, unknown> & { children?: ReactNode };
}

function isElement(node: unknown): node is ElementLike {
  return (
    typeof node === "object" &&
    node !== null &&
    "type" in node &&
    "props" in node
  );
}

function flatten(node: ReactNode): ElementLike[] {
  const out: ElementLike[] = [];
  function walk(n: ReactNode): void {
    if (Array.isArray(n)) {
      for (const child of n) walk(child);
      return;
    }
    if (!isElement(n)) return;
    out.push(n);
    const children = n.props.children;
    if (children !== undefined) walk(children as ReactNode);
  }
  walk(node);
  return out;
}

function findAll(
  tree: ReactNode,
  predicate: (el: ElementLike) => boolean,
): ElementLike[] {
  return flatten(tree).filter(predicate);
}

function findByTestId(tree: ReactNode, testId: string): ElementLike | null {
  const results = findAll(
    tree,
    (el) => el.props["data-testid"] === testId,
  );
  return results[0] ?? null;
}

/* ── Exported constant tests ─────────────────────────────────── */

describe("Footer exported constants", () => {
  it("FOOTER_QUIZ_CTA_HREF resolves to /quiz", () => {
    const url = new URL(FOOTER_QUIZ_CTA_HREF, "https://example.com");
    expect(url.pathname).toBe("/quiz");
  });

  it("FOOTER_QUIZ_CTA_HREF has utm_source=footer", () => {
    const url = new URL(FOOTER_QUIZ_CTA_HREF, "https://example.com");
    expect(url.searchParams.get("utm_source")).toBe("footer");
  });

  it("FOOTER_QUIZ_CTA_HREF has utm_medium=cta", () => {
    const url = new URL(FOOTER_QUIZ_CTA_HREF, "https://example.com");
    expect(url.searchParams.get("utm_medium")).toBe("cta");
  });

  it("FOOTER_QUIZ_CTA_HREF has utm_campaign=guided_entry", () => {
    const url = new URL(FOOTER_QUIZ_CTA_HREF, "https://example.com");
    expect(url.searchParams.get("utm_campaign")).toBe("guided_entry");
  });

  it("FOOTER_PRICING_CTA_HREF resolves to /pricing", () => {
    const url = new URL(FOOTER_PRICING_CTA_HREF, "https://example.com");
    expect(url.pathname).toBe("/pricing");
  });

  it("FOOTER_PRICING_CTA_HREF has utm_source=footer", () => {
    const url = new URL(FOOTER_PRICING_CTA_HREF, "https://example.com");
    expect(url.searchParams.get("utm_source")).toBe("footer");
  });

  it("FOOTER_PRICING_CTA_HREF has utm_medium=cta", () => {
    const url = new URL(FOOTER_PRICING_CTA_HREF, "https://example.com");
    expect(url.searchParams.get("utm_medium")).toBe("cta");
  });

  it("FOOTER_PRICING_CTA_HREF has utm_campaign=upgrade", () => {
    const url = new URL(FOOTER_PRICING_CTA_HREF, "https://example.com");
    expect(url.searchParams.get("utm_campaign")).toBe("upgrade");
  });
});

/* ── Structural rendering tests ──────────────────────────────── */

describe("Footer component — quiz CTA link", () => {
  const tree = Footer({});

  it("renders a link with the quiz CTA href", () => {
    const links = findAll(tree as ReactNode, (el) => {
      return (el.props as { href?: string }).href === FOOTER_QUIZ_CTA_HREF;
    });
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  it("quiz CTA link has data-testid='footer-quiz-cta'", () => {
    const el = findByTestId(tree as ReactNode, "footer-quiz-cta");
    expect(el).not.toBeNull();
  });

  it("quiz CTA link href includes utm_source=footer", () => {
    const el = findByTestId(tree as ReactNode, "footer-quiz-cta");
    const href = (el!.props as { href: string }).href;
    expect(href).toContain("utm_source=footer");
  });

  it("quiz CTA link href includes utm_campaign=guided_entry", () => {
    const el = findByTestId(tree as ReactNode, "footer-quiz-cta");
    const href = (el!.props as { href: string }).href;
    expect(href).toContain("utm_campaign=guided_entry");
  });

  it("quiz CTA link has a descriptive aria-label", () => {
    const el = findByTestId(tree as ReactNode, "footer-quiz-cta");
    const ariaLabel = (el!.props as { "aria-label"?: string })["aria-label"];
    expect(typeof ariaLabel).toBe("string");
    expect((ariaLabel as string).length).toBeGreaterThan(0);
  });
});

describe("Footer component — pricing CTA link", () => {
  const tree = Footer({});

  it("renders a link with the pricing CTA href", () => {
    const links = findAll(tree as ReactNode, (el) => {
      return (el.props as { href?: string }).href === FOOTER_PRICING_CTA_HREF;
    });
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  it("pricing CTA link has data-testid='footer-pricing-cta'", () => {
    const el = findByTestId(tree as ReactNode, "footer-pricing-cta");
    expect(el).not.toBeNull();
  });

  it("pricing CTA link href includes utm_source=footer", () => {
    const el = findByTestId(tree as ReactNode, "footer-pricing-cta");
    const href = (el!.props as { href: string }).href;
    expect(href).toContain("utm_source=footer");
  });

  it("pricing CTA link href includes utm_campaign=upgrade", () => {
    const el = findByTestId(tree as ReactNode, "footer-pricing-cta");
    const href = (el!.props as { href: string }).href;
    expect(href).toContain("utm_campaign=upgrade");
  });

  it("pricing CTA link has a descriptive aria-label", () => {
    const el = findByTestId(tree as ReactNode, "footer-pricing-cta");
    const ariaLabel = (el!.props as { "aria-label"?: string })["aria-label"];
    expect(typeof ariaLabel).toBe("string");
    expect((ariaLabel as string).length).toBeGreaterThan(0);
  });
});

describe("Footer component — ProofStrip integration", () => {
  const tree = Footer({});

  it("renders a ProofStrip element in the tree", () => {
    // JSX compiles <ProofStrip /> to React.createElement(ProofStrip, props),
    // so the tree contains an element whose `type` is the ProofStrip function.
    const strips = findAll(tree as ReactNode, (el) => el.type === ProofStrip);
    expect(strips.length).toBeGreaterThanOrEqual(1);
  });

  it("renders ProofStrip with loading={false}", () => {
    const strips = findAll(tree as ReactNode, (el) => el.type === ProofStrip);
    expect(strips.length).toBeGreaterThanOrEqual(1);
    const strip = strips[0]!;
    expect((strip.props as { loading?: boolean }).loading).toBe(false);
  });
});

describe("Footer component — CTA container", () => {
  const tree = Footer({});

  it("renders the footer-ctas container", () => {
    const container = findByTestId(tree as ReactNode, "footer-ctas");
    expect(container).not.toBeNull();
  });

  it("both CTA links are present in the footer", () => {
    const quizLink = findByTestId(tree as ReactNode, "footer-quiz-cta");
    const pricingLink = findByTestId(tree as ReactNode, "footer-pricing-cta");
    expect(quizLink).not.toBeNull();
    expect(pricingLink).not.toBeNull();
  });

  it("quiz CTA href points to /quiz", () => {
    const quizLink = findByTestId(tree as ReactNode, "footer-quiz-cta");
    const url = new URL(
      (quizLink!.props as { href: string }).href,
      "https://example.com",
    );
    expect(url.pathname).toBe("/quiz");
  });

  it("pricing CTA href points to /pricing", () => {
    const pricingLink = findByTestId(tree as ReactNode, "footer-pricing-cta");
    const url = new URL(
      (pricingLink!.props as { href: string }).href,
      "https://example.com",
    );
    expect(url.pathname).toBe("/pricing");
  });
});

/* ── PR#125 regression lockdown ─────────────────────────────── */
// These tests explicitly assert the exact href values and all required
// UTM parameters on both CTA links, locking down the guided-quiz and
// pricing footer CTAs introduced in PR#125.

describe("Footer regression — exact href values (PR#125)", () => {
  const tree = Footer({});

  it("quiz CTA href exactly matches FOOTER_QUIZ_CTA_HREF constant", () => {
    const el = findByTestId(tree as ReactNode, "footer-quiz-cta");
    expect((el!.props as { href: string }).href).toBe(FOOTER_QUIZ_CTA_HREF);
  });

  it("pricing CTA href exactly matches FOOTER_PRICING_CTA_HREF constant", () => {
    const el = findByTestId(tree as ReactNode, "footer-pricing-cta");
    expect((el!.props as { href: string }).href).toBe(FOOTER_PRICING_CTA_HREF);
  });

  it("quiz CTA href includes utm_medium=cta", () => {
    const el = findByTestId(tree as ReactNode, "footer-quiz-cta");
    const href = (el!.props as { href: string }).href;
    expect(href).toContain("utm_medium=cta");
  });

  it("pricing CTA href includes utm_medium=cta", () => {
    const el = findByTestId(tree as ReactNode, "footer-pricing-cta");
    const href = (el!.props as { href: string }).href;
    expect(href).toContain("utm_medium=cta");
  });

  it("pricing CTA href includes utm_source=footer", () => {
    const el = findByTestId(tree as ReactNode, "footer-pricing-cta");
    const href = (el!.props as { href: string }).href;
    const url = new URL(href, "https://example.com");
    expect(url.searchParams.get("utm_source")).toBe("footer");
  });

  it("quiz CTA href has all three required UTM params", () => {
    const url = new URL(FOOTER_QUIZ_CTA_HREF, "https://example.com");
    expect(url.searchParams.get("utm_source")).toBe("footer");
    expect(url.searchParams.get("utm_medium")).toBe("cta");
    expect(url.searchParams.get("utm_campaign")).toBe("guided_entry");
  });

  it("pricing CTA href has all three required UTM params", () => {
    const url = new URL(FOOTER_PRICING_CTA_HREF, "https://example.com");
    expect(url.searchParams.get("utm_source")).toBe("footer");
    expect(url.searchParams.get("utm_medium")).toBe("cta");
    expect(url.searchParams.get("utm_campaign")).toBe("upgrade");
  });
});
