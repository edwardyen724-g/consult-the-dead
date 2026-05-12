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
      }[slug] ?? slug,
    ),
  );
});

describe("generateStaticParams", () => {
  it("returns one slug per shipped decision entry", () => {
    expect(generateStaticParams()).toEqual(
      DECISION_ENTRIES.map((entry) => ({ slug: entry.slug })),
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
});
