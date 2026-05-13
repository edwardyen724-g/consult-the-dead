import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Framework, FrameworkSlug } from "@/lib/frameworks";

import { DECISION_ENTRIES, buildDecisionAgoraHref } from "../../../../content/decisions";

const mocks = vi.hoisted(() => ({
  getFramework: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/lib/frameworks", () => ({
  getFramework: mocks.getFramework,
  SLUG_COLOR_VAR: {
    "isaac-newton": "var(--color-newton)",
    "marie-curie": "var(--color-curie)",
    "niccolo-machiavelli": "var(--color-machiavelli)",
    "marcus-aurelius": "var(--color-aurelius)",
    "sun-tzu": "var(--color-suntzu)",
    "steve-jobs": "var(--color-jobs)",
    "benjamin-franklin": "var(--color-franklin)",
    "julius-caesar": "var(--color-caesar)",
    "andrew-carnegie": "var(--color-carnegie)",
  },
}));

vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    style,
  }: {
    href: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
  }) => (
    <a href={href} style={style}>
      {children}
    </a>
  ),
}));

import DecisionPage, { generateMetadata, generateStaticParams } from "./page";

function makeFramework(
  slug: FrameworkSlug,
  person: string,
  overrides: Partial<Framework> = {},
): Framework {
  return {
    slug,
    meta: {
      person,
      domain: "Strategy",
      incident_count: 5,
      construct_count: 3,
      ...overrides.meta,
    },
    era: "1900–2000",
    perceptual_lens: {
      statement: `${person} sees the decision through a strategic lens.`,
      what_they_notice_first: "power",
      what_they_ignore: "noise",
      ...overrides.perceptual_lens,
    },
    bipolar_constructs: [],
    blind_spots: [],
    behavioral_divergence_predictions: [],
    incidents: [],
    ...overrides,
  };
}

beforeEach(() => {
  mocks.getFramework.mockReset();
  mocks.notFound.mockReset();
  mocks.notFound.mockImplementation(() => {
    throw new Error("NEXT_NOT_FOUND");
  });
  mocks.getFramework.mockImplementation((slug: FrameworkSlug) =>
    makeFramework(
      slug,
      {
        "niccolo-machiavelli": "Niccolò Machiavelli",
        "marie-curie": "Marie Curie",
        "sun-tzu": "Sun Tzu",
        "marcus-aurelius": "Marcus Aurelius",
        "steve-jobs": "Steve Jobs",
        "benjamin-franklin": "Benjamin Franklin",
        "julius-caesar": "Julius Caesar",
        "andrew-carnegie": "Andrew Carnegie",
      }[slug] ?? slug,
    ),
  );
});

describe("generateStaticParams", () => {
  it("returns one slug per shipped decision entry", () => {
    const params = generateStaticParams();
    expect(params).toEqual(DECISION_ENTRIES.map((entry) => ({ slug: entry.slug })));
    expect(params).toEqual(
      expect.arrayContaining([
        { slug: "should-i-fire-my-cofounder" },
        { slug: "should-i-pivot-or-persist" },
        { slug: "should-i-take-this-job-offer" },
        { slug: "should-i-sell-my-startup" },
        { slug: "should-i-shut-down-my-startup" },
        { slug: "should-i-launch-on-product-hunt" },
        { slug: "should-i-offer-a-free-tier" },
        { slug: "should-i-rebrand" },
      ]),
    );
  });
});

