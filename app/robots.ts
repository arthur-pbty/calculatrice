import type { MetadataRoute } from "next";

/**
 * Fichier robots.txt généré dynamiquement par Next.js.
 * Accessible à /robots.txt
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://calculatrice.arthurp.fr";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
