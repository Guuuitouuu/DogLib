import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://doglib.fr";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/recherche", "/educator/"],
      disallow: [
        "/dashboard/",
        "/account/",
        "/onboarding/",
        "/api/",
        "/auth/",
        "/sign-in",
        "/sign-up",
      ],
    },
    sitemap: `${siteUrl.replace(/\/$/, "")}/sitemap.xml`,
  };
}
