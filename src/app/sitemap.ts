import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/book`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${site.url}/workshops/juvenile-ai-2026`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site.url}/certificates`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/brand`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
