import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  default as FrameworkDetailPage,
  generateMetadata,
  generateStaticParams,
} from "@/app/frameworks/[slug]/page";
import {
  FrameworkConstructExplorer,
  getConstructExplorerSnapshot,
  pairConstructsWithPredictions,
  type ConstructExplorerConstruct,
  type ConstructExplorerPrediction,
} from "./FrameworkConstructExplorer";

const constructs: ConstructExplorerConstruct[] = [
  {
    construct: "systematic verification vs. incremental validation",
    positive_pole: "Rebuilds knowledge from first principles",
    negative_pole: "Builds on accepted practice",
    behavioral_implication:
      "Would audit and rebuild core processes rather than trusting inherited workflows.",
  },
  {
    construct: "withdraws to preserve control vs. engages to influence outcomes",
    positive_pole: "Prefers isolation to protect standards",
    negative_pole: "Stays in the room to shape the result",
    behavioral_implication:
      "Would leave the meeting instead of negotiating around compromised standards.",
  },
];

const predictions: ConstructExplorerPrediction[] = [
  {
    situation_type: "Joining a new organization",
    ordinary_response: "Learn the current playbook and improve it gradually.",
    framework_response:
      "Would systematically audit the institution's core processes from first principles.",
    because: "The framework prioritizes reconstruction over incremental accommodation.",
    confidence: 0.88,
  },
  {
    situation_type: "Facing public criticism",
    ordinary_response: "Defend the position and adjust where necessary.",
    framework_response: "Would withdraw from the forum and perfect the work in isolation.",
    because: "The framework preserves methodological control by avoiding compromise.",
    confidence: 0.87,
  },
];

describe("pairConstructsWithPredictions", () => {
  it("pairs constructs with the matching prediction by index", () => {
    expect(pairConstructsWithPredictions(constructs, predictions)).toEqual([
      { construct: constructs[0], prediction: predictions[0] },
      { construct: constructs[1], prediction: predictions[1] },
    ]);
  });

  it("falls back to the last prediction when the array is shorter", () => {
    const pairs = pairConstructsWithPredictions(constructs, predictions.slice(0, 1));
    expect(pairs[1].prediction).toBe(predictions[0]);
  });
});

describe("getConstructExplorerSnapshot", () => {
  it("reports the selected construct, prediction, and slider orientation", () => {
    const snapshot = getConstructExplorerSnapshot(constructs, predictions, 1, 20);

    expect(snapshot.selectedIndex).toBe(1);
    expect(snapshot.selectedConstruct).toBe(constructs[1]);
    expect(snapshot.selectedPrediction).toBe(predictions[1]);
    expect(snapshot.orientation).toBe("negative");
    expect(snapshot.orientationLabel).toContain("leaning toward");
    expect(snapshot.orientationLabel).toContain("Stays in the room to shape the result");
  });

  it("reports the positive pole when the slider moves high", () => {
    const snapshot = getConstructExplorerSnapshot(constructs, predictions, 0, 80);

    expect(snapshot.orientation).toBe("positive");
    expect(snapshot.orientationLabel).toContain("Rebuilds knowledge from first principles");
  });
});

describe("FrameworkConstructExplorer", () => {
  it("renders the construct selector, slider, and prediction copy", () => {
    const html = renderToStaticMarkup(
      <FrameworkConstructExplorer
        person="Isaac Newton"
        color="var(--amber)"
        constructs={constructs}
        predictions={predictions}
      />,
    );

    expect(html).toContain("How This Mind Thinks");
    expect(html).toContain("Construct 2 of 2");
    expect(html).toContain("Move along withdraws to preserve control vs. engages to influence outcomes");
    expect(html).toContain("Facing public criticism");
    expect(html).toContain("Would withdraw from the forum and perfect the work in isolation.");
    expect(html).toContain("aria-label=\"Move along withdraws to preserve control vs. engages to influence outcomes\"");
  });

  it("omits the confidence label when the value is missing or invalid", () => {
    const html = renderToStaticMarkup(
      <FrameworkConstructExplorer
        person="Isaac Newton"
        color="var(--amber)"
        constructs={constructs.slice(0, 1)}
        predictions={[
          {
            ...predictions[0],
            confidence: "not-a-number",
          },
        ]}
      />,
    );

    expect(html).toContain("Joining a new organization");
    expect(html).not.toContain("confidence");
  });

  it("returns null when there are no constructs to explore", () => {
    const html = renderToStaticMarkup(
      <FrameworkConstructExplorer
        person="Isaac Newton"
        color="var(--amber)"
        constructs={[]}
        predictions={[]}
      />,
    );

    expect(html).toBe("");
  });
});

describe("framework detail page", () => {
  it("exposes static params and metadata for a live framework slug", async () => {
    const params = generateStaticParams();
    expect(params.map((entry) => entry.slug)).toContain("isaac-newton");

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "isaac-newton" }),
    });

    expect(metadata.title).toContain("Isaac Newton");
    expect(metadata.description).toContain("Critical Decision Method");
  });

  it("renders the framework detail page with the construct explorer", async () => {
    const page = await FrameworkDetailPage({
      params: Promise.resolve({ slug: "isaac-newton" }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("How This Mind Thinks");
    expect(html).toContain("Isaac Newton");
    expect(html).toContain("Move along each bipolar construct");
  });
});
