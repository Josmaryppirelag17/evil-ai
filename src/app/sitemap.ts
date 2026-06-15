import type { MetadataRoute } from "next";

const APP_URL = process.env.APP_URL || "https://evil-assistant.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
