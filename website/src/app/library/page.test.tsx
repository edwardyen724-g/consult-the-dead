import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LibraryPage, {
  ProLibrary,
  UpgradePrompt,
  PRO_FEATURES,
  GHOST_ROWS,
  getConsultedMindSlugs,
  formatMindSlug,
} from "./page";

const currentUserMock = vi.hoisted(() => vi.fn());
const getUserAgonsMock = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs/server", () => ({
  currentUser: currentUserMock,
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/lib/db/client", () => ({
  db: {
    getUserAgons: getUserAgonsMock,
  },
}));

function makeAgon(overrides: { id: string }) {
  return {
    id: overrides.id,
    clerk_user_id: "user-1",
    share_id: `share-${overrides.id}`,
    topic: `Topic ${overrides.id}`,
    mind_slugs: ["sun-tzu"],
    rounds: 1,
    turns: [],
    consensus: null,
    research: null,
    created_at: "2026-05-01T00:00:00.000Z",
    updated_at: "2026-05-01T00:00:00.000Z",
  };
}

vi.mock("./LibraryClient", () => ({
  LibraryClient: ({ agons }: { agons: Array<{ id: string }> }) => (
    <div data-testid="library-client">{agons.length} agons</div>
  ),
}));

vi.mock("@/components/LibraryProofStrip", () => ({
  LibraryProofStrip: () => <div data-testid="library-proof-strip" />,
}));

beforeEach(() => {
  currentUserMock.mockReset();
  getUserAgonsMock.mockReset();
});

describe("LibraryPage", () => {
  describe("UpgradePrompt", () => {
    it("renders the core upgrade messaging and CTA", () => {
      const html = renderToStaticMarkup(UpgradePrompt());

      expect(html).toContain("Pro feature");
      expect(html).toContain("Save every debate. Revisit any decision.");
      expect(html).toContain("Upgrade to Pro →");
      expect(html).toContain('href="/pricing"');
    });

    it("renders the pricing anchor copy", () => {
      const html = renderToStaticMarkup(UpgradePrompt());
      expect(html).toContain("$30/mo");
      expect(html).toContain("$300/yr");
      expect(html).toContain("7-day trial");
    });

    it("renders the feature list with all PRO_FEATURES", () => {
      const html = renderToStaticMarkup(UpgradePrompt());

      for (const { label, detail } of PRO_FEATURES) {
        expect(html).toContain(label);
        expect(html).toContain(detail);
      }
    });

    it("renders a checkmark for each feature", () => {
      const html = renderToStaticMarkup(UpgradePrompt());
      const checkCount = (html.match(/✓/g) ?? []).length;
      expect(checkCount).toBe(PRO_FEATURES.length);
    });

    it("renders the ghost preview section with label", () => {
      const html = renderToStaticMarkup(UpgradePrompt());
      expect(html).toContain("Sample library");
    });

    it("renders all GHOST_ROWS topics", () => {
      const html = renderToStaticMarkup(UpgradePrompt());
      for (const { topic, minds, date } of GHOST_ROWS) {
        expect(html).toContain(topic);
        expect(html).toContain(minds);
        expect(html).toContain(date);
      }
    });

    it("renders the expected test IDs", () => {
      const html = renderToStaticMarkup(UpgradePrompt());
      expect(html).toContain('data-testid="upgrade-prompt"');
      expect(html).toContain('data-testid="upgrade-feature-list"');
      expect(html).toContain('data-testid="library-ghost-preview"');
    });

    it("renders the correct number of ghost-row elements", () => {
      const html = renderToStaticMarkup(UpgradePrompt());
      const rowCount = (html.match(/data-testid="ghost-row"/g) ?? []).length;
      expect(rowCount).toBe(GHOST_ROWS.length);
    });
  });

  describe("ProLibrary", () => {
    it("renders the pro library shell and loads saved agons", async () => {
      getUserAgonsMock.mockResolvedValue([makeAgon({ id: "agon-1" })]);

      const html = renderToStaticMarkup(await ProLibrary({ userId: "user-1" }));
      expect(getUserAgonsMock).toHaveBeenCalledWith("user-1");
      expect(html).toContain("Saved debates");
      expect(html).toContain("1 saved debate");
      expect(html).toContain("1 consulted mind");
    });

    it("shows a running-low nudge when saved agons reach the threshold", async () => {
      const agons = Array.from({ length: 92 }, (_, i) => makeAgon({ id: String(i + 1) }));
      getUserAgonsMock.mockResolvedValue(agons);

      const html = renderToStaticMarkup(await ProLibrary({ userId: "user-1" }));
      expect(html).toContain("Running low");
      expect(html).toContain("8 consultations left this month");
      expect(html).toContain("92/100");
    });

    it("shows a cap-reached nudge when the monthly limit is hit", async () => {
      const agons = Array.from({ length: 100 }, (_, i) => makeAgon({ id: String(i + 1) }));
      getUserAgonsMock.mockResolvedValue(agons);

      const html = renderToStaticMarkup(await ProLibrary({ userId: "user-1" }));
      expect(html).toContain("Monthly limit reached");
      expect(html).toContain("100-agon monthly limit");
    });

    it("suppresses the upsell nudge for users well below the threshold", async () => {
      const agons = Array.from({ length: 5 }, (_, i) => makeAgon({ id: String(i + 1) }));
      getUserAgonsMock.mockResolvedValue(agons);

      const html = renderToStaticMarkup(await ProLibrary({ userId: "user-1" }));
      expect(html).not.toContain("Running low");
      expect(html).not.toContain("Monthly limit reached");
    });

    it("renders a DB error inline without crashing", async () => {
      getUserAgonsMock.mockRejectedValue(new Error("connection refused"));

      const html = renderToStaticMarkup(await ProLibrary({ userId: "user-1" }));
      expect(html).toContain("DB ERROR");
      expect(html).toContain("connection refused");
    });

    it("shows consulted minds strip when agons have mind_slugs", async () => {
      const agons = [
        makeAgon({ id: "1" }),
        { ...makeAgon({ id: "2" }), mind_slugs: ["marcus-aurelius"] },
      ];
      getUserAgonsMock.mockResolvedValue(agons);
      const html = renderToStaticMarkup(await ProLibrary({ userId: "user-1" }));
      expect(html).toContain('data-testid="consulted-minds-strip"');
      expect(html).toContain("sun-tzu");
      expect(html).toContain("marcus-aurelius");
      expect(html).toContain("2 distinct minds consulted");
    });

    it("hides consulted minds strip when library is empty", async () => {
      getUserAgonsMock.mockResolvedValue([]);
      const html = renderToStaticMarkup(await ProLibrary({ userId: "user-1" }));
      expect(html).not.toContain('data-testid="consulted-minds-strip"');
    });

    it("shows '1 distinct mind consulted' for a single-mind library", async () => {
      getUserAgonsMock.mockResolvedValue([makeAgon({ id: "1" })]);
      const html = renderToStaticMarkup(await ProLibrary({ userId: "user-1" }));
      expect(html).toContain("1 distinct mind consulted");
    });

    it("renders the shell footer CTAs on the page surface", async () => {
      currentUserMock.mockResolvedValue({
        id: "user-1",
        publicMetadata: { subscription_tier: "pro" },
      });
      getUserAgonsMock.mockResolvedValue([makeAgon({ id: "agon-1" })]);

      const html = renderToStaticMarkup(await LibraryPage());
      expect(html).toContain('href="/account"');
      expect(html).toContain('href="/agora"');
    });
  });

  describe("LibraryPage routing", () => {
    it("redirects unauthenticated users", async () => {
      currentUserMock.mockResolvedValue(null);

      await expect(LibraryPage()).rejects.toThrow("REDIRECT:/sign-in");
    });
  });
});

