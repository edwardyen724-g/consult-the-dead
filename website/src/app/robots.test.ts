import robots from "./robots";

describe("robots metadata", () => {
  it("points crawlers at the canonical sitemap and allows the site", () => {
    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemap: "https://www.consultthedead.com/sitemap.xml",
    });
  });
});
