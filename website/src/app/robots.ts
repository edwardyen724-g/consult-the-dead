import type { MetadataRoute } from "next";

const SITE_URL = "https://www.consultthedead.com";
const PRIVATE_PATH_PREFIXES = ["/account", "/api/", "/library", "/sign-in", "/sign-up"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATH_PREFIXES,
      },
    ],
    sitemap: new URL("/sitemap.xml", SITE_URL).href,
    host: SITE_URL,
  };
}