describe("PRO_FEATURES static data", () => {
  it("exports a non-empty array", () => {
    expect(PRO_FEATURES.length).toBeGreaterThan(0);
  });

  it("every entry has a label and detail string", () => {
    for (const { label, detail } of PRO_FEATURES) {
      expect(typeof label).toBe("string");
      expect(label.length).toBeGreaterThan(0);
      expect(typeof detail).toBe("string");
      expect(detail.length).toBeGreaterThan(0);
    }
  });
});

describe("GHOST_ROWS static data", () => {
  it("exports a non-empty array", () => {
    expect(GHOST_ROWS.length).toBeGreaterThan(0);
  });

  it("every entry has topic, minds, and date strings", () => {
    for (const { topic, minds, date } of GHOST_ROWS) {
      expect(typeof topic).toBe("string");
      expect(topic.length).toBeGreaterThan(0);
      expect(typeof minds).toBe("string");
      expect(minds.length).toBeGreaterThan(0);
      expect(typeof date).toBe("string");
      expect(date.length).toBeGreaterThan(0);
    }
  });
});

describe("helpers", () => {
  it("getConsultedMindSlugs deduplicates and sorts mind slugs across agons", () => {
    const agons = [
      { mind_slugs: ["sun-tzu", "cicero"] },
      { mind_slugs: ["sun-tzu", "archimedes"] },
      { mind_slugs: null },
    ];
    expect(getConsultedMindSlugs(agons)).toEqual(["archimedes", "cicero", "sun-tzu"]);
  });

  it("getConsultedMindSlugs returns empty array for no agons", () => {
    expect(getConsultedMindSlugs([])).toEqual([]);
  });

  it("formatMindSlug converts slug to title case", () => {
    expect(formatMindSlug("sun-tzu")).toBe("Sun Tzu");
    expect(formatMindSlug("niccolo-machiavelli")).toBe("Niccolo Machiavelli");
    expect(formatMindSlug("marie-curie")).toBe("Marie Curie");
  });
});
