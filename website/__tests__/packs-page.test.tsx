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

// Mock the DB client so the async packs page doesn't try to connect to Postgres.
const getPublicAgonsMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db/client", () => ({
  db: { getPublicAgons: getPublicAgonsMock },
}));

beforeEach(() => {
  getPublicAgonsMock.mockResolvedValue([]);
});

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

// ──────────────────────────────────────────────────────────────────────────
//  Tests
// ──────────────────────────────────────────────────────────────────────────

describe("PacksPage — collection feedback strip", () => {
  it("renders the collection feedback strip when public agons exist", async () => {
    getPublicAgonsMock.mockResolvedValue([
      { share_id: "s1", topic: "T1", mind_slugs: ["sun-tzu"], created_at: "2026-01-01" },
    ]);
    const html = renderToStaticMarkup(
      (await PacksPage()) as React.ReactElement,
    );
    expect(html).toContain('data-testid="collection-feedback"');
    expect(html).toContain("Collection feedback");
  });

  it("omits the collection feedback strip when there are no public agons", async () => {
    getPublicAgonsMock.mockResolvedValue([]);
    const html = renderToStaticMarkup(
      (await PacksPage()) as React.ReactElement,
    );
    expect(html).not.toContain('data-testid="collection-feedback"');
  });
});

describe("PacksPage — guided quiz CTA", () => {
  it("renders at least one quiz CTA link with the correct href", async () => {
    const tree = await PacksPage();
    // Primary CTA in hero
    const heroCta = findByTestId(tree, "packs-quiz-cta");
    expect(heroCta).not.toBeNull();
    expect(heroCta!.props!.href).toBe(PACKS_QUIZ_CTA_HREF);
  });

  it("renders the bottom quiz CTA link with the same href", async () => {
    const tree = await PacksPage();
    const bottomCta = findByTestId(tree, "packs-quiz-cta-bottom");
    expect(bottomCta).not.toBeNull();
    expect(bottomCta!.props!.href).toBe(PACKS_QUIZ_CTA_HREF);
  });

  it("quiz CTA href points to /quiz with packs UTM params", () => {
    expect(PACKS_QUIZ_CTA_HREF).toBe(
      "/quiz?utm_source=packs&utm_medium=page_cta&utm_campaign=guided_entry",
    );
  });

  it("quiz CTA carries an accessible aria-label", async () => {
    const tree = await PacksPage();
    const heroCta = findByTestId(tree, "packs-quiz-cta");
    expect(heroCta!.props!["aria-label"]).toBeTruthy();
  });
});

describe("PacksPage — pack cards", () => {
  it("renders a card for each live pack", async () => {
    const tree = await PacksPage();
    // Fallback: check via HTML render
    const html = renderToStaticMarkup(tree as React.ReactElement);
    expect(html).toContain("/packs/stoic-council");
    expect(html).toContain("/packs/war-room");
  });

  it("renders pack cards linking to /packs/[id]", async () => {
    const html = renderToStaticMarkup(
      (await PacksPage()) as React.ReactElement,
    );
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
  it("renders without throwing", async () => {
    await expect(
      PacksPage().then((tree) =>
        renderToStaticMarkup(tree as React.ReactElement),
      ),
    ).resolves.not.toThrow();
  });

  it("includes Take the Guided Quiz text in output", async () => {
    const html = renderToStaticMarkup(
      (await PacksPage()) as React.ReactElement,
    );
    expect(html).toContain("Take the Guided Quiz");
  });

  it("contains the quiz href with all three UTM params", async () => {
    const html = renderToStaticMarkup(
      (await PacksPage()) as React.ReactElement,
    );
    expect(html).toContain("utm_source=packs");
    expect(html).toContain("utm_medium=page_cta");
    expect(html).toContain("utm_campaign=guided_entry");
  });
});
