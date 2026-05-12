import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MindPage, {
  buildMindProgressCue,
  generateMetadata,
  loadAllUserAgons,
} from "./page";

const currentUserMock = vi.hoisted(() => vi.fn());
const getUserAgonsMock = vi.hoisted(() => vi.fn());
const getMindContentMock = vi.hoisted(() => vi.fn());
const isMindSlugMock = vi.hoisted(() => vi.fn());
const buildMindCtaUrlMock = vi.hoisted(() => vi.fn());
const mindCanonicalUrlMock = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs/server", () => ({
  currentUser: currentUserMock,
}));

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/lib/mind-content", () => ({
  MIND_SLUGS: ["sun-tzu"],
  buildMindCtaUrl: buildMindCtaUrlMock,
  getMindContent: getMindContentMock,
  isMindSlug: isMindSlugMock,
  mindCanonicalUrl: mindCanonicalUrlMock,
}));

vi.mock("@/lib/db/client", () => ({
  db: {
    getUserAgons: getUserAgonsMock,
  },
}));

function makeMind() {
  return {
    slug: "sun-tzu",
    h1: "Sun Tzu — The Strategist of Indirect Victory",
    metaDescription: "Add Sun Tzu to your Council.",
    famousFor: "Winning before the battle begins",
    howTheyArgue:
      "Sun Tzu argues by comparing the shape of the battlefield, incentives, and timing. He frames every choice as a contest of position, concealment, and force conservation.",
    sampleQuotes: ["All warfare is based on deception."],
    ctaVariants: ["Add Sun Tzu to Your Council →"],
  };
}

function makeAgon(id: string, mindSlugs: string[]) {
  return {
    id,
    clerk_user_id: "user-1",
    share_id: `share-${id}`,
    topic: `Topic ${id}`,
    mind_slugs: mindSlugs,
    rounds: 1,
    turns: [],
    consensus: null,
    research: null,
    created_at: "2026-05-01T00:00:00.000Z",
    updated_at: "2026-05-01T00:00:00.000Z",
  };
}

beforeEach(() => {
  currentUserMock.mockReset();
  getUserAgonsMock.mockReset();
  getMindContentMock.mockReset();
  isMindSlugMock.mockReset();
  buildMindCtaUrlMock.mockReset();
  mindCanonicalUrlMock.mockReset();

  isMindSlugMock.mockReturnValue(true);
  getMindContentMock.mockReturnValue(makeMind());
  buildMindCtaUrlMock.mockReturnValue("/agora?mind=sun-tzu");
  mindCanonicalUrlMock.mockReturnValue("https://example.com/minds/sun-tzu");
});

describe("buildMindProgressCue", () => {
  it("returns null when there is no saved history", () => {
    expect(buildMindProgressCue([], "sun-tzu")).toBeNull();
  });

  it("formats the real consult and save progress for the current mind", () => {
    const cue = buildMindProgressCue(
      [
        makeAgon("1", ["sun-tzu", "cicero"]),
        makeAgon("2", ["sun-tzu"]),
        makeAgon("3", ["marcus-aurelius"]),
      ],
      "sun-tzu",
    );

    expect(cue).toEqual({
      labels: [
        "3 minds consulted so far",
        "3 saved debates",
        "Growing with every return",
      ],
      note: "This mind appears in 2 saved debates.",
    });
  });

  it("omits the mind-specific note when the mind has not been saved", () => {
    const cue = buildMindProgressCue([makeAgon("1", ["cicero"])], "sun-tzu");

    expect(cue).toEqual({
      labels: [
        "1 mind consulted so far",
        "1 saved debate",
        "Growing with every return",
      ],
      note: null,
    });
  });
});

describe("loadAllUserAgons", () => {
  it("keeps paging until the final batch is short", async () => {
    getUserAgonsMock.mockImplementation(async (_userId: string, limit = 20, offset = 0) => {
      if (limit !== 100) throw new Error("expected batch size");
      if (offset === 0) return Array.from({ length: 100 }, (_, i) => makeAgon(String(i), ["sun-tzu"]));
      if (offset === 100) return Array.from({ length: 27 }, (_, i) => makeAgon(`x${i}`, ["cicero"]));
      return [];
    });

    await expect(loadAllUserAgons("user-1")).resolves.toHaveLength(127);
    expect(getUserAgonsMock).toHaveBeenCalledTimes(2);
    expect(getUserAgonsMock).toHaveBeenNthCalledWith(1, "user-1", 100, 0);
    expect(getUserAgonsMock).toHaveBeenNthCalledWith(2, "user-1", 100, 100);
  });
});

