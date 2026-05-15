import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { DECISION_ENTRIES } from "../../../content/decisions";

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

  it("has a description that mentions the number of decisions", () => {
    expect(metadata.description).toContain("81");
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
  it("renders all 81 decision entries", () => {
    const element = DecisionsPage();
    const html = renderToStaticMarkup(element);

    expect(DECISION_ENTRIES).toHaveLength(81);

    // Use slug-based links rather than title text since renderToStaticMarkup
    // HTML-encodes apostrophes in titles (e.g. "It's" → "It&#x27;s").
    for (const entry of DECISION_ENTRIES) {
      expect(html).toContain(`href="/decisions/${entry.slug}"`);
    }
  });

  it("renders links pointing to /decisions/[slug] for every entry", () => {
    const element = DecisionsPage();
    const html = renderToStaticMarkup(element);

    for (const entry of DECISION_ENTRIES) {
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

  it("includes the entry count in the description text", () => {
    const element = DecisionsPage();
    const html = renderToStaticMarkup(element);

    expect(html).toContain("81");
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

  it("renders a decision-item test id for each entry", () => {
    const element = DecisionsPage();
    const html = renderToStaticMarkup(element);

    const matches = html.match(/data-testid="decision-item"/g);
    expect(matches).toHaveLength(81);
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

  it("has no duplicate slugs across all entries", () => {
    const slugs = DECISION_ENTRIES.map((e) => e.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });
});
