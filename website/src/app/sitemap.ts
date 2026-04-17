import type { MetadataRoute } from "next";
import { ALLOWED_SLUGS } from "@/lib/frameworks";
import { INSIGHT_ENTRIES } from "@/lib/insights";

const SITE_URL = "https://www.consultthedead.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const frameworkPages = ALLOWED_SLUGS.map((slug) => ({
    url: `${SITE_URL}/frameworks/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const insightPages = INSIGHT_ENTRIES.map((entry) => ({
    url: `${SITE_URL}/insights/${entry.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/essay`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/frameworks`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/insights`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...frameworkPages,
    ...insightPages,
  ];
}
