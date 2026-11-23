import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Let the browser warm DNS for outbound links early — a zero-risk latency win
  // for WhatsApp / Maps / review links, with no rendering or crawl impact.
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

// Content-hashed build assets can be cached permanently and immutably. Next already
// emits an equivalent header for /_next/static; restating it makes the load policy
// explicit and guarantees it survives config changes. Scoped to static paths ONLY —
// never to HTML/API routes — so dynamic/noindex behaviour is untouched.
const immutableAssetCacheHeaders = [
  { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
];

// Long-lived brand/media files under /public/images. A conservative 1-day freshness
// plus a 7-day stale-while-revalidate window cuts repeat-origin load without ever
// serving stale HTML or crawler metadata.
const mediaCacheHeaders = [
  { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
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
      // Static-only cache rules. These match assets, never documents or APIs.
      { source: "/_next/static/:path*", headers: immutableAssetCacheHeaders },
      { source: "/images/:path*", headers: mediaCacheHeaders },
      // CRITICAL: do NOT add an x-vercel-deployment-url rule here. Vercel injects a
      // *.vercel.app value into that header even on the production domain, which made
      // www.redmobilerepair.in serve `noindex, nofollow` and deindex itself (v8 regression).
      // The host rule above already covers every staging clone.
    ];
  },
};

export default nextConfig;