describe("generateMetadata", () => {
  it("returns the page title and SEO metadata for a known slug", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "should-i-raise-vc-or-bootstrap" }),
    });

    expect(meta.title).toBe("Should I Raise VC or Bootstrap?");
    expect(meta.description).toContain("Venture capital buys speed");
    expect(meta.keywords).toEqual(
      expect.arrayContaining(["should I raise VC or bootstrap", "VC vs bootstrap pros and cons"]),
    );
    expect((meta.alternates as { canonical?: string })?.canonical).toBe(
      "https://www.consultthedead.com/decisions/should-i-raise-vc-or-bootstrap",
    );
  });

  it("returns a noindex stub for an unknown slug", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "does-not-exist" }),
    });

    expect(meta.title).toBe("Not Found");
    expect((meta.robots as { index?: boolean })?.index).toBe(false);
    expect((meta.robots as { follow?: boolean })?.follow).toBe(false);
  });

  it("returns correct metadata for should-i-launch-on-product-hunt", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "should-i-launch-on-product-hunt" }),
    });

    expect(meta.title).toBe("Should I Launch on Product Hunt?");
    expect(meta.description).toContain("Steve Jobs");
    expect(meta.description).toContain("Benjamin Franklin");
    expect(meta.description).toContain("Julius Caesar");
    expect(meta.keywords).toEqual(
      expect.arrayContaining([
        "should I launch on Product Hunt",
        "product hunt launch strategy",
      ]),
    );
    expect((meta.alternates as { canonical?: string })?.canonical).toBe(
      "https://www.consultthedead.com/decisions/should-i-launch-on-product-hunt",
    );
    expect((meta.openGraph as { url?: string })?.url).toBe(
      "https://www.consultthedead.com/decisions/should-i-launch-on-product-hunt",
    );
    expect((meta.openGraph as { title?: string })?.title).toBe("Should I Launch on Product Hunt?");
  });

  it("returns correct metadata for should-i-offer-a-free-tier", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "should-i-offer-a-free-tier" }),
    });

    expect(meta.title).toBe("Should I Offer a Free Tier?");
    expect(meta.description).toContain("Steve Jobs");
    expect(meta.description).toContain("Andrew Carnegie");
    expect(meta.description).toContain("Marcus Aurelius");
    expect(meta.keywords).toEqual(
      expect.arrayContaining([
        "should I offer a free tier",
        "freemium vs paid SaaS",
      ]),
    );
    expect((meta.alternates as { canonical?: string })?.canonical).toBe(
      "https://www.consultthedead.com/decisions/should-i-offer-a-free-tier",
    );
    expect((meta.openGraph as { url?: string })?.url).toBe(
      "https://www.consultthedead.com/decisions/should-i-offer-a-free-tier",
    );
  });

  it("returns correct metadata for should-i-rebrand", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "should-i-rebrand" }),
    });

    expect(meta.title).toBe("Should I Rebrand?");
    expect(meta.description).toContain("Steve Jobs");
    expect(meta.description).toContain("Marcus Aurelius");
    expect(meta.description).toContain("Niccolò Machiavelli");
    expect(meta.keywords).toEqual(
      expect.arrayContaining([
        "should I rebrand my startup",
        "when to rebrand a company",
      ]),
    );
    expect((meta.alternates as { canonical?: string })?.canonical).toBe(
      "https://www.consultthedead.com/decisions/should-i-rebrand",
    );
    expect((meta.openGraph as { url?: string })?.url).toBe(
      "https://www.consultthedead.com/decisions/should-i-rebrand",
    );
  });
});

