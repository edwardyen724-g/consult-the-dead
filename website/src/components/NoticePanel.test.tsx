import { describe, expect, it } from "vitest";

import { NoticePanel } from "./NoticePanel";

describe("NoticePanel", () => {
  it("renders the notice copy and action content", () => {
    const element = NoticePanel({
      eyebrow: "Recoverable",
      title: "The share could not be loaded",
      accentVar: "var(--red)",
      actions: (
        <>
          <a href="/agora">Start a new agon</a>
          <button type="button">Retry</button>
        </>
      ),
      children:
        "Try again in a moment or return to the live Agora.",
    });

    expect(element.type).toBe("section");
    expect(element.props.style.borderLeft).toBe("3px solid var(--red)");
    expect(element.props.style.background).toBe("var(--surface)");

    const [styleNode, eyebrowNode, titleNode, bodyNode, actionsNode] =
      element.props.children as Array<{ props: Record<string, unknown> }>;

    expect(styleNode.type).toBe("style");
    expect(eyebrowNode.props.children).toBe("Recoverable");
    expect(titleNode.props.children).toBe("The share could not be loaded");
    expect(bodyNode.props.children).toBe(
      "Try again in a moment or return to the live Agora.",
    );
    expect(actionsNode.props.className).toBe("gm-notice-actions");
  });
});
