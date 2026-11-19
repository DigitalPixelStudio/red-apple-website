import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const publicAccess = { allow: "/", disallow: ["/api/"] };

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
          "ClaudeBot",
          "PerplexityBot",
          "Applebot-Extended",
          "CCBot",
        ],
        ...publicAccess,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
