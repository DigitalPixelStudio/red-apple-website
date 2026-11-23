import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

// Crawler metadata is stable (single-source from src/lib/site.ts) and carries no
// PII, so it is safe for public shared caching. 1h edge/browser freshness plus a
// 24h stale-while-revalidate window mirrors the /llms.txt ETag cache quality and
// keeps Googlebot / AI crawlers fast without serving stale NAP for long.
const crawlerCacheHeaders = [
  { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=86400" },
];

const nextConfig: NextConfig = {
  experimental: {
    agentUpgrade: "security",
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "images.pexels.com" }],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/(.*)",
        has: [{ type: "header", key: "host", value: ".*\\.vercel\\.app(?::\\d+)?" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      // Public crawler metadata — cacheable. Distinct header key from the
      // noindex shield above, so staging clones still get X-Robots-Tag=noindex
      // while production robots/sitemap become edge-cache friendly.
      { source: "/robots.txt", headers: crawlerCacheHeaders },
      { source: "/sitemap.xml", headers: crawlerCacheHeaders },
      // CRITICAL: do NOT add an x-vercel-deployment-url rule here. Vercel injects a
      // *.vercel.app value into that header even on the production domain, which made
      // www.redmobilerepair.in serve `noindex, nofollow` and deindex itself (v8 regression).
      // The host rule above already covers every staging clone.
    ];
  },
};

export default nextConfig;
