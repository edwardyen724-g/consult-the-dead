import { describe, expect, it } from "vitest";

import AgoraLayout, { metadata } from "./layout";

describe("Agora metadata", () => {
  it("publishes the canonical app-shell metadata contract", () => {
    expect(metadata).toEqual({
      title: "The Agora",
      description:
        "Run your hard decision through a council of historical minds. Structured disagreement, real consensus, yours in under three minutes.",
      robots: { index: true, follow: true },
      alternates: { canonical: "https://www.consultthedead.com/agora" },
      openGraph: {
        title: "The Agora",
        description:
          "Run your hard decision through a council of historical minds. Structured disagreement, real consensus, yours in under three minutes.",
        url: "https://www.consultthedead.com/agora",
        type: "website",
        siteName: "Consult The Dead",
      },
      twitter: {
        card: "summary_large_image",
        title: "The Agora",
        description:
          "Run your hard decision through a council of historical minds. Structured disagreement, real consensus, yours in under three minutes.",
      },
    });
  });

  it("returns its children unchanged", () => {
    expect(AgoraLayout({ children: "Agora child" })).toBe("Agora child");
  });
});
