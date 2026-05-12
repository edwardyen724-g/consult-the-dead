/**
 * Regression tests for the homepage hero CTA UTM contract (task c92780db).
 *
 * Contract:
 *  - The hero CTA links to /agora with utm_campaign AND utm_content query params.
 *  - utm_source is NOT present on the Agora URL (homepage is origin, not a campaign source).
 *  - No click IDs (gclid, fbclid, msclkid, etc.) are forwarded into the Agora URL.
 *  - The CTA is visible and carries an accessible aria-label.
 *
 * Vitest runs with environment: "node" — no jsdom. We render the page
 * component directly (it's a plain function / RSC-compatible) and walk the
 * React element tree, mirroring the pattern used in packs-page.test.tsx.
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, vi } from "vitest";

// ──────────────────────────────────────────────────────────────────────────
//  Next.js Link mock — renderToStaticMarkup needs a DOM-renderable element.
// ──────────────────────────────────────────────────────────────────────────

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
//  React element walker helpers (mirrors packs-page.test.tsx)
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

function findByTestId(root: unknown, testId: string): ElementLike | null {
  let found: ElementLike | null = null;
  walk(root, (el) => {
    if (found) return;
    if (el.props && el.props["data-testid"] === testId) found = el;
  });
  return found;
}

function findAllByTestId(root: unknown, testId: string): ElementLike[] {
  const found: ElementLike[] = [];
  walk(root, (el) => {
    if (el.props && el.props["data-testid"] === testId) found.push(el);
  });
  return found;
}

// ──────────────────────────────────────────────────────────────────────────
//  Imports under test
// ──────────────────────────────────────────────────────────────────────────

import HomePage, { HOME_HERO_CTA_HREF } from "@/app/page";

// ──────────────────────────────────────────────────────────────────────────
//  Tests
// ──────────────────────────────────────────────────────────────────────────

describe("HomePage — HOME_HERO_CTA_HREF constant", () => {
  it("points to /agora", () => {
    const url = new URL(HOME_HERO_CTA_HREF, "https://example.com");
    expect(url.pathname).toBe("/agora");
  });

  it("contains utm_campaign query param", () => {
    const url = new URL(HOME_HERO_CTA_HREF, "https://example.com");
    expect(url.searchParams.has("utm_campaign")).toBe(true);
    expect(url.searchParams.get("utm_campaign")).toBeTruthy();
  });

  it("contains utm_content query param", () => {
    const url = new URL(HOME_HERO_CTA_HREF, "https://example.com");
    expect(url.searchParams.has("utm_content")).toBe(true);
    expect(url.searchParams.get("utm_content")).toBeTruthy();
  });

  it("utm_content reflects 'start_your_first_agon' CTA copy", () => {
    const url = new URL(HOME_HERO_CTA_HREF, "https://example.com");
    expect(url.searchParams.get("utm_content")).toBe("start_your_first_agon");
  });

  it("does NOT contain utm_source", () => {
    const url = new URL(HOME_HERO_CTA_HREF, "https://example.com");
    expect(url.searchParams.has("utm_source")).toBe(false);
  });

  it("does NOT forward click IDs (gclid, fbclid, msclkid, ttclid)", () => {
    const url = new URL(HOME_HERO_CTA_HREF, "https://example.com");
    for (const clickId of ["gclid", "fbclid", "msclkid", "ttclid", "_ga"]) {
      expect(url.searchParams.has(clickId)).toBe(false);
    }
  });

  it("has no unexpected query parameters beyond utm_campaign and utm_content", () => {
    const url = new URL(HOME_HERO_CTA_HREF, "https://example.com");
    const allowed = new Set(["utm_campaign", "utm_content"]);
    for (const key of url.searchParams.keys()) {
      expect(allowed.has(key)).toBe(true);
    }
  });
});

describe("HomePage — hero CTA element", () => {
  it("renders a hero CTA link with data-testid='hero-cta'", () => {
    const tree = HomePage();
    const heroCta = findByTestId(tree, "hero-cta");
    expect(heroCta).not.toBeNull();
  });

  it("hero CTA href matches HOME_HERO_CTA_HREF", () => {
    const tree = HomePage();
    const heroCta = findByTestId(tree, "hero-cta");
    expect(heroCta!.props!.href).toBe(HOME_HERO_CTA_HREF);
  });

  it("hero CTA carries an accessible aria-label", () => {
    const tree = HomePage();
    const heroCta = findByTestId(tree, "hero-cta");
    expect(typeof heroCta!.props!["aria-label"]).toBe("string");
    expect((heroCta!.props!["aria-label"] as string).length).toBeGreaterThan(0);
  });

  it("hero CTA href path is /agora", () => {
    const tree = HomePage();
    const heroCta = findByTestId(tree, "hero-cta");
    const href = heroCta!.props!.href as string;
    expect(href.startsWith("/agora")).toBe(true);
  });
});

describe("HomePage — hero CTA UTM contract (rendered HTML)", () => {
  it("renders hero CTA with utm_campaign in output", () => {
    const html = renderToStaticMarkup(HomePage() as React.ReactElement);
    expect(html).toContain("utm_campaign=");
  });

  it("renders hero CTA with utm_content in output", () => {
    const html = renderToStaticMarkup(HomePage() as React.ReactElement);
    expect(html).toContain("utm_content=");
  });

  it("does NOT render utm_source on any /agora CTA link", () => {
    const html = renderToStaticMarkup(HomePage() as React.ReactElement);
    // All agora hrefs must be utm_source-free
    const agoraHrefPattern = /href="\/agora[^"]*"/g;
    const matches = html.match(agoraHrefPattern) ?? [];
    // There must be at least one agora link
    expect(matches.length).toBeGreaterThan(0);
    for (const match of matches) {
      expect(match).not.toContain("utm_source=");
    }
  });

  it("does NOT forward gclid or fbclid into any agora link", () => {
    const html = renderToStaticMarkup(HomePage() as React.ReactElement);
    const agoraHrefPattern = /href="\/agora[^"]*"/g;
    const matches = html.match(agoraHrefPattern) ?? [];
    for (const match of matches) {
      expect(match).not.toContain("gclid=");
      expect(match).not.toContain("fbclid=");
    }
  });

  it("renders the 'Start your first agon' label on the hero CTA", () => {
    const html = renderToStaticMarkup(HomePage() as React.ReactElement);
    expect(html).toContain("Start your first agon");
  });

  it("renders without throwing", () => {
    expect(() => {
      renderToStaticMarkup(HomePage() as React.ReactElement);
    }).not.toThrow();
  });
});

describe("HomePage — footer CTA element", () => {
  it("renders a footer CTA link with data-testid='footer-cta'", () => {
    const tree = HomePage();
    const footerCta = findByTestId(tree, "footer-cta");
    expect(footerCta).not.toBeNull();
  });

  it("footer CTA href also uses HOME_HERO_CTA_HREF (no source/click IDs)", () => {
    const tree = HomePage();
    const footerCta = findByTestId(tree, "footer-cta");
    expect(footerCta!.props!.href).toBe(HOME_HERO_CTA_HREF);
  });
});
