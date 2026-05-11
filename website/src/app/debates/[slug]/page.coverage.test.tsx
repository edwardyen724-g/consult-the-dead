import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const coverageDebate = {
  slug: "coverage-debate",
  name: "Coverage Debate",
  forContext: "A case for branch coverage",
  topic: "Should the branch gate accept deliberate edge cases?",
  council: ["Niccolò Machiavelli", "Unknown Sage"],
  date: "2026-05-11",
  rounds: [
    {
      number: 1,
      speeches: [
        {
          advisor: "Niccolò Machiavelli",
          content: "Opening paragraph.\n\n- first point\n- second point",
        },
        {
          advisor: "Unknown Sage",
          content: "\n\n**Bold claim** and *italic aside*.",
        },
      ],
    },
  ],
  consensus: [],
};

const { getDebateMock } = vi.hoisted(() => ({
  getDebateMock: vi.fn((slug: string) =>
    slug === coverageDebate.slug ? coverageDebate : null,
  ),
}));

vi.mock("@/lib/debates", () => ({
  debateCanonicalUrl: vi.fn((slug: string) => `https://example.com/debates/${slug}`),
  getAllDebateSlugs: vi.fn(() => [coverageDebate.slug]),
  getDebate: getDebateMock,
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import DebatePage from "./page";

describe("DebatePage branch coverage", () => {
  it("renders bullet lists, inline markdown, and the default advisor color branch", async () => {
    const html = renderToStaticMarkup(
      await DebatePage({ params: Promise.resolve({ slug: coverageDebate.slug }) }),
    );

    expect(html).toContain("Should the branch gate accept deliberate edge cases?");
    expect(html).toContain("<ul");
    expect(html).toContain("<strong>Bold claim</strong>");
    expect(html).toContain("<em>italic aside</em>");
    expect(html).toContain("Unknown Sage");
    expect(html).toContain("var(--fg-dim)");
    expect(html).not.toContain("Council Consensus");
  });
});
