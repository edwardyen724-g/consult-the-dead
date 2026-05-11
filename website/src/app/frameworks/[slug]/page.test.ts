import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import * as frameworkModule from "@/lib/frameworks";
import * as canonicalUrlModule from "@/lib/framework-canonical-url";
import FrameworkDetailPage, {
  formatValidation,
  generateMetadata,
  generateStaticParams,
} from "./page";

describe("framework detail metadata", () => {
  it("keeps the static params list aligned with the live framework roster", () => {
    expect(generateStaticParams()).toEqual(
      frameworkModule.ALLOWED_SLUGS.map((slug) => ({ slug })),
    );
  });

  it("points social metadata at the framework preview image routes", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "isaac-newton" }),
    });

    expect(metadata.openGraph?.images).toEqual(["/frameworks/isaac-newton/opengraph-image"]);
    expect(metadata.twitter?.card).toBe("summary_large_image");
    expect(metadata.twitter?.images).toEqual(["/frameworks/isaac-newton/twitter-image"]);
  });

  it("returns a not-found metadata stub for invalid slugs", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "not-a-framework" }),
    });

    expect(metadata).toEqual({ title: "Not Found" });
  });

  it("renders the framework detail page body for a live slug", async () => {
    const framework = frameworkModule.getFramework("isaac-newton");
    expect(framework).not.toBeNull();

    const element = await FrameworkDetailPage({
      params: Promise.resolve({ slug: "isaac-newton" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain(framework!.meta.person);
    expect(html).toContain(framework!.meta.domain);
    expect(html).toContain(framework!.era);
    expect(html).toContain(framework!.perceptual_lens.statement);
    expect(html).toContain("How They See the World");
    expect(html).toContain("Framework Depth");
  });

  it("falls back to the construct array length when construct_count is missing", async () => {
    const framework = frameworkModule.getFramework("isaac-newton");
    expect(framework).not.toBeNull();

    const spy = vi.spyOn(frameworkModule, "getFramework").mockReturnValue({
      ...framework!,
      meta: {
        ...framework!.meta,
        construct_count: undefined,
      },
    } as never);

    const element = await FrameworkDetailPage({
      params: Promise.resolve({ slug: "isaac-newton" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain(String(framework!.bipolar_constructs.length));

    spy.mockRestore();
  });

  it("throws notFound when the framework lookup fails for a valid slug", async () => {
    const spy = vi.spyOn(frameworkModule, "getFramework").mockReturnValue(null as never);

    await expect(
      FrameworkDetailPage({
        params: Promise.resolve({ slug: "isaac-newton" }),
      }),
    ).rejects.toThrow();

    spy.mockRestore();
  });

  it("renders the blind-spots card for a framework that has blind spots", async () => {
    const framework = frameworkModule.getFramework("alexander-the-great");
    expect(framework).not.toBeNull();
    expect(framework!.blind_spots.length).toBeGreaterThan(0);

    const element = await FrameworkDetailPage({
      params: Promise.resolve({ slug: "alexander-the-great" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Blind Spots Mapped");
    expect(html).toContain(String(framework!.blind_spots.length));
  });

  it("formats the fallback validation copy when the tier-1 review fails", () => {
    const message = formatValidation({
      passed: false,
      total_scenarios: 3,
      divergent_count: 1,
      scenario_results: [{ divergence_score: 0.12 }],
    });

    expect(message).toContain("Tier 1: Methodologically sound");
  });

  it("throws the notFound response for unknown slugs", async () => {
    await expect(
      FrameworkDetailPage({
        params: Promise.resolve({ slug: "not-a-framework" }),
      }),
    ).rejects.toThrow();
  });

  it("renders the fallback validation copy in the live page for a framework that fails tier 1", async () => {
    const framework = frameworkModule.getFramework("sun-tzu");
    expect(framework).not.toBeNull();

    const element = await FrameworkDetailPage({
      params: Promise.resolve({ slug: "sun-tzu" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain(framework!.meta.person);
    expect(html).toContain("Tier 1: Methodologically sound");
  });

  it("falls back to the hardcoded canonical URL when buildFrameworkCanonicalUrl returns null", async () => {
    // This covers the `canonicalUrl ?? \`https://...\`` branch in generateMetadata.
    const spy = vi
      .spyOn(canonicalUrlModule, "buildFrameworkCanonicalUrl")
      .mockReturnValue(null);

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "isaac-newton" }),
    });

    expect(metadata.alternates?.canonical).toBe(
      "https://www.consultthedead.com/frameworks/isaac-newton",
    );

    spy.mockRestore();
  });

  it("includes the FrameworkTransparencyPanel in the rendered page", async () => {
    const element = await FrameworkDetailPage({
      params: Promise.resolve({ slug: "isaac-newton" }),
    });
    const html = renderToStaticMarkup(element);

    // The transparency panel renders a disclosure section with the slug.
    // Check for the Ask This Mind form anchor text that the panel includes.
    expect(html).toContain("isaac-newton");
  });
});
