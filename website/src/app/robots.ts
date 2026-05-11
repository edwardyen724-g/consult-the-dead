import type { MetadataRoute } from "next";

const SITE_URL = "https://www.consultthedead.com";
const SITEMAP_URL = new URL("/sitemap.xml", SITE_URL).toString();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: SITEMAP_URL,
  };
}
