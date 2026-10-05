import type { MetadataRoute } from "next";

const BASE = "https://www.gorillafuel.ca";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Only the admin console is hidden. /api stays crawlable so social
      // unfurlers can fetch the OG share-card at /api/og/picks.
      disallow: ["/admin/"],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
