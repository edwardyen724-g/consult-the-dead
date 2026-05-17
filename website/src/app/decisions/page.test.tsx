import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { getActiveDecisions } from "../../../content/decisions";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    style,
    "data-testid": dataTestId,
  }: {
    href: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
    "data-testid"?: string;
  }) => (
    <a href={href} style={style} data-testid={dataTestId}>
      {children}
    </a>
  ),
}));

import DecisionsPage, { metadata } from "./page";

describe("DecisionsPage metadata", () => {
  it("has a title that includes Decisions and Consult The Dead", () => {
    expect(String(metadata.title)).toContain("Decisions");
    expect(String(metadata.title)).toContain("Consult The Dead");
  });

  it("has a description that mentions high-intent decisions", () => {
    expect(metadata.description).toContain("High-intent decisions");
  });

  it("has a canonical URL pointing to /decisions", () => {
    const canonical = (metadata.alternates as { canonical?: string })
      ?.canonical;
    expect(canonical).toBe("https://www.consultthedead.com/decisions");
  });

  it("has openGraph url pointing to /decisions", () => {
    const og = metadata.openGraph as { url?: string };
    expect(og?.url).toContain("/decisions");
  });
});

describe("DecisionsPage rendering", () => {
  it("renders every currently-active decision entry", () => {
    const element = DecisionsPage();
    const html = renderToStaticMarkup(element);

    const active = getActiveDecisions();
    expect(active.length).toBeGreaterThanOrEqual(86);

    // Use slug-based links rather than title text since renderToStaticMarkup
    // HTML-encodes apostrophes in titles (e.g. "It's" → "It&#x27;s").
    for (const entry of active) {
      expect(html).toContain(`href="/decisions/${entry.slug}"`);
    }
  });

  it("renders links pointing to /decisions/[slug] for every active entry", () => {
    const element = DecisionsPage();
    const html = renderToStaticMarkup(element);

    for (const entry of getActiveDecisions()) {
      expect(html).toContain(`href="/decisions/${entry.slug}"`);
    }
  });

  it("includes links for all three batch 7 slugs", () => {
    const element = DecisionsPage();
    const html = renderToStaticMarkup(element);

    expect(html).toContain('href="/decisions/should-i-launch-on-product-hunt"');
    expect(html).toContain('href="/decisions/should-i-offer-a-free-tier"');
    expect(html).toContain('href="/decisions/should-i-rebrand"');
  });

  it("includes the active entry count in the description text", () => {
    const element = DecisionsPage();
    const html = renderToStaticMarkup(element);

    expect(html).toContain(String(getActiveDecisions().length));
  });

  it("includes a back link to the home page", () => {
    const element = DecisionsPage();
    const html = renderToStaticMarkup(element);

    expect(html).toContain('href="/"');
    expect(html).toContain("Consult The Dead");
  });

  it("renders a decisions-list test id", () => {
    const element = DecisionsPage();
    const html = renderToStaticMarkup(element);

    expect(html).toContain('data-testid="decisions-list"');
  });

  it("renders a decision-item test id for each active entry", () => {
    const element = DecisionsPage();
    const html = renderToStaticMarkup(element);

    const matches = html.match(/data-testid="decision-item"/g);
    expect(matches).toHaveLength(getActiveDecisions().length);
  });

  it("renders the page heading", () => {
    const element = DecisionsPage();
    const html = renderToStaticMarkup(element);

    expect(html).toContain(">Decisions<");
  });

  it("includes descriptive text about the index purpose", () => {
    const element = DecisionsPage();
    const html = renderToStaticMarkup(element);

    expect(html).toContain("agon");
  });

  it("has no duplicate slugs across active entries", () => {
    const slugs = getActiveDecisions().map((e) => e.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });
});
