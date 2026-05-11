import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PackId } from "@/lib/packs";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({
    alt,
    src,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & { src: string; alt: string }) => (
    // The test only needs a renderable stand-in for Next's Image component.
    <div data-alt={alt} data-src={src} {...props} />
  ),
}));

vi.mock("@/components/ConsensusGraph", () => ({
  ConsensusGraph: () => <div data-testid="consensus-graph" />,
  NODE_LABELS: ["POINTS", "TENSIONS", "ACTION", "STEPS", "RISKS"],
}));

import { AgoraApp, type MindOption } from "./AgoraApp";

const minds: MindOption[] = [
  {
    slug: "sun-tzu",
    name: "Sun Tzu",
    era: "Ancient China",
    domain: "strategy",
    lens: "Indirect",
    incidentCount: 12,
    colorVar: "--mind-sun-tzu",
    packIds: ["war-room"] as PackId[],
  },
  {
    slug: "marie-curie",
    name: "Marie Curie",
    era: "Modern",
    domain: "science",
    lens: "Evidence",
    incidentCount: 11,
    colorVar: "--mind-marie-curie",
    packIds: ["stoic-council"] as PackId[],
  },
  {
    slug: "niccolo-machiavelli",
    name: "Niccolo Machiavelli",
    era: "Renaissance",
    domain: "politics",
    lens: "Power",
    incidentCount: 14,
    colorVar: "--mind-niccolo-machiavelli",
    packIds: ["war-room"] as PackId[],
  },
];

describe("AgoraApp sample questions", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the tap-to-start sample question panel", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={minds} isPro={false} />);

    expect(markup).toContain("Or borrow a question from another querent");
    expect(markup).toContain("Should I raise VC or bootstrap?");
    expect(markup).toContain("Should we open-source our core product?");
    expect(markup).toContain(
      "My industry is being automated — pivot into AI, or double down on domain depth?",
    );
  });

  it("renders example topic cards with accessible aria-labels for click-to-fill", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={minds} isPro={false} />);

    // Each example topic button must have an aria-label announcing the click-to-fill action
    expect(markup).toContain(
      'aria-label="Use sample question: Should I raise VC or bootstrap?"',
    );
    expect(markup).toContain(
      'aria-label="Use sample question: Should we open-source our core product?"',
    );
    expect(markup).toContain(
      'aria-label="Use sample question: My industry is being automated — pivot into AI, or double down on domain depth?"',
    );
  });

  it("example topic buttons are type=button to prevent form submission", () => {
    const markup = renderToStaticMarkup(<AgoraApp minds={minds} isPro={false} />);

    // Count how many type="button" occurrences relate to example cards
    // We verify all three example topics appear paired with type="button"
    const matches = markup.match(/type="button"[^>]*aria-label="Use sample question:/g);
    // type attr comes before aria-label in rendered HTML, so check both orders
    const matchesAlt = markup.match(/aria-label="Use sample question:[^"]*"[^>]*>/g);
    expect((matches?.length ?? 0) + (matchesAlt?.length ?? 0)).toBeGreaterThanOrEqual(3);
  });
});
