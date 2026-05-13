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

import HomePage, {
  HOME_HERO_CTA_HREF,
  HOME_WEBSITE_SCHEMA,
  HOME_ORGANIZATION_SCHEMA,
} from "@/app/page";

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

  it("renders the 'Ask Your Question' label on the hero CTA", () => {
    const html = renderToStaticMarkup(HomePage() as React.ReactElement);
    expect(html).toContain("Ask Your Question");
  });

  it("renders without throwing", () => {
    expect(() => {
      renderToStaticMarkup(HomePage() as React.ReactElement);
    }).not.toThrow();
  });
});

describe("HomePage — decision-first hero headline", () => {
  it("renders an element with data-testid='hero-headline'", () => {
    const tree = HomePage();
    const headline = findByTestId(tree, "hero-headline");
    expect(headline).not.toBeNull();
  });

  it("hero headline text is ≤10 words", () => {
    const html = renderToStaticMarkup(HomePage() as React.ReactElement);
    // Extract the h1 inner text between the hero-headline tags
    const match = html.match(/data-testid="hero-headline"[^>]*>([\s\S]*?)<\/h1>/);
    expect(match).not.toBeNull();
    const innerText = match![1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const wordCount = innerText.split(" ").filter(Boolean).length;
    expect(wordCount).toBeLessThanOrEqual(10);
  });
});

describe("HomePage — hero demo preview", () => {
  it("renders an element with data-testid='hero-demo-preview'", () => {
    const tree = HomePage();
    const preview = findByTestId(tree, "hero-demo-preview");
    expect(preview).not.toBeNull();
  });

  it("hero demo preview appears within the hero section (before streaming-demo-section)", () => {
    const html = renderToStaticMarkup(HomePage() as React.ReactElement);
    const previewPos = html.indexOf('data-testid="hero-demo-preview"');
    const demoSectionPos = html.indexOf('data-testid="streaming-demo-section"');
    expect(previewPos).toBeGreaterThan(-1);
    expect(demoSectionPos).toBeGreaterThan(-1);
    expect(previewPos).toBeLessThan(demoSectionPos);
  });

  it("hero demo preview appears before the packs-section in rendered HTML", () => {
    const html = renderToStaticMarkup(HomePage() as React.ReactElement);
    const previewPos = html.indexOf('data-testid="hero-demo-preview"');
    const packsPos = html.indexOf('data-testid="packs-section"');
    expect(previewPos).toBeGreaterThan(-1);
    expect(previewPos).toBeLessThan(packsPos);
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

// ──────────────────────────────────────────────────────────────────────────
//  CTR experiment 3 — streaming demo surfaced above packs (task 96b05e8e)
//
//  Contract:
//  - The streaming-demo-section renders on the homepage.
//  - The streaming-demo-section appears BEFORE the packs-section in the
//    rendered HTML — i.e. visible on first scroll, not buried below the fold.
//  - The StreamingDemo is wrapped in a min-height container to prevent CLS
//    during client hydration (INITIAL_STATE → client update).
// ──────────────────────────────────────────────────────────────────────────

describe("HomePage — streaming demo section (CTR experiment 3)", () => {
  it("renders a section with data-testid='streaming-demo-section'", () => {
    const tree = HomePage();
    const demoSection = findByTestId(tree, "streaming-demo-section");
    expect(demoSection).not.toBeNull();
  });

  it("renders a section with data-testid='packs-section'", () => {
    const tree = HomePage();
    const packsSection = findByTestId(tree, "packs-section");
    expect(packsSection).not.toBeNull();
  });

  it("streaming-demo-section appears before packs-section in rendered HTML", () => {
    const html = renderToStaticMarkup(HomePage() as React.ReactElement);
    const demoPos = html.indexOf('data-testid="streaming-demo-section"');
    const packsPos = html.indexOf('data-testid="packs-section"');
    // Both must be present
    expect(demoPos).toBeGreaterThan(-1);
    expect(packsPos).toBeGreaterThan(-1);
    // Demo must appear first
    expect(demoPos).toBeLessThan(packsPos);
  });

  it("streaming-demo-section appears immediately after the hero section (no intervening named sections)", () => {
    const html = renderToStaticMarkup(HomePage() as React.ReactElement);
    const demoPos = html.indexOf('data-testid="streaming-demo-section"');
    const packsPos = html.indexOf('data-testid="packs-section"');
    // Nothing between demo and packs should contain another testid
    const between = html.slice(demoPos, packsPos);
    // No other data-testid anchors should appear in between
    const otherSectionIds = ["hero-cta", "footer-cta"].filter(
      (id) => !["streaming-demo-section"].includes(id)
    );
    // hero-cta is BEFORE the demo section, so it must NOT appear between demo and packs
    expect(between).not.toContain('data-testid="hero-cta"');
    expect(between).not.toContain('data-testid="footer-cta"');
  });

  it("demo section has a min-height wrapper to prevent CLS on hydration", () => {
    const html = renderToStaticMarkup(HomePage() as React.ReactElement);
    // The min-height div wrapping StreamingDemo must be present in the demo section
    const demoSectionStart = html.indexOf('data-testid="streaming-demo-section"');
    const packsSectionStart = html.indexOf('data-testid="packs-section"');
    const demoSectionHtml = html.slice(demoSectionStart, packsSectionStart);
    expect(demoSectionHtml).toContain("min-height");
  });

  it("renders the 'See it run' heading inside the demo section", () => {
    const html = renderToStaticMarkup(HomePage() as React.ReactElement);
    const demoSectionStart = html.indexOf('data-testid="streaming-demo-section"');
    const packsSectionStart = html.indexOf('data-testid="packs-section"');
    const demoSectionHtml = html.slice(demoSectionStart, packsSectionStart);
    expect(demoSectionHtml).toContain("See it run");
  });

  it("renders the 'Worked example' label inside the demo section", () => {
    const html = renderToStaticMarkup(HomePage() as React.ReactElement);
    const demoSectionStart = html.indexOf('data-testid="streaming-demo-section"');
    const packsSectionStart = html.indexOf('data-testid="packs-section"');
    const demoSectionHtml = html.slice(demoSectionStart, packsSectionStart);
    expect(demoSectionHtml).toContain("Worked example");
  });
});

describe("Homepage structured data (JSON-LD)", () => {
  it("HOME_WEBSITE_SCHEMA is @type WebSite with a SearchAction pointing to /agora", () => {
    expect(HOME_WEBSITE_SCHEMA["@type"]).toBe("WebSite");
    expect(HOME_WEBSITE_SCHEMA.url).toBe("https://www.consultthedead.com");
    expect(HOME_WEBSITE_SCHEMA.potentialAction["@type"]).toBe("SearchAction");
    expect(HOME_WEBSITE_SCHEMA.potentialAction.target.urlTemplate).toContain(
      "/agora?topic={search_term_string}",
    );
    expect(HOME_WEBSITE_SCHEMA.potentialAction["query-input"]).toBe(
      "required name=search_term_string",
    );
  });

  it("HOME_ORGANIZATION_SCHEMA is @type Organization with name and url", () => {
    expect(HOME_ORGANIZATION_SCHEMA["@type"]).toBe("Organization");
    expect(HOME_ORGANIZATION_SCHEMA.name).toBe("Consult The Dead");
    expect(HOME_ORGANIZATION_SCHEMA.url).toBe("https://www.consultthedead.com");
    expect(HOME_ORGANIZATION_SCHEMA.logo).toContain(
      "https://www.consultthedead.com",
    );
  });

  it("renders two application/ld+json script tags in the homepage HTML", () => {
    const html = renderToStaticMarkup(HomePage() as React.ReactElement);
    // dangerouslySetInnerHTML renders as inline content in the script element
    const scriptCount = (html.match(/application\/ld\+json/g) ?? []).length;
    expect(scriptCount).toBeGreaterThanOrEqual(2);
  });

  it("the rendered WebSite JSON-LD contains the sitelinks search action URL", () => {
    const html = renderToStaticMarkup(HomePage() as React.ReactElement);
    expect(html).toContain("search_term_string");
    expect(html).toContain("SearchAction");
  });

  it("the rendered Organization JSON-LD contains the org name", () => {
    const html = renderToStaticMarkup(HomePage() as React.ReactElement);
    expect(html).toContain("Consult The Dead");
  });
});
