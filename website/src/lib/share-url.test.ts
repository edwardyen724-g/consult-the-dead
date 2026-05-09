import {
  SITE_ORIGIN,
  buildSharePayload,
  buildShareUrl,
  buildShareUrlPath,
} from "./share-url";

describe("buildShareUrlPath", () => {
  it("produces /agora/a/<shareId>", () => {
    expect(buildShareUrlPath("k7n3pqx9rt")).toBe("/agora/a/k7n3pqx9rt");
  });

  it("rejects malformed share ids", () => {
    expect(() => buildShareUrlPath("550e8400-e29b-41d4-a716-446655440000")).toThrow();
  });
});

describe("buildShareUrl", () => {
  it("uses the canonical origin by default", () => {
    expect(buildShareUrl("k7n3pqx9rt")).toBe(
      `${SITE_ORIGIN}/agora/a/k7n3pqx9rt`,
    );
  });

  it("allows an origin override", () => {
    expect(
      buildShareUrl("k7n3pqx9rt", {
        origin: "https://preview.consultthedead.com/",
      }),
    ).toBe("https://preview.consultthedead.com/agora/a/k7n3pqx9rt");
  });
});

describe("buildSharePayload", () => {
  it("includes the title, text, and URL", () => {
    const payload = buildSharePayload({
      shareId: "k7n3pqx9rt",
      topic: "Should I raise VC or bootstrap?",
    });
    expect(payload.title).toBe("Consult The Dead — The Agora");
    expect(payload.text).toContain("Should I raise VC or bootstrap?");
    expect(payload.url).toBe(`${SITE_ORIGIN}/agora/a/k7n3pqx9rt`);
  });

  it("falls back to the generic share text when the topic is blank", () => {
    const payload = buildSharePayload({ shareId: "k7n3pqx9rt", topic: "   " });
    expect(payload.text).toContain("council of dead minds");
  });

  it("treats an undefined topic the same as an empty one", () => {
    const payload = buildSharePayload({
      shareId: "k7n3pqx9rt",
      topic: undefined as unknown as string,
    });
    expect(payload.text).toContain("council of dead minds");
  });

  it("trims and truncates long topics", () => {
    const payload = buildSharePayload({
      shareId: "k7n3pqx9rt",
      topic: `   ${"word ".repeat(200)}`,
    });
    expect(payload.text.length).toBeLessThanOrEqual(200);
    expect(payload.text).toContain("…");
  });

  it("falls back to a hard cut when the topic has no whitespace in range", () => {
    const payload = buildSharePayload({
      shareId: "k7n3pqx9rt",
      topic: "x".repeat(400),
    });
    expect(payload.text.length).toBeLessThanOrEqual(200);
    expect(payload.text).toContain("…");
  });
});