describe("DecisionPage", () => {
  it("renders a shipped decision page with the start-your-own-agon CTA", async () => {
    const element = await DecisionPage({
      params: Promise.resolve({ slug: "should-i-raise-vc-or-bootstrap" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Should I Raise VC or Bootstrap?");
    expect(html).toContain("VC vs bootstrap pros and cons");
    expect(html).toContain("Niccolò Machiavelli");
    expect(html).toContain("Marie Curie");
    expect(html).toContain("Sun Tzu");
    expect(html).toContain(
      'href="/agora?minds=niccolo-machiavelli%2Cmarie-curie%2Csun-tzu&amp;utm_source=decision&amp;utm_campaign=decision_surface&amp;utm_content=should-i-raise-vc-or-bootstrap"',
    );
    expect(html).toContain("Start your own agon in the Agora");
    expect(html).toContain("Start your own agon");
  });

  it("renders the Round 1 debate preview when a debate file exists", async () => {
    const element = await DecisionPage({
      params: Promise.resolve({ slug: "should-i-raise-a-series-a" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("How the council debates this question");
    expect(html).toContain("Marie Curie");
    expect(html).toContain("John D. Rockefeller");
    expect(html).toContain("Niccolò Machiavelli");
    expect(html).toContain("This is Round 1 of a 3-round debate. Start your own agon to go deeper.");
    expect(html).toContain("Every major decision in a research laboratory begins with the same discipline");
  });

  it("uses the shipped date in the rendered metadata row", async () => {
    const element = await DecisionPage({
      params: Promise.resolve({ slug: "should-i-quit-my-job-to-start-a-company" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("May 12, 2026");
  });

  it("falls back to amber when a framework slug is not mapped to a color", async () => {
    const unknownSlug = "mystery-mind" as FrameworkSlug;
    mocks.getFramework.mockImplementation((slug: FrameworkSlug) =>
      makeFramework(
        slug === "niccolo-machiavelli" ? unknownSlug : slug,
        {
          "niccolo-machiavelli": "Mystery Mind",
          "marie-curie": "Marie Curie",
          "sun-tzu": "Sun Tzu",
          "marcus-aurelius": "Marcus Aurelius",
        }[slug] ?? slug,
      ),
    );

    const element = await DecisionPage({
      params: Promise.resolve({ slug: "should-i-raise-vc-or-bootstrap" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("var(--amber)");
  });

  it("renders the should-i-launch-on-product-hunt page with correct council and CTA", async () => {
    const element = await DecisionPage({
      params: Promise.resolve({ slug: "should-i-launch-on-product-hunt" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Should I Launch on Product Hunt?");
    expect(html).toContain("Steve Jobs");
    expect(html).toContain("Benjamin Franklin");
    expect(html).toContain("Julius Caesar");
    expect(html).toContain(
      'href="/agora?minds=steve-jobs%2Cbenjamin-franklin%2Cjulius-caesar&amp;utm_source=decision&amp;utm_campaign=decision_surface&amp;utm_content=should-i-launch-on-product-hunt"',
    );
    expect(html).toContain("Start your own agon in the Agora");
    expect(html).toContain("Start your own agon");
  });

  it("renders the should-i-launch-on-product-hunt debate preview", async () => {
    const element = await DecisionPage({
      params: Promise.resolve({ slug: "should-i-launch-on-product-hunt" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("How the council debates this question");
    expect(html).toContain("This is Round 1 of a 3-round debate. Start your own agon to go deeper.");
    expect(html).toContain("A launch is not a marketing event");
  });

  it("renders the should-i-offer-a-free-tier page with correct council and CTA", async () => {
    const element = await DecisionPage({
      params: Promise.resolve({ slug: "should-i-offer-a-free-tier" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Should I Offer a Free Tier?");
    expect(html).toContain("Steve Jobs");
    expect(html).toContain("Andrew Carnegie");
    expect(html).toContain("Marcus Aurelius");
    expect(html).toContain(
      'href="/agora?minds=steve-jobs%2Candrew-carnegie%2Cmarcus-aurelius&amp;utm_source=decision&amp;utm_campaign=decision_surface&amp;utm_content=should-i-offer-a-free-tier"',
    );
    expect(html).toContain("Start your own agon in the Agora");
    expect(html).toContain("Start your own agon");
  });

  it("renders the should-i-offer-a-free-tier debate preview", async () => {
    const element = await DecisionPage({
      params: Promise.resolve({ slug: "should-i-offer-a-free-tier" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("How the council debates this question");
    expect(html).toContain("This is Round 1 of a 3-round debate. Start your own agon to go deeper.");
    expect(html).toContain("I did not believe in free");
  });

  it("renders the should-i-rebrand page with correct council and CTA", async () => {
    const element = await DecisionPage({
      params: Promise.resolve({ slug: "should-i-rebrand" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Should I Rebrand?");
    expect(html).toContain("Steve Jobs");
    expect(html).toContain("Marcus Aurelius");
    expect(html).toContain("Niccolò Machiavelli");
    expect(html).toContain(
      'href="/agora?minds=steve-jobs%2Cmarcus-aurelius%2Cniccolo-machiavelli&amp;utm_source=decision&amp;utm_campaign=decision_surface&amp;utm_content=should-i-rebrand"',
    );
    expect(html).toContain("Start your own agon in the Agora");
    expect(html).toContain("Start your own agon");
  });

  it("renders the should-i-rebrand debate preview", async () => {
    const element = await DecisionPage({
      params: Promise.resolve({ slug: "should-i-rebrand" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("How the council debates this question");
    expect(html).toContain("This is Round 1 of a 3-round debate. Start your own agon to go deeper.");
    expect(html).toContain("A brand is not a name and a logo");
  });

  it("calls notFound for an unknown slug", async () => {
    await expect(
      DecisionPage({
        params: Promise.resolve({ slug: "missing-decision" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mocks.notFound).toHaveBeenCalled();
  });

  it("calls notFound when the council cannot be fully resolved", async () => {
    mocks.getFramework.mockImplementation((slug: FrameworkSlug) =>
      slug === "marie-curie" ? null : makeFramework(slug, slug),
    );

    await expect(
      DecisionPage({
        params: Promise.resolve({ slug: "should-i-raise-vc-or-bootstrap" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("builds the council CTA href from the entry helper", () => {
    const entry = DECISION_ENTRIES[0];
    if (!entry) throw new Error("expected decision entry");

    expect(buildDecisionAgoraHref(entry)).toContain(
      "minds=niccolo-machiavelli%2Cmarie-curie%2Csun-tzu",
    );
    expect(buildDecisionAgoraHref(entry)).toContain(
      "utm_content=should-i-raise-vc-or-bootstrap",
    );
  });

  it("emits a FAQPage JSON-LD script alongside the Article schema", async () => {
    const element = await DecisionPage({
      params: Promise.resolve({ slug: "should-i-raise-vc-or-bootstrap" }),
    });
    const html = renderToStaticMarkup(element);

    // FAQPage schema must be present for Google rich-result eligibility.
    expect(html).toContain('"@type":"FAQPage"');
    // The primaryQuery becomes the FAQ question name.
    expect(html).toContain('"@type":"Question"');
    expect(html).toContain('"@type":"Answer"');
    // Article schema must still be present alongside FAQPage.
    expect(html).toContain('"@type":"Article"');
  });

  it("uses the primaryQuery as the FAQ question name", async () => {
    const element = await DecisionPage({
      params: Promise.resolve({ slug: "should-i-raise-vc-or-bootstrap" }),
    });
    const html = renderToStaticMarkup(element);

    const entry = DECISION_ENTRIES.find((e) => e.slug === "should-i-raise-vc-or-bootstrap");
    if (!entry) throw new Error("expected decision entry");

    // The primaryQuery should appear in the FAQPage JSON-LD as the question name.
    expect(html).toContain(entry.primaryQuery);
  });
});
