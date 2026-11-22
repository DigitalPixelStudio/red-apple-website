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
          "Claude-SearchBot",
          "ClaudeBot",
          "PerplexityBot",
          "Applebot",
          "Applebot-Extended",
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
