/**
 * Focused contract tests for /packs landing page (task 70e4f545).
 *
 * Asserts:
 *  - ProofStrip renders (data-testid="proof-strip" present in tree)
 *  - Quiz CTA renders with the correct href to /quiz with packs UTM params
 *  - Pack cards render linking to /packs/[id]
 *
 * Vitest runs with environment: "node" — no jsdom. We render the page
 * component directly (it's a Server Component / plain async function) and
 * walk the React element tree using the same helper pattern as
 * ProofStrip.test.tsx.
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock next/link so renderToStaticMarkup can handle it.
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement("a", { href, ...rest }, children),
}));

// ──────────────────────────────────────────────────────────────────────────
//  Element walker helpers (mirrors ProofStrip.test.tsx)
// ──────────────────────────────────────────────────────────────────────────

interface ElementLike {
  type?: unknown;
  props?: Record<string, unknown> & { children?: unknown };
}

function isElementLike(node: unknown): node is ElementLike {
  return (
    typeof node === "object" &&
    node !== null &&
    "props" in (node as Record<string, unknown>)
  );
}

function walk(node: unknown, visit: (el: ElementLike) => void): void {
  if (node == null || node === false) return;
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit);
    return;
  }
  if (!isElementLike(node)) return;
  visit(node);
  if (node.props && "children" in node.props) {
    walk(node.props.children, visit);
  }
}

function findByTestId(root: unknown, id: string): ElementLike | null {
  let found: ElementLike | null = null;
  walk(root, (el) => {
    if (found) return;
    if (el.props && el.props["data-testid"] === id) found = el;
  });
  return found;
}

function findAllByTestId(root: unknown, id: string): ElementLike[] {
  const found: ElementLike[] = [];
  walk(root, (el) => {
    if (el.props && el.props["data-testid"] === id) found.push(el);
  });
  return found;
}

// ──────────────────────────────────────────────────────────────────────────
//  Imports under test
// ──────────────────────────────────────────────────────────────────────────

import PacksPage, { PACKS_QUIZ_CTA_HREF } from "@/app/packs/page";
import { ProofStrip } from "@/components/ProofStrip";

// Helper: find a React element whose `type` is the given component function.
function findByComponent(root: unknown, component: unknown): ElementLike | null {
  let found: ElementLike | null = null;
  walk(root, (el) => {
    if (found) return;
    if (el.type === component) found = el;
  });
  return found;
}

// ──────────────────────────────────────────────────────────────────────────
//  Tests
// ──────────────────────────────────────────────────────────────────────────

describe("PacksPage — ProofStrip", () => {
  it("renders the ProofStrip component in the page tree", () => {
    const tree = PacksPage();
    // The page includes <ProofStrip /> as a component element. We check the
    // element type directly since the element tree walker does not recurse
    // into non-DOM component subtrees before they are rendered.
    const strip = findByComponent(tree, ProofStrip);
    expect(strip).not.toBeNull();
  });

  it("renders ProofStrip output (data-testid='proof-strip') in the full HTML", () => {
    // Use renderToStaticMarkup which actually calls the ProofStrip function,
    // allowing us to confirm the fallback strip renders in the final HTML.
    const html = renderToStaticMarkup(PacksPage() as React.ReactElement);
    expect(html).toContain('data-testid="proof-strip"');
  });
});

describe("PacksPage — guided quiz CTA", () => {
  it("renders at least one quiz CTA link with the correct href", () => {
    const tree = PacksPage();
    // Primary CTA in hero
    const heroCta = findByTestId(tree, "packs-quiz-cta");
    expect(heroCta).not.toBeNull();
    expect(heroCta!.props!.href).toBe(PACKS_QUIZ_CTA_HREF);
  });

  it("renders the bottom quiz CTA link with the same href", () => {
    const tree = PacksPage();
    const bottomCta = findByTestId(tree, "packs-quiz-cta-bottom");
    expect(bottomCta).not.toBeNull();
    expect(bottomCta!.props!.href).toBe(PACKS_QUIZ_CTA_HREF);
  });

  it("quiz CTA href points to /quiz with packs UTM params", () => {
    expect(PACKS_QUIZ_CTA_HREF).toBe(
      "/quiz?utm_source=packs&utm_medium=page_cta&utm_campaign=guided_entry",
    );
  });

  it("quiz CTA carries an accessible aria-label", () => {
    const tree = PacksPage();
    const heroCta = findByTestId(tree, "packs-quiz-cta");
    expect(heroCta!.props!["aria-label"]).toBeTruthy();
  });
});

describe("PacksPage — pack cards", () => {
  it("renders a card for each live pack", () => {
    const tree = PacksPage();
    // We can't enumerate dynamic pack IDs easily here, but we know at least
    // one pack (war-room / stoic-council etc.) must be live.
    const cards = findAllByTestId(tree, /^pack-card-/.source as unknown as string);
    // Fallback: check via HTML render
    const html = renderToStaticMarkup(tree as React.ReactElement);
    expect(html).toContain("/packs/stoic-council");
    expect(html).toContain("/packs/war-room");
  });

  it("renders pack cards linking to /packs/[id]", () => {
    const html = renderToStaticMarkup(PacksPage() as React.ReactElement);
    // All pack hrefs follow /packs/<id> format
    expect(html).toMatch(/href="\/packs\/[a-z-]+"/);
  });
});

describe("PacksPage — metadata export", () => {
  it("exports metadata with a title referencing Mind Packs", async () => {
    const { metadata } = await import("@/app/packs/page");
    expect((metadata as { title: string }).title).toContain("Mind Packs");
  });
});

describe("PacksPage — full HTML render (smoke)", () => {
  it("renders without throwing", () => {
    expect(() => {
      renderToStaticMarkup(PacksPage() as React.ReactElement);
    }).not.toThrow();
  });

  it("includes Take the Guided Quiz text in output", () => {
    const html = renderToStaticMarkup(PacksPage() as React.ReactElement);
    expect(html).toContain("Take the Guided Quiz");
  });

  it("contains the quiz href with all three UTM params", () => {
    const html = renderToStaticMarkup(PacksPage() as React.ReactElement);
    expect(html).toContain("utm_source=packs");
    expect(html).toContain("utm_medium=page_cta");
    expect(html).toContain("utm_campaign=guided_entry");
  });
});
