import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // /api/ holds lead/CRM/bot endpoints — disallow. /_next/ build assets MUST stay
  // crawlable: Google's own guidance is to allow CSS/JS so it renders pages correctly.
  // Core page copy is server-rendered HTML; all search/AI crawlers below are allowed.
  // facebookexternalhit / WhatsApp are link-preview fetchers: they need open access
  // to render the /og-card.jpg social preview. AdsBot-Google is explicitly allowed.
  const publicAccess = { allow: ["/", "/_next/"], disallow: ["/api/"] };

  return {
    rules: [
      { userAgent: "*", ...publicAccess },
      { userAgent: "Googlebot", ...publicAccess },
      { userAgent: "Bingbot", ...publicAccess },
      {
        userAgent: [
          "Google-Extended",
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "Claude-SearchBot",
          "ClaudeBot",
          "PerplexityBot",
          "Applebot",
          "Applebot-Extended",
          "facebookexternalhit",
          "WhatsApp",
          "AdsBot-Google",
          "adidxbot",
          "CCBot",
          "meta-externalagent",
        ],
        ...publicAccess,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}