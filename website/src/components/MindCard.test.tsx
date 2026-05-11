import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { MindCard } from "./MindCard";

vi.mock("next/image", () => ({
  default: (props: { fill?: boolean; alt?: string; src?: string; [key: string]: unknown }) => {
    const { fill: _fill, ...rest } = props;
    void _fill;
    return <mock-image {...rest} />;
  },
}));

describe("MindCard", () => {
  it("renders the editorial Reading Room chrome for compact hero cards", () => {
    const html = renderToStaticMarkup(
      <MindCard
        name="Marie Curie"
        slug="marie-curie"
        dates="1867-1934"
        lens="Empiricism over opinion."
        colorVar="var(--color-curie)"
        size="sm"
      />,
    );

    expect(html).toContain("Reading Room");
    expect(html).toContain("Portrait of Marie Curie");
    expect(html).toContain('src="/portraits/marie-curie-portrait.png"');
  });

  it("keeps the detailed metadata rail on full cards", () => {
    const html = renderToStaticMarkup(
      <MindCard
        name="Niccolò Machiavelli"
        dates="1469-1527"
        lens="Pragmatism for power."
        colorVar="var(--color-machiavelli)"
        invocations={42}
        packs={[{ name: "War Room", colorVar: "var(--pack-war-room)" }]}
      />,
    );

    expect(html).toContain("Reading Room");
    expect(html).toContain("Niccolò Machiavelli");
    expect(html).toContain("Pragmatism for power.");
    expect(html).toContain("War Room");
    expect(html).toContain("42 invocations");
    expect(html).toContain("PORTRAIT");
  });
});
