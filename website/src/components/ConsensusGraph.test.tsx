/**
 * Unit tests for the ConsensusGraph shared component.
 *
 * Vitest is configured for node (not jsdom), so we render via
 * renderToStaticMarkup and assert on the HTML string.
 *
 * Coverage goals:
 *  • NODE_LABELS export matches the five consensus sections
 *  • Renders all five outer node labels in the SVG
 *  • Renders the center CON-SENSUS label
 *  • Handles empty/null summaries gracefully (no crash)
 *  • Tooltip is absent when no summaries are provided
 *  • Interactive overlay buttons are rendered when onNodeSelect is present
 *  • Selected node is reflected in aria-pressed state
 *  • Tooltip appears for the selected node when summaries are supplied
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  ConsensusGraph,
  NODE_LABELS,
  type ConsensusNodeKey,
} from "./ConsensusGraph";

/* ── Helper ───────────────────────────────────────────────────── */

function render(props: Partial<Parameters<typeof ConsensusGraph>[0]> = {}) {
  return renderToStaticMarkup(
    React.createElement(ConsensusGraph, {
      started: true,
      ...props,
    }),
  );
}

/* ── NODE_LABELS export ────────────────────────────────────────── */

describe("NODE_LABELS", () => {
  it("exports exactly five consensus node keys", () => {
    expect(NODE_LABELS).toHaveLength(5);
  });

  it("contains all expected keys in order", () => {
    expect(NODE_LABELS).toEqual([
      "POINTS",
      "TENSIONS",
      "ACTION",
      "STEPS",
      "RISKS",
    ]);
  });
});

/* ── Basic rendering ───────────────────────────────────────────── */

describe("ConsensusGraph — basic rendering", () => {
  it("renders without crashing when no summaries or selection are provided", () => {
    expect(() => render({ started: true })).not.toThrow();
  });

  it("renders without crashing when started is false", () => {
    expect(() => render({ started: false })).not.toThrow();
  });

  it("renders the center CON- text in the SVG", () => {
    const html = render();
    expect(html).toContain("CON-");
  });

  it("renders the center SENSUS text in the SVG", () => {
    const html = render();
    expect(html).toContain("SENSUS");
  });

  it("renders all five node labels in the SVG", () => {
    const html = render();
    for (const label of NODE_LABELS) {
      expect(html).toContain(label);
    }
  });

  it("applies the gm-consensus-play class when started=true", () => {
    const html = render({ started: true });
    expect(html).toContain("gm-consensus-play");
  });

  it("does not apply gm-consensus-play when started=false", () => {
    const html = render({ started: false });
    expect(html).not.toContain("gm-consensus-play");
  });
});

/* ── Empty / null data handling ────────────────────────────────── */

describe("ConsensusGraph — empty data", () => {
  it("renders correctly with an empty summaries object", () => {
    expect(() => render({ summaries: {} })).not.toThrow();
  });

  it("renders correctly with undefined summaries", () => {
    expect(() => render({ summaries: undefined })).not.toThrow();
  });

  it("does not render a tooltip when summaries is absent", () => {
    const html = render({ summaries: undefined });
    // Tooltip is role="tooltip" — should not be present
    expect(html).not.toContain('role="tooltip"');
  });

  it("does not render a tooltip when summaries is empty", () => {
    const html = render({ summaries: {} });
    expect(html).not.toContain('role="tooltip"');
  });

  it("does not render interactive buttons when no onNodeSelect or summaries", () => {
    // Without onNodeSelect or summaries, the interactive overlay is skipped
    const html = render({ onNodeSelect: undefined, summaries: undefined });
    // No buttons should appear
    expect(html).not.toContain("<button");
  });
});

/* ── Interactive overlay ───────────────────────────────────────── */

describe("ConsensusGraph — interactive overlay", () => {
  const noop = () => {};

  it("renders five interactive buttons when onNodeSelect is provided", () => {
    const html = render({ onNodeSelect: noop });
    // Count button occurrences
    const buttonCount = (html.match(/<button/g) ?? []).length;
    expect(buttonCount).toBe(5);
  });

  it("renders buttons with aria-label for each node", () => {
    const html = render({ onNodeSelect: noop });
    for (const label of NODE_LABELS) {
      expect(html).toContain(`${label} consensus node`);
    }
  });

  it("renders five buttons when summaries are provided (without onNodeSelect)", () => {
    const summaries: Partial<Record<ConsensusNodeKey, string>> = {
      POINTS: "Common ground found",
    };
    const html = render({ summaries });
    const buttonCount = (html.match(/<button/g) ?? []).length;
    expect(buttonCount).toBe(5);
  });
});

/* ── Selected node / aria-pressed ─────────────────────────────── */

describe("ConsensusGraph — selected node state", () => {
  const noop = () => {};

  it("marks the selected node with aria-pressed=true", () => {
    const html = render({ onNodeSelect: noop, selected: "ACTION" });
    expect(html).toContain('aria-pressed="true"');
  });

  it("marks non-selected nodes with aria-pressed=false", () => {
    const html = render({ onNodeSelect: noop, selected: "ACTION" });
    // Four of the five nodes should have aria-pressed="false"
    const falsePressedCount = (html.match(/aria-pressed="false"/g) ?? []).length;
    expect(falsePressedCount).toBe(4);
  });

  it("renders no aria-pressed=true when selected is null", () => {
    const html = render({ onNodeSelect: noop, selected: null });
    expect(html).not.toContain('aria-pressed="true"');
  });
});

/* ── Tooltip rendering ────────────────────────────────────────── */

describe("ConsensusGraph — tooltip", () => {
  it("renders a tooltip when a node is selected and its summary is available", () => {
    const html = render({
      summaries: { POINTS: "Areas of agreement between the minds." },
      selected: "POINTS",
    });
    expect(html).toContain('role="tooltip"');
    expect(html).toContain("Areas of agreement between the minds.");
  });

  it("includes the selected node label in the tooltip", () => {
    const html = render({
      summaries: { TENSIONS: "Key friction points." },
      selected: "TENSIONS",
    });
    expect(html).toContain("TENSIONS");
    expect(html).toContain("Key friction points.");
  });

  it("does not render a tooltip when selected node has no matching summary", () => {
    const html = render({
      summaries: { POINTS: "Some points summary" },
      selected: "RISKS", // summary for RISKS is not provided
    });
    expect(html).not.toContain('role="tooltip"');
  });

  it("renders aria-label containing the summary text for accessible buttons", () => {
    const summary = "Unanimous agreement on bootstrapping.";
    const html = render({
      summaries: { ACTION: summary },
      onNodeSelect: () => {},
    });
    expect(html).toContain(`ACTION: ${summary}`);
  });
});