describe("generateMetadata", () => {
  it("sets openGraph.description to mind.metaDescription", async () => {
    const meta = await import("./page").then((m) =>
      m.generateMetadata({ params: Promise.resolve({ id: "sun-tzu" }) }),
    );
    expect((meta.openGraph as { description?: string })?.description).toBe(
      "Add Sun Tzu to your Council.",
    );
  });

  it("sets twitter.card to summary_large_image", async () => {
    const meta = await import("./page").then((m) =>
      m.generateMetadata({ params: Promise.resolve({ id: "sun-tzu" }) }),
    );
    expect((meta.twitter as { card?: string })?.card).toBe("summary_large_image");
  });

  it("sets twitter.title to mind.h1", async () => {
    const meta = await import("./page").then((m) =>
      m.generateMetadata({ params: Promise.resolve({ id: "sun-tzu" }) }),
    );
    expect((meta.twitter as { title?: string })?.title).toBe(
      "Sun Tzu — The Strategist of Indirect Victory",
    );
  });

  it("sets twitter.description to mind.metaDescription", async () => {
    const meta = await import("./page").then((m) =>
      m.generateMetadata({ params: Promise.resolve({ id: "sun-tzu" }) }),
    );
    expect((meta.twitter as { description?: string })?.description).toBe(
      "Add Sun Tzu to your Council.",
    );
  });

  it("sets twitter.images to contain the opengraph-image url", async () => {
    const meta = await import("./page").then((m) =>
      m.generateMetadata({ params: Promise.resolve({ id: "sun-tzu" }) }),
    );
    expect((meta.twitter as { images?: string[] })?.images).toContain(
      "https://example.com/minds/sun-tzu/opengraph-image",
    );
  });
});

describe("MindPage", () => {
  it("renders the cumulative progress cue for a signed-in user", async () => {
    currentUserMock.mockResolvedValue({ id: "user-1" });
    getUserAgonsMock.mockImplementation(async (_userId: string, ...args: [number, number?]) => {
      const offset = args[1] ?? 0;
      if (offset === 0) {
        return [
          makeAgon("1", ["sun-tzu", "cicero"]),
          makeAgon("2", ["sun-tzu"]),
        ];
      }
      return [];
    });

    const html = renderToStaticMarkup(
      await MindPage({ params: Promise.resolve({ id: "sun-tzu" }) }),
    );

    expect(html).toContain("YOUR CONSULTATION ARCHIVE");
    expect(html).toContain("This mind appears in 2 saved debates.");
    expect(html).toContain("2 minds consulted so far");
    expect(html).toContain("2 saved debates");
    expect(html).toContain('href="/agora?mind=sun-tzu"');
  });

  it("omits the progress cue for signed-out visitors", async () => {
    currentUserMock.mockResolvedValue(null);

    const html = renderToStaticMarkup(
      await MindPage({ params: Promise.resolve({ id: "sun-tzu" }) }),
    );

    expect(html).not.toContain("YOUR CONSULTATION ARCHIVE");
    expect(html).toContain("Sun Tzu — The Strategist of Indirect Victory");
  });
});

describe("generateMetadata", () => {
  it("title is the person's name only (root layout template adds — Consult The Dead)", async () => {
    // h1 is "Sun Tzu — The Strategist of Indirect Victory";
    // title should be just "Sun Tzu" so the root layout template produces
    // "Sun Tzu — Consult The Dead" (≤40 chars, well within the 60-char SEO limit).
    const meta = await generateMetadata({ params: Promise.resolve({ id: "sun-tzu" }) });
    expect(meta.title).toBe("Sun Tzu");
  });

  it("sets robots to index+follow", async () => {
    const meta = await generateMetadata({ params: Promise.resolve({ id: "sun-tzu" }) });
    expect(meta.robots).toEqual({ index: true, follow: true });
  });

  it("sets description from the mind's metaDescription", async () => {
    const meta = await generateMetadata({ params: Promise.resolve({ id: "sun-tzu" }) });
    expect(meta.description).toBe("Add Sun Tzu to your Council.");
  });

  it("sets openGraph.title to the full h1 for social sharing", async () => {
    const meta = await generateMetadata({ params: Promise.resolve({ id: "sun-tzu" }) });
    expect((meta.openGraph as { title?: string })?.title).toBe(
      "Sun Tzu — The Strategist of Indirect Victory",
    );
  });

  it("sets openGraph.images pointing to the opengraph-image route", async () => {
    const meta = await generateMetadata({ params: Promise.resolve({ id: "sun-tzu" }) });
    const images = (meta.openGraph as { images?: unknown })?.images;
    expect(Array.isArray(images)).toBe(true);
    const first = (images as Array<{ url: string }>)[0];
    expect(first.url).toContain("/minds/sun-tzu/opengraph-image");
  });

  it("sets alternates.canonical to the mind's canonical URL", async () => {
    const meta = await generateMetadata({ params: Promise.resolve({ id: "sun-tzu" }) });
    expect((meta.alternates as { canonical?: string })?.canonical).toBe(
      "https://example.com/minds/sun-tzu",
    );
  });

  it("returns Not Found metadata for an unknown slug", async () => {
    isMindSlugMock.mockReturnValue(false);
    const meta = await generateMetadata({ params: Promise.resolve({ id: "not-a-mind" }) });
    expect(meta.title).toBe("Not Found");
  });
});
