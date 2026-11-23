import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const mediaCacheHeaders = [
  { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
];

const crawlerCacheHeaders = [
  { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=86400" },
];

const nextConfig: NextConfig = {
  experimental: { agentUpgrade: "security" },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "images.pexels.com" }],
  },
  async redirects() {
    return [
      { source: "/iphone-repair", destination: "/services/iphone-repair", permanent: true },
      { source: "/glass", destination: "/services/front-glass-restoration", permanent: true },
      // The actual tracking page is /repair-status (the API is /api/crm-status).
      { source: "/track", destination: "/repair-status", permanent: true },
      { source: "/book", destination: "/quote", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/(.*)",
        has: [{ type: "header", key: "host", value: ".*\\.vercel\\.app(?::\\d+)?" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      { source: "/robots.txt", headers: crawlerCacheHeaders },
      { source: "/sitemap.xml", headers: crawlerCacheHeaders },
      { source: "/images/:path*", headers: mediaCacheHeaders },
      // Do not override Next/Vercel's built-in immutable /_next/static caching.
      // Keep the noindex shield scoped to vercel.app hosts, never the custom domain.
    ];
  },
};

export default nextConfig;