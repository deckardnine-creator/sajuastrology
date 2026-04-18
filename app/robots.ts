import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/",
          "/dashboard",
          "/reading/",              // Private — user birth data should not be indexed
          "/compatibility/result/", // Private — user relationship data
          "/daily",                 // Personalized — requires login, no SEO value
        ],
      },
    ],
    sitemap: "https://sajuastrology.com/sitemap.xml",
  };
}
