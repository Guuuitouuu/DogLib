import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? "https://doglib.fr"
  ).replace(/\/$/, "");

  const now = new Date();

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/recherche`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
}
